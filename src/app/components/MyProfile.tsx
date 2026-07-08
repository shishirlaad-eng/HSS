import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Edit, Save, X, Trash2, AlertTriangle, Paperclip, Upload, History, ClipboardList, UserCog, UserCircle2, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, CalendarDays, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { SecondaryButton, PrimaryButton, Pagination, SearchBar, DateRangeFilter } from "./hb/listing";
import { FormInput, FormSelect, FormTextarea, PhoneInput } from "./hb/common/Form";
import { FIRST_AID_QUALIFICATION_OPTIONS, getAge, getAgeGroupLabel, MASTERS_CASCADE } from "../../mockAPI/membersData";
import { getRoleScope } from "../../mockAPI/roleScope";
import {
  createTransferRequest,
  getMemberCentreOverrides,
  getPendingTransferForMember,
  getTransferRequests,
  ShakhaTransferRequest,
  TRANSFER_CHANGE_EVENT,
} from "../../mockAPI/shakhaTransferData";

const MEMBER_PROFILE_STORAGE_KEY = "myMemberProfile";
const SHARED_PROFILE_KEY = "hss_shared_profile";

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
  textarea = false,
  required = false,
  phone = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  options?: string[];
  textarea?: boolean;
  required?: boolean;
  phone?: boolean;
}) {
  if (!isEditing) {
    return <InfoItem label={label} required={required}>{valueOrDash(value)}</InfoItem>;
  }
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
        {label}{required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <FormSelect value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </FormSelect>
      ) : textarea ? (
        <FormTextarea value={value} onChange={e => onChange(e.target.value)} />
      ) : phone ? (
        <PhoneInput value={value} onChange={onChange} />
      ) : (
        <FormInput type={type} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ── Dietary requirements multi-select dropdown ───────────────

function DietaryMultiSelect({
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

type ProfileTab = 'personal' | 'organisation' | 'compliance' | 'sangh' | 'history' | 'guardian' | 'other' | 'roles';

function MemberProfileView({ selectedRole, isPostRegistration = false, isUnderReview = false, onSubmitForApproval }: { selectedRole: string; isPostRegistration?: boolean; isUnderReview?: boolean; onSubmitForApproval?: () => void }) {
  const loadProfile = () => {
    const defaultProfile = getDefaultMemberProfile(selectedRole);
    const scope = getRoleScope(selectedRole);
    const approvedLocation = getMemberCentreOverrides()[scope.selfMemberId || selectedRole] || {
      country: scope.country || defaultProfile.country,
      region: scope.region || defaultProfile.region,
      town: scope.town || defaultProfile.town,
      activityCentre: scope.centre || defaultProfile.activityCentre,
    };
    const shared = loadSharedProfile();
    if (typeof window === "undefined") return { ...defaultProfile, ...shared, ...approvedLocation };
    const saved = localStorage.getItem(`${MEMBER_PROFILE_STORAGE_KEY}:${selectedRole}`);
    if (!saved) return { ...defaultProfile, ...shared, ...approvedLocation };
    try {
      return { ...defaultProfile, ...JSON.parse(saved), ...shared, ...approvedLocation };
    } catch {
      return { ...defaultProfile, ...shared, ...approvedLocation };
    }
  };

  const [profile, setProfile] = useState<MemberProfileForm>(loadProfile);
  const [savedProfile, setSavedProfile] = useState<MemberProfileForm>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [postRegEditing, setPostRegEditing] = useState(isPostRegistration);
  const effectiveEditing = !isUnderReview && (isEditing || postRegEditing);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const memberId = getRoleScope(selectedRole).selfMemberId || selectedRole;
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
    setPendingTransfer(getPendingTransferForMember(memberId));
    setTransferHistory(getTransferRequests().filter(request => request.memberId === memberId));
  }, [selectedRole, memberId]);

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
  const dobAge = getAge(profile.dateOfBirth);
  const isTeenByDob = dobAge >= 13 && dobAge <= 17;
  const showGuardian = isTeenRole || isTeenByDob;

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
  };

  const handleSave = () => {
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
    localStorage.setItem(`${MEMBER_PROFILE_STORAGE_KEY}:${selectedRole}`, JSON.stringify(next));
    saveSharedProfile(next as unknown as Record<string, string>);
    setProfile(next);
    setSavedProfile(next);
    setIsEditing(false);
    toast.success(organisationChanged
      ? "Profile updated and Shakha transfer submitted for approval."
      : "Profile updated successfully.");
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem(`${MEMBER_PROFILE_STORAGE_KEY}:${selectedRole}`);
    setShowDeleteModal(false);
    toast.success("Your account deletion request has been submitted. An administrator will process it shortly.");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'personal',     label: 'Personal Info'       },
    ...(showGuardian ? [{ id: 'guardian' as ProfileTab, label: 'Parent / Guardian' }] : []),
    { id: 'organisation', label: 'Organisation'        },
    { id: 'compliance',   label: 'Compliance Details'  },
    ...(!isPostRegistration ? [
      { id: 'roles' as ProfileTab, label: 'Responsibilities and Role' },
      { id: 'other' as ProfileTab, label: 'Other Information'      },
      { id: 'history' as ProfileTab, label: 'History'              },
    ] : []),
  ];

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

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
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {isUnderReview ? null : isPostRegistration && postRegEditing ? (
            <>
              <SecondaryButton icon={Save} onClick={() => { handleSave(); setPostRegEditing(false); }}>Save as Draft</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : isPostRegistration && !postRegEditing ? (
            <>
              <SecondaryButton icon={Edit} onClick={() => setPostRegEditing(true)}>Edit Profile</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : isEditing ? (
            <>
              <SecondaryButton icon={X} onClick={handleCancel}>Cancel</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave}>Save Changes</PrimaryButton>
            </>
          ) : (
            <PrimaryButton icon={Edit} onClick={() => setIsEditing(true)}>Edit Profile</PrimaryButton>
          )}
        </div>
      </div>

      {/* ── Banners ───────────────────────────────────────────── */}
      {isUnderReview && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
          <p className="text-sm text-blue-800 dark:text-blue-300">Your profile is under review. You will be able to access the application once an admin approves your profile.</p>
        </div>
      )}
      {isPostRegistration && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
          <p className="text-sm text-amber-800 dark:text-amber-300">Submit all the details and share it for the admin approval. After approval, you will be able to access the application.</p>
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
                <EditableInfoItem label="First Name" required    value={profile.firstName}   isEditing={effectiveEditing} onChange={v => setField("firstName", v)} />
                {!isPostRegistration && <InfoItem label="Membership ID">{valueOrDash(profile.membershipId)}</InfoItem>}
                <EditableInfoItem label="Middle Name"   value={profile.middleName}  isEditing={effectiveEditing} onChange={v => setField("middleName", v)} />
                <EditableInfoItem label="Gender" required        value={profile.gender}      isEditing={effectiveEditing} onChange={v => setField("gender", v)} options={["Male", "Female"]} />
                <EditableInfoItem label="Surname" required       value={profile.surname}     isEditing={effectiveEditing} onChange={v => setField("surname", v)} />
                {effectiveEditing ? (
                  <EditableInfoItem label="Date of Birth" required value={profile.dateOfBirth} isEditing onChange={v => setField("dateOfBirth", v)} type="date" />
                ) : (
                  <InfoItem label="Date of Birth" required>
                    {formatDate(profile.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {getAge(profile.dateOfBirth)})</span>
                  </InfoItem>
                )}
              </InfoSection>

              <InfoSection title="Contact Details">
                <EditableInfoItem label="Contact Number" required  value={profile.phone}           isEditing={effectiveEditing} onChange={v => setField("phone", v)}  phone />
                <EditableInfoItem label="Email Address" required   value={profile.email}           isEditing={effectiveEditing} onChange={v => setField("email", v)}  type="email" />
                <EditableInfoItem label="Building Name"   value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
                <EditableInfoItem label="Town / City" required     value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} />
                <EditableInfoItem label="Address Line 1" required  value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} />
                <EditableInfoItem label="Post Code" required       value={profile.postCode}        isEditing={effectiveEditing} onChange={v => setField("postCode", v)} />
                <EditableInfoItem label="Address Line 2"  value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
              </InfoSection>

              {isPostRegistration && showGuardian && (
                <div className="xl:col-span-2">
                  <InfoSection title="Parents / Guardian Details" cols={4}>
                    <EditableInfoItem label="Parent / Guardian Name" required         value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} />
                    <EditableInfoItem label="Parent / Guardian Phone Number" required value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} phone />
                    <EditableInfoItem label="Parent / Guardian Email" required        value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" />
                    <EditableInfoItem label="Parent / Guardian Relationship" required value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} options={["Parent", "Guardian"]} />
                  </InfoSection>
                </div>
              )}

              <InfoSection title="Emergency Contact Details">
                <EditableInfoItem label="Contact Name" required         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Contact Phone Number" required value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} phone />
                <EditableInfoItem label="Contact Email" required        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                    Contact Relationship<span className="text-error-500 ml-0.5">*</span>
                  </label>
                  {effectiveEditing ? (
                    <div className="space-y-2">
                      <FormSelect
                        value={RELATIONSHIP_OPTIONS.includes(profile.emergencyContactRelationship) ? profile.emergencyContactRelationship : 'Other'}
                        onChange={e => setField("emergencyContactRelationship", e.target.value === 'Other' ? '' : e.target.value)}
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
                        />
                      )}
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
                <InfoSection title="First Aid" cols={4}>
                  <EditableInfoItem label="Are you a first aider for HSS?" required value={profile.isFirstAider}                   isEditing={effectiveEditing} onChange={v => setField("isFirstAider", v)}                   options={["No", "Yes"]} />
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
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateDate ? new Date(profile.dbsCertificateDate).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—"}</p>
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
                />
                <EditableInfoItem
                  label="Nagar" required
                  value={profile.town}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('town', value)}
                  options={profile.region ? (MASTERS_CASCADE.towns[profile.region] ?? []) : []}
                />
                <EditableInfoItem
                  label="Shakha" required
                  value={profile.activityCentre}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('activityCentre', value)}
                  options={profile.town ? (MASTERS_CASCADE.centres[profile.town] ?? []) : []}
                />
                {!isPostRegistration && <InfoItem label="Age Category">{getAgeGroupLabel(profile.dateOfBirth)}</InfoItem>}
              </InfoSection>

            </>
          )}

          {/* ── Parent / Guardian Tab ── */}
          {!isPostRegistration && activeTab === 'guardian' && showGuardian && (
            <InfoSection title="Approval Details" cols={4}>
              <EditableInfoItem label="Parent / Guardian Name" required         value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} />
              <EditableInfoItem label="Parent / Guardian Phone Number" required value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} phone />
              <EditableInfoItem label="Parent / Guardian Email" required        value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" />
              <EditableInfoItem label="Parent / Guardian Relationship" required value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} options={["Parent", "Guardian"]} />
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
            const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Present';
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
                    <table className="w-full">
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
                    <table className="w-full">
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
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current MyHSS Role(s)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
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
                      <table className="w-full">
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
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formatDate(registrationDate)}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {new Date(registrationDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
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
                    <>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formatDate(approvedDate)}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {new Date(approvedDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
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
                      {historyDateStart ? (historyDateLabel || `${historyDateStart} - ${historyDateEnd}`) : 'Date range'}
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
                              className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900 cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                              <p className="text-xs font-medium text-neutral-900 dark:text-white">
                                {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                                {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-neutral-900 dark:text-white">{row.user}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">{row.role}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-neutral-900 dark:text-white">{row.field}</td>
                            <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">{row.oldValue}</td>
                            <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white">{row.newValue}</td>
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

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

export default function MyProfile({ selectedRole = "Super Admin", isPostRegistration = false, isUnderReview = false, onSubmitForApproval }: { selectedRole?: string; isPostRegistration?: boolean; isUnderReview?: boolean; onSubmitForApproval?: () => void }) {
  return <MemberProfileView selectedRole={selectedRole} isPostRegistration={isPostRegistration} isUnderReview={isUnderReview} onSubmitForApproval={onSubmitForApproval} />;
}
