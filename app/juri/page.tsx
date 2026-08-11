"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, Lock } from "lucide-react";
import Image from "next/image";

interface GroupScore {
  id: string;
  group_name: string;
  score: number;
}

export default function JudgePortal() {
  const [groups, setGroups] = useState<GroupScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [judgeName, setJudgeName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [competitionTitle, setCompetitionTitle] = useState("Fun Games");
  const [prevTitle, setPrevTitle] = useState("");
  // sessionScores: skor per lomba di portal juri (reset saat judul berganti)
  const [sessionScores, setSessionScores] = useState<Record<string, number>>({});

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase
      .from("group_scores")
      .select("*")
      .order("score", { ascending: false });
    
    if (data) setGroups(data as GroupScore[]);
    setLoading(false);
  }, []);

  const fetchTitle = useCallback(async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "competition_title")
      .single();
      
    if (data && data.value) {
      setCompetitionTitle(prev => {
        // Jika judulnya berubah, reset semua session scores ke 0
        if (prev !== "" && prev !== data.value) {
          setPrevTitle(data.value);
          setSessionScores({});
        }
        return data.value;
      });
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchTitle();
    
    const channel1 = supabase
      .channel("juri:group_scores")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_scores" }, fetchGroups)
      .subscribe();
      
    // Poll judul lomba setiap 5 detik karena Realtime Supabase butuh konfigurasi tambahan
    const titlePoll = setInterval(fetchTitle, 5000);
      
    return () => {
      supabase.removeChannel(channel1);
      clearInterval(titlePoll);
    };
  }, [fetchGroups, fetchTitle]);

  const handleScoreUpdate = async (id: string, diff: number) => {
    const group = groups.find(g => g.id === id);
    if (!group) return;
    
    setUpdatingId(id);
    // Update session scores (ditampilkan di portal juri saja)
    setSessionScores(prev => ({ ...prev, [id]: (prev[id] ?? 0) + diff }));

    try {
      const res = await fetch("/api/admin/group-scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, increment: diff }),
      });
      if (!res.ok) {
        await fetchGroups(); // rollback if failed
      }
    } catch (err) {
      console.error(err);
      await fetchGroups();
    }
    setUpdatingId(null);
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
        setJudgeName(data.judge.name);
        setIsAuthenticated(true);
      } else {
        setPinError(true);
      }
    } catch (err) {
      setPinError(true);
    }
    setLoginLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Akses Juri</h1>
          <p className="text-sm text-zinc-500 mb-8">Masukkan PIN khusus juri untuk mengakses portal penilaian.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password"
              inputMode="numeric"
              placeholder="PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              className={`w-full text-center text-2xl font-black tracking-[0.2em] bg-zinc-50 border ${pinError ? 'border-red-500 text-red-600' : 'border-zinc-200 text-zinc-900'} rounded-2xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/20`}
            />
            {pinError && <p className="text-red-500 text-xs font-bold mb-4">PIN salah!</p>}
            <button type="submit" disabled={loginLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-colors active:scale-95 text-lg shadow-lg shadow-red-600/20 flex items-center justify-center">
              {loginLoading ? <Loader2 className="animate-spin" size={24} /> : "Masuk Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/gesit_logo.png" alt="GESIT" width={40} height={40} className="object-contain drop-shadow-sm" />
          <div>
            <h1 className="font-black text-zinc-900 tracking-tight leading-none text-lg">PORTAL JURI</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Halo, {judgeName.split(" ")[0]}</p>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-2xl mx-auto space-y-4 mt-2">
        <div className="mb-6 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Sedang Berlangsung</p>
          <h2 className="text-zinc-900 text-lg font-black mb-1 uppercase tracking-tight leading-tight">{competitionTitle}</h2>
          <p className="text-zinc-500 text-xs mt-2">Pilih kelompok dan berikan poin sesuai performa. Poin otomatis tayang di Scoreboard.</p>
        </div>

        {groups.map((group, index) => (
          <div key={group.id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm relative overflow-hidden transition-transform transform hover:scale-[1.01]">
            {updatingId === group.id && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-600" size={28} />
              </div>
            )}
            
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                  index === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border border-yellow-200" :
                  index === 1 ? "bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-800 border border-zinc-200" :
                  index === 2 ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 border border-amber-600" :
                  "bg-zinc-100 text-zinc-500 border border-zinc-200"
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 text-xl uppercase tracking-tight leading-none mb-1">{group.group_name}</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{competitionTitle}</span>
                </div>
              </div>
                <div className="text-right bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                  <span className="block text-3xl font-black text-red-600 leading-none">{(sessionScores[group.id] ?? 0).toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block">Poin Sesi Ini</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              <button 
                onClick={() => handleScoreUpdate(group.id, -10)}
                disabled={updatingId === group.id}
                className="col-span-1 bg-white hover:bg-red-50 text-[#E31E24] font-black py-2.5 sm:py-3.5 rounded-xl border-2 border-[#E31E24]/20 transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm"
              >
                <span className="text-sm sm:text-lg leading-none">-10</span>
              </button>
              <button 
                onClick={() => handleScoreUpdate(group.id, 10)}
                disabled={updatingId === group.id}
                className="col-span-1 bg-white hover:bg-slate-50 text-[#102A4C] font-black py-2.5 sm:py-3.5 rounded-xl border-2 border-[#102A4C]/20 transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm"
              >
                <span className="text-sm sm:text-lg leading-none">+10</span>
              </button>
              <button 
                onClick={() => handleScoreUpdate(group.id, 25)}
                disabled={updatingId === group.id}
                className="col-span-1 bg-[#102A4C]/10 hover:bg-[#102A4C]/20 text-[#102A4C] font-black py-2.5 sm:py-3.5 rounded-xl border-2 border-transparent transition-all flex flex-col items-center justify-center active:scale-95"
              >
                <span className="text-sm sm:text-lg leading-none">+25</span>
              </button>
              <button 
                onClick={() => handleScoreUpdate(group.id, 50)}
                disabled={updatingId === group.id}
                className="col-span-1 bg-[#102A4C] hover:bg-[#102A4C]/90 text-white font-black py-2.5 sm:py-3.5 rounded-xl shadow-md transition-all flex flex-col items-center justify-center active:scale-95"
              >
                <span className="text-sm sm:text-lg leading-none">+50</span>
              </button>
              <button 
                onClick={() => handleScoreUpdate(group.id, 100)}
                disabled={updatingId === group.id}
                className="col-span-1 bg-[#E31E24] hover:bg-[#E31E24]/90 text-white font-black py-2.5 sm:py-3.5 rounded-xl shadow-[0_4px_12px_rgba(227,30,36,0.25)] transition-all flex flex-col items-center justify-center active:scale-95"
              >
                <span className="text-sm sm:text-lg leading-none">+100</span>
              </button>
            </div>
          </div>
        ))}
        
        {groups.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200">
            <Trophy className="text-zinc-200 mx-auto mb-4" size={56} />
            <p className="text-zinc-500 font-medium text-lg">Belum ada kelompok</p>
            <p className="text-zinc-400 text-sm mt-1">Admin perlu menambahkan kelompok dari Dashboard.</p>
          </div>
        )}
      </main>
    </div>
  );
}
