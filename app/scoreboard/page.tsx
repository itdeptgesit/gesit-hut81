"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const FUN_GAMES = ["Perform Yel-Yel", "Fun Games - Quiz Challenge", "Fun Games - Word Puzzle", "Fun Games - Estafet Sedotan", "Fun Games - Cup Rush"];
const BEST_COSTUME = "Best Costume";
const POTLUCK = "Potluck - Pesta Rasa Merah Putih";

const CATEGORIES = [
  { key: "fun",     label: "Fun Games",           emoji: "🎮", color: "#102A4C", accent: "#E31E24",  bg: "from-[#0a1628] via-[#102A4C] to-[#1a3a6e]" },
  { key: "costume", label: "Best Costume",         emoji: "👗", color: "#7C3AED", accent: "#A78BFA",  bg: "from-[#2d1b69] via-[#4c1d95] to-[#5b21b6]" },
  { key: "potluck", label: "Potluck Nusantara",    emoji: "🍽️", color: "#065F46", accent: "#34D399",  bg: "from-[#022c22] via-[#065f46] to-[#047857]" },
] as const;

interface GroupScore { group_name: string; score: number; }
interface Team { team_name: string; captain: string; members: string; }

type CategoryKey = typeof CATEGORIES[number]["key"];

function buildScores(logs: any[]): Record<CategoryKey, GroupScore[]> {
  const fun: Record<string, number> = {};
  const costume: Record<string, number> = {};
  const potluck: Record<string, number> = {};

  for (const log of logs) {
    if (log.value <= 0) continue;
    const n = log.group_name;
    if (FUN_GAMES.includes(log.competition)) {
      fun[n] = (fun[n] || 0) + log.value;
    } else if (log.competition === BEST_COSTUME) {
      costume[n] = (costume[n] || 0) + log.value;
    } else if (log.competition === POTLUCK) {
      potluck[n] = (potluck[n] || 0) + log.value;
    }
  }

  const toArr = (r: Record<string, number>) =>
    Object.entries(r).map(([group_name, score]) => ({ group_name, score }))
      .sort((a, b) => b.score - a.score);

  return { fun: toArr(fun), costume: toArr(costume), potluck: toArr(potluck) };
}

const podiumPositions = [
  { badge: "🥈", color: "from-slate-300 via-zinc-200 to-slate-400", border: "border-slate-300", h: "h-24 md:h-28", order: 1 },
  { badge: "🥇", color: "from-amber-300 via-yellow-400 to-amber-500", border: "border-yellow-300 shadow-yellow-300/50", h: "h-32 md:h-36", order: 0 },
  { badge: "🥉", color: "from-amber-600 via-amber-700 to-orange-700", border: "border-amber-600", h: "h-20 md:h-24", order: 2 },
];

