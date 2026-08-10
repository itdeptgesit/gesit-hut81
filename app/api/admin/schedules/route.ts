import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, day, time, court, referee } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("match_schedules")
      .update({ day, time, court, referee })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ schedule: data });
  } catch (error: any) {
    console.error("Failed to update schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update schedule" },
      { status: 500 }
    );
  }
}
