// ─────────────────────────────────────────────────────────────
// HSS UK — Shakha Dakshina (Shakha Admin and above)
// Admin-facing view of all one-off, recurring and other Dakshina
// within the admin's scope (Shakha / Nagar / Vibhag / national).
// ─────────────────────────────────────────────────────────────
import { useMemo, useState, useEffect } from 'react';
import { Download, HandCoins, RefreshCw, SlidersHorizontal, X, Coins, Upload } from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import ReportDateFilter, { inDateRange } from './ReportDateFilter';
import { mockMemberDonations, mockRecurringDakshina } from '../../mockAPI/donationsData';
import { mockMembers } from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { formatDate, formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';
import {
  OtherDakshinaRecord,
  getOtherDakshinaRecords,
} from '../../mockAPI/otherDakshinaData';
import OtherDakshinaUploadModal from './OtherDakshinaUploadModal';

type Tab = 'one-off' | 'recurring' | 'other';

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
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Other Dakshina records (stored in shared persistent store)
  const [otherRecords, setOtherRecords] = useState<OtherDakshinaRecord[]>(() => getOtherDakshinaRecords());

  useEffect(() => {
    const handleUpdate = () => {
      setOtherRecords(getOtherDakshinaRecords());
    };
    window.addEventListener('hss_other_dakshina_updated', handleUpdate);
    return () => window.removeEventListener('hss_other_dakshina_updated', handleUpdate);
  }, []);

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

  const scopedOther = useMemo(() => {
    const withLocation = otherRecords.map(d => ({
      ...d,
      activityCentre: d.shakha, // map to activityCentre for filterByScope
    }));
    return filterByScope(withLocation, scope);
  }, [otherRecords, scope]);

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
      const dateStr = d.datetime.split('T')[0]; // extract YYYY-MM-DD from datetime
      const matchesDate = inDateRange(dateStr, dateStart, dateEnd);
      return matchesSearch && matchesCentre && matchesDate;
    }).sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [scopedOneOff, searchQuery, filterCentre, dateStart, dateEnd]);

  const filteredRecurring = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedRecurring.filter(d => {
      const m = memberFor(d.memberId);
      const matchesSearch = !q ||
        (m?.name.toLowerCase().includes(q) ?? false) ||
        d.memberId.toLowerCase().includes(q) ||
        d.activityCentre.toLowerCase().includes(q);
      const matchesCentre = !filterCentre || d.activityCentre === filterCentre;
      const matchesDate = inDateRange(d.firstPaymentDate, dateStart, dateEnd);
      return matchesSearch && matchesCentre && matchesDate;
    }).sort((a, b) => b.firstPaymentDate.localeCompare(a.firstPaymentDate));
  }, [scopedRecurring, searchQuery, filterCentre, dateStart, dateEnd]);

  const filteredOther = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedOther.filter(d => {
      const matchesSearch = !q ||
        d.reference.toLowerCase().includes(q) ||
        d.shakha.toLowerCase().includes(q) ||
        d.shakhaId.toLowerCase().includes(q);
      const matchesCentre = !filterCentre || d.shakha === filterCentre;
      const matchesDate = inDateRange(d.date, dateStart, dateEnd);
      return matchesSearch && matchesCentre && matchesDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [scopedOther, searchQuery, filterCentre, dateStart, dateEnd]);

  const oneOffTotal = filteredOneOff.reduce((sum, d) => sum + d.amount, 0);
  const recurringActiveTotal = filteredRecurring.filter(d => d.status === 'active').reduce((sum, d) => sum + d.amount, 0);
  const otherTotal = filteredOther.reduce((sum, d) => sum + d.amount, 0);

  const hasFilter = searchQuery.length > 0 || filterCentre.length > 0 || !!dateStart;
  const clearFilters = () => { setSearchQuery(''); setFilterCentre(''); setDateStart(''); setDateEnd(''); setDateLabel(''); };

  const handleExport = () => {
    let rows: string[][] = [];
    if (tab === 'one-off') {
      rows = [
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
      ];
    } else if (tab === 'recurring') {
      rows = [
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
    } else {
      rows = [
        ['Shakha Dakshina - Other Dakshina', `Generated: ${formatDate(new Date())}`],
        [],
        ['Shakha ID', 'Reference', 'Shakha', 'Date', 'Amount'],
        ...filteredOther.map(d => [
          d.shakhaId,
          d.reference,
          d.shakha,
          formatDate(d.date),
          money(d.amount),
        ]),
      ];
    }

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
          subtitle="One-off, recurring and other Dakshina given by members and attributed to Shakhas within your scope"
        >
          <div className="flex items-center gap-2">
            {tab === 'other' && (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </button>
            )}
            <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
          </div>
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
          <button
            onClick={() => setTab('other')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'other'
                ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" /> Other Dakshina
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={tab === 'other' ? "Search by Shakha ID, reference or Shakha…" : "Search by member name, ID or Shakha…"}
            className="h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[240px]"
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
          <ReportDateFilter
            start={dateStart}
            end={dateEnd}
            label={dateLabel}
            onChange={(s, e, l) => { setDateStart(s); setDateEnd(e); setDateLabel(l); }}
            title="Payment Date Range"
            emptyLabel="Payment Date"
          />
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {tab === 'one-off' && (
          <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Member</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Member ID</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Shakha</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Date &amp; Time</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredOneOff.length > 0 ? filteredOneOff.map(d => (
                    <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{memberFor(d.memberId)?.name ?? d.memberId}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap font-mono">{d.memberId}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{d.activityCentre}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{sharedFormatDateTime(d.datetime)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-success-600 dark:text-success-400 text-right whitespace-nowrap">{money(d.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        No one-off Dakshina records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filteredOneOff.length} Dakshina</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Total: <span className="text-success-600 dark:text-success-400">{money(oneOffTotal)}</span></span>
            </div>
          </div>
        )}

        {tab === 'recurring' && (
          <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Member</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Member ID</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Shakha</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Frequency</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">First Payment</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Gift Aid</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredRecurring.length > 0 ? filteredRecurring.map(d => (
                    <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{memberFor(d.memberId)?.name ?? d.memberId}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap font-mono">{d.memberId}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{d.activityCentre}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{d.frequency}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{formatDate(d.firstPaymentDate)}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{d.giftAid ? 'Yes' : 'No'}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                          d.status === 'active'
                            ? 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                        }`}>
                          {d.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-success-600 dark:text-success-400 text-right whitespace-nowrap">
                        {money(d.amount)} / {d.frequency.toLowerCase()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        No recurring Dakshina records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filteredRecurring.length} Recurring Dakshina</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Active total: <span className="text-success-600 dark:text-success-400">{money(recurringActiveTotal)}</span></span>
            </div>
          </div>
        )}

        {tab === 'other' && (
          <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Shakha ID</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Reference</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Shakha</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredOther.length > 0 ? filteredOther.map(d => (
                    <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap font-mono">{d.shakhaId}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap font-mono">{d.reference}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{d.shakha}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{formatDate(d.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-success-600 dark:text-success-400 text-right whitespace-nowrap">{money(d.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        <p>No other Dakshina records found.</p>
                        <button
                          type="button"
                          onClick={() => setShowUploadModal(true)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload CSV
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filteredOther.length} Other Dakshina</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Total: <span className="text-success-600 dark:text-success-400">{money(otherTotal)}</span></span>
            </div>
          </div>
        )}

        {/* Other Dakshina CSV Upload Modal */}
        <OtherDakshinaUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setOtherRecords(getOtherDakshinaRecords());
            setTab('other');
          }}
        />
      </div>
    </div>
  );
}
