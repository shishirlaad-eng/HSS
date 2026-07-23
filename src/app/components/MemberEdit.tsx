import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  HeartPulse,
  History,
  Mail,
  MapPin,
  Plus,
  Phone,
  Save,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
  Briefcase,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './hb/listing';
import { FormField, FormInput, FormLabel, FormSelect, FormTextarea, PhoneInput } from './hb/common';
import {
  DBSStatus, CertStatus,
  DIETARY_REQUIREMENTS,
  DietaryRequirement,
  FIRST_AID_QUALIFICATION_OPTIONS,
  FirstAidQualification,
  MASTERS_CASCADE,
  Member,
  MemberStatus,
  MemberType,
  ResponsibilityAssignment,
  RESPONSIBILITY_LEVEL_OPTIONS,
  RESPONSIBILITY_TYPE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  SAFEGUARDING_LEVEL_OPTIONS,
  SafeguardingLevel,
  getAge,
  getAgeGroupLabel,
  getMemberTypeFromAge,
} from '../../mockAPI/membersData';
import { toast } from 'sonner';
import { ADMIN_ROLE_OPTIONS } from '../../mockAPI/rolesData';
import { useRoleScope } from '../contexts/RoleScopeContext';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CONFIG: Record<MemberStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:                    { label: 'Active',                   dot: 'bg-success-500',  text: 'text-success-700 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-950/20',  border: 'border-success-200 dark:border-success-800'  },
  pending:                   { label: 'Pending Approval',         dot: 'bg-amber-500',    text: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-950/20',      border: 'border-amber-200 dark:border-amber-800'      },
  'pending-parental-consent':{ label: 'Pending Parental Consent', dot: 'bg-violet-500',   text: 'text-violet-700 dark:text-violet-400',    bg: 'bg-violet-50 dark:bg-violet-950/20',    border: 'border-violet-200 dark:border-violet-800'    },
  inactive:                  { label: 'Inactive',                 dot: 'bg-neutral-400',  text: 'text-neutral-600 dark:text-neutral-400',  bg: 'bg-neutral-100 dark:bg-neutral-800',    border: 'border-neutral-200 dark:border-neutral-700'  },
  rejected:                  { label: 'Rejected',                 dot: 'bg-error-500',    text: 'text-error-700 dark:text-error-400',      bg: 'bg-error-50 dark:bg-error-950/20',      border: 'border-error-200 dark:border-error-800'      },
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const LEVEL_OPTIONS = [
  { value: 'Kendriya / National', label: 'Kendriya' },
  { value: 'Vibhag / Region', label: 'Vibhag' },
  { value: 'Nagar / Town', label: 'Nagar' },
  { value: 'Shakha / Activity center', label: 'Shakha' },
] as const;

const REQUIRED_MEMBER_ROLE = 'Adult Member';

const STATUS_OPTIONS: MemberStatus[] = ['active', 'pending', 'pending-parental-consent', 'inactive', 'rejected'];

const STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  pending: 'Pending Approval',
  'pending-parental-consent': 'Pending Parental Consent',
  inactive: 'Inactive',
  rejected: 'Rejected',
};

const QUALIFIED_FIRST_AIDER_ROLES = new Set([
  'Super Admin', 'Member', 'Adult Member', 'Teen', 'Teen Member',
  'Shakha Admin', 'Nagar Admin', 'Vibhag Admin', 'Kendriya Admin',
]);

function canAccessQualifiedFirstAider(selectedRole: string) {
  return QUALIFIED_FIRST_AIDER_ROLES.has(selectedRole);
}

const SAFEGUARDING_EDIT_ROLES = new Set(['Shakha Admin', 'Nagar Admin', 'Vibhag Admin', 'Super Admin', 'Kendriya Admin']);

function canEditSafeguarding(selectedRole: string) {
  return SAFEGUARDING_EDIT_ROLES.has(selectedRole);
}

interface MemberEditProps {
  member: Member;
  onBack: () => void;
  onSave: (updated: Member) => void;
}

type MemberForm = {
  memberType: MemberType;
  firstName: string;
  middleName: string;
  surname: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  buildingName: string;
  addressLine1: string;
  addressLine2: string;
  contactTownCity: string;
  postCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactRelationship: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  medicalInfoDeclared: boolean;
  medicalInfoDetails: string;
  epiPen: string;
  allergies: string;
  isFirstAider: boolean;
  firstAidQualificationLevel: '' | FirstAidQualification;
  firstAidQualificationExpiryDate: string;
  dietaryRequirements: DietaryRequirement[];
  occupation: string;
  spokenLanguages: string;
  originatingStateIndia: string;
  additionalNotes: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  responsibilities: ResponsibilityAssignment[];
  orgRole: string;
  status: MemberStatus;
  dbsStatus: DBSStatus;
  dbsRef: string;
  dbsCertificateNumber: string;
  dbsCertificateDate: string;
  dbsCertificateReceivedFrom: string;
  dbsCertificateReceivedFromOther: string;
  dbsUpdateService: boolean;
  dbsUpdateServiceNumber: string;
  dbsUpdateServiceCheckDate: string;
  dbsAppUnderProcess: boolean;
  dbsCheckedBy: string;
  firstAidStatus: CertStatus;
  firstAidRef: string;
  safeguardingStatus: CertStatus;
  safeguardingTrainingDate: string;
  safeguardingTrainingLevel: '' | SafeguardingLevel;
  safeguardingRef: string;
  safeguardingExpiry: string;
  adminRoles: string[];
};

