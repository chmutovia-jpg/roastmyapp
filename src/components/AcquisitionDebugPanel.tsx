import type { ProjectWorkspace, UsageStats, UserProfile } from "../types/roast";

type AcquisitionDebugPanelProps = {
  profile: UserProfile | null;
  usageStats: UsageStats;
  workspaces: ProjectWorkspace[];
};

export function AcquisitionDebugPanel({ profile, usageStats, workspaces }: AcquisitionDebugPanelProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <aside className="pointer-events-none fixed right-4 top-20 z-30 hidden max-w-[240px] rounded-[1.4rem] border border-black/10 bg-white/58 p-3 text-[11px] text-[#20262b]/58 shadow-[0_18px_46px_rgba(16,20,24,0.08)] backdrop-blur-2xl 2xl:block">
      <p className="technical-label">ACQUISITION DEBUG</p>
      <dl className="mt-3 space-y-2">
        <DebugLine label="source" value={profile?.acquisitionSource || "none"} />
        <DebugLine label="analyses" value={`${usageStats.anonymousAnalyses}/${usageStats.registeredAnalyses}`} />
        <DebugLine label="clarifications" value={String(usageStats.clarifications)} />
        <DebugLine label="saved projects" value={String(workspaces.length)} />
        <DebugLine label="created" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("ru-RU") : "none"} />
      </dl>
    </aside>
  );
}

function DebugLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-black/10 pt-2">
      <dt>{label}</dt>
      <dd className="font-semibold text-[#101418]/70">{value}</dd>
    </div>
  );
}
