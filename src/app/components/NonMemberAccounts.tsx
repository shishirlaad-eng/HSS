// ─────────────────────────────────────────────────────────────
// HSS UK — Non-Member / Registered Accounts (Super Admin only)
// Lists accounts that never became a full HSS member: the "Non-Member"
// registration route (guardian-only, can register children), and the
// "Member" route where only login credentials were created and
// registration was never completed. Distinct from Member records under
// All Members either way.
//
// Detail page deliberately mirrors MemberDetail.tsx's layout (header
// rows, navy-accent InfoSection cards, tab bar, change-history table)
// so admins get the same look and feel as a registered member's profile.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import {
  Download, Users, X, MoreVertical, Eye, Power, Trash2,
  ArrowLeft, User, Clock, UserPlus, AlertTriangle, Mail,
  ToggleLeft, ToggleRight, History as HistoryIcon,
} from 'lucide-react';
import { PageHeader, PrimaryButton, IconButton, SecondaryButton } from './hb/listing';
import {
  mockNonMemberAccounts,
  NonMemberAccount,
  NonMemberAccountType,
} from '../../mockAPI/nonMembersData';
import { formatDate, formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';

type PageState = 'list' | 'detail';
type DetailTab = 'profile' | 'history';

function TypeBadge({ type }: { type: NonMemberAccountType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${
      type === 'Non-Member'
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border-primary-200 dark:border-primary-800'
        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
    }`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${
      status === 'active'
        ? 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800'
        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
    }`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}

// ── Matches MemberDetail.tsx's InfoSection exactly (navy top accent, header bar, grid body) ──
function InfoSection({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 2 | 4 }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className={`px-6 pb-6 pt-4 grid gap-6 ${cols === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <div className="text-sm font-medium text-neutral-900 dark:text-white">{children || '—'}</div>
    </div>
  );
}

interface HistoryEvent {
  label: string;
  detail?: string;
  timestamp: string;
}

function DeleteConfirmModal({ account, onCancel, onConfirm }: {
  account: NonMemberAccount;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-error-50 dark:bg-error-950/30 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
          </div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">Delete this account?</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            This will permanently delete <strong className="text-neutral-700 dark:text-neutral-300">{account.firstName} {account.lastName}</strong>'s account
            {account.children.length > 0 ? ` and its ${account.children.length} linked child profile${account.children.length > 1 ? 's' : ''}` : ''}. This cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 mt-2 border-t border-neutral-200 dark:border-neutral-800">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white text-sm font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NonMemberAccounts() {
  const [accounts, setAccounts] = useState<NonMemberAccount[]>(mockNonMemberAccounts);
  const [extraHistory, setExtraHistory] = useState<Record<string, HistoryEvent[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pageState, setPageState] = useState<PageState>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('profile');
  const [deleteTarget, setDeleteTarget] = useState<NonMemberAccount | null>(null);

  const selected = accounts.find(a => a.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return accounts.filter(a => {
      const name = `${a.firstName} ${a.lastName}`.toLowerCase();
      return !q || name.includes(q) || a.email.toLowerCase().includes(q);
    }).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }, [accounts, searchQuery]);

  const openDetail = (account: NonMemberAccount) => {
    setSelectedId(account.id);
    setActiveTab('profile');
    setPageState('detail');
  };

  const logHistory = (accountId: string, event: HistoryEvent) => {
    setExtraHistory(prev => ({ ...prev, [accountId]: [...(prev[accountId] ?? []), event] }));
  };

  const toggleStatus = (account: NonMemberAccount) => {
    const nextStatus = account.status === 'active' ? 'inactive' : 'active';
    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, status: nextStatus } : a));
    logHistory(account.id, {
      label: nextStatus === 'active' ? 'Account reactivated' : 'Account marked inactive',
      timestamp: new Date().toISOString(),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(null);
    if (selectedId === deleteTarget.id) {
      setPageState('list');
      setSelectedId(null);
    }
  };

  const handleExport = () => {
    const rows: string[][] = [
      ['Non-Member / Registered Accounts - HSS'],
      [`Generated: ${formatDate(new Date())}`],
      [],
      ['ID', 'First Name', 'Last Name', 'Email', 'Type', 'Status', 'Registered On', 'Children Linked'],
      ...filtered.map(a => [
        a.id, a.firstName, a.lastName, a.email, a.accountType, a.status === 'active' ? 'Active' : 'Inactive',
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

  // ── Detail view — mirrors MemberDetail.tsx's layout ─────────────
  if (pageState === 'detail' && selected) {
    const history: HistoryEvent[] = [
      { label: 'Account created', detail: `via ${selected.accountType === 'Non-Member' ? 'Create Non-Member Account' : 'Create Member Account (incomplete)'}`, timestamp: selected.registeredAt },
      ...selected.children.map(c => ({ label: 'Child profile created', detail: `${c.firstName} ${c.lastName}`, timestamp: c.createdAt })),
      ...(extraHistory[selected.id] ?? []),
    ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const isActive = selected.status === 'active';

    const tabs: { id: DetailTab; label: string }[] = [
      { id: 'profile', label: 'Profile' },
      { id: 'history', label: 'History' },
    ];

    return (
      <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
        <div className="max-w-[100%] mx-auto">

          {/* ── PROFILE HEADER — same structure as MemberDetail ── */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">

                {/* Row 1 — Name · ID */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-[32px] font-semibold text-neutral-900 dark:text-white">
                    {selected.firstName} {selected.lastName}
                  </h1>
                  <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                  <span className="text-xl font-medium text-neutral-400 dark:text-neutral-500">
                    [{selected.id}]
                  </span>
                </div>

                {/* Row 2 — Type badge · Status badge */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <TypeBadge type={selected.accountType} />
                  <StatusBadge status={selected.status} />
                </div>

                {/* Row 3 — Email */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Mail className="w-3.5 h-3.5" />{selected.email}
                  </a>
                </div>

                {/* Row 4 — Registered */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Registered {sharedFormatDateTime(selected.registeredAt)}
                  </span>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <SecondaryButton icon={ArrowLeft} onClick={() => { setPageState('list'); setSelectedId(null); }}>
                  Back to Non-Member Accounts
                </SecondaryButton>
                <button
                  onClick={() => toggleStatus(selected)}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    isActive
                      ? 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      : 'border-success-200 text-success-700 bg-success-50 hover:bg-success-100 dark:bg-success-950/20 dark:border-success-800 dark:text-success-400'
                  }`}
                >
                  {isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  {isActive ? 'Mark Inactive' : 'Reactivate'}
                </button>
                <button
                  onClick={() => setDeleteTarget(selected)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[#ffaaab] text-[#9a0c17] bg-[#fff0f0] hover:bg-[#ffe0e0] dark:bg-[#fff0f0]/10 dark:border-[#ffaaab]/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* ── TABBED CONTENT — same structure as MemberDetail ── */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">

            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <div className="flex overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3 text-sm whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <InfoSection title="Account Details">
                    <InfoItem label="First Name">{selected.firstName}</InfoItem>
                    <InfoItem label="Last Name">{selected.lastName}</InfoItem>
                    <InfoItem label="Email Address">{selected.email}</InfoItem>
                    <InfoItem label="Type"><TypeBadge type={selected.accountType} /></InfoItem>
                    <InfoItem label="Status"><StatusBadge status={selected.status} /></InfoItem>
                    <InfoItem label="Registered On">{sharedFormatDateTime(selected.registeredAt)}</InfoItem>
                  </InfoSection>

                  {selected.accountType === 'Non-Member' && (
                    <div
                      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
                      style={{ borderTop: '3px solid #172E4D' }}
                    >
                      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Children ({selected.children.length})</h4>
                      </div>
                      {selected.children.length > 0 ? (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {selected.children.map(c => (
                            <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white">{c.firstName} {c.lastName}</span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">Added {formatDate(c.createdAt)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">No children registered yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Registered On</span>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {formatDate(selected.registeredAt)}
                        <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 ml-1.5">
                          {new Date(selected.registeredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Registration Route</span>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {selected.accountType === 'Non-Member' ? 'Create Non-Member Account' : 'Create Member Account (incomplete)'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                      <HistoryIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white mr-2">Account History</h4>
                      <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                        {history.length} record{history.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-800">
                            {['Date / Time', 'Event', 'Detail'].map(label => (
                              <th key={label} className="px-4 py-2.5 text-left text-[14px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                          {history.map((h, i) => (
                            <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">{sharedFormatDateTime(h.timestamp)}</td>
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900 dark:text-white">{h.label}</td>
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{h.detail ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {deleteTarget && (
          <DeleteConfirmModal account={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Non-Member Accounts"
          subtitle="Accounts that haven't become a full HSS member yet — either registered via Create Non-Member Account, or started Create Member Account and never completed registration."
        >
          <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[240px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="mt-4 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {['First Name', 'Last Name', 'Email', 'Type', 'Registered On', 'Children'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.length > 0 ? filtered.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => openDetail(a)}
                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer ${a.status === 'inactive' ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{a.firstName}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{a.lastName}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{a.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap"><TypeBadge type={a.accountType} /></td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{sharedFormatDateTime(a.registeredAt)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {a.accountType === 'Non-Member' ? (
                        a.children.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700" title={a.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}>
                            <Users className="w-3 h-3" /> {a.children.length}
                          </span>
                        ) : <span className="text-sm text-neutral-400">0</span>
                      ) : (
                        <span className="text-sm text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <IconButton
                        icon={MoreVertical}
                        borderless
                        title="Actions"
                        menuItems={[
                          { icon: Eye, label: 'View', onClick: () => openDetail(a) },
                          { icon: Power, label: a.status === 'active' ? 'Mark Inactive' : 'Reactivate', onClick: () => toggleStatus(a) },
                          { icon: Trash2, label: 'Delete', onClick: () => setDeleteTarget(a) },
                        ]}
                      />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">No accounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{filtered.length} Account{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal account={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}
