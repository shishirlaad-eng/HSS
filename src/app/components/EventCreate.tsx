import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Globe, MapPin, Ticket, ChevronDown, Search, X, Copy } from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, FormSelect, ErrorText, RichTextEditor } from './hb/common';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup, mockMembers, RESPONSIBILITY_LEVEL_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS } from '../../mockAPI/membersData';
import { Event, EVENT_TERMS_AND_CONDITIONS, EVENT_CONFIRMATION_VARIABLES, DEFAULT_CONFIRMATION_SUBJECT, DEFAULT_CONFIRMATION_MESSAGE, mockCoupons } from '../../mockAPI/eventsData';
import { toast } from 'sonner';
import { useRoleScope } from '../contexts/RoleScopeContext';
import {
  PriceCategoriesEditor,
  CustomQuestionsEditor,
  EventImageField,
  TermsSectionsEditor,
  DonationAmountsEditor,
  AGE_GROUP_OPTIONS,
} from './EventFormFields';

interface EventCreateProps {
  onBack: () => void;
  onSave: (data: Partial<Event>) => void;
  onPublish?: (data: Partial<Event>) => void;
  // When set, the form starts pre-filled with this event's details (Clone Event) —
  // venue is collapsed into Address Line 1 since Event only stores the composed
  // string, not the structured fields the form edits.
  cloneFrom?: Event;
}

type CreateTab = 'basics' | 'location' | 'audience' | 'payment' | 'questions' | 'terms' | 'confirmation';

const TABS: { id: CreateTab; label: string }[] = [
  { id: 'basics',       label: 'Karyakram Basics'     },
  { id: 'location',     label: 'Location'             },
  { id: 'audience',     label: 'Target Audience'      },
  { id: 'payment',      label: 'Payment Type'         },
  { id: 'questions',    label: 'Additional Questions' },
  { id: 'terms',        label: 'Terms & Conditions'   },
  { id: 'confirmation', label: 'Event Confirmation'   },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  imageUrl: '',
  locationType: 'physical' as 'physical' | 'online',
  venuePostCode: '',
  venueSelectedAddress: '',
  venueBuildingName: '',
  venueAddressLine1: '',
  venueAddressLine2: '',
  venueTownCity: '',
  onlineUrl: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  registrationStartDate: '',
  registrationEndDate: '',
  paymentType: 'free' as 'paid' | 'free',
  priceCategories: [] as { id: string; label: string; price: number }[],
  couponCode: '',
  donationEnabled: false,
  donationDescription: '',
  donationAmounts: [] as number[],
  capacity: '',
  waitlistEnabled: false,
  guestRegistrationEnabled: false,
  customQuestions: [] as { id: string; question: string; required: boolean }[],
  filterAgeCategories: [] as AgeGroup[],
  filterGenders: [] as ('male' | 'female')[],
  filterJobTitles: [] as string[],
  filterResponsibilityLevels: [] as string[],
  filterResponsibilityTypes: [] as string[],
  targetSpecificOnly: false,
  targetMemberIds: [] as string[],
  targetRegions: [] as string[],
  targetTowns: [] as string[],
  targetCentres: [] as string[],
  termsSections: [{ id: 'TS-1', title: 'Terms and Conditions', description: EVENT_TERMS_AND_CONDITIONS }] as { id: string; title: string; description: string }[],
  confirmationSubject: DEFAULT_CONFIRMATION_SUBJECT,
  confirmationMessage: DEFAULT_CONFIRMATION_MESSAGE,
};

// Cascade options — empty selection OR every option selected both mean "All" and widen to the full available set
const isFullSelection = (sel: string[], opts: string[]) => sel.length === 0 || sel.length >= opts.length;

function findCountryForRegion(region: string): string {
  const entry = Object.entries(MASTERS_CASCADE.regions).find(([, regions]) => (regions as string[]).includes(region));
  return entry?.[0] ?? MASTERS_CASCADE.countries[0];
}

// Karyakram scope (country/region/town/activityCentre) still drives admin
// ownership/visibility (shared filterByScope, same as Members/Sessions/Logs) —
// it's derived from the multi-select audience targeting rather than picked
// directly, falling back to the creating admin's own scope when the target is
// left as "All".
function deriveOwnerScope(f: typeof EMPTY_FORM, creatorScope: { country?: string; region?: string; town?: string; centre?: string }) {
  const region = f.targetRegions.length === 1 ? f.targetRegions[0] : (creatorScope.region ?? f.targetRegions[0] ?? '');
  const town   = f.targetTowns.length === 1   ? f.targetTowns[0]   : (creatorScope.town   ?? f.targetTowns[0]   ?? '');
  const centre = f.targetCentres.length === 1 ? f.targetCentres[0] : (creatorScope.centre ?? f.targetCentres[0] ?? '');
  const country = creatorScope.country ?? (region ? findCountryForRegion(region) : MASTERS_CASCADE.countries[0]);
  return { country, region, town, activityCentre: centre };
}

