"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Participant } from "@/types";
import clsx from "clsx";

const categories = ["Single Putra", "Single Putri", "Ganda Campuran"];

// Map category and match type to match_key
function getMatchKey(category: string, matchType: "SF1" | "SF2" | "F") {
  const catPrefix = category === "Single Putra" ? "SP" : category === "Single Putri" ? "SPu" : "GC";
  return `${catPrefix}_${matchType}`;
}

// Stable color palette for avatars based on first char
const AVATAR_COLORS = [
  "#e11d48", // rose
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// Convert any Google Drive URL to a direct thumbnail URL
function resolvePhotoUrl(url?: string): string {
  if (!url) return "";

  // Already a direct thumbnail URL
  if (url.includes("drive.google.com/thumbnail")) return url;

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w200`;
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w200`;
  }

  // Format: https://lh3.googleusercontent.com/d/FILE_ID (pass-through)
  if (url.includes("googleusercontent.com")) return url;

  // Return as-is for other URLs (e.g. Imgur, direct link)
  return url;
}

function PlayerAvatar({ name, photoUrl, size = "md" }: { name: string; photoUrl?: string; size?: "sm" | "md" }) {
  const initial = name && name !== "TBD" ? name[0].toUpperCase() : "?";
  const bgColor = getAvatarColor(name);
  const sizeClass = size === "sm" ? "w-12 h-12 text-base" : "w-14 h-14 text-xl";
  const resolvedUrl = resolvePhotoUrl(photoUrl);

  if (resolvedUrl) {
    return (
      <div className="relative shrink-0">
        <img
          src={resolvedUrl}
          alt={name}
          className={clsx("rounded-full object-cover border-2 border-white/20 shadow-lg", sizeClass)}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (sibling) sibling.style.display = "flex";
          }}
        />
        {/* Fallback shown only if image fails */}
        <div
          style={{ backgroundColor: bgColor, display: "none" }}
          className={clsx(
            "rounded-full font-black text-white items-center justify-center border-2 border-white/10 shadow-lg",
            sizeClass
          )}
        >
          {initial}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={clsx(
        "rounded-full font-black text-white flex items-center justify-center border-2 border-white/10 shadow-lg shrink-0",
        sizeClass
      )}
    >
      {initial}
    </div>
  );
}

interface SlotData {
  name: string;
  partner?: string;
  photoUrl?: string;
  partnerPhotoUrl?: string;
  floor: string;
  isDouble?: boolean;
  isTBD?: boolean;
  scheduleInfo?: { day: string; time: string; court: string; referee: string };
}

