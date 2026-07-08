import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  CalendarDays,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  Users,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Ban,
  History,
  UserCog,
  UserCircle2,
  ClipboardList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { SecondaryButton, PrimaryButton, Pagination, SearchBar, DateRangeFilter } from './hb/listing';
import { FormInput, FormSelect, FormTextarea, PhoneInput } from './hb/common/Form';
import {
  Member,
  getAge,
  getAgeCategory,
  MemberStatus,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  ConsentStatus,
  MASTERS_CASCADE,
  FIRST_AID_QUALIFICATION_OPTIONS,
  SAFEGUARDING_LEVEL_OPTIONS,
  mockMembers,
  RESPONSIBILITY_LEVEL_OPTIONS,
  RESPONSIBILITY_TYPE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  ResponsibilityAssignment,
} from '../../mockAPI/membersData';

// ── Status helpers ────────────────────────────────────────────

const STATUS_CONFIG: Record<MemberStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:                    { label: 'Active',                   dot: 'bg-success-500',  text: 'text-success-700 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-950/20',  border: 'border-success-200 dark:border-success-800'  },
  pending:                   { label: 'Pending Approval',         dot: 'bg-amber-500',    text: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-950/20',      border: 'border-amber-200 dark:border-amber-800'      },
  'pending-parental-consent':{ label: 'Pending Parental Consent', dot: 'bg-violet-500',   text: 'text-violet-700 dark:text-violet-400',    bg: 'bg-violet-50 dark:bg-violet-950/20',    border: 'border-violet-200 dark:border-violet-800'    },
  inactive:                  { label: 'Inactive',                 dot: 'bg-neutral-400',  text: 'text-neutral-600 dark:text-neutral-400',  bg: 'bg-neutral-100 dark:bg-neutral-800',    border: 'border-neutral-200 dark:border-neutral-700'  },
  rejected:                  { label: 'Rejected',                 dot: 'bg-error-500',    text: 'text-error-700 dark:text-error-400',      bg: 'bg-error-50 dark:bg-error-950/20',      border: 'border-error-200 dark:border-error-800'      },
};

function StatusBadge({ status }: { status: MemberStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${cfg.bg} ${cfg.border} ${cfg.text} whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
}

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return <span className="text-sm font-medium text-neutral-900 dark:text-white">{AGE_GROUP_LABELS[group]}</span>;
}

// ── Compliance card helpers ───────────────────────────────────

interface ComplianceCardProps {
  label: string;
  status: ConsentStatus;
  refNumber?: string;
  description?: string;
}

