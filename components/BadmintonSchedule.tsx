"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Shield } from "lucide-react";
import { Participant } from "@/types";

const DAY_METADATA: Record<string, { dayName: string; date: string; location: string; tag: string; tagColor: string; duration: string }> = {
  "Hari 1": { dayName: "Selasa", date: "11 Agustus 2026", location: "Agora Mall Lt.11", tag: "Babak Semi-Final", tagColor: "navy", duration: "1 Jam" },
  "Hari 2": { dayName: "Rabu",   date: "12 Agustus 2026", location: "Agora Mall Lt.11", tag: "Babak Semi-Final", tagColor: "navy", duration: "1 Jam" },
  "Hari 3": { dayName: "Kamis",  date: "13 Agustus 2026", location: "Agora Mall Lt.11", tag: "Grand Final",     tagColor: "red",  duration: "2 Jam" },
};

const MATCH_LABELS: Record<string, string> = {
  SP_SF1:  "Single Putra — Semi-Final 1",
  SP_SF2:  "Single Putra — Semi-Final 2",
  SP_F:    "Single Putra — Grand Final",
  SPu_SF1: "Single Putri — Semi-Final 1",
  SPu_SF2: "Single Putri — Semi-Final 2",
  SPu_F:   "Single Putri — Grand Final",
  GC_SF1:  "Ganda Campuran — Semi-Final 1",
  GC_SF2:  "Ganda Campuran — Semi-Final 2",
  GC_F:    "Ganda Campuran — Grand Final",
};

export default function BadmintonSchedule() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/participants").then(res => res.json()),
      fetch("/api/schedules").then(res => res.json()),
    ])
      .then(([pd, sd]) => {
        if (pd.participants) setParticipants(pd.participants.filter((p: Participant) => p.event.toLowerCase().includes("badminton")));
        if (sd.schedules) setSchedules(sd.schedules);
      })
      .catch(err => {
        if (err?.name === "AbortError" || err?.message === "Failed to fetch") return;
        console.error("Error fetching data:", err);
      });
  }, []);

  const getBySlot = (category: string, slot: string) =>
    participants.find(p => p.category === category && p.bracket_position === slot);

  const getByFinal = (category: string, pos: string) =>
    participants.find(p => p.category === category && p.final_position === pos);

  const pName = (p: Participant, cat: string): string => {
    if (cat === "Ganda Campuran" && p.partner && p.partner !== "-") {
      return `${p.call_name || p.name.split(" ")[0]} & ${p.partner.split(" ")[0]}`;
    }
    return p.call_name || p.name.split(" ").slice(0, 2).join(" ");
  };

  const resolveMatch = (matchKey: string): { label: string; vs: string | null } => {
    const parts = matchKey.split("_");
    const catPrefix = parts[0];
    const matchType = parts[1];
    const category = catPrefix === "SP" ? "Single Putra" : catPrefix === "SPu" ? "Single Putri" : "Ganda Campuran";
    const label = MATCH_LABELS[matchKey] || matchKey;

    if (matchType === "SF1") {
      const p1 = getBySlot(category, "1");
      const p2 = getBySlot(category, "2");
      if (p1 || p2) return { label, vs: `${p1 ? pName(p1, category) : "TBD"} vs ${p2 ? pName(p2, category) : "TBD"}` };
    }
    if (matchType === "SF2") {
      const p1 = getBySlot(category, "3");
      const p2 = getBySlot(category, "4");
      if (p1 || p2) return { label, vs: `${p1 ? pName(p1, category) : "TBD"} vs ${p2 ? pName(p2, category) : "TBD"}` };
    }
    if (matchType === "F") {
      const fL = getByFinal(category, "L");
      const fR = getByFinal(category, "R");
      if (fL || fR) return { label, vs: `${fL ? pName(fL, category) : "TBD"} vs ${fR ? pName(fR, category) : "TBD"}` };
    }
    return { label, vs: null };
  };

  // Group: day → court → matches[]
  const grouped: Record<string, { meta: any; timeRange: string; courts: Record<string, { matches: any[] }> }> = {};
  for (const match of schedules) {
    if (!grouped[match.day]) {
      grouped[match.day] = {
        meta: DAY_METADATA[match.day] || { dayName: match.day, date: "", location: "Agora Mall Lt.11", tag: "Pertandingan", tagColor: "navy", duration: "" },
        timeRange: match.time,
        courts: {},
      };
    }
    if (!grouped[match.day].courts[match.court]) {
      grouped[match.day].courts[match.court] = { matches: [] };
    }
    grouped[match.day].courts[match.court].matches.push(match);
  }

  const days = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {days.length === 0 && (
          <div className="text-center py-10 text-muted">Belum ada jadwal pertandingan.</div>
        )}
        {days.map(([dayKey, { meta, timeRange, courts }]) => {
          const courtEntries = Object.entries(courts).sort(([a], [b]) => a.localeCompare(b));
          return (
            <div key={dayKey} className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-border bg-background">
                <div className="flex items-center gap-4">
                  <div className="text-center w-14 shrink-0">
                    <div
                      className="text-xs font-bold uppercase tracking-widest text-white px-2 py-1 rounded-lg mb-1"
                      style={{ backgroundColor: meta.tagColor === "red" ? "#E31E24" : "#102A4C" }}
                    >
                      {dayKey}
                    </div>
                    <p className="text-xs text-muted font-medium">{meta.dayName}</p>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground text-xl leading-tight">{meta.date}</h3>
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                      style={meta.tagColor === "red"
                        ? { background: "#E31E2415", color: "#E31E24" }
                        : { background: "#102A4C15", color: "#102A4C" }}
                    >
                      {meta.tag}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary shrink-0" />
                    <span className="font-medium">{timeRange} WIB</span>
                    {meta.duration && <span className="text-muted/60">({meta.duration})</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="font-medium">{meta.location}</span>
                  </div>
                </div>
              </div>

              {/* Courts Grid */}
              <div
                className="grid gap-0"
                style={{ gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))` }}
              >
                {courtEntries.map(([courtName, { matches }], ci) => (
                  <div
                    key={courtName}
                    className={ci < courtEntries.length - 1 ? "border-b md:border-b-0 md:border-r border-border p-6" : "p-6"}
                  >
                    {/* Court label */}
                    <p className="text-xs font-black uppercase tracking-widest text-muted mb-4">{courtName}</p>

                    {/* Matches */}
                    <div className="flex flex-col gap-3 mb-2">
                      {matches.map((m: any, mi: number) => {
                        const { label, vs } = resolveMatch(m.match_key);
                        return (
                          <div key={mi} className="bg-background rounded-xl p-3">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-sm font-semibold text-foreground leading-snug">
                              {vs ?? <span className="text-muted italic font-normal">Peserta akan diumumkan</span>}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                              <Shield size={11} className="shrink-0 text-primary" />
                              <span className="text-[11px] text-muted">Wasit: <span className="font-semibold text-foreground">{m.referee}</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
