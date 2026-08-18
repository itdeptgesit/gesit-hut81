import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "qr_overrides")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    let overrides = {};
    if (data && data.value) {
      try {
        overrides = JSON.parse(data.value);
      } catch (e) {
        console.error("Failed to parse qr_overrides JSON", e);
      }
    }

    return NextResponse.json({ overrides });
  } catch (error: any) {
    console.error("Error fetching QR overrides:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { overrides } = body;

    if (!overrides || typeof overrides !== "object") {
      return NextResponse.json({ error: "Invalid overrides data" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ 
        key: "qr_overrides", 
        value: JSON.stringify(overrides) 
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating QR overrides:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
