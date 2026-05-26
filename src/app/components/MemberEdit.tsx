import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Shield,
  Building2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput } from './hb/common';
import { Select } from './hb/common';
import {
  Member,
  MemberStatus,
  MemberType,
  ComplianceStatus,
  getAge,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import { toast } from 'sonner';

// ── Select options ────────────────────────────────────────────

const GENDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
];

const MEMBER_TYPE_OPTIONS: Array<{ value: MemberType; label: string }> = [
  { value: 'adult', label: 'Adult (18+)' },
  { value: 'teen',  label: 'Teen (13–17)' },
  { value: 'child', label: 'Child (<13)' },
];

const STATUS_OPTIONS: MemberStatus[] = ['active', 'pending', 'pending-parental-consent', 'inactive', 'rejected'];

const STATUS_LABELS: Record<MemberStatus, string> = {
  active:                    'Active',
  pending:                   'Pending Approval',
  'pending-parental-consent':'Pending Parental Consent',
  inactive:                  'Inactive',
  rejected:                  'Rejected',
};

const STATUS_COLOURS: Record<MemberStatus, string> = {
  active:                    'bg-[#4EAE33]',
  pending:                   'bg-[#F9B03D]',
  'pending-parental-consent':'bg-[#8B5CF6]',
  inactive:                  'bg-[#9C9C9D]',
  rejected:                  'bg-[#BC0F1C]',
};

// ── Section header helper ─────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      {title}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────

interface MemberEditProps {
  member: Member;
  onBack: () => void;
  onSave: (updated: Member) => void;
}

// ── Component ─────────────────────────────────────────────────

