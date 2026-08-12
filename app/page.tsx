"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventCard from "@/components/EventCard";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import BadmintonSchedule from "@/components/BadmintonSchedule";
import TournamentBracket from "@/components/TournamentBracket";
import ParticipantSection from "@/components/ParticipantSection";
import TeamSection from "@/components/TeamSection";
import WinnersSection from "@/components/WinnersSection";
import Footer from "@/components/Footer";
import BackgroundMusic from "@/components/BackgroundMusic";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, SlideLeft, SlideRight, StaggerContainer, StaggerChild } from "@/components/animations";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Trophy,
  ConciergeBell,
  Shirt,
  Mic,
  PartyPopper,
} from "lucide-react";

// Reusable section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4"
    >
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
      {children}
    </motion.div>
  );
}

const badmintonRules = [
  "Turnamen diikuti perwakilan karyawan dari Lantai 26 dan Lantai 27.",
  "Setiap lantai mengirimkan perwakilan yang terdiri dari 4 peserta putra dan 4 peserta putri.",
  "Setiap peserta hanya diperbolehkan mengikuti 1 (satu) kategori pertandingan.",
  "Setiap pertandingan menggunakan 1 (satu) set pertandingan hingga 21 poin (rally point system). Apabila skor mencapai 21–21, pertandingan dilanjutkan hingga selisih 2 (dua) poin, dengan batas maksimal 30 poin.",
  "Peserta wajib hadir di lokasi minimal 15 menit sebelum jadwal pertandingan untuk melakukan persiapan.",
  "Peserta wajib menggunakan pakaian dan sepatu olahraga yang sesuai. Peserta diwajibkan menggunakan raket pribadi.",
  "Shuttlecock akan disediakan oleh panitia.",
  "Seluruh peserta diharapkan menjunjung tinggi sportivitas, fair play, kebersamaan, dan saling menghormati selama pertandingan berlangsung.",
  "Penentuan pemenang dilakukan berdasarkan hasil pertandingan pada masing-masing kategori.",
  "Keputusan wasit dan panitia bersifat final dan tidak dapat diganggu gugat.",
  "Seluruh karyawan dipersilakan hadir dan ikut memeriahkan pertandingan sebagai suporter.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-28 md:pb-0">
      <Navbar />

      {/* ─── HERO ─── */}
      <Hero />

      {/* ─── EVENT SECTION ─── */}
      <section id="event" className="py-20 md:py-28 bg-background relative overflow-hidden">
        {/* Floating orbs bg */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel>Lomba</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              Event Lomba
            </h2>
            <p className="text-muted text-base md:text-lg">
              Dua rangkaian acara seru yang akan mempererat kebersamaan dan semangat sportivitas seluruh karyawan GESIT.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <EventCard
              title="BADMINTON TOURNAMENT"
              date="11 – 13 Agustus 2026"
              description={
                <>
                  <p className="font-bold mb-1 text-white">Format Tim</p>
                  <p>Lantai 26 vs Lantai 27.</p>
                  <p>Setiap lantai mengirim perwakilan: <strong className="text-white">4 putra + 4 putri</strong>.</p>
                </>
              }
              theme="navy"
              icon="badminton"
              href="#badminton"
              delay={0}
            />
            <EventCard
              title="PUNCAK ACARA"
              date="19 Agustus 2026"
              description="Rangkaian acara seru yang menguji kreativitas, kekompakan, dan semangat kebersamaan tim Anda."
              categories={[
                "Lomba Yel-Yel",
                "Fun Games",
                "Pesta Rasa Merah Putih",
                "Best Costume",
              ]}
              theme="red"
              icon="games"
              href="#fun-games"
              delay={0.12}
            />
          </div>
        </div>
      </section>

      {/* ─── PUNCAK ACARA DETAIL ─── */}
      <section id="fun-games" className="py-20 md:py-28 bg-white border-t border-border/60 overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-14">
            <SectionLabel>19 Agustus 2026</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 uppercase">
              Puncak Acara
            </h2>
            <p className="text-muted text-base md:text-lg max-w-2xl mx-auto mb-8">
              Rangkaian acara puncak perayaan Kemerdekaan RI ke-81 yang penuh dengan keseruan, kreativitas, dan rasa persaudaraan.
            </p>

            <FadeIn delay={0.15}>
              <div className="w-full max-w-xl mx-auto bg-amber-50 border border-amber-200/50 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-amber-200/50">
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/50 mb-1.5">Waktu</p>
                    <p className="font-bold text-amber-900 text-sm leading-tight">15.00<br/>Selesai</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/50 mb-1.5">Lokasi</p>
                    <p className="font-bold text-amber-900 text-sm leading-tight">City Tower<br/>Lantai 26</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/50 mb-1.5">Dresscode</p>
                    <p className="font-bold text-amber-900 text-sm leading-tight">Tema<br/>Kemerdekaan</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: <Mic size={24} />, color: "bg-red-100 text-red-500", title: "Lomba Yel-Yel", desc: "Setiap tim wajib menampilkan yel-yel berdurasi maksimal 3 menit. Penilaian meliputi kreativitas dan semangat." },
              { icon: <PartyPopper size={24} />, color: "bg-emerald-100 text-emerald-500", title: "Fun Games", desc: "Beragam permainan seru yang menguji kekompakan dan ketangkasan tim. Siapkan strategi terbaik Anda!" },
              { icon: <ConciergeBell size={24} />, color: "bg-red-100 text-red-500", title: "Pesta Rasa Merah Putih", desc: "(Potluck Tema Nusantara) Setiap tim membawa makanan khas Indonesia untuk dinikmati bersama-sama." },
              { icon: <Shirt size={24} />, color: "bg-slate-100 text-slate-500", title: "Best Costume", desc: "Berikan penampilan terbaik Anda dengan kostum bertema kemerdekaan atau adat Nusantara." },
            ].map((item, i) => (
              <StaggerChild key={i}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-background border border-border rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-default h-full"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </StaggerChild>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── BADMINTON RULES ─── */}
      <section id="badminton" className="py-14 md:py-28 bg-navy relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white opacity-[0.03] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-primary opacity-10 rounded-full" />
        {/* Animated ring */}
        <motion.div
          className="absolute top-1/2 right-[-100px] w-[500px] h-[500px] border border-white/5 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        <div className="max-w-[1100px] mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Left: Title + Format */}
            <SlideLeft className="md:w-1/3">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6">
                <Trophy size={12} />
                11 – 13 Agustus 2026
              </div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-6 leading-tight">
                Internal Badminton Tournament 2026
              </h2>

              <StaggerContainer className="space-y-4 mb-8">
                <StaggerChild>
                  <div className="bg-white/8 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Users size={18} className="text-primary" />
                      <span className="font-semibold text-white text-sm">Format Tim</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Lantai 26 vs Lantai 27.<br />
                      Setiap lantai mengirim perwakilan: <strong className="text-white">4 putra + 4 putri</strong>.
                    </p>
                  </div>
                </StaggerChild>

                <StaggerChild>
                  <div className="bg-white/8 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy size={18} className="text-primary" />
                      <span className="font-semibold text-white text-sm">Kategori</span>
                    </div>
                    <ul className="space-y-2">
                      {[
                        { cat: "Single Putra", desc: "2 wakil per lantai" },
                        { cat: "Single Putri", desc: "2 wakil per lantai" },
                        { cat: "Ganda Campuran", desc: "2 pasang per lantai" },
                      ].map((c) => (
                        <li key={c.cat} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>
                            <span className="text-white font-medium">{c.cat}</span>{" "}
                            <span className="text-white/50">— {c.desc}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerChild>
              </StaggerContainer>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 border-l-4 border-primary p-4 rounded-r-2xl mb-8"
              >
                <p className="text-white text-sm leading-relaxed mb-2">
                  <span className="font-bold text-primary">Batas Pendaftaran:</span><br />
                  Senin, 10 Agustus 2026 Pukul 11.00 WIB
                </p>
                <p className="text-white text-sm leading-relaxed">
                  <span className="font-bold text-primary">Pengumuman Jadwal:</span><br />
                  Senin, 10 Agustus 2026 Pukul 15.00 WIB
                </p>
              </motion.div>
            </SlideLeft>

            {/* Right: Rules */}
            <SlideRight className="md:w-2/3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">
                Ketentuan Turnamen
              </p>
              <StaggerContainer className="space-y-4">
                {badmintonRules.map((rule, i) => (
                  <StaggerChild key={i}>
                    <li className="flex items-start gap-3 text-sm md:text-base text-white/70 leading-relaxed list-none">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  </StaggerChild>
                ))}
              </StaggerContainer>

              <FadeIn delay={0.3}>
                <div className="mt-8 bg-primary/15 border border-primary/30 rounded-2xl p-5">
                  <p className="text-white text-sm font-medium italic leading-relaxed">
                    "Mari berolahraga, bersenang-senang, dan membangun kebersamaan melalui semangat sportivitas. Karena dalam kegiatan ini, <strong>kebersamaan adalah kemenangan kita bersama</strong>."
                  </p>
                  <p className="text-white/40 text-xs mt-2">— Panitia GESIT HUT RI ke-81</p>
                </div>
              </FadeIn>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ─── SCHEDULE SECTION ─── */}
      <section id="jadwal" className="py-20 md:py-28 bg-background border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-14">
            <SectionLabel>Timeline</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Jadwal Acara
            </h2>
            <p className="text-muted text-base md:text-lg">
              Catat tanggalnya dan jangan lewatkan setiap momen keseruan.
            </p>
          </FadeIn>
          <ScheduleTimeline />
        </div>
      </section>

      {/* ─── BADMINTON MATCH SCHEDULE ─── */}
      <section id="jadwal-badminton" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-14">
            <SectionLabel>Skema Pertandingan</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Jadwal Badminton
            </h2>
            <p className="text-muted text-base md:text-lg">
              Detail pertandingan harian — lapangan, set, dan lokasi.
            </p>
          </FadeIn>
          <BadmintonSchedule />
        </div>
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 overflow-x-auto">
          <TournamentBracket />
        </div>
        <FadeIn className="max-w-[1100px] mx-auto px-4 md:px-8 mt-12 flex justify-center">
          <Link href="/badminton/live" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            LIHAT LIVE SCOREBOARD
          </Link>
        </FadeIn>
      </section>

      {/* ─── PARTICIPANT SECTION ─── */}
      <section id="peserta" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ParticipantSection />
        </div>
      </section>

      {/* ─── WINNERS SECTION ─── */}
      <section id="winners" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <WinnersSection />
        </div>
      </section>

      {/* ─── TEAM SECTION ─── */}
      <section id="teams" className="py-20 md:py-28 bg-background border-t border-border/60">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <TeamSection />
        </div>
      </section>


      <Footer />

      {/* ─── Background Music ─── */}
      <BackgroundMusic />

    </main>
  );
}
