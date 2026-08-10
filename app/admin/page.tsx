"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LogOut, Users, Trophy, Monitor, RefreshCw,
  ExternalLink, Loader2, LayoutDashboard, Gamepad2,
  TrendingUp, Circle, Edit2, Plus, Trash2, X, Award, Download
} from "lucide-react";
import { toPng } from "html-to-image";
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

function SlotBox({ slotNumber, type = "bracket", participants, category, onDrop, onRemove }: any) {
  const p = participants.find((x: any) => 
    x.category === category && 
    (type === "bracket" ? x.bracket_position === slotNumber : x.final_position === slotNumber)
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const label = type === "final" ? `Final ${slotNumber}` : `Slot ${slotNumber}`;

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, slotNumber, type); }}
      className={`relative w-full p-4 rounded-xl border-2 transition-all ${
        p 
          ? type === "final" 
            ? "bg-red-900/40 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)] border-solid" 
            : "bg-zinc-800 border-zinc-700 border-solid shadow-md" 
          : isDragOver 
            ? type === "final"
              ? "bg-red-900/20 border-red-500 border-dashed"
              : "bg-zinc-700 border-zinc-400 border-dashed" 
            : type === "final"
              ? "bg-zinc-900/50 border-red-900/30 border-dashed hover:border-red-700"
              : "bg-zinc-800/50 border-zinc-700 border-dashed hover:border-zinc-500 hover:bg-zinc-800"
      }`}
    >
      <div className={`absolute -top-2.5 left-4 px-2 text-[10px] font-black tracking-widest uppercase ${type === "final" ? "bg-red-950 text-red-400" : "bg-zinc-900 text-zinc-500"}`}>
        {label}
      </div>
      
      {p ? (
        <div className="flex justify-between items-center group">
          <div className="min-w-0 pr-2">
            <div className={`font-bold text-sm truncate ${type === "final" ? "text-red-100" : "text-white"}`}>
              {p.call_name || p.name.split(" ")[0]}
            </div>
            {p.partner && p.partner !== "-" && (
              <div className={`text-[10px] truncate ${type === "final" ? "text-red-300" : "text-zinc-400"}`}>
                & {p.partner.split(" ")[0]}
              </div>
            )}
          </div>
          <button 
            onClick={() => onRemove(p.id, type)}
            className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shrink-0"
            title="Keluarkan dari bagan"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div className={`h-10 flex items-center justify-center text-xs font-medium ${type === "final" ? "text-red-900/50" : "text-zinc-500"}`}>
          Drag nama ke sini
        </div>
      )}
    </div>
  );
}

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
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Edit Participant Modal
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [savingParticipant, setSavingParticipant] = useState(false);

  // Bracket Drag & Drop States
  const [bracketCategory, setBracketCategory] = useState("Single Putra");

  // Edit Winner Modal
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [savingWinner, setSavingWinner] = useState(false);
  const [isNewWinner, setIsNewWinner] = useState(false);

  // E-Sertifikat
  const [certWinnerId, setCertWinnerId] = useState("");
  const [certData, setCertData] = useState({ name: "", category: "", event: "", position: "", date: "13 August 2026" });
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAdminEmail(user.email || "");
    });
    fetchParticipants();
    fetchScores();
    fetchWinners();
  }, [fetchParticipants, fetchScores, fetchWinners]);

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

  const handleRemoveFromSlot = async (participantId: string, type: "bracket" | "final") => {
    await updateBracketPosition(participantId, null, type);
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    setSavingParticipant(true);
    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingParticipant.id,
          name: editingParticipant.name,
          call_name: editingParticipant.call_name || "",
          bracket_position: editingParticipant.bracket_position || null,
          final_position: editingParticipant.final_position || null,
        }),
      });
      if (res.ok) {
        await fetchParticipants();
        setEditingParticipant(null);
      } else {
        alert("Gagal mengupdate peserta");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
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

  const sessions = [...new Set(quizScores.map(s => s.pin))].length;

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { icon: <Users size={16} />, label: "Peserta & Bagan" },
    { icon: <Trophy size={16} />, label: "Manajemen Pemenang" },
    { icon: <Award size={16} />, label: "E-Sertifikat" },
  ];

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-zinc-200">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-100 shrink-0">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
          <Image src="/gesit_logo.png" alt="GESIT" width={18} height={18} className="object-contain mix-blend-multiply brightness-0 invert" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 leading-none">GESIT</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-3 mt-2">Menu</p>
        {navItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === item.label ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
        <div className="pt-4">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-3">Aksi Cepat</p>
          <Link href="/quiz/host" target="_blank" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Monitor size={16} /> Layar Quiz Host
            <ExternalLink size={12} className="ml-auto" />
          </Link>
          <Link href="/" target="_blank" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Circle size={16} /> Website Utama
            <ExternalLink size={12} className="ml-auto" />
          </Link>
        </div>
      </nav>
      <div className="p-3 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{adminEmail?.[0]?.toUpperCase()}</span>
          </div>
          <span className="text-xs text-zinc-500 truncate flex-1">{adminEmail}</span>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={15} /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="hidden lg:block w-60 shrink-0 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Image src="/gesit_logo.png" alt="GESIT" width={16} height={16} className="object-contain mix-blend-multiply brightness-0 invert" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-500 text-sm font-medium">Menu</button>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      {sidebarOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-white border-b border-zinc-200 z-30 p-4 shadow-xl">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => { setActiveTab(item.label); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === item.label ? "bg-zinc-900 text-white" : "text-zinc-500"}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 lg:pl-60 pt-14 lg:pt-0 min-w-0">
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
                        onClick={() => setBracketCategory(cat)}
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
                      <p className="text-[11px] text-zinc-500">Tarik ke Semi-Final atau Final</p>
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
                              className="p-3 bg-white border border-zinc-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-zinc-400 transition-colors flex justify-between items-center group"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-sm text-zinc-900 truncate">{p.name}</div>
                                {p.call_name && <div className="text-[10px] text-zinc-500 truncate">Panggilan: {p.call_name}</div>}
                                {p.partner && p.partner !== "-" && <div className="text-[10px] text-zinc-500 truncate">Partner: {p.partner}</div>}
                              </div>
                              <div className="shrink-0 flex flex-col gap-1 items-end">
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
                        <SlotBox slotNumber="1" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
                        <SlotBox slotNumber="2" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
                      </div>
                      
                      {/* Center Final Slots */}
                      <div className="flex flex-col items-center justify-center gap-4 px-2 md:px-4 shrink-0 w-32 md:w-48 h-full">
                        {/* Final Left Box */}
                        <SlotBox slotNumber="L" type="final" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
                        
                        <div className="flex flex-col items-center justify-center my-2">
                          <Trophy className="w-10 h-10 md:w-14 md:h-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] mb-2" strokeWidth={1.5} />
                          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black px-2 py-1 md:px-3 md:py-1 text-[9px] md:text-[10px] tracking-widest rounded shadow-[0_0_20px_rgba(220,38,38,0.3)] text-center whitespace-nowrap">
                            GRAND FINAL
                          </div>
                        </div>

                        {/* Final Right Box */}
                        <SlotBox slotNumber="R" type="final" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
                      </div>

                      {/* R-side Slots */}
                      <div className="flex flex-col justify-around gap-8 h-full flex-1 min-w-0">
                        <SlotBox slotNumber="3" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
                        <SlotBox slotNumber="4" type="bracket" participants={participants} category={bracketCategory} onDrop={handleDropToSlot} onRemove={handleRemoveFromSlot} />
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
                    <button onClick={fetchParticipants} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors rounded">
                      <RefreshCw size={14} className={participantsLoading ? "animate-spin" : ""} />
                    </button>
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

          {activeTab === "Manajemen Pemenang" && (
            <Card>
              <CardHeader
                title="Daftar Pemenang (Hall of Fame)"
                description="Kelola siapa saja yang menjuarai perlombaan"
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
                          <th className="px-4 py-3 text-left font-medium">Posisi / Gelar</th>
                          <th className="px-4 py-3 text-left font-medium">Nama Pemenang</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {winners.map((w) => (
                          <tr key={w.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-zinc-900">{w.event}</td>
                            <td className="px-4 py-3 text-zinc-700">{w.category}</td>
                            <td className="px-4 py-3">
                              <Badge>{w.position}</Badge>
                            </td>
                            <td className="px-4 py-3 font-bold text-zinc-900">{w.name}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => { setIsNewWinner(false); setEditingWinner({ ...w }); }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteWinner(w.id)}
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

          {activeTab === "E-Sertifikat" && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Form Section */}
              <Card className="w-full lg:w-1/3 p-6 h-fit">
                <h2 className="text-lg font-bold text-zinc-900 mb-4">Buat E-Sertifikat</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Pilih dari Pemenang (Opsional)</label>
                    <select 
                      value={certWinnerId}
                      onChange={(e) => {
                        setCertWinnerId(e.target.value);
                        if (e.target.value) {
                          const w = winners.find(x => x.id === e.target.value);
                          if (w) setCertData({ name: w.name, category: w.category, event: w.event, position: w.position, date: "13 August 2026" });
                        }
                      }}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 bg-white"
                    >
                      <option value="">-- Pilih Pemenang --</option>
                      {winners.map(w => (
                        <option key={w.id} value={w.id}>{w.name} - {w.position} ({w.event})</option>
                      ))}
                    </select>
                  </div>
                  <div className="border-t border-zinc-100 my-4"></div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Penerima</label>
                    <input 
                      type="text" value={certData.name} 
                      onChange={(e) => setCertData({...certData, name: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Posisi / Gelar</label>
                    <input 
                      type="text" value={certData.position} 
                      onChange={(e) => setCertData({...certData, position: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Kategori</label>
                    <input 
                      type="text" value={certData.category} 
                      onChange={(e) => setCertData({...certData, category: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Event / Lomba</label>
                    <input 
                      type="text" value={certData.event} 
                      onChange={(e) => setCertData({...certData, event: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Tanggal</label>
                    <input 
                      type="text" value={certData.date} 
                      onChange={(e) => setCertData({...certData, date: e.target.value})}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  
                  <button 
                    onClick={handleDownloadCert}
                    disabled={isDownloading || !certData.name}
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
                    backgroundImage: "url('/hero_bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10 w-full h-full flex flex-col items-center pt-10 px-16 text-center">
                    
                    <h1 className="text-[42px] font-black text-[#0B1A3A] tracking-[0.2em] mb-1 font-serif uppercase">Certificate</h1>
                    
                    <div className="flex items-center justify-center gap-4 w-full mb-6">
                      <div className="h-[1px] bg-[#c49b5b] flex-1 max-w-[100px]"></div>
                      <h2 className="text-[14px] text-[#c49b5b] tracking-[0.3em] uppercase font-serif">Of Achievement</h2>
                      <div className="h-[1px] bg-[#c49b5b] flex-1 max-w-[100px]"></div>
                    </div>
                    
                    <div className="w-2 h-2 rotate-45 border border-[#c49b5b] mb-6"></div>
                    
                    <p className="text-[13px] text-zinc-700 italic mb-6">This certificate is proudly presented to</p>
                    
                    <h2 className="text-4xl font-bold text-[#b91c1c] capitalize font-serif mb-4 pb-2 border-b border-[#c49b5b]/30 px-12 inline-block">
                      {certData.name || "Nama Penerima"}
                    </h2>
                    
                    <p className="text-[13px] text-zinc-700 font-medium mb-3">as</p>
                    
                    <h3 className="text-3xl font-black text-[#b91c1c] uppercase tracking-wider mb-3 font-serif">
                      {certData.position || "PLACE"}
                    </h3>
                    
                    {/* Ribbon for Category */}
                    <div className="relative inline-block mb-6">
                      <div className="bg-[#991b1b] text-white text-xs font-bold uppercase tracking-widest px-8 py-2 relative z-10 shadow-sm">
                        {certData.category || "CATEGORY"}
                      </div>
                      <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-y-[14px] border-y-transparent border-r-[12px] border-r-[#7f1d1d] z-0"></div>
                      <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-0 h-0 border-y-[14px] border-y-transparent border-l-[12px] border-l-[#7f1d1d] z-0"></div>
                    </div>
                    
                    <h4 className="text-[15px] font-bold text-[#0B1A3A] uppercase tracking-wide mb-4">
                      {certData.event || "GESIT INTERNAL BADMINTON TOURNAMENT 2026"}
                    </h4>
                    
                    <p className="text-[11px] text-zinc-600 max-w-[480px] leading-relaxed mb-6">
                      In recognition of outstanding performance, sportsmanship,<br/>
                      and dedication throughout the tournament.
                    </p>
                    
                    <div className="flex justify-between w-full absolute bottom-12 px-16">
                      <div className="text-center w-48">
                        <div className="h-16 flex items-center justify-center">
                          {/* Signature Placeholder */}
                        </div>
                        <div className="w-full border-b border-[#c49b5b] mb-1"></div>
                        <p className="text-[9px] font-bold text-zinc-800 tracking-wider">TOURNAMENT COMMITTEE</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-[11px] text-zinc-800 mb-8 font-medium">Jakarta, {certData.date || "13 August 2026"}</p>
                      </div>
                      
                      <div className="text-center w-48">
                        <div className="h-16 flex items-center justify-center">
                          {/* Signature Placeholder */}
                        </div>
                        <div className="w-full border-b border-[#c49b5b] mb-1"></div>
                        <p className="text-[9px] font-bold text-zinc-800 tracking-wider">MANAGEMENT / DIRECTOR</p>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="absolute bottom-6 right-6 bg-white p-2 rounded-lg border border-zinc-200 shadow-sm flex flex-col items-center">
                      <div className="w-16 h-16 bg-zinc-100 mb-1 flex items-center justify-center">
                        <div className="w-14 h-14" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%221%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22/%3E%3Cpath d=%22M7 7h.01%22/%3E%3Cpath d=%22M17 7h.01%22/%3E%3Cpath d=%22M7 17h.01%22/%3E%3Cpath d=%22M17 17h.01%22/%3E%3Cpath d=%22M7 12h.01%22/%3E%3Cpath d=%22M12 7h.01%22/%3E%3Cpath d=%22M12 12h.01%22/%3E%3Cpath d=%22M17 12h.01%22/%3E%3Cpath d=%22M12 17h.01%22/%3E%3C/svg%3E')", backgroundSize: "cover", opacity: 0.5 }}></div>
                      </div>
                      <p className="text-[6px] font-bold tracking-widest uppercase">CERTIFICATE ID</p>
                    </div>

                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center">
                  Preview Sertifikat. Sertifikat yang diunduh akan memiliki resolusi tinggi yang siap dicetak.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- Modals --- */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">Edit Data & Bagan</h3>
              <button onClick={() => setEditingParticipant(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveParticipant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editingParticipant.name} 
                  onChange={(e) => setEditingParticipant({...editingParticipant, name: e.target.value})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Panggilan (Ditampilkan di Bagan)</label>
                <input 
                  type="text" 
                  value={editingParticipant.call_name || ""} 
                  onChange={(e) => setEditingParticipant({...editingParticipant, call_name: e.target.value})}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingParticipant(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
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
              <h3 className="font-bold text-zinc-900">{isNewWinner ? "Tambah Pemenang" : "Edit Pemenang"}</h3>
              <button onClick={() => setEditingWinner(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveWinner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Event / Lomba Puncak Acara</label>
                <input
                  type="text"
                  value={editingWinner.event}
                  onChange={(e) => setEditingWinner({...editingWinner, event: e.target.value})}
                  placeholder="Contoh: Badminton, Fun Run..."
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Kategori</label>
                <select
                  value={editingWinner.category}
                  onChange={(e) => setEditingWinner({ ...editingWinner, category: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                  required
                >
                  <option value="-">Tidak Ada / Umum</option>
                  <option value="Single Putra">Single Putra (Badminton)</option>
                  <option value="Single Putri">Single Putri (Badminton)</option>
                  <option value="Ganda Campuran">Ganda Campuran (Badminton)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Posisi / Gelar</label>
                <select
                  value={editingWinner.position}
                  onChange={(e) => setEditingWinner({ ...editingWinner, position: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                  required
                >
                  <option value="Juara 1">Juara 1</option>
                  <option value="Juara 2">Juara 2</option>
                  <option value="Juara 3">Juara 3</option>
                  <option value="Best of the Best">Best of the Best</option>
                  <option value="Favorit">Favorit</option>
                  <option value="Pemenang">Pemenang</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Pemenang / Tim</label>
                <input 
                  type="text" 
                  value={editingWinner.name} 
                  onChange={(e) => setEditingWinner({...editingWinner, name: e.target.value})}
                  placeholder="Nama lengkap atau nama tim"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingWinner(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingWinner} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                  {savingWinner && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
