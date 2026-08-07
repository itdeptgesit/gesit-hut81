"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex items-center justify-center">

      {/* ── Background image — full, no overlay ── */}
      <Image
        src="/hero_bg.png"
        alt="Ilustrasi HUT RI ke-81"
        fill
        priority
        className="object-cover object-center"
      />

      {/* ════════════ CONTENT ════════════ */}
      <div className="relative z-10 w-full max-w-[860px] mx-auto px-5 sm:px-8 flex flex-col items-center text-center pt-28 pb-20">

        {/* HUT RI 81 Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mb-6 md:mb-8"
        >
          <Image
            src="/hutri81_logo.png"
            alt="Logo HUT RI ke-81"
            width={190}
            height={190}
            className="object-contain"
            style={{
              width: "clamp(110px, 16vw, 180px)",
              height: "auto",
              filter: "drop-shadow(0 4px 32px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(255,255,255,0.4))",
            }}
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-5 h-px bg-[#102A4C]/25" />
          <span className="font-semibold uppercase tracking-[0.25em] text-[10px] text-[#102A4C]/50">
            Dirgahayu Indonesia · 17 Agustus 2026
          </span>
          <div className="w-5 h-px bg-[#102A4C]/25" />
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-7 md:mb-9"
        >
          <h1
            className="font-heading font-black text-[#102A4C] uppercase leading-[0.88]"
            style={{ fontSize: "clamp(46px, 9.5vw, 116px)", letterSpacing: "-0.03em" }}
          >
            GESIT BERSATU
          </h1>

          <div className="flex items-center justify-center gap-4 my-3">
            <div className="h-px bg-[#102A4C]/20 w-10 md:w-14" />
            <span className="font-heading font-bold uppercase tracking-[0.4em] text-[9px] text-[#102A4C]/35">
              DALAM
            </span>
            <div className="h-px bg-[#102A4C]/20 w-10 md:w-14" />
          </div>

          <h1
            className="font-heading font-black italic uppercase leading-[0.88]"
            style={{ fontSize: "clamp(46px, 9.5vw, 116px)", letterSpacing: "-0.03em", color: "#E31E24" }}
          >
            SPORTIVITAS
          </h1>
        </motion.div>

        {/* Info badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-7"
        >
          <div className="flex items-center gap-2 border border-[#102A4C]/15 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 text-[#102A4C]/70 text-xs font-medium">
              <CalendarDays size={12} className="text-[#E31E24] shrink-0" />
              11 – 19 Agustus 2026
            </div>
            <div className="flex items-center gap-2 border border-[#102A4C]/15 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 text-[#102A4C]/70 text-xs font-medium">
              <MapPin size={12} className="text-[#E31E24] shrink-0" />
              The City Tower · Lt. 26 &amp; 27
            </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.48 }}
          className="flex items-center gap-3 mb-14 md:mb-16"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-[#E31E24] hover:bg-red-700 text-white font-bold rounded-full px-7 py-3.5 md:px-9 md:py-4 text-sm md:text-base shadow-2xl shadow-black/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Register Sekarang
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 shrink-0" />
          </Link>
          <Link
            href="/#event"
            className="inline-flex items-center bg-white/70 hover:bg-white/90 border border-[#102A4C]/20 text-[#102A4C] font-semibold rounded-full px-7 py-3.5 md:px-9 md:py-4 text-sm md:text-base hover:-translate-y-0.5 transition-all duration-300"
          >
            Lihat Event
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="flex flex-wrap items-center justify-center gap-5 md:gap-10 pt-6 border-t border-[#102A4C]/15 w-full"
        >
          {[
            { value: "11 – 19 Agu", label: "Hari Pelaksanaan" },
            { value: "3 Kategori", label: "Badminton" },
            { value: "4 Lomba", label: "Puncak Acara" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-5 md:gap-10">
              <div className="text-center">
                  <p className="font-heading font-black text-[#102A4C] text-base md:text-lg leading-none">{s.value}</p>
                  <p className="text-[#102A4C]/40 text-[10px] font-medium mt-1.5">{s.label}</p>
                </div>
              {i < 2 && <div className="hidden md:block w-px h-7 bg-[#102A4C]/15" />}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#102A4C]/40 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown size={14} className="animate-bounce" />
      </motion.div>
    </section>
  );
}
