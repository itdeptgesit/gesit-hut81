import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("match_schedules")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ schedules: data });
  } catch (error: any) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
