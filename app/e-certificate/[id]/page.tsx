import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Calendar, Trophy, User, ArrowLeft, Award } from "lucide-react";

// Server component to verify certificate
export default async function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch the winner data by ID
  const { data: winner, error } = await supabase
    .from("winners")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !winner) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-zinc-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sertifikat Tidak Valid</h1>
          <p className="text-zinc-500 mb-8">
            Maaf, kami tidak dapat menemukan data sertifikat dengan ID tersebut. Sertifikat mungkin tidak resmi atau ID tidak valid.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  // If winner exists, show verified page
  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-navy/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-6 ml-2">
          <ArrowLeft size={16} /> Beranda
        </Link>
        
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
          
          {/* Success Banner */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-emerald-500" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={48} strokeWidth={2} />
            </div>
            
            <h1 className="text-3xl font-black text-zinc-900 mb-2 font-heading tracking-tight">Sertifikat Resmi</h1>
            <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-4 py-1.5 rounded-full text-sm">
              <CheckCircle size={14} /> <span>Terverifikasi oleh GESIT</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-primary">
                <User size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Diberikan Kepada</p>
                <p className="text-lg font-bold text-zinc-900 capitalize">{winner.name}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-amber-500">
                <Award size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Posisi / Gelar</p>
                <p className="text-lg font-bold text-zinc-900 uppercase">{winner.position}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-navy">
                <Trophy size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Event</p>
                <p className="text-base font-bold text-zinc-900">{winner.event}</p>
                {winner.category !== "-" && winner.category && (
                  <p className="text-sm text-zinc-600 mt-0.5">{winner.category}</p>
                )}
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-zinc-500">
                <Calendar size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal</p>
                <p className="text-base font-bold text-zinc-900">Agustus 2026</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-400">
              Sertifikat ini diterbitkan untuk Peringatan HUT ke-81 Kemerdekaan RI oleh Panitia GESIT. <br/>
              ID: <span className="font-mono text-zinc-300">{winner.id}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { X } from "lucide-react";
