import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  HeartPulse,
  Phone,
  Save,
  Shield,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { PageHeader, PrimaryButton, SecondaryButton } from './hb/listing';
import { FormField, FormInput, FormLabel, FormSelect, FormTextarea } from './hb/common';
import {
  ComplianceStatus,
  DIETARY_REQUIREMENTS,
  DietaryRequirement,
  MASTERS_CASCADE,
  Member,
  MemberStatus,
  MemberType,
  RESPONSIBILITY_LEVEL_OPTIONS,
  RESPONSIBILITY_TYPE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
  getAge,
  getAgeGroupLabel,
  getMemberTypeFromAge,
} from '../../mockAPI/membersData';
import { toast } from 'sonner';
import { ADMIN_ROLE_OPTIONS } from '../../mockAPI/rolesData';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

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
  dietaryRequirements: DietaryRequirement[];
  occupation: string;
  spokenLanguages: string[];
  originatingStateIndia: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  jobTitle: string;
  orgRole: string;
  status: MemberStatus;
  dbsStatus: ComplianceStatus;
  firstAidStatus: ComplianceStatus;
  dbsRef: string;
  firstAidRef: string;
  responsibilityType: string;
  responsibilityLevel: string;
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      {title}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
      {children}
    </div>
  );
}

function buildName(firstName: string, middleName: string, surname: string) {
  return [firstName, middleName, surname].map(p => p.trim()).filter(Boolean).join(' ');
}

function validEmail(value: string) {
  return !value.trim() || /^\S+@\S+\.\S+$/.test(value);
}

