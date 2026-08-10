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
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
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
    <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4">
      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
      {children}
    </div>
  );
}

// Rule list item
function RuleItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm md:text-base text-muted leading-relaxed">
      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
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
  "Penentuan pemenang dilakukan berdasarkan hasil pertandingan pada masing-masing kategori. Penilaian ditujukan sebagai bagian dari kegiatan kebersamaan dan bukan semata-mata untuk menentukan siapa yang menang atau kalah.",
  "Keputusan wasit dan panitia bersifat final dan tidak dapat diganggu gugat.",
  "Seluruh karyawan dipersilakan hadir dan ikut memeriahkan pertandingan sebagai suporter.",
  "Apabila terjadi hal-hal yang belum diatur dalam ketentuan ini, keputusan akan disesuaikan oleh panitia demi kelancaran dan kenyamanan seluruh peserta."
];

const faqs = [
  {
    q: "Bagaimana penentuan kelompok?",
    a: "Pembagian kelompok dilakukan berdasarkan spin tanggal 7 Agustus 2026, yang diwakilkan oleh masing-masing PIC lantai 26 dan 27. Kelompok ini menjadi kelompok peserta lomba pada tanggal 19 Agustus 2026.",
  },
  {
    q: "Siapa saja yang bisa ikut badminton?",
    a: "Perwakilan karyawan dari Lantai 26 dan Lantai 27. Setiap lantai mengirimkan perwakilan yang terdiri dari 4 putra dan 4 putri untuk bertanding di tiga kategori: Single Putra, Single Putri, dan Ganda Campuran.",
  },
  {
    q: "Apa saja lomba pada Fun Games Day 19 Agustus?",
    a: "Ada 3 lomba utama: (1) Yel-Yel Kemerdekaan — tampilkan yel-yel tim maks 3 menit; (2) Best Costume — kostum bertema kemerdekaan atau adat; (3) Potluck Rasa Nusantara — bawa makanan khas Indonesia untuk dinikmati bersama.",
  },
  {
    q: "Apa yang dinilai dalam Potluck Rasa Nusantara?",
    a: "Penilaian meliputi keunikan menu, presentasi penyajian, konsep, dan nuansa budaya nusantara yang dibawa oleh setiap tim.",
  },
  {
    q: "Apakah kostum untuk Best Costume harus seragam?",
    a: "Kostum dapat berupa pakaian adat, nuansa merah putih, atribut perjuangan, atau kreasi lain yang tetap sopan. Penilaian meliputi kreativitas, kekompakan, dan kesesuaian dengan tema kemerdekaan.",
  },
  {
    q: "Apa itu sistem rally point?",
    a: "Setiap poin dihitung dari setiap reli, baik saat melakukan servis maupun menerima servis. Pertandingan dimainkan 1 set hingga 21 poin. Jika skor 21–21, pertandingan dilanjutkan hingga selisih 2 poin, dengan batas maksimal 30 poin.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-28 md:pb-0">
      <Navbar />

      {/* ─── HERO ─── */}
      <Hero />

      {/* ─── EVENT SECTION ─── */}
      <section id="event" className="py-20 md:py-28 bg-background relative">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel>Lomba</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              Event Lomba
            </h2>
            <p className="text-muted text-base md:text-lg">
              Dua rangkaian acara seru yang akan mempererat kebersamaan dan semangat sportivitas seluruh karyawan GESIT.
            </p>
          </div>

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
            />
          </div>
        </div>
      </section>

      {/* ─── PUNCAK ACARA DETAIL ─── */}
      <section id="fun-games" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <SectionLabel>19 Agustus 2026</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 uppercase">
              Puncak Acara
            </h2>
            <p className="text-muted text-base md:text-lg max-w-2xl mx-auto mb-8">
              Rangkaian acara puncak perayaan Kemerdekaan RI ke-81 yang penuh dengan keseruan, kreativitas, dan rasa persaudaraan.
            </p>
            
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Yel-Yel */}
            <div className="bg-background border border-border rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Lomba Yel-Yel
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Setiap tim wajib menampilkan yel-yel berdurasi <strong>maksimal 3 menit</strong>. Penilaian meliputi kreativitas dan semangat.
                </p>
              </div>
            </div>

            {/* Fun Games */}
            <div className="bg-background border border-border rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center">
                <PartyPopper size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Fun Games
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Beragam permainan seru yang menguji kekompakan dan ketangkasan tim. Siapkan strategi terbaik Anda!
                </p>
              </div>
            </div>

            {/* Potluck */}
            <div className="bg-background border border-border rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                <ConciergeBell size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Pesta Rasa Merah Putih
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  <strong>(Potluck Tema Nusantara)</strong><br/>
                  Setiap tim membawa makanan khas Indonesia untuk dinikmati bersama-sama.
                </p>
              </div>
            </div>

            {/* Best Costume */}
            <div className="bg-background border border-border rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center">
                <Shirt size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Best Costume
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Berikan penampilan terbaik Anda dengan kostum bertema kemerdekaan atau adat Nusantara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BADMINTON RULES ─── */}
      <section id="badminton" className="py-14 md:py-28 bg-navy relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white opacity-[0.03] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-primary opacity-10 rounded-full" />

        <div className="max-w-[1100px] mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Left: Title + Format */}
            <div className="md:w-1/3">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6">
                <Trophy size={12} />
                11 – 13 Agustus 2026
              </div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-6 leading-tight">
                Badminton Tournament
              </h2>

              <div className="space-y-4 mb-8">
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
              </div>

              {/* Deadline & Announcements */}
              <div className="bg-white/10 border-l-4 border-primary p-4 rounded-r-2xl mb-8">
                <p className="text-white text-sm leading-relaxed mb-2">
                  <span className="font-bold text-primary">Batas Pendaftaran:</span><br />
                  Senin, 10 Agustus 2026 Pukul 11.00 WIB
                </p>
                <p className="text-white text-sm leading-relaxed">
                  <span className="font-bold text-primary">Pengumuman Jadwal:</span><br />
                  Senin, 10 Agustus 2026 Pukul 15.00 WIB
                </p>
              </div>
            </div>

            {/* Right: Rules */}
            <div className="md:w-2/3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">
                Ketentuan Turnamen
              </p>
              <ul className="space-y-4">
                {badmintonRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm md:text-base text-white/70 leading-relaxed">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-primary/15 border border-primary/30 rounded-2xl p-5">
                <p className="text-white text-sm font-medium italic leading-relaxed">
                  "Mari berolahraga, bersenang-senang, dan membangun kebersamaan melalui semangat sportivitas. Karena dalam kegiatan ini, <strong>kebersamaan adalah kemenangan kita bersama</strong>."
                </p>
                <p className="text-white/40 text-xs mt-2">— Panitia GESIT HUT RI ke-81</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SCHEDULE SECTION ─── */}
      <section id="jadwal" className="py-20 md:py-28 bg-background border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <SectionLabel>Timeline</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Jadwal Acara
            </h2>
            <p className="text-muted text-base md:text-lg">
              Catat tanggalnya dan jangan lewatkan setiap momen keseruan.
            </p>
          </div>
          <ScheduleTimeline />
        </div>
      </section>

      {/* ─── BADMINTON MATCH SCHEDULE ─── */}
      <section id="jadwal-badminton" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <SectionLabel>Skema Pertandingan</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Jadwal Badminton
            </h2>
            <p className="text-muted text-base md:text-lg">
              Detail pertandingan harian — lapangan, set, dan lokasi.
            </p>
          </div>
          <BadmintonSchedule />
          <TournamentBracket />
        </div>
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

      {/* ─── FAQ SECTION ─── */}
      <section id="faq" className="py-20 md:py-28 bg-white border-t border-border/60">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-muted text-base md:text-lg max-w-xl mx-auto">
              Masih ada pertanyaan seputar event? Temukan jawabannya di sini.
            </p>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-background border border-border rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer list-none font-semibold text-foreground text-base hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-muted text-sm md:text-base leading-relaxed border-t border-border pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REGISTRATION CTA ─── */}
      <section className="py-20 md:py-28 bg-navy relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-[0.03] rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-primary opacity-10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />

        <div className="max-w-[800px] mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Pendaftaran Dibuka
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6 leading-tight">
            Siap Bertanding?
          </h2>
          <p className="text-white/70 text-base md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Daftarkan diri Anda sekarang dan jadilah bagian dari perayaan HUT
            Republik Indonesia ke-81 bersama keluarga besar GESIT.
          </p>
          <Link
            href="/register"
            id="cta-register-btn"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full font-bold text-base md:text-lg transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30"
          >
            Daftar Sekarang <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />

      {/* ─── Mobile Sticky CTA ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="m-4">
          <Link
            href="/register"
            id="mobile-sticky-register-btn"
            className="flex justify-center items-center gap-2 w-full bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/40 py-4 rounded-full font-bold text-base transition-all"
          >
            REGISTER SEKARANG <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}
