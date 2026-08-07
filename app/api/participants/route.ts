import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";
import { Participant } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSheetData("Participants!A:K");

    if (!data || data.length <= 1) {
      return NextResponse.json({ participants: [] });
    }

    const rows = data.slice(1); // skip header row

    // Columns: registration_id | timestamp | name | department | floor | email | phone | event | category | partner | status
    const participants: Participant[] = rows.map((row) => ({
      registration_id: row[0] || "",
      timestamp: row[1] || "",
      name: row[2] || "",
      department: row[3] || "",
      floor: row[4] || "",
      email: row[5] || "",
      phone: row[6] || "",
      event: row[7] || "",
      category: row[8] || "",
      partner: row[9] || "",
      status: row[10] || "Registered",
    }));

    return NextResponse.json({
      participants: participants.filter((p) => p.registration_id),
    });
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data peserta." },
      { status: 500 }
    );
  }
}
