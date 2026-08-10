"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown, Zap, Flame, Check, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Winner {
  event: string;
  category: string;
  position: string;
  name: string;
}

// Tab-based bracket sub-component per category
function CategoryBracket({
  category,
  penyisihanWinners,
  winner1,
  winner2,
  winner3,
  hasPenyisihan,
}: {
  category: string;
  penyisihanWinners: Winner[];
  winner1: Winner | undefined;
  winner2: Winner | undefined;
  winner3: Winner | undefined;
  hasPenyisihan: boolean;
}) {
  const tabs = hasPenyisihan
    ? ["Babak Penyisihan", "Babak Final"]
    : ["Babak Final"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex flex-col">
      {/* Category title */}
      <h4 className="font-heading font-bold text-lg text-foreground mb-3">{category}</h4>

      {/* Tab switcher */}
      <div className="flex items-end border-b border-border mb-5 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-navy text-navy"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Babak Penyisihan" && hasPenyisihan && (
        <div className="w-full max-w-xs bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col divide-y divide-border">
            {penyisihanWinners.map((w, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-muted">
                  {idx + 1}
                </div>
                <span className="text-sm text-foreground">{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Babak Final" && (
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Final match box */}
          <div className="w-full max-w-xs bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-border flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
              <span>Final</span>
              <span className="text-navy font-bold">FT</span>
            </div>
            <div className="flex flex-col divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {winner1 ? <Crown size={14} className="text-yellow-500 shrink-0" /> : <div className="w-[14px]" />}
                  <span className={clsx("text-sm", winner1 ? "font-bold text-foreground" : "text-muted italic")}>
                    {winner1 ? winner1.name : "TBD"}
                  </span>
                </div>
                {winner1 && <Check size={16} className="text-green-500" strokeWidth={3} />}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {winner2 ? <Medal size={14} className="text-gray-400 shrink-0" /> : <div className="w-[14px]" />}
                  <span className={clsx("text-sm", winner2 ? "font-medium text-foreground" : "text-muted italic")}>
                    {winner2 ? winner2.name : "TBD"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tempat Ketiga */}
          {winner3 && (
            <div className="w-full max-w-xs bg-white border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-border flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                <span>Tempat Ketiga</span>
                <span className="text-gray-500 font-bold">FT</span>
              </div>
              <div className="flex flex-col divide-y divide-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Medal size={14} className="text-amber-700 shrink-0" />
                    <span className="text-sm font-bold text-foreground">{winner3.name}</span>
                  </div>
                  <Check size={16} className="text-green-500" strokeWidth={3} />
                </div>
                <div className="flex items-center px-4 py-3 gap-2.5">
                  <div className="w-[14px]" />
                  <span className="text-sm text-muted italic">-</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
      <div className="w-full text-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted">Memuat data pemenang...</p>
      </div>
    );
  }

  if (winners.length === 0) {
    return null;
  }

  // Group by Event -> Category
  const eventsMap = winners.reduce((acc, winner) => {
    if (!acc[winner.event]) {
      acc[winner.event] = {};
    }
    if (!acc[winner.event][winner.category]) {
      acc[winner.event][winner.category] = [];
    }
    acc[winner.event][winner.category].push(winner);
    return acc;
  }, {} as Record<string, Record<string, Winner[]>>);

  const getPositionIcon = (position: string) => {
    const p = position.toLowerCase();
    if (p.includes("1") || p.includes("satu") || p.includes("pertama") || p.includes("best") || p.includes("kreatif")) {
      return <Crown size={28} className="text-yellow-500 drop-shadow-md" />;
    }
    if (p.includes("2") || p.includes("dua") || p.includes("kedua")) {
      return <Medal size={28} className="text-gray-400 drop-shadow-md" />;
    }
    if (p.includes("3") || p.includes("tiga") || p.includes("ketiga")) {
      return <Medal size={28} className="text-amber-700 drop-shadow-md" />;
    }
    return <Award size={28} className="text-primary drop-shadow-md" />;
  };

  const getPositionBg = (position: string) => {
    const p = position.toLowerCase();
    if (p.includes("1") || p.includes("best") || p.includes("kreatif")) 
      return "bg-gradient-to-r from-yellow-50 to-white border-yellow-200/60 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.15)]";
    if (p.includes("2")) 
      return "bg-gradient-to-r from-gray-50 to-white border-gray-200/60 shadow-[0_4px_20px_-4px_rgba(156,163,175,0.15)]";
    if (p.includes("3")) 
      return "bg-gradient-to-r from-amber-50 to-white border-amber-200/60 shadow-[0_4px_20px_-4px_rgba(180,83,9,0.1)]";
    return "bg-white border-border shadow-sm";
  };

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-yellow-100/50 border border-yellow-300/50 text-yellow-700 font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest mb-6 shadow-sm backdrop-blur-sm">
          <Trophy size={16} className="text-yellow-600" />
          Hall of Fame
        </div>
        <h2 className="font-heading font-black text-4xl md:text-6xl text-foreground mb-4 tracking-tight">
          Daftar Pemenang
        </h2>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
          Penghargaan tertinggi untuk para juara dan perwakilan terbaik di HUT RI ke-81 GESIT.
        </p>
      </div>

      <div className="space-y-16 max-w-5xl mx-auto">
        {Object.entries(eventsMap).map(([eventName, categories]) => {
          const safeEventName = eventName === "undefined" || !eventName ? "Penghargaan Umum" : eventName;
          const isBadminton = safeEventName.toLowerCase().includes("badminton");
          
          return (
            <div key={eventName} className="mb-12 last:mb-0">
              {/* Event Header */}
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                {isBadminton ? <Zap size={24} className="text-navy" /> : <Flame size={24} className="text-primary" />}
                <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground uppercase tracking-tight">
                  {safeEventName}
                </h3>
              </div>

              {isBadminton ? (
                <div className="space-y-10">
                  {Object.entries(categories).map(([category, catWinners]) => {
                    const penyisihanWinners = catWinners.filter(w => w.position.toLowerCase().includes("penyisihan"));
                    const finalWinners = catWinners.filter(w => !w.position.toLowerCase().includes("penyisihan"));
                    const winner1 = finalWinners.find(w => w.position.toLowerCase().includes("1"));
                    const winner2 = finalWinners.find(w => w.position.toLowerCase().includes("2"));
                    const winner3 = finalWinners.find(w => w.position.toLowerCase().includes("3"));
                    const hasPenyisihan = penyisihanWinners.length > 0;

                    return (
                      <CategoryBracket
                        key={category}
                        category={category}
                        penyisihanWinners={penyisihanWinners}
                        winner1={winner1}
                        winner2={winner2}
                        winner3={winner3}
                        hasPenyisihan={hasPenyisihan}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(categories).map(([category, catWinners]) => (
                    <div 
                      key={category} 
                      className="bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* Category Header */}
                      <div className="bg-gray-50 px-5 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-heading font-bold text-base text-foreground">
                          {category}
                        </h4>
                      </div>

                      {/* Winners List */}
                      <div className="p-4 flex flex-col gap-3 grow">
                        {catWinners.map((winner, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-white"
                          >
                            <div className="shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border">
                              {getPositionIcon(winner.position)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">
                                {winner.position}
                              </span>
                              <span className="block font-semibold text-foreground text-sm leading-tight truncate">
                                {winner.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
