// ─────────────────────────────────────────────────────────────
// HSS UK — Add Member (Super Admin > All Members > Add Members)
// Unified single-page registration form, mirroring the member's own
// "complete your registration" screen layout.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowLeft, Save, Send } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, FormSelect, FormTextarea, PhoneInput, ErrorText } from './hb/common';
import {
  Member,
  MemberType,
  DietaryRequirement,
  DIETARY_REQUIREMENTS,
  FirstAidQualification,
  FIRST_AID_QUALIFICATION_OPTIONS,
  MASTERS_CASCADE,
  ROLE_TYPE_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
  getAge,
  getAgeGroupLabel,
  getMemberTypeFromAge,
  generateMemberId,
} from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { toast } from 'sonner';

// ── Shakha search — picks the Shakha first (searchable), then derives
// Nagar/Vibhag read-only, mirroring MyProfile.tsx's Registration flow. ──
const ALL_SHAKHA_NAMES = Object.values(MASTERS_CASCADE.centres).flat();

function getLocationForCentre(activityCentre: string) {
  for (const [town, centres] of Object.entries(MASTERS_CASCADE.centres)) {
    if (!centres.includes(activityCentre)) continue;
    for (const [region, towns] of Object.entries(MASTERS_CASCADE.towns)) {
      if (towns.includes(town)) return { country: 'HSS UK', region, town, activityCentre };
    }
  }
  return null;
}

