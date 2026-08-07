import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";
import { Team } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSheetData("Teams!A:F");
    
    if (!data || data.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    const rows = data.slice(1); // skip headers

    const teams: Team[] = rows.map((row) => ({
      team_id: row[0] || "",
      team_name: row[1] || "",
      event: row[2] || "",
      captain: row[3] || "",
      members: row[4] || "",
      status: row[5] || "",
    }));

    return NextResponse.json({ teams: teams.filter(t => t.team_id) });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