const composeVenueAddress = (f: typeof EMPTY_FORM) =>
  [f.venueBuildingName, f.venueAddressLine1, f.venueAddressLine2, f.venueTownCity, f.venuePostCode]
    .map(s => s.trim()).filter(Boolean).join(', ');

// Reverse-maps a saved Event back into the create-form shape, for "Clone Event".
// Venue address can't be split back into its structured fields (Event only
// stores the composed string), so the whole thing lands in Address Line 1.
function formStateFromEvent(event: Event): typeof EMPTY_FORM {
  return {
    ...EMPTY_FORM,
    name: `${event.name} (Copy)`,
    description: event.description ?? '',
    imageUrl: event.imageUrl ?? '',
    locationType: event.locationType,
    venueAddressLine1: event.venueAddress ?? '',
    onlineUrl: event.onlineUrl ?? '',
    startDate: event.startDate.split('T')[0],
    startTime: event.startDate.split('T')[1]?.substring(0, 5) ?? '',
    endDate: event.endDate.split('T')[0],
    endTime: event.endDate.split('T')[1]?.substring(0, 5) ?? '',
    registrationStartDate: event.registrationStartDate ?? '',
    registrationEndDate: event.registrationEndDate ?? '',
    paymentType: event.paymentType,
    priceCategories: event.priceCategories ?? (event.price ? [{ id: 'PC-1', label: 'Standard', price: event.price }] : []),
    couponCode: event.couponCode ?? '',
    donationEnabled: event.donationEnabled ?? false,
    donationDescription: event.donationDescription ?? '',
    donationAmounts: event.donationAmounts ?? [],
    capacity: event.capacity ? String(event.capacity) : '',
    waitlistEnabled: event.waitlistEnabled ?? false,
    guestRegistrationEnabled: event.guestRegistrationEnabled ?? false,
    customQuestions: event.customQuestions ?? [],
    filterAgeCategories: event.filterAgeCategories ?? [],
    filterGenders: event.filterGenders ?? [],
    filterJobTitles: event.filterJobTitles ?? [],
    filterResponsibilityLevels: event.filterResponsibilityLevels ?? [],
    filterResponsibilityTypes: event.filterResponsibilityTypes ?? [],
    targetSpecificOnly: (event.targetMemberIds?.length ?? 0) > 0,
    targetMemberIds: event.targetMemberIds ?? [],
    targetRegions: event.targetRegions ?? [],
    targetTowns: event.targetTowns ?? [],
    targetCentres: event.targetCentres ?? [],
    termsSections: event.termsSections ?? (event.termsAndConditions
      ? [{ id: 'TS-1', title: 'Terms and Conditions', description: event.termsAndConditions }]
      : [{ id: 'TS-1', title: 'Terms and Conditions', description: EVENT_TERMS_AND_CONDITIONS }]),
    confirmationSubject: event.confirmationSubject ?? DEFAULT_CONFIRMATION_SUBJECT,
    confirmationMessage: event.confirmationMessage ?? DEFAULT_CONFIRMATION_MESSAGE,
  };
}

// ── Mock postcode lookup (matches the pattern used on the member address form) ─
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

// ── Reusable card matching profile InfoSection style ──────────────────────────
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

