import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, FileText, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAge,
  getAgeGroupLabel,
  MASTERS_CASCADE,
} from '../../mockAPI/membersData';
import { mockStaticPages } from '../../mockAPI/staticPagesData';
import {
  FormField,
  FormInput,
  FormLabel,
  FormSelect,
} from './hb/common';
import { PrimaryButton } from './hb/listing';

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  acceptedTerms: boolean;
}

const EMPTY_FORM: RegistrationForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  country: 'HSS UK',
  region: '',
  town: '',
  activityCentre: '',
  acceptedTerms: false,
};

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-xs text-[#BC0F1C] mt-1">{children}</p>;
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900 dark:text-white">{children}</p>
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
      <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function PageModal({ slug, onClose }: { slug: string | null; onClose: () => void }) {
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
          <button type="button" onClick={onClose} className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
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

  const regionOptions  = useMemo(() => MASTERS_CASCADE.regions[form.country]  ?? [], [form.country]);
  const townOptions    = useMemo(() => MASTERS_CASCADE.towns[form.region]      ?? [], [form.region]);
  const centreOptions  = useMemo(() => MASTERS_CASCADE.centres[form.town]      ?? [], [form.town]);

  const set = (key: keyof RegistrationForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: value };
        if (key === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
        if (key === 'region')  { next.town = ''; next.activityCentre = ''; }
        if (key === 'town')    { next.activityCentre = ''; }
        return next;
      });
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const validate = () => {
    const e: Partial<Record<keyof RegistrationForm, string>> = {};
    if (!form.firstName.trim())    e.firstName     = 'First name is required.';
    if (!form.lastName.trim())     e.lastName      = 'Last name is required.';
    if (!form.email.trim() && !form.phone.trim())
                                   e.email         = 'Email or phone number is required.';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email))
                                   e.email         = 'Enter a valid email address.';
    if (!form.dateOfBirth)         e.dateOfBirth   = 'Date of birth is required.';
    if (!form.country)             e.country       = 'Country / organisation is required.';
    if (!form.region)              e.region        = 'Region is required.';
    if (!form.town)                e.town          = 'Town is required.';
    if (!form.activityCentre)      e.activityCentre = 'Activity centre is required.';
    if (!form.acceptedTerms)       e.acceptedTerms = 'You must accept the Terms & Conditions and Privacy Policy.';
    setErrors(e);
    return Object.keys(e).length === 0;
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
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-5">
          <button type="button" onClick={onBackToLogin} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Registration Submitted</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Your application is pending review.</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#fde68a] bg-[#fffbeb] text-xs font-medium text-[#d97706]">
              Pending Approval
            </span>
          </div>
        </div>
        <div className="space-y-5">
          <InfoSection title="Personal Information">
            <InfoItem label="First Name">{form.firstName}</InfoItem>
            <InfoItem label="Last Name">{form.lastName}</InfoItem>
            <InfoItem label="Date of Birth">
              {form.dateOfBirth
                ? `${new Date(form.dateOfBirth).toLocaleDateString('en-GB')} · Age ${getAge(form.dateOfBirth)} · ${getAgeGroupLabel(form.dateOfBirth)}`
                : '—'}
            </InfoItem>
          </InfoSection>
          <InfoSection title="Contact">
            <InfoItem label="Email">{form.email || '—'}</InfoItem>
            <InfoItem label="Phone">{form.phone || '—'}</InfoItem>
          </InfoSection>
          <InfoSection title="Organisation">
            <InfoItem label="Country / Organisation">{form.country}</InfoItem>
            <InfoItem label="Region">{form.region}</InfoItem>
            <InfoItem label="Town">{form.town}</InfoItem>
            <InfoItem label="Activity Centre">{form.activityCentre}</InfoItem>
          </InfoSection>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={onBackToLogin} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Member Registration</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Submit your details for HSS UK membership.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4" />
            Secure
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden mb-5">

          {/* Personal */}
          <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Personal</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>First Name</FormLabel>
              <FormInput value={form.firstName} onChange={set('firstName')} placeholder="e.g. Arjun" />
              <ErrorText>{errors.firstName}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Last Name</FormLabel>
              <FormInput value={form.lastName} onChange={set('lastName')} placeholder="e.g. Sharma" />
              <ErrorText>{errors.lastName}</ErrorText>
            </FormField>
            <FormField className="sm:col-span-2">
              <FormLabel required>Date of Birth</FormLabel>
              <FormInput type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              <ErrorText>{errors.dateOfBirth}</ErrorText>
              {form.dateOfBirth && (
                <p className="text-xs text-neutral-500 mt-1">
                  Age {getAge(form.dateOfBirth)} · {getAgeGroupLabel(form.dateOfBirth)}
                </p>
              )}
            </FormField>
          </div>

          {/* Contact */}
          <div className="px-5 py-3 border-t border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Contact</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField>
              <FormLabel>Email Address</FormLabel>
              <FormInput type="email" value={form.email} onChange={set('email')} placeholder="e.g. arjun@email.com" />
              <ErrorText>{errors.email}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel>Phone Number</FormLabel>
              <FormInput type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. +44 7700 000000" />
              <ErrorText>{errors.phone}</ErrorText>
            </FormField>
            {(errors.email === 'Email or phone number is required.' || errors.phone === 'Email or phone number is required.') && (
              <p className="sm:col-span-2 text-xs text-[#BC0F1C]">At least one contact method (email or phone) is required.</p>
            )}
          </div>

          {/* Organisation */}
          <div className="px-5 py-3 border-t border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Organisation</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Country / Organisation</FormLabel>
              <FormSelect value={form.country} onChange={set('country')}>
                {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
              <ErrorText>{errors.country}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Region</FormLabel>
              <FormSelect value={form.region} onChange={set('region')}>
                <option value="">Select region</option>
                {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </FormSelect>
              <ErrorText>{errors.region}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Town</FormLabel>
              <FormSelect value={form.town} onChange={set('town')} disabled={!form.region}>
                <option value="">Select town</option>
                {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
              <ErrorText>{errors.town}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Activity Centre</FormLabel>
              <FormSelect value={form.activityCentre} onChange={set('activityCentre')} disabled={!form.town}>
                <option value="">Select activity centre</option>
                {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
              <ErrorText>{errors.activityCentre}</ErrorText>
            </FormField>
          </div>

          {/* T&C */}
          <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={e => {
                  setForm(prev => ({ ...prev, acceptedTerms: e.target.checked }));
                  setErrors(prev => ({ ...prev, acceptedTerms: undefined }));
                }}
                className="w-4 h-4 mt-0.5 accent-primary-600"
              />
              <span>
                I confirm the information is accurate and agree to the{' '}
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
            {isSubmitting ? 'Submitting…' : 'Submit Registration'}
          </PrimaryButton>
        </div>
      </form>

      <PageModal slug={activePolicySlug} onClose={() => setActivePolicySlug(null)} />
    </div>
  );
}
