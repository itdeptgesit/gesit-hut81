"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "./animations";

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
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted text-sm font-medium">Memuat data pemenang...</p>
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

  const getTheme = (position: string) => {
    const p = position.toLowerCase();
    if (p.includes("1") || p.includes("satu") || p.includes("best") || p.includes("winner"))
      return { 
        icon: <Crown size={18} className="text-amber-500" />, 
        bg: "bg-amber-50", 
        border: "border-amber-200", 
        text: "text-amber-600" 
      };
    if (p.includes("2") || p.includes("dua") || p.includes("kedua"))
      return { 
        icon: <Medal size={18} className="text-slate-500" />, 
        bg: "bg-slate-50", 
        border: "border-slate-200", 
        text: "text-slate-600" 
      };
    if (p.includes("3") || p.includes("tiga") || p.includes("ketiga"))
      return { 
        icon: <Medal size={18} className="text-orange-500" />, 
        bg: "bg-orange-50", 
        border: "border-orange-200", 
        text: "text-orange-600" 
      };
    return { 
      icon: <Star size={18} className="text-muted" />, 
      bg: "bg-gray-50", 
      border: "border-border", 
      text: "text-muted" 
    };
  };

  return (
    <div className="w-full py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4"
        >
          <Trophy size={14} /> Hall of Fame
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-heading font-black text-3xl md:text-4xl text-foreground mb-4 tracking-tight"
        >
          Daftar Pemenang
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted text-base max-w-lg mx-auto"
        >
          Penghargaan untuk para juara yang telah berpartisipasi dan memeriahkan HUT RI ke-81 GESIT.
        </motion.p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto space-y-16 px-4 md:px-0">
        {Object.entries(eventsMap).map(([eventName, categories]) => {
          const label = eventName === "undefined" || !eventName ? "Penghargaan Umum" : eventName;
          
          return (
            <motion.div 
              key={eventName}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-6"
            >
              {/* Section Title */}
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest">{label}</h3>
                <div className="h-px flex-1 bg-border" />
              </div>

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
                  <div key={category} className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                    {/* Category Header */}
                    {category !== "-" && (
                      <div className="bg-gray-50/80 px-6 py-4 border-b border-border flex items-center gap-3">
                        <Trophy size={16} className="text-primary" />
                        <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">{category}</h4>
                      </div>
                    )}
                    
                    <div className="p-3">
                      {/* Winner Items */}
                      {sorted.map((winner, idx) => {
                        const theme = getTheme(winner.position);
                        
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-5 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${theme.bg} ${theme.border}`}>
                              {theme.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme.text}`}>
                                {winner.position}
                              </p>
                              <p className="font-semibold text-foreground text-base md:text-lg truncate">
                                {winner.name}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
