import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, call_name, bracket_position, final_position } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("participants")
      .update({ name, call_name, bracket_position, final_position })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ participant: data });
  } catch (error: any) {
    console.error("Failed to update participant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update participant" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.event || !body.floor) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    if (!["Lantai 26", "Lantai 27"].includes(body.floor)) {
      return NextResponse.json({ error: "Lantai tidak valid." }, { status: 400 });
    }

    if (body.event === "Badminton Tournament" && !body.category) {
      return NextResponse.json({ error: "Kategori badminton wajib dipilih." }, { status: 400 });
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

    const { data, error: insertError } = await supabaseAdmin.from("participants").insert({
      registration_id,
      name: body.name,
      floor: body.floor,
      event: body.event,
      category: body.category || null,
      partner: body.partner || null,
      status: "Registered",
    }).select().single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, participant: data });
  } catch (error: any) {
    console.error("Failed to create participant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create participant" },
      { status: 500 }
    );
  }
}
