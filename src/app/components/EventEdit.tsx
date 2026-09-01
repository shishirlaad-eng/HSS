import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  MapPin,
  AlertTriangle,
  Globe,
  Ticket,
  Copy,
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, FormSelect, ErrorText, RichTextEditor } from './hb/common';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup, mockMembers, RESPONSIBILITY_LEVEL_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS, getAge, getAgeGroup } from '../../mockAPI/membersData';
import { Event, EVENT_TERMS_AND_CONDITIONS, EVENT_CONFIRMATION_VARIABLES, DEFAULT_CONFIRMATION_SUBJECT, DEFAULT_CONFIRMATION_MESSAGE, mockCoupons, KARYAKRAM_TYPE_OPTIONS } from '../../mockAPI/eventsData';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'sonner';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { getScopedFilterOptions, filterByScope } from '../../mockAPI/roleScope';
import {
  PriceCategoriesEditor,
  CustomQuestionsEditor,
  EventImageField,
  TermsSectionsEditor,
  DonationAmountsEditor,
  AGE_GROUP_OPTIONS,
  MultiSelectField,
  MemberMultiSelect,
  isFullSelection,
  isUnset,
  isAllSelected,
  ALL_SENTINEL,
  composeVenueAddress,
  mockAddressesForPostcode,
} from './EventFormFields';

interface EventEditProps {
  event: Event;
  onBack: () => void;
  onSave?: (updated: Event) => void;
}

// Decision (Shishir/Ritesh): Draft, scheduled and in-progress Karyakrams stay
// editable (day-of venue/time/price changes, early closure, extension, etc.) —
// only Completed (and Cancelled, equally terminal) are locked. Matches canModify
// in EventManagement.tsx/EventDetail.tsx.
const canModify = (event: Event) => event.status !== 'completed' && event.status !== 'cancelled';

// ── Same tab set as EventCreate, minus Location's structured postcode fields —
// Target Audience now matches Create exactly (org-wide multi-select targeting,
// specific-member search, full demographic filters).
type EditTab = 'basics' | 'location' | 'audience' | 'payment' | 'questions' | 'terms' | 'confirmation';

const TABS: { id: EditTab; label: string }[] = [
  { id: 'basics',       label: 'Karyakram Basics'     },
  { id: 'location',     label: 'Location'             },
  { id: 'audience',     label: 'Target Audience'      },
  { id: 'payment',      label: 'Payment Type'         },
  { id: 'questions',    label: 'Additional Questions' },
  { id: 'terms',        label: 'Terms & Conditions'   },
  { id: 'confirmation', label: 'Karyakram Confirmation'   },
];

function ageAsOf(dateOfBirth: string, asOfDateStr: string): number {
  const asOf = new Date(asOfDateStr);
  const dob = new Date(dateOfBirth);
  let age = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
  return age;
}

// How many members in scope currently match the Target Audience + Demographic
// Filters selections — shown as a live count at the bottom of the Audience tab.
// Matches the same logic used in EventCreate.tsx.
function countMatchingMembers(
  f: {
    targetSpecificOnly: boolean; targetMemberIds: string[];
    targetRegions: string[]; targetTowns: string[]; targetCentres: string[];
    filterAgeCategories: AgeGroup[]; filterGenders: ('male' | 'female')[];
    filterJobTitles: string[]; filterResponsibilityLevels: string[]; filterResponsibilityTypes: string[];
    specificAgeOperator: '' | '=' | '>' | '<' | 'between';
    specificAgeValue: string; specificAgeAsAtDate: string; specificAgeFrom: string; specificAgeTo: string;
  },
  members: typeof mockMembers,
  regionOptions: string[], townOptions: string[], centreOptions: string[],
): number {
  if (f.targetSpecificOnly) return f.targetMemberIds.length;

  return members.filter(m => {
    if (!isFullSelection(f.targetRegions, regionOptions) && !f.targetRegions.includes(m.region)) return false;
    if (!isFullSelection(f.targetTowns, townOptions) && !f.targetTowns.includes(m.town)) return false;
    if (!isFullSelection(f.targetCentres, centreOptions) && !f.targetCentres.includes(m.activityCentre)) return false;

    if (!isFullSelection(f.filterAgeCategories, AGE_GROUP_OPTIONS.map(o => o.value)) && !f.filterAgeCategories.includes(getAgeGroup(m.dateOfBirth))) return false;
    if (!isFullSelection(f.filterGenders, ['male', 'female']) && !f.filterGenders.includes(m.gender)) return false;
    if (!isFullSelection(f.filterJobTitles, ROLE_TYPE_OPTIONS) && !f.filterJobTitles.includes(m.jobTitle)) return false;
    if (!isFullSelection(f.filterResponsibilityLevels, [...RESPONSIBILITY_LEVEL_OPTIONS]) && !(m.responsibilityLevel && f.filterResponsibilityLevels.includes(m.responsibilityLevel))) return false;
    if (!isFullSelection(f.filterResponsibilityTypes, [...RESPONSIBILITY_TYPE_OPTIONS]) && !(m.responsibilityType && f.filterResponsibilityTypes.includes(m.responsibilityType))) return false;

    if (f.specificAgeOperator === '=' && f.specificAgeValue && f.specificAgeAsAtDate) {
      if (ageAsOf(m.dateOfBirth, f.specificAgeAsAtDate) !== Number(f.specificAgeValue)) return false;
    } else if (f.specificAgeOperator === '>' && f.specificAgeValue && f.specificAgeAsAtDate) {
      if (ageAsOf(m.dateOfBirth, f.specificAgeAsAtDate) < Number(f.specificAgeValue)) return false;
    } else if (f.specificAgeOperator === '<' && f.specificAgeValue && f.specificAgeAsAtDate) {
      if (ageAsOf(m.dateOfBirth, f.specificAgeAsAtDate) > Number(f.specificAgeValue)) return false;
    } else if (f.specificAgeOperator === 'between' && f.specificAgeFrom && f.specificAgeTo) {
      if (m.dateOfBirth < f.specificAgeFrom || m.dateOfBirth > f.specificAgeTo) return false;
    }

    return true;
  }).length;
}

