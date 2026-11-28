import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StockAudit from "@/models/StockAudit";
import Notification from "@/models/Notification";


const PRODUCTS = [
  { id: "parle-g", name: "Parle-G" },
  { id: "good-day", name: "Good Day" },
  { id: "marie-gold", name: "Marie Gold" },
  { id: "monaco", name: "Monaco" },
  { id: "krackjack", name: "Krackjack" },
];

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const productId = searchParams.get("productId");

    // Helper: find previous date closing stock for automatic carry-over
    const getPreviousClosing = async (pId, currentDateStr) => {
      const prevEntry = await StockAudit.findOne({
        productId: pId,
        date: { $lt: currentDateStr },
      })
        .sort({ date: -1 })
        .lean();

      if (prevEntry) {
        return {
          closingStock: prevEntry.closingStock,
          date: prevEntry.date,
          hasPrevious: true,
        };
      }
      return {
        closingStock: 0,
        date: null,
        hasPrevious: false,
      };
    };

    // If fetching for a specific product's full ledger history
    if (productId && searchParams.get("history") === "true") {
      const history = await StockAudit.find({ productId }).sort({ date: 1 }).lean();
      return NextResponse.json({
        success: true,
        productId,
        history,
      });
    }

    // For a given date, return entries for all 5 products
    const entries = [];
    for (const prod of PRODUCTS) {
      let item = await StockAudit.findOne({ date, productId: prod.id }).lean();
      const prevInfo = await getPreviousClosing(prod.id, date);

      if (!item) {
        // Auto-fetch opening stock from previous day's closing stock!
        item = {
          date,
          productId: prod.id,
          productName: prod.name,
          openingStock: prevInfo.closingStock,
          newAddedStock: 0,
          shift1Consumption: 0,
          shift2Consumption: 0,
          totalConsumption: 0,
          closingStock: prevInfo.closingStock,
          isDraft: true,
          previousClosingStock: prevInfo.closingStock,
          previousDate: prevInfo.date,
          hasPrevious: prevInfo.hasPrevious,
        };
      } else {
        item.previousClosingStock = prevInfo.closingStock;
        item.previousDate = prevInfo.date;
        item.hasPrevious = prevInfo.hasPrevious;
      }
      entries.push(item);
    }

    // Also fetch the last 30 days table history for the active product (default Parle-G)
    const activeProd = productId || "parle-g";
    const activePrevInfo = await getPreviousClosing(activeProd, date);
    const recentLedger = await StockAudit.find({ productId: activeProd })
      .sort({ date: 1 })
      .limit(30)
      .lean();

    // Fetch recent stock audit activity / two-way notifications for Op 1 & Op 2
    const recentActivity = await Notification.find({
      link: "/operator/biscuit-audit",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      success: true,
      date,
      products: PRODUCTS,
      activeProduct: activeProd,
      previousInfo: activePrevInfo,
      currentDayAudit: entries,
      recentLedger,
      recentActivity,
    });
  } catch (error) {
    console.error("GET /api/stock-audit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      date,
      productId,
      openingStock,
      newAddedStock,
      deliveries,
      shift1Consumption,
      shift2Consumption,
      notes,
      loggedBy,
    } = body;

    if (!date || !productId) {
      return NextResponse.json(
        { error: "Date and Product ID are required" },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (date > todayStr) {
      return NextResponse.json(
        { error: `Cannot record stock audit for future date (${date}). Maximum allowable date is today (${todayStr}).` },
        { status: 400 }
      );
    }

    const prodMeta = PRODUCTS.find((p) => p.id === productId);
    const productName = prodMeta ? prodMeta.name : productId;

    // Operator can explicitly set opening stock; otherwise fallback to previous day closing
    let opening = Number(openingStock);
    if (isNaN(opening)) {
      const prev = await StockAudit.findOne({
        productId,
        date: { $lt: date },
      })
        .sort({ date: -1 })
        .lean();
      opening = prev ? prev.closingStock : 0;
    }

    // Calculate added stock from deliveries batches if provided, else use newAddedStock
    let added = 0;
    let deliveryList = [];
    if (Array.isArray(deliveries) && deliveries.length > 0) {
      deliveryList = deliveries;
      added = deliveries.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    } else {
      added = Number(newAddedStock) || 0;
    }

    const s1 = Number(shift1Consumption) || 0;
    const s2 = Number(shift2Consumption) || 0;
    const totalConsumed = s1 + s2;
    const closing = opening + added - totalConsumed;

    const auditEntry = await StockAudit.findOneAndUpdate(
      { date, productId },
      {
        date,
        productId,
        productName,
        openingStock: opening,
        newAddedStock: added,
        deliveries: deliveryList,
        shift1Consumption: s1,
        shift2Consumption: s2,
        totalConsumption: totalConsumed,
        closingStock: closing,
        loggedBy: loggedBy || "Operator 2",
        notes: notes || "",
      },
      { upsert: true, returnDocument: "after" }
    );

    // Auto-cascade closing stock forward to all subsequent future dates
    try {
      let currentClosing = closing;
      const futureEntries = await StockAudit.find({
        productId,
        date: { $gt: date },
      }).sort({ date: 1 });

      for (const future of futureEntries) {
        future.openingStock = currentClosing;
        future.closingStock =
          currentClosing + (future.newAddedStock || 0) - (future.totalConsumption || 0);
        currentClosing = future.closingStock;
        await future.save();
      }
    } catch (cascadeErr) {
      console.warn("Future stock audit cascade warning:", cascadeErr.message);
    }

    // Auto-dispatch two-way notification so Operator 1 and Operator 2 stay synchronized
    try {
      const isOp1 = loggedBy?.includes("1") || loggedBy?.toLowerCase().includes("op1");
      const recipient = isOp1 ? "Operator 2 & Admin" : "Operator 1 & Admin";
      const sender = loggedBy || "Canteen Operator";

      await Notification.create({
        title: `Shared Biscuit Update: ${productName}`,
        message: `${sender} updated stock on ${date}: Added +${added}, Consumed ${totalConsumed} (S1: ${s1}, S2: ${s2}), Closing Balance: ${closing} pkts.`,
        channel: "NORMAL",
        direction: "INCOMING",
        sender,
        recipient,
        priority: closing < 100 ? "HIGH" : "NORMAL",
        status: "RECEIVED",
        isRead: false,
        link: "/operator/biscuit-audit",
      });
    } catch (notifErr) {
      console.warn("Failed to create notification for stock audit:", notifErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Stock audit for ${productName} saved successfully`,
      entry: auditEntry,
      audit: auditEntry,
    });
  } catch (error) {
    console.error("POST /api/stock-audit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
