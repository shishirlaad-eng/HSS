import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { UserPlus, User, Check, ChevronDown, ChevronRight, Users, Building2, MapPin, ArrowLeft, Key, LogOut, Clock } from "lucide-react";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { PageHeader, SecondaryButton, PrimaryButton } from "./hb/listing";
import { FormField, FormLabel, FormInput, FormSelect, ErrorText, FormModal, FormSection, FormFooter } from "./hb/common";
import { getAgeGroupLabel, generateMemberId } from "../../mockAPI/membersData";
import { formatDate as sharedFormatDate, formatDateTime as sharedFormatDateTime } from "../../utils/formatDate";
import MyProfile, { MEMBER_PROFILE_STORAGE_KEY, getChildProfileSummary } from "./MyProfile";
import hssLogoOrange from "../../assets/brand/hss/logos/hss-logo-orange.png";
import myHssLogo from "../../assets/brand/hss/logos/myhss-logo-04-1.png";

const HSS_BLUE = "#172E4D";

interface NonMemberChild {
  id: string;
  firstName: string;
  lastName: string;
}

interface NonMemberProfile {
  firstName: string;
  lastName: string;
  email: string;
  registeredAt: string;
}

type ChildStatus = "draft" | "pending" | "approved";

function NonMemberHeader({
  profile,
  childAccounts,
  activeChildId,
  isProfileView,
  onSwitchProfile,
  onShowProfile,
  onChangePassword,
  onLogout,
}: {
  profile: NonMemberProfile;
  childAccounts: NonMemberChild[];
  activeChildId: string | null;
  isProfileView?: boolean;
  onSwitchProfile: (childId: string | null) => void;
  onShowProfile: () => void;
  onChangePassword: () => void;
  onLogout?: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-[93px] flex-shrink-0 px-6 flex items-center justify-between" style={{ backgroundColor: "#172E4D" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={hssLogoOrange} alt="HSS UK Logo" className="h-[74px] w-auto object-contain flex-shrink-0" />
        <div className="w-px h-10 bg-white/40 flex-shrink-0" />
        <img src={myHssLogo} alt="My HSS" className="h-[74px] w-auto object-contain flex-shrink-0" />
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(open => !open)}
            className="h-8 pl-1 pr-2 flex items-center gap-1.5 text-white/90 hover:bg-white/20 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ backgroundColor: HSS_BLUE }}>
              {initials || <User className="w-3.5 h-3.5" />}
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-20">
              <div className="p-1">
                {childAccounts.length > 0 ? (
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => { setShowDropdown(false); onShowProfile(); }}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="flex-1">My Profile</span>
                      {isProfileView && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" style={{ color: HSS_BLUE }} />}
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    </button>

                    {/* Flyout — switch to a child profile, opens outward on hover */}
                    <div className="hidden group-hover:block absolute right-full top-0 mr-1 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-30 p-1">
                      {childAccounts.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => { setShowDropdown(false); onSwitchProfile(child.id); }}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          <span className="truncate">{child.firstName} {child.lastName}'s Profile</span>
                          {activeChildId === child.id && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: HSS_BLUE }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowDropdown(false); onShowProfile(); }}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                    {isProfileView && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: HSS_BLUE }} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowDropdown(false); onChangePassword(); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDropdown(false); onLogout?.(); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTurns13Label(dateOfBirth?: string): string | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const turns13 = new Date(dob.getFullYear() + 13, dob.getMonth(), dob.getDate());
  return sharedFormatDate(turns13);
}

function getAgeFromDateOfBirth(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function validateTeenUpgradeAge(dateOfBirth?: string, name = "This child") {
  const age = getAgeFromDateOfBirth(dateOfBirth);
  if (age === null) {
    toast.error(`${name}'s date of birth is required before upgrading to a Teen Account.`);
    return false;
  }
  if (age < 13) {
    const turns13Label = getTurns13Label(dateOfBirth);
    toast.error(`${name} cannot be upgraded to a Teen Account until they turn 13${turns13Label ? ` on ${turns13Label}` : ""}.`);
    return false;
  }
  return true;
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900 dark:text-white">{children || "—"}</p>
    </div>
  );
}

