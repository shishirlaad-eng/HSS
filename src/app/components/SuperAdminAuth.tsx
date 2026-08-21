import React, { useState, useEffect, useRef } from "react";
import {
  FormLabel,
  FormInput,
  FormCard,
  FormField,
  ErrorText
} from "./hb/common";
import { PrimaryButton } from "./hb/listing";
import { Mail, Lock, KeyRound, UserPlus, Baby, X, CalendarCheck } from "lucide-react";
import hssLogoOrange from "../../assets/brand/hss/logos/hss-logo-orange.png";
import myHssLogo from "../../assets/brand/hss/logos/my-hss-logo.png";
import { toast } from "sonner";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { Toaster } from "sonner";
import MemberRegistration from "./MemberRegistration";
import EventGuestRegistration from "./EventGuestRegistration";

// ── Trusted-device cookie helpers (30-day remember) ───────────────────────────
const DEVICE_COOKIE_KEY = "hss_trusted_device";

function setTrustedDeviceCookie(email: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${DEVICE_COOKIE_KEY}=${encodeURIComponent(email)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function getTrustedDeviceEmail(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEVICE_COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

type Screen = "login" | "otp" | "forgot" | "reset" | "register" | "event-registration";

interface SuperAdminAuthProps {
  onLoginSuccess: () => void;
  onRegisterSuccess?: (role: 'Adult Member' | 'Teen Member') => void;
  onGuardianRegisterSuccess?: (data: { firstName: string; lastName: string; email: string }) => void;
}

export default function SuperAdminAuth({ onLoginSuccess, onRegisterSuccess, onGuardianRegisterSuccess }: SuperAdminAuthProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterChoice, setShowRegisterChoice] = useState(false);
  const [registerMode, setRegisterMode] = useState<'member' | 'child'>('member');
  
  // Login Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Form
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  // Reset Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Error state — per-field, keyed by a screen-scoped field name
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const resetOtpRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';
  const clearError = (key: string) => setErrors(prev => (prev[key] ? { ...prev, [key]: false } : prev));

  // Cooldown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrors({ loginEmail: true });
      toast.error("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setErrors({ loginPassword: true });
      toast.error("Password is required.");
      passwordRef.current?.focus();
      return;
    }

    // If this device is already trusted for this email, skip OTP
    if (getTrustedDeviceEmail() === email) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Trusted device recognised. Logged in without OTP.");
        onLoginSuccess();
      }, 800);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Accept any valid credentials for frontend prototype
      setCurrentScreen("otp");
      setCooldown(60);
      toast.success("OTP sent to your registered channel.");
    }, 1000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors({ otp: true });
      toast.error("Enter the 6-digit OTP.");
      otpRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Accept any 6 digit OTP
      if (currentScreen === "otp") {
        if (rememberDevice) {
          setTrustedDeviceCookie(email);
        }
        onLoginSuccess();
      }
    }, 1000);
  };

  const handleSendResetOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrors({ forgotEmail: true });
      toast.error("Enter a valid email address.");
      forgotEmailRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentScreen("reset");
      toast.success("If the email is valid, an OTP has been sent.");
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors({ resetOtp: true });
      toast.error("Enter the 6-digit OTP.");
      resetOtpRef.current?.focus();
      return;
    }
    const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!policyRegex.test(newPassword)) {
      setErrors({ newPassword: true });
      toast.error("Password does not meet policy.");
      newPasswordRef.current?.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: true });
      toast.error("Passwords do not match.");
      confirmPasswordRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Accept any valid submission
      toast.success("Password reset successful. Please log in.");
      setCurrentScreen("login");
      setPassword("");
      setOtp("");
    }, 1000);
  };

  const handleResendOTP = () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCooldown(60);
      toast.success("OTP resent successfully.");
    }, 1000);
  };

  return (
    <LanguageProvider>
      {currentScreen === "register" ? (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <MemberRegistration
              onBackToLogin={() => {
                setCurrentScreen("login");
                setErrors({});
              }}
              onRegistrationComplete={registerMode === 'member' ? onRegisterSuccess : undefined}
              onAccountCreated={registerMode === 'child' ? onGuardianRegisterSuccess : undefined}
            />
          </div>
        </div>
      ) : currentScreen === "event-registration" ? (
        <EventGuestRegistration onBack={() => setCurrentScreen("login")} />
      ) : (
      <>
      <style>{`
        @keyframes slideUpSettle {
          0%   { opacity: 0; transform: translateY(60px); }
          60%  { opacity: 1; transform: translateY(-5px); }
          80%  { transform: translateY(2px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .sul-1 { animation: slideUpSettle 1.43s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
        .sul-2 { animation: slideUpSettle 1.43s cubic-bezier(0.22, 1, 0.36, 1) 0.75s both; }
        .sul-3 { animation: slideUpSettle 1.43s cubic-bezier(0.22, 1, 0.36, 1) 1.2s both; }
        @keyframes logoEntrance {
          0%   { opacity: 0; transform: scale(0.82); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(249,176,61,0.3)); }
          50%       { filter: drop-shadow(0 0 22px rgba(249,176,61,0.72)); }
        }
        .logo-reveal {
          will-change: transform, opacity, filter;
          animation:
            logoEntrance 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0s both,
            logoGlow 3.2s ease-in-out 1.3s infinite;
        }
      `}</style>
      <div className="min-h-screen flex">
        {/* Left panel — 40% — HSS blue with orange logo + Sanskrit text */}
        <div
          className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center gap-10 px-10 py-12"
          style={{ backgroundColor: "#172E4D" }}
        >
          <img
            src={hssLogoOrange}
            alt="HSS Logo"
            className="logo-reveal w-3/5 max-w-xs object-contain"
          />
          <div className="flex flex-col items-center gap-1 max-w-xs text-center italic">
            <span className="sul-1 text-white text-[16px] font-medium">Vishwa Dharma Prakashena</span>
            <span className="sul-2 text-white text-[16px] font-medium">Vishwa Shanti Pravartake</span>
            <span className="sul-3 text-white/70 text-[14px] leading-relaxed mt-3 block">
              With enlightenment from the Universal Dharma, in propagating peace through the world, in the task of achieving Hindu Unity worldwide, may our aim and deep faith remain resolute.
            </span>
          </div>
        </div>

        {/* Right panel — 60% — form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white dark:bg-neutral-950">
          <div className="w-full max-w-md">
          <FormCard className="shadow-lg !p-8">
            {currentScreen === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <img
                      src={myHssLogo}
                      alt="My HSS"
                      className="w-3/5 max-w-xs object-contain"
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Namaste</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Welcome to the MyHSS member portal. Please sign in with your email and password below.</p>
                </div>

                <div className="space-y-5">
                  <FormField>
                    <FormLabel htmlFor="email" required>Email</FormLabel>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput
                        ref={emailRef}
                        id="email"
                        type="email"
                        className={`pl-9 ${errCls('loginEmail')}`}
                        placeholder="admin@company.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearError('loginEmail'); }}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorText>{errors.loginEmail && 'Enter a valid email address.'}</ErrorText>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="password" required>Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput
                        ref={passwordRef}
                        id="password"
                        type="password"
                        className={`pl-9 ${errCls('loginPassword')}`}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => { setPassword(e.target.value); clearError('loginPassword'); }}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorText>{errors.loginPassword && 'Password is required.'}</ErrorText>
                    <div className="mt-2 text-right">
                      <button 
                        type="button" 
                        onClick={() => {
                          setCurrentScreen("forgot");
                          setErrors({});
                        }} 
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </FormField>
                </div>

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    className="w-full justify-center py-2.5 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </PrimaryButton>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-600">
                  This site is protected by reCAPTCHA v3 and the Google{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600 dark:hover:text-neutral-400">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600 dark:hover:text-neutral-400">Terms of Service</a>
                  {' '}apply.
                </p>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterChoice(true)}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("event-registration")}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Karyakram Registration
                  </button>
                </div>
              </form>
            )}

            {currentScreen === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">One-Time Passcode Verification</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter the 6-digit OTP sent to your registered channel.</p>
                </div>

                <FormField>
                  <FormLabel htmlFor="otp" required>OTP</FormLabel>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <FormInput
                      ref={otpRef}
                      id="otp"
                      type="text"
                      maxLength={6}
                      className={`pl-9 tracking-[0.5em] text-center text-lg font-medium ${errCls('otp')}`}
                      placeholder="------"
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); clearError('otp'); }}
                      disabled={isLoading}
                    />
                  </div>
                  <ErrorText>{errors.otp && 'Enter the 6-digit OTP.'}</ErrorText>
                </FormField>

                {/* Remember device checkbox */}
                <label className="flex items-start gap-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 px-3.5 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={e => setRememberDevice(e.target.checked)}
                    className="mt-0.5 h-12 w-12 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                    Remember this device for <strong>30 days</strong>. You will not be asked for an OTP again on this device during that period.
                  </span>
                </label>

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    className="w-full justify-center py-2.5 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || cooldown > 0}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Resend OTP
                  </button>
                  {cooldown > 0 && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Please wait {cooldown} seconds before requesting a new OTP.
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 mt-4">
                    Enter any 6-digit OTP (e.g. 123456)
                  </p>
                </div>
              </form>
            )}

            {currentScreen === "forgot" && (
              <form onSubmit={handleSendResetOTP} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Forgot Password</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter your email address to request for password reset.</p>
                </div>

                <FormField>
                  <FormLabel htmlFor="forgot-email" required>Email</FormLabel>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <FormInput
                      ref={forgotEmailRef}
                      id="forgot-email"
                      type="email"
                      className={`pl-9 ${errCls('forgotEmail')}`}
                      placeholder="admin@company.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError('forgotEmail'); }}
                      disabled={isLoading}
                    />
                  </div>
                  <ErrorText>{errors.forgotEmail && 'Enter a valid email address.'}</ErrorText>
                </FormField>

                <div className="pt-2">
                  <PrimaryButton 
                    type="submit" 
                    className="w-full justify-center py-2.5 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Reset Password"}
                  </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("login");
                      setErrors({});
                    }}
                    disabled={isLoading}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {currentScreen === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Reset Password</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter the OTP and create a new password.</p>
                </div>

                <div className="space-y-5">
                  <FormField>
                    <FormLabel htmlFor="reset-otp" required>OTP</FormLabel>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput
                        ref={resetOtpRef}
                        id="reset-otp"
                        type="text"
                        maxLength={6}
                        className={`pl-9 tracking-[0.5em] text-center text-lg font-medium ${errCls('resetOtp')}`}
                        placeholder="------"
                        value={otp}
                        onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); clearError('resetOtp'); }}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorText>{errors.resetOtp && 'Enter the 6-digit OTP.'}</ErrorText>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="new-password" required>New Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput
                        ref={newPasswordRef}
                        id="new-password"
                        type="password"
                        className={`pl-9 ${errCls('newPassword')}`}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); clearError('newPassword'); }}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorText>{errors.newPassword && 'Password does not meet policy.'}</ErrorText>
                    <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                      Use at least 12 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="confirm-password" required>Confirm Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput
                        ref={confirmPasswordRef}
                        id="confirm-password"
                        type="password"
                        className={`pl-9 ${errCls('confirmPassword')}`}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorText>{errors.confirmPassword && 'Passwords do not match.'}</ErrorText>
                  </FormField>
                </div>

                <div className="pt-2">
                  <PrimaryButton 
                    type="submit" 
                    className="w-full justify-center py-2.5 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("login");
                      setErrors({});
                    }}
                    disabled={isLoading}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Back to Login
                  </button>
                  <p className="text-xs text-neutral-400 mt-4">
                    Use OTP: 123456
                  </p>
                </div>
              </form>
            )}

          </FormCard>
          </div>
        </div>
      </div>
      </>
      )}
      <RegisterChoiceModal
        isOpen={showRegisterChoice}
        onClose={() => setShowRegisterChoice(false)}
        onChoose={(mode) => {
          setRegisterMode(mode);
          setShowRegisterChoice(false);
          setCurrentScreen("register");
          setErrors({});
        }}
      />
        <Toaster
          position="top-right"
          expand
          richColors
          closeButton
        />
    </LanguageProvider>
  );
}

function RegisterChoiceModal({ isOpen, onClose, onChoose }: {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (mode: 'member' | 'child') => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">Create Account</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChoose('member')}
            className="flex flex-col items-center text-center gap-2 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">Create Member Account</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">If you are 13 years of age or older and have your own email address.</span>
          </button>
          <button
            type="button"
            onClick={() => onChoose('child')}
            className="flex flex-col items-center text-center gap-2 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">Create Non Member Account</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">If you are a parent or guardian who is not attending Shakha and need to register a child under 13 years of age for membership.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