// ── Multi-select dropdown (matches the Suchana Audience & Targeting pattern) ──
function MultiSelectField({
  label,
  options,
  selected,
  onChange,
  required,
  disabled,
  allLabel = 'All',
  getLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  allLabel?: string;
  getLabel?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fmt = (v: string) => getLabel ? getLabel(v) : v;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAll = selected.length === 0 || (options.length > 0 && selected.length === options.length);
  const displayLabel = isAll ? allLabel : selected.length === 1 ? fmt(selected[0]) : `${selected.length} selected`;

  return (
    <FormField>
      <FormLabel required={required}>{label}</FormLabel>
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className="w-full h-10 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={isAll ? 'text-neutral-500 dark:text-neutral-400' : ''}>{displayLabel}</span>
          <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        </button>
        {open && !disabled && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-56 overflow-y-auto slim-scroll">
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer border-b border-neutral-100 dark:border-neutral-800">
              <input type="checkbox" checked={isAll} onChange={() => onChange(options)} className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600" />
              {allLabel}
            </label>
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onChange(selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt])}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                />
                {fmt(opt)}
              </label>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ── Searchable multi-select for targeting specific members ────────────────────
function MemberMultiSelect({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase().trim();
  const matches = (q
    ? mockMembers.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    : mockMembers
  ).slice(0, 30);

  const selectedMembers = mockMembers.filter(m => selectedIds.includes(m.id));

  return (
    <div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full h-10 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <span className={selectedIds.length === 0 ? 'text-neutral-500 dark:text-neutral-400' : ''}>
            {selectedIds.length === 0 ? 'Search and select members…' : `${selectedIds.length} member${selectedIds.length !== 1 ? 's' : ''} selected`}
          </span>
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        </button>
        {open && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or member ID…"
                  className="w-full pl-8 pr-2 h-8 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto slim-scroll">
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-xs text-center text-neutral-400">No members found</p>
              ) : matches.map(m => (
                <label key={m.id} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id)}
                    onChange={() => onChange(selectedIds.includes(m.id) ? selectedIds.filter(id => id !== m.id) : [...selectedIds, m.id])}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                  />
                  <span className="flex-1 min-w-0 truncate">{m.name}</span>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{m.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedMembers.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 text-xs text-primary-700 dark:text-primary-300">
              {m.name}
              <button type="button" onClick={() => onChange(selectedIds.filter(id => id !== m.id))} className="hover:text-primary-900 dark:hover:text-primary-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventCreate({ onBack, onSave, onPublish, cloneFrom }: EventCreateProps) {
  const { scope } = useRoleScope();
  const [formData, setFormData] = useState(() =>
    cloneFrom ? formStateFromEvent(cloneFrom) : {
      ...EMPTY_FORM,
      targetRegions: scope.showRegionFilter ? [] : (scope.region ? [scope.region] : []),
      targetTowns:   scope.showTownFilter   ? [] : (scope.town   ? [scope.town]   : []),
      targetCentres: scope.showCentreFilter ? [] : (scope.centre ? [scope.centre] : []),
    }
  );
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched]   = useState(false);
  const [activeTab, setActiveTab] = useState<CreateTab>('basics');
  const [isDraft, setIsDraft]   = useState(false);

  const regionOptions = Object.values(MASTERS_CASCADE.regions).flat();
  const townOptions    = !isFullSelection(formData.targetRegions, regionOptions)
    ? formData.targetRegions.flatMap(r => MASTERS_CASCADE.towns[r] ?? [])
    : Object.values(MASTERS_CASCADE.towns).flat();
  const centreOptions  = !isFullSelection(formData.targetTowns, townOptions)
    ? formData.targetTowns.flatMap(t => MASTERS_CASCADE.centres[t] ?? [])
    : Object.values(MASTERS_CASCADE.centres).flat();

  const set = (field: string, value: any) => {
    if (isDraft) setIsDraft(false);
    setFormData(prev => {
      const next: any = { ...prev, [field]: value };
      if (field === 'venuePostCode') { next.venueSelectedAddress = ''; }
      return next;
    });
  };

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const FIELD_ORDER = ['name', 'startDate', 'startTime', 'endDate', 'endTime', 'targetMemberIds', 'paymentType', 'priceCategories', 'couponCode'];
  const FIELD_TAB: Record<string, CreateTab> = {
    name: 'basics', startDate: 'basics', startTime: 'basics', endDate: 'basics', endTime: 'basics',
    targetMemberIds: 'audience',
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
    if (!formData.startDate)           errs.startDate      = 'This field is required.';
    if (!formData.startTime)           errs.startTime      = 'This field is required.';
    if (!formData.endDate)             errs.endDate        = 'This field is required.';
    if (!formData.endTime)             errs.endTime        = 'This field is required.';
    if (!formData.paymentType)         errs.paymentType    = 'This field is required.';
    if (formData.paymentType === 'paid' && formData.priceCategories.length === 0) {
      errs.priceCategories = 'Add at least one ticket type for paid Karyakrams.';
    }
    if (formData.paymentType === 'paid' && formData.couponCode.trim()) {
      const valid = mockCoupons.some(c => c.name.toLowerCase() === formData.couponCode.trim().toLowerCase() && c.status === 'active');
      if (!valid) errs.couponCode = 'No active coupon with this code exists. Check HSS UK Setup > Lists and Options > Events > Coupons.';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end   = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) errs.endDate = 'Start Date/Time must be earlier than End Date/Time.';
    }
    setErrors(errs);
    return errs;
  };

  const buildPayload = (status: 'draft' | 'published'): Partial<Event> => {
    const now = new Date().toISOString();
    const ownerScope = deriveOwnerScope(formData, scope);
    return {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      country: ownerScope.country,
      region: ownerScope.region,
      town: ownerScope.town,
      activityCentre: ownerScope.activityCentre,
      locationType: formData.locationType,
      venueAddress: formData.locationType === 'physical' ? composeVenueAddress(formData) : undefined,
      onlineUrl:    formData.locationType === 'online'   ? formData.onlineUrl.trim()    : undefined,
      startDate: `${formData.startDate}T${formData.startTime}:00Z`,
      endDate:   `${formData.endDate}T${formData.endTime}:00Z`,
      registrationStartDate: formData.registrationStartDate || undefined,
      registrationEndDate: formData.registrationEndDate || undefined,
      paymentType: formData.paymentType,
      price: formData.paymentType === 'paid' ? formData.priceCategories[0]?.price : undefined,
      priceCategories: formData.paymentType === 'paid' ? formData.priceCategories : undefined,
      couponCode: formData.paymentType === 'paid' ? (formData.couponCode || undefined) : undefined,
      donationEnabled: formData.donationEnabled,
      donationDescription: formData.donationEnabled ? (formData.donationDescription.trim() || undefined) : undefined,
      donationAmounts: formData.donationEnabled && formData.donationAmounts.length > 0 ? formData.donationAmounts : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      waitlistEnabled: formData.waitlistEnabled,
      guestRegistrationEnabled: formData.guestRegistrationEnabled,
      guestPaymentType: formData.guestRegistrationEnabled ? 'free' : undefined,
      customQuestions: formData.customQuestions.length > 0 ? formData.customQuestions : undefined,
      filterAgeCategories: formData.filterAgeCategories.length > 0 ? formData.filterAgeCategories : undefined,
      filterGenders:       formData.filterGenders.length > 0       ? formData.filterGenders       : undefined,
      filterJobTitles:     formData.filterJobTitles.length > 0     ? formData.filterJobTitles     : undefined,
      filterResponsibilityLevels: formData.filterResponsibilityLevels.length > 0 ? formData.filterResponsibilityLevels : undefined,
      filterResponsibilityTypes:  formData.filterResponsibilityTypes.length > 0  ? formData.filterResponsibilityTypes  : undefined,
      targetRegions: !isFullSelection(formData.targetRegions, regionOptions) ? formData.targetRegions : undefined,
      targetTowns:   !isFullSelection(formData.targetTowns, townOptions)     ? formData.targetTowns   : undefined,
      targetCentres: !isFullSelection(formData.targetCentres, centreOptions) ? formData.targetCentres : undefined,
      targetMemberIds: formData.targetSpecificOnly ? formData.targetMemberIds : undefined,
      termsSections: formData.termsSections.length > 0 ? formData.termsSections : undefined,
      confirmationSubject: formData.confirmationSubject.trim() || undefined,
      confirmationMessage: formData.confirmationMessage.trim() || undefined,
      status,
      createdDate: now,
      lastUpdated: now,
      chatState: 'archived',
      metrics: { going: 0, maybe: 0, notGoing: 0, participantCount: 0, mediaCount: 0 },
    };
  };

  const handleSaveDraft = async () => {
    setTouched(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error('Please fill in all required fields.');
      focusFirstError(errs);
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      onSave(buildPayload('draft'));
      setIsDraft(true);
    } catch {
      toast.error('Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      (onPublish ?? onSave)(buildPayload('published'));
    } catch {
      toast.error('Unable to publish. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={cloneFrom ? 'Clone Karyakram' : 'Create Karyakram'}
        breadcrumbs={[
          { label: 'Karyakrams', onClick: onBack },
          { label: cloneFrom ? 'Clone' : 'Create', current: true },
        ]}
      >
        <div className="flex items-center gap-3">
          <SecondaryButton icon={ArrowLeft} onClick={onBack}>Cancel</SecondaryButton>
          <PrimaryButton icon={Save} onClick={isDraft ? handlePublish : handleSaveDraft} isLoading={isSaving}>
            {isSaving ? 'Saving...' : isDraft ? 'Publish Karyakram' : 'Save as Draft'}
          </PrimaryButton>
        </div>
      </PageHeader>

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
                        className={errCls('name')}
                      />
                      <ErrorText>{touched && errors.name}</ErrorText>
                    </FormField>
                  </div>
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel>Karyakram Description</FormLabel>
                      <RichTextEditor
                        value={formData.description}
                        onChange={html => set('description', html)}
                        placeholder="Describe the Karyakram — purpose, agenda, what to expect…"
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
                    />
                    <label className="inline-flex items-center gap-2 mt-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.waitlistEnabled}
                        onChange={e => set('waitlistEnabled', e.target.checked)}
                        className="rounded border-neutral-300 dark:border-neutral-700"
                      />
                      Enable waiting list — allow registration once capacity is full
                    </label>
                  </FormField>
                  <FormField>
                    <FormLabel required>Start Date</FormLabel>
                    <FormInput ref={el => { fieldRefs.current.startDate = el; }} type="date" value={formData.startDate} onChange={e => set('startDate', e.target.value)} className={errCls('startDate')} />
                    <ErrorText>{touched && errors.startDate}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Start Time</FormLabel>
                    <FormInput ref={el => { fieldRefs.current.startTime = el; }} type="time" value={formData.startTime} onChange={e => set('startTime', e.target.value)} className={errCls('startTime')} />
                    <ErrorText>{touched && errors.startTime}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>End Date</FormLabel>
                    <FormInput ref={el => { fieldRefs.current.endDate = el; }} type="date" value={formData.endDate} onChange={e => set('endDate', e.target.value)} className={errCls('endDate')} />
                    <ErrorText>{touched && errors.endDate}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>End Time</FormLabel>
                    <FormInput ref={el => { fieldRefs.current.endTime = el; }} type="time" value={formData.endTime} onChange={e => set('endTime', e.target.value)} className={errCls('endTime')} />
                    <ErrorText>{touched && errors.endTime}</ErrorText>
                  </FormField>
                  <EventImageField value={formData.imageUrl} onChange={v => set('imageUrl', v)} />
                </div>
              </Card>

              <div className="flex flex-col gap-5">
                <Card title="Guest Registration">
                  <div className="space-y-4">
                    <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.guestRegistrationEnabled}
                        onChange={e => set('guestRegistrationEnabled', e.target.checked)}
                        className="rounded border-neutral-300 dark:border-neutral-700"
                      />
                      <Ticket className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      Allow non-members to register via a guest registration link
                    </label>
                  </div>
                </Card>

                <Card title="Registration Window">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Optional — controls when members can register. Leave blank to keep registration open until the Karyakram starts.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField>
                      <FormLabel>Registration Start Date</FormLabel>
                      <FormInput type="date" value={formData.registrationStartDate} onChange={e => set('registrationStartDate', e.target.value)} />
                    </FormField>
                    <FormField>
                      <FormLabel>Registration Close Date</FormLabel>
                      <FormInput type="date" value={formData.registrationEndDate} onChange={e => set('registrationEndDate', e.target.value)} />
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
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
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
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
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
                          className={errCls('venuePostCode')}
                        />
                        <ErrorText>{touched && errors.venuePostCode}</ErrorText>
                      </FormField>
                      <FormField>
                        <FormLabel>Select Address</FormLabel>
                        <FormSelect
                          value={formData.venueSelectedAddress}
                          disabled={formData.venuePostCode.trim().length < 4}
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
                        <FormInput value={formData.venueBuildingName} onChange={e => set('venueBuildingName', e.target.value)} placeholder="Building name" />
                      </FormField>
                      <FormField>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormInput
                          ref={el => { fieldRefs.current.venueAddressLine1 = el; }}
                          value={formData.venueAddressLine1}
                          onChange={e => set('venueAddressLine1', e.target.value)}
                          placeholder="Address line 1"
                          className={errCls('venueAddressLine1')}
                        />
                        <ErrorText>{touched && errors.venueAddressLine1}</ErrorText>
                      </FormField>
                      <FormField>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormInput value={formData.venueAddressLine2} onChange={e => set('venueAddressLine2', e.target.value)} placeholder="Address line 2" />
                      </FormField>
                      <FormField>
                        <FormLabel>Town / City</FormLabel>
                        <FormInput
                          ref={el => { fieldRefs.current.venueTownCity = el; }}
                          value={formData.venueTownCity}
                          onChange={e => set('venueTownCity', e.target.value)}
                          placeholder="Town / City"
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
                        placeholder="e.g. https://meet.hssuk.org/your-karyakram"
                        className={errCls('onlineUrl')}
                      />
                      <ErrorText>{touched && errors.onlineUrl}</ErrorText>
                    </FormField>
                  )}
                </div>
              </Card>
          )}

          {/* ── Target Audience (matches Suchana's Audience & Targeting screen) ── */}
          {activeTab === 'audience' && (
            <div className="space-y-5">
              <Card title="Target Specific Members">
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={formData.targetSpecificOnly}
                      onChange={e => set('targetSpecificOnly', e.target.checked)}
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
                        />
                      </div>
                      <ErrorText>{touched && errors.targetMemberIds}</ErrorText>
                    </FormField>
                  )}
                </div>
              </Card>

              {!formData.targetSpecificOnly && (
                <>
                  <Card title="Scope">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MultiSelectField
                        label="Vibhag"
                        options={regionOptions}
                        selected={formData.targetRegions}
                        disabled={!scope.showRegionFilter}
                        onChange={v => { set('targetRegions', v); set('targetTowns', []); set('targetCentres', []); }}
                      />
                      <MultiSelectField
                        label="Nagar"
                        options={townOptions}
                        selected={formData.targetTowns}
                        disabled={!scope.showTownFilter}
                        onChange={v => { set('targetTowns', v); set('targetCentres', []); }}
                      />
                      <MultiSelectField
                        label="Shakha"
                        options={centreOptions}
                        selected={formData.targetCentres}
                        disabled={!scope.showCentreFilter}
                        onChange={v => set('targetCentres', v)}
                      />
                    </div>
                  </Card>

                  <Card title="Demographic Filters">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      Optional — leave as "All" to target everyone within scope.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MultiSelectField
                        label="Age Category"
                        options={AGE_GROUP_OPTIONS.map(o => o.value)}
                        getLabel={v => AGE_GROUP_OPTIONS.find(o => o.value === v)?.label ?? v}
                        selected={formData.filterAgeCategories}
                        onChange={v => set('filterAgeCategories', v as AgeGroup[])}
                      />
                      <MultiSelectField
                        label="Gender"
                        options={['male', 'female']}
                        getLabel={v => v === 'male' ? 'Male' : 'Female'}
                        selected={formData.filterGenders}
                        onChange={v => set('filterGenders', v as ('male' | 'female')[])}
                      />
                      <MultiSelectField
                        label="Responsibility Level"
                        options={[...RESPONSIBILITY_LEVEL_OPTIONS]}
                        selected={formData.filterResponsibilityLevels}
                        onChange={v => set('filterResponsibilityLevels', v)}
                      />
                      <MultiSelectField
                        label="Sangh Responsibility"
                        options={ROLE_TYPE_OPTIONS}
                        selected={formData.filterJobTitles}
                        onChange={v => set('filterJobTitles', v)}
                      />
                      <MultiSelectField
                        label="Responsibility Type"
                        options={[...RESPONSIBILITY_TYPE_OPTIONS]}
                        selected={formData.filterResponsibilityTypes}
                        onChange={v => set('filterResponsibilityTypes', v)}
                      />
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ── Payment Type ── */}
          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Payment Type">
                <div className="space-y-4">
                  <FormField>
                    <FormLabel required>Payment Type</FormLabel>
                    <FormSelect ref={el => { fieldRefs.current.paymentType = el; }} value={formData.paymentType} onChange={e => set('paymentType', e.target.value)} className={errCls('paymentType')}>
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
                        className={errCls('couponCode')}
                      />
                      <ErrorText>{touched && errors.couponCode}</ErrorText>
                      <p className="text-xs text-neutral-400 mt-1">
                        Optional. Must match an active code from HSS UK Setup {'>'} Lists and Options {'>'} Events {'>'} Coupons. Share it manually with whoever should register free — it overrides the price to £0 for them.
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
                        />
                      </FormField>
                      <FormField>
                        <FormLabel>Donation Amounts</FormLabel>
                        <DonationAmountsEditor
                          amounts={formData.donationAmounts}
                          onChange={amts => set('donationAmounts', amts)}
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
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-semibold rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-primary-600 dark:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors"
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
                      />
                    </FormField>
                  </div>
                </Card>
              </div>

              <div className="xl:col-span-1">
                <Card title="Event Confirmation">
                  <FormField>
                    <FormLabel>Description</FormLabel>
                    <RichTextEditor
                      value={formData.confirmationMessage}
                      onChange={html => set('confirmationMessage', html)}
                      placeholder="Write the confirmation email body…"
                      minHeight="260px"
                      maxHeight="520px"
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
