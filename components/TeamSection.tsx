"use client";

import { useState, useEffect } from "react";
import { Team } from "@/types";
import TeamCard from "./TeamCard";
import { Loader2, X } from "lucide-react";

export default function TeamSection() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        if (data.teams) {
          setTeams(data.teams);
        }
      } catch (error: any) {
        if (error?.name === "AbortError" || error?.message === "Failed to fetch") return;
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-8 text-center md:text-left">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
          Tim Fun Games Day
        </h2>
        <p className="text-muted text-sm font-medium">
          Daftar kelompok peserta yang akan bertanding di perlombaan Fun Games Day
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Memuat data team...</p>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.team_id} team={team} onClick={setSelectedTeam} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <p className="text-muted">Tidak ada data team.</p>
        </div>
      )}

      {/* Modal Detail Team */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X size={18} />
            </button>
            
            <div className="p-8">
              <h3 className="font-heading font-bold text-3xl mb-1 uppercase text-primary">
                {selectedTeam.team_name}
              </h3>
              <p className="text-sm text-muted font-medium mb-6 bg-gray-100 inline-block px-3 py-1 rounded-full">
                {selectedTeam.event}
              </p>

              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">
                  Members
                </span>
                <ol className="list-decimal list-inside space-y-2 text-foreground font-medium">
                  {selectedTeam.members.split(',').map((member, idx) => {
                    const mem = member.trim();
                    const isAbsent = mem.includes("(PERDIN)") || mem.includes("(Cuti)") || mem.includes("(undur join date)");
                    return (
                      <li key={idx} className={`pl-2 ${isAbsent ? "text-[#E31E24] font-bold" : ""}`}>
                        {mem}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedTeam(null)}
                className="bg-navy hover:bg-navy-dark text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
