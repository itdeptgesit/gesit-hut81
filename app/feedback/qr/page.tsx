"use client";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ScanLine } from "lucide-react";

export default function FeedbackQRPage() {
  const [feedbackUrl, setFeedbackUrl] = useState("https://event.gesit.co.id/feedback");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFeedbackUrl(`${window.location.origin}/feedback`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-4 sm:p-8">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-red-700/30 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-900/40 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-amber-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Decorative Event Logo Background */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-screen pointer-events-none"
        style={{ 
          backgroundImage: "url('/HUTRI81_FA_Logo__Main%20Logo%20Merah%20Hitam%20Latar%20Putih.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '120% auto'
        }}
      />

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Copy & Branding */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start animate-in slide-in-from-left-8 fade-in duration-700 ease-out">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-white tracking-widest uppercase">Live Feedback Session</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
            Evaluasi <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Acara HUT RI 81</span>
          </h1>
          
          <p className="text-zinc-400 text-lg lg:text-xl mb-10 max-w-md font-medium leading-relaxed">
            Suara Anda sangat berarti! Scan QR Code di samping menggunakan kamera HP Anda untuk mulai mengisi form evaluasi acara GESIT.
          </p>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
              <Image src="/gesit_logo.png" alt="GESIT" width={28} height={28} className="object-contain" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Diselenggarakan Oleh</p>
              <p className="text-sm font-bold text-white">GESIT - IT Department</p>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Panel */}
        <div className="shrink-0 relative animate-in slide-in-from-right-8 fade-in duration-700 delay-200 ease-out">
          <div className="absolute -inset-4 bg-gradient-to-tr from-red-600 to-red-400 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse" style={{ animationDuration: '3s' }} />
          
          <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/20 p-8 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col items-center">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-zinc-900">
              <ScanLine size={16} /> Scan Here
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-inner mt-4 relative group transition-transform hover:scale-105 duration-300">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-3xl -translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-3xl translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-3xl -translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-3xl translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <QRCodeSVG 
                value={feedbackUrl} 
                size={280} 
                level="H" 
                fgColor="#000000"
                imageSettings={{
                  src: "/gesit_logo.png",
                  x: undefined,
                  y: undefined,
                  height: 56,
                  width: 56,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="mt-8 bg-black/50 border border-white/10 rounded-xl px-5 py-3 w-full text-center backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Direct Link</p>
              <p className="text-xs text-white font-mono tracking-wider truncate">
                {feedbackUrl.replace("https://", "")}
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
