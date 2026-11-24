import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cache from "@/lib/cache";

export async function GET() {
  try {
    const conn = await connectDB();
    const isDbConnected = conn.connection.readyState === 1;
    const cacheTelemetry = cache.health();

    return NextResponse.json({
      status: "operational",
      system: "Bajaj Canteen Enterprise Admin Panel 2.0",
      timestamp: new Date().toISOString(),
      database: {
        status: isDbConnected ? "connected" : "connecting",
        name: conn.connection.name,
        host: conn.connection.host,
      },
      cache: cacheTelemetry,
      environment: process.env.NODE_ENV || "development",
      version: "2.0.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