function NonMemberMyProfile({ profile }: { profile: NonMemberProfile }) {
  const [activeTab, setActiveTab] = useState<"personal" | "history">("personal");
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Non-Member";
  const registeredDate = profile.registeredAt ? sharedFormatDateTime(profile.registeredAt) : "—";

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-[32px] leading-[40px] font-semibold text-neutral-900 dark:text-white">{fullName}</h1>
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-[#eff6ff] text-[#172E4D] border-[#bfdbfe]">
              (Non-Member)
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage your Non-Member account details.</p>
        </div>
      </div>

      <div className="border-b border-neutral-200 dark:border-neutral-800 mb-5">
        <nav className="flex gap-1">
          {[
            { id: "personal" as const, label: "Personal Info", icon: User },
            { id: "history" as const, label: "History", icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-[#172E4D] text-[#172E4D] dark:text-white"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "personal" ? (
        <section className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
          <h2 className="text-[19px] font-semibold text-neutral-900 dark:text-white mb-4">Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoItem label="First Name">{profile.firstName}</InfoItem>
            <InfoItem label="Last Name">{profile.lastName}</InfoItem>
            <InfoItem label="Email Address">{profile.email}</InfoItem>
            <InfoItem label="Account Type">Non-Member</InfoItem>
            <InfoItem label="Registered On">{registeredDate}</InfoItem>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-[19px] font-semibold text-neutral-900 dark:text-white">History</h2>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="px-5 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#172E4D] flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Non-Member account created</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{registeredDate}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetAndClose = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Change Password"
      description="Enter your current password and choose a new one"
      maxWidth="max-w-md"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Password changed successfully.");
          resetAndClose();
        }}
      >
        <FormSection>
          <FormField>
            <FormLabel htmlFor="currentPassword" required>Current Password</FormLabel>
            <FormInput
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm(prev => ({ ...prev, currentPassword: event.target.value }))}
              required
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="newPassword" required>New Password</FormLabel>
            <FormInput
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm(prev => ({ ...prev, newPassword: event.target.value }))}
              required
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Must be at least 8 characters long</p>
          </FormField>
          <FormField>
            <FormLabel htmlFor="confirmPassword" required>Confirm New Password</FormLabel>
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm(prev => ({ ...prev, confirmPassword: event.target.value }))}
              required
            />
          </FormField>
        </FormSection>
        <FormFooter>
          <SecondaryButton type="button" onClick={resetAndClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit">Change Password</PrimaryButton>
        </FormFooter>
      </form>
    </FormModal>
  );
}

