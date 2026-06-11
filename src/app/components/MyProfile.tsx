import { useEffect, useState, type ReactNode } from "react";
import { Edit, Save, X, Mail, Phone, RotateCcw, Trash2, AlertTriangle, Paperclip, Upload, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { SecondaryButton, PrimaryButton } from "./hb/listing";
import { FormInput, FormSelect, FormTextarea } from "./hb/common/Form";
import { getAge, getAgeGroupLabel, MASTERS_CASCADE } from "../../mockAPI/membersData";
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

interface ProfileForm {
  email: string;
  mobile: string;
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
  medicalInfoDeclared: string;
  medicalInfoDetails: string;
  isFirstAider: string;
  dietaryRequirements: string;
  originatingStateIndia: string;
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
  firstAidExpiry: string;
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
  email: "john.doe@company.com",
  mobile: "+44 7700 900123",
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
  medicalInfoDeclared: "No",
  medicalInfoDetails: "",
  isFirstAider: "Yes",
  dietaryRequirements: "Vegan",
  originatingStateIndia: "Gujarat",
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
  firstAidExpiry: "2026-09-15",
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
      medicalInfoDeclared: "No",
      medicalInfoDetails: "",
      isFirstAider: "No",
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
      firstAidExpiry: "",
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

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        {title}
      </h4>
      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Delete Account</h3>
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

type ProfileTab = 'personal' | 'contact' | 'emergency' | 'organisation' | 'compliance' | 'sangh';

function MemberProfileView({ selectedRole }: { selectedRole: string }) {
  const loadProfile = () => {
    const defaultProfile = getDefaultMemberProfile(selectedRole);
    const scope = getRoleScope(selectedRole);
    const approvedLocation = getMemberCentreOverrides()[scope.selfMemberId || selectedRole] || {
      country: scope.country || defaultProfile.country,
      region: scope.region || defaultProfile.region,
      town: scope.town || defaultProfile.town,
      activityCentre: scope.centre || defaultProfile.activityCentre,
    };
    if (typeof window === "undefined") return { ...defaultProfile, ...approvedLocation };
    const saved = localStorage.getItem(`${MEMBER_PROFILE_STORAGE_KEY}:${selectedRole}`);
    if (!saved) return { ...defaultProfile, ...approvedLocation };
    try {
      return { ...defaultProfile, ...JSON.parse(saved), ...approvedLocation };
    } catch {
      return { ...defaultProfile, ...approvedLocation };
    }
  };

  const [profile, setProfile] = useState<MemberProfileForm>(loadProfile);
  const [savedProfile, setSavedProfile] = useState<MemberProfileForm>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const memberId = getRoleScope(selectedRole).selfMemberId || selectedRole;
  const [requestedCentre, setRequestedCentre] = useState('');
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
  const showGuardian = isTeenRole || Boolean(profile.guardianName || profile.guardianEmail || profile.guardianPhone);

  const setField = (field: keyof MemberProfileForm, value: string) => {
    setProfile(cur => {
      const next = { ...cur, [field]: value };
      if (field === "firstName" || field === "middleName" || field === "surname") {
        next.fullName = [next.firstName, next.middleName, next.surname]
          .map(p => p.trim()).filter(Boolean).join(" ");
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

  const handleTransferRequest = () => {
    const destination = getLocationForCentre(requestedCentre);
    if (!destination || requestedCentre === profile.activityCentre) {
      toast.error("Please select a different Shakha.");
      return;
    }
    try {
      const request = createTransferRequest({
        memberId,
        memberName: fullName,
        memberRole: selectedRole,
        fromCountry: profile.country,
        fromRegion: profile.region,
        fromTown: profile.town,
        fromCentre: profile.activityCentre,
        toCountry: destination.country,
        toRegion: destination.region,
        toTown: destination.town,
        toCentre: destination.activityCentre,
      });
      setPendingTransfer(request);
      setTransferHistory(getTransferRequests().filter(item => item.memberId === memberId));
      setRequestedCentre('');
      toast.success(`Transfer request sent to ${destination.activityCentre} for approval.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit transfer request.");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'personal',     label: 'Personal Info'                                              },
    { id: 'contact',      label: 'Contact'                                                    },
    { id: 'emergency',    label: showGuardian ? 'Emergency & Guardian' : 'Emergency Contact'  },
    { id: 'organisation', label: 'Organisation'                                               },
    { id: 'compliance',   label: 'Compliance Details'                                         },
    { id: 'sangh',        label: 'Sangh Responsibility'                                       },
  ];

  return (
    <div className="px-6 py-6">

      {/* ── Profile header ───────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">

        {/* Left: avatar + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 border-2 border-white dark:border-neutral-800 shadow flex items-center justify-center text-primary-600 dark:text-primary-400 text-base font-bold flex-shrink-0 mt-0.5">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {/* Row 1 — Name | Role | Age badge | Status badge — all inline */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">{valueOrDash(fullName)}</h1>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{selectedRole}</span>
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
          {isEditing ? (
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
            <>
              <InfoSection title="Personal Information">
                <EditableInfoItem label="First Name"    value={profile.firstName}   isEditing={isEditing} onChange={v => setField("firstName", v)} />
                <EditableInfoItem label="Middle Name"   value={profile.middleName}  isEditing={isEditing} onChange={v => setField("middleName", v)} />
                <EditableInfoItem label="Surname"       value={profile.surname}     isEditing={isEditing} onChange={v => setField("surname", v)} />
                <InfoItem label="Full Name">{valueOrDash(fullName)}</InfoItem>
                <EditableInfoItem label="Gender"        value={profile.gender}      isEditing={isEditing} onChange={v => setField("gender", v)} options={["Male", "Female"]} />
                {isEditing ? (
                  <EditableInfoItem label="Date of Birth" value={profile.dateOfBirth} isEditing onChange={v => setField("dateOfBirth", v)} type="date" />
                ) : (
                  <InfoItem label="Date of Birth">
                    {formatDate(profile.dateOfBirth)}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-2 text-xs">(Age: {getAge(profile.dateOfBirth)})</span>
                  </InfoItem>
                )}
                <InfoItem label="Age Group">{getAgeGroupLabel(profile.dateOfBirth)}</InfoItem>
                <EditableInfoItem label="Occupation"    value={profile.occupation}  isEditing={isEditing} onChange={v => setField("occupation", v)} />
              </InfoSection>

              <InfoSection title="Other Information">
                <EditableInfoItem label="Medical Information Declared"     value={profile.medicalInfoDeclared}   isEditing={isEditing} onChange={v => setField("medicalInfoDeclared", v)}   options={["No", "Yes"]} />
                <EditableInfoItem label="Medical Details"                  value={profile.medicalInfoDetails}    isEditing={isEditing} onChange={v => setField("medicalInfoDetails", v)}    textarea />
                <EditableInfoItem label="First Aider for Shakha / HSS UK" value={profile.isFirstAider}          isEditing={isEditing} onChange={v => setField("isFirstAider", v)}          options={["No", "Yes"]} />
                <EditableInfoItem label="Dietary Requirements"             value={profile.dietaryRequirements}   isEditing={isEditing} onChange={v => setField("dietaryRequirements", v)} />
                <EditableInfoItem label="Originating State in India"       value={profile.originatingStateIndia} isEditing={isEditing} onChange={v => setField("originatingStateIndia", v)} />
              </InfoSection>
            </>
          )}

          {/* ── Contact ── */}
          {activeTab === 'contact' && (
            <InfoSection title="Contact Information">
              <EditableInfoItem label="Primary Email Address"    value={profile.email}           isEditing={isEditing} onChange={v => setField("email", v)}           type="email" />
              <EditableInfoItem label="Secondary Email Address"  value={profile.secondaryEmail}  isEditing={isEditing} onChange={v => setField("secondaryEmail", v)}  type="email" />
              <EditableInfoItem label="Primary Contact Number"   value={profile.phone}           isEditing={isEditing} onChange={v => setField("phone", v)}           type="tel" />
              <EditableInfoItem label="Secondary Contact Number" value={profile.secondaryPhone}  isEditing={isEditing} onChange={v => setField("secondaryPhone", v)}  type="tel" />
              <EditableInfoItem label="Building Name"            value={profile.buildingName}    isEditing={isEditing} onChange={v => setField("buildingName", v)} />
              <EditableInfoItem label="Address Line 1"           value={profile.addressLine1}    isEditing={isEditing} onChange={v => setField("addressLine1", v)} />
              <EditableInfoItem label="Address Line 2"           value={profile.addressLine2}    isEditing={isEditing} onChange={v => setField("addressLine2", v)} />
              <EditableInfoItem label="Town / City"              value={profile.contactTownCity} isEditing={isEditing} onChange={v => setField("contactTownCity", v)} />
              <EditableInfoItem label="Post Code"                value={profile.postCode}        isEditing={isEditing} onChange={v => setField("postCode", v)} />
            </InfoSection>
          )}

          {/* ── Emergency & Guardian ── */}
          {activeTab === 'emergency' && (
            <>
              <InfoSection title="Emergency Contact">
                <EditableInfoItem label="Name"         value={profile.emergencyContactName}         isEditing={isEditing} onChange={v => setField("emergencyContactName", v)} />
                <EditableInfoItem label="Phone"        value={profile.emergencyContactPhone}        isEditing={isEditing} onChange={v => setField("emergencyContactPhone", v)} type="tel" />
                <EditableInfoItem label="Email"        value={profile.emergencyContactEmail}        isEditing={isEditing} onChange={v => setField("emergencyContactEmail", v)} type="email" />
                <EditableInfoItem label="Relationship" value={profile.emergencyContactRelationship} isEditing={isEditing} onChange={v => setField("emergencyContactRelationship", v)} />
              </InfoSection>

              {showGuardian && (
                <InfoSection title="Parent / Guardian Approval Information">
                  <EditableInfoItem label="Parent / Guardian Name" value={profile.guardianName}         isEditing={isEditing} onChange={v => setField("guardianName", v)} />
                  <EditableInfoItem label="Phone"                  value={profile.guardianPhone}        isEditing={isEditing} onChange={v => setField("guardianPhone", v)} type="tel" />
                  <EditableInfoItem label="Email"                  value={profile.guardianEmail}        isEditing={isEditing} onChange={v => setField("guardianEmail", v)} type="email" />
                  <EditableInfoItem label="Relationship"           value={profile.guardianRelationship} isEditing={isEditing} onChange={v => setField("guardianRelationship", v)} />
                </InfoSection>
              )}
            </>
          )}

          {/* ── Compliance Details ── */}
          {activeTab === 'compliance' && (
            <>
              <InfoSection title="DBS Check">
                <EditableInfoItem label="Status"                          value={profile.dbsStatus}                      isEditing={isEditing} onChange={v => setField("dbsStatus", v)}                      options={["Pending", "Completed"]} />
                <EditableInfoItem label="DBS Certificate Number"          value={profile.dbsCertificateNumber}            isEditing={isEditing} onChange={v => setField("dbsCertificateNumber", v)} />
                <EditableInfoItem label="Certificate Date"                value={profile.dbsCertificateDate}              isEditing={isEditing} onChange={v => setField("dbsCertificateDate", v)}              type="date" />
                {/* Certificate File — file upload in edit mode */}
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Certificate File</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 flex-1 truncate">
                          {profile.dbsCertificateFile || "Click to upload certificate…"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) setField("dbsCertificateFile", file.name);
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Accepted: PDF, JPG, PNG</p>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-900 dark:text-white font-medium">
                      {profile.dbsCertificateFile
                        ? <span className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                            {profile.dbsCertificateFile}
                          </span>
                        : "—"}
                    </div>
                  )}
                </div>
                <EditableInfoItem label="Certificate Received From"       value={profile.dbsCertificateReceivedFrom}      isEditing={isEditing} onChange={v => setField("dbsCertificateReceivedFrom", v)} />
                <EditableInfoItem label="Other Source"                    value={profile.dbsCertificateReceivedFromOther} isEditing={isEditing} onChange={v => setField("dbsCertificateReceivedFromOther", v)} />
                <EditableInfoItem label="Enrolled in DBS Update Service"  value={profile.dbsUpdateService}                isEditing={isEditing} onChange={v => setField("dbsUpdateService", v)}                options={["No", "Yes"]} />
                <EditableInfoItem label="DBS Update Service Number"       value={profile.dbsUpdateServiceNumber}          isEditing={isEditing} onChange={v => setField("dbsUpdateServiceNumber", v)} />
                <EditableInfoItem label="Last Update Service Check"       value={profile.dbsUpdateServiceCheckDate}       isEditing={isEditing} onChange={v => setField("dbsUpdateServiceCheckDate", v)}       type="date" />
                <EditableInfoItem label="DBS Application Under Process"   value={profile.dbsAppUnderProcess}              isEditing={isEditing} onChange={v => setField("dbsAppUnderProcess", v)}              options={["No", "Yes"]} />
                <EditableInfoItem label="Verified By"                     value={profile.dbsCheckedBy}                    isEditing={isEditing} onChange={v => setField("dbsCheckedBy", v)} />
              </InfoSection>

              <InfoSection title="First Aid">
                <EditableInfoItem label="Status"           value={profile.firstAidStatus} isEditing={isEditing} onChange={v => setField("firstAidStatus", v)} options={["Pending", "Completed"]} />
                <EditableInfoItem label="Reference Number" value={profile.firstAidRef}    isEditing={isEditing} onChange={v => setField("firstAidRef", v)} />
                <EditableInfoItem label="Expiry Date"      value={profile.firstAidExpiry} isEditing={isEditing} onChange={v => setField("firstAidExpiry", v)} type="date" />
              </InfoSection>

              <InfoSection title="Safeguarding">
                <EditableInfoItem label="Status"           value={profile.safeguardingStatus} isEditing={isEditing} onChange={v => setField("safeguardingStatus", v)} options={["Pending", "Completed"]} />
                <EditableInfoItem label="Reference Number" value={profile.safeguardingRef}    isEditing={isEditing} onChange={v => setField("safeguardingRef", v)} />
                <EditableInfoItem label="Expiry Date"      value={profile.safeguardingExpiry} isEditing={isEditing} onChange={v => setField("safeguardingExpiry", v)} type="date" />
              </InfoSection>
            </>
          )}

          {/* ── Sangh Responsibility ── */}
          {activeTab === 'sangh' && (
            <InfoSection title="Sangh Responsibility">
              <InfoItem label="Title / Designation">{valueOrDash(profile.sanghTitle)}</InfoItem>
              <InfoItem label="Responsibility Type">{valueOrDash(profile.responsibilityType)}</InfoItem>
              <InfoItem label="Responsibility Level">{valueOrDash(profile.responsibilityLevel)}</InfoItem>
              <InfoItem label="Since">
                {profile.responsibilityStartDate
                  ? new Date(profile.responsibilityStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </InfoItem>
            </InfoSection>
          )}

          {/* ── Organisation ── */}
          {activeTab === 'organisation' && (
            <>
              {/* Membership Status */}
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  Membership Status
                </h4>
                <div className="px-6 pb-5 pt-4">
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs bg-[#f1fced] border-[#b8efa0]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4EAE33]" />
                      <span className="text-[#3d8928]">Active &amp; Approved</span>
                    </span>
                    {pendingTransfer && (
                      <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs bg-[#fffbeb] border-[#fde68a]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F9B03D]" />
                        <span className="text-[#d97706]">Shakha Transfer Pending</span>
                      </span>
                    )}
                  </div>
                  <div className={`p-3 border rounded-lg ${
                    pendingTransfer
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                      : 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30'
                  }`}>
                    <p className={`text-[10px] leading-normal italic ${
                      pendingTransfer ? 'text-amber-800 dark:text-amber-200' : 'text-green-800 dark:text-green-200'
                    }`}>
                      {pendingTransfer
                        ? `Your transfer to ${pendingTransfer.toCentre} is awaiting approval. Your current Shakha remains active until reviewed.`
                        : 'Your membership is active at your current Shakha.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organisation Details */}
              <InfoSection title="Organisation Details">
                <EditableInfoItem
                  label="Country / Organisation"
                  value={profile.country}
                  isEditing={isEditing}
                  onChange={value => setOrganisationField('country', value)}
                  options={MASTERS_CASCADE.countries}
                />
                <EditableInfoItem
                  label="Vibhaag"
                  value={profile.region}
                  isEditing={isEditing}
                  onChange={value => setOrganisationField('region', value)}
                  options={profile.country ? (MASTERS_CASCADE.regions[profile.country] ?? []) : []}
                />
                <EditableInfoItem
                  label="Nagar"
                  value={profile.town}
                  isEditing={isEditing}
                  onChange={value => setOrganisationField('town', value)}
                  options={profile.region ? (MASTERS_CASCADE.towns[profile.region] ?? []) : []}
                />
                <EditableInfoItem
                  label="Shakha"
                  value={profile.activityCentre}
                  isEditing={isEditing}
                  onChange={value => setOrganisationField('activityCentre', value)}
                  options={profile.town ? (MASTERS_CASCADE.centres[profile.town] ?? []) : []}
                />
                <InfoItem label="Age Category">{getAgeGroupLabel(profile.dateOfBirth)}</InfoItem>
              </InfoSection>

              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  Change Shakha / Activity Centre
                </h4>
                <div className="p-6">
                  {pendingTransfer ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Transfer pending approval</p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                            The admin team at <strong>{pendingTransfer.toCentre}</strong> has been notified.
                            Your current Shakha remains <strong>{pendingTransfer.fromCentre}</strong> until approval.
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                            Requested {new Date(pendingTransfer.requestedAt).toLocaleString("en-GB")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        You can continue viewing your profile, attendance, and donation history while this request is pending.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Current approved Shakha</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.activityCentre}</p>
                        </div>
                      </div>
                      {pendingTransfer && (
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Transfer awaiting approval</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Requested move to {pendingTransfer.toCentre}. You can continue viewing your profile, attendance, and donations while the receiving Shakha reviews it.
                          </p>
                        </div>
                      )}
                      <div className="max-w-xl">
                        <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">New Shakha</label>
                        <FormSelect value={requestedCentre} onChange={event => setRequestedCentre(event.target.value)} disabled={!!pendingTransfer}>
                          <option value="">Select a new Shakha...</option>
                          {Object.values(MASTERS_CASCADE.centres).flat()
                            .filter(centre => centre !== profile.activityCentre)
                            .map(centre => <option key={centre} value={centre}>{centre}</option>)}
                        </FormSelect>
                      </div>
                      <div className="flex justify-end">
                        <PrimaryButton onClick={handleTransferRequest} disabled={!requestedCentre || !!pendingTransfer}>
                          Request Shakha Transfer
                        </PrimaryButton>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        The new Shakha Admin or Ops team must approve the request before your current Shakha assignment changes.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {transferHistory.length > 0 && (
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    Shakha Transfer History
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {transferHistory.map(request => (
                      <div key={request.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {request.fromCentre} <span className="text-neutral-400 mx-1">to</span> {request.toCentre}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Requested {new Date(request.requestedAt).toLocaleString("en-GB")}
                            {request.reviewedAt ? ` · Reviewed ${new Date(request.reviewedAt).toLocaleString("en-GB")}` : ''}
                          </p>
                          {request.rejectionReason && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{request.rejectionReason}</p>}
                        </div>
                        <span className={`self-start md:self-auto px-2 py-1 rounded-full border text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900'
                            : request.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900'
                        }`}>
                          {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
    if (typeof window === "undefined") return DEFAULT_PROFILE;
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return DEFAULT_PROFILE;
    try { return { ...DEFAULT_PROFILE, ...JSON.parse(saved) }; }
    catch { return DEFAULT_PROFILE; }
  });
  const [initialProfile, setInitialProfile] = useState(profile);

  useEffect(() => { setInitialProfile(profile); }, []);

  const hasChanges = profile.email !== initialProfile.email || profile.mobile !== initialProfile.mobile;

  const setField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) =>
    setProfile(cur => ({ ...cur, [field]: value }));

  const handleSave = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setInitialProfile(profile);
    toast.success("Profile updated successfully.");
  };

  const handleReset = () => setProfile(initialProfile);

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* ── Profile header ───────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 border-2 border-white dark:border-neutral-800 shadow flex items-center justify-center text-primary-600 dark:text-primary-400 text-base font-bold flex-shrink-0 mt-0.5">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">John Doe</h1>
                  <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">Super Admin</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />{profile.email}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">|</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />{profile.mobile}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <SecondaryButton icon={RotateCcw} onClick={handleReset} disabled={!hasChanges}>Reset</SecondaryButton>
              <PrimaryButton icon={Save} onClick={handleSave} disabled={!hasChanges}>Save Changes</PrimaryButton>
            </div>
          </div>
        </div>

        {/* ── Contact details card ─────────────────────────────── */}
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              Contact Details
            </h4>
            <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="profile-email" className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Email ID</label>
                <FormInput
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={e => setField("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="profile-mobile" className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">Mobile Number</label>
                <FormInput
                  id="profile-mobile"
                  type="tel"
                  value={profile.mobile}
                  onChange={e => setField("mobile", e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyProfile({ selectedRole = "Super Admin" }: { selectedRole?: string }) {
  return selectedRole === "Super Admin"
    ? <SuperAdminProfileView />
    : <MemberProfileView selectedRole={selectedRole} />;
}
