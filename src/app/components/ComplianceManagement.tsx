import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart3, FileSpreadsheet, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import {
  mockMembers,
  Member,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  getAgeGroupLabel,
  DBSStatus,
  CertStatus,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import { PageHeader, SearchBar, Pagination, AdvancedSearchPanel, SummaryWidgets, ViewModeSwitcher, IconButton } from './hb/listing';
import type { FilterCondition } from './hb/listing';

type ComplianceTab = 'dbs' | 'firstAid' | 'safeguarding';

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return <span className="text-sm font-medium text-neutral-900 dark:text-white">{AGE_GROUP_LABELS[group]}</span>;
}

function DBSBadge({ status }: { status: DBSStatus }) {
  const cfg =
    status === 'Approved' ? { text: 'Approved', chipCls: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800' } :
    status === 'Pending'  ? { text: 'Pending',  chipCls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' } :
                             { text: 'N/A',      chipCls: 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.chipCls}`}>
      {cfg.text}
    </span>
  );
}

function CertBadge({ status }: { status?: CertStatus }) {
  if (!status) return <span className="text-sm text-neutral-400">—</span>;
  const cfg =
    status === 'Certified' ? { text: 'Certified', chipCls: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800' } :
    status === 'Expired'   ? { text: 'Expired',   chipCls: 'bg-error-50 text-error-700 border-error-200 dark:bg-error-950 dark:text-error-400 dark:border-error-800'          } :
                             { text: 'N/A',       chipCls: 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.chipCls}`}>
      {cfg.text}
    </span>
  );
}

function fmtDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900';
const TD = 'px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap';

type SortCol =
  | 'id' | 'name' | 'ageCategory'
  | 'dbsStatus' | 'dbsCertDate' | 'dbsUpdateService'
  | 'firstAidStatus' | 'firstAidExpiry'
  | 'safeguardingStatus' | 'safeguardingLevel' | 'safeguardingDate';

