import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSheetData("Settings!A:B");
    
    if (!data || data.length === 0) {
      return NextResponse.json({ settings: {} });
    }

    const rows = data.slice(1); // skip headers
    const settings: Record<string, string> = {};

    rows.forEach(row => {
      if (row[0]) {
        settings[row[0]] = row[1] || "";
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
