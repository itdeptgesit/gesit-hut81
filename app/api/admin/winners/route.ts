import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, category, position, name } = body;

    if (!event || !category || !position || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("winners")
      .insert([{ event, category, position, name }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ winner: data });
  } catch (error: any) {
    console.error("Failed to add winner:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add winner" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, event, category, position, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Winner ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("winners")
      .update({ event, category, position, name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ winner: data });
  } catch (error: any) {
    console.error("Failed to update winner:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update winner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Winner ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("winners")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete winner:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete winner" },
      { status: 500 }
    );
  }
}
