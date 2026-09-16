// ─────────────────────────────────────────────────────────────
// HSS UK — Non-Member Accounts (Super Admin only)
// Lists guardian-only accounts created via the public "Create Non-Member
// Account" flow — distinct from the Member records under All Members.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { Download, Users, X } from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { mockNonMemberAccounts } from '../../mockAPI/nonMembersData';
import { formatDate, formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';

export default function NonMemberAccounts() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mockNonMemberAccounts.filter(a => {
      const name = `${a.firstName} ${a.lastName}`.toLowerCase();
      return !q ||
        name.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.activityCentre.toLowerCase().includes(q);
    }).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }, [searchQuery]);

  const handleExport = () => {
    const rows: string[][] = [
      ['Non-Member Accounts - HSS'],
      [`Generated: ${formatDate(new Date())}`],
      [],
      ['ID', 'First Name', 'Last Name', 'Email', 'Shakha', 'Registered', 'Children Linked'],
      ...filtered.map(a => [
        a.id, a.firstName, a.lastName, a.email, a.activityCentre,
        sharedFormatDateTime(a.registeredAt),
        String(a.children.length),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `non-member-accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Non-Member Accounts"
          subtitle="Guardian-only accounts created via Create Non-Member Account — not members themselves, but can register children for membership"
        >
          <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or Shakha…"
            className="h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[240px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="grid grid-cols-6 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 col-span-2">Guardian</span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Shakha</span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Registered</span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">Children Linked</span>
            <span></span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.length > 0 ? filtered.map(a => (
              <div key={a.id} className="grid grid-cols-6 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors items-center">
                <div className="col-span-2 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{a.firstName} {a.lastName}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{a.email}</p>
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{a.activityCentre}</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(a.registeredAt)}</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white text-right">{a.children.length}</span>
                <span className="flex justify-end">
                  {a.children.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border-primary-200 dark:border-primary-800">
                      <Users className="w-3 h-3" /> {a.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
                    </span>
                  )}
                </span>
              </div>
            )) : (
              <div className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">No non-member accounts found.</div>
            )}
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filtered.length} Non-Member Account{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
