// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — My Donations (Member)
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Heart, X, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./hb/listing";
import { mockMemberDonations } from "../../mockAPI/donationsData";
import { useRoleScope } from "../contexts/RoleScopeContext";

type RecurringFrequency = 'Monthly' | 'Quarterly' | 'Annually';

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

export default function MyDonations({ onGiveDakshina }: { onGiveDakshina?: () => void }) {
  const { scope } = useRoleScope();
  const mockMyDonations = mockMemberDonations.filter(donation => donation.memberId === scope.selfMemberId);
  const total = mockMyDonations.reduce((s, d) => s + d.amount, 0);

  const [showModal, setShowModal]                 = useState(false);
  const [showStandingOrder, setShowStandingOrder]  = useState(false);
  const [frequency, setFrequency]                  = useState<RecurringFrequency>('Monthly');
  const [amount, setAmount]                        = useState('');
  const closeModal = () => setShowModal(false);

  const handleSetupStandingOrder = () => {
    toast.success(`Recurring Dakshina of £${amount} ${frequency.toLowerCase()} submitted successfully.`);
    setShowStandingOrder(false);
    setFrequency('Monthly');
    setAmount('');
  };

  if (showStandingOrder) {
    return (
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <PageHeader
          title="Recurring Dakshina"
          subtitle="Set up a regular standing order from your personal bank account"
        />

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm space-y-5">
          <div className="rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30 p-4 space-y-3">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              You can setup a regular standing order from your personal bank account by including the donation amount and the frequency (Monthly, Quarterly or Annually). This is the easiest and most convenient way to make a regular donation to HSS (UK). Please see details below:
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-40 flex-shrink-0">Bank Name:</span>
                <span className="text-neutral-500 dark:text-neutral-400">[TBD]</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-40 flex-shrink-0">Sort Code:</span>
                <span className="text-neutral-500 dark:text-neutral-400">[TBD]</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-40 flex-shrink-0">Account Number:</span>
                <span className="text-neutral-500 dark:text-neutral-400">[TBD]</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-40 flex-shrink-0">Reference Number:</span>
                <span className="font-mono font-semibold text-primary-700 dark:text-primary-300">{scope.selfMemberId ?? '[Your Membership ID]'}</span>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 pl-0 pt-0.5">
                This is your MyHSS membership ID.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Monthly', 'Quarterly', 'Annually'] as RecurringFrequency[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    frequency === f
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-2">Amount (£)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">£</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowStandingOrder(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!amount}
              onClick={handleSetupStandingOrder}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Heart className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <PageHeader
        title="My Dakshina"
        subtitle="Your Dakshina history with HSS UK"
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Heart className="w-4 h-4" />
          Give Dakshina
        </button>
      </PageHeader>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-4 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Payment Reference</span>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Date &amp; Time</span>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Recorded Shakha</span>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">Amount</span>
        </div>
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
                <span className="text-sm font-semibold text-success-600 dark:text-success-400 text-right">
                  £{don.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {mockMyDonations.length} Dakshina
          </span>
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            Total: <span className="text-success-600 dark:text-success-400">£{total.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* Give Dakshina Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">Give Dakshina</h3>
              </div>
              <button onClick={closeModal} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Select how you'd like to contribute:</p>

              {/* Type selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { closeModal(); onGiveDakshina?.(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <Zap className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    One-off Dakshina
                  </span>
                </button>
                <button
                  onClick={() => { closeModal(); setShowStandingOrder(true); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <RefreshCw className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Recurring Dakshina
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