type EditTab = 'personal' | 'guardian' | 'organisation' | 'compliance' | 'other' | 'roles' | 'activity' | 'history';

function buildName(firstName: string, middleName: string, surname: string) {
  return [firstName, middleName, surname].map(p => p.trim()).filter(Boolean).join(' ');
}

function validEmail(value: string) {
  return !value.trim() || /^\S+@\S+\.\S+$/.test(value);
}

// ── Shared card/section components matching My Profile layout ──

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-5">
        {children}
      </div>
    </div>
  );
}

export default function MemberEdit({ member, onBack, onSave }: MemberEditProps) {
  const { selectedRole } = useRoleScope();
  const canEditQualifiedFirstAider = canAccessQualifiedFirstAider(selectedRole);
  const canEditSafeguardingFields = canEditSafeguarding(selectedRole);

  const [formData, setFormData] = useState<MemberForm>({
    memberType: member.memberType,
    firstName: member.firstName ?? member.name.split(' ')[0] ?? '',
    middleName: member.middleName ?? '',
    surname: member.surname ?? member.name.split(' ').slice(1).join(' '),
    email: member.email,
    secondaryEmail: member.secondaryEmail ?? '',
    phone: member.phone ?? '',
    secondaryPhone: member.secondaryPhone ?? '',
    dateOfBirth: member.dateOfBirth,
    gender: member.gender,
    buildingName: member.buildingName ?? '',
    addressLine1: member.addressLine1 ?? '',
    addressLine2: member.addressLine2 ?? '',
    contactTownCity: member.contactTownCity ?? member.town,
    postCode: member.postCode ?? '',
    emergencyContactName: member.emergencyContactName ?? '',
    emergencyContactPhone: member.emergencyContactPhone ?? '',
    emergencyContactEmail: member.emergencyContactEmail ?? '',
    emergencyContactRelationship: member.emergencyContactRelationship ?? '',
    guardianName: member.guardianName ?? '',
    guardianPhone: member.guardianPhone ?? '',
    guardianEmail: member.guardianEmail ?? '',
    guardianRelationship: member.guardianRelationship ?? '',
    medicalInfoDeclared: member.medicalInfoDeclared ?? false,
    medicalInfoDetails: member.medicalInfoDetails ?? '',
    epiPen: member.epiPen ?? '',
    allergies: member.allergies ?? '',
    isFirstAider: member.isFirstAider ?? false,
    firstAidQualificationLevel: member.firstAidQualificationLevel ?? '',
    firstAidQualificationExpiryDate: member.firstAidQualificationExpiryDate ?? '',
    dietaryRequirements: member.dietaryRequirements ?? [],
    occupation: member.occupation ?? '',
    spokenLanguages: Array.isArray(member.spokenLanguages) ? member.spokenLanguages.join(', ') : (member.spokenLanguages ?? ''),
    originatingStateIndia: member.originatingStateIndia ?? '',
    additionalNotes: member.additionalNotes ?? '',
    country: member.country,
    region: member.region,
    town: member.town,
    activityCentre: member.activityCentre,
    responsibilities: member.responsibilities?.length
      ? member.responsibilities
      : [{
          responsibilityLevel: member.responsibilityLevel ?? RESPONSIBILITY_LEVEL_OPTIONS[3],
          sanghResponsibility: member.jobTitle,
          responsibilityType: member.responsibilityType ?? RESPONSIBILITY_TYPE_OPTIONS[0],
          startDate: member.responsibilityStartDate,
        }],
    orgRole: member.orgRole,
    status: member.status,
    dbsStatus: member.compliance.dbs,
    dbsRef: member.dbsRef ?? '',
    dbsCertificateNumber: member.dbsCertificateNumber ?? '',
    dbsCertificateDate: member.dbsCertificateDate ?? '',
    dbsCertificateReceivedFrom: member.dbsCertificateReceivedFrom ?? '',
    dbsCertificateReceivedFromOther: member.dbsCertificateReceivedFromOther ?? '',
    dbsUpdateService: member.dbsUpdateService ?? false,
    dbsUpdateServiceNumber: member.dbsUpdateServiceNumber ?? '',
    dbsUpdateServiceCheckDate: member.dbsUpdateServiceCheckDate ?? '',
    dbsAppUnderProcess: member.dbsAppUnderProcess ?? false,
    dbsCheckedBy: member.dbsCheckedBy ?? '',
    firstAidStatus: member.compliance.firstAid,
    firstAidRef: member.firstAidRef ?? '',
    safeguardingStatus: member.compliance.safeguardingTraining ?? 'Expired',
    safeguardingTrainingDate: member.safeguardingTrainingDate ?? '',
    safeguardingTrainingLevel: member.safeguardingTrainingLevel ?? '',
    safeguardingRef: member.safeguardingRef ?? '',
    safeguardingExpiry: member.safeguardingExpiry ?? '',
    adminRoles: Array.from(new Set([
      REQUIRED_MEMBER_ROLE,
      ...(member.adminRoles?.length ? member.adminRoles : [member.adminRole].filter(Boolean) as string[]),
    ])),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('personal');

  const calcAge = formData.dateOfBirth ? getAge(formData.dateOfBirth) : getAge(member.dateOfBirth);
  const isMinor = calcAge < 18;

  const regionOptions = formData.country ? (MASTERS_CASCADE.regions[formData.country] ?? []) : [];
  const townOptions = formData.region ? (MASTERS_CASCADE.towns[formData.region] ?? []) : [];
  const centreOptions = formData.town ? (MASTERS_CASCADE.centres[formData.town] ?? []) : [];

  const tabs: { id: EditTab; label: string }[] = [
    { id: 'personal',      label: 'Personal Info'          },
    ...(isMinor ? [{ id: 'guardian' as EditTab, label: 'Parent / Guardian' }] : []),
    { id: 'organisation',  label: 'Organisation'           },
    { id: 'compliance',    label: 'Compliance Details'     },
    { id: 'other',         label: 'Other Information'      },
    { id: 'roles',         label: 'Responsibilities and Role' },
    { id: 'activity',      label: 'Activity'               },
    { id: 'history',       label: 'History'                },
  ];

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const set = (key: keyof MemberForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData(prev => {
        const next = { ...prev, [key]: value };
        if (key === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
        if (key === 'region') { next.town = ''; next.activityCentre = ''; }
        if (key === 'town') { next.activityCentre = ''; }
        return next;
      });
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
    };

  const toggleDietaryRequirement = (value: DietaryRequirement) => {
    setFormData(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(value)
        ? prev.dietaryRequirements.filter(item => item !== value)
        : [...prev.dietaryRequirements, value],
    }));
  };

  const updateResponsibility = (index: number, key: keyof ResponsibilityAssignment, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) =>
        i === index ? { ...item, [key]: value } as ResponsibilityAssignment : item
      ),
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [
        ...prev.responsibilities,
        {
          responsibilityLevel: '' as ResponsibilityAssignment['responsibilityLevel'],
          sanghResponsibility: '',
          responsibilityType: '' as ResponsibilityAssignment['responsibilityType'],
          startDate: '',
        },
      ],
    }));
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const toggleAdminRole = (role: string) => {
    if (role === REQUIRED_MEMBER_ROLE) return;
    setFormData(prev => ({
      ...prev,
      adminRoles: prev.adminRoles.includes(role)
        ? prev.adminRoles.filter(item => item !== role)
        : [...prev.adminRoles, role],
    }));
  };

  const handleSave = async () => {
    const fullName = buildName(formData.firstName, formData.middleName, formData.surname);
    if (!formData.firstName.trim() || !formData.surname.trim() || !fullName) {
      setErrors(prev => ({ ...prev, firstName: !formData.firstName.trim(), surname: !formData.surname.trim() }));
      toast.error('First name and surname are required.'); return;
    }
    if (!formData.gender || !formData.dateOfBirth) {
      setErrors(prev => ({ ...prev, gender: !formData.gender, dateOfBirth: !formData.dateOfBirth }));
      toast.error('Gender and date of birth are required.'); return;
    }
    if (!formData.email.trim() || !validEmail(formData.email) || !validEmail(formData.secondaryEmail)) {
      setErrors(prev => ({ ...prev, email: !formData.email.trim() || !validEmail(formData.email), secondaryEmail: !validEmail(formData.secondaryEmail) }));
      toast.error('Enter valid email details.'); return;
    }
    if (!formData.phone.trim() || !formData.addressLine1.trim() || !formData.contactTownCity.trim() || !formData.postCode.trim()) {
      setErrors(prev => ({
        ...prev,
        phone: !formData.phone.trim(),
        addressLine1: !formData.addressLine1.trim(),
        contactTownCity: !formData.contactTownCity.trim(),
        postCode: !formData.postCode.trim(),
      }));
      toast.error('Primary contact number and address details are required.'); return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim() || !formData.emergencyContactEmail.trim() || !formData.emergencyContactRelationship.trim()) {
      setErrors(prev => ({
        ...prev,
        emergencyContactName: !formData.emergencyContactName.trim(),
        emergencyContactPhone: !formData.emergencyContactPhone.trim(),
        emergencyContactEmail: !formData.emergencyContactEmail.trim(),
        emergencyContactRelationship: !formData.emergencyContactRelationship.trim(),
      }));
      toast.error('Emergency contact details are required.'); return;
    }
    if (!validEmail(formData.emergencyContactEmail)) {
      setErrors(prev => ({ ...prev, emergencyContactEmail: true }));
      toast.error('Enter a valid emergency contact email.'); return;
    }
    if (isMinor && (!formData.guardianName.trim() || !formData.guardianPhone.trim() || !formData.guardianEmail.trim() || !formData.guardianRelationship.trim())) {
      setErrors(prev => ({
        ...prev,
        guardianName: !formData.guardianName.trim(),
        guardianPhone: !formData.guardianPhone.trim(),
        guardianEmail: !formData.guardianEmail.trim(),
        guardianRelationship: !formData.guardianRelationship.trim(),
      }));
      toast.error('Parent / guardian approval details are required for child and teen members.'); return;
    }
    if (isMinor && !validEmail(formData.guardianEmail)) {
      setErrors(prev => ({ ...prev, guardianEmail: true }));
      toast.error('Enter a valid parent / guardian email.'); return;
    }
    if (!formData.country || !formData.region || !formData.town || !formData.activityCentre) {
      setErrors(prev => ({
        ...prev,
        country: !formData.country,
        region: !formData.region,
        town: !formData.town,
        activityCentre: !formData.activityCentre,
      }));
      toast.error('Organisation mapping fields are required.'); return;
    }
    if (!formData.orgRole.trim()) {
      setErrors(prev => ({ ...prev, orgRole: true }));
      toast.error('Organisational role is required.'); return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      const completedResponsibilities = formData.responsibilities.filter(item =>
        item.responsibilityLevel || item.sanghResponsibility || item.responsibilityType
      );
      const primaryResponsibility = completedResponsibilities[0];
      const updated: Member = {
        ...member,
        memberType: getMemberTypeFromAge(formData.dateOfBirth),
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || undefined,
        surname: formData.surname.trim(),
        name: fullName,
        email: formData.email.trim(),
        secondaryEmail: formData.secondaryEmail.trim() || undefined,
        phone: formData.phone.trim(),
        secondaryPhone: formData.secondaryPhone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        buildingName: formData.buildingName.trim() || undefined,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        contactTownCity: formData.contactTownCity.trim(),
        postCode: formData.postCode.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactEmail: formData.emergencyContactEmail.trim(),
        emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
        guardianName: isMinor ? formData.guardianName.trim() : undefined,
        guardianPhone: isMinor ? formData.guardianPhone.trim() : undefined,
        guardianEmail: isMinor ? formData.guardianEmail.trim() : undefined,
        guardianRelationship: isMinor ? formData.guardianRelationship.trim() : undefined,
        country: formData.country,
        region: formData.region,
        town: formData.town,
        activityCentre: formData.activityCentre,
        jobTitle: primaryResponsibility?.sanghResponsibility || member.jobTitle,
        additionalJobTitles: completedResponsibilities.slice(1).map(item => item.sanghResponsibility).filter(Boolean),
        orgRole: formData.orgRole.trim(),
        status: formData.status,
        compliance: {
          ...member.compliance,
          dbs: formData.dbsStatus,
          firstAid: formData.firstAidStatus,
          safeguardingTraining: formData.safeguardingStatus,
        },
        dbsRef: formData.dbsRef.trim() || undefined,
        dbsCertificateNumber: formData.dbsCertificateNumber.trim() || undefined,
        dbsCertificateDate: formData.dbsCertificateDate || undefined,
        dbsCertificateReceivedFrom: formData.dbsCertificateReceivedFrom.trim() || undefined,
        dbsCertificateReceivedFromOther: formData.dbsCertificateReceivedFromOther.trim() || undefined,
        dbsUpdateService: formData.dbsUpdateService,
        dbsUpdateServiceNumber: formData.dbsUpdateServiceNumber.trim() || undefined,
        dbsUpdateServiceCheckDate: formData.dbsUpdateServiceCheckDate || undefined,
        dbsAppUnderProcess: formData.dbsAppUnderProcess,
        dbsCheckedBy: formData.dbsCheckedBy.trim() || undefined,
        firstAidRef: formData.firstAidRef.trim() || undefined,
        safeguardingTrainingDate: formData.safeguardingTrainingDate.trim() || undefined,
        safeguardingTrainingLevel: (formData.safeguardingTrainingLevel as SafeguardingLevel) || undefined,
        safeguardingRef: formData.safeguardingRef.trim() || undefined,
        safeguardingExpiry: formData.safeguardingExpiry || undefined,
        medicalInfoDeclared: formData.medicalInfoDeclared,
        medicalInfoDetails: formData.medicalInfoDetails.trim() || undefined,
        epiPen: formData.epiPen.trim() || undefined,
        allergies: formData.allergies.trim() || undefined,
        isFirstAider: canEditQualifiedFirstAider ? formData.isFirstAider : member.isFirstAider,
        firstAidQualificationLevel: canEditQualifiedFirstAider && formData.isFirstAider
          ? formData.firstAidQualificationLevel || undefined
          : member.firstAidQualificationLevel,
        firstAidQualificationExpiryDate: canEditQualifiedFirstAider && formData.isFirstAider
          ? formData.firstAidQualificationExpiryDate || undefined
          : member.firstAidQualificationExpiryDate,
        dietaryRequirements: formData.dietaryRequirements,
        occupation: formData.occupation.trim() || undefined,
        spokenLanguages: formData.spokenLanguages.trim() ? formData.spokenLanguages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        originatingStateIndia: formData.originatingStateIndia.trim() || undefined,
        additionalNotes: formData.additionalNotes.trim() || undefined,
        adminRole: formData.adminRoles[0] || undefined,
        adminRoles: formData.adminRoles,
        responsibilityType: primaryResponsibility?.responsibilityType || undefined,
        responsibilityLevel: primaryResponsibility?.responsibilityLevel || undefined,
        responsibilityStartDate: primaryResponsibility?.startDate || undefined,
        responsibilities: completedResponsibilities,
      };
      onSave(updated);
    } catch {
      toast.error('Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">

      {/* ── Member identity header (read-only, mirrors MemberDetail) ── */}
      {(() => {
        const cfg = STATUS_CONFIG[member.status];
        return (
          <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {/* Row 1 — Name · Member ID */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-[32px] font-semibold text-neutral-900 dark:text-white leading-tight">
                  {member.name}
                </h1>
                <span className="text-neutral-400 dark:text-neutral-600">·</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">{member.id}</span>
              </div>
              {/* Row 2 — Age group · Status */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {getAgeGroupLabel(member.dateOfBirth)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${cfg.bg} ${cfg.border} ${cfg.text} whitespace-nowrap`}>
                  {cfg.label}
                </span>
              </div>
              {/* Row 3 — Email · Phone */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Mail className="w-3.5 h-3.5" />{member.email}
                </a>
                {member.guardianEmail && calcAge < 18 && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Guardian: {member.guardianEmail}</span>
                  </>
                )}
                {member.phone && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{member.phone}</span>
                  </>
                )}
              </div>
              {/* Row 4 — Location · Registered */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{member.country}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{member.region}</span>
                <span>·</span>
                <span>{member.town}</span>
                <span>·</span>
                <span>{member.activityCentre}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Registered {fmtDate(member.registrationDate)}</span>
              </div>
            </div>
            {/* Action buttons — right side, same row as header */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>Cancel</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave} isLoading={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </PrimaryButton>
            </div>
          </div>
        );
      })()}

      {/* Important note banner */}
      <div className="mb-5 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed italic">
          Updating a member's profile will sync changes across all HSS platforms. Changes to membership status take effect immediately and may affect access to events, Shakhas, and the member portal.
        </p>
      </div>

      {/* Tabbed content — same card/border style as My Profile */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">

        {/* Tab bar */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <>
              <EditSection title="Personal Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField><FormLabel required>First Name</FormLabel><FormInput value={formData.firstName} onChange={set('firstName')} className={errCls('firstName')} /></FormField>
                  <FormField><FormLabel>Membership ID</FormLabel><FormInput value={member.id} readOnly /></FormField>
                  <FormField><FormLabel>Middle Name</FormLabel><FormInput value={formData.middleName} onChange={set('middleName')} /></FormField>
                  <FormField><FormLabel required>Gender</FormLabel><FormSelect value={formData.gender} onChange={set('gender')} className={errCls('gender')}>{GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</FormSelect></FormField>
                  <FormField><FormLabel required>Last Name</FormLabel><FormInput value={formData.surname} onChange={set('surname')} className={errCls('surname')} /></FormField>
                  <FormField>
                    <FormLabel required>Date of Birth</FormLabel>
                    <FormInput type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} className={errCls('dateOfBirth')} />
                    <p className="text-xs text-neutral-500 mt-1">Age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} yrs — {getAgeGroupLabel(formData.dateOfBirth)}</span></p>
                  </FormField>
                </div>
              </EditSection>

              <EditSection title="Contact Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField><FormLabel required>Primary Contact Number</FormLabel><PhoneInput value={formData.phone} onChange={v => { setFormData(prev => ({ ...prev, phone: v })); if (errors.phone) setErrors(prev => ({ ...prev, phone: false })); }} error={!!errors.phone} /></FormField>
                  <FormField><FormLabel>Secondary Contact Number</FormLabel><PhoneInput value={formData.secondaryPhone} onChange={v => setFormData(prev => ({ ...prev, secondaryPhone: v }))} /></FormField>
                  <FormField><FormLabel required>Primary Email Address</FormLabel><FormInput type="email" value={formData.email} onChange={set('email')} className={errCls('email')} readOnly={selectedRole !== 'Super Admin'} /></FormField>
                  <FormField><FormLabel>Secondary Email Address</FormLabel><FormInput type="email" value={formData.secondaryEmail} onChange={set('secondaryEmail')} className={errCls('secondaryEmail')} /></FormField>
                  <FormField><FormLabel>Building Name</FormLabel><FormInput value={formData.buildingName} onChange={set('buildingName')} /></FormField>
                  <FormField><FormLabel required>Town / City</FormLabel><FormInput value={formData.contactTownCity} onChange={set('contactTownCity')} className={errCls('contactTownCity')} /></FormField>
                  <FormField><FormLabel required>Address Line 1</FormLabel><FormInput value={formData.addressLine1} onChange={set('addressLine1')} className={errCls('addressLine1')} /></FormField>
                  <FormField><FormLabel required>Post Code</FormLabel><FormInput value={formData.postCode} onChange={set('postCode')} className={errCls('postCode')} /></FormField>
                  <FormField><FormLabel>Address Line 2</FormLabel><FormInput value={formData.addressLine2} onChange={set('addressLine2')} /></FormField>
                </div>
              </EditSection>

              <EditSection title="Emergency Contact Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField><FormLabel required>Contact Name</FormLabel><FormInput value={formData.emergencyContactName} onChange={set('emergencyContactName')} className={errCls('emergencyContactName')} /></FormField>
                  <FormField><FormLabel required>Contact Phone Number</FormLabel><PhoneInput value={formData.emergencyContactPhone} onChange={v => { setFormData(prev => ({ ...prev, emergencyContactPhone: v })); if (errors.emergencyContactPhone) setErrors(prev => ({ ...prev, emergencyContactPhone: false })); }} error={!!errors.emergencyContactPhone} /></FormField>
                  <FormField><FormLabel required>Contact Email</FormLabel><FormInput type="email" value={formData.emergencyContactEmail} onChange={set('emergencyContactEmail')} className={errCls('emergencyContactEmail')} /></FormField>
                  <FormField><FormLabel required>Contact Relationship</FormLabel><FormInput value={formData.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} className={errCls('emergencyContactRelationship')} /></FormField>
                </div>
              </EditSection>

              <EditSection title="Medical Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField>
                    <FormLabel>Do you have any medical condition?</FormLabel>
                    <FormSelect value={formData.medicalInfoDeclared ? 'Yes' : 'No'} onChange={e => setFormData(prev => ({ ...prev, medicalInfoDeclared: e.target.value === 'Yes' }))}>
                      <option>No</option>
                      <option>Yes</option>
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>Do you carry an EpiPen/Jext/Emerade?</FormLabel>
                    <FormSelect value={formData.epiPen || 'No'} onChange={set('epiPen')}>
                      <option>No</option>
                      <option>Yes</option>
                    </FormSelect>
                  </FormField>
                  <FormField className="md:col-span-2">
                    <FormLabel>Medical Information Details</FormLabel>
                    <FormTextarea rows={3} value={formData.medicalInfoDetails} onChange={set('medicalInfoDetails')} />
                  </FormField>
                  <FormField>
                    <FormLabel>Any Allergies</FormLabel>
                    <FormInput value={formData.allergies} onChange={set('allergies')} placeholder="e.g. Peanuts, Latex" />
                  </FormField>
                  <div className="md:col-span-2">
                    <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Special Dietary Requirements</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {DIETARY_REQUIREMENTS.map(item => (
                        <label key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary-600"
                            checked={formData.dietaryRequirements.includes(item)}
                            onChange={() => toggleDietaryRequirement(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </EditSection>
            </>
          )}

          {/* ── Parent / Guardian ── */}
          {activeTab === 'guardian' && isMinor && (
            <EditSection title="Parent / Guardian Approval Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField><FormLabel required>Parent / Guardian Name</FormLabel><FormInput value={formData.guardianName} onChange={set('guardianName')} className={errCls('guardianName')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Phone Number</FormLabel><PhoneInput value={formData.guardianPhone} onChange={v => { setFormData(prev => ({ ...prev, guardianPhone: v })); if (errors.guardianPhone) setErrors(prev => ({ ...prev, guardianPhone: false })); }} error={!!errors.guardianPhone} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Email</FormLabel><FormInput type="email" value={formData.guardianEmail} onChange={set('guardianEmail')} className={errCls('guardianEmail')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Relationship</FormLabel><FormInput value={formData.guardianRelationship} onChange={set('guardianRelationship')} className={errCls('guardianRelationship')} /></FormField>
              </div>
            </EditSection>
          )}

          {/* ── Organisation ── */}
          {activeTab === 'organisation' && (
            <>
              <EditSection title="Shakha Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField><FormLabel required>Country / Organisation</FormLabel><FormSelect value={formData.country} onChange={set('country')} className={errCls('country')}><option value="">Select country</option>{MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
                  <FormField><FormLabel required>Vibhag</FormLabel><FormSelect value={formData.region} onChange={set('region')} disabled={!formData.country} className={errCls('region')}><option value="">{formData.country ? 'Select region' : 'Select country first'}</option>{regionOptions.map(r => <option key={r} value={r}>{r}</option>)}</FormSelect></FormField>
                  <FormField><FormLabel required>Nagar</FormLabel><FormSelect value={formData.town} onChange={set('town')} disabled={!formData.region} className={errCls('town')}><option value="">{formData.region ? 'Select town' : 'Select region first'}</option>{townOptions.map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></FormField>
                  <FormField><FormLabel required>Shakha</FormLabel><FormSelect value={formData.activityCentre} onChange={set('activityCentre')} disabled={!formData.town} className={errCls('activityCentre')}><option value="">{formData.town ? 'Select shakha' : 'Select town first'}</option>{centreOptions.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
                  <FormField><FormLabel required>Organisational Role</FormLabel><FormInput value={formData.orgRole} onChange={set('orgRole')} className={errCls('orgRole')} /></FormField>
                  <FormField>
                    <FormLabel>Member Status</FormLabel>
                    <FormSelect value={formData.status} onChange={set('status')}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>Age Category</FormLabel>
                    <FormInput value={getAgeGroupLabel(formData.dateOfBirth)} readOnly />
                  </FormField>
                </div>
              </EditSection>
            </>
          )}

          {/* ── Compliance ── */}
          {activeTab === 'compliance' && (
            <>
              <EditSection title="DBS">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField><FormLabel>DBS Status</FormLabel><FormSelect value={formData.dbsStatus} onChange={set('dbsStatus')}><option value="Approved">Approved</option><option value="Pending">Pending</option></FormSelect></FormField>
                  <FormField><FormLabel>DBS Reference Number</FormLabel><FormInput value={formData.dbsRef} onChange={set('dbsRef')} /></FormField>
                  <FormField><FormLabel>DBS Certificate Number</FormLabel><FormInput value={formData.dbsCertificateNumber} onChange={set('dbsCertificateNumber')} placeholder="e.g. 001234567890" /></FormField>
                  <FormField><FormLabel>DBS Certificate Date</FormLabel><FormInput type="date" value={formData.dbsCertificateDate} onChange={set('dbsCertificateDate')} /></FormField>
                  <FormField><FormLabel>Certificate Received From</FormLabel><FormInput value={formData.dbsCertificateReceivedFrom} onChange={set('dbsCertificateReceivedFrom')} /></FormField>
                  <FormField><FormLabel>Other Source</FormLabel><FormInput value={formData.dbsCertificateReceivedFromOther} onChange={set('dbsCertificateReceivedFromOther')} /></FormField>
                  <FormField>
                    <FormLabel>Enrolled in DBS Update Service</FormLabel>
                    <FormSelect value={formData.dbsUpdateService ? 'yes' : 'no'} onChange={e => setFormData(prev => ({ ...prev, dbsUpdateService: e.target.value === 'yes' }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </FormSelect>
                  </FormField>
                  {formData.dbsUpdateService && (
                    <>
                      <FormField><FormLabel>Update Service Number</FormLabel><FormInput value={formData.dbsUpdateServiceNumber} onChange={set('dbsUpdateServiceNumber')} /></FormField>
                      <FormField><FormLabel>Last Service Check Date</FormLabel><FormInput type="date" value={formData.dbsUpdateServiceCheckDate} onChange={set('dbsUpdateServiceCheckDate')} /></FormField>
                    </>
                  )}
                  <FormField>
                    <FormLabel>DBS Application Under Process</FormLabel>
                    <FormSelect value={formData.dbsAppUnderProcess ? 'yes' : 'no'} onChange={e => setFormData(prev => ({ ...prev, dbsAppUnderProcess: e.target.value === 'yes' }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </FormSelect>
                  </FormField>
                  <FormField><FormLabel>Verified By</FormLabel><FormInput value={formData.dbsCheckedBy} onChange={set('dbsCheckedBy')} placeholder="e.g. Ramesh Patel (Karyawaha)" /></FormField>
                </div>
              </EditSection>

              <EditSection title="First Aid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField>
                    <FormLabel>Are you a first aider for HSS?</FormLabel>
                    <FormSelect value={formData.isFirstAider ? 'Yes' : 'No'} onChange={e => setFormData(prev => ({
                      ...prev,
                      isFirstAider: e.target.value === 'Yes',
                      ...( e.target.value !== 'Yes' ? { firstAidQualificationLevel: '' as const, firstAidQualificationExpiryDate: '' } : {}),
                    }))}>
                      <option>No</option>
                      <option>Yes</option>
                    </FormSelect>
                  </FormField>
                  <FormField><FormLabel>First Aid Status</FormLabel><FormSelect value={formData.firstAidStatus} onChange={set('firstAidStatus')}><option value="Certified">Certified</option><option value="Expired">Expired</option><option value="N/A">N/A</option></FormSelect></FormField>
                  {formData.isFirstAider && (
                    <>
                      <FormField>
                        <FormLabel>First Aid Qualification</FormLabel>
                        <FormSelect value={formData.firstAidQualificationLevel} onChange={set('firstAidQualificationLevel')}>
                          <option value="">Select qualification</option>
                          {FIRST_AID_QUALIFICATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </FormSelect>
                      </FormField>
                      <FormField><FormLabel>Expiry Date</FormLabel><FormInput type="date" value={formData.firstAidQualificationExpiryDate} onChange={set('firstAidQualificationExpiryDate')} /></FormField>
                    </>
                  )}
                  <FormField><FormLabel>First Aid Reference Number</FormLabel><FormInput value={formData.firstAidRef} onChange={set('firstAidRef')} /></FormField>
                </div>
              </EditSection>

              {canEditSafeguardingFields && (
                <EditSection title="Safeguarding">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField>
                      <FormLabel>Safeguarding Status</FormLabel>
                      <FormSelect value={formData.safeguardingStatus} onChange={set('safeguardingStatus')}>
                        <option value="Certified">Certified</option>
                        <option value="Expired">Expired</option>
                        <option value="N/A">N/A</option>
                      </FormSelect>
                    </FormField>
                    <FormField><FormLabel>Date of Safeguarding Training</FormLabel><FormInput type="date" value={formData.safeguardingTrainingDate} onChange={set('safeguardingTrainingDate')} /></FormField>
                    <FormField>
                      <FormLabel>Level of Training</FormLabel>
                      <FormSelect value={formData.safeguardingTrainingLevel} onChange={set('safeguardingTrainingLevel')}>
                        <option value="">Select level…</option>
                        {SAFEGUARDING_LEVEL_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
                      </FormSelect>
                    </FormField>
                    <FormField><FormLabel>Safeguarding Reference Number</FormLabel><FormInput value={formData.safeguardingRef} onChange={set('safeguardingRef')} placeholder="e.g. SG-2024-042" /></FormField>
                    <FormField><FormLabel>Safeguarding Expiry Date</FormLabel><FormInput type="date" value={formData.safeguardingExpiry} onChange={set('safeguardingExpiry')} /></FormField>
                  </div>
                </EditSection>
              )}
            </>
          )}

          {/* ── Other Information ── */}
          {activeTab === 'other' && (
            <EditSection title="Other Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField><FormLabel>Occupation (Select Other if not listed)</FormLabel><FormInput value={formData.occupation} onChange={set('occupation')} /></FormField>
                <FormField><FormLabel>Spoken Language(s)</FormLabel><FormInput value={formData.spokenLanguages} onChange={set('spokenLanguages')} placeholder="e.g. English, Hindi, Gujarati" /></FormField>
                <FormField><FormLabel>Originating State in India</FormLabel><FormInput value={formData.originatingStateIndia} onChange={set('originatingStateIndia')} /></FormField>
                <FormField className="md:col-span-2">
                  <FormLabel>Additional Notes / Comments</FormLabel>
                  <FormTextarea rows={3} value={formData.additionalNotes} onChange={set('additionalNotes')} />
                </FormField>
              </div>
            </EditSection>
          )}

          {/* ── Roles & Responsibility ── */}
          {activeTab === 'roles' && (
            <>
              <EditSection title="MyHSS Role">
                <FormField>
                  <FormLabel>Role</FormLabel>
                  <details className="relative group">
                    <summary className="relative h-10 w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white cursor-pointer list-none focus:outline-none focus:border-primary-500">
                      <span className={formData.adminRoles.length ? '' : 'text-neutral-400'}>
                        {formData.adminRoles.length
                          ? `${formData.adminRoles.length} role${formData.adminRoles.length > 1 ? 's' : ''} selected`
                          : 'Select Roles'}
                      </span>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto slim-scroll rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1">
                      {ADMIN_ROLE_OPTIONS.map(role => (
                        <label key={role} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.adminRoles.includes(role)}
                            onChange={() => toggleAdminRole(role)}
                            disabled={role === REQUIRED_MEMBER_ROLE}
                            className="w-4 h-4 accent-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          <span className={role === REQUIRED_MEMBER_ROLE ? 'font-medium' : ''}>{role}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                  {formData.adminRoles.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{formData.adminRoles.join(', ')}</p>
                  )}
                </FormField>
              </EditSection>

              <EditSection title="Sangh Responsibility">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Add one or more responsibilities</p>
                  <SecondaryButton icon={Plus} onClick={addResponsibility}>Add Responsibility</SecondaryButton>
                </div>
                <div className="space-y-4">
                  {formData.responsibilities.map((responsibility, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-end rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                      <FormField>
                        <FormLabel>Level</FormLabel>
                        <FormSelect value={responsibility.responsibilityLevel} onChange={e => updateResponsibility(index, 'responsibilityLevel', e.target.value)}>
                          <option value="">Select Level</option>
                          {LEVEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </FormSelect>
                      </FormField>
                      <FormField>
                        <FormLabel>Sangh Responsibility (HSS Role)</FormLabel>
                        <FormSelect value={responsibility.sanghResponsibility} onChange={e => updateResponsibility(index, 'sanghResponsibility', e.target.value)}>
                          <option value="">Select Sangh Responsibility</option>
                          {ROLE_TYPE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                        </FormSelect>
                      </FormField>
                      <FormField>
                        <FormLabel>Responsibility Type</FormLabel>
                        <FormSelect value={responsibility.responsibilityType} onChange={e => updateResponsibility(index, 'responsibilityType', e.target.value)}>
                          <option value="">Select Responsibility Type</option>
                          {RESPONSIBILITY_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                        </FormSelect>
                      </FormField>
                      <FormField>
                        <FormLabel>Since (Start Date)</FormLabel>
                        <FormInput type="date" value={responsibility.startDate ?? ''} onChange={e => updateResponsibility(index, 'startDate', e.target.value)} />
                      </FormField>
                      {formData.responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className="h-10 w-10 rounded-lg border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/30 flex items-center justify-center"
                          aria-label={`Remove responsibility ${index + 1}`}
                          title="Remove responsibility"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </EditSection>
            </>
          )}

          {/* ── Activity ── */}
          {activeTab === 'activity' && (
            <EditSection title="Activity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Events Attended</p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">{member.eventsAttended}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Shakha Sessions Attended</p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">{member.shakhaSessionsAttended}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                Activity records are read-only and managed through the Events and Attendance modules.
              </p>
            </EditSection>
          )}

          {/* ── History ── */}
          {activeTab === 'history' && (
            <EditSection title="Member Reference">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Member ID</label>
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">{member.id}</code>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Registration Date</label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {new Date(member.registrationDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Current Age</label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {calcAge < 13 ? `Child (${calcAge})` : calcAge < 18 ? `Teen (${calcAge})` : `Adult (${calcAge})`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                Audit history is read-only and available from the member detail view.
              </p>
            </EditSection>
          )}

        </div>
      </div>
    </div>
  );
}
