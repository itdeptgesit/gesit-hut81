"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LogOut, Users, Trophy, Monitor, RefreshCw,
  ExternalLink, Loader2, LayoutDashboard, Gamepad2,
  TrendingUp, ChevronRight, Circle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Participant {
  Nama?: string;
  Divisi?: string;
  [key: string]: string | undefined;
}

interface QuizScore {
  id: string;
  created_at: string;
  name: string;
  score: number;
  pin: string;
}

// ─── Reusable primitives ───

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" }) {
  const cls = {
    default: "bg-zinc-100 text-zinc-600 border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  }[variant];
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cls}`}>{children}</span>;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    try {
      const res = await fetch("/api/participants");
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch {
      setParticipants([]);
    }
    setParticipantsLoading(false);
  }, []);

  const fetchScores = useCallback(async () => {
    setScoresLoading(true);
    const { data } = await supabase.from("quiz_scores").select("*").order("score", { ascending: false }).limit(20);
    setQuizScores(data || []);
    setScoresLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAdminEmail(user.email || "");
    });
    fetchParticipants();
    fetchScores();
  }, [fetchParticipants, fetchScores]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const sessions = [...new Set(quizScores.map(s => s.pin))].length;

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: "Dashboard", active: true },
    { icon: <Users size={16} />, label: "Peserta" },
    { icon: <Trophy size={16} />, label: "Skor Quiz" },
  ];

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-zinc-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-100 shrink-0">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
          <Image src="/gesit_logo.png" alt="GESIT" width={18} height={18} className="object-contain mix-blend-multiply brightness-0 invert" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 leading-none">GESIT</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-3 mt-2">Menu</p>
        {navItems.map((item) => (
          <button key={item.label} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>
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

      {/* User */}
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60 shrink-0 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Image src="/gesit_logo.png" alt="GESIT" width={16} height={16} className="object-contain mix-blend-multiply brightness-0 invert" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">Admin Panel</span>
        </div>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 lg:pl-60 pt-14 lg:pt-0 min-w-0">
        <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Selamat datang, <span className="font-medium">{adminEmail}</span></p>
            </div>
            <Badge variant="success"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sistem Aktif</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users size={18} />} label="Total Peserta" value={participantsLoading ? "—" : participants.length} />
            <StatCard icon={<Trophy size={18} />} label="Skor Tersimpan" value={scoresLoading ? "—" : quizScores.length} />
            <StatCard icon={<TrendingUp size={18} />} label="Skor Tertinggi" value={scoresLoading ? "—" : (quizScores[0]?.score?.toLocaleString() || "—")} />
            <StatCard icon={<Gamepad2 size={18} />} label="Sesi Quiz" value={scoresLoading ? "—" : sessions} />
          </div>

          {/* Quiz Host CTA */}
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

          {/* Table Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Skor Quiz */}
            <Card>
              <CardHeader
                title="Papan Skor"
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

            {/* Peserta */}
            <Card>
              <CardHeader
                title="Peserta Terdaftar"
                description={`${participants.length} peserta terdata`}
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
                  <div className="max-h-[380px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-400">
                          <th className="px-4 py-2 text-left font-medium">#</th>
                          <th className="px-4 py-2 text-left font-medium">Nama</th>
                          <th className="px-4 py-2 text-left font-medium">Divisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, i) => (
                          <tr key={i} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-2.5 text-zinc-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-zinc-900">{p.Nama || p["Nama Lengkap"] || "—"}</td>
                            <td className="px-4 py-2.5 text-zinc-500 text-xs">{p.Divisi || p["Lantai/Divisi"] || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
