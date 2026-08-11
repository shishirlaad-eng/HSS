import { useState, useRef } from 'react';
import {
  ArrowLeft, Clock, MapPin, Globe, CreditCard, ScrollText,
  ListChecks, Check,
} from 'lucide-react';
import { FormField, FormLabel, FormInput, FormSelect, ErrorText } from './hb/common';
import { PrimaryButton, SecondaryButton } from './hb/listing';
import {
  mockEvents, mockCoupons, EVENT_TERMS_AND_CONDITIONS,
  addEventGuestProfile, addEventParticipant, isEventGuestEmailTaken,
  type EventGuestProfile, type EventParticipant,
} from '../../mockAPI/eventsData';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { DietaryMultiSelect } from './MyProfile';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { toast } from 'sonner';
import myHssLogo from '../../assets/brand/hss/logos/my-hss-logo.png';

// Fixed to one demo event — this prototype has no URL routing to pass an
// event id from a real shareable link, see the "Non-Member Registration" link
// box on Event Detail for how that link would work in the real product.
const FIXED_EVENT_ID = 'EVT-108';

const RELATIONSHIP_OPTIONS = ['Spouse', 'Sibling', 'Parent', 'Child', 'Friend', 'Other'];

function truncateDescription(html: string, max: number): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function Card({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg" style={{ borderTop: '3px solid #172E4D' }}>
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 rounded-t-lg flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary-600" />}
        <h4 className="text-[17px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}

const EMPTY_FORM = {
  // Event registration
  ticketTypeId: '',
  discountCode: '',
  customAnswers: {} as Record<string, string | boolean | string[]>,
  donationAmount: '',
  giftAidChecked: false,
  agreedToTerms: false,
  // Personal details
  firstName: '', middleName: '', surname: '', gender: '', dateOfBirth: '',
  // Contact details
  phone: '', email: '', buildingName: '', addressLine1: '', addressLine2: '', town: '', postCode: '',
  // Emergency contact
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactEmail: '', emergencyContactRelationship: '',
  // Medical
  hasMedicalConditions: '', medicalConditionsDetails: '', hasAllergies: '', allergyDetails: '', carriesEpiPen: '',
  dietaryRequirements: [] as string[],
  // Organisation (optional)
  affiliatedCountry: '', affiliatedRegion: '', affiliatedTown: '', affiliatedCentre: '',
  // Payment
  cardNumber: '', expiry: '', cvc: '', cardholderName: '', billingPostcode: '',
};

interface EventGuestRegistrationProps {
  onBack: () => void;
}

export default function EventGuestRegistration({ onBack }: EventGuestRegistrationProps) {
  const event = mockEvents.find(e => e.id === FIXED_EVENT_ID);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  // Three-step flow: 1) event details, 2) personal information, 3) event
  // registration + payment — each step validates before moving forward.
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmation, setConfirmation] = useState<{ guestId: string; ticketLabel: string } | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
        <p className="text-neutral-500">Registration is not available for this Karyakram.</p>
      </div>
    );
  }

  const set = (key: keyof typeof EMPTY_FORM, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const hasTicketTypes = event.paymentType === 'paid' && !!event.priceCategories && event.priceCategories.length > 0;
  const eventHasCoupon = event.paymentType === 'paid' && !!event.couponCode;
  const selectedTicketPrice = hasTicketTypes
    ? (event.priceCategories!.find(c => c.id === formData.ticketTypeId)?.price ?? 0)
    : (event.paymentType === 'paid' ? (event.price ?? 0) : 0);
  const requiresPayment = !formData.discountCode.trim() && (selectedTicketPrice + (parseFloat(formData.donationAmount) || 0)) > 0;

  const FIELD_ORDER = [
    'firstName', 'surname', 'gender', 'dateOfBirth',
    'phone', 'email', 'addressLine1', 'town', 'postCode',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactEmail', 'emergencyContactRelationship',
    'hasMedicalConditions', 'medicalConditionsDetails', 'hasAllergies', 'allergyDetails',
    'ticketTypeId', 'discountCode', 'agreedToTerms',
  ];
  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';
  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = FIELD_ORDER.find(k => errs[k]);
    if (firstKey) {
      const el = fieldRefs.current[firstKey];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Step 2 — personal/contact/emergency/medical information.
  const validatePersonalStep = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.surname.trim()) errs.surname = 'Last name is required.';
    if (!formData.gender) errs.gender = 'Please select a gender.';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required.';

    if (!formData.phone.trim()) errs.phone = 'Contact number is required.';
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (isEventGuestEmailTaken(formData.email)) errs.email = 'This email is already registered for a Karyakram as a guest.';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Address line 1 is required.';
    if (!formData.town.trim()) errs.town = 'Town / City is required.';
    if (!formData.postCode.trim()) errs.postCode = 'Post code is required.';

    if (!formData.emergencyContactName.trim()) errs.emergencyContactName = 'Emergency contact name is required.';
    if (!formData.emergencyContactPhone.trim()) errs.emergencyContactPhone = 'Emergency contact phone is required.';
    if (!formData.emergencyContactEmail.trim()) errs.emergencyContactEmail = 'Emergency contact email is required.';
    if (!formData.emergencyContactRelationship) errs.emergencyContactRelationship = 'Please select a relationship.';

    if (!formData.hasMedicalConditions) errs.hasMedicalConditions = 'Please answer this question.';
    else if (formData.hasMedicalConditions === 'Yes' && !formData.medicalConditionsDetails.trim()) errs.medicalConditionsDetails = 'Please give details.';
    if (!formData.hasAllergies) errs.hasAllergies = 'Please answer this question.';
    else if (formData.hasAllergies === 'Yes' && !formData.allergyDetails.trim()) errs.allergyDetails = 'Please give details.';

    return errs;
  };

  // Step 3 — event-specific registration questions + terms.
  const validateEventStep = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (hasTicketTypes && !formData.ticketTypeId) errs.ticketTypeId = 'Please select a ticket type.';
    if (formData.discountCode.trim()) {
      const assigned = event.couponCode ?? '';
      const activeGlobally = mockCoupons.some(c => c.name.toLowerCase() === formData.discountCode.trim().toLowerCase() && c.status === 'active');
      if (!assigned || assigned.toLowerCase() !== formData.discountCode.trim().toLowerCase() || !activeGlobally) {
        errs.discountCode = 'This code is not valid for this Karyakram.';
      }
    }
    (event.customQuestions ?? []).forEach(q => {
      if (!q.required) return;
      const ans = formData.customAnswers[q.id];
      const missing = q.type === 'checkbox' ? !Array.isArray(ans) || ans.length === 0 : !ans || (typeof ans === 'string' && !ans.trim());
      if (missing) errs[`cq_${q.id}`] = `Please answer: "${q.label}"`;
    });
    if (!formData.agreedToTerms) errs.agreedToTerms = 'Please agree to the Terms and Conditions to continue.';
    return errs;
  };

  const handleContinueToStep3 = () => {
    const errs = validatePersonalStep();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstError(errs);
      toast.error('Please fix the highlighted fields before continuing.');
      return;
    }
    setErrors({});
    setStep(3);
  };

  // ── Payment popup — shown after "Proceed to Payment" when a paid ticket
  // and/or donation makes a charge apply; registration is only saved once
  // this popup's payment succeeds, matching the member registration flow.
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const errs = validateEventStep();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstError(errs);
      toast.error('Please fix the highlighted fields before submitting.');
      return;
    }

    if (requiresPayment) {
      setPaymentAmount((selectedTicketPrice + (parseFloat(formData.donationAmount) || 0)).toFixed(2));
      setPaymentEmail(formData.email);
      setPaymentErrors({});
      setShowPaymentPopup(true);
      return;
    }

    finalizeRegistration();
  };

  const handleConfirmPayment = () => {
    const errs: Record<string, string> = {};
    if (!paymentAmount.trim() || (parseFloat(paymentAmount) || 0) <= 0) errs.amount = 'Enter a valid amount.';
    if (!paymentEmail.trim()) errs.email = 'Email address is required.';
    if (!formData.cardNumber.trim()) errs.cardNumber = 'Card number is required.';
    if (!formData.expiry.trim()) errs.expiry = 'Expiry date is required.';
    if (!formData.cvc.trim()) errs.cvc = 'CVC is required.';
    if (!formData.cardholderName.trim()) errs.cardholderName = 'Cardholder name is required.';
    if (!formData.billingPostcode.trim()) errs.billingPostcode = 'Billing postcode is required.';
    if (Object.keys(errs).length > 0) {
      setPaymentErrors(errs);
      return;
    }
    setShowPaymentPopup(false);
    finalizeRegistration();
  };

  const finalizeRegistration = () => {
    const ticket = hasTicketTypes ? event.priceCategories!.find(c => c.id === formData.ticketTypeId) : undefined;
    const donation = parseFloat(formData.donationAmount) || 0;
    const guestId = `GST-${Date.now().toString().slice(-6)}`;
    const fullName = [formData.firstName, formData.surname].filter(Boolean).join(' ');

    const participant: EventParticipant = {
      memberId: guestId,
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      memberType: 'adult',
      rsvp: 'requested',
      registeredAt: new Date().toISOString(),
      termsAccepted: true,
      ...(Object.keys(formData.customAnswers).length > 0 ? { customAnswers: formData.customAnswers } : {}),
      ...(formData.discountCode.trim() ? { discountCodeUsed: event.couponCode } : {}),
      ...(ticket ? { ticketTypeId: ticket.id, ticketTypeLabel: ticket.label } : {}),
      ...(donation > 0 ? { donationAmount: donation } : {}),
      ...(donation > 0 && formData.giftAidChecked ? { giftAidClaimed: true } : {}),
    };
    addEventParticipant(event.id, participant);

    const profile: EventGuestProfile = {
      guestId,
      eventId: event.id,
      firstName: formData.firstName,
      middleName: formData.middleName || undefined,
      surname: formData.surname,
      gender: formData.gender as 'male' | 'female',
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      email: formData.email,
      buildingName: formData.buildingName || undefined,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || undefined,
      town: formData.town,
      postCode: formData.postCode,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactEmail: formData.emergencyContactEmail,
      emergencyContactRelationship: formData.emergencyContactRelationship,
      hasMedicalConditions: formData.hasMedicalConditions === 'Yes',
      medicalConditionsDetails: formData.medicalConditionsDetails || undefined,
      hasAllergies: formData.hasAllergies === 'Yes',
      allergyDetails: formData.allergyDetails || undefined,
      carriesEpiPen: formData.carriesEpiPen === 'Yes',
      dietaryRequirements: formData.dietaryRequirements.length > 0 ? formData.dietaryRequirements : undefined,
      affiliatedCountry: formData.affiliatedCountry || undefined,
      affiliatedRegion: formData.affiliatedRegion || undefined,
      affiliatedTown: formData.affiliatedTown || undefined,
      affiliatedCentre: formData.affiliatedCentre || undefined,
      registeredAt: new Date().toISOString(),
    };
    addEventGuestProfile(profile);

    setConfirmation({ guestId, ticketLabel: ticket?.label ?? '' });
    setSubmitted(true);
  };

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (submitted && confirmation) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="px-6 pt-8 pb-2 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-950/30 flex items-center justify-center mb-3">
              <Check className="w-7 h-7 text-success-600 dark:text-success-400" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Registration Submitted</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Your registration for <strong>{event.name}</strong> has been received and is awaiting approval.</p>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" /><span>{formatDateTime(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                {event.locationType === 'online' ? <Globe className="w-3.5 h-3.5 flex-shrink-0" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{event.locationType === 'online' ? 'Online Karyakram' : (event.venueAddress || event.activityCentre)}</span>
              </div>
              {confirmation.ticketLabel && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <CreditCard className="w-3.5 h-3.5 flex-shrink-0" /><span>Ticket: {confirmation.ticketLabel}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                <ListChecks className="w-3.5 h-3.5 flex-shrink-0" /><span>Registration ID: {confirmation.guestId}</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <SecondaryButton onClick={onBack} className="w-full justify-center">Back to Login</SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="sticky top-0 z-50 h-[53px] px-6 flex items-center justify-between" style={{ backgroundColor: '#172E4D' }}>
        <img src={myHssLogo} alt="My HSS" className="h-6 w-auto object-contain" />
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <p className="text-xs font-mono text-neutral-400">Step {step} of 3</p>

        {step === 1 && (
        <>
        {/* Event details */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex gap-4">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.name} className="w-20 h-20 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{event.name}</h1>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-sm text-neutral-500 font-mono">Event Id: {event.id}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 flex-shrink-0" /><span>{formatDate(event.startDate)} · {formatDateTime(event.startDate).split(' ')[1]} – {formatDateTime(event.endDate).split(' ')[1]}</span></div>
              <div className="flex items-center gap-1.5">
                {event.locationType === 'online' ? <Globe className="w-4 h-4 flex-shrink-0" /> : <MapPin className="w-4 h-4 flex-shrink-0" />}
                <span>{event.locationType === 'online' ? 'Online Karyakram' : (event.venueAddress || `${event.activityCentre} · ${event.town} · ${event.region} · ${event.country}`)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description — separate box, capped at 500 characters */}
        {event.description && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">About this Karyakram</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{truncateDescription(event.description, 500)}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <SecondaryButton onClick={onBack}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setStep(2)}>Continue to register</PrimaryButton>
        </div>
        </>
        )}

        {step === 2 && (
        <>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Registering for <strong className="text-neutral-900 dark:text-white">{event.name}</strong></p>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          You're registering as a non member — no MyHSS account is needed. Complete every section below and submit; the Event Admin will review your registration.
        </div>

        {/* Personal Details */}
        <Card title="Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>First Name</FormLabel>
              <FormInput ref={el => { fieldRefs.current.firstName = el; }} value={formData.firstName} onChange={e => set('firstName', e.target.value)} className={errCls('firstName')} />
              <ErrorText>{errors.firstName}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel>Middle Name</FormLabel>
              <FormInput value={formData.middleName} onChange={e => set('middleName', e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Last Name</FormLabel>
              <FormInput ref={el => { fieldRefs.current.surname = el; }} value={formData.surname} onChange={e => set('surname', e.target.value)} className={errCls('surname')} />
              <ErrorText>{errors.surname}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Gender</FormLabel>
              <FormSelect ref={el => { fieldRefs.current.gender = el; }} value={formData.gender} onChange={e => set('gender', e.target.value)} className={errCls('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </FormSelect>
              <ErrorText>{errors.gender}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Date of Birth</FormLabel>
              <FormInput ref={el => { fieldRefs.current.dateOfBirth = el; }} type="date" value={formData.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={errCls('dateOfBirth')} />
              <ErrorText>{errors.dateOfBirth}</ErrorText>
            </FormField>
          </div>
        </Card>

        {/* Contact Details */}
        <Card title="Contact Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Contact Number</FormLabel>
              <FormInput ref={el => { fieldRefs.current.phone = el; }} value={formData.phone} onChange={e => set('phone', e.target.value)} className={errCls('phone')} />
              <ErrorText>{errors.phone}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Email Address</FormLabel>
              <FormInput ref={el => { fieldRefs.current.email = el; }} type="email" value={formData.email} onChange={e => set('email', e.target.value)} className={errCls('email')} />
              <ErrorText>{errors.email}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Post Code</FormLabel>
              <FormInput ref={el => { fieldRefs.current.postCode = el; }} value={formData.postCode} onChange={e => set('postCode', e.target.value)} className={errCls('postCode')} />
              <ErrorText>{errors.postCode}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel>Building Name</FormLabel>
              <FormInput value={formData.buildingName} onChange={e => set('buildingName', e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Address Line 1</FormLabel>
              <FormInput ref={el => { fieldRefs.current.addressLine1 = el; }} value={formData.addressLine1} onChange={e => set('addressLine1', e.target.value)} className={errCls('addressLine1')} />
              <ErrorText>{errors.addressLine1}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel>Address Line 2</FormLabel>
              <FormInput value={formData.addressLine2} onChange={e => set('addressLine2', e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Town / City</FormLabel>
              <FormInput ref={el => { fieldRefs.current.town = el; }} value={formData.town} onChange={e => set('town', e.target.value)} className={errCls('town')} />
              <ErrorText>{errors.town}</ErrorText>
            </FormField>
          </div>
        </Card>

        {/* Emergency Contact Details */}
        <Card title="Emergency Contact Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Contact Name</FormLabel>
              <FormInput ref={el => { fieldRefs.current.emergencyContactName = el; }} value={formData.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} className={errCls('emergencyContactName')} />
              <ErrorText>{errors.emergencyContactName}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Contact Phone Number</FormLabel>
              <FormInput ref={el => { fieldRefs.current.emergencyContactPhone = el; }} value={formData.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)} className={errCls('emergencyContactPhone')} />
              <ErrorText>{errors.emergencyContactPhone}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Contact Email</FormLabel>
              <FormInput ref={el => { fieldRefs.current.emergencyContactEmail = el; }} type="email" value={formData.emergencyContactEmail} onChange={e => set('emergencyContactEmail', e.target.value)} className={errCls('emergencyContactEmail')} />
              <ErrorText>{errors.emergencyContactEmail}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Contact Relationship</FormLabel>
              <FormSelect ref={el => { fieldRefs.current.emergencyContactRelationship = el; }} value={formData.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)} className={errCls('emergencyContactRelationship')}>
                <option value="">Select…</option>
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </FormSelect>
              <ErrorText>{errors.emergencyContactRelationship}</ErrorText>
            </FormField>
          </div>
        </Card>

        {/* Medical Details */}
        <Card title="Medical Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Do you have any medical conditions?</FormLabel>
              <FormSelect ref={el => { fieldRefs.current.hasMedicalConditions = el; }} value={formData.hasMedicalConditions} onChange={e => set('hasMedicalConditions', e.target.value)} className={errCls('hasMedicalConditions')}>
                <option value="">Select option</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </FormSelect>
              <ErrorText>{errors.hasMedicalConditions}</ErrorText>
            </FormField>
            <FormField>
              <FormLabel required>Do you have any allergies?</FormLabel>
              <FormSelect ref={el => { fieldRefs.current.hasAllergies = el; }} value={formData.hasAllergies} onChange={e => set('hasAllergies', e.target.value)} className={errCls('hasAllergies')}>
                <option value="">Select option</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </FormSelect>
              <ErrorText>{errors.hasAllergies}</ErrorText>
            </FormField>
            {formData.hasMedicalConditions === 'Yes' && (
              <div className="md:col-span-2">
                <FormField>
                  <FormLabel required>Please state medical details</FormLabel>
                  <textarea ref={el => { fieldRefs.current.medicalConditionsDetails = el; }} value={formData.medicalConditionsDetails} onChange={e => set('medicalConditionsDetails', e.target.value)} rows={2} className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errCls('medicalConditionsDetails')}`} />
                  <ErrorText>{errors.medicalConditionsDetails}</ErrorText>
                </FormField>
              </div>
            )}
            {formData.hasAllergies === 'Yes' && (
              <>
                <div className="md:col-span-2">
                  <FormField>
                    <FormLabel required>Please state allergy details</FormLabel>
                    <textarea ref={el => { fieldRefs.current.allergyDetails = el; }} value={formData.allergyDetails} onChange={e => set('allergyDetails', e.target.value)} rows={2} className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errCls('allergyDetails')}`} />
                    <ErrorText>{errors.allergyDetails}</ErrorText>
                  </FormField>
                </div>
                <FormField>
                  <FormLabel>Do you carry an EpiPen/Jext/Emerade?</FormLabel>
                  <FormSelect value={formData.carriesEpiPen} onChange={e => set('carriesEpiPen', e.target.value)}>
                    <option value="">Select option</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </FormSelect>
                </FormField>
              </>
            )}
            <div className="md:col-span-2">
              <FormField>
                <FormLabel>Special Dietary Requirements</FormLabel>
                <DietaryMultiSelect
                  selected={formData.dietaryRequirements}
                  onChange={vals => set('dietaryRequirements', vals)}
                />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Organisation Details (optional) */}
        <Card title="Organisation Details">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Optional — let us know if you're connected to an HSS Shakha.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel>Country</FormLabel>
              <FormSelect value={formData.affiliatedCountry} onChange={e => set('affiliatedCountry', e.target.value)}>
                <option value="">Select…</option>
                {MASTERS_CASCADE.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>Vibhag</FormLabel>
              <FormSelect value={formData.affiliatedRegion} onChange={e => set('affiliatedRegion', e.target.value)} disabled={!formData.affiliatedCountry}>
                <option value="">Select…</option>
                {(formData.affiliatedCountry ? (MASTERS_CASCADE.regions[formData.affiliatedCountry] ?? []) : []).map((r: string) => <option key={r} value={r}>{r}</option>)}
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>Nagar</FormLabel>
              <FormSelect value={formData.affiliatedTown} onChange={e => set('affiliatedTown', e.target.value)} disabled={!formData.affiliatedRegion}>
                <option value="">Select…</option>
                {(formData.affiliatedRegion ? (MASTERS_CASCADE.towns[formData.affiliatedRegion] ?? []) : []).map((t: string) => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </FormField>
            <FormField>
              <FormLabel>Shakha</FormLabel>
              <FormSelect value={formData.affiliatedCentre} onChange={e => set('affiliatedCentre', e.target.value)} disabled={!formData.affiliatedTown}>
                <option value="">Select…</option>
                {(formData.affiliatedTown ? (MASTERS_CASCADE.centres[formData.affiliatedTown] ?? []) : []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
            </FormField>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={onBack}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleContinueToStep3}>Continue</PrimaryButton>
          </div>
        </div>
        </>
        )}

        {step === 3 && (
        <>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Registering for <strong className="text-neutral-900 dark:text-white">{event.name}</strong></p>

        {/* Event Registration */}
        <Card title="Event Registration" icon={ListChecks}>
          <div className="space-y-5">
            {hasTicketTypes && (
              <div ref={el => { fieldRefs.current.ticketTypeId = el; }}>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary-600" /> Ticket Type <span className="text-error-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {event.priceCategories!.map(cat => (
                    <label key={cat.id} className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${formData.ticketTypeId === cat.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-neutral-300 dark:border-neutral-700'}`}>
                      <input type="radio" name="ticketType" checked={formData.ticketTypeId === cat.id} onChange={() => set('ticketTypeId', cat.id)} className="mt-0.5 text-primary-600 focus:ring-primary-500" />
                      <span className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <span className="font-medium text-neutral-900 dark:text-white">{cat.label}</span>
                        <span className="font-semibold text-neutral-900 dark:text-white flex-shrink-0">£{cat.price}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <ErrorText>{errors.ticketTypeId}</ErrorText>
              </div>
            )}

            {eventHasCoupon && (
              <FormField>
                <FormLabel>Discount / Free Registration Code <span className="text-neutral-400 font-normal text-xs">(optional)</span></FormLabel>
                <FormInput ref={el => { fieldRefs.current.discountCode = el; }} value={formData.discountCode} onChange={e => set('discountCode', e.target.value)} placeholder="Enter code if you have one" className={errCls('discountCode')} />
                <ErrorText>{errors.discountCode}</ErrorText>
              </FormField>
            )}

            {(event.customQuestions ?? []).map(q => (
              <div key={q.id}>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">{q.label} {q.required && <span className="text-error-500">*</span>}</label>
                {q.description && <p className="text-xs text-neutral-400 mb-1">{q.description}</p>}
                {q.type === 'text' && (
                  <FormInput value={(formData.customAnswers[q.id] as string) ?? ''} onChange={e => set('customAnswers', { ...formData.customAnswers, [q.id]: e.target.value })} className={errCls(`cq_${q.id}`)} />
                )}
                {q.type === 'dropdown' && (
                  <FormSelect value={(formData.customAnswers[q.id] as string) ?? ''} onChange={e => set('customAnswers', { ...formData.customAnswers, [q.id]: e.target.value })} className={errCls(`cq_${q.id}`)}>
                    <option value="">Select…</option>
                    {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </FormSelect>
                )}
                {q.type === 'checkbox' && (
                  <div className="space-y-1.5">
                    {(q.options ?? []).map(opt => {
                      const selected = (formData.customAnswers[q.id] as string[]) ?? [];
                      const checked = selected.includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={e => {
                            const cur = (formData.customAnswers[q.id] as string[]) ?? [];
                            const next = e.target.checked ? [...cur, opt] : cur.filter(o => o !== opt);
                            set('customAnswers', { ...formData.customAnswers, [q.id]: next });
                          }} className="rounded border-neutral-300 dark:border-neutral-700 text-primary-600" />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {q.type === 'radio' && (
                  <div className="space-y-1.5">
                    {(q.options ?? []).map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                        <input type="radio" name={q.id} checked={(formData.customAnswers[q.id] as string) === opt} onChange={() => set('customAnswers', { ...formData.customAnswers, [q.id]: opt })} className="text-primary-600" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'date' && (
                  <FormInput type="date" value={(formData.customAnswers[q.id] as string) ?? ''} onChange={e => set('customAnswers', { ...formData.customAnswers, [q.id]: e.target.value })} className={errCls(`cq_${q.id}`)} />
                )}
                <ErrorText>{errors[`cq_${q.id}`]}</ErrorText>
              </div>
            ))}

            {event.donationEnabled && (
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">Donation <span className="text-neutral-400 font-normal">(optional)</span></label>
                {event.donationDescription && <p className="text-xs text-neutral-400 mb-2">{event.donationDescription}</p>}
                {event.donationAmounts && event.donationAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {event.donationAmounts.map(amt => (
                      <button type="button" key={amt} onClick={() => set('donationAmount', String(amt))} className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${formData.donationAmount === String(amt) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'}`}>£{amt}</button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">£</span>
                  <FormInput type="number" min="0" step="0.01" value={formData.donationAmount} onChange={e => set('donationAmount', e.target.value)} placeholder="0.00" className="pl-6" />
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer mt-2">
                  <input type="checkbox" checked={formData.giftAidChecked} onChange={e => set('giftAidChecked', e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 text-primary-600" />
                  <span>Receive Gift Aid</span>
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Terms & Conditions */}
        <Card title="Terms & Conditions" icon={ScrollText}>
          <div ref={el => { fieldRefs.current.agreedToTerms = el; }}>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-neutral-50 dark:bg-neutral-900">
              {event.termsSections && event.termsSections.length > 0 ? (
                event.termsSections.map(section => (
                  <div key={section.id} className="mb-2 last:mb-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white">{section.title}</p>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: section.description }} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">{event.termsAndConditions ?? EVENT_TERMS_AND_CONDITIONS}</p>
              )}
            </div>
            <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer mt-2">
              <input type="checkbox" checked={formData.agreedToTerms} onChange={e => set('agreedToTerms', e.target.checked)} className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-primary-600" />
              <span>I agree to the Terms and Conditions <span className="text-error-500">*</span></span>
            </label>
            <ErrorText>{errors.agreedToTerms}</ErrorText>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2 pb-8">
          <SecondaryButton onClick={() => setStep(2)}>Back</SecondaryButton>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={onBack}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>
              {requiresPayment ? 'Proceed to Payment' : 'Submit Registration'}
            </PrimaryButton>
          </div>
        </div>
        </>
        )}
      </div>

      {showPaymentPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPaymentPopup(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-600" /> Payment Details
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">All fields are required</p>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <FormField>
                <FormLabel>Amount</FormLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">£</span>
                  <FormInput type="number" min="0" step="0.01" value={paymentAmount} onChange={e => { setPaymentAmount(e.target.value); setPaymentErrors(prev => ({ ...prev, amount: '' })); }} className={`pl-6 ${paymentErrors.amount ? 'border-error-400 dark:border-error-600' : ''}`} />
                </div>
                <ErrorText>{paymentErrors.amount}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel>Email address</FormLabel>
                <FormInput type="email" value={paymentEmail} onChange={e => { setPaymentEmail(e.target.value); setPaymentErrors(prev => ({ ...prev, email: '' })); }} className={paymentErrors.email ? 'border-error-400 dark:border-error-600' : ''} />
                <ErrorText>{paymentErrors.email}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Card number</FormLabel>
                <FormInput value={formData.cardNumber} onChange={e => set('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" className={paymentErrors.cardNumber ? 'border-error-400 dark:border-error-600' : ''} />
                <ErrorText>{paymentErrors.cardNumber}</ErrorText>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <FormLabel required>Expiry date</FormLabel>
                  <FormInput value={formData.expiry} onChange={e => set('expiry', e.target.value)} placeholder="MM / YY" className={paymentErrors.expiry ? 'border-error-400 dark:border-error-600' : ''} />
                  <ErrorText>{paymentErrors.expiry}</ErrorText>
                </FormField>
                <FormField>
                  <FormLabel required>CVC / CVV</FormLabel>
                  <FormInput value={formData.cvc} onChange={e => set('cvc', e.target.value)} placeholder="•••" className={paymentErrors.cvc ? 'border-error-400 dark:border-error-600' : ''} />
                  <ErrorText>{paymentErrors.cvc}</ErrorText>
                </FormField>
              </div>
              <FormField>
                <FormLabel required>Cardholder name</FormLabel>
                <FormInput value={formData.cardholderName} onChange={e => set('cardholderName', e.target.value)} placeholder="Name as it appears on card" className={paymentErrors.cardholderName ? 'border-error-400 dark:border-error-600' : ''} />
                <ErrorText>{paymentErrors.cardholderName}</ErrorText>
              </FormField>
              <FormField>
                <FormLabel required>Billing postcode</FormLabel>
                <FormInput value={formData.billingPostcode} onChange={e => set('billingPostcode', e.target.value)} placeholder="e.g. SW1A 1AA" className={paymentErrors.billingPostcode ? 'border-error-400 dark:border-error-600' : ''} />
                <ErrorText>{paymentErrors.billingPostcode}</ErrorText>
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <SecondaryButton onClick={() => setShowPaymentPopup(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleConfirmPayment}>
                <Check className="w-3.5 h-3.5" /> Pay and Register
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
