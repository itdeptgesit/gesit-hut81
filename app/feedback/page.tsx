"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, AlertCircle, Loader2, ChevronRight,
  ChevronLeft, Star, Frown, Meh, Smile, SmilePlus,
  ThumbsUp, ThumbsDown, Minus, Flag, Send
} from "lucide-react";
import Image from "next/image";

type SatisfactionLevel = 1 | 2 | 3 | 4 | null;

const SECTIONS = [
  { id: "identity", title: "Data Diri", desc: "Perkenalkan diri Anda" },
  { id: "satisfaction", title: "Penilaian Acara", desc: "Kepuasan terhadap acara" },
  { id: "impact", title: "Dampak Acara", desc: "Pengaruh terhadap Anda" },
  { id: "feedback", title: "Masukan", desc: "Saran dan ide Anda" },
];

const satisfactionOptions = [
  { label: "Sangat Tidak Puas", icon: Frown, color: "text-red-400", bg: "bg-red-500/15 border-red-500/40 hover:bg-red-500/25", active: "bg-red-500/20 border-red-500 ring-2 ring-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]" },
  { label: "Tidak Puas", icon: Meh, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/40 hover:bg-orange-500/25", active: "bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]" },
  { label: "Puas", icon: Smile, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/40 hover:bg-emerald-500/25", active: "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]" },
  { label: "Sangat Puas", icon: SmilePlus, color: "text-green-400", bg: "bg-green-500/15 border-green-500/40 hover:bg-green-500/25", active: "bg-green-500/20 border-green-500 ring-2 ring-green-500/30 shadow-[0_0_12px_rgba(74,222,128,0.2)]" },
];

const agreementOptions = [
  { label: "Sangat Tidak Setuju", icon: ThumbsDown, color: "text-red-400", bg: "bg-red-500/15 border-red-500/40 hover:bg-red-500/25", active: "bg-red-500/20 border-red-500 ring-2 ring-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]" },
  { label: "Tidak Setuju", icon: Minus, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/40 hover:bg-orange-500/25", active: "bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]" },
  { label: "Setuju", icon: ThumbsUp, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/40 hover:bg-emerald-500/25", active: "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]" },
  { label: "Sangat Setuju", icon: Star, color: "text-green-400", bg: "bg-green-500/15 border-green-500/40 hover:bg-green-500/25", active: "bg-green-500/20 border-green-500 ring-2 ring-green-500/30 shadow-[0_0_12px_rgba(74,222,128,0.2)]" },
];

