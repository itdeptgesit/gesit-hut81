import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("key, value");

    if (error) throw error;

    const settings: Record<string, string> = {};
    (data || []).forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Upsert the setting
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("Failed to save setting:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}
