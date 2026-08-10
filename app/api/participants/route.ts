import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Participant } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const participants: Participant[] = (data || []).map((row) => ({
      registration_id: row.registration_id,
      timestamp: row.created_at,
      name: row.name,
      department: "-",
      floor: row.floor,
      email: "-",
      phone: "-",
      event: row.event,
      category: row.category || "",
      partner: row.partner || "",
      status: row.status || "Registered",
      call_name: row.call_name || "",
      photo_url: row.photo_url || "",
      partner_photo_url: row.partner_photo_url || "",
    }));

    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data peserta." },
      { status: 500 }
    );
  }
}
