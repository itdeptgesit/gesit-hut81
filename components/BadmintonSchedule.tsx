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
    location: "Agora Mall Lt.11, Court 4 & Court 2",
    courts: [
      {
        name: "Lapangan 1",
        sets: [
          { set: "Set 1", duration: "±30 menit", matchKey: "SP_slot1_vs_slot3" },
          { set: "Set 2", duration: "±30 menit", matchKey: "GC_slot1_vs_slot3" },
        ],
        referee: "Argadana / Aditya",
      },
      {
        name: "Lapangan 2",
        sets: [
          { set: "Set 1", duration: "±30 menit", matchKey: "SPu_slot1_vs_slot3" },
          { set: "Set 2", duration: "±30 menit", matchKey: "GC_slot2_vs_slot4" },
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
          { set: "Set 1", duration: "±30 menit", matchKey: "SP_slot2_vs_slot4" },
          { set: "Set 2", duration: "±30 menit", matchKey: "SPu_slot2_vs_slot4" },
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
          { set: "Set 1", duration: "±30 menit", matchKey: "FINAL_SP" },
          { set: "Set 2", duration: "±30 menit", matchKey: "FINAL_GC" },
          { set: "Set 3", duration: "±30 menit", matchKey: "FINAL_SPu" },
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

  // Get display name for a participant
  const displayName = (p: Participant, category: string): string => {
    if (category === "Ganda Campuran" && p.partner && p.partner !== "-") {
      const n1 = p.call_name || p.name.split(" ")[0];
      const n2 = p.partner.split(" ")[0];
      return `${n1} & ${n2}`;
    }
    return p.call_name || p.name.split(" ").slice(0, 2).join(" ");
  };

  // Get participant by bracket_position
  const getBySlot = (category: string, slot: string): Participant | undefined =>
    participants.find((p) => p.category === category && p.bracket_position === slot);

  // Get participant by final_position
  const getByFinal = (category: string, finalPos: string): Participant | undefined =>
    participants.find((p) => p.category === category && p.final_position === finalPos);

  const resolveMatch = (matchKey: string): string => {
    const fallbacks: Record<string, string> = {
      SP_slot1_vs_slot3: "Single Pria Slot 1 vs Slot 3",
      SP_slot2_vs_slot4: "Single Pria Slot 2 vs Slot 4",
      SPu_slot1_vs_slot3: "Single Wanita Slot 1 vs Slot 3",
      SPu_slot2_vs_slot4: "Single Wanita Slot 2 vs Slot 4",
      GC_slot1_vs_slot3: "Ganda Campur Slot 1 vs Slot 3",
      GC_slot2_vs_slot4: "Ganda Campur Slot 2 vs Slot 4",
      FINAL_SP: "Final Single Pria",
      FINAL_SPu: "Final Single Wanita",
      FINAL_GC: "Final Ganda Campuran",
    };

    // Semi-final matches — resolved from bracket_position
    if (matchKey === "SP_slot1_vs_slot3") {
      const p1 = getBySlot("Single Putra", "1");
      const p2 = getBySlot("Single Putra", "3");
      if (p1 || p2) return `${p1 ? displayName(p1, "Single Putra") : "Slot 1"} vs ${p2 ? displayName(p2, "Single Putra") : "Slot 3"}`;
    }
    if (matchKey === "SP_slot2_vs_slot4") {
      const p1 = getBySlot("Single Putra", "2");
      const p2 = getBySlot("Single Putra", "4");
      if (p1 || p2) return `${p1 ? displayName(p1, "Single Putra") : "Slot 2"} vs ${p2 ? displayName(p2, "Single Putra") : "Slot 4"}`;
    }
    if (matchKey === "SPu_slot1_vs_slot3") {
      const p1 = getBySlot("Single Putri", "1");
      const p2 = getBySlot("Single Putri", "3");
      if (p1 || p2) return `${p1 ? displayName(p1, "Single Putri") : "Slot 1"} vs ${p2 ? displayName(p2, "Single Putri") : "Slot 3"}`;
    }
    if (matchKey === "SPu_slot2_vs_slot4") {
      const p1 = getBySlot("Single Putri", "2");
      const p2 = getBySlot("Single Putri", "4");
      if (p1 || p2) return `${p1 ? displayName(p1, "Single Putri") : "Slot 2"} vs ${p2 ? displayName(p2, "Single Putri") : "Slot 4"}`;
    }
    if (matchKey === "GC_slot1_vs_slot3") {
      const p1 = getBySlot("Ganda Campuran", "1");
      const p2 = getBySlot("Ganda Campuran", "3");
      if (p1 || p2) return `${p1 ? displayName(p1, "Ganda Campuran") : "Slot 1"} vs ${p2 ? displayName(p2, "Ganda Campuran") : "Slot 3"}`;
    }
    if (matchKey === "GC_slot2_vs_slot4") {
      const p1 = getBySlot("Ganda Campuran", "2");
      const p2 = getBySlot("Ganda Campuran", "4");
      if (p1 || p2) return `${p1 ? displayName(p1, "Ganda Campuran") : "Slot 2"} vs ${p2 ? displayName(p2, "Ganda Campuran") : "Slot 4"}`;
    }

    // Grand Final matches — resolved from final_position (L vs R)
    if (matchKey === "FINAL_SP") {
      const fL = getByFinal("Single Putra", "L");
      const fR = getByFinal("Single Putra", "R");
      if (fL || fR) {
        return `Final Single Pria: ${fL ? displayName(fL, "Single Putra") : "TBD"} vs ${fR ? displayName(fR, "Single Putra") : "TBD"}`;
      }
    }
    if (matchKey === "FINAL_SPu") {
      const fL = getByFinal("Single Putri", "L");
      const fR = getByFinal("Single Putri", "R");
      if (fL || fR) {
        return `Final Single Wanita: ${fL ? displayName(fL, "Single Putri") : "TBD"} vs ${fR ? displayName(fR, "Single Putri") : "TBD"}`;
      }
    }
    if (matchKey === "FINAL_GC") {
      const fL = getByFinal("Ganda Campuran", "L");
      const fR = getByFinal("Ganda Campuran", "R");
      if (fL || fR) {
        return `Final Ganda Campuran: ${fL ? displayName(fL, "Ganda Campuran") : "TBD"} vs ${fR ? displayName(fR, "Ganda Campuran") : "TBD"}`;
      }
    }

    return fallbacks[matchKey] || matchKey;
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
                          {resolveMatch(s.matchKey)}
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
