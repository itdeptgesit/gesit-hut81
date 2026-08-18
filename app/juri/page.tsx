"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, Lock, X, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GroupScore {
  id: string;
  group_name: string;
  score: number;
}

interface ScoreLogEntry {
  id: string;
  time: string;
  competition: string;
  groupName: string;
  judgeName: string;
  value: number;
}

// "manual" type = free input, "buttons" type = quick-tap preset
const GAME_CONFIGS: Record<string, {
  max: number;
  criteria: string[];
  type: "buttons" | "manual";
  buttons?: { label: string; value: number | "reset" }[];
}> = {
  "Perform Yel-Yel": {
    max: 10, type: "buttons",
    criteria: ["Kreativitas & gerakan", "Kekompakan", "Semangat, Vocal, & Intonasi"],
    buttons: [{ label: "Reset", value: "reset" }, { label: "Cukup", value: 5 }, { label: "Baik", value: 8 }, { label: "Sempurna", value: 10 }]
  },
  "Fun Games - Quiz Challenge": {
    max: 30, type: "buttons",
    criteria: ["Wawasan & Pengetahuan", "Kecepatan berpikir, Komunikasi tim"],
    buttons: [{ label: "Reset", value: "reset" }, { label: "Cukup", value: 10 }, { label: "Baik", value: 20 }, { label: "Sempurna", value: 30 }]
  },
  "Fun Games - Word Puzzle": {
    max: 20, type: "buttons",
    criteria: ["Pemahaman value Gesit", "Kerjasama tim", "Kekompakan Tim"],
    buttons: [{ label: "Reset", value: "reset" }, { label: "Benar 1", value: 5 }, { label: "Benar 2", value: 10 }, { label: "Benar 3", value: 20 }]
  },
  "Fun Games - Estafet Sedotan": {
    max: 30, type: "buttons",
    criteria: ["Teamwork", "Koordinasi", "Fokus & Kecepatan"],
    buttons: [{ label: "Reset", value: "reset" }, { label: "Cukup", value: 10 }, { label: "Baik", value: 20 }, { label: "Sempurna", value: 30 }]
  },
  "Fun Games - Cup Rush": {
    max: 10, type: "buttons",
    criteria: ["Kecepatan Reaksi", "Fokus & Konsentrasi", "Strategi & Antisipasi"],
    buttons: [{ label: "Reset", value: "reset" }, { label: "Cukup", value: 5 }, { label: "Baik", value: 8 }, { label: "Sempurna", value: 10 }]
  },
  "Best Costume": {
    max: 100, type: "manual",
    criteria: ["Penilaian Bebas – Pilih 1 Pemenang, maks. 100 poin"]
  },
  "Potluck - Pesta Rasa Merah Putih": {
    max: 100, type: "manual",
    criteria: ["Penilaian Bebas – Pilih 1 Pemenang, maks. 100 poin"]
  }
};

const FUN_GAMES = ["Perform Yel-Yel", "Fun Games - Quiz Challenge", "Fun Games - Word Puzzle", "Fun Games - Estafet Sedotan", "Fun Games - Cup Rush"];
const SPECIAL_GAMES = ["Best Costume", "Potluck - Pesta Rasa Merah Putih"];

// Mapping nama juri -> daftar lomba (kini dikelola lewat Admin / settings db)

const WORD_PUZZLE_ANSWERS = [
  { amplop: "1", theme: "Integrity", words: ["Honest", "Fair", "Firm"] },
  { amplop: "5", theme: "Integrity", words: ["Moral", "Ethical", "Reliable"] },
  { amplop: "2", theme: "Respect", words: ["Understand", "Dignity", "Listen"] },
  { amplop: "6", theme: "Respect", words: ["Polite", "Kind", "Value"] },
  { amplop: "3", theme: "Competent", words: ["Leadership", "Problem Solving", "Communication"] },
  { amplop: "7", theme: "Competent", words: ["Efficient", "Effective", "Technical"] },
  { amplop: "4", theme: "Passion", words: ["Engaged", "Contribute", "Aspired"] },
  { amplop: "8", theme: "Passion", words: ["Satisfaction", "Heart", "Soul"] },
];


type LogColor = "emerald" | "amber" | "purple";

const LOG_COLOR_MAP: Record<LogColor, { badge: string; del: string }> = {
  emerald: { badge: "text-emerald-600 bg-emerald-50", del: "text-emerald-400 hover:text-red-500 hover:bg-red-50" },
  amber:   { badge: "text-amber-600 bg-amber-50",     del: "text-amber-400 hover:text-red-500 hover:bg-red-50" },
  purple:  { badge: "text-purple-600 bg-purple-50",   del: "text-purple-400 hover:text-red-500 hover:bg-red-50" },
};

