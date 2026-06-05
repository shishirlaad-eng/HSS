import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, FileText, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  DIETARY_REQUIREMENTS,
  type DietaryRequirement,
  getAge,
  getAgeGroupLabel,
  getMemberTypeFromAge,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import { mockStaticPages } from '../../mockAPI/staticPagesData';
import {
  FormCard,
  FormField,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from './hb/common';
import { PrimaryButton } from './hb/listing';

interface RegistrationForm {
  firstName: string;
  middleName: string;
  surname: string;
  dateOfBirth: string;
  gender: '' | 'male' | 'female';
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
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  medicalInfoDeclared: boolean;
  medicalInfoDetails: string;
  isFirstAider: boolean;
  dietaryRequirements: DietaryRequirement[];
  occupation: string;
  originatingStateIndia: string;
  acceptedTerms: boolean;
}

const EMPTY_FORM: RegistrationForm = {
  firstName: '',
  middleName: '',
  surname: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  secondaryEmail: '',
  phone: '',
  secondaryPhone: '',
  buildingName: '',
  addressLine1: '',
  addressLine2: '',
  contactTownCity: '',
  postCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
  emergencyContactRelationship: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  guardianRelationship: '',
  country: 'HSS UK',
  region: '',
  town: '',
  activityCentre: '',
  medicalInfoDeclared: false,
  medicalInfoDetails: '',
  isFirstAider: false,
  dietaryRequirements: [],
  occupation: '',
  originatingStateIndia: '',
  acceptedTerms: false,
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
      <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-xs text-[#BC0F1C] mt-1">{children}</p>;
}

function valueOrDash(value?: string | boolean | string[]) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value && value.trim() ? value : '-';
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900 dark:text-white">{children}</p>
    </div>
  );
}

