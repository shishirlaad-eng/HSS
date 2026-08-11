import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Edit, Save, X, Trash2, AlertTriangle, Paperclip, Upload, History, ClipboardList, UserCog, UserCircle2, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, CalendarDays, ChevronDown, Check, UserPlus, ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { SecondaryButton, PrimaryButton, Pagination, SearchBar, DateRangeFilter, PageHeader } from "./hb/listing";
import { FormInput, FormSelect, FormTextarea, PhoneInput, ErrorText, FormField, FormLabel } from "./hb/common/Form";
import { FIRST_AID_QUALIFICATION_OPTIONS, getAge, getAgeGroupLabel, MASTERS_CASCADE, generateMemberId } from "../../mockAPI/membersData";
import { getRoleScope } from "../../mockAPI/roleScope";
import { formatDate as sharedFormatDate, formatDateTime as sharedFormatDateTime, formatDateRange } from "../../utils/formatDate";
import {
  createTransferRequest,
  getMemberCentreOverrides,
  getPendingTransferForMember,
  getTransferRequests,
  ShakhaTransferRequest,
  TRANSFER_CHANGE_EVENT,
} from "../../mockAPI/shakhaTransferData";

export const MEMBER_PROFILE_STORAGE_KEY = "myMemberProfile";
const SHARED_PROFILE_KEY = "hss_shared_profile";

// Child's Personal/Organisation details are entered inside MyProfile itself (no
// pre-collection form) — read them back from where MyProfile persists them.
export function getChildProfileSummary(id: string): {
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

// A child's registration status — draft until submitted for approval, pending until
// a Shakha Karyawaha approves it. There is no admin "approve" action wired up in this
// prototype (matching the non-member flow); 'approved' is only ever set by demo seeding.
export type ChildRegistrationStatus = 'draft' | 'pending' | 'approved';
export function getChildStatus(id: string): ChildRegistrationStatus {
  const stored = localStorage.getItem(`${MEMBER_PROFILE_STORAGE_KEY}:childStatus:${id}`);
  return stored === 'pending' || stored === 'approved' ? stored : 'draft';
}
export function setChildStatus(id: string, status: ChildRegistrationStatus) {
  localStorage.setItem(`${MEMBER_PROFILE_STORAGE_KEY}:childStatus:${id}`, status);
}

// Fields that are personal to the user and must stay consistent across all roles
const SHARED_FIELDS = [
  'firstName', 'middleName', 'surname', 'gender', 'dateOfBirth',
  'email', 'phone',
  'buildingName', 'addressLine1', 'addressLine2', 'contactTownCity', 'postCode',
  'emergencyContactName', 'emergencyContactPhone', 'emergencyContactEmail', 'emergencyContactRelationship',
  'occupation', 'spokenLanguages', 'originatingStateIndia', 'additionalNotes',
  'dietaryRequirements', 'dietaryOtherSpecify', 'epiPen', 'allergies', 'allergiesDeclared', 'medicalInfoDeclared', 'medicalInfoDetails',
] as const;

const DIETARY_MULTISELECT_OPTIONS = [
  'Coeliac',
  'Gluten-free',
  'Vegan',
  'Lacto (allows dairy)',
  'Paleo Diet',
  'Ketogenic (low carbohydrate, high fat)',
  'Low GI (limits carbohydrate intake)',
  'FODMAP',
  'No Onions or Garlic',
  'Other',
] as const;

const RELATIONSHIP_OPTIONS = ['Spouse', 'Sibling', 'Parent', 'Child'];

const OCCUPATION_OPTIONS = ['Student', 'Business man', 'Job'];

const SPOKEN_LANGUAGE_OPTIONS = [
  'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani',
  'Malayalam', 'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Tamil', 'Telugu', 'Other',
];

const INDIA_STATE_OPTIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

function loadSharedProfile(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SHARED_PROFILE_KEY) || "{}"); }
  catch { return {}; }
}

function saveSharedProfile(profile: Record<string, string>) {
  const shared: Record<string, string> = {};
  for (const key of SHARED_FIELDS) {
    if (key in profile) shared[key] = profile[key as keyof typeof profile];
  }
  localStorage.setItem(SHARED_PROFILE_KEY, JSON.stringify(shared));
}

interface MemberProfileForm {
  firstName: string;
  middleName: string;
  surname: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  occupation: string;
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
  membershipId: string;
  medicalInfoDeclared: string;
  medicalInfoDetails: string;
  epiPen: string;
  allergies: string;
  allergiesDeclared: string;
  isFirstAider: string;
  firstAidQualificationLevel: string;
  firstAidQualificationExpiryDate: string;
  dietaryRequirements: string;
  dietaryOtherSpecify: string;
  originatingStateIndia: string;
  spokenLanguages: string;
  additionalNotes: string;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  // Compliance — DBS
  dbsStatus: string;
  dbsCertificateNumber: string;
  dbsCertificateDate: string;
  dbsCertificateFile: string;
  dbsCertificateReceivedFrom: string;
  dbsCertificateReceivedFromOther: string;
  dbsUpdateService: string;
  dbsUpdateServiceNumber: string;
  dbsUpdateServiceCheckDate: string;
  dbsAppUnderProcess: string;
  dbsCheckedBy: string;
  // Compliance — First Aid
  firstAidStatus: string;
  firstAidRef: string;
  firstAidCertFile: string;
  // Compliance — Safeguarding
  safeguardingStatus: string;
  safeguardingRef: string;
  safeguardingExpiry: string;
  // Sangh Responsibility
  sanghTitle: string;
  responsibilityType: string;
  responsibilityLevel: string;
  responsibilityStartDate: string;
}

const ADULT_MEMBER_PROFILE: MemberProfileForm = {
  firstName: "John",
  middleName: "",
  surname: "Doe",
  fullName: "John Doe",
  gender: "Male",
  dateOfBirth: "1988-04-14",
  occupation: "Sales Manager",
  email: "john.doe@company.com",
  secondaryEmail: "john.doe.personal@example.com",
  phone: "+44 7700 900123",
  secondaryPhone: "+44 7700 900124",
  buildingName: "Seva House",
  addressLine1: "18 Kings Road",
  addressLine2: "North Harrow",
  contactTownCity: "Harrow",
  postCode: "HA1 2AB",
  emergencyContactName: "Meera Doe",
  emergencyContactPhone: "+44 7700 900125",
  emergencyContactEmail: "meera.doe@example.com",
  emergencyContactRelationship: "Spouse",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianRelationship: "",
  membershipId: "MEM-00142",
  medicalInfoDeclared: "No",
  medicalInfoDetails: "",
  epiPen: "No",
  allergies: "",
  allergiesDeclared: "No",
  isFirstAider: "Yes",
  firstAidQualificationLevel: "1-day First Aid qualification",
  firstAidQualificationExpiryDate: "2026-09-15",
  dietaryRequirements: "Vegan",
  dietaryOtherSpecify: "",
  originatingStateIndia: "Gujarat",
  spokenLanguages: "English, Gujarati, Hindi",
  additionalNotes: "",
  country: "HSS UK",
  region: "London & South East",
  town: "Harrow",
  activityCentre: "Harrow Activity Centre",
  // Compliance — DBS
  dbsStatus: "Completed",
  dbsCertificateNumber: "001234567890",
  dbsCertificateDate: "2024-06-01",
  dbsCertificateFile: "dbs_john_doe_2024.pdf",
  dbsCertificateReceivedFrom: "Disclosure Scotland",
  dbsCertificateReceivedFromOther: "",
  dbsUpdateService: "Yes",
  dbsUpdateServiceNumber: "US-2024-00456",
  dbsUpdateServiceCheckDate: "2025-06-01",
  dbsAppUnderProcess: "No",
  dbsCheckedBy: "Ramesh Patel (Karyawaha)",
  // Compliance — First Aid
  firstAidStatus: "Completed",
  firstAidRef: "FA-2023-001",
  firstAidCertFile: "first_aid_cert_2023.pdf",
  safeguardingStatus: "Completed",
  safeguardingRef: "SG-2024-042",
  safeguardingExpiry: "2027-03-20",
  // Sangh Responsibility
  sanghTitle: "Ghatnayak",
  responsibilityType: "Pramukh",
  responsibilityLevel: "Shakha / Activity center",
  responsibilityStartDate: "2023-04-01",
};

