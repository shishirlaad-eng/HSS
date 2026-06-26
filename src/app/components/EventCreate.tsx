import { useState } from 'react';
import { ArrowLeft, Save, Globe, MapPin, Ticket } from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, FormSelect } from './hb/common';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import { Event, EVENT_TERMS_AND_CONDITIONS } from '../../mockAPI/eventsData';
import { toast } from 'sonner';
import {
  PriceCategoriesEditor,
  CustomQuestionsEditor,
  EventImageField,
  AGE_GROUP_OPTIONS,
  CheckChip,
  toggleArr,
} from './EventFormFields';

interface EventCreateProps {
  onBack: () => void;
  onSave: (data: Partial<Event>) => void;
  onPublish?: (data: Partial<Event>) => void;
}

type CreateTab = 'basics' | 'location' | 'audience' | 'payment' | 'questions' | 'terms';

const TABS: { id: CreateTab; label: string }[] = [
  { id: 'basics',    label: 'Karyakram Basics'     },
  { id: 'location',  label: 'Location'             },
  { id: 'audience',  label: 'Target Audience'      },
  { id: 'payment',   label: 'Payment Type'         },
  { id: 'questions', label: 'Additional Questions' },
  { id: 'terms',     label: 'Terms & Conditions'   },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  imageUrl: '',
  country: '',
  region: '',
  town: '',
  activityCentre: '',
  locationType: 'physical' as 'physical' | 'online',
  venueAddress: '',
  onlineUrl: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  paymentType: 'free' as 'paid' | 'free',
  priceCategories: [] as { id: string; label: string; price: number }[],
  capacity: '',
  guestRegistrationEnabled: false,
  customQuestions: [] as { id: string; question: string; required: boolean }[],
  filterAgeCategories: [] as AgeGroup[],
  filterGenders: [] as ('male' | 'female')[],
  filterJobTitles: [] as string[],
};

// ── Reusable card matching profile InfoSection style ──────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-4">
        {children}
      </div>
    </div>
  );
}

