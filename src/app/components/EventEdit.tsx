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
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import { Event, EVENT_TERMS_AND_CONDITIONS, EVENT_CONFIRMATION_VARIABLES, DEFAULT_CONFIRMATION_SUBJECT, DEFAULT_CONFIRMATION_MESSAGE, mockCoupons } from '../../mockAPI/eventsData';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'sonner';
import {
  PriceCategoriesEditor,
  CustomQuestionsEditor,
  EventImageField,
  TermsSectionsEditor,
  DonationAmountsEditor,
  AGE_GROUP_OPTIONS,
  CheckChip,
  toggleArr,
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

// ── Same tab set as EventCreate, minus Location's structured postcode fields
// and Target Audience's org-wide targeting (Edit works off the event's own
// already-assigned scope, not a fresh targeting selection).
type EditTab = 'basics' | 'location' | 'audience' | 'payment' | 'questions' | 'terms' | 'confirmation';

const TABS: { id: EditTab; label: string }[] = [
  { id: 'basics',       label: 'Karyakram Basics'     },
  { id: 'location',     label: 'Location'             },
  { id: 'audience',     label: 'Target Audience'      },
  { id: 'payment',      label: 'Payment Type'         },
  { id: 'questions',    label: 'Additional Questions' },
  { id: 'terms',        label: 'Terms & Conditions'   },
  { id: 'confirmation', label: 'Event Confirmation'   },
];

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

  const [activeTab, setActiveTab] = useState<EditTab>('basics');

  const [formData, setFormData] = useState({
    name:                event.name,
    description:         event.description ?? '',
    imageUrl:            event.imageUrl ?? '',
    host:                event.host,
    country:        event.country,
    region:         event.region,
    town:           event.town,
    activityCentre: event.activityCentre,
    locationType:   event.locationType,
    venueAddress:   event.venueAddress ?? '',
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
    filterAgeCategories: event.filterAgeCategories ?? [],
    filterGenders:       event.filterGenders ?? [],
    filterJobTitles:     event.filterJobTitles ?? [],
    chatState:      event.chatState as 'active' | 'archived',
  });

  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched]   = useState(false);

  // Cascading dropdown options
  const availableRegions  = formData.country ? (MASTERS_CASCADE.regions[formData.country] ?? []) : [];
  const availableTowns    = formData.region  ? (MASTERS_CASCADE.towns[formData.region]   ?? []) : [];
  const availableCentres  = formData.town    ? (MASTERS_CASCADE.centres[formData.town]   ?? []) : [];

  const set = (field: string, value: any) => {
    setFormData(prev => {
      const next: any = { ...prev, [field]: value };
      if (field === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
      if (field === 'region')  { next.town = ''; next.activityCentre = ''; }
      if (field === 'town')    { next.activityCentre = ''; }
      return next;
    });
  };

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const FIELD_ORDER = ['name', 'country', 'region', 'town', 'activityCentre', 'startDate', 'startTime', 'endDate', 'endTime', 'paymentType', 'priceCategories', 'couponCode'];
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = FIELD_ORDER.find(k => errs[k]);
    const el = firstKey ? fieldRefs.current[firstKey] : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim())         errs.name           = 'This field is required.';
    if (!formData.country)             errs.country        = 'This field is required.';
    if (!formData.region)              errs.region         = 'This field is required.';
    if (!formData.town)                errs.town           = 'This field is required.';
    if (!formData.activityCentre)      errs.activityCentre = 'This field is required.';
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

  const handleSave = async () => {
    setTouched(true);
    if (blocked) {
      toast.error('This event can no longer be edited after it starts.');
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
      const updated: Event = {
        ...event,
        name:           formData.name.trim(),
        description:    formData.description.trim() || undefined,
        imageUrl:       formData.imageUrl || undefined,
        host:           formData.host.trim(),
        country:        formData.country,
        region:         formData.region,
        town:           formData.town,
        activityCentre: formData.activityCentre,
        locationType:   formData.locationType,
        venueAddress:   formData.locationType === 'physical' ? formData.venueAddress.trim() : undefined,
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
        filterAgeCategories: formData.filterAgeCategories.length > 0 ? formData.filterAgeCategories : undefined,
        filterGenders:       formData.filterGenders.length > 0       ? formData.filterGenders       : undefined,
        filterJobTitles:     formData.filterJobTitles.length > 0     ? formData.filterJobTitles     : undefined,
        chatState:      formData.chatState,
        lastUpdated:    new Date().toISOString(),
      };
      if (onSave) {
        onSave(updated);
      } else {
        toast.success('Event updated successfully.');
        onBack();
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
        Event Id: {event.id} · Status: <span className="capitalize">{event.status}</span> · Last updated: {formatDate(event.lastUpdated)}
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
                <Card title="Non-Member Registration">
                  <div className="space-y-4">
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
                </Card>

                <Card title="Approvals">
                  <div className="space-y-4">
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
                </Card>

                <Card title="Check-In">
                  <div className="space-y-4">
                    <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.selfCheckInEnabled}
                        onChange={e => set('selfCheckInEnabled', e.target.checked)}
                        disabled={blocked}
                        className="rounded border-neutral-300 dark:border-neutral-700"
                      />
                      Enable self check-in — members can check themselves in via QR at the venue
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
                  <FormField>
                    <FormLabel>Venue Address</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.venueAddress = el; }}
                      value={formData.venueAddress}
                      onChange={e => set('venueAddress', e.target.value)}
                      placeholder="Enter full venue address"
                      disabled={blocked}
                      className={errCls('venueAddress')}
                    />
                    <ErrorText>{touched && errors.venueAddress}</ErrorText>
                  </FormField>
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

          {/* ── Target Audience ── */}
          {activeTab === 'audience' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Scope">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField>
                    <FormLabel required>Country</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.country = el; }}
                      value={formData.country}
                      onChange={e => set('country', e.target.value)}
                      disabled={blocked}
                      className={errCls('country')}
                    >
                      <option value="">Select Country</option>
                      {MASTERS_CASCADE.countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </FormSelect>
                    <ErrorText>{touched && errors.country}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Vibhag</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.region = el; }}
                      value={formData.region}
                      onChange={e => set('region', e.target.value)}
                      disabled={blocked || !formData.country}
                      className={errCls('region')}
                    >
                      <option value="">Select Vibhag</option>
                      {availableRegions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </FormSelect>
                    <ErrorText>{touched && errors.region}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Nagar</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.town = el; }}
                      value={formData.town}
                      onChange={e => set('town', e.target.value)}
                      disabled={blocked || !formData.region}
                      className={errCls('town')}
                    >
                      <option value="">Select Nagar</option>
                      {availableTowns.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </FormSelect>
                    <ErrorText>{touched && errors.town}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel required>Shakha</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.activityCentre = el; }}
                      value={formData.activityCentre}
                      onChange={e => set('activityCentre', e.target.value)}
                      disabled={blocked || !formData.town}
                      className={errCls('activityCentre')}
                    >
                      <option value="">Select Shakha</option>
                      {availableCentres.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </FormSelect>
                    <ErrorText>{touched && errors.activityCentre}</ErrorText>
                  </FormField>
                </div>
              </Card>

              <Card title="Demographic Filters">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Optional — leave unchecked to target all members within scope.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Age Category</p>
                    <div className="flex flex-wrap gap-2">
                      {AGE_GROUP_OPTIONS.map(({ value, label }) => (
                        <CheckChip
                          key={value}
                          label={label}
                          checked={formData.filterAgeCategories.includes(value)}
                          onChange={() => !blocked && set('filterAgeCategories', toggleArr(formData.filterAgeCategories, value))}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Gender</p>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { value: 'male',   label: 'Male'   },
                        { value: 'female', label: 'Female' },
                      ] as { value: 'male' | 'female'; label: string }[]).map(({ value, label }) => (
                        <CheckChip
                          key={value}
                          label={label}
                          checked={formData.filterGenders.includes(value)}
                          onChange={() => !blocked && set('filterGenders', toggleArr(formData.filterGenders, value))}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Role Type / Job Title</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_TYPE_OPTIONS.map(role => (
                        <CheckChip
                          key={role}
                          label={role}
                          checked={formData.filterJobTitles.includes(role)}
                          onChange={() => !blocked && set('filterJobTitles', toggleArr(formData.filterJobTitles, role))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
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
                <Card title="Event Confirmation">
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
