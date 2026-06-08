import React, { useState, useEffect } from "react";
import {
  FormLabel,
  FormInput,
  FormCard,
  FormField
} from "./hb/common";
import { PrimaryButton } from "./hb/listing";
import { Mail, Lock, KeyRound, UserPlus } from "lucide-react";
import hssLogoColour from "../../assets/brand/hss/logos/hss-logo-colour.png";
import { toast } from "sonner";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { Toaster } from "sonner";
import MemberRegistration from "./MemberRegistration";

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

type Screen = "login" | "otp" | "forgot" | "reset" | "register";

interface SuperAdminAuthProps {
  onLoginSuccess: () => void;
}

export default function SuperAdminAuth({ onLoginSuccess }: SuperAdminAuthProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Form
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  
  // Reset Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Error state
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrorMsg("Enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
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
    setErrorMsg("");
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMsg("Enter the 6-digit OTP.");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Accept any 6 digit OTP
      if (currentScreen === "otp") {
        setTrustedDeviceCookie(email);
        onLoginSuccess();
      }
    }, 1000);
  };

  const handleSendResetOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrorMsg("Enter a valid email address.");
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
    setErrorMsg("");
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMsg("Enter the 6-digit OTP.");
      return;
    }
    const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!policyRegex.test(newPassword)) {
      setErrorMsg("Password does not meet policy.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors">
        <div className={`w-full ${currentScreen === "register" ? "max-w-5xl" : "max-w-md"}`}>
          {/* HSS Brand Header */}
          <div className="text-center mb-6">
            <img
              src={hssLogoColour}
              alt="Hindu Swayamsevak Sangh UK"
              className="h-14 w-auto mx-auto object-contain"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Hindu Swayamsevak Sangh
            </p>
          </div>

          {currentScreen === "register" ? (
            <MemberRegistration
              onBackToLogin={() => {
                setCurrentScreen("login");
                setErrorMsg("");
              }}
            />
          ) : (
          <FormCard className="shadow-lg !p-8">
            {errorMsg && (
              <div className="mb-6 p-3 bg-error-50 dark:bg-error-950/30 text-error-600 dark:text-error-400 text-sm rounded-lg border border-error-200 dark:border-error-800 text-center">
                {errorMsg}
              </div>
            )}

            {currentScreen === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Welcome Back</h1>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">HSS Membership Management System</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs">Sign in with your administrator credentials.</p>
                </div>

                <div className="space-y-5">
                  <FormField>
                    <FormLabel htmlFor="email" required>Email</FormLabel>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput 
                        id="email" 
                        type="email" 
                        className="pl-9" 
                        placeholder="admin@company.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="password" required>Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput 
                        id="password" 
                        type="password" 
                        className="pl-9" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <button 
                        type="button" 
                        onClick={() => {
                          setCurrentScreen("forgot");
                          setErrorMsg("");
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
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("register");
                      setErrorMsg("");
                    }}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register as Member
                  </button>
                </div>
                <div className="text-center text-xs text-neutral-400 mt-4">
                  Enter any valid email and password to continue.
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
                      id="otp" 
                      type="text" 
                      maxLength={6} 
                      className="pl-9 tracking-[0.5em] text-center text-lg font-medium" 
                      placeholder="------" 
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={isLoading}
                    />
                  </div>
                </FormField>

                {/* Trusted device notice */}
                <div className="flex items-start gap-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 px-3.5 py-3">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  </svg>
                  <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                    Verifying this OTP will remember this device for <strong>30 days</strong>. You will not be asked for an OTP again on this device during that period.
                  </p>
                </div>

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
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter your email address to request a password reset OTP.</p>
                </div>

                <FormField>
                  <FormLabel htmlFor="forgot-email" required>Email</FormLabel>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <FormInput 
                      id="forgot-email" 
                      type="email" 
                      className="pl-9" 
                      placeholder="admin@company.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </FormField>

                <div className="pt-2">
                  <PrimaryButton 
                    type="submit" 
                    className="w-full justify-center py-2.5 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("login");
                      setErrorMsg("");
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
                        id="reset-otp" 
                        type="text" 
                        maxLength={6} 
                        className="pl-9 tracking-[0.5em] text-center text-lg font-medium" 
                        placeholder="------" 
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={isLoading}
                      />
                    </div>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="new-password" required>New Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput 
                        id="new-password" 
                        type="password" 
                        className="pl-9" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                      Use at least 12 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="confirm-password" required>Confirm Password</FormLabel>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <FormInput 
                        id="confirm-password" 
                        type="password" 
                        className="pl-9" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
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
                      setErrorMsg("");
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
          )}
        </div>
        <Toaster
          position="top-right"
          expand
          richColors
          closeButton
        />
      </div>
    </LanguageProvider>
  );
}
