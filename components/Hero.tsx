"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex items-center">
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

      {/* Centered radial overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 40%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.50) 55%, transparent 100%)",
        }}
      />

      {/* ── Content: centered ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12 pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col items-center text-center">
        <div className="max-w-2xl w-full">

          {/* Logo + eyebrow row */}
          <motion.div
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mb-8 flex flex-col items-center"
          >
            {/* HUT RI 81 Logo */}
            <Image
              src="/hutri81_logo.png"
              alt="Logo HUT RI ke-81"
              width={140}
              height={70}
              className="object-contain mix-blend-multiply mb-4"
              style={{ width: "clamp(100px, 12vw, 140px)", height: "auto" }}
            />
            <p className="font-heading font-bold text-foreground uppercase tracking-[0.2em] text-xs mb-0.5">
              Dirgahayu Indonesia
            </p>
            <p className="font-heading font-bold text-primary uppercase tracking-[0.2em] text-xs">
              17 Agustus 2026
            </p>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="font-heading font-black text-foreground uppercase leading-[0.95] tracking-tight select-none mb-1"
            style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
          >
            GESIT
          </motion.h1>
          <motion.h1
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="font-heading font-black text-foreground uppercase leading-[0.95] tracking-tight select-none mb-4"
            style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
          >
            BERSATU
          </motion.h1>

          {/* DALAM divider — centered */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <div className="h-px bg-foreground/25 w-8" />
            <span className="font-heading font-semibold text-foreground/60 uppercase tracking-[0.35em] text-[11px]">
              dalam
            </span>
            <div className="h-px bg-foreground/25 w-8" />
          </motion.div>

          {/* SPORTIVITAS */}
          <motion.p
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="font-heading font-black text-primary italic uppercase leading-none tracking-tight select-none"
            style={{ fontSize: "clamp(44px, 7.5vw, 96px)" }}
          >
            SPORTIVITAS
          </motion.p>

          {/* Info chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3 mt-7 mb-8"
          >
            <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-border rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground/70">
              <CalendarDays size={13} className="text-primary" />
              11 – 19 Agustus 2026
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-border rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground/70">
              <MapPin size={13} className="text-primary" />
              The City Tower · Lantai 26 & 27
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.05, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/register"
              id="hero-register-btn"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm px-7 py-3.5"
            >
              Register Sekarang <ArrowRight size={15} />
            </Link>
            <Link
              href="/#event"
              className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-border hover:border-primary/40 text-foreground font-semibold rounded-full hover:bg-white transition-all duration-200 text-sm px-7 py-3.5"
            >
              Lihat Event
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
