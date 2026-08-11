"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, slideLeft } from "./animations";

const schedules = [
  {
    date: "11",
    month: "AGU",
    dayName: "Selasa",
    title: "Babak Kualifikasi",
    subtitle: "Internal Badminton Tournament 2026",
    detail: "2 Lapangan · 17.00–18.00",
    color: "navy",
  },
  {
    date: "12",
    month: "AGU",
    dayName: "Rabu",
    title: "Babak Kualifikasi",
    subtitle: "Internal Badminton Tournament 2026",
    detail: "1 Lapangan · 17.00–18.00",
    color: "navy",
  },
  {
    date: "13",
    month: "AGU",
    dayName: "Kamis",
    title: "Grand Final",
    subtitle: "Internal Badminton Tournament 2026",
    detail: "3 Final · 17.00–19.00",
    color: "navy",
  },
  {
    date: "19",
    month: "AGU",
    dayName: "Rabu",
    title: "Puncak Acara",
    subtitle: "Fun Games Day",
    detail: "Yel-Yel · Costume · Potluck",
    color: "red",
  },
];

export default function ScheduleTimeline() {
  return (
    <div className="w-full">
      {/* Desktop Horizontal Timeline */}
      <motion.div
        className="hidden md:flex flex-row justify-between relative pt-8 pb-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Connector line that animates in */}
        <motion.div
          className="absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-border -z-10"
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          viewport={{ once: true }}
        />

        {schedules.map((item, idx) => (
          <motion.div
            key={idx}
            variants={fadeUp}
            className="flex flex-col items-center flex-1 relative px-2"
          >
            {/* Date bubble */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className={clsx(
                "w-11 h-11 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md mb-6 shrink-0 cursor-default",
                item.color === "red"
                  ? "bg-primary shadow-primary/30"
                  : "bg-navy shadow-navy/30"
              )}
            >
              <span className="text-base leading-none">{item.date}</span>
            </motion.div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-0.5">
                {item.dayName}, {item.month} 2026
              </span>
              <h4
                className={clsx(
                  "font-heading font-bold text-lg mb-0.5",
                  item.color === "red" ? "text-primary" : "text-navy"
                )}
              >
                {item.title}
              </h4>
              <p className="text-sm text-muted">{item.subtitle}</p>
              <p className="text-[11px] text-muted/60 mt-1 font-medium">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile Vertical Timeline */}
      <motion.div
        className="md:hidden flex flex-col gap-5 relative ml-5 border-l-2 border-border pl-8 py-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {schedules.map((item, idx) => (
          <motion.div key={idx} variants={slideLeft} className="relative">
            {/* Bubble */}
            <div
              className={clsx(
                "absolute -left-[49px] top-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm",
                item.color === "red"
                  ? "bg-primary shadow-primary/30"
                  : "bg-navy shadow-navy/30"
              )}
            >
              {item.date}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">
                {item.dayName}, {item.date} {item.month} 2026
              </span>
              <h4
                className={clsx(
                  "font-heading font-bold text-lg mb-0.5",
                  item.color === "red" ? "text-primary" : "text-navy"
                )}
              >
                {item.title}
              </h4>
              <p className="text-sm text-muted">{item.subtitle}</p>
              <p className="text-xs text-muted/60 mt-1 font-medium">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