function PageModal({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const page = mockStaticPages.find(item => item.slug === slug);
  if (!slug || !page) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{page.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto slim-scroll">
          {page.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-sm leading-6 text-neutral-700 dark:text-neutral-300 mb-4 last:mb-0 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MemberRegistration({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activePolicySlug, setActivePolicySlug] = useState<string | null>(null);

  const derivedMemberType = form.dateOfBirth ? getMemberTypeFromAge(form.dateOfBirth) : null;
  const needsGuardian = derivedMemberType === 'teen' || derivedMemberType === 'child';
  const regionOptions = useMemo(() => (MASTERS_CASCADE.regions[form.country] ?? []), [form.country]);
  const townOptions = useMemo(() => (MASTERS_CASCADE.towns[form.region] ?? []), [form.region]);
  const centreOptions = useMemo(() => (MASTERS_CASCADE.centres[form.town] ?? []), [form.town]);

  const set = (key: keyof RegistrationForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: value };
        if (key === 'country') {
          next.region = '';
          next.town = '';
          next.activityCentre = '';
        }
        if (key === 'region') {
          next.town = '';
          next.activityCentre = '';
        }
        if (key === 'town') next.activityCentre = '';
        return next;
      });
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const setBoolean = (key: 'medicalInfoDeclared' | 'isFirstAider' | 'acceptedTerms') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: event.target.checked }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const toggleDietaryRequirement = (value: DietaryRequirement) => {
    setForm(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(value)
        ? prev.dietaryRequirements.filter(item => item !== value)
        : [...prev.dietaryRequirements, value],
    }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegistrationForm, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.surname.trim()) nextErrors.surname = 'Surname is required.';
    if (!form.dateOfBirth) nextErrors.dateOfBirth = 'Date of birth is required.';
    if (!form.gender) nextErrors.gender = 'Gender is required.';
    if (!form.email.trim()) nextErrors.email = 'Primary email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.secondaryEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.secondaryEmail)) nextErrors.secondaryEmail = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Primary contact number is required.';
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'Address line 1 is required.';
    if (!form.contactTownCity.trim()) nextErrors.contactTownCity = 'Town / city is required.';
    if (!form.postCode.trim()) nextErrors.postCode = 'Post code is required.';
    if (!form.emergencyContactName.trim()) nextErrors.emergencyContactName = 'Emergency contact name is required.';
    if (!form.emergencyContactPhone.trim()) nextErrors.emergencyContactPhone = 'Emergency contact phone is required.';
    if (!form.emergencyContactEmail.trim()) nextErrors.emergencyContactEmail = 'Emergency contact email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.emergencyContactEmail)) nextErrors.emergencyContactEmail = 'Enter a valid email address.';
    if (!form.emergencyContactRelationship.trim()) nextErrors.emergencyContactRelationship = 'Relationship is required.';
    if (!form.country) nextErrors.country = 'Country / organisation is required.';
    if (!form.region) nextErrors.region = 'Vibhag / region is required.';
    if (!form.town) nextErrors.town = 'Nagar / town is required.';
    if (!form.activityCentre) nextErrors.activityCentre = 'Shakha / activity centre is required.';
    if (needsGuardian && !form.guardianName.trim()) nextErrors.guardianName = 'Parent / guardian name is required.';
    if (needsGuardian && !form.guardianPhone.trim()) nextErrors.guardianPhone = 'Parent / guardian phone is required.';
    if (needsGuardian && !form.guardianEmail.trim()) nextErrors.guardianEmail = 'Parent / guardian email is required.';
    else if (form.guardianEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.guardianEmail)) nextErrors.guardianEmail = 'Enter a valid email address.';
    if (needsGuardian && !form.guardianRelationship.trim()) nextErrors.guardianRelationship = 'Parent / guardian relationship is required.';
    if (!form.acceptedTerms) nextErrors.acceptedTerms = 'You must accept the Terms & Conditions and Privacy Policy.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Member registration submitted for review.');
  };

  if (submitted) {
    const fullName = [form.firstName, form.middleName, form.surname].map(part => part.trim()).filter(Boolean).join(' ');
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Your registration has been submitted and is pending review.</p>
          </div>
          <span className="inline-flex items-center w-fit px-3 py-1 rounded-full border border-[#fde68a] bg-[#fffbeb] text-xs font-medium text-[#d97706]">
            Pending Approval
          </span>
        </div>

        <div className="space-y-5">
          <Section title="Personal Information">
            <InfoItem label="First Name">{valueOrDash(form.firstName)}</InfoItem>
            <InfoItem label="Middle Name">{valueOrDash(form.middleName)}</InfoItem>
            <InfoItem label="Surname">{valueOrDash(form.surname)}</InfoItem>
            <InfoItem label="Full Name">{valueOrDash(fullName)}</InfoItem>
            <InfoItem label="Gender">{form.gender ? form.gender[0].toUpperCase() + form.gender.slice(1) : '-'}</InfoItem>
            <InfoItem label="Date of Birth">
              {form.dateOfBirth ? `${new Date(form.dateOfBirth).toLocaleDateString('en-GB')} (Age: ${getAge(form.dateOfBirth)})` : '-'}
            </InfoItem>
            <InfoItem label="Age Groups (years old)">{form.dateOfBirth ? getAgeGroupLabel(form.dateOfBirth) : '-'}</InfoItem>
            <InfoItem label="Occupation">{valueOrDash(form.occupation)}</InfoItem>
          </Section>

          <Section title="Contact Information">
            <InfoItem label="Primary Email Address">{valueOrDash(form.email)}</InfoItem>
            <InfoItem label="Secondary Email Address">{valueOrDash(form.secondaryEmail)}</InfoItem>
            <InfoItem label="Primary Contact Number">{valueOrDash(form.phone)}</InfoItem>
            <InfoItem label="Secondary Contact Number">{valueOrDash(form.secondaryPhone)}</InfoItem>
            <InfoItem label="Building Name">{valueOrDash(form.buildingName)}</InfoItem>
            <InfoItem label="Address Line 1">{valueOrDash(form.addressLine1)}</InfoItem>
            <InfoItem label="Address Line 2">{valueOrDash(form.addressLine2)}</InfoItem>
            <InfoItem label="Town / City">{valueOrDash(form.contactTownCity)}</InfoItem>
            <InfoItem label="Post Code">{valueOrDash(form.postCode)}</InfoItem>
          </Section>

          <Section title="Emergency Contact">
            <InfoItem label="Name">{valueOrDash(form.emergencyContactName)}</InfoItem>
            <InfoItem label="Phone">{valueOrDash(form.emergencyContactPhone)}</InfoItem>
            <InfoItem label="Email">{valueOrDash(form.emergencyContactEmail)}</InfoItem>
            <InfoItem label="Relationship">{valueOrDash(form.emergencyContactRelationship)}</InfoItem>
          </Section>

          {needsGuardian && (
            <Section title="Parent / Guardian Approval Information">
              <InfoItem label="Parent / Guardian Name">{valueOrDash(form.guardianName)}</InfoItem>
              <InfoItem label="Phone">{valueOrDash(form.guardianPhone)}</InfoItem>
              <InfoItem label="Email">{valueOrDash(form.guardianEmail)}</InfoItem>
              <InfoItem label="Relationship">{valueOrDash(form.guardianRelationship)}</InfoItem>
            </Section>
          )}

          <Section title="Other Information">
            <InfoItem label="Medical Information Declared">{valueOrDash(form.medicalInfoDeclared)}</InfoItem>
            <InfoItem label="Medical Details">{valueOrDash(form.medicalInfoDetails)}</InfoItem>
            <InfoItem label="First Aider for Shakha / HSS UK">{valueOrDash(form.isFirstAider)}</InfoItem>
            <InfoItem label="Dietary Requirements">{valueOrDash(form.dietaryRequirements)}</InfoItem>
            <InfoItem label="Originating State in India">{valueOrDash(form.originatingStateIndia)}</InfoItem>
          </Section>

          <Section title="Organisation Details">
            <InfoItem label="Country / Organisation">{valueOrDash(form.country)}</InfoItem>
            <InfoItem label="Vibhag / Region">{valueOrDash(form.region)}</InfoItem>
            <InfoItem label="Nagar / Town">{valueOrDash(form.town)}</InfoItem>
            <InfoItem label="Shakha / Activity Centre">{valueOrDash(form.activityCentre)}</InfoItem>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Member Registration</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Submit your HSS UK membership details for approval.</p>
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-4 h-4" />
          Secure membership intake
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Personal Information">
          <FormField>
            <FormLabel required>First Name</FormLabel>
            <FormInput value={form.firstName} onChange={set('firstName')} />
            <ErrorText>{errors.firstName}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel>Middle Name</FormLabel>
            <FormInput value={form.middleName} onChange={set('middleName')} />
          </FormField>
          <FormField>
            <FormLabel required>Surname</FormLabel>
            <FormInput value={form.surname} onChange={set('surname')} />
            <ErrorText>{errors.surname}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Date of Birth</FormLabel>
            <FormInput type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            <ErrorText>{errors.dateOfBirth}</ErrorText>
            {form.dateOfBirth && (
              <p className="text-xs text-neutral-500 mt-1">
                Age: {getAge(form.dateOfBirth)} years · {getAgeGroupLabel(form.dateOfBirth)}
              </p>
            )}
          </FormField>
          <FormField>
            <FormLabel required>Gender</FormLabel>
            <FormSelect value={form.gender} onChange={set('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </FormSelect>
            <ErrorText>{errors.gender}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel>Occupation</FormLabel>
            <FormInput value={form.occupation} onChange={set('occupation')} />
          </FormField>
        </Section>

        <Section title="Contact Information">
          <FormField>
            <FormLabel required>Primary Email Address</FormLabel>
            <FormInput type="email" value={form.email} onChange={set('email')} />
            <ErrorText>{errors.email}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel>Secondary Email Address</FormLabel>
            <FormInput type="email" value={form.secondaryEmail} onChange={set('secondaryEmail')} />
            <ErrorText>{errors.secondaryEmail}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Primary Contact Number</FormLabel>
            <FormInput type="tel" value={form.phone} onChange={set('phone')} />
            <ErrorText>{errors.phone}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel>Secondary Contact Number</FormLabel>
            <FormInput type="tel" value={form.secondaryPhone} onChange={set('secondaryPhone')} />
          </FormField>
          <FormField>
            <FormLabel>Building Name</FormLabel>
            <FormInput value={form.buildingName} onChange={set('buildingName')} />
          </FormField>
          <FormField>
            <FormLabel required>Address Line 1</FormLabel>
            <FormInput value={form.addressLine1} onChange={set('addressLine1')} />
            <ErrorText>{errors.addressLine1}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel>Address Line 2</FormLabel>
            <FormInput value={form.addressLine2} onChange={set('addressLine2')} />
          </FormField>
          <FormField>
            <FormLabel required>Town / City</FormLabel>
            <FormInput value={form.contactTownCity} onChange={set('contactTownCity')} />
            <ErrorText>{errors.contactTownCity}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Post Code</FormLabel>
            <FormInput value={form.postCode} onChange={set('postCode')} />
            <ErrorText>{errors.postCode}</ErrorText>
          </FormField>
        </Section>

        <Section title="Organisation Details">
          <FormField>
            <FormLabel required>Country / Organisation</FormLabel>
            <FormSelect value={form.country} onChange={set('country')}>
              {MASTERS_CASCADE.countries.map(country => <option key={country} value={country}>{country}</option>)}
            </FormSelect>
            <ErrorText>{errors.country}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Vibhag / Region</FormLabel>
            <FormSelect value={form.region} onChange={set('region')}>
              <option value="">Select region</option>
              {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
            </FormSelect>
            <ErrorText>{errors.region}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Nagar / Town</FormLabel>
            <FormSelect value={form.town} onChange={set('town')} disabled={!form.region}>
              <option value="">Select town</option>
              {townOptions.map(town => <option key={town} value={town}>{town}</option>)}
            </FormSelect>
            <ErrorText>{errors.town}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Shakha / Activity Centre</FormLabel>
            <FormSelect value={form.activityCentre} onChange={set('activityCentre')} disabled={!form.town}>
              <option value="">Select activity centre</option>
              {centreOptions.map(centre => <option key={centre} value={centre}>{centre}</option>)}
            </FormSelect>
            <ErrorText>{errors.activityCentre}</ErrorText>
          </FormField>
        </Section>

        <Section title="Emergency Contact">
          <FormField>
            <FormLabel required>Name</FormLabel>
            <FormInput value={form.emergencyContactName} onChange={set('emergencyContactName')} />
            <ErrorText>{errors.emergencyContactName}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Phone</FormLabel>
            <FormInput type="tel" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} />
            <ErrorText>{errors.emergencyContactPhone}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Email</FormLabel>
            <FormInput type="email" value={form.emergencyContactEmail} onChange={set('emergencyContactEmail')} />
            <ErrorText>{errors.emergencyContactEmail}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Relationship</FormLabel>
            <FormInput value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} />
            <ErrorText>{errors.emergencyContactRelationship}</ErrorText>
          </FormField>
        </Section>

        {needsGuardian && (
          <Section title="Parent / Guardian Approval Information">
            <FormField>
              <FormLabel required>Parent / Guardian Name</FormLabel>
              <FormInput value={form.guardianName} onChange={set('guardianName')} />
              <ErrorText>{errors.guardianName}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Phone</FormLabel>
              <FormInput type="tel" value={form.guardianPhone} onChange={set('guardianPhone')} />
              <ErrorText>{errors.guardianPhone}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Email</FormLabel>
              <FormInput type="email" value={form.guardianEmail} onChange={set('guardianEmail')} />
              <ErrorText>{errors.guardianEmail}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Relationship</FormLabel>
              <FormInput value={form.guardianRelationship} onChange={set('guardianRelationship')} />
              <ErrorText>{errors.guardianRelationship}</ErrorText>
            </FormField>
          </Section>
        )}

        <Section title="Other Information">
          <FormField className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.medicalInfoDeclared}
                onChange={setBoolean('medicalInfoDeclared')}
                className="w-4 h-4 accent-primary-600"
              />
              I have medical information to declare
            </label>
          </FormField>
          {form.medicalInfoDeclared && (
            <FormField className="md:col-span-2">
              <FormLabel>Medical Details</FormLabel>
              <FormTextarea value={form.medicalInfoDetails} onChange={set('medicalInfoDetails')} />
            </FormField>
          )}
          <FormField className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.isFirstAider}
                onChange={setBoolean('isFirstAider')}
                className="w-4 h-4 accent-primary-600"
              />
              I am a first aider for Shakha / HSS UK
            </label>
          </FormField>
          <FormField className="md:col-span-2">
            <FormLabel>Dietary Requirements</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIETARY_REQUIREMENTS.map(value => (
                <label key={value} className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={form.dietaryRequirements.includes(value)}
                    onChange={() => toggleDietaryRequirement(value)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  {value}
                </label>
              ))}
            </div>
          </FormField>
          <FormField>
            <FormLabel>Originating State in India</FormLabel>
            <FormInput value={form.originatingStateIndia} onChange={set('originatingStateIndia')} />
          </FormField>
        </Section>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={setBoolean('acceptedTerms')}
              className="w-4 h-4 mt-0.5 accent-primary-600"
            />
            <span>
              I confirm that the information provided is accurate and I agree to the{' '}
              <button type="button" onClick={() => setActivePolicySlug('terms-and-conditions')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => setActivePolicySlug('privacy-policy')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Privacy Policy
              </button>.
            </span>
          </label>
          <ErrorText>{errors.acceptedTerms}</ErrorText>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isSubmitting} className="justify-center">
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </PrimaryButton>
        </div>
      </form>

      <PageModal slug={activePolicySlug} onClose={() => setActivePolicySlug(null)} />
    </div>
  );
}