function findCountryForRegion(region: string): string {
  const entry = Object.entries(MASTERS_CASCADE.regions).find(([, regions]) => (regions as string[]).includes(region));
  return entry?.[0] ?? MASTERS_CASCADE.countries[0];
}

// Karyakram scope (country/region/town/activityCentre) still drives admin
// ownership/visibility — derived from the multi-select audience targeting
// rather than picked directly, same as EventCreate, falling back to the
// editing admin's own scope when the target is left as "All".
function deriveOwnerScope(f: { targetRegions: string[]; targetTowns: string[]; targetCentres: string[] }, creatorScope: { country?: string; region?: string; town?: string; centre?: string }) {
  // A single, non-"All" value picked in a target multi-select IS the ownership scope;
  // anything else (unset, "All", or multiple values) falls back to the creator's own scope.
  const firstSpecific = (sel: string[]) => (sel.length > 0 && sel[0] !== ALL_SENTINEL ? sel[0] : '');
  const region = (f.targetRegions.length === 1 && firstSpecific(f.targetRegions)) || creatorScope.region || firstSpecific(f.targetRegions) || '';
  const town   = (f.targetTowns.length === 1   && firstSpecific(f.targetTowns))   || creatorScope.town   || firstSpecific(f.targetTowns)   || '';
  const centre = (f.targetCentres.length === 1 && firstSpecific(f.targetCentres)) || creatorScope.centre || firstSpecific(f.targetCentres) || '';
  const country = creatorScope.country ?? (region ? findCountryForRegion(region) : MASTERS_CASCADE.countries[0]);
  return { country, region, town, activityCentre: centre };
}

// ── Reusable card matching EventCreate's Card style ───────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 rounded-t-lg">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-4">
        {children}
      </div>
    </div>
  );
}

