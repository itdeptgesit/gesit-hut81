"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundMusic() {
  const pathname = usePathname();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Only active on the homepage
  const isHomePage = pathname === "/";

  const sendCommand = (command: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*"
    );
  };

  // Mute/Unmute when navigating away from home
  useEffect(() => {
    if (!isReady) return;
    if (!isHomePage) {
      sendCommand("mute");
    } else {
      sendCommand("unMute");
    }
  }, [isHomePage, isReady]);

  // Mute when tab is hidden, unmute when visible (only on homepage)
  useEffect(() => {
    const handleVisibility = () => {
      if (!isReady) return;
      if (document.hidden) {
        sendCommand("mute");
      } else if (isHomePage) {
        if (!isMuted) sendCommand("unMute");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isHomePage, isReady, isMuted]);

  // Listen to YouTube player ready event
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "onReady") {
          setIsReady(true);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const toggleMute = () => {
    if (isMuted) {
      sendCommand("unMute");
    } else {
      sendCommand("mute");
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden YouTube IFrame */}
      <iframe
        ref={iframeRef}
        src="https://www.youtube.com/embed/b_HWhKIyM6w?autoplay=1&loop=1&playlist=b_HWhKIyM6w&controls=0&enablejsapi=1&origin=http://localhost:3000"
        allow="autoplay"
        onLoad={() => {
          // Give iframe time to initialize the player
          setTimeout(() => setIsReady(true), 2000);
        }}
        style={{
          position: "fixed",
          width: 0,
          height: 0,
          border: "none",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Floating mute/unmute button (only on homepage) */}
      {isHomePage && (
        <button
          onClick={toggleMute}
          title={isMuted ? "Aktifkan Musik" : "Matikan Musik"}
          className="fixed bottom-24 md:bottom-6 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-all shadow-lg"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </>
  );
}
