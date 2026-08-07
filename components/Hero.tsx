"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex items-center justify-center bg-gray-50">
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

      {/* ── Subtle Gradient Overlay to darken background slightly ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white/80 pointer-events-none" />

      {/* ── Main Content Container (Glassmorphism Card) ── */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-14 md:pt-32 md:pb-20">
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 sm:p-10 md:p-16 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Decorative subtle shine on the card */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />

          {/* ── Header: Logo & Eyebrow ── */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12 w-full">
            <Image
              src="/hutri81_logo.png"
              alt="Logo HUT RI ke-81"
              width={150}
              height={75}
              className="object-contain mix-blend-multiply"
              style={{ width: "clamp(120px, 15vw, 150px)", height: "auto" }}
            />
            
            {/* Divider for desktop */}
            <div className="hidden md:block w-px h-12 bg-foreground/20" />
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <p className="font-heading font-bold text-foreground/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-1">
                Dirgahayu Indonesia
              </p>
              <p className="font-heading font-bold text-primary uppercase tracking-[0.3em] text-xs md:text-sm">
                17 Agustus 2026
              </p>
            </div>
          </div>

          {/* ── Typography Section ── */}
          <div className="relative w-full flex flex-col items-center mb-10">
            <h1 
              className="font-heading font-black text-slate-900 uppercase leading-[0.9] tracking-tight select-none mb-4"
              style={{ fontSize: "clamp(42px, 8vw, 96px)", letterSpacing: "-0.02em" }}
            >
              GESIT BERSATU
            </h1>
            
            <div className="flex items-center gap-4 my-2 opacity-80 w-full justify-center">
              <div className="h-px bg-slate-900/20 w-12 md:w-24" />
              <span className="font-heading font-semibold text-slate-700 uppercase tracking-[0.4em] text-xs">
                DALAM
              </span>
              <div className="h-px bg-slate-900/20 w-12 md:w-24" />
            </div>

            <p 
              className="font-heading font-black text-primary italic uppercase leading-[0.9] tracking-tight select-none mt-2"
              style={{ fontSize: "clamp(48px, 9vw, 110px)", letterSpacing: "-0.02em" }}
            >
              SPORTIVITAS
            </p>
          </div>

          {/* ── Info Badges ── */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full mb-10">
            <div className="flex items-center gap-2 bg-white/90 border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700">
              <CalendarDays size={18} className="text-primary" />
              11 – 19 Agustus 2026
            </div>
            <div className="flex items-center gap-2 bg-white/90 border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700">
              <MapPin size={18} className="text-primary" />
              The City Tower · Lt. 26 & 27
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="relative flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              style={{ fontSize: "clamp(14px, 1.5vw, 16px)", padding: "16px 40px" }}
            >
              Register Sekarang 
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#event"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold rounded-full shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ fontSize: "clamp(14px, 1.5vw, 16px)", padding: "14px 40px" }}
            >
              Lihat Event
            </Link>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