export default function EventEdit({ event, onBack, onSave }: EventEditProps) {
  const blocked = !canModify(event);
  const { scope } = useRoleScope();

  const [activeTab, setActiveTab] = useState<EditTab>('basics');

  const [formData, setFormData] = useState({
    name:                event.name,
    karyakramType:       event.karyakramType ?? '',
    karyakramTypeOther:  event.karyakramTypeOther ?? '',
    description:         event.description ?? '',
    imageUrl:            event.imageUrl ?? '',
    host:                event.host,
    locationType:   event.locationType,
    venuePostCode: '',
    venueSelectedAddress: '',
    venueBuildingName: '',
    venueAddressLine1: event.venueAddress ?? '',
    venueAddressLine2: '',
    venueTownCity: '',
    onlineUrl:      event.onlineUrl ?? '',
    startDate:      event.startDate.split('T')[0],
    startTime:      event.startDate.split('T')[1]?.substring(0, 5) ?? '09:00',
    endDate:        event.endDate.split('T')[0],
    endTime:        event.endDate.split('T')[1]?.substring(0, 5) ?? '17:00',
    registrationStartDate: event.registrationStartDate ? event.registrationStartDate.split('T')[0] : '',
    registrationStartTime: event.registrationStartDate ? (event.registrationStartDate.split('T')[1]?.substring(0, 5) ?? '') : '',
    registrationEndDate: event.registrationEndDate ? event.registrationEndDate.split('T')[0] : '',
    registrationEndTime: event.registrationEndDate ? (event.registrationEndDate.split('T')[1]?.substring(0, 5) ?? '') : '',
    paymentType:    event.paymentType as 'paid' | 'free',
    priceCategories: event.priceCategories ?? (event.price ? [{ id: 'PC-1', label: 'Standard', price: event.price }] : []),
    couponCode:     event.couponCode ?? '',
    donationEnabled: event.donationEnabled ?? false,
    donationDescription: event.donationDescription ?? '',
    donationAmounts: event.donationAmounts ?? [],
    capacity:       event.capacity ? String(event.capacity) : '',
    waitlistEnabled: event.waitlistEnabled ?? false,
    guestRegistrationEnabled: event.guestRegistrationEnabled ?? false,
    shakhaKaryawahaApprovalRequired: event.shakhaKaryawahaApprovalRequired ?? false,
    selfCheckInEnabled: event.selfCheckInEnabled ?? false,
    customQuestions: event.customQuestions ?? [],
    termsSections: event.termsSections ?? (event.termsAndConditions
      ? [{ id: 'TS-1', title: 'Terms and Conditions', description: event.termsAndConditions }]
      : [{ id: 'TS-1', title: 'Terms and Conditions', description: EVENT_TERMS_AND_CONDITIONS }]),
    confirmationSubject: event.confirmationSubject ?? DEFAULT_CONFIRMATION_SUBJECT,
    confirmationMessage: event.confirmationMessage ?? DEFAULT_CONFIRMATION_MESSAGE,
    // Undefined here always meant "All" (no filter) under the old semantics — reflect
    // that as the explicit All-sentinel, never as unset, since this is always an
    // existing event (unset would wrongly block Save on first open).
    filterAgeCategories: event.filterAgeCategories ?? [ALL_SENTINEL as AgeGroup],
    filterGenders:       event.filterGenders ?? [ALL_SENTINEL as 'male' | 'female'],
    filterJobTitles:     event.filterJobTitles ?? [ALL_SENTINEL],
    filterResponsibilityLevels: event.filterResponsibilityLevels ?? [ALL_SENTINEL],
    filterResponsibilityTypes:  event.filterResponsibilityTypes ?? [ALL_SENTINEL],
    specificAgeOperator: event.filterSpecificAge?.operator ?? '' as '' | '=' | '>' | '<' | 'between',
    specificAgeValue: event.filterSpecificAge?.value !== undefined ? String(event.filterSpecificAge.value) : '',
    specificAgeAsAtDate: event.filterSpecificAge?.asAtDate ?? '',
    specificAgeFrom: event.filterSpecificAge?.from ?? '',
    specificAgeTo: event.filterSpecificAge?.to ?? '',
    targetSpecificOnly: (event.targetMemberIds?.length ?? 0) > 0,
    targetMemberIds: event.targetMemberIds ?? [] as string[],
    targetRegions: event.targetRegions ?? [ALL_SENTINEL],
    targetTowns: event.targetTowns ?? [ALL_SENTINEL],
    targetCentres: event.targetCentres ?? [ALL_SENTINEL],
    eventAdminIds: event.eventAdminIds ?? [] as string[],
    chatState:      event.chatState as 'active' | 'archived',
  });

  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched]   = useState(false);

  // Org-wide targeting options — same cascade as EventCreate's Scope card.
  // Target Audience option lists are capped to what this admin's own level can
  // reach — matches EventCreate.tsx.
  const scopedOptions = getScopedFilterOptions(scope);
  const regionOptions = scopedOptions.regionOptions;
  const townOptions    = !isFullSelection(formData.targetRegions, regionOptions)
    ? formData.targetRegions.flatMap(r => MASTERS_CASCADE.towns[r] ?? []).filter(t => scopedOptions.townOptions.includes(t))
    : scopedOptions.townOptions;
  const centreOptions  = !isFullSelection(formData.targetTowns, townOptions)
    ? formData.targetTowns.flatMap(t => MASTERS_CASCADE.centres[t] ?? []).filter(c => scopedOptions.centreOptions.includes(c))
    : scopedOptions.centreOptions;

  // "Invite specific members only" is likewise capped to members within this admin's scope.
  const scopedMembers = filterByScope(mockMembers, scope);

  const matchingMemberCount = countMatchingMembers(formData, scopedMembers, regionOptions, townOptions, centreOptions);

  const set = (field: string, value: any) => {
    setFormData(prev => {
      const next: any = { ...prev, [field]: value };
      if (field === 'venuePostCode') { next.venueSelectedAddress = ''; }
      return next;
    });
  };

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const FIELD_ORDER = [
    'name', 'startDate', 'startTime', 'endDate', 'endTime',
    'targetRegions', 'targetTowns', 'targetCentres',
    'filterAgeCategories', 'filterGenders', 'filterResponsibilityLevels', 'filterJobTitles', 'filterResponsibilityTypes',
    'targetMemberIds',
    'paymentType', 'priceCategories', 'couponCode',
  ];
  const FIELD_TAB: Record<string, EditTab> = {
    name: 'basics', startDate: 'basics', startTime: 'basics', endDate: 'basics', endTime: 'basics',
    targetMemberIds: 'audience', targetRegions: 'audience', targetTowns: 'audience', targetCentres: 'audience',
    filterAgeCategories: 'audience', filterGenders: 'audience', filterResponsibilityLevels: 'audience',
    filterJobTitles: 'audience', filterResponsibilityTypes: 'audience',
    paymentType: 'payment', priceCategories: 'payment', couponCode: 'payment',
  };
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = FIELD_ORDER.find(k => errs[k]);
    if (!firstKey) return;
    const tab = FIELD_TAB[firstKey];
    if (tab && tab !== activeTab) setActiveTab(tab);
    setTimeout(() => {
      const el = fieldRefs.current[firstKey];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 60);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim())         errs.name           = 'This field is required.';
    if (formData.targetSpecificOnly && formData.targetMemberIds.length === 0) {
      errs.targetMemberIds = 'Please select at least one member.';
    }
    if (isUnset(formData.targetRegions))             errs.targetRegions             = 'Please select "All" or specific Vibhags.';
    if (isUnset(formData.targetTowns))                errs.targetTowns                = 'Please select "All" or specific Nagars.';
    if (isUnset(formData.targetCentres))              errs.targetCentres              = 'Please select "All" or specific Shakhas.';
    if (!formData.startDate)           errs.startDate      = 'This field is required.';
    if (!formData.startTime)           errs.startTime      = 'This field is required.';
    if (!formData.endDate)             errs.endDate        = 'This field is required.';
    if (!formData.endTime)             errs.endTime        = 'This field is required.';
    if (!formData.paymentType)         errs.paymentType    = 'This field is required.';
    if (formData.paymentType === 'paid' && formData.priceCategories.length === 0) {
      errs.priceCategories = 'Add at least one ticket type for paid events.';
    }
    if (formData.paymentType === 'paid' && formData.couponCode.trim()) {
      const valid = mockCoupons.some(c => c.name.toLowerCase() === formData.couponCode.trim().toLowerCase() && c.status === 'active');
      if (!valid) errs.couponCode = 'No active coupon with this code exists. Check HSS UK Setup > Lists and Options > Karyakrams > Coupons.';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end   = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) errs.endDate = 'Start Date/Time must be earlier than End Date/Time.';
    }
    setErrors(errs);
    return errs;
  };

  const handleSave = async () => {
    setTouched(true);
    if (blocked) {
      toast.error('This Karyakram can no longer be edited after it starts.');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error('Please fill in all required fields.');
      focusFirstError(errs);
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const ownerScope = deriveOwnerScope(formData, scope);
      const updated: Event = {
        ...event,
        name:           formData.name.trim(),
        karyakramType:      (formData.karyakramType || undefined) as Event['karyakramType'],
        karyakramTypeOther: formData.karyakramType === 'Other' ? (formData.karyakramTypeOther.trim() || undefined) : undefined,
        description:    formData.description.trim() || undefined,
        imageUrl:       formData.imageUrl || undefined,
        host:           formData.host.trim(),
        country:        ownerScope.country,
        region:         ownerScope.region,
        town:           ownerScope.town,
        activityCentre: ownerScope.activityCentre,
        locationType:   formData.locationType,
        venueAddress:   formData.locationType === 'physical' ? composeVenueAddress(formData) : undefined,
        onlineUrl:      formData.locationType === 'online'   ? formData.onlineUrl.trim()    : undefined,
        startDate:      `${formData.startDate}T${formData.startTime}:00Z`,
        endDate:        `${formData.endDate}T${formData.endTime}:00Z`,
        registrationStartDate: formData.registrationStartDate ? `${formData.registrationStartDate}T${formData.registrationStartTime || '00:00'}:00Z` : undefined,
        registrationEndDate: formData.registrationEndDate ? `${formData.registrationEndDate}T${formData.registrationEndTime || '23:59'}:00Z` : undefined,
        paymentType:    formData.paymentType,
        price:          formData.paymentType === 'paid' ? formData.priceCategories[0]?.price : undefined,
        priceCategories: formData.paymentType === 'paid' ? formData.priceCategories : undefined,
        couponCode:      formData.paymentType === 'paid' ? (formData.couponCode || undefined) : undefined,
        donationEnabled: formData.donationEnabled,
        donationDescription: formData.donationEnabled ? (formData.donationDescription.trim() || undefined) : undefined,
        donationAmounts: formData.donationEnabled && formData.donationAmounts.length > 0 ? formData.donationAmounts : undefined,
        capacity:       formData.capacity ? parseInt(formData.capacity) : undefined,
        waitlistEnabled: formData.waitlistEnabled,
        guestRegistrationEnabled: formData.guestRegistrationEnabled,
        guestPaymentType: formData.guestRegistrationEnabled ? 'free' : undefined,
        shakhaKaryawahaApprovalRequired: formData.shakhaKaryawahaApprovalRequired,
        selfCheckInEnabled: formData.selfCheckInEnabled,
        customQuestions: formData.customQuestions.length > 0 ? formData.customQuestions : undefined,
        termsSections: formData.termsSections.length > 0 ? formData.termsSections : undefined,
        confirmationSubject: formData.confirmationSubject.trim() || undefined,
        confirmationMessage: formData.confirmationMessage.trim() || undefined,
        filterAgeCategories: !isAllSelected(formData.filterAgeCategories) ? formData.filterAgeCategories : undefined,
        filterGenders:       !isAllSelected(formData.filterGenders)       ? formData.filterGenders       : undefined,
        filterJobTitles:     !isAllSelected(formData.filterJobTitles)     ? formData.filterJobTitles     : undefined,
        filterResponsibilityLevels: !isAllSelected(formData.filterResponsibilityLevels) ? formData.filterResponsibilityLevels : undefined,
        filterResponsibilityTypes:  !isAllSelected(formData.filterResponsibilityTypes)  ? formData.filterResponsibilityTypes  : undefined,
        filterSpecificAge: formData.specificAgeOperator ? (
          formData.specificAgeOperator === 'between'
            ? { operator: 'between' as const, from: formData.specificAgeFrom || undefined, to: formData.specificAgeTo || undefined }
            : { operator: formData.specificAgeOperator, value: formData.specificAgeValue ? parseInt(formData.specificAgeValue) : undefined, asAtDate: formData.specificAgeAsAtDate || undefined }
        ) : undefined,
        targetRegions: !isFullSelection(formData.targetRegions, regionOptions) ? formData.targetRegions : undefined,
        targetTowns:   !isFullSelection(formData.targetTowns, townOptions)     ? formData.targetTowns   : undefined,
        targetCentres: !isFullSelection(formData.targetCentres, centreOptions) ? formData.targetCentres : undefined,
        targetMemberIds: formData.targetSpecificOnly ? formData.targetMemberIds : undefined,
        eventAdminIds: formData.eventAdminIds.length > 0 ? formData.eventAdminIds : undefined,
        chatState:      formData.chatState,
        lastUpdated:    new Date().toISOString(),
      };
      const previousAdminIds = event.eventAdminIds ?? [];
      const newlyAssignedAdmins = mockMembers.filter(m => formData.eventAdminIds.includes(m.id) && !previousAdminIds.includes(m.id));
      if (onSave) {
        onSave(updated);
      } else {
        toast.success('Karyakram updated successfully.');
        onBack();
      }
      if (newlyAssignedAdmins.length > 0) {
        toast.success(`Notified ${newlyAssignedAdmins.length} new Karyakram Admin${newlyAssignedAdmins.length !== 1 ? 's' : ''}: ${newlyAssignedAdmins.map(m => m.name).join(', ')}.`);
      }
    } catch {
      toast.error('Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Modify Karyakram"
        breadcrumbs={[
          { label: 'Karyakrams', onClick: () => { onBack(); onBack(); } },
          { label: event.name, onClick: onBack },
          { label: 'Modify', current: true },
        ]}
      >
        <div className="flex items-center gap-3">
          <SecondaryButton icon={ArrowLeft} onClick={onBack}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            icon={Save}
            onClick={handleSave}
            isLoading={isSaving}
            disabled={blocked}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </PrimaryButton>
        </div>
      </PageHeader>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono mb-4">
        Karyakram Id: {event.id} · Status: <span className="capitalize">{event.status}</span> · Last updated: {formatDate(event.lastUpdated)}
      </p>

      {/* Cutoff warning */}
      {blocked && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-900/40 rounded-lg text-sm text-error-700 dark:text-error-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{event.status === 'completed' ? 'Completed Karyakrams cannot be edited.' : 'Cancelled Karyakrams cannot be edited.'} All fields are locked.</span>
        </div>
      )}

      {/* TABBED CONTENT */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">

        {/* Tab bar */}
        <div className="rounded-t-lg border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
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
        <div className="rounded-b-lg p-6 bg-white dark:bg-neutral-950 space-y-5">

          {/* ── Karyakram Basics (incl. Schedule) ── */}
          {activeTab === 'basics' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Karyakram Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel required>Karyakram Title</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.name = el; }}
                        value={formData.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Enter Karyakram title"
                        disabled={blocked}
                        className={errCls('name')}
                      />
                      <ErrorText>{touched && errors.name}</ErrorText>
                    </FormField>
                  </div>
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel>Karyakram Type</FormLabel>
                      <FormSelect value={formData.karyakramType} onChange={e => set('karyakramType', e.target.value)} disabled={blocked}>
                        <option value="">Select Karyakram type…</option>
                        {KARYAKRAM_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </FormSelect>
                    </FormField>
                    {formData.karyakramType === 'Other' && (
                      <div className="mt-3">
                        <FormField>
                          <FormLabel>Please specify</FormLabel>
                          <FormInput
                            value={formData.karyakramTypeOther}
                            onChange={e => set('karyakramTypeOther', e.target.value)}
                            placeholder="Enter Karyakram type"
                            disabled={blocked}
                          />
                        </FormField>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel>Karyakram Description</FormLabel>
                      <RichTextEditor
                        value={formData.description}
                        onChange={html => set('description', html)}
                        placeholder="Describe the Karyakram — purpose, agenda, what to expect…"
                        disabled={blocked}
                      />
                    </FormField>
                  </div>
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel required>Primary Host</FormLabel>
                      <FormInput
                        value={formData.host}
                        onChange={e => set('host', e.target.value)}
                        placeholder="Host name"
                        disabled={blocked}
                      />
                    </FormField>
                  </div>
                  <FormField>
                    <FormLabel>Capacity</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.capacity}
                      onChange={e => set('capacity', e.target.value)}
                      placeholder="Max participants"
                      min="1"
                      disabled={blocked}
                    />
                    <label className="inline-flex items-center gap-2 mt-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.waitlistEnabled}
                        onChange={e => set('waitlistEnabled', e.target.checked)}
                        disabled={blocked}
                        className="rounded border-neutral-300 dark:border-neutral-700"
                      />
                      Enable waiting list — allow registration once capacity is full
                    </label>
                  </FormField>
                  <EventImageField value={formData.imageUrl} onChange={v => set('imageUrl', v)} />
                  <FormField>
                    <FormLabel required>Start Date</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.startDate = el; }}
                      type="date"
                      value={formData.startDate}
                      onChange={e => set('startDate', e.target.value)}
                      disabled={blocked}
                      className={errCls('startDate')}
                    />
                    <ErrorText>{touched && errors.startDate}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Start Time</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.startTime = el; }}
                      type="time"
                      value={formData.startTime}
                      onChange={e => set('startTime', e.target.value)}
                      disabled={blocked}
                      className={errCls('startTime')}
                    />
                    <ErrorText>{touched && errors.startTime}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>End Date</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.endDate = el; }}
                      type="date"
                      value={formData.endDate}
                      onChange={e => set('endDate', e.target.value)}
                      disabled={blocked}
                      className={errCls('endDate')}
                    />
                    <ErrorText>{touched && errors.endDate}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>End Time</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.endTime = el; }}
                      type="time"
                      value={formData.endTime}
                      onChange={e => set('endTime', e.target.value)}
                      disabled={blocked}
                      className={errCls('endTime')}
                    />
                    <ErrorText>{touched && errors.endTime}</ErrorText>
                  </FormField>
                </div>
              </Card>

              <div className="flex flex-col gap-5">
                <Card title="Admin Options">
                  <div className="space-y-5">
                    <div>
                      <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.guestRegistrationEnabled}
                          onChange={e => set('guestRegistrationEnabled', e.target.checked)}
                          disabled={blocked}
                          className="rounded border-neutral-300 dark:border-neutral-700"
                        />
                        <Ticket className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        Allow non-members to register via a Non-Member Registration link
                      </label>
                    </div>

                    <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Karyakram Admins</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        Assign members who can manage this Karyakram — approve registrations, check-in attendees, edit details. Not limited to your own Shakha.
                      </p>
                      <MemberMultiSelect
                        selectedIds={formData.eventAdminIds}
                        onChange={ids => set('eventAdminIds', ids)}
                        disabled={blocked}
                      />
                    </div>

                    <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
                      <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.shakhaKaryawahaApprovalRequired}
                          onChange={e => set('shakhaKaryawahaApprovalRequired', e.target.checked)}
                          disabled={blocked}
                          className="rounded border-neutral-300 dark:border-neutral-700"
                        />
                        Shakha Karyawaha approval
                      </label>
                    </div>

                    <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
                      <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.selfCheckInEnabled}
                          onChange={e => set('selfCheckInEnabled', e.target.checked)}
                          disabled={blocked}
                          className="rounded border-neutral-300 dark:border-neutral-700"
                        />
                        Enabled self check - in, members can check in themselves at event venue by mobile app when they are at venue location
                      </label>
                    </div>
                  </div>
                </Card>

                <Card title="Registration Window">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Optional — controls when members can register. Leave blank to keep registration open until the Karyakram starts.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField>
                      <FormLabel>Registration Start Date</FormLabel>
                      <FormInput
                        type="date"
                        value={formData.registrationStartDate}
                        onChange={e => set('registrationStartDate', e.target.value)}
                        disabled={blocked}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Registration Start Time</FormLabel>
                      <FormInput
                        type="time"
                        value={formData.registrationStartTime}
                        onChange={e => set('registrationStartTime', e.target.value)}
                        disabled={blocked}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Registration Close Date</FormLabel>
                      <FormInput
                        type="date"
                        value={formData.registrationEndDate}
                        onChange={e => set('registrationEndDate', e.target.value)}
                        disabled={blocked}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Registration Close Time</FormLabel>
                      <FormInput
                        type="time"
                        value={formData.registrationEndTime}
                        onChange={e => set('registrationEndTime', e.target.value)}
                        disabled={blocked}
                      />
                    </FormField>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── Location ── */}
          {activeTab === 'location' && (
            <Card title="Location">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => set('locationType', 'physical')}
                    disabled={blocked}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
                      formData.locationType === 'physical'
                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Physical
                  </button>
                  <button
                    type="button"
                    onClick={() => set('locationType', 'online')}
                    disabled={blocked}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
                      formData.locationType === 'online'
                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> Online
                  </button>
                </div>
                {formData.locationType === 'physical' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField>
                      <FormLabel>Post Code</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.venuePostCode = el; }}
                        value={formData.venuePostCode}
                        onChange={e => set('venuePostCode', e.target.value)}
                        placeholder="Post code"
                        disabled={blocked}
                        className={errCls('venuePostCode')}
                      />
                      <ErrorText>{touched && errors.venuePostCode}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel>Select Address</FormLabel>
                      <FormSelect
                        value={formData.venueSelectedAddress}
                        disabled={blocked || formData.venuePostCode.trim().length < 4}
                        onChange={e => {
                          const idx = e.target.value;
                          set('venueSelectedAddress', idx);
                          const options = mockAddressesForPostcode(formData.venuePostCode, formData.venueTownCity);
                          const picked = options[Number(idx)];
                          if (picked) {
                            set('venueBuildingName', picked.buildingName);
                            set('venueAddressLine1', picked.addressLine1);
                            set('venueTownCity', picked.town);
                          }
                        }}
                      >
                        <option value="">{formData.venuePostCode.trim().length < 4 ? 'Enter a post code first' : 'Select an address'}</option>
                        {mockAddressesForPostcode(formData.venuePostCode, formData.venueTownCity).map((opt, i) => (
                          <option key={i} value={i}>{opt.label}</option>
                        ))}
                      </FormSelect>
                    </FormField>
                    <FormField>
                      <FormLabel>Building Name</FormLabel>
                      <FormInput value={formData.venueBuildingName} onChange={e => set('venueBuildingName', e.target.value)} placeholder="Building name" disabled={blocked} />
                    </FormField>
                    <FormField>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.venueAddressLine1 = el; }}
                        value={formData.venueAddressLine1}
                        onChange={e => set('venueAddressLine1', e.target.value)}
                        placeholder="Address line 1"
                        disabled={blocked}
                        className={errCls('venueAddressLine1')}
                      />
                      <ErrorText>{touched && errors.venueAddressLine1}</ErrorText>
                    </FormField>
                    <FormField>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormInput value={formData.venueAddressLine2} onChange={e => set('venueAddressLine2', e.target.value)} placeholder="Address line 2" disabled={blocked} />
                    </FormField>
                    <FormField>
                      <FormLabel>Town / City</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.venueTownCity = el; }}
                        value={formData.venueTownCity}
                        onChange={e => set('venueTownCity', e.target.value)}
                        placeholder="Town / City"
                        disabled={blocked}
                        className={errCls('venueTownCity')}
                      />
                      <ErrorText>{touched && errors.venueTownCity}</ErrorText>
                    </FormField>
                  </div>
                ) : (
                  <FormField>
                    <FormLabel>Online Call URL</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.onlineUrl = el; }}
                      value={formData.onlineUrl}
                      onChange={e => set('onlineUrl', e.target.value)}
                      placeholder="e.g. https://meet.hssuk.org/your-event"
                      disabled={blocked}
                      className={errCls('onlineUrl')}
                    />
                    <ErrorText>{touched && errors.onlineUrl}</ErrorText>
                  </FormField>
                )}
              </div>
            </Card>
          )}

          {/* ── Target Audience — matches EventCreate exactly ── */}
          {activeTab === 'audience' && (
            <div className="space-y-5">

              <Card title="Scope">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Required — consciously choose "All" or specific values for each. Nothing is targeted by default.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div ref={el => { fieldRefs.current.targetRegions = el; }}>
                    <MultiSelectField
                      label="Vibhag"
                      options={regionOptions}
                      selected={formData.targetRegions}
                      disabled={blocked || !scope.showRegionFilter}
                      required
                      error={touched && !!errors.targetRegions}
                      errorMessage={touched ? errors.targetRegions : undefined}
                      onChange={v => {
                        set('targetRegions', v);
                        if (isAllSelected(v)) { set('targetTowns', [ALL_SENTINEL]); set('targetCentres', [ALL_SENTINEL]); }
                        else { set('targetTowns', []); set('targetCentres', []); }
                      }}
                    />
                  </div>
                  <div ref={el => { fieldRefs.current.targetTowns = el; }}>
                    <MultiSelectField
                      label="Nagar"
                      options={townOptions}
                      selected={formData.targetTowns}
                      disabled={blocked || !scope.showTownFilter}
                      required
                      error={touched && !!errors.targetTowns}
                      errorMessage={touched ? errors.targetTowns : undefined}
                      onChange={v => {
                        set('targetTowns', v);
                        set('targetCentres', isAllSelected(v) ? [ALL_SENTINEL] : []);
                      }}
                    />
                  </div>
                  <div ref={el => { fieldRefs.current.targetCentres = el; }}>
                    <MultiSelectField
                      label="Shakha"
                      options={centreOptions}
                      selected={formData.targetCentres}
                      disabled={blocked || !scope.showCentreFilter}
                      required
                      error={touched && !!errors.targetCentres}
                      errorMessage={touched ? errors.targetCentres : undefined}
                      onChange={v => set('targetCentres', v)}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Demographic Filters">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Optional — choose "All" or specific values to narrow the audience, or leave as-is to target everyone within scope.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div ref={el => { fieldRefs.current.filterAgeCategories = el; }}>
                    <MultiSelectField
                      label="Age Category"
                      options={AGE_GROUP_OPTIONS.map(o => o.value)}
                      getLabel={v => AGE_GROUP_OPTIONS.find(o => o.value === v)?.label ?? v}
                      selected={formData.filterAgeCategories}
                      disabled={blocked}
                      error={touched && !!errors.filterAgeCategories}
                      errorMessage={touched ? errors.filterAgeCategories : undefined}
                      onChange={v => set('filterAgeCategories', v as AgeGroup[])}
                    />
                  </div>
                  <FormField className="md:col-span-3">
                    <FormLabel>Specific Age</FormLabel>
                    <div className="flex flex-wrap items-center gap-3">
                      <FormSelect
                        value={formData.specificAgeOperator}
                        disabled={blocked}
                        onChange={e => {
                          const op = e.target.value;
                          set('specificAgeOperator', op);
                          if ((op === '=' || op === '>' || op === '<') && !formData.specificAgeAsAtDate) {
                            set('specificAgeAsAtDate', new Date().toISOString().split('T')[0]);
                          }
                        }}
                        className="w-40"
                      >
                        <option value="">Not filtered</option>
                        <option value="=">Equals to</option>
                        <option value=">">Greater than or equal to</option>
                        <option value="<">Less than or equal to</option>
                        <option value="between">Between</option>
                      </FormSelect>
                      {(formData.specificAgeOperator === '=' || formData.specificAgeOperator === '>' || formData.specificAgeOperator === '<') && (
                        <>
                          <FormInput
                            type="number"
                            min="0"
                            value={formData.specificAgeValue}
                            onChange={e => set('specificAgeValue', e.target.value)}
                            disabled={blocked}
                            placeholder="Age"
                            className="w-32"
                          />
                          <span className="text-sm text-neutral-400">as at</span>
                          <FormInput
                            type="date"
                            value={formData.specificAgeAsAtDate}
                            onChange={e => set('specificAgeAsAtDate', e.target.value)}
                            disabled={blocked}
                            className="w-44"
                          />
                        </>
                      )}
                      {formData.specificAgeOperator === 'between' && (
                        <>
                          <FormInput
                            type="date"
                            value={formData.specificAgeFrom}
                            onChange={e => set('specificAgeFrom', e.target.value)}
                            disabled={blocked}
                            className="w-44"
                          />
                          <span className="text-sm text-neutral-400">to</span>
                          <FormInput
                            type="date"
                            value={formData.specificAgeTo}
                            onChange={e => set('specificAgeTo', e.target.value)}
                            disabled={blocked}
                            className="w-44"
                          />
                          {formData.specificAgeFrom && formData.specificAgeTo && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                              Age {getAge(formData.specificAgeTo)} – {getAge(formData.specificAgeFrom)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </FormField>
                  <div ref={el => { fieldRefs.current.filterGenders = el; }}>
                    <MultiSelectField
                      label="Gender"
                      options={['male', 'female']}
                      getLabel={v => v === 'male' ? 'Male' : 'Female'}
                      selected={formData.filterGenders}
                      disabled={blocked}
                      error={touched && !!errors.filterGenders}
                      errorMessage={touched ? errors.filterGenders : undefined}
                      onChange={v => set('filterGenders', v as ('male' | 'female')[])}
                    />
                  </div>
                  <div ref={el => { fieldRefs.current.filterResponsibilityLevels = el; }}>
                    <MultiSelectField
                      label="Responsibility Level"
                      options={[...RESPONSIBILITY_LEVEL_OPTIONS]}
                      selected={formData.filterResponsibilityLevels}
                      disabled={blocked}
                      error={touched && !!errors.filterResponsibilityLevels}
                      errorMessage={touched ? errors.filterResponsibilityLevels : undefined}
                      onChange={v => set('filterResponsibilityLevels', v)}
                    />
                  </div>
                  <div ref={el => { fieldRefs.current.filterJobTitles = el; }}>
                    <MultiSelectField
                      label="Sangh Responsibility"
                      options={ROLE_TYPE_OPTIONS}
                      selected={formData.filterJobTitles}
                      disabled={blocked}
                      error={touched && !!errors.filterJobTitles}
                      errorMessage={touched ? errors.filterJobTitles : undefined}
                      onChange={v => set('filterJobTitles', v)}
                    />
                  </div>
                  <div ref={el => { fieldRefs.current.filterResponsibilityTypes = el; }}>
                    <MultiSelectField
                      label="Responsibility Type"
                      options={[...RESPONSIBILITY_TYPE_OPTIONS]}
                      selected={formData.filterResponsibilityTypes}
                      disabled={blocked}
                      error={touched && !!errors.filterResponsibilityTypes}
                      errorMessage={touched ? errors.filterResponsibilityTypes : undefined}
                      onChange={v => set('filterResponsibilityTypes', v)}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Target Specific Members">
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={formData.targetSpecificOnly}
                      onChange={e => set('targetSpecificOnly', e.target.checked)}
                      disabled={blocked}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Invite specific members only
                    </span>
                  </label>
                  {formData.targetSpecificOnly && (
                    <FormField>
                      <FormLabel required>Select Members</FormLabel>
                      <div ref={el => { fieldRefs.current.targetMemberIds = el; }}>
                        <MemberMultiSelect
                          selectedIds={formData.targetMemberIds}
                          onChange={ids => set('targetMemberIds', ids)}
                          disabled={blocked}
                          members={scopedMembers}
                        />
                      </div>
                      <ErrorText>{touched && errors.targetMemberIds}</ErrorText>
                    </FormField>
                  )}
                </div>
              </Card>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 px-1">
                This Karyakram will be available to <strong className="text-neutral-900 dark:text-white">{matchingMemberCount.toLocaleString()}</strong> member{matchingMemberCount !== 1 ? 's' : ''} based on the audience and targeting filters above.
              </p>
            </div>
          )}

          {/* ── Payment Type ── */}
          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Payment Type">
                <div className="space-y-4">
                  <FormField>
                    <FormLabel required>Payment Type</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.paymentType = el; }}
                      value={formData.paymentType}
                      onChange={e => set('paymentType', e.target.value)}
                      disabled={blocked}
                      className={errCls('paymentType')}
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </FormSelect>
                    <ErrorText>{touched && errors.paymentType}</ErrorText>
                  </FormField>
                  {formData.paymentType === 'paid' && (
                    <div ref={el => { fieldRefs.current.priceCategories = el; }}>
                      <FormLabel required>Ticket Types</FormLabel>
                      <PriceCategoriesEditor
                        categories={formData.priceCategories}
                        onChange={cats => set('priceCategories', cats)}
                        disabled={blocked}
                      />
                      <ErrorText>{touched && errors.priceCategories}</ErrorText>
                    </div>
                  )}
                  {formData.paymentType === 'paid' && (
                    <FormField>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormInput
                        ref={el => { fieldRefs.current.couponCode = el; }}
                        value={formData.couponCode}
                        onChange={e => set('couponCode', e.target.value)}
                        placeholder="e.g. PRACHARAK2026"
                        disabled={blocked}
                        className={errCls('couponCode')}
                      />
                      <ErrorText>{touched && errors.couponCode}</ErrorText>
                      <p className="text-xs text-neutral-400 mt-1">
                        Optional. Must match an active code from HSS UK Setup {'>'} Lists and Options {'>'} Karyakrams {'>'} Coupons. Share it manually with whoever should register free — it overrides the price to £0 for them.
                      </p>
                    </FormField>
                  )}
                </div>
              </Card>

              <Card title="Donation">
                <div className="space-y-4">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.donationEnabled}
                      onChange={e => set('donationEnabled', e.target.checked)}
                      disabled={blocked}
                      className="rounded border-neutral-300 dark:border-neutral-700"
                    />
                    Enable Donation Option
                  </label>
                  {formData.donationEnabled && (
                    <>
                      <p className="text-xs text-neutral-400 -mt-2">
                        If enabled, members can optionally donate a custom amount during registration — independent of ticket price.
                      </p>
                      <FormField>
                        <FormLabel>Description</FormLabel>
                        <FormInput
                          value={formData.donationDescription}
                          onChange={e => set('donationDescription', e.target.value)}
                          placeholder="Short description shown to members before the donation option (optional)"
                          disabled={blocked}
                        />
                      </FormField>
                      <FormField>
                        <FormLabel>Donation Amounts</FormLabel>
                        <DonationAmountsEditor
                          amounts={formData.donationAmounts}
                          onChange={amts => set('donationAmounts', amts)}
                          disabled={blocked}
                        />
                      </FormField>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ── Additional Questions ── */}
          {activeTab === 'questions' && (
            <Card title="Additional Questions">
              <CustomQuestionsEditor
                questions={formData.customQuestions}
                onChange={qs => set('customQuestions', qs)}
              />
            </Card>
          )}

          {/* ── Terms & Conditions ── */}
          {activeTab === 'terms' && (
            <Card title="Terms & Conditions">
              <TermsSectionsEditor
                sections={formData.termsSections}
                onChange={sections => set('termsSections', sections)}
                disabled={blocked}
              />
            </Card>
          )}

          {/* ── Event Confirmation ── */}
          {activeTab === 'confirmation' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <Card title="Confirmation Email">
                  <div className="space-y-4">
                    <FormField>
                      <FormLabel required>Subject</FormLabel>
                      <FormInput
                        value={formData.confirmationSubject}
                        onChange={e => set('confirmationSubject', e.target.value)}
                        placeholder="e.g. Your registration for {{event_name}} is confirmed"
                        disabled={blocked}
                      />
                    </FormField>

                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        Click a variable to copy it, then paste it into the Subject or Description.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {EVENT_CONFIRMATION_VARIABLES.map(v => (
                          <button
                            type="button"
                            key={v.token}
                            title={v.description}
                            onClick={() => { navigator.clipboard.writeText(v.token); toast.success(`Copied ${v.token}`); }}
                            disabled={blocked}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-semibold rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-primary-600 dark:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Copy className="w-3 h-3" /> {v.token}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField>
                      <FormLabel>Description</FormLabel>
                      <RichTextEditor
                        value={formData.confirmationMessage}
                        onChange={html => set('confirmationMessage', html)}
                        placeholder="Write the confirmation email body…"
                        minHeight="260px"
                        maxHeight="520px"
                        disabled={blocked}
                      />
                    </FormField>
                  </div>
                </Card>
              </div>

              <div className="xl:col-span-1">
                <Card title="Karyakram Confirmation">
                  <FormField>
                    <FormLabel>Description</FormLabel>
                    <RichTextEditor
                      value={formData.confirmationMessage}
                      onChange={html => set('confirmationMessage', html)}
                      placeholder="Write the confirmation email body…"
                      minHeight="260px"
                      maxHeight="520px"
                      disabled={blocked}
                    />
                  </FormField>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