function getDefaultMemberProfile(selectedRole: string): MemberProfileForm {
  if (selectedRole.toLowerCase().includes("teen")) {
    return {
      ...ADULT_MEMBER_PROFILE,
      firstName: "Rohan",
      middleName: "",
      surname: "Joshi",
      fullName: "Rohan Joshi",
      gender: "Male",
      dateOfBirth: "2010-02-19",
      occupation: "Student",
      email: "rohan.joshi@example.com",
      secondaryEmail: "",
      phone: "",
      secondaryPhone: "",
      emergencyContactName: "Meena Joshi",
      emergencyContactPhone: "+44 7700 900126",
      emergencyContactEmail: "meena.joshi@example.com",
      emergencyContactRelationship: "Mother",
      guardianName: "Meena Joshi",
      guardianPhone: "+44 7700 900126",
      guardianEmail: "meena.joshi@example.com",
      guardianRelationship: "Mother",
      membershipId: "MEM-00287",
      medicalInfoDeclared: "No",
      medicalInfoDetails: "",
      epiPen: "No",
      allergies: "",
      allergiesDeclared: "No",
      isFirstAider: "No",
      firstAidQualificationLevel: "",
      firstAidQualificationExpiryDate: "",
      dietaryRequirements: "",
      dietaryOtherSpecify: "",
      originatingStateIndia: "Gujarat",
      country: "HSS UK",
      region: "North West",
      town: "Manchester",
      activityCentre: "Manchester Central Activity Centre",
      dbsStatus: "Pending",
      dbsCertificateNumber: "",
      dbsCertificateDate: "",
      dbsCertificateFile: "",
      dbsCertificateReceivedFrom: "",
      dbsCertificateReceivedFromOther: "",
      dbsUpdateService: "No",
      dbsUpdateServiceNumber: "",
      dbsUpdateServiceCheckDate: "",
      dbsAppUnderProcess: "Yes",
      dbsCheckedBy: "",
      firstAidStatus: "Pending",
      firstAidRef: "",
      safeguardingStatus: "Pending",
      safeguardingRef: "",
      safeguardingExpiry: "",
      sanghTitle: "Shakha Karyawaha",
      responsibilityType: "Toli",
      responsibilityLevel: "Shakha / Activity center",
      responsibilityStartDate: "2024-09-01",
    };
  }
  return ADULT_MEMBER_PROFILE;
}

function getLocationForCentre(activityCentre: string) {
  for (const [town, centres] of Object.entries(MASTERS_CASCADE.centres)) {
    if (!centres.includes(activityCentre)) continue;
    for (const [region, towns] of Object.entries(MASTERS_CASCADE.towns)) {
      if (towns.includes(town)) return { country: "HSS UK", region, town, activityCentre };
    }
  }
  return null;
}

function valueOrDash(value?: string) {
  return value && value.trim() ? value : "—";
}

// ── Mock postcode-to-address lookup ────────────────────────────

const MOCK_STREET_NAMES = ['High Street', 'Church Road', 'Kings Avenue', 'Mill Lane', 'Victoria Street'];

function mockAddressesForPostcode(postcode: string, fallbackTown: string): { label: string; buildingName: string; addressLine1: string; town: string }[] {
  const cleaned = postcode.trim();
  if (cleaned.length < 4) return [];
  const seed = cleaned.toUpperCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return [1, 2, 3].map(n => {
    const street = MOCK_STREET_NAMES[(seed + n) % MOCK_STREET_NAMES.length];
    const houseNumber = ((seed * n) % 90) + 1;
    return {
      label: `${houseNumber} ${street}`,
      buildingName: '',
      addressLine1: `${houseNumber} ${street}`,
      town: fallbackTown,
    };
  });
}

// ── HB template detail-page building blocks ───────────────────

function InfoSection({ title, children, cols = 2, className = '' }: { title: string; children: ReactNode; cols?: 2 | 4; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden ${className}`}
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className={`px-6 pb-6 pt-4 grid gap-6 ${cols === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
        {label}{required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      <div className="text-sm text-neutral-900 dark:text-white font-medium">{children}</div>
    </div>
  );
}

function EditableInfoItem({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  options,
  placeholderOption,
  textarea = false,
  required = false,
  phone = false,
  error = false,
  errorMessage,
  disabled = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  options?: string[];
  placeholderOption?: string;
  textarea?: boolean;
  required?: boolean;
  phone?: boolean;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}) {
  if (!isEditing) {
    return <InfoItem label={label} required={required}>{valueOrDash(value)}</InfoItem>;
  }
  const errCls = error ? "border-error-400 dark:border-error-600 focus:ring-error-400/30" : "";
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
        {label}{required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <FormSelect value={value} onChange={e => onChange(e.target.value)} className={errCls} disabled={disabled}>
          {placeholderOption && <option value="">{placeholderOption}</option>}
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </FormSelect>
      ) : textarea ? (
        <FormTextarea value={value} onChange={e => onChange(e.target.value)} className={errCls} disabled={disabled} />
      ) : phone ? (
        <PhoneInput value={value} onChange={onChange} error={error} disabled={disabled} />
      ) : (
        <FormInput type={type} value={value} onChange={e => onChange(e.target.value)} className={errCls} disabled={disabled} />
      )}
      <ErrorText>{error && (errorMessage ?? 'This field is required.')}</ErrorText>
    </div>
  );
}

// ── Dietary requirements multi-select dropdown ───────────────

