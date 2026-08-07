"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex items-center justify-center">
      {/* ── Background Image ── */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/hero_bg.png"
          alt="Ilustrasi HUT RI ke-81 – Badminton & Merah Putih"
          fill
          priority
          className="object-cover object-center"
        />
      </motion.div>

      {/* ── Centered Gradient Overlay for Readability ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 65%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-4 md:px-8 pt-24 pb-14 md:pt-32 md:pb-20 flex flex-col items-center justify-center text-center">
        
        {/* HUT RI 81 Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mb-5 md:mb-6"
        >
          <Image
            src="/hutri81_logo.png"
            alt="Logo HUT RI ke-81"
            width={160}
            height={80}
            className="object-contain mx-auto mix-blend-multiply drop-shadow-sm"
            style={{ width: "clamp(120px, 15vw, 160px)", height: "auto" }}
          />
        </motion.div>

        {/* Eyebrow: DIRGAHAYU & TANGGAL */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="mb-5 md:mb-8"
        >
          <p className="font-heading font-bold text-foreground uppercase tracking-[0.25em] leading-none mb-2" style={{ fontSize: "clamp(11px, 1.5vw, 14px)" }}>
            Dirgahayu Indonesia
          </p>
          <p className="font-heading font-bold text-primary uppercase tracking-[0.3em] leading-none" style={{ fontSize: "clamp(11px, 1.5vw, 14px)" }}>
            17 Agustus 2026
          </p>
        </motion.div>

        {/* Headline: GESIT BERSATU */}
        <motion.h1
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="font-heading font-black text-foreground uppercase leading-none tracking-tight select-none"
          style={{ fontSize: "clamp(36px, 7.5vw, 84px)", letterSpacing: "-0.01em" }}
        >
          GESIT BERSATU
        </motion.h1>

        {/* — DALAM — divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.65, ease: "easeOut" }}
          className="flex items-center gap-3 md:gap-5 my-3 md:my-5 w-full max-w-sm mx-auto select-none"
        >
          <div className="h-px bg-foreground/20 flex-1" />
          <span className="font-heading font-bold text-foreground/70 uppercase tracking-[0.4em]" style={{ fontSize: "clamp(10px, 1.4vw, 14px)" }}>
            DALAM
          </span>
          <div className="h-px bg-foreground/20 flex-1" />
        </motion.div>

        {/* Headline: SPORTIVITAS */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="font-heading font-black text-primary italic uppercase leading-none tracking-tight select-none drop-shadow-sm"
          style={{ fontSize: "clamp(42px, 8.5vw, 96px)", letterSpacing: "-0.01em" }}
        >
          SPORTIVITAS
        </motion.p>

        {/* Info Chips (Tanggal & Tempat) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-8 md:mt-10 mb-8"
        >
          <span className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-foreground/10 rounded-full px-4 py-2 text-[11px] md:text-sm font-semibold text-foreground/80 shadow-sm">
            <CalendarDays size={16} className="text-primary" />
            11 – 19 Agustus 2026
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-foreground/10 rounded-full px-4 py-2 text-[11px] md:text-sm font-semibold text-foreground/80 shadow-sm">
            <MapPin size={16} className="text-primary" />
            The City Tower · Lt. 26 & 27
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto"
        >
          <Link
            href="/register"
            id="hero-register-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            style={{ fontSize: "clamp(13px, 1.3vw, 16px)", padding: "clamp(12px,1.5vw,16px) clamp(28px,3.5vw,48px)" }}
          >
            Register Sekarang <ArrowRight size={18} />
          </Link>
          <Link
            href="/#event"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md border-2 border-primary/20 hover:border-primary/50 text-foreground font-semibold rounded-full hover:bg-white transition-all duration-200"
            style={{ fontSize: "clamp(13px, 1.3vw, 16px)", padding: "clamp(12px,1.5vw,16px) clamp(28px,3.5vw,48px)" }}
          >
            Lihat Event
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
