"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LogOut, Users, Trophy, Monitor, RefreshCw,
  ExternalLink, Loader2, LayoutDashboard, Gamepad2,
  TrendingUp, Circle, Edit2, Plus, Trash2, X, Award, Download, Calendar, BookOpen, CheckCircle2, BarChart2, ClipboardList
} from "lucide-react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import Image from "next/image";

interface Participant {
  id: string;
  registration_id: string;
  created_at: string;
  name: string;
  floor: string;
  event: string;
  category?: string;
  partner?: string;
  status: string;
  call_name?: string;
  bracket_position?: string;
  final_position?: string;
}

interface QuizScore {
  id: string;
  created_at: string;
  name: string;
  score: number;
  pin: string;
}

interface Winner {
  id: string;
  event: string;
  category: string;
  position: string;
  name: string;
}

interface MatchSchedule {
  id: string;
  match_key: string;
  category: string;
  match_name: string;
  day: string;
  time: string;
  court: string;
  referee: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  timeLimit: number;
  category: string;
  emoji: string;
}

interface GroupScore {
  id: string;
  group_name: string;
  score: number;
  created_at?: string;
}

// ─── Reusable primitives ───

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" }) {
  const cls = {
    default: "bg-zinc-100 text-zinc-600 border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  }[variant];
  return <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls} uppercase tracking-wider`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-zinc-200 rounded-xl shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string | number; delta?: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600">{icon}</div>
        {delta && <Badge variant="success">+{delta}</Badge>}
      </div>
      <div className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </Card>
  );
}

function SlotBox({ slotNumber, type = "bracket", participants, category, onDrop, onRemove, selectedParticipantId, onTapSlot }: any) {
  const p = participants.find((x: any) => {
    if (x.category !== category) return false;
    if (type === "bracket") return x.bracket_position === slotNumber;
    
    if (x.final_position === slotNumber) return true;
    
    // If the slot is L or R, and the participant is the Winner (W), show them here too if they came from this side
    if (type === "final" && (slotNumber === "L" || slotNumber === "R") && x.final_position === "W") {
      if (slotNumber === "L" && (x.bracket_position === "1" || x.bracket_position === "2")) return true;
      if (slotNumber === "R" && (x.bracket_position === "3" || x.bracket_position === "4")) return true;
    }
    return false;
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const hasSelection = !!selectedParticipantId;

  const label = type === "final" ? (slotNumber === "W" ? "Champion" : `Final ${slotNumber}`) : `Slot ${slotNumber}`;

  const handleSlotClick = () => {
    if (hasSelection && !p) {
      // Mobile tap-to-place: place selected participant into this empty slot
      onTapSlot(selectedParticipantId, slotNumber, type);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, slotNumber, type); }}
      onClick={handleSlotClick}
      className={`relative w-full p-4 rounded-xl border-2 transition-all ${
        p 
          ? slotNumber === "W"
            ? "bg-yellow-900/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] border-solid"
            : type === "final" 
              ? "bg-red-900/40 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)] border-solid" 
              : "bg-zinc-800 border-zinc-700 border-solid shadow-md" 
          : isDragOver 
            ? slotNumber === "W"
              ? "bg-yellow-900/20 border-yellow-500 border-dashed"
              : type === "final"
                ? "bg-red-900/20 border-red-500 border-dashed"
                : "bg-zinc-700 border-zinc-400 border-dashed" 
            : hasSelection && !p
              ? slotNumber === "W"
                ? "bg-yellow-950 border-yellow-400 border-dashed cursor-pointer animate-pulse"
                : type === "final"
                  ? "bg-red-900/30 border-red-400 border-dashed cursor-pointer animate-pulse"
                  : "bg-blue-900/30 border-blue-400 border-dashed cursor-pointer animate-pulse"
              : slotNumber === "W"
                ? "bg-zinc-900/50 border-yellow-900/30 border-dashed hover:border-yellow-700"
                : type === "final"
                  ? "bg-zinc-900/50 border-red-900/30 border-dashed hover:border-red-700"
                  : "bg-zinc-800/50 border-zinc-700 border-dashed hover:border-zinc-500 hover:bg-zinc-800"
      }`}
    >
      <div className={`absolute -top-2.5 left-4 px-2 text-[10px] font-black tracking-widest uppercase ${
        slotNumber === "W"
          ? "bg-yellow-950 text-yellow-400"
          : type === "final"
            ? "bg-red-950 text-red-400"
            : "bg-zinc-900 text-zinc-500"
      }`}>
        {label}
      </div>
      
      {p ? (
        <div className="flex justify-between items-center group">
          <div className="min-w-0 pr-2">
            <div className={`font-bold text-sm truncate ${
              slotNumber === "W" ? "text-yellow-100" : type === "final" ? "text-red-100" : "text-white"
            }`}>
              {p.call_name || p.name.split(" ")[0]}
            </div>
            {p.partner && p.partner !== "-" && (
              <div className={`text-[10px] truncate ${
                slotNumber === "W" ? "text-yellow-300/80" : type === "final" ? "text-red-300" : "text-zinc-400"
              }`}>
                & {p.partner.split(" ")[0]}
              </div>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(p.id, type); }}
            className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shrink-0"
            title="Keluarkan dari bagan"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div className={`h-10 flex items-center justify-center text-xs font-medium ${
          hasSelection && !p
            ? slotNumber === "W" ? "text-yellow-400" : type === "final" ? "text-red-400" : "text-blue-400"
            : slotNumber === "W" ? "text-yellow-900/50" : type === "final" ? "text-red-900/50" : "text-zinc-500"
        }`}>
          {hasSelection && !p ? "Tap untuk tempatkan" : "Drag nama ke sini"}
        </div>
      )}
    </div>
  );
}

const ALL_COMPETITIONS = [
  "Perform Yel-Yel",
  "Fun Games - Quiz Challenge",
  "Fun Games - Word Puzzle",
  "Fun Games - Estafet Sedotan",
  "Fun Games - Cup Rush",
  "Best Costume",
  "Potluck - Pesta Rasa Merah Putih"
];

export default function AdminDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  
  // Data States
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [schedules, setSchedules] = useState<MatchSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  
  const [groupScores, setGroupScores] = useState<GroupScore[]>([]);
  const [groupScoresLoading, setGroupScoresLoading] = useState(true);
  const [editingGroupScore, setEditingGroupScore] = useState<GroupScore | null>(null);
  const [isNewGroupScore, setIsNewGroupScore] = useState(false);
  const [savingGroupScore, setSavingGroupScore] = useState(false);
  
  const [judges, setJudges] = useState<any[]>([]);
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newJudgePin, setNewJudgePin] = useState("");
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null);
  const [editingJudgeData, setEditingJudgeData] = useState({ name: "", pin: "", allowed: [] as string[] });
  const [judgeAccessMap, setJudgeAccessMap] = useState<Record<string, string[]>>({});
  const [competitionTitle, setCompetitionTitle] = useState("Perform Yel-Yel");
  const [timerEnd, setTimerEnd] = useState<number | null>(null);

  const [scoreLogs, setScoreLogs] = useState<any[]>([]);
  const [scoreLogsLoading, setScoreLogsLoading] = useState(true);
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Edit/Add Participant Modal
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isNewParticipant, setIsNewParticipant] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const showToast = useCallback((message: string, type: 'success'|'error' = 'success') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Bracket Drag & Drop States
  const [bracketCategory, setBracketCategory] = useState("Single Putra");
  // Mobile tap-to-select state for bracket
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  // Edit Winner Modal
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [savingWinner, setSavingWinner] = useState(false);
  const [isNewWinner, setIsNewWinner] = useState(false);

  // Edit Schedule Modal
  const [editingSchedule, setEditingSchedule] = useState<MatchSchedule | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // E-Sertifikat
  const [certWinnerId, setCertWinnerId] = useState("");
  const [certTemplate, setCertTemplate] = useState("badminton");
  const [certData, setCertData] = useState({ name: "", category: "", event: "", position: "", date: "19 August 2026" });
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadCert = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = `Sertifikat-${certData.name.replace(/\s+/g, '_') || 'Pemenang'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh sertifikat");
    }
    setIsDownloading(false);
  };

  const fetchParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });
    setParticipants(data || []);
    setParticipantsLoading(false);
  }, []);

  const fetchScores = useCallback(async () => {
    setScoresLoading(true);
    const { data } = await supabase.from("quiz_scores").select("*").order("score", { ascending: false }).limit(20);
    setQuizScores(data || []);
    setScoresLoading(false);
  }, []);

  const fetchWinners = useCallback(async () => {
    setWinnersLoading(true);
    const { data } = await supabase.from("winners").select("*").order("event", { ascending: true });
    setWinners(data || []);
    setWinnersLoading(false);
  }, []);

  const fetchSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    const { data } = await supabase.from("match_schedules").select("*").order("id", { ascending: true });
    setSchedules(data || []);
    setSchedulesLoading(false);
  }, []);

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    const { data } = await supabase.from("quiz_questions").select("*").order("created_at", { ascending: true });
    setQuizQuestions(data || []);
    setQuestionsLoading(false);
  }, []);

  const fetchGroupScores = useCallback(async () => {
    setGroupScoresLoading(true);
    const { data } = await supabase.from("group_scores").select("*").order("group_name", { ascending: true });
    setGroupScores(data || []);
    setGroupScoresLoading(false);
  }, []);

  const fetchJudges = useCallback(async () => {
    const res = await fetch("/api/admin/judges");
    if (res.ok) setJudges(await res.json());
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["competition_title", "timer_end", "judge_access_map"]);
      
    if (data) {
      const title = data.find(d => d.key === "competition_title")?.value;
      if (title) setCompetitionTitle(title);
      
      const timer = data.find(d => d.key === "timer_end")?.value;
      if (timer) setTimerEnd(parseInt(timer));

      const accessMap = data.find(d => d.key === "judge_access_map")?.value;
      if (accessMap) {
        try {
          setJudgeAccessMap(JSON.parse(accessMap));
        } catch(e) {}
      }
    }
  }, []);

  const fetchScoreLogs = useCallback(async () => {
    setScoreLogsLoading(true);
    const res = await fetch("/api/score-logs?limit=50");
    if (res.ok) {
      setScoreLogs(await res.json());
    }
    setScoreLogsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAdminEmail(user.email || "");
    });
    fetchParticipants();
    fetchScores();
    fetchWinners();
    fetchSchedules();
    fetchQuestions();
    fetchGroupScores();
    fetchJudges();
    fetchSettings();
    fetchScoreLogs();
  }, [fetchParticipants, fetchScores, fetchWinners, fetchSchedules, fetchQuestions, fetchGroupScores, fetchJudges, fetchSettings, fetchScoreLogs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const updateBracketPosition = async (id: string, position: string | null, type: "bracket" | "final") => {
    const p = participants.find(x => x.id === id);
    if (!p) return;

    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: p.name,
          call_name: p.call_name || "",
          bracket_position: type === "bracket" ? position : p.bracket_position,
          final_position: type === "final" ? position : p.final_position,
        }),
      });
      if (res.ok) {
        await fetchParticipants();
      } else {
        alert("Gagal mengupdate posisi bagan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDragStart = (e: React.DragEvent, participantId: string) => {
    e.dataTransfer.setData("participantId", participantId);
    // Clear tap selection when dragging starts
    setSelectedParticipantId(null);
  };

  const handleDropToSlot = async (e: React.DragEvent, slotNumber: string, type: "bracket" | "final") => {
    e.preventDefault();
    const participantId = e.dataTransfer.getData("participantId");
    if (!participantId) return;

    // Check if slot is occupied
    const existing = participants.find(x => 
      x.category === bracketCategory && 
      (type === "bracket" ? x.bracket_position === slotNumber : x.final_position === slotNumber)
    );
    if (existing) {
      // Unassign existing first
      await updateBracketPosition(existing.id, null, type);
    }
    await updateBracketPosition(participantId, slotNumber, type);
  };

  // Mobile: tap slot to place selected participant
  const handleTapSlot = async (participantId: string, slotNumber: string, type: "bracket" | "final") => {
    // Check if slot is occupied
    const existing = participants.find(x => 
      x.category === bracketCategory && 
      (type === "bracket" ? x.bracket_position === slotNumber : x.final_position === slotNumber)
    );
    if (existing) {
      await updateBracketPosition(existing.id, null, type);
    }
    await updateBracketPosition(participantId, slotNumber, type);
    setSelectedParticipantId(null);
  };

  const handleRemoveFromSlot = async (participantId: string, type: "bracket" | "final") => {
    await updateBracketPosition(participantId, null, type);
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    setSavingParticipant(true);
    try {
      const method = isNewParticipant ? "POST" : "PATCH";
      const payload = isNewParticipant 
        ? {
            name: editingParticipant.name,
            event: "Internal Badminton Tournament 2026",
            floor: editingParticipant.floor || "Lantai 26",
            category: editingParticipant.category || "Single Putra",
            partner: editingParticipant.partner || "-",
          }
        : {
            id: editingParticipant.id,
            name: editingParticipant.name,
            call_name: editingParticipant.call_name || "",
            bracket_position: editingParticipant.bracket_position || null,
            final_position: editingParticipant.final_position || null,
          };
      
      const res = await fetch("/api/admin/participants", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchParticipants();
        setEditingParticipant(null);
        setIsNewParticipant(false);
      } else {
        const errorData = await res.json();
        alert(`Gagal menyimpan peserta: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan peserta.");
    }
    setSavingParticipant(false);
  };

  const handleSaveWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWinner) return;
    setSavingWinner(true);
    try {
      const method = isNewWinner ? "POST" : "PATCH";
      const res = await fetch("/api/admin/winners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingWinner),
      });
      if (res.ok) {
        await fetchWinners();
        setEditingWinner(null);
      } else {
        alert("Gagal mengupdate pemenang");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
    setSavingWinner(false);
  };

  const handleDeleteWinner = async (id: string) => {
    if (!confirm("Hapus data pemenang ini?")) return;
    try {
      const res = await fetch(`/api/admin/winners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchWinners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSchedule),
      });
      if (res.ok) {
        await fetchSchedules();
        setEditingSchedule(null);
      } else {
        alert("Gagal mengupdate jadwal");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
    setSavingSchedule(false);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setSavingQuestion(true);
    try {
      const method = isNewQuestion ? "POST" : "PATCH";
      const res = await fetch("/api/admin/quiz-questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
      });
      if (res.ok) {
        await fetchQuestions();
        setEditingQuestion(null);
      } else {
        alert("Gagal mengupdate soal quiz");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
    setSavingQuestion(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      const res = await fetch(`/api/admin/quiz-questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGroupScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupScore) return;
    setSavingGroupScore(true);
    try {
      const method = isNewGroupScore ? "POST" : "PATCH";
      const res = await fetch("/api/admin/group-scores", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingGroupScore),
      });
      if (res.ok) {
        await fetchGroupScores();
        setEditingGroupScore(null);
      } else {
        alert("Gagal mengupdate skor");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
    setSavingGroupScore(false);
  };

  const handleDeleteGroupScore = async (id: string) => {
    if (!confirm("Hapus grup ini dari scoreboard?")) return;
    try {
      const res = await fetch(`/api/admin/group-scores?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchGroupScores();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScoreLog = async (id: string, groupName: string, value: number) => {
    if (!confirm(`Reset nilai +${value} untuk ${groupName}? Skor di scoreboard akan otomatis berkurang.`)) return;
    try {
      const res = await fetch(`/api/score-logs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchScoreLogs();
        await fetchGroupScores(); // Update scoreboard as well
      } else {
        alert("Gagal mereset nilai.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };


  const handleQuickScoreUpdate = async (id: string, diff: number) => {
    const group = groupScores.find(g => g.id === id);
    if (!group) return;
    
    // Optimistic UI update
    setGroupScores(prev => prev.map(g => g.id === id ? { ...g, score: g.score + diff } : g).sort((a, b) => b.score - a.score));

    try {
      const res = await fetch("/api/admin/group-scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, increment: diff }),
      });
      if (!res.ok) {
        await fetchGroupScores(); // rollback if failed
      }
    } catch (err) {
      console.error(err);
      await fetchGroupScores();
    }
  };

  const handleSyncTeams = async () => {
    if (!confirm("Sinkronisasi semua kelompok dari data Tim Fun Games ke Scoreboard? Kelompok yang sudah ada tidak akan duplikat.")) return;
    try {
      const res = await fetch("/api/admin/group-scores", { method: "PUT" });
      const result = await res.json();
      if (res.ok) {
        await fetchGroupScores();
        if (result.inserted === 0) {
          alert("Semua tim sudah tersinkronisasi sebelumnya.");
        } else {
          alert(`✅ Berhasil menambahkan ${result.inserted} kelompok ke scoreboard!`);
        }
      } else {
        alert("Gagal sinkronisasi: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat sinkronisasi.");
    }
  };

  const sessions = [...new Set(quizScores.map(s => s.pin))].length;

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { icon: <Users size={16} />, label: "Peserta & Bagan" },
    { icon: <Calendar size={16} />, label: "Jadwal & Wasit" },
    { icon: <Trophy size={16} />, label: "Manajemen Pemenang" },
    { icon: <BarChart2 size={16} />, label: "Scoreboard Kelompok" },
    { icon: <BookOpen size={16} />, label: "Manajemen Soal Quiz" },
    { icon: <Award size={16} />, label: "E-Sertifikat" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col relative overflow-hidden">
      {/* Background Watermark */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{ 
          backgroundImage: "url('/HUTRI81_FA_Logo__Main%20Logo%20Merah%20Hitam%20Latar%20Putih.png')",
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '600px'
        }}
      />
      
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm transition-all flex flex-col">
        {/* Top Tier: Logo & Actions */}
        <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-[1400px] w-full mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-zinc-100">
              <Image src="/gesit_logo.png" alt="GESIT" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-black text-zinc-900 tracking-tight text-lg hidden sm:block">GESIT<span className="text-zinc-400 font-medium ml-1 text-sm">Admin</span></span>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-zinc-200">
              <Link href="/quiz/host" target="_blank" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-300">
                <Monitor size={14} /> <span>Quiz Host</span>
              </Link>
              <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-300">
                <Circle size={14} /> <span>Web Utama</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-3 pr-4 border-r border-zinc-200">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Admin</span>
                <span className="text-xs font-semibold text-zinc-700 truncate max-w-[120px]">{adminEmail}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-zinc-700">
                <span className="text-xs font-bold">{adminEmail?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="text-zinc-400 hover:text-red-600 transition-all duration-300 p-2 rounded-full hover:bg-red-50" title="Keluar">
              <LogOut size={18} />
            </button>
            
            {/* Mobile menu toggle button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors ${sidebarOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              {sidebarOpen ? (
                <X size={20} strokeWidth={2.5} />
              ) : (
                <div className="flex flex-col gap-1.5 items-center justify-center">
                  <div className="w-5 h-0.5 bg-current rounded-full" />
                  <div className="w-5 h-0.5 bg-current rounded-full" />
                  <div className="w-5 h-0.5 bg-current rounded-full" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Tier: Navigation Tabs (Desktop only) */}
        <div className="hidden lg:flex w-full bg-white/50 border-t border-zinc-200/50">
          <nav className="flex items-center gap-2 max-w-[1400px] w-full mx-auto px-4 md:px-6 h-12 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === item.label 
                    ? "bg-zinc-900 text-white shadow-sm" 
                    : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Floating Menu Dropdown */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-30 bg-zinc-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="lg:hidden fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl z-40 p-2 shadow-2xl shadow-zinc-900/10 animate-in slide-in-from-top-4 fade-in duration-200 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="space-y-1 p-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-3">Menu Utama</p>
              {navItems.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { setActiveTab(item.label); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.label 
                      ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              
              <div className="pt-4 mt-2 border-t border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-3">Aksi Cepat</p>
                <Link href="/quiz/host" target="_blank" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                  <Monitor size={18} /> Layar Quiz Host
                </Link>
                <Link href="/" target="_blank" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                  <Circle size={18} /> Website Utama
                </Link>
              </div>
              
              <div className="pt-4 mt-2 border-t border-zinc-100 md:hidden block px-3 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xs font-bold">{adminEmail?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">{adminEmail}</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Admin GESIT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 pt-16 lg:pt-[112px] min-w-0">
        <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-8">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{activeTab}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Kelola data turnamen dan sistem.</p>
            </div>
          </div>

          {activeTab === "Dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users size={18} />} label="Total Peserta" value={participantsLoading ? "—" : participants.length} />
                <StatCard icon={<Trophy size={18} />} label="Pemenang Terdata" value={winnersLoading ? "—" : winners.length} />
                <StatCard icon={<TrendingUp size={18} />} label="Skor Tertinggi" value={scoresLoading ? "—" : (quizScores[0]?.score?.toLocaleString() || "—")} />
                <StatCard icon={<Gamepad2 size={18} />} label="Sesi Quiz" value={scoresLoading ? "—" : sessions} />
              </div>
              <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-zinc-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0">
                    <Monitor size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Buka Layar Quiz Host</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Tampilkan di proyektor untuk memulai sesi quiz live.</p>
                  </div>
                </div>
                <Link href="/quiz/host" target="_blank" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                  Buka Sekarang <ExternalLink size={14} />
                </Link>
              </Card>
              <Card>
                <CardHeader
                  title="Papan Skor Quiz Teratas"
                  description="Peringkat tertinggi dari semua sesi quiz"
                  action={
                    <button onClick={fetchScores} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                      <RefreshCw size={14} className={scoresLoading ? "animate-spin" : ""} />
                    </button>
                  }
                />
                <div className="p-2">
                  {scoresLoading ? (
                    <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                  ) : quizScores.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy size={32} className="text-zinc-200 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">Belum ada data skor</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400">
                          <th className="px-4 py-2 text-left font-medium">#</th>
                          <th className="px-4 py-2 text-left font-medium">Nama</th>
                          <th className="px-4 py-2 text-right font-medium">Skor</th>
                          <th className="px-4 py-2 text-right font-medium">PIN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizScores.slice(0, 10).map((s, i) => (
                          <tr key={s.id} className="hover:bg-zinc-50 rounded-lg transition-colors">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-zinc-100 text-zinc-600" : i === 2 ? "bg-orange-100 text-orange-700" : "text-zinc-400"}`}>
                                {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-medium text-zinc-900">{s.name}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span className={`font-bold ${i === 0 ? "text-yellow-600" : "text-zinc-700"}`}>{s.score.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <Badge>{s.pin}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </>
          )}

          {activeTab === "Peserta & Bagan" && (
            <div className="space-y-8">
              
              {/* Visual Bracket Editor */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Pengaturan Bagan (Drag & Drop)</h2>
                    <p className="text-sm text-zinc-500">Tarik nama dari kiri ke kotak slot di kanan.</p>
                  </div>
                  {/* Category Filter for Bracket */}
                  <div className="flex bg-white border border-zinc-200 rounded-lg p-1 shadow-sm overflow-x-auto hide-scrollbar">
                    {["Single Putra", "Single Putri", "Ganda Campuran"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setBracketCategory(cat); setSelectedParticipantId(null); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${bracketCategory === cat ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Unassigned List */}
                  <Card className="w-full lg:w-1/3">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
                      <h3 className="text-sm font-semibold text-zinc-900">Daftar Peserta</h3>
                      <p className="text-[11px] text-zinc-500">Drag (desktop) atau Tap lalu tap slot (mobile)</p>
                      {selectedParticipantId && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 text-[11px] text-blue-700 font-bold bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                            ✓ Dipilih: {participants.find(p => p.id === selectedParticipantId)?.call_name || participants.find(p => p.id === selectedParticipantId)?.name.split(" ")[0]} — tap slot kosong
                          </div>
                          <button onClick={() => setSelectedParticipantId(null)} className="text-zinc-400 hover:text-zinc-600 p-1">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                      {participants.filter(p => p.category === bracketCategory).length === 0 ? (
                        <div className="text-center py-8 text-zinc-400 text-sm">Belum ada peserta di kategori ini.</div>
                      ) : (
                        participants
                          .filter(p => p.category === bracketCategory)
                          .map(p => (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, p.id)}
                              onClick={() => setSelectedParticipantId(prev => prev === p.id ? null : p.id)}
                              className={`p-3 border rounded-lg shadow-sm cursor-pointer transition-colors flex justify-between items-center group ${
                                selectedParticipantId === p.id
                                  ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300"
                                  : "bg-white border-zinc-200 hover:border-zinc-400 cursor-grab active:cursor-grabbing"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-sm text-zinc-900 truncate">{p.name}</div>
                                {p.call_name && <div className="text-[10px] text-zinc-500 truncate">Panggilan: {p.call_name}</div>}
                                {p.partner && p.partner !== "-" && <div className="text-[10px] text-zinc-500 truncate">Partner: {p.partner}</div>}
                              </div>
                              <div className="shrink-0 flex flex-col gap-1 items-end">
                                {selectedParticipantId === p.id && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Dipilih</span>}
                                {p.bracket_position && <Badge variant="warning">Slot {p.bracket_position}</Badge>}
                                {p.final_position && <Badge variant="success">Final {p.final_position}</Badge>}
                              </div>
                            </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Right: Bracket Visual */}
                  <Card className="w-full lg:w-2/3 bg-[#0a0a0c] border-zinc-800 p-6 flex flex-col justify-center min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-2 md:gap-4 relative z-10 w-full h-full">
                      {/* L-side Slots */}
                      <div className="flex flex-col justify-around gap-8 h-full flex-1 min-w-0 relative">
                        <SlotBox slotNumber="1" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                        {(() => {
                          const catPrefix = bracketCategory === "Single Putra" ? "SP" : bracketCategory === "Single Putri" ? "SPu" : "GC";
                          const s = schedules.find(x => x.match_key === `${catPrefix}_SF1`);
                          if (!s) return null;
                          return (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-700/50 backdrop-blur-sm whitespace-nowrap text-center shadow-lg pointer-events-none">
                              <div className="text-[9px] text-zinc-300 font-bold mb-0.5 tracking-wider">{s.day} • {s.time}</div>
                              <div className="text-[8px] text-zinc-400 font-medium">{s.court} • {s.referee.split('/')[0].trim()}</div>
                            </div>
                          );
                        })()}
                        <SlotBox slotNumber="2" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                      </div>
                      
                      {/* Center Final Slots */}
                      <div className="flex flex-col items-center justify-center gap-4 px-2 md:px-4 shrink-0 w-32 md:w-48 h-full">
                        {/* Final Left Box */}
                        <SlotBox slotNumber="L" type="final" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                        
                        <div className="flex flex-col items-center justify-center my-2 w-full">
                          <Trophy className="w-10 h-10 md:w-14 md:h-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] mb-2.5" strokeWidth={1.5} />
                          
                          <div className="w-full mb-3">
                            <SlotBox slotNumber="W" type="final" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                          </div>

                          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black px-2 py-1 md:px-3 md:py-1 text-[9px] md:text-[10px] tracking-widest rounded shadow-[0_0_20px_rgba(220,38,38,0.3)] text-center whitespace-nowrap">
                            GRAND FINAL
                          </div>
                          {(() => {
                            const catPrefix = bracketCategory === "Single Putra" ? "SP" : bracketCategory === "Single Putri" ? "SPu" : "GC";
                            const s = schedules.find(x => x.match_key === `${catPrefix}_F`);
                            if (!s) return null;
                            return (
                              <div className="mt-2 flex flex-col items-center bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-700/50 backdrop-blur-sm whitespace-nowrap text-center shadow-lg pointer-events-none">
                                <div className="text-[9px] text-zinc-300 font-bold mb-0.5 tracking-wider">{s.day} • {s.time}</div>
                                <div className="text-[8px] text-zinc-400 font-medium">{s.court} • {s.referee.split('/')[0].trim()}</div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Final Right Box */}
                        <SlotBox slotNumber="R" type="final" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                      </div>

                      {/* R-side Slots */}
                      <div className="flex flex-col justify-around gap-8 h-full flex-1 min-w-0 relative">
                        <SlotBox slotNumber="3" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                        {(() => {
                          const catPrefix = bracketCategory === "Single Putra" ? "SP" : bracketCategory === "Single Putri" ? "SPu" : "GC";
                          const s = schedules.find(x => x.match_key === `${catPrefix}_SF2`);
                          if (!s) return null;
                          return (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-700/50 backdrop-blur-sm whitespace-nowrap text-center shadow-lg pointer-events-none">
                              <div className="text-[9px] text-zinc-300 font-bold mb-0.5 tracking-wider">{s.day} • {s.time}</div>
                              <div className="text-[8px] text-zinc-400 font-medium">{s.court} • {s.referee.split('/')[0].trim()}</div>
                            </div>
                          );
                        })()}
                        <SlotBox slotNumber="4" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} selectedParticipantId={selectedParticipantId} onTapSlot={handleTapSlot} />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Table Data (Full List) */}
              <Card>
                <CardHeader
                  title="Tabel Data Seluruh Peserta"
                  description="Edit detail nama peserta atau nama panggilan secara manual."
                  action={
                    <div className="flex items-center gap-2">
                      <button onClick={fetchParticipants} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                        <RefreshCw size={14} className={participantsLoading ? "animate-spin" : ""} />
                      </button>
                      <button 
                        onClick={() => {
                          setIsNewParticipant(true);
                          setEditingParticipant({ id: "", registration_id: "", created_at: "", name: "", floor: "Lantai 26", event: "Internal Badminton Tournament 2026", category: "Single Putra", status: "Registered" });
                        }}
                        className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={14} /> Tambah Manual
                      </button>
                    </div>
                  }
                />
                <div className="p-2">
                  {participantsLoading ? (
                    <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                  ) : participants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={32} className="text-zinc-200 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">Belum ada peserta terdaftar</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200">
                            <th className="px-4 py-3 text-left font-medium">Nama</th>
                            <th className="px-4 py-3 text-left font-medium">Kategori</th>
                            <th className="px-4 py-3 text-left font-medium">Partner</th>
                            <th className="px-4 py-3 text-left font-medium">Lantai</th>
                            <th className="px-4 py-3 text-center font-medium">Slot Bagan</th>
                            <th className="px-4 py-3 text-right font-medium">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {participants.map((p) => (
                            <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-zinc-900">{p.name}</div>
                                <div className="text-xs text-zinc-500">Panggilan: {p.call_name || "—"}</div>
                              </td>
                              <td className="px-4 py-3 text-zinc-700">{p.category || "—"}</td>
                              <td className="px-4 py-3 text-zinc-500">{p.partner || "—"}</td>
                              <td className="px-4 py-3 text-zinc-500 text-xs">{p.floor || "—"}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col gap-1 items-center">
                                  {p.bracket_position ? (
                                    <Badge variant="warning">Slot {p.bracket_position}</Badge>
                                  ) : (
                                    <span className="text-xs text-zinc-400 italic">Unassigned</span>
                                  )}
                                  {p.final_position && (
                                    <Badge variant="success">Final {p.final_position}</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => setEditingParticipant({ ...p })}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                                >
                                  <Edit2 size={12} /> Edit Detail
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "Jadwal & Wasit" && (
            <Card>
              <CardHeader
                title="Pengaturan Jadwal & Wasit Pertandingan"
                description="Ubah waktu, lapangan, dan nama wasit untuk setiap pertandingan."
                action={
                  <button onClick={fetchSchedules} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                    <RefreshCw size={14} className={schedulesLoading ? "animate-spin" : ""} />
                  </button>
                }
              />
              <div className="p-2">
                {schedulesLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={32} className="text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Belum ada data jadwal</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200">
                          <th className="px-4 py-3 text-left font-medium">Kategori & Match</th>
                          <th className="px-4 py-3 text-left font-medium">Hari & Jam</th>
                          <th className="px-4 py-3 text-left font-medium">Lapangan</th>
                          <th className="px-4 py-3 text-left font-medium">Wasit</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {schedules.map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-zinc-900">{s.category}</div>
                              <div className="text-xs text-zinc-500">{s.match_name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-zinc-900">{s.day}</div>
                              <div className="text-xs text-zinc-500">{s.time}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="warning">{s.court}</Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-zinc-900">{s.referee}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => setEditingSchedule({ ...s })}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "Manajemen Pemenang" && (() => {
              const FG_COMPS = ["Perform Yel-Yel","Fun Games - Quiz Challenge","Fun Games - Word Puzzle","Fun Games - Estafet Sedotan","Fun Games - Cup Rush"];
              const funMap: Record<string,number> = {};
              const costumeMap: Record<string,number> = {};
              const potluckMap: Record<string,number> = {};
              for (const log of scoreLogs) {
                if (log.value <= 0) continue;
                if (FG_COMPS.includes(log.competition)) funMap[log.group_name] = (funMap[log.group_name]||0)+log.value;
                else if (log.competition === "Best Costume") costumeMap[log.group_name] = (costumeMap[log.group_name]||0)+log.value;
                else if (log.competition === "Potluck - Pesta Rasa Merah Putih") potluckMap[log.group_name] = (potluckMap[log.group_name]||0)+log.value;
              }
              const toRanked = (m: Record<string,number>) => Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3);
              const MEDALS = ["🥇","🥈","🥉"];
              const POSITIONS = ["Juara 1","Juara 2","Juara 3"];
              const MEDAL_STYLES = [
                "bg-amber-50 border-amber-200 text-amber-800",
                "bg-zinc-50 border-zinc-200 text-zinc-700",
                "bg-orange-50 border-orange-200 text-orange-800"
              ];

              const categories = [
                { key: "fun",     label: "Fun Games",         emoji: "🎮", color: "#102A4C", bg: "bg-[#102A4C]", ranked: toRanked(funMap),     hasScore: Object.keys(funMap).length > 0 },
                { key: "costume", label: "Best Costume",      emoji: "👗", color: "#7C3AED", bg: "bg-purple-700", ranked: toRanked(costumeMap),  hasScore: Object.keys(costumeMap).length > 0 },
                { key: "potluck", label: "Potluck Nusantara", emoji: "🍽️", color: "#065F46", bg: "bg-emerald-700", ranked: toRanked(potluckMap), hasScore: Object.keys(potluckMap).length > 0 },
              ];

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Pemenang Berdasarkan Skor</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Ranking otomatis dari riwayat penilaian juri. Refresh data skor untuk memperbarui.</p>
                    </div>
                    <button onClick={fetchScoreLogs} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-zinc-600">
                      <RefreshCw size={13} className={scoreLogsLoading ? "animate-spin" : ""} /> Refresh Skor
                    </button>
                  </div>

                  {scoreLogsLoading ? (
                    <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-zinc-300" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {categories.map(cat => (
                        <div key={cat.key} className="rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                          {/* Category Header */}
                          <div className={`${cat.bg} px-5 py-4 text-white`}>
                            <div className="text-lg font-black">{cat.emoji} {cat.label}</div>
                            <div className="text-xs text-white/60 mt-0.5">Top 3 Kelompok</div>
                          </div>

                          {/* Ranked List */}
                          <div className="divide-y divide-zinc-100">
                            {!cat.hasScore ? (
                              <div className="py-10 text-center text-zinc-400">
                                <Trophy size={28} className="mx-auto mb-2 text-zinc-200" />
                                <p className="text-sm">Belum ada penilaian</p>
                              </div>
                            ) : cat.ranked.length === 0 ? (
                              <div className="py-10 text-center text-zinc-400 text-sm">Tidak ada data</div>
                            ) : (
                              cat.ranked.map(([name, score], i) => (
                                <div key={name} className={`flex items-center gap-3 px-4 py-3.5 ${i === 0 ? "bg-amber-50/50" : ""}`}>
                                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg font-black shrink-0 ${MEDAL_STYLES[i]}`}>
                                    {MEDALS[i]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 text-sm truncate">{name}</p>
                                    <p className="text-xs text-zinc-400">{POSITIONS[i]} · {score.toLocaleString()} poin</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Footer note */}
                          {cat.hasScore && (
                            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                              <p className="text-[11px] text-zinc-400">Ranking dihitung otomatis dari total nilai yang masuk.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legacy winners table (for Badminton & other events) */}
                  <Card>
                    <CardHeader
                      title="Pemenang Badminton & Lainnya"
                      description="Pemenang lomba badminton dan kategori lain yang diinput manual."
                      action={
                        <div className="flex items-center gap-2">
                          <button onClick={fetchWinners} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                            <RefreshCw size={14} className={winnersLoading ? "animate-spin" : ""} />
                          </button>
                          <button
                            onClick={() => {
                              setIsNewWinner(true);
                              setEditingWinner({ id: "", event: "", category: "-", position: "Juara 1", name: "" });
                            }}
                            className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus size={14} /> Tambah Data
                          </button>
                        </div>
                      }
                    />
                    <div className="p-2">
                      {winnersLoading ? (
                        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                      ) : winners.length === 0 ? (
                        <div className="text-center py-12">
                          <Trophy size={32} className="text-zinc-200 mx-auto mb-2" />
                          <p className="text-sm text-zinc-400">Belum ada data pemenang terdaftar</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200">
                                <th className="px-4 py-3 text-left font-medium">Event</th>
                                <th className="px-4 py-3 text-left font-medium">Kategori</th>
                                <th className="px-4 py-3 text-left font-medium">Posisi</th>
                                <th className="px-4 py-3 text-left font-medium">Nama Pemenang</th>
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {winners.map((w) => (
                                <tr key={w.id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-zinc-900">{w.event}</td>
                                  <td className="px-4 py-3 text-zinc-700">{w.category}</td>
                                  <td className="px-4 py-3"><Badge>{w.position}</Badge></td>
                                  <td className="px-4 py-3 font-bold text-zinc-900">{w.name}</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => { setIsNewWinner(false); setEditingWinner({ ...w }); }} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={14} /></button>
                                      <button onClick={() => handleDeleteWinner(w.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })()}

          {activeTab === "Scoreboard Kelompok" && (
            <div className="space-y-6">
            <Card>
              <CardHeader
                title="Scoreboard Kelompok (Fun Games)"
                description="Kelola dan update skor tiap kelompok secara real-time."
                action={
                  <div className="flex items-center gap-2">
                    <Link href="/scoreboard" target="_blank" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all border border-zinc-200 bg-white">
                      <Monitor size={14} /> Layar Publik
                    </Link>
                    <button onClick={fetchGroupScores} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                      <RefreshCw size={14} className={groupScoresLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={handleSyncTeams}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} /> Sync dari Tim
                    </button>
                    <button 
                      onClick={async () => {
                        const newTimerEnd = timerEnd && timerEnd > Date.now() ? 0 : Date.now() + 10 * 60 * 1000;
                        await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: "timer_end", value: newTimerEnd.toString() })
                        });
                        setTimerEnd(newTimerEnd);
                      }}
                      className={`inline-flex items-center gap-1 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        timerEnd && timerEnd > Date.now() ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <Circle size={14} /> {timerEnd && timerEnd > Date.now() ? "Stop Timer" : "Start Timer (10m)"}
                    </button>
                    <button 
                      onClick={() => {
                        setIsNewGroupScore(true);
                        setEditingGroupScore({ id: "", group_name: "", score: 0 });
                      }}
                      className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={14} /> Tambah Manual
                    </button>
                  </div>
                }
              />
              <div className="p-2">
                {groupScoresLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                ) : groupScores.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <BarChart2 size={32} className="text-zinc-200 mx-auto" />
                    <p className="text-sm text-zinc-400">Belum ada grup di scoreboard.</p>
                    <button onClick={handleSyncTeams} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors mx-auto">
                      <RefreshCw size={13} /> Sync Otomatis dari Data Tim
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200">
                          <th className="px-4 py-3 text-center font-medium w-16">Peringkat</th>
                          <th className="px-4 py-3 text-left font-medium">Nama Kelompok</th>
                          <th className="px-4 py-3 text-center font-medium">Skor Saat Ini</th>
                          <th className="px-4 py-3 text-center font-medium">Aksi Cepat</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {groupScores.map((g, index) => (
                          <tr key={g.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-zinc-100 text-zinc-500">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-zinc-900">{g.group_name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-black text-lg text-zinc-800">{g.score.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleQuickScoreUpdate(g.id, -10)} className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-red-200">-10</button>
                                <button onClick={() => handleQuickScoreUpdate(g.id, 10)} className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200">+10</button>
                                <button onClick={() => handleQuickScoreUpdate(g.id, 25)} className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200">+25</button>
                                <button onClick={() => handleQuickScoreUpdate(g.id, 50)} className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200">+50</button>
                                <button onClick={() => handleQuickScoreUpdate(g.id, 100)} className="px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded border border-blue-200">+100</button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => { setIsNewGroupScore(false); setEditingGroupScore({ ...g }); }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteGroupScore(g.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

            {/* Riwayat Nilai & Reset */}
            <Card>
              <CardHeader 
                title="Riwayat Nilai (Terbaru)" 
                description="Semua nilai yang masuk dari Portal Juri. Admin dapat membatalkan/reset nilai jika terjadi kesalahan."
                action={
                  <button onClick={fetchScoreLogs} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                    <RefreshCw size={14} className={scoreLogsLoading ? "animate-spin" : ""} />
                  </button>
                }
              />
              <div className="p-2">
                {scoreLogsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                ) : scoreLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList size={32} className="text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Belum ada riwayat nilai.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200 sticky top-0 z-10">
                          <th className="px-4 py-3 text-left font-medium">Waktu</th>
                          <th className="px-4 py-3 text-left font-medium">Lomba</th>
                          <th className="px-4 py-3 text-left font-medium">Kelompok</th>
                          <th className="px-4 py-3 text-left font-medium">Juri</th>
                          <th className="px-4 py-3 text-center font-medium">Nilai</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {scoreLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3 text-zinc-500 text-xs">
                              {new Date(log.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-3 text-zinc-700 text-xs">{log.competition}</td>
                            <td className="px-4 py-3 font-bold text-zinc-900">{log.group_name}</td>
                            <td className="px-4 py-3 text-zinc-600 text-xs">{log.judge_name || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">+{log.value}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleDeleteScoreLog(log.id, log.group_name, log.value)}
                                className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-md transition-colors"
                                title="Reset / Hapus Nilai"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

            {/* Rekap Skor per Kategori */}
            {scoreLogs.length > 0 && (() => {
              const FG = ["Perform Yel-Yel","Fun Games - Quiz Challenge","Fun Games - Word Puzzle","Fun Games - Estafet Sedotan","Fun Games - Cup Rush"];
              const funMap: Record<string,number> = {};
              const costumeMap: Record<string,number> = {};
              const potluckMap: Record<string,number> = {};
              for (const log of scoreLogs) {
                if (log.value <= 0) continue;
                if (FG.includes(log.competition)) funMap[log.group_name] = (funMap[log.group_name]||0)+log.value;
                else if (log.competition === "Best Costume") costumeMap[log.group_name] = (costumeMap[log.group_name]||0)+log.value;
                else if (log.competition === "Potluck - Pesta Rasa Merah Putih") potluckMap[log.group_name] = (potluckMap[log.group_name]||0)+log.value;
              }
              const toRows = (m: Record<string,number>) => Object.entries(m).sort((a,b)=>b[1]-a[1]);
              return (
                <Card>
                  <CardHeader title="Rekap Skor per Kategori" description="Fun Games diakumulasi dari semua lomba. Best Costume & Potluck terpisah dan tidak tercampur." />
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="bg-[#102A4C] px-4 py-2.5 text-white text-xs font-black uppercase tracking-widest">🎮 Fun Games</div>
                      {toRows(funMap).length === 0 ? <p className="text-xs text-zinc-400 text-center py-6">Belum ada nilai</p> : (
                        <table className="w-full text-sm"><tbody>{toRows(funMap).map(([name,score],i) => (
                          <tr key={name} className="border-t border-zinc-100 hover:bg-zinc-50">
                            <td className="px-3 py-2 text-zinc-400 text-xs font-bold">{i+1}</td>
                            <td className="px-2 py-2 font-semibold text-zinc-800 text-xs">{name}</td>
                            <td className="px-3 py-2 text-right font-black text-[#102A4C]">{score.toLocaleString()}</td>
                          </tr>
                        ))}</tbody></table>
                      )}
                    </div>
                    <div className="border border-purple-200 rounded-xl overflow-hidden">
                      <div className="bg-purple-700 px-4 py-2.5 text-white text-xs font-black uppercase tracking-widest">👗 Best Costume</div>
                      {toRows(costumeMap).length === 0 ? <p className="text-xs text-zinc-400 text-center py-6">Belum ada nilai</p> : (
                        <table className="w-full text-sm"><tbody>{toRows(costumeMap).map(([name,score],i) => (
                          <tr key={name} className="border-t border-purple-50 hover:bg-purple-50">
                            <td className="px-3 py-2 text-purple-300 text-xs font-bold">{i+1}</td>
                            <td className="px-2 py-2 font-semibold text-zinc-800 text-xs">{name}</td>
                            <td className="px-3 py-2 text-right font-black text-purple-700">{score.toLocaleString()}</td>
                          </tr>
                        ))}</tbody></table>
                      )}
                    </div>
                    <div className="border border-emerald-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-700 px-4 py-2.5 text-white text-xs font-black uppercase tracking-widest">🍽️ Potluck Nusantara</div>
                      {toRows(potluckMap).length === 0 ? <p className="text-xs text-zinc-400 text-center py-6">Belum ada nilai</p> : (
                        <table className="w-full text-sm"><tbody>{toRows(potluckMap).map(([name,score],i) => (
                          <tr key={name} className="border-t border-emerald-50 hover:bg-emerald-50">
                            <td className="px-3 py-2 text-emerald-300 text-xs font-bold">{i+1}</td>
                            <td className="px-2 py-2 font-semibold text-zinc-800 text-xs">{name}</td>
                            <td className="px-3 py-2 text-right font-black text-emerald-700">{score.toLocaleString()}</td>
                          </tr>
                        ))}</tbody></table>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Pengaturan Kompetisi & Juri */}
            <Card>
              <CardHeader title="Pengaturan Lomba & Juri" description="Atur judul lomba saat ini dan kelola akses PIN untuk juri." />
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Judul Lomba Saat Ini</label>
                  <div className="flex gap-2">
                    <select
                      value={competitionTitle}
                      onChange={(e) => setCompetitionTitle(e.target.value)}
                      className="flex-1 p-2 border border-zinc-300 rounded-lg text-sm font-bold uppercase focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white"
                    >
                      <option value="Perform Yel-Yel">Perform Yel-Yel</option>
                      <option value="Fun Games - Quiz Challenge">Fun Games - Quiz Challenge</option>
                      <option value="Fun Games - Word Puzzle">Fun Games - Word Puzzle</option>
                      <option value="Fun Games - Estafet Sedotan">Fun Games - Estafet Sedotan</option>
                      <option value="Fun Games - Cup Rush">Fun Games - Cup Rush</option>
                      <option value="Best Costume">Best Costume</option>
                      <option value="Potluck - Pesta Rasa Merah Putih">Potluck - Pesta Rasa Merah Putih</option>
                    </select>
                    <button 
                      onClick={async () => {
                        const res = await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: "competition_title", value: competitionTitle })
                        });
                        if (res.ok) showToast("Lomba berhasil dimainkan! Judul terupdate di Portal Juri.", "success");
                        else showToast("Gagal memainkan lomba.", "error");
                      }}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                    >
                      Mainkan Lomba
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Lomba yang dimainkan akan otomatis muncul di Portal Juri secara real-time.</p>
                </div>

                <div className="border-t border-zinc-200 pt-6">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-4">Daftar Juri (Akses Portal)</h4>
                  
                  <form 
                    className="flex flex-col sm:flex-row gap-2 mb-6"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newJudgeName || !newJudgePin) return;
                      const res = await fetch("/api/admin/judges", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newJudgeName, pin: newJudgePin })
                      });
                      if (res.ok) {
                        setNewJudgeName("");
                        setNewJudgePin("");
                        fetchJudges();
                      } else {
                        alert("Gagal menambahkan juri. Mungkin PIN sudah digunakan.");
                      }
                    }}
                  >
                    <input type="text" placeholder="Nama Juri (Misal: Juri Budi)" value={newJudgeName} onChange={e => setNewJudgeName(e.target.value)} className="flex-1 p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" required />
                    <input type="text" placeholder="PIN Akses" value={newJudgePin} onChange={e => setNewJudgePin(e.target.value)} className="w-full sm:w-32 p-2 border border-zinc-300 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-zinc-900 focus:outline-none" required />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shrink-0">Tambah Juri</button>
                  </form>

                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                          <th className="px-4 py-3 text-left font-semibold">Nama Juri</th>
                          <th className="px-4 py-3 text-left font-semibold">PIN</th>
                          <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {judges.map(j => (
                          <tr key={j.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                            {editingJudgeId === j.id ? (
                              <>
                                <td colSpan={2} className="px-4 py-2">
                                  <div className="flex gap-2 mb-2">
                                    <input type="text" value={editingJudgeData.name} onChange={e => setEditingJudgeData(prev => ({ ...prev, name: e.target.value }))} className="flex-1 p-1.5 border border-zinc-300 rounded text-sm focus:ring-1 focus:ring-zinc-900 focus:outline-none" placeholder="Nama Juri" />
                                    <input type="text" value={editingJudgeData.pin} onChange={e => setEditingJudgeData(prev => ({ ...prev, pin: e.target.value }))} className="w-24 p-1.5 border border-zinc-300 rounded text-sm font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-none" placeholder="PIN" />
                                  </div>
                                  <div className="text-xs font-semibold text-zinc-700 mb-1">Akses Lomba:</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ALL_COMPETITIONS.map(comp => (
                                      <button
                                        key={comp}
                                        onClick={() => {
                                          setEditingJudgeData(prev => {
                                            const isSelected = prev.allowed.includes(comp);
                                            return {
                                              ...prev,
                                              allowed: isSelected ? prev.allowed.filter(c => c !== comp) : [...prev.allowed, comp]
                                            };
                                          });
                                        }}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors border ${
                                          editingJudgeData.allowed.includes(comp) 
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" 
                                            : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                                        }`}
                                      >
                                        {comp.replace("Fun Games - ", "")}
                                      </button>
                                    ))}
                                    {editingJudgeData.allowed.length > 0 && (
                                      <button onClick={() => setEditingJudgeData(prev => ({ ...prev, allowed: [] }))} className="px-2 py-1 rounded text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100">
                                        Reset (Buka Semua)
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right align-top">
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <button 
                                      onClick={async () => {
                                        if (!editingJudgeData.name || !editingJudgeData.pin) return;
                                        
                                        // Update judge
                                        const res = await fetch("/api/admin/judges", {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ id: j.id, name: editingJudgeData.name, pin: editingJudgeData.pin })
                                        });

                                        if (res.ok) {
                                          // Update judge_access_map
                                          const newMap = { ...judgeAccessMap, [j.id]: editingJudgeData.allowed };
                                          await fetch("/api/settings", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ key: "judge_access_map", value: JSON.stringify(newMap) })
                                          });
                                          
                                          setJudgeAccessMap(newMap);
                                          setEditingJudgeId(null);
                                          fetchJudges();
                                        } else {
                                          alert("Gagal mengupdate juri. Mungkin PIN sudah digunakan.");
                                        }
                                      }}
                                      className="text-emerald-600 hover:text-emerald-800 p-1"
                                      title="Simpan"
                                    >
                                      <CheckCircle2 size={16} />
                                    </button>
                                    <button onClick={() => setEditingJudgeId(null)} className="text-zinc-400 hover:text-zinc-600 p-1" title="Batal">
                                      <X size={16} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-zinc-900 mb-1">{j.name}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {(!judgeAccessMap[j.id] || judgeAccessMap[j.id].length === 0) ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Semua Lomba</span>
                                    ) : (
                                      judgeAccessMap[j.id].map(comp => (
                                        <span key={comp} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                          {comp.replace("Fun Games - ", "")}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-zinc-600 align-top"><Badge>{j.pin}</Badge></td>
                                <td className="px-4 py-3 text-right align-top">
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <button 
                                      onClick={() => {
                                        setEditingJudgeId(j.id);
                                        setEditingJudgeData({ name: j.name, pin: j.pin, allowed: judgeAccessMap[j.id] || [] });
                                      }}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Edit Juri"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (!confirm("Hapus juri ini? Juri tidak akan bisa login lagi dengan PIN ini.")) return;
                                        await fetch(`/api/admin/judges?id=${j.id}`, { method: "DELETE" });
                                        fetchJudges();
                                      }}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Hapus Juri"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                        {judges.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500">Belum ada juri yang didaftarkan.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>
            </div>
          )}

          {activeTab === "Manajemen Soal Quiz" && (
            <Card>
              <CardHeader
                title="Manajemen Soal Quiz"
                description="Kelola daftar soal untuk sesi quiz live."
                action={
                  <div className="flex items-center gap-2">
                    <button onClick={fetchQuestions} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                      <RefreshCw size={14} className={questionsLoading ? "animate-spin" : ""} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsNewQuestion(true);
                        setEditingQuestion({ id: "", question: "", options: ["", "", "", ""], correct: 0, timeLimit: 20, category: "Umum", emoji: "❓" });
                      }}
                      className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={14} /> Tambah Soal
                    </button>
                  </div>
                }
              />
              <div className="p-2">
                {questionsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-400" /></div>
                ) : quizQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={32} className="text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Belum ada soal quiz</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-y border-zinc-200">
                          <th className="px-4 py-3 text-left font-medium">Kategori</th>
                          <th className="px-4 py-3 text-left font-medium">Pertanyaan</th>
                          <th className="px-4 py-3 text-left font-medium">Opsi & Jawaban</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {quizQuestions.map((q) => (
                          <tr key={q.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{q.emoji}</span>
                                <span className="font-medium text-zinc-700">{q.category}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-zinc-900 max-w-xs">{q.question}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1 text-xs">
                                {q.options.map((opt, i) => (
                                  <div key={i} className={`flex items-center gap-1 ${i === q.correct ? "text-emerald-600 font-bold" : "text-zinc-500"}`}>
                                    <span className="w-4">{["A", "B", "C", "D"][i]}.</span>
                                    <span className="truncate max-w-[200px]">{opt}</span>
                                    {i === q.correct && <CheckCircle2 size={12} />}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => { setIsNewQuestion(false); setEditingQuestion({ ...q }); }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "E-Sertifikat" && (() => {
              // Compute auto winners from scoreLogs
              const FG_COMPS = ["Perform Yel-Yel","Fun Games - Quiz Challenge","Fun Games - Word Puzzle","Fun Games - Estafet Sedotan","Fun Games - Cup Rush"];
              const funMap: Record<string,number> = {};
              const costumeMap: Record<string,number> = {};
              const potluckMap: Record<string,number> = {};
              for (const log of scoreLogs) {
                if (log.value <= 0) continue;
                if (FG_COMPS.includes(log.competition)) funMap[log.group_name] = (funMap[log.group_name]||0)+log.value;
                else if (log.competition === "Best Costume") costumeMap[log.group_name] = (costumeMap[log.group_name]||0)+log.value;
                else if (log.competition === "Potluck - Pesta Rasa Merah Putih") potluckMap[log.group_name] = (potluckMap[log.group_name]||0)+log.value;
              }
              const toRanked = (m: Record<string,number>) => Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3);
              const POSITIONS = ["Juara 1","Juara 2","Juara 3"];

              return (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Form Section */}
              <Card className="w-full lg:w-1/3 p-6 h-fit">
                <h2 className="text-lg font-bold text-zinc-900 mb-4">Buat E-Sertifikat</h2>
                <div className="space-y-4">

                  {/* Quick Pick from Auto Winners */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-2">Pilih Pemenang Cepat</label>
                    
                    {/* Fun Games */}
                    {toRanked(funMap).length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#102A4C] mb-1.5">🎮 Fun Games</p>
                        <div className="space-y-1">
                          {toRanked(funMap).map(([name, score], i) => (
                            <button key={name} type="button"
                              onClick={() => { setCertTemplate("fungames"); setCertData({ name, category: "Fun Games", event: "HUT RI ke-81 GESIT Fun Games", position: POSITIONS[i], date: "19 August 2026" }); }}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${certData.name === name && certData.category === "Fun Games" ? "bg-[#102A4C] text-white border-[#102A4C]" : "bg-white border-zinc-200 hover:border-[#102A4C] text-zinc-700"}`}>
                              <span className="font-bold">{["🥇","🥈","🥉"][i]} {name}</span>
                              <span className="text-[10px] ml-2 opacity-60">{POSITIONS[i]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Best Costume */}
                    {toRanked(costumeMap).length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 mb-1.5">👗 Best Costume</p>
                        <div className="space-y-1">
                          {toRanked(costumeMap).map(([name, score], i) => (
                            <button key={name} type="button"
                              onClick={() => { setCertTemplate("fungames"); setCertData({ name, category: "Best Costume", event: "HUT RI ke-81 GESIT Fun Games", position: POSITIONS[i], date: "19 August 2026" }); }}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${certData.name === name && certData.category === "Best Costume" ? "bg-purple-700 text-white border-purple-700" : "bg-white border-zinc-200 hover:border-purple-400 text-zinc-700"}`}>
                              <span className="font-bold">{["🥇","🥈","🥉"][i]} {name}</span>
                              <span className="text-[10px] ml-2 opacity-60">{POSITIONS[i]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Potluck */}
                    {toRanked(potluckMap).length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1.5">🍽️ Potluck Nusantara</p>
                        <div className="space-y-1">
                          {toRanked(potluckMap).map(([name, score], i) => (
                            <button key={name} type="button"
                              onClick={() => { setCertTemplate("fungames"); setCertData({ name, category: "Potluck Nusantara", event: "HUT RI ke-81 GESIT Fun Games", position: POSITIONS[i], date: "19 August 2026" }); }}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${certData.name === name && certData.category === "Potluck Nusantara" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-zinc-200 hover:border-emerald-400 text-zinc-700"}`}>
                              <span className="font-bold">{["🥇","🥈","🥉"][i]} {name}</span>
                              <span className="text-[10px] ml-2 opacity-60">{POSITIONS[i]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Badminton winners */}
                    {winners.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">🏸 Badminton</p>
                        <select
                          value={certWinnerId}
                          onChange={(e) => {
                            setCertWinnerId(e.target.value);
                            if (e.target.value) {
                              const w = winners.find(x => x.id === e.target.value);
                              if (w) { setCertTemplate("badminton"); setCertData({ name: w.name, category: w.category, event: w.event, position: w.position, date: "19 August 2026" }); }
                            }
                          }}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 bg-white"
                        >
                          <option value="">-- Pilih Pemenang Badminton --</option>
                          {winners.map(w => (
                            <option key={w.id} value={w.id}>{w.name} - {w.position} ({w.event})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Template Kosong (Pra-Event) */}
                    <div className="mt-4 pt-3 border-t border-zinc-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">🖨️ Cetak Template Kosong (Pra-Event)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {POSITIONS.map((pos, i) => (
                          <button key={`fun-b-${pos}`} type="button"
                            onClick={() => { setCertWinnerId(""); setCertTemplate("fungames"); setCertData({ name: "", category: "Fun Games", event: "HUT RI ke-81 GESIT Fun Games", position: pos, date: "19 August 2026" }); }}
                            className="flex flex-col items-center justify-center p-1.5 border border-zinc-200 rounded-lg hover:bg-[#102A4C] hover:text-white hover:border-[#102A4C] transition-colors text-zinc-600">
                            <span className="text-xs mb-0.5">🎮</span>
                            <span className="text-[9px] font-bold text-center leading-tight">{pos}</span>
                          </button>
                        ))}
                        {POSITIONS.map((pos, i) => (
                          <button key={`cos-b-${pos}`} type="button"
                            onClick={() => { setCertWinnerId(""); setCertTemplate("fungames"); setCertData({ name: "", category: "Best Costume", event: "HUT RI ke-81 GESIT Fun Games", position: pos, date: "19 August 2026" }); }}
                            className="flex flex-col items-center justify-center p-1.5 border border-zinc-200 rounded-lg hover:bg-purple-700 hover:text-white hover:border-purple-700 transition-colors text-zinc-600">
                            <span className="text-xs mb-0.5">👗</span>
                            <span className="text-[9px] font-bold text-center leading-tight">{pos}</span>
                          </button>
                        ))}
                        {POSITIONS.map((pos, i) => (
                          <button key={`pot-b-${pos}`} type="button"
                            onClick={() => { setCertWinnerId(""); setCertTemplate("fungames"); setCertData({ name: "", category: "Potluck Nusantara", event: "HUT RI ke-81 GESIT Fun Games", position: pos, date: "19 August 2026" }); }}
                            className="flex flex-col items-center justify-center p-1.5 border border-zinc-200 rounded-lg hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-colors text-zinc-600">
                            <span className="text-xs mb-0.5">🍽️</span>
                            <span className="text-[9px] font-bold text-center leading-tight">{pos}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 my-1"></div>

                  {/* Template Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Template</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setCertTemplate("badminton")}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-semibold transition-all ${certTemplate === "badminton" ? "border-red-600 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}>
                        <span>🏸</span> Badminton
                      </button>
                      <button type="button" onClick={() => setCertTemplate("fungames")}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-semibold transition-all ${certTemplate === "fungames" ? "border-red-600 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}>
                        <span>🎮</span> Fun Games
                      </button>
                    </div>
                  </div>

                  {/* Manual fields */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Penerima</label>
                    <input type="text" value={certData.name}
                      onChange={(e) => setCertData({...certData, name: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Posisi / Gelar</label>
                    <input type="text" value={certData.position}
                      onChange={(e) => setCertData({...certData, position: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Kategori</label>
                    <input type="text" value={certData.category}
                      onChange={(e) => setCertData({...certData, category: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Event / Lomba</label>
                    <input type="text" value={certData.event}
                      onChange={(e) => setCertData({...certData, event: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Tanggal</label>
                    <input type="text" value={certData.date}
                      onChange={(e) => setCertData({...certData, date: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  
                  <button
                    onClick={handleDownloadCert}
                    disabled={isDownloading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Unduh Sertifikat (PNG)
                  </button>
                </div>
              </Card>

              {/* Preview Section */}
              <div className="w-full lg:w-2/3 flex flex-col items-center justify-center bg-zinc-200 p-8 rounded-xl overflow-x-auto">
                <div 
                  ref={certRef}
                  className="relative shrink-0 overflow-hidden shadow-2xl"
                  style={{ 
                    width: "800px", 
                    height: "565px",
                    backgroundImage: certTemplate === "fungames" ? "url('/E-CERTIFICATE-2.jpg')" : "url('/E-CERTIFICATE-1.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10 w-full h-full flex flex-col items-center pt-[110px] px-16 text-center">
                    
                    <h1 className="text-[40px] font-black text-[#0B1A3A] tracking-[0.2em] mb-0.5 uppercase" style={{ fontFamily: "var(--font-playfair)" }}>Certificate</h1>
                    
                    <div className="flex items-center justify-center gap-4 w-full mb-2">
                      <div className="h-[1px] bg-[#c49b5b] flex-1 max-w-[100px]"></div>
                      <h2 className="text-[12px] text-[#c49b5b] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-playfair)" }}>Of Achievement</h2>
                      <div className="h-[1px] bg-[#c49b5b] flex-1 max-w-[100px]"></div>
                    </div>
                    
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c49b5b] mb-3"></div>
                    
                    <p className="text-[12px] text-zinc-700 italic mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>This certificate is proudly presented to</p>
                    
                    {certData.name ? (
                      <>
                        <h2 className="text-[34px] font-bold text-[#b91c1c] uppercase tracking-widest mb-2 pb-2 border-b border-[#c49b5b]/30 px-16 inline-block leading-none" style={{ fontFamily: "var(--font-montserrat)" }}>
                          {certData.name}
                        </h2>
                        <p className="text-[12px] text-zinc-700 font-medium mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>as</p>
                      </>
                    ) : certTemplate === "fungames" ? (
                      <div className="mb-8" /> // extra space since name is missing
                    ) : (
                      <>
                        <h2 className="text-[34px] font-bold text-[#b91c1c] uppercase tracking-widest mb-2 pb-2 border-b border-[#c49b5b]/30 px-16 inline-block leading-none" style={{ fontFamily: "var(--font-montserrat)" }}>
                          <span style={{ borderBottom: "2px solid #b91c1c", display: "inline-block", width: "260px" }}>&nbsp;</span>
                        </h2>
                        <p className="text-[12px] text-zinc-700 font-medium mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>as</p>
                      </>
                    )}
                    
                    <h3 
                      className="font-black text-[#b91c1c] uppercase leading-none mb-1" 
                      style={{ 
                        fontFamily: "var(--font-saira)",
                        fontSize: (certData.position || "1st PLACE").length > 10 ? "26px" : "34px",
                        letterSpacing: (certData.position || "1st PLACE").length > 10 ? "0.08em" : "0.2em",
                      }}
                    >
                      {certData.position || "1st PLACE"}
                    </h3>
                    
                    {/* Category - hidden when "-" */}
                    {(certData.category && certData.category !== "-") ? (
                      <h4 className="text-[14px] font-bold text-[#b91c1c] uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
                        {certTemplate === "fungames" ? `GESIT ${certData.category}` : certData.category}
                      </h4>
                    ) : (
                      <div className="mb-2" />
                    )}

                    {/* Gold Divider */}
                    <div className="flex items-center gap-3 w-full max-w-[380px] mb-2">
                      <div className="h-[1px] bg-[#c49b5b] flex-1" />
                      <div className="w-1.5 h-1.5 rotate-45 bg-[#c49b5b]" />
                      <div className="h-[1px] bg-[#c49b5b] flex-1" />
                    </div>

                    <h4 className="text-[16px] font-bold text-[#0B1A3A] uppercase tracking-wide mb-0.5" style={{ fontFamily: "var(--font-montserrat)" }}>
                      {certTemplate === "fungames" ? "HUT RI 81st ANNIVERSARY" : (certData.event || "GESIT INTERNAL 17TH AUGUST EVENT 2026")}
                    </h4>

                    <p className="text-[13px] font-bold text-[#b91c1c] italic tracking-wide mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>
                      "GESIT Bersatu dalam Sportivitas"
                    </p>
                    
                    {certTemplate === "fungames" ? (
                      <div className="text-[10px] text-zinc-700 max-w-[500px] leading-relaxed flex flex-col gap-2 font-bold" style={{ fontFamily: "var(--font-montserrat)" }}>
                        <p>In recognition of outstanding achievement, exceptional teamwork, and remarkable sportsmanship demonstrated throughout the GESIT {certData.category}.</p>
                        <p>Your dedication, enthusiasm, and spirit of unity have truly embodied the values of sportsmanship and togetherness.</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-600 max-w-[420px] leading-relaxed font-medium" style={{ fontFamily: "var(--font-montserrat)" }}>
                        In recognition of outstanding achievement, sportsmanship,<br/>
                        and dedication throughout the competition.
                      </p>
                    )}

                    {/* QR Code */}
                    <div className="absolute bottom-6 right-16 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm flex flex-col items-center">
                      <div className="w-12 h-12 bg-zinc-100 mb-1 flex items-center justify-center">
                        <QRCodeSVG 
                          value={`https://event.gesit.co.id/e-certificate/${
                            certWinnerId || 
                            encodeURIComponent(`${certData.category}-${certData.position}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                          }`}
                          size={46} 
                          level="M" 
                        />
                      </div>
                      <p className="text-[4px] font-bold tracking-widest uppercase text-center mt-0.5">Scan to Verify<br/>Certificate</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center">
                  Preview Sertifikat. Sertifikat yang diunduh akan memiliki resolusi tinggi yang siap dicetak.
                </p>
              </div>
            </div>
          );
        })()}
        </div>
      </main>

      {/* Modals */}
      {editingParticipant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900">{isNewParticipant ? "Tambah Peserta Manual" : "Edit Detail Peserta"}</h3>
              <button onClick={() => { setEditingParticipant(null); setIsNewParticipant(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveParticipant} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editingParticipant.name}
                  onChange={e => setEditingParticipant({...editingParticipant, name: e.target.value})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900" 
                  required
                />
              </div>
              
              {isNewParticipant ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Lantai</label>
                      <select 
                        value={editingParticipant.floor}
                        onChange={e => setEditingParticipant({...editingParticipant, floor: e.target.value})}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 bg-white"
                        required
                      >
                        <option value="Lantai 26">Lantai 26</option>
                        <option value="Lantai 27">Lantai 27</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Kategori</label>
                      <select 
                        value={editingParticipant.category || ""}
                        onChange={e => setEditingParticipant({...editingParticipant, category: e.target.value})}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 bg-white"
                        required
                      >
                        <option value="Single Putra">Single Putra</option>
                        <option value="Single Putri">Single Putri</option>
                        <option value="Ganda Campuran">Ganda Campuran</option>
                      </select>
                    </div>
                  </div>
                  {editingParticipant.category === "Ganda Campuran" && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Partner</label>
                      <input 
                        type="text" 
                        value={editingParticipant.partner || ""}
                        onChange={e => setEditingParticipant({...editingParticipant, partner: e.target.value})}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" 
                        placeholder="Wajib untuk Ganda Campuran"
                        required={editingParticipant.category === "Ganda Campuran"}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Panggilan (Utk Bagan)</label>
                    <input 
                      type="text" 
                      value={editingParticipant.call_name || ""}
                      onChange={e => setEditingParticipant({...editingParticipant, call_name: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" 
                      placeholder="Opsional, max 10 huruf direkomendasikan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Slot Semi-Final</label>
                      <select 
                        value={editingParticipant.bracket_position || ""} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, bracket_position: e.target.value})}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                      >
                        <option value="">-- Belum Diset --</option>
                        <option value="1">Slot 1 (Kiri Atas)</option>
                        <option value="2">Slot 2 (Kiri Bawah)</option>
                        <option value="3">Slot 3 (Kanan Atas)</option>
                        <option value="4">Slot 4 (Kanan Bawah)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Slot Final</label>
                      <select 
                        value={editingParticipant.final_position || ""} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, final_position: e.target.value})}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                      >
                        <option value="">-- Belum Diset --</option>
                        <option value="L">Final (Kiri)</option>
                        <option value="R">Final (Kanan)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setEditingParticipant(null); setIsNewParticipant(false); }} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingParticipant} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingParticipant && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{isNewWinner ? "Add Winner" : "Edit Winner"}</h3>
              <button onClick={() => setEditingWinner(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveWinner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Event / Competition</label>
                <input
                  type="text"
                  value={editingWinner.event}
                  onChange={(e) => setEditingWinner({...editingWinner, event: e.target.value})}
                  placeholder="e.g. Badminton, Fun Run..."
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                <select
                  value={editingWinner.category}
                  onChange={(e) => setEditingWinner({ ...editingWinner, category: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                  required
                >
                  <option value="-">None / General</option>
                  <option value="Men's Singles">Men's Singles (Badminton)</option>
                  <option value="Women's Singles">Women's Singles (Badminton)</option>
                  <option value="Mixed Doubles">Mixed Doubles (Badminton)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Position / Title</label>
                <select
                  value={editingWinner.position}
                  onChange={(e) => setEditingWinner({ ...editingWinner, position: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                  required
                >
                  <option value="1st Place">1st Place</option>
                  <option value="2nd Place">2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Best of the Best">Best of the Best</option>
                  <option value="Favorite">Favorite</option>
                  <option value="Winner">Winner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Winner / Team Name</label>
                <input 
                  type="text" 
                  value={editingWinner.name} 
                  onChange={(e) => setEditingWinner({...editingWinner, name: e.target.value})}
                  placeholder="Full name or team name"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingWinner(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={savingWinner} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingWinner && <Loader2 size={14} className="animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <div>
                <h3 className="font-bold text-zinc-900">Edit Jadwal & Wasit</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editingSchedule.category} — {editingSchedule.match_name}</p>
              </div>
              <button onClick={() => setEditingSchedule(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Hari</label>
                  <select
                    value={editingSchedule.day}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, day: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                    required
                  >
                    <option value="Hari 1">Hari 1 (Selasa)</option>
                    <option value="Hari 2">Hari 2 (Rabu)</option>
                    <option value="Hari 3">Hari 3 (Kamis)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Jam</label>
                  <input
                    type="text"
                    value={editingSchedule.time}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, time: e.target.value })}
                    placeholder="Contoh: 17.00 - 18.00"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Lapangan / Court</label>
                <input
                  type="text"
                  value={editingSchedule.court}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, court: e.target.value })}
                  placeholder="Contoh: Court 2, Court 4"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Wasit</label>
                <input
                  type="text"
                  value={editingSchedule.referee}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, referee: e.target.value })}
                  placeholder="Contoh: Argadana / Aditya"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingSchedule(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingSchedule} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingSchedule && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{isNewQuestion ? "Tambah Soal Quiz" : "Edit Soal Quiz"}</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Pertanyaan</label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none h-20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={editingQuestion.emoji}
                    onChange={(e) => setEditingQuestion({...editingQuestion, emoji: e.target.value})}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Batas Waktu (detik)</label>
                <input
                  type="number"
                  value={editingQuestion.timeLimit || (editingQuestion as any).timelimit || 20}
                  onChange={(e) => setEditingQuestion({...editingQuestion, timeLimit: parseInt(e.target.value) || 20})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  required
                />
              </div>
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Pilihan Jawaban (Tandai yang benar)</label>
                {[0, 1, 2, 3].map(idx => (
                  <div key={idx} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={editingQuestion.correct === idx} 
                      onChange={() => setEditingQuestion({...editingQuestion, correct: idx})}
                      className="w-4 h-4 text-zinc-900 focus:ring-zinc-900"
                    />
                    <input
                      type="text"
                      value={editingQuestion.options[idx] || ""}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[idx] = e.target.value;
                        setEditingQuestion({...editingQuestion, options: newOpts});
                      }}
                      placeholder={`Opsi ${["A", "B", "C", "D"][idx]}`}
                      className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingQuestion} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingQuestion && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingGroupScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{isNewGroupScore ? "Tambah Kelompok" : "Edit Skor Kelompok"}</h3>
              <button onClick={() => setEditingGroupScore(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveGroupScore} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Kelompok</label>
                <input
                  type="text"
                  value={editingGroupScore.group_name}
                  onChange={(e) => setEditingGroupScore({...editingGroupScore, group_name: e.target.value})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Skor Manual</label>
                <input
                  type="number"
                  value={editingGroupScore.score}
                  onChange={(e) => setEditingGroupScore({...editingGroupScore, score: parseInt(e.target.value) || 0})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingGroupScore(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingGroupScore} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingGroupScore && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border-2 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <X size={20} className="text-red-600" />}
            <span className="font-bold text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
