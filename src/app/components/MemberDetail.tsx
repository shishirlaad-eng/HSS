import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { SecondaryButton, PrimaryButton } from './hb/listing';
import {
  Member,
  getAge,
  getAgeCategory,
  MemberStatus,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  ComplianceStatus,
  ConsentStatus,
} from '../../mockAPI/membersData';

// ── Status helpers ────────────────────────────────────────────

const STATUS_CONFIG: Record<MemberStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:                    { label: 'Active',                   dot: 'bg-[#4EAE33]', text: 'text-[#3d8928]', bg: 'bg-[#f1fced]', border: 'border-[#b8efa0]' },
  pending:                   { label: 'Pending Approval',         dot: 'bg-[#F9B03D]', text: 'text-[#d97706]', bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]' },
  'pending-parental-consent':{ label: 'Pending Parental Consent', dot: 'bg-[#8B5CF6]', text: 'text-[#6d28d9]', bg: 'bg-[#f5f3ff]', border: 'border-[#ddd6fe]' },
  inactive:                  { label: 'Inactive',                 dot: 'bg-[#9C9C9D]', text: 'text-[#6b6b6c]', bg: 'bg-[#f5f5f5]', border: 'border-[#e0e0e0]' },
  rejected:                  { label: 'Rejected',                 dot: 'bg-[#BC0F1C]', text: 'text-[#9a0c17]', bg: 'bg-[#fff0f0]', border: 'border-[#ffaaab]' },
};

const AGE_GROUP_CHIP: Record<AgeGroup, string> = {
  bal: 'bg-[#fef0fc] text-[#c026d3] border border-[#f0abfc]',
  shishu: 'bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]',
  kishor: 'bg-[#e6f6fd] text-[#0080b8] border border-[#89d5f6]',
  tarun: 'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]',
  yuva: 'bg-[#f1fced] text-[#3d8928] border border-[#b8efa0]',
  jyestha: 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
};

function StatusBadge({ status }: { status: MemberStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${cfg.bg} ${cfg.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
    </span>
  );
}

function AgeGroupBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const group = getAgeGroup(dateOfBirth);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AGE_GROUP_CHIP[group]}`}>
      {AGE_GROUP_LABELS[group]}
    </span>
  );
}

// ── Compliance card helpers ───────────────────────────────────

interface ComplianceCardProps {
  label: string;
  status: ComplianceStatus | ConsentStatus;
  refNumber?: string;
  description?: string;
}

function ComplianceCard({ label, status, refNumber, description }: ComplianceCardProps) {
  const isNA      = status === 'n/a';
  const isClear   = status === 'completed' || status === 'granted';
  const isPending = status === 'pending';

  const Icon = isClear ? ShieldCheck : isPending ? ShieldAlert : ShieldX;
  const iconClass  = isClear ? 'text-[#4EAE33]' : isPending ? 'text-[#F9B03D]' : 'text-[#9C9C9D]';
  const bgClass    = isClear
    ? 'bg-[#f1fced] border-[#b8efa0]'
    : isPending
      ? 'bg-[#fffbeb] border-[#fde68a]'
      : 'bg-neutral-50 border-neutral-200';
  const labelClass = isClear ? 'text-[#3d8928]' : isPending ? 'text-[#d97706]' : 'text-neutral-500';
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

function InfoSection({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden ${className}`}
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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
}

type Tab = 'personal' | 'guardian' | 'organisation' | 'compliance' | 'other' | 'activity' | 'history';

// ── Mock change-history generator ────────────────────────────

interface ChangeEntry {
  id: string;
  timestamp: string;
  changedFields: string[];
  changedBy: 'Admin' | 'Self';
  changedByName: string;
  note?: string;
}

