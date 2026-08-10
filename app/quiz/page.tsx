"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { quizQuestions, QuizQuestion } from "@/lib/quizData";
import Link from "next/link";
import { ArrowLeft, Trophy, Clock, Star, RotateCcw, Home, Zap } from "lucide-react";
import clsx from "clsx";

type Phase = "lobby" | "countdown" | "quiz" | "answer" | "result";

const ANSWER_COLORS = [
  { bg: "bg-[#E31E24]", hover: "hover:bg-[#c41920]", text: "text-white", shape: "▲", light: "bg-red-100 text-red-600" },
  { bg: "bg-[#3B82F6]", hover: "hover:bg-[#2563eb]", text: "text-white", shape: "◆", light: "bg-blue-100 text-blue-600" },
  { bg: "bg-[#F59E0B]", hover: "hover:bg-[#d97706]", text: "text-white", shape: "●", light: "bg-amber-100 text-amber-600" },
  { bg: "bg-[#10B981]", hover: "hover:bg-[#059669]", text: "text-white", shape: "■", light: "bg-emerald-100 text-emerald-600" },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#E31E24", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
  const color = colors[index % colors.length];
  const left = `${(index * 37) % 100}%`;
  const delay = `${(index * 0.15) % 2}s`;
  const size = 8 + (index % 8);
  return (
    <div
      className="absolute top-0 animate-bounce"
      style={{ left, animationDelay: delay, animationDuration: `${0.8 + (index % 5) * 0.2}s` }}
    >
      <div
        className="rounded-sm opacity-80"
        style={{ width: size, height: size, backgroundColor: color, transform: `rotate(${index * 30}deg)` }}
      />
    </div>
  );
}

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goToNextQuestion = useCallback(() => {
    clearTimer();
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setPhase("quiz");
      } else {
        setPhase("result");
      }
    }, 1800);
  }, [currentIndex, questions.length]);

  // Countdown 3-2-1
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setPhase("quiz");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Quiz timer
  useEffect(() => {
    if (phase !== "quiz" || !currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit);
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // Time's up — record null answer
          setAnswers((prev) => {
            const next = [...prev];
            next[currentIndex] = null;
            return next;
          });
          setPhase("answer");
          goToNextQuestion();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [phase, currentIndex, currentQuestion]);

  const handleAnswer = (idx: number) => {
    if (phase !== "quiz" || selectedAnswer !== null) return;
    clearTimer();
    setSelectedAnswer(idx);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
    const isCorrect = idx === currentQuestion.correct;
    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 500);
      setScore((s) => s + 500 + timeBonus);
      setCorrectCount((c) => c + 1);
    }
    setPhase("answer");
    goToNextQuestion();
  };

  const startQuiz = () => {
    if (!playerName.trim()) {
      setNameError("Masukkan nama kamu dulu ya!");
      return;
    }
    setNameError("");
    const shuffled = shuffleArray(quizQuestions);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setPhase("countdown");
  };

  const resetQuiz = () => {
    setPhase("lobby");
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setAnswers([]);
  };

  const timerPct = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 0;
  const timerColor = timerPct > 50 ? "bg-emerald-500" : timerPct > 25 ? "bg-amber-400" : "bg-red-500";

  // ── LOBBY ──────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#102A4C] via-[#1a3a60] to-[#0a1a30] flex flex-col">
        {/* Back */}
        <div className="p-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Zap size={12} /> Quiz Puncak Acara
              </div>
              <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-3 leading-tight">
                HUT RI ke-81 Quiz Challenge
              </h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Uji pengetahuanmu tentang kemerdekaan Indonesia! {quizQuestions.length} soal menanti kamu.
              </p>
            </div>

            {/* Info Pills */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: "📝", label: "Soal", value: `${quizQuestions.length}` },
                { icon: "⏱️", label: "Per soal", value: "20 dtk" },
                { icon: "⭐", label: "Poin maks", value: "1.000" },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-white font-bold text-sm">{item.value}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Name Input */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-4">
              <label className="block text-white font-semibold text-sm mb-3">
                👤 Nama kamu:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setNameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && startQuiz()}
                placeholder="Masukkan nama kamu..."
                maxLength={30}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/40 font-medium text-base focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
              />
              {nameError && (
                <p className="text-red-400 text-xs mt-2 font-medium">{nameError}</p>
              )}
            </div>

            <button
              onClick={startQuiz}
              className="w-full bg-primary hover:bg-primary-dark text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 uppercase tracking-widest"
            >
              🚀 Mulai Quiz!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COUNTDOWN ──────────────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#102A4C] via-[#1a3a60] to-[#0a1a30] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-bold uppercase tracking-widest text-sm mb-6">Bersiap...</p>
          <div
            key={countdown}
            className="text-[10rem] font-black text-white leading-none animate-ping"
            style={{ animationDuration: "0.8s", animationIterationCount: 1 }}
          >
            {countdown}
          </div>
          <p className="text-white font-bold mt-6 text-lg">Semangat, {playerName}! 💪</p>
        </div>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = Math.round((correctCount / questions.length) * 100);
    const grade =
      pct === 100 ? { label: "Sempurna! 🏆", color: "text-yellow-400" }
      : pct >= 80 ? { label: "Luar Biasa! 🌟", color: "text-emerald-400" }
      : pct >= 60 ? { label: "Bagus! 👍", color: "text-blue-400" }
      : pct >= 40 ? { label: "Lumayan! 😊", color: "text-amber-400" }
      : { label: "Terus Belajar! 💪", color: "text-red-400" };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#102A4C] via-[#1a3a60] to-[#0a1a30] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Score card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6 text-center">
            <div className="text-5xl mb-4">🎊</div>
            <p className="text-white/70 font-semibold text-sm mb-1">Hasil Quiz — {playerName}</p>
            <h2 className={clsx("font-black text-3xl mb-6", grade.color)}>{grade.label}</h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-black text-white mb-1">{score.toLocaleString()}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest">Total Poin</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
                <div className="text-white/60 text-xs mt-1">Jawaban Benar</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-red-400">{questions.length - correctCount}</div>
                <div className="text-white/60 text-xs mt-1">Jawaban Salah</div>
              </div>
            </div>
          </div>

          {/* Answer review */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 mb-6">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Rekap Jawaban</p>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = ans === q.correct;
                const isNull = ans === null || ans === undefined;
                return (
                  <div
                    key={i}
                    className={clsx(
                      "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-black",
                      isNull ? "bg-white/10 text-white/30" :
                      isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    )}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetQuiz}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              <RotateCcw size={16} /> Main Lagi
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              <Home size={16} /> Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ / ANSWER ──────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#102A4C] via-[#1a3a60] to-[#0a1a30] flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <Star size={12} className="text-yellow-400" />
            <span className="text-white font-bold text-sm">{score.toLocaleString()}</span>
          </div>
          <span className="text-white/50 text-xs font-medium">{playerName}</span>
        </div>
        <div className="text-white/50 text-xs font-medium">
          Soal {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 mx-4 rounded-full mb-4">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Timer */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className={clsx(timerPct <= 25 ? "text-red-400 animate-pulse" : "text-white/50")} />
            <span className={clsx("text-sm font-black", timerPct <= 25 ? "text-red-400" : "text-white")}>{timeLeft}s</span>
          </div>
          <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">{currentQuestion.category}</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={clsx("h-3 rounded-full transition-all duration-1000 linear", timerColor)}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-4 mb-6 flex-1 flex flex-col">
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 mb-5 text-center flex-none">
          <div className="text-3xl mb-3">{currentQuestion.emoji}</div>
          <h2 className="text-white font-black text-lg md:text-xl leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const color = ANSWER_COLORS[idx];
            const isSelected = selectedAnswer === idx;
            const isCorrect = phase === "answer" && idx === currentQuestion.correct;
            const isWrong = phase === "answer" && isSelected && idx !== currentQuestion.correct;

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={phase === "answer"}
                className={clsx(
                  "relative flex items-center gap-3 p-4 md:p-5 rounded-2xl font-bold text-left text-sm md:text-base transition-all duration-200 border-2 active:scale-95",
                  phase === "answer"
                    ? isCorrect
                      ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-xl shadow-emerald-500/30"
                      : isWrong
                      ? "bg-red-600 border-red-500 text-white opacity-80"
                      : "opacity-40 border-white/10 bg-white/5 text-white/50"
                    : clsx(color.bg, color.hover, color.text, "border-transparent hover:scale-[1.02] hover:shadow-xl active:scale-95")
                )}
              >
                <span className={clsx(
                  "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black",
                  phase === "answer" ? "bg-white/20" : "bg-white/20"
                )}>
                  {color.shape}
                </span>
                <span className="leading-tight">{option}</span>
                {isCorrect && (
                  <span className="ml-auto text-white font-black text-xl">✓</span>
                )}
                {isWrong && (
                  <span className="ml-auto text-white font-black text-xl">✗</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
