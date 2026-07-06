import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  BarChart3,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  Mail,
  Ban,
  Trash2,
  Upload,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  X,
  FileUp,
  CalendarDays,
  Award,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  PrimaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  DateRangeFilter,
  type ColumnConfig,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  FormModal,
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
} from './hb/common';
import {
  mockMembers,
  Member,
  MemberStatus,
  MemberType,
  ROLE_TYPE_OPTIONS,
  FIRST_AID_QUALIFICATION_OPTIONS,
  FirstAidQualification,
  DietaryRequirement,
  DIETARY_REQUIREMENTS,
  getAge,
  getAgeCategory,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroup,
  getAgeGroupLabel,
  getMemberTypeFromAge,
  hasResponsibility,
  MEMBER_FILTER_OPTIONS,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import MemberDetail from './MemberDetail';
import MemberEdit from './MemberEdit';
import { toast } from 'sonner';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { TRANSFER_CHANGE_EVENT } from '../../mockAPI/shakhaTransferData';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail' | 'edit';

// All admin roles with members listing access default to table view
const TABLE_VIEW_DEFAULT_ROLES = [
  'Super Admin', 'Kendriya Admin', 'Vibhaag Admin', 'Nagar Admin',
  'Shakha Admin', 'Event Admin', 'Reporting User', 'Shakha Operations',
];
type ModalAction = 'deactivate' | 'reactivate' | 'reject';

// â"€â"€ Status helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const STATUS_CONFIG: Record<MemberStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:                    { label: 'Active',                    dot: 'bg-success-500',  text: 'text-success-700 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-950/20',  border: 'border-success-200 dark:border-success-800'  },
  pending:                   { label: 'Pending Approval',          dot: 'bg-amber-500',    text: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-950/20',      border: 'border-amber-200 dark:border-amber-800'      },
  'pending-parental-consent':{ label: 'Pending Parental Consent',  dot: 'bg-violet-500',   text: 'text-violet-700 dark:text-violet-400',    bg: 'bg-violet-50 dark:bg-violet-950/20',    border: 'border-violet-200 dark:border-violet-800'    },
  inactive:                  { label: 'Inactive',                  dot: 'bg-neutral-400',  text: 'text-neutral-600 dark:text-neutral-400',  bg: 'bg-neutral-100 dark:bg-neutral-800',    border: 'border-neutral-200 dark:border-neutral-700'  },
  rejected:                  { label: 'Rejected',                  dot: 'bg-error-500',    text: 'text-error-700 dark:text-error-400',      bg: 'bg-error-50 dark:bg-error-950/20',      border: 'border-error-200 dark:border-error-800'      },
};

const COMPLIANCE_BADGE: Record<string, { text: string; dot: string; textCls: string }> = {
  Approved:  { text: 'Approved',  dot: 'bg-success-500', textCls: 'text-success-700 dark:text-success-400' },
  Certified: { text: 'Certified', dot: 'bg-success-500', textCls: 'text-success-700 dark:text-success-400' },
  Pending:   { text: 'Pending',   dot: 'bg-amber-500',   textCls: 'text-amber-700 dark:text-amber-400'     },
  Expired:   { text: 'Expired',   dot: 'bg-error-500',   textCls: 'text-error-700 dark:text-error-400'     },
  'N/A':     { text: 'N/A',       dot: 'bg-neutral-400', textCls: 'text-neutral-500 dark:text-neutral-400' },
};

const ORG_ROLE_TO_HSS_ROLE: Record<string, string> = {
  'Volunteer':      'Shakha Operations',
  'Member':         'Adult Member',
  'Teen Member':    'Teen Member',
  'Youth Member':   'Teen Member',
  'Shakha Teacher': 'Shakha Operations',
  'Shakha Admin':   'Shakha Admin',
  'Child Member':   'Adult Member',
  'Senior Member':  'Adult Member',
};

const QUALIFIED_FIRST_AIDER_ROLES = new Set([
  'Super Admin',
  'Member',
  'Adult Member',
  'Teen',
  'Teen Member',
  'Shakha Admin',
  'Nagar Admin',
  'Vibhaag Admin',
  'Kendriya Admin',
]);

function canAccessQualifiedFirstAider(selectedRole: string) {
  return QUALIFIED_FIRST_AIDER_ROLES.has(selectedRole);
}

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

function RoleText({ role }: { role: string }) {
  return (
    <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
      {role}
    </span>
  );
}

function ComplianceBadge({ status }: { status: string }) {
  const cfg = COMPLIANCE_BADGE[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-xs font-medium ${cfg.textCls}`}>{cfg.text}</span>
    </span>
  );
}

// â"€â"€ Status confirmation modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function StatusConfirmModal({
  isOpen, member, action, isLoading, onClose, onConfirm,
}: {
  isOpen: boolean;
  member: Member | null;
  action: ModalAction;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen || !member) return null;

  const config = {
    deactivate: {
      title: 'Confirm Deactivation',
      body: 'Are you sure you want to deactivate this member?',
      btn: 'Confirm Deactivation',
      btnCls: 'bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-neutral-100 text-white dark:text-neutral-900',
    },
    reactivate: {
      title: 'Confirm Reactivation',
      body: 'Are you sure you want to reactivate this member?',
      btn: 'Confirm Reactivation',
      btnCls: 'bg-[#4EAE33] hover:bg-[#3d8928] text-white',
    },
    reject: {
      title: 'Reject Member',
      body: `Reject ${member.name}'s membership application? This cannot be undone easily.`,
      btn: 'Reject',
      btnCls: 'bg-[#BC0F1C] hover:bg-[#9a0c17] text-white',
    },
  }[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6">
        <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-2">{config.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{config.body}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-6">Member: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.name}</span></p>
        <div className="flex justify-end gap-3">
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
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${config.btnCls}`}
          >
            {isLoading ? 'Processing...' : config.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

// â"€â"€ Delete confirmation modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function DeleteConfirmModal({
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
          <div className="w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-error-600" />
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">Confirm Deletion</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to delete this member?</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Member: <span className="font-medium text-neutral-700 dark:text-neutral-300">{member.name}</span> ({member.id})
            </p>
            <p className="text-xs text-[#9a0c17] dark:text-[#f87171] mt-2 font-medium">This action cannot be undone.</p>
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
            className="px-4 py-2 text-sm rounded-lg font-medium bg-[#BC0F1C] hover:bg-[#9a0c17] text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Confirm Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}

// â"€â"€ Add Member Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

interface AddMemberForm {
  memberType: MemberType | '';
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  email: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  buildingName: string;
  addressLine1: string;
  addressLine2: string;
  contactTownCity: string;
  postCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactRelationship: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  medicalInfoDeclared: boolean;
  medicalInfoDetails: string;
  isFirstAider: boolean;
  firstAidQualificationLevel: '' | FirstAidQualification;
  firstAidQualificationExpiryDate: string;
  dietaryRequirements: DietaryRequirement[];
  occupation: string;
  originatingStateIndia: string;
  dbsStatus: string;
  dbsRef: string;
  dbsCertificateNumber: string;
  dbsCertificateDate: string;
  dbsCertificateReceivedFrom: string;
  dbsCertificateReceivedFromOther: string;
  dbsUpdateService: 'yes' | 'no';
  dbsUpdateServiceNumber: string;
  dbsUpdateServiceCheckDate: string;
  dbsAppUnderProcess: 'yes' | 'no';
  dbsCheckedBy: string;
  firstAidStatus: string;
  firstAidRef: string;
  safeguardingStatus: string;
  safeguardingRef: string;
  safeguardingExpiry: string;
}

const EMPTY_FORM: AddMemberForm = {
  memberType: '',
  firstName: '', middleName: '', lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '', secondaryEmail: '', phone: '', secondaryPhone: '',
  buildingName: '', addressLine1: '', addressLine2: '', contactTownCity: '', postCode: '',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactEmail: '', emergencyContactRelationship: '',
  country: '', region: '', town: '', activityCentre: '',
  guardianName: '', guardianPhone: '', guardianEmail: '', guardianRelationship: '',
  medicalInfoDeclared: false, medicalInfoDetails: '', isFirstAider: false,
  firstAidQualificationLevel: '', firstAidQualificationExpiryDate: '',
  dietaryRequirements: [], occupation: '', originatingStateIndia: '',
  dbsStatus: 'Pending',
  dbsRef: '', dbsCertificateNumber: '', dbsCertificateDate: '',
  dbsCertificateReceivedFrom: '', dbsCertificateReceivedFromOther: '',
  dbsUpdateService: 'no', dbsUpdateServiceNumber: '', dbsUpdateServiceCheckDate: '',
  dbsAppUnderProcess: 'no', dbsCheckedBy: '',
  firstAidStatus: 'Expired', firstAidRef: '',
  safeguardingStatus: 'Expired', safeguardingRef: '', safeguardingExpiry: '',
};

function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  existingMembers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  existingMembers: Member[];
}) {
  const { selectedRole } = useRoleScope();
  const canEditQualifiedFirstAider = canAccessQualifiedFirstAider(selectedRole);
  const [form, setForm] = useState<AddMemberForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddMemberForm, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const calcAge = form.dateOfBirth ? getAge(form.dateOfBirth) : null;

  const regionOptions = form.country ? (MASTERS_CASCADE.regions[form.country] ?? []) : [];
  const townOptions   = form.region  ? (MASTERS_CASCADE.towns[form.region]     ?? []) : [];
  const centreOptions = form.town    ? (MASTERS_CASCADE.centres[form.town]      ?? []) : [];

  const set = (key: keyof AddMemberForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: val };
        if (key === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
        if (key === 'region')  { next.town = ''; next.activityCentre = ''; }
        if (key === 'town')    { next.activityCentre = ''; }
        return next;
      });
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const setBoolean = (key: 'medicalInfoDeclared' | 'isFirstAider') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({
        ...prev,
        [key]: e.target.checked,
        ...(key === 'isFirstAider' && !e.target.checked
          ? { firstAidQualificationLevel: '', firstAidQualificationExpiryDate: '' }
          : {}),
      }));
    };

  const toggleDietaryRequirement = (value: DietaryRequirement) => {
    setForm(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(value)
        ? prev.dietaryRequirements.filter(item => item !== value)
        : [...prev.dietaryRequirements, value],
    }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof AddMemberForm, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'This field is required.';
    if (!form.lastName.trim())  e.lastName  = 'This field is required.';
    if (!form.dateOfBirth)    e.dateOfBirth = 'This field is required.';
    if (!form.gender)         e.gender = 'This field is required.';
    if (!form.email.trim())   e.email = 'This field is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.secondaryEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.secondaryEmail)) e.secondaryEmail = 'Enter a valid email address.';
    if (!form.phone.trim())   e.phone = 'This field is required.';
    if (!form.addressLine1.trim()) e.addressLine1 = 'This field is required.';
    if (!form.contactTownCity.trim()) e.contactTownCity = 'This field is required.';
    if (!form.postCode.trim()) e.postCode = 'This field is required.';
    if (!form.emergencyContactName.trim()) e.emergencyContactName = 'This field is required.';
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = 'This field is required.';
    if (!form.emergencyContactEmail.trim()) e.emergencyContactEmail = 'This field is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.emergencyContactEmail)) e.emergencyContactEmail = 'Enter a valid email address.';
    if (!form.emergencyContactRelationship.trim()) e.emergencyContactRelationship = 'This field is required.';
    if (!form.country)        e.country = 'This field is required.';
    if (!form.region)         e.region  = 'This field is required.';
    if (!form.town)           e.town    = 'This field is required.';
    if (!form.activityCentre) e.activityCentre = 'This field is required.';
    const derivedMemberType = form.dateOfBirth ? getMemberTypeFromAge(form.dateOfBirth) : '';
    if (derivedMemberType === 'teen' && !form.guardianName.trim())
      e.guardianName = 'Parent / guardian name is required.';
    if (derivedMemberType === 'teen' && !form.guardianPhone.trim())
      e.guardianPhone = 'Parent / guardian phone is required.';
    if (derivedMemberType === 'teen' && !form.guardianEmail.trim())
      e.guardianEmail = 'Parent / guardian email is required.';
    else if (form.guardianEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.guardianEmail))
      e.guardianEmail = 'Enter a valid email address.';
    if (derivedMemberType === 'teen' && !form.guardianRelationship.trim())
      e.guardianRelationship = 'Parent / guardian relationship is required.';
    if (existingMembers.some(m => m.email.toLowerCase() === form.email.toLowerCase()))
      e.email = 'A member with this email already exists.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const nextId = `MBR-${String(existingMembers.length + 1).padStart(3, '0')}`;
    const derivedMemberType = getMemberTypeFromAge(form.dateOfBirth);
    const newMember: Member = {
      id: nextId,
      memberType: derivedMemberType,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      surname: form.lastName.trim(),
      name: [form.firstName, form.middleName, form.lastName].map(p => p.trim()).filter(Boolean).join(' '),
      email: form.email.trim(),
      secondaryEmail: form.secondaryEmail.trim() || undefined,
      phone: form.phone.trim() || undefined,
      secondaryPhone: form.secondaryPhone.trim() || undefined,
      guardianEmail: form.guardianEmail.trim() || undefined,
      guardianName: form.guardianName.trim() || undefined,
      guardianPhone: form.guardianPhone.trim() || undefined,
      guardianRelationship: form.guardianRelationship.trim() || undefined,
      buildingName: form.buildingName.trim() || undefined,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      contactTownCity: form.contactTownCity.trim(),
      postCode: form.postCode.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
      emergencyContactEmail: form.emergencyContactEmail.trim(),
      emergencyContactRelationship: form.emergencyContactRelationship.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender as 'male' | 'female',
      jobTitle: ROLE_TYPE_OPTIONS[0],
      orgRole: derivedMemberType === 'adult' ? 'Member' : derivedMemberType === 'teen' ? 'Teen Member' : 'Child Member',
      country: form.country,
      region: form.region,
      town: form.town,
      activityCentre: form.activityCentre,
      status: derivedMemberType === 'teen' || derivedMemberType === 'child' ? 'pending-parental-consent' : 'pending',
      registrationDate: new Date().toISOString(),
      compliance: {
        dbs: form.dbsStatus,
        firstAid: form.firstAidStatus,
        safeguardingTraining: form.safeguardingStatus,
        parentalConsent: derivedMemberType === 'teen' || derivedMemberType === 'child' ? 'pending' : 'n/a',
      },
      dbsRef: form.dbsRef.trim() || undefined,
      dbsCertificateNumber: form.dbsCertificateNumber.trim() || undefined,
      dbsCertificateDate: form.dbsCertificateDate || undefined,
      dbsCertificateReceivedFrom: form.dbsCertificateReceivedFrom.trim() || undefined,
      dbsCertificateReceivedFromOther: form.dbsCertificateReceivedFromOther.trim() || undefined,
      dbsUpdateService: form.dbsUpdateService === 'yes',
      dbsUpdateServiceNumber: form.dbsUpdateServiceNumber.trim() || undefined,
      dbsUpdateServiceCheckDate: form.dbsUpdateServiceCheckDate || undefined,
      dbsAppUnderProcess: form.dbsAppUnderProcess === 'yes',
      dbsCheckedBy: form.dbsCheckedBy.trim() || undefined,
      firstAidRef: form.firstAidRef.trim() || undefined,
      safeguardingRef: form.safeguardingRef.trim() || undefined,
      safeguardingExpiry: form.safeguardingExpiry || undefined,
      medicalInfoDeclared: form.medicalInfoDeclared,
      medicalInfoDetails: form.medicalInfoDetails.trim() || undefined,
      isFirstAider: canEditQualifiedFirstAider ? form.isFirstAider : false,
      firstAidQualificationLevel: canEditQualifiedFirstAider && form.isFirstAider
        ? form.firstAidQualificationLevel || undefined
        : undefined,
      firstAidQualificationExpiryDate: canEditQualifiedFirstAider && form.isFirstAider
        ? form.firstAidQualificationExpiryDate || undefined
        : undefined,
      dietaryRequirements: form.dietaryRequirements,
      occupation: form.occupation.trim() || undefined,
      originatingStateIndia: form.originatingStateIndia.trim() || undefined,
      eventsAttended: 0,
      shakhaSessionsAttended: 0,
    };
    setIsSaving(false);
    onSave(newMember);
    setForm(EMPTY_FORM);
    setErrors({});
    toast.success('Member created successfully.');
  };

  const handleClose = () => {
    if (!isSaving) { setForm(EMPTY_FORM); setErrors({}); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Add Member" maxWidth="max-w-2xl">
      <div className="space-y-6 p-6 max-h-[72vh] overflow-y-auto slim-scroll">

        {/* Age Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField className="md:col-span-2">
            <FormLabel>Age Groups (years old)</FormLabel>
            <FormInput value={form.dateOfBirth ? getAgeGroupLabel(form.dateOfBirth) : 'Select date of birth first'} readOnly />
          </FormField>
        </div>

        {/* Personal Details */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Personal Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>First Name</FormLabel>
              <FormInput value={form.firstName} onChange={set('firstName')} placeholder="First name" />
              {errors.firstName && <p className="text-xs text-error-600 mt-1">{errors.firstName}</p>}
            </FormField>
            <FormField>
              <FormLabel>Middle Name</FormLabel>
              <FormInput value={form.middleName} onChange={set('middleName')} placeholder="Middle name" />
            </FormField>
            <FormField>
              <FormLabel required>Last Name</FormLabel>
              <FormInput value={form.lastName} onChange={set('lastName')} placeholder="Last name" />
              {errors.lastName && <p className="text-xs text-error-600 mt-1">{errors.lastName}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Date of Birth</FormLabel>
              <FormInput type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              {errors.dateOfBirth && <p className="text-xs text-error-600 mt-1">{errors.dateOfBirth}</p>}
              {calcAge !== null && (
                <p className="text-xs text-neutral-500 mt-1">Age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} years</span></p>
              )}
            </FormField>
            <FormField>
              <FormLabel required>Gender</FormLabel>
              <FormSelect value={form.gender} onChange={set('gender')}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </FormSelect>
              {errors.gender && <p className="text-xs text-error-600 mt-1">{errors.gender}</p>}
            </FormField>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Contact Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Primary Email Address</FormLabel>
              <FormInput type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
              {errors.email && <p className="text-xs text-error-600 mt-1">{errors.email}</p>}
            </FormField>
            <FormField>
              <FormLabel>Secondary Email Address</FormLabel>
              <FormInput type="email" value={form.secondaryEmail} onChange={set('secondaryEmail')} placeholder="secondary@example.com" />
              {errors.secondaryEmail && <p className="text-xs text-error-600 mt-1">{errors.secondaryEmail}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Primary Contact Number</FormLabel>
              <FormInput type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 7700 000000" />
              {errors.phone && <p className="text-xs text-error-600 mt-1">{errors.phone}</p>}
            </FormField>
            <FormField>
              <FormLabel>Secondary Contact Number</FormLabel>
              <FormInput type="tel" value={form.secondaryPhone} onChange={set('secondaryPhone')} placeholder="+44 7700 000001" />
            </FormField>
            <FormField>
              <FormLabel>Building Name</FormLabel>
              <FormInput value={form.buildingName} onChange={set('buildingName')} placeholder="Building name" />
            </FormField>
            <FormField>
              <FormLabel required>Address Line</FormLabel>
              <FormInput value={form.addressLine1} onChange={set('addressLine1')} placeholder="Address line" />
              {errors.addressLine1 && <p className="text-xs text-error-600 mt-1">{errors.addressLine1}</p>}
            </FormField>
            <FormField>
              <FormLabel>Address Line 2</FormLabel>
              <FormInput value={form.addressLine2} onChange={set('addressLine2')} placeholder="Address line 2" />
            </FormField>
            <FormField>
              <FormLabel required>Town / City</FormLabel>
              <FormInput value={form.contactTownCity} onChange={set('contactTownCity')} placeholder="Town / City" />
              {errors.contactTownCity && <p className="text-xs text-error-600 mt-1">{errors.contactTownCity}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Post Code</FormLabel>
              <FormInput value={form.postCode} onChange={set('postCode')} placeholder="Post code" />
              {errors.postCode && <p className="text-xs text-error-600 mt-1">{errors.postCode}</p>}
            </FormField>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Emergency Contact</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Contact Name</FormLabel>
              <FormInput value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="Emergency contact name" />
              {errors.emergencyContactName && <p className="text-xs text-error-600 mt-1">{errors.emergencyContactName}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Contact Phone Number</FormLabel>
              <FormInput type="tel" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} placeholder="+44 7700 000000" />
              {errors.emergencyContactPhone && <p className="text-xs text-error-600 mt-1">{errors.emergencyContactPhone}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Contact Email</FormLabel>
              <FormInput type="email" value={form.emergencyContactEmail} onChange={set('emergencyContactEmail')} placeholder="emergency@example.com" />
              {errors.emergencyContactEmail && <p className="text-xs text-error-600 mt-1">{errors.emergencyContactEmail}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Contact Relationship</FormLabel>
              <FormInput value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} placeholder="Relationship" />
              {errors.emergencyContactRelationship && <p className="text-xs text-error-600 mt-1">{errors.emergencyContactRelationship}</p>}
            </FormField>
          </div>
        </div>

        {/* Guardian Information (Teen only - Child exempt per B3) */}
        {form.dateOfBirth && getMemberTypeFromAge(form.dateOfBirth) === 'teen' && (
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Parent / Guardian Approval Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>Parent / Guardian Name</FormLabel>
                <FormInput value={form.guardianName} onChange={set('guardianName')} placeholder="Guardian name" />
                {errors.guardianName && <p className="text-xs text-error-600 mt-1">{errors.guardianName}</p>}
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Phone Number</FormLabel>
                <FormInput type="tel" value={form.guardianPhone} onChange={set('guardianPhone')} placeholder="+44 7700 000000" />
                {errors.guardianPhone && <p className="text-xs text-error-600 mt-1">{errors.guardianPhone}</p>}
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Email</FormLabel>
                <FormInput type="email" value={form.guardianEmail} onChange={set('guardianEmail')} placeholder="guardian@example.com" />
                {errors.guardianEmail && <p className="text-xs text-error-600 mt-1">{errors.guardianEmail}</p>}
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Relationship</FormLabel>
                <FormInput value={form.guardianRelationship} onChange={set('guardianRelationship')} placeholder="Relationship" />
                {errors.guardianRelationship && <p className="text-xs text-error-600 mt-1">{errors.guardianRelationship}</p>}
              </FormField>
            </div>
          </div>
        )}

        {/* Other Information */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Other Information</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" checked={form.medicalInfoDeclared} onChange={setBoolean('medicalInfoDeclared')} className="w-4 h-4 accent-primary-600" />
                Medical information declared
              </label>
              <FormField className="md:col-span-2">
                <FormLabel>Medical Information Details</FormLabel>
                <FormTextarea rows={3} value={form.medicalInfoDetails} onChange={set('medicalInfoDetails')} placeholder="Allergies or medical details" />
              </FormField>
              {canEditQualifiedFirstAider && (
                <>
                  <label className="md:col-span-2 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input type="checkbox" checked={form.isFirstAider} onChange={setBoolean('isFirstAider')} className="w-4 h-4 accent-primary-600" />
                    Are you a qualified First Aider
                  </label>
                  {form.isFirstAider && (
                    <>
                      <FormField>
                        <FormLabel>Level of qualification</FormLabel>
                        <FormSelect value={form.firstAidQualificationLevel} onChange={set('firstAidQualificationLevel')}>
                          <option value="">Select qualification</option>
                          {FIRST_AID_QUALIFICATION_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </FormSelect>
                      </FormField>
                      <FormField>
                        <FormLabel>Qualification expiry date</FormLabel>
                        <FormInput type="date" value={form.firstAidQualificationExpiryDate} onChange={set('firstAidQualificationExpiryDate')} />
                      </FormField>
                    </>
                  )}
                </>
              )}
              <FormField>
                <FormLabel>Occupation</FormLabel>
                <FormInput value={form.occupation} onChange={set('occupation')} placeholder="Occupation" />
              </FormField>
              <FormField>
                <FormLabel>Originating State in India</FormLabel>
                <FormInput value={form.originatingStateIndia} onChange={set('originatingStateIndia')} placeholder="State" />
              </FormField>
            </div>
            <div>
              <FormLabel>Special Dietary Requirements</FormLabel>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIETARY_REQUIREMENTS.map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input type="checkbox" checked={form.dietaryRequirements.includes(item)} onChange={() => toggleDietaryRequirement(item)} className="w-4 h-4 accent-primary-600" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Masters Mapping */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Masters Mapping</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Country / Organisation</FormLabel>
              <FormSelect value={form.country} onChange={set('country')}>
                <option value="">Select country</option>
                {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
              {errors.country && <p className="text-xs text-error-600 mt-1">{errors.country}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Vibhag (Region)</FormLabel>
              <FormSelect value={form.region} onChange={set('region')} disabled={!form.country}>
                <option value="">{form.country ? 'Select region' : 'Select country first'}</option>
                {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </FormSelect>
              {errors.region && <p className="text-xs text-error-600 mt-1">{errors.region}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Nagar (Town)</FormLabel>
              <FormSelect value={form.town} onChange={set('town')} disabled={!form.region}>
                <option value="">{form.region ? 'Select town' : 'Select region first'}</option>
                {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
              {errors.town && <p className="text-xs text-error-600 mt-1">{errors.town}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Shakha (Branch)</FormLabel>
              <FormSelect value={form.activityCentre} onChange={set('activityCentre')} disabled={!form.town}>
                <option value="">{form.town ? 'Select shakha' : 'Select town first'}</option>
                {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
              {errors.activityCentre && <p className="text-xs text-error-600 mt-1">{errors.activityCentre}</p>}
            </FormField>
          </div>
        </div>

        {/* Compliance */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Compliance - DBS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel>DBS Status</FormLabel>
              <FormSelect value={form.dbsStatus} onChange={set('dbsStatus')}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>DBS Reference Number</FormLabel>
              <FormInput value={form.dbsRef} onChange={set('dbsRef')} placeholder="e.g. DBS-2024-001" />
            </FormField>
            <FormField>
              <FormLabel>DBS Certificate Number</FormLabel>
              <FormInput value={form.dbsCertificateNumber} onChange={set('dbsCertificateNumber')} placeholder="e.g. 001234567890" />
            </FormField>
            <FormField>
              <FormLabel>DBS Certificate Date</FormLabel>
              <FormInput type="date" value={form.dbsCertificateDate} onChange={set('dbsCertificateDate')} />
            </FormField>
            <FormField>
              <FormLabel>Certificate Received From</FormLabel>
              <FormInput value={form.dbsCertificateReceivedFrom} onChange={set('dbsCertificateReceivedFrom')} placeholder="e.g. Disclosure Scotland" />
            </FormField>
            <FormField>
              <FormLabel>Other Source</FormLabel>
              <FormInput value={form.dbsCertificateReceivedFromOther} onChange={set('dbsCertificateReceivedFromOther')} placeholder="If received from other source" />
            </FormField>
            <FormField>
              <FormLabel>Enrolled in DBS Update Service</FormLabel>
              <FormSelect value={form.dbsUpdateService} onChange={set('dbsUpdateService')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </FormSelect>
            </FormField>
            {form.dbsUpdateService === 'yes' && (
              <>
                <FormField>
                  <FormLabel>DBS Update Service Number</FormLabel>
                  <FormInput value={form.dbsUpdateServiceNumber} onChange={set('dbsUpdateServiceNumber')} placeholder="e.g. US-2024-00456" />
                </FormField>
                <FormField>
                  <FormLabel>Last Update Service Check Date</FormLabel>
                  <FormInput type="date" value={form.dbsUpdateServiceCheckDate} onChange={set('dbsUpdateServiceCheckDate')} />
                </FormField>
              </>
            )}
            <FormField>
              <FormLabel>DBS Application Under Process</FormLabel>
              <FormSelect value={form.dbsAppUnderProcess} onChange={set('dbsAppUnderProcess')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>Verified By</FormLabel>
              <FormInput value={form.dbsCheckedBy} onChange={set('dbsCheckedBy')} placeholder="e.g. Ramesh Patel (Karyawaha)" />
            </FormField>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Compliance - First Aid</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel>First Aid Status</FormLabel>
              <FormSelect value={form.firstAidStatus} onChange={set('firstAidStatus')}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>First Aid Reference Number</FormLabel>
              <FormInput value={form.firstAidRef} onChange={set('firstAidRef')} placeholder="e.g. FA-2024-001" />
            </FormField>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Compliance - Safeguarding</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel>Safeguarding Status</FormLabel>
              <FormSelect value={form.safeguardingStatus} onChange={set('safeguardingStatus')}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>Safeguarding Reference Number</FormLabel>
              <FormInput value={form.safeguardingRef} onChange={set('safeguardingRef')} placeholder="e.g. SG-2024-042" />
            </FormField>
            <FormField>
              <FormLabel>Safeguarding Expiry Date</FormLabel>
              <FormInput type="date" value={form.safeguardingExpiry} onChange={set('safeguardingExpiry')} />
            </FormField>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </PrimaryButton>
      </div>
    </FormModal>
  );
}

// â"€â"€ Bulk Upload Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type BulkUploadStep = 'upload' | 'results';

interface BulkUploadError {
  row: number;
  field: string;
  message: string;
}

function BulkUploadModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
}) {
  const [step, setStep] = useState<BulkUploadStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [validRows, setValidRows] = useState(0);
  const [errors, setErrors] = useState<BulkUploadError[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const REQUIRED_COLUMNS = ['First name', 'Last name', 'DOB', 'Email id', 'Phone number'];

  const simulateValidation = (name: string) => {
    setFileName(name);
    setIsProcessing(true);
    setTimeout(() => {
      const total = Math.floor(Math.random() * 8) + 3;
      const mockErrors: BulkUploadError[] = [
        { row: 2, field: 'Email id',     message: 'Invalid email format.' },
        { row: 5, field: 'DOB',          message: 'Date of Birth is required.' },
        { row: 7, field: 'Phone number', message: 'Phone number is required.' },
      ].slice(0, Math.min(3, Math.floor(total * 0.3)));
      setTotalRows(total);
      setValidRows(total - mockErrors.length);
      setErrors(mockErrors);
      setIsProcessing(false);
      setStep('results');
    }, 1200);
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file.');
      return;
    }
    simulateValidation(file.name);
  };

  const handleConfirm = async () => {
    if (validRows === 0) { toast.error('No valid rows to upload.'); return; }
    setIsConfirming(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsConfirming(false);
    onConfirm(validRows);
    handleClose();
  };

  const handleClose = () => {
    if (!isProcessing && !isConfirming) {
      setStep('upload');
      setFileName('');
      setTotalRows(0);
      setValidRows(0);
      setErrors([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Members" maxWidth="max-w-2xl">
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto slim-scroll">

        {/* Required Columns */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">Required Columns</p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_COLUMNS.map(col => (
              <span key={col} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400">
                <CheckCircle2 className="w-3 h-3 text-[#4EAE33]" />
                {col}
              </span>
            ))}
          </div>
        </div>

        {step === 'upload' && (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
              }`}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              <FileUp className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {isProcessing ? 'Processing file...' : 'Drop your CSV file here, or click to browse'}
              </p>
              <p className="text-xs text-neutral-400">CSV files only. Max 500 rows per upload.</p>
            </div>
          </>
        )}

        {step === 'results' && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Rows',    value: totalRows, cls: 'text-neutral-900 dark:text-white' },
                { label: 'Valid Rows',    value: validRows, cls: 'text-[#3d8928]' },
                { label: 'Error Rows',   value: errors.length, cls: errors.length > 0 ? 'text-error-600' : 'text-neutral-900 dark:text-white' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              File: <span className="font-medium text-neutral-700 dark:text-neutral-300">{fileName}</span>
            </p>

            {/* Row-level errors */}
            {errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-error-600 uppercase tracking-wider mb-2">Row-level errors</p>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Row</th>
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Field</th>
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {errors.map((err, i) => (
                        <tr key={i} className="bg-white dark:bg-neutral-950">
                          <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{err.row}</td>
                          <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{err.field}</td>
                          <td className="px-3 py-2 text-error-600 dark:text-[#f87171]">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {validRows === 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#fff0f0] border border-[#ffaaab] rounded-lg">
                <AlertTriangle className="w-4 h-4 text-error-600 flex-shrink-0" />
                <p className="text-xs text-[#9a0c17]">No valid rows found. Please correct the errors and re-upload.</p>
              </div>
            )}

            <button
              onClick={() => { setStep('upload'); setFileName(''); }}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              â† Upload a different file
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
        <button
          onClick={handleClose}
          disabled={isProcessing || isConfirming}
          className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {step === 'upload' && (
          <PrimaryButton icon={Upload} onClick={() => fileRef.current?.click()} disabled={isProcessing}>
            Upload CSV
          </PrimaryButton>
        )}
        {step === 'results' && (
          <PrimaryButton onClick={handleConfirm} disabled={isConfirming || validRows === 0} isLoading={isConfirming}>
            {isConfirming ? 'Uploading...' : 'Confirm Bulk Upload'}
          </PrimaryButton>
        )}
      </div>
    </FormModal>
  );
}

// â"€â"€ Main component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function MemberManagement({
  initialMemberId,
  onConsumeInitialMember,
  karyakartasOnly = false,
  initialMemberTab,
}: {
  initialMemberId?: string | null;
  onConsumeInitialMember?: () => void;
  karyakartasOnly?: boolean;
  initialMemberTab?: string;
} = {}) {
  // â"€â"€ Role scope & permissions â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const { scope, selectedRole } = useRoleScope();
  const isSuperAdmin = selectedRole === 'Super Admin';
  const mp = useModulePermissions('members');
  const scopedFilterOptions = getScopedFilterOptions(scope);

  // Base member list scoped to role's level
  const [members, setMembers] = useState<Member[]>(() => filterByScope(mockMembers, scope));
  const [transferVersion, setTransferVersion] = useState(0);

  // Re-scope when role switches (scope comes from context which updates on role change)
  const scopedMembers = useMemo(() => filterByScope(mockMembers, scope), [scope, transferVersion]);

  const [viewMode, setViewMode] = useState<ViewMode>(
    TABLE_VIEW_DEFAULT_ROLES.includes(selectedRole) ? 'table' : 'grid'
  );
  const [pageState, setPageState] = useState<PageState>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [resolvedInitialTab] = useState<string | undefined>(initialMemberTab);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showKaryakartasOnly, setShowKaryakartasOnly] = useState(karyakartasOnly);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(false);

  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);

  // Registration date range filter
  const [regDateStart,  setRegDateStart]  = useState('');
  const [regDateEnd,    setRegDateEnd]    = useState('');
  const [regDateLabel,  setRegDateLabel]  = useState('');
  const [showRegDateFilter, setShowRegDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const [sortField, setSortField] = useState<string>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; member: Member | null; action: ModalAction; isLoading: boolean }>({
    isOpen: false, member: null, action: 'deactivate', isLoading: false,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; member: Member | null; isLoading: boolean }>({
    isOpen: false, member: null, isLoading: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const memberColumns: ColumnConfig[] = karyakartasOnly ? [
    { key: 'id',                  label: 'Member ID'           },
    { key: 'name',                label: 'Name'                },
    { key: 'memberType',          label: 'Age Category'        },
    { key: 'sanghResponsibility', label: 'Sangh Responsibility'},
    { key: 'registrationDate',    label: 'Since'               },
    { key: 'hssRoles',            label: 'My HSS Role'         },
    { key: 'status',              label: 'Member Status'       },
  ] : [
    { key: 'id',         label: 'Member ID'      },
    { key: 'name',       label: 'Name'           },
    { key: 'memberType', label: 'Age Category'   },
    { key: 'email',      label: 'Email Address'  },
    { key: 'phone',      label: 'Contact Number' },
    { key: 'status',     label: 'Member Status'  },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    karyakartasOnly
      ? { id: true, name: true, memberType: true, sanghResponsibility: true, registrationDate: true, hssRoles: true, status: true }
      : { id: true, name: true, memberType: true, email: true, phone: true, status: true }
  );

  // Navigate directly to a member detail when arriving from another module
  useEffect(() => {
    if (initialMemberId) {
      const member = members.find(m => m.id === initialMemberId);
      if (member) {
        setSelectedMember(member);
        setPageState('detail');
      }
      onConsumeInitialMember?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount - intentionally ignores prop changes after mount

  useEffect(() => { if (viewMode !== 'table') setShowColumnPanel(false); }, [viewMode]);

  useEffect(() => {
    setViewMode(TABLE_VIEW_DEFAULT_ROLES.includes(selectedRole) ? 'table' : 'grid');
  }, [selectedRole]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, regDateStart, regDateEnd, showKaryakartasOnly]);
  useEffect(() => {
    const refreshScope = () => setTransferVersion(version => version + 1);
    window.addEventListener(TRANSFER_CHANGE_EVENT, refreshScope);
    return () => window.removeEventListener(TRANSFER_CHANGE_EVENT, refreshScope);
  }, []);
  useEffect(() => {
    if (!selectedMember) return;
    const currentScopedMember = scopedMembers.find(member => member.id === selectedMember.id);
    if (!currentScopedMember) {
      setSelectedMember(null);
      setPageState('list');
      return;
    }
    if (
      currentScopedMember.status !== selectedMember.status ||
      currentScopedMember.activityCentre !== selectedMember.activityCentre
    ) {
      setSelectedMember(currentScopedMember);
    }
  }, [scopedMembers, selectedMember]);

  // â"€â"€ Filter & search â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedMembers.filter((m) => {
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.phone?.toLowerCase().includes(q) ?? false) ||
        (m.secondaryEmail?.toLowerCase().includes(q) ?? false) ||
        (m.guardianName?.toLowerCase().includes(q) ?? false) ||
        (m.guardianEmail?.toLowerCase().includes(q) ?? false) ||
        (m.emergencyContactName?.toLowerCase().includes(q) ?? false) ||
        (m.emergencyContactPhone?.toLowerCase().includes(q) ?? false);

      const matchesFilters = filters.every((f) => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Status':
            return f.values.some(v => {
              if (v === 'Active')                    return m.status === 'active';
              if (v === 'Pending Approval')          return m.status === 'pending';
              if (v === 'Pending Parental Consent')  return m.status === 'pending-parental-consent';
              if (v === 'Inactive')                  return m.status === 'inactive';
              if (v === 'Rejected')                  return m.status === 'rejected';
              return false;
            });
          case 'Age Groups (years old)':
            return f.values.some(v => v === getAgeGroupLabel(m.dateOfBirth));
          case 'Gender':
            return f.values.some(v => v.toLowerCase() === m.gender);
          case 'Country':
            return f.values.includes(m.country);
          case 'Vibhaag':
            return f.values.includes(m.region);
          case 'Nagar':
            return f.values.includes(m.town);
          case 'Shakha':
            return f.values.includes(m.activityCentre);
          case 'Responsibility':
            return f.values.includes(m.jobTitle);
          case 'DBS Status':
            return f.values.some(v => v.toLowerCase() === m.compliance.dbs.toLowerCase());
          case 'First Aid Status':
            return f.values.some(v => v.toLowerCase() === m.compliance.firstAid.toLowerCase());
          default:
            return true;
        }
      });

      const matchesRegDate = (() => {
        if (!regDateStart && !regDateEnd) return true;
        const regDate = new Date(m.registrationDate).toISOString().split('T')[0];
        if (regDateStart && regDate < regDateStart) return false;
        if (regDateEnd   && regDate > regDateEnd)   return false;
        return true;
      })();

      const matchesKaryakarta = !(showKaryakartasOnly || karyakartasOnly) || hasResponsibility(m);

      return matchesSearch && matchesFilters && matchesRegDate && matchesKaryakarta;
    });
  }, [scopedMembers, searchQuery, filters, regDateStart, regDateEnd, showKaryakartasOnly]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let aVal = (a as any)[sortField] ?? '';
      let bVal = (b as any)[sortField] ?? '';
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

  const handleExportCsv = () => {
    const data = selectedIds.size > 0 ? sortedMembers.filter(m => selectedIds.has(m.id)) : sortedMembers;
    if (!data.length) { toast.error('No data to export.'); return; }
    const csv = [
      'Membership ID,Name,Email,Phone,Status,Country,Vibhaag,Nagar,Shakha,Registration Date',
      ...data.map(m => `"${m.id}","${m.name}","${m.email}","${m.phone ?? ''}","${m.status}","${m.country}","${m.region}","${m.town}","${m.activityCentre}","${m.registrationDate}"`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${data.length} member${data.length > 1 ? 's' : ''}.`);
  };

  // â"€â"€ Summary counts â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const complianceAlerts = members.filter(
    m => m.compliance.dbs !== 'Approved' || m.compliance.firstAid !== 'Certified'
  ).length;

  const pendingCount = members.filter(
    m => m.status === 'pending' || m.status === 'pending-parental-consent'
  ).length;

  // â"€â"€ Handlers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-40 hover:opacity-100 text-neutral-400 transition-opacity" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />
      : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />;
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleViewDetails = (m: Member) => { setSelectedMember(m); setPageState('detail'); };
  const handleEdit = (m: Member) => { setSelectedMember(m); setPageState('edit'); };
  const handleBackToList = () => { setPageState('list'); setSelectedMember(null); };

  const openStatusModal = (m: Member, action: ModalAction) =>
    setStatusModal({ isOpen: true, member: m, action, isLoading: false });
  const openDeleteModal = (m: Member) =>
    setDeleteModal({ isOpen: true, member: m, isLoading: false });

  const confirmStatusChange = async () => {
    if (!statusModal.member) return;
    setStatusModal(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 600));

    const newStatus: MemberStatus =
      statusModal.action === 'reactivate' ? 'active'    :
      statusModal.action === 'reject'     ? 'rejected'  : 'inactive';

    setMembers(prev => prev.map(m => m.id === statusModal.member!.id ? { ...m, status: newStatus } : m));
    if (selectedMember?.id === statusModal.member.id) setSelectedMember(prev => prev ? { ...prev, status: newStatus } : prev);

    const msg =
      statusModal.action === 'reactivate' ? 'Member reactivated successfully.' :
      statusModal.action === 'reject'     ? 'Member has been rejected.'        :
      'Member deactivated successfully.';
    toast.success(msg);
    setStatusModal({ isOpen: false, member: null, action: 'deactivate', isLoading: false });
  };

  const confirmDelete = async () => {
    if (!deleteModal.member) return;
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 600));
    const deletedId = deleteModal.member.id;
    setMembers(prev => prev.filter(m => m.id !== deletedId));
    if (selectedMember?.id === deletedId) handleBackToList();
    toast.success('Member deleted successfully.');
    setDeleteModal({ isOpen: false, member: null, isLoading: false });
  };


  // â"€â"€ Row action items â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const getRowMenuItems = (m: Member) => {
    const items: any[] = [
      { icon: Eye, label: 'View', onClick: () => handleViewDetails(m) },
    ];
    if (mp.canEdit)   items.push({ icon: Edit, label: 'Edit', onClick: () => handleEdit(m) });
    if (mp.canEdit) {
      items.push(m.status === 'active'
        ? { icon: ToggleLeft,  label: 'Deactivate', onClick: () => openStatusModal(m, 'deactivate') }
        : { icon: ToggleRight, label: 'Reactivate',  onClick: () => openStatusModal(m, 'reactivate') });
    }

    if (mp.canDelete) items.push({ icon: Trash2, label: 'Delete', onClick: () => openDeleteModal(m) });
    return items;
  };

  // â"€â"€ Sub-page rendering â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  if (pageState === 'detail' && selectedMember) {
    return (
      <>
        <MemberDetail
          member={selectedMember}
          onBack={handleBackToList}
          onEdit={() => handleEdit(selectedMember)}
          onStatusChange={(action) => openStatusModal(selectedMember, action)}
          onDelete={() => openDeleteModal(selectedMember)}
          initialTab={resolvedInitialTab as any}
        />
        <StatusConfirmModal
          isOpen={statusModal.isOpen}
          member={statusModal.member}
          action={statusModal.action}
          isLoading={statusModal.isLoading}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          onConfirm={confirmStatusChange}
        />
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          member={deleteModal.member}
          isLoading={deleteModal.isLoading}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={confirmDelete}
        />
      </>
    );
  }

  if (pageState === 'edit' && selectedMember) {
    return (
      <MemberEdit
        member={selectedMember}
        onBack={() => setPageState('detail')}
        onSave={(updated) => {
          setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
          setSelectedMember(updated);
          setPageState('detail');
          toast.success('Member updated successfully.');
        }}
      />
    );
  }

  // â"€â"€ Empty state â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const EmptyState = () => (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <Search className="w-6 h-6 text-neutral-400" />
        </div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No records found.</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters</p>
      </div>
    </div>
  );

  // â"€â"€ Listing â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <PageHeader
          title={karyakartasOnly ? 'Roles and Responsibility' : 'Members'}
          subtitle={isSuperAdmin ? (karyakartasOnly ? 'Below is a list of all current members that have a Sangh Responsibility and/or a MyHSS Role' : 'Below is a list of all members for your Shakha / Nagar / Vibhag') : undefined}
          breadcrumbs={karyakartasOnly ? [
            { label: 'Members', href: '#' },
            { label: 'Roles and Responsibility', current: true },
          ] : [
            { label: 'Members Management', href: '#' },
            { label: 'Members', current: true },
          ]}
        >
          <div className="relative" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by name, email, phone or ID..."
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={{
                'Status':            MEMBER_FILTER_OPTIONS['Status'],
                'Age Groups (years old)': MEMBER_FILTER_OPTIONS['Age Groups (years old)'],
                'Gender':            MEMBER_FILTER_OPTIONS['Gender'],
                'Responsibility':    MEMBER_FILTER_OPTIONS['Responsibility'],
                ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries } : {}),
                ...(scope.showRegionFilter   ? { 'Vibhaag':         scopedFilterOptions.regionOptions } : {}),
                ...(scope.showTownFilter     ? { 'Nagar':           scopedFilterOptions.townOptions }   : {}),
                ...(scope.showCentreFilter   ? { 'Shakha':          scopedFilterOptions.centreOptions } : {}),
                'DBS Status':        MEMBER_FILTER_OPTIONS['DBS Status'],
                'First Aid Status':  MEMBER_FILTER_OPTIONS['First Aid Status'],
              }}
              title="Filter Members"
            />
            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={memberColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={(key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
              anchorRef={columnAnchorRef}
            />
          </div>

          {/* Registration date range filter - hidden on Roles and Responsibility view */}
          {!karyakartasOnly && (
            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowRegDateFilter(p => !p)}
                title="Filter by Registration Date"
                className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  regDateStart
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {regDateStart ? (regDateLabel || `${regDateStart} - ${regDateEnd}`) : 'Reg. Date'}
                {regDateStart && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); setRegDateStart(''); setRegDateEnd(''); setRegDateLabel(''); }}
                    className="ml-0.5 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
              <DateRangeFilter
                isOpen={showRegDateFilter}
                onClose={() => setShowRegDateFilter(false)}
                startDate={regDateStart}
                endDate={regDateEnd}
                onApply={(start, end, label) => {
                  setRegDateStart(start);
                  setRegDateEnd(end);
                  setRegDateLabel(label || '');
                }}
                title="Registration Date Range"
              />
            </div>
          )}

          {mp.canAdd && !karyakartasOnly && (
            <PrimaryButton icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Member
            </PrimaryButton>
          )}
          {mp.canAdd && <IconButton icon={Upload} onClick={() => setShowBulkModal(true)} title="Bulk Upload" />}
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

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Member Summary"
            widgets={[
              { label: 'Total Members',     value: members.length,                                  icon: 'Users' },
              { label: 'Active',            value: members.filter(m => m.status === 'active').length, icon: 'CheckCircle' },
              { label: 'Pending Approval',  value: pendingCount,                                    icon: 'Clock' },
              { label: 'Compliance Alerts', value: complianceAlerts,                                icon: 'AlertTriangle' },
            ]}
          />
        )}

        {/* â"€â"€ LIST VIEW â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedMembers.length > 0 ? paginatedMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => handleViewDetails(m)}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer shadow-sm ${
                  selectedIds.has(m.id) ? 'border-primary-300 dark:border-primary-600' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {!isSuperAdmin && (
                      <div onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(m.id)}
                          onChange={() => toggleSelection(m.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-neutral-900 dark:text-white font-semibold truncate">{m.name}</span>
                        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
                        <RoleText role={m.jobTitle} />
                        <StatusBadge status={m.status} />
                        <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                        <span className="text-xs text-neutral-400 font-mono">{m.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />{m.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />{m.activityCentre}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(m.registrationDate).toLocaleDateString('en-GB')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                          DBS: <ComplianceBadge status={m.compliance.dbs} />
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                          FA: <ComplianceBadge status={m.compliance.firstAid} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} className="ml-4">
                    <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenuItems(m)} />
                  </div>
                </div>
              </div>
            )) : <EmptyState />}
          </div>
        )}

        {/* â"€â"€ GRID VIEW â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedMembers.length > 0 ? paginatedMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => handleViewDetails(m)}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col ${
                  selectedIds.has(m.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {!isSuperAdmin && (
                      <input type="checkbox" checked={selectedIds.has(m.id)}
                        onChange={() => toggleSelection(m.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    )}
                    <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenuItems(m)} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5 min-w-0">
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate">{m.name}</h4>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex-shrink-0">{m.jobTitle}</span>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono mb-3">{m.id}</p>
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
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <AgeGroupBadge dateOfBirth={m.dateOfBirth} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center gap-1 text-neutral-500">
                      DBS: <ComplianceBadge status={m.compliance.dbs} />
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      FA: <ComplianceBadge status={m.compliance.firstAid} />
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-auto border-t border-neutral-100 dark:border-neutral-800 flex justify-end" onClick={e => e.stopPropagation()}>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            )) : (
              <div className="col-span-full"><EmptyState /></div>
            )}
          </div>
        )}

        {/* â"€â"€ TABLE VIEW â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="overflow-x-auto slim-scroll">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    {!isSuperAdmin && (
                      <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 w-12 border-b border-neutral-200 dark:border-neutral-800">
                        <input type="checkbox"
                          checked={selectedIds.size === paginatedMembers.length && paginatedMembers.length > 0}
                          onChange={e => setSelectedIds(e.target.checked ? new Set(paginatedMembers.map(m => m.id)) : new Set())}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </th>
                    )}
                    {memberColumns.filter(col => visibleColumns[col.key]).map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap"
                      >
                        {col.label}{renderSortArrow(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedMembers.length > 0 ? paginatedMembers.map((m) => (
                    <tr key={m.id} onClick={() => handleViewDetails(m)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                    >
                      {!isSuperAdmin && (
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(m.id)}
                            onChange={() => toggleSelection(m.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                      )}
                      {visibleColumns.id && (
                        <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                          {m.id}
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
                          {m.name}
                        </td>
                      )}
                      {visibleColumns.memberType && (
                        <td className="px-4 py-3.5"><AgeGroupBadge dateOfBirth={m.dateOfBirth} /></td>
                      )}
                      {visibleColumns.email && (
                        <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {m.email || <span className="text-neutral-400">-</span>}
                        </td>
                      )}
                      {visibleColumns.phone && (
                        <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {m.phone || <span className="text-neutral-400">-</span>}
                        </td>
                      )}
                      {visibleColumns.sanghResponsibility && (
                        <td className="px-4 py-3.5">
                          {(() => {
                            const shortLevel = (level: string) => level.split('/')[0].trim();
                            if (m.responsibilities && m.responsibilities.length > 0) {
                              return (
                                <div className="text-xs space-y-1">
                                  {m.responsibilities.map((r, i) => (
                                    <div key={i} className="text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                      {shortLevel(r.responsibilityLevel)} · {r.sanghResponsibility || m.jobTitle} · {r.responsibilityType}
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            if (m.responsibilityType && m.responsibilityLevel) {
                              return (
                                <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                  {shortLevel(m.responsibilityLevel)} · {m.jobTitle} · {m.responsibilityType}
                                </div>
                              );
                            }
                            return <span className="text-sm text-neutral-400">-</span>;
                          })()}
                        </td>
                      )}
                      {visibleColumns.registrationDate && (
                        <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {new Date(m.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      )}
                      {visibleColumns.hssRoles && (
                        <td className="px-4 py-3.5">
                          {(() => {
                            const roles = (m.adminRoles && m.adminRoles.length > 0)
                              ? m.adminRoles
                              : m.adminRole
                                ? [m.adminRole]
                                : m.orgRole
                                  ? [ORG_ROLE_TO_HSS_ROLE[m.orgRole] ?? m.orgRole]
                                  : [];
                            return roles.length > 0 ? (
                              <div className="text-xs space-y-0.5">
                                {roles.map((r, i) => (
                                  <span key={i} className="block text-neutral-700 dark:text-neutral-300">{r}</span>
                                ))}
                              </div>
                            ) : <span className="text-sm text-neutral-400">-</span>;
                          })()}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Search className="w-6 h-6 text-neutral-400" />
                          </div>
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No records found.</h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredMembers.length > 0 && (
              <div className="rounded-b-lg overflow-hidden [&>div]:mt-0">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredMembers.length}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                />
              </div>
            )}
          </div>
        )}

        {/* PAGINATION */}
        <div className={viewMode === 'table' ? 'hidden' : 'mt-6'}>
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
      <StatusConfirmModal
        isOpen={statusModal.isOpen}
        member={statusModal.member}
        action={statusModal.action}
        isLoading={statusModal.isLoading}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        onConfirm={confirmStatusChange}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        member={deleteModal.member}
        isLoading={deleteModal.isLoading}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
      />
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newMember) => {
          setMembers(prev => [newMember, ...prev]);
          setShowAddModal(false);
        }}
        existingMembers={members}
      />
      <BulkUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={(count) => {
          toast.success(`Bulk upload completed successfully. ${count} member${count > 1 ? 's' : ''} created.`);
          setShowBulkModal(false);
        }}
      />
    </div>
  );
}

