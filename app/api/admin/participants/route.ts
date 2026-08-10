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
