import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StockAudit from "@/models/StockAudit";
import Notification from "@/models/Notification";

const PRODUCTS = [
  { id: "parle-g", name: "Parle-G", defaultInitial: 1000 },
  { id: "good-day", name: "Good Day", defaultInitial: 500 },
  { id: "marie-gold", name: "Marie Gold", defaultInitial: 500 },
  { id: "monaco", name: "Monaco", defaultInitial: 400 },
  { id: "krackjack", name: "Krackjack", defaultInitial: 400 },
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

      if (prevEntry) return prevEntry.closingStock;
      const defaultProd = PRODUCTS.find((p) => p.id === pId);
      return defaultProd ? defaultProd.defaultInitial : 1000;
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
      if (!item) {
        // Auto-fetch opening stock from previous day's closing stock!
        const autoOpening = await getPreviousClosing(prod.id, date);
        item = {
          date,
          productId: prod.id,
          productName: prod.name,
          openingStock: autoOpening,
          newAddedStock: 0,
          shift1Consumption: 0,
          shift2Consumption: 0,
          totalConsumption: 0,
          closingStock: autoOpening,
          isDraft: true,
        };
      }
      entries.push(item);
    }

    // Also fetch the last 15 days table history for the active product (default Parle-G)
    const activeProd = productId || "parle-g";
    const recentLedger = await StockAudit.find({ productId: activeProd })
      .sort({ date: 1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      date,
      products: PRODUCTS,
      activeProduct: activeProd,
      currentDayAudit: entries,
      recentLedger,
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

    const prodMeta = PRODUCTS.find((p) => p.id === productId);
    const productName = prodMeta ? prodMeta.name : productId;

    // If opening stock wasn't explicitly supplied, carry over from previous day
    let opening = Number(openingStock);
    if (isNaN(opening)) {
      const prev = await StockAudit.findOne({
        productId,
        date: { $lt: date },
      })
        .sort({ date: -1 })
        .lean();
      opening = prev ? prev.closingStock : prodMeta ? prodMeta.defaultInitial : 1000;
    }

    const added = Number(newAddedStock) || 0;
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
        shift1Consumption: s1,
        shift2Consumption: s2,
        totalConsumption: totalConsumed,
        closingStock: closing,
        loggedBy: loggedBy || "Operator 2",
        notes: notes || "",
      },
      { upsert: true, returnDocument: "after" }
    );

    // Auto-dispatch in-app notification to Admin
    try {
      await Notification.create({
        title: `Biscuit Inventory Audit: ${productName}`,
        message: `${totalConsumed} consumed (S1: ${s1}, S2: ${s2}), closing stock: ${closing} packets for ${date}.`,
        channel: "NORMAL",
        direction: "INCOMING",
        sender: loggedBy || "Operator 2",
        recipient: "Admin Console",
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
