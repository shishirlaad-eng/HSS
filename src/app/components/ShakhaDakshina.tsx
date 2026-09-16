// ─────────────────────────────────────────────────────────────
// HSS UK — Shakha Dakshina (Shakha Admin and above)
// Admin-facing view of all one-off and recurring Dakshina given by members
// within the admin's scope (Shakha / Nagar / Vibhag / national).
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { Download, HandCoins, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { mockMemberDonations, mockRecurringDakshina } from '../../mockAPI/donationsData';
import { mockMembers } from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { formatDate, formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';

type Tab = 'one-off' | 'recurring';

function money(n: number) {
  return `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function memberFor(memberId: string) {
  return mockMembers.find(m => m.id === memberId);
}

export default function ShakhaDakshina() {
  const { scope } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [tab, setTab] = useState<Tab>('one-off');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCentre, setFilterCentre] = useState('');

  // Join each donation record to its member's full location, since
  // MemberDonationRecord / RecurringDakshinaRecord only carry activityCentre —
  // filterByScope needs country/region/town for Vibhag/Nagar/Kendriya scoping.
  const scopedOneOff = useMemo(() => {
    const withLocation = mockMemberDonations.map(d => {
      const m = memberFor(d.memberId);
      return { ...d, country: m?.country, region: m?.region, town: m?.town };
    });
    return filterByScope(withLocation, scope);
  }, [scope]);

  const scopedRecurring = useMemo(() => {
    const withLocation = mockRecurringDakshina.map(d => {
      const m = memberFor(d.memberId);
      return { ...d, country: m?.country, region: m?.region, town: m?.town };
    });
    return filterByScope(withLocation, scope);
  }, [scope]);

  const centreOptions = scopedFilterOptions.centreOptions;

  const filteredOneOff = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedOneOff.filter(d => {
      const m = memberFor(d.memberId);
      const matchesSearch = !q ||
        (m?.name.toLowerCase().includes(q) ?? false) ||
        d.memberId.toLowerCase().includes(q) ||
        d.activityCentre.toLowerCase().includes(q);
      const matchesCentre = !filterCentre || d.activityCentre === filterCentre;
      return matchesSearch && matchesCentre;
    }).sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [scopedOneOff, searchQuery, filterCentre]);

  const filteredRecurring = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedRecurring.filter(d => {
      const m = memberFor(d.memberId);
      const matchesSearch = !q ||
        (m?.name.toLowerCase().includes(q) ?? false) ||
        d.memberId.toLowerCase().includes(q) ||
        d.activityCentre.toLowerCase().includes(q);
      const matchesCentre = !filterCentre || d.activityCentre === filterCentre;
      return matchesSearch && matchesCentre;
    }).sort((a, b) => b.firstPaymentDate.localeCompare(a.firstPaymentDate));
  }, [scopedRecurring, searchQuery, filterCentre]);

  const oneOffTotal = filteredOneOff.reduce((sum, d) => sum + d.amount, 0);
  const recurringActiveTotal = filteredRecurring.filter(d => d.status === 'active').reduce((sum, d) => sum + d.amount, 0);

  const hasFilter = searchQuery.length > 0 || filterCentre.length > 0;
  const clearFilters = () => { setSearchQuery(''); setFilterCentre(''); };

  const handleExport = () => {
    const rows: string[][] = tab === 'one-off'
      ? [
          ['Shakha Dakshina - One-off', `Generated: ${formatDate(new Date())}`],
          [],
          ['Member ID', 'Member Name', 'Shakha', 'Date & Time', 'Amount'],
          ...filteredOneOff.map(d => [
            d.memberId,
            memberFor(d.memberId)?.name ?? '',
            d.activityCentre,
            sharedFormatDateTime(d.datetime),
            money(d.amount),
          ]),
        ]
      : [
          ['Shakha Dakshina - Recurring', `Generated: ${formatDate(new Date())}`],
          [],
          ['Member ID', 'Member Name', 'Shakha', 'Frequency', 'Amount', 'First Payment Date', 'Gift Aid', 'Status'],
          ...filteredRecurring.map(d => [
            d.memberId,
            memberFor(d.memberId)?.name ?? '',
            d.activityCentre,
            d.frequency,
            money(d.amount),
            formatDate(d.firstPaymentDate),
            d.giftAid ? 'Yes' : 'No',
            d.status === 'active' ? 'Active' : 'Cancelled',
          ]),
        ];
    const csv = rows.map(r => r.map(c => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shakha-dakshina_${tab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Shakha Dakshina"
          subtitle="One-off and recurring Dakshina given by members within your Shakha / Nagar / Vibhag"
        >
          <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
        </PageHeader>

        <div className="mt-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1">
          <button
            onClick={() => setTab('one-off')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'one-off'
                ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <HandCoins className="w-4 h-4" /> One-off Dakshina
          </button>
          <button
            onClick={() => setTab('recurring')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'recurring'
                ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Recurring Dakshina
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by member name, ID or Shakha…"
            className="h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[220px]"
          />
          {centreOptions.length > 1 && (
            <select
              value={filterCentre}
              onChange={e => setFilterCentre(e.target.value)}
              className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]"
            >
              <option value="">All Shakhas</option>
              {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {tab === 'one-off' ? (
          <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Member</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Member ID</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Shakha</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Date &amp; Time</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">Amount</span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredOneOff.length > 0 ? filteredOneOff.map(d => (
                <div key={d.id} className="grid grid-cols-5 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors items-center">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{memberFor(d.memberId)?.name ?? d.memberId}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{d.memberId}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{d.activityCentre}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{sharedFormatDateTime(d.datetime)}</span>
                  <span className="text-sm font-semibold text-success-600 dark:text-success-400 text-right">{money(d.amount)}</span>
                </div>
              )) : (
                <div className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">No one-off Dakshina records found.</div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filteredOneOff.length} Dakshina</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Total: <span className="text-success-600 dark:text-success-400">{money(oneOffTotal)}</span></span>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="grid grid-cols-7 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Member</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Shakha</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Frequency</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">First Payment</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Gift Aid</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Status</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">Amount</span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredRecurring.length > 0 ? filteredRecurring.map(d => (
                <div key={d.id} className="grid grid-cols-7 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors items-center">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{memberFor(d.memberId)?.name ?? d.memberId}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{d.activityCentre}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{d.frequency}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(d.firstPaymentDate)}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{d.giftAid ? 'Yes' : 'No'}</span>
                  <span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                      d.status === 'active'
                        ? 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                    }`}>
                      {d.status === 'active' ? 'Active' : 'Cancelled'}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-success-600 dark:text-success-400 text-right">{money(d.amount)} / {d.frequency.toLowerCase()}</span>
                </div>
              )) : (
                <div className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">No recurring Dakshina records found.</div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filteredRecurring.length} Recurring Dakshina</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Active total: <span className="text-success-600 dark:text-success-400">{money(recurringActiveTotal)}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