export default function MemberEdit({ member, onBack, onSave }: MemberEditProps) {
  const age = getAge(member.dateOfBirth);
  const isMinor = age < 18;

  const [formData, setFormData] = useState({
    memberType:     member.memberType,
    name:           member.name,
    email:          member.email,
    phone:          member.phone ?? '',
    dateOfBirth:    member.dateOfBirth,
    gender:         member.gender,
    guardianName:   member.guardianName ?? '',
    guardianEmail:  member.guardianEmail ?? '',
    country:        member.country,
    region:         member.region,
    town:           member.town,
    activityCentre: member.activityCentre,
    jobTitle:       member.jobTitle,
    orgRole:        member.orgRole,
    status:         member.status,
    dbsStatus:      member.compliance.dbs,
    firstAidStatus: member.compliance.firstAid,
    dbsRef:         member.dbsRef ?? '',
    firstAidRef:    member.firstAidRef ?? '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const calcAge = formData.dateOfBirth ? getAge(formData.dateOfBirth) : age;

  const regionOptions = formData.country ? (MASTERS_CASCADE.regions[formData.country] ?? []) : [];
  const townOptions   = formData.region  ? (MASTERS_CASCADE.towns[formData.region]     ?? []) : [];
  const centreOptions = formData.town    ? (MASTERS_CASCADE.centres[formData.town]      ?? []) : [];

  const set = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setFormData(prev => {
        const next = { ...prev, [key]: val };
        if (key === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
        if (key === 'region')  { next.town = ''; next.activityCentre = ''; }
        if (key === 'town')    { next.activityCentre = ''; }
        return next;
      });
    };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      const updated: Member = {
        ...member,
        memberType:     formData.memberType as MemberType,
        name:           formData.name.trim(),
        email:          formData.email.trim(),
        phone:          formData.phone.trim() || undefined,
        dateOfBirth:    formData.dateOfBirth,
        gender:         formData.gender as 'male' | 'female',
        guardianName:   formData.guardianName.trim() || undefined,
        guardianEmail:  formData.guardianEmail.trim() || undefined,
        country:        formData.country,
        region:         formData.region,
        town:           formData.town,
        activityCentre: formData.activityCentre,
        jobTitle:       formData.jobTitle,
        orgRole:        formData.orgRole,
        status:         formData.status as MemberStatus,
        compliance: {
          ...member.compliance,
          dbs:      formData.dbsStatus as ComplianceStatus,
          firstAid: formData.firstAidStatus as ComplianceStatus,
        },
        dbsRef:     formData.dbsRef.trim() || undefined,
        firstAidRef:formData.firstAidRef.trim() || undefined,
      };
      onSave(updated);
    } catch {
      toast.error('Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <PageHeader
          title="Edit Member Profile"
          breadcrumbs={[
            { label: 'Members', onClick: onBack },
            { label: member.name, onClick: onBack },
            { label: 'Edit', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={onBack}>
              Cancel
            </SecondaryButton>
            <PrimaryButton icon={Save} onClick={handleSave} isLoading={isSaving}>
              {isSaving ? 'Saving…' : 'Update'}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── MAIN FORM (2/3 width) ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Member Type */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={UserIcon} title="Member Type" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Member Type</FormLabel>
                  <Select value={formData.memberType} onChange={set('memberType')}>
                    {MEMBER_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </FormField>
                <div className="flex items-end pb-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Current age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} years</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={UserIcon} title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField className="md:col-span-2">
                  <FormLabel required>Full Name</FormLabel>
                  <FormInput value={formData.name} onChange={set('name')} placeholder="Enter full name" />
                </FormField>

                <FormField>
                  <FormLabel required>Email Address</FormLabel>
                  <FormInput type="email" value={formData.email} onChange={set('email')} placeholder="Enter email address" />
                </FormField>

                <FormField>
                  <FormLabel required>Phone Number</FormLabel>
                  <FormInput type="tel" value={formData.phone} onChange={set('phone')} placeholder="+44 7700 000000" />
                </FormField>

                <FormField>
                  <FormLabel required>Date of Birth</FormLabel>
                  <FormInput type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} />
                  {formData.dateOfBirth && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} years</span>
                    </p>
                  )}
                </FormField>

                <FormField>
                  <FormLabel required>Gender</FormLabel>
                  <Select value={formData.gender} onChange={set('gender')}>
                    {GENDER_OPTIONS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Guardian Information (minors only) */}
            {isMinor && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                <SectionHeader icon={Users} title="Guardian Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField>
                    <FormLabel>Guardian Full Name</FormLabel>
                    <FormInput value={formData.guardianName} onChange={set('guardianName')} placeholder="Enter guardian's name" />
                  </FormField>
                  <FormField>
                    <FormLabel>Guardian Email</FormLabel>
                    <FormInput type="email" value={formData.guardianEmail} onChange={set('guardianEmail')} placeholder="Enter guardian's email" />
                  </FormField>
                </div>
              </div>
            )}

            {/* Organisational Details */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Building2} title="Organisational Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Country / Organisation</FormLabel>
                  <Select value={formData.country} onChange={set('country')}>
                    <option value="">Select country</option>
                    {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Region</FormLabel>
                  <Select value={formData.region} onChange={set('region')} disabled={!formData.country}>
                    <option value="">{formData.country ? 'Select region' : 'Select country first'}</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Town</FormLabel>
                  <Select value={formData.town} onChange={set('town')} disabled={!formData.region}>
                    <option value="">{formData.region ? 'Select town' : 'Select region first'}</option>
                    {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Activity Centre</FormLabel>
                  <Select value={formData.activityCentre} onChange={set('activityCentre')} disabled={!formData.town}>
                    <option value="">{formData.town ? 'Select centre' : 'Select town first'}</option>
                    {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Job Title (HSS Role)</FormLabel>
                  <FormInput value={formData.jobTitle} onChange={set('jobTitle')} placeholder="e.g. Sevak, Karyavah, Shikshak" />
                </FormField>

                <FormField>
                  <FormLabel required>Organisational Role</FormLabel>
                  <FormInput value={formData.orgRole} onChange={set('orgRole')} placeholder="e.g. Volunteer, Teen Member" />
                </FormField>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Shield} title="Compliance" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel>DBS Status</FormLabel>
                  <Select value={formData.dbsStatus} onChange={set('dbsStatus')}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>DBS Reference Number</FormLabel>
                  <FormInput value={formData.dbsRef} onChange={set('dbsRef')} placeholder="e.g. DBS-2024-001" />
                </FormField>

                <FormField>
                  <FormLabel>First Aid Status</FormLabel>
                  <Select value={formData.firstAidStatus} onChange={set('firstAidStatus')}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>First Aid Reference Number</FormLabel>
                  <FormInput value={formData.firstAidRef} onChange={set('firstAidRef')} placeholder="e.g. FA-2024-001" />
                </FormField>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed">
                DBS checks and First Aid certificates are updated here. Parental consent status is managed via the member's lifecycle.
              </p>
            </div>

            {/* Membership Status */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Shield} title="Membership Status" />
              <div className="flex flex-wrap gap-3">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.status === s
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLOURS[s]}`} />
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed">
                Pending: awaiting approval. Inactive: account suspended. Rejected: application declined.
              </p>
            </div>
          </div>

          {/* ── SIDEBAR (1/3 width) ──────────────────────────── */}
          <div className="space-y-6">

            {/* Important note */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Important Note</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                Updating a member's profile will sync changes across all HSS platforms. Changes to membership status take effect immediately and may affect access to events, Shakha sessions, and the member portal.
              </p>
            </div>

            {/* Member reference */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Member Reference</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Member ID</label>
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">
                    {member.id}
                  </code>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Registration Date</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {new Date(member.registrationDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Current Age</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {calcAge < 13 ? `Child (${calcAge})` : calcAge < 18 ? `Teen (${calcAge})` : `Adult (${calcAge})`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
