import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    // Map timelimit from db to timeLimit for frontend
    const mappedData = data?.map(q => ({
      ...q,
      timeLimit: q.timelimit || q.timeLimit || 20
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, options, correct, timeLimit, category, emoji } = body;

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .insert([{ question, options, correct, timelimit: timeLimit, category, emoji }])
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
    const { id, question, options, correct, timeLimit, category, emoji } = body;

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .update({ question, options, correct, timelimit: timeLimit, category, emoji })
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
      .from("quiz_questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
