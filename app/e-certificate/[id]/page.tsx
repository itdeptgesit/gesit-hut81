import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Trophy, User, ArrowLeft, Award, X } from "lucide-react";

export default async function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const isDynamicSlug = ["fun-games-1st-place", "fun-games-2nd-place", "fun-games-3rd-place", "best-costume-best-of-the-best", "potluck-nusantara-best-of-the-best"].includes(id);

  let winner = null;

  if (isDynamicSlug) {
    let overrideName = null;
    const { data: settingsData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "qr_overrides")
      .single();
      
    if (settingsData && settingsData.value) {
      try {
        const overrides = JSON.parse(settingsData.value);
        if (overrides[id] && overrides[id].trim() !== "") {
          overrideName = overrides[id].trim();
        }
      } catch (e) {}
    }

    let targetCategory = "Fun Games";
    let targetEvent = "HUT RI KE-81";
    if (id.startsWith("best-costume")) targetCategory = "Best Costume";
    else if (id.startsWith("potluck-nusantara")) targetCategory = "Potluck Nusantara";

    const positionIndex = id.includes("-1st-place") || id === "best-costume-best-of-the-best" || id === "potluck-nusantara-best-of-the-best" ? 0 : id.includes("-2nd-place") ? 1 : 2;
    const posStr = id === "best-costume-best-of-the-best" ? "BEST OF THE BEST" : id === "potluck-nusantara-best-of-the-best" ? "BEST OF THE BEST" : positionIndex === 0 ? "1ST PLACE" : positionIndex === 1 ? "2ND PLACE" : "3RD PLACE";

    if (overrideName) {
      winner = {
        name: overrideName,
        position: posStr,
        category: targetCategory,
        event: targetEvent,
        id: id
      };
    } else {
      const { data: scoreLogs } = await supabaseAdmin.from("score_logs").select("*").gt("value", 0);
    if (scoreLogs) {
      const FG_COMPS = ["Perform Yel-Yel","Fun Games - Quiz Challenge","Fun Games - Word Puzzle","Fun Games - Estafet Sedotan","Fun Games - Cup Rush"];
      const funMap: Record<string,number> = {};
      const costumeMap: Record<string,number> = {};
      const potluckMap: Record<string,number> = {};
      
      for (const log of scoreLogs) {
        if (FG_COMPS.includes(log.competition)) funMap[log.group_name] = (funMap[log.group_name]||0)+log.value;
        else if (log.competition === "Best Costume") costumeMap[log.group_name] = (costumeMap[log.group_name]||0)+log.value;
        else if (log.competition === "Potluck - Pesta Rasa Merah Putih") potluckMap[log.group_name] = (potluckMap[log.group_name]||0)+log.value;
      }
      
      const toRanked = (m: Record<string,number>) => Object.entries(m).sort((a,b)=>b[1]-a[1]);
      
      let targetMap = funMap;
      if (targetCategory === "Best Costume") targetMap = costumeMap;
      else if (targetCategory === "Potluck Nusantara") targetMap = potluckMap;

      const ranked = toRanked(targetMap);
      
      if (ranked.length > positionIndex) {
        winner = {
          name: ranked[positionIndex][0],
          position: posStr,
          category: targetCategory,
          event: targetEvent,
          id: id
        };
      }
    }
    }
  } else {
    // Fallback to DB lookup
    const { data } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("id", id)
      .single();
    winner = data;
  }

  if (!winner) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
            <X size={28} strokeWidth={2} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Sertifikat Belum Ditetapkan</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Data sertifikat belum tersedia. Jika ini dari hasil turnamen terbaru, silakan periksa kembali setelah nilai difinalisasi.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Top accent strip */}
          <div className="h-1 bg-emerald-500" />

          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center border-b border-gray-100">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <ShieldCheck size={24} strokeWidth={2} />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <CheckCircle size={11} /> Terverifikasi
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sertifikat Resmi</h1>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diberikan Kepada</p>
              <p className="text-lg font-bold text-gray-900">{winner.name}</p>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Posisi / Gelar</p>
              <p className="text-base font-semibold text-amber-600 uppercase tracking-wide">{winner.position}</p>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Event</p>
              <p className="text-sm font-semibold text-gray-800">{winner.event}</p>
              {winner.category && winner.category !== "-" && (
                <p className="text-sm text-gray-500 mt-0.5">{winner.category}</p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-700 italic mb-1">"Gesit Bersatu dalam sportivitas"</p>
            <p className="text-[11px] text-gray-400 mb-3">Diterbitkan oleh <span className="font-semibold text-gray-600">Team Event The Gesit Companies</span></p>
            <div className="font-mono text-[10px] text-gray-300 break-all">{winner.id}</div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>

      </div>
    </main>
  );
}
