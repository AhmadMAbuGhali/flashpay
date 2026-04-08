import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/25 via-transparent" />
      <div className="relative p-8">{children}</div>
    </div>
  );
}