export default function EventCreate({ onBack, onSave, onPublish }: EventCreateProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched]   = useState(false);
  const [activeTab, setActiveTab] = useState<CreateTab>('basics');
  const [isDraft, setIsDraft]   = useState(false);

  const availableRegions = formData.country ? (MASTERS_CASCADE.regions[formData.country] ?? []) : [];
  const availableTowns   = formData.region  ? (MASTERS_CASCADE.towns[formData.region]   ?? []) : [];
  const availableCentres = formData.town    ? (MASTERS_CASCADE.centres[formData.town]   ?? []) : [];

  const set = (field: string, value: any) => {
    if (isDraft) setIsDraft(false);
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
    if (formData.locationType === 'physical' && !formData.venueAddress.trim()) errs.venueAddress = 'Venue address is required for physical Karyakrams.';
    if (formData.locationType === 'online' && !formData.onlineUrl.trim())      errs.onlineUrl    = 'Online meeting URL is required for online Karyakrams.';
    if (!formData.startDate)           errs.startDate      = 'This field is required.';
    if (!formData.startTime)           errs.startTime      = 'This field is required.';
    if (!formData.endDate)             errs.endDate        = 'This field is required.';
    if (!formData.endTime)             errs.endTime        = 'This field is required.';
    if (!formData.paymentType)         errs.paymentType    = 'This field is required.';
    if (formData.paymentType === 'paid' && formData.priceCategories.length === 0) {
      errs.priceCategories = 'Add at least one price category for paid Karyakrams.';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end   = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) errs.endDate = 'Start Date/Time must be earlier than End Date/Time.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = (status: 'draft' | 'published'): Partial<Event> => {
    const now = new Date().toISOString();
    return {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      country: formData.country,
      region: formData.region,
      town: formData.town,
      activityCentre: formData.activityCentre,
      locationType: formData.locationType,
      venueAddress: formData.locationType === 'physical' ? formData.venueAddress.trim() : undefined,
      onlineUrl:    formData.locationType === 'online'   ? formData.onlineUrl.trim()    : undefined,
      startDate: `${formData.startDate}T${formData.startTime}:00Z`,
      endDate:   `${formData.endDate}T${formData.endTime}:00Z`,
      paymentType: formData.paymentType,
      price: formData.paymentType === 'paid' ? formData.priceCategories[0]?.price : undefined,
      priceCategories: formData.paymentType === 'paid' ? formData.priceCategories : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      guestRegistrationEnabled: formData.guestRegistrationEnabled,
      customQuestions: formData.customQuestions.length > 0 ? formData.customQuestions : undefined,
      filterAgeCategories: formData.filterAgeCategories.length > 0 ? formData.filterAgeCategories : undefined,
      filterGenders:       formData.filterGenders.length > 0       ? formData.filterGenders       : undefined,
      filterJobTitles:     formData.filterJobTitles.length > 0     ? formData.filterJobTitles     : undefined,
      status,
      createdDate: now,
      lastUpdated: now,
      chatState: 'archived',
      metrics: { going: 0, maybe: 0, notGoing: 0, participantCount: 0, mediaCount: 0 },
    };
  };

  const handleSaveDraft = async () => {
    setTouched(true);
    if (!validate()) return;
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
        title="Create Karyakram"
        breadcrumbs={[
          { label: 'Karyakrams', onClick: onBack },
          { label: 'Create', current: true },
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

          {/* ── Karyakram Basics + Schedule ── */}
          {activeTab === 'basics' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Karyakram Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel required>Karyakram Title</FormLabel>
                      <FormInput
                        value={formData.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Enter Karyakram title"
                      />
                      {touched && errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
                    </FormField>
                  </div>
                  <div className="md:col-span-2">
                    <FormField>
                      <FormLabel>Karyakram Description</FormLabel>
                      <textarea
                        value={formData.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Describe the Karyakram — purpose, agenda, what to expect…"
                        rows={3}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                  </FormField>
                  <EventImageField value={formData.imageUrl} onChange={v => set('imageUrl', v)} />
                </div>
              </Card>

              <Card title="Schedule">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField>
                    <FormLabel required>Start Date</FormLabel>
                    <FormInput type="date" value={formData.startDate} onChange={e => set('startDate', e.target.value)} />
                    {touched && errors.startDate && <p className="text-xs text-error-600 mt-1">{errors.startDate}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>Start Time</FormLabel>
                    <FormInput type="time" value={formData.startTime} onChange={e => set('startTime', e.target.value)} />
                    {touched && errors.startTime && <p className="text-xs text-error-600 mt-1">{errors.startTime}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>End Date</FormLabel>
                    <FormInput type="date" value={formData.endDate} onChange={e => set('endDate', e.target.value)} />
                    {touched && errors.endDate && <p className="text-xs text-error-600 mt-1">{errors.endDate}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>End Time</FormLabel>
                    <FormInput type="time" value={formData.endTime} onChange={e => set('endTime', e.target.value)} />
                    {touched && errors.endTime && <p className="text-xs text-error-600 mt-1">{errors.endTime}</p>}
                  </FormField>
                </div>
              </Card>
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
                    <FormField>
                      <FormLabel required>Venue Address</FormLabel>
                      <FormInput
                        value={formData.venueAddress}
                        onChange={e => set('venueAddress', e.target.value)}
                        placeholder="Enter full venue address"
                      />
                      {touched && errors.venueAddress && <p className="text-xs text-error-600 mt-1">{errors.venueAddress}</p>}
                    </FormField>
                  ) : (
                    <FormField>
                      <FormLabel required>Online Call URL</FormLabel>
                      <FormInput
                        value={formData.onlineUrl}
                        onChange={e => set('onlineUrl', e.target.value)}
                        placeholder="e.g. https://meet.hssuk.org/your-karyakram"
                      />
                      {touched && errors.onlineUrl && <p className="text-xs text-error-600 mt-1">{errors.onlineUrl}</p>}
                    </FormField>
                  )}
                </div>
              </Card>
          )}

          {/* ── Target Audience ── */}
          {activeTab === 'audience' && (
            <div className="space-y-5">
              <Card title="Sangh Scope">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField>
                    <FormLabel required>Country</FormLabel>
                    <FormSelect value={formData.country} onChange={e => set('country', e.target.value)}>
                      <option value="">Select Country</option>
                      {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                    {touched && errors.country && <p className="text-xs text-error-600 mt-1">{errors.country}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>Vibhaag</FormLabel>
                    <FormSelect value={formData.region} onChange={e => set('region', e.target.value)} disabled={!formData.country}>
                      <option value="">Select Vibhaag</option>
                      {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </FormSelect>
                    {touched && errors.region && <p className="text-xs text-error-600 mt-1">{errors.region}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>Nagar</FormLabel>
                    <FormSelect value={formData.town} onChange={e => set('town', e.target.value)} disabled={!formData.region}>
                      <option value="">Select Nagar</option>
                      {availableTowns.map(t => <option key={t} value={t}>{t}</option>)}
                    </FormSelect>
                    {touched && errors.town && <p className="text-xs text-error-600 mt-1">{errors.town}</p>}
                  </FormField>
                  <FormField>
                    <FormLabel required>Shakha</FormLabel>
                    <FormSelect value={formData.activityCentre} onChange={e => set('activityCentre', e.target.value)} disabled={!formData.town}>
                      <option value="">Select Shakha</option>
                      {availableCentres.map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                    {touched && errors.activityCentre && <p className="text-xs text-error-600 mt-1">{errors.activityCentre}</p>}
                  </FormField>
                </div>
              </Card>

              <Card title="Demographic Filters">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Optional — leave unchecked to target all members within scope.
                </p>
                {(() => {
                  const allAges    = AGE_GROUP_OPTIONS.map(o => o.value);
                  const allGenders = ['male', 'female'] as ('male' | 'female')[];
                  const allRoles   = ROLE_TYPE_OPTIONS;
                  const allAgesSelected    = allAges.every(v => formData.filterAgeCategories.includes(v));
                  const allGendersSelected = allGenders.every(v => formData.filterGenders.includes(v));
                  const allRolesSelected   = allRoles.every(v => formData.filterJobTitles.includes(v));
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Age Category</p>
                          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 accent-primary-600"
                              checked={allAgesSelected}
                              onChange={() => set('filterAgeCategories', allAgesSelected ? [] : allAges)}
                            />
                            Select all
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {AGE_GROUP_OPTIONS.map(({ value, label }) => (
                            <CheckChip
                              key={value}
                              label={label}
                              checked={formData.filterAgeCategories.includes(value)}
                              onChange={() => set('filterAgeCategories', toggleArr(formData.filterAgeCategories, value))}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Gender</p>
                          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 accent-primary-600"
                              checked={allGendersSelected}
                              onChange={() => set('filterGenders', allGendersSelected ? [] : allGenders)}
                            />
                            Select all
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {([{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] as { value: 'male' | 'female'; label: string }[]).map(({ value, label }) => (
                            <CheckChip
                              key={value}
                              label={label}
                              checked={formData.filterGenders.includes(value)}
                              onChange={() => set('filterGenders', toggleArr(formData.filterGenders, value))}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Role Type / Job Title</p>
                          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 accent-primary-600"
                              checked={allRolesSelected}
                              onChange={() => set('filterJobTitles', allRolesSelected ? [] : allRoles)}
                            />
                            Select all
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ROLE_TYPE_OPTIONS.map(role => (
                            <CheckChip
                              key={role}
                              label={role}
                              checked={formData.filterJobTitles.includes(role)}
                              onChange={() => set('filterJobTitles', toggleArr(formData.filterJobTitles, role))}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}

          {/* ── Payment Type + Guest Registration ── */}
          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Payment Type">
                <div className="space-y-4">
                  <FormField>
                    <FormLabel required>Payment Type</FormLabel>
                    <FormSelect value={formData.paymentType} onChange={e => set('paymentType', e.target.value)}>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </FormSelect>
                    {touched && errors.paymentType && <p className="text-xs text-error-600 mt-1">{errors.paymentType}</p>}
                  </FormField>
                  {formData.paymentType === 'paid' && (
                    <div>
                      <FormLabel required>Price Categories</FormLabel>
                      <PriceCategoriesEditor
                        categories={formData.priceCategories}
                        onChange={cats => set('priceCategories', cats)}
                      />
                      {touched && errors.priceCategories && <p className="text-xs text-error-600 mt-1">{errors.priceCategories}</p>}
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Guest Registration">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                {EVENT_TERMS_AND_CONDITIONS}
              </p>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
