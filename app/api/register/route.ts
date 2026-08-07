import { NextResponse } from "next/server";
import { getSheetData, appendSheetData } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Validation ──
    if (!body.name || !body.department || !body.event || !body.floor) {
      return NextResponse.json({ error: "Semua field wajib wajib diisi." }, { status: 400 });
    }

    if (!["Lantai 26", "Lantai 27"].includes(body.floor)) {
      return NextResponse.json({ error: "Lantai tidak valid." }, { status: 400 });
    }

    if (!["Badminton Tournament"].includes(body.event)) {
      return NextResponse.json({ error: "Event tidak valid. Hanya menerima pendaftaran Badminton Tournament." }, { status: 400 });
    }

    if (body.event === "Badminton Tournament" && !body.category) {
      return NextResponse.json({ error: "Kategori badminton wajib dipilih." }, { status: 400 });
    }

    if (body.event === "Badminton Tournament" && body.category === "Ganda Campuran" && !body.partner) {
      return NextResponse.json({ error: "Nama partner wajib diisi untuk Ganda Campuran." }, { status: 400 });
    }

    // ── Check registration_open setting ──
    try {
      const settingsData = await getSheetData("Settings!A:B");
      const isOpenRow = settingsData.find((row) => row[0] === "registration_open");
      if (isOpenRow && isOpenRow[1]?.toUpperCase() !== "TRUE") {
        return NextResponse.json(
          { error: "Pendaftaran saat ini sedang ditutup. Silakan hubungi panitia." },
          { status: 403 }
        );
      }
    } catch {
      // If settings can't be read, allow registration to proceed
    }

    // ── Generate Registration ID & Check Quota ──
    let nextIdNumber = 1;
    try {
      const existingData = await getSheetData("Participants!A:K");
      if (existingData && existingData.length > 0) {
        // existingData[0] is header
        const rows = existingData.slice(1);
        nextIdNumber = rows.length + 1;

        // Check category limit (1 per floor per category)
        const sameCategoryCount = rows.filter(
          (row) => row[4] === body.floor && row[8] === body.category && row[10] !== "Cancelled"
        ).length;

        if (sameCategoryCount >= 1) {
          return NextResponse.json(
            { error: `Kuota pendaftaran untuk kategori ${body.category} pada ${body.floor} sudah penuh.` },
            { status: 400 }
          );
        }
      }
    } catch {
      nextIdNumber = 1;
    }

    const registration_id = `HUTRI-2026-${String(nextIdNumber).padStart(4, "0")}`;
    const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    // ── Build Row ──
    // Columns: registration_id | timestamp | name | department | floor | email | phone | event | category | partner | status
    const rowData = [
      registration_id,
      timestamp,
      body.name,
      body.department,
      body.floor,
      "-", // email removed
      "-", // phone removed
      body.event,
      body.category || "-",
      body.partner || "-",
      "Registered",
    ];

    await appendSheetData("Participants!A:K", [rowData] as any[][]);

    return NextResponse.json({
      success: true,
      registration_id,
      participant: {
        name: body.name,
        department: body.department,
        floor: body.floor,
        event: body.event,
        category: body.category || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
