import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Plus, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Pagination, PrimaryButton, SecondaryButton } from './hb/listing';
import { FormInput, FormSelect, ErrorText } from './hb/common';
import {
  Member, ResponsibilityAssignment, RESPONSIBILITY_LEVEL_OPTIONS,
  RESPONSIBILITY_TYPE_OPTIONS, ROLE_TYPE_OPTIONS,
} from '../../mockAPI/membersData';

type DraftAssignment = ResponsibilityAssignment & { _isNew?: boolean };

const emptyAssignment = (): DraftAssignment => ({
  responsibilityLevel: '' as ResponsibilityAssignment['responsibilityLevel'],
  sanghResponsibility: '',
  responsibilityType: '' as ResponsibilityAssignment['responsibilityType'],
  startDate: '', endDate: '', _isNew: true,
});

function assignmentsFor(member: Member): DraftAssignment[] {
  const current = member.responsibilities?.length
    ? member.responsibilities
    : member.responsibilityLevel && member.responsibilityType
      ? [{ responsibilityLevel: member.responsibilityLevel, sanghResponsibility: member.jobTitle,
          responsibilityType: member.responsibilityType, startDate: member.responsibilityStartDate }]
      : [];
  const previous = (member.previousResponsibilities ?? []).map(item => ({
    ...item, sanghResponsibility: member.jobTitle,
  }));
  const rows = [...current, ...previous];
  return rows;
}

