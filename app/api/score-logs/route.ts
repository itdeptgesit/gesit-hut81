import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competition = searchParams.get("competition");
  const limit = parseInt(searchParams.get("limit") || "200");

  let query = supabase
    .from("score_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (competition) {
    query = query.eq("competition", competition);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { competition, group_id, group_name, judge_name, value } = body;

  if (!competition || !group_name || value == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase.from("score_logs").insert([
    { competition, group_id, group_name, judge_name, value }
  ]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Fetch the log entry first to reverse the score
  const { data: logEntry, error: fetchError } = await supabase
    .from("score_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !logEntry) {
    return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
  }

  // Reverse the score on group_scores (only for positive values)
  if (logEntry.value > 0 && logEntry.group_id) {
    const { data: current } = await supabase
      .from("group_scores")
      .select("score")
      .eq("id", logEntry.group_id)
      .single();

    if (current) {
      await supabase
        .from("group_scores")
        .update({ score: Math.max(0, (current.score || 0) - logEntry.value) })
        .eq("id", logEntry.group_id);
    }
  }

  // Delete the log entry
  const { error } = await supabase.from("score_logs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, reversed: logEntry.value });
}
