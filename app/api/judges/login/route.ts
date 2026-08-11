import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("judges")
      .select("*")
      .eq("pin", pin)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({ judge: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
