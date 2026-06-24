import { useState, useMemo } from 'react';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import {
  mockMembers,
  Member,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
} from '../../mockAPI/membersData';
import { PageHeader } from './hb/listing';

type ComplianceTab = 'dbs' | 'firstAid' | 'safeguarding';

const AGE_GROUP_CHIP: Record<AgeGroup, string> = {
  bal:     'bg-[#fef0fc] text-[#c026d3] border border-[#f0abfc]',
  shishu:  'bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]',
  kishor:  'bg-[#e6f6fd] text-[#0080b8] border border-[#89d5f6]',
  tarun:   'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]',
  yuva:    'bg-[#f1fced] text-[#3d8928] border border-[#b8efa0]',
  jyestha: 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
};

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AGE_GROUP_CHIP[group]}`}>
      {AGE_GROUP_LABELS[group]}
    </span>
  );
}

function ComplianceBadge({ status }: { status?: 'pending' | 'completed' }) {
  if (!status) return <span className="text-sm text-neutral-400">—</span>;
  const cfg = status === 'completed'
    ? { dot: 'bg-[#4EAE33]', text: 'Completed', textCls: 'text-[#3d8928]' }
    : { dot: 'bg-[#F9B03D]', text: 'Pending',   textCls: 'text-[#d97706]' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-xs font-medium ${cfg.textCls}`}>{cfg.text}</span>
    </span>
  );
}

function fmtDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap bg-neutral-50 dark:bg-neutral-900';
const TD = 'px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap';

export default function ComplianceManagement() {
  const { scope } = useRoleScope();
  const [activeTab, setActiveTab] = useState<ComplianceTab>('dbs');

  const members = useMemo<Member[]>(() => filterByScope(mockMembers, scope), [scope]);

  const tabs: { id: ComplianceTab; label: string }[] = [
    { id: 'dbs',          label: 'DBS'          },
    { id: 'firstAid',     label: 'First Aid'    },
    { id: 'safeguarding', label: 'Safeguarding' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <PageHeader title="Compliance" />
      </div>

      {/* Tab bar */}
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700 dark:text-primary-300 dark:border-primary-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              {activeTab === 'dbs' && (
                <tr>
                  <th className={TH}>Member ID</th>
                  <th className={TH}>Name</th>
                  <th className={TH}>Age Category</th>
                  <th className={TH}>DBS Status</th>
                  <th className={TH}>DBS Cert</th>
                  <th className={TH}>Date</th>
                  <th className={TH}>DBS Update Service</th>
                </tr>
              )}
              {activeTab === 'firstAid' && (
                <tr>
                  <th className={TH}>Member ID</th>
                  <th className={TH}>Name</th>
                  <th className={TH}>Age Category</th>
                  <th className={TH}>First Aid Status</th>
                  <th className={TH}>Expiry Date</th>
                </tr>
              )}
              {activeTab === 'safeguarding' && (
                <tr>
                  <th className={TH}>Member ID</th>
                  <th className={TH}>Name</th>
                  <th className={TH}>Age Category</th>
                  <th className={TH}>Safeguarding Status</th>
                  <th className={TH}>Level of Training</th>
                  <th className={TH}>Date Completed</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  {activeTab === 'dbs' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><ComplianceBadge status={m.compliance.dbs} /></td>
                      <td className={TD}>{m.dbsCertificateNumber ?? '—'}</td>
                      <td className={TD}>{fmtDate(m.dbsCertificateDate)}</td>
                      <td className={TD}>
                        {m.dbsUpdateService === true ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4EAE33]" />
                            <span className="text-xs font-medium text-[#3d8928]">Yes</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs">No</span>
                        )}
                      </td>
                    </>
                  )}
                  {activeTab === 'firstAid' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><ComplianceBadge status={m.compliance.firstAid} /></td>
                      <td className={TD}>{fmtDate(m.firstAidQualificationExpiryDate)}</td>
                    </>
                  )}
                  {activeTab === 'safeguarding' && (
                    <>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      <td className="px-4 py-3.5"><ComplianceBadge status={m.compliance.safeguardingTraining} /></td>
                      <td className={TD}>{m.safeguardingTrainingLevel ?? '—'}</td>
                      <td className={TD}>{fmtDate(m.safeguardingTrainingDate)}</td>
                    </>
                  )}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-neutral-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
