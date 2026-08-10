"use client";

import { useState, useEffect, useRef } from "react";
import { QuizState } from "@/lib/quizStore";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { Zap, Loader2, SignalHigh } from "lucide-react";

const ANSWER_COLORS = [
  { bg: "bg-[#E31E24]", hover: "active:bg-[#c41920]", shape: "▲" },
  { bg: "bg-[#3B82F6]", hover: "active:bg-[#2563eb]", shape: "◆" },
  { bg: "bg-[#F59E0B]", hover: "active:bg-[#d97706]", shape: "●" },
  { bg: "bg-[#10B981]", hover: "active:bg-[#059669]", shape: "■" },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

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

    // Auto-fill PIN from URL if present
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
          // Auto send JOIN when connected
          channel.send({
            type: 'broadcast',
            event: 'ACTION',
            payload: { type: 'JOIN', id: playerId, name: playerName }
          });
          // Request sync in case joined in the middle
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

  // ── JOIN SCREEN ──
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <Zap size={10} /> Quiz Live
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">HUT RI ke-81</h1>
            <p className="text-sm text-zinc-500 mt-1">Masukkan PIN dan nama kamu untuk bergabung</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">PIN Game</label>
              <input
                type="text"
                inputMode="numeric"
                value={inputPin}
                onChange={(e) => { setInputPin(e.target.value.replace(/\D/g, "")); setErrorMsg(""); }}
                placeholder="0 0 0 0"
                maxLength={6}
                className="w-full h-14 px-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-bold text-center text-2xl tracking-[0.4em] placeholder:text-zinc-200 placeholder:tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Nama Kamu</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setErrorMsg(""); }}
                placeholder="Nama panggilan..."
                maxLength={15}
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                <span className="shrink-0">⚠</span> {errorMsg}
              </div>
            )}

            <button
              onClick={() => joinGame()}
              className="w-full h-10 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              Bergabung ke Quiz
            </button>
          </div>

          <p className="text-center text-xs text-zinc-400 mt-6">Masukkan PIN dari layar utama presenter</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !state) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-zinc-200 border-t-primary animate-spin" />
        <div>
          <p className="text-base font-semibold text-zinc-900">{!isConnected ? "Menghubungkan..." : "Menunggu Host Memulai"}</p>
          <p className="text-sm text-zinc-400 mt-1">{isConnected ? "Quiz akan dimulai sebentar lagi" : `Bergabung ke room ${activePin}...`}</p>
        </div>
        <button
          onClick={() => { setIsJoined(false); setActivePin(""); }}
          className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition-colors mt-2"
        >
          Ganti PIN
        </button>
      </div>
    );
  }

  const me = state.participants[playerId] || { name: playerName, score: 0, lastAnswer: null, isCorrect: null };

  // ── LOBBY / LEADERBOARD ──
  if (state.phase === "lobby" || state.phase === "leaderboard") {
    return (
      <div className="min-h-screen bg-[#102A4C] flex flex-col items-center justify-center p-4 text-center relative">
         <div className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white/50">
            PIN: {activePin}
         </div>
         <div className="inline-flex items-center justify-center bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
           <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div> Terhubung
         </div>
         <h2 className="text-3xl font-black text-white mb-2">Halo, {me.name}!</h2>
         <p className="text-white/60 font-bold text-lg mb-8">Skor kamu: {me.score}</p>
         
         <div className="bg-white/10 p-6 rounded-3xl animate-pulse w-full max-w-sm">
           <p className="text-white font-bold text-xl">Perhatikan layar utama...</p>
         </div>
      </div>
    );
  }

  // ── COUNTDOWN ──
  if (state.phase === "countdown") {
    return (
      <div className="min-h-screen bg-[#102A4C] flex items-center justify-center">
         <div className="text-5xl font-black text-white animate-bounce">Bersiap...</div>
      </div>
    );
  }

  // ── QUESTION (CONTROLLER) ──
  if (state.phase === "question") {
    const hasAnswered = me.lastAnswer !== null;

    if (hasAnswered) {
      return (
        <div className="min-h-screen bg-[#102A4C] flex items-center justify-center p-6 text-center">
          <div>
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <h2 className="text-3xl font-black text-white">Jawaban terkirim!</h2>
            <p className="text-white/60 mt-2">Menunggu waktu habis...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black p-2 flex flex-col">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1">
          {ANSWER_COLORS.map((color, idx) => (
            <button
              key={idx}
              onClick={() => sendAction('ANSWER', { answerIndex: idx })}
              className={clsx(
                color.bg, color.hover,
                "rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-inner"
              )}
            >
              <span className="text-white text-6xl font-black shadow-black/20 drop-shadow-lg">{color.shape}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── ANSWER (RESULT PER QUESTION) ──
  if (state.phase === "answer") {
    const isCorrect = me.isCorrect;
    const answered = me.lastAnswer !== null;
    
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center p-6 text-center transition-colors duration-500",
        isCorrect ? "bg-emerald-500" : "bg-red-500"
      )}>
        <div>
          <div className="text-7xl mb-6 bg-white/20 inline-block p-6 rounded-full shadow-lg">
             {isCorrect ? "✅" : answered ? "❌" : "⏰"}
          </div>
          <h2 className="text-4xl font-black text-white mb-2">
            {isCorrect ? "BENAR!" : answered ? "SALAH!" : "WAKTU HABIS"}
          </h2>
          <div className="bg-black/20 mt-6 p-4 rounded-2xl inline-block text-left min-w-[200px]">
            <div className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Total Poin</div>
            <div className="text-white font-black text-4xl">{me.score}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── FINAL RESULT ──
  if (state.phase === "result") {
    const sorted = Object.values(state.participants).sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(p => p.id === me.id) + 1;

    return (
      <div className="min-h-screen bg-[#102A4C] flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-4xl font-black text-white mb-6">Quiz Selesai!</h1>
         
         <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm shadow-2xl shadow-primary/20">
           <div className="text-xl font-bold text-[#102A4C]/60 mb-2">Peringkat Kamu</div>
           <div className="text-6xl font-black text-primary mb-6">#{myRank}</div>
           
           <div className="text-xl font-bold text-[#102A4C]/60 mb-1">Skor Akhir</div>
           <div className="text-4xl font-black text-[#102A4C]">{me.score}</div>
         </div>

         <button 
           onClick={() => { setIsJoined(false); setActivePin(""); }}
           className="mt-8 text-white/50 underline text-sm"
         >
           Keluar / Ganti Room
         </button>
      </div>
    );
  }

  return null;
}
