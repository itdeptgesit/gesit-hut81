import { Participant } from "@/types";
import { User } from "lucide-react";
import clsx from "clsx";

export default function ParticipantCard({ participant }: { participant: Participant }) {
  const isBadminton = participant.event === "Internal Badminton Tournament 2026";

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <User size={18} />
        </div>
        <div className="min-w-0">
          <h4 className="font-heading font-semibold text-foreground text-base leading-tight truncate">
            {participant.name}
          </h4>
          <p className="text-xs text-muted mt-0.5 truncate">{participant.department}</p>
        </div>
      </div>

      {/* Floor badge + Event */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {participant.floor && (
          <span
            className={clsx(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              participant.floor === "Lantai 26"
                ? "bg-navy/10 text-navy"
                : "bg-primary/10 text-primary"
            )}
          >
            {participant.floor}
          </span>
        )}
        <span className="text-xs font-medium text-muted bg-gray-100 px-2.5 py-1 rounded-full truncate">
          {isBadminton ? "Badminton" : "Fun Games Day"}
        </span>
      </div>

      {/* Category */}
      {participant.category && participant.category !== "-" && (
        <p className="text-xs text-muted font-medium mb-3">
          {participant.category}
          {participant.partner && participant.partner !== "-" && (
            <span className="text-muted/60"> · {participant.partner}</span>
          )}
        </p>
      )}

      {/* Status */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted">Status</span>
        <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-semibold">
          {participant.status}
        </span>
      </div>
    </div>
  );
}