export default function MemberEdit({ member, onBack, onSave }: MemberEditProps) {
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
    dietaryRequirements: member.dietaryRequirements ?? [],
    occupation: member.occupation ?? '',
    spokenLanguages: member.spokenLanguages ?? [],
    originatingStateIndia: member.originatingStateIndia ?? '',
    country: member.country,
    region: member.region,
    town: member.town,
    activityCentre: member.activityCentre,
    jobTitle: member.jobTitle,
    orgRole: member.orgRole,
    status: member.status,
    dbsStatus: member.compliance.dbs,
    firstAidStatus: member.compliance.firstAid,
    dbsRef: member.dbsRef ?? '',
    firstAidRef: member.firstAidRef ?? '',
    adminRole: member.adminRole ?? 'Member (18+)',
    responsibilityType: member.responsibilityType ?? RESPONSIBILITY_TYPE_OPTIONS[0],
    responsibilityLevel: member.responsibilityLevel ?? RESPONSIBILITY_LEVEL_OPTIONS[3],
  });
  const [isSaving, setIsSaving] = useState(false);

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
      setFormData(prev => ({ ...prev, [key]: e.target.checked }));
    };

  const toggleDietaryRequirement = (value: DietaryRequirement) => {
    setFormData(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(value)
        ? prev.dietaryRequirements.filter(item => item !== value)
        : [...prev.dietaryRequirements, value],
    }));
  };

  const toggleSpokenLanguage = (value: string) => {
    setFormData(prev => ({
      ...prev,
      spokenLanguages: prev.spokenLanguages.includes(value)
        ? prev.spokenLanguages.filter(item => item !== value)
        : [...prev.spokenLanguages, value],
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
        jobTitle: formData.jobTitle.trim(),
        orgRole: formData.orgRole.trim(),
        status: formData.status,
        compliance: {
          ...member.compliance,
          dbs: formData.dbsStatus,
          firstAid: formData.firstAidStatus,
        },
        dbsRef: formData.dbsRef.trim() || undefined,
        firstAidRef: formData.firstAidRef.trim() || undefined,
        medicalInfoDeclared: formData.medicalInfoDeclared,
        medicalInfoDetails: formData.medicalInfoDetails.trim() || undefined,
        isFirstAider: formData.isFirstAider,
        dietaryRequirements: formData.dietaryRequirements,
        occupation: formData.occupation.trim() || undefined,
        spokenLanguages: formData.spokenLanguages,
        originatingStateIndia: formData.originatingStateIndia.trim() || undefined,
        adminRole: formData.adminRole || undefined,
        responsibilityType: formData.responsibilityType as Member['responsibilityType'],
        responsibilityLevel: formData.responsibilityLevel as Member['responsibilityLevel'],
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
          <SectionCard>
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

          <SectionCard>
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

          <SectionCard>
            <SectionHeader icon={Users} title="Emergency Contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>Contact Name</FormLabel><FormInput value={formData.emergencyContactName} onChange={set('emergencyContactName')} /></FormField>
              <FormField><FormLabel required>Contact Phone Number</FormLabel><FormInput type="tel" value={formData.emergencyContactPhone} onChange={set('emergencyContactPhone')} /></FormField>
              <FormField><FormLabel required>Contact Email</FormLabel><FormInput type="email" value={formData.emergencyContactEmail} onChange={set('emergencyContactEmail')} /></FormField>
              <FormField><FormLabel required>Contact Relationship</FormLabel><FormInput value={formData.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} /></FormField>
            </div>
          </SectionCard>

          {isMinor && (
            <SectionCard>
              <SectionHeader icon={Users} title="Parent / Guardian Approval Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField><FormLabel required>Parent / Guardian Name</FormLabel><FormInput value={formData.guardianName} onChange={set('guardianName')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Phone Number</FormLabel><FormInput type="tel" value={formData.guardianPhone} onChange={set('guardianPhone')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Email</FormLabel><FormInput type="email" value={formData.guardianEmail} onChange={set('guardianEmail')} /></FormField>
                <FormField><FormLabel required>Parent / Guardian Relationship</FormLabel><FormInput value={formData.guardianRelationship} onChange={set('guardianRelationship')} /></FormField>
              </div>
            </SectionCard>
          )}

          <SectionCard>
            <SectionHeader icon={HeartPulse} title="Other Information" />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input type="checkbox" checked={formData.medicalInfoDeclared} onChange={setBoolean('medicalInfoDeclared')} className="w-4 h-4 accent-primary-600" />
                  Medical information declared
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input type="checkbox" checked={formData.isFirstAider} onChange={setBoolean('isFirstAider')} className="w-4 h-4 accent-primary-600" />
                  First aider for Shakha / HSS (UK)
                </label>
                <FormField className="md:col-span-2"><FormLabel>Medical Information Details</FormLabel><FormTextarea rows={3} value={formData.medicalInfoDetails} onChange={set('medicalInfoDetails')} /></FormField>
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

              <div>
                <FormLabel>Spoken Language(s)</FormLabel>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPOKEN_LANGUAGE_OPTIONS.map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <input type="checkbox" checked={formData.spokenLanguages.includes(item)} onChange={() => toggleSpokenLanguage(item)} className="w-4 h-4 accent-primary-600" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader icon={Building2} title="Organisational Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel required>Country / Organisation</FormLabel><FormSelect value={formData.country} onChange={set('country')}><option value="">Select country</option>{MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Vibhag (Region)</FormLabel><FormSelect value={formData.region} onChange={set('region')} disabled={!formData.country}><option value="">{formData.country ? 'Select region' : 'Select country first'}</option>{regionOptions.map(r => <option key={r} value={r}>{r}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Nagar (Town)</FormLabel><FormSelect value={formData.town} onChange={set('town')} disabled={!formData.region}><option value="">{formData.region ? 'Select town' : 'Select region first'}</option>{townOptions.map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></FormField>
              <FormField><FormLabel required>Shakha (Branch)</FormLabel><FormSelect value={formData.activityCentre} onChange={set('activityCentre')} disabled={!formData.town}><option value="">{formData.town ? 'Select shakha' : 'Select town first'}</option>{centreOptions.map(c => <option key={c} value={c}>{c}</option>)}</FormSelect></FormField>
              <FormField>
                <FormLabel required>Job Title (HSS Role)</FormLabel>
                <FormSelect value={formData.jobTitle} onChange={set('jobTitle')}>
                  {ROLE_TYPE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                </FormSelect>
              </FormField>
              <FormField><FormLabel required>Organisational Role</FormLabel><FormInput value={formData.orgRole} onChange={set('orgRole')} /></FormField>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader icon={Shield} title="Compliance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField><FormLabel>DBS Status</FormLabel><FormSelect value={formData.dbsStatus} onChange={set('dbsStatus')}><option value="pending">Pending</option><option value="completed">Completed</option></FormSelect></FormField>
              <FormField><FormLabel>DBS Reference Number</FormLabel><FormInput value={formData.dbsRef} onChange={set('dbsRef')} /></FormField>
              <FormField><FormLabel>First Aid Status</FormLabel><FormSelect value={formData.firstAidStatus} onChange={set('firstAidStatus')}><option value="pending">Pending</option><option value="completed">Completed</option></FormSelect></FormField>
              <FormField><FormLabel>First Aid Reference Number</FormLabel><FormInput value={formData.firstAidRef} onChange={set('firstAidRef')} /></FormField>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed">
              The profile first-aider flag is separate from the First Aid compliance certificate status.
            </p>
          </SectionCard>

          <SectionCard>
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
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <FormField>
                <FormLabel>Role</FormLabel>
                <FormSelect value={formData.adminRole} onChange={set('adminRole')}>
                  <option value="">— Select Role —</option>
                  {ADMIN_ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                </FormSelect>
              </FormField>
              <FormField>
                <FormLabel>Responsibility Type</FormLabel>
                <FormSelect value={formData.responsibilityType} onChange={set('responsibilityType')}>
                  {RESPONSIBILITY_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </FormSelect>
              </FormField>
              <FormField>
                <FormLabel>Level</FormLabel>
                <FormSelect value={formData.responsibilityLevel} onChange={set('responsibilityLevel')}>
                  {RESPONSIBILITY_LEVEL_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </FormSelect>
              </FormField>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Important Note</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
              Updating a member's profile will sync changes across all HSS platforms. Changes to membership status take effect immediately and may affect access to events, Shakha sessions, and the member portal.
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
