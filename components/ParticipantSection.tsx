"use client";

import { useState, useEffect } from "react";
import { Participant } from "@/types";
import ParticipantCard from "./ParticipantCard";
import { Search, Loader2 } from "lucide-react";
import clsx from "clsx";

const TABS = ["Semua", "Lantai 26", "Lantai 27"];

export default function ParticipantSection() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch("/api/participants");
        const data = await res.json();
        if (data.participants) {
          setParticipants(data.participants);
        }
      } catch (error: any) {
        if (error?.name === "AbortError" || error?.message === "Failed to fetch") return;
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());

    let matchesTab = true;
    if (activeTab === "Lantai 26") {
      matchesTab = p.floor === "Lantai 26";
    } else if (activeTab === "Lantai 27") {
      matchesTab = p.floor === "Lantai 27";
    }

    return matchesSearch && matchesTab;
  });

  const visibleParticipants = filteredParticipants.slice(0, visibleCount);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
            Peserta Badminton Terdaftar
          </h2>
          <p className="text-muted text-sm font-medium">
            {filteredParticipants.length} Peserta Badminton
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setVisibleCount(12);
            }}
            className={clsx(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-navy text-white shadow-md shadow-navy/20"
                : "bg-white border border-border text-foreground hover:bg-gray-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Memuat data peserta...</p>
        </div>
      ) : visibleParticipants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleParticipants.map((p) => (
              <ParticipantCard key={p.registration_id} participant={p} />
            ))}
          </div>

          {filteredParticipants.length > visibleCount && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="bg-white border border-border hover:bg-gray-50 text-foreground px-6 py-2.5 rounded-full font-medium text-sm transition-all"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <p className="text-muted">Tidak ada peserta ditemukan.</p>
        </div>
      )}
    </div>
  );
}
