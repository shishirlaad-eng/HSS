// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — My Donations (Member)
// ─────────────────────────────────────────────────────────────

import { Heart } from "lucide-react";
import { PageHeader } from "./hb/listing";
import { mockMemberDonations } from "../../mockAPI/donationsData";
import { useRoleScope } from "../contexts/RoleScopeContext";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

export default function MyDonations({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { scope } = useRoleScope();
  const mockMyDonations = mockMemberDonations.filter(donation => donation.memberId === scope.selfMemberId);
  const total = mockMyDonations.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="px-6 py-6">
      <PageHeader
        title="My Dakshina"
        subtitle="Your Dakshina history with HSS UK"
        breadcrumbs={[{ label: "Home", href: "#" }, { label: "My Dakshina", current: true }]}
      >
        <button
          onClick={() => onNavigate?.("donate")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Heart className="w-4 h-4" />
          Give Dakshina
        </button>
      </PageHeader>

      <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
        {/* Table header */}
        <div className="grid grid-cols-4 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Reference</span>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Date &amp; Time</span>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Recorded Shakha</span>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide text-right">Amount</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {mockMyDonations.map(don => {
            const { date, time } = formatDateTime(don.datetime);
            return (
              <div key={don.id} className="grid grid-cols-4 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors items-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{don.id}</span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {date} <span className="text-neutral-400 dark:text-neutral-500">{time}</span>
                </p>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{don.activityCentre}</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                  £{don.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer total */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {mockMyDonations.length} Dakshina
          </span>
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            Total: <span className="text-emerald-600 dark:text-emerald-400">£{total.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
