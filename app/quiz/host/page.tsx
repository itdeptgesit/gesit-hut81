"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QuizState, Participant, generateQuestions } from "@/lib/quizStore";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { Trophy, Users, Play, ArrowRight, RotateCcw, ShieldAlert, Loader2, QrCode, CheckCircle2, Crown, Sparkles } from "lucide-react";
import QRCode from "react-qr-code";
import Link from "next/link";

const ANSWER_COLORS = [
  { bg: "bg-red-500", border: "border-red-600", shape: "▲" },
  { bg: "bg-blue-500", border: "border-blue-600", shape: "◆" },
  { bg: "bg-amber-500", border: "border-amber-600", shape: "●" },
  { bg: "bg-emerald-500", border: "border-emerald-600", shape: "■" },
];

const BackgroundEffect = () => (
  <>
    <div className="fixed inset-0 bg-[#0A1128] z-0" />
    <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />
    <div className="fixed bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />
  </>
);

export default function QuizHostPage() {
  const [state, setState] = useState<QuizState>({
    pin: null,
    phase: "lobby",
    questions: [],
    currentQuestionIndex: 0,
    questionStartTime: null,
    participants: {}
  });
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Auth check on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthorized(!!session);
      setAuthChecked(true);
    });
  }, []);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const broadcastState = useCallback((newState: QuizState) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_STATE',
        payload: newState
      });
    }
  }, []);

  const updateState = useCallback((updates: Partial<QuizState> | ((prev: QuizState) => Partial<QuizState>)) => {
    setState(prev => {
      const nextUpdates = typeof updates === "function" ? updates(prev) : updates;
      const next = { ...prev, ...nextUpdates } as QuizState;
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  useEffect(() => {
    if (!state.pin) return;

    const channelName = `quiz-room-${state.pin}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { ack: true } }
    });

    channel
      .on('broadcast', { event: 'ACTION' }, ({ payload }) => {
        const { type, id, name, answerIndex } = payload;
        
        if (type === 'JOIN') {
          setState(prev => {
             const next = { ...prev };
             next.participants = { ...prev.participants };
             if (!next.participants[id]) {
               next.participants[id] = {
                 id, name, score: 0, lastAnswer: null, answerTime: null, isCorrect: null
               };
               broadcastState(next);
             } else {
               broadcastState(next);
             }
             return next;
          });
        }
        
        if (type === 'ANSWER') {
           setState(prev => {
             if (prev.phase !== "question") return prev;
             const next = { ...prev };
             next.participants = { ...prev.participants };
             if (next.participants[id] && next.participants[id].lastAnswer === null) {
               const answerTime = Date.now() - (prev.questionStartTime || Date.now());
               next.participants[id].lastAnswer = answerIndex;
               next.participants[id].answerTime = answerTime;
               broadcastState(next); 
             }
             return next;
           });
        }
      })
      .on('broadcast', { event: 'REQUEST_SYNC' }, () => {
         broadcastState(stateRef.current);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.pin, broadcastState]);

  const handleStartLobby = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setHasSaved(false);
    setIsSaving(false);
    setState({ 
       pin: newPin, 
       phase: "lobby", 
       participants: {}, 
       questions: generateQuestions(), 
       currentQuestionIndex: 0,
       questionStartTime: null
    });
  };

  const handleStartCountdown = () => {
    updateState({ phase: "countdown" });
  };

  const handleShowQuestion = () => {
    updateState(prev => {
      const nextParticipants = { ...prev.participants };
      Object.keys(nextParticipants).forEach(id => {
        nextParticipants[id] = { ...nextParticipants[id], lastAnswer: null, answerTime: null, isCorrect: null };
      });
      return { phase: "question", questionStartTime: Date.now(), participants: nextParticipants };
    });
  };

  const handleShowAnswer = () => {
    updateState(prev => {
      const currentQ = prev.questions[prev.currentQuestionIndex];
      const correctIndex = currentQ.correctShuffledIndex;
      const timeLimitMs = currentQ.timeLimit * 1000;
      
      const nextParticipants = { ...prev.participants };
      Object.values(nextParticipants).forEach(p => {
        if (p.lastAnswer === correctIndex) {
          p.isCorrect = true;
          const answerTime = p.answerTime || timeLimitMs;
          const timeLeft = Math.max(0, timeLimitMs - answerTime);
          const timeBonus = Math.floor((timeLeft / timeLimitMs) * 500);
          p.score += (500 + timeBonus);
        } else {
          p.isCorrect = false;
        }
      });
      
      return { phase: "answer", participants: nextParticipants };
    });
  };

  useEffect(() => {
    if (state.phase === "question") {
      const currentQ = state.questions[state.currentQuestionIndex];
      const elapsed = Math.floor((Date.now() - (state.questionStartTime || Date.now())) / 1000);
      const remaining = Math.max(0, currentQ.timeLimit - elapsed);
      setTimeLeft(remaining);

      clearInterval(timerRef.current!);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleShowAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (state.phase === "countdown") {
       setTimeLeft(3);
       clearInterval(timerRef.current!);
       timerRef.current = setInterval(() => {
         setTimeLeft(prev => {
           if (prev <= 1) {
             clearInterval(timerRef.current!);
             handleShowQuestion();
             return 0;
           }
           return prev - 1;
         });
       }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [state.phase, state.currentQuestionIndex]);

  useEffect(() => {
    if (state.phase === "result" && !hasSaved && Object.keys(state.participants).length > 0) {
      setHasSaved(true);
      setIsSaving(true);
      
      const insertData = Object.values(state.participants)
        .filter(p => p.score > 0)
        .map(p => ({
          name: p.name,
          score: p.score,
          pin: state.pin
        }));
        
      if (insertData.length > 0) {
        supabase.from('quiz_scores').insert(insertData).then(({ error }) => {
          setIsSaving(false);
          if (error) console.error("Error saving to supabase:", error);
        });
      } else {
        setIsSaving(false);
      }
    }
  }, [state.phase, hasSaved, state.participants, state.pin]);

  const participants = Object.values(state.participants);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center gap-6 p-8 text-center relative overflow-hidden font-sans">
        <BackgroundEffect />
        <div className="relative z-10 w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-md animate-fade-up">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        <h1 className="relative z-10 text-3xl font-black text-white animate-fade-up" style={{ animationDelay: '100ms' }}>Akses Ditolak</h1>
        <p className="relative z-10 text-white/50 max-w-md text-base animate-fade-up" style={{ animationDelay: '200ms' }}>
          Anda harus login sebagai admin untuk membuat dan mengelola room quiz.
        </p>
        <Link
          href="/admin/login"
          className="relative z-10 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(227,30,36,0.3)] mt-6 animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          Login ke Admin Panel
        </Link>
      </div>
    );
  }

  // --- IDLE PHASE ---
  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">
        <BackgroundEffect />
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6 text-center animate-fade-up">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-xl w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/30 rotate-3 transition-transform hover:rotate-6">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 tracking-tight mb-3">
              Gesit Quiz Host
            </h1>
            <p className="text-white/50 text-lg mb-8 font-medium">
              Sistem Quiz Interaktif • HUT RI ke-81
            </p>
            <button
              onClick={handleStartLobby}
              className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-white text-[#0A1128] px-8 py-4 font-black text-xl transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              BUAT ROOM SEKARANG
            </button>
            <Link href="/admin" className="mt-6 text-white/40 hover:text-white/80 font-bold text-sm transition-colors">
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- LOBBY PHASE ---
  if (state.phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">
        <BackgroundEffect />
        
        {/* Header */}
        <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
               <Trophy className="text-white" size={20} />
             </div>
             <div>
               <h1 className="text-xl font-black text-white leading-none tracking-tight">Quiz HUT RI 81</h1>
               <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                 <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Menunggu Peserta</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-0.5">PIN ROOM</div>
              <div className="text-2xl font-black text-white tracking-[0.15em] leading-none">{state.pin}</div>
            </div>
            <button 
              onClick={handleStartCountdown}
              disabled={participants.length === 0}
              className="bg-white text-[#0A1128] px-6 py-2.5 rounded-xl font-black text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Play fill="currentColor" size={18} /> MULAI
            </button>
          </div>
        </header>

        <div className="relative z-10 flex-1 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full">
          {/* LEFT: QR Code */}
          <div className="lg:col-span-4 flex flex-col h-full">
             <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center shadow-2xl relative overflow-hidden flex-1 justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px]" />
                
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-4 shadow-inner border border-white/10">
                  <QrCode className="text-white" size={28} />
                </div>
                <h2 className="text-white font-black text-xl mb-2 text-center tracking-tight">Scan untuk Join</h2>
                <p className="text-white/50 text-center mb-6 font-medium text-sm">Gunakan kamera HP atau buka link di browser</p>
                
                <div className="bg-white p-4 rounded-2xl shadow-2xl mb-6 transform transition-transform hover:scale-105 duration-500 ring-4 ring-white/10">
                  <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?pin=${state.pin}`} size={200} className="rounded-lg" />
                </div>
                
                <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-center shadow-inner">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">URL Alternatif</span>
                  <span className="text-white font-black text-lg tracking-wide">event.gesit.co.id/quiz</span>
                </div>
             </div>
          </div>
          
          {/* RIGHT: Participants Grid */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl h-full">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-xl shadow-inner border border-primary/30">
                  <Users className="text-white" size={24}/>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Peserta <span className="text-white/40 ml-1">({participants.length})</span>
                </h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
              {participants.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                    <Users size={32} className="text-white/20" />
                  </div>
                  <p className="text-xl font-black text-white/50 mb-2 tracking-tight">Belum ada yang join</p>
                  <p className="text-white/30 font-medium text-sm">Peserta akan muncul di sini otomatis.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 content-start">
                  {participants.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-3 shadow-md transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-black shadow-inner">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- COUNTDOWN PHASE ---
  if (state.phase === "countdown") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
        <BackgroundEffect />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="text-[15rem] md:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-[0_0_100px_rgba(255,255,255,0.4)] leading-none animate-pulse">
            {timeLeft}
          </div>
          <p className="text-3xl font-black text-white/50 tracking-[0.2em] uppercase mt-6">Bersiaplah!</p>
        </div>
      </div>
    );
  }

  const currentQ = state.questions[state.currentQuestionIndex];
  if (!currentQ) return null;

  // --- QUESTION & ANSWER PHASE ---
  if (state.phase === "question" || state.phase === "answer") {
    const answersCount = participants.filter(p => p.lastAnswer !== null).length;
    const progress = (timeLeft / currentQ.timeLimit) * 100;

    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden font-sans p-4 lg:p-6">
        <BackgroundEffect />
        
        {/* Top Bar */}
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-xl shadow-md">
             <span className="text-white/60 font-bold uppercase tracking-widest text-xs">Soal</span>
             <span className="text-white font-black text-lg ml-3">{state.currentQuestionIndex + 1} <span className="text-white/40">/ {state.questions.length}</span></span>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-4 shadow-inner hidden md:flex">
             <span className="text-white/50 font-bold uppercase tracking-widest text-xs">PIN</span>
             <span className="text-white font-black text-xl tracking-[0.2em] leading-none">{state.pin}</span>
          </div>
          
          <div className="flex gap-3 items-center">
            {state.phase === "question" ? (
              <>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md">
                  <Users className="text-white/70" size={20} />
                  <span className="text-white font-black text-xl">{answersCount}</span>
                  <span className="text-white/40 text-sm font-bold">/ {participants.length}</span>
                </div>
                <div className={clsx(
                  "w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black border-2 backdrop-blur-xl shadow-lg transition-all duration-300",
                  timeLeft <= 5 ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse scale-110" : "bg-white/10 border-white/30 text-white"
                )}>
                  {timeLeft}
                </div>
              </>
            ) : (
              <button 
                onClick={() => updateState({ phase: state.currentQuestionIndex + 1 < state.questions.length ? "leaderboard" : "result" })}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-black text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(227,30,36,0.4)] transition-transform hover:scale-105 active:scale-95"
              >
                Lanjut <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Question Area */}
        <div className="relative z-10 flex-1 flex flex-col mb-6">
          <div className="flex-1 bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden border-[8px] border-white/10 bg-clip-padding">
             {/* Progress Bar Top */}
             {state.phase === "question" && (
               <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                 <div 
                   className={clsx("h-full transition-all linear", timeLeft <= 5 ? "bg-red-500" : "bg-primary")}
                   style={{ width: `${progress}%`, transitionDuration: '1s' }}
                 />
               </div>
             )}
             
             <div className="text-5xl lg:text-7xl mb-6 drop-shadow-xl">{currentQ.emoji}</div>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0A1128] leading-snug max-w-5xl tracking-tight break-words">
               {currentQ.question}
             </h2>
          </div>
        </div>

        {/* Options Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 lg:gap-6 h-auto min-h-[12rem]">
          {currentQ.shuffledOptions.map((opt, idx) => {
             const color = ANSWER_COLORS[idx];
             const isCorrect = idx === currentQ.correctShuffledIndex;
             const showCorrect = state.phase === "answer";
             const dim = showCorrect && !isCorrect;
             const pickedCount = participants.filter(p => p.lastAnswer === idx).length;

             return (
               <div key={idx} className={clsx(
                 "relative rounded-[1.5rem] flex items-center p-6 lg:p-8 transition-all duration-500 border-b-4 overflow-hidden group",
                 color.bg,
                 color.border,
                 dim ? "opacity-30 scale-95 grayscale-[0.8]" : "opacity-100 scale-100 shadow-xl",
                 showCorrect && isCorrect && "ring-[8px] ring-white/50 animate-bounce"
               )}>
                 <div className="absolute right-[-5%] top-[-20%] text-[10rem] text-black/10 font-black pointer-events-none rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45">
                   {color.shape}
                 </div>

                 <div className="w-16 h-16 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-3xl font-black mr-6 shrink-0 shadow-inner z-10 border border-white/20">
                   {color.shape}
                 </div>
                 <span className="text-white text-xl lg:text-3xl font-black leading-tight z-10 drop-shadow-md tracking-tight break-words">{opt}</span>
                 
                 {showCorrect && isCorrect && (
                   <div className="absolute top-1/2 -translate-y-1/2 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl z-20 animate-fade-in">
                     <CheckCircle2 className="text-emerald-500" size={36} />
                   </div>
                 )}
                 {showCorrect && (
                   <div className="absolute bottom-4 right-6 bg-black/60 backdrop-blur-xl text-white px-5 py-2.5 rounded-xl text-xl font-black z-20 border border-white/20 shadow-xl flex items-center gap-3">
                     <Users size={20} className="opacity-70" />
                     {pickedCount} 
                   </div>
                 )}
               </div>
             )
          })}
        </div>
      </div>
    );
  }

  // --- LEADERBOARD PHASE ---
  if (state.phase === "leaderboard") {
    const sorted = [...participants].sort((a, b) => b.score - a.score).slice(0, 5);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans p-6">
         <BackgroundEffect />
         
         <div className="relative z-10 w-full max-w-4xl">
           <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white/10 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 shadow-xl">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                 <Trophy className="text-white" size={32} />
               </div>
               <div>
                 <h2 className="text-4xl font-black text-white tracking-tight">Leaderboard</h2>
                 <p className="text-white/60 font-bold mt-1 text-lg uppercase tracking-widest">Top 5 Sementara</p>
               </div>
             </div>
             <button 
                onClick={() => {
                  updateState({ currentQuestionIndex: state.currentQuestionIndex + 1, phase: "countdown" });
                }}
                className="mt-6 md:mt-0 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-[0_0_20px_rgba(227,30,36,0.4)] transition-transform hover:scale-105 active:scale-95"
              >
                Lanjut <ArrowRight size={24} />
              </button>
           </div>
           
           <div className="flex flex-col gap-4">
             {sorted.map((p, i) => (
               <div 
                 key={p.id} 
                 className={clsx(
                   "p-5 lg:p-6 rounded-2xl flex items-center text-white transform transition-all duration-300 hover:scale-[1.02] border backdrop-blur-xl shadow-lg",
                   i === 0 ? "bg-gradient-to-r from-yellow-500/20 to-yellow-700/20 border-yellow-500/40" :
                   i === 1 ? "bg-gradient-to-r from-slate-300/20 to-slate-500/20 border-slate-300/40" :
                   i === 2 ? "bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/40" :
                   "bg-white/5 border-white/10"
                 )}
               >
                 <div className={clsx(
                   "w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black mr-6 shadow-inner border",
                   i === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-200" :
                   i === 1 ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border-slate-100" :
                   i === 2 ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 border-amber-400" :
                   "bg-white/10 text-white border-white/20"
                 )}>
                   {i+1}
                 </div>
                 <div className="text-2xl md:text-3xl font-bold flex-1 truncate tracking-tight">{p.name}</div>
                 <div className="text-3xl md:text-4xl font-black tracking-tighter">{p.score}</div>
               </div>
             ))}
           </div>
         </div>
      </div>
    );
  }

  // --- RESULT PHASE ---
  if (state.phase === "result") {
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden font-sans p-6">
        <BackgroundEffect />
        
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-8 py-3 rounded-full mb-10 shadow-xl backdrop-blur-xl">
             <Crown className="text-yellow-400" size={24} />
             <span className="text-white font-black tracking-[0.1em] uppercase text-lg">Hasil Akhir Quiz</span>
          </div>
          
          {isSaving && (
            <div className="bg-primary/20 border border-primary/40 text-white font-bold px-8 py-4 rounded-full mb-10 animate-pulse flex items-center gap-3 backdrop-blur-xl shadow-lg">
               <Loader2 className="animate-spin" size={24} /> Menyimpan skor...
            </div>
          )}
          {!isSaving && hasSaved && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold px-8 py-4 rounded-full mb-10 flex items-center gap-3 backdrop-blur-xl shadow-lg">
               <CheckCircle2 size={24} /> Skor tersimpan
            </div>
          )}

          {winner && (
            <div className="relative group mb-12 w-full max-w-2xl">
              <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 p-12 rounded-[3rem] text-[#0A1128] shadow-2xl relative z-10 border-[8px] border-yellow-200/60 transform transition-transform hover:scale-105 duration-500">
                <Crown size={80} className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-100 drop-shadow-xl" />
                <h3 className="text-2xl font-black mb-4 uppercase tracking-[0.2em] text-[#0A1128]/70 mt-4">Juara 1</h3>
                <div className="text-5xl md:text-6xl font-black mb-8 leading-none tracking-tighter drop-shadow-md break-words">{winner.name}</div>
                <div className="inline-flex items-center bg-black/10 px-8 py-4 rounded-2xl border border-black/10 shadow-inner">
                  <span className="text-5xl font-black">{winner.score}</span>
                  <span className="text-xl font-black ml-3 opacity-80 tracking-widest uppercase">Poin</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleStartLobby}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl shadow-xl"
          >
            <RotateCcw size={24} /> Buat Room Baru
          </button>
        </div>
      </div>
    );
  }

  return null;
}
