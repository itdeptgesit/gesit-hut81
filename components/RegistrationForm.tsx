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
    department: z.string().min(2, "Department wajib diisi"),
    floor: z.enum(["Lantai 26", "Lantai 27"], {
      message: "Pilih lantai Anda",
    }),
    event: z.literal("Badminton Tournament"),
    category: z.string().optional(),
    partner: z.string().optional(),
    costume_desc: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui pernyataan ini",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.event === "Badminton Tournament") {
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
    department: string;
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
    "w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm",
    hasError
      ? "border-red-300 focus:border-red-500"
      : "border-border focus:border-primary"
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
      event: "Badminton Tournament",
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
          <p className="font-bold text-lg text-foreground mb-0.5">{successData.participant.name}</p>
          <p className="text-muted text-sm mb-1">{successData.participant.department}</p>
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
    <div className="bg-white rounded-3xl shadow-xl border border-border max-w-2xl mx-auto overflow-hidden relative">
      {/* Top accent */}
      <div className="h-1.5 bg-primary w-full" />

      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h2 className="font-heading font-bold text-3xl mb-2 text-foreground">
            Form Pendaftaran
          </h2>
          <p className="text-muted text-sm mb-5">
            Lengkapi data di bawah untuk ikut berpartisipasi dalam HUT RI ke-81 GESIT.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm">
            <p className="text-sm text-yellow-800 leading-relaxed">
              <strong className="font-bold">⚠️ PENTING:</strong> Pastikan Anda telah ditunjuk sebagai <strong className="font-bold">Perwakilan Resmi</strong> dari lantai Anda sebelum mengisi form ini. Kuota pendaftaran sangat terbatas dan otomatis tertutup jika batas tiap kategori sudah terpenuhi.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* ── Nama & Department ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Nama Lengkap" error={errors.name?.message}>
              <input
                {...register("name")}
                type="text"
                className={inputClass(!!errors.name)}
                placeholder="Masukkan nama lengkap"
              />
            </FormField>

            <FormField label="Department" error={errors.department?.message}>
              <input
                {...register("department")}
                type="text"
                className={inputClass(!!errors.department)}
                placeholder={DEPARTMENTS_HINT}
              />
            </FormField>
          </div>

          {/* ── Floor ── */}
          <FormField label="Lantai" error={errors.floor?.message}>
            <div className="grid grid-cols-2 gap-4">
              {(["Lantai 26", "Lantai 27"] as const).map((floor) => (
                <label
                  key={floor}
                  className={clsx(
                    "flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                    watch("floor") === floor
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-gray-50"
                  )}
                >
                  <input
                    {...register("floor")}
                    type="radio"
                    value={floor}
                    className="hidden"
                  />
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      watch("floor") === floor ? "border-primary" : "border-gray-300"
                    )}
                  >
                    {watch("floor") === floor && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="font-semibold text-sm text-foreground">{floor}</span>
                </label>
              ))}
            </div>
          </FormField>

          {/* ── Badminton: Category ── */}
          <div className="bg-navy/5 border border-navy/10 rounded-2xl p-5 space-y-4">
            <FormField label="Kategori Badminton" error={errors.category?.message}>
              <div className="flex flex-wrap gap-3 mt-1">
                {["Single Putra", "Single Putri", "Ganda Campuran"].map((cat) => (
                  <label
                    key={cat}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer text-sm font-medium transition-all",
                      selectedCategory === cat
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-foreground border-border hover:bg-gray-50"
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
              <FormField label="Nama Partner" error={errors.partner?.message}>
                <input
                  {...register("partner")}
                  type="text"
                  className={inputClass(!!errors.partner)}
                  placeholder="Nama lengkap partner"
                />
              </FormField>
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
          <button
            type="submit"
            id="submit-register-btn"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-full py-4 text-base font-bold shadow-md shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Memproses Pendaftaran...
              </>
            ) : (
              <>
                Daftar Sekarang <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