export default function TournamentBracket() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(categories[0]);

  useEffect(() => {
    Promise.all([
      fetch("/api/participants").then(res => res.json()),
      fetch("/api/schedules").then(res => res.json())
    ])
      .then(([participantsData, schedulesData]) => {
        if (participantsData.participants) {
          setParticipants(
            participantsData.participants.filter((p: Participant) =>
              p.event.toLowerCase().includes("badminton")
            )
          );
        }
        if (schedulesData.schedules) {
          setSchedules(schedulesData.schedules);
        }
      })
      .catch(err => {
        if (err?.name === "AbortError" || err?.message === "Failed to fetch") return;
        console.error("Error fetching data:", err);
      });
  }, []);

  const getParticipant = (category: string, bracketPosition: string): Participant | null => {
    return participants.find(
      (p) => p.category === category && p.bracket_position === bracketPosition
    ) || null;
  };

  const getFinalist = (category: string, finalPosition: "L" | "R"): Participant | null => {
    return participants.find(
      (p) => p.category === category && p.final_position === finalPosition
    ) || null;
  };

  const getSlotData = (category: string, bracketPosition: string, defaultFloor: string): SlotData => {
    const p = getParticipant(category, bracketPosition);
    
    const matchType = (bracketPosition === "1" || bracketPosition === "2") ? "SF1" : "SF2";
    const matchKey = getMatchKey(category, matchType);
    const scheduleRow = schedules.find(s => s.match_key === matchKey);
    const scheduleInfo = scheduleRow ? { day: scheduleRow.day, time: scheduleRow.time, court: scheduleRow.court, referee: scheduleRow.referee } : undefined;

    if (!p) {
      return { name: "TBD", floor: defaultFloor, isTBD: true, scheduleInfo };
    }

    if (category === "Ganda Campuran") {
      const name1 = p.call_name || p.name.split(" ")[0];
      const name2 = p.partner && p.partner !== "-" ? p.partner.split(" ")[0] : "Partner";
      return {
        name: name1,
        partner: name2,
        photoUrl: p.photo_url || "",
        partnerPhotoUrl: p.partner_photo_url || "",
        floor: p.floor || defaultFloor,
        isDouble: true,
        isTBD: false,
        scheduleInfo,
      };
    }

    return {
      name: p.call_name || p.name.split(" ").slice(0, 2).join(" "),
      photoUrl: p.photo_url || "",
      floor: p.floor || defaultFloor,
      isTBD: false,
      scheduleInfo,
    };
  };

  const getSlots = (): [SlotData, SlotData, SlotData, SlotData] => {
    if (activeTab === "Single Putra") {
      return [
        getSlotData("Single Putra", "1", "26A"),
        getSlotData("Single Putra", "2", "27A"),
        getSlotData("Single Putra", "3", "26B"),
        getSlotData("Single Putra", "4", "27B"),
      ];
    }
    if (activeTab === "Single Putri") {
      return [
        getSlotData("Single Putri", "1", "26A"),
        getSlotData("Single Putri", "2", "27A"),
        getSlotData("Single Putri", "3", "26B"),
        getSlotData("Single Putri", "4", "27B"),
      ];
    }
    return [
      getSlotData("Ganda Campuran", "1", "26A"),
      getSlotData("Ganda Campuran", "2", "27A"),
      getSlotData("Ganda Campuran", "3", "26B"),
      getSlotData("Ganda Campuran", "4", "27B"),
    ];
  };

  const slots = getSlots();

  const TeamBox = ({ slot }: { slot: SlotData }) => {
    return (
      <div className="relative group w-full">
        {/* Hover glow */}
        <div className="absolute inset-0 bg-primary/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

        <div className="relative bg-gradient-to-br from-[#1c1c1e] to-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white shadow-xl group-hover:border-primary/40 transition-all duration-300">
          {/* Header: floor label + status dot */}
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] text-primary font-black tracking-[0.25em] uppercase">{slot.floor}</span>
            <div className={clsx("w-1.5 h-1.5 rounded-full", slot.isTBD ? "bg-white/20" : "bg-green-500 shadow-[0_0_6px_#22c55e]")}></div>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Avatars */}
            {slot.isDouble ? (
              <div className="relative flex shrink-0">
                <div className="relative z-10">
                  <PlayerAvatar name={slot.name} photoUrl={slot.photoUrl} size="sm" />
                </div>
                <div className="-ml-3 ring-4 ring-[#1c1c1e] rounded-full relative z-20">
                  <PlayerAvatar name={slot.partner || "P"} photoUrl={slot.partnerPhotoUrl} size="sm" />
                </div>
              </div>
            ) : (
              <PlayerAvatar name={slot.name} photoUrl={slot.photoUrl} size="md" />
            )}

            {/* Name(s) */}
            <div className="flex flex-col overflow-hidden">
              {slot.isDouble ? (
                <>
                  <span className={clsx("text-sm font-black truncate uppercase leading-tight", slot.isTBD ? "text-white/25" : "text-white")}>
                    {slot.name}
                  </span>
                  <span className="text-xs font-bold truncate uppercase text-white/50 leading-tight">
                    &amp; {slot.partner}
                  </span>
                </>
              ) : (
                <span className={clsx("text-sm font-black truncate uppercase leading-tight", slot.isTBD ? "text-white/25" : "text-white")}>
                  {slot.name}
                </span>
              )}
            </div>
          </div>

          {/* Schedule info chip */}
          {slot.scheduleInfo && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/40 font-medium">
              <span className="bg-white/5 px-1.5 py-0.5 rounded font-bold text-white/60">{slot.scheduleInfo.day}</span>
              <span>{slot.scheduleInfo.time}</span>
              <span className="text-primary/70 font-bold">{slot.scheduleInfo.court}</span>
              {slot.scheduleInfo.referee && (
                <span className="ml-auto text-white/30 font-medium">🏸 {slot.scheduleInfo.referee}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-16 mb-8">
      <div className="text-center mb-10">
        <h3 className="font-heading font-black text-3xl md:text-5xl text-foreground uppercase tracking-widest drop-shadow-sm mb-3">
          Tournament Bracket
        </h3>
        <p className="text-primary font-bold tracking-[0.2em] uppercase text-sm">
          Satu Tim, Satu Cita, Raih Kemenangan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-gray-100 border border-gray-200 p-1.5 rounded-full shadow-inner gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={clsx(
                "px-3 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm uppercase tracking-wider md:tracking-widest transition-all whitespace-nowrap",
                activeTab === cat
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Container — scrollable on mobile */}
      <div className="w-full overflow-x-auto hide-scrollbar pb-6 md:pb-0">
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-3xl relative shadow-2xl min-w-[800px]">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="p-6 md:p-10 w-full flex items-center justify-between gap-2 relative z-10">

            {/* LEFT BRACKET */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                <TeamBox slot={slots[0]} />
                <TeamBox slot={slots[1]} />
              </div>
              {/* L-shaped connector */}
              <div className="w-8 shrink-0 border-y-2 border-r-2 border-white/10 h-[100px] rounded-r-xl" />
              <div className="w-6 shrink-0 border-b-2 border-white/10" />
            </div>

            {/* CENTER TROPHY + GRAND FINAL */}
            <div className="flex flex-col items-center gap-4 px-3 md:px-6 relative z-20 shrink-0">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-yellow-500/25 blur-3xl rounded-full group-hover:bg-yellow-500/35 transition-all duration-500" />
                <Trophy
                  className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.7)] relative z-10 transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1}
                />
              </div>

              {/* Grand Final box with finalists */}
              <div
                className="relative p-[2px] rounded-sm shadow-[0_0_30px_rgba(227,30,36,0.2)]"
                style={{ background: "linear-gradient(90deg, #e31e24, #b91c1c)" }}
              >
                <div className="bg-[#0a0a0c] px-5 md:px-8 py-3 text-center rounded-sm">
                  <div className="tracking-widest text-sm md:text-base font-black text-white whitespace-nowrap">
                    GRAND FINAL
                  </div>
                  {/* Grand Final schedule info */}
                  {(() => {
                    const finalKey = getMatchKey(activeTab, "F");
                    const finalRow = schedules.find(s => s.match_key === finalKey);
                    if (!finalRow) return null;
                    return (
                      <div className="flex items-center justify-center gap-2 mt-1.5 text-[9px] text-white/40 font-medium">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded font-bold text-white/50">{finalRow.day}</span>
                        <span>{finalRow.time}</span>
                        <span className="text-red-400/80 font-bold">{finalRow.court}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Finalists panel */}
              {(() => {
                const fL = getFinalist(activeTab, "L");
                const fR = getFinalist(activeTab, "R");
                if (!fL && !fR) return null;
                return (
                  <div className="w-full flex flex-col gap-2 mt-1">
                    {[fL, fR].map((f, idx) =>
                      f ? (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-[#0a0a0c] border border-red-800/40 rounded-lg px-3 py-2"
                        >
                          <PlayerAvatar name={f.call_name || f.name} photoUrl={f.photo_url} size="sm" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-white font-black text-xs uppercase tracking-wide truncate">
                              {activeTab === "Ganda Campuran" && f.partner && f.partner !== "-"
                                ? `${f.call_name || f.name.split(" ")[0]} & ${f.partner.split(" ")[0]}`
                                : f.call_name || f.name.split(" ").slice(0, 2).join(" ")}
                            </span>
                            <span className="text-red-400 text-[9px] font-bold uppercase tracking-widest">
                              {idx === 0 ? "Finalis" : "Finalis"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#0a0a0c] border border-white/5 rounded-lg px-3 py-2 opacity-40"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
                          <span className="text-white/20 font-bold text-xs uppercase tracking-wide">TBD</span>
                        </div>
                      )
                    )}
                  </div>
                );
              })()}
            </div>

            {/* RIGHT BRACKET */}
            <div className="flex items-center flex-row-reverse flex-1 min-w-0">
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                <TeamBox slot={slots[2]} />
                <TeamBox slot={slots[3]} />
              </div>
              {/* L-shaped connector */}
              <div className="w-8 shrink-0 border-y-2 border-l-2 border-white/10 h-[100px] rounded-l-xl" />
              <div className="w-6 shrink-0 border-b-2 border-white/10" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
