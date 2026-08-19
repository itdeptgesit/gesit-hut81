"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QuizState, Participant, generateQuestions } from "@/lib/quizStore";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { Trophy, Users, Play, ArrowRight, RotateCcw, ShieldAlert, Loader2, QrCode, CheckCircle2, Crown, Sparkles, X } from "lucide-react";
import QRCode from "react-qr-code";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

let audioCtx: AudioContext | null = null;
const playTickSound = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio errors
  }
};

export default function QuizHostPage() {
  const [state, setState] = useState<QuizState>({
    pin: null,
    phase: "idle" as QuizState["phase"],
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

  const router = useRouter();

  // Auth check on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setIsAuthorized(true);
      }
      setAuthChecked(true);
    });
  }, [router]);

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

  const handleKick = (participantId: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'KICK',
        payload: { id: participantId }
      });
    }
    
    updateState(prev => {
      const next = { ...prev };
      next.participants = { ...prev.participants };
      delete next.participants[participantId];
      return next;
    });
  };

  const handleStartLobby = async () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setHasSaved(false);
    setIsSaving(false);
    
    // Fetch questions from DB
    const { data: dbQuestions, error } = await supabase.from('quiz_questions').select('*');
    
    let activeQuestions = [];
    if (!error && dbQuestions && dbQuestions.length > 0) {
      activeQuestions = generateQuestions(dbQuestions);
    } else {
      activeQuestions = generateQuestions(); // fallback to default
    }

    setState({ 
       pin: newPin, 
       phase: "lobby", 
       participants: {}, 
       questions: activeQuestions, 
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
          if (prev > 1) {
            playTickSound();
          }
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
       playTickSound();
       clearInterval(timerRef.current!);
       timerRef.current = setInterval(() => {
         setTimeLeft(prev => {
           if (prev > 1) {
             playTickSound();
           }
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

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 }
  };
  
  const pageTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirected by useEffect
  }

  return (
    <div className="min-h-screen flex flex-col relative font-sans bg-[#0A1128]">
      <BackgroundEffect />
      <AnimatePresence mode="wait">
        
        {/* --- IDLE PHASE --- */}
        {state.phase === "idle" && (
          <motion.div 
            key="idle" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="relative z-10 flex flex-col items-center justify-center flex-1 p-6 text-center min-h-screen bg-zinc-50"
          >
            {/* subtle decorative rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-red-100 opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-red-100 opacity-80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-red-200 opacity-80" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
              {/* Logo HUT RI 81 */}
              <div className="mb-8 drop-shadow-xl">
                <Image
                  src="/HUTRI81_FA_Logo__Main Logo Merah Hitam Latar Putih.png"
                  alt="HUT RI ke-81"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>

              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-primary/20">
                <Sparkles size={12} className="fill-primary" /> QUIZ LIVE
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-3">
                Gesit Quiz Host
              </h1>
              <p className="text-zinc-500 text-lg mb-10 font-medium">
                Sistem Quiz Interaktif • HUT RI ke-81
              </p>

              <button
                onClick={handleStartLobby}
                className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-b from-primary to-primary-dark text-white px-12 py-5 font-black text-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_8px_30px_rgba(227,30,36,0.35)] border border-red-400"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                BUAT ROOM SEKARANG
              </button>

              <Link href="/admin" className="mt-8 text-zinc-400 hover:text-zinc-700 font-semibold text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50">
                ← Kembali ke Dashboard
              </Link>
            </div>
          </motion.div>
        )}

        {/* --- LOBBY PHASE --- */}
        {state.phase === "lobby" && (
          <motion.div 
            key="lobby" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="relative z-10 flex flex-col min-h-screen w-full bg-zinc-50"
          >
            {/* Header */}
            <header className="relative z-10 w-full px-6 py-3 flex items-center justify-between border-b border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <Image
                  src="/HUTRI81_FA_Logo__Main Logo Merah Hitam Latar Putih.png"
                  alt="HUT RI ke-81"
                  width={52}
                  height={52}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-xl font-black text-zinc-900 leading-none tracking-tight">Quiz HUT RI 81</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Menunggu Peserta bergabung...</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-zinc-100 px-6 py-2 rounded-xl border border-zinc-200 shadow-inner">
                  <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">PIN ROOM</div>
                  <div className="text-3xl font-black text-zinc-900 tracking-[0.15em] leading-none">{state.pin}</div>
                </div>
                <button 
                  onClick={handleStartCountdown}
                  disabled={participants.length === 0}
                  className="bg-gradient-to-b from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-black text-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(227,30,36,0.35)] border border-red-400"
                >
                  <Play fill="currentColor" size={20} /> MULAI
                </button>
              </div>
            </header>

            <div className="relative z-10 flex-1 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto w-full">
              {/* QR Code card */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg flex-1 justify-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/20">
                    <QrCode className="text-primary" size={30} />
                  </div>
                  <h2 className="text-zinc-900 font-black text-3xl mb-2 text-center tracking-tight">Scan untuk Join</h2>
                  <p className="text-zinc-400 text-center mb-8 font-medium text-base">Gunakan kamera HP atau buka link di browser</p>
                  
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.08)] mb-8 border border-zinc-100 transform transition-transform hover:scale-[1.02] duration-500">
                    <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?pin=${state.pin}`} size={400} className="rounded-xl" />
                  </div>
                  
                  <div className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center flex flex-col items-center">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-1">URL Alternatif</span>
                    <span className="text-zinc-900 font-black text-xl tracking-wide">event.gesit.co.id/quiz</span>
                  </div>
                </div>
              </div>
              
              {/* Participants card */}
              <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-[2.5rem] p-8 flex flex-col shadow-lg">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                    <Users className="text-primary" size={26}/>
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                    Peserta <span className="text-zinc-400 ml-1">({participants.length})</span>
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 min-h-[300px]">
                  {participants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 border border-zinc-200">
                        <Users size={36} className="text-zinc-300" />
                      </div>
                      <p className="text-xl font-black text-zinc-500 mb-1 tracking-tight">Belum ada yang join</p>
                      <p className="text-zinc-400 font-medium text-sm">Peserta akan muncul di sini otomatis.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 content-start">
                      <AnimatePresence>
                        {participants.map((p) => (
                          <motion.div 
                            key={p.id} 
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 py-2 pl-4 pr-2 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-sm transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-black text-white shadow-inner shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[120px]">{p.name}</span>
                            <button 
                              onClick={() => handleKick(p.id)}
                              className="ml-auto text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors"
                              title="Keluarkan peserta"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- COUNTDOWN PHASE --- */}
        {state.phase === "countdown" && (
          <motion.div 
            key="countdown" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ type: "spring", bounce: 0.5 }}
            className="relative z-10 flex flex-col items-center justify-center h-screen w-full"
          >
            <div className="text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-[0_0_150px_rgba(255,255,255,0.4)] leading-none">
              {timeLeft}
            </div>
            <p className="text-4xl font-black text-white/50 tracking-[0.3em] uppercase mt-8">Bersiaplah!</p>
          </motion.div>
        )}

        {/* --- QUESTION & ANSWER PHASE --- */}
        {(state.phase === "question" || state.phase === "answer") && (
          <motion.div 
            key="question_answer" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="relative z-10 flex flex-col flex-1 p-6 lg:p-8 w-full h-screen"
          >
            {(() => {
              const currentQ = state.questions[state.currentQuestionIndex];
              if (!currentQ) return null;
              
              const answersCount = participants.filter(p => p.lastAnswer !== null).length;
              const progress = (timeLeft / currentQ.timeLimit) * 100;

              return (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-lg">
                       <span className="text-white/60 font-bold uppercase tracking-widest text-sm">Soal</span>
                       <span className="text-white font-black text-2xl ml-4">{state.currentQuestionIndex + 1} <span className="text-white/40">/ {state.questions.length}</span></span>
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-inner">
                       <span className="text-white/50 font-bold uppercase tracking-widest text-sm">PIN</span>
                       <span className="text-white font-black text-2xl tracking-[0.2em] leading-none">{state.pin}</span>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      {state.phase === "question" ? (
                        <>
                          <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                            <Users className="text-white/70" size={24} />
                            <span className="text-white font-black text-2xl">{answersCount}</span>
                            <span className="text-white/40 text-base font-bold">/ {participants.length}</span>
                          </div>
                          <div className={clsx(
                            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2 backdrop-blur-xl shadow-xl transition-all duration-300",
                            timeLeft <= 5 ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse scale-110" : "bg-white/10 border-white/30 text-white"
                          )}>
                            {timeLeft}
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => updateState({ phase: state.currentQuestionIndex + 1 < state.questions.length ? "leaderboard" : "result" })}
                          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 shadow-[0_0_30px_rgba(227,30,36,0.5)] transition-transform hover:scale-105 active:scale-95 border border-red-400"
                        >
                          Lanjut <ArrowRight size={24} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col mb-8">
                    <div className="flex-1 bg-white rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border-[12px] border-white/10 bg-clip-padding">
                       {state.phase === "question" && (
                         <div className="absolute top-0 left-0 w-full h-3 bg-gray-200">
                           <div 
                             className={clsx("h-full transition-all linear", timeLeft <= 5 ? "bg-red-500" : "bg-primary")}
                             style={{ width: `${progress}%`, transitionDuration: '1s' }}
                           />
                         </div>
                       )}
                       
                       <div className="text-7xl lg:text-8xl mb-8 drop-shadow-2xl">{currentQ.emoji}</div>
                       <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0A1128] leading-tight max-w-6xl tracking-tight break-words">
                         {currentQ.question}
                       </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 min-h-[16rem]">
                    {currentQ.shuffledOptions.map((opt, idx) => {
                       const color = ANSWER_COLORS[idx];
                       const isCorrect = idx === currentQ.correctShuffledIndex;
                       const showCorrect = state.phase === "answer";
                       const dim = showCorrect && !isCorrect;
                       const pickedCount = participants.filter(p => p.lastAnswer === idx).length;

                       return (
                         <div key={idx} className={clsx(
                           "relative rounded-[2rem] flex items-center p-8 transition-all duration-500 border-b-8 overflow-hidden group",
                           color.bg, color.border,
                           dim ? "opacity-30 scale-95 grayscale" : "opacity-100 scale-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
                           showCorrect && isCorrect && "ring-[10px] ring-white/50 animate-pulse"
                         )}>
                           <div className="absolute right-[-5%] top-[-20%] text-[12rem] text-black/10 font-black pointer-events-none rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45">
                             {color.shape}
                           </div>

                           <div className="w-20 h-20 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-4xl font-black mr-8 shrink-0 shadow-inner z-10 border border-white/20">
                             {color.shape}
                           </div>
                           <span className="text-white text-2xl lg:text-4xl font-black leading-tight z-10 drop-shadow-md tracking-tight break-words">{opt}</span>
                           
                           {showCorrect && isCorrect && (
                             <motion.div 
                               initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                               className="absolute top-1/2 -translate-y-1/2 right-8 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl z-20"
                             >
                               <CheckCircle2 className="text-emerald-500" size={48} />
                             </motion.div>
                           )}
                           {showCorrect && (
                             <div className="absolute bottom-6 right-8 bg-black/70 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-2xl font-black z-20 border border-white/20 shadow-xl flex items-center gap-3">
                               <Users size={24} className="opacity-70" />
                               {pickedCount} 
                             </div>
                           )}
                         </div>
                       )
                    })}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* --- LEADERBOARD PHASE --- */}
        {state.phase === "leaderboard" && (
          <motion.div 
            key="leaderboard" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="relative z-10 flex flex-col items-center justify-center h-screen p-6 w-full max-w-5xl mx-auto"
          >
            {(() => {
              const sorted = [...participants].sort((a, b) => b.score - a.score).slice(0, 8);
              return (
                <div className="w-full">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white/10 backdrop-blur-3xl p-6 lg:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 border border-yellow-200">
                        <Trophy className="text-white" size={40} />
                      </div>
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">Leaderboard</h2>
                        <p className="text-white/60 font-bold mt-2 text-lg uppercase tracking-widest">Top 8 Sementara</p>
                      </div>
                    </div>
                    <button 
                       onClick={() => updateState({ currentQuestionIndex: state.currentQuestionIndex + 1, phase: "countdown" })}
                       className="mt-6 md:mt-0 bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-[0_0_30px_rgba(227,30,36,0.5)] transition-transform hover:scale-105 active:scale-95 border border-red-400"
                     >
                       Soal Berikutnya <ArrowRight size={24} />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    <AnimatePresence>
                      {sorted.map((p, i) => (
                        <motion.div 
                          key={p.id}
                          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1, type: "spring" }}
                          className={clsx(
                            "p-5 lg:p-6 rounded-[2rem] flex items-center text-white transform transition-all duration-300 border backdrop-blur-xl shadow-xl",
                            i === 0 ? "bg-gradient-to-r from-yellow-500/20 to-yellow-700/20 border-yellow-500/40 md:scale-[1.02] z-10" :
                            i === 1 ? "bg-gradient-to-r from-slate-300/20 to-slate-500/20 border-slate-300/40" :
                            i === 2 ? "bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/40" :
                            "bg-white/5 border-white/10"
                          )}
                        >
                          <div className={clsx(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mr-6 shadow-inner border shrink-0",
                            i === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-200" :
                            i === 1 ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border-slate-100" :
                            i === 2 ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 border-amber-400" :
                            "bg-white/10 text-white border-white/20"
                          )}>
                            {i+1}
                          </div>
                          <div className="text-2xl md:text-3xl font-bold flex-1 truncate tracking-tight">{p.name}</div>
                          <div className="text-3xl md:text-4xl font-black tracking-tighter drop-shadow-md">{p.score}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* --- RESULT PHASE --- */}
        {state.phase === "result" && (
          <motion.div 
            key="result" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="relative z-10 flex flex-col items-center justify-center text-center h-screen p-6 w-full"
          >
            {(() => {
              const sorted = [...participants].sort((a, b) => b.score - a.score);
              const rank1 = sorted[0];
              const rank2 = sorted[1];
              const rank3 = sorted[2];

              return (
                <div className="w-full max-w-6xl flex flex-col items-center">
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-4 bg-white/10 border border-white/20 px-10 py-4 rounded-full mb-12 shadow-2xl backdrop-blur-xl"
                  >
                     <Crown className="text-yellow-400" size={32} />
                     <span className="text-white font-black tracking-[0.2em] uppercase text-2xl">Hasil Akhir Quiz</span>
                  </motion.div>
                  
                  {isSaving && (
                    <div className="bg-primary/20 border border-primary/40 text-white font-bold px-8 py-4 rounded-full mb-10 animate-pulse flex items-center gap-3 backdrop-blur-xl shadow-lg">
                       <Loader2 className="animate-spin" size={24} /> Menyimpan skor...
                    </div>
                  )}
                  {!isSaving && hasSaved && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                      className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold px-8 py-4 rounded-full mb-10 flex items-center gap-3 backdrop-blur-xl shadow-lg"
                    >
                       <CheckCircle2 size={24} /> Skor tersimpan ke Database
                    </motion.div>
                  )}

                  <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-12 w-full">
                    {/* Juara 2 */}
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
                      className="relative group w-full md:w-1/3 order-2 md:order-1"
                    >
                      <div className="absolute inset-0 bg-slate-300 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                      <div className="bg-gradient-to-b from-slate-200 to-slate-400 p-8 rounded-[3rem] text-slate-900 shadow-xl relative z-10 border-[6px] border-slate-100 transform transition-transform hover:scale-105 duration-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-slate-500 shadow-inner mb-4">2</div>
                        <h3 className="text-xl font-black mb-2 uppercase tracking-[0.2em] text-slate-700">Juara 2</h3>
                        {rank2 ? (
                          <>
                            <div className="text-3xl md:text-4xl font-black mb-6 leading-none tracking-tighter drop-shadow-sm break-words text-center">{rank2.name}</div>
                            <div className="inline-flex items-center bg-black/10 px-6 py-3 rounded-2xl border border-black/5 shadow-inner">
                              <span className="text-3xl font-black">{rank2.score}</span>
                              <span className="text-sm font-black ml-2 opacity-80 tracking-widest uppercase">Poin</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-8 text-xl font-bold italic text-slate-500/50">Kosong</div>
                        )}
                      </div>
                    </motion.div>

                    {/* Juara 1 */}
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                      className="relative group w-full md:w-[45%] order-1 md:order-2 z-20"
                    >
                      <div className="absolute inset-0 bg-yellow-400 blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
                      <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 p-12 md:p-16 rounded-[4rem] text-[#0A1128] shadow-[0_20px_50px_rgba(234,179,8,0.3)] relative border-[10px] border-yellow-200/80 transform transition-transform hover:scale-105 duration-500 flex flex-col items-center">
                        <Crown size={80} className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-100 drop-shadow-2xl" />
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-[0.3em] text-[#0A1128]/70 mt-6">Juara 1</h3>
                        {rank1 ? (
                          <>
                            <div className="text-5xl md:text-7xl font-black mb-8 leading-none tracking-tighter drop-shadow-md break-words text-center">{rank1.name}</div>
                            <div className="inline-flex items-center bg-black/10 px-8 py-5 rounded-3xl border border-black/10 shadow-inner">
                              <span className="text-5xl font-black">{rank1.score}</span>
                              <span className="text-xl font-black ml-3 opacity-80 tracking-widest uppercase">Poin</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 text-3xl font-black italic text-yellow-700/30">Kosong</div>
                        )}
                      </div>
                    </motion.div>

                    {/* Juara 3 */}
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
                      className="relative group w-full md:w-1/3 order-3 md:order-3"
                    >
                      <div className="absolute inset-0 bg-amber-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                      <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-8 rounded-[3rem] text-amber-50 shadow-xl relative z-10 border-[6px] border-amber-400/80 transform transition-transform hover:scale-105 duration-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-3xl font-black text-amber-900 shadow-inner mb-4">3</div>
                        <h3 className="text-xl font-black mb-2 uppercase tracking-[0.2em] text-amber-200">Juara 3</h3>
                        {rank3 ? (
                          <>
                            <div className="text-3xl md:text-4xl font-black mb-6 leading-none tracking-tighter drop-shadow-sm break-words text-center">{rank3.name}</div>
                            <div className="inline-flex items-center bg-black/20 px-6 py-3 rounded-2xl border border-black/10 shadow-inner">
                              <span className="text-3xl font-black">{rank3.score}</span>
                              <span className="text-sm font-black ml-2 opacity-80 tracking-widest uppercase">Poin</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-8 text-xl font-bold italic text-amber-900/30">Kosong</div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-16">
                    {[3, 4, 5, 6, 7].map((idx) => {
                      const p = sorted[idx];
                      const rankNum = idx + 1;
                      return (
                        <motion.div 
                          key={rankNum}
                          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 + idx * 0.1 }}
                          className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md hover:bg-white/10 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black text-white shrink-0 shadow-inner border border-white/20">
                            {rankNum}
                          </div>
                          {p ? (
                            <>
                              <div className="flex-1 text-2xl font-bold text-white truncate">{p.name}</div>
                              <div className="text-3xl font-black text-white">{p.score}</div>
                            </>
                          ) : (
                            <div className="flex-1 text-white/30 italic font-medium">Kosong</div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    onClick={handleStartLobby}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl shadow-2xl"
                  >
                    <RotateCcw size={28} /> Buat Room Baru
                  </motion.button>
                </div>
              );
            })()}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
