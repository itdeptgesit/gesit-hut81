"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Event", href: "/#event" },
    { name: "Jadwal", href: "/#jadwal" },
    { name: "Badminton", href: "/#jadwal-badminton" },
    { name: "Peserta", href: "/#peserta" },
    { name: "Teams", href: "/#teams" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 drop-shadow-md">
          <Image
            src="/gesit_logo.png"
            alt="GESIT Logo"
            width={36}
            height={36}
            className="object-contain w-9 h-9 md:w-10 md:h-10 mix-blend-multiply"
            priority
          />
          <span className="font-heading font-bold text-xl md:text-2xl text-navy tracking-tight">
            Gesit Event
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm"
          >
            Register Sekarang
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-border py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-foreground py-2 border-b border-border/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/register"
            className="bg-primary text-white text-center px-6 py-3 rounded-full font-medium text-base mt-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Register Sekarang
          </Link>
        </div>
      )}
    </nav>
  );
}