function Podium({ scores, accent }: { scores: GroupScore[]; accent: string }) {
  const top3 = scores.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 pt-2 shrink-0">
      {podiumOrder.map((group, idx) => {
        if (!group) return null;
        const rank = scores.findIndex(s => s.group_name === group.group_name);
        const pos = podiumPositions.find(p => p.order === rank) ?? podiumPositions[2];
        return (
          <motion.div key={group.group_name} initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col items-center justify-end flex-1 max-w-[220px]">
            <div className={`w-full rounded-2xl p-3 md:p-4 text-center mb-2 border shadow-xl backdrop-blur-md bg-white/15 ${pos.border}`}>
              <div className="text-2xl md:text-3xl mb-0.5">{pos.badge}</div>
              <p className="font-black uppercase text-xs md:text-sm text-white leading-tight truncate">{group.group_name}</p>
              <motion.p key={group.score} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                className="font-black text-2xl md:text-3xl text-white leading-none mt-1">
                {group.score.toLocaleString()}
              </motion.p>
              <p className="text-[9px] font-extrabold text-white/50 uppercase tracking-widest mt-0.5">PTS</p>
            </div>
            <div className={`w-full rounded-t-2xl flex items-center justify-center font-black text-sm bg-gradient-to-b text-white ${pos.color} ${pos.h} ${pos.border} shadow-lg border-t-2`}>
              {rank + 1}{rank === 0 ? "st" : rank === 1 ? "nd" : "rd"}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RankList({ scores, accent }: { scores: GroupScore[]; accent: string }) {
  const rest = scores.slice(3);
  if (!rest.length) return null;
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-end">
      <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md bg-white/10 backdrop-blur-md divide-y divide-white/10 flex flex-col justify-around">
        <AnimatePresence>
          {rest.map((group, idx) => (
            <motion.div key={group.group_name} layout initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }} transition={{ delay: idx * 0.03 }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center font-black text-white text-sm shrink-0">{idx + 4}</div>
              <p className="flex-1 font-black uppercase text-white text-sm md:text-base tracking-tight truncate">{group.group_name}</p>
              <div className="hidden sm:flex flex-1 max-w-[180px] h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${scores[0]?.score ? Math.round((group.score / scores[0].score) * 100) : 0}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }} />
              </div>
              <div className="text-right shrink-0 min-w-[70px]">
                <span className="font-black text-xl md:text-2xl text-white block leading-none">{group.score.toLocaleString()}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">PTS</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PreGame({ teams, groupNames }: { teams: Team[]; groupNames: string[] }) {
  return (
    <div className="flex flex-col h-full min-h-0 justify-between gap-2.5">
      <div className="flex items-center justify-center gap-3 shrink-0">
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1" />
        <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70 bg-white/10 px-4 py-1 rounded-full border border-white/20">
          📢 Belum ada skor · Daftar Kelompok
        </span>
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1" />
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {groupNames.map((name, idx) => {
          const team = teams.find(t => t.team_name.toLowerCase().replace(/\s+/g,"") === name.toLowerCase().replace(/\s+/g,""));
          const members = team?.members ? team.members.split(",").map(m => m.trim()).filter(Boolean) : [];
          return (
            <motion.div key={name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-lg flex flex-col gap-1">
              <p className="font-black text-white text-sm uppercase truncate">{name}</p>
              <p className="text-white/50 text-[11px]">{members.length} anggota</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScoreboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [catIdx, setCatIdx] = useState(0);

  const fetchAll = useCallback(async () => {
    const [logsRes, groupsRes] = await Promise.all([
      supabase.from("score_logs").select("*").gt("value", 0),
      supabase.from("group_scores").select("group_name").order("group_name"),
    ]);
    if (logsRes.data) setLogs(logsRes.data);
    if (groupsRes.data) setGroupNames(groupsRes.data.map((g: any) => g.group_name));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    fetch("/api/teams").then(r => r.json()).then(d => { if (d.teams) setTeams(d.teams); }).catch(() => {});

    const ch1 = supabase.channel("sb:score_logs")
      .on("postgres_changes", { event: "*", schema: "public", table: "score_logs" }, fetchAll)
      .subscribe();
    const ch2 = supabase.channel("sb:group_scores")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_scores" }, fetchAll)
      .subscribe();

    const pollSettings = setInterval(async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "timer_end").single();
      setTimerEnd(data?.value ? parseInt(data.value) : null);
    }, 3000);

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      clearInterval(pollSettings);
    };
  }, [fetchAll]);

  // Auto-rotate categories every 12 seconds
  useEffect(() => {
    const t = setInterval(() => setCatIdx(i => (i + 1) % 3), 12000);
    return () => clearInterval(t);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerEnd || timerEnd <= Date.now()) { setTimeLeft(0); return; }
    const t = setInterval(() => setTimeLeft(Math.max(0, timerEnd - Date.now())), 100);
    return () => clearInterval(t);
  }, [timerEnd]);

  const scores = buildScores(logs);
  const cat = CATEGORIES[catIdx];
  const catScores = scores[cat.key];
  const allZero = catScores.every(s => s.score === 0);

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between p-3 md:p-5 font-sans relative select-none"
      style={{ backgroundImage: "url('/bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000"
        style={{ background: `linear-gradient(135deg, ${cat.color}cc 0%, ${cat.color}99 50%, transparent 100%)` }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-3 md:px-8 py-2 w-full shrink-0 border-b border-white/20 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm">
        <Image src="/gesit_logo.png" alt="GESIT" width={56} height={56} className="w-11 h-11 object-contain drop-shadow-md" />
        <div className="flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white/80 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/80 bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
              Live Scoreboard
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.h1 key={cat.key} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
              {cat.emoji} KLASEMEN <span style={{ color: cat.accent }}>{cat.label}</span>
            </motion.h1>
          </AnimatePresence>
          {/* Category tabs */}
          <div className="flex gap-1.5 mt-1">
            {CATEGORIES.map((c, i) => (
              <button key={c.key} onClick={() => setCatIdx(i)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all border ${i === catIdx ? "bg-white/25 border-white/40 text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
        <Image src="/HUTRI81.png" alt="HUT RI 81" width={160} height={55} className="w-28 h-9 md:w-36 md:h-11 object-contain drop-shadow-md" />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto py-3 px-2 flex flex-col justify-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 font-bold text-sm tracking-wide">Memuat klasemen...</p>
          </div>
        ) : timerEnd && timeLeft > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em]">Waktu Tersisa</h2>
            <div className="font-mono text-7xl md:text-[10rem] leading-none font-black text-white drop-shadow-2xl bg-white/10 px-12 py-8 rounded-[3rem] border-2 border-white/20 backdrop-blur-sm tracking-tighter tabular-nums">
              {Math.floor(timeLeft / 60000).toString().padStart(2, "0")}:{Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, "0")}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={cat.key} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }} className="flex flex-col h-full min-h-0 gap-3 justify-center">
              {catScores.length === 0 || allZero ? (
                <PreGame teams={teams} groupNames={groupNames} />
              ) : (
                <>
                  <Podium scores={catScores} accent={cat.accent} />
                  <RankList scores={catScores} accent={cat.accent} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-1.5 text-center shrink-0 border-t border-white/20 bg-white/10 backdrop-blur-xs rounded-xl">
        <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest">
          GESIT HUT RI 81 · Fun Games Live Portal · Auto-Synchronized
        </p>
      </footer>
    </div>
  );
}
