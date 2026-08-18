import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gesit Event - Scoreboard",
  description: "Live scoreboard HUT RI ke-81 GESIT Companies",
  icons: { icon: "/HUTRI81.png" },
};

export default function ScoreboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
