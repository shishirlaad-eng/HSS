import { useState, useMemo, useEffect } from 'react';
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
  Users,
  CalendarClock,
  UserCheck,
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
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import MemberDetail from './MemberDetail';
import { toast } from 'sonner';
import { useModulePermissions, useRoleScope } from '../contexts/RoleScopeContext';
import { getScopedFilterOptions } from '../../mockAPI/roleScope';

type ViewMode   = 'grid' | 'list' | 'table';
type PageState  = 'list' | 'detail';
type ApprovalAction = 'approve' | 'reject';

// ── Compliance badge ──────────────────────────────────────────

const COMPLIANCE_CFG = {
  completed: { dot: 'bg-success-500', text: 'text-success-700 dark:text-success-400', label: 'Completed' },
  pending:   { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     label: 'Pending'   },
};

function ComplianceBadge({ status }: { status: 'pending' | 'completed' }) {
  const cfg = COMPLIANCE_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
    </span>
  );
}

// ── Waiting days helpers ──────────────────────────────────────

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

// ── Approve (guardian) confirmation modal ─────────────────────

function ApproveGuardianModal({
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
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">
              Approve on Behalf of Guardian
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              You are approving parental consent on behalf of the guardian. The member will move to Pending Approval and must be approved in the Pending Approvals screen to become active.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Member: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.name}</span>
              <span className="ml-2 font-mono text-neutral-400">{member.id}</span>
            </p>
            {member.guardianName && (
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                Guardian: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.guardianName}</span>
              </p>
            )}
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
            {isLoading ? 'Processing…' : 'Approve (Guardian)'}
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
  const isValid   = reason.trim().length > 0;
  const showError = touched && !isValid;

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