function SortableTH({ col, label, sortCol, sortDir, onSort }: { col: SortCol; label: string; sortCol: SortCol; sortDir: 'asc' | 'desc'; onSort: (col: SortCol) => void }) {
  const active = sortCol === col;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`${TH} cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon className={`w-3 h-3 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}`} />
      </span>
    </th>
  );
}

export default function ComplianceManagement({ onNavigateToMember }: { onNavigateToMember?: (memberId: string) => void } = {}) {
  const { scope, selectedRole } = useRoleScope();
  const [activeTab, setActiveTab] = useState<ComplianceTab>('dbs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const members = useMemo<Member[]>(() => filterByScope(mockMembers, scope), [scope]);
  const scopedFilterOptions = useMemo(() => getScopedFilterOptions(scope), [scope]);

  const alertCounts = useMemo(() => ({
    dbs:          members.filter(m => m.compliance.dbs === 'Pending').length,
    firstAid:     members.filter(m => m.compliance.firstAid === 'Expired').length,
    safeguarding: members.filter(m => (m.compliance.safeguardingTraining ?? 'Expired') === 'Expired').length,
  }), [members]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let rows = !q ? members : members.filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q)
    );
    rows = rows.filter(m => filters.every(f => {
      if (!f.values.length) return true;
      switch (f.field) {
        case 'Age Groups (years old)': return f.values.some(v => v === getAgeGroupLabel(m.dateOfBirth));
        case 'Gender':                 return f.values.some(v => v.toLowerCase() === m.gender);
        case 'Country':                return f.values.includes(m.country);
        case 'Vibhag':                return f.values.includes(m.region);
        case 'Nagar':                  return f.values.includes(m.town);
        case 'Shakha':                 return f.values.includes(m.activityCentre);
        case 'DBS Status':             return f.values.some(v => v.toLowerCase() === m.compliance.dbs.toLowerCase());
        case 'First Aid Status':       return f.values.some(v => v.toLowerCase() === m.compliance.firstAid.toLowerCase());
        case 'Safeguarding Status':    return f.values.some(v => v.toLowerCase() === (m.compliance.safeguardingTraining ?? 'N/A').toLowerCase());
        default:                       return true;
      }
    }));
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortCol) {
        case 'id':                  return a.id.localeCompare(b.id) * dir;
        case 'name':                return a.name.localeCompare(b.name) * dir;
        case 'ageCategory':         return AGE_GROUP_LABELS[getAgeGroup(a.dateOfBirth)].localeCompare(AGE_GROUP_LABELS[getAgeGroup(b.dateOfBirth)]) * dir;
        case 'dbsStatus':           return a.compliance.dbs.localeCompare(b.compliance.dbs) * dir;
        case 'dbsCertDate':         return (a.dbsCertificateDate ?? '').localeCompare(b.dbsCertificateDate ?? '') * dir;
        case 'dbsUpdateService':    return (Number(!!a.dbsUpdateService) - Number(!!b.dbsUpdateService)) * dir;
        case 'firstAidStatus':      return a.compliance.firstAid.localeCompare(b.compliance.firstAid) * dir;
        case 'firstAidExpiry':      return (a.firstAidQualificationExpiryDate ?? '').localeCompare(b.firstAidQualificationExpiryDate ?? '') * dir;
        case 'safeguardingStatus':  return (a.compliance.safeguardingTraining ?? '').localeCompare(b.compliance.safeguardingTraining ?? '') * dir;
        case 'safeguardingLevel':   return (a.safeguardingTrainingLevel ?? '').localeCompare(b.safeguardingTrainingLevel ?? '') * dir;
        case 'safeguardingDate':    return (a.safeguardingTrainingDate ?? '').localeCompare(b.safeguardingTrainingDate ?? '') * dir;
        default:                    return 0;
      }
    });
    return rows;
  }, [members, searchQuery, filters, sortCol, sortDir]);

  const handleExportCsv = () => {
    if (!filteredMembers.length) { toast.error('No data to export.'); return; }
    const csv = [
      'Member ID,Name,Age Category,DBS Status,First Aid Status,Safeguarding Status',
      ...filteredMembers.map(m => `"${m.id}","${m.name}","${AGE_GROUP_LABELS[getAgeGroup(m.dateOfBirth)]}","${m.compliance.dbs}","${m.compliance.firstAid}","${m.compliance.safeguardingTraining ?? 'N/A'}"`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `compliance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${filteredMembers.length} records.`);
  };

  const pagedMembers = useMemo(() =>
    filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredMembers, currentPage, pageSize]
  );

  const tabs: { id: ComplianceTab; label: string }[] = [
    { id: 'dbs',          label: 'DBS'          },
    { id: 'firstAid',     label: 'First Aid'    },
    { id: 'safeguarding', label: 'Safeguarding' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <PageHeader
          title="Compliance"
          subtitle={selectedRole === 'Super Admin' ? 'Below is a list of all members that have undertaken compliance requirements to run Shakha activities' : undefined}
        >
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setCurrentPage(1); }}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by name or member ID..."
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={v => { setFilters(v); setCurrentPage(1); }}
              filterOptions={{
                'Age Groups (years old)': Object.values(AGE_GROUP_LABELS),
                'Gender':                 ['Male', 'Female'],
                ...(scope.showCountryFilter ? { 'Country': MASTERS_CASCADE.countries }        : {}),
                ...(scope.showRegionFilter  ? { 'Vibhag': scopedFilterOptions.regionOptions } : {}),
                ...(scope.showTownFilter    ? { 'Nagar':   scopedFilterOptions.townOptions }   : {}),
                ...(scope.showCentreFilter  ? { 'Shakha':  scopedFilterOptions.centreOptions } : {}),
                'DBS Status':             ['Approved', 'Pending', 'N/A'],
                'First Aid Status':       ['Certified', 'Expired', 'N/A'],
                'Safeguarding Status':    ['Certified', 'Expired', 'N/A'],
              }}
              title="Filter Compliance"
            />
          </div>
          <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
          <IconButton
            icon={MoreVertical}
            title="More options"
            menuItems={[
              { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCsv },
            ]}
          />
          <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />
        </PageHeader>
      </div>

      {showSummary && (
        <div className="px-6 pt-4">
          <SummaryWidgets
            title="Compliance Summary"
            widgets={[
              { label: 'Total with DBS',          value: members.filter(m => m.compliance.dbs !== 'N/A').length,                     icon: 'Users' },
              { label: 'Total with First Aid',     value: members.filter(m => m.compliance.firstAid !== 'N/A').length,                icon: 'CheckCircle' },
              { label: 'Total with Safeguarding',  value: members.filter(m => (m.compliance.safeguardingTraining ?? 'N/A') !== 'N/A').length, icon: 'Briefcase' },
            ]}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const count = alertCounts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSortCol('name'); setSortDir('asc'); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700 dark:text-primary-300 dark:border-primary-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error-600 text-white text-[10px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {viewMode === 'grid' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedMembers.length > 0 ? pagedMembers.map(m => (
              <div
                key={m.id}
                onClick={() => onNavigateToMember?.(m.id)}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer flex flex-col justify-between min-h-[120px]"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{m.name}</p>
                  <span className="text-[11px] font-mono text-neutral-400">{m.id}</span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                  {activeTab === 'dbs' && <DBSBadge status={m.compliance.dbs} />}
                  {activeTab === 'firstAid' && <CertBadge status={m.compliance.firstAid} />}
                  {activeTab === 'safeguarding' && <CertBadge status={m.compliance.safeguardingTraining} />}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400">No members found.</p>
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredMembers.length / pageSize))}
            totalItems={filteredMembers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      )}

      {/* List */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-2">
            {pagedMembers.length > 0 ? pagedMembers.map(m => (
              <div
                key={m.id}
                onClick={() => onNavigateToMember?.(m.id)}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                  <div className="min-w-[180px]">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{m.name}</h4>
                    <span className="text-[11px] font-mono text-neutral-400">{m.id}</span>
                  </div>
                  <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                </div>
                <div className="flex-shrink-0">
                  {activeTab === 'dbs' && <DBSBadge status={m.compliance.dbs} />}
                  {activeTab === 'firstAid' && <CertBadge status={m.compliance.firstAid} />}
                  {activeTab === 'safeguarding' && <CertBadge status={m.compliance.safeguardingTraining} />}
                </div>
              </div>
            )) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400">No members found.</p>
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredMembers.length / pageSize))}
            totalItems={filteredMembers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      )}

      {/* Table */}
      {viewMode === 'table' && (
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              {activeTab === 'dbs' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="dbsStatus" label="DBS Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="dbsCertDate" label="DBS Cert Date" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="dbsUpdateService" label="DBS Update Service" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </tr>
              )}
              {activeTab === 'firstAid' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="firstAidStatus" label="First Aid Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="firstAidExpiry" label="Expiry Date" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </tr>
              )}
              {activeTab === 'safeguarding' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="safeguardingStatus" label="Safeguarding Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="safeguardingLevel" label="Level of Training" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="safeguardingDate" label="Date Completed" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pagedMembers.map(m => (
                <tr
                  key={m.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                  onClick={() => onNavigateToMember?.(m.id)}
                >
                  {activeTab === 'dbs' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><DBSBadge status={m.compliance.dbs} /></td>
                      <td className={TD}>
                        {m.dbsCertificateNumber
                          ? <><span className="font-medium">{m.dbsCertificateNumber}</span>{m.dbsCertificateDate && <span className="block text-neutral-400">{fmtDate(m.dbsCertificateDate)}</span>}</>
                          : fmtDate(m.dbsCertificateDate)}
                      </td>
                      <td className={TD}>
                        {m.dbsUpdateService === true ? (
                          <span className="text-xs font-medium text-success-700 dark:text-success-400">Yes</span>
                        ) : (
                          <span className="text-neutral-400 text-xs">No</span>
                        )}
                      </td>
                    </>
                  )}
                  {activeTab === 'firstAid' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><CertBadge status={m.compliance.firstAid} /></td>
                      <td className={TD}>{fmtDate(m.firstAidQualificationExpiryDate)}</td>
                    </>
                  )}
                  {activeTab === 'safeguarding' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><CertBadge status={m.compliance.safeguardingTraining} /></td>
                      <td className={TD}>{m.safeguardingTrainingLevel ?? '—'}</td>
                      <td className={TD}>{fmtDate(m.safeguardingTrainingDate)}</td>
                    </>
                  )}
                </tr>
              ))}
              {pagedMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-neutral-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredMembers.length / pageSize))}
            totalItems={filteredMembers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      </div>
      )}
    </div>
  );
}
