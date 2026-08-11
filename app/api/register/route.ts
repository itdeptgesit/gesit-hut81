import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Validation ──
    if (!body.name || !body.event || !body.floor) {
      return NextResponse.json({ error: "Semua field wajib wajib diisi." }, { status: 400 });
    }

    if (!["Lantai 26", "Lantai 27"].includes(body.floor)) {
      return NextResponse.json({ error: "Lantai tidak valid." }, { status: 400 });
    }

    if (!["Internal Badminton Tournament 2026"].includes(body.event)) {
      return NextResponse.json(
        { error: "Event tidak valid. Hanya menerima pendaftaran Internal Badminton Tournament 2026." },
        { status: 400 }
      );
    }

    if (body.event === "Internal Badminton Tournament 2026" && !body.category) {
      return NextResponse.json({ error: "Kategori badminton wajib dipilih." }, { status: 400 });
    }

    if (
      body.event === "Internal Badminton Tournament 2026" &&
      body.category === "Ganda Campuran" &&
      !body.partner
    ) {
      return NextResponse.json(
        { error: "Nama partner wajib diisi untuk Ganda Campuran." },
        { status: 400 }
      );
    }

    // ── Check registration_open setting ──
    try {
      const { data: settingRow } = await supabaseAdmin
        .from("settings")
        .select("value")
        .eq("key", "registration_open")
        .single();

      if (settingRow && settingRow.value?.toUpperCase() !== "TRUE") {
        return NextResponse.json(
          { error: "Pendaftaran saat ini sedang ditutup. Silakan hubungi panitia." },
          { status: 403 }
        );
      }
    } catch {
      // If settings can't be read, allow registration to proceed
    }

    // ── Check Quota (max 2 per floor per category) ──
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("participants")
      .select("id")
      .eq("floor", body.floor)
      .eq("category", body.category)
      .neq("status", "Cancelled");

    if (fetchError) throw fetchError;

    if ((existing?.length ?? 0) >= 2) {
      return NextResponse.json(
        {
          error: `Kuota pendaftaran untuk kategori ${body.category} pada ${body.floor} sudah penuh.`,
        },
        { status: 400 }
      );
    }

    // ── Generate Registration ID ──
    const { data: allParticipants } = await supabaseAdmin
      .from("participants")
      .select("registration_id");

    let nextIdNumber = 1;
    if (allParticipants && allParticipants.length > 0) {
      let maxId = 0;
      for (const p of allParticipants) {
        if (p.registration_id?.startsWith("HUTRI-2026-")) {
          const parts = p.registration_id.split('-');
          const lastNumStr = parts[parts.length - 1];
          const lastNum = parseInt(lastNumStr, 10);
          if (!isNaN(lastNum) && lastNum > maxId) {
            maxId = lastNum;
          }
        }
      }
      nextIdNumber = maxId + 1;
    }
    const registration_id = `HUTRI-2026-${String(nextIdNumber).padStart(4, "0")}`;

    // ── Insert to Supabase ──
    const { error: insertError } = await supabaseAdmin.from("participants").insert({
      registration_id,
      name: body.name,
      floor: body.floor,
      event: body.event,
      category: body.category || null,
      partner: body.partner || null,
      status: "Registered",
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      registration_id,
      participant: {
        name: body.name,
        floor: body.floor,
        event: body.event,
        category: body.category || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : (error && typeof error === 'object' && 'message' in error ? error.message : JSON.stringify(error));
    return NextResponse.json(
      { error: `Terjadi kesalahan internal: ${errorMessage}` },
      { status: 500 }
    );
  }
}