function ShakhaAutocomplete({ value, onChange, error }: {
  value: string;
  onChange: (centre: string) => void;
  error?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) { setRect(null); return; }
    const updateRect = () => {
      const r = inputRef.current?.getBoundingClientRect();
      if (r) setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  const suggestions = useMemo(() =>
    query.trim().length >= 1
      ? ALL_SHAKHA_NAMES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
      : ALL_SHAKHA_NAMES.slice(0, 8),
    [query],
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Type to search Shakhas…"
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        className={`w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30'
            : 'border-neutral-200 dark:border-neutral-800 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
        }`}
      />
      {open && rect && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[999] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          {suggestions.length > 0 ? suggestions.map(centre => (
            <button
              key={centre}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setQuery(centre); setOpen(false); onChange(centre); }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              {centre}
            </button>
          )) : (
            <div className="px-3 py-2 text-sm text-neutral-400 dark:text-neutral-500">No Shakhas found.</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

const OCCUPATION_OPTIONS = [
  'Student',
  'Homemaker',
  'Employed - Private Sector',
  'Employed - Public Sector',
  'Self-Employed / Business Owner',
  'Retired',
  'Unemployed',
  'Other - With box to specify',
];

const QUALIFIED_FIRST_AIDER_ROLES = new Set([
  'Super Admin', 'Member', 'Adult Member', 'Teen', 'Teen Member',
  'Shakha Admin', 'Nagar Admin', 'Vibhag Admin', 'Kendriya Admin',
]);

interface MemberAddForm {
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
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  medicalInfoDeclared: '' | 'yes' | 'no';
  medicalInfoDetails: string;
  allergiesDeclared: '' | 'yes' | 'no';
  allergies: string;
  dietaryRequirements: DietaryRequirement[];
  isFirstAider: '' | 'yes' | 'no';
  firstAidQualificationLevel: '' | FirstAidQualification;
  firstAidQualificationExpiryDate: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  occupation: string;
  occupationOther: string;
  spokenLanguages: string[];
  originatingStateIndia: string;
  additionalNotes: string;
}

const EMPTY_FORM: MemberAddForm = {
  firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '',
  email: '', secondaryEmail: '', phone: '', secondaryPhone: '',
  buildingName: '', addressLine1: '', addressLine2: '', contactTownCity: '', postCode: '',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactEmail: '', emergencyContactRelationship: '',
  guardianName: '', guardianPhone: '', guardianEmail: '', guardianRelationship: '',
  medicalInfoDeclared: '', medicalInfoDetails: '',
  allergiesDeclared: '', allergies: '',
  dietaryRequirements: [],
  isFirstAider: '', firstAidQualificationLevel: '', firstAidQualificationExpiryDate: '',
  country: '', region: '', town: '', activityCentre: '',
  occupation: '', occupationOther: '',
  spokenLanguages: [],
  originatingStateIndia: '',
  additionalNotes: '',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  );
}

export default function MemberAddPage({
  existingMembers,
  onBack,
  onSave,
}: {
  existingMembers: Member[];
  onBack: () => void;
  onSave: (member: Member) => void;
}) {
  const { selectedRole } = useRoleScope();
  const canEditQualifiedFirstAider = QUALIFIED_FIRST_AIDER_ROLES.has(selectedRole);
  const [form, setForm] = useState<MemberAddForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof MemberAddForm, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const calcAge = form.dateOfBirth ? getAge(form.dateOfBirth) : null;
  const derivedMemberType: MemberType | '' = form.dateOfBirth ? getMemberTypeFromAge(form.dateOfBirth) : '';


  const errCls = (has?: string) => has ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const set = (key: keyof MemberAddForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: val };
        if (key === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
        if (key === 'isFirstAider' && val !== 'yes') { next.firstAidQualificationLevel = ''; next.firstAidQualificationExpiryDate = ''; }
        if (key === 'medicalInfoDeclared' && val !== 'yes') { next.medicalInfoDetails = ''; }
        if (key === 'allergiesDeclared' && val !== 'yes') { next.allergies = ''; }
        if (key === 'occupation' && val !== 'Other - With box to specify') { next.occupationOther = ''; }
        return next;
      });
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof MemberAddForm, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'This field is required.';
    if (!form.lastName.trim())  e.lastName  = 'This field is required.';
    if (!form.dateOfBirth)    e.dateOfBirth = 'This field is required.';
    if (!form.gender)         e.gender = 'This field is required.';
    if (!form.email.trim())   e.email = 'This field is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    else if (existingMembers.some(m => m.email.toLowerCase() === form.email.trim().toLowerCase()))
      e.email = 'A member with this email already exists.';
    if (form.secondaryEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.secondaryEmail)) e.secondaryEmail = 'Enter a valid email address.';
    if (!form.phone.trim())   e.phone = 'This field is required.';
    if (!form.postCode.trim()) e.postCode = 'This field is required.';
    if (!form.addressLine1.trim()) e.addressLine1 = 'This field is required.';
    if (!form.contactTownCity.trim()) e.contactTownCity = 'This field is required.';
    if (!form.emergencyContactName.trim()) e.emergencyContactName = 'This field is required.';
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = 'This field is required.';
    if (!form.emergencyContactEmail.trim()) e.emergencyContactEmail = 'This field is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.emergencyContactEmail)) e.emergencyContactEmail = 'Enter a valid email address.';
    if (!form.emergencyContactRelationship.trim()) e.emergencyContactRelationship = 'This field is required.';
    if (!form.country)        e.country = 'This field is required.';
    if (!form.region)         e.region  = 'This field is required.';
    if (!form.town)           e.town    = 'This field is required.';
    if (!form.activityCentre) e.activityCentre = 'This field is required.';
    if (derivedMemberType === 'teen') {
      if (!form.guardianName.trim())  e.guardianName = 'Parent / guardian name is required.';
      if (!form.guardianPhone.trim()) e.guardianPhone = 'Parent / guardian phone is required.';
      if (!form.guardianEmail.trim()) e.guardianEmail = 'Parent / guardian email is required.';
      else if (!/^\S+@\S+\.\S+$/.test(form.guardianEmail)) e.guardianEmail = 'Enter a valid email address.';
      if (!form.guardianRelationship.trim()) e.guardianRelationship = 'Parent / guardian relationship is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMember = (status: Member['status']): Member => {
    const memberType = derivedMemberType || 'adult';
    const occupation = form.occupation === 'Other - With box to specify'
      ? form.occupationOther.trim() || undefined
      : form.occupation || undefined;
    return {
      id: generateMemberId(),
      memberType,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      surname: form.lastName.trim(),
      name: [form.firstName, form.middleName, form.lastName].map(p => p.trim()).filter(Boolean).join(' '),
      email: form.email.trim(),
      secondaryEmail: form.secondaryEmail.trim() || undefined,
      phone: form.phone.trim() || undefined,
      secondaryPhone: form.secondaryPhone.trim() || undefined,
      guardianName: form.guardianName.trim() || undefined,
      guardianPhone: form.guardianPhone.trim() || undefined,
      guardianEmail: form.guardianEmail.trim() || undefined,
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
      gender: (form.gender || 'male') as 'male' | 'female',
      jobTitle: ROLE_TYPE_OPTIONS[0],
      orgRole: memberType === 'adult' ? 'Member' : memberType === 'teen' ? 'Teen Member' : 'Child Member',
      country: form.country,
      region: form.region,
      town: form.town,
      activityCentre: form.activityCentre,
      status,
      registrationDate: new Date().toISOString(),
      compliance: {
        dbs: 'Pending',
        firstAid: 'Expired',
        safeguardingTraining: 'Expired',
        parentalConsent: memberType === 'teen' || memberType === 'child' ? 'pending' : 'n/a',
      },
      medicalInfoDeclared: form.medicalInfoDeclared === 'yes',
      medicalInfoDetails: form.medicalInfoDeclared === 'yes' ? (form.medicalInfoDetails.trim() || undefined) : undefined,
      allergiesDeclared: form.allergiesDeclared === 'yes',
      allergies: form.allergiesDeclared === 'yes' ? (form.allergies.trim() || undefined) : undefined,
      isFirstAider: canEditQualifiedFirstAider && form.isFirstAider === 'yes',
      firstAidQualificationLevel: canEditQualifiedFirstAider && form.isFirstAider === 'yes'
        ? form.firstAidQualificationLevel || undefined
        : undefined,
      firstAidQualificationExpiryDate: canEditQualifiedFirstAider && form.isFirstAider === 'yes'
        ? form.firstAidQualificationExpiryDate || undefined
        : undefined,
      dietaryRequirements: form.dietaryRequirements,
      occupation,
      spokenLanguages: form.spokenLanguages.length ? form.spokenLanguages : undefined,
      originatingStateIndia: form.originatingStateIndia.trim() || undefined,
      additionalNotes: form.additionalNotes.trim() || undefined,
      eventsAttended: 0,
      shakhaSessionsAttended: 0,
    };
  };

  const handleSaveAsDraft = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) {
      setErrors(prev => ({
        ...prev,
        firstName: !form.firstName.trim() ? 'This field is required.' : prev.firstName,
        lastName:  !form.lastName.trim()  ? 'This field is required.' : prev.lastName,
        dateOfBirth: !form.dateOfBirth    ? 'This field is required.' : prev.dateOfBirth,
      }));
      toast.error('Enter at least the name and date of birth to save a draft.');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setIsSaving(false);
    onSave(buildMember('inactive'));
    toast.success('Member saved as draft.');
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    const memberType = derivedMemberType || 'adult';
    onSave(buildMember(memberType === 'teen' || memberType === 'child' ? 'pending-parental-consent' : 'pending'));
    toast.success('Member submitted for approval.');
  };

  const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Add Member';

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Members
        </button>

        <div className="flex items-start justify-between gap-4 mb-5">
          <h1 className="text-[32px] font-bold text-neutral-900 dark:text-white leading-tight" style={{ fontFamily: "'Ramilias', serif" }}>
            {displayName}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SecondaryButton icon={Save} onClick={handleSaveAsDraft} disabled={isSaving}>
              Save as Draft
            </SecondaryButton>
            <PrimaryButton icon={Send} onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Submitting…' : 'Submit for Approval'}
            </PrimaryButton>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-6">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Complete all required fields and submit the registration for approval by the Shakha Karyawaha. Once approved, the member can access all features of MyHSS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal Details */}
          <Card title="Personal Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>First Name</FormLabel>
                <FormInput value={form.firstName} onChange={set('firstName')} placeholder="First name" className={errCls(errors.firstName)} />
                <ErrorText>{errors.firstName}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel>Middle Name</FormLabel>
                <FormInput value={form.middleName} onChange={set('middleName')} placeholder="Middle name" />
              </FormField>
              <FormField>
                <FormLabel required>Gender</FormLabel>
                <FormSelect value={form.gender} onChange={set('gender')} className={errCls(errors.gender)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </FormSelect>
                <ErrorText>{errors.gender}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Last Name</FormLabel>
                <FormInput value={form.lastName} onChange={set('lastName')} placeholder="Last name" className={errCls(errors.lastName)} />
                <ErrorText>{errors.lastName}</ErrorText>
              </FormField>
              <FormField className="sm:col-span-2">
                <FormLabel required>Date of Birth</FormLabel>
                <FormInput type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={errCls(errors.dateOfBirth)} />
                <ErrorText>{errors.dateOfBirth}</ErrorText>
                {calcAge !== null && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Age: <span className="font-medium text-neutral-700 dark:text-neutral-300">{calcAge} years</span> · {getAgeGroupLabel(form.dateOfBirth)}
                  </p>
                )}
              </FormField>
            </div>
          </Card>

          {/* Contact Details */}
          <Card title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>Contact Number</FormLabel>
                <PhoneInput value={form.phone} onChange={v => setForm(prev => ({ ...prev, phone: v }))} placeholder="7700 000000" error={!!errors.phone} />
                <ErrorText>{errors.phone}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Email Address</FormLabel>
                <FormInput type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" className={errCls(errors.email)} />
                <ErrorText>{errors.email}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Post Code</FormLabel>
                <FormInput value={form.postCode} onChange={set('postCode')} placeholder="Post code" className={errCls(errors.postCode)} />
                <ErrorText>{errors.postCode}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel>Building Name</FormLabel>
                <FormInput value={form.buildingName} onChange={set('buildingName')} placeholder="Building name" />
              </FormField>
              <FormField>
                <FormLabel required>Address Line 1</FormLabel>
                <FormInput value={form.addressLine1} onChange={set('addressLine1')} placeholder="Address line 1" className={errCls(errors.addressLine1)} />
                <ErrorText>{errors.addressLine1}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel>Address Line 2</FormLabel>
                <FormInput value={form.addressLine2} onChange={set('addressLine2')} placeholder="Address line 2" />
              </FormField>
              <FormField className="sm:col-span-2">
                <FormLabel required>Town / City</FormLabel>
                <FormInput value={form.contactTownCity} onChange={set('contactTownCity')} placeholder="Town / City" className={errCls(errors.contactTownCity)} />
                <ErrorText>{errors.contactTownCity}</ErrorText>
              </FormField>
            </div>
          </Card>

          {/* Emergency Contact Details */}
          <Card title="Emergency Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>Contact Name</FormLabel>
                <FormInput value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="Emergency contact name" className={errCls(errors.emergencyContactName)} />
                <ErrorText>{errors.emergencyContactName}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Contact Phone Number</FormLabel>
                <PhoneInput value={form.emergencyContactPhone} onChange={v => setForm(prev => ({ ...prev, emergencyContactPhone: v }))} placeholder="7700 000000" error={!!errors.emergencyContactPhone} />
                <ErrorText>{errors.emergencyContactPhone}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Contact Email</FormLabel>
                <FormInput type="email" value={form.emergencyContactEmail} onChange={set('emergencyContactEmail')} placeholder="emergency@example.com" className={errCls(errors.emergencyContactEmail)} />
                <ErrorText>{errors.emergencyContactEmail}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Contact Relationship</FormLabel>
                <FormInput value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} placeholder="e.g. Spouse" className={errCls(errors.emergencyContactRelationship)} />
                <ErrorText>{errors.emergencyContactRelationship}</ErrorText>
              </FormField>

              {derivedMemberType === 'teen' && (
                <>
                  <FormField>
                    <FormLabel required>Parent / Guardian Name</FormLabel>
                    <FormInput value={form.guardianName} onChange={set('guardianName')} placeholder="Guardian name" className={errCls(errors.guardianName)} />
                    <ErrorText>{errors.guardianName}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Parent / Guardian Phone Number</FormLabel>
                    <PhoneInput value={form.guardianPhone} onChange={v => setForm(prev => ({ ...prev, guardianPhone: v }))} placeholder="7700 000000" error={!!errors.guardianPhone} />
                    <ErrorText>{errors.guardianPhone}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Parent / Guardian Email</FormLabel>
                    <FormInput type="email" value={form.guardianEmail} onChange={set('guardianEmail')} placeholder="guardian@example.com" className={errCls(errors.guardianEmail)} />
                    <ErrorText>{errors.guardianEmail}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Parent / Guardian Relationship</FormLabel>
                    <FormInput value={form.guardianRelationship} onChange={set('guardianRelationship')} placeholder="Relationship" className={errCls(errors.guardianRelationship)} />
                    <ErrorText>{errors.guardianRelationship}</ErrorText>
                  </FormField>
                </>
              )}
            </div>
          </Card>

          {/* Medical Details */}
          <Card title="Medical Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>Do you have any medical conditions?</FormLabel>
                <FormSelect value={form.medicalInfoDeclared} onChange={set('medicalInfoDeclared')}>
                  <option value="">Select option</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </FormSelect>
              </FormField>
              <FormField>
                <FormLabel required>Do you have any allergies?</FormLabel>
                <FormSelect value={form.allergiesDeclared} onChange={set('allergiesDeclared')}>
                  <option value="">Select option</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </FormSelect>
              </FormField>
              {form.medicalInfoDeclared === 'yes' && (
                <FormField className="sm:col-span-2">
                  <FormLabel>Medical Condition Details</FormLabel>
                  <FormTextarea rows={2} value={form.medicalInfoDetails} onChange={set('medicalInfoDetails')} placeholder="Details of medical condition(s)" />
                </FormField>
              )}
              {form.allergiesDeclared === 'yes' && (
                <FormField className="sm:col-span-2">
                  <FormLabel>Allergy Details</FormLabel>
                  <FormTextarea rows={2} value={form.allergies} onChange={set('allergies')} placeholder="Details of allergies" />
                </FormField>
              )}
              <FormField className="sm:col-span-2">
                <FormLabel>Special Dietary Requirements</FormLabel>
                <FormSelect
                  value={form.dietaryRequirements[0] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, dietaryRequirements: e.target.value ? [e.target.value as DietaryRequirement] : [] }))}
                >
                  <option value="">Select option</option>
                  {DIETARY_REQUIREMENTS.map(item => <option key={item} value={item}>{item}</option>)}
                </FormSelect>
              </FormField>
            </div>
          </Card>

          {/* First Aid */}
          <Card title="First Aid">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField className={canEditQualifiedFirstAider ? '' : 'sm:col-span-2'}>
                <FormLabel required>Are you a first aider for HSS?</FormLabel>
                <FormSelect value={form.isFirstAider} onChange={set('isFirstAider')} disabled={!canEditQualifiedFirstAider}>
                  <option value="">Select option</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </FormSelect>
              </FormField>
              {canEditQualifiedFirstAider && form.isFirstAider === 'yes' && (
                <>
                  <FormField>
                    <FormLabel>Level of Qualification</FormLabel>
                    <FormSelect value={form.firstAidQualificationLevel} onChange={set('firstAidQualificationLevel')}>
                      <option value="">Select qualification</option>
                      {FIRST_AID_QUALIFICATION_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>Qualification Expiry Date</FormLabel>
                    <FormInput type="date" value={form.firstAidQualificationExpiryDate} onChange={set('firstAidQualificationExpiryDate')} />
                  </FormField>
                </>
              )}
            </div>
          </Card>

          {/* Shakha Details */}
          <Card title="Shakha Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField>
                <FormLabel required>Shakha</FormLabel>
                <ShakhaAutocomplete
                  value={form.activityCentre}
                  error={!!errors.activityCentre}
                  onChange={centre => {
                    const loc = getLocationForCentre(centre);
                    setForm(prev => ({
                      ...prev,
                      activityCentre: centre,
                      town: loc?.town ?? '',
                      region: loc?.region ?? '',
                    }));
                  }}
                />
                <ErrorText>{errors.activityCentre}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel>Nagar</FormLabel>
                <FormInput value={form.town} readOnly disabled placeholder="Derived from Shakha" />
              </FormField>
              <FormField>
                <FormLabel>Vibhag</FormLabel>
                <FormInput value={form.region} readOnly disabled placeholder="Derived from Shakha" />
              </FormField>
              <FormField>
                <FormLabel required>Country</FormLabel>
                <FormSelect value={form.country} onChange={set('country')} className={errCls(errors.country)}>
                  <option value="">Select country</option>
                  {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
                </FormSelect>
                <ErrorText>{errors.country}</ErrorText>
              </FormField>
            </div>
          </Card>

          {/* Other Information */}
          <Card title="Other Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel>Occupation</FormLabel>
                <FormSelect value={form.occupation} onChange={set('occupation')}>
                  <option value="">Select option</option>
                  {OCCUPATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </FormSelect>
                {form.occupation === 'Other - With box to specify' && (
                  <FormInput className="mt-2" value={form.occupationOther} onChange={set('occupationOther')} placeholder="Specify occupation" />
                )}
              </FormField>
              <FormField>
                <FormLabel>Originating State in India</FormLabel>
                <FormInput value={form.originatingStateIndia} onChange={set('originatingStateIndia')} placeholder="State" />
              </FormField>
              <FormField className="sm:col-span-2">
                <FormLabel>Additional Notes / Comments</FormLabel>
                <FormTextarea rows={3} value={form.additionalNotes} onChange={set('additionalNotes')} placeholder="Anything else worth noting" />
              </FormField>
              <FormField className="sm:col-span-2">
                <FormLabel>Spoken Language(s)</FormLabel>
                <FormSelect
                  value={form.spokenLanguages[0] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, spokenLanguages: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Select option</option>
                  {SPOKEN_LANGUAGE_OPTIONS.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </FormSelect>
              </FormField>
            </div>
          </Card>

        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <SecondaryButton icon={Save} onClick={handleSaveAsDraft} disabled={isSaving}>
            Save as Draft
          </SecondaryButton>
          <PrimaryButton icon={Send} onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Submitting…' : 'Submit for Approval'}
          </PrimaryButton>
        </div>

      </div>
    </div>
  );
}
