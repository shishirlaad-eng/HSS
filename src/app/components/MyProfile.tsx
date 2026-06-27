import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Edit, Save, X, Trash2, AlertTriangle, Paperclip, Upload, History, ClipboardList, UserCog, UserCircle2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SecondaryButton, PrimaryButton, Pagination } from "./hb/listing";
import { FormInput, FormSelect, FormTextarea } from "./hb/common/Form";
import { DIETARY_REQUIREMENTS, FIRST_AID_QUALIFICATION_OPTIONS, getAge, getAgeGroupLabel, MASTERS_CASCADE } from "../../mockAPI/membersData";
import { getRoleScope } from "../../mockAPI/roleScope";
import {
  createTransferRequest,
  getMemberCentreOverrides,
  getPendingTransferForMember,
  getTransferRequests,
  ShakhaTransferRequest,
  TRANSFER_CHANGE_EVENT,
} from "../../mockAPI/shakhaTransferData";

const PROFILE_STORAGE_KEY = "myProfile";
const MEMBER_PROFILE_STORAGE_KEY = "myMemberProfile";
const SHARED_PROFILE_KEY = "hss_shared_profile";

// Fields that are personal to the user and must stay consistent across all roles
const SHARED_FIELDS = [
  'firstName', 'middleName', 'surname', 'gender', 'dateOfBirth',
  'email', 'phone',
  'buildingName', 'addressLine1', 'addressLine2', 'contactTownCity', 'postCode',
  'emergencyContactName', 'emergencyContactPhone', 'emergencyContactEmail', 'emergencyContactRelationship',
  'occupation', 'spokenLanguages', 'originatingStateIndia', 'additionalNotes',
  'dietaryRequirements', 'epiPen', 'allergies', 'medicalInfoDeclared', 'medicalInfoDetails',
] as const;

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

const MOCK_PREVIOUS_RESPONSIBILITIES = [
  { level: "Shakha / Activity centre", responsibility: "Karyawaha", type: "Seva", from: "2019-04-01", to: "2021-03-31" },
  { level: "Nagar / Town",             responsibility: "Shikshak",  type: "Toli", from: "2021-04-01", to: "2023-03-31" },
];

