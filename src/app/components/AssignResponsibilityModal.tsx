import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { SecondaryButton, PrimaryButton } from './hb/listing';
import { FormSelect, FormInput, ErrorText, StatusSlider } from './hb/common';
import {
  Member, ResponsibilityAssignment, MyHSSRoleAssignment,
  RESPONSIBILITY_LEVEL_OPTIONS, ResponsibilityLevel,
  RESPONSIBILITY_TYPE_OPTIONS, ROLE_TYPE_OPTIONS,
} from '../../mockAPI/membersData';
import { ADMIN_ROLE_OPTIONS, ROLE_DISPLAY_LABELS } from '../../mockAPI/rolesData';

// _wasActiveOnLoad freezes whether a row was active at the moment the member was
// selected: a row already inactive before this session opened can never be
// reactivated here, but a row the user deactivates during this same session can
// still be flipped back until they hit Save.
type DraftResp = ResponsibilityAssignment & { _isNew?: boolean; _wasActiveOnLoad?: boolean };
type DraftRole = MyHSSRoleAssignment & { _isNew?: boolean; _wasActiveOnLoad?: boolean };

const todayISO = () => new Date().toISOString().split('T')[0];

function respRowsFor(member: Member): DraftResp[] {
  return [
    ...(member.responsibilities ?? []).map(r => ({ ...r, _wasActiveOnLoad: !r.endDate })),
    ...(member.previousResponsibilities ?? []).map(p => ({ ...p, sanghResponsibility: member.jobTitle, _wasActiveOnLoad: false })),
  ];
}
function roleRowsFor(member: Member): DraftRole[] {
  return [
    ...(member.myhssRoles ?? []).map(r => ({ ...r, _wasActiveOnLoad: !r.endDate })),
    ...(member.previousMyhssRoles ?? []).map(r => ({ ...r, _wasActiveOnLoad: false })),
  ];
}

// A member is already a Member/Teen Member the moment they register — that base
// role isn't something an admin "adds", so it's never offered in the Add Role
// dropdown, and is always shown pre-assigned in the Current MyHSS Roles list.
const ASSIGNABLE_MYHSS_ROLE_OPTIONS = ADMIN_ROLE_OPTIONS.filter(r => r !== 'Adult Member' && r !== 'Teen Member');
function baseMyHSSRole(member: Member): string | null {
  if (member.memberType === 'adult') return 'Adult Member';
  if (member.memberType === 'teen') return 'Teen Member';
  return null;
}

