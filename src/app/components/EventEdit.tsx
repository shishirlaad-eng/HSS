import { useState } from 'react';
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
import { FormSection, FormField, FormLabel, FormInput, FormSelect } from './hb/common';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import { Event, EventPriceCategory, EventCustomQuestion, EVENT_TERMS_AND_CONDITIONS } from '../../mockAPI/eventsData';
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

// Cutoff rule: editing is blocked on/after event start datetime
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);

export default function EventEdit({ event, onBack, onSave }: EventEditProps) {
  const blocked = isPastStart(event);

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
    capacity:       event.capacity ? String(event.capacity) : '',
    guestRegistrationEnabled: event.guestRegistrationEnabled ?? false,
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
      errs.priceCategories = 'Add at least one price category for paid events.';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end   = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) errs.endDate = 'Start Date/Time must be earlier than End Date/Time.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    setTouched(true);
    if (blocked) {
      toast.error('This event can no longer be edited after it starts.');
      return;
    }
    if (!validate()) return;
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
        capacity:       formData.capacity ? parseInt(formData.capacity) : undefined,
        guestRegistrationEnabled: formData.guestRegistrationEnabled,
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
          title="Modify Event"
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
              {isSaving ? 'Saving...' : 'Update'}
            </PrimaryButton>
          </div>
        </PageHeader>

        {/* Cutoff warning */}
        {blocked && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-900/40 rounded-lg text-sm text-error-700 dark:text-error-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This event can no longer be edited after it starts. All fields are locked.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">

            {/* Event Basics */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Calendar className="w-4 h-4 text-primary-600" /> Event Basics
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField span={2 as any}>
                  <FormLabel required>Event Title</FormLabel>
                  <FormInput
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Enter event title"
                    disabled={blocked}
                  />
                  {touched && errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
                </FormField>
                <FormField span={2 as any}>
                  <FormLabel>Event Description</FormLabel>
                  <textarea
                    value={formData.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe the event — purpose, agenda, what to expect…"
                    rows={3}
                    disabled={blocked}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                      value={formData.venueAddress}
                      onChange={e => set('venueAddress', e.target.value)}
                      placeholder="Enter full venue address"
                      disabled={blocked}
                    />
                    {touched && errors.venueAddress && <p className="text-xs text-error-600 mt-1">{errors.venueAddress}</p>}
                  </FormField>
                ) : (
                  <FormField>
                    <FormLabel required>Online Call URL</FormLabel>
                    <FormInput
                      value={formData.onlineUrl}
                      onChange={e => set('onlineUrl', e.target.value)}
                      placeholder="e.g. https://meet.hssuk.org/your-event"
                      disabled={blocked}
                    />
                    {touched && errors.onlineUrl && <p className="text-xs text-error-600 mt-1">{errors.onlineUrl}</p>}
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
                        value={formData.country}
                        onChange={e => set('country', e.target.value)}
                        disabled={blocked}
                      >
                        <option value="">Select Country</option>
                        {MASTERS_CASCADE.countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </FormSelect>
                      {touched && errors.country && <p className="text-xs text-error-600 mt-1">{errors.country}</p>}
                    </FormField>
                    <FormField>
                      <FormLabel required>Vibhaag</FormLabel>
                      <FormSelect
                        value={formData.region}
                        onChange={e => set('region', e.target.value)}
                        disabled={blocked || !formData.country}
                      >
                        <option value="">Select Vibhaag</option>
                        {availableRegions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </FormSelect>
                      {touched && errors.region && <p className="text-xs text-error-600 mt-1">{errors.region}</p>}
                    </FormField>
                    <FormField>
                      <FormLabel required>Nagar</FormLabel>
                      <FormSelect
                        value={formData.town}
                        onChange={e => set('town', e.target.value)}
                        disabled={blocked || !formData.region}
                      >
                        <option value="">Select Nagar</option>
                        {availableTowns.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </FormSelect>
                      {touched && errors.town && <p className="text-xs text-error-600 mt-1">{errors.town}</p>}
                    </FormField>
                    <FormField>
                      <FormLabel required>Shakha</FormLabel>
                      <FormSelect
                        value={formData.activityCentre}
                        onChange={e => set('activityCentre', e.target.value)}
                        disabled={blocked || !formData.town}
                      >
                        <option value="">Select Shakha</option>
                        {availableCentres.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </FormSelect>
                      {touched && errors.activityCentre && <p className="text-xs text-error-600 mt-1">{errors.activityCentre}</p>}
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
                    type="date"
                    value={formData.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    disabled={blocked}
                  />
                  {touched && errors.startDate && <p className="text-xs text-error-600 mt-1">{errors.startDate}</p>}
                </FormField>
                <FormField>
                  <FormLabel required>Start Time</FormLabel>
                  <FormInput
                    type="time"
                    value={formData.startTime}
                    onChange={e => set('startTime', e.target.value)}
                    disabled={blocked}
                  />
                  {touched && errors.startTime && <p className="text-xs text-error-600 mt-1">{errors.startTime}</p>}
                </FormField>
                <FormField>
                  <FormLabel required>End Date</FormLabel>
                  <FormInput
                    type="date"
                    value={formData.endDate}
                    onChange={e => set('endDate', e.target.value)}
                    disabled={blocked}
                  />
                  {touched && errors.endDate && <p className="text-xs text-error-600 mt-1">{errors.endDate}</p>}
                </FormField>
                <FormField>
                  <FormLabel required>End Time</FormLabel>
                  <FormInput
                    type="time"
                    value={formData.endTime}
                    onChange={e => set('endTime', e.target.value)}
                    disabled={blocked}
                  />
                  {touched && errors.endTime && <p className="text-xs text-error-600 mt-1">{errors.endTime}</p>}
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
                    value={formData.paymentType}
                    onChange={e => set('paymentType', e.target.value)}
                    disabled={blocked}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </FormSelect>
                  {touched && errors.paymentType && <p className="text-xs text-error-600 mt-1">{errors.paymentType}</p>}
                </FormField>
              </div>
              {formData.paymentType === 'paid' && (
                <div className="mt-4">
                  <FormLabel required>Price Categories</FormLabel>
                  <PriceCategoriesEditor
                    categories={formData.priceCategories}
                    onChange={cats => set('priceCategories', cats)}
                  />
                  {touched && errors.priceCategories && <p className="text-xs text-error-600 mt-1">{errors.priceCategories}</p>}
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
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Event ID</label>
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
                    {new Date(event.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
