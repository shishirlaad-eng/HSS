import { useState } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import myHssLogo from '../../assets/brand/hss/logos/my-hss-logo.png';
import { toast } from 'sonner';
import {
  FormField,
  FormInput,
  FormLabel,
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

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-xs text-[#BC0F1C] mt-1">{children}</p>;
}

export default function MemberRegistration({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof RegistrationForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

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
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Registration submitted successfully.');
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
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Registration Submitted</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Welcome, {form.firstName}! Your account is pending review.
          </p>
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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Account</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Register for HSS UK membership.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <FormField>
            <FormLabel required>Email</FormLabel>
            <FormInput type="email" value={form.email} onChange={set('email')} placeholder="e.g. arjun@email.com" />
            <ErrorText>{errors.email}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Password</FormLabel>
            <FormInput type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
            <ErrorText>{errors.password}</ErrorText>
          </FormField>
          <FormField>
            <FormLabel required>Confirm Password</FormLabel>
            <FormInput type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter your password" />
            <ErrorText>{errors.confirmPassword}</ErrorText>
          </FormField>
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