export default function AssignResponsibilityModal({
  isOpen,
  members,
  selectedRole,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  // Pre-scoped by the caller (role-based visibility) — e.g. a Shakha Admin only
  // ever receives members from their own Shakha.
  members: Member[];
  selectedRole: string;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [respRows, setRespRows] = useState<DraftResp[]>([]);
  const [roleRows, setRoleRows] = useState<DraftRole[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Only Super Admin may assign responsibilities at any level — a Shakha Admin
  // may only assign at Shakha level, for members already scoped to their own Shakha.
  const isSuperAdmin = selectedRole === 'Super Admin';
  const assignableLevels: ResponsibilityLevel[] = isSuperAdmin
    ? RESPONSIBILITY_LEVEL_OPTIONS
    : ['Shakha / Activity center'];

  const activeMembers = useMemo(() => members.filter(m => m.status === 'active'), [members]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || selectedMemberId) return [];
    return activeMembers.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)).slice(0, 8);
  }, [query, activeMembers, selectedMemberId]);

  const selectedMember = activeMembers.find(m => m.id === selectedMemberId) ?? null;

  // Dropdown is portaled to <body> (fixed-positioned from the search box's own
  // bounding rect) so it always renders above the modal instead of being clipped
  // by the scrolling body/footer underneath it.
  const open = focused && suggestions.length > 0;
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    if (!open) { setRect(null); return; }
    const update = () => {
      const r = searchRef.current?.getBoundingClientRect();
      if (!r) return;
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const selectMember = (m: Member) => {
    setSelectedMemberId(m.id);
    setQuery(`${m.firstName ?? m.name.split(' ')[0]} ${m.surname ?? m.name.split(' ').slice(1).join(' ')}`);
    setFocused(false);
    setRespRows(respRowsFor(m));
    setRoleRows(roleRowsFor(m));
  };

  const clearMember = () => {
    setSelectedMemberId(null);
    setQuery('');
    setRespRows([]);
    setRoleRows([]);
  };

  // A row already inactive before this session opened can never be reactivated
  // here — only rows the user themselves deactivated just now can be undone.
  const toggleRespActive = (index: number) => setRespRows(rows => rows.map((r, i) =>
    i === index && r._wasActiveOnLoad ? { ...r, endDate: r.endDate ? undefined : todayISO() } : r));
  const toggleRoleActive = (index: number) => setRoleRows(rows => rows.map((r, i) =>
    i === index && r._wasActiveOnLoad ? { ...r, endDate: r.endDate ? undefined : todayISO() } : r));

  const updateResp = (index: number, key: keyof DraftResp, value: string) =>
    setRespRows(rows => rows.map((r, i) => i === index ? { ...r, [key]: value } : r));
  const updateRole = (index: number, key: keyof DraftRole, value: string) =>
    setRoleRows(rows => rows.map((r, i) => i === index ? { ...r, [key]: value } : r));

  const addRespRow = () => setRespRows(rows => [
    { responsibilityLevel: assignableLevels[0], sanghResponsibility: '', responsibilityType: '' as ResponsibilityAssignment['responsibilityType'], startDate: todayISO(), _isNew: true },
    ...rows,
  ]);
  const addRoleRow = () => setRoleRows(rows => [
    { role: ASSIGNABLE_MYHSS_ROLE_OPTIONS[0], startDate: todayISO(), _isNew: true },
    ...rows,
  ]);

  const handleClose = () => {
    clearMember();
    onClose();
  };

  const handleSave = () => {
    if (!selectedMember) return;

    for (const row of respRows) {
      const touched = row.responsibilityLevel || row.sanghResponsibility || row.responsibilityType || row.startDate;
      if (touched && (!row.responsibilityLevel || !row.sanghResponsibility || !row.responsibilityType || !row.startDate)) {
        toast.error('Complete all fields on every responsibility row before saving.');
        return;
      }
    }
    for (const row of roleRows) {
      const touched = row.role || row.startDate;
      if (touched && (!row.role || !row.startDate)) {
        toast.error('Complete all fields on every MyHSS Role row before saving.');
        return;
      }
    }

    const activeResp = respRows.filter(r => r.sanghResponsibility && !r.endDate);
    const endedResp = respRows.filter(r => r.sanghResponsibility && r.endDate);
    const activeRoles = roleRows.filter(r => r.role && !r.endDate);
    const endedRoles = roleRows.filter(r => r.role && r.endDate);
    const primary = activeResp[0];

    const updated: Member = {
      ...selectedMember,
      responsibilities: activeResp.map(({ _isNew, _wasActiveOnLoad, ...r }) => r),
      previousResponsibilities: endedResp.map(r => ({
        responsibilityLevel: r.responsibilityLevel, responsibilityType: r.responsibilityType,
        startDate: r.startDate ?? '', endDate: r.endDate ?? '',
      })),
      myhssRoles: activeRoles.map(({ _isNew, _wasActiveOnLoad, ...r }) => r),
      previousMyhssRoles: endedRoles.map(({ _isNew, _wasActiveOnLoad, ...r }) => r),
      jobTitle: primary?.sanghResponsibility || selectedMember.jobTitle,
      additionalJobTitles: activeResp.slice(1).map(r => r.sanghResponsibility),
      responsibilityLevel: primary?.responsibilityLevel,
      responsibilityType: primary?.responsibilityType,
      responsibilityStartDate: primary?.startDate,
    };
    onSave(updated);
    toast.success(`${selectedMember.name}'s responsibilities and roles updated successfully.`);
    handleClose();
  };

  if (!isOpen) return null;

  // Sticky to the TOP OF ITS OWN scroll box below (not the page-level sticky
  // header offset used elsewhere in the app) — each table scrolls independently
  // within a bounded height, so the header can't drift relative to the modal.
  const th = 'px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 whitespace-nowrap';
  const td = 'px-3 py-2 align-top border-t border-neutral-100 dark:border-neutral-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">Assign Responsibility</h3>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto slim-scroll flex-1 space-y-5">
          {/* Search Member — always the first control */}
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <FormInput
              value={query}
              onChange={e => { setQuery(e.target.value); if (selectedMemberId) setSelectedMemberId(null); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search Member by name or ID…"
              className="pl-9"
            />
            {selectedMemberId && (
              <button
                type="button"
                onClick={clearMember}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {open && rect && createPortal(
              <div
                className="fixed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-[999] max-h-60 overflow-y-auto"
                style={{ top: rect.top, left: rect.left, width: rect.width }}
              >
                {suggestions.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectMember(m)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{m.jobTitle} · {m.activityCentre}</p>
                    </div>
                    <span className="text-xs font-mono text-neutral-400 ml-3 flex-shrink-0">{m.id}</span>
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

          {selectedMember && (
            <>
              {/* Selected member summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">First Name</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.firstName ?? selectedMember.name.split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Last Name</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.surname ?? selectedMember.name.split(' ').slice(1).join(' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Member ID</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Shakha</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.activityCentre}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Nagar</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.town}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Region</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedMember.region}</p>
                </div>
              </div>

              {/* Current Sangh Responsibilities */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Current Sangh Responsibilities</h4>
                  <button
                    type="button"
                    onClick={addRespRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Responsibility
                  </button>
                </div>
                {/* Header lives in its own table, entirely outside the scrolling box
                    below — this can never drift with any ancestor's scroll, unlike
                    position: sticky which kept getting affected by the page/modal
                    scroll behind it. Both tables share the same <colgroup> so columns
                    stay aligned. */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] table-fixed">
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <thead><tr>
                      <th className={th}>Responsibility Level</th>
                      <th className={th}>Responsibility</th>
                      <th className={th}>Responsibility Type</th>
                      <th className={th}>From – To</th>
                      <th className={`${th} w-36`}>Status</th>
                    </tr></thead>
                  </table>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-96 slim-scroll">
                  <table className="w-full min-w-[820px] border-separate border-spacing-0 table-fixed">
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <tbody>
                      {respRows.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-400">No responsibilities yet</td></tr>
                      ) : respRows.map((row, index) => (
                        <tr key={index} className={row.endDate && !row._isNew ? 'bg-neutral-50/70 dark:bg-neutral-900/30' : ''}>
                          {row._isNew ? (
                            <>
                              <td className={td}>
                                {assignableLevels.length > 1 ? (
                                  <FormSelect value={row.responsibilityLevel} onChange={e => updateResp(index, 'responsibilityLevel', e.target.value)}>
                                    {assignableLevels.map(v => <option key={v}>{v}</option>)}
                                  </FormSelect>
                                ) : (
                                  <FormInput value={assignableLevels[0]} readOnly />
                                )}
                              </td>
                              <td className={td}>
                                <FormSelect value={row.sanghResponsibility} onChange={e => updateResp(index, 'sanghResponsibility', e.target.value)}>
                                  <option value="">Select responsibility</option>
                                  {ROLE_TYPE_OPTIONS.map(v => <option key={v}>{v}</option>)}
                                </FormSelect>
                              </td>
                              <td className={td}>
                                <FormSelect value={row.responsibilityType} onChange={e => updateResp(index, 'responsibilityType', e.target.value)}>
                                  <option value="">Select type</option>
                                  {RESPONSIBILITY_TYPE_OPTIONS.map(v => <option key={v}>{v}</option>)}
                                </FormSelect>
                              </td>
                              <td className={td}>
                                <FormInput type="date" value={row.startDate ?? ''} onChange={e => updateResp(index, 'startDate', e.target.value)} />
                              </td>
                              <td className={td}>
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">New</span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={`${td} text-sm text-neutral-700 dark:text-neutral-300`}>{row.responsibilityLevel}</td>
                              <td className={`${td} text-sm font-medium text-neutral-900 dark:text-white`}>{row.sanghResponsibility}</td>
                              <td className={`${td} text-sm text-neutral-500 dark:text-neutral-400`}>{row.responsibilityType}</td>
                              <td className={`${td} text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap`}>
                                {row.startDate} – {row.endDate ?? 'Present'}
                              </td>
                              <td className={td}>
                                <div
                                  className={!row._wasActiveOnLoad ? 'opacity-60 pointer-events-none' : ''}
                                  title={!row._wasActiveOnLoad ? 'Already inactive — cannot be reactivated here' : undefined}
                                >
                                  <StatusSlider
                                    value={row.endDate ? 'inactive' : 'active'}
                                    onChange={() => toggleRespActive(index)}
                                  />
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Current MyHSS Roles */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Current MyHSS Roles</h4>
                  <button
                    type="button"
                    onClick={addRoleRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Role
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] table-fixed">
                    <colgroup>
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '38%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <thead><tr>
                      <th className={th}>MyHSS Role</th>
                      <th className={th}>From – To</th>
                      <th className={`${th} w-36`}>Status</th>
                    </tr></thead>
                  </table>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-96 slim-scroll">
                  <table className="w-full min-w-[480px] border-separate border-spacing-0 table-fixed">
                    <colgroup>
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '38%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <tbody>
                      {roleRows.length === 0 && !baseMyHSSRole(selectedMember) && (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-neutral-400">No MyHSS roles yet</td></tr>
                      )}
                      {roleRows.map((row, index) => (
                        <tr key={index} className={row.endDate && !row._isNew ? 'bg-neutral-50/70 dark:bg-neutral-900/30' : ''}>
                          {row._isNew ? (
                            <>
                              <td className={td}>
                                <FormSelect value={row.role} onChange={e => updateRole(index, 'role', e.target.value)}>
                                  {ASSIGNABLE_MYHSS_ROLE_OPTIONS.map(v => <option key={v} value={v}>{ROLE_DISPLAY_LABELS[v] ?? v}</option>)}
                                </FormSelect>
                              </td>
                              <td className={td}>
                                <FormInput type="date" value={row.startDate ?? ''} onChange={e => updateRole(index, 'startDate', e.target.value)} />
                              </td>
                              <td className={td}>
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">New</span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={`${td} text-sm font-medium text-neutral-900 dark:text-white`}>{ROLE_DISPLAY_LABELS[row.role] ?? row.role}</td>
                              <td className={`${td} text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap`}>
                                {row.startDate} – {row.endDate ?? 'Present'}
                              </td>
                              <td className={td}>
                                <div
                                  className={!row._wasActiveOnLoad ? 'opacity-60 pointer-events-none' : ''}
                                  title={!row._wasActiveOnLoad ? 'Already inactive — cannot be reactivated here' : undefined}
                                >
                                <StatusSlider
                                  value={row.endDate ? 'inactive' : 'active'}
                                  onChange={() => toggleRoleActive(index)}
                                />
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {baseMyHSSRole(selectedMember) && (
                        <tr>
                          <td className={`${td} text-sm font-medium text-neutral-900 dark:text-white`}>
                            {ROLE_DISPLAY_LABELS[baseMyHSSRole(selectedMember)!] ?? baseMyHSSRole(selectedMember)}
                          </td>
                          <td className={`${td} text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap`}>
                            {selectedMember.registrationDate?.split('T')[0]} – Present
                          </td>
                          <td className={td}>
                            <div className="opacity-60 pointer-events-none" title="Every member already has this role — cannot be changed here">
                              <StatusSlider value="active" onChange={() => {}} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
          <PrimaryButton icon={Save} onClick={handleSave} disabled={!selectedMember}>Save</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