export function DietaryMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const r = buttonRef.current?.getBoundingClientRect();
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

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const optionLabel = (val: string) => val === 'Other' ? 'Other - With box to specify' : val;

  const displayText = selected.length === 0
    ? 'Select dietary requirements'
    : selected.map(optionLabel).join(', ');

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
      >
        <span className={`truncate text-sm ${selected.length === 0 ? 'text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && rect && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[999] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          <div className="max-h-56 overflow-y-auto">
            {DIETARY_MULTISELECT_OPTIONS.map(opt => (
              <div
                key={opt}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900"
                onClick={() => toggle(opt)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes(opt) ? 'bg-primary-600 border-primary-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                  {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">{optionLabel(opt)}</span>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Delete Account confirmation modal ────────────────────────

function DeleteAccountModal({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#BC0F1C]" />
            </div>
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">Delete Account</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Are you sure you want to delete your account? This action is <span className="font-semibold text-neutral-900 dark:text-white">permanent and cannot be undone</span>.
          </p>
          <div className="p-3 bg-[#fff0f0] dark:bg-[#fff0f0]/5 border border-[#ffaaab] dark:border-[#ffaaab]/30 rounded-lg">
            <ul className="text-xs text-[#9a0c17] dark:text-[#f87171] space-y-1 list-disc list-inside">
              <li>Your membership record will be permanently removed</li>
              <li>You will lose access to all HSS events and Shakhas</li>
              <li>This cannot be recovered by you or an administrator</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#ffaaab] text-[#9a0c17] bg-[#fff0f0] hover:bg-[#ffe0e0] dark:bg-[#fff0f0]/10 dark:border-[#ffaaab]/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Member profile view ───────────────────────────────────────

type ProfileTab = 'personal' | 'organisation' | 'compliance' | 'sangh' | 'history' | 'guardian' | 'other' | 'roles' | 'otherProfiles';

type CarriedOverMemberDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

// ── Upgrade (a member's own) child to a Teen account ───────────
// Mirrors NonMemberDashboard's UpgradeToTeenScreen — same fields, validation and
// copy — but renders inside the authenticated app shell (GlobalHeader/Toaster
// already present) instead of its own standalone header.
function UpgradeChildToTeenScreen({
  guardianFirstName,
  guardianSurname,
  guardianEmail,
  childId,
  onBack,
  onSubmitted,
}: {
  guardianFirstName: string;
  guardianSurname: string;
  guardianEmail: string;
  childId: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { firstName: childFirstName } = getChildProfileSummary(childId);
  const displayFirstName = childFirstName || "This child";

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [guardianName, setGuardianName] = useState(`${guardianFirstName} ${guardianSurname}`.trim());
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmailField, setGuardianEmailField] = useState(guardianEmail);
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
    if (!guardianName.trim()) errs.guardianName = "Parent / guardian name is required.";
    if (!guardianPhone.trim()) errs.guardianPhone = "Parent / guardian phone number is required.";
    if (!guardianEmailField.trim()) errs.guardianEmail = "Parent / guardian email is required.";
    else if (!emailRegex.test(guardianEmailField.trim())) errs.guardianEmail = "Enter a valid parent / guardian email.";
    if (!guardianRelationship.trim()) errs.guardianRelationship = "Parent / guardian relationship is required.";
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
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Other Profiles
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
              value={guardianEmailField}
              onChange={e => setGuardianEmailField(e.target.value)}
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
          <li>Their profile moves out of your "Other Profiles" tab</li>
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
  );
}

function MemberProfileView({ selectedRole, isPostRegistration = false, isUnderReview = false, onSubmitForApproval, activeChildId = null, onChildAdded, childAccounts = [], onSelectOtherProfile, onBack, backLabel = "Back", carriedOverDetails }: { selectedRole: string; isPostRegistration?: boolean; isUnderReview?: boolean; onSubmitForApproval?: () => void; activeChildId?: string | null; onChildAdded?: (child: { id: string; firstName: string; surname: string }) => void; childAccounts?: { id: string; firstName: string; surname: string }[]; onSelectOtherProfile?: (childId: string) => void; onBack?: () => void; backLabel?: string; carriedOverDetails?: CarriedOverMemberDetails }) {
  const storageKey = activeChildId ? `child:${activeChildId}` : selectedRole;
  const loadProfile = () => {
    // A freshly registered child hasn't been given a DOB yet — never default to the
    // adult template's date of birth, which would wrongly place them in an adult age band.
    const defaultProfile = activeChildId
      ? { ...getDefaultMemberProfile(selectedRole), dateOfBirth: '' }
      : getDefaultMemberProfile(selectedRole);
    const scope = getRoleScope(selectedRole);
    const approvedLocation = getMemberCentreOverrides()[scope.selfMemberId || selectedRole] || {
      country: scope.country || defaultProfile.country,
      region: scope.region || defaultProfile.region,
      town: scope.town || defaultProfile.town,
      activityCentre: scope.centre || defaultProfile.activityCentre,
    };
    // A child sub-profile is its own person — never inherit the parent's shared/carried-over fields.
    const shared = activeChildId ? {} : loadSharedProfile();
    const saved = typeof window !== "undefined" ? localStorage.getItem(`${MEMBER_PROFILE_STORAGE_KEY}:${storageKey}`) : null;
    let result: MemberProfileForm;
    if (!saved) {
      result = { ...defaultProfile, ...shared, ...approvedLocation };
    } else {
      try {
        result = { ...defaultProfile, ...JSON.parse(saved), ...shared, ...approvedLocation };
      } catch {
        result = { ...defaultProfile, ...shared, ...approvedLocation };
      }
    }
    // Registration flow always forces a fresh, deliberate choice for these — never inherit
    // a stale "No" from a previously saved draft or a shared value from another role.
    if (isPostRegistration) {
      result.medicalInfoDeclared = '';
      result.allergiesDeclared = '';
      result.isFirstAider = '';
    }
    if (isPostRegistration && !activeChildId && carriedOverDetails) {
      result.firstName = carriedOverDetails.firstName;
      result.middleName = '';
      result.surname = carriedOverDetails.lastName;
      result.fullName = [carriedOverDetails.firstName, carriedOverDetails.lastName].filter(Boolean).join(' ');
      result.email = carriedOverDetails.email;
      if (carriedOverDetails.phone) result.phone = carriedOverDetails.phone;
    }
    return result;
  };

  const [profile, setProfile] = useState<MemberProfileForm>(loadProfile);
  const [savedProfile, setSavedProfile] = useState<MemberProfileForm>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [postRegEditing, setPostRegEditing] = useState(isPostRegistration);
  const effectiveEditing = !isUnderReview && (isEditing || postRegEditing);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [upgradeChildId, setUpgradeChildId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(20);
  const [historySearch, setHistorySearch]       = useState('');
  const [historySortCol, setHistorySortCol]     = useState<'timestamp' | 'user' | 'role' | 'field' | 'oldValue' | 'newValue'>('timestamp');
  const [historySortDir, setHistorySortDir]     = useState<'asc' | 'desc'>('desc');
  const [historyDateStart, setHistoryDateStart] = useState('');
  const [historyDateEnd, setHistoryDateEnd]     = useState('');
  const [historyDateLabel, setHistoryDateLabel] = useState('');
  const [showHistoryDateFilter, setShowHistoryDateFilter] = useState(false);
  const historyDateRef = useRef<HTMLDivElement>(null);
  const memberId = activeChildId ? storageKey : (getRoleScope(selectedRole).selfMemberId || selectedRole);
  const [pendingTransfer, setPendingTransfer] = useState<ShakhaTransferRequest | undefined>(
    () => getPendingTransferForMember(memberId),
  );
  const [transferHistory, setTransferHistory] = useState<ShakhaTransferRequest[]>(
    () => getTransferRequests().filter(request => request.memberId === memberId),
  );

  useEffect(() => {
    const override = getMemberCentreOverrides()[memberId];
    const next = { ...loadProfile(), ...(override || {}) };
    setProfile(next);
    setSavedProfile(next);
    setIsEditing(false);
    setPostRegEditing(isPostRegistration);
    setPendingTransfer(getPendingTransferForMember(memberId));
    setTransferHistory(getTransferRequests().filter(request => request.memberId === memberId));
  }, [selectedRole, memberId, activeChildId, carriedOverDetails?.firstName, carriedOverDetails?.lastName, carriedOverDetails?.email, carriedOverDetails?.phone]);

  useEffect(() => {
    const refreshTransferState = () => {
      const override = getMemberCentreOverrides()[memberId];
      if (override) {
        setProfile(current => ({ ...current, ...override }));
        setSavedProfile(current => ({ ...current, ...override }));
      }
      setPendingTransfer(getPendingTransferForMember(memberId));
      setTransferHistory(getTransferRequests().filter(request => request.memberId === memberId));
    };
    window.addEventListener(TRANSFER_CHANGE_EVENT, refreshTransferState);
    return () => window.removeEventListener(TRANSFER_CHANGE_EVENT, refreshTransferState);
  }, [memberId]);

  const fullName = [profile.firstName, profile.middleName, profile.surname]
    .map(p => p.trim())
    .filter(Boolean)
    .join(" ");

  const initials = fullName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "JD";
  const isTeenRole = selectedRole.toLowerCase().includes("teen");
  const isMemberRole = true;
  const lockCarriedOverDetails = isPostRegistration && !activeChildId && !!carriedOverDetails;
  const lockCarriedOverPhone = lockCarriedOverDetails && !!profile.phone?.trim();
  const dobAge = getAge(profile.dateOfBirth);
  const isTeenByDob = dobAge >= 13 && dobAge <= 17;
  const isMinorByDob = dobAge >= 0 && dobAge < 18;
  const showGuardian = isTeenRole || isMinorByDob || !!activeChildId;

  const setField = (field: keyof MemberProfileForm, value: string) => {
    setProfile(cur => {
      const next = { ...cur, [field]: value };
      if (field === "firstName" || field === "middleName" || field === "surname") {
        next.fullName = [next.firstName, next.middleName, next.surname]
          .map(p => p.trim()).filter(Boolean).join(" ");
      }
      if (field === "isFirstAider" && value === "No") {
        next.firstAidQualificationLevel = "";
        next.firstAidQualificationExpiryDate = "";
      }
      return next;
    });
    if (fieldErrors[field as string]) setFieldErrors(prev => ({ ...prev, [field as string]: false }));
  };

  const setOrganisationField = (field: 'country' | 'region' | 'town' | 'activityCentre', value: string) => {
    setProfile(current => {
      const next = { ...current, [field]: value };
      if (field === 'country') {
        next.region = '';
        next.town = '';
        next.activityCentre = '';
      } else if (field === 'region') {
        next.town = '';
        next.activityCentre = '';
      } else if (field === 'town') {
        next.activityCentre = '';
      }
      return next;
    });
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    const isEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    if (!profile.firstName?.trim() || !profile.surname?.trim() || !profile.gender || !profile.dateOfBirth) {
      setFieldErrors(prev => ({
        ...prev,
        firstName: !profile.firstName?.trim(),
        surname: !profile.surname?.trim(),
        gender: !profile.gender,
        dateOfBirth: !profile.dateOfBirth,
      }));
      toast.error('First name, surname, gender and date of birth are required.');
      return;
    }
    if (!profile.phone?.trim() || !isEmail(profile.email)) {
      setFieldErrors(prev => ({ ...prev, phone: !profile.phone?.trim(), email: !isEmail(profile.email) }));
      toast.error('A valid contact number and email address are required.');
      return;
    }
    if (!profile.postCode?.trim() || !profile.addressLine1?.trim() || !profile.contactTownCity?.trim()) {
      setFieldErrors(prev => ({
        ...prev,
        postCode: !profile.postCode?.trim(),
        addressLine1: !profile.addressLine1?.trim(),
        contactTownCity: !profile.contactTownCity?.trim(),
      }));
      toast.error('Post code, address line 1 and town / city are required.');
      return;
    }
    if (!profile.emergencyContactName?.trim() || !profile.emergencyContactPhone?.trim() || !isEmail(profile.emergencyContactEmail)) {
      setFieldErrors(prev => ({
        ...prev,
        emergencyContactName: !profile.emergencyContactName?.trim(),
        emergencyContactPhone: !profile.emergencyContactPhone?.trim(),
        emergencyContactEmail: !isEmail(profile.emergencyContactEmail),
      }));
      toast.error('Emergency contact details are required.');
      return;
    }
    if (showGuardian && !activeChildId && (!profile.guardianName?.trim() || !profile.guardianPhone?.trim() || !isEmail(profile.guardianEmail) || !profile.guardianRelationship?.trim())) {
      setFieldErrors(prev => ({
        ...prev,
        guardianName: !profile.guardianName?.trim(),
        guardianPhone: !profile.guardianPhone?.trim(),
        guardianEmail: !isEmail(profile.guardianEmail),
        guardianRelationship: !profile.guardianRelationship?.trim(),
      }));
      toast.error('Parent / guardian details are required.');
      return;
    }
    if (!profile.region || !profile.town || !profile.activityCentre) {
      setFieldErrors(prev => ({ ...prev, region: !profile.region, town: !profile.town, activityCentre: !profile.activityCentre }));
      toast.error('Vibhag, Nagar and Shakha are required.');
      return;
    }
    setFieldErrors({});
    const organisationChanged = profile.activityCentre !== savedProfile.activityCentre;
    if (organisationChanged) {
      const destination = getLocationForCentre(profile.activityCentre);
      if (!destination || pendingTransfer) {
        toast.error(pendingTransfer ? "A Shakha transfer request is already pending." : "Please select a valid Shakha.");
        return;
      }
      try {
        const request = createTransferRequest({
          memberId,
          memberName: fullName,
          memberRole: selectedRole,
          fromCountry: savedProfile.country,
          fromRegion: savedProfile.region,
          fromTown: savedProfile.town,
          fromCentre: savedProfile.activityCentre,
          toCountry: destination.country,
          toRegion: destination.region,
          toTown: destination.town,
          toCentre: destination.activityCentre,
        });
        setPendingTransfer(request);
        setTransferHistory(getTransferRequests().filter(item => item.memberId === memberId));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to submit transfer request.");
        return;
      }
    }
    const next = {
      ...profile,
      fullName,
      ...(organisationChanged ? {
        country: savedProfile.country,
        region: savedProfile.region,
        town: savedProfile.town,
        activityCentre: savedProfile.activityCentre,
      } : {}),
    };
    localStorage.setItem(`${MEMBER_PROFILE_STORAGE_KEY}:${storageKey}`, JSON.stringify(next));
    // A child's own details should never leak into the parent's shared/carried-over fields.
    if (!activeChildId) saveSharedProfile(next as unknown as Record<string, string>);
    setProfile(next);
    setSavedProfile(next);
    setIsEditing(false);
    toast.success(organisationChanged
      ? "Profile updated and Shakha transfer submitted for approval."
      : "Profile updated successfully.");
  };

  const validateComplianceForSubmit = () => {
    if (!isPostRegistration) return true;
    const missing: string[] = [];
    const errs: Record<string, boolean> = {};
    if (!activeChildId && !profile.isFirstAider) { missing.push('"Are you a first aider for HSS?"'); errs.isFirstAider = true; }
    if (!profile.medicalInfoDeclared) { missing.push('"Do you have any medical conditions?"'); errs.medicalInfoDeclared = true; }
    if (!profile.allergiesDeclared) { missing.push('"Do you have any allergies?"'); errs.allergiesDeclared = true; }
    if (missing.length) {
      setFieldErrors(prev => ({ ...prev, ...errs }));
      toast.error(`Please select an option for: ${missing.join(', ')}.`);
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem(`${MEMBER_PROFILE_STORAGE_KEY}:${storageKey}`);
    setShowDeleteModal(false);
    toast.success("Your account deletion request has been submitted. An administrator will process it shortly.");
  };

  const formatDate = (iso: string) => sharedFormatDate(iso);

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'personal',     label: 'Personal Info'       },
    ...(showGuardian ? [{ id: 'guardian' as ProfileTab, label: 'Parent / Guardian' }] : []),
    { id: 'organisation', label: 'Organisation'        },
    { id: 'compliance',   label: 'Compliance Details'  },
    ...(!isPostRegistration ? [
      { id: 'roles' as ProfileTab, label: 'Responsibilities and Roles' },
      { id: 'other' as ProfileTab, label: 'Other Information'      },
      // Only the adult's own profile can have linked children — never shown
      // while viewing a child's profile, and only once at least one exists.
      ...(!activeChildId && childAccounts.length > 0 ? [
        { id: 'otherProfiles' as ProfileTab, label: 'Other Profiles' },
      ] : []),
      { id: 'history' as ProfileTab, label: 'History'              },
    ] : []),
  ];

  const formatDateTime = (iso: string) => sharedFormatDateTime(iso);

  interface ChangeRow {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    field: string;
    oldValue: string;
    newValue: string;
  }

  const changeHistory = useMemo((): ChangeRow[] => {
    const base = new Date('2021-01-20T10:00:00Z');
    const shift = (days: number, hrs = 0, mins = 0) => {
      const d = new Date(base); d.setDate(d.getDate() + days); d.setHours(hrs, mins, 0, 0); return d.toISOString();
    };
    return [
      { id: 'h-6a', timestamp: shift(45, 11, 0),  user: 'Priya Sharma', role: 'Admin',           field: 'Sangh Responsibility', oldValue: 'Shikshak',           newValue: 'Ghatnayak' },
      { id: 'h-6b', timestamp: shift(45, 11, 0),  user: 'Priya Sharma', role: 'Admin',           field: 'Vibhag (Region)',       oldValue: 'North West',         newValue: 'London & South East' },
      { id: 'h-6c', timestamp: shift(45, 11, 0),  user: 'Priya Sharma', role: 'Admin',           field: 'Shakha (Branch)',       oldValue: 'Manchester Central', newValue: 'Harrow Activity Centre' },
      { id: 'h-5a', timestamp: shift(22, 18, 5),  user: 'John Doe',     role: 'Member (Self)',   field: 'Primary Contact Number', oldValue: '+44 7700 900100',   newValue: '+44 7700 900123' },
      { id: 'h-5b', timestamp: shift(22, 18, 5),  user: 'John Doe',     role: 'Member (Self)',   field: 'Address Line',          oldValue: '10 Queens Road',     newValue: '18 Kings Road' },
      { id: 'h-5c', timestamp: shift(22, 18, 5),  user: 'John Doe',     role: 'Member (Self)',   field: 'Post Code',             oldValue: 'HA2 0AA',            newValue: 'HA1 2AB' },
      { id: 'h-4a', timestamp: shift(12, 9, 45),  user: 'John Doe',     role: 'Admin',           field: 'First Aid Status',      oldValue: 'Pending',            newValue: 'Completed' },
      { id: 'h-4b', timestamp: shift(12, 9, 45),  user: 'John Doe',     role: 'Admin',           field: 'First Aid Reference',   oldValue: '—',                  newValue: 'FA-2023-001' },
      { id: 'h-3a', timestamp: shift(7, 14, 15),  user: 'Sarah Patel',  role: 'Admin',           field: 'DBS Status',            oldValue: 'Pending',            newValue: 'Completed' },
      { id: 'h-3b', timestamp: shift(7, 14, 15),  user: 'Sarah Patel',  role: 'Admin',           field: 'DBS Certificate Number', oldValue: '—',                 newValue: '001234567890' },
      { id: 'h-2a', timestamp: shift(3, 10, 30),  user: 'John Doe',     role: 'Admin',           field: 'Status',                oldValue: 'Pending',            newValue: 'Active & Approved' },
      { id: 'h-1a', timestamp: base.toISOString(), user: 'John Doe',    role: 'Member (Self)',   field: 'Account Created',       oldValue: '—',                  newValue: 'Registration submitted' },
    ];
  }, []);

  const approvalEntry = changeHistory.find(e => e.field === 'Status' && e.role === 'Admin');
  const approvedDate  = approvalEntry?.timestamp ?? null;
  const approvedBy    = approvalEntry ? `${approvalEntry.user} (Admin)` : '-';
  const registrationDate = '2021-01-20T10:00:00Z';

  const filteredHistory = useMemo(() => {
    let rows = [...changeHistory];
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      rows = rows.filter(r =>
        r.user.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.field.toLowerCase().includes(q) ||
        r.oldValue.toLowerCase().includes(q) ||
        r.newValue.toLowerCase().includes(q)
      );
    }
    if (historyDateStart) {
      const start = new Date(historyDateStart).getTime();
      rows = rows.filter(r => new Date(r.timestamp).getTime() >= start);
    }
    if (historyDateEnd) {
      const end = new Date(historyDateEnd).getTime() + 86399999;
      rows = rows.filter(r => new Date(r.timestamp).getTime() <= end);
    }
    rows.sort((a, b) => {
      if (historySortCol === 'timestamp') {
        const av = new Date(a.timestamp).getTime();
        const bv = new Date(b.timestamp).getTime();
        return historySortDir === 'asc' ? av - bv : bv - av;
      }
      const av = String(a[historySortCol]);
      const bv = String(b[historySortCol]);
      return historySortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [changeHistory, historySearch, historyDateStart, historyDateEnd, historySortCol, historySortDir]);

  if (upgradeChildId) {
    return (
      <UpgradeChildToTeenScreen
        guardianFirstName={profile.firstName}
        guardianSurname={profile.surname}
        guardianEmail={profile.email}
        childId={upgradeChildId}
        onBack={() => setUpgradeChildId(null)}
        onSubmitted={() => setUpgradeChildId(null)}
      />
    );
  }

  return (
    <div className="px-6 py-6">

      {/* ── Profile header ───────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">

        {/* Left: info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            {/* Row 1 — Name | Role | Age badge | Status badge — all inline */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-[32px] font-semibold text-neutral-900 dark:text-white">{valueOrDash(fullName)}</h1>
              {!(isPostRegistration || isUnderReview) && (
                <>
                  <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]">
                    {getAgeGroupLabel(profile.dateOfBirth)}
                  </span>
                  {pendingTransfer ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs bg-[#fffbeb] border-[#fde68a]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F9B03D]" />
                      <span className="text-[#d97706]">Pending Approval</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs bg-success-50 border-success-200 dark:bg-success-950/20 dark:border-success-800">
                      <span className="text-success-700 dark:text-success-400">Active &amp; Approved</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {onBack && <SecondaryButton icon={ArrowLeft} onClick={onBack}>{backLabel}</SecondaryButton>}
          {isUnderReview ? null : isPostRegistration && postRegEditing ? (
            <>
              <SecondaryButton icon={Save} onClick={() => { handleSave(); setPostRegEditing(false); }}>Save as Draft</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { if (!validateComplianceForSubmit()) return; handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : isPostRegistration && !postRegEditing ? (
            <>
              <SecondaryButton icon={Edit} onClick={() => setPostRegEditing(true)}>Edit Profile</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { if (!validateComplianceForSubmit()) return; handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : isEditing ? (
            <>
              <SecondaryButton icon={X} onClick={handleCancel}>Cancel</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave}>Save Changes</PrimaryButton>
            </>
          ) : (
            <>
              {!activeChildId && selectedRole === 'Adult Member' && (
                <SecondaryButton icon={UserPlus} onClick={() => {
                  const id = generateMemberId();
                  localStorage.setItem(`${MEMBER_PROFILE_STORAGE_KEY}:child:${id}`, JSON.stringify({
                    firstName: 'John',
                    surname: 'Doe',
                    gender: 'Male',
                    dateOfBirth: '1990-01-01',
                    country: 'HSS UK',
                    region: 'London & South East',
                    town: 'Wembley',
                    activityCentre: 'Wembley Activity Centre',
                    // Contact details for a child registered by an adult member always
                    // come from the adult's own profile, and stay read-only (see the
                    // Contact Details fields below).
                    email: profile.email,
                    phone: profile.phone,
                  }));
                  onChildAdded?.({ id, firstName: 'John', surname: 'Doe' });
                }}>Add Child</SecondaryButton>
              )}
              <PrimaryButton icon={Edit} onClick={() => setIsEditing(true)}>Edit Profile</PrimaryButton>
            </>
          )}
        </div>
      </div>

      {/* ── Banners ───────────────────────────────────────────── */}
      {isUnderReview && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
          <p className="text-sm text-blue-800 dark:text-blue-300">Your application is currently under review. Once your Shakha Karyawaha approves your membership, you will have full access to MyHSS.</p>
        </div>
      )}
      {isPostRegistration && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
          <p className="text-sm text-amber-800 dark:text-amber-300">Complete all required fields and submit your registration for approval by the Shakha Karyawaha. Once approved, you can access all the features of MyHSS.</p>
        </div>
      )}

      {/* ── Tabbed content ───────────────────────────────────── */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">

        {/* Tab bar */}
        {!isPostRegistration && (
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab content */}
        <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">

          {/* ── Personal Info ── */}
          {(isPostRegistration || activeTab === 'personal') && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InfoSection title="Personal Details">
                <EditableInfoItem label="First Name" required    value={profile.firstName}   isEditing={effectiveEditing} onChange={v => setField("firstName", v)} error={fieldErrors.firstName} errorMessage="First name is required." disabled={lockCarriedOverDetails} />
                {!isPostRegistration && <InfoItem label="Membership ID">{valueOrDash(profile.membershipId)}</InfoItem>}
                <EditableInfoItem label="Middle Name"   value={profile.middleName}  isEditing={effectiveEditing} onChange={v => setField("middleName", v)} />
                <EditableInfoItem label="Gender" required        value={profile.gender}      isEditing={effectiveEditing} onChange={v => setField("gender", v)} options={["Male", "Female"]} error={fieldErrors.gender} errorMessage="Gender is required." />
                <EditableInfoItem label="Last Name" required     value={profile.surname}     isEditing={effectiveEditing} onChange={v => setField("surname", v)} error={fieldErrors.surname} errorMessage="Last name is required." disabled={lockCarriedOverDetails} />
                {effectiveEditing ? (
                  <EditableInfoItem label="Date of Birth" required value={profile.dateOfBirth} isEditing onChange={v => setField("dateOfBirth", v)} type="date" error={fieldErrors.dateOfBirth} errorMessage="Date of birth is required." />
                ) : (
                  <InfoItem label="Date of Birth" required>
                    {formatDate(profile.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {getAge(profile.dateOfBirth)})</span>
                  </InfoItem>
                )}
              </InfoSection>

              <InfoSection title="Contact Details">
                <EditableInfoItem label="Contact Number" required  value={profile.phone}           isEditing={effectiveEditing && !activeChildId} onChange={v => setField("phone", v)}  phone error={fieldErrors.phone} errorMessage="Contact number is required." disabled={lockCarriedOverPhone} />
                <EditableInfoItem label="Email Address" required   value={profile.email}           isEditing={effectiveEditing && selectedRole === 'Super Admin'} onChange={v => setField("email", v)}  type="email" error={fieldErrors.email} errorMessage="Enter a valid email address." disabled={lockCarriedOverDetails} />
                <EditableInfoItem
                  label="Post Code"
                  required
                  value={profile.postCode}
                  isEditing={effectiveEditing}
                  onChange={v => { setField("postCode", v); setSelectedAddress(''); }}
                  error={fieldErrors.postCode}
                  errorMessage="Post code is required."
                />
                {effectiveEditing && (
                  <div>
                    <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Select Address</label>
                    <FormSelect
                      value={selectedAddress}
                      disabled={profile.postCode.trim().length < 4}
                      onChange={e => {
                        const idx = e.target.value;
                        setSelectedAddress(idx);
                        const options = mockAddressesForPostcode(profile.postCode, profile.town);
                        const picked = options[Number(idx)];
                        if (picked) {
                          setField("buildingName", picked.buildingName);
                          setField("addressLine1", picked.addressLine1);
                          setField("contactTownCity", picked.town);
                        }
                      }}
                    >
                      <option value="">{profile.postCode.trim().length < 4 ? 'Enter a post code first' : 'Select an address'}</option>
                      {mockAddressesForPostcode(profile.postCode, profile.town).map((opt, i) => (
                        <option key={i} value={i}>{opt.label}</option>
                      ))}
                    </FormSelect>
                  </div>
                )}
                <EditableInfoItem label="Building Name"   value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
                <EditableInfoItem label="Address Line 1" required  value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} error={fieldErrors.addressLine1} errorMessage="Address line 1 is required." />
                <EditableInfoItem label="Address Line 2"  value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
                <EditableInfoItem label="Town / City" required     value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} error={fieldErrors.contactTownCity} errorMessage="Town / city is required." />
              </InfoSection>

              {isPostRegistration && showGuardian && !activeChildId && (
                <div className="xl:col-span-2">
                  <InfoSection title="Parents / Guardian Details" cols={4}>
                    <EditableInfoItem label="Parent / Guardian Name" required         value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} error={fieldErrors.guardianName} errorMessage="Parent / guardian name is required." />
                    <EditableInfoItem label="Parent / Guardian Phone Number" required value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} phone error={fieldErrors.guardianPhone} errorMessage="Parent / guardian phone number is required." />
                    <EditableInfoItem label="Parent / Guardian Email" required        value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" error={fieldErrors.guardianEmail} errorMessage="Enter a valid parent / guardian email." />
                    <EditableInfoItem label="Parent / Guardian Relationship" required value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} options={["Parent", "Guardian"]} error={fieldErrors.guardianRelationship} errorMessage="Parent / guardian relationship is required." />
                  </InfoSection>
                </div>
              )}

              <InfoSection title="Emergency Contact Details">
                <EditableInfoItem label="Contact Name" required         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} error={fieldErrors.emergencyContactName} errorMessage="Contact name is required." />
                <EditableInfoItem label="Contact Phone Number" required value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} phone error={fieldErrors.emergencyContactPhone} errorMessage="Contact phone number is required." />
                <EditableInfoItem label="Contact Email" required        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" error={fieldErrors.emergencyContactEmail} errorMessage="Enter a valid contact email address." />
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                    Contact Relationship<span className="text-error-500 ml-0.5">*</span>
                  </label>
                  {effectiveEditing ? (
                    <div className="space-y-2">
                      <FormSelect
                        value={RELATIONSHIP_OPTIONS.includes(profile.emergencyContactRelationship) ? profile.emergencyContactRelationship : 'Other'}
                        onChange={e => setField("emergencyContactRelationship", e.target.value === 'Other' ? '' : e.target.value)}
                        className={fieldErrors.emergencyContactRelationship ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Other">Other - With box to specify</option>
                      </FormSelect>
                      {!RELATIONSHIP_OPTIONS.includes(profile.emergencyContactRelationship) && (
                        <FormInput
                          type="text"
                          placeholder="Please specify"
                          value={profile.emergencyContactRelationship}
                          onChange={e => setField("emergencyContactRelationship", e.target.value)}
                          className={fieldErrors.emergencyContactRelationship ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                        />
                      )}
                      <ErrorText>{fieldErrors.emergencyContactRelationship && 'Contact relationship is required.'}</ErrorText>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.emergencyContactRelationship || '—'}</p>
                  )}
                </div>
              </InfoSection>

              <InfoSection title="Medical Details">
                <EditableInfoItem
                  label="Do you have any medical conditions?"
                  required
                  value={profile.medicalInfoDeclared}
                  isEditing={effectiveEditing}
                  onChange={v => {
                    setField("medicalInfoDeclared", v);
                    if (v !== "Yes") setField("medicalInfoDetails", "");
                  }}
                  options={["No", "Yes"]}
                  placeholderOption={isPostRegistration ? "Select option" : undefined}
                  error={fieldErrors.medicalInfoDeclared}
                />
                {profile.medicalInfoDeclared === "Yes" && (
                  <EditableInfoItem
                    label="Please state any medical details to be aware of"
                    required
                    value={profile.medicalInfoDetails}
                    isEditing={effectiveEditing}
                    onChange={v => setField("medicalInfoDetails", v)}
                    textarea
                  />
                )}
                <EditableInfoItem
                  label="Do you have any allergies?"
                  required
                  value={profile.allergiesDeclared}
                  isEditing={effectiveEditing}
                  onChange={v => {
                    setField("allergiesDeclared", v);
                    if (v !== "Yes") { setField("allergies", ""); setField("epiPen", ""); }
                  }}
                  options={["No", "Yes"]}
                  placeholderOption={isPostRegistration ? "Select option" : undefined}
                  error={fieldErrors.allergiesDeclared}
                />
                {profile.allergiesDeclared === "Yes" && (
                  <>
                    <EditableInfoItem
                      label="Please state allergy details to be aware of"
                      required
                      value={profile.allergies}
                      isEditing={effectiveEditing}
                      onChange={v => setField("allergies", v)}
                      textarea
                    />
                    <EditableInfoItem
                      label="Do you carry an EpiPen/Jext/Emerade?"
                      required
                      value={profile.epiPen}
                      isEditing={effectiveEditing}
                      onChange={v => setField("epiPen", v)}
                      options={["No", "Yes"]}
                    />
                  </>
                )}
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Special Dietary Requirements</label>
                  {effectiveEditing ? (
                    <div className="space-y-2 mt-1">
                      <DietaryMultiSelect
                        selected={profile.dietaryRequirements ? profile.dietaryRequirements.split(',').map(s => s.trim()).filter(Boolean) : []}
                        onChange={vals => setField("dietaryRequirements", vals.join(', '))}
                      />
                      {profile.dietaryRequirements.split(',').map(s => s.trim()).includes('Other') && (
                        <FormInput
                          type="text"
                          placeholder="Please specify"
                          value={profile.dietaryOtherSpecify}
                          onChange={e => setField("dietaryOtherSpecify", e.target.value)}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {profile.dietaryRequirements
                        ? profile.dietaryRequirements.split(',').map(s => s.trim()).filter(Boolean).map(v => v === 'Other'
                            ? `Other${profile.dietaryOtherSpecify ? `: ${profile.dietaryOtherSpecify}` : ''}`
                            : v).join(', ')
                        : '—'}
                    </p>
                  )}
                </div>
              </InfoSection>

            </div>
          )}

          {/* ── Contact ── */}
          {false && activeTab === 'contact' && (
            <InfoSection title="Contact Information">
              <EditableInfoItem label="Primary Email Address" required    value={profile.email}           isEditing={effectiveEditing} onChange={v => setField("email", v)}           type="email" />
              <EditableInfoItem label="Secondary Email Address"  value={profile.secondaryEmail}  isEditing={effectiveEditing} onChange={v => setField("secondaryEmail", v)}  type="email" />
              <EditableInfoItem label="Primary Contact Number" required   value={profile.phone}           isEditing={effectiveEditing} onChange={v => setField("phone", v)}           phone />
              <EditableInfoItem label="Secondary Contact Number" value={profile.secondaryPhone}  isEditing={effectiveEditing} onChange={v => setField("secondaryPhone", v)}  phone />
              <EditableInfoItem label="Building Name"            value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
              <EditableInfoItem label="Address Line 1" required           value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} />
              <EditableInfoItem label="Address Line 2"           value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
              <EditableInfoItem label="Town / City" required              value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} />
              <EditableInfoItem label="Post Code" required                value={profile.postCode}        isEditing={effectiveEditing} onChange={v => setField("postCode", v)} />
            </InfoSection>
          )}

          {/* ── Emergency & Guardian ── */}
          {false && activeTab === 'emergency' && (
            <>
              <InfoSection title="Emergency Contact">
                <EditableInfoItem label="Name"         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Phone"        value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} phone />
                <EditableInfoItem label="Email"        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <EditableInfoItem label="Relationship" value={profile.emergencyContactRelationship} isEditing={effectiveEditing} onChange={v => setField("emergencyContactRelationship", v)} />
              </InfoSection>

              {showGuardian && (
                <InfoSection title="Parent / Guardian Approval Information">
                  <EditableInfoItem label="Parent / Guardian Name" required value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} />
                  <EditableInfoItem label="Phone"                  value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} phone />
                  <EditableInfoItem label="Email"                  value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" />
                  <EditableInfoItem label="Relationship"           value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} />
                </InfoSection>
              )}
            </>
          )}

          {/* ── Compliance Details ── */}
          {(isPostRegistration || activeTab === 'compliance') && (
            <>
              {/* First Aid + Safeguarding — full width */}
              <div className="space-y-5">
                {!activeChildId && (
                <InfoSection title="First Aid" cols={4}>
                  <EditableInfoItem label="Are you a first aider for HSS?" required value={profile.isFirstAider}                   isEditing={effectiveEditing} onChange={v => setField("isFirstAider", v)}                   options={["No", "Yes"]} placeholderOption={isPostRegistration ? "Select option" : undefined} error={fieldErrors.isFirstAider} />
                  {profile.isFirstAider === "Yes" && (
                    <>
                      <EditableInfoItem label="Expiry Date"                     value={profile.firstAidQualificationExpiryDate} isEditing={effectiveEditing} onChange={v => setField("firstAidQualificationExpiryDate", v)} type="date" />
                      <EditableInfoItem label="First Aid Qualification"         value={profile.firstAidQualificationLevel}      isEditing={effectiveEditing} onChange={v => setField("firstAidQualificationLevel", v)}      options={[...FIRST_AID_QUALIFICATION_OPTIONS]} />
                      <div>
                        <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Cert Upload</label>
                        {effectiveEditing ? (
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
                              <Upload className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex-1 truncate">
                                {profile.firstAidCertFile || "Click to upload certificate…"}
                              </span>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
                                onChange={e => { const f = e.target.files?.[0]; if (f) setField("firstAidCertFile", f.name); }} />
                            </label>
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Accepted: PDF, JPG, PNG</p>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-900 dark:text-white font-medium">
                            {profile.firstAidCertFile
                              ? <span className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400"><Paperclip className="w-3.5 h-3.5 flex-shrink-0" />{profile.firstAidCertFile}</span>
                              : "—"}
                          </div>
                        )}
                      </div>
                      {!isPostRegistration && <EditableInfoItem label="First Aid Status" value={profile.firstAidStatus} isEditing={effectiveEditing} onChange={v => setField("firstAidStatus", v)} options={["Pending", "Completed"]} />}
                    </>
                  )}
                </InfoSection>
                )}

                {!isPostRegistration && (
                <InfoSection title="Safeguarding" cols={4}>
                  <EditableInfoItem label="Level of Training"  value={profile.safeguardingRef}    isEditing={false} onChange={v => setField("safeguardingRef", v)} />
                  <EditableInfoItem label="Date Completed"     value={profile.safeguardingExpiry} isEditing={false} onChange={v => setField("safeguardingExpiry", v)} type="date" />
                  <EditableInfoItem label="Safeguarding Status" value={profile.safeguardingStatus} isEditing={false} onChange={v => setField("safeguardingStatus", v)} options={["Pending", "Completed"]} />
                </InfoSection>
                )}
              </div>

              {/* Disclosure Barring Service — full width, 4-col rows */}
              {!isPostRegistration && <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Disclosure Barring Service</h4>
                </div>
                <div className="px-4 py-4 space-y-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Status</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsStatus || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Number</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Date</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateDate ? sharedFormatDate(profile.dbsCertificateDate) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert File</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {profile.dbsCertificateFile
                          ? <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400"><Paperclip className="w-3.5 h-3.5" />{profile.dbsCertificateFile}</span>
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Update Service</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsUpdateService || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Update Service No.</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsUpdateServiceNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Application Under Process</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsAppUnderProcess || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Received From</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateReceivedFrom || "—"}</p>
                    </div>
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Verified By</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCheckedBy || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>}
            </>
          )}

          {/* ── Sangh Responsibility ── */}
          {/* ── Organisation ── */}
          {(isPostRegistration || activeTab === 'organisation') && (
            <>
              {/* Organisation Details */}
              <InfoSection title="Shakha Details" cols={4}>
                <EditableInfoItem
                  label="Country"
                  value={profile.country}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('country', value)}
                  options={MASTERS_CASCADE.countries}
                />
                <EditableInfoItem
                  label="Vibhag" required
                  value={profile.region}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('region', value)}
                  options={profile.country ? (MASTERS_CASCADE.regions[profile.country] ?? []) : []}
                  error={fieldErrors.region}
                  errorMessage="Vibhag is required."
                />
                <EditableInfoItem
                  label="Nagar" required
                  value={profile.town}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('town', value)}
                  options={profile.region ? (MASTERS_CASCADE.towns[profile.region] ?? []) : []}
                  error={fieldErrors.town}
                  errorMessage="Nagar is required."
                />
                <EditableInfoItem
                  label="Shakha" required
                  value={profile.activityCentre}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('activityCentre', value)}
                  options={profile.town ? (MASTERS_CASCADE.centres[profile.town] ?? []) : []}
                  error={fieldErrors.activityCentre}
                  errorMessage="Shakha is required."
                />
                {!isPostRegistration && <InfoItem label="Age Category">{profile.dateOfBirth ? getAgeGroupLabel(profile.dateOfBirth) : '—'}</InfoItem>}
              </InfoSection>

            </>
          )}

          {/* ── Parent / Guardian Tab ── */}
          {!isPostRegistration && activeTab === 'guardian' && showGuardian && (
            <InfoSection title="Approval Details" cols={4}>
              <EditableInfoItem label="Parent / Guardian Name" required         value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} error={fieldErrors.guardianName} errorMessage="Parent / guardian name is required." />
              <EditableInfoItem label="Parent / Guardian Phone Number" required value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} phone error={fieldErrors.guardianPhone} errorMessage="Parent / guardian phone number is required." />
              <EditableInfoItem label="Parent / Guardian Email" required        value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" error={fieldErrors.guardianEmail} errorMessage="Enter a valid parent / guardian email." />
              <EditableInfoItem label="Parent / Guardian Relationship" required value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} options={["Parent", "Guardian"]} error={fieldErrors.guardianRelationship} errorMessage="Parent / guardian relationship is required." />
            </InfoSection>
          )}

          {/* ── Other Information Tab ── */}
          {(isPostRegistration || activeTab === 'other') && (
            <div className="space-y-5">
              <InfoSection title="Other Information" cols={4}>
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                    Occupation<span className="text-error-500 ml-0.5">*</span>
                  </label>
                  {effectiveEditing ? (
                    <div className="space-y-2">
                      <FormSelect
                        value={OCCUPATION_OPTIONS.includes(profile.occupation) ? profile.occupation : 'Other'}
                        onChange={e => setField("occupation", e.target.value === 'Other' ? '' : e.target.value)}
                      >
                        <option value="Student">Student</option>
                        <option value="Business man">Business man</option>
                        <option value="Job">Job</option>
                        <option value="Other">Other - With box to specify</option>
                      </FormSelect>
                      {!OCCUPATION_OPTIONS.includes(profile.occupation) && (
                        <FormInput
                          type="text"
                          placeholder="Please specify"
                          value={profile.occupation}
                          onChange={e => setField("occupation", e.target.value)}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-900 dark:text-white font-medium">{valueOrDash(profile.occupation)}</p>
                  )}
                </div>
                <EditableInfoItem label="Spoken Language(s)"                       value={profile.spokenLanguages}      isEditing={effectiveEditing} onChange={v => setField("spokenLanguages", v)} options={SPOKEN_LANGUAGE_OPTIONS} />
                <EditableInfoItem label="Originating State in India"               value={profile.originatingStateIndia} isEditing={effectiveEditing} onChange={v => setField("originatingStateIndia", v)} options={INDIA_STATE_OPTIONS} />
                <EditableInfoItem label="Additional Notes / Comments"              value={profile.additionalNotes}      isEditing={effectiveEditing} onChange={v => setField("additionalNotes", v)} textarea />
              </InfoSection>
            </div>
          )}

          {/* ── Roles & Responsibility Tab ── */}
          {activeTab === 'roles' && (() => {
            const currentResponsibilities = [
              { level: 'Shakha', responsibility: 'Ghatnayak', type: 'Seva', from: '2022-04-01', to: null },
              { level: 'Shakha', responsibility: 'Shakha Mukhya Shikshak', type: 'Seva', from: '2021-06-01', to: null },
            ];
            const previousResponsibilities = [
              { level: 'Shakha', responsibility: 'Shikshak', type: 'Seva', from: '2019-06-15', to: '2021-05-31' },
              { level: 'Nagar', responsibility: 'Karyavah', type: 'Administrative', from: '2018-01-01', to: '2019-06-14' },
            ];
            const currentRoles = [
              { role: 'Member', from: '2019-06-15', to: null },
            ];
            const previousRoles: { role: string; from: string; to: string }[] = [];
            const fmtD = (d: string | null) => d ? sharedFormatDate(d) : 'Present';
            const TH = 'px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900';
            const TD = 'px-4 py-3 text-sm text-neutral-900 dark:text-white';
            const TDE = 'px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400';
            return (
              <div className="space-y-5">
                {/* Current Sangh Responsibility */}
                {!isPostRegistration && <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current Sangh Responsibilities</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '21%' }} />
                        <col style={{ width: '31%' }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                          <th className={TH}>Responsibility Level</th>
                          <th className={TH}>Responsibility</th>
                          <th className={TH}>Responsibility Type</th>
                          <th className={TH}>From – To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {currentResponsibilities.length > 0 ? currentResponsibilities.map((r, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                            <td className={TD}>{r.level}</td>
                            <td className={TD}>{r.responsibility}</td>
                            <td className={TDE}>{r.type}</td>
                            <td className={TDE}>{fmtD(r.from)} – {fmtD(r.to)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">No current responsibilities</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>}

                {/* Previous Sangh Responsibility */}
                {!isPostRegistration && <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Previous Sangh Responsibilities</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '21%' }} />
                        <col style={{ width: '31%' }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                          <th className={TH}>Responsibility Level</th>
                          <th className={TH}>Responsibility</th>
                          <th className={TH}>Responsibility Type</th>
                          <th className={TH}>From – To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {previousResponsibilities.length > 0 ? previousResponsibilities.map((r, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                            <td className={TD}>{r.level}</td>
                            <td className={TD}>{r.responsibility}</td>
                            <td className={TDE}>{r.type}</td>
                            <td className={TDE}>{fmtD(r.from)} – {fmtD(r.to)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">No previous responsibilities</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>}

                {/* Current & Previous MyHSS Roles — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Current MyHSS Role */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current MyHSS Roles</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col style={{ width: '50%' }} />
                          <col style={{ width: '50%' }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <th className={TH}>MyHSS Role</th>
                            <th className={TH}>From – To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {currentRoles.length > 0 ? currentRoles.map((r, i) => (
                            <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                              <td className={TD}>{r.role}</td>
                              <td className={TDE}>{fmtD(r.from)} – {fmtD(r.to)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-neutral-400">No current roles</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Previous MyHSS Roles */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Previous MyHSS Roles</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col style={{ width: '50%' }} />
                          <col style={{ width: '50%' }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <th className={TH}>MyHSS Role</th>
                            <th className={TH}>From – To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {previousRoles.length > 0 ? previousRoles.map((r, i) => (
                            <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                              <td className={TD}>{r.role}</td>
                              <td className={TDE}>{fmtD(r.from)} – {fmtD(r.to)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-neutral-400">No previous roles</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Other Profiles Tab ── */}
          {activeTab === 'otherProfiles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {childAccounts.map(child => {
                const summary = getChildProfileSummary(child.id);
                const displayName = summary.firstName
                  ? `${summary.firstName} ${summary.surname ?? ''}`.trim()
                  : `${child.firstName} ${child.surname}`;
                const status = getChildStatus(child.id);
                const ageLabel = summary.dateOfBirth ? getAgeGroupLabel(summary.dateOfBirth) : null;
                const handleUpgradeToTeen = () => {
                  const age = summary.dateOfBirth ? getAge(summary.dateOfBirth) : null;
                  if (age === null) {
                    toast.error(`${displayName}'s date of birth is required before upgrading to a Teen Account.`);
                    return;
                  }
                  if (age < 13) {
                    toast.error(`${displayName} cannot be upgraded to a Teen Account until they turn 13.`);
                    return;
                  }
                  setUpgradeChildId(child.id);
                };
                return (
                  <div
                    key={child.id}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col overflow-hidden"
                    style={{ borderTop: '3px solid #172E4D' }}
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <p className="text-[15px] font-semibold text-neutral-900 dark:text-white truncate">{displayName}</p>
                        <span className={`text-xs font-medium ${status === 'approved' ? 'text-success-700 dark:text-success-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          ID: {child.id}
                        </span>
                        {status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 border border-success-200 dark:border-success-800 tracking-wide">
                            APPROVED
                          </span>
                        ) : status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 tracking-wide">
                            PENDING APPROVAL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 tracking-wide">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {ageLabel && (
                          <p className="flex items-center gap-1.5">
                            <UserCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#172E4D' }} />
                            {ageLabel}
                          </p>
                        )}
                        {summary.activityCentre && (
                          <p className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#172E4D' }} />
                            {summary.activityCentre}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center gap-2">
                      <SecondaryButton onClick={() => onSelectOtherProfile?.(child.id)}>
                        View Profile
                      </SecondaryButton>
                      {status === 'approved' && (
                        <button
                          type="button"
                          onClick={handleUpgradeToTeen}
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

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div className="space-y-6">

              {/* Registration & Approval summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Registration Date</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {formatDate(registrationDate)}
                    <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 ml-1.5">
                      {new Date(registrationDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md bg-[#f1fced] dark:bg-[#4EAE33]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4EAE33]" />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Approved Date</span>
                  </div>
                  {approvedDate ? (
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {formatDate(approvedDate)}
                      <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 ml-1.5">
                        {new Date(approvedDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">Pending</p>
                  )}
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                      <UserCog className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Approved By</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{approvedBy}</p>
                </div>
              </div>

              {/* Change History table */}
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
                  <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                  <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white mr-2">Change History</h4>
                  <div className="flex-1 min-w-[180px] max-w-xs">
                    <SearchBar
                      value={historySearch}
                      onChange={v => { setHistorySearch(v); setHistoryPage(1); }}
                      placeholder="Search history..."
                    />
                  </div>
                  <div className="relative" ref={historyDateRef}>
                    <button
                      onClick={() => setShowHistoryDateFilter(p => !p)}
                      className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        historyDateStart
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      {historyDateStart ? (historyDateLabel || formatDateRange(historyDateStart, historyDateEnd)) : 'Date range'}
                      {historyDateStart && (
                        <span role="button" onClick={e => { e.stopPropagation(); setHistoryDateStart(''); setHistoryDateEnd(''); setHistoryDateLabel(''); }} className="ml-0.5 text-primary-400 hover:text-primary-700">
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                    <DateRangeFilter
                      isOpen={showHistoryDateFilter}
                      onClose={() => setShowHistoryDateFilter(false)}
                      startDate={historyDateStart}
                      endDate={historyDateEnd}
                      onApply={(start, end, label) => { setHistoryDateStart(start); setHistoryDateEnd(end); setHistoryDateLabel(label || ''); setHistoryPage(1); }}
                      title="Filter by Date"
                    />
                  </div>
                  <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                    {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800">
                        {([
                          { key: 'timestamp', label: 'Date / Time'  },
                          { key: 'user',      label: 'Changed By'   },
                          { key: 'role',      label: 'Role'         },
                          { key: 'field',     label: 'Field'        },
                          { key: 'oldValue',  label: 'Old Value'    },
                          { key: 'newValue',  label: 'New Value'    },
                        ] as { key: typeof historySortCol; label: string }[]).map(col => {
                          const active = historySortCol === col.key;
                          const Icon = active ? (historySortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                          return (
                            <th
                              key={col.key}
                              className="px-4 py-2.5 text-left text-[14px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900 cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              onClick={() => {
                                if (historySortCol === col.key) setHistorySortDir(d => d === 'asc' ? 'desc' : 'asc');
                                else { setHistorySortCol(col.key); setHistorySortDir('asc'); }
                              }}
                            >
                              <span className="inline-flex items-center gap-1">
                                {col.label}
                                <Icon className={`w-3 h-3 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}`} />
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {filteredHistory.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">No records match your search</td></tr>
                      ) : filteredHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize).map(row => {
                        const d = new Date(row.timestamp);
                        return (
                          <tr key={row.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-[14px] text-neutral-900 dark:text-white whitespace-nowrap">
                                {sharedFormatDate(d)}
                                {' · '}
                                {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[14px] text-neutral-900 dark:text-white">{row.user}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-[14px] text-neutral-900 dark:text-white">{row.role}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-[14px] text-neutral-900 dark:text-white">{row.field}</td>
                            <td className="px-4 py-3 text-[14px] text-neutral-900 dark:text-white">{row.oldValue}</td>
                            <td className="px-4 py-3 text-[14px] text-neutral-900 dark:text-white">{row.newValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={historyPage}
                  totalPages={Math.ceil(filteredHistory.length / historyPageSize)}
                  totalItems={filteredHistory.length}
                  itemsPerPage={historyPageSize}
                  onPageChange={setHistoryPage}
                  onItemsPerPageChange={size => { setHistoryPageSize(size); setHistoryPage(1); }}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom action bar (mirrors the top action buttons) ── */}
      {!isUnderReview && isPostRegistration && (
        <div className="mt-6 flex items-center justify-end gap-2 flex-wrap">
          {onBack && <SecondaryButton icon={ArrowLeft} onClick={onBack}>{backLabel}</SecondaryButton>}
          {postRegEditing ? (
            <>
              <SecondaryButton icon={Save} onClick={() => { handleSave(); setPostRegEditing(false); }}>Save as Draft</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { if (!validateComplianceForSubmit()) return; handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton icon={Edit} onClick={() => setPostRegEditing(true)}>Edit Profile</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { if (!validateComplianceForSubmit()) return; handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          )}
        </div>
      )}

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

export default function MyProfile({ selectedRole = "Super Admin", isPostRegistration = false, isUnderReview = false, onSubmitForApproval, activeChildId = null, onChildAdded, childAccounts, onSelectOtherProfile, onBack, backLabel, carriedOverDetails }: { selectedRole?: string; isPostRegistration?: boolean; isUnderReview?: boolean; onSubmitForApproval?: () => void; activeChildId?: string | null; onChildAdded?: (child: { id: string; firstName: string; surname: string }) => void; childAccounts?: { id: string; firstName: string; surname: string }[]; onSelectOtherProfile?: (childId: string) => void; onBack?: () => void; backLabel?: string; carriedOverDetails?: CarriedOverMemberDetails }) {
  return <MemberProfileView selectedRole={selectedRole} isPostRegistration={isPostRegistration} isUnderReview={isUnderReview} onSubmitForApproval={onSubmitForApproval} activeChildId={activeChildId} onChildAdded={onChildAdded} childAccounts={childAccounts} onSelectOtherProfile={onSelectOtherProfile} onBack={onBack} backLabel={backLabel} carriedOverDetails={carriedOverDetails} />;
}
