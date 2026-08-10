import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Team } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("teams")
      .select("*")
      .order("team_id", { ascending: true });

    if (error) throw error;

    const teams: Team[] = (data || []).map((row) => ({
      team_id: row.team_id,
      team_name: row.team_name,
      event: row.event,
      captain: row.captain || "",
      members: row.members || "",
      status: row.status || "",
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
