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

  const allZero = scores.length > 0 && scores.every((s) => s.score === 0);

  useEffect(() => {
    fetchScores();
    fetchTeams();
    const channel = supabase
      .channel("scoreboard:group_scores")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_scores" }, fetchScores)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
    { height: "h-24 md:h-28", badge: "🥈", color: "from-slate-300 via-zinc-200 to-slate-400", border: "border-slate-300", textColor: "text-slate-800", order: 1, label: "2nd" },
    { height: "h-32 md:h-36", badge: "🥇", color: "from-amber-300 via-yellow-400 to-amber-500", border: "border-yellow-300 shadow-yellow-300/50", textColor: "text-amber-950", order: 0, label: "1st" },
    { height: "h-20 md:h-22", badge: "🥉", color: "from-amber-600 via-amber-700 to-orange-700", border: "border-amber-600", textColor: "text-amber-100", order: 2, label: "3rd" },
  ];

  return (
    <div
      className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between p-3 md:p-5 lg:p-6 font-sans relative select-none"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dynamic Ambient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/50 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="relative z-10 flex items-center justify-between px-3 md:px-8 py-2 w-full shrink-0 border-b border-white/40 bg-white/30 backdrop-blur-md rounded-2xl shadow-sm">
        {/* Left Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/gesit_logo.png"
            alt="GESIT Logo"
            width={64}
            height={64}
            className="w-11 h-11 md:w-14 md:h-14 object-contain filter drop-shadow-md transition-transform hover:scale-105"
          />
        </div>

        {/* Title Center */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E31E24] animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#E31E24] bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full shadow-sm">
              Live Scoreboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#102A4C] leading-none mt-1">
            🏆 KLASEMEN <span className="text-[#E31E24]">FUN GAMES</span>
          </h1>
        </div>

        {/* Right Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/HUTRI81.png"
            alt="HUT RI 81"
            width={160}
            height={55}
            className="w-28 h-9 md:w-36 md:h-11 object-contain filter drop-shadow-md"
          />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto py-3 px-2 flex flex-col justify-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin" />
            <p className="text-[#102A4C]/60 font-bold text-sm tracking-wide">Memuat klasemen live...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-lg">
            <p className="text-[#102A4C]/50 font-bold text-lg">Belum ada skor terdaftar</p>
          </div>
        ) : allZero ? (
          /* ── PRE-GAME ROSTER (ALL ZERO SCORE) ── */
          <div className="flex flex-col h-full min-h-0 justify-between gap-2.5">
            {/* Subtitle Bar */}
            <div className="flex items-center justify-center gap-3 shrink-0">
              <div className="h-px bg-gradient-to-r from-transparent via-[#102A4C]/20 to-transparent flex-1" />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#102A4C]/70 bg-white/70 backdrop-blur-sm px-4 py-1 rounded-full border border-white/80 shadow-sm">
                📢 Fun Games Belum Dimulai · Daftar Kelompok Participant
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#102A4C]/20 to-transparent flex-1" />
            </div>

            {/* Responsive Columns Grid (Fits Screen Seamlessly) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {scores.map((group, idx) => {
                const team = teams.find(
                  (t) =>
                    t.team_name.toLowerCase().replace(/\s+/g, "") ===
                    group.group_name.toLowerCase().replace(/\s+/g, "")
                );
                const memberList = team?.members
                  ? team.members.split(",").map((m) => m.trim()).filter(Boolean)
                  : [];
                const captain = team?.captain || "";

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white/75 backdrop-blur-md border border-white/90 rounded-2xl p-3 lg:p-3.5 shadow-lg hover:shadow-xl hover:bg-white/85 transition-all duration-300 flex flex-col min-h-0 justify-between group"
                  >
                    {/* Group Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#102A4C]/10 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-[#102A4C] to-[#1e3a5f] flex items-center justify-center font-black text-white text-xs md:text-sm shadow-md shrink-0">
                          {idx + 1}
                        </div>
                        <h3 className="font-black uppercase text-[#102A4C] text-sm md:text-base tracking-tight leading-none group-hover:text-[#E31E24] transition-colors">
                          {group.group_name}
                        </h3>
                      </div>
                      {memberList.length > 0 && (
                        <span className="text-[10px] font-extrabold text-[#102A4C]/40 bg-[#102A4C]/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {memberList.length} Anggota
                        </span>
                      )}
                    </div>

                    {/* Member List (Structured 2-Column Compact Layout) */}
                    <div className="flex-1 min-h-0 overflow-hidden py-1.5 flex flex-col justify-center">
                      {memberList.length > 0 ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                          {memberList.map((member, mIdx) => (
                            <li
                              key={mIdx}
                              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg transition-colors hover:bg-slate-100/50"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]/60 shrink-0" />
                              <span
                                className="text-[11px] lg:text-xs leading-tight truncate font-semibold text-[#102A4C]/85"
                                title={member}
                              >
                                {member}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#102A4C]/40 italic text-center py-4">
                          Anggota belum terdaftar
                        </p>
                      )}
                    </div>

                    {/* Card Footer Status */}
                    <div className="pt-1.5 border-t border-[#102A4C]/5 text-[10px] font-bold text-[#102A4C]/40 flex justify-between items-center shrink-0">
                      <span>Status: Ready</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── LIVE SCOREBOARD (PODIUM + RANK LIST) ── */
          <div className="flex flex-col h-full min-h-0 justify-between gap-3">
            {/* TOP 3 PODIUM */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-3 md:gap-6 pt-2 shrink-0">
                {podiumOrder.map((group, idx) => {
                  if (!group) return null;

                  // Rank calculation
                  const actualRank = scores.filter((s) => s.score > group.score).length;
                  const pos =
                    podiumPositions.find((p) => p.order === actualRank) ||
                    podiumPositions.find((p) => p.order === 2)!;

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 35 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.08,
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                      }}
                      className="flex flex-col items-center justify-end flex-1 max-w-[220px]"
                    >
                      {/* Floating Card */}
                      <div
                        className={`w-full rounded-2xl p-3 md:p-4 text-center mb-2 border shadow-xl backdrop-blur-md transition-transform duration-300 hover:scale-[1.02] ${
                          actualRank === 0
                            ? "bg-gradient-to-b from-white to-amber-50/80 border-amber-300 shadow-amber-200/50 ring-2 ring-amber-300/30"
                            : actualRank === 1
                            ? "bg-gradient-to-b from-white to-slate-50/80 border-slate-200 shadow-slate-200/50"
                            : "bg-gradient-to-b from-white to-orange-50/80 border-amber-200 shadow-orange-100"
                        }`}
                      >
                        <div className="text-2xl md:text-3xl mb-0.5">{pos.badge}</div>
                        <p
                          className={`font-black uppercase text-xs md:text-sm lg:text-base leading-tight truncate ${
                            actualRank === 0 ? "text-[#102A4C]" : "text-[#102A4C]/80"
                          }`}
                        >
                          {group.group_name}
                        </p>
                        <motion.p
                          key={group.score}
                          initial={{ scale: 1.3, color: "#E31E24" }}
                          animate={{ scale: 1, color: "#102A4C" }}
                          transition={{ duration: 0.3 }}
                          className={`font-black leading-none mt-1 ${
                            actualRank === 0 ? "text-3xl md:text-4xl text-[#102A4C]" : "text-2xl md:text-3xl text-[#102A4C]"
                          }`}
                        >
                          {group.score.toLocaleString()}
                        </motion.p>
                        <p className="text-[9px] md:text-[10px] font-extrabold text-[#102A4C]/40 uppercase tracking-widest mt-0.5">
                          PTS
                        </p>
                      </div>

                      {/* Podium Stand */}
                      <div
                        className={`w-full rounded-t-2xl flex items-center justify-center font-black text-sm md:text-base bg-gradient-to-b ${pos.color} ${pos.textColor} ${pos.height} ${pos.border} shadow-lg border-t-2`}
                      >
                        {pos.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* RANK 4+ LEADERBOARD LIST */}
            {rest.length > 0 && (
              <div className="flex-1 min-h-0 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1.5 shrink-0">
                  <div className="flex-1 h-px bg-[#102A4C]/15" />
                  <span className="text-[10px] font-extrabold text-[#102A4C]/50 uppercase tracking-widest bg-white/50 px-3 py-0.5 rounded-full border border-white/60">
                    Peringkat Lainnya
                  </span>
                  <div className="flex-1 h-px bg-[#102A4C]/15" />
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/80 shadow-md bg-white/65 backdrop-blur-md divide-y divide-[#102A4C]/10 flex flex-col justify-around">
                  <AnimatePresence>
                    {rest.map((group, idx) => {
                      const rank = idx + 4;
                      return (
                        <motion.div
                          key={group.id}
                          layout
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/60 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#102A4C]/10 flex items-center justify-center font-black text-[#102A4C]/60 text-sm shrink-0">
                            {rank}
                          </div>
                          <p className="flex-1 font-black uppercase text-[#102A4C] text-sm md:text-base tracking-tight truncate">
                            {group.group_name}
                          </p>

                          {/* Progress Bar */}
                          <div className="hidden sm:flex flex-1 max-w-[180px] h-2 rounded-full bg-[#102A4C]/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#E31E24]/70 to-[#E31E24]"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  scores[0]?.score
                                    ? Math.round((group.score / scores[0].score) * 100)
                                    : 0
                                }%`,
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>

                          <div className="text-right shrink-0 min-w-[70px]">
                            <motion.span
                              key={group.score}
                              initial={{ scale: 1.2, color: "#E31E24" }}
                              animate={{ scale: 1, color: "#102A4C" }}
                              transition={{ duration: 0.3 }}
                              className="font-black text-xl md:text-2xl text-[#102A4C] block leading-none"
                            >
                              {group.score.toLocaleString()}
                            </motion.span>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#102A4C]/40">
                              PTS
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-1.5 text-center shrink-0 border-t border-white/30 bg-white/20 backdrop-blur-xs rounded-xl">
        <p className="text-[10px] md:text-[11px] font-extrabold text-[#102A4C]/40 uppercase tracking-widest">
          GESIT HUT RI 81 · Fun Games Live Portal · Auto-Synchronized
        </p>
      </footer>
    </div>
  );
}

