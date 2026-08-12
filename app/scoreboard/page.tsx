"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GroupScore {
  id: string;
  group_name: string;
  score: number;
}

interface Team {
  team_id: number;
  team_name: string;
  captain: string;
  members: string;
}

export default function ScoreboardPage() {
  const [scores, setScores] = useState<GroupScore[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const allZero = scores.length > 0 && scores.every(s => s.score === 0);

  useEffect(() => {
    fetchScores();
    fetchTeams();
    const channel = supabase
      .channel("scoreboard:group_scores")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_scores" }, fetchScores)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.teams) setTeams(data.teams);
    } catch {}
  };

  const fetchScores = async () => {
    const { data } = await supabase
      .from("group_scores")
      .select("*")
      .order("score", { ascending: false });
    if (data) setScores(data as GroupScore[]);
    setLoading(false);
  };

  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumPositions = [
    { height: "h-28", badge: "🥈", color: "from-zinc-300 to-zinc-400", textColor: "text-zinc-800", order: 1, label: "2nd" },
    { height: "h-40", badge: "🥇", color: "from-yellow-400 to-amber-500", textColor: "text-yellow-900", order: 0, label: "1st" },
    { height: "h-20", badge: "🥉", color: "from-amber-600 to-orange-600", textColor: "text-amber-100", order: 2, label: "3rd" },
  ];

  return (
    <div
      className="min-h-screen w-full font-sans overflow-y-auto flex flex-col"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle overlay */}
      <div className="fixed inset-0 bg-white/20 z-0 pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-24 lg:px-32 pt-10 pb-3 w-full">
        <div className="flex items-center gap-3">
          <Image src="/gesit_logo.png" alt="GESIT" width={72} height={72} className="object-contain drop-shadow-md" />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#102A4C] leading-none">
            🏆 KLASEMEN <span className="text-[#E31E24]">FUN GAMES</span>
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#102A4C]/50 mt-1">Live Scoreboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Image src="/hutri81_logo.png" alt="HUT RI 81" width={180} height={180} className="object-contain drop-shadow-md" />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 pb-8 flex flex-col gap-8">

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin" />
            <p className="text-[#102A4C]/50 font-semibold">Memuat klasemen...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-white/80">
            <p className="text-[#102A4C]/40 font-semibold text-xl">Belum ada skor</p>
          </div>
        ) : allZero ? (
          /* ── ALL ZERO: show roster ── */
          <div className="flex flex-col gap-6 pt-4">
            <div className="text-center">
              <p className="text-[#102A4C]/50 font-bold uppercase tracking-widest text-sm">Fun Games belum dimulai · Daftar Kelompok</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scores.map((group, idx) => {
                const team = teams.find(t =>
                  t.team_name.toLowerCase().replace(/\s+/g, "") ===
                  group.group_name.toLowerCase().replace(/\s+/g, "")
                );
                const memberList = team?.members
                  ? team.members.split(",").map(m => m.trim()).filter(Boolean)
                  : [];
                const captain = team?.captain || "";

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Group header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#102A4C] flex items-center justify-center font-black text-white text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <h3 className="font-black uppercase text-[#102A4C] text-base tracking-tight">{group.group_name}</h3>
                    </div>

                    {/* Members */}
                    {memberList.length > 0 ? (
                      <ul className="space-y-1.5">
                        {memberList.map((member, mIdx) => (
                          <li key={mIdx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E31E24]/60 shrink-0" />
                            <span className={`text-sm font-semibold text-[#102A4C]/80 ${
                              member === captain ? "font-black text-[#E31E24]" : ""
                            }`}>
                              {member}{member === captain ? " ★" : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#102A4C]/30 italic">Anggota belum terdaftar</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-[10px] text-[#102A4C]/30 font-bold uppercase tracking-widest">★ = Kapten kelompok</p>
          </div>
        ) : (
          <>
            {/* ── PODIUM TOP 3 ── */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 pt-4">
                {podiumOrder.map((group, idx) => {
                  if (!group) return null;
                  
                  // Hitung peringkat asli (mengatasi seri/tie)
                  const actualRank = scores.filter(s => s.score > group.score).length;
                  
                  // Ambil podium styles berdasarkan peringkat asli, fallback ke 3rd
                  const pos = podiumPositions.find(p => p.order === actualRank) || podiumPositions.find(p => p.order === 2)!;
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 260, damping: 22 }}
                      className="flex flex-col items-center justify-end flex-1 max-w-[200px]"
                    >
                      {/* Card above podium */}
                      <div className={`
                        w-full rounded-2xl p-4 text-center mb-2 border shadow-xl
                        ${actualRank === 0
                          ? "bg-white border-yellow-300 shadow-yellow-200/60 shadow-2xl"
                          : actualRank === 1
                          ? "bg-white border-zinc-200 shadow-zinc-100"
                          : "bg-white border-amber-200 shadow-amber-100"}
                      `}>
                        <div className="text-3xl mb-1">{pos.badge}</div>
                        <p className={`font-black uppercase text-sm md:text-base leading-tight ${actualRank === 0 ? "text-[#102A4C]" : "text-[#102A4C]/80"}`}>
                          {group.group_name}
                        </p>
                        <motion.p
                          key={group.score}
                          initial={{ scale: 1.4, color: "#E31E24" }}
                          animate={{ scale: 1, color: "#102A4C" }}
                          transition={{ duration: 0.4 }}
                          className={`font-black leading-none mt-1 ${actualRank === 0 ? "text-4xl" : "text-3xl"}`}
                        >
                          {group.score.toLocaleString()}
                        </motion.p>
                        <p className="text-[10px] font-bold text-[#102A4C]/30 uppercase tracking-widest">poin</p>
                      </div>
                      {/* Podium block */}
                      <div className={`
                        w-full rounded-t-xl flex items-center justify-center font-black text-lg
                        bg-gradient-to-b ${pos.color} ${pos.textColor} ${pos.height}
                        shadow-lg border-t-2 border-white/50
                      `}>
                        {pos.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── DIVIDER ── */}
            {rest.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#102A4C]/15" />
                <span className="text-xs font-bold text-[#102A4C]/40 uppercase tracking-widest">Peringkat Lainnya</span>
                <div className="flex-1 h-px bg-[#102A4C]/15" />
              </div>
            )}

            {/* ── RANK 4+ TABLE ── */}
            {rest.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-white/60 shadow-lg bg-white/50 backdrop-blur-sm">
                <AnimatePresence>
                  {rest.map((group, idx) => {
                    const rank = idx + 4;
                    return (
                      <motion.div
                        key={group.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex items-center gap-4 px-6 py-4 ${idx < rest.length - 1 ? "border-b border-[#102A4C]/10" : ""} hover:bg-white/40 transition-colors`}
                      >
                        {/* Rank */}
                        <div className="w-9 h-9 rounded-lg bg-[#102A4C]/10 flex items-center justify-center font-black text-[#102A4C]/50 text-lg shrink-0">
                          {rank}
                        </div>

                        {/* Name */}
                        <p className="flex-1 font-black uppercase text-[#102A4C] text-lg md:text-xl tracking-tight">{group.group_name}</p>

                        {/* Red accent bar */}
                        <div className="hidden md:flex flex-1 max-w-[200px] h-2 rounded-full bg-[#102A4C]/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#E31E24]/50"
                            initial={{ width: 0 }}
                            animate={{ width: `${scores[0]?.score ? Math.round((group.score / scores[0].score) * 100) : 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>

                        {/* Score */}
                        <div className="text-right shrink-0">
                          <motion.span
                            key={group.score}
                            initial={{ scale: 1.3, color: "#E31E24" }}
                            animate={{ scale: 1, color: "#102A4C" }}
                            transition={{ duration: 0.4 }}
                            className="font-black text-3xl md:text-4xl text-[#102A4C] block leading-none"
                          >
                            {group.score.toLocaleString()}
                          </motion.span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#102A4C]/30">poin</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>


      {/* ── FOOTER ── */}
      <footer className="relative z-10 pb-5 text-center">
        <p className="text-[11px] font-bold text-[#102A4C]/30 uppercase tracking-widest">
          GESIT HUT RI 81 · Fun Games Day · Live Update
        </p>
      </footer>
    </div>
  );
}