interface ProfileForm {
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  buildingName: string;
  addressLine1: string;
  addressLine2: string;
  contactTownCity: string;
  postCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactRelationship: string;
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
  isFirstAider: string;
  firstAidQualificationLevel: string;
  firstAidQualificationExpiryDate: string;
  dietaryRequirements: string;
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

const DEFAULT_PROFILE: ProfileForm = {
  firstName: "John",
  middleName: "",
  surname: "Doe",
  gender: "Male",
  dateOfBirth: "1980-06-15",
  email: "john.doe@hss.org.uk",
  phone: "+44 7700 900123",
  buildingName: "",
  addressLine1: "42 Admin Lane",
  addressLine2: "",
  contactTownCity: "London",
  postCode: "EC1A 1BB",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactEmail: "",
  emergencyContactRelationship: "",
};

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
  isFirstAider: "Yes",
  firstAidQualificationLevel: "1-day First Aid qualification",
  firstAidQualificationExpiryDate: "2026-09-15",
  dietaryRequirements: "Vegan",
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
      isFirstAider: "No",
      firstAidQualificationLevel: "",
      firstAidQualificationExpiryDate: "",
      dietaryRequirements: "",
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

function InfoSection({ title, children, cols = 2 }: { title: string; children: ReactNode; cols?: 2 | 4 }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
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

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">{label}</label>
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
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  options?: string[];
  textarea?: boolean;
}) {
  if (!isEditing) {
    return <InfoItem label={label}>{valueOrDash(value)}</InfoItem>;
  }
  return (
    <div>
      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">{label}</label>
      {options ? (
        <FormSelect value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </FormSelect>
      ) : textarea ? (
        <FormTextarea value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <FormInput type={type} value={value} onChange={e => onChange(e.target.value)} />
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
  const effectiveEditing = !isUnderReview && (isEditing || isPostRegistration);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(20);
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
  const showGuardian = isTeenRole || selectedRole === 'Adult Member';

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
    { id: 'roles',        label: 'Roles & Responsibility' },
    { id: 'other',        label: 'Other Information'   },
    { id: 'history',      label: 'History'             },
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
  const approvedBy    = approvalEntry ? `${approvalEntry.user} (Admin)` : '—';
  const registrationDate = '2021-01-20T10:00:00Z';

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
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs bg-[#f1fced] border-[#b8efa0]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4EAE33]" />
                  <span className="text-[#3d8928]">Active &amp; Approved</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {isUnderReview ? null : isPostRegistration ? (
            <>
              <SecondaryButton icon={Save} onClick={handleSave}>Save as Draft</SecondaryButton>
              <PrimaryButton icon={Save} onClick={() => { handleSave(); onSubmitForApproval?.(); }}>Submit for Approval</PrimaryButton>
            </>
          ) : isEditing ? (
            <>
              <SecondaryButton icon={X} onClick={handleCancel}>Cancel</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave}>Save Changes</PrimaryButton>
            </>
          ) : (
            <>
              <PrimaryButton icon={Edit} onClick={() => setIsEditing(true)}>Edit Profile</PrimaryButton>
            </>
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

        {/* Tab content */}
        <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InfoSection title="Personal Details">
                <EditableInfoItem label="First Name"    value={profile.firstName}   isEditing={effectiveEditing} onChange={v => setField("firstName", v)} />
                <InfoItem label="Membership ID">{valueOrDash(profile.membershipId)}</InfoItem>
                <EditableInfoItem label="Middle Name"   value={profile.middleName}  isEditing={effectiveEditing} onChange={v => setField("middleName", v)} />
                <EditableInfoItem label="Gender"        value={profile.gender}      isEditing={effectiveEditing} onChange={v => setField("gender", v)} options={["Male", "Female"]} />
                <EditableInfoItem label="Surname"       value={profile.surname}     isEditing={effectiveEditing} onChange={v => setField("surname", v)} />
                {effectiveEditing ? (
                  <EditableInfoItem label="Date of Birth" value={profile.dateOfBirth} isEditing onChange={v => setField("dateOfBirth", v)} type="date" />
                ) : (
                  <InfoItem label="Date of Birth">
                    {formatDate(profile.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {getAge(profile.dateOfBirth)})</span>
                  </InfoItem>
                )}
              </InfoSection>

              <InfoSection title="Contact Details">
                <EditableInfoItem label="Contact Number"  value={profile.phone}           isEditing={effectiveEditing} onChange={v => setField("phone", v)}  type="tel" />
                <EditableInfoItem label="Email Address"   value={profile.email}           isEditing={effectiveEditing} onChange={v => setField("email", v)}  type="email" />
                <EditableInfoItem label="Building Name"   value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
                <EditableInfoItem label="Town / City"     value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} />
                <EditableInfoItem label="Address Line 1"  value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} />
                <EditableInfoItem label="Post Code"       value={profile.postCode}        isEditing={effectiveEditing} onChange={v => setField("postCode", v)} />
                <EditableInfoItem label="Address Line 2"  value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
              </InfoSection>

              <InfoSection title="Emergency Contact Details">
                <EditableInfoItem label="Contact Name"         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Contact Phone Number" value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} type="tel" />
                <EditableInfoItem label="Contact Email"        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <EditableInfoItem label="Contact Relationship" value={profile.emergencyContactRelationship} isEditing={effectiveEditing} onChange={v => setField("emergencyContactRelationship", v)} />
              </InfoSection>

              <InfoSection title="Medical Details">
                <EditableInfoItem label="Do you have any medical condition?" value={profile.medicalInfoDeclared} isEditing={effectiveEditing} onChange={v => setField("medicalInfoDeclared", v)} options={["No", "Yes"]} />
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Special Dietary Requirements</label>
                  {effectiveEditing ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {DIETARY_REQUIREMENTS.map(item => (
                        <label key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary-600"
                            checked={profile.dietaryRequirements ? profile.dietaryRequirements.split(',').map(s => s.trim()).filter(Boolean).includes(item) : false}
                            onChange={() => {
                              const current = profile.dietaryRequirements
                                ? profile.dietaryRequirements.split(',').map(s => s.trim()).filter(Boolean)
                                : [];
                              const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
                              setField("dietaryRequirements", updated.join(', '));
                            }}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dietaryRequirements || '—'}</p>
                  )}
                </div>
                <EditableInfoItem label="Do you carry an EpiPen/Jext/Emerade?" value={profile.epiPen}    isEditing={effectiveEditing} onChange={v => setField("epiPen", v)}    options={["No", "Yes"]} />
                <EditableInfoItem label="Any Allergies"           value={profile.allergies} isEditing={effectiveEditing} onChange={v => setField("allergies", v)} />
              </InfoSection>

            </div>
          )}

          {/* ── Contact ── */}
          {false && activeTab === 'contact' && (
            <InfoSection title="Contact Information">
              <EditableInfoItem label="Primary Email Address"    value={profile.email}           isEditing={effectiveEditing} onChange={v => setField("email", v)}           type="email" />
              <EditableInfoItem label="Secondary Email Address"  value={profile.secondaryEmail}  isEditing={effectiveEditing} onChange={v => setField("secondaryEmail", v)}  type="email" />
              <EditableInfoItem label="Primary Contact Number"   value={profile.phone}           isEditing={effectiveEditing} onChange={v => setField("phone", v)}           type="tel" />
              <EditableInfoItem label="Secondary Contact Number" value={profile.secondaryPhone}  isEditing={effectiveEditing} onChange={v => setField("secondaryPhone", v)}  type="tel" />
              <EditableInfoItem label="Building Name"            value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
              <EditableInfoItem label="Address Line 1"           value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} />
              <EditableInfoItem label="Address Line 2"           value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
              <EditableInfoItem label="Town / City"              value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} />
              <EditableInfoItem label="Post Code"                value={profile.postCode}        isEditing={effectiveEditing} onChange={v => setField("postCode", v)} />
            </InfoSection>
          )}

          {/* ── Emergency & Guardian ── */}
          {false && activeTab === 'emergency' && (
            <>
              <InfoSection title="Emergency Contact">
                <EditableInfoItem label="Name"         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Phone"        value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} type="tel" />
                <EditableInfoItem label="Email"        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <EditableInfoItem label="Relationship" value={profile.emergencyContactRelationship} isEditing={effectiveEditing} onChange={v => setField("emergencyContactRelationship", v)} />
              </InfoSection>

              {showGuardian && (
                <InfoSection title="Parent / Guardian Approval Information">
                  <EditableInfoItem label="Parent / Guardian Name" value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} />
                  <EditableInfoItem label="Phone"                  value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} type="tel" />
                  <EditableInfoItem label="Email"                  value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" />
                  <EditableInfoItem label="Relationship"           value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} />
                </InfoSection>
              )}
            </>
          )}

          {/* ── Compliance Details ── */}
          {activeTab === 'compliance' && (
            <>
              {/* First Aid + Safeguarding — side by side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <InfoSection title="First Aid">
                  <EditableInfoItem label="Are you a first aider for HSS?" value={profile.isFirstAider}                   isEditing={effectiveEditing} onChange={v => setField("isFirstAider", v)}                   options={["No", "Yes"]} />
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
                  <EditableInfoItem label="First Aid Status" value={profile.firstAidStatus} isEditing={effectiveEditing} onChange={v => setField("firstAidStatus", v)} options={["Pending", "Completed"]} />
                </InfoSection>

                <InfoSection title="Safeguarding">
                  <EditableInfoItem label="Level of Training"  value={profile.safeguardingRef}    isEditing={effectiveEditing} onChange={v => setField("safeguardingRef", v)} />
                  <EditableInfoItem label="Date Completed"     value={profile.safeguardingExpiry} isEditing={effectiveEditing} onChange={v => setField("safeguardingExpiry", v)} type="date" />
                  <EditableInfoItem label="Safeguarding Status" value={profile.safeguardingStatus} isEditing={effectiveEditing} onChange={v => setField("safeguardingStatus", v)} options={["Pending", "Completed"]} />
                </InfoSection>
              </div>

              {/* Disclosure Barring Service — full width, 4-col rows */}
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Disclosure Barring Service</h4>
                </div>
                <div className="px-4 py-4 space-y-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Status</p>
                      {effectiveEditing
                        ? <select value={profile.dbsStatus} onChange={e => setField("dbsStatus", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                            {["Pending","Completed"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsStatus || "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Number</p>
                      {effectiveEditing
                        ? <input type="text" value={profile.dbsCertificateNumber} onChange={e => setField("dbsCertificateNumber", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" />
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateNumber || "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Date</p>
                      {effectiveEditing
                        ? <input type="date" value={profile.dbsCertificateDate} onChange={e => setField("dbsCertificateDate", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" />
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateDate ? new Date(profile.dbsCertificateDate).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert File</p>
                      {effectiveEditing ? (
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-primary-400 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-1 truncate">{profile.dbsCertificateFile || "Upload…"}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
                            onChange={e => { const f = e.target.files?.[0]; if (f) setField("dbsCertificateFile", f.name); }} />
                        </label>
                      ) : (
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {profile.dbsCertificateFile
                            ? <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400"><Paperclip className="w-3.5 h-3.5" />{profile.dbsCertificateFile}</span>
                            : "—"}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Update Service</p>
                      {effectiveEditing
                        ? <select value={profile.dbsUpdateService} onChange={e => setField("dbsUpdateService", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                            {["No","Yes"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsUpdateService || "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Update Service No.</p>
                      {effectiveEditing
                        ? <input type="text" value={profile.dbsUpdateServiceNumber} onChange={e => setField("dbsUpdateServiceNumber", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" />
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsUpdateServiceNumber || "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Application Under Process</p>
                      {effectiveEditing
                        ? <select value={profile.dbsAppUnderProcess} onChange={e => setField("dbsAppUnderProcess", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                            {["No","Yes"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsAppUnderProcess || "—"}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">DBS Cert Received From</p>
                      {effectiveEditing
                        ? <input type="text" value={profile.dbsCertificateReceivedFrom} onChange={e => setField("dbsCertificateReceivedFrom", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" />
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCertificateReceivedFrom || "—"}</p>}
                    </div>
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Verified By</p>
                      {effectiveEditing
                        ? <input type="text" value={profile.dbsCheckedBy} onChange={e => setField("dbsCheckedBy", e.target.value)} className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" />
                        : <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.dbsCheckedBy || "—"}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Sangh Responsibility ── */}
          {/* ── Organisation ── */}
          {activeTab === 'organisation' && (
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
                  label="Vibhaag"
                  value={profile.region}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('region', value)}
                  options={profile.country ? (MASTERS_CASCADE.regions[profile.country] ?? []) : []}
                />
                <EditableInfoItem
                  label="Nagar"
                  value={profile.town}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('town', value)}
                  options={profile.region ? (MASTERS_CASCADE.towns[profile.region] ?? []) : []}
                />
                <EditableInfoItem
                  label="Shakha"
                  value={profile.activityCentre}
                  isEditing={effectiveEditing}
                  onChange={value => setOrganisationField('activityCentre', value)}
                  options={profile.town ? (MASTERS_CASCADE.centres[profile.town] ?? []) : []}
                />
                <InfoItem label="Age Category">{getAgeGroupLabel(profile.dateOfBirth)}</InfoItem>
              </InfoSection>

            </>
          )}

          {/* ── Parent / Guardian Tab ── */}
          {activeTab === 'guardian' && (
            <InfoSection title="Approval Details" cols={4}>
              <EditableInfoItem label="Parent / Guardian Name"         value={profile.guardianName}         isEditing={effectiveEditing} onChange={v => setField("guardianName", v)} />
              <EditableInfoItem label="Parent / Guardian Phone Number" value={profile.guardianPhone}        isEditing={effectiveEditing} onChange={v => setField("guardianPhone", v)} type="tel" />
              <EditableInfoItem label="Parent / Guardian Email"        value={profile.guardianEmail}        isEditing={effectiveEditing} onChange={v => setField("guardianEmail", v)} type="email" />
              <EditableInfoItem label="Parent / Guardian Relationship" value={profile.guardianRelationship} isEditing={effectiveEditing} onChange={v => setField("guardianRelationship", v)} />
            </InfoSection>
          )}

          {/* ── Other Information Tab ── */}
          {activeTab === 'other' && (
            <div className="space-y-5">
              <InfoSection title="Other Information" cols={4}>
                <EditableInfoItem label="Occupation (Select Other if not listed)" value={profile.occupation}           isEditing={effectiveEditing} onChange={v => setField("occupation", v)} />
                <EditableInfoItem label="Spoken Language(s)"                       value={profile.spokenLanguages}      isEditing={effectiveEditing} onChange={v => setField("spokenLanguages", v)} />
                <EditableInfoItem label="Originating State in India"               value={profile.originatingStateIndia} isEditing={effectiveEditing} onChange={v => setField("originatingStateIndia", v)} />
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
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current Sangh Responsibility</h4>
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
                </div>

                {/* Previous Sangh Responsibility */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Previous Sangh Responsibility</h4>
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
                </div>

                {/* Current & Previous MyHSS Roles — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Current MyHSS Role */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Current MyHSS Role</h4>
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
              {(() => {
                const totalPages = Math.ceil(changeHistory.length / historyPageSize);
                const pageRows = changeHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
                return (
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Change History</h4>
                      <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                        {changeHistory.length} record{changeHistory.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                            {['Date', 'Time', 'User', 'Role', 'Field Changed', 'Old Value', 'New Value'].map(col => (
                              <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                          {pageRows.map(row => {
                            const d = new Date(row.timestamp);
                            const isAdmin = row.role === 'Admin';
                            return (
                              <tr key={row.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">
                                <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                  {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                  {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white whitespace-nowrap">{row.user}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                                    isAdmin
                                      ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400'
                                      : 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/30 dark:border-primary-800/40 dark:text-primary-400'
                                  }`}>
                                    {isAdmin ? <UserCog className="w-2.5 h-2.5" /> : <UserCircle2 className="w-2.5 h-2.5" />}
                                    {row.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">{row.field}</td>
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
                      totalPages={totalPages}
                      totalItems={changeHistory.length}
                      itemsPerPage={historyPageSize}
                      onPageChange={setHistoryPage}
                      onItemsPerPageChange={size => { setHistoryPageSize(size); setHistoryPage(1); }}
                    />
                  </div>
                );
              })()}
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

// ── Super Admin profile view ──────────────────────────────────

function SuperAdminProfileView() {
  const [profile, setProfile] = useState<ProfileForm>(() => {
    const shared = loadSharedProfile();
    if (typeof window === "undefined") return { ...DEFAULT_PROFILE, ...shared };
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return { ...DEFAULT_PROFILE, ...shared };
    try { return { ...DEFAULT_PROFILE, ...JSON.parse(saved), ...shared }; }
    catch { return { ...DEFAULT_PROFILE, ...shared }; }
  });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'account'>('personal');

  const fullName = [profile.firstName, profile.middleName, profile.surname]
    .map(p => p.trim()).filter(Boolean).join(" ");

  const setField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) =>
    setProfile(cur => ({ ...cur, [field]: value }));

  const handleSave = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    saveSharedProfile(profile as unknown as Record<string, string>);
    setSavedProfile(profile);
    setIsEditing(false);
    toast.success("Profile updated successfully.");
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const TABS = [
    { id: 'personal' as const, label: 'Personal Info' },
    { id: 'account'  as const, label: 'Account'       },
  ];

  return (
    <div className="px-6 py-6">

      {/* ── Profile header ───────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-[32px] font-semibold text-neutral-900 dark:text-white">{fullName || "—"}</h1>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#172E4D]/10 text-[#172E4D] dark:bg-white/10 dark:text-blue-200 border border-[#172E4D]/20 dark:border-white/20">
                Super Admin
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs bg-[#f1fced] border-[#b8efa0]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4EAE33]" />
                <span className="text-[#3d8928]">Active</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {effectiveEditing ? (
            <>
              <SecondaryButton icon={X} onClick={handleCancel}>Cancel</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave}>Save Changes</PrimaryButton>
            </>
          ) : (
            <PrimaryButton icon={Edit} onClick={() => setIsEditing(true)}>Edit Profile</PrimaryButton>
          )}
        </div>
      </div>

      {/* ── Tabbed content ───────────────────────────────────── */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">

        {/* Tab bar */}
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

        {/* Tab content */}
        <div className="p-6 bg-white dark:bg-neutral-950 space-y-5">

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InfoSection title="Personal Details">
                <EditableInfoItem label="First Name"    value={profile.firstName}  isEditing={effectiveEditing} onChange={v => setField("firstName", v)} />
                <EditableInfoItem label="Middle Name"   value={profile.middleName} isEditing={effectiveEditing} onChange={v => setField("middleName", v)} />
                <EditableInfoItem label="Surname"       value={profile.surname}    isEditing={effectiveEditing} onChange={v => setField("surname", v)} />
                <EditableInfoItem label="Gender"        value={profile.gender}     isEditing={effectiveEditing} onChange={v => setField("gender", v)} options={["Male", "Female"]} />
                {effectiveEditing ? (
                  <EditableInfoItem label="Date of Birth" value={profile.dateOfBirth} isEditing onChange={v => setField("dateOfBirth", v)} type="date" />
                ) : (
                  <InfoItem label="Date of Birth">
                    {formatDate(profile.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {getAge(profile.dateOfBirth)})</span>
                  </InfoItem>
                )}
              </InfoSection>

              <InfoSection title="Contact Details">
                <EditableInfoItem label="Email Address"  value={profile.email}           isEditing={effectiveEditing} onChange={v => setField("email", v)}           type="email" />
                <EditableInfoItem label="Mobile Number"  value={profile.phone}           isEditing={effectiveEditing} onChange={v => setField("phone", v)}            type="tel" />
                <EditableInfoItem label="Building Name"  value={profile.buildingName}    isEditing={effectiveEditing} onChange={v => setField("buildingName", v)} />
                <EditableInfoItem label="Town / City"    value={profile.contactTownCity} isEditing={effectiveEditing} onChange={v => setField("contactTownCity", v)} />
                <EditableInfoItem label="Address Line 1" value={profile.addressLine1}    isEditing={effectiveEditing} onChange={v => setField("addressLine1", v)} />
                <EditableInfoItem label="Post Code"      value={profile.postCode}        isEditing={effectiveEditing} onChange={v => setField("postCode", v)} />
                <EditableInfoItem label="Address Line 2" value={profile.addressLine2}    isEditing={effectiveEditing} onChange={v => setField("addressLine2", v)} />
              </InfoSection>

              <InfoSection title="Emergency Contact Details">
                <EditableInfoItem label="Contact Name"         value={profile.emergencyContactName}         isEditing={effectiveEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Contact Phone Number" value={profile.emergencyContactPhone}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactPhone", v)} type="tel" />
                <EditableInfoItem label="Contact Email"        value={profile.emergencyContactEmail}        isEditing={effectiveEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <EditableInfoItem label="Contact Relationship" value={profile.emergencyContactRelationship} isEditing={effectiveEditing} onChange={v => setField("emergencyContactRelationship", v)} />
              </InfoSection>
            </div>
          )}

          {/* ── Account ── */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InfoSection title="Account Details">
                <InfoItem label="Role">Super Admin</InfoItem>
                <InfoItem label="Access Level">Full System Access</InfoItem>
                <InfoItem label="Account Status">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4EAE33]" />
                    <span className="text-[#3d8928]">Active</span>
                  </span>
                </InfoItem>
                <InfoItem label="Login Email">{profile.email || "—"}</InfoItem>
              </InfoSection>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function MyProfile({ selectedRole = "Super Admin", isPostRegistration = false, isUnderReview = false, onSubmitForApproval }: { selectedRole?: string; isPostRegistration?: boolean; isUnderReview?: boolean; onSubmitForApproval?: () => void }) {
  return <MemberProfileView selectedRole={selectedRole} isPostRegistration={isPostRegistration} isUnderReview={isUnderReview} onSubmitForApproval={onSubmitForApproval} />;
}
