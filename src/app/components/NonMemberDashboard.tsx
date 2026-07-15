import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { UserPlus, Menu, User, Check, ChevronDown, ChevronRight, Mail, CalendarDays, Users, Building2, MapPin, ArrowLeft } from "lucide-react";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { SecondaryButton, PrimaryButton } from "./hb/listing";
import { getAgeGroupLabel } from "../../mockAPI/membersData";
import MyProfile, { MEMBER_PROFILE_STORAGE_KEY } from "./MyProfile";
import hssLogoOrange from "../../assets/brand/hss/logos/hss-logo-orange.png";
import myHssLogo from "../../assets/brand/hss/logos/my-hss-logo.png";

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Child's Personal/Organisation details are entered inside MyProfile itself (no
// pre-collection form) — read them back from where MyProfile persists them.
function getChildProfileSummary(id: string): {
  dateOfBirth?: string; activityCentre?: string; firstName?: string; surname?: string;
  gender?: string; region?: string; town?: string;
} {
  try {
    const raw = localStorage.getItem(`${MEMBER_PROFILE_STORAGE_KEY}:child:${id}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      dateOfBirth: parsed.dateOfBirth, activityCentre: parsed.activityCentre,
      firstName: parsed.firstName, surname: parsed.surname,
      gender: parsed.gender, region: parsed.region, town: parsed.town,
    };
  } catch {
    return {};
  }
}

function NonMemberHeader({
  profile,
  childAccounts,
  activeChildId,
  onSwitchProfile,
}: {
  profile: NonMemberProfile;
  childAccounts: NonMemberChild[];
  activeChildId: string | null;
  onSwitchProfile: (childId: string | null) => void;
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
    <div className="h-[53px] flex-shrink-0 px-3 flex items-center justify-between" style={{ backgroundColor: "#172E4D" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={hssLogoOrange} alt="HSS UK Logo" className="h-9 w-auto object-contain flex-shrink-0" />
        <div className="w-px h-7 bg-white/40 flex-shrink-0" />
        <img src={myHssLogo} alt="My HSS" className="h-9 w-auto object-contain flex-shrink-0" />
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
                      onClick={() => { setShowDropdown(false); onSwitchProfile(null); }}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="flex-1">My Profile</span>
                      {!activeChildId && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" style={{ color: HSS_BLUE }} />}
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
                    onClick={() => { setShowDropdown(false); onSwitchProfile(null); }}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                    <Check className="w-3.5 h-3.5 ml-auto" style={{ color: HSS_BLUE }} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Menu"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function getTurns13Label(dateOfBirth?: string): string | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const turns13 = new Date(dob.getFullYear() + 13, dob.getMonth(), dob.getDate());
  return turns13.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function UpgradeToTeenScreen({
  profile,
  child,
  childAccounts,
  onBack,
  onSubmitted,
}: {
  profile: NonMemberProfile;
  child: NonMemberChild;
  childAccounts: NonMemberChild[];
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { firstName, dateOfBirth } = getChildProfileSummary(child.id);
  const displayFirstName = firstName || child.firstName;
  const turns13Label = getTurns13Label(dateOfBirth);

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [authorised, setAuthorised] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; confirmEmail?: string; authorised?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Child's email address is required.";
    else if (!emailRegex.test(email.trim())) errs.email = "Enter a valid email address.";
    if (!confirmEmail.trim()) errs.confirmEmail = "Please confirm the email address.";
    else if (confirmEmail.trim() !== email.trim()) errs.confirmEmail = "Email addresses do not match.";
    if (!authorised) errs.authorised = "You must authorise this upgrade to continue.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
        <NonMemberHeader profile={profile} childAccounts={childAccounts} activeChildId={child.id} onSwitchProfile={() => {}} />
        <div className="px-6 py-6 max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-[24px] font-bold text-neutral-900 dark:text-white leading-tight mb-1">
            Upgrade {displayFirstName} to a Teen Account
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            {turns13Label ? `${displayFirstName} turns 13 on ${turns13Label}. ` : ""}
            Teens manage their own login but changes still require your approval.
          </p>

          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-1.5">
                  Child's own email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={`e.g. ${displayFirstName.toLowerCase()}@email.com`}
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-1.5">
                  Confirm email address
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  className={inputCls(errors.confirmEmail)}
                />
                {errors.confirmEmail && <p className="text-xs text-red-600 mt-1">{errors.confirmEmail}</p>}
              </div>
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
                I authorise this upgrade and understand a shakha admin must approve it before it takes effect.
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
}: {
  profile: NonMemberProfile;
  childAccounts: NonMemberChild[];
  onAddChild: (child: { id: string; firstName: string; lastName: string; email: string }) => void;
  onUpgrade?: () => void;
  onViewChildProfile?: (childId: string) => void;
}) {
  const [viewChildId, setViewChildId] = useState<string | null>(null);
  const [upgradeChildId, setUpgradeChildId] = useState<string | null>(null);
  const [childStatusMap, setChildStatusMap] = useState<Record<string, ChildStatus>>({});
  const getChildStatus = (id: string): ChildStatus => childStatusMap[id] ?? "draft";

  if (upgradeChildId) {
    const child = childAccounts.find(c => c.id === upgradeChildId);
    if (child) {
      return (
        <UpgradeToTeenScreen
          profile={profile}
          child={child}
          childAccounts={childAccounts}
          onBack={() => setUpgradeChildId(null)}
          onSubmitted={() => setUpgradeChildId(null)}
        />
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
            onSwitchProfile={(id) => setViewChildId(id)}
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
          onSwitchProfile={(id) => setViewChildId(id)}
        />
        <div className="px-6 py-6">

          {/* ── Top bar: greeting (left) + profile summary (right) ── */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-neutral-900 dark:text-white leading-tight">Welcome, {profile.firstName}</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your account and your children's Shakha registrations.</p>
            </div>

            {/* Profile summary card — top right, mirrors the "My Profile" card style */}
            <div
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow w-full lg:w-auto lg:min-w-[360px] flex-shrink-0"
              style={{ borderTop: '3px solid #172E4D' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold flex-shrink-0" style={{ backgroundColor: HSS_BLUE }}>
                {`${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[15px] font-semibold text-neutral-900 dark:text-white truncate">{profile.firstName} {profile.lastName}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide flex-shrink-0" style={{ backgroundColor: `${HSS_BLUE}1A`, color: HSS_BLUE }}>
                    NON-MEMBER
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                  {profile.email}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                  Registered {formatDate(profile.registeredAt)}
                </p>
              </div>
            </div>
          </div>

          {/* ── My children ── */}
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: HSS_BLUE }}>
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
                return (
                  <div
                    key={child.id}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md hover:border-[#172E4D]/30 dark:hover:border-primary-700 transition-all flex flex-col overflow-hidden"
                    style={{ borderTop: '3px solid #172E4D' }}
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ backgroundColor: HSS_BLUE }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white truncate">{displayName}</p>
                          {ageLabel && <p className="text-xs text-neutral-400 dark:text-neutral-500">{ageLabel}{gender ? ` · ${gender}` : ''}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: HSS_BLUE }} />
                          {dateOfBirth ? `DOB: ${formatDate(dateOfBirth)}` : 'DOB: —'}
                        </p>
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

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {isApproved ? (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 border border-success-200 dark:border-success-800 tracking-wide">
                              APPROVED
                            </span>
                            <span className="text-xs font-medium text-success-700 dark:text-success-400">
                              ID: {child.id}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 tracking-wide">
                              PENDING APPROVAL
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center gap-2">
                      <SecondaryButton onClick={() => (isApproved && onViewChildProfile ? onViewChildProfile(child.id) : setViewChildId(child.id))}>
                        {isApproved ? 'View Profile' : 'View Submission'}
                      </SecondaryButton>
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => setUpgradeChildId(child.id)}
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

          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={() => {
                const id = `CHILD-${Date.now()}`;
                onAddChild({ id, firstName: 'John', lastName: 'Doe', email: '' });
                setChildStatusMap(prev => ({ ...prev, [id]: "draft" }));
                setViewChildId(id);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors bg-[#172E4D] hover:bg-[#0f2138] active:bg-[#0a1830]"
            >
              <UserPlus className="w-4 h-4" />
              Register Another Child
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Want full membership benefits?</p>
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
      </div>
      <Toaster position="top-right" expand richColors closeButton />
    </LanguageProvider>
  );
}
