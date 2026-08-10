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

    if (!["Badminton Tournament"].includes(body.event)) {
      return NextResponse.json(
        { error: "Event tidak valid. Hanya menerima pendaftaran Badminton Tournament." },
        { status: 400 }
      );
    }

    if (body.event === "Badminton Tournament" && !body.category) {
      return NextResponse.json({ error: "Kategori badminton wajib dipilih." }, { status: 400 });
    }

    if (
      body.event === "Badminton Tournament" &&
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
    const { count } = await supabaseAdmin
      .from("participants")
      .select("*", { count: "exact", head: true });

    const nextIdNumber = (count ?? 0) + 1;
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
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
