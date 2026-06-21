import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  History,
  Plus,
  Phone,
  Save,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { PageHeader, PrimaryButton, SecondaryButton } from './hb/listing';
import { FormField, FormInput, FormLabel, FormSelect, FormTextarea } from './hb/common';
import {
  ComplianceStatus,
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

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const LEVEL_OPTIONS = [
  { value: 'Kendriya / National', label: 'Kendriya' },
  { value: 'Vibhaag / Region', label: 'Vibhaag' },
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

const STATUS_COLOURS: Record<MemberStatus, string> = {
  active: 'bg-[#4EAE33]',
  pending: 'bg-[#F9B03D]',
  'pending-parental-consent': 'bg-[#8B5CF6]',
  inactive: 'bg-[#9C9C9D]',
  rejected: 'bg-[#BC0F1C]',
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

const SAFEGUARDING_EDIT_ROLES = new Set(['Shakha Admin', 'Nagar Admin', 'Vibhaag Admin', 'Super Admin', 'Kendriya Admin']);

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
  isFirstAider: boolean;
  firstAidQualificationLevel: '' | FirstAidQualification;
  firstAidQualificationExpiryDate: string;
  dietaryRequirements: DietaryRequirement[];
  occupation: string;
  originatingStateIndia: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  responsibilities: ResponsibilityAssignment[];
  orgRole: string;
  status: MemberStatus;
  dbsStatus: ComplianceStatus;
  firstAidStatus: ComplianceStatus;
  dbsRef: string;
  firstAidRef: string;
  safeguardingStatus: ComplianceStatus;
  safeguardingTrainingDate: string;
  safeguardingTrainingLevel: '' | SafeguardingLevel;
  adminRoles: string[];
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      {title}
    </div>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

type EditTab = 'profile' | 'compliance' | 'activity' | 'history';

function buildName(firstName: string, middleName: string, surname: string) {
  return [firstName, middleName, surname].map(p => p.trim()).filter(Boolean).join(' ');
}

function validEmail(value: string) {
  return !value.trim() || /^\S+@\S+\.\S+$/.test(value);
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
    isFirstAider: member.isFirstAider ?? false,
    firstAidQualificationLevel: member.firstAidQualificationLevel ?? '',
    firstAidQualificationExpiryDate: member.firstAidQualificationExpiryDate ?? '',
    dietaryRequirements: member.dietaryRequirements ?? [],
    occupation: member.occupation ?? '',
    originatingStateIndia: member.originatingStateIndia ?? '',
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
        }],
    orgRole: member.orgRole,
    status: member.status,
    dbsStatus: member.compliance.dbs,
    firstAidStatus: member.compliance.firstAid,
    dbsRef: member.dbsRef ?? '',
    firstAidRef: member.firstAidRef ?? '',
    safeguardingStatus: member.compliance.safeguardingTraining ?? 'pending',
    safeguardingTrainingDate: member.safeguardingTrainingDate ?? '',
    safeguardingTrainingLevel: member.safeguardingTrainingLevel ?? '',
    adminRoles: Array.from(new Set([
      REQUIRED_MEMBER_ROLE,
      ...(member.adminRoles?.length ? member.adminRoles : [member.adminRole].filter(Boolean) as string[]),
    ])),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('profile');
  const tabs: { id: EditTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'activity', label: 'Activity' },
    { id: 'history', label: 'History' },
  ];

  const calcAge = formData.dateOfBirth ? getAge(formData.dateOfBirth) : getAge(member.dateOfBirth);
  const isMinor = calcAge < 18;
  const regionOptions = formData.country ? (MASTERS_CASCADE.regions[formData.country] ?? []) : [];
  const townOptions = formData.region ? (MASTERS_CASCADE.towns[formData.region] ?? []) : [];
  const centreOptions = formData.town ? (MASTERS_CASCADE.centres[formData.town] ?? []) : [];

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
    };

  const setBoolean = (key: keyof Pick<MemberForm, 'medicalInfoDeclared' | 'isFirstAider'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setFormData(prev => ({
        ...prev,
        [key]: checked,
        ...(key === 'isFirstAider' && !checked
          ? { firstAidQualificationLevel: '', firstAidQualificationExpiryDate: '' }
          : {}),
      }));
    };

  const toggleDietaryRequirement = (value: DietaryRequirement) => {
    setFormData(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(value)
        ? prev.dietaryRequirements.filter(item => item !== value)
        : [...prev.dietaryRequirements, value],
    }));
  };

  const updateResponsibility = (
    index: number,
    key: keyof ResponsibilityAssignment,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } as ResponsibilityAssignment : item
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
        },
      ],
    }));
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, itemIndex) => itemIndex !== index),
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
      toast.error('First name and surname are required.');
      return;
    }
    if (!formData.email.trim() || !validEmail(formData.email) || !validEmail(formData.secondaryEmail)) {
      toast.error('Enter valid email details.');
      return;
    }
    if (!formData.phone.trim() || !formData.addressLine1.trim() || !formData.contactTownCity.trim() || !formData.postCode.trim()) {
      toast.error('Primary contact number and address details are required.');
      return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim() || !formData.emergencyContactEmail.trim() || !formData.emergencyContactRelationship.trim()) {
      toast.error('Emergency contact details are required.');
      return;
    }
    if (!validEmail(formData.emergencyContactEmail)) {
      toast.error('Enter a valid emergency contact email.');
      return;
    }
    if (isMinor && (!formData.guardianName.trim() || !formData.guardianPhone.trim() || !formData.guardianEmail.trim() || !formData.guardianRelationship.trim())) {
      toast.error('Parent / guardian approval details are required for child and teen members.');
      return;
    }
    if (isMinor && !validEmail(formData.guardianEmail)) {
      toast.error('Enter a valid parent / guardian email.');
      return;
    }
    if (!formData.country || !formData.region || !formData.town || !formData.activityCentre) {
      toast.error('Organisation mapping fields are required.');
      return;
    }
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
        firstAidRef: formData.firstAidRef.trim() || undefined,
        safeguardingTrainingDate: formData.safeguardingTrainingDate.trim() || undefined,
        safeguardingTrainingLevel: (formData.safeguardingTrainingLevel as SafeguardingLevel) || undefined,
        medicalInfoDeclared: formData.medicalInfoDeclared,
        medicalInfoDetails: formData.medicalInfoDetails.trim() || undefined,
        isFirstAider: canEditQualifiedFirstAider ? formData.isFirstAider : member.isFirstAider,
        firstAidQualificationLevel: canEditQualifiedFirstAider && formData.isFirstAider
          ? formData.firstAidQualificationLevel || undefined
          : member.firstAidQualificationLevel,
        firstAidQualificationExpiryDate: canEditQualifiedFirstAider && formData.isFirstAider
          ? formData.firstAidQualificationExpiryDate || undefined
          : member.firstAidQualificationExpiryDate,
        dietaryRequirements: formData.dietaryRequirements,
        occupation: formData.occupation.trim() || undefined,
        originatingStateIndia: formData.originatingStateIndia.trim() || undefined,
        adminRole: formData.adminRoles[0] || undefined,
        adminRoles: formData.adminRoles,
        responsibilityType: primaryResponsibility?.responsibilityType || undefined,
        responsibilityLevel: primaryResponsibility?.responsibilityLevel || undefined,
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
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <PageHeader
        title="Edit Member Profile"
        breadcrumbs={[
          { label: 'Members', onClick: onBack },
          { label: member.name, onClick: onBack },
          { label: 'Edit', current: true },
        ]}
      >
        <div className="flex items-center gap-3">
          <SecondaryButton icon={ArrowLeft} onClick={onBack}>Cancel</SecondaryButton>
          <PrimaryButton icon={Save} onClick={handleSave} isLoading={isSaving}>
            {isSaving ? 'Saving...' : 'Update'}
          </PrimaryButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
            <div className="flex px-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
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

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={UserIcon} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>First Name</FormLabel><FormInput value={formData.firstName} onChange={set('firstName')} /></FormField>
              <FormField><FormLabel>Middle Name</FormLabel><FormInput value={formData.middleName} onChange={set('middleName')} /></FormField>
              <FormField><FormLabel required>Surname</FormLabel><FormInput value={formData.surname} onChange={set('surname')} /></FormField>
              <FormField><FormLabel required>Gender</FormLabel><FormSelect value={formData.gender} onChange={set('gender')}>{GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Date of Birth</FormLabel><FormInput type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} /><p className="text-xs text-neutral-500 mt-1">Age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} years</span></p></FormField>
              <FormField><FormLabel>Age Groups (years old)</FormLabel><FormInput value={getAgeGroupLabel(formData.dateOfBirth)} readOnly /></FormField>
            </div>
          </SectionCard>

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={Phone} title="Contact Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>Primary Contact Number</FormLabel><FormInput type="tel" value={formData.phone} onChange={set('phone')} /></FormField>
              <FormField><FormLabel>Secondary Contact Number</FormLabel><FormInput type="tel" value={formData.secondaryPhone} onChange={set('secondaryPhone')} /></FormField>
              <FormField><FormLabel required>Primary Email Address</FormLabel><FormInput type="email" value={formData.email} onChange={set('email')} /></FormField>
              <FormField><FormLabel>Secondary Email Address</FormLabel><FormInput type="email" value={formData.secondaryEmail} onChange={set('secondaryEmail')} /></FormField>
              <FormField><FormLabel>Building Name</FormLabel><FormInput value={formData.buildingName} onChange={set('buildingName')} /></FormField>
              <FormField><FormLabel required>Address Line</FormLabel><FormInput value={formData.addressLine1} onChange={set('addressLine1')} /></FormField>
              <FormField><FormLabel>Address Line 2</FormLabel><FormInput value={formData.addressLine2} onChange={set('addressLine2')} /></FormField>
              <FormField><FormLabel required>Town / City</FormLabel><FormInput value={formData.contactTownCity} onChange={set('contactTownCity')} /></FormField>
              <FormField><FormLabel required>Post Code</FormLabel><FormInput value={formData.postCode} onChange={set('postCode')} /></FormField>
            </div>
          </SectionCard>

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={Users} title="Emergency Contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>Contact Name</FormLabel><FormInput value={formData.emergencyContactName} onChange={set('emergencyContactName')} /></FormField>
              <FormField><FormLabel required>Contact Phone Number</FormLabel><FormInput type="tel" value={formData.emergencyContactPhone} onChange={set('emergencyContactPhone')} /></FormField>
              <FormField><FormLabel required>Contact Email</FormLabel><FormInput type="email" value={formData.emergencyContactEmail} onChange={set('emergencyContactEmail')} /></FormField>
              <FormField><FormLabel required>Contact Relationship</FormLabel><FormInput value={formData.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} /></FormField>
            </div>
          </SectionCard>

          {isMinor && (
            <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
              <SectionHeader icon={Users} title="Parent / Guardian Approval Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField><FormLabel required>Parent / Guardian Name</FormLabel><FormInput value={formData.guardianName} onChange={set('guardianName')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Phone Number</FormLabel><FormInput type="tel" value={formData.guardianPhone} onChange={set('guardianPhone')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Email</FormLabel><FormInput type="email" value={formData.guardianEmail} onChange={set('guardianEmail')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Relationship</FormLabel><FormInput value={formData.guardianRelationship} onChange={set('guardianRelationship')} /></FormField>
              </div>
            </SectionCard>
          )}

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={HeartPulse} title="Other Information" />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input type="checkbox" checked={formData.medicalInfoDeclared} onChange={setBoolean('medicalInfoDeclared')} className="w-4 h-4 accent-primary-600" />
                  Medical information declared
                </label>
                <FormField className="md:col-span-2"><FormLabel>Medical Information Details</FormLabel><FormTextarea rows={3} value={formData.medicalInfoDetails} onChange={set('medicalInfoDetails')} /></FormField>
                {canEditQualifiedFirstAider && (
                  <>
                    <label className="md:col-span-2 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <input type="checkbox" checked={formData.isFirstAider} onChange={setBoolean('isFirstAider')} className="w-4 h-4 accent-primary-600" />
                      Are you a qualified First Aider
                    </label>
                    {formData.isFirstAider && (
                      <>
                        <FormField>
                          <FormLabel>Level of qualification</FormLabel>
                          <FormSelect value={formData.firstAidQualificationLevel} onChange={set('firstAidQualificationLevel')}>
                            <option value="">Select qualification</option>
                            {FIRST_AID_QUALIFICATION_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </FormSelect>
                        </FormField>
                        <FormField>
                          <FormLabel>Qualification expiry date</FormLabel>
                          <FormInput type="date" value={formData.firstAidQualificationExpiryDate} onChange={set('firstAidQualificationExpiryDate')} />
                        </FormField>
                      </>
                    )}
                  </>
                )}
                <FormField><FormLabel>Occupation</FormLabel><FormInput value={formData.occupation} onChange={set('occupation')} /></FormField>
                <FormField><FormLabel>Originating State in India</FormLabel><FormInput value={formData.originatingStateIndia} onChange={set('originatingStateIndia')} /></FormField>
              </div>

              <div>
                <FormLabel>Special Dietary Requirements</FormLabel>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DIETARY_REQUIREMENTS.map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <input type="checkbox" checked={formData.dietaryRequirements.includes(item)} onChange={() => toggleDietaryRequirement(item)} className="w-4 h-4 accent-primary-600" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </SectionCard>

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={Building2} title="Organisational Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>Country / Organisation</FormLabel><FormSelect value={formData.country} onChange={set('country')}><option value="">Select country</option>{MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Vibhag (Region)</FormLabel><FormSelect value={formData.region} onChange={set('region')} disabled={!formData.country}><option value="">{formData.country ? 'Select region' : 'Select country first'}</option>{regionOptions.map(r => <option key={r} value={r}>{r}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Nagar (Town)</FormLabel><FormSelect value={formData.town} onChange={set('town')} disabled={!formData.region}><option value="">{formData.region ? 'Select town' : 'Select region first'}</option>{townOptions.map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Shakha (Branch)</FormLabel><FormSelect value={formData.activityCentre} onChange={set('activityCentre')} disabled={!formData.town}><option value="">{formData.town ? 'Select shakha' : 'Select town first'}</option>{centreOptions.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Organisational Role</FormLabel><FormInput value={formData.orgRole} onChange={set('orgRole')} /></FormField>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <FormLabel>Responsibility</FormLabel>
                <SecondaryButton icon={Plus} onClick={addResponsibility}>
                  Add more responsibility
                </SecondaryButton>
              </div>
              <div className="space-y-4">
                {formData.responsibilities.map((responsibility, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                    <FormField>
                      <FormLabel>Level</FormLabel>
                      <FormSelect value={responsibility.responsibilityLevel} onChange={event => updateResponsibility(index, 'responsibilityLevel', event.target.value)}>
                        <option value="">Select Level</option>
                        {LEVEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel>Sangh Responsibility (HSS Role)</FormLabel>
                      <FormSelect value={responsibility.sanghResponsibility} onChange={event => updateResponsibility(index, 'sanghResponsibility', event.target.value)}>
                        <option value="">Select Sangh Responsibility</option>
                        {ROLE_TYPE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel>Responsibility Type</FormLabel>
                      <FormSelect value={responsibility.responsibilityType} onChange={event => updateResponsibility(index, 'responsibilityType', event.target.value)}>
                        <option value="">Select Responsibility Type</option>
                        {RESPONSIBILITY_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                      </FormSelect>
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
            </div>
          </SectionCard>

          <SectionCard className={activeTab === 'compliance' ? '' : 'hidden'}>
            <SectionHeader icon={Shield} title="Compliance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel>DBS Status</FormLabel><FormSelect value={formData.dbsStatus} onChange={set('dbsStatus')}><option value="pending">Pending</option><option value="completed">Completed</option></FormSelect></FormField>
              <FormField><FormLabel>DBS Reference Number</FormLabel><FormInput value={formData.dbsRef} onChange={set('dbsRef')} /></FormField>
              <FormField><FormLabel>First Aid Status</FormLabel><FormSelect value={formData.firstAidStatus} onChange={set('firstAidStatus')}><option value="pending">Pending</option><option value="completed">Completed</option></FormSelect></FormField>
              <FormField><FormLabel>First Aid Reference Number</FormLabel><FormInput value={formData.firstAidRef} onChange={set('firstAidRef')} /></FormField>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 mb-6 leading-relaxed">
              The profile first-aider flag is separate from the First Aid compliance certificate status.
            </p>

            {canEditSafeguardingFields && (
              <>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 mb-4">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Safeguarding
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField>
                    <FormLabel>Safeguarding Status</FormLabel>
                    <FormSelect value={formData.safeguardingStatus} onChange={set('safeguardingStatus')}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>Date of Safeguarding Training</FormLabel>
                    <FormInput type="date" value={formData.safeguardingTrainingDate} onChange={set('safeguardingTrainingDate')} />
                  </FormField>
                  <FormField>
                    <FormLabel>Level of Training</FormLabel>
                    <FormSelect value={formData.safeguardingTrainingLevel} onChange={set('safeguardingTrainingLevel')}>
                      <option value="">Select level…</option>
                      {SAFEGUARDING_LEVEL_OPTIONS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard className={activeTab === 'profile' ? '' : 'hidden'}>
            <SectionHeader icon={Shield} title="Membership Status" />
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.status === status
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLOURS[status]}`} />
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </SectionCard>

          {activeTab === 'activity' && (
            <SectionCard>
              <SectionHeader icon={CalendarDays} title="Activity" />
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
            </SectionCard>
          )}

          {activeTab === 'history' && (
            <SectionCard>
              <SectionHeader icon={History} title="History" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Member ID</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">{member.id}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Registration Date</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                    {new Date(member.registrationDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                Audit history is read-only and available from the member detail view.
              </p>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
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
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    {formData.adminRoles.join(', ')}
                  </p>
                )}
              </FormField>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Important Note</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
              Updating a member's profile will sync changes across all HSS platforms. Changes to membership status take effect immediately and may affect access to events, Shakhas, and the member portal.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Member Reference</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Member ID</label>
                <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">{member.id}</code>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Current Age</label>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{calcAge < 13 ? `Child (${calcAge})` : calcAge < 18 ? `Teen (${calcAge})` : `Adult (${calcAge})`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
