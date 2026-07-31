import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Users as UsersIcon,
  MapPin,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  Globe,
  Ticket,
  ListChecks,
  ScrollText,
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormSection, FormField, FormLabel, FormInput, FormSelect, ErrorText, RichTextEditor } from './hb/common';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import { Event, EventPriceCategory, EventCustomQuestion, EVENT_TERMS_AND_CONDITIONS, mockCoupons } from '../../mockAPI/eventsData';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'sonner';
import {
  PriceCategoriesEditor,
  CustomQuestionsEditor,
  EventImageField,
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

export default function EventEdit({ event, onBack, onSave }: EventEditProps) {
  const blocked = !canModify(event);

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
    paymentType:    event.paymentType as 'paid' | 'free',
    priceCategories: event.priceCategories ?? (event.price ? [{ id: 'PC-1', label: 'Standard', price: event.price }] : []),
    couponCode:     event.couponCode ?? '',
    capacity:       event.capacity ? String(event.capacity) : '',
    waitlistEnabled: event.waitlistEnabled ?? false,
    guestRegistrationEnabled: event.guestRegistrationEnabled ?? false,
    guestPrice: event.guestPrice !== undefined ? String(event.guestPrice) : '',
    customQuestions: event.customQuestions ?? [],
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

  const FIELD_ORDER = ['name', 'venueAddress', 'onlineUrl', 'country', 'region', 'town', 'activityCentre', 'startDate', 'startTime', 'endDate', 'endTime', 'paymentType', 'priceCategories', 'couponCode'];
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
    if (formData.locationType === 'physical' && !formData.venueAddress.trim()) errs.venueAddress = 'Venue address is required for physical events.';
    if (formData.locationType === 'online' && !formData.onlineUrl.trim())      errs.onlineUrl    = 'Online meeting URL is required for online events.';
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
        paymentType:    formData.paymentType,
        price:          formData.paymentType === 'paid' ? formData.priceCategories[0]?.price : undefined,
        priceCategories: formData.paymentType === 'paid' ? formData.priceCategories : undefined,
        couponCode:      formData.paymentType === 'paid' ? (formData.couponCode || undefined) : undefined,
        capacity:       formData.capacity ? parseInt(formData.capacity) : undefined,
        waitlistEnabled: formData.waitlistEnabled,
        guestRegistrationEnabled: formData.guestRegistrationEnabled,
        guestPaymentType: formData.guestRegistrationEnabled ? (formData.guestPrice.trim() ? 'paid' : 'free') : undefined,
        guestPrice: formData.guestRegistrationEnabled && formData.guestPrice.trim() ? (parseFloat(formData.guestPrice) || 0) : undefined,
        customQuestions: formData.customQuestions.length > 0 ? formData.customQuestions : undefined,
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
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
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

        {/* Cutoff warning */}
        {blocked && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-900/40 rounded-lg text-sm text-error-700 dark:text-error-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{event.status === 'completed' ? 'Completed Karyakrams cannot be edited.' : 'Cancelled Karyakrams cannot be edited.'} All fields are locked.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">

            {/* Karyakram Basics */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Calendar className="w-4 h-4 text-primary-600" /> Karyakram Basics
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField span={2 as any}>
                  <FormLabel required>Karyakram Title</FormLabel>
                  <FormInput
                    ref={el => { fieldRefs.current.name = el; }}
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Enter event title"
                    disabled={blocked}
                    className={errCls('name')}
                  />
                  <ErrorText>{touched && errors.name}</ErrorText>
                </FormField>
                <FormField span={2 as any}>
                  <FormLabel>Karyakram Description</FormLabel>
                  <RichTextEditor
                    value={formData.description}
                    onChange={html => set('description', html)}
                    placeholder="Describe the event — purpose, agenda, what to expect…"
                    disabled={blocked}
                  />
                </FormField>
                <FormField>
                  <FormLabel required>Primary Host</FormLabel>
                  <FormInput
                    value={formData.host}
                    onChange={e => set('host', e.target.value)}
                    placeholder="Host name"
                    disabled={blocked}
                  />
                </FormField>
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
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <MapPin className="w-4 h-4 text-primary-600" /> Location
              </div>
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
                    <FormLabel required>Venue Address</FormLabel>
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
                    <FormLabel required>Online Call URL</FormLabel>
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
            </div>

            {/* Target Audience */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <UsersIcon className="w-4 h-4 text-primary-600" /> Target Audience
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sangh Scope</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Optional demographic filters — leave unchecked to target all members within scope.
                  </p>
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
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Clock className="w-4 h-4 text-primary-600" /> Schedule
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Payment */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CreditCard className="w-4 h-4 text-primary-600" /> Payment Type
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
              {formData.paymentType === 'paid' && (
                <div ref={el => { fieldRefs.current.priceCategories = el; }} className="mt-4">
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
                <div className="mt-4">
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
                </div>
              )}
            </div>

            {/* Guest Registration */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Ticket className="w-4 h-4 text-primary-600" /> Guest Registration
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.guestRegistrationEnabled}
                  onChange={e => set('guestRegistrationEnabled', e.target.checked)}
                  disabled={blocked}
                  className="rounded border-neutral-300 dark:border-neutral-700"
                />
                Allow non-members to register via a guest registration link
              </label>
              {formData.guestRegistrationEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField>
                    <FormLabel>Guest Amount</FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
                      <FormInput
                        type="number"
                        value={formData.guestPrice}
                        onChange={e => set('guestPrice', e.target.value)}
                        placeholder="0.00 (leave blank if free)"
                        min="0"
                        step="0.01"
                        disabled={blocked}
                        className="pl-6"
                      />
                    </div>
                  </FormField>
                </div>
              )}
            </div>

            {/* Custom Questions */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <ListChecks className="w-4 h-4 text-primary-600" /> Additional Questions
              </div>
              <CustomQuestionsEditor
                questions={formData.customQuestions}
                onChange={qs => set('customQuestions', qs)}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <ScrollText className="w-4 h-4 text-primary-600" /> Terms &amp; Conditions
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                {EVENT_TERMS_AND_CONDITIONS}
              </p>
            </div>

            {/* Chat Room */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <UsersIcon className="w-4 h-4 text-primary-600" /> Event Controls
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel>Chat Room State</FormLabel>
                  <FormSelect
                    value={formData.chatState}
                    onChange={e => set('chatState', e.target.value)}
                    disabled={blocked}
                  >
                    <option value="active">Active (Enabled)</option>
                    <option value="archived">Archived</option>
                  </FormSelect>
                </FormField>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Admin Policy</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                Modifying event dates will automatically update participants' calendars.
                Changes to location or payment type may trigger participant notifications.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Event Reference</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Karyakram ID</label>
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">{event.id}</code>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Current Status</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{event.status}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Created By</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{event.host}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Last Updated</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatDate(event.lastUpdated)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
