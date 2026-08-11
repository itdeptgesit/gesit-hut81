"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface Winner {
  event: string;
  category: string;
  position: string;
  name: string;
}

export default function WinnersSection() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch("/api/winners");
        const data = await res.json();
        if (data.winners) setWinners(data.winners);
      } catch (error: any) {
        if (error?.name === "AbortError" || error?.message === "Failed to fetch") return;
        console.error("Error fetching winners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-16">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">Memuat data pemenang...</p>
      </div>
    );
  }

  if (winners.length === 0) return null;

  const eventsMap = winners.reduce((acc, winner) => {
    if (winner.position.toLowerCase().includes("penyisihan")) return acc;
    if (!acc[winner.event]) acc[winner.event] = {};
    if (!acc[winner.event][winner.category]) acc[winner.event][winner.category] = [];
    acc[winner.event][winner.category].push(winner);
    return acc;
  }, {} as Record<string, Record<string, Winner[]>>);

  const getMeta = (position: string) => {
    const p = position.toLowerCase();
    if (p.includes("1") || p.includes("satu") || p.includes("best") || p.includes("winner"))
      return { icon: <Crown size={14} />, cls: "text-amber-500 bg-amber-50 border-amber-200" };
    if (p.includes("2") || p.includes("dua") || p.includes("kedua"))
      return { icon: <Medal size={14} />, cls: "text-slate-400 bg-slate-50 border-slate-200" };
    if (p.includes("3") || p.includes("tiga") || p.includes("ketiga"))
      return { icon: <Medal size={14} />, cls: "text-orange-500 bg-orange-50 border-orange-200" };
    return { icon: <Award size={14} />, cls: "text-zinc-400 bg-zinc-50 border-zinc-200" };
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-600 font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-4">
          <Trophy size={12} /> Hall of Fame
        </div>
        <h2 className="font-heading font-black text-3xl md:text-4xl text-zinc-900 mb-2 tracking-tight">
          Daftar Pemenang
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Penghargaan untuk para juara HUT RI ke-81 GESIT.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 max-w-2xl mx-auto">
        {Object.entries(eventsMap).map(([eventName, categories]) => {
          const label = eventName === "undefined" || !eventName ? "Penghargaan Umum" : eventName;
          return (
            <div key={eventName}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-3 px-1">{label}</p>
              <div className="space-y-3">
                {Object.entries(categories).map(([category, catWinners]) => {
                  const sorted = [...catWinners].sort((a, b) => {
                    const r = (pos: string) => {
                      const p = pos.toLowerCase();
                      if (p.includes("1") || p.includes("best") || p.includes("winner")) return 1;
                      if (p.includes("2")) return 2;
                      if (p.includes("3")) return 3;
                      return 4;
                    };
                    return r(a.position) - r(b.position);
                  });

                  return (
                    <div key={category} className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
                      {category !== "-" && (
                        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{category}</span>
                        </div>
                      )}
                      <div className="divide-y divide-zinc-50">
                        {sorted.map((winner, idx) => {
                          const { icon, cls } = getMeta(winner.position);
                          return (
                            <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/60 transition-colors">
                              <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${cls}`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <span className="font-semibold text-zinc-900 text-sm truncate">{winner.name}</span>
                                <span className="text-[10px] text-zinc-400 font-medium shrink-0">{winner.position}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