function RatingGroup({
  question,
  value,
  onChange,
  options,
}: {
  question: string;
  value: SatisfactionLevel;
  onChange: (v: SatisfactionLevel) => void;
  options: typeof satisfactionOptions;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[15px] font-medium text-zinc-200 leading-relaxed">{question}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt, idx) => {
          const Icon = opt.icon;
          const val = (idx + 1) as SatisfactionLevel;
          const isSelected = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 ${isSelected ? opt.active : `border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600 hover:bg-zinc-700/40`}`}
            >
              <Icon size={22} className={isSelected ? opt.color : "text-zinc-500"} />
              <span className={`text-xs font-semibold leading-tight text-center ${isSelected ? opt.color : "text-zinc-400"}`}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [participantName, setParticipantName] = useState("");
  const [participantFloor, setParticipantFloor] = useState("");

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

  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [ideas, setIdeas] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const stepValid = [
    participantName.trim() !== "" && participantFloor !== "",
    q1 && q2 && q3 && q4 && q5 && q6,
    q7 && q8 && q9 && q10 && q11,
    true,
  ];

  const totalAnswered = [
    participantName.trim() !== "" && participantFloor !== "" ? 1 : 0,
    [q1, q2, q3, q4, q5, q6].filter(Boolean).length,
    [q7, q8, q9, q10, q11].filter(Boolean).length,
    1,
  ];

  const totalRequired = [1, 6, 5, 1];
  const overallProgress = Math.round(
    ((totalAnswered[0] + totalAnswered[1] + totalAnswered[2]) / (totalRequired[0] + totalRequired[1] + totalRequired[2])) * 100
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_name: participantName,
          participant_floor: participantFloor,
          q1_overall: q1, q2_variety: q2, q3_food: q3,
          q4_facility: q4, q5_prizes: q5, q6_togetherness: q6,
          q7_values: q7, q8_pride: q8, q9_networking: q9,
          q10_motivation: q10, q11_future: q11,
          feedback_liked: liked, feedback_improve: improve, feedback_ideas: ideas,
        }),
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal mengirim evaluasi.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-in zoom-in-90 fade-in duration-500">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(74,222,128,0.15)]">
            <CheckCircle2 className="text-green-400 animate-bounce" size={44} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Terima Kasih!</h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-10">
            Evaluasi Anda telah berhasil disimpan. Masukan Anda sangat berarti untuk GESIT ke depannya.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full h-12 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Fixed Progress Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Image src="/gesit_logo.png" alt="GESIT" width={18} height={18} className="object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Evaluasi Acara</p>
                <p className="text-sm font-bold text-white leading-none">HUT RI 81 · GESIT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Progres</p>
              <p className="text-sm font-bold text-white">{overallProgress}%</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {/* Step tabs */}
          <div className="flex gap-1 mt-3">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < step || stepValid[i] ? setStep(i) : null}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  i === step ? "bg-red-500" : i < step ? "bg-zinc-500" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-10 pb-32">
        {/* Section Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <Flag size={12} className="text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
              Langkah {step + 1} dari {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{SECTIONS[step].title}</h1>
          <p className="text-zinc-400 text-sm">{SECTIONS[step].desc}</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm font-medium">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* STEP 0: Data Diri */}
        {step === 0 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Nama Lengkap <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full h-12 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Lantai <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {["26", "27"].map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setParticipantFloor(floor)}
                    className={`h-14 rounded-xl border text-base font-bold transition-all duration-200 ${
                      participantFloor === floor
                        ? "bg-red-500/20 border-red-500 text-red-400 ring-2 ring-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    Lantai {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Decorative card */}
            <div className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <Image src="/gesit_logo.png" alt="GESIT" width={28} height={28} className="object-contain" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">HUT RI ke-81</p>
                  <p className="text-zinc-500 text-xs">Evaluasi Acara 17 Agustus · GESIT</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Jawaban Anda bersifat anonim dan hanya digunakan untuk keperluan pengembangan acara ke depannya. Terima kasih atas partisipasi Anda!
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Penilaian Acara */}
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 fade-in duration-300">
            <RatingGroup question="Bagaimana menurut Anda keseluruhan acara 17 Agustus ini?" value={q1} onChange={setQ1} options={satisfactionOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Bagaimana variasi dan jenis lomba yang diadakan?" value={q2} onChange={setQ2} options={satisfactionOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Bagaimana kualitas konsumsi yang disediakan selama acara?" value={q3} onChange={setQ3} options={satisfactionOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Bagaimana kelayakan fasilitas (sound system, area lomba, dll)?" value={q4} onChange={setQ4} options={satisfactionOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Bagaimana nilai dan variasi hadiah yang diberikan untuk para pemenang?" value={q5} onChange={setQ5} options={satisfactionOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Seberapa besar acara ini menciptakan rasa kebersamaan dan kekompakan?" value={q6} onChange={setQ6} options={satisfactionOptions} />
          </div>
        )}

        {/* STEP 2: Dampak Acara */}
        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 fade-in duration-300">
            <RatingGroup question="Acara ini berhasil menyampaikan nilai-nilai perusahaan (IRCP) dengan cara yang menyenangkan." value={q7} onChange={setQ7} options={agreementOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Acara ini membuat saya merasa lebih bangga menjadi bagian dari GESIT." value={q8} onChange={setQ8} options={agreementOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Acara ini membantu mempererat hubungan saya dengan rekan dari divisi lain." value={q9} onChange={setQ9} options={agreementOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Acara seperti ini meningkatkan motivasi saya untuk berkontribusi lebih baik." value={q10} onChange={setQ10} options={agreementOptions} />
            <div className="h-px bg-zinc-800" />
            <RatingGroup question="Saya berharap acara dengan konsep serupa terus diadakan di tahun-tahun mendatang." value={q11} onChange={setQ11} options={agreementOptions} />
          </div>
        )}

        {/* STEP 3: Masukan Terbuka */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
            {[
              { label: "Apa yang paling Anda sukai dari acara ini?", value: liked, onChange: setLiked, placeholder: "Bagikan hal yang membuat Anda terkesan..." },
              { label: "Apa yang perlu ditingkatkan untuk acara selanjutnya?", value: improve, onChange: setImprove, placeholder: "Berikan saran konstruktif Anda..." },
              { label: "Kegiatan apa yang bisa meningkatkan kekompakan karyawan?", value: ideas, onChange: setIdeas, placeholder: "Ide kreatif Anda sangat dihargai..." },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">{item.label} <span className="text-zinc-600 font-normal">(Opsional)</span></label>
                <textarea
                  value={item.value}
                  onChange={(e) => item.onChange(e.target.value)}
                  placeholder={item.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm resize-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="h-12 px-6 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all font-semibold flex items-center gap-2"
            >
              <ChevronLeft size={18} /> Kembali
            </button>
          )}
          {step < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => stepValid[step] && setStep(s => s + 1)}
              disabled={!stepValid[step]}
              className={`flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                stepValid[step]
                  ? "bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Selanjutnya <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !stepValid[0] || !stepValid[1] || !stepValid[2]}
              className={`flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                !isSubmitting && stepValid[0] && stepValid[1] && stepValid[2]
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(220,38,38,0.3)]"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Mengirim...</> : <><Send size={18} /> Kirim Evaluasi</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
