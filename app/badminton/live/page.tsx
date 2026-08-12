"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface LiveScore {
  id: string;
  category: string;
  match_type: string;
  team_a_name: string;
  team_b_name: string;
  score_a: number;
  score_b: number;
  sets_won_a: number;
  sets_won_b: number;
  current_set: number;
  serving: string;
  status: string;
  updated_at: string;
}

const MATCH_LABEL: Record<string, string> = {
  SF1: "SEMI FINAL 1",
  SF2: "SEMI FINAL 2",
  F: "GRAND FINAL",
};

function SetDots({ won, total = 2, color }: { won: number; total?: number; color: "red" | "blue" }) {
  return (
    <div className="flex gap-2 justify-center mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ scale: i < won ? 1.2 : 1, opacity: i < won ? 1 : 0.2 }}
          className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
            color === "red" ? "bg-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.4)]" : "bg-blue-400 shadow-[0_4px_12px_rgba(96,165,250,0.4)]"
          }`}
        />
      ))}
    </div>
  );
}

function ScoreNumber({ value, color }: { value: number; color: "red" | "blue" }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={value}
        initial={{ y: -40, opacity: 0, scale: 1.3 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`font-black select-none flex items-center justify-center ${
          color === "red" ? "text-red-500" : "text-blue-500"
        }`}
        style={{ fontSize: "clamp(6rem, 22vw, 16rem)", lineHeight: "0.85" }}
      >
        {value}
      </motion.div>
    </AnimatePresence>
  );
}

export default function LiveScoreboard() {
  const [score, setScore] = useState<LiveScore | null>(null);
  const [connected, setConnected] = useState(false);
  const [prevScoreA, setPrevScoreA] = useState<number | null>(null);
  const [prevScoreB, setPrevScoreB] = useState<number | null>(null);
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);

  useEffect(() => {
    const fetchScore = () => {
      supabase
        .from("badminton_live_score")
        .select("*")
        .eq("id", "current")
        .single()
        .then(({ data }) => {
          if (data) {
            setScore((prev) => {
              if (prev && prev.updated_at === data.updated_at) return prev;
              const newData = data as LiveScore;
              if (prev && newData.score_a > prev.score_a) {
                setFlashA(true);
                setTimeout(() => setFlashA(false), 600);
              }
              if (prev && newData.score_b > prev.score_b) {
                setFlashB(true);
                setTimeout(() => setFlashB(false), 600);
              }
              return newData;
            });
          }
        });
    };

    // Initial fetch
    fetchScore();

    // Polling fallback every 2 seconds in case Realtime isn't enabled on the table
    const interval = setInterval(fetchScore, 2000);

    // Subscribe to realtime changes (if enabled)
    const channel = supabase
      .channel("live:badminton_live_score")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "badminton_live_score", filter: "id=eq.current" },
        (payload) => {
          const newData = payload.new as LiveScore;
          setScore((prev) => {
            if (prev && prev.updated_at === newData.updated_at) return prev;
            if (prev && newData.score_a > prev.score_a) {
              setFlashA(true);
              setTimeout(() => setFlashA(false), 600);
            }
            if (prev && newData.score_b > prev.score_b) {
              setFlashB(true);
              setTimeout(() => setFlashB(false), 600);
            }
            return newData;
          });
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const isIdle = !score || score.status === "idle";
  const isMatchOver = score?.status === "match_over";
  const isSetOver = score?.status === "set_over";
  const matchWinner =
    isMatchOver
      ? score!.sets_won_a > score!.sets_won_b
        ? score!.team_a_name
        : score!.team_b_name
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏸</span>
          <div>
            <p className="font-black text-slate-900 text-base leading-none uppercase tracking-wider">
              {score?.category || "Badminton"}
            </p>
            <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
              {score ? MATCH_LABEL[score.match_type] || score.match_type : "Live Scoreboard"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {score && score.status !== "idle" && (
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-200/50 px-3 py-1 rounded-full border border-slate-300/50">
              SET {score.current_set}
            </span>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{connected ? "Live" : "Offline"}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-6">
        {isIdle ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-8xl mb-8">🏸</div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-wider uppercase">Menunggu Pertandingan</h1>
            <p className="text-slate-500 mt-3 text-sm">Scoreboard akan muncul otomatis saat wasit memulai pertandingan.</p>
          </motion.div>
        ) : (
          <div className="w-full max-w-5xl">
            {/* Score board */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-8 items-center">
              {/* Team A */}
              <div className={`flex flex-col items-center transition-all duration-300 ${flashA ? "scale-105" : ""}`}>
                {score?.serving === "A" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-3 bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200 shadow-sm"
                  >
                    🏸 Serve
                  </motion.div>
                )}
                <h2
                  className="font-black text-slate-900 text-center uppercase tracking-tight leading-none drop-shadow-sm"
                  style={{ fontSize: "clamp(1.2rem, 4vw, 3rem)" }}
                >
                  {score?.team_a_name}
                </h2>
                <SetDots won={score?.sets_won_a ?? 0} color="red" />

                <div className={`mt-4 md:mt-8 relative transition-all duration-200 ${flashA ? "drop-shadow-[0_0_40px_rgba(239,68,68,0.5)] z-20" : ""}`}>
                  <ScoreNumber value={score?.score_a ?? 0} color="red" />
                  
                  {/* Shuttlecock Animation for Team A */}
                  <AnimatePresence>
                    {flashA && (
                      <motion.div
                        initial={{ opacity: 0, x: -150, y: -100, rotate: -120, scale: 0.5 }}
                        animate={{ opacity: 1, x: -20, y: -40, rotate: 20, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="absolute top-0 right-0 text-6xl md:text-8xl drop-shadow-xl pointer-events-none origin-bottom-left"
                      >
                        🏸
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center gap-2 px-2">
                <div className="w-px h-48 md:h-64 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                <span className="text-slate-300 font-black text-lg">VS</span>
                <div className="w-px h-48 md:h-64 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
              </div>

              {/* Team B */}
              <div className={`flex flex-col items-center transition-all duration-300 ${flashB ? "scale-105" : ""}`}>
                {score?.serving === "B" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-3 bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200 shadow-sm"
                  >
                    🏸 Serve
                  </motion.div>
                )}
                <h2
                  className="font-black text-slate-900 text-center uppercase tracking-tight leading-none drop-shadow-sm"
                  style={{ fontSize: "clamp(1.2rem, 4vw, 3rem)" }}
                >
                  {score?.team_b_name}
                </h2>
                <SetDots won={score?.sets_won_b ?? 0} color="blue" />

                <div className={`mt-4 md:mt-8 relative transition-all duration-200 ${flashB ? "drop-shadow-[0_0_40px_rgba(59,130,246,0.5)] z-20" : ""}`}>
                  <ScoreNumber value={score?.score_b ?? 0} color="blue" />

                  {/* Shuttlecock Animation for Team B */}
                  <AnimatePresence>
                    {flashB && (
                      <motion.div
                        initial={{ opacity: 0, x: 150, y: -100, rotate: 120, scale: 0.5 }}
                        animate={{ opacity: 1, x: 20, y: -40, rotate: -20, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="absolute top-0 left-0 text-6xl md:text-8xl drop-shadow-xl pointer-events-none origin-bottom-right"
                      >
                        🏸
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Status chip */}
            <AnimatePresence>
              {(isSetOver || isMatchOver) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-10 flex justify-center"
                >
                  {isMatchOver ? (
                    <div className="text-center bg-yellow-50 border border-yellow-200 rounded-3xl px-10 py-6 shadow-md">
                      <div className="text-5xl mb-2">🏆</div>
                      <p className="text-yellow-600 font-black text-2xl md:text-3xl uppercase tracking-wider">
                        {matchWinner}
                      </p>
                      <p className="text-yellow-500/80 text-sm font-bold uppercase tracking-widest mt-1">Pemenang Pertandingan!</p>
                    </div>
                  ) : (
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl px-8 py-4 text-center shadow-sm">
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                        Set {(score?.current_set ?? 1) - 1} Selesai — Menunggu Set Berikutnya
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer branding */}
      <footer className="relative z-10 text-center pb-4">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          GESIT HUT RI 81 • Internal Badminton Tournament 2026
        </p>
      </footer>
    </div>
  );
}
