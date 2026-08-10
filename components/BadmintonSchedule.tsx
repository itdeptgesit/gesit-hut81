"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, User } from "lucide-react";
import { Participant } from "@/types";

const days = [
  {
    day: "Hari 1",
    dayName: "Selasa",
    date: "11 Agustus 2026",
    time: "17.00 – 18.00",
    duration: "1 Jam",
    location: "Agora Mall Lt.11, Court 4",
    courts: [
      {
        name: "Lapangan 1",
        sets: [
          { set: "Set 1", duration: "±30 menit", match: "Single Pria 26A vs Single Pria 27A" },
          { set: "Set 2", duration: "±30 menit", match: "Ganda Campur 26A vs Ganda Campur 27A" },
        ],
        referee: "Argadana / Aditya",
      },
      {
        name: "Lapangan 2",
        sets: [
          { set: "Set 1", duration: "±30 menit", match: "Single Wanita 26A vs Single Wanita 27A" },
          { set: "Set 2", duration: "±30 menit", match: "Ganda Campur 26B vs Ganda Campur 27B" },
        ],
        referee: "Argadana / Aditya",
      },
    ],
    tag: "Babak Kualifikasi",
    tagColor: "navy",
  },
  {
    day: "Hari 2",
    dayName: "Rabu",
    date: "12 Agustus 2026",
    time: "17.00 – 18.00",
    duration: "1 Jam",
    location: "Agora Mall Lt.11, Court 5",
    courts: [
      {
        name: "Lapangan 1",
        sets: [
          { set: "Set 1", duration: "±30 menit", match: "Single Pria 26B vs Single Pria 27B" },
          { set: "Set 2", duration: "±30 menit", match: "Single Wanita 26B vs Single Wanita 27B" },
        ],
        referee: "Argadana / Aditya",
      },
    ],
    tag: "Babak Kualifikasi",
    tagColor: "navy",
  },
  {
    day: "Hari 3",
    dayName: "Kamis",
    date: "13 Agustus 2026",
    time: "17.00 – 19.00",
    duration: "2 Jam",
    location: "Agora Mall Lt.11, Court 5",
    courts: [
      {
        name: "Lapangan 1",
        sets: [
          { set: "Set 1", duration: "±30 menit", match: "Final Single Pria — Team A vs Team B" },
          { set: "Set 2", duration: "±30 menit", match: "Final Ganda Campur — Team A vs Team B" },
          { set: "Set 3", duration: "±30 menit", match: "Final Single Wanita — Team A vs Team B" },
        ],
        referee: "Argadana / Aditya",
      },
    ],
    tag: "Grand Final",
    tagColor: "red",
  },
];

const pics = [
  { label: "PIC Lantai 27", name: "Parawinata" },
  { label: "PIC Lantai 26", name: "Aditya" },
];

