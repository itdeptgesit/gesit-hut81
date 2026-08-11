import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("group_scores")
      .select("*")
      .order("score", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { group_name, score } = body;

    const { data, error } = await supabaseAdmin
      .from("group_scores")
      .insert([{ group_name, score }])
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, group_name, score, increment } = body;

    let updatePayload: any = {};
    if (group_name !== undefined) updatePayload.group_name = group_name;

    if (increment !== undefined) {
      // Fetch latest score right before updating to minimize race condition
      const { data: current } = await supabaseAdmin
        .from("group_scores")
        .select("score")
        .eq("id", id)
        .single();
      
      updatePayload.score = (current?.score || 0) + increment;
    } else if (score !== undefined) {
      updatePayload.score = score;
    }

    const { data, error } = await supabaseAdmin
      .from("group_scores")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("group_scores")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT = sync from teams table
export async function PUT() {
  try {
    // Fetch all Fun Games teams
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("team_name")
      .order("team_id", { ascending: true });

    if (teamsError) throw teamsError;
    if (!teams || teams.length === 0) {
      return NextResponse.json({ message: "No teams found" }, { status: 404 });
    }

    // Get existing group_scores to avoid duplicates
    const { data: existing } = await supabaseAdmin
      .from("group_scores")
      .select("group_name");

    const existingNames = new Set((existing || []).map((g: any) => g.group_name.toLowerCase()));

    // Only insert teams not yet in scoreboard
    const toInsert = teams
      .filter((t) => !existingNames.has(t.team_name.toLowerCase()))
      .map((t) => ({ group_name: t.team_name, score: 0 }));

    if (toInsert.length === 0) {
      return NextResponse.json({ message: "All teams already synced", inserted: 0 });
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("group_scores")
      .insert(toInsert)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ message: "Synced", inserted: inserted?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
