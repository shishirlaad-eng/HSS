import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Search,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  BarChart3,
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  CheckCircle,
  Ban,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CalendarClock,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  SummaryWidgets,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  mockMembers,
  Member,
  MemberStatus,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  getAgeGroupLabel,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import MemberDetail from './MemberDetail';
import { toast } from 'sonner';
import { useModulePermissions, useRoleScope } from '../contexts/RoleScopeContext';
import { getScopedFilterOptions } from '../../mockAPI/roleScope';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail';
type ApprovalAction = 'approve' | 'reject';

// ── Status / type helpers ─────────────────────────────────────

const AGE_GROUP_CHIP: Record<AgeGroup, string> = {
  bal: 'bg-[#fef0fc] text-[#c026d3] border border-[#f0abfc]',
  shishu: 'bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]',
  kishor: 'bg-[#e6f6fd] text-[#0080b8] border border-[#89d5f6]',
  tarun: 'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]',
  yuva: 'bg-[#f1fced] text-[#3d8928] border border-[#b8efa0]',
  jyestha: 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
};

const COMPLIANCE_CFG = {
  completed: { dot: 'bg-[#4EAE33]', text: 'text-[#3d8928]', label: 'Completed' },
  pending:   { dot: 'bg-[#F9B03D]', text: 'text-[#d97706]', label: 'Pending'   },
};

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AGE_GROUP_CHIP[group]}`}>
      {AGE_GROUP_LABELS[group]}
    </span>
  );
}

function ComplianceBadge({ status }: { status: 'pending' | 'completed' }) {
  const cfg = COMPLIANCE_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
    </span>
  );
}

// ── Waiting days helper ───────────────────────────────────────

function waitingDays(registrationDate: string): number {
  return Math.floor((Date.now() - new Date(registrationDate).getTime()) / 86_400_000);
}

function WaitingBadge({ days }: { days: number }) {
  const cls =
    days >= 14 ? 'bg-[#fff0f0] text-[#9a0c17] border-[#ffaaab]' :
    days >= 7  ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]' :
                 'bg-neutral-50 text-neutral-600 border-neutral-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      <CalendarClock className="w-3 h-3" />
      {days}d
    </span>
  );
}

// ── Approve confirmation modal ────────────────────────────────

function ApproveConfirmModal({
  isOpen, member, isLoading, onClose, onConfirm,
}: {
  isOpen: boolean;
  member: Member | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen || !member) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#f1fced] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-[#4EAE33]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Confirm Approval</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Are you sure you want to approve this member? They will be granted active membership.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Member: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.name}</span>
              <span className="ml-2 font-mono text-neutral-400">{member.id}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-[#4EAE33] hover:bg-[#3d8928] text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing…' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject reason modal ───────────────────────────────────────

function RejectReasonModal({
  isOpen, member, isLoading, reason, onReasonChange, onClose, onConfirm,
}: {
  isOpen: boolean;
  member: Member | null;
  isLoading: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const isValid = reason.trim().length > 0;
  const showError = touched && !isValid;

  // Reset touched state when modal opens/closes
  useEffect(() => {
    if (!isOpen) setTouched(false);
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const handleConfirm = () => {
    setTouched(true);
    if (isValid) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5 text-[#BC0F1C]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Reject Application</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please provide a reason for rejection. This will be recorded against the member's application.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1.5">
              Member: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.name}</span>
              <span className="ml-2 font-mono text-neutral-400">{member.id}</span>
            </p>
          </div>
        </div>

        {/* Reason field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Rejection Reason <span className="text-[#BC0F1C]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => onReasonChange(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={4}
            placeholder="Enter the reason for rejecting this application…"
            className={`w-full text-sm rounded-lg border px-3 py-2.5 resize-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
              showError
                ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
                : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            {showError ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Rejection reason is required.
              </p>
            ) : (
              <p className="text-xs text-neutral-400">Briefly describe why the application is being rejected.</p>
            )}
            <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">{reason.length} chars</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-[#BC0F1C] hover:bg-[#9a0c17] text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function PendingApprovals() {
  const mp = useModulePermissions('members');
  const { scope } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  // Source: all members; only pending-approval ones shown
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const [viewMode, setViewMode]     = useState<ViewMode>('grid');
  const [pageState, setPageState]   = useState<PageState>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [searchQuery, setSearchQuery]         = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters]                 = useState<FilterCondition[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [showSummary, setShowSummary] = useState(true);

  const [sortField, setSortField]         = useState<string>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // oldest first

  const [modal, setModal] = useState<{
    isOpen: boolean; member: Member | null; action: ApprovalAction; isLoading: boolean; rejectionReason: string;
  }>({ isOpen: false, member: null, action: 'approve', isLoading: false, rejectionReason: '' });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  // ── Derived pending list ────────────────────────────────────

  const pendingMembers = useMemo(
    () => members.filter(m => m.status === 'pending'),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pendingMembers.filter(m => {
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);

      const matchesFilters = filters.every(f => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Age Groups (years old)': return f.values.some(v => v === getAgeGroupLabel(m.dateOfBirth));
          case 'Gender':           return f.values.some(v => v.toLowerCase() === m.gender);
          case 'Country':          return f.values.includes(m.country);
          case 'Region':           return f.values.includes(m.region);
          case 'Town':             return f.values.includes(m.town);
          case 'Activity Centre':  return f.values.includes(m.activityCentre);
          case 'DBS Status':       return f.values.some(v => v.toLowerCase() === m.compliance.dbs);
          case 'First Aid Status': return f.values.some(v => v.toLowerCase() === m.compliance.firstAid);
          default:                 return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  }, [pendingMembers, searchQuery, filters]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      const aVal = (a as any)[sortField] ?? '';
      const bVal = (b as any)[sortField] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, sortField, sortDirection]);

  const paginatedMembers = useMemo(() => {
    if (itemsPerPage === 0) return sortedMembers;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMembers.slice(start, start + itemsPerPage);
  }, [sortedMembers, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredMembers.length / itemsPerPage);

  // ── Summary counts ──────────────────────────────────────────

  const now = Date.now();
  const todayStart  = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart   = new Date(now - 7 * 86_400_000);

  const pendingToday = pendingMembers.filter(
    m => new Date(m.registrationDate) >= todayStart
  ).length;

  const pendingThisWeek = pendingMembers.filter(
    m => new Date(m.registrationDate) >= weekStart
  ).length;

  const complianceIssues = pendingMembers.filter(
    m => m.compliance.dbs !== 'completed' || m.compliance.firstAid !== 'completed'
  ).length;

  // ── Handlers ───────────────────────────────────────────────

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-40 text-neutral-400" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />
      : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />;
  };

  const openModal = (m: Member, action: ApprovalAction) =>
    setModal({ isOpen: true, member: m, action, isLoading: false, rejectionReason: '' });

  const confirmAction = async () => {
    if (!modal.member) return;
    setModal(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 600));

    const newStatus: MemberStatus = modal.action === 'approve' ? 'active' : 'rejected';
    setMembers(prev => prev.map(m => m.id === modal.member!.id ? { ...m, status: newStatus } : m));

    const msg = modal.action === 'approve'
      ? 'Member approved successfully.'
      : `Member rejected. Reason: ${modal.rejectionReason.trim()}`;
    toast.success(msg);
    setModal({ isOpen: false, member: null, action: 'approve', isLoading: false, rejectionReason: '' });

    // If viewing detail of this member, go back to list
    if (selectedMember?.id === modal.member.id) {
      setPageState('list');
      setSelectedMember(null);
    }
  };

  const handleExportCSV = () => {
    if (!sortedMembers.length) { toast.error('No data to export.'); return; }
    const headers = ['Member ID', 'Name', 'Age Groups (years old)', 'Email', 'Country', 'Region', 'Town', 'Activity Centre', 'DBS Status', 'First Aid Status', 'Registration Date', 'Waiting (days)'];
    const csv = [
      headers.join(','),
      ...sortedMembers.map(m => [
        m.id, `"${m.name}"`, `"${getAgeGroupLabel(m.dateOfBirth)}"`, m.email,
        `"${m.country}"`, `"${m.region}"`, m.town, `"${m.activityCentre}"`,
        m.compliance.dbs, m.compliance.firstAid,
        new Date(m.registrationDate).toLocaleDateString('en-GB'),
        waitingDays(m.registrationDate),
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pending-approvals_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully.');
  };

  // ── Row action menus ────────────────────────────────────────

  const getRowMenuItems = (m: Member) => [
    { icon: Eye, label: 'View', onClick: () => { setSelectedMember(m); setPageState('detail'); } },
    ...(mp.canApprove ? [
      { icon: CheckCircle, label: 'Approve', onClick: () => openModal(m, 'approve') },
      { icon: Ban,         label: 'Reject',  onClick: () => openModal(m, 'reject')  },
    ] : []),
  ];

  // ── Detail sub-page ─────────────────────────────────────────

  if (pageState === 'detail' && selectedMember) {
    // Find the latest version of this member from state
    const liveMember = members.find(m => m.id === selectedMember.id) ?? selectedMember;

    // If this member is no longer pending (approved/rejected), go back
    if (liveMember.status !== 'pending') {
      setPageState('list');
      setSelectedMember(null);
    }

    return (
      <>
        <MemberDetail
          member={liveMember}
          onBack={() => { setPageState('list'); setSelectedMember(null); }}
          onEdit={() => {}}
          onStatusChange={() => {}}
          onDelete={() => {}}
          mode="approval"
          onApprove={mp.canApprove ? () => openModal(liveMember, 'approve') : undefined}
          onReject={mp.canApprove  ? () => openModal(liveMember, 'reject')  : undefined}
        />
        <ApproveConfirmModal
          isOpen={modal.isOpen && modal.action === 'approve'}
          member={modal.member}
          isLoading={modal.isLoading}
          onClose={() => setModal({ ...modal, isOpen: false, rejectionReason: '' })}
          onConfirm={confirmAction}
        />
        <RejectReasonModal
          isOpen={modal.isOpen && modal.action === 'reject'}
          member={modal.member}
          isLoading={modal.isLoading}
          reason={modal.rejectionReason}
          onReasonChange={v => setModal(prev => ({ ...prev, rejectionReason: v }))}
          onClose={() => setModal({ ...modal, isOpen: false, rejectionReason: '' })}
          onConfirm={confirmAction}
        />
      </>
    );
  }

  // ── Empty state ─────────────────────────────────────────────

  const EmptyState = ({ filtered }: { filtered?: boolean }) => (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          {filtered
            ? <Search className="w-6 h-6 text-neutral-400" />
            : <UserCheck className="w-6 h-6 text-[#4EAE33]" />
          }
        </div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
          {filtered ? 'No matching members found.' : 'No members pending approval.'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {filtered ? 'Try adjusting your search or filters.' : 'All pending applications have been reviewed.'}
        </p>
      </div>
    </div>
  );

  const hasFilters = searchQuery.length > 0 || filters.some(f => f.values.length > 0);

  // ── Listing ─────────────────────────────────────────────────

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <PageHeader
          title="Pending Approvals"
          subtitle="Review and action member registration requests awaiting approval."
          breadcrumbs={[
            { label: 'Members Management', href: '#' },
            { label: 'Pending Approvals', current: true },
          ]}
        >
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by name, email or ID…"
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={{
                'Age Groups (years old)': Object.values(AGE_GROUP_LABELS),
                'Gender':           ['Male', 'Female'],
                ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries }              : {}),
                ...(scope.showRegionFilter   ? { 'Region':          scopedFilterOptions.regionOptions }       : {}),
                ...(scope.showTownFilter     ? { 'Town':            scopedFilterOptions.townOptions }         : {}),
                ...(scope.showCentreFilter   ? { 'Activity Centre': scopedFilterOptions.centreOptions }       : {}),
                'DBS Status':       ['Pending', 'Completed'],
                'First Aid Status': ['Pending', 'Completed'],
              }}
              title="Filter Pending Approvals"
            />
          </div>

          <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
          <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />
          <IconButton
            icon={MoreVertical}
            title="More options"
            menuItems={[
              { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
            ]}
          />
          <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Pending Approval Summary"
            widgets={[
              { label: 'Total Pending',      value: pendingMembers.length,  icon: 'Clock' },
              { label: 'Registered Today',   value: pendingToday,           icon: 'CheckCircle' },
              { label: 'This Week',          value: pendingThisWeek,        icon: 'Users' },
              { label: 'Compliance Issues',  value: complianceIssues,       icon: 'AlertTriangle' },
            ]}
          />
        )}

        {/* ── LIST VIEW ────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedMembers.length > 0 ? paginatedMembers.map(m => {
              const days = waitingDays(m.registrationDate);
              return (
                <div
                  key={m.id}
                  onClick={() => { setSelectedMember(m); setPageState('detail'); }}
                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400 font-bold text-lg">
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-neutral-900 dark:text-white font-semibold truncate">{m.name}</span>
                          <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                          <WaitingBadge days={days} />
                          <span className="text-xs text-neutral-400 font-mono">{m.id}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />{m.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />{m.activityCentre}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                            DBS: <ComplianceBadge status={m.compliance.dbs} />
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                            FA: <ComplianceBadge status={m.compliance.firstAid} />
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Row actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {mp.canApprove && (
                        <button
                          onClick={() => openModal(m, 'approve')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#f1fced] text-[#3d8928] border border-[#b8efa0] hover:bg-[#e2fad1] transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      {mp.canApprove && (
                        <button
                          onClick={() => openModal(m, 'reject')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#fff0f0] text-[#9a0c17] border border-[#ffaaab] hover:bg-[#ffe0e0] transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                      <IconButton icon={MoreVertical} borderless title="More" menuItems={getRowMenuItems(m)} />
                    </div>
                  </div>
                </div>
              );
            }) : <EmptyState filtered={hasFilters} />}
          </div>
        )}

        {/* ── GRID VIEW ────────────────────────────────────────── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedMembers.length > 0 ? paginatedMembers.map(m => {
              const days = waitingDays(m.registrationDate);
              return (
                <div
                  key={m.id}
                  onClick={() => { setSelectedMember(m); setPageState('detail'); }}
                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 hover:shadow-md hover:border-primary-600 dark:hover:border-primary-400 transition-all cursor-pointer shadow-sm flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-bold text-xl shadow-inner">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenuItems(m)} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-0.5">{m.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono mb-3">{m.id}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{m.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{m.activityCentre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{new Date(m.registrationDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                      <WaitingBadge days={days} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center gap-1 text-neutral-500">
                        DBS: <ComplianceBadge status={m.compliance.dbs} />
                      </span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        FA: <ComplianceBadge status={m.compliance.firstAid} />
                      </span>
                    </div>
                  </div>

                  {/* Approve / Reject footer */}
                  <div
                    className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openModal(m, 'approve')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-[#f1fced] text-[#3d8928] border border-[#b8efa0] hover:bg-[#e2fad1] transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(m, 'reject')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-[#fff0f0] text-[#9a0c17] border border-[#ffaaab] hover:bg-[#ffe0e0] transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full"><EmptyState filtered={hasFilters} /></div>
            )}
          </div>
        )}

        {/* ── TABLE VIEW ───────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto slim-scroll max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {[
                      { key: 'id',               label: 'Member ID' },
                      { key: 'name',             label: 'Name' },
                      { key: 'memberType',       label: 'Age Groups (years old)' },
                      { key: 'mastersScope',     label: 'Masters Scope' },
                      { key: 'dbsStatus',        label: 'DBS Status' },
                      { key: 'firstAidStatus',   label: 'First Aid' },
                      { key: 'registrationDate', label: 'Waiting Since' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap"
                      >
                        {col.label}{renderSortArrow(col.key)}
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedMembers.length > 0 ? paginatedMembers.map(m => {
                    const days = waitingDays(m.registrationDate);
                    return (
                      <tr
                        key={m.id}
                        onClick={() => { setSelectedMember(m); setPageState('detail'); }}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                          {m.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 text-xs font-medium flex-shrink-0">
                              {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors block truncate">
                                {m.name}
                              </span>
                              <span className="text-xs text-neutral-400 block truncate">{m.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[200px]">
                            <span className="font-medium text-neutral-700 dark:text-neutral-300 block truncate">{m.activityCentre}</span>
                            <span className="text-neutral-400 block truncate">{m.town} · {m.region}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <ComplianceBadge status={m.compliance.dbs} />
                        </td>
                        <td className="px-4 py-3.5">
                          <ComplianceBadge status={m.compliance.firstAid} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                              {new Date(m.registrationDate).toLocaleDateString('en-GB')}
                            </span>
                            <WaitingBadge days={days} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openModal(m, 'approve')}
                              title="Approve"
                              className="p-1.5 rounded-lg text-[#3d8928] hover:bg-[#f1fced] transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal(m, 'reject')}
                              title="Reject"
                              className="p-1.5 rounded-lg text-[#9a0c17] hover:bg-[#fff0f0] transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <IconButton
                              icon={Eye}
                              borderless
                              onClick={() => { setSelectedMember(m); setPageState('detail'); }}
                              title="View"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserCheck className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                            {hasFilters ? 'No matching members found.' : 'No members pending approval.'}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {hasFilters ? 'Try adjusting your search or filters.' : 'All pending applications have been reviewed.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          {filteredMembers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredMembers.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          )}
        </div>
      </div>

      {/* MODALS */}
      <ApproveConfirmModal
        isOpen={modal.isOpen && modal.action === 'approve'}
        member={modal.member}
        isLoading={modal.isLoading}
        onClose={() => setModal({ ...modal, isOpen: false, rejectionReason: '' })}
        onConfirm={confirmAction}
      />
      <RejectReasonModal
        isOpen={modal.isOpen && modal.action === 'reject'}
        member={modal.member}
        isLoading={modal.isLoading}
        reason={modal.rejectionReason}
        onReasonChange={v => setModal(prev => ({ ...prev, rejectionReason: v }))}
        onClose={() => setModal({ ...modal, isOpen: false, rejectionReason: '' })}
        onConfirm={confirmAction}
      />
    </div>
  );
}
