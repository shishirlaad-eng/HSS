import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import {
  mockMembers,
  Member,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  DBSStatus,
  CertStatus,
} from '../../mockAPI/membersData';
import { PageHeader, SearchBar, Pagination } from './hb/listing';

type ComplianceTab = 'dbs' | 'firstAid' | 'safeguarding';

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return <span className="text-sm font-medium text-neutral-900 dark:text-white">{AGE_GROUP_LABELS[group]}</span>;
}

function DBSBadge({ status }: { status: DBSStatus }) {
  const cfg = status === 'Approved'
    ? { text: 'Approved', chipCls: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800' }
    : { text: 'Pending',  chipCls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' };
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

type SortCol = 'id' | 'name' | 'ageCategory';

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

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const members = useMemo<Member[]>(() => filterByScope(mockMembers, scope), [scope]);

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
    rows = [...rows].sort((a, b) => {
      let av: string, bv: string;
      if (sortCol === 'id') { av = a.id; bv = b.id; }
      else if (sortCol === 'name') { av = a.name; bv = b.name; }
      else { av = AGE_GROUP_LABELS[getAgeGroup(a.dateOfBirth)]; bv = AGE_GROUP_LABELS[getAgeGroup(b.dateOfBirth)]; }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [members, searchQuery, sortCol, sortDir]);

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
          <SearchBar
            value={searchQuery}
            onChange={v => { setSearchQuery(v); setCurrentPage(1); }}
            placeholder="Search by name or member ID..."
          />
        </PageHeader>
      </div>

      {/* Tab bar */}
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const count = alertCounts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
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

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              {activeTab === 'dbs' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th className={TH}>DBS Status</th>
                  <th className={TH}>DBS Cert Date</th>
                  <th className={TH}>DBS Update Service</th>
                </tr>
              )}
              {activeTab === 'firstAid' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th className={TH}>First Aid Status</th>
                  <th className={TH}>Expiry Date</th>
                </tr>
              )}
              {activeTab === 'safeguarding' && (
                <tr>
                  <SortableTH col="id" label="Member ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="name" label="Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortableTH col="ageCategory" label="Age Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th className={TH}>Safeguarding Status</th>
                  <th className={TH}>Level of Training</th>
                  <th className={TH}>Date Completed</th>
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
    </div>
  );
}
