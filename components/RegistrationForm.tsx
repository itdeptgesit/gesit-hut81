"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const DEPARTMENTS_HINT = "Contoh: Finance, IT, HR, Legal, Operations, ...";

const schema = z
  .object({
    name: z.string().min(2, "Nama terlalu pendek"),
    floor: z.enum(["Lantai 26", "Lantai 27"], {
      message: "Pilih lantai Anda",
    }),
    event: z.literal("Internal Badminton Tournament 2026"),
    category: z.string().optional(),
    partner: z.string().optional(),
    costume_desc: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui pernyataan ini",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.event === "Internal Badminton Tournament 2026") {
      if (!data.category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category"],
          message: "Pilih kategori badminton",
        });
      }
      if (data.category === "Ganda Campuran" && !data.partner) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["partner"],
          message: "Nama partner wajib diisi untuk Ganda Campuran",
        });
      }
    }
  });

type FormData = z.infer<typeof schema>;

interface SuccessData {
  registration_id: string;
  participant: {
    name: string;
    floor: string;
    event: string;
    category?: string;
  };
}

// Input wrapper for consistent styling
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  clsx(
    "w-full px-4 py-3.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm shadow-sm",
    hasError
      ? "border-red-300 focus:border-red-500"
      : "border-slate-200 hover:border-slate-300 focus:border-primary"
  );

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      event: "Internal Badminton Tournament 2026",
    },
  });

  const selectedEvent = watch("event");
  const selectedCategory = watch("category");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || "Terjadi kesalahan saat mendaftar.");
      } else {
        setSuccessData(result);
      }
    } catch {
      setServerError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──
  if (successData) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-border text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>

        <h2 className="font-heading font-bold text-3xl mb-2 text-foreground">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-muted text-sm mb-8">
          Data Anda telah tersimpan. Simpan ID pendaftaran berikut sebagai bukti.
        </p>

        <div className="bg-background rounded-2xl p-6 mb-8 text-left border border-border">
          <p className="font-bold text-lg text-foreground mb-2">{successData.participant.name}</p>
          <p className="text-xs text-muted/70 mb-5 bg-white border border-border inline-block px-2 py-0.5 rounded-full">
            {successData.participant.floor}
          </p>

          <div className="mb-5">
            <p className="text-sm font-semibold text-foreground">{successData.participant.event}</p>
            {successData.participant.category && (
              <p className="text-xs text-muted">{successData.participant.category}</p>
            )}
          </div>

          <div className="border-t border-border pt-5">
            <span className="text-xs uppercase tracking-widest text-muted font-bold block mb-2">
              Registration ID
            </span>
            <span className="font-mono text-2xl font-bold tracking-tight text-primary">
              {successData.registration_id}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/#peserta"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Lihat Peserta <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white border border-border hover:bg-gray-50 text-foreground px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-2xl mx-auto overflow-hidden relative">
      <div className="p-8 md:p-12">
        <div className="mb-10 text-center">
          <h2 className="font-heading font-black text-3xl md:text-4xl mb-3 text-slate-900 tracking-tight">
            Form Pendaftaran
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            Lengkapi data di bawah untuk berpartisipasi dalam Internal Badminton Tournament 2026 HUT RI ke-81 GESIT.
          </p>
        </div>
        
        <div className="mb-8 bg-amber-50 border border-amber-200/60 p-4 md:p-5 rounded-2xl flex gap-4 items-start">
          <div className="bg-amber-100 text-amber-600 rounded-full p-1.5 shrink-0 mt-0.5">
            <AlertCircle size={18} strokeWidth={2.5} />
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong className="font-bold">PENTING:</strong> Pastikan Anda telah ditunjuk sebagai <strong className="font-bold">Perwakilan Resmi</strong> dari lantai Anda. Kuota terbatas dan akan otomatis ditutup jika penuh.
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* ── Nama ── */}
          <FormField label="Nama Lengkap" error={errors.name?.message}>
            <input
              {...register("name")}
              type="text"
              className={inputClass(!!errors.name)}
              placeholder="Masukkan nama lengkap"
            />
          </FormField>

          {/* ── Floor ── */}
          <FormField label="Asal Lantai" error={errors.floor?.message}>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {(["Lantai 26", "Lantai 27"] as const).map((floor) => (
                <label
                  key={floor}
                  className={clsx(
                    "flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all text-center",
                    watch("floor") === floor
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
                  )}
                >
                  <input
                    {...register("floor")}
                    type="radio"
                    value={floor}
                    className="hidden"
                  />
                  <span className={clsx(
                    "font-bold text-sm md:text-base",
                    watch("floor") === floor ? "text-primary" : "text-slate-600"
                  )}>
                    {floor}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {/* ── Badminton: Category ── */}
          <div className="pt-2">
            <FormField label="Kategori Pertandingan" error={errors.category?.message}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Single Putra", "Single Putri", "Ganda Campuran"].map((cat) => (
                  <label
                    key={cat}
                    className={clsx(
                      "flex items-center justify-center px-4 py-3.5 border-2 rounded-xl cursor-pointer text-sm font-bold transition-all text-center",
                      selectedCategory === cat
                        ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                    )}
                  >
                    <input
                      {...register("category")}
                      type="radio"
                      value={cat}
                      className="hidden"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </FormField>

            {selectedCategory === "Ganda Campuran" && (
              <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <FormField label="Nama Partner Anda" error={errors.partner?.message}>
                  <input
                    {...register("partner")}
                    type="text"
                    className={inputClass(!!errors.partner)}
                    placeholder="Masukkan nama lengkap partner"
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* ── Consent ── */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input
                  {...register("consent")}
                  type="checkbox"
                  className="peer shrink-0 appearance-none w-5 h-5 border-2 border-muted rounded bg-white checked:bg-primary checked:border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                />
                <svg
                  className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm text-muted leading-relaxed group-hover:text-foreground transition-colors">
                Saya memastikan data yang diberikan sudah benar dan bersedia mengikuti seluruh peraturan event yang berlaku.
              </span>
            </label>
            {errors.consent && (
              <p className="text-red-500 text-xs mt-1.5 ml-8">{errors.consent.message}</p>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="pt-4">
            <button
              type="submit"
              id="submit-register-btn"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-red-700 text-white rounded-xl py-4.5 text-base font-bold shadow-lg shadow-primary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Memproses Pendaftaran...
                </>
              ) : (
                <>
                  Kirim Pendaftaran <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