function buildMockHistory(member: { id: string; registrationDate: string; status: string }): ChangeEntry[] {
  const seed = member.id.charCodeAt(member.id.length - 1);
  const base  = new Date(member.registrationDate);

  const shift = (days: number, hrs = 0, mins = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(hrs, mins, 0, 0);
    return d.toISOString();
  };

  const entries: ChangeEntry[] = [
    {
      id: 'h-1',
      timestamp: base.toISOString(),
      changedFields: [],
      changedBy: 'Self',
      changedByName: 'Member (self-registration)',
      note: 'Member account created via online registration form.',
    },
  ];

  if (member.status !== 'pending' && member.status !== 'pending-parental-consent') {
    entries.push({
      id: 'h-2',
      timestamp: shift(seed % 3 + 2, 10, 30),
      changedFields: ['Status'],
      changedBy: 'Admin',
      changedByName: 'John Doe (Admin)',
      note: member.status === 'rejected' ? 'Member application rejected.' : 'Member application approved.',
    });
  }

  entries.push({
    id: 'h-3',
    timestamp: shift(seed % 5 + 5, 14, 15),
    changedFields: ['DBS Status', 'DBS Reference Number'],
    changedBy: 'Admin',
    changedByName: 'Sarah Patel (Admin)',
  });

  if (seed % 2 === 0) {
    entries.push({
      id: 'h-4',
      timestamp: shift(seed % 7 + 10, 9, 45),
      changedFields: ['First Aid Status', 'First Aid Reference Number'],
      changedBy: 'Admin',
      changedByName: 'John Doe (Admin)',
    });
  }

  if (seed % 3 !== 0) {
    entries.push({
      id: 'h-5',
      timestamp: shift(seed % 14 + 20, 18, 5),
      changedFields: ['Primary Contact Number', 'Address Line', 'Post Code'],
      changedBy: 'Self',
      changedByName: 'Member (self-service)',
    });
  }

  if (seed % 4 !== 1) {
    entries.push({
      id: 'h-6',
      timestamp: shift(seed % 20 + 30, 11, 0),
      changedFields: ['Sangh Responsibility (HSS Role)', 'Vibhag (Region)', 'Shakha (Branch)'],
      changedBy: 'Admin',
      changedByName: 'Priya Sharma (Admin)',
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Component ─────────────────────────────────────────────────

export default function MemberDetail({ member, onBack, onEdit, onStatusChange, onDelete, mode, onApprove, onReject, hideComplianceTab }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

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
    (member.compliance.dbs !== 'completed' ? 1 : 0) +
    (member.compliance.firstAid !== 'completed' ? 1 : 0) +
    (member.compliance.parentalConsent === 'pending' ? 1 : 0);

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'personal',      label: 'Personal Info'      },
    ...(showGuardian ? [{ id: 'guardian' as Tab, label: 'Parent / Guardian' }] : []),
    { id: 'organisation',  label: 'Organisation'       },
    ...(!hideComplianceTab ? [{ id: 'compliance' as Tab, label: 'Compliance Details', badge: complianceAlerts }] : []),
    { id: 'other',         label: 'Other Information'  },
    ...(mode !== 'approval' ? [
      { id: 'activity' as Tab, label: 'Activity' },
      { id: 'history'  as Tab, label: 'History'  },
    ] : []),
  ];

  const changeHistory = useMemo(() => buildMockHistory(member), [member]);

  const approvalEntry = changeHistory.find(e => e.changedFields.includes('Status') && e.changedBy === 'Admin');
  const approvedDate  = approvalEntry?.timestamp ?? null;
  const approvedBy    = approvalEntry?.changedByName ?? '—';

  const isActive = member.status === 'active';

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* ── PROFILE HEADER ─────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Left: Avatar + Name, role, ID + meta rows */}
            <div className="flex items-start gap-4 flex-1 min-w-0">

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 border-2 border-white dark:border-neutral-800 shadow flex items-center justify-center text-primary-600 dark:text-primary-400 text-base font-bold flex-shrink-0 mt-0.5">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              {/* Text block */}
              <div className="flex-1 min-w-0">

              {/* Row 1 — Name · Job Title · Member ID */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {member.name}
                </h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                  {[member.jobTitle, ...(member.additionalJobTitles ?? [])].join(', ')}
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">·</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                  {member.id}
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
                {mode === 'approval' ? 'Back to Pending Approvals' : 'Back to Members'}
              </SecondaryButton>

              {mode === 'approval' ? null : (
                <>
                  <PrimaryButton icon={Edit} onClick={onEdit}>
                    Edit Member
                  </PrimaryButton>
                  <button
                    onClick={() => onStatusChange(isActive ? 'deactivate' : 'reactivate')}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isActive
                        ? 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'border-[#b8efa0] text-[#3d8928] bg-[#f1fced] hover:bg-[#e2fad1] dark:bg-[#f1fced]/10 dark:border-[#b8efa0]/30'
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
              )}
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
                  <InfoItem label="First Name">{valueOrDash(member.firstName)}</InfoItem>
                  <InfoItem label="Membership ID">{member.id}</InfoItem>
                  <InfoItem label="Middle Name">{valueOrDash(member.middleName)}</InfoItem>
                  <InfoItem label="Gender"><span className="capitalize">{valueOrDash(member.gender)}</span></InfoItem>
                  <InfoItem label="Surname">{valueOrDash(member.surname)}</InfoItem>
                  <InfoItem label="Date of Birth">
                    {formatDate(member.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {age})</span>
                  </InfoItem>
                  <InfoItem label="Full Name">{member.name}</InfoItem>
                  <InfoItem label="Age Group"><AgeGroupBadge dateOfBirth={member.dateOfBirth} /></InfoItem>
                </InfoSection>

                <InfoSection title="Contact Details">
                  <InfoItem label="Primary Contact Number">{valueOrDash(member.phone)}</InfoItem>
                  <InfoItem label="Primary Email Address">{member.email}</InfoItem>
                  <InfoItem label="Secondary Contact Number">{valueOrDash(member.secondaryPhone)}</InfoItem>
                  <InfoItem label="Secondary Email Address">{valueOrDash(member.secondaryEmail)}</InfoItem>
                  <InfoItem label="Building Name">{valueOrDash(member.buildingName)}</InfoItem>
                  <InfoItem label="Town / City">{valueOrDash(member.contactTownCity)}</InfoItem>
                  <InfoItem label="Address Line 1">{valueOrDash(member.addressLine1)}</InfoItem>
                  <InfoItem label="Post Code">{valueOrDash(member.postCode)}</InfoItem>
                  <InfoItem label="Address Line 2">{valueOrDash(member.addressLine2)}</InfoItem>
                </InfoSection>

                <InfoSection title="Emergency Contact Details">
                  <InfoItem label="Contact Name">{valueOrDash(member.emergencyContactName)}</InfoItem>
                  <InfoItem label="Contact Phone Number">{valueOrDash(member.emergencyContactPhone)}</InfoItem>
                  <InfoItem label="Contact Email">{valueOrDash(member.emergencyContactEmail)}</InfoItem>
                  <InfoItem label="Contact Relationship">{valueOrDash(member.emergencyContactRelationship)}</InfoItem>
                </InfoSection>

                <InfoSection title="Medical Details">
                  <InfoItem label="Do you have any medical condition?">
                    {member.medicalInfoDeclared ? 'Yes' : 'No'}
                  </InfoItem>
                  <InfoItem label="Special Dietary Requirements">
                    {valueOrDash(member.dietaryRequirements)}
                  </InfoItem>
                  <InfoItem label="Medical Information Details">
                    {valueOrDash(member.medicalInfoDetails)}
                  </InfoItem>
                  <InfoItem label="Do you carry an EpiPen/Jext/Emerade?">—</InfoItem>
                </InfoSection>

              </div>
            )}

            {/* ── PARENT / GUARDIAN TAB ──────────────────────── */}
            {activeTab === 'guardian' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <InfoSection title="Approval Details">
                  <InfoItem label="Parent / Guardian Name">{valueOrDash(member.guardianName)}</InfoItem>
                  <InfoItem label="Parent / Guardian Phone Number">{valueOrDash(member.guardianPhone)}</InfoItem>
                  <InfoItem label="Parent / Guardian Email">{valueOrDash(member.guardianEmail)}</InfoItem>
                  <InfoItem label="Parent / Guardian Relationship">{valueOrDash(member.guardianRelationship)}</InfoItem>
                </InfoSection>
              </div>
            )}

            {/* ── ORGANISATION TAB ───────────────────────────── */}
            {activeTab === 'organisation' && (
              <>
                <InfoSection title="Organisation Details">
                  <InfoItem label="Country / Organisation">{valueOrDash(member.country)}</InfoItem>
                  <InfoItem label="Age Category"><AgeGroupBadge dateOfBirth={member.dateOfBirth} /></InfoItem>
                  <InfoItem label="Vibhaag">{valueOrDash(member.region)}</InfoItem>
                  <InfoItem label="Nagar">{valueOrDash(member.town)}</InfoItem>
                  <InfoItem label="Shakha">{valueOrDash(member.activityCentre)}</InfoItem>
                </InfoSection>

                {/* Current Sangh Responsibility */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-semibold text-white bg-primary-600 dark:bg-primary-700 px-4 py-2.5">
                    Current Sangh Responsibility
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility Level</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility Type</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Since</span>
                    </div>
                    {member.responsibilityLevel || member.jobTitle || member.responsibilityType ? (
                      <div className="grid grid-cols-4 gap-4 px-4 py-3">
                        <span className="text-sm text-neutral-900 dark:text-white">{valueOrDash(member.responsibilityLevel)}</span>
                        <span className="text-sm text-neutral-900 dark:text-white">{valueOrDash(member.jobTitle)}</span>
                        <span className="text-sm text-neutral-900 dark:text-white">{valueOrDash(member.responsibilityType)}</span>
                        <span className="text-sm text-neutral-900 dark:text-white">
                          {member.responsibilityStartDate
                            ? formatDate(member.responsibilityStartDate)
                            : '—'}
                        </span>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-neutral-400 dark:text-neutral-500">No current responsibility assigned.</div>
                    )}
                  </div>
                </div>

                {/* Previous Sangh Responsibility */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-semibold text-white bg-primary-600 dark:bg-primary-700 px-4 py-2.5">
                    Previous Sangh Responsibility
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility Level</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Responsibility Type</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">From – To</span>
                    </div>
                    {member.previousResponsibilities && member.previousResponsibilities.length > 0 ? (
                      member.previousResponsibilities.map((r, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3">
                          <span className="text-sm text-neutral-900 dark:text-white">{r.responsibilityLevel}</span>
                          <span className="text-sm text-neutral-900 dark:text-white">—</span>
                          <span className="text-sm text-neutral-900 dark:text-white">{r.responsibilityType}</span>
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {new Date(r.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            {' – '}
                            {new Date(r.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-neutral-400 dark:text-neutral-500">No previous responsibilities on record.</div>
                    )}
                  </div>
                </div>
              </>
            )}

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
                  <div className="flex items-center gap-3 p-4 bg-[#f1fced] border border-[#b8efa0] rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#4EAE33] flex-shrink-0" />
                    <p className="text-sm text-[#3d8928]">All compliance checks are up to date.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* DBS Check */}
                  <ComplianceCard
                    label="DBS Check"
                    status={member.compliance.dbs}
                    refNumber={member.dbsRef}
                    description={
                      member.compliance.dbs === 'completed'
                        ? 'Disclosure and Barring Service check is valid and on record.'
                        : 'DBS check is pending. Please submit or process the DBS application.'
                    }
                  />
                  <div className="ml-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: 'Certificate Number',        value: member.dbsCertificateNumber },
                      { label: 'Certificate Date',          value: member.dbsCertificateDate ? formatDate(member.dbsCertificateDate) : undefined },
                      { label: 'Certificate Received From', value: member.dbsCertificateReceivedFrom },
                      { label: 'Other Source',              value: member.dbsCertificateReceivedFromOther },
                      { label: 'DBS Update Service',        value: member.dbsUpdateService === true ? 'Yes' : member.dbsUpdateService === false ? 'No' : undefined },
                      { label: 'Update Service Number',     value: member.dbsUpdateServiceNumber },
                      { label: 'Last Service Check',        value: member.dbsUpdateServiceCheckDate ? formatDate(member.dbsUpdateServiceCheckDate) : undefined },
                      { label: 'App Under Process',         value: member.dbsAppUnderProcess === true ? 'Yes' : member.dbsAppUnderProcess === false ? 'No' : undefined },
                      { label: 'Verified By',               value: member.dbsCheckedBy },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{value ?? '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* First Aid */}
                  <ComplianceCard
                    label="First Aid Certificate"
                    status={member.compliance.firstAid}
                    refNumber={member.firstAidRef}
                    description={
                      member.compliance.firstAid === 'completed'
                        ? 'Valid first aid certificate on record.'
                        : 'First aid certificate is pending submission or processing.'
                    }
                  />
                  {member.isFirstAider !== undefined && (
                    <div className="ml-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Qualified First Aider</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{member.isFirstAider ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Qualification Level</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{member.firstAidQualificationLevel ?? '—'}</p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Qualification Expiry</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {member.firstAidQualificationExpiryDate ? formatDate(member.firstAidQualificationExpiryDate) : '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Safeguarding */}
                  <ComplianceCard
                    label="Safeguarding Training"
                    status={member.compliance.safeguardingTraining ?? 'pending'}
                    description={
                      member.compliance.safeguardingTraining === 'completed'
                        ? 'Safeguarding training has been completed and is on record.'
                        : 'Safeguarding training is pending.'
                    }
                  />
                  <div className="ml-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Date of Training</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {member.safeguardingTrainingDate ? formatDate(member.safeguardingTrainingDate) : '—'}
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Level of Training</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{member.safeguardingTrainingLevel ?? '—'}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Reference Number</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{member.safeguardingRef ?? '—'}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Expiry Date</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {member.safeguardingExpiry ? formatDate(member.safeguardingExpiry) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Parental Consent */}
                  <ComplianceCard
                    label="Parental Consent"
                    status={member.compliance.parentalConsent}
                    description={
                      member.compliance.parentalConsent === 'granted'
                        ? 'Parental / guardian consent form has been received and approved.'
                        : member.compliance.parentalConsent === 'pending'
                          ? 'Consent form has been sent to the guardian and is awaiting response.'
                          : 'Not applicable — member is 18 or over.'
                    }
                  />
                </div>
              </div>
            )}

            {/* ── OTHER INFORMATION TAB ──────────────────────── */}
            {activeTab === 'other' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <InfoSection title="Other Information">
                  <InfoItem label="Occupation">{valueOrDash(member.occupation)}</InfoItem>
                  <InfoItem label="Spoken Language(s)">{valueOrDash(member.spokenLanguages)}</InfoItem>
                  <InfoItem label="Originating State in India">{valueOrDash(member.originatingStateIndia)}</InfoItem>
                  <InfoItem label="Additional Notes / Comments">—</InfoItem>
                </InfoSection>
              </div>
            )}

            {/* ── ACTIVITY TAB ────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatMini label="Events Attended"  value={member.eventsAttended}         icon={CalendarDays} />
                  <StatMini label="Shakhas Attended" value={member.shakhaSessionsAttended} icon={UserCheck} />
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    Attendance History
                  </h4>
                  <div className="overflow-x-auto slim-scroll">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/50 dark:bg-neutral-900/50">
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Event / Shakha</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Centre</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                Detailed attendance history will be available once the Attendance module is implemented.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
                      <div className="w-7 h-7 rounded-md bg-[#f1fced] dark:bg-[#4EAE33]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4EAE33]" />
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

                {/* Change History timeline */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Change History</h4>
                    <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                      {changeHistory.length} event{changeHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {changeHistory.map((entry, idx) => {
                      const isAdmin = entry.changedBy === 'Admin';
                      const isFirst = idx === changeHistory.length - 1;
                      return (
                        <div key={entry.id} className="flex gap-4 px-6 py-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">

                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isFirst
                                ? 'bg-primary-50 dark:bg-primary-950'
                                : isAdmin
                                  ? 'bg-amber-50 dark:bg-amber-950/30'
                                  : 'bg-neutral-100 dark:bg-neutral-800'
                            }`}>
                              {isFirst ? (
                                <ClipboardList className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                              ) : isAdmin ? (
                                <UserCog className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <UserCircle2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                                isAdmin
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400'
                                  : 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/30 dark:border-primary-800/40 dark:text-primary-400'
                              }`}>
                                {isAdmin ? <UserCog className="w-2.5 h-2.5" /> : <UserCircle2 className="w-2.5 h-2.5" />}
                                {entry.changedBy}
                              </span>
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">{entry.changedByName}</span>
                              <span className="ml-auto flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(entry.timestamp)}
                              </span>
                            </div>

                            {entry.note && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5 italic">{entry.note}</p>
                            )}

                            {entry.changedFields.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {entry.changedFields.map(field => (
                                  <span
                                    key={field}
                                    className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs border border-neutral-200 dark:border-neutral-700"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