function ComplianceCard({ label, status, refNumber, description }: ComplianceCardProps) {
  const isNA      = status === 'n/a';
  const isClear   = status === 'completed' || status === 'granted';
  const isPending = status === 'pending';

  const Icon = isClear ? ShieldCheck : isPending ? ShieldAlert : ShieldX;
  const iconClass  = isClear ? 'text-success-600 dark:text-success-400' : isPending ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-400';
  const bgClass    = isClear
    ? 'bg-success-50 border-success-200 dark:bg-success-950/20 dark:border-success-800'
    : isPending
      ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
      : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700';
  const labelClass = isClear ? 'text-success-700 dark:text-success-400' : isPending ? 'text-amber-700 dark:text-amber-400' : 'text-neutral-500';
  const statusLabel =
    status === 'completed' ? 'Completed' :
    status === 'granted'   ? 'Granted'   :
    status === 'pending'   ? 'Pending'   :
    'N / A';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border ${bgClass} dark:bg-neutral-900/30 dark:border-neutral-800`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
          <span className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>
            {statusLabel}
          </span>
        </div>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
        )}
        {refNumber && (
          <p className="text-xs text-neutral-400 mt-1">
            Ref: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-neutral-500">{refNumber}</code>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stat mini-card ────────────────────────────────────────────

function StatMini({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xl font-bold text-neutral-900 dark:text-white">{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function valueOrDash(value?: string | string[] | boolean | null) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value && String(value).trim() ? String(value) : '—';
}

const RELATIONSHIP_OPTIONS = ['Spouse', 'Sibling', 'Parent', 'Child'];

const OCCUPATION_OPTIONS = ['Student', 'Business man', 'Job'];

const SPOKEN_LANGUAGE_OPTIONS = [
  'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani',
  'Malayalam', 'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Tamil', 'Telugu', 'Other',
];

const INDIA_STATE_OPTIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const DIETARY_MULTISELECT_OPTIONS = [
  'Coeliac',
  'Gluten-free',
  'Vegan',
  'Lacto (allows dairy)',
  'Paleo Diet',
  'Ketogenic (low carbohydrate, high fat)',
  'Low GI (limits carbohydrate intake)',
  'FODMAP',
  'No Onions or Garlic',
  'Other',
] as const;

function DietaryMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const r = buttonRef.current?.getBoundingClientRect();
      if (r) setRect({ top: Math.max(8, r.top - 228), left: r.left, width: r.width });
    };
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const optionLabel = (val: string) => val === 'Other' ? 'Other - With box to specify' : val;

  const displayText = selected.length === 0
    ? 'Select dietary requirements'
    : selected.map(optionLabel).join(', ');

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
      >
        <span className={`truncate text-sm ${selected.length === 0 ? 'text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && rect && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[999] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          <div className="max-h-56 overflow-y-auto">
            {DIETARY_MULTISELECT_OPTIONS.map(opt => (
              <div
                key={opt}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900"
                onClick={() => toggle(opt)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes(opt) ? 'bg-primary-600 border-primary-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                  {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">{optionLabel(opt)}</span>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function InfoSection({ title, children, className = '', cols = 2 }: { title: string; children: React.ReactNode; className?: string; cols?: 2 | 4 }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden ${className}`}
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
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">{label}</label>
      <div className="text-sm text-neutral-900 dark:text-white font-medium">{children}</div>
    </div>
  );
}

function MiniField({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  options,
  displayValue,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  options?: { value: string; label: string }[];
  displayValue?: React.ReactNode;
}) {
  const inputCls = 'w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white';
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      {!isEditing ? (
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{displayValue ?? valueOrDash(value)}</p>
      ) : options ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

function EditableInfoItem({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  options,
  displayValue,
  textarea = false,
  required = false,
  phone = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  options?: { value: string; label: string }[];
  displayValue?: React.ReactNode;
  textarea?: boolean;
  required?: boolean;
  phone?: boolean;
}) {
  if (!isEditing) {
    return <InfoItem label={label}>{displayValue ?? valueOrDash(value)}</InfoItem>;
  }
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
        {label}{required && <span className="text-error-600 ml-0.5">*</span>}
      </label>
      {options ? (
        <FormSelect value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormSelect>
      ) : textarea ? (
        <FormTextarea value={value} onChange={e => onChange(e.target.value)} />
      ) : phone ? (
        <PhoneInput value={value} onChange={onChange} />
      ) : (
        <FormInput type={type} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ── Mock postcode-to-address lookup ────────────────────────────

const MOCK_STREET_NAMES = ['High Street', 'Church Road', 'Kings Avenue', 'Mill Lane', 'Victoria Street'];

function mockAddressesForPostcode(postcode: string, fallbackTown: string): { label: string; buildingName: string; addressLine1: string; town: string }[] {
  const cleaned = postcode.trim();
  if (cleaned.length < 4) return [];
  const seed = cleaned.toUpperCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return [1, 2, 3].map(n => {
    const street = MOCK_STREET_NAMES[(seed + n) % MOCK_STREET_NAMES.length];
    const houseNumber = ((seed * n) % 90) + 1;
    return {
      label: `${houseNumber} ${street}`,
      buildingName: '',
      addressLine1: `${houseNumber} ${street}`,
      town: fallbackTown,
    };
  });
}

// ── Props ─────────────────────────────────────────────────────

type ModalAction = 'deactivate' | 'reactivate' | 'reject';

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
  onEdit: () => void;
  onStatusChange: (action: ModalAction) => void;
  onDelete: () => void;
  /** When set to 'approval', hides Edit/Deactivate/Delete and shows Approve + Reject instead */
  mode?: 'approval';
  onApprove?: () => void;
  onReject?: () => void;
  hideComplianceTab?: boolean;
  initialTab?: Tab;
  backLabel?: string;
}

type Tab = 'personal' | 'guardian' | 'organisation' | 'compliance' | 'roles' | 'other' | 'activity' | 'history';

// ── Mock change-history generator ────────────────────────────

interface ChangeRow {
  id: string;
  timestamp: string;
  changedBy: 'Admin' | 'Self';
  changedByName: string;
  role: string;
  field: string;
  oldValue: string;
  newValue: string;
}

// ── Mock activity generator (first 20 members only) ──────────

interface ActivityRow {
  id: string;
  date: string;
  type: 'Event' | 'Shakha Session';
  name: string;
  centre: string;
}

const ACTIVITY_EVENT_NAMES = ['Youth Leadership Summit', 'Fundraising Gala', 'Cultural Evening', 'Family Picnic Day', 'Tech Workshop Series', 'HSS Annual General Meeting'];
const ACTIVITY_CENTRES = ['Wembley Activity Centre', 'Harrow Activity Centre', 'Manchester Central Activity Centre', 'Birmingham East Activity Centre', 'Dublin Activity Centre'];

function buildMockActivity(member: { id: string; registrationDate: string; activityCentre: string }): ActivityRow[] {
  const seed = member.id.charCodeAt(member.id.length - 1) + member.id.charCodeAt(0);
  const base = new Date(member.registrationDate);
  const rowCount = 8 + (seed % 8); // 8–15 rows

  const rows: ActivityRow[] = [];
  for (let i = 0; i < rowCount; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + (i * (3 + (seed % 5))) + (seed % 7));
    const isEvent = (seed + i) % 2 === 0;
    rows.push({
      id: `act-${member.id}-${i}`,
      date: d.toISOString(),
      type: isEvent ? 'Event' : 'Shakha Session',
      name: isEvent ? ACTIVITY_EVENT_NAMES[(seed + i) % ACTIVITY_EVENT_NAMES.length] : 'Weekly Shakha',
      centre: i % 4 === 0 ? ACTIVITY_CENTRES[(seed + i) % ACTIVITY_CENTRES.length] : member.activityCentre,
    });
  }
  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildMockHistory(member: { id: string; registrationDate: string; status: string }): ChangeRow[] {
  const seed = member.id.charCodeAt(member.id.length - 1);
  const base  = new Date(member.registrationDate);

  const shift = (days: number, hrs = 0, mins = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(hrs, mins, 0, 0);
    return d.toISOString();
  };

  const rows: ChangeRow[] = [
    { id: 'h-1a', timestamp: base.toISOString(), changedBy: 'Self', changedByName: 'Member (self-registration)', role: 'Member', field: 'Status', oldValue: '-', newValue: 'Registration submitted' },
  ];

  if (member.status !== 'pending' && member.status !== 'pending-parental-consent') {
    rows.push({
      id: 'h-2a',
      timestamp: shift(seed % 3 + 2, 10, 30),
      changedBy: 'Admin',
      changedByName: 'John Doe',
      role: 'Shakha Admin',
      field: 'Status',
      oldValue: 'Pending',
      newValue: member.status === 'rejected' ? 'Rejected' : 'Active & Approved',
    });
  }

  rows.push(
    { id: 'h-3a', timestamp: shift(seed % 5 + 5, 14, 15), changedBy: 'Admin', changedByName: 'Sarah Patel', role: 'Compliance Officer', field: 'DBS Status',      oldValue: 'Pending',  newValue: 'Approved' },
    { id: 'h-3b', timestamp: shift(seed % 5 + 5, 14, 15), changedBy: 'Admin', changedByName: 'Sarah Patel', role: 'Compliance Officer', field: 'DBS Cert Number', oldValue: '-',        newValue: 'DBS-2024-001' },
  );

  if (seed % 2 === 0) {
    rows.push(
      { id: 'h-4a', timestamp: shift(seed % 7 + 10, 9, 45), changedBy: 'Admin', changedByName: 'John Doe', role: 'Shakha Admin', field: 'First Aid Status', oldValue: 'Expired', newValue: 'Certified' },
      { id: 'h-4b', timestamp: shift(seed % 7 + 10, 9, 45), changedBy: 'Admin', changedByName: 'John Doe', role: 'Shakha Admin', field: 'First Aid Ref',    oldValue: '-',       newValue: 'FA-2023-001' },
    );
  }

  if (seed % 3 !== 0) {
    rows.push(
      { id: 'h-5a', timestamp: shift(seed % 14 + 20, 18, 5), changedBy: 'Self', changedByName: 'Member (self-service)', role: 'Member', field: 'Phone',          oldValue: '+44 7700 900100', newValue: '+44 7700 900123' },
      { id: 'h-5b', timestamp: shift(seed % 14 + 20, 18, 5), changedBy: 'Self', changedByName: 'Member (self-service)', role: 'Member', field: 'Address Line 1', oldValue: '10 Queens Road',  newValue: '18 Kings Road' },
      { id: 'h-5c', timestamp: shift(seed % 14 + 20, 18, 5), changedBy: 'Self', changedByName: 'Member (self-service)', role: 'Member', field: 'Post Code',      oldValue: 'HA2 0AA',         newValue: 'HA1 2AB' },
    );
  }

  if (seed % 4 !== 1) {
    rows.push(
      { id: 'h-6a', timestamp: shift(seed % 20 + 30, 11, 0), changedBy: 'Admin', changedByName: 'Priya Sharma', role: 'Regional Admin', field: 'Responsibility',  oldValue: 'Shikshak',          newValue: 'Ghatnayak' },
      { id: 'h-6b', timestamp: shift(seed % 20 + 30, 11, 0), changedBy: 'Admin', changedByName: 'Priya Sharma', role: 'Regional Admin', field: 'Vibhag',          oldValue: 'North West',         newValue: 'London & South East' },
      { id: 'h-6c', timestamp: shift(seed % 20 + 30, 11, 0), changedBy: 'Admin', changedByName: 'Priya Sharma', role: 'Regional Admin', field: 'Activity Centre',  oldValue: 'Manchester Central', newValue: 'Harrow Activity Centre' },
    );
  }

  return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Component ─────────────────────────────────────────────────

export default function MemberDetail({ member, onBack, onEdit, onStatusChange, onDelete, mode, onApprove, onReject, hideComplianceTab, initialTab, backLabel }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'personal');

  const [isEditing, setIsEditing]   = useState(false);
  const [form, setForm]             = useState<Member>(member);
  const [savedForm, setSavedForm]   = useState<Member>(member);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    setForm(member);
    setSavedForm(member);
    setIsEditing(false);
  }, [member.id]);

  const setField = (field: keyof Member, value: string | boolean | string[]) => {
    setForm(cur => ({ ...cur, [field]: value }));
  };

  const setComplianceField = (field: 'dbs' | 'firstAid' | 'safeguardingTraining', value: string) => {
    setForm(cur => ({ ...cur, compliance: { ...cur.compliance, [field]: value } }));
  };

  const handleStartEditing = () => {
    setForm(cur => ({
      ...cur,
      compliance: {
        ...cur.compliance,
        dbs: 'N/A',
        safeguardingTraining: 'N/A',
      },
    }));
    setIsEditing(true);
  };

  const setOrganisationField = (field: 'country' | 'region' | 'town' | 'activityCentre', value: string) => {
    setForm(cur => {
      const next = { ...cur, [field]: value };
      if (field === 'country') {
        next.region = '';
        next.town = '';
        next.activityCentre = '';
      } else if (field === 'region') {
        next.town = '';
        next.activityCentre = '';
      } else if (field === 'town') {
        next.activityCentre = '';
      }
      return next;
    });
  };

  const addResponsibility = () => {
    setForm(cur => ({
      ...cur,
      responsibilities: [
        ...(cur.responsibilities ?? []),
        { responsibilityLevel: RESPONSIBILITY_LEVEL_OPTIONS[0], sanghResponsibility: '', responsibilityType: RESPONSIBILITY_TYPE_OPTIONS[0], startDate: '' },
      ],
    }));
  };

  const updateResponsibility = (index: number, key: keyof ResponsibilityAssignment, value: string) => {
    setForm(cur => ({
      ...cur,
      responsibilities: (cur.responsibilities ?? []).map((r, i) => i === index ? { ...r, [key]: value } as ResponsibilityAssignment : r),
    }));
  };

  const removeResponsibility = (index: number) => {
    setForm(cur => ({
      ...cur,
      responsibilities: (cur.responsibilities ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (form.medicalInfoDeclared && !form.medicalInfoDetails?.trim()) {
      toast.error('Please state the medical details to be aware of.');
      return;
    }
    if (form.allergiesDeclared && !form.allergies?.trim()) {
      toast.error('Please state the allergies to be aware of.');
      return;
    }
    if (form.allergiesDeclared && !['Yes', 'No'].includes(form.epiPen ?? '')) {
      toast.error('Please select whether the member carries an EpiPen.');
      return;
    }
    setSavedForm(form);
    setIsEditing(false);
    toast.success('Member updated successfully.');
  };

  const handleCancel = () => {
    setForm(savedForm);
    setIsEditing(false);
  };

  const age = getAge(member.dateOfBirth);
  const ageCategory = getAgeCategory(member.dateOfBirth);
  const isMinor = ageCategory === 'child' || ageCategory === 'teen';
  const ageGroup = getAgeGroup(member.dateOfBirth);
  const showGuardian = isMinor;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const complianceAlerts =
    (member.compliance.dbs === 'Pending' ? 1 : 0) +
    (member.compliance.firstAid === 'Expired' ? 1 : 0) +
    ((member.compliance.safeguardingTraining ?? 'Expired') === 'Expired' ? 1 : 0) +
    (member.compliance.parentalConsent === 'pending' ? 1 : 0);

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'personal',      label: 'Personal Info'          },
    ...(showGuardian ? [{ id: 'guardian' as Tab, label: 'Parent / Guardian' }] : []),
    { id: 'organisation',  label: 'Organisation'           },
    ...(!hideComplianceTab ? [{ id: 'compliance' as Tab, label: 'Compliance Details', badge: complianceAlerts }] : []),
    { id: 'roles',         label: 'Responsibilities and Roles' },
    { id: 'other',         label: 'Other Information'      },
    ...(mode !== 'approval' ? [
      { id: 'activity' as Tab, label: 'Activity' },
      { id: 'history'  as Tab, label: 'History'  },
    ] : []),
  ];

  const isInFirst20 = useMemo(() => mockMembers.findIndex(m => m.id === member.id) < 20, [member.id]);
  const memberActivity = useMemo(() => isInFirst20 ? buildMockActivity(member) : [], [member, isInFirst20]);
  const [activityPage, setActivityPage]         = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(20);
  const [activitySearch, setActivitySearch]     = useState('');
  const [activityDateStart, setActivityDateStart] = useState('');
  const [activityDateEnd, setActivityDateEnd]     = useState('');
  const [activityDateLabel, setActivityDateLabel] = useState('');
  const [showActivityDateFilter, setShowActivityDateFilter] = useState(false);
  const activityDateRef = useRef<HTMLDivElement>(null);

  const filteredActivity = useMemo(() => {
    let rows = [...memberActivity];
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.centre.toLowerCase().includes(q)
      );
    }
    if (activityDateStart) {
      const start = new Date(activityDateStart).getTime();
      rows = rows.filter(r => new Date(r.date).getTime() >= start);
    }
    if (activityDateEnd) {
      const end = new Date(activityDateEnd).getTime() + 86399999;
      rows = rows.filter(r => new Date(r.date).getTime() <= end);
    }
    return rows;
  }, [memberActivity, activitySearch, activityDateStart, activityDateEnd]);

  const changeHistory = useMemo(() => buildMockHistory(member), [member]);
  const [historyPage, setHistoryPage]         = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(20);
  const [historySearch, setHistorySearch]     = useState('');
  const [historySortCol, setHistorySortCol]   = useState<keyof ChangeRow>('timestamp');
  const [historySortDir, setHistorySortDir]   = useState<'asc' | 'desc'>('desc');
  const [historyDateStart, setHistoryDateStart] = useState('');
  const [historyDateEnd, setHistoryDateEnd]     = useState('');
  const [historyDateLabel, setHistoryDateLabel] = useState('');
  const [showHistoryDateFilter, setShowHistoryDateFilter] = useState(false);
  const historyDateRef = useRef<HTMLDivElement>(null);

  const filteredHistory = useMemo(() => {
    let rows = [...changeHistory];
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      rows = rows.filter(r =>
        r.changedByName.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.field.toLowerCase().includes(q) ||
        r.oldValue.toLowerCase().includes(q) ||
        r.newValue.toLowerCase().includes(q)
      );
    }
    if (historyDateStart) {
      const start = new Date(historyDateStart).getTime();
      rows = rows.filter(r => new Date(r.timestamp).getTime() >= start);
    }
    if (historyDateEnd) {
      const end = new Date(historyDateEnd).getTime() + 86399999;
      rows = rows.filter(r => new Date(r.timestamp).getTime() <= end);
    }
    rows.sort((a, b) => {
      let av: string = String(a[historySortCol]);
      let bv: string = String(b[historySortCol]);
      if (historySortCol === 'timestamp') {
        av = new Date(a.timestamp).getTime().toString();
        bv = new Date(b.timestamp).getTime().toString();
        return historySortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      }
      return historySortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [changeHistory, historySearch, historyDateStart, historyDateEnd, historySortCol, historySortDir]);

  const approvalEntry = changeHistory.find(e => e.newValue === 'Active & Approved' && e.changedBy === 'Admin');
  const approvedDate  = approvalEntry?.timestamp ?? null;
  const approvedBy    = approvalEntry?.changedByName ?? '-';

  const isActive = member.status === 'active';

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* ── PROFILE HEADER ─────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Left: Avatar + Name, role, ID + meta rows */}
            <div className="flex items-start gap-4 flex-1 min-w-0">

              {/* Text block */}
              <div className="flex-1 min-w-0">

              {/* Row 1 — Name · Member ID */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-[32px] font-semibold text-neutral-900 dark:text-white">
                  {member.name}
                </h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-xl font-medium text-neutral-400 dark:text-neutral-500">
                  [{member.id}]
                </span>
              </div>

              {/* Row 2 — Age group badge · Status badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <AgeGroupBadge dateOfBirth={member.dateOfBirth} />
                <StatusBadge status={member.status} />
              </div>

              {/* Row 3 — Email, Guardian Email (minors), Phone */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <a href={`mailto:${member.email}`}
                  className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />{member.email}
                </a>
                {isMinor && member.guardianEmail && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <a href={`mailto:${member.guardianEmail}`}
                      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Guardian: {member.guardianEmail}</span>
                    </a>
                  </>
                )}
                {member.phone && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />{member.phone}
                    </span>
                  </>
                )}
              </div>

              {/* Row 4 — Country · Region · Town · Activity Centre · Registered */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{member.country}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{member.region}
                </span>
                <span>·</span>
                <span>{member.town}</span>
                <span>·</span>
                <span>{member.activityCentre}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Registered {formatDate(member.registrationDate)}
                </span>
              </div>
              </div>{/* end text block */}
            </div>{/* end avatar + text */}

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>
                {mode === 'approval' ? 'Back to Pending Approvals' : (backLabel ?? 'Back to Members')}
              </SecondaryButton>

              {mode === 'approval' && onApprove ? (
                <>
                  <button
                    onClick={onApprove}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-success-600 hover:bg-success-700 text-white transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={onReject}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-error-600 hover:bg-error-700 text-white transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Reject
                  </button>
                </>
              ) : mode !== 'approval' ? isEditing ? (
                <>
                  <SecondaryButton icon={X} onClick={handleCancel}>Cancel</SecondaryButton>
                  <PrimaryButton icon={Save} onClick={handleSave}>Save Changes</PrimaryButton>
                </>
              ) : (
                <>
                  <PrimaryButton icon={Edit} onClick={handleStartEditing}>
                    Edit Member
                  </PrimaryButton>
                  <button
                    onClick={() => onStatusChange(isActive ? 'deactivate' : 'reactivate')}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isActive
                        ? 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'border-success-200 text-success-700 bg-success-50 hover:bg-success-100 dark:bg-success-950/20 dark:border-success-800 dark:text-success-400'
                    }`}
                  >
                    {isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    {isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                  <button
                    onClick={onDelete}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[#ffaaab] text-[#9a0c17] bg-[#fff0f0] hover:bg-[#ffe0e0] dark:bg-[#fff0f0]/10 dark:border-[#ffaaab]/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── TABBED CONTENT ──────────────────────────────────── */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">

          {/* Tab bar */}
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
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#BC0F1C] text-white text-[9px] font-bold leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">

            {/* ── PERSONAL INFO TAB ──────────────────────────── */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                <InfoSection title="Personal Details">
                  <EditableInfoItem label="First Name" value={form.firstName ?? ''} isEditing={isEditing} onChange={v => setField('firstName', v)} />
                  <InfoItem label="Membership ID">{member.id}</InfoItem>
                  <EditableInfoItem label="Middle Name" value={form.middleName ?? ''} isEditing={isEditing} onChange={v => setField('middleName', v)} />
                  <EditableInfoItem
                    label="Gender"
                    value={form.gender}
                    isEditing={isEditing}
                    onChange={v => setField('gender', v)}
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
                    displayValue={<span className="capitalize">{valueOrDash(member.gender)}</span>}
                  />
                  <EditableInfoItem label="Surname" value={form.surname ?? ''} isEditing={isEditing} onChange={v => setField('surname', v)} />
                  <EditableInfoItem
                    label="Date of Birth"
                    value={form.dateOfBirth}
                    isEditing={isEditing}
                    onChange={v => setField('dateOfBirth', v)}
                    type="date"
                    displayValue={<>{formatDate(member.dateOfBirth)}<span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {age})</span></>}
                  />
                  <InfoItem label="Full Name">{member.name}</InfoItem>
                  <InfoItem label="Age Group"><AgeGroupBadge dateOfBirth={member.dateOfBirth} /></InfoItem>
                </InfoSection>

                <InfoSection title="Contact Details">
                  <EditableInfoItem label="Contact Number" value={form.phone ?? ''} isEditing={isEditing} onChange={v => setField('phone', v)} phone />
                  <EditableInfoItem label="Email Address" value={form.email} isEditing={isEditing} onChange={v => setField('email', v)} type="email" />
                  <EditableInfoItem
                    label="Post Code"
                    value={form.postCode ?? ''}
                    isEditing={isEditing}
                    onChange={v => { setField('postCode', v); setSelectedAddress(''); }}
                  />
                  {isEditing && (
                    <div>
                      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Select Address</label>
                      <FormSelect
                        value={selectedAddress}
                        disabled={(form.postCode ?? '').trim().length < 4}
                        onChange={e => {
                          const idx = e.target.value;
                          setSelectedAddress(idx);
                          const options = mockAddressesForPostcode(form.postCode ?? '', member.town);
                          const picked = options[Number(idx)];
                          if (picked) {
                            setField('buildingName', picked.buildingName);
                            setField('addressLine1', picked.addressLine1);
                            setField('contactTownCity', picked.town);
                          }
                        }}
                      >
                        <option value="">{(form.postCode ?? '').trim().length < 4 ? 'Enter a post code first' : 'Select an address'}</option>
                        {mockAddressesForPostcode(form.postCode ?? '', member.town).map((opt, i) => (
                          <option key={i} value={i}>{opt.label}</option>
                        ))}
                      </FormSelect>
                    </div>
                  )}
                  <EditableInfoItem label="Building Name" value={form.buildingName ?? ''} isEditing={isEditing} onChange={v => setField('buildingName', v)} />
                  <EditableInfoItem label="Address Line 1" value={form.addressLine1 ?? ''} isEditing={isEditing} onChange={v => setField('addressLine1', v)} />
                  <EditableInfoItem label="Address Line 2" value={form.addressLine2 ?? ''} isEditing={isEditing} onChange={v => setField('addressLine2', v)} />
                  <EditableInfoItem label="Town / City" value={form.contactTownCity ?? ''} isEditing={isEditing} onChange={v => setField('contactTownCity', v)} />
                </InfoSection>

                <InfoSection title="Emergency Contact Details">
                  <EditableInfoItem label="Contact Name" value={form.emergencyContactName ?? ''} isEditing={isEditing} onChange={v => setField('emergencyContactName', v)} />
                  <EditableInfoItem label="Contact Phone Number" value={form.emergencyContactPhone ?? ''} isEditing={isEditing} onChange={v => setField('emergencyContactPhone', v)} phone />
                  <EditableInfoItem label="Contact Email" value={form.emergencyContactEmail ?? ''} isEditing={isEditing} onChange={v => setField('emergencyContactEmail', v)} type="email" />
                  <div>
                    <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Contact Relationship</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <FormSelect
                          value={RELATIONSHIP_OPTIONS.includes(form.emergencyContactRelationship ?? '') ? form.emergencyContactRelationship : 'Other'}
                          onChange={e => setField('emergencyContactRelationship', e.target.value === 'Other' ? '' : e.target.value)}
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Other">Other - With box to specify</option>
                        </FormSelect>
                        {!RELATIONSHIP_OPTIONS.includes(form.emergencyContactRelationship ?? '') && (
                          <FormInput
                            type="text"
                            placeholder="Please specify"
                            value={form.emergencyContactRelationship ?? ''}
                            onChange={e => setField('emergencyContactRelationship', e.target.value)}
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white font-medium">{valueOrDash(member.emergencyContactRelationship)}</p>
                    )}
                  </div>
                </InfoSection>

                <InfoSection title="Medical Details">
                  <EditableInfoItem
                    label="Do you have any medical conditions?"
                    value={form.medicalInfoDeclared ? 'Yes' : 'No'}
                    isEditing={isEditing}
                    onChange={v => {
                      const hasMedicalConditions = v === 'Yes';
                      setField('medicalInfoDeclared', hasMedicalConditions);
                      if (!hasMedicalConditions) setField('medicalInfoDetails', '');
                    }}
                    options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                    required
                  />
                  {form.medicalInfoDeclared && (
                    <EditableInfoItem
                      label="Please state any medical details to be aware of"
                      value={form.medicalInfoDetails ?? ''}
                      isEditing={isEditing}
                      onChange={v => setField('medicalInfoDetails', v)}
                      textarea
                      required
                    />
                  )}
                  <EditableInfoItem
                    label="Do you have any allergies?"
                    value={form.allergiesDeclared ? 'Yes' : 'No'}
                    isEditing={isEditing}
                    onChange={v => {
                      const hasAllergies = v === 'Yes';
                      setField('allergiesDeclared', hasAllergies);
                      if (!hasAllergies) {
                        setField('allergies', '');
                        setField('epiPen', '');
                      }
                    }}
                    options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                    required
                  />
                  {form.allergiesDeclared && (
                    <>
                      <EditableInfoItem
                        label="Please state allergy details to be aware of"
                        value={form.allergies ?? ''}
                        isEditing={isEditing}
                        onChange={v => setField('allergies', v)}
                        textarea
                        required
                      />
                      <EditableInfoItem
                        label="Do you carry an EpiPen/Jext/Emerade?"
                        value={form.epiPen ?? ''}
                        isEditing={isEditing}
                        onChange={v => setField('epiPen', v)}
                        options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                        required
                      />
                    </>
                  )}
                  <div>
                    <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Special Dietary Requirements</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <DietaryMultiSelect
                          selected={form.dietaryRequirements ?? []}
                          onChange={vals => setField('dietaryRequirements', vals)}
                        />
                        {(form.dietaryRequirements ?? []).includes('Other') && (
                          <FormInput
                            type="text"
                            placeholder="Please specify"
                            value={form.dietaryOtherSpecify ?? ''}
                            onChange={e => setField('dietaryOtherSpecify', e.target.value)}
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white font-medium">
                        {member.dietaryRequirements && member.dietaryRequirements.length
                          ? member.dietaryRequirements.map(v => v === 'Other' ? `Other${member.dietaryOtherSpecify ? `: ${member.dietaryOtherSpecify}` : ''}` : v).join(', ')
                          : '—'}
                      </p>
                    )}
                  </div>
                </InfoSection>

              </div>
            )}

            {/* ── PARENT / GUARDIAN TAB ──────────────────────── */}
            {activeTab === 'guardian' && (
              <InfoSection title="Approval Details" cols={4}>
                <EditableInfoItem label="Parent / Guardian Name" value={form.guardianName ?? ''} isEditing={isEditing} onChange={v => setField('guardianName', v)} />
                <EditableInfoItem label="Parent / Guardian Phone Number" value={form.guardianPhone ?? ''} isEditing={isEditing} onChange={v => setField('guardianPhone', v)} phone />
                <EditableInfoItem label="Parent / Guardian Email" value={form.guardianEmail ?? ''} isEditing={isEditing} onChange={v => setField('guardianEmail', v)} type="email" />
                <EditableInfoItem label="Parent / Guardian Relationship" value={form.guardianRelationship ?? ''} isEditing={isEditing} onChange={v => setField('guardianRelationship', v)} options={[{ value: 'Parent', label: 'Parent' }, { value: 'Guardian', label: 'Guardian' }]} />
              </InfoSection>
            )}

            {/* ── ORGANISATION TAB ───────────────────────────── */}
            {activeTab === 'organisation' && (
              <InfoSection title="Organisation Details" cols={4}>
                <EditableInfoItem
                  label="Country / Organisation"
                  value={form.country ?? ''}
                  isEditing={isEditing}
                  onChange={v => setOrganisationField('country', v)}
                  options={MASTERS_CASCADE.countries.map(c => ({ value: c, label: c }))}
                />
                <EditableInfoItem
                  label="Vibhag"
                  value={form.region ?? ''}
                  isEditing={isEditing}
                  onChange={v => setOrganisationField('region', v)}
                  options={(form.country ? (MASTERS_CASCADE.regions[form.country] ?? []) : []).map(r => ({ value: r, label: r }))}
                />
                <EditableInfoItem
                  label="Nagar"
                  value={form.town ?? ''}
                  isEditing={isEditing}
                  onChange={v => setOrganisationField('town', v)}
                  options={(form.region ? (MASTERS_CASCADE.towns[form.region] ?? []) : []).map(t => ({ value: t, label: t }))}
                />
                <EditableInfoItem
                  label="Shakha"
                  value={form.activityCentre ?? ''}
                  isEditing={isEditing}
                  onChange={v => setOrganisationField('activityCentre', v)}
                  options={(form.town ? (MASTERS_CASCADE.centres[form.town] ?? []) : []).map(c => ({ value: c, label: c }))}
                />
                <InfoItem label="Age Category"><AgeGroupBadge dateOfBirth={member.dateOfBirth} /></InfoItem>
              </InfoSection>
            )}

            {/* ── ROLES & RESPONSIBILITY TAB ─────────────────── */}
            {activeTab === 'roles' && (() => {
              const TH = 'px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900';
              const TD = 'px-4 py-3 text-sm text-neutral-900 dark:text-white';
              const TDE = 'px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400';
              const fmtD = (d: string | null | undefined) =>
                d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Present';
              const currentRole = member.orgRole || member.adminRole || 'Member';
              return (
                <div className="space-y-5">
                  {/* Current Sangh Responsibility */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current Sangh Responsibilities</h4>
                      {isEditing && (
                        <SecondaryButton icon={Plus} onClick={addResponsibility}>Add Responsibility</SecondaryButton>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '21%' }} />
                          <col style={{ width: '31%' }} />
                          {isEditing && <col style={{ width: '48px' }} />}
                        </colgroup>
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <th className={TH}>Responsibility Level</th>
                            <th className={TH}>Responsibility</th>
                            <th className={TH}>Responsibility Type</th>
                            <th className={TH}>Start Date</th>
                            {isEditing && <th className={TH}></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {isEditing ? (
                            (form.responsibilities ?? []).length > 0 ? (
                              (form.responsibilities ?? []).map((r, i) => (
                                <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <FormSelect value={r.responsibilityLevel} onChange={e => updateResponsibility(i, 'responsibilityLevel', e.target.value)}>
                                      {RESPONSIBILITY_LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </FormSelect>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <FormSelect value={r.sanghResponsibility} onChange={e => updateResponsibility(i, 'sanghResponsibility', e.target.value)}>
                                      <option value="">Select Sangh Responsibility</option>
                                      {ROLE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </FormSelect>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <FormSelect value={r.responsibilityType} onChange={e => updateResponsibility(i, 'responsibilityType', e.target.value)}>
                                      {RESPONSIBILITY_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </FormSelect>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <FormInput type="date" value={r.startDate ?? ''} onChange={e => updateResponsibility(i, 'startDate', e.target.value)} />
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <button type="button" onClick={() => removeResponsibility(i)} className="w-8 h-8 flex items-center justify-center rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors" aria-label={`Remove responsibility ${i + 1}`}>
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">No current responsibilities — click "Add Responsibility" to add one</td></tr>
                            )
                          ) : (
                            form.responsibilities && form.responsibilities.length > 0 ? (
                              form.responsibilities.map((r, i) => (
                                <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                                  <td className={TD}>{r.responsibilityLevel}</td>
                                  <td className={TD}>{r.sanghResponsibility}</td>
                                  <td className={TDE}>{r.responsibilityType}</td>
                                  <td className={TDE}>{fmtD(r.startDate)} – Present</td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">No current responsibilities</td></tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Previous Sangh Responsibility */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Previous Sangh Responsibilities</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '21%' }} />
                          <col style={{ width: '31%' }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <th className={TH}>Responsibility Level</th>
                            <th className={TH}>Responsibility</th>
                            <th className={TH}>Responsibility Type</th>
                            <th className={TH}>From – To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {member.previousResponsibilities && member.previousResponsibilities.length > 0 ? (
                            member.previousResponsibilities.map((r, i) => (
                              <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                                <td className={TD}>{r.responsibilityLevel}</td>
                                <td className={TD}>—</td>
                                <td className={TDE}>{r.responsibilityType}</td>
                                <td className={TDE}>
                                  {new Date(r.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                  {' – '}
                                  {new Date(r.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">No previous responsibilities on record</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Current & Previous MyHSS Roles — side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current MyHSS Roles</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col style={{ width: '50%' }} />
                            <col style={{ width: '50%' }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                              <th className={TH}>MyHSS Role</th>
                              <th className={TH}>From – To</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                              <td className={TD}>{currentRole}</td>
                              <td className={TDE}>{fmtD(member.registrationDate)} – Present</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Previous MyHSS Roles</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col style={{ width: '50%' }} />
                            <col style={{ width: '50%' }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                              <th className={TH}>MyHSS Role</th>
                              <th className={TH}>From – To</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-neutral-400">No previous roles</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── COMPLIANCE DETAILS TAB ─────────────────────── */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                {complianceAlerts > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      This member has <strong>{complianceAlerts}</strong> compliance item{complianceAlerts > 1 ? 's' : ''} requiring attention.
                    </p>
                  </div>
                )}
                {complianceAlerts === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 dark:bg-success-950/20 dark:border-success-800 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400 flex-shrink-0" />
                    <p className="text-sm text-success-700 dark:text-success-400">All compliance checks are up to date.</p>
                  </div>
                )}

                {/* First Aid + Safeguarding — side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {/* First Aid */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">First Aid</h4>
                    </div>
                    <div className="px-5 py-4 grid grid-cols-2 gap-4">
                      <MiniField
                        label="Qualified First Aider"
                        value={form.isFirstAider ? 'Yes' : 'No'}
                        isEditing={isEditing}
                        onChange={v => setField('isFirstAider', v === 'Yes')}
                        options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                        displayValue={member.isFirstAider ? 'Yes' : 'No'}
                      />
                      {form.isFirstAider && (
                        <>
                          <MiniField
                            label="First Aid Status"
                            value={form.compliance.firstAid}
                            isEditing={isEditing}
                            onChange={v => setComplianceField('firstAid', v)}
                            options={[{ value: 'Certified', label: 'Certified' }, { value: 'Expired', label: 'Expired' }, { value: 'N/A', label: 'N/A' }]}
                          />
                          <MiniField
                            label="Expiry Date"
                            value={form.firstAidQualificationExpiryDate ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('firstAidQualificationExpiryDate', v)}
                            type="date"
                            displayValue={member.firstAidQualificationExpiryDate ? formatDate(member.firstAidQualificationExpiryDate) : '—'}
                          />
                          <MiniField
                            label="First Aid Qualification"
                            value={form.firstAidQualificationLevel ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('firstAidQualificationLevel', v)}
                            options={FIRST_AID_QUALIFICATION_OPTIONS.map(o => ({ value: o, label: o }))}
                          />
                          <MiniField label="Reference Number" value={form.firstAidRef ?? ''} isEditing={isEditing} onChange={v => setField('firstAidRef', v)} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Safeguarding */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Safeguarding</h4>
                    </div>
                    <div className="px-5 py-4 grid grid-cols-2 gap-4">
                      <MiniField
                        label="Safeguarding Status"
                        value={form.compliance.safeguardingTraining ?? 'N/A'}
                        isEditing={isEditing}
                        onChange={v => setComplianceField('safeguardingTraining', v)}
                        options={[{ value: 'Certified', label: 'Certified' }, { value: 'Expired', label: 'Expired' }, { value: 'N/A', label: 'N/A' }]}
                      />
                      {(form.compliance.safeguardingTraining ?? 'N/A') !== 'N/A' && (
                        <>
                          <MiniField
                            label="Level of Training"
                            value={form.safeguardingTrainingLevel ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('safeguardingTrainingLevel', v)}
                            options={SAFEGUARDING_LEVEL_OPTIONS.map(o => ({ value: o, label: o }))}
                          />
                          <MiniField
                            label="Date Completed"
                            value={form.safeguardingTrainingDate ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('safeguardingTrainingDate', v)}
                            type="date"
                            displayValue={member.safeguardingTrainingDate ? formatDate(member.safeguardingTrainingDate) : '—'}
                          />
                          <MiniField
                            label="Expiry Date"
                            value={form.safeguardingExpiry ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('safeguardingExpiry', v)}
                            type="date"
                            displayValue={member.safeguardingExpiry ? formatDate(member.safeguardingExpiry) : '—'}
                          />
                          <MiniField label="Reference Number" value={form.safeguardingRef ?? ''} isEditing={isEditing} onChange={v => setField('safeguardingRef', v)} />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Disclosure Barring Service — full width */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Disclosure Barring Service</h4>
                  </div>
                  <div className="px-4 py-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MiniField
                        label="DBS Status"
                        value={form.compliance.dbs ?? 'N/A'}
                        isEditing={isEditing}
                        onChange={v => setComplianceField('dbs', v)}
                        options={[{ value: 'Approved', label: 'Approved' }, { value: 'Pending', label: 'Pending' }, { value: 'N/A', label: 'N/A' }]}
                      />
                      {(form.compliance.dbs ?? 'N/A') !== 'N/A' && (
                        <>
                          <MiniField label="DBS Cert Number" value={form.dbsCertificateNumber ?? ''} isEditing={isEditing} onChange={v => setField('dbsCertificateNumber', v)} />
                          <MiniField
                            label="DBS Cert Date"
                            value={form.dbsCertificateDate ?? ''}
                            isEditing={isEditing}
                            onChange={v => setField('dbsCertificateDate', v)}
                            type="date"
                            displayValue={member.dbsCertificateDate ? formatDate(member.dbsCertificateDate) : '—'}
                          />
                          <MiniField label="DBS Cert File" value={form.dbsCertificateFile ?? ''} isEditing={isEditing} onChange={v => setField('dbsCertificateFile', v)} />
                        </>
                      )}
                    </div>
                    {(form.compliance.dbs ?? 'N/A') !== 'N/A' && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MiniField
                            label="DBS Update Service"
                            value={form.dbsUpdateService === true ? 'Yes' : 'No'}
                            isEditing={isEditing}
                            onChange={v => setField('dbsUpdateService', v === 'Yes')}
                            options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                            displayValue={member.dbsUpdateService === true ? 'Yes' : member.dbsUpdateService === false ? 'No' : '—'}
                          />
                          <MiniField label="DBS Update Service No." value={form.dbsUpdateServiceNumber ?? ''} isEditing={isEditing} onChange={v => setField('dbsUpdateServiceNumber', v)} />
                          <MiniField
                            label="Application Under Process"
                            value={form.dbsAppUnderProcess === true ? 'Yes' : 'No'}
                            isEditing={isEditing}
                            onChange={v => setField('dbsAppUnderProcess', v === 'Yes')}
                            options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                            displayValue={member.dbsAppUnderProcess === true ? 'Yes' : member.dbsAppUnderProcess === false ? 'No' : '—'}
                          />
                          <MiniField label="Cert Received From" value={form.dbsCertificateReceivedFrom ?? ''} isEditing={isEditing} onChange={v => setField('dbsCertificateReceivedFrom', v)} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MiniField label="Verified By" value={form.dbsCheckedBy ?? ''} isEditing={isEditing} onChange={v => setField('dbsCheckedBy', v)} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── OTHER INFORMATION TAB ──────────────────────── */}
            {activeTab === 'other' && (
              <InfoSection title="Other Information" cols={4}>
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Occupation</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <FormSelect
                        value={OCCUPATION_OPTIONS.includes(form.occupation ?? '') ? form.occupation : 'Other'}
                        onChange={e => setField('occupation', e.target.value === 'Other' ? '' : e.target.value)}
                      >
                        <option value="Student">Student</option>
                        <option value="Business man">Business man</option>
                        <option value="Job">Job</option>
                        <option value="Other">Other - With box to specify</option>
                      </FormSelect>
                      {!OCCUPATION_OPTIONS.includes(form.occupation ?? '') && (
                        <FormInput
                          type="text"
                          placeholder="Please specify"
                          value={form.occupation ?? ''}
                          onChange={e => setField('occupation', e.target.value)}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-900 dark:text-white font-medium">{valueOrDash(member.occupation)}</p>
                  )}
                </div>
                <EditableInfoItem
                  label="Spoken Language(s)"
                  value={(form.spokenLanguages && form.spokenLanguages[0]) ?? ''}
                  isEditing={isEditing}
                  onChange={v => setField('spokenLanguages', [v])}
                  options={SPOKEN_LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))}
                  displayValue={valueOrDash(member.spokenLanguages)}
                />
                <EditableInfoItem label="Originating State in India" value={form.originatingStateIndia ?? ''} isEditing={isEditing} onChange={v => setField('originatingStateIndia', v)} options={INDIA_STATE_OPTIONS.map(s => ({ value: s, label: s }))} />
                <EditableInfoItem label="Additional Notes / Comments" value={form.additionalNotes ?? ''} isEditing={isEditing} onChange={v => setField('additionalNotes', v)} textarea />
              </InfoSection>
            )}

            {/* ── ACTIVITY TAB ────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatMini label="Events Attended"  value={member.eventsAttended}         icon={CalendarDays} />
                  <StatMini label="Shakhas Attended" value={member.shakhaSessionsAttended} icon={UserCheck} />
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
                    <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white mr-2">Attendance History</h4>
                    {isInFirst20 && (
                      <>
                        <div className="flex-1 min-w-[180px] max-w-xs">
                          <SearchBar
                            value={activitySearch}
                            onChange={v => { setActivitySearch(v); setActivityPage(1); }}
                            placeholder="Search activity..."
                          />
                        </div>
                        {/* Date filter */}
                        <div className="relative" ref={activityDateRef}>
                          <button
                            onClick={() => setShowActivityDateFilter(p => !p)}
                            className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                              activityDateStart
                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                            }`}
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            {activityDateStart ? (activityDateLabel || `${activityDateStart} - ${activityDateEnd}`) : 'Date range'}
                            {activityDateStart && (
                              <span role="button" onClick={e => { e.stopPropagation(); setActivityDateStart(''); setActivityDateEnd(''); setActivityDateLabel(''); }} className="ml-0.5 text-primary-400 hover:text-primary-700">
                                <X className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                          <DateRangeFilter
                            isOpen={showActivityDateFilter}
                            onClose={() => setShowActivityDateFilter(false)}
                            startDate={activityDateStart}
                            endDate={activityDateEnd}
                            onApply={(start, end, label) => { setActivityDateStart(start); setActivityDateEnd(end); setActivityDateLabel(label || ''); setActivityPage(1); }}
                            title="Filter by Date"
                          />
                        </div>
                        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                          {filteredActivity.length} record{filteredActivity.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="overflow-x-auto slim-scroll">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/50 dark:bg-neutral-900/50">
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">Date</th>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">Type</th>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">Event / Shakha</th>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">Centre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {!isInFirst20 || filteredActivity.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Calendar className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                  {isInFirst20 ? 'No records match your search.' : 'Detailed attendance history will be available once the Attendance module is implemented.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : filteredActivity.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize).map(row => {
                          const d = new Date(row.date);
                          return (
                            <tr key={row.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap">
                                <p className="text-xs font-medium text-neutral-900 dark:text-white">
                                  {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                                  {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="px-6 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{row.type}</td>
                              <td className="px-6 py-3 text-xs font-medium text-neutral-900 dark:text-white whitespace-nowrap">{row.name}</td>
                              <td className="px-6 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{row.centre}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {isInFirst20 && filteredActivity.length > 0 && (
                    <Pagination
                      currentPage={activityPage}
                      totalPages={Math.max(1, Math.ceil(filteredActivity.length / activityPageSize))}
                      totalItems={filteredActivity.length}
                      itemsPerPage={activityPageSize}
                      onPageChange={setActivityPage}
                      onItemsPerPageChange={size => { setActivityPageSize(size); setActivityPage(1); }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ─────────────────────────────────── */}
            {activeTab === 'history' && (
              <div className="space-y-6">

                {/* Registration & Approval summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Registration Date</span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {formatDate(member.registrationDate)}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {new Date(member.registrationDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-success-50 dark:bg-success-950/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-600 dark:text-success-400" />
                      </div>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Approved Date</span>
                    </div>
                    {approvedDate ? (
                      <>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatDate(approvedDate)}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {new Date(approvedDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">Pending</p>
                    )}
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                        <UserCog className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Approved By</span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{approvedBy}</p>
                  </div>
                </div>

                {/* Change History table */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
                    <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white mr-2">Change History</h4>
                    <div className="flex-1 min-w-[180px] max-w-xs">
                      <SearchBar
                        value={historySearch}
                        onChange={v => { setHistorySearch(v); setHistoryPage(1); }}
                        placeholder="Search history..."
                      />
                    </div>
                    {/* Date filter */}
                    <div className="relative" ref={historyDateRef}>
                      <button
                        onClick={() => setShowHistoryDateFilter(p => !p)}
                        className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          historyDateStart
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        {historyDateStart ? (historyDateLabel || `${historyDateStart} - ${historyDateEnd}`) : 'Date range'}
                        {historyDateStart && (
                          <span role="button" onClick={e => { e.stopPropagation(); setHistoryDateStart(''); setHistoryDateEnd(''); setHistoryDateLabel(''); }} className="ml-0.5 text-primary-400 hover:text-primary-700">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                      <DateRangeFilter
                        isOpen={showHistoryDateFilter}
                        onClose={() => setShowHistoryDateFilter(false)}
                        startDate={historyDateStart}
                        endDate={historyDateEnd}
                        onApply={(start, end, label) => { setHistoryDateStart(start); setHistoryDateEnd(end); setHistoryDateLabel(label || ''); setHistoryPage(1); }}
                        title="Filter by Date"
                      />
                    </div>
                    <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                      {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          {([
                            { key: 'timestamp',    label: 'Date / Time'    },
                            { key: 'changedByName', label: 'Changed By'    },
                            { key: 'role',          label: 'Role'          },
                            { key: 'field',         label: 'Field'         },
                            { key: 'oldValue',      label: 'Old Value'     },
                            { key: 'newValue',      label: 'New Value'     },
                          ] as { key: keyof ChangeRow; label: string }[]).map(col => {
                            const active = historySortCol === col.key;
                            const Icon = active ? (historySortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                            return (
                              <th
                                key={col.key}
                                className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900 cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                onClick={() => {
                                  if (historySortCol === col.key) setHistorySortDir(d => d === 'asc' ? 'desc' : 'asc');
                                  else { setHistorySortCol(col.key); setHistorySortDir('asc'); }
                                }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  {col.label}
                                  <Icon className={`w-3 h-3 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}`} />
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {filteredHistory.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">No records match your search</td></tr>
                        ) : filteredHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize).map(row => {
                          const d = new Date(row.timestamp);
                          return (
                            <tr key={row.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-xs font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                                  {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {' · '}
                                  {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-xs font-medium text-neutral-900 dark:text-white">{row.changedByName}</p>
                              </td>
                              <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{row.role}</td>
                              <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white whitespace-nowrap">{row.field}</td>
                              <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">{row.oldValue}</td>
                              <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white">{row.newValue}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={historyPage}
                    totalPages={Math.ceil(filteredHistory.length / historyPageSize)}
                    totalItems={filteredHistory.length}
                    itemsPerPage={historyPageSize}
                    onPageChange={setHistoryPage}
                    onItemsPerPageChange={size => { setHistoryPageSize(size); setHistoryPage(1); }}
                  />
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
