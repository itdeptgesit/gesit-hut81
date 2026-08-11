"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown, Sparkles, Star } from "lucide-react";
import clsx from "clsx";

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
        if (data.winners) {
          setWinners(data.winners);
        }
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
      <div className="w-full text-center py-24">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted font-medium animate-pulse">Menyiapkan Hall of Fame...</p>
      </div>
    );
  }

  if (winners.length === 0) {
    return null;
  }

  // Group by Event -> Category
  const eventsMap = winners.reduce((acc, winner) => {
    // Abaikan data penyisihan agar hanya menampilkan pemenang akhir
    if (winner.position.toLowerCase().includes("penyisihan")) return acc;
    
    if (!acc[winner.event]) {
      acc[winner.event] = {};
    }
    if (!acc[winner.event][winner.category]) {
      acc[winner.event][winner.category] = [];
    }
    acc[winner.event][winner.category].push(winner);
    return acc;
  }, {} as Record<string, Record<string, Winner[]>>);

  const getPositionTheme = (position: string) => {
    const p = position.toLowerCase();
    if (p.includes("1") || p.includes("satu") || p.includes("pertama") || p.includes("best") || p.includes("kreatif") || p.includes("winner")) {
      return {
        wrapper: "bg-gradient-to-br from-yellow-300 via-yellow-100 to-amber-200 p-[2px] rounded-[2rem]",
        inner: "bg-gradient-to-br from-yellow-50 to-white",
        iconBox: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/40",
        icon: <Crown size={28} className="drop-shadow-sm" />,
        text: "text-amber-900",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
        glow: "shadow-[0_10px_40px_-10px_rgba(234,179,8,0.4)]"
      };
    }
    if (p.includes("2") || p.includes("dua") || p.includes("kedua")) {
      return {
        wrapper: "bg-gradient-to-br from-slate-300 via-slate-100 to-zinc-300 p-[2px] rounded-[2rem]",
        inner: "bg-gradient-to-br from-slate-50 to-white",
        iconBox: "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-500/40",
        icon: <Medal size={28} className="drop-shadow-sm" />,
        text: "text-slate-800",
        badge: "bg-slate-100 text-slate-700 border-slate-300",
        glow: "shadow-[0_10px_40px_-10px_rgba(148,163,184,0.3)]"
      };
    }
    if (p.includes("3") || p.includes("tiga") || p.includes("ketiga")) {
      return {
        wrapper: "bg-gradient-to-br from-orange-300 via-orange-100 to-amber-300 p-[2px] rounded-[2rem]",
        inner: "bg-gradient-to-br from-orange-50 to-white",
        iconBox: "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/40",
        icon: <Medal size={28} className="drop-shadow-sm" />,
        text: "text-orange-900",
        badge: "bg-orange-100 text-orange-800 border-orange-300",
        glow: "shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)]"
      };
    }
    return {
      wrapper: "bg-gradient-to-br from-zinc-200 to-zinc-100 p-[2px] rounded-[2rem]",
      inner: "bg-gradient-to-br from-white to-zinc-50",
      iconBox: "bg-zinc-800 text-white shadow-zinc-500/30",
      icon: <Award size={28} className="drop-shadow-sm" />,
      text: "text-zinc-800",
      badge: "bg-zinc-100 text-zinc-700 border-zinc-300",
      glow: "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]"
    };
  };

  return (
    <div className="w-full relative py-10">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center mb-20 relative z-10">
        <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-6 py-2.5 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] mb-8 shadow-lg shadow-yellow-500/30 border border-yellow-300/50">
          <Trophy size={18} />
          Hall of Fame
          <Sparkles size={18} />
        </div>
        <h2 className="font-heading font-black text-5xl md:text-7xl text-zinc-900 mb-6 tracking-tight drop-shadow-sm">
          Daftar Pemenang
        </h2>
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Penghargaan tertinggi untuk para juara dan perwakilan terbaik di <span className="font-bold text-zinc-700">HUT RI ke-81 GESIT</span>.
        </p>
      </div>

      <div className="space-y-24 max-w-6xl mx-auto relative z-10">
        {Object.entries(eventsMap).map(([eventName, categories]) => {
          const safeEventName = eventName === "undefined" || !eventName ? "Penghargaan Umum" : eventName;
          
          return (
            <div key={eventName} className="relative">
              {/* Event Title */}
              <div className="flex flex-col items-center justify-center mb-12">
                <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-zinc-300 to-transparent mb-6" />
                <h3 className="font-heading font-black text-3xl md:text-4xl text-zinc-800 uppercase tracking-widest text-center flex items-center gap-3">
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  {safeEventName}
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                </h3>
                <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-zinc-300 to-transparent mt-6" />
              </div>

              <div className="space-y-16">
                {Object.entries(categories).map(([category, catWinners]) => {
                  // Sort winners so 1st place is first, 2nd is second, etc.
                  const sortedWinners = [...catWinners].sort((a, b) => {
                    const getRank = (pos: string) => {
                      const p = pos.toLowerCase();
                      if (p.includes("1") || p.includes("satu") || p.includes("pertama") || p.includes("best") || p.includes("winner")) return 1;
                      if (p.includes("2") || p.includes("dua") || p.includes("kedua")) return 2;
                      if (p.includes("3") || p.includes("tiga") || p.includes("ketiga")) return 3;
                      return 4;
                    };
                    return getRank(a.position) - getRank(b.position);
                  });

                  return (
                    <div key={category} className="flex flex-col items-center">
                      <div className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-xl text-sm font-bold tracking-widest uppercase mb-10 shadow-md">
                        {category}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full justify-center">
                        {sortedWinners.map((winner, idx) => {
                          const theme = getPositionTheme(winner.position);
                          
                          return (
                            <div key={idx} className={`relative flex flex-col group ${theme.glow} transition-all duration-300 hover:-translate-y-2 rounded-[2rem]`}>
                              <div className={`${theme.wrapper} h-full`}>
                                <div className={`${theme.inner} rounded-[1.8rem] p-8 h-full flex flex-col items-center text-center relative overflow-hidden`}>
                                  
                                  {/* Top Right Decoration */}
                                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl" />
                                  
                                  {/* Floating Icon */}
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 ${theme.iconBox}`}>
                                    {theme.icon}
                                  </div>
                                  
                                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-3 py-1 rounded-full border ${theme.badge}`}>
                                    {winner.position}
                                  </div>
                                  
                                  <h4 className={`font-black text-2xl md:text-3xl mt-2 mb-1 leading-tight ${theme.text}`}>
                                    {winner.name}
                                  </h4>
                                </div>
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
