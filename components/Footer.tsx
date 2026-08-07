import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-5">
              <span className="font-heading font-bold text-3xl text-white tracking-tight">
                GESIT
              </span>
              <div className="w-8 h-0.5 bg-primary mt-2" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              GESIT Bersatu dalam Sportivitas.<br />
              Merayakan HUT Republik Indonesia ke-81 bersama seluruh keluarga besar GESIT.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-white/40 mb-5">
              Menu
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Beranda", href: "/" },
                { name: "Event", href: "/#event" },
                { name: "Jadwal", href: "/#jadwal" },
                { name: "Peserta", href: "/#peserta" },
                { name: "Teams", href: "/#teams" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-white/40 mb-5">
              Informasi
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Tentang Event", href: "/#event" },
                { name: "Peraturan Lomba", href: "/#faq" },
                { name: "Kontak Panitia", href: "/#faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Register CTA */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-white/40 mb-5">
              Daftar Sekarang
            </h4>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">
              Belum mendaftar? Segera amankan tempatmu sebelum penuh!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Register →
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-xs">
            © 2026 GESIT. All rights reserved. Event Internal HUT RI ke-81.
          </p>
          <p className="text-white/30 text-xs">🇮🇩 Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
