import { ACCESS, FEES, type PublicationProfile } from "../lib/advanced-search";
import { Clock, Coins, Unlock, CalendarCheck, ExternalLink, ShieldCheck } from "lucide-react";

export function PublicationSummary({
  profile,
  compact = false,
}: {
  profile: PublicationProfile | null;
  compact?: boolean;
}) {
  if (compact) {
    if (!profile) return null;
    return (
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
        {/* Fee Pill */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#c3ebe6] bg-[#eef8f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#086b69]">
          <Coins className="size-3 text-[#087f8c]" />
          {FEES[profile.feeModel ?? "UNKNOWN"]}
        </span>

        {/* Access Model Pill */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#bae6fd] bg-[#f0f9ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369a1]">
          <Unlock className="size-3 text-[#0284c7]" />
          {ACCESS[profile.accessModel ?? "UNKNOWN"]}
        </span>

        {/* Turnaround Time Pill */}
        {profile.publicationWeeks != null && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e2eaf0] bg-[#f8fafc] px-2.5 py-0.5 text-[11px] font-semibold text-[#5a6e85]">
            <Clock className="size-3 text-[#5a6e85]" />
            Typically {profile.publicationWeeks} wks
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d7e2ec] bg-white p-7 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7e2ec] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#112b46] flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-[#087f8c]" />
            Publication Policy & Editorial Turnaround
          </h2>
          <p className="text-xs text-[#5a6e85] mt-1">
            Owner-reviewed from official publisher policy guidelines.
          </p>
        </div>
        {profile && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6e85] bg-[#f8fafc] px-3 py-1 rounded-full border border-[#d7e2ec]">
            <CalendarCheck className="size-3.5 text-[#087f8c]" />
            Audited {new Date(profile.checkedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-[#d7e2ec] bg-[#f8fafc] p-4.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a6e85] uppercase tracking-wider">
            <Coins className="size-4 text-[#087f8c]" /> Author Publication Fees
          </div>
          <p className="mt-2 text-base font-bold text-[#112b46]">
            {FEES[profile?.feeModel ?? "UNKNOWN"]}
          </p>
        </div>

        <div className="rounded-xl border border-[#d7e2ec] bg-[#f8fafc] p-4.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a6e85] uppercase tracking-wider">
            <Unlock className="size-4 text-[#0284c7]" /> Access Rights
          </div>
          <p className="mt-2 text-base font-bold text-[#112b46]">
            {ACCESS[profile?.accessModel ?? "UNKNOWN"]}
          </p>
        </div>

        <div className="rounded-xl border border-[#d7e2ec] bg-[#f8fafc] p-4.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a6e85] uppercase tracking-wider">
            <Clock className="size-4 text-[#7c3aed]" /> Turnaround Duration
          </div>
          <p className="mt-2 text-base font-bold text-[#112b46]">
            {profile?.publicationWeeks != null
              ? `Typically ${profile.publicationWeeks} weeks`
              : "Not reported"}
          </p>
          <span className="text-[11px] text-[#5a6e85] block mt-0.5">
            Publisher estimate; not guaranteed.
          </span>
        </div>
      </div>

      {profile?.categories && profile.categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#112b46] mr-1">Subject Scope:</span>
          {profile.categories.map((c) => (
            <span
              key={c}
              className="rounded-lg border border-[#d7e2ec] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#112b46]"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {profile?.notes && (
        <div className="rounded-xl border border-[#e2eaf0] bg-[#f8fafc] p-4 text-xs leading-[1.618] text-[#5a6e85]">
          <p className="whitespace-pre-wrap">{profile.notes}</p>
        </div>
      )}

      {profile?.sourceUrl && (
        <div className="pt-1">
          <a
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f8c] hover:underline"
            href={profile.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View publisher policy source documentation <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
