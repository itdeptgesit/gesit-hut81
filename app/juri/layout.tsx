import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gesit Event - Juri",
  description: "Portal penilaian juri HUT RI ke-81 GESIT Companies",
  icons: { icon: "/HUTRI81.png" },
};

export default function JuriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