function LogRow({ entry, color, onDelete }: { entry: ScoreLogEntry; color: LogColor; onDelete: () => void }) {
  const c = LOG_COLOR_MAP[color];
  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-zinc-50/80 group">
      <div className="min-w-0">
        <p className="text-xs font-black text-zinc-900 truncate">{entry.groupName}</p>
        <p className="text-[10px] text-zinc-400 truncate">
          {entry.competition !== entry.groupName ? `${entry.competition} · ` : ""}{entry.time}
          {entry.judgeName && entry.judgeName !== "—" && (
            <span className="ml-1 text-[10px] font-semibold text-zinc-500">· 👤 {entry.judgeName}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`font-black text-sm px-2 py-0.5 rounded-lg ${c.badge}`}>
          {entry.value > 0 ? `+${entry.value}` : entry.value}
        </span>
        <button
          onClick={onDelete}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${c.del}`}
          title="Reset entri ini"
        >
          <X size={11} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export default function JudgePortal() {
  const [groups, setGroups] = useState<GroupScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [judgeId, setJudgeId] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [competitionTitle, setCompetitionTitle] = useState("Fun Games");
  const [prevTitle, setPrevTitle] = useState("");
  const [judgeAccessMap, setJudgeAccessMap] = useState<Record<string, string[]>>({});
  const [sessionScores, setSessionScores] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string>>({});
  const [scoreLog, setScoreLog] = useState<ScoreLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const fetchScoreLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const res = await fetch("/api/score-logs?limit=200");
      if (res.ok) {
        const data = await res.json();
        setScoreLog(data.map((d: { id: string; created_at: string; competition: string; group_name: string; judge_name: string; value: number }) => ({
          id: d.id,
          time: new Date(d.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          competition: d.competition,
          groupName: d.group_name,
          judgeName: d.judge_name || "—",
          value: d.value
        })));
      }
    } catch {}
    setLogLoading(false);
  }, []);

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase
      .from("group_scores")
      .select("*")
      .order("group_name", { ascending: true });
    if (data) setGroups(data as GroupScore[]);
    setLoading(false);
  }, []);

  const fetchTitle = useCallback(async () => {
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["competition_title", "judge_access_map"]);

    if (data) {
      const title = data.find(d => d.key === "competition_title")?.value;
      if (title) {
        setCompetitionTitle(prev => {
          if (prev !== "" && prev !== title) {
            setPrevTitle(title);
            setSessionScores({});
            setManualInputs({});
          }
          return title;
        });
      }

      const accessMapStr = data.find(d => d.key === "judge_access_map")?.value;
      if (accessMapStr) {
        try {
          setJudgeAccessMap(JSON.parse(accessMapStr));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchTitle();
    fetchScoreLog();
    const channel1 = supabase
      .channel("juri:group_scores")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_scores" }, fetchGroups)
      .subscribe();
    const titlePoll = setInterval(fetchTitle, 5000);
    return () => {
      supabase.removeChannel(channel1);
      clearInterval(titlePoll);
    };
  }, [fetchGroups, fetchTitle, fetchScoreLog]);

  const handleScoreUpdate = async (id: string, diff: number | "reset", groupName: string) => {
    if (diff === "reset") {
      const currentSessionScore = sessionScores[id] || 0;
      if (currentSessionScore === 0) return; // Nothing to reset

      setUpdatingId(id);
      setSessionScores(prev => ({ ...prev, [id]: 0 }));

      // Save to DB log
      fetch("/api/score-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competition: competitionTitle, group_id: id, group_name: groupName, judge_name: judgeName, value: -currentSessionScore })
      }).then(() => fetchScoreLog()).catch(() => {});

      try {
        const res = await fetch("/api/admin/group-scores", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, increment: -currentSessionScore }),
        });
        if (!res.ok) await fetchGroups();
      } catch {
        await fetchGroups();
      }
      setUpdatingId(null);
      return;
    }

    setUpdatingId(id);
    setSessionScores(prev => ({ ...prev, [id]: (prev[id] ?? 0) + diff }));

    // Save to DB log (only for positive values)
    if (diff > 0) {
      fetch("/api/score-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competition: competitionTitle, group_id: id, group_name: groupName, judge_name: judgeName, value: diff })
      }).then(() => fetchScoreLog()).catch(() => {});
    }

    try {
      const res = await fetch("/api/admin/group-scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, increment: diff }),
      });
      if (!res.ok) await fetchGroups();
    } catch {
      await fetchGroups();
    }
    setUpdatingId(null);
  };

  const handleManualSubmit = (group: GroupScore) => {
    const raw = manualInputs[group.id] || "";
    const val = parseInt(raw);
    if (isNaN(val) || val <= 0) {
      setErrorPopup("Masukkan nilai yang valid (angka lebih dari 0).");
      return;
    }
    if (val > 100) {
      setErrorPopup(`Nilai maksimal untuk ${competitionTitle} adalah 100 poin!`);
      return;
    }
    handleScoreUpdate(group.id, val, group.group_name);
    setManualInputs(prev => ({ ...prev, [group.id]: "" }));
  };

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
        setJudgeId(data.judge.id);
        setJudgeName(data.judge.name);
        setIsAuthenticated(true);
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    }
    setLoginLoading(false);
  };

  const config = GAME_CONFIGS[competitionTitle];
  const isSpecial = SPECIAL_GAMES.includes(competitionTitle);
  const isFunGame = FUN_GAMES.includes(competitionTitle);
  
  const hasAccess = (() => {
    if (!judgeId) return true;
    const allowed = judgeAccessMap[judgeId];
    if (!allowed || allowed.length === 0) return true;
    return allowed.includes(competitionTitle);
  })();

  const funGameLog = scoreLog.filter(e => FUN_GAMES.includes(e.competition));
  const bestCostumeLog = scoreLog.filter(e => e.competition === "Best Costume");
  const potluckLog = scoreLog.filter(e => e.competition === "Potluck - Pesta Rasa Merah Putih");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #102A4C 50%, #1a3a6e 100%)" }}
      >
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #E31E24, transparent)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FFD700, transparent)" }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/20 shadow-2xl">
              <Image src="/gesit_logo.png" alt="GESIT" width={48} height={48} className="w-12 h-12 object-contain" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-1">HUT RI ke-81 · GESIT</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Portal Juri</h1>
            <p className="text-white/40 text-sm mt-1">Masukkan PIN untuk mengakses penilaian</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-7 border border-white/20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2.5">PIN Juri</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="● ● ● ●"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  autoFocus
                  className={`w-full text-center text-3xl font-black tracking-[0.5em] rounded-2xl py-4 focus:outline-none transition-all bg-white/10 border-2 text-white placeholder-white/20 ${
                    pinError ? "border-red-400 bg-red-500/10" : "border-white/20 focus:border-white/50"
                  }`}
                />
                <AnimatePresence>
                  {pinError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs font-bold mt-2.5 text-center">❌ PIN salah. Coba lagi.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button type="submit" disabled={loginLoading || !pin}
                className="w-full bg-[#E31E24] hover:bg-red-600 disabled:opacity-40 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-900/40 transition-all uppercase tracking-widest active:scale-95">
                {loginLoading ? <Loader2 className="animate-spin mx-auto" size={22} /> : "Masuk →"}
              </button>
            </form>
          </div>
          <p className="text-center text-white/20 text-xs mt-5">GESIT · HUT RI 81 · Fun Games Portal</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200/60 pb-10">
      {/* Header */}
      <header className="bg-[#102A4C] sticky top-0 z-50 shadow-lg shadow-[#102A4C]/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Image src="/gesit_logo.png" alt="Gesit" width={22} height={22} className="w-5.5 h-5.5 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Portal Juri</p>
              <p className="text-sm font-black text-white leading-tight">{judgeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config && (
              <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                isSpecial ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {isSpecial ? "Spesial" : "Fun Games"}
              </span>
            )}
            <button onClick={() => setShowLog(v => !v)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 font-bold text-xs transition-colors border border-white/10">
              <ClipboardList size={13} />
              <span>Riwayat</span>
              {scoreLog.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E31E24] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {scoreLog.length > 99 ? "99+" : scoreLog.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-3.5 mt-2">
        {/* Active competition banner */}
        <div className={`p-4 rounded-2xl border shadow-sm ${
          isSpecial
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
            : "bg-white border-zinc-200"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isSpecial ? "text-amber-500" : "text-[#E31E24]"}`}>
                {isSpecial ? "⭐ Penilaian Spesial" : "🎮 Sedang Berlangsung"}
              </p>
              <h2 className="text-[#102A4C] text-base font-black uppercase tracking-tight leading-tight mb-2">{competitionTitle}</h2>
              {config && (
                <div className="flex flex-wrap gap-1">
                  {config.criteria.map((c, i) => (
                    <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSpecial ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"
                    }`}>{c}</span>
                  ))}
                </div>
              )}
            </div>
            {config && (
              <div className={`shrink-0 text-center px-3 py-2 rounded-xl border ${isSpecial ? "bg-amber-100 border-amber-200" : "bg-zinc-50 border-zinc-200"}`}>
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Maks</p>
                <p className={`text-2xl font-black leading-none ${isSpecial ? "text-amber-600" : "text-[#102A4C]"}`}>{config.max}</p>
                <p className="text-[9px] font-bold text-zinc-400">Poin</p>
              </div>
            )}
          </div>
        </div>


        {/* Score Log Panel */}
        <AnimatePresence>
          {showLog && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.99 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-[#102A4C] flex items-center justify-between">
                <h3 className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-wide">
                  <ClipboardList size={15} /> Riwayat Nilai
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={fetchScoreLog} className="text-white/40 hover:text-white transition-colors p-1 rounded">
                    <Loader2 size={14} className={logLoading ? "animate-spin" : ""} />
                  </button>
                  <button onClick={() => setShowLog(false)} className="text-white/40 hover:text-white transition-colors p-1 rounded"><X size={15} /></button>
                </div>
              </div>

              {logLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-zinc-300" size={24} /></div>
              ) : scoreLog.length === 0 ? (
                <p className="text-center text-zinc-400 text-xs py-8 font-medium">Belum ada riwayat nilai.</p>
              ) : (
                <div className="divide-y divide-zinc-50 max-h-72 overflow-y-auto">
                  {funGameLog.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 sticky top-0">🎮 Fun Games</p>
                      {funGameLog.map((e) => (
                        <LogRow key={e.id} entry={e} color="emerald"
                          onDelete={async () => {
                            if (!confirm(`Reset nilai +${e.value} untuk ${e.groupName}? Skor akan dikurangi.`)) return;
                            await fetch(`/api/score-logs?id=${e.id}`, { method: "DELETE" });
                            fetchScoreLog();
                            fetchGroups();
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {bestCostumeLog.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 sticky top-0">👗 Best Costume</p>
                      {bestCostumeLog.map((e) => (
                        <LogRow key={e.id} entry={e} color="amber"
                          onDelete={async () => {
                            if (!confirm(`Reset nilai +${e.value} untuk ${e.groupName}? Skor akan dikurangi.`)) return;
                            await fetch(`/api/score-logs?id=${e.id}`, { method: "DELETE" });
                            fetchScoreLog();
                            fetchGroups();
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {potluckLog.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 sticky top-0">🍽️ Potluck</p>
                      {potluckLog.map((e) => (
                        <LogRow key={e.id} entry={e} color="purple"
                          onDelete={async () => {
                            if (!confirm(`Reset nilai +${e.value} untuk ${e.groupName}? Skor akan dikurangi.`)) return;
                            await fetch(`/api/score-logs?id=${e.id}`, { method: "DELETE" });
                            fetchScoreLog();
                            fetchGroups();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Cards */}
        {!hasAccess ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-zinc-400" size={30} />
            </div>
            <p className="text-zinc-900 font-black text-lg uppercase tracking-tight mb-1">Akses Terbatas</p>
            <p className="text-zinc-500 text-sm font-medium leading-snug">
              Anda tidak memiliki akses untuk menilai<br />
              <span className="font-bold text-[#102A4C]">{competitionTitle}</span>
            </p>
            <p className="text-zinc-400 text-xs mt-3">Silakan tunggu lomba yang sesuai dengan penugasan Anda.</p>
          </motion.div>
        ) : loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
        ) : (
          groups.map((group, idx) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white border border-zinc-200 rounded-3xl shadow-sm relative overflow-hidden">
              {/* Side accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSpecial ? "bg-gradient-to-b from-amber-300 to-amber-500" : "bg-gradient-to-b from-[#102A4C] to-[#1a4070]"}`} />

              {updatingId === group.id && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                  <Loader2 className="animate-spin text-[#E31E24]" size={28} />
                </div>
              )}

              <div className="p-5 pl-6">
                {/* Group Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${
                      isSpecial ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-[#102A4C]/8 text-[#102A4C] border-[#102A4C]/15"
                    }`}>{idx + 1}</div>
                    <div>
                      <h3 className="font-black text-zinc-900 text-xl uppercase tracking-tight leading-none">{group.group_name}</h3>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{competitionTitle}</span>
                    </div>
                  </div>
                  <div className={`text-right px-4 py-2 rounded-xl border ${isSpecial ? "bg-amber-50 border-amber-100" : "bg-zinc-50 border-zinc-100"}`}>
                    <span className={`block text-3xl font-black leading-none ${isSpecial ? "text-amber-600" : "text-[#E31E24]"}`}>
                      {(sessionScores[group.id] ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block">Poin Sesi</span>
                  </div>
                </div>

                {/* Word Puzzle Group specific Answer Key */}
                {competitionTitle === "Fun Games - Word Puzzle" && (() => {
                  const ans = WORD_PUZZLE_ANSWERS.find(a => a.amplop === String(idx + 1));
                  if (!ans) return null;
                  return (
                    <div className="mb-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black text-zinc-500 bg-white shadow-sm border border-zinc-200 px-1.5 py-0.5 rounded uppercase">
                          Amplop {ans.amplop} - Kunci Jawaban
                        </span>
                        <span className="text-[10px] font-black text-[#E31E24] uppercase tracking-wide">{ans.theme}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ans.words.map((w, wi) => (
                          <span key={wi} className="text-[11px] font-bold text-zinc-700 bg-white shadow-sm border border-zinc-200 px-2 py-1 rounded-md">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Manual input (Best Costume & Potluck) */}
                {isSpecial ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number" min="1" max="100"
                      placeholder="Isi nilai bebas (maks. 100)"
                      value={manualInputs[group.id] || ""}
                      onChange={e => setManualInputs(prev => ({ ...prev, [group.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleManualSubmit(group)}
                      className="flex-1 border-2 border-amber-200 bg-amber-50/60 rounded-xl px-3 py-3 text-center text-xl font-black text-amber-900 placeholder-amber-300/60 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button onClick={() => handleManualSubmit(group)}
                      disabled={updatingId === group.id || !manualInputs[group.id]}
                      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black px-5 py-3 rounded-xl shadow-md shadow-amber-200 transition-all active:scale-95 text-sm whitespace-nowrap">
                      Berikan ✓
                    </button>
                    <button onClick={() => handleScoreUpdate(group.id, "reset", group.group_name)}
                      disabled={updatingId === group.id || !sessionScores[group.id]}
                      className="bg-zinc-200 hover:bg-red-100 disabled:opacity-40 text-zinc-600 hover:text-red-600 font-black px-4 py-3 rounded-xl transition-all active:scale-95 text-sm whitespace-nowrap"
                      title="Reset poin sesi ini ke 0">
                      Reset
                    </button>
                  </div>
                ) : config ? (
                  /* Quick-tap buttons for Fun Games */
                  <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${config.buttons!.length}, 1fr)` }}>
                    {config.buttons!.map((btn, bi) => {
                      const isUndo = btn.value === "reset" || (typeof btn.value === "number" && btn.value < 0);
                      const isMax = btn.value === config.max;
                      return (
                        <button key={bi} onClick={() => handleScoreUpdate(group.id, btn.value, group.group_name)}
                          disabled={updatingId === group.id}
                          className={`font-black py-3 sm:py-4 rounded-xl transition-all flex flex-col items-center justify-center active:scale-95 border-2 ${
                            isUndo
                              ? "bg-red-50 hover:bg-red-100 text-[#E31E24] border-red-100"
                              : isMax
                              ? "bg-[#102A4C] hover:bg-[#102A4C]/90 text-white border-transparent shadow-md shadow-[#102A4C]/15"
                              : "bg-zinc-50 hover:bg-zinc-100 text-[#102A4C] border-zinc-200"
                          }`}>
                          <span className={`text-[10px] uppercase mb-0.5 ${isUndo ? "text-[#E31E24]/60" : isMax ? "text-white/60" : "text-[#102A4C]/50"}`}>
                            {btn.label}
                          </span>
                          <span className="text-sm sm:text-base leading-none">
                            {btn.value === "reset" ? "0" : ((btn.value as number) > 0 ? `+${btn.value}` : btn.value)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))
        )}

        {groups.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 shadow-sm">
            <Trophy className="text-zinc-200 mx-auto mb-4" size={52} />
            <p className="text-zinc-500 font-bold text-base">Belum ada kelompok</p>
            <p className="text-zinc-400 text-sm mt-1">Admin perlu menambahkan kelompok dari Dashboard.</p>
          </div>
        )}
      </main>

      {/* Error Popup */}
      <AnimatePresence>
        {errorPopup && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setErrorPopup(null)}>
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-[280px] w-full text-center border-4 border-[#E31E24]"
              onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="text-[#E31E24]" size={36} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2 leading-tight uppercase tracking-tight">Nilai Tidak Valid!</h3>
              <p className="text-zinc-500 font-bold text-sm mb-6 leading-snug">{errorPopup}</p>
              <button onClick={() => setErrorPopup(null)}
                className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">
                Mengerti
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