function UpgradeToTeenScreen({
  profile,
  child,
  childAccounts,
  onBack,
  onSubmitted,
  onShowProfile,
  onChangePassword,
  onLogout,
}: {
  profile: NonMemberProfile;
  child: NonMemberChild;
  childAccounts: NonMemberChild[];
  onBack: () => void;
  onSubmitted: () => void;
  onShowProfile: () => void;
  onChangePassword: () => void;
  onLogout?: () => void;
}) {
  const { firstName, dateOfBirth } = getChildProfileSummary(child.id);
  const displayFirstName = firstName || child.firstName;

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [guardianName, setGuardianName] = useState(`${profile.firstName} ${profile.lastName}`.trim());
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState(profile.email);
  const [guardianRelationship, setGuardianRelationship] = useState("Parent");
  const [authorised, setAuthorised] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string; confirmEmail?: string; authorised?: string;
    guardianName?: string; guardianPhone?: string; guardianEmail?: string; guardianRelationship?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errs: typeof errors = {};
    const validAge = validateTeenUpgradeAge(dateOfBirth, displayFirstName);
    if (!guardianName.trim()) errs.guardianName = "Parent / guardian name is required.";
    if (!guardianPhone.trim()) errs.guardianPhone = "Parent / guardian phone number is required.";
    if (!guardianEmail.trim()) errs.guardianEmail = "Parent / guardian email is required.";
    else if (!emailRegex.test(guardianEmail.trim())) errs.guardianEmail = "Enter a valid parent / guardian email.";
    if (!guardianRelationship.trim()) errs.guardianRelationship = "Parent / guardian relationship is required.";
    if (!email.trim()) errs.email = "Child's email address is required.";
    else if (!emailRegex.test(email.trim())) errs.email = "Enter a valid email address.";
    if (!confirmEmail.trim()) errs.confirmEmail = "Please confirm the email address.";
    else if (confirmEmail.trim() !== email.trim()) errs.confirmEmail = "Email addresses do not match.";
    if (!authorised) errs.authorised = "You must authorise this upgrade to continue.";
    setErrors(errs);
    return validAge && Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Upgrade request for ${displayFirstName} submitted for approval.`);
      onSubmitted();
    }, 600);
  };

  const inputCls = (err?: string) =>
    `w-full h-10 px-3 rounded-lg border text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
      err
        ? "border-red-400 dark:border-red-600 focus:ring-red-400/30"
        : "border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500"
    }`;

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <NonMemberHeader
          profile={profile}
          childAccounts={childAccounts}
          activeChildId={child.id}
          onSwitchProfile={() => {}}
          onShowProfile={onShowProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
        <div className="px-6 py-6 max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <PageHeader
            title={`Upgrade ${displayFirstName} to a Teen Account`}
            subtitle={`${displayFirstName} has turned 13 and can now upgrade to a Teen account. If they have their own email address, they can create a personal login and manage their account. You will continue to approve any changes they make.`}
          />

          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm mb-6">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Parent / Guardian Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <FormField>
                <FormLabel required>Parent / Guardian Name</FormLabel>
                <FormInput
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  className={inputCls(errors.guardianName)}
                />
                <ErrorText>{errors.guardianName}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Relationship</FormLabel>
                <FormSelect
                  value={guardianRelationship}
                  onChange={e => setGuardianRelationship(e.target.value)}
                  className={inputCls(errors.guardianRelationship)}
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                </FormSelect>
                <ErrorText>{errors.guardianRelationship}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Phone Number</FormLabel>
                <FormInput
                  type="tel"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900123"
                  className={inputCls(errors.guardianPhone)}
                />
                <ErrorText>{errors.guardianPhone}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Parent / Guardian Email</FormLabel>
                <FormInput
                  type="email"
                  value={guardianEmail}
                  onChange={e => setGuardianEmail(e.target.value)}
                  className={inputCls(errors.guardianEmail)}
                />
                <ErrorText>{errors.guardianEmail}</ErrorText>
              </FormField>
            </div>

            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Child's Login Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <FormField>
                <FormLabel required>Child's own email address</FormLabel>
                <FormInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={`e.g. ${displayFirstName.toLowerCase()}@email.com`}
                  className={inputCls(errors.email)}
                />
                <ErrorText>{errors.email}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Confirm email address</FormLabel>
                <FormInput
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  className={inputCls(errors.confirmEmail)}
                />
                <ErrorText>{errors.confirmEmail}</ErrorText>
              </FormField>
            </div>

            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">What changes once approved:</p>
            <ul className="space-y-1.5 mb-6 text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside">
              <li>{displayFirstName} will set their own password and can log in directly</li>
              <li>Their profile moves out of your "My children" list</li>
              <li>Any changes they make will be queued for your approval</li>
              <li>You will still be listed as their parent/guardian contact</li>
            </ul>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={authorised}
                onChange={e => setAuthorised(e.target.checked)}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                I have read and understood the above information and authorise the upgrade to a Teen Account.
              </span>
            </label>
            {errors.authorised && <p className="text-xs text-red-600 mt-1 ml-7">{errors.authorised}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={onBack}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for Approval"}
            </PrimaryButton>
          </div>
        </div>
      </div>
      <Toaster position="top-right" expand richColors closeButton />
    </LanguageProvider>
  );
}

export default function NonMemberDashboard({
  profile,
  childAccounts,
  onAddChild,
  onUpgrade,
  onViewChildProfile,
  onLogout,
}: {
  profile: NonMemberProfile;
  childAccounts: NonMemberChild[];
  onAddChild: (child: { id: string; firstName: string; lastName: string; email: string }) => void;
  onUpgrade?: () => void;
  onViewChildProfile?: (childId: string) => void;
  onLogout?: () => void;
}) {
  const [viewChildId, setViewChildId] = useState<string | null>(null);
  const [upgradeChildId, setUpgradeChildId] = useState<string | null>(null);
  const [showNonMemberProfile, setShowNonMemberProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  // Demo seed: the first child (shown as "PENDING APPROVAL" on its card) already has a
  // submitted profile awaiting review, so opening it must not be editable.
  const [childStatusMap, setChildStatusMap] = useState<Record<string, ChildStatus>>(() =>
    childAccounts[0] ? { [childAccounts[0].id]: "pending" } : {}
  );
  const getChildStatus = (id: string): ChildStatus => childStatusMap[id] ?? "draft";

  if (upgradeChildId) {
    const child = childAccounts.find(c => c.id === upgradeChildId);
    if (child) {
      return (
        <>
          <UpgradeToTeenScreen
            profile={profile}
            child={child}
            childAccounts={childAccounts}
            onBack={() => setUpgradeChildId(null)}
            onSubmitted={() => setUpgradeChildId(null)}
            onShowProfile={() => {
              setUpgradeChildId(null);
              setShowNonMemberProfile(true);
            }}
            onChangePassword={() => setShowChangePassword(true)}
            onLogout={onLogout}
          />
          <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
        </>
      );
    }
  }

  if (viewChildId) {
    const status = getChildStatus(viewChildId);
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <NonMemberHeader
            profile={profile}
            childAccounts={childAccounts}
            activeChildId={viewChildId}
            isProfileView={false}
            onSwitchProfile={(id) => setViewChildId(id)}
            onShowProfile={() => {
              setViewChildId(null);
              setShowNonMemberProfile(true);
            }}
            onChangePassword={() => setShowChangePassword(true)}
            onLogout={onLogout}
          />
          <MyProfile
            selectedRole="Adult Member"
            activeChildId={viewChildId}
            isPostRegistration={status === "draft"}
            isUnderReview={status === "pending"}
            onSubmitForApproval={() => setChildStatusMap(prev => ({ ...prev, [viewChildId]: "pending" }))}
            onBack={() => setViewChildId(null)}
            backLabel="Back to Dashboard"
          />
        </div>
        <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
        <Toaster position="top-right" expand richColors closeButton />
      </LanguageProvider>
    );
  }

  if (showNonMemberProfile) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <NonMemberHeader
            profile={profile}
            childAccounts={childAccounts}
            activeChildId={null}
            isProfileView
            onSwitchProfile={(id) => {
              setShowNonMemberProfile(false);
              setViewChildId(id);
            }}
            onShowProfile={() => setShowNonMemberProfile(true)}
            onChangePassword={() => setShowChangePassword(true)}
            onLogout={onLogout}
          />
          <NonMemberMyProfile profile={profile} />
        </div>
        <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
        <Toaster position="top-right" expand richColors closeButton />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <NonMemberHeader
          profile={profile}
          childAccounts={childAccounts}
          activeChildId={viewChildId}
          isProfileView={false}
          onSwitchProfile={(id) => setViewChildId(id)}
          onShowProfile={() => setShowNonMemberProfile(true)}
          onChangePassword={() => setShowChangePassword(true)}
          onLogout={onLogout}
        />
        <div className="px-6 py-6">

          {/* ── Top bar: greeting (left) + upgrade to member (right) ── */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[32px] leading-[40px] font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2 flex-wrap">
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Non-Member'}
                <span className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-[#eff6ff] text-[#172E4D] border-[#bfdbfe]">
                  (Non-Member)
                </span>
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your Non-Member account and the memberships of the children you have registered</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  const id = generateMemberId();
                  onAddChild({ id, firstName: 'John', lastName: 'Doe', email: '' });
                  setChildStatusMap(prev => ({ ...prev, [id]: "draft" }));
                  // Seed a demo profile summary so the card shows full details immediately,
                  // matching every other child card, rather than sitting blank until the
                  // guardian manually fills in Personal Details.
                  localStorage.setItem(`${MEMBER_PROFILE_STORAGE_KEY}:child:${id}`, JSON.stringify({
                    firstName: 'John',
                    surname: 'Doe',
                    gender: 'Male',
                    dateOfBirth: '1990-01-01',
                    country: 'HSS UK',
                    region: 'London & South East',
                    town: 'Wembley',
                    activityCentre: 'Wembley Activity Centre',
                  }));
                  setViewChildId(id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors bg-[#172E4D] hover:bg-[#0f2138] active:bg-[#0a1830]"
              >
                <UserPlus className="w-4 h-4" />
                {childAccounts.length === 0 ? 'Register Child' : 'Register Another Child'}
              </button>
              <button
                type="button"
                onClick={() => (onUpgrade ? onUpgrade() : toast.info("Membership upgrade flow coming soon."))}
                className="px-4 py-2 rounded-lg border text-sm font-medium bg-white dark:bg-neutral-950 transition-colors"
                style={{ borderColor: HSS_BLUE, color: HSS_BLUE }}
              >
                Upgrade to Member
              </button>
            </div>
          </div>

          {/* ── My children ── */}
          <h2 className="text-[19px] font-semibold mb-3 flex items-center gap-2" style={{ color: HSS_BLUE }}>
            <span className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: HSS_BLUE }} />
            My children {childAccounts.length > 0 && <span className="text-neutral-400 dark:text-neutral-500 font-normal">({childAccounts.length})</span>}
          </h2>

          {childAccounts.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-8 mb-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${HSS_BLUE}1A` }}>
                <Users className="w-6 h-6" style={{ color: HSS_BLUE }} />
              </div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No children registered yet.</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Register a child to enrol them at your local shakha.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {childAccounts.map((child, index) => {
                const { dateOfBirth, activityCentre, firstName, surname, gender, region, town } = getChildProfileSummary(child.id);
                const displayName = firstName ? `${firstName} ${surname ?? ''}`.trim() : `${child.firstName} ${child.lastName}`;
                // Demo rule: the first child registered always stays in pending submission;
                // every subsequent child is treated as already approved.
                const isApproved = index > 0;
                const ageLabel = dateOfBirth ? getAgeGroupLabel(dateOfBirth) : null;
                const childMemberId = `MBR-${String(index + 1).padStart(5, '0')}`;
                const openChildProfile = () => {
                  if (onViewChildProfile) {
                    onViewChildProfile(child.id);
                    return;
                  }
                  setViewChildId(child.id);
                };
                return (
                  <div
                    key={child.id}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md hover:border-[#172E4D]/30 dark:hover:border-primary-700 transition-all flex flex-col overflow-hidden"
                    style={{ borderTop: '3px solid #172E4D' }}
                  >
                    <div className="p-4 flex-1">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[18px] leading-6 font-semibold text-neutral-900 dark:text-white truncate" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{displayName}</p>
                          <span className="text-neutral-300 dark:text-neutral-700">|</span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                            {childMemberId}
                          </span>
                          {isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 border border-success-200 dark:border-success-800 tracking-wide">
                              APPROVED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 tracking-wide">
                              PENDING APPROVAL
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        {(ageLabel || gender) && (
                          <p className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                            {[ageLabel, gender].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {activityCentre && (
                          <p className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                            {activityCentre}
                          </p>
                        )}
                        {(town || region) && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                            {[town, region].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center gap-2">
                      <SecondaryButton onClick={openChildProfile}>
                        View Profile
                      </SecondaryButton>
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!validateTeenUpgradeAge(dateOfBirth, displayName)) return;
                            setUpgradeChildId(child.id);
                          }}
                          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-btn-text text-sm font-semibold transition-colors"
                        >
                          Upgrade to Teen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <Toaster position="top-right" expand richColors closeButton />
    </LanguageProvider>
  );
}
