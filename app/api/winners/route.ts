import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("winners")
      .select("*")
      .order("event", { ascending: true });

    if (error) throw error;

    const winners = (data || [])
      .map((row) => ({
        event: row.event,
        category: row.category,
        position: row.position,
        name: row.name,
      }))
      .filter((w) => w.event && w.category && w.position && w.name);

    // Fetch overrides from settings to display on public page
    const { data: settingsData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "qr_overrides")
      .single();

    if (settingsData && settingsData.value) {
      try {
        const overrides = JSON.parse(settingsData.value);
        
        const overrideMap = [
          { slug: "fun-games-1st-place", event: "Fun Games", category: "-", position: "1ST PLACE" },
          { slug: "fun-games-2nd-place", event: "Fun Games", category: "-", position: "2ND PLACE" },
          { slug: "fun-games-3rd-place", event: "Fun Games", category: "-", position: "3RD PLACE" },
          { slug: "best-costume-best-of-the-best", event: "Best Costume", category: "-", position: "BEST OF THE BEST" },
          { slug: "potluck-nusantara-best-of-the-best", event: "Potluck Nusantara", category: "-", position: "BEST OF THE BEST" },
        ];

        overrideMap.forEach(item => {
          if (overrides[item.slug] && overrides[item.slug].trim() !== "") {
            // Check if already exists in winners from DB, replace if so (or just add)
            const existingIndex = winners.findIndex(w => w.event === item.event && w.position === item.position);
            if (existingIndex >= 0) {
              winners[existingIndex].name = overrides[item.slug];
            } else {
              winners.push({
                event: item.event,
                category: item.category,
                position: item.position,
                name: overrides[item.slug]
              });
            }
          }
        });
      } catch (e) {
        console.error("Failed to parse qr_overrides JSON", e);
      }
    }

    return NextResponse.json({ winners });
  } catch (error) {
    console.error("Failed to fetch winners:", error);
    return NextResponse.json(
      { error: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}
