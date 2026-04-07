"use client";
import Image from "next/image";
import { Globe, ShieldCheck, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      
      {/* تأثير الإضاءة المشتقة من لون الشعار (Cyan Glow) */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-flash-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* طبقة نسيج خفيفة جداً لإعطاء فخامة للخلفية الداكنة */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="max-w-5xl w-full flex flex-col items-center relative z-10">
        
        {/* 1. الشعار مع هالة ضوئية متناغمة */}
        <div className="relative mb-10 group">
          {/* هالة خلفية بلون الشعار */}
          <div className="absolute inset-0 bg-flash-cyan/15 blur-[60px] rounded-full group-hover:bg-flash-cyan/25 transition-all duration-700" />
          
          <div className="relative p-3 bg-[#161B22]/80 border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-md">
            <Image 
              src="/logo.png" 
              alt="Flash Pay Logo" 
              width={160} 
              height={160} 
              className="rounded-[2.5rem] object-contain"
              priority
            />
          </div>
        </div>

        {/* 2. النصوص - تم ضبط الألوان لتكون مريحة فوق الخلفية الداكنة */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            انتظروا افتتاح موقع <span className="text-flash-cyan drop-shadow-[0_0_15px_rgba(0,210,255,0.3)]">Flash Pay</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-slate-400">
            للحوالات المالية قريباً
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-flash-cyan to-transparent mx-auto rounded-full" />
        </div>

        {/* 3. الفيديو داخل إطار احترافي (Dark Mode Card) */}
        <div className="w-full max-w-3xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative bg-[#11161D]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          
          {/* شريط معلومات تقني صغير فوق الفيديو */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 bg-flash-cyan rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">System Processing</span>
          </div>
        </div>

        {/* 4. البطاقات السفلية (Minimalist Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-16">
          {[
            { icon: <ShieldCheck className="text-flash-cyan" size={20} />, title: "أمان بنكي متطور" },
            { icon: <Globe className="text-flash-cyan" size={20} />, title: "تغطية عالمية شاملة" },
            { icon: <Lock className="text-flash-cyan" size={20} />, title: "خصوصية بياناتك أولويتنا" },
          ].map((item, i) => (
            <div key={i} className="group flex items-center gap-4 bg-[#161B22]/50 p-5 rounded-2xl border border-white/5 hover:border-flash-cyan/30 transition-all duration-500">
              <div className="p-2 bg-flash-cyan/5 rounded-lg group-hover:bg-flash-cyan/10 transition-colors">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{item.title}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 w-full text-center">
        <p className="text-[9px] font-medium uppercase tracking-[0.6em] text-white/10">
          Flash Pay Ecosystem • Global Standards • 2026
        </p>
      </footer>
    </main>
  );
}