import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Calendar, Trophy, User, ArrowLeft, Award, X } from "lucide-react";

// Server component to verify certificate
export default async function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the winner data by ID
  const { data: winner, error } = await supabaseAdmin
    .from("winners")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !winner) {
    return (
      <main className="min-h-screen bg-[#0A1128] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0A1128] to-[#0A1128] z-0" />
        
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl text-center border border-white/10 relative z-10">
          <div className="w-24 h-24 bg-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-500/30 rotate-12">
            <X size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Sertifikat Tidak Valid</h1>
          <p className="text-white/60 mb-10 leading-relaxed font-medium">
            Maaf, kami tidak dapat menemukan data sertifikat dengan ID tersebut. Sertifikat mungkin tidak resmi atau ID tidak valid.
          </p>
          <Link href="/" className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 border border-white/10">
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  // If winner exists, show verified page
  return (
    <main className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Decorative Premium Background */}
      <div className="absolute inset-0 bg-[url('/HUTRI81_FA_Logo__Main%20Logo%20Merah%20Hitam%20Latar%20Putih.png')] bg-no-repeat bg-center opacity-[0.03] mix-blend-screen scale-150" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white font-semibold transition-colors mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md self-start lg:self-center">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        
        <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
          
          {/* Success Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full" />
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 border-4 border-white/20 relative z-10 transform rotate-3">
                <ShieldCheck size={56} strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">Sertifikat Resmi</h1>
            <div className="inline-flex items-center gap-2 text-emerald-300 font-bold bg-emerald-500/10 px-5 py-2 rounded-full text-sm border border-emerald-500/20 shadow-inner backdrop-blur-sm">
              <CheckCircle size={16} className="text-emerald-400" /> <span className="tracking-wide">Terverifikasi oleh Sistem</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-[2rem] bg-black/20 border border-white/10 flex items-center gap-5 hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 shadow-inner border border-white/10 flex items-center justify-center shrink-0 text-white/80">
                <User size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Diberikan Kepada</p>
                <p className="text-xl md:text-2xl font-black text-white truncate drop-shadow-sm">{winner.name}</p>
              </div>
            </div>
            
            <div className="p-5 rounded-[2rem] bg-black/20 border border-white/10 flex items-center gap-5 hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 shadow-inner border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <Award size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Posisi / Gelar</p>
                <p className="text-xl md:text-2xl font-black text-amber-400 uppercase drop-shadow-sm">{winner.position}</p>
              </div>
            </div>
            
            <div className="p-5 rounded-[2rem] bg-black/20 border border-white/10 flex items-center gap-5 hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 shadow-inner border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <Trophy size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Event</p>
                <p className="text-lg font-bold text-white drop-shadow-sm">{winner.event}</p>
                {winner.category !== "-" && winner.category && (
                  <p className="text-sm font-medium text-white/60 mt-0.5 truncate">{winner.category}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A1128] px-4 text-white/30">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-bold text-white/90 italic tracking-wide">
                "Gesit Bersatu dalam sportivitas"
              </p>
              <p className="text-sm font-medium text-white/50 leading-relaxed">
                Sertifikat ini diterbitkan oleh <span className="text-white/80 font-bold">Team Event The Gesit Companies</span>.
              </p>
              <div className="inline-flex flex-col items-center justify-center bg-black/30 px-6 py-3 rounded-xl border border-white/5 mt-2">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">ID Verifikasi</span>
                <span className="font-mono text-xs text-white/70">{winner.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
