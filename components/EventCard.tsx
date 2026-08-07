import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

import Image from "next/image";

interface EventCardProps {
  title: string;
  date: string;
  description?: React.ReactNode;
  categories?: string[];
  theme: "navy" | "red";
  icon: "badminton" | "games";
  href: string;
}

export default function EventCard({ title, date, description, categories, theme, icon, href }: EventCardProps) {
  const isNavy = theme === "navy";

  return (
    <div
      className={clsx(
        "relative rounded-3xl overflow-hidden p-7 md:p-10 flex flex-col transition-transform hover:-translate-y-1 duration-300",
        isNavy
          ? "bg-navy shadow-2xl shadow-navy/30"
          : "bg-primary shadow-2xl shadow-primary/30"
      )}
      style={{ minHeight: 320 }}
    >
      {/* Decorative background illustration */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-6 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="relative w-48 h-48 opacity-20">
          {icon === "badminton" ? (
            <Image 
              src="/badminton-player.png" 
              alt="Badminton" 
              fill 
              className="object-contain brightness-0 invert" 
            />
          ) : (
            <Image 
              src="/festivity.png" 
              alt="Fun Games" 
              fill 
              className="object-contain brightness-0 invert" 
            />
          )}
        </div>
      </div>

      {/* Top accent line */}
      <div
        className={clsx(
          "absolute top-0 left-0 h-1 w-20 rounded-b-full",
          isNavy ? "bg-primary" : "bg-white/40"
        )}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Date badge */}
        <div
          className={clsx(
            "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mb-5",
            isNavy ? "bg-white/10 text-white/80" : "bg-white/15 text-white/90"
          )}
        >
          {date}
        </div>

        {/* Title */}
        <h3
          className="font-heading font-bold text-white leading-tight mb-4"
          style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <div className="text-white/80 text-sm leading-relaxed mb-6 flex-1">
            {description}
          </div>
        )}

        {/* Categories list */}
        {categories && categories.length > 0 && (
          <div className="mb-8 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              {icon === "badminton" ? "Kategori" : "Lomba"}
            </p>
            <ul className="space-y-2">
              {categories.map((cat, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isNavy ? "bg-primary" : "bg-white/60"
                    )}
                  />
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all group"
          >
            Lihat Detail
            <span className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
              <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
