"use client";

import { useState, useEffect, useRef } from "react";
import { QuizState } from "@/lib/quizStore";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { Zap, Loader2, Trophy, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ANSWER_COLORS = [
  { bg: "bg-red-500", border: "border-red-700", shadow: "shadow-red-600/50", shape: "▲" },
  { bg: "bg-blue-500", border: "border-blue-700", shadow: "shadow-blue-600/50", shape: "◆" },
  { bg: "bg-amber-500", border: "border-amber-700", shadow: "shadow-amber-600/50", shape: "●" },
  { bg: "bg-emerald-500", border: "border-emerald-700", shadow: "shadow-emerald-600/50", shape: "■" },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const BackgroundEffect = () => (
  <>
    <div className="fixed inset-0 bg-[#0A1128] z-0" />
    <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />
    <div className="fixed bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />
  </>
);

export default function QuizParticipantPage() {
  const [state, setState] = useState<QuizState | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [activePin, setActivePin] = useState("");
  
  const [isJoined, setIsJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quiz_player_id");
      if (saved) {
        setPlayerId(saved);
      } else {
        const newId = generateId();
        setPlayerId(newId);
        localStorage.setItem("quiz_player_id", newId);
      }

      const savedName = localStorage.getItem("quiz_player_name");
      if (savedName) setPlayerName(savedName);
    } catch(e) {
      console.warn("LocalStorage blocked, generating random ID");
      setPlayerId(generateId());
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pinParam = params.get("pin");
      if (pinParam) {
        setInputPin(pinParam);
      }
    }
  }, []);

  useEffect(() => {
    if (!activePin) return;

    const channelName = `quiz-room-${activePin}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { ack: true } }
    });

    channel
      .on('broadcast', { event: 'SYNC_STATE' }, ({ payload }) => {
        setState(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          channel.send({
            type: 'broadcast',
            event: 'ACTION',
            payload: { type: 'JOIN', id: playerId, name: playerName }
          });
          channel.send({ type: 'broadcast', event: 'REQUEST_SYNC' });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [activePin, playerId, playerName]);

  const sendAction = (type: string, payload: any = {}) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'ACTION',
        payload: { type, id: playerId, name: playerName, ...payload }
      });
    }
  };

  const joinGame = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPin.trim()) {
      setErrorMsg("PIN harus diisi!");
      return;
    }
    if (!playerName.trim()) {
      setErrorMsg("Nama harus diisi!");
      return;
    }
    try {
      localStorage.setItem("quiz_player_name", playerName);
    } catch(e) {}
    
    setErrorMsg("");
    setActivePin(inputPin.trim());
    setIsJoined(true);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    in: { opacity: 1, scale: 1, y: 0 },
    out: { opacity: 0, scale: 1.05, y: -20 }
  };
  
  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden font-sans p-4">
        <BackgroundEffect />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary-light text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-primary/30 shadow-lg shadow-primary/20 backdrop-blur-md">
                <Zap size={12} className="fill-primary-light" /> QUIZ LIVE
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">HUT RI ke-81</h1>
              <p className="text-sm text-white/50 font-medium">Masukkan PIN di layar untuk bergabung</p>
            </div>

            <form onSubmit={joinGame} className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl p-6 md:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest pl-1">PIN GAME</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputPin}
                  onChange={(e) => { setInputPin(e.target.value.replace(/\D/g, "")); setErrorMsg(""); }}
                  placeholder="0000"
                  maxLength={6}
                  className="w-full h-16 px-4 rounded-2xl bg-black/40 border-2 border-white/10 text-white font-black text-center text-3xl tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest pl-1">NAMA KAMU</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => { setPlayerName(e.target.value); setErrorMsg(""); }}
                    placeholder="Nama panggilan..."
                    maxLength={15}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/40 border-2 border-white/10 text-white font-bold text-lg placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-bold px-4 py-3 rounded-xl"
                  >
                    <span className="shrink-0 text-red-500">⚠</span> {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-b from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-lg font-black rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(227,30,36,0.3)] border border-red-500 mt-2"
              >
                MASUK SEKARANG <ArrowRight size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isConnected || !state) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden font-sans items-center justify-center p-6 text-center">
        <BackgroundEffect />
        <motion.div 
          initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin shadow-[0_0_30px_rgba(227,30,36,0.5)]" />
          <div>
            <p className="text-xl font-black text-white tracking-tight">{!isConnected ? "Menghubungkan..." : "Menunggu Host"}</p>
            <p className="text-sm font-medium text-white/50 mt-2">{isConnected ? "Quiz akan segera dimulai di layar utama" : `Mencari room ${activePin}...`}</p>
          </div>
          <button
            onClick={() => { setIsJoined(false); setActivePin(""); }}
            className="text-sm font-bold text-white/40 hover:text-white/80 transition-colors mt-4 px-6 py-2 rounded-full border border-white/10 bg-white/5"
          >
            Ganti PIN
          </button>
        </motion.div>
      </div>
    );
  }

  const me = state.participants[playerId] || { name: playerName, score: 0, lastAnswer: null, isCorrect: null };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans bg-[#0A1128]">
      <BackgroundEffect />
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-2xl mx-auto h-full">
        <AnimatePresence mode="wait">
          
          {/* ── LOBBY / LEADERBOARD ── */}
          {(state.phase === "lobby" || state.phase === "leaderboard") && (
            <motion.div 
              key="lobby"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full"
            >
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-xs font-black text-white/70 shadow-lg">
                PIN: {activePin}
              </div>
              <div className="inline-flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div> 
                Terhubung
              </div>
              
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(227,30,36,0.3)] mb-6 border border-white/20">
                {me.name.substring(0, 2).toUpperCase()}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Halo, {me.name}!</h2>
              
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-4 rounded-3xl mt-4 mb-10 inline-flex flex-col items-center">
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Skor Kamu</span>
                <span className="text-4xl font-black text-white">{me.score}</span>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce mx-1" style={{ animationDelay: '150ms' }} />
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
                 <p className="text-white/80 font-bold text-lg">Perhatikan layar utama proyektor...</p>
              </div>
            </motion.div>
          )}

          {/* ── COUNTDOWN ── */}
          {state.phase === "countdown" && (
            <motion.div 
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center p-6 h-full"
            >
               <div className="text-5xl md:text-7xl font-black text-white text-center tracking-tight">Siap-siap!</div>
            </motion.div>
          )}

          {/* ── QUESTION (CONTROLLER) ── */}
          {state.phase === "question" && (
            <motion.div 
              key="question"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col p-4 md:p-6 h-full"
            >
              {me.lastAnswer !== null ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}
                    className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/20"
                  >
                    <Loader2 size={40} className="text-white animate-spin" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-2">Jawaban Terkunci!</h2>
                  <p className="text-white/50 font-medium text-lg">Menunggu peserta lain selesai...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-white/10 px-4 py-2 rounded-full text-white font-bold text-sm backdrop-blur-md">Skor: {me.score}</span>
                  </div>
                  <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1">
                    {ANSWER_COLORS.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendAction('ANSWER', { answerIndex: idx })}
                        className={clsx(
                          "relative rounded-[2rem] flex items-center justify-center transition-all duration-100 ease-out",
                          "border-[10px] sm:border-[12px] border-b-[20px] sm:border-b-[24px] active:border-b-[10px] active:sm:border-b-[12px] active:translate-y-[10px] active:sm:translate-y-[12px]",
                          color.bg, color.border, color.shadow,
                          "shadow-2xl"
                        )}
                      >
                        <span className="text-white text-7xl sm:text-8xl font-black drop-shadow-md">{color.shape}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── ANSWER (RESULT PER QUESTION) ── */}
          {state.phase === "answer" && (
            <motion.div 
              key="answer"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full"
            >
              <div className="absolute inset-0 z-0">
                 <div className={clsx("absolute inset-0 transition-colors duration-500", me.isCorrect ? "bg-emerald-500" : "bg-red-600")} />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  className="w-32 h-32 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-7xl mb-8 rotate-3"
                >
                   {me.isCorrect ? "✅" : me.lastAnswer !== null ? "❌" : "⏰"}
                </motion.div>
                <motion.h2 
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }}
                  className="text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg"
                >
                  {me.isCorrect ? "BENAR!" : me.lastAnswer !== null ? "SALAH!" : "WAKTU HABIS"}
                </motion.h2>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                  className="bg-black/30 backdrop-blur-xl mt-6 px-10 py-6 rounded-3xl text-left border border-white/20 shadow-xl"
                >
                  <div className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1 text-center">Total Poin</div>
                  <div className="text-white font-black text-6xl text-center">{me.score}</div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── FINAL RESULT ── */}
          {state.phase === "result" && (
            <motion.div 
              key="result"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full"
            >
               <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Quiz Selesai!</h1>
               
               <div className="bg-gradient-to-b from-white to-zinc-100 p-10 rounded-[3rem] w-full max-w-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] border-8 border-white/10 bg-clip-padding relative">
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                   <Trophy size={32} className="text-yellow-900" />
                 </div>
                 
                 <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-4 mb-1">Peringkat Kamu</div>
                 <div className="text-7xl font-black text-[#0A1128] mb-8 drop-shadow-md">
                   #{Object.values(state.participants).sort((a, b) => b.score - a.score).findIndex(p => p.id === me.id) + 1}
                 </div>
                 
                 <div className="w-full h-px bg-zinc-200 mb-6" />
                 
                 <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Skor Akhir</div>
                 <div className="text-4xl font-black text-primary">{me.score}</div>
               </div>

               <button 
                 onClick={() => { setIsJoined(false); setActivePin(""); }}
                 className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors border border-white/20 backdrop-blur-md"
               >
                 Keluar dari Room
               </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
