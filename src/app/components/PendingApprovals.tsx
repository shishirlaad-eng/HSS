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
  ArrowRight,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  SummaryWidgets,
  useStickyListingHeader,
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
import { formatDate, formatDateTime } from '../../utils/formatDate';
import {
  getTransferRequests,
  reviewTransferRequest,
  ShakhaTransferRequest,
  TRANSFER_CHANGE_EVENT,
} from '../../mockAPI/shakhaTransferData';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail';
type ApprovalAction = 'approve' | 'reject';

// ── Status / type helpers ─────────────────────────────────────

const COMPLIANCE_CFG: Record<string, { dot: string; text: string; label: string }> = {
  completed: { dot: 'bg-success-500', text: 'text-success-700 dark:text-success-400', label: 'Completed' },
  pending:   { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     label: 'Pending'   },
  Approved:  { dot: 'bg-success-500', text: 'text-success-700 dark:text-success-400', label: 'Approved'  },
  Certified: { dot: 'bg-success-500', text: 'text-success-700 dark:text-success-400', label: 'Certified' },
  Pending:   { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     label: 'Pending'   },
  Expired:   { dot: 'bg-error-500',   text: 'text-error-700 dark:text-error-400',     label: 'Expired'   },
  'N/A':     { dot: 'bg-neutral-400', text: 'text-neutral-500 dark:text-neutral-400', label: 'N/A'       },
};

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return <span className="text-sm font-normal text-neutral-900 dark:text-white">{AGE_GROUP_LABELS[group]}</span>;
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; text: string; bg: string; border: string }> = {
  active:                    { label: 'Active',                   text: 'text-success-700 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/20', border: 'border-success-200 dark:border-success-800' },
  pending:                   { label: 'Pending Approval',         text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/20',     border: 'border-amber-200 dark:border-amber-800'     },
  'pending-parental-consent':{ label: 'Pending Parental Consent', text: 'text-violet-700 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/20',   border: 'border-violet-200 dark:border-violet-800'   },
  inactive:                  { label: 'Inactive',                 text: 'text-neutral-600 dark:text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800',   border: 'border-neutral-200 dark:border-neutral-700' },
  rejected:                  { label: 'Rejected',                 text: 'text-error-700 dark:text-error-400',     bg: 'bg-error-50 dark:bg-error-950/20',     border: 'border-error-200 dark:border-error-800'     },
};

function StatusBadge({ status }: { status: MemberStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${cfg.bg} ${cfg.border} ${cfg.text} whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
}

function ComplianceBadge({ status }: { status: string }) {
  const cfg = COMPLIANCE_CFG[status] ?? { dot: 'bg-neutral-400', text: 'text-neutral-500 dark:text-neutral-400', label: status || 'N/A' };
  return (
    <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
  );
}

// ── Waiting days helper ───────────────────────────────────────

function waitingDays(registrationDate: string): number {
  return Math.floor((Date.now() - new Date(registrationDate).getTime()) / 86_400_000);
}

function WaitingBadge({ days }: { days: number }) {
  const cls =
    days >= 14 ? 'bg-error-50 text-error-700 border-error-200 dark:bg-error-950/20 dark:text-error-400 dark:border-error-800' :
    days >= 7  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800' :
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
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">Confirm Approval</h3>
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
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  // Reset touched state when modal opens/closes
  useEffect(() => {
    if (!isOpen) setTouched(false);
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const handleConfirm = () => {
    setTouched(true);
    if (isValid) { onConfirm(); return; }
    toast.error('Rejection reason is required.');
    reasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    reasonRef.current?.focus();
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
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">Reject Application</h3>
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
            ref={reasonRef}
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
  const { scope, selectedRole } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  // Source: all members; only pending-approval ones shown
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const [viewMode, setViewMode]     = useState<ViewMode>(() => selectedRole === 'Super Admin' ? 'table' : 'grid');
  const [pageState, setPageState]   = useState<PageState>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const [searchQuery, setSearchQuery]         = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters]                 = useState<FilterCondition[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [showSummary, setShowSummary] = useState(true);
  const [transferRequests, setTransferRequests] = useState<ShakhaTransferRequest[]>(getTransferRequests);

  const [sortField, setSortField]         = useState<string>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // oldest first

  const [modal, setModal] = useState<{
    isOpen: boolean; member: Member | null; action: ApprovalAction; isLoading: boolean; rejectionReason: string;
  }>({ isOpen: false, member: null, action: 'approve', isLoading: false, rejectionReason: '' });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);
  useEffect(() => {
    const refreshTransfers = () => setTransferRequests(getTransferRequests());
    window.addEventListener(TRANSFER_CHANGE_EVENT, refreshTransfers);
    return () => window.removeEventListener(TRANSFER_CHANGE_EVENT, refreshTransfers);
  }, []);

  // ── Derived pending list ────────────────────────────────────

  const pendingMembers = useMemo(
    () => members.filter(m => m.status === 'pending'),
    [members]
  );

  const pendingTransfers = useMemo(
    () => transferRequests.filter(request =>
      request.status === 'pending' &&
      (scope.level === 'all' || request.toCentre === scope.centre)
    ),
    [transferRequests, scope],
  );

  const canReviewTransfers = mp.canApprove || selectedRole === 'Shakha Operations' || selectedRole === 'Shakha Admin' || selectedRole === 'Super Admin';

  const handleTransferReview = (request: ShakhaTransferRequest, action: 'approved' | 'rejected') => {
    const reason = action === 'rejected' ? 'Transfer request rejected by receiving Shakha.' : '';
    reviewTransferRequest(request.id, action, selectedRole, reason);
    setTransferRequests(getTransferRequests());
    toast.success(action === 'approved'
      ? `${request.memberName} transferred to ${request.toCentre}.`
      : `${request.memberName}'s transfer request was rejected.`);
  };

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pendingMembers.filter(m => {
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);

      const evalFilter = (f: FilterCondition): boolean => {
        switch (f.field) {
          case 'Age Groups (years old)': return f.values.some(v => v === getAgeGroupLabel(m.dateOfBirth));
          case 'Gender':           return f.values.some(v => v.toLowerCase() === m.gender);
          case 'Country':          return f.values.includes(m.country);
          case 'Vibhag':          return f.values.includes(m.region);
          case 'Nagar':            return f.values.includes(m.town);
          case 'Shakha':           return f.values.includes(m.activityCentre);
          case 'DBS Status':       return f.values.some(v => v.toLowerCase() === m.compliance.dbs);
          case 'First Aid Status': return f.values.some(v => v.toLowerCase() === m.compliance.firstAid);
          default:                 return true;
        }
      };
      const activeFilters = filters.filter(f => f.values.length > 0);
      const matchesFilters = activeFilters.length === 0
        ? true
        : activeFilters.reduce<boolean>((acc, f, i) => {
            if (i === 0) return evalFilter(f);
            return f.logicOp === 'OR' ? (acc || evalFilter(f)) : (acc && evalFilter(f));
          }, true);

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

  const now       = Date.now();
  const weekStart = new Date(now - 7 * 86_400_000);

  const registeredThisWeek = pendingMembers.filter(
    m => new Date(m.registrationDate) >= weekStart
  ).length;

  const waitingOver7  = pendingMembers.filter(m => waitingDays(m.registrationDate) >= 7).length;
  const waitingOver14 = pendingMembers.filter(m => waitingDays(m.registrationDate) >= 14).length;

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
    const headers = ['Member ID', 'First Name', 'Last Name', 'Age Groups (years old)', 'Email', 'Country', 'Vibhag', 'Nagar', 'Shakha', 'DBS Status', 'First Aid Status', 'Registration Date', 'Waiting (days)'];
    const csv = [
      headers.join(','),
      ...sortedMembers.map(m => [
        m.id, `"${m.firstName ?? m.name.split(' ')[0]}"`, `"${m.surname ?? m.name.split(' ').slice(1).join(' ')}"`, `"${getAgeGroupLabel(m.dateOfBirth)}"`, m.email,
        `"${m.country}"`, `"${m.region}"`, m.town, `"${m.activityCentre}"`,
        m.compliance.dbs, m.compliance.firstAid,
        formatDate(m.registrationDate),
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
          hideComplianceTab={selectedRole === 'Shakha Admin'}
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
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Pending Karyawaha Approvals"
          subtitle={selectedRole === 'Super Admin' ? 'Below is a list of all user accounts that are pending Shakha Karyawaha approval' : 'Review and action member registration requests awaiting approval.'}
          breadcrumbs={[
            { label: 'Members Management', href: '#' },
            { label: 'Pending Karyawaha Approvals', current: true },
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
              showMatchModeToggle
              filterOptions={{
                'Age Groups (years old)': Object.values(AGE_GROUP_LABELS),
                'Gender':           ['Male', 'Female'],
                ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries }              : {}),
                ...(scope.showRegionFilter   ? { 'Vibhag':         scopedFilterOptions.regionOptions }       : {}),
                ...(scope.showTownFilter     ? { 'Nagar':           scopedFilterOptions.townOptions }         : {}),
                ...(scope.showCentreFilter   ? { 'Shakha':          scopedFilterOptions.centreOptions }       : {}),
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
        </div>

        {pendingTransfers.length > 0 && (
          <div className="mb-6 bg-white dark:bg-neutral-950 border border-primary-200 dark:border-primary-900 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-primary-100 dark:border-primary-900 bg-primary-50/60 dark:bg-primary-950/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Shakha Transfer Requests</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Requests awaiting approval from the receiving Shakha.
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {pendingTransfers.length} pending
                </span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendingTransfers.map(request => (
                <div key={request.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{request.memberName}</span>
                      <span className="text-xs font-mono text-neutral-400">{request.memberId}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900">
                        Pending transfer
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">{request.fromCentre}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary-500" />
                      <span className="font-medium text-primary-700 dark:text-primary-300">{request.toCentre}</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      Requested {formatDateTime(request.requestedAt)} · {request.memberRole}
                    </p>
                  </div>
                  {canReviewTransfers && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleTransferReview(request, 'approved')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#f1fced] text-[#3d8928] border border-[#b8efa0] hover:bg-[#e2fad1] transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve Transfer
                      </button>
                      <button
                        onClick={() => handleTransferReview(request, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#fff0f0] text-[#9a0c17] border border-[#ffaaab] hover:bg-[#ffe0e0] transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Pending Karyawaha Approval Summary"
            widgets={[
              { label: 'Total Pending',        value: pendingMembers.length, icon: 'Clock'         },
              { label: 'Registered This Week', value: registeredThisWeek,    icon: 'CheckCircle'   },
              { label: 'Waiting > 7 Days',     value: waitingOver7,          icon: 'Users'         },
              { label: 'Waiting > 14 Days',    value: waitingOver14,         icon: 'AlertTriangle' },
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
                        <span>{formatDate(m.registrationDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                      <WaitingBadge days={days} />
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
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible shadow-sm">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {[
                      { key: 'id',        label: 'Member ID' },
                      { key: 'firstName', label: 'First Name' },
                      { key: 'surname',   label: 'Last Name' },
                      { key: 'memberType',label: 'Age Category' },
                      { key: 'email',     label: 'Email Address' },
                      { key: 'phone',     label: 'Contact Number' },
                      { key: 'status',    label: 'Member Status' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap"
                      >
                        {col.label}{renderSortArrow(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedMembers.length > 0 ? paginatedMembers.map(m => {
                    return (
                      <tr
                        key={m.id}
                        onClick={() => { setSelectedMember(m); setPageState('detail'); }}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                          {m.id}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
                          {m.firstName ?? m.name.split(' ')[0]}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
                          {m.surname ?? m.name.split(' ').slice(1).join(' ')}
                        </td>
                        <td className="px-4 py-3.5">
                          <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {m.email}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {m.phone || <span className="text-neutral-400">-</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={m.status} />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
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
