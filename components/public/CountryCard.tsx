import Link from "next/link";
import { ArrowUpRight, Globe2, Landmark } from "lucide-react";

interface CountryCardProps {
  name: string;
  slug: string;
  flagEmoji?: string | null;
  flagIconUrl?: string | null;
  currencies: string[];
  accountCount: number;
}

export default function CountryCard({ name, slug, flagEmoji, flagIconUrl, currencies, accountCount }: CountryCardProps) {
  return (
    <Link
      href={`/country/${slug}`}
      className="group noise-overlay relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_-36px_rgba(0,210,255,0.42)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-[#00D2FF]/70 hover:shadow-[0_40px_120px_-50px_rgba(0,210,255,0.6)]"
    >
      {/* Card background glow keeps the grid feeling premium without flat repetition. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,210,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(106,126,170,0.22),transparent_36%)] opacity-80 transition duration-300 group-hover:opacity-100" />
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/15 bg-slate-950/60 text-3xl shadow-[0_18px_44px_-28px_rgba(0,210,255,0.5)]">
              {flagIconUrl ? (
                <img src={flagIconUrl} alt={`${name} flag`} className="h-10 w-10 rounded-full object-cover" />
              ) : flagEmoji ? (
                <span>{flagEmoji}</span>
              ) : (
                <Globe2 className="h-8 w-8 text-[#00D2FF]" />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[#9db6db]">Country</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{name}</h3>
            </div>
          </div>
          <div className="rounded-full border border-[#00D2FF]/30 bg-[#00D2FF]/10 p-2 text-[#00D2FF] transition group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currencies.slice(0, 4).map(currency => (
            <span
              key={`${slug}-${currency}`}
              className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
            >
              {currency}
            </span>
          ))}
          {currencies.length > 4 && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              +{currencies.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-slate-950/55 px-4 py-3">
          <div className="flex items-center gap-3 text-slate-300">
            <Landmark className="h-4 w-4 text-[#00D2FF]" />
            <span className="text-sm">{accountCount} public accounts</span>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Open page</span>
        </div>
      </div>
    </Link>
  );
}