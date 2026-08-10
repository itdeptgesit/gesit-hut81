"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      } else {
        setChecking(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (checking && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-[#0B1D36] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
