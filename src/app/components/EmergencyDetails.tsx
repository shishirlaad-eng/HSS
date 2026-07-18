import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart3, FileSpreadsheet, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { mockMembers, Member, getAgeGroupLabel, AGE_GROUP_LABELS, MASTERS_CASCADE } from '../../mockAPI/membersData';
import { PageHeader, SearchBar, Pagination, AdvancedSearchPanel, SummaryWidgets, ViewModeSwitcher, IconButton, useStickyListingHeader } from './hb/listing';
import type { FilterCondition } from './hb/listing';

type SortCol = 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'contactName' | 'contactPhone' | 'contactEmail' | 'contactRelationship';

const TH_BASE = 'sticky top-0 z-10 px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900';
const TD = 'px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap';

function SortableTH({ col, label, sortCol, sortDir, onSort }: {
  col: SortCol; label: string; sortCol: SortCol; sortDir: 'asc' | 'desc'; onSort: (c: SortCol) => void;
}) {
  const active = sortCol === col;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`${TH_BASE} cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon className={`w-3 h-3 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}`} />
      </span>
    </th>
  );
}

function dash(v?: string | boolean | null) {
  if (v === undefined || v === null || v === '') return '-';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return v;
}

function RequiredBadge() {
  return <span className="text-error-500 ml-0.5">*</span>;
}

export default function EmergencyDetails({
  onNavigateToMember,
}: { onNavigateToMember?: (id: string) => void } = {}) {
  const { scope, selectedRole } = useRoleScope();
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortCol, setSortCol]           = useState<SortCol>('name');
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageSize, setPageSize]         = useState(20);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const members = useMemo<Member[]>(() => filterByScope(mockMembers, scope), [scope]);
  const scopedFilterOptions = useMemo(() => getScopedFilterOptions(scope), [scope]);

  const withMedical = useMemo(() => members.filter(m => m.medicalInfoDeclared).length, [members]);
  const withAllergies = useMemo(() => members.filter(m => m.allergies).length, [members]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let rows = !q ? members : members.filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.emergencyContactName?.toLowerCase().includes(q) ?? false) ||
      (m.emergencyContactPhone?.toLowerCase().includes(q) ?? false) ||
      (m.emergencyContactEmail?.toLowerCase().includes(q) ?? false)
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
        default:                       return true;
      }
    }));
    rows = [...rows].sort((a, b) => {
      const get = (m: Member): string => {
        switch (sortCol) {
          case 'id':                  return m.id;
          case 'firstName':           return m.firstName ?? m.name.split(' ')[0];
          case 'lastName':            return m.surname ?? m.name.split(' ').slice(1).join(' ');
          case 'dateOfBirth':         return m.dateOfBirth;
          case 'contactName':         return m.emergencyContactName ?? '';
          case 'contactPhone':        return m.emergencyContactPhone ?? '';
          case 'contactEmail':        return m.emergencyContactEmail ?? '';
          case 'contactRelationship': return m.emergencyContactRelationship ?? '';
          default:                    return '';
        }
      };
      return sortDir === 'asc' ? get(a).localeCompare(get(b)) : get(b).localeCompare(get(a));
    });
    return rows;
  }, [members, searchQuery, filters, sortCol, sortDir]);

  const paged = useMemo(() =>
    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  const handleExportCsv = () => {
    if (!filtered.length) { toast.error('No data to export.'); return; }
    const csv = [
      'Member ID,First Name,Last Name,Contact Name,Contact Phone,Contact Email,Relationship,Medical Details,EpiPen,Allergies',
      ...filtered.map(m => `"${m.id}","${m.firstName ?? m.name.split(' ')[0]}","${m.surname ?? m.name.split(' ').slice(1).join(' ')}","${m.emergencyContactName ?? ''}","${m.emergencyContactPhone ?? ''}","${m.emergencyContactEmail ?? ''}","${m.emergencyContactRelationship ?? ''}","${m.medicalInfoDeclared ? (m.medicalInfoDetails || 'Declared') : ''}","${m.epiPen ?? ''}","${m.allergies ?? ''}"`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `emergency_details_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${filtered.length} records.`);
  };

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Emergency Details"
          subtitle={selectedRole === 'Super Admin' ? 'Below is a list of emergency contact and medical details for all members' : undefined}
          breadcrumbs={[
            { label: 'Members Management', href: '#' },
            { label: 'Emergency Details', current: true },
          ]}
        >
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setCurrentPage(1); }}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by name, member ID or contact..."
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
              }}
              title="Filter Emergency Details"
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
          <div className="mb-6">
            <SummaryWidgets
              title="Emergency Details Summary"
              widgets={[
                { label: 'Total Members',         value: members.length,    icon: 'Users'         },
                { label: 'Medical Condition Declared', value: withMedical,  icon: 'AlertTriangle' },
                { label: 'With Allergies',         value: withAllergies,    icon: 'AlertTriangle' },
              ]}
            />
          </div>
        )}

        {/* Grid */}
        {viewMode === 'grid' && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {paged.length > 0 ? paged.map(m => (
              <div
                key={m.id}
                onClick={() => onNavigateToMember?.(m.id)}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer flex flex-col justify-between min-h-[130px]"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{m.name}</p>
                  <span className="text-[11px] font-mono text-neutral-400">{m.id}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Contact: <span className="text-neutral-900 dark:text-white font-medium">{dash(m.emergencyContactName)}</span></p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{dash(m.emergencyContactPhone)}</p>
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
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            totalItems={filtered.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
        </>
        )}

        {/* List */}
        {viewMode === 'list' && (
          <>
          <div className="space-y-2 mb-6">
            {paged.length > 0 ? paged.map(m => (
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
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{dash(m.emergencyContactName)}</span>
                </div>
                <div className="flex-shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {dash(m.emergencyContactPhone)}
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
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            totalItems={filtered.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
          </>
        )}

        {viewMode === 'table' && (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <SortableTH col="id"                  label="Member ID"           sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="firstName"           label="First Name"          sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="lastName"            label="Last Name"           sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="dateOfBirth"         label="Date of Birth"       sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th className={TH_BASE}>Contact Name <RequiredBadge /></th>
                  <th className={TH_BASE}>Contact Phone <RequiredBadge /></th>
                  <th className={TH_BASE}>Contact Email <RequiredBadge /></th>
                  <th className={TH_BASE}>Relationship <RequiredBadge /></th>
                  <th className={TH_BASE}>Medical Details</th>
                  <th className={TH_BASE}>EpiPen/Jext/Emerade?</th>
                  <th className={TH_BASE}>Any Allergies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-16 text-center text-sm text-neutral-400">No members found.</td>
                  </tr>
                ) : paged.map(m => (
                  <tr
                    key={m.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                    onClick={() => onNavigateToMember?.(m.id)}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">{m.id}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">{m.firstName ?? m.name.split(' ')[0]}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">{m.surname ?? m.name.split(' ').slice(1).join(' ')}</td>
                    <td className={TD}>
                      {new Date(m.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={TD}>{dash(m.emergencyContactName)}</td>
                    <td className={TD}>
                      {m.emergencyContactPhone
                        ? <a href={`tel:${m.emergencyContactPhone}`} className="text-primary-600 dark:text-primary-400 hover:underline" onClick={e => e.stopPropagation()}>{m.emergencyContactPhone}</a>
                        : '-'}
                    </td>
                    <td className={TD}>
                      {m.emergencyContactEmail
                        ? <a href={`mailto:${m.emergencyContactEmail}`} className="text-primary-600 dark:text-primary-400 hover:underline" onClick={e => e.stopPropagation()}>{m.emergencyContactEmail}</a>
                        : '-'}
                    </td>
                    <td className={TD}>{dash(m.emergencyContactRelationship)}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">
                      {m.medicalInfoDeclared ? (m.medicalInfoDetails || 'Declared') : '-'}
                    </td>
                    <td className={TD}>{dash(m.epiPen)}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 max-w-[160px] truncate">
                      {dash(m.allergies)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            totalItems={filtered.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={size => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
        )}
      </div>
    </div>
  );
}
