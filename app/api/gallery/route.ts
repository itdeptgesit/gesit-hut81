import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "gallery_images")
      .single();

    if (error && error.code !== "PGRST116") throw error;

    let images: { id: string; caption: string; driveId: string }[] = [];
    if (data?.value) {
      try {
        images = JSON.parse(data.value);
      } catch (e) {
        console.error("Failed to parse gallery_images JSON", e);
      }
    }

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images data" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key: "gallery_images", value: JSON.stringify(images) }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Gallery POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
