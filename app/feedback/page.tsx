"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Send, User, Heart, Wrench, Lightbulb } from "lucide-react";
import Image from "next/image";

type SatisfactionLevel = 1 | 2 | 3 | 4 | null;

export default function FeedbackPage() {
  const router = useRouter();
  
  // State for all questions
  const [q1, setQ1] = useState<SatisfactionLevel>(null);
  const [q2, setQ2] = useState<SatisfactionLevel>(null);
  const [q3, setQ3] = useState<SatisfactionLevel>(null);
  const [q4, setQ4] = useState<SatisfactionLevel>(null);
  const [q5, setQ5] = useState<SatisfactionLevel>(null);
  const [q6, setQ6] = useState<SatisfactionLevel>(null);
  
  const [q7, setQ7] = useState<SatisfactionLevel>(null);
  const [q8, setQ8] = useState<SatisfactionLevel>(null);
  const [q9, setQ9] = useState<SatisfactionLevel>(null);
  const [q10, setQ10] = useState<SatisfactionLevel>(null);
  const [q11, setQ11] = useState<SatisfactionLevel>(null);
  
  const [participantName, setParticipantName] = useState("");
  const [participantFloor, setParticipantFloor] = useState("");

  
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [ideas, setIdeas] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isComplete = q1 && q2 && q3 && q4 && q5 && q6 && q7 && q8 && q9 && q10 && q11 && participantName.trim() !== "" && participantFloor !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setErrorMsg("Mohon lengkapi data diri dan semua pertanyaan pilihan ganda.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_name: participantName,
          participant_floor: participantFloor,
          q1_overall: q1,
          q2_variety: q2,
          q3_food: q3,
          q4_facility: q4,
          q5_prizes: q5,
          q6_togetherness: q6,
          q7_values: q7,
          q8_pride: q8,
          q9_networking: q9,
          q10_motivation: q10,
          q11_future: q11,
          feedback_liked: liked,
          feedback_improve: improve,
          feedback_ideas: ideas
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal mengirim evaluasi.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen" style={{ backgroundImage: "url('/HUTRI81_FA_Logo__Main%20Logo%20Merah%20Hitam%20Latar%20Putih.png')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/30 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl max-w-md w-full rounded-3xl shadow-2xl border border-white/20 p-10 text-center animate-in zoom-in-75 fade-in duration-500 ease-out slide-in-from-bottom-8">
          <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(74,222,128,0.3)] animate-bounce">
            <CheckCircle2 size={50} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Terima Kasih! 🎉</h2>
          <p className="text-zinc-300 mb-10 leading-relaxed font-medium">
            Evaluasi Anda telah tersimpan dan sangat berarti untuk membuat acara GESIT ke depannya menjadi lebih spektakuler!
          </p>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:-translate-y-1"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const QuestionRow = ({ 
    number, 
    question, 
    value, 
    setValue, 
    options 
  }: { 
    number: string, 
    question: string, 
    value: SatisfactionLevel, 
    setValue: (val: SatisfactionLevel) => void,
    options: string[]
  }) => (
    <div className="mb-6 bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] group">
      <div className="flex gap-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 text-red-600 flex items-center justify-center font-black shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
          {number}
        </div>
        <h3 className="text-base md:text-lg font-bold text-zinc-800 leading-relaxed pt-1.5">
          {question}
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-0 md:pl-14">
        {options.map((opt, idx) => {
          const val = (idx + 1) as SatisfactionLevel;
          const isSelected = value === val;
          const colorStyles = [
            "hover:border-red-400 hover:bg-red-50 hover:text-red-700",
            "hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700",
            "hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700",
            "hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          ];
          const selectedStyles = [
            "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
            "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
            "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
            "border-green-600 bg-green-50 text-green-700 ring-2 ring-green-600/20 shadow-[0_0_15px_rgba(22,163,74,0.15)]"
          ];

          return (
            <button
              key={val}
              type="button"
              onClick={() => setValue(val)}
              className={`relative py-4 px-3 text-sm md:text-base font-bold rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
                isSelected 
                  ? selectedStyles[idx] 
                  : `border-zinc-100 text-zinc-500 bg-white shadow-sm ${colorStyles[idx]}`
              }`}
            >
              <span className="relative z-10">{opt}</span>
              {isSelected && <div className="absolute inset-0 bg-white/40 z-0"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const satisfactionOptions = ["Sangat Tidak Puas", "Tidak Puas", "Puas", "Sangat Puas"];
  const agreementOptions = ["Sangat Tidak Setuju", "Tidak Setuju", "Setuju", "Sangat Setuju"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative pb-32 selection:bg-red-200 selection:text-red-900">
      {/* Cleaner Header Background */}
      <div className="absolute top-0 inset-x-0 h-[350px] bg-red-600 z-0">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/HUTRI81_FA_Logo__Main%20Logo%20Merah%20Hitam%20Latar%20Putih.png')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }} />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in slide-in-from-top-10 fade-in duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-6">
            <Image src="/gesit_logo.png" alt="GESIT" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            Evaluasi <span className="text-yellow-400">Acara 17 Agustus</span>
          </h1>
          <p className="text-red-50 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
            Terima kasih telah berpartisipasi! Mohon luangkan waktu Anda untuk mengisi evaluasi ini demi membuat acara GESIT selanjutnya menjadi lebih spektakuler.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-12 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-inner">
                <User size={20} strokeWidth={2.5} />
              </span>
              Data Diri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 bg-zinc-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Lantai <span className="text-red-500">*</span></label>
                <select
                  value={participantFloor}
                  onChange={(e) => setParticipantFloor(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 bg-zinc-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-zinc-900"
                  required
                >
                  <option value="" disabled>Pilih Lantai Asal</option>
                  <option value="26">Lantai 26</option>
                  <option value="27">Lantai 27</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-8 mt-16">
            <h2 className="text-2xl font-black text-zinc-900 px-2 flex items-center gap-3">
              <span className="text-red-500">I.</span> Penilaian Acara
            </h2>
            <p className="text-zinc-500 font-medium px-2 mt-1 mb-6">Seberapa puas Anda dengan aspek-aspek berikut?</p>
          </div>
          <QuestionRow 
            number="01" 
            question="Bagaimana menurut Anda keseluruhan acara 17 Agustus ini?" 
            value={q1} setValue={setQ1} options={satisfactionOptions} 
          />
          <QuestionRow 
            number="02" 
            question="Bagaimana pendapat Anda tentang variasi dan jenis lomba yang diadakan?" 
            value={q2} setValue={setQ2} options={satisfactionOptions} 
          />
          <QuestionRow 
            number="03" 
            question="Bagaimana kualitas konsumsi yang disediakan selama acara?" 
            value={q3} setValue={setQ3} options={satisfactionOptions} 
          />
          <QuestionRow 
            number="04" 
            question="Bagaimana kelayakan fasilitas (seperti sound system, area lomba)?" 
            value={q4} setValue={setQ4} options={satisfactionOptions} 
          />
          <QuestionRow 
            number="05" 
            question="Bagaimana nilai dan variasi hadiah yang diberikan untuk para pemenang?" 
            value={q5} setValue={setQ5} options={satisfactionOptions} 
          />
          <QuestionRow 
            number="06" 
            question="Seberapa besar acara ini menciptakan rasa kebersamaan dan kekompakan?" 
            value={q6} setValue={setQ6} options={satisfactionOptions} 
          />

          <div className="mb-8 mt-16">
            <h2 className="text-2xl font-black text-zinc-900 px-2 flex items-center gap-3">
              <span className="text-red-500">II.</span> Dampak Acara
            </h2>
            <p className="text-zinc-500 font-medium px-2 mt-1 mb-6">Seberapa setuju Anda dengan pernyataan-pernyataan di bawah ini?</p>
          </div>

          <QuestionRow 
            number="07" 
            question="Acara ini berhasil menyampaikan nilai-nilai perusahaan (Integrity, Respect, Competency, Passion) dengan cara yang menyenangkan." 
            value={q7} setValue={setQ7} options={agreementOptions} 
          />
          <QuestionRow 
            number="08" 
            question="Acara ini membuat saya merasa lebih bangga menjadi bagian dari perusahaan." 
            value={q8} setValue={setQ8} options={agreementOptions} 
          />
          <QuestionRow 
            number="09" 
            question="Acara ini membantu saya mengenal dan mempererat hubungan dengan rekan kerja dari divisi lain." 
            value={q9} setValue={setQ9} options={agreementOptions} 
          />
          <QuestionRow 
            number="10" 
            question="Acara seperti ini meningkatkan motivasi saya untuk berkontribusi lebih baik di tempat kerja." 
            value={q10} setValue={setQ10} options={agreementOptions} 
          />
          <QuestionRow 
            number="11" 
            question="Saya berharap acara dengan konsep serupa terus diadakan di tahun-tahun mendatang." 
            value={q11} setValue={setQ11} options={agreementOptions} 
          />

          <div className="mb-8 mt-16">
            <h2 className="text-2xl font-black text-zinc-900 px-2 flex items-center gap-3">
              <span className="text-red-500">III.</span> Masukan & Saran
            </h2>
            <p className="text-zinc-500 font-medium px-2 mt-1 mb-6">Ceritakan pendapat Anda dengan kata-kata sendiri.</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-zinc-800 mb-3 flex items-center gap-2">
                  <Heart className="text-emerald-500" size={20} strokeWidth={2.5} /> Apa hal yang paling Anda sukai dari acara ini?
                </label>
                <textarea 
                  value={liked}
                  onChange={(e) => setLiked(e.target.value)}
                  className="w-full p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] text-base font-medium resize-none text-zinc-900"
                  placeholder="Ketik jawaban Anda di sini..."
                ></textarea>
              </div>

              <div>
                <label className="block text-base font-bold text-zinc-800 mb-3 flex items-center gap-2">
                  <Wrench className="text-amber-500" size={20} strokeWidth={2.5} /> Menurut Anda, apa yang perlu ditingkatkan atau diperbaiki?
                </label>
                <textarea 
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  className="w-full p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all min-h-[120px] text-base font-medium resize-none text-zinc-900"
                  placeholder="Ketik jawaban Anda di sini..."
                ></textarea>
              </div>

              <div>
                <label className="block text-base font-bold text-zinc-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="text-blue-500" size={20} strokeWidth={2.5} /> Kegiatan seperti apa yang Anda rasa dapat lebih meningkatkan kekompakan karyawan?
                </label>
                <textarea 
                  value={ideas}
                  onChange={(e) => setIdeas(e.target.value)}
                  className="w-full p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[120px] text-base font-medium resize-none text-zinc-900"
                  placeholder="Ketik jawaban Anda di sini..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <button 
              type="submit" 
              disabled={isSubmitting || !isComplete}
              className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                isComplete && !isSubmitting
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-2 hover:scale-[1.02]"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed border-2 border-zinc-300"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={28} /> Sedang Mengirim...</>
              ) : (
                <><Send size={28} /> Kumpulkan Evaluasi</>
              )}
            </button>
            {!isComplete && (
              <p className="text-center text-xs text-zinc-500 mt-3">
                Mohon lengkapi data diri dan semua pertanyaan pilihan ganda untuk mengirim evaluasi.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
