"use client";

import { useState } from "react";
import { Check, Copy, Landmark } from "lucide-react";

interface CopyableAccountCardProps {
  accountText: string;
  currency: string;
}

export default function CopyableAccountCard({ accountText, currency }: CopyableAccountCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy account text:", error);
    }
  };

  return (
    // Copy-ready account cards are the key interaction on the country detail page.
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_70px_-40px_rgba(0,210,255,0.42)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,210,255,0.1),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(106,126,170,0.14),transparent_30%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-[#00D2FF]">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Currency</p>
              <p className="mt-1 text-base font-semibold text-white">{currency}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="secondary-button w-full sm:w-auto"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Account payload</p>
          <p className="whitespace-pre-wrap break-words font-medium leading-7 text-slate-100">{accountText}</p>
        </div>
      </div>
    </div>
  );
}