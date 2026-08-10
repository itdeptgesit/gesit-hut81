import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("winners")
      .select("*")
      .order("event", { ascending: true });

    if (error) throw error;

    const winners = (data || [])
      .map((row) => ({
        event: row.event,
        category: row.category,
        position: row.position,
        name: row.name,
      }))
      .filter((w) => w.event && w.category && w.position && w.name);

    return NextResponse.json({ winners });
  } catch (error) {
    console.error("Failed to fetch winners:", error);
    return NextResponse.json(
      { error: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}