export default function PendingGuardianApprovals() {
  const mp = useModulePermissions('members');
  const { scope, selectedRole } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [members, setMembers] = useState<Member[]>(mockMembers);

  const [viewMode, setViewMode]   = useState<ViewMode>('grid');
  const [pageState, setPageState] = useState<PageState>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [searchQuery, setSearchQuery]               = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters]                       = useState<FilterCondition[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [showSummary, setShowSummary] = useState(true);

  const [sortField, setSortField]         = useState<string>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [modal, setModal] = useState<{
    isOpen: boolean;
    member: Member | null;
    action: ApprovalAction;
    isLoading: boolean;
    rejectionReason: string;
  }>({ isOpen: false, member: null, action: 'approve', isLoading: false, rejectionReason: '' });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  // ── Derived list — teen members pending guardian consent ────

  const pendingMembers = useMemo(
    () => members.filter(m => m.status === 'pending-parental-consent' && m.memberType === 'teen'),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pendingMembers.filter(m => {
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.guardianName?.toLowerCase().includes(q) ?? false) ||
        (m.guardianEmail?.toLowerCase().includes(q) ?? false);

      const matchesFilters = filters.every(f => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Gender':           return f.values.some(v => v.toLowerCase() === m.gender);
          case 'Country':          return f.values.includes(m.country);
          case 'Vibhaag':          return f.values.includes(m.region);
          case 'Nagar':            return f.values.includes(m.town);
          case 'Shakha':           return f.values.includes(m.activityCentre);
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
      ? <ArrowUp   className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />
      : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />;
  };

  const openModal = (m: Member, action: ApprovalAction) =>
    setModal({ isOpen: true, member: m, action, isLoading: false, rejectionReason: '' });

  const closeModal = () =>
    setModal(prev => ({ ...prev, isOpen: false, rejectionReason: '' }));

  const confirmAction = async () => {
    if (!modal.member) return;
    setModal(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 600));

    if (modal.action === 'approve') {
      // Grant parental consent → move to Pending Approval (two-step: Sub-module C → Sub-module B → Active)
      setMembers(prev => prev.map(m =>
        m.id === modal.member!.id
          ? { ...m, status: 'pending' as MemberStatus, compliance: { ...m.compliance, parentalConsent: 'granted' } }
          : m
      ));
      toast.success('Guardian consent approved. Member moved to Pending Approval.');
    } else {
      setMembers(prev => prev.map(m =>
        m.id === modal.member!.id ? { ...m, status: 'rejected' as MemberStatus } : m
      ));
      toast.success(`Member rejected. Reason: ${modal.rejectionReason.trim()}`);
    }

    setModal({ isOpen: false, member: null, action: 'approve', isLoading: false, rejectionReason: '' });

    if (selectedMember?.id === modal.member.id) {
      setPageState('list');
      setSelectedMember(null);
    }
  };

  const handleExportCSV = () => {
    if (!sortedMembers.length) { toast.error('No data to export.'); return; }
    const headers = ['Member ID', 'Name', 'Email', 'Guardian Name', 'Guardian Email', 'Country', 'Vibhaag', 'Nagar', 'Shakha', 'DBS Status', 'First Aid Status', 'Registration Date', 'Waiting (days)'];
    const csv = [
      headers.join(','),
      ...sortedMembers.map(m => [
        m.id, `"${m.name}"`, m.email,
        `"${m.guardianName ?? ''}"`, m.guardianEmail ?? '',
        `"${m.country}"`, `"${m.region}"`, m.town, `"${m.activityCentre}"`,
        m.compliance.dbs, m.compliance.firstAid,
        new Date(m.registrationDate).toLocaleDateString('en-GB'),
        waitingDays(m.registrationDate),
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `pending-guardian-approvals_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully.');
  };

  // ── Row action menus ────────────────────────────────────────

  const isSuperAdmin = selectedRole === 'Super Admin';

  const getRowMenuItems = (m: Member) => [
    { icon: Eye, label: 'View', onClick: () => { setSelectedMember(m); setPageState('detail'); } },
    ...(isSuperAdmin ? [
      { icon: UserCheck, label: 'Approve', onClick: () => { setSelectedMember(m); openModal(m, 'approve'); } },
      { icon: Ban,       label: 'Reject',  onClick: () => { setSelectedMember(m); openModal(m, 'reject');  } },
    ] : []),
  ];

  // ── Detail sub-page ─────────────────────────────────────────

  if (pageState === 'detail' && selectedMember) {
    const liveMember = members.find(m => m.id === selectedMember.id) ?? selectedMember;

    if (liveMember.status !== 'pending-parental-consent') {
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
          hideComplianceTab={selectedRole === 'Shakha Admin'}
          onApprove={isSuperAdmin ? () => openModal(liveMember, 'approve') : undefined}
          onReject={isSuperAdmin ? () => openModal(liveMember, 'reject') : undefined}
        />
        <ApproveGuardianModal
          isOpen={modal.isOpen && modal.action === 'approve'}
          member={modal.member}
          isLoading={modal.isLoading}
          onClose={closeModal}
          onConfirm={confirmAction}
        />
        <RejectReasonModal
          isOpen={modal.isOpen && modal.action === 'reject'}
          member={modal.member}
          isLoading={modal.isLoading}
          reason={modal.rejectionReason}
          onReasonChange={v => setModal(prev => ({ ...prev, rejectionReason: v }))}
          onClose={closeModal}
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
          {filtered ? 'No matching members found.' : 'No teen members pending guardian approval.'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {filtered ? 'Try adjusting your search or filters.' : 'All guardian consents have been processed.'}
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
          title="Pending Parent/Guardian Approvals"
          subtitle="Teen member registrations awaiting parental / guardian consent. Super admin can approve on behalf of the guardian."
          breadcrumbs={[
            { label: 'Members Management', href: '#' },
            { label: 'Pending Parent/Guardian Approvals', current: true },
          ]}
        >
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by name, email, ID or guardian…"
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={{
                'Gender':           ['Male', 'Female'],
                ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries }              : {}),
                ...(scope.showRegionFilter   ? { 'Vibhaag':         scopedFilterOptions.regionOptions }       : {}),
                ...(scope.showTownFilter     ? { 'Nagar':           scopedFilterOptions.townOptions }         : {}),
                ...(scope.showCentreFilter   ? { 'Shakha':          scopedFilterOptions.centreOptions }       : {}),
                'DBS Status':       ['Pending', 'Completed'],
                'First Aid Status': ['Pending', 'Completed'],
              }}
              title="Filter Guardian Approvals"
            />
          </div>
          <IconButton icon={BarChart3}    onClick={() => setShowSummary(!showSummary)} title="Summary" />
          <IconButton icon={RefreshCw}    onClick={() => {}}                           title="Refresh" />
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
            title="Guardian Approval Summary"
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
                          <WaitingBadge days={days} />
                          <span className="text-xs text-neutral-400 font-mono">{m.id}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />{m.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />{m.activityCentre}
                          </span>
                        </div>
                        {/* Guardian row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            Guardian: <span className="font-medium text-neutral-700 dark:text-neutral-300 ml-1">{m.guardianName ?? '—'}</span>
                          </span>
                          {m.guardianEmail && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-neutral-400" />{m.guardianEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Row actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
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

                    {/* Guardian block */}
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg px-3 py-2 mb-3">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Guardian</p>
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{m.guardianName ?? '—'}</p>
                      {m.guardianEmail && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{m.guardianEmail}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <WaitingBadge days={days} />
                    </div>
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
                      { key: 'id',               label: 'Member ID'    },
                      { key: 'name',             label: 'Name'         },
                      { key: 'guardianName',     label: 'Guardian'     },
                      { key: 'mastersScope',     label: 'HSS (UK) Setup Scope'},
                      { key: 'registrationDate', label: 'Waiting Since'},
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap"
                      >
                        {col.label}{renderSortArrow(col.key)}
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800">
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
                        {/* Member ID */}
                        <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                          {m.id}
                        </td>
                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors block truncate">
                                {m.name}
                              </span>
                              <span className="text-xs text-neutral-400 block truncate">{m.email}</span>
                            </div>
                          </div>
                        </td>
                        {/* Guardian */}
                        <td className="px-4 py-3.5">
                          <div className="text-xs max-w-[180px]">
                            <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
                              {m.guardianName ?? '—'}
                            </span>
                            {m.guardianEmail && (
                              <span className="text-neutral-400 block truncate">{m.guardianEmail}</span>
                            )}
                          </div>
                        </td>
                        {/* Masters Scope */}
                        <td className="px-4 py-3.5">
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[200px]">
                            <span className="font-medium text-neutral-700 dark:text-neutral-300 block truncate">{m.activityCentre}</span>
                            <span className="text-neutral-400 block truncate">{m.town} · {m.region}</span>
                          </div>
                        </td>
                        {/* Waiting Since */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                              {new Date(m.registrationDate).toLocaleDateString('en-GB')}
                            </span>
                            <WaitingBadge days={days} />
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
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
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserCheck className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                            {hasFilters ? 'No matching members found.' : 'No teen members pending guardian approval.'}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {hasFilters ? 'Try adjusting your search or filters.' : 'All guardian consents have been processed.'}
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
      <ApproveGuardianModal
        isOpen={modal.isOpen && modal.action === 'approve'}
        member={modal.member}
        isLoading={modal.isLoading}
        onClose={closeModal}
        onConfirm={confirmAction}
      />
      <RejectReasonModal
        isOpen={modal.isOpen && modal.action === 'reject'}
        member={modal.member}
        isLoading={modal.isLoading}
        reason={modal.rejectionReason}
        onReasonChange={v => setModal(prev => ({ ...prev, rejectionReason: v }))}
        onClose={closeModal}
        onConfirm={confirmAction}
      />
    </div>
  );
}
