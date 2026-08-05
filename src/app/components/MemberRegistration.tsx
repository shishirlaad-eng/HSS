import { useState, useRef } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import myHssLogo from '../../assets/brand/hss/logos/my-hss-logo.png';
import { toast } from 'sonner';
import {
  FormField,
  FormInput,
  FormLabel,
  ErrorText,
} from './hb/common';
import { PrimaryButton } from './hb/listing';

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: RegistrationForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const FIELD_ORDER: (keyof RegistrationForm)[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];

export default function MemberRegistration({ onBackToLogin, onRegistrationComplete, onAccountCreated }: { onBackToLogin: () => void; onRegistrationComplete?: (role: 'Adult Member' | 'Teen Member') => void; onAccountCreated?: (data: { firstName: string; lastName: string; email: string }) => void }) {
  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLegalAdult, setIsLegalAdult] = useState(false);
  const [legalAdultError, setLegalAdultError] = useState('');
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const set = (key: keyof RegistrationForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const errCls = (key: keyof RegistrationForm) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const validate = () => {
    const e: Partial<Record<keyof RegistrationForm, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required.';
    if (!form.email.trim())     e.email     = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password)         e.password  = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword)  e.confirmPassword = 'Please confirm your password.';
    else if (form.password && form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errs = validate();
    const adultErr = onAccountCreated && !isLegalAdult ? 'You must confirm that you are 18 years of age or older and agree to the policies.' : '';
    setLegalAdultError(adultErr);
    if (Object.keys(errs).length > 0 || adultErr) {
      toast.error('Please fill in all required fields.');
      const firstKey = FIELD_ORDER.find(k => errs[k]);
      const el = firstKey ? fieldRefs.current[firstKey] : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    if (onAccountCreated) {
      onAccountCreated({ firstName: form.firstName, lastName: form.lastName, email: form.email });
      return;
    }
    setSubmitted(true);
    toast.success('Verification email sent.');
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <button type="button" onClick={onBackToLogin} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f1fced] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-[#4EAE33]" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Verify Your Email</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            We have sent a verification email to {form.email}. Please verify your email address to continue setting up your Member account.
          </p>
          {onRegistrationComplete && (
            <PrimaryButton
              type="button"
              className="justify-center w-full mb-3"
              onClick={() => onRegistrationComplete('Adult Member')}
            >
              Continue Registration
            </PrimaryButton>
          )}
          <button type="button" onClick={onBackToLogin} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <button type="button" onClick={onBackToLogin} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex items-center justify-center rounded-xl px-5 py-3 mb-4" style={{ backgroundColor: '#172E4D' }}>
            <img src={myHssLogo} alt="My HSS" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{onAccountCreated ? 'Create Non-Member Account' : 'Create Member Account'}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 text-center">
            {onAccountCreated ? 'Enter your Parent or Guardian details. After creating your Non-Member account, you can register a child for membership.' : 'Enter your details below to create your Member account'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>{onAccountCreated ? 'Parent/Guardian First Name' : 'First Name'}</FormLabel>
              <FormInput ref={el => { fieldRefs.current.firstName = el; }} value={form.firstName} onChange={set('firstName')} placeholder="e.g. Arjun" className={errCls('firstName')} />
              <ErrorText>{errors.firstName}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>{onAccountCreated ? 'Parent/Guardian Last Name' : 'Last Name'}</FormLabel>
              <FormInput ref={el => { fieldRefs.current.lastName = el; }} value={form.lastName} onChange={set('lastName')} placeholder="e.g. Sharma" className={errCls('lastName')} />
              <ErrorText>{errors.lastName}</ErrorText>
            </FormField>
          </div>
          <FormField>
            <FormLabel required>{onAccountCreated ? 'Parent/Guardian Email' : 'Email'}</FormLabel>
            <FormInput ref={el => { fieldRefs.current.email = el; }} type="email" value={form.email} onChange={set('email')} placeholder="e.g. arjun@email.com" className={errCls('email')} />
            <ErrorText>{errors.email}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Password</FormLabel>
            <FormInput ref={el => { fieldRefs.current.password = el; }} type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" className={errCls('password')} />
            <ErrorText>{errors.password}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Confirm Password</FormLabel>
            <FormInput ref={el => { fieldRefs.current.confirmPassword = el; }} type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter your password" className={errCls('confirmPassword')} />
            <ErrorText>{errors.confirmPassword}</ErrorText>
          </FormField>
          {onAccountCreated && (
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLegalAdult}
                  onChange={e => { setIsLegalAdult(e.target.checked); setLegalAdultError(''); }}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-neutral-500 bg-white accent-primary-600 focus:ring-2 focus:ring-primary-500/40 dark:border-neutral-400 dark:bg-neutral-950"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-200">
                  I confirm that I am 18 years of age or older and have read and agree to the HSS (UK) Privacy Policy and the MyHSS Terms &amp; Conditions.
                </span>
              </label>
              <ErrorText>{legalAdultError}</ErrorText>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isSubmitting} className="justify-center">
            {isSubmitting ? 'Submitting…' : 'Create Account'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
