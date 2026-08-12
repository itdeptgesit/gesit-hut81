"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, ArrowRight, Undo2, Users, Loader2, Lock, ShieldCheck, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Participant } from "@/types";
import { supabase } from "@/lib/supabase";

type Team = "A" | "B";

interface GameState {
  scoreA: number;
  scoreB: number;
  serving: Team;
}

export default function BadmintonScoreCounter() {
  // ─── Auth ───
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wasitName, setWasitName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setPinError(false);
    try {
      const res = await fetch("/api/judges/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = await res.json();
        setWasitName(data.judge.name);
        setIsAuthenticated(true);
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    }
    setLoginLoading(false);
  };

  const [teamAName, setTeamAName] = useState("Tim A");
  const [teamBName, setTeamBName] = useState("Tim B");

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [setsWonA, setSetsWonA] = useState(0);
  const [setsWonB, setSetsWonB] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [serving, setServing] = useState<Team>("A");
  
  const [history, setHistory] = useState<GameState[]>([]);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Setup Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantA, setParticipantA] = useState<Participant | null>(null);
  const [participantB, setParticipantB] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Single Putra");
  const [selectedMatch, setSelectedMatch] = useState("SF1");

  useEffect(() => {
    if (isSetup) {
      setIsLoading(true);
      fetch("/api/participants")
        .then((res) => res.json())
        .then((data) => {
          if (data.participants) {
            setParticipants(data.participants.filter((p: Participant) => p.event.toLowerCase().includes("badminton")));
          }
        })
        .catch((err) => console.error("Error fetching participants:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isSetup]);

  const getParticipantName = (p: Participant | undefined) => {
    if (!p) return "TBD";
    if (p.category === "Ganda Campuran") {
      const name1 = p.call_name || p.name.split(" ")[0];
      const name2 = p.partner && p.partner !== "-" ? p.partner.split(" ")[0] : "Partner";
      return `${name1} & ${name2}`;
    }
    return p.call_name || p.name.split(" ").slice(0, 2).join(" ");
  };

  // Auto-detect the next match to play based on bracket state
  useEffect(() => {
    if (!participants.length) return;

    const catParticipants = participants.filter((p) => p.category === selectedCategory);
    const hasFinalistL = catParticipants.some((p) => p.final_position === "L");
    const hasFinalistR = catParticipants.some((p) => p.final_position === "R");

    if (hasFinalistL && hasFinalistR) {
      // Both semi finals done → go straight to Grand Final
      setSelectedMatch("F");
    } else if (hasFinalistL && !hasFinalistR) {
      // SF1 winner decided → play SF2 next
      setSelectedMatch("SF2");
    } else {
      // Default: start with SF1
      setSelectedMatch("SF1");
    }
  }, [selectedCategory, participants]);

  // Resolve team names from current selection
  useEffect(() => {
    if (!participants.length) return;

    let pA: Participant | undefined;
    let pB: Participant | undefined;

    if (selectedMatch === "SF1") {
      pA = participants.find((p) => p.category === selectedCategory && p.bracket_position === "1");
      pB = participants.find((p) => p.category === selectedCategory && p.bracket_position === "2");
    } else if (selectedMatch === "SF2") {
      pA = participants.find((p) => p.category === selectedCategory && p.bracket_position === "3");
      pB = participants.find((p) => p.category === selectedCategory && p.bracket_position === "4");
    } else if (selectedMatch === "F") {
      pA = participants.find((p) => p.category === selectedCategory && p.final_position === "L");
      pB = participants.find((p) => p.category === selectedCategory && p.final_position === "R");
    }

    setParticipantA(pA || null);
    setParticipantB(pB || null);
    setTeamAName(getParticipantName(pA));
    setTeamBName(getParticipantName(pB));
  }, [selectedCategory, selectedMatch, participants]);


  // Update Bracket API
  const updateBracketFinalist = async (participantId: string, position: "L" | "R") => {
    try {
      const p = participants.find(x => x.id === participantId);
      if (!p) return;
      await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          name: p.name,
          call_name: p.call_name,
          bracket_position: p.bracket_position,
          final_position: position
        })
      });
    } catch (error) {
      console.error("Gagal update bagan otomatis", error);
    }
  };

  // ─── Live Score Sync ───
  const pushLiveScore = async (overrides: {
    scoreA?: number; scoreB?: number;
    setsWonA?: number; setsWonB?: number;
    currentSet?: number; serving?: string;
    status?: string;
  } = {}) => {
    try {
      await supabase.from("badminton_live_score").upsert({
        id: "current",
        category: selectedCategory,
        match_type: selectedMatch,
        team_a_name: teamAName,
        team_b_name: teamBName,
        score_a: overrides.scoreA ?? scoreA,
        score_b: overrides.scoreB ?? scoreB,
        sets_won_a: overrides.setsWonA ?? setsWonA,
        sets_won_b: overrides.setsWonB ?? setsWonB,
        current_set: overrides.currentSet ?? currentSet,
        serving: overrides.serving ?? serving,
        status: overrides.status ?? "playing",
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Gagal push live score:", err);
    }
  };

  // Calculate if a game is won based on badminton rules
  const checkGameWinner = (scoreA: number, scoreB: number) => {
    if (scoreA >= 21 || scoreB >= 21) {
      // Normal win
      if (scoreA >= 21 && scoreA - scoreB >= 2) return "A";
      if (scoreB >= 21 && scoreB - scoreA >= 2) return "B";
      // Max points win (30)
      if (scoreA === 30) return "A";
      if (scoreB === 30) return "B";
    }
    return null;
  };

  const addPoint = (team: Team) => {
    if (isMatchOver) return;

    // Save history for undo
    setHistory([...history, { scoreA, scoreB, serving }]);

    let newScoreA = scoreA;
    let newScoreB = scoreB;

    const newServing: Team = team === "A" ? "A" : "B";

    if (team === "A") {
      newScoreA++;
      setScoreA(newScoreA);
      setServing("A");
    } else {
      newScoreB++;
      setScoreB(newScoreB);
      setServing("B");
    }

    const winner = checkGameWinner(newScoreA, newScoreB);
    if (winner) {
      handleSetWin(winner, newScoreA, newScoreB);
    } else {
      // push live score after updating
      pushLiveScore({ scoreA: newScoreA, scoreB: newScoreB, serving: newServing });
    }
  };

  const handleSetWin = (winner: Team, finalScoreA?: number, finalScoreB?: number) => {
    let newSetsA = setsWonA;
    let newSetsB = setsWonB;

    if (winner === "A") {
      newSetsA++;
      setSetsWonA(newSetsA);
    } else {
      newSetsB++;
      setSetsWonB(newSetsB);
    }

    const matchOver = newSetsA === 2 || newSetsB === 2;
    if (matchOver) {
      setIsMatchOver(true);
      // Auto update bracket if Semi Final
      if (selectedMatch === "SF1") {
        const winnerP = newSetsA === 2 ? participantA : participantB;
        if (winnerP?.id) updateBracketFinalist(winnerP.id, "L");
      } else if (selectedMatch === "SF2") {
        const winnerP = newSetsA === 2 ? participantA : participantB;
        if (winnerP?.id) updateBracketFinalist(winnerP.id, "R");
      }
    }

    pushLiveScore({
      scoreA: finalScoreA,
      scoreB: finalScoreB,
      setsWonA: newSetsA,
      setsWonB: newSetsB,
      serving: winner,
      status: matchOver ? "match_over" : "set_over",
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    
    // If the match was just won in the last point, we need to revert the set win
    const winner = checkGameWinner(scoreA, scoreB);
    if (winner) {
      setIsMatchOver(false);
      if (winner === "A") setSetsWonA(setsWonA - 1);
      if (winner === "B") setSetsWonB(setsWonB - 1);
      
      // Revert bracket auto-update if it was a Semi Final
      if (setsWonA === 2 || setsWonB === 2) {
        const winnerP = setsWonA === 2 ? participantA : participantB;
        if (winnerP?.id && (selectedMatch === "SF1" || selectedMatch === "SF2")) {
          // Clear final position
          updateBracketFinalist(winnerP.id, null as any);
        }
      }
    }

    const lastState = history[history.length - 1];
    setScoreA(lastState.scoreA);
    setScoreB(lastState.scoreB);
    setServing(lastState.serving);
    setHistory(history.slice(0, -1));
    pushLiveScore({ scoreA: lastState.scoreA, scoreB: lastState.scoreB, serving: lastState.serving, status: "playing" });
  };

  const nextSet = () => {
    if (currentSet < 3 && !isMatchOver) {
      const newSet = currentSet + 1;
      const lastWinner = setsWonA > setsWonB ? "A" : "B";
      setCurrentSet(newSet);
      setScoreA(0);
      setScoreB(0);
      setHistory([]);
      setServing(lastWinner);
      pushLiveScore({ scoreA: 0, scoreB: 0, currentSet: newSet, serving: lastWinner, status: "playing" });
    }
  };

  const resetMatch = () => {
    setShowResetConfirm(true);
  };

  const doReset = () => {
    setScoreA(0);
    setScoreB(0);
    setSetsWonA(0);
    setSetsWonB(0);
    setCurrentSet(1);
    setServing("A");
    setHistory([]);
    setIsMatchOver(false);
    setShowResetConfirm(false);
    setIsSetup(true);
    // Push idle state to clear live scoreboard
    supabase.from("badminton_live_score").upsert({
      id: "current",
      status: "idle",
      score_a: 0, score_b: 0,
      sets_won_a: 0, sets_won_b: 0,
      current_set: 1,
      team_a_name: "-", team_b_name: "-",
      updated_at: new Date().toISOString(),
    }).then(() => {});
  };

  const gameWinner = checkGameWinner(scoreA, scoreB);

  // ─── Auth Gate ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Portal Wasit</h1>
          <p className="text-sm text-slate-400 mb-8">Badminton Score Counter</p>
          <p className="text-xs text-slate-500 mb-6">Masukkan PIN yang diberikan Admin untuk mengakses halaman ini.</p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              inputMode="numeric"
              placeholder="● ● ● ●"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              className={`w-full text-center text-3xl font-black tracking-[0.3em] bg-slate-700 border ${
                pinError ? "border-red-500 text-red-400" : "border-slate-600 text-white"
              } rounded-2xl p-4 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/30 placeholder-slate-600`}
            />
            {pinError && (
              <p className="text-red-400 text-xs font-bold mb-4">PIN salah. Hubungi Admin.</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !pin}
              className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-lg shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 className="animate-spin" size={22} /> : <><ShieldCheck size={20} /><span>Masuk</span></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Users size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Setup Pertandingan</h1>
          </div>
          
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Kategori</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
              >
                <option value="Single Putra">Single Putra</option>
                <option value="Single Putri">Single Putri</option>
                <option value="Ganda Campuran">Ganda Campuran</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Pertandingan</label>
              <select 
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
              >
                <option value="SF1">Semi Final 1 (Slot 1 vs 2)</option>
                <option value="SF2">Semi Final 2 (Slot 3 vs 4)</option>
                <option value="F">Grand Final</option>
              </select>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center relative">
               {isLoading && (
                 <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                    <Loader2 className="animate-spin text-slate-400" />
                 </div>
               )}
               <div className="text-center w-[45%]">
                 <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Tim A</p>
                 <p className="font-bold text-red-600 truncate">{teamAName}</p>
               </div>
               <div className="text-sm font-black text-slate-300 italic">VS</div>
               <div className="text-center w-[45%]">
                 <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Tim B</p>
                 <p className="font-bold text-blue-600 truncate">{teamBName}</p>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsSetup(false);
              // Push initial "playing" state to Supabase
              supabase.from("badminton_live_score").upsert({
                id: "current",
                category: selectedCategory,
                match_type: selectedMatch,
                team_a_name: teamAName,
                team_b_name: teamBName,
                score_a: 0, score_b: 0,
                sets_won_a: 0, sets_won_b: 0,
                current_set: 1,
                serving: "A",
                status: "playing",
                updated_at: new Date().toISOString(),
              }).then(() => {});
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Mulai Pertandingan
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 px-4 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold text-xl">🏸</span>
          <div>
            <span className="text-white font-bold text-base leading-none block">Badminton</span>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Wasit: {wasitName.split(" ")[0]}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="bg-slate-700 px-3 py-1 rounded-full text-slate-300">Set {currentSet}</div>
          <button onClick={resetMatch} className="text-slate-400 hover:text-white transition-colors" title="Pertandingan Baru">
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Score Area */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Team A */}
        <div className="flex-1 flex flex-col relative border-b md:border-b-0 md:border-r border-slate-700">
          <div className={`p-4 text-center transition-colors ${serving === "A" ? "bg-red-900/30" : ""}`}>
            <h2 className="text-2xl font-bold truncate px-4">{teamAName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-slate-400 text-sm">Set Won:</span>
              <div className="flex gap-1">
                {[1, 2].map((i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i <= setsWonA ? "bg-red-500" : "bg-slate-700"}`} />
                ))}
              </div>
            </div>
            {serving === "A" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Serve
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={() => addPoint("A")}
            disabled={!!gameWinner || isMatchOver}
            className="flex-1 flex items-center justify-center text-[12rem] md:text-[18rem] font-bold leading-none hover:bg-slate-800/50 transition-colors active:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent touch-manipulation select-none"
          >
            {scoreA}
          </button>
        </div>

        {/* Team B */}
        <div className="flex-1 flex flex-col relative">
          <div className={`p-4 text-center transition-colors ${serving === "B" ? "bg-blue-900/30" : ""}`}>
            <h2 className="text-2xl font-bold truncate px-4">{teamBName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-slate-400 text-sm">Set Won:</span>
              <div className="flex gap-1">
                {[1, 2].map((i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i <= setsWonB ? "bg-blue-500" : "bg-slate-700"}`} />
                ))}
              </div>
            </div>
            {serving === "B" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Serve
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={() => addPoint("B")}
            disabled={!!gameWinner || isMatchOver}
            className="flex-1 flex items-center justify-center text-[12rem] md:text-[18rem] font-bold leading-none hover:bg-slate-800/50 transition-colors active:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent touch-manipulation select-none"
          >
            {scoreB}
          </button>
        </div>

        {/* Center Controls (Mobile bottom, Desktop center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          <button 
            onClick={undo}
            disabled={history.length === 0}
            className="bg-slate-700 text-white p-4 rounded-full shadow-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Undo Point"
          >
            <Undo2 size={24} />
          </button>
        </div>
      </main>

      {/* Game Over / Next Set Overlay */}
      <AnimatePresence>
        {(gameWinner || isMatchOver) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-2">
                {isMatchOver ? "Pertandingan Selesai!" : `Set ${currentSet} Selesai!`}
              </h3>
              <p className="text-slate-600 mb-6 text-lg">
                Pemenang: <span className="font-bold text-slate-900">{gameWinner === "A" ? teamAName : teamBName}</span>
              </p>
              
              {!isMatchOver ? (
                <button 
                  onClick={nextSet}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Lanjut Set {currentSet + 1}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-100 p-4 rounded-xl mb-4">
                    <p className="text-sm text-slate-500 mb-1">Skor Akhir</p>
                    <p className="font-bold text-2xl">{setsWonA} - {setsWonB}</p>
                  </div>
                  <button 
                    onClick={resetMatch}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Pertandingan Baru
                  </button>
                </div>
              )}
              
              <button 
                onClick={undo}
                className="w-full mt-3 text-slate-500 hover:text-slate-700 font-medium py-2 transition-colors"
              >
                Koreksi (Undo) Poin Terakhir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
                <RotateCcw size={28} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Pertandingan Baru?</h3>
              <p className="text-slate-400 text-sm mb-8">Semua skor dan set saat ini akan direset. Aksi ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={doReset}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-600/20"
                >
                  Ya, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