export default function BadmintonSchedule() {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetch("/api/participants")
      .then((res) => res.json())
      .then((data) => {
        if (data.participants) {
          setParticipants(data.participants.filter((p: Participant) => p.event.toLowerCase().includes("badminton")));
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError" || err?.message === "Failed to fetch") return;
        console.error("Error fetching participants:", err);
      });
  }, []);

  const getName = (floor: string, category: string, index: number) => {
    const list = participants.filter((p) => p.floor.includes(floor) && p.category === category);
    if (list[index]) {
      const p = list[index];
      if (category === "Ganda Campuran" && p.partner) {
        const name1 = p.call_name || p.name.split(" ")[0];
        const name2 = p.partner.split(" ")[0];
        return `${name1} & ${name2}`;
      }
      return p.call_name || p.name.split(" ").slice(0, 2).join(" ");
    }
    return null;
  };

  const renderMatchName = (matchString: string) => {
    if (matchString.includes("Single Pria 26A vs Single Pria 27A")) {
      const p1 = getName("26", "Single Putra", 0) || "Single Pria 26A";
      const p2 = getName("27", "Single Putra", 0) || "Single Pria 27A";
      return `${p1} vs ${p2}`;
    }
    if (matchString.includes("Ganda Campur 26A vs Ganda Campur 27A")) {
      const p1 = getName("26", "Ganda Campuran", 0) || "Ganda Campur 26A";
      const p2 = getName("27", "Ganda Campuran", 0) || "Ganda Campur 27A";
      return `${p1} vs ${p2}`;
    }
    if (matchString.includes("Single Wanita 26A vs Single Wanita 27A")) {
      const p1 = getName("26", "Single Putri", 0) || "Single Wanita 26A";
      const p2 = getName("27", "Single Putri", 0) || "Single Wanita 27A";
      return `${p1} vs ${p2}`;
    }
    if (matchString.includes("Ganda Campur 26B vs Ganda Campur 27B")) {
      const p1 = getName("26", "Ganda Campuran", 1) || "Ganda Campur 26B";
      const p2 = getName("27", "Ganda Campuran", 1) || "Ganda Campur 27B";
      return `${p1} vs ${p2}`;
    }
    if (matchString.includes("Single Pria 26B vs Single Pria 27B")) {
      const p1 = getName("26", "Single Putra", 1) || "Single Pria 26B";
      const p2 = getName("27", "Single Putra", 1) || "Single Pria 27B";
      return `${p1} vs ${p2}`;
    }
    if (matchString.includes("Single Wanita 26B vs Single Wanita 27B")) {
      const p1 = getName("26", "Single Putri", 1) || "Single Wanita 26B";
      const p2 = getName("27", "Single Putri", 1) || "Single Wanita 27B";
      return `${p1} vs ${p2}`;
    }
    return matchString;
  };

  return (
    <div className="w-full">
      {/* PIC Info */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        {pics.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-5 py-3 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-bold">{p.label}</p>
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Cards */}
      <div className="flex flex-col gap-8">
        {days.map((day, di) => (
          <div
            key={di}
            className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm"
          >
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-border bg-background">
              <div className="flex items-center gap-4">
                <div className="text-center w-14 shrink-0">
                  <div
                    className="text-xs font-bold uppercase tracking-widest text-white px-2 py-1 rounded-lg mb-1"
                    style={{ backgroundColor: day.tagColor === "red" ? "#E31E24" : "#102A4C" }}
                  >
                    {day.day}
                  </div>
                  <p className="text-xs text-muted font-medium">{day.dayName}</p>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-xl leading-tight">
                    {day.date}
                  </h3>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                    style={
                      day.tagColor === "red"
                        ? { background: "#E31E2415", color: "#E31E24" }
                        : { background: "#102A4C15", color: "#102A4C" }
                    }
                  >
                    {day.tag}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span className="font-medium">{day.time}</span>
                  <span className="text-muted/60">({day.duration})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="font-medium">{day.location}</span>
                </div>
              </div>
            </div>

            {/* Courts */}
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
              }}
            >
              {day.courts.map((court, ci) => (
                <div
                  key={ci}
                  className={
                    ci < day.courts.length - 1
                      ? "border-b md:border-b-0 md:border-r border-border p-6"
                      : "p-6"
                  }
                >
                  {/* Court name */}
                  <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                    {court.name}
                  </p>

                  {/* Sets */}
                  <div className="flex flex-col gap-3 mb-5">
                    {court.sets.map((s, si) => (
                      <div
                        key={si}
                        className="flex items-start gap-3 bg-background rounded-xl p-3"
                      >
                        <div className="shrink-0 text-center w-16">
                          <span className="text-xs font-bold text-muted block">{s.set}</span>
                          <span className="text-[10px] text-muted/60">{s.duration}</span>
                        </div>
                        <div className="w-px self-stretch bg-border shrink-0" />
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {renderMatchName(s.match)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Referee */}
                  <div className="flex items-center gap-2 text-xs text-muted border-t border-border pt-4">
                    <User size={12} className="shrink-0" />
                    <span>Wasit: <span className="font-semibold text-foreground">{court.referee}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