export default function ResponsibilityManagement({ members, onBack, onSave }: {
  members: Member[]; onBack: () => void; onSave: (members: Member[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [vibhagFilter, setVibhagFilter] = useState('');
  const [nagarFilter, setNagarFilter] = useState('');
  const [shakhaFilter, setShakhaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [drafts, setDrafts] = useState<Record<string, DraftAssignment[]>>(() =>
    Object.fromEntries(members.map(member => [member.id, assignmentsFor(member)])),
  );

  const visibleMembers = useMemo(() => members.filter(member => {
    const q = query.trim().toLowerCase();
    if (q && !member.id.toLowerCase().includes(q) && !member.name.toLowerCase().includes(q)) return false;
    if (vibhagFilter && member.region !== vibhagFilter) return false;
    if (nagarFilter && member.town !== nagarFilter) return false;
    if (shakhaFilter && member.activityCentre !== shakhaFilter) return false;
    return true;
  }), [members, query, vibhagFilter, nagarFilter, shakhaFilter]);

  const vibhagOptions = useMemo(() => [...new Set(members.map(member => member.region).filter(Boolean))].sort(), [members]);
  const nagarOptions = useMemo(() => [...new Set(members
    .filter(member => !vibhagFilter || member.region === vibhagFilter)
    .map(member => member.town).filter(Boolean))].sort(), [members, vibhagFilter]);
  const shakhaOptions = useMemo(() => [...new Set(members
    .filter(member => (!vibhagFilter || member.region === vibhagFilter) && (!nagarFilter || member.town === nagarFilter))
    .map(member => member.activityCentre).filter(Boolean))].sort(), [members, vibhagFilter, nagarFilter]);
  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(visibleMembers.length / itemsPerPage));
  const paginatedMembers = itemsPerPage === 0
    ? visibleMembers
    : visibleMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setCurrentPage(1), [query, vibhagFilter, nagarFilter, shakhaFilter, itemsPerPage]);

  const [rowErrors, setRowErrors] = useState<Record<string, Record<string, boolean>>>({});
  const cellRefs = useRef<Record<string, HTMLElement | null>>({});
  const ROW_FIELD_ORDER = ['responsibilityLevel', 'sanghResponsibility', 'responsibilityType', 'startDate'] as const;

  const updateRow = (memberId: string, index: number, key: keyof DraftAssignment, value: string) => {
    setDrafts(current => ({ ...current, [memberId]: current[memberId].map((row, i) => i === index ? { ...row, [key]: value } : row) }));
    const rowKey = `${memberId}::${index}`;
    setRowErrors(current => current[rowKey] ? { ...current, [rowKey]: { ...current[rowKey], [key]: false } } : current);
  };
  const addRow = (memberId: string) => setDrafts(current => ({
    ...current, [memberId]: [emptyAssignment(), ...current[memberId]],
  }));

  const focusInvalidRow = (memberId: string, index: number, field: string) => {
    const memberPos = visibleMembers.findIndex(m => m.id === memberId);
    const targetPage = itemsPerPage === 0 ? 1 : Math.floor(memberPos / itemsPerPage) + 1;
    if (targetPage !== currentPage) setCurrentPage(targetPage);
    setTimeout(() => {
      const el = cellRefs.current[`${memberId}::${index}::${field}`];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 80);
  };

  const saveAll = () => {
    setRowErrors({});
    for (const member of members) {
      const allRows = drafts[member.id] ?? [];
      const rows = allRows.filter(row =>
        row.responsibilityLevel || row.sanghResponsibility || row.responsibilityType || row.startDate || row.endDate);
      for (const row of rows) {
        if (!row.responsibilityLevel || !row.sanghResponsibility || !row.responsibilityType || !row.startDate) {
          const index = allRows.indexOf(row);
          const rowKey = `${member.id}::${index}`;
          setRowErrors(current => ({
            ...current,
            [rowKey]: {
              responsibilityLevel: !row.responsibilityLevel,
              sanghResponsibility: !row.sanghResponsibility,
              responsibilityType: !row.responsibilityType,
              startDate: !row.startDate,
            },
          }));
          toast.error(`${member.name}: partially completed responsibility rows cannot be saved.`);
          const firstField = ROW_FIELD_ORDER.find(f => !row[f as keyof DraftAssignment]) ?? 'responsibilityLevel';
          focusInvalidRow(member.id, index, firstField);
          return;
        }
        if (row.endDate && row.endDate < row.startDate) {
          const index = allRows.indexOf(row);
          toast.error(`${member.name}: End Date cannot be before Start Date.`);
          focusInvalidRow(member.id, index, 'endDate');
          return;
        }
      }
      const activeKeys = rows.filter(row => !row.endDate).map(row =>
        `${row.responsibilityLevel}|${row.sanghResponsibility}|${row.responsibilityType}`);
      if (new Set(activeKeys).size !== activeKeys.length) {
        toast.error(`${member.name}: duplicate active responsibility found.`); return;
      }
    }

    const updated = members.map(member => {
      const rows = (drafts[member.id] ?? []).filter(row => row.sanghResponsibility);
      const active = rows.filter(row => !row.endDate);
      const ended = rows.filter(row => row.endDate);
      const primary = active[0];
      return {
        ...member,
        responsibilities: active.map(({ endDate: _endDate, _isNew: _isNew, ...row }) => row),
        previousResponsibilities: ended.map(row => ({ responsibilityLevel: row.responsibilityLevel,
          responsibilityType: row.responsibilityType, startDate: row.startDate ?? '', endDate: row.endDate ?? '' })),
        jobTitle: primary?.sanghResponsibility || member.jobTitle,
        additionalJobTitles: active.slice(1).map(row => row.sanghResponsibility),
        responsibilityLevel: primary?.responsibilityLevel,
        responsibilityType: primary?.responsibilityType,
        responsibilityStartDate: primary?.startDate,
      };
    });
    onSave(updated);
    toast.success('Roles and responsibilities updated successfully.');
  };

  const th = 'px-3 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 whitespace-nowrap';
  const td = 'px-3 py-2 align-top border-t border-neutral-100 dark:border-neutral-800';

  return <div className="p-6 bg-transparent dark:bg-neutral-950">
    <PageHeader title="Manage Responsibilities and Role" subtitle="Assign, add and conclude member responsibilities from one screen"
      breadcrumbs={[{ label: 'Members' }, { label: 'Responsibilities and Role' }, { label: 'Manage', current: true }]}>
      <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back</SecondaryButton>
      <PrimaryButton icon={Save} onClick={saveAll}>Save Changes</PrimaryButton>
    </PageHeader>
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative min-w-[280px] flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <FormInput value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by Member ID or name" className="pl-9" />
      </div>
      <FormSelect value={vibhagFilter} onChange={e => { setVibhagFilter(e.target.value); setNagarFilter(''); setShakhaFilter(''); }} className="w-52">
        <option value="">All Vibhags</option>{vibhagOptions.map(value => <option key={value}>{value}</option>)}
      </FormSelect>
      <FormSelect value={nagarFilter} onChange={e => { setNagarFilter(e.target.value); setShakhaFilter(''); }} className="w-52">
        <option value="">All Nagars</option>{nagarOptions.map(value => <option key={value}>{value}</option>)}
      </FormSelect>
      <FormSelect value={shakhaFilter} onChange={e => setShakhaFilter(e.target.value)} className="w-52">
        <option value="">All Shakhas</option>{shakhaOptions.map(value => <option key={value}>{value}</option>)}
      </FormSelect>
    </div>
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-auto">
      <table className="w-full min-w-[1320px] border-collapse"><thead><tr>
        <th className={th}>Member ID</th><th className={th}>First Name</th><th className={th}>Last Name</th><th className={th}>Responsibility Level</th>
        <th className={th}>Responsibility</th><th className={th}>Responsibility Type</th><th className={th}>Start Date</th>
        <th className={th}>End Date</th><th className={th}>Actions</th>
      </tr></thead><tbody>
        {paginatedMembers.map(member => {
          const rows = drafts[member.id];
          return <Fragment key={member.id}>
            <tr className="bg-primary-50/30 dark:bg-primary-950/10">
              <td rowSpan={rows.length + 1} className={`${td} text-sm font-mono text-neutral-600 bg-white dark:bg-neutral-950`}>{member.id}</td>
              <td rowSpan={rows.length + 1} className={`${td} text-sm font-medium text-neutral-900 dark:text-white bg-white dark:bg-neutral-950`}>{member.firstName ?? member.name.split(' ')[0]}</td>
              <td rowSpan={rows.length + 1} className={`${td} text-sm font-medium text-neutral-900 dark:text-white bg-white dark:bg-neutral-950`}>{member.surname ?? member.name.split(' ').slice(1).join(' ')}</td>
              <td colSpan={6} className={`${td} py-2`}>
                <button type="button" onClick={() => addRow(member.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-950/40">
                  <Plus className="w-3.5 h-3.5" /> {rows.length ? 'Add another responsibility' : 'Add responsibility'}
                </button>
              </td>
            </tr>
            {rows.map((row, index) => {
              const rowKey = `${member.id}::${index}`;
              const err = rowErrors[rowKey] ?? {};
              const errCls = (field: string) => err[field] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';
              return <tr key={`${member.id}-${index}`} className={row.endDate ? 'bg-neutral-50/70 dark:bg-neutral-900/30' : ''}>
              <td className={td}>
                <FormSelect ref={el => { cellRefs.current[`${rowKey}::responsibilityLevel`] = el; }} value={row.responsibilityLevel} onChange={e => updateRow(member.id, index, 'responsibilityLevel', e.target.value)} className={errCls('responsibilityLevel')}><option value="">Select level</option>{RESPONSIBILITY_LEVEL_OPTIONS.map(v => <option key={v}>{v}</option>)}</FormSelect>
                <ErrorText>{err.responsibilityLevel && 'Required.'}</ErrorText>
              </td>
              <td className={td}>
                <FormSelect ref={el => { cellRefs.current[`${rowKey}::sanghResponsibility`] = el; }} value={row.sanghResponsibility} onChange={e => updateRow(member.id, index, 'sanghResponsibility', e.target.value)} className={errCls('sanghResponsibility')}><option value="">Select responsibility</option>{ROLE_TYPE_OPTIONS.map(v => <option key={v}>{v}</option>)}</FormSelect>
                <ErrorText>{err.sanghResponsibility && 'Required.'}</ErrorText>
              </td>
              <td className={td}>
                <FormSelect ref={el => { cellRefs.current[`${rowKey}::responsibilityType`] = el; }} value={row.responsibilityType} onChange={e => updateRow(member.id, index, 'responsibilityType', e.target.value)} className={errCls('responsibilityType')}><option value="">Select type</option>{RESPONSIBILITY_TYPE_OPTIONS.map(v => <option key={v}>{v}</option>)}</FormSelect>
                <ErrorText>{err.responsibilityType && 'Required.'}</ErrorText>
              </td>
              <td className={td}>
                <FormInput ref={el => { cellRefs.current[`${rowKey}::startDate`] = el; }} type="date" value={row.startDate ?? ''} onChange={e => updateRow(member.id, index, 'startDate', e.target.value)} className={errCls('startDate')} />
                <ErrorText>{err.startDate && 'Required.'}</ErrorText>
              </td>
              <td className={td}><FormInput ref={el => { cellRefs.current[`${rowKey}::endDate`] = el; }} type="date" min={row.startDate} value={row.endDate ?? ''} onChange={e => updateRow(member.id, index, 'endDate', e.target.value)} /></td>
              <td className={td}>{row._isNew
                ? <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">New</span>
                : <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${row.endDate ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300' : 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-300'}`}>{row.endDate ? 'Ended' : 'Active'}</span>}
              </td>
            </tr>;
            })}
          </Fragment>;
        })}
      </tbody></table>
    </div>
    <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={visibleMembers.length}
      itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
  </div>;
}
