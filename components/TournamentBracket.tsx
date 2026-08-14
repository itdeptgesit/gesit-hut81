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
      (p) => {
        if (p.category !== category) return false;
        if (p.final_position === finalPosition) return true;
        if (p.final_position === "W") {
          if (finalPosition === "L" && (p.bracket_position === "1" || p.bracket_position === "2")) return true;
          if (finalPosition === "R" && (p.bracket_position === "3" || p.bracket_position === "4")) return true;
        }
        return false;
      }
    ) || null;
  };

  const getWinner = (category: string): Participant | null => {
    return participants.find(
      (p) => p.category === category && p.final_position === "W"
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

  const TeamBox = ({ slot, align = "left" }: { slot: SlotData; align?: "left" | "right" }) => {
    return (
      <div className={clsx(
        "flex items-center gap-2.5 py-2 px-3 rounded-lg transition-all duration-200",
        "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10",
        align === "right" && "flex-row-reverse"
      )}>
        {/* Avatar */}
        {slot.isDouble ? (
          <div className="relative flex shrink-0">
            <PlayerAvatar name={slot.name} photoUrl={slot.photoUrl} size="sm" />
            <div className="-ml-2 ring-2 ring-[#0a0a0c] rounded-full">
              <PlayerAvatar name={slot.partner || "P"} photoUrl={slot.partnerPhotoUrl} size="sm" />
            </div>
          </div>
        ) : (
          <PlayerAvatar name={slot.name} photoUrl={slot.photoUrl} size="sm" />
        )}

        {/* Text */}
        <div className={clsx("flex flex-col", align === "right" && "items-end")}>
          <span className={clsx(
            "text-[11px] font-bold uppercase leading-tight",
            slot.isTBD ? "text-white/20" : "text-white"
          )}>
            {slot.isDouble && slot.partner ? `${slot.name} & ${slot.partner}` : slot.name}
          </span>
          <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider">
            {slot.floor}
          </span>
        </div>
      </div>
    );
  };

  const FinalistBox = ({ participant, position, winner }: { participant: Participant | null; position: "L" | "R"; winner: Participant | null }) => {
    const isTBD = !participant;
    const isWinner = winner && participant && winner.id === participant.id;
    const isLoser = winner && participant && winner.id !== participant.id;
    
    let name = "TBD";
    let partner = "";
    let photoUrl = "";
    let partnerPhotoUrl = "";
    let floor = position === "L" ? "Finalis L" : "Finalis R";
    const isDouble = activeTab === "Ganda Campuran";

    if (participant) {
      floor = participant.floor || "";
      if (isDouble) {
        name = participant.call_name || participant.name.split(" ")[0];
        partner = participant.partner && participant.partner !== "-" ? participant.partner.split(" ")[0] : "Partner";
        photoUrl = participant.photo_url || "";
        partnerPhotoUrl = participant.partner_photo_url || "";
      } else {
        name = participant.call_name || participant.name.split(" ").slice(0, 2).join(" ");
        photoUrl = participant.photo_url || "";
      }
    }

    return (
      <div className="relative group w-44 shrink-0">
        {!isTBD && !isLoser && (
          <div className={clsx(
            "absolute inset-0 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
            isWinner ? "bg-yellow-500/10" : "bg-red-600/10"
          )}></div>
        )}

        <div className={clsx(
          "relative bg-gradient-to-br from-[#1c1c1e] to-[#0f0f0f] border rounded-xl px-3.5 py-3 text-white shadow-xl transition-all duration-300",
          isTBD 
            ? "border-white/5 opacity-30" 
            : isWinner
              ? "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-gradient-to-br from-[#221a08] to-[#0c0a05]"
              : isLoser
                ? "border-white/5 opacity-30 grayscale"
                : "border-red-500/30 group-hover:border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
        )}>
          <div className="flex justify-between items-center mb-2.5">
            <span className={clsx(
              "text-[9px] font-black tracking-widest uppercase",
              isWinner ? "text-yellow-400" : isTBD ? "text-white/30" : "text-red-400"
            )}>
              {isTBD ? `FINALIS ${position}` : floor || `FINALIS ${position}`}
            </span>
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full",
              isTBD 
                ? "bg-white/20" 
                : isWinner 
                  ? "bg-yellow-500 shadow-[0_0_6px_#eab308]" 
                  : "bg-red-500 shadow-[0_0_6px_#ef4444]"
            )}></div>
          </div>

          <div className="flex items-center gap-3">
            {isTBD ? (
              <>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white/10 text-xs shrink-0">
                  ?
                </div>
                <span className="text-xs font-bold text-white/20 uppercase tracking-wider">TBD</span>
              </>
            ) : (
              <>
                {isDouble ? (
                  <div className="relative flex shrink-0">
                    <div className="relative z-10">
                      <PlayerAvatar name={name} photoUrl={photoUrl} size="sm" />
                    </div>
                    <div className="-ml-3 ring-4 ring-[#1c1c1e] rounded-full relative z-20">
                      <PlayerAvatar name={partner || "P"} photoUrl={partnerPhotoUrl} size="sm" />
                    </div>
                  </div>
                ) : (
                  <PlayerAvatar name={name} photoUrl={photoUrl} size="sm" />
                )}

                <div className="flex flex-col overflow-hidden">
                  {isDouble ? (
                    <>
                      <span className="text-xs font-black truncate uppercase leading-tight text-white">
                        {name}
                      </span>
                      <span className="text-[10px] font-bold truncate uppercase text-white/50 leading-tight">
                        &amp; {partner}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-black truncate uppercase leading-tight text-white">
                      {name}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
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

      <div className="w-full overflow-x-auto hide-scrollbar pb-6 md:pb-0">
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-3xl relative shadow-2xl" style={{ minWidth: "900px" }}>
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="p-6 md:p-10 w-full flex items-center relative z-10" style={{ gap: 0 }}>
            {(() => {
              const fL = getFinalist(activeTab, "L");
              const fR = getFinalist(activeTab, "R");
              const winner = getWinner(activeTab);

              return (
                <>
                  {/* LEFT SEMI-FINAL COLUMN */}
                  <div className="flex-1 flex flex-col gap-2" style={{ minWidth: "150px", maxWidth: "180px" }}>
                    <TeamBox slot={slots[0]} />
                    <div className="h-px bg-white/[0.06] mx-2" />
                    <TeamBox slot={slots[1]} />
                  </div>

                  {/* LEFT CONNECTOR: bracket brace → line */}
                  <div className="flex items-center shrink-0" style={{ width: "48px" }}>
                    <div className="flex-1 border-y-2 border-r-2 border-white/10 rounded-r-lg" style={{ height: "72px" }} />
                    <div className="w-3 border-b-2 border-white/10" />
                  </div>

                  {/* LEFT FINALIST */}
                  <div className="shrink-0">
                    <FinalistBox participant={fL} position="L" winner={winner} />
                  </div>

                  {/* LINE: finalist → grand final */}
                  <div className="flex-1 border-b-2 border-white/10" style={{ minWidth: "12px", maxWidth: "32px" }} />

                  {/* CENTER COLUMN (GRAND FINAL & CHAMPION) */}
                  <div className="flex flex-col items-center gap-3 px-2 relative z-20 shrink-0" style={{ width: "190px" }}>
                    {/* Champion or Trophy icon */}
                    {winner ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-500/25 blur-xl rounded-full" />
                          <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] relative z-10" strokeWidth={1.5} />
                        </div>
                        <div
                          className="w-full rounded-xl p-px"
                          style={{ background: "linear-gradient(135deg, #eab308, #ca8a04)" }}
                        >
                          <div className="bg-[#0c0a05] rounded-xl px-3 py-2 text-center">
                            <div className="text-[8px] font-black text-yellow-400 tracking-[0.2em] uppercase mb-1">🏆 CHAMPION 🏆</div>
                            <div className="text-[11px] font-black text-white uppercase truncate">
                              {activeTab === "Ganda Campuran" && winner.partner && winner.partner !== "-"
                                ? `${winner.call_name || winner.name.split(" ")[0]} & ${winner.partner.split(" ")[0]}`
                                : winner.call_name || winner.name.split(" ").slice(0, 2).join(" ")}
                            </div>
                            <div className="text-[9px] text-yellow-500/60 font-semibold uppercase tracking-widest">{winner.floor}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
                        <Trophy className="w-10 h-10 text-white/15 relative z-10" strokeWidth={1} />
                      </div>
                    )}

                    {/* GRAND FINAL Badge */}
                    <div
                      className="w-full rounded-xl p-px"
                      style={{ background: "linear-gradient(135deg, #e31e24, #991b1b)" }}
                    >
                      <div className="bg-[#0a0a0c] rounded-xl px-3 py-2.5 text-center">
                        <div className="text-[11px] font-black text-white tracking-[0.2em] uppercase">GRAND FINAL</div>
                        {!winner && (
                          <div className="text-[9px] font-bold text-red-400 tracking-widest mt-0.5 animate-pulse">VS</div>
                        )}
                        {winner && (
                          <div className="text-[8px] font-bold text-green-400 tracking-wider mt-0.5 uppercase">Selesai ✓</div>
                        )}
                        {(() => {
                          const finalKey = getMatchKey(activeTab, "F");
                          const finalRow = schedules.find(s => s.match_key === finalKey);
                          if (!finalRow) return null;
                          return (
                            <div className="flex items-center justify-center gap-1 mt-1.5 text-[8px] text-white/30">
                              <span className="bg-white/5 px-1 py-0.5 rounded text-white/40 font-bold">{finalRow.day}</span>
                              <span>{finalRow.time}</span>
                              <span className="text-red-400/70 font-bold">{finalRow.court}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* LINE: grand final → right finalist */}
                  <div className="flex-1 border-b-2 border-white/10" style={{ minWidth: "12px", maxWidth: "32px" }} />

                  {/* RIGHT FINALIST */}
                  <div className="shrink-0">
                    <FinalistBox participant={fR} position="R" winner={winner} />
                  </div>

                  {/* RIGHT CONNECTOR: line ← bracket brace */}
                  <div className="flex items-center shrink-0" style={{ width: "48px" }}>
                    <div className="w-3 border-b-2 border-white/10" />
                    <div className="flex-1 border-y-2 border-l-2 border-white/10 rounded-l-lg" style={{ height: "72px" }} />
                  </div>

                  {/* RIGHT SEMI-FINAL COLUMN */}
                  <div className="flex-1 flex flex-col gap-2" style={{ minWidth: "150px", maxWidth: "180px" }}>
                    <TeamBox slot={slots[2]} align="right" />
                    <div className="h-px bg-white/[0.06] mx-2" />
                    <TeamBox slot={slots[3]} align="right" />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
