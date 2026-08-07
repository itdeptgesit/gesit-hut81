import { Team } from "@/types";
import { Users, Shield } from "lucide-react";
import clsx from "clsx";

interface TeamCardProps {
  team: Team;
  onClick: (team: Team) => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  // Determine color theme based on team name or event as an example
  // Here we just use a default primary theme
  const isRed = team.team_name.toLowerCase().includes("merah");
  
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
            isRed ? "bg-primary" : "bg-navy"
          )}
        >
          <Shield size={24} />
        </div>
        <div>
          <h4 className="font-heading font-bold text-foreground text-xl leading-tight uppercase tracking-wide">
            {team.team_name}
          </h4>
          <span className="text-xs font-medium text-muted bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
            {team.event}
          </span>
        </div>
      </div>

      <div className="mb-4 flex-1">
        <div className="flex flex-col gap-1 mb-3 text-sm">
          <span className="text-muted text-xs uppercase tracking-wider">Captain</span>
          <span className="font-medium text-foreground">{team.captain}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted">
          <Users size={16} />
          <span>{team.members.split(',').length} Participants</span>
        </div>
      </div>

      <button
        onClick={() => onClick(team)}
        className="w-full py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Lihat Team
      </button>
    </div>
  );
}
