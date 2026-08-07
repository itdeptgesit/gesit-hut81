import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSheetData("Winners!A:D");
    
    if (!data || data.length === 0) {
      return NextResponse.json({ winners: [] });
    }

    const rows = data.slice(1); // skip headers

    const winners = rows.map((row) => ({
      event: row[0] || "",
      category: row[1] || "",
      position: row[2] || "",
      name: row[3] || "",
    })).filter(w => w.event && w.category && w.position && w.name);

    return NextResponse.json({ winners });
  } catch (error) {
    console.error("Failed to fetch winners:", error);
    return NextResponse.json(
      { error: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}
