import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User as UserIcon,
  Users as UsersIcon,
  Clock,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  XCircle,
  Edit,
  Play,
  Trash2,
  MapPin,
  CreditCard,
  AlertTriangle,
  Mail,
  Phone,
  Upload,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Check,
  Ban,
  CalendarCheck,
  Clock as ClockIcon,
  Globe,
  Link2,
  Ticket,
  ScrollText,
  ListChecks,
  Copy,
  ShieldCheck,
  ShieldOff,
  Heart,
  Undo2,
  Download,
  Eye,
  Search,
  Megaphone,
  Bell,
  QrCode,
} from 'lucide-react';
import { SecondaryButton } from './hb/listing';
import { StatCard } from './hb/common/StatCard';
import { RichTextEditor } from './hb/common';
import {
  Event,
  EventParticipant,
  EventMedia,
  EventAnnouncement,
  mockParticipants,
  mockMediaPosts,
  mockEventAnnouncements,
  mockCoupons,
  EVENT_TERMS_AND_CONDITIONS,
} from '../../mockAPI/eventsData';
import { mockMembers, getAgeGroupLabel } from '../../mockAPI/membersData';
import { formatDate, formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { toast } from 'sonner';

// ─── Price display helper ─────────────────────────────────────────────────────
function formatPriceRange(event: Event): string {
  if (event.priceCategories && event.priceCategories.length > 0) {
    const prices = event.priceCategories.map(c => c.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `£${min}` : `£${min} – £${max}`;
  }
  return event.price !== undefined ? `£${event.price}` : '';
}

// ─── Age group display labels (matches HSS naming convention) ─────────────────
const AUDIENCE_AGE_LABELS: Record<string, string> = {
  bal:     'Bal(ika) (0-5)',
  shishu:  'Shishu (6-11)',
  kishor:  'Kishor(i) (12-16)',
  tarun:   'Tarun(i) (17-30)',
  yuva:    'Yuva(ti) (30-60)',
  jyestha: 'Jyestha(a) (60+)',
};

// ─── Cutoff helpers ────────────────────────────────────────────────────────────
// Decision (Shishir/Ritesh): in-progress Karyakrams still need day-of edits
// (venue/time change, early closure, extension, emergency relocation, ticket/
// price/capacity updates). Draft, scheduled and in-progress stay editable; only
// Completed (and Cancelled, equally terminal) are locked.
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);
const canModify   = (event: Event) => event.status !== 'completed' && event.status !== 'cancelled';
const canDelete   = (event: Event) => !isPastStart(event) && event.status !== 'completed';

// ─── Gradient palette (used when no imageUrl present) ─────────────────────────
const MEDIA_GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-orange-400 to-red-500',
  'from-green-400 to-emerald-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-indigo-400 to-violet-600',
];

// ─── Lightbox image URL: real HSS images are already full-size ───────────────
const fullsizeUrl = (url: string) => url;

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Event['status'] }) {
  const map: Record<Event['status'], { bg: string; text: string; dot: string; label: string }> = {
    draft:     { bg: 'bg-neutral-50 dark:bg-neutral-900',    text: 'text-neutral-600 dark:text-neutral-400',  dot: 'bg-neutral-400',  label: 'Draft'     },
    published: { bg: 'bg-blue-50 dark:bg-blue-950/20',       text: 'text-blue-700 dark:text-blue-400',        dot: 'bg-blue-500',     label: 'Published' },
    active:    { bg: 'bg-success-50 dark:bg-success-950/20', text: 'text-success-700 dark:text-success-400',  dot: 'bg-success-500',  label: 'In Progress' },
    cancelled: { bg: 'bg-error-50 dark:bg-error-950/20',     text: 'text-error-700 dark:text-error-400',      dot: 'bg-error-500',    label: 'Cancelled' },
    completed: { bg: 'bg-amber-50 dark:bg-amber-950/20',     text: 'text-amber-700 dark:text-amber-400',      dot: 'bg-amber-500',    label: 'Completed' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border border-transparent text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Member type badge ─────────────────────────────────────────────────────────
// Generates a scannable QR code image via a public QR rendering service —
// no client-side QR library needed, consistent with how other external
// images are already embedded in this app.
function qrCodeUrl(data: string, size = 160): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

function TypeBadge({ type }: { type: EventParticipant['memberType'] }) {
  const map = {
    adult: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
    teen:  'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400',
    child: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[type]}`}>
      {type}
    </span>
  );
}

const COMPLIANCE_BADGE: Record<string, { text: string; dot: string; textCls: string }> = {
  Approved:  { text: 'Approved',  dot: 'bg-success-500', textCls: 'text-success-700 dark:text-success-400' },
  Certified: { text: 'Certified', dot: 'bg-success-500', textCls: 'text-success-700 dark:text-success-400' },
  Pending:   { text: 'Pending',   dot: 'bg-amber-500',   textCls: 'text-amber-700 dark:text-amber-400'     },
  Expired:   { text: 'Expired',   dot: 'bg-error-500',   textCls: 'text-error-700 dark:text-error-400'     },
  'N/A':     { text: 'N/A',       dot: 'bg-neutral-400', textCls: 'text-neutral-500 dark:text-neutral-400' },
};
function ComplianceBadge({ status }: { status?: string }) {
  const cfg = COMPLIANCE_BADGE[status ?? ''] ?? { text: status || 'N/A', dot: 'bg-neutral-400', textCls: 'text-neutral-500 dark:text-neutral-400' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-sm font-medium ${cfg.textCls}`}>{cfg.text}</span>
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab         = 'overview' | 'participants' | 'media' | 'announcements';
type RsvpFilter  = 'all' | 'requested' | 'going' | 'denied' | 'refund' | 'waitlisted';
type MediaFilter = 'all' | 'image' | 'video';

interface LightboxState {
  memberId: string;
  memberName: string;
  currentIndex: number; // index within that user's media list
}

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onModify: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onClone?: () => void;
  onViewMember?: (memberId: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EventDetail({
  event,
  onBack,
  onModify,
  onCancel,
  onDelete,
  onClone,
  onViewMember,
}: EventDetailProps) {

  const formatDateTime = (iso: string) => sharedFormatDateTime(iso);

  const past                   = isPastStart(event);
  const modifyOk               = canModify(event);
  const deleteOk               = canDelete(event);
  const isCancelledOrCompleted = event.status === 'cancelled' || event.status === 'completed';

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Role / current member ───────────────────────────────────────────────────
  const { selectedRole, scope } = useRoleScope();
  const isMember = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';

  // ── Participants (stateful so Approve/Deny + Attend can mutate) ──────────────
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('all');
  const [participantSearch, setParticipantSearch] = useState('');
  const [viewingParticipantId, setViewingParticipantId] = useState<string | null>(null);
  const [editingRegistration, setEditingRegistration] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, string | boolean | string[]>>({});
  const [participants, setParticipants] = useState<EventParticipant[]>(mockParticipants[event.id] ?? []);
  const allParticipants = participants;
  const requestedList   = allParticipants.filter(p => p.rsvp === 'requested');
  const goingList       = allParticipants.filter(p => p.rsvp === 'going');
  const deniedList      = allParticipants.filter(p => p.rsvp === 'denied');
  const refundList      = allParticipants.filter(p => p.refundRequested);
  const waitlistedList  = allParticipants.filter(p => p.waitlisted);
  const rsvpFilteredParticipants =
    rsvpFilter === 'all'        ? allParticipants :
    rsvpFilter === 'requested'  ? requestedList :
    rsvpFilter === 'going'      ? goingList :
    rsvpFilter === 'denied'     ? deniedList :
    rsvpFilter === 'waitlisted' ? waitlistedList :
                                  refundList;
  const participantSearchQuery = participantSearch.trim().toLowerCase();
  const filteredParticipants = participantSearchQuery
    ? rsvpFilteredParticipants.filter(p =>
        p.name.toLowerCase().includes(participantSearchQuery) ||
        p.email.toLowerCase().includes(participantSearchQuery) ||
        p.memberId.toLowerCase().includes(participantSearchQuery) ||
        (p.phone ?? '').toLowerCase().includes(participantSearchQuery)
      )
    : rsvpFilteredParticipants;

  // ── Approve / Deny a registration request (admins) ──────────────────────────
  const handleApprove = (memberId: string) => {
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, rsvp: 'going' } : p));
    toast.success('Registration approved — marked as Going.');
  };
  const handleDeny = (memberId: string) => {
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, rsvp: 'denied' } : p));
    toast('Registration denied.');
  };

  // ── Resend the Event Confirmation email to a participant ─────────────────────
  const handleResendConfirmation = (email: string) => {
    toast.success(`Confirmation email resent to ${email}.`);
  };

  // ── Process a member's refund request ────────────────────────────────────────
  const handleProcessRefund = (memberId: string) => {
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, refundRequested: false } : p));
    toast.success('Refund processed.');
  };

  // ── Cancel an existing (approved or pending) registration ────────────────────
  const handleCancelRegistration = (memberId: string) => {
    if (!confirm('Cancel this registration? The participant will be marked as denied.')) return;
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, rsvp: 'denied' } : p));
    toast.success('Registration cancelled.');
  };

  // ── Admin-initiated refund (as opposed to a member's own refund request) ─────
  const handleTriggerRefund = (memberId: string, amount: number) => {
    if (!confirm(`Trigger a refund of £${amount.toFixed(2)} for this participant?`)) return;
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, refundRequested: false } : p));
    toast.success(`Refund of £${amount.toFixed(2)} triggered.`);
  };

  // ── Make / remove participant coordinator (admins) ───────────────────────────
  const handleMakeCoordinator = (memberId: string) => {
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, isCoordinator: true } : p));
    toast.success('Participant marked as coordinator.');
  };
  const handleRemoveCoordinator = (memberId: string) => {
    setParticipants(prev => prev.map(p => p.memberId === memberId ? { ...p, isCoordinator: false } : p));
    toast('Coordinator role removed.');
  };

  // ── Member self-registration ("Request to Attend") ──────────────────────────
  const myMemberId = scope.selfMemberId;
  const myParticipation = myMemberId ? allParticipants.find(p => p.memberId === myMemberId) : undefined;
  const [showAttendQuestions, setShowAttendQuestions] = useState(false);
  const [attendAnswers, setAttendAnswers] = useState<Record<string, string | boolean>>({});
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodeError, setDiscountCodeError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [giftAidChecked, setGiftAidChecked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  // ── Payment Details popup — shown after "Pay and Register" when a paid
  // ticket and/or donation is involved; free registrations skip straight to
  // handleAttend.
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentCardNumber, setPaymentCardNumber] = useState('');
  const [paymentExpiry, setPaymentExpiry] = useState('');
  const [paymentCVC, setPaymentCVC] = useState('');
  const [paymentCardholderName, setPaymentCardholderName] = useState('');
  const [paymentBillingPostcode, setPaymentBillingPostcode] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [pendingRegistration, setPendingRegistration] = useState<{
    customAnswers?: Record<string, string | boolean>;
    appliedCode?: string;
    ticket?: { id: string; label: string };
    donation?: number;
    giftAid?: boolean;
  } | null>(null);

  // ── Karyakram Confirmation popup — shown right after a successful registration.
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState('');
  const [confirmationTicketLabel, setConfirmationTicketLabel] = useState('');
  const [confirmationTicketPrice, setConfirmationTicketPrice] = useState<number | null>(null);

  // Capacity — a 'requested' registration already holds a spot pending approval,
  // same as 'going'; only 'denied' frees it up.
  const nonDeniedCount = allParticipants.filter(p => p.rsvp !== 'denied').length;
  const isFull = !!event.capacity && nonDeniedCount >= event.capacity;
  const blockedByCapacity = isFull && !event.waitlistEnabled;

  const hasTicketTypes = event.paymentType === 'paid' && !!event.priceCategories && event.priceCategories.length > 0;

  // Total revenue collected so far — ticket price (waived when a coupon was
  // applied) plus any donation, summed across all non-denied registrations.
  const totalRevenue = allParticipants
    .filter(p => p.rsvp !== 'denied')
    .reduce((sum, p) => {
      const ticketPrice = !p.discountCodeUsed && p.ticketTypeId
        ? (event.priceCategories?.find(c => c.id === p.ticketTypeId)?.price ?? 0)
        : 0;
      return sum + ticketPrice + (p.donationAmount ?? 0);
    }, 0);

  const handleAttend = (
    customAnswers?: Record<string, string | boolean>,
    appliedCode?: string,
    ticket?: { id: string; label: string },
    donation?: number,
    giftAid?: boolean,
  ) => {
    if (!myMemberId) return;
    const me = mockMembers.find(m => m.id === myMemberId);
    const willWaitlist = isFull && !!event.waitlistEnabled;
    setParticipants(prev => ([
      ...prev,
      {
        memberId: myMemberId,
        name: me?.name ?? 'You',
        email: me?.email ?? '',
        phone: me?.phone ?? '',
        memberType: me?.memberType ?? 'adult',
        rsvp: 'requested',
        registeredAt: new Date().toISOString(),
        termsAccepted: true,
        ...(customAnswers && Object.keys(customAnswers).length > 0 ? { customAnswers } : {}),
        ...(appliedCode ? { discountCodeUsed: appliedCode } : {}),
        ...(willWaitlist ? { waitlisted: true } : {}),
        ...(ticket ? { ticketTypeId: ticket.id, ticketTypeLabel: ticket.label } : {}),
        ...(donation ? { donationAmount: donation } : {}),
        ...(donation && giftAid ? { giftAidClaimed: true } : {}),
      },
    ]));
    setConfirmationNote(
      willWaitlist
        ? 'This Karyakram is full — you have been added to the waiting list. We will email you if a spot opens up.'
        : 'A confirmation email has been sent to your registered email address.'
    );
    setConfirmationTicketLabel(ticket?.label ?? '');
    const ticketPrice = ticket ? (event.priceCategories?.find(c => c.id === ticket.id)?.price ?? 0) : null;
    setConfirmationTicketPrice(appliedCode ? 0 : ticketPrice);
    setShowConfirmation(true);
  };

  // ── Download a .ics calendar invite for the registered Karyakram ─────────────
  const handleDownloadIcs = () => {
    const toIcsDate = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
    const location = event.locationType === 'online'
      ? (event.onlineUrl ?? 'Online')
      : (event.venueAddress || `${event.activityCentre}, ${event.town}, ${event.region}, ${event.country}`);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MyHSS//Karyakram//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@myhss.hssuk.org`,
      `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
      `DTSTART:${toIcsDate(event.startDate)}`,
      `DTEND:${toIcsDate(event.endDate)}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${(event.description ?? '').replace(/<[^>]+>/g, '').replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.replace(/[^a-z0-9]+/gi, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Only offer the code field when this Karyakram actually has one assigned
  // (Payment Type tab, Coupon Code field) — no point prompting otherwise.
  const eventHasCoupon = event.paymentType === 'paid' && !!event.couponCode;

  // Whether the current selection in the Register popup involves a real charge
  // (unapplied ticket price and/or donation) — drives the Submit/Pay button label.
  const selectedTicketPrice = hasTicketTypes
    ? (event.priceCategories!.find(c => c.id === selectedTicketId)?.price ?? 0)
    : 0;
  const requiresPayment = !discountCode.trim() && (selectedTicketPrice + (parseFloat(donationAmount) || 0)) > 0;

  const handleRequestToAttendClick = () => {
    setAttendAnswers({});
    setDiscountCode('');
    setDiscountCodeError('');
    setSelectedTicketId('');
    setTicketError('');
    setDonationAmount('');
    setGiftAidChecked(false);
    setAgreedToTerms(false);
    setTermsError('');
    setShowAttendQuestions(true);
  };

  const handleSubmitAttendQuestions = () => {
    if (hasTicketTypes && !selectedTicketId) {
      setTicketError('Please select a ticket type.');
      return;
    }
    setTicketError('');

    const missing = (event.customQuestions ?? []).find(q => {
      if (!q.required) return false;
      const ans = attendAnswers[q.id];
      if (q.type === 'checkbox') return !Array.isArray(ans) || ans.length === 0;
      return !ans || (typeof ans === 'string' && !ans.trim());
    });
    if (missing) {
      toast.error(`Please answer: "${missing.label}"`);
      return;
    }

    const enteredCode = discountCode.trim();
    let appliedCode: string | undefined;
    if (enteredCode) {
      const assigned = event.couponCode ?? '';
      const activeGlobally = mockCoupons.some(c => c.name.toLowerCase() === enteredCode.toLowerCase() && c.status === 'active');
      if (!assigned || assigned.toLowerCase() !== enteredCode.toLowerCase() || !activeGlobally) {
        setDiscountCodeError('This code is not valid for this Karyakram.');
        return;
      }
      appliedCode = assigned;
    }

    if (!agreedToTerms) {
      setTermsError('Please agree to the Terms and Conditions to continue.');
      return;
    }
    setTermsError('');

    const ticket = hasTicketTypes
      ? event.priceCategories!.find(c => c.id === selectedTicketId)
      : undefined;
    const donation = parseFloat(donationAmount) || 0;
    const ticketPrice = appliedCode ? 0 : (ticket?.price ?? 0);
    const totalPayable = ticketPrice + donation;

    if (totalPayable > 0) {
      setPendingRegistration({
        customAnswers: attendAnswers,
        appliedCode,
        ticket: ticket ? { id: ticket.id, label: ticket.label } : undefined,
        donation: donation > 0 ? donation : undefined,
        giftAid: giftAidChecked,
      });
      const me = mockMembers.find(m => m.id === myMemberId);
      setPaymentAmount(totalPayable.toFixed(2));
      setPaymentEmail(me?.email ?? '');
      setPaymentCardNumber('');
      setPaymentExpiry('');
      setPaymentCVC('');
      setPaymentCardholderName(me?.name ?? '');
      setPaymentBillingPostcode('');
      setPaymentErrors({});
      setShowAttendQuestions(false);
      setShowPaymentDetails(true);
      return;
    }

    handleAttend(
      attendAnswers,
      appliedCode,
      ticket ? { id: ticket.id, label: ticket.label } : undefined,
      donation > 0 ? donation : undefined,
      giftAidChecked,
    );
    setShowAttendQuestions(false);
  };

  const handleSubmitPayment = () => {
    const errs: Record<string, string> = {};
    if (!paymentAmount.trim() || (parseFloat(paymentAmount) || 0) <= 0) errs.amount = 'Enter a valid amount.';
    if (!paymentEmail.trim()) errs.email = 'Email address is required.';
    if (!paymentCardNumber.trim()) errs.cardNumber = 'Card number is required.';
    if (!paymentExpiry.trim()) errs.expiry = 'Expiry date is required.';
    if (!paymentCVC.trim()) errs.cvc = 'CVC is required.';
    if (!paymentCardholderName.trim()) errs.cardholderName = 'Cardholder name is required.';
    if (!paymentBillingPostcode.trim()) errs.billingPostcode = 'Billing postcode is required.';
    if (Object.keys(errs).length > 0) {
      setPaymentErrors(errs);
      return;
    }
    if (pendingRegistration) {
      handleAttend(
        pendingRegistration.customAnswers,
        pendingRegistration.appliedCode,
        pendingRegistration.ticket,
        pendingRegistration.donation,
        pendingRegistration.giftAid,
      );
    }
    setShowPaymentDetails(false);
    setPendingRegistration(null);
  };

  // ── Export participants as CSV ─────────────────────────────────────────────
  const handleExportParticipants = () => {
    if (!filteredParticipants.length) { toast.error('No participants to export.'); return; }

    const headers = [
      'Member ID', 'First Name', 'Last Name', 'Age Groups (years old)', 'Gender', 'Date of Birth',
      'Email', 'Secondary Email', 'Primary Contact Number', 'Secondary Contact Number',
      'Building Name', 'Address Line 1', 'Address Line 2', 'Town / City', 'Post Code',
      'Country', 'Vibhag', 'Nagar', 'Shakha',
      'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Email', 'Emergency Relationship',
      'Guardian Name', 'Guardian Email', 'Guardian Phone',
      'Medical Info Declared', 'First Aider', 'Dietary Requirements',
      'Occupation', 'Originating State (India)', 'DBS Status', 'First Aid Status',
      'Member Status', 'Registration Date',
      'RSVP', 'Participant Type', 'Discount Code',
    ];

    const rsvpLabel = (r: EventParticipant['rsvp']) =>
      r === 'going' ? 'Approved' : r === 'requested' ? 'Requested' : 'Denied';

    const escape = (v: string | undefined | null) =>
      `"${(v ?? '').toString().replace(/"/g, '""')}"`;

    const rows = filteredParticipants.map(p => {
      const m = mockMembers.find(mem => mem.id === p.memberId);
      return [
        p.memberId,
        escape(m?.firstName ?? p.name.split(' ')[0]),
        escape(m?.surname ?? p.name.split(' ').slice(1).join(' ')),
        escape(m ? getAgeGroupLabel(m.dateOfBirth) : ''),
        escape(m?.gender ?? ''),
        escape(m ? formatDate(m.dateOfBirth) : ''),
        escape(p.email),
        escape(m?.secondaryEmail ?? ''),
        escape(p.phone),
        escape(m?.secondaryPhone ?? ''),
        escape(m?.buildingName ?? ''),
        escape(m?.addressLine1 ?? ''),
        escape(m?.addressLine2 ?? ''),
        escape(m?.contactTownCity ?? ''),
        escape(m?.postCode ?? ''),
        escape(m?.country ?? ''),
        escape(m?.region ?? ''),
        escape(m?.town ?? ''),
        escape(m?.activityCentre ?? ''),
        escape(m?.emergencyContactName ?? ''),
        escape(m?.emergencyContactPhone ?? ''),
        escape(m?.emergencyContactEmail ?? ''),
        escape(m?.emergencyContactRelationship ?? ''),
        escape(m?.guardianName ?? ''),
        escape(m?.guardianEmail ?? ''),
        escape(m?.guardianPhone ?? ''),
        escape(m?.medicalInfoDeclared ?? ''),
        m?.isFirstAider ? 'Yes' : 'No',
        escape(Array.isArray(m?.dietaryRequirements) ? m.dietaryRequirements.join('; ') : (m?.dietaryRequirements ?? '')),
        escape(m?.occupation ?? ''),
        escape(m?.originatingStateIndia ?? ''),
        escape(m?.compliance?.dbs ?? ''),
        escape(m?.compliance?.firstAid ?? ''),
        escape(m?.status ?? ''),
        m ? formatDate(m.registrationDate) : '',
        rsvpLabel(p.rsvp),
        p.memberType.charAt(0).toUpperCase() + p.memberType.slice(1),
        escape(p.discountCodeUsed ?? ''),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${event.id}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filteredParticipants.length} participant${filteredParticipants.length !== 1 ? 's' : ''} exported successfully.`);
  };

  // ── Event Announcements (local, starts from mock) ──────────────────────────
  const [eventAnnouncements, setEventAnnouncements] = useState<EventAnnouncement[]>(mockEventAnnouncements[event.id] ?? []);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle]   = useState('');
  const [announcementBody, setAnnouncementBody]     = useState('');
  const [announcementBodyWordCount, setAnnouncementBodyWordCount] = useState(0);
  const [announcementTargets, setAnnouncementTargets] = useState<('requested' | 'going' | 'waitlisted')[]>([]);
  const [announcementPushEnabled, setAnnouncementPushEnabled] = useState(true);
  const [announcementPushSchedule, setAnnouncementPushSchedule] = useState<'instant' | 'scheduled'>('instant');
  const [announcementPushScheduledAt, setAnnouncementPushScheduledAt] = useState('');
  const [announcementEmailEnabled, setAnnouncementEmailEnabled] = useState(true);
  const [announcementEmailSchedule, setAnnouncementEmailSchedule] = useState<'instant' | 'scheduled'>('instant');
  const [announcementEmailScheduledAt, setAnnouncementEmailScheduledAt] = useState('');
  const announcementBodyIsOver = announcementBodyWordCount > 150;

  const resetAnnouncementForm = () => {
    setShowAnnouncementForm(false);
    setAnnouncementTitle('');
    setAnnouncementBody('');
    setAnnouncementBodyWordCount(0);
    setAnnouncementTargets([]);
    setAnnouncementPushEnabled(true);
    setAnnouncementPushSchedule('instant');
    setAnnouncementPushScheduledAt('');
    setAnnouncementEmailEnabled(true);
    setAnnouncementEmailSchedule('instant');
    setAnnouncementEmailScheduledAt('');
  };

  const handlePostAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      toast.error('Please enter a title and message.');
      return;
    }
    if (announcementBodyIsOver) {
      toast.error('Message exceeds the 150-word limit.');
      return;
    }
    if (announcementPushEnabled && announcementPushSchedule === 'scheduled' && !announcementPushScheduledAt) {
      toast.error('Please pick a push notification schedule date & time.');
      return;
    }
    if (announcementEmailEnabled && announcementEmailSchedule === 'scheduled' && !announcementEmailScheduledAt) {
      toast.error('Please pick an email notification schedule date & time.');
      return;
    }
    setEventAnnouncements(prev => [
      {
        id: `ANN-${Date.now()}`,
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        postedAt: new Date().toISOString(),
        postedBy: 'Admin',
        pushEnabled: announcementPushEnabled,
        ...(announcementPushEnabled ? { pushSchedule: announcementPushSchedule, ...(announcementPushSchedule === 'scheduled' ? { pushScheduledAt: announcementPushScheduledAt } : {}) } : {}),
        emailEnabled: announcementEmailEnabled,
        ...(announcementEmailEnabled ? { emailSchedule: announcementEmailSchedule, ...(announcementEmailSchedule === 'scheduled' ? { emailScheduledAt: announcementEmailScheduledAt } : {}) } : {}),
        ...(announcementTargets.length > 0 ? { targetStatuses: announcementTargets } : {}),
      },
      ...prev,
    ]);
    resetAnnouncementForm();
    toast.success(
      (announcementPushEnabled && announcementPushSchedule === 'scheduled') || (announcementEmailEnabled && announcementEmailSchedule === 'scheduled')
        ? 'Announcement scheduled.'
        : 'Announcement posted.'
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    setEventAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted.');
  };

  // ── Media list (local, starts from mock) ───────────────────────────────────
  const [mediaPosts, setMediaPosts]         = useState<EventMedia[]>(mockMediaPosts[event.id] ?? []);
  const [mediaFilter, setMediaFilter]       = useState<MediaFilter>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType]         = useState<'image' | 'video'>('image');
  const [uploadCaption, setUploadCaption]   = useState('');
  const [uploadFiles, setUploadFiles]       = useState<File[]>([]);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  const imagePosts    = mediaPosts.filter(m => m.type === 'image');
  const videoPosts    = mediaPosts.filter(m => m.type === 'video');
  const filteredMedia =
    mediaFilter === 'image' ? imagePosts :
    mediaFilter === 'video' ? videoPosts :
    mediaPosts;

  // Stable gradient keyed to a post's position in the full list
  const getGradient = (mediaId: string) => {
    const idx = mediaPosts.findIndex(m => m.id === mediaId);
    return MEDIA_GRADIENTS[(idx >= 0 ? idx : 0) % MEDIA_GRADIENTS.length];
  };

  // ── Upload handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(Array.from(e.target.files ?? []));
  };

  const cancelUpload = () => {
    setShowUploadForm(false);
    setUploadCaption('');
    setUploadFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostMedia = () => {
    const author  = 'Admin';
    const caption = uploadCaption.trim() || undefined;
    const count   = uploadFiles.length || 1;
    const now     = Date.now();

    const newPosts: EventMedia[] = Array.from({ length: count }, (_, i) => ({
      id: `MED-NEW-${now}-${i}`,
      memberId: '',
      memberName: author,
      type: uploadType,
      caption: caption ?? (uploadFiles[i] ? uploadFiles[i].name.replace(/\.[^/.]+$/, '') : undefined),
      postedAt: new Date(now + i * 1000).toISOString(),
    }));

    setMediaPosts(prev => [...newPosts, ...prev]);
    cancelUpload();
    toast.success(`${count} ${count === 1 ? 'item' : 'items'} posted successfully.`);
  };

  // ── Lightbox ────────────────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const getLightboxItems = (memberId: string) =>
    mediaPosts.filter(m => m.memberId === memberId);

  const openLightbox = (m: EventMedia) => {
    const items = getLightboxItems(m.memberId);
    const idx   = items.findIndex(i => i.id === m.id);
    setLightbox({ memberId: m.memberId, memberName: m.memberName, currentIndex: Math.max(0, idx) });
  };

  const closeLightbox = () => setLightbox(null);

  const lightboxItems  = lightbox ? getLightboxItems(lightbox.memberId) : [];
  const currentMedia   = lightbox ? lightboxItems[lightbox.currentIndex] ?? null : null;
  const lightboxTotal  = lightboxItems.length;

  const prevSlide = () =>
    setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex - 1 + lightboxTotal) % lightboxTotal } : null);

  const nextSlide = () =>
    setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex + 1) % lightboxTotal } : null);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const count = getLightboxItems(lightbox.memberId).length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex - 1 + count) % count } : null);
      if (e.key === 'ArrowRight') setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex + 1) % count } : null);
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  // ── Button style helpers ────────────────────────────────────────────────────
  const btnBase     = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  const btnGhost    = `${btnBase} border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800`;
  const btnDanger   = `${btnBase} border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20`;
  const btnWarn     = `${btnBase} border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-white dark:bg-neutral-900 hover:bg-amber-50 dark:hover:bg-amber-950/20`;
  const btnDisabled = `${btnBase} border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-60`;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',     label: 'Karyakram Overview'                       },
    ...(isMember ? [] : [{ id: 'participants' as Tab, label: `Participants (${allParticipants.length})` }]),
    // Members only see Media once the Karyakram has happened — nothing to post beforehand.
    ...((!isMember || past) ? [{ id: 'media' as Tab, label: `Media (${mediaPosts.length})` }] : []),
    { id: 'announcements', label: `Event Announcements (${eventAnnouncements.length})` },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0 flex gap-4">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.name} className="w-20 h-20 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{event.name}</h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-sm text-neutral-500 font-mono">Event Id: {event.id}</span>
                {isMember && (
                  <>
                    <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                    <span className="text-sm text-neutral-500">
                      {event.paymentType === 'paid' ? `Paid${formatPriceRange(event) ? ` · ${formatPriceRange(event)}` : ''}` : 'Free'}
                    </span>
                  </>
                )}
              </div>
              {isMember ? (
                <div className="flex flex-col gap-1 text-base text-neutral-700 dark:text-neutral-300 mb-3">
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 flex-shrink-0" /><span>{formatDateTime(event.startDate)}</span></div>
                  <div className="flex items-center gap-1.5">
                    {event.locationType === 'online' ? <Globe className="w-4 h-4 flex-shrink-0" /> : <MapPin className="w-4 h-4 flex-shrink-0" />}
                    <span>{event.locationType === 'online' ? 'Online Karyakram' : (event.venueAddress || `${event.activityCentre} · ${event.town} · ${event.region} · ${event.country}`)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatDateTime(event.startDate)}</span></div>
                  <div className="flex items-center gap-1">
                    {event.locationType === 'online' ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    <span>{event.locationType === 'online' ? 'Online Karyakram' : (event.venueAddress || `${event.activityCentre} · ${event.town} · ${event.region} · ${event.country}`)}</span>
                  </div>
                </div>
              )}
              {!isMember && (
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={event.status} />
                  {event.paymentType === 'paid' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 text-xs font-medium">
                      <CreditCard className="w-3 h-3" /> Paid{formatPriceRange(event) ? ` · ${formatPriceRange(event)}` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-medium">Free</span>
                  )}
                  {event.capacity && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs">
                      <UsersIcon className="w-3 h-3" /> Cap: {event.capacity}
                    </span>
                  )}
                </div>
              )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Events</SecondaryButton>

              {/* Member self-registration */}
              {isMember && !isCancelledOrCompleted && (
                !myParticipation ? (
                  blockedByCapacity ? (
                    <button
                      className={`${btnBase} border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 hover:bg-primary-100 dark:hover:bg-primary-950/40`}
                      title="This Karyakram has reached capacity — let us know you'd like to join if a spot opens up."
                      onClick={() => toast.success("Thanks — we've noted your interest and will notify you if a spot opens up.")}
                    >
                      <UsersIcon className="w-3.5 h-3.5" /> Interested to Join
                    </button>
                  ) : (
                    <button
                      className={`${btnBase} bg-primary-600 hover:bg-primary-700 text-white`}
                      onClick={handleRequestToAttendClick}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> {isFull ? 'Join Waiting List' : 'Register for Karyakram'}
                    </button>
                  )
                ) : myParticipation.rsvp === 'requested' ? (
                  <span className={`${btnBase} border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20`}>
                    <ClockIcon className="w-3.5 h-3.5" /> {myParticipation.waitlisted ? 'Waitlisted — awaiting a spot' : 'Requested — awaiting approval'}
                  </span>
                ) : myParticipation.rsvp === 'going' ? (
                  <span className={`${btnBase} border border-success-300 dark:border-success-700 text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-950/20`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Going
                  </span>
                ) : (
                  <span className={`${btnBase} border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950/20`}>
                    <XCircle className="w-3.5 h-3.5" /> Request Denied
                  </span>
                )
              )}

              {!isMember && (
                modifyOk ? (
                  <button className={btnGhost} onClick={onModify}><Edit className="w-3.5 h-3.5" /> Modify</button>
                ) : (
                  <button className={btnDisabled} title={event.status === 'completed' ? 'Completed Karyakrams cannot be edited.' : 'Cancelled Karyakrams cannot be edited.'} disabled><Edit className="w-3.5 h-3.5" /> Modify</button>
                )
              )}
              {!isMember && onClone && (
                <button className={btnGhost} onClick={onClone} title="Create a new Karyakram pre-filled with this one's details">
                  <Copy className="w-3.5 h-3.5" /> Clone Event
                </button>
              )}
              {!isMember && !isCancelledOrCompleted && (
                <button className={btnWarn} onClick={onCancel}><XCircle className="w-3.5 h-3.5" /> Cancel Karyakram</button>
              )}
              {!isMember && (
                deleteOk ? (
                  <button className={btnDanger} onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                ) : (
                  <button className={btnDisabled} title={event.status === 'completed' ? 'Completed Karyakrams cannot be deleted.' : 'This Karyakram can no longer be deleted after it starts.'} disabled>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )
              )}
            </div>
          </div>

          {!isMember && past && !isCancelledOrCompleted && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>This event has already started. Modify and Delete actions are locked.</span>
            </div>
          )}
        </div>

        {/* Event Banner — member view (same treatment as the Suchana detail page image) */}
        {isMember && event.imageUrl && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden mb-6">
            <img src={event.imageUrl} alt={event.name} className="w-full object-cover max-h-96" />
          </div>
        )}

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Tabs */}
          <div className="flex-1 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col">

            {/* Tab bar */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
              <div className="flex px-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
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
            <div className="p-6 bg-white dark:bg-neutral-950 flex-1">

              {/* ── EVENT OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!isMember && (
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StatCard
                        label="Registrants"
                        value={`${nonDeniedCount}${event.capacity ? ` / ${event.capacity}` : ''}`}
                        icon={UsersIcon}
                        valueClassName="text-primary-600 dark:text-primary-400"
                        className="bg-neutral-50 dark:bg-neutral-900/50"
                      />
                      <StatCard
                        label="Total Revenue"
                        value={`£${totalRevenue.toFixed(2)}`}
                        icon={CreditCard}
                        valueClassName="text-success-600 dark:text-success-400"
                        className="bg-neutral-50 dark:bg-neutral-900/50"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <div className={`bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden ${!isMember ? 'md:col-span-2' : ''}`} style={isMember ? { borderTop: '3px solid #172E4D' } : undefined}>
                      {isMember ? (
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                          <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Karyakram Description</h4>
                        </div>
                      ) : (
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">Karyakram Description</h4>
                      )}
                      <div
                        className="px-5 py-4 text-[14px] text-neutral-700 dark:text-neutral-300 leading-relaxed prose dark:prose-invert max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    </div>
                  )}

                  {/* Ticket Type options — member view */}
                  {isMember && event.paymentType === 'paid' && event.priceCategories && event.priceCategories.length > 0 && (
                    <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <CreditCard className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Ticket Type Options</h4>
                      </div>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {event.priceCategories.map(cat => (
                          <div key={cat.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{cat.label}</p>
                              {cat.description && (
                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">{cat.description}</p>
                              )}
                            </div>
                            <span className="text-[15px] font-semibold text-neutral-900 dark:text-white flex-shrink-0">£{cat.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Your Responses — member view, only once registered */}
                  {isMember && myParticipation && event.customQuestions && event.customQuestions.length > 0 && (
                    <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <ListChecks className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">Your Responses</h4>
                      </div>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {event.customQuestions.map(q => {
                          const ans = myParticipation.customAnswers?.[q.id];
                          const display =
                            ans === undefined || ans === '' ? '—' :
                            Array.isArray(ans) ? (ans.length > 0 ? ans.join(', ') : '—') :
                            typeof ans === 'boolean' ? (ans ? 'Yes' : 'No') :
                            String(ans);
                          return (
                            <div key={q.id} className="px-5 py-3.5">
                              <p className="text-[13px] text-neutral-500 dark:text-neutral-400">{q.label}</p>
                              <p className="text-[15px] font-medium text-neutral-900 dark:text-white mt-0.5">{display}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isMember && (
                    <>
                      {/* Target Audience — admin only */}
                      {(event.filterAgeCategories?.length || event.filterGenders?.length || event.filterJobTitles?.length) ? (
                        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                            Target Audience
                          </h4>
                          <div className="px-6 py-4 space-y-4">
                            {event.filterAgeCategories && event.filterAgeCategories.length > 0 && (
                              <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Age Category</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {event.filterAgeCategories.map(c => (
                                    <span key={c} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 text-xs font-medium">
                                      {AUDIENCE_AGE_LABELS[c] ?? c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {event.filterGenders && event.filterGenders.length > 0 && (
                              <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Gender</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {event.filterGenders.map(g => (
                                    <span key={g} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 text-xs font-medium capitalize">
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {event.filterJobTitles && event.filterJobTitles.length > 0 && (
                              <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Role Type / Job Title</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {event.filterJobTitles.map(r => (
                                    <span key={r} className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg px-6 py-4">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">Target Audience:</span> All members (no filters applied)
                          </p>
                        </div>
                      )}

                      {/* Additional Questions — admin */}
                      {event.customQuestions && event.customQuestions.length > 0 && (
                        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-primary-600" /> Additional Registration Questions
                          </h4>
                          <div className="px-6 py-4 space-y-2">
                            {event.customQuestions.map(q => (
                              <div key={q.id} className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-neutral-700 dark:text-neutral-300">{q.label}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-neutral-400 capitalize">{q.type}</span>
                                  {q.required && (
                                    <span className="px-1.5 py-0.5 rounded bg-error-50 dark:bg-error-950/20 text-error-600 dark:text-error-400 text-[10px] font-medium">Required</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Guest Registration — admin always; members once registered for an upcoming Karyakram */}
                  {event.guestRegistrationEnabled && (!isMember || (myParticipation && !past)) && (
                    <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={isMember ? { borderTop: '3px solid #172E4D' } : undefined}>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary-600" /> Guest Registration
                      </h4>
                      <div className="px-6 py-4">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Share this link to allow non-members to register for this event.</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-neutral-600 dark:text-neutral-400 break-all">
                            {`https://hssuk.org/events/${event.id}/register`}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://hssuk.org/events/${event.id}/register`);
                              toast.success('Registration link copied to clipboard.');
                            }}
                            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Check-in QR Code — admin only */}
                  {!isMember && (
                    <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-primary-600" /> Event Check-in QR Code
                      </h4>
                      <div className="px-6 py-4 flex items-center gap-4">
                        <img
                          src={qrCodeUrl(`https://hssuk.org/events/${event.id}/checkin`, 140)}
                          alt="Event check-in QR code"
                          className="w-[140px] h-[140px] rounded-lg border border-neutral-200 dark:border-neutral-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Scan at the venue to check in participants for this Karyakram.</p>
                          <code className="block text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-neutral-600 dark:text-neutral-400 break-all">
                            {`https://hssuk.org/events/${event.id}/checkin`}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions — admin always; members once registered for an upcoming Karyakram */}
                  {(!isMember || (myParticipation && !past)) && (
                  <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={isMember ? { borderTop: '3px solid #172E4D' } : undefined}>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-primary-600" /> Terms &amp; Conditions
                    </h4>
                    {event.termsSections && event.termsSections.length > 0 ? (
                      event.termsSections.map(section => (
                        <div key={section.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
                          <h5 className="px-5 pt-4 text-sm font-semibold text-neutral-900 dark:text-white">{section.title}</h5>
                          <div
                            className="px-5 py-3 text-[13px] text-neutral-600 dark:text-neutral-400 prose dark:prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: section.description }}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="px-5 py-4 text-[13px] text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                        {event.termsAndConditions ?? EVENT_TERMS_AND_CONDITIONS}
                      </p>
                    )}
                  </div>
                  )}
                </div>
              )}

              {/* ── PARTICIPANTS ── */}
              {activeTab === 'participants' && (viewingParticipantId ? (() => {
                const vp = allParticipants.find(p => p.memberId === viewingParticipantId);
                if (!vp) return null;
                const vMember = mockMembers.find(mem => mem.id === vp.memberId);
                const vTicket = event.priceCategories?.find(c => c.id === vp.ticketTypeId);
                const vTicketPrice = vp.discountCodeUsed ? 0 : (vTicket?.price ?? 0);
                const vAmountPaid = vTicketPrice + (vp.donationAmount ?? 0);
                const vRegDate = vp.registeredAt ? new Date(vp.registeredAt) : null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => setViewingParticipantId(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Participants
                      </button>

                      {editingRegistration ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingRegistration(false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setParticipants(prev => prev.map(p => p.memberId === vp.memberId ? { ...p, customAnswers: editAnswers } : p));
                              setEditingRegistration(false);
                              toast.success('Registration updated.');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleResendConfirmation(vp.email)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Resend Confirmation Email
                          </button>
                          {event.customQuestions && event.customQuestions.length > 0 && (
                            <button
                              onClick={() => {
                                setEditAnswers(vp.customAnswers ?? {});
                                setEditingRegistration(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit Registration
                            </button>
                          )}
                          {vAmountPaid > 0 && (
                            <button
                              onClick={() => handleTriggerRefund(vp.memberId, vAmountPaid)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-white dark:bg-neutral-900 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                            >
                              <Undo2 className="w-3.5 h-3.5" /> Trigger Refund
                            </button>
                          )}
                          {vp.rsvp !== 'denied' && (
                            <button
                              onClick={() => handleCancelRegistration(vp.memberId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancel Registration
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Registration Details
                      </h4>
                      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Participant Name</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vMember?.name ?? vp.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Member ID</label>
                          <p className="text-sm font-mono text-neutral-900 dark:text-white">{vp.memberId}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Date of Registration</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vRegDate ? formatDate(vRegDate.toISOString()) : 'Not recorded'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Time of Registration</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vRegDate ? vRegDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not recorded'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Ticket Type</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.ticketTypeLabel ?? '—'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Status</label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              vp.rsvp === 'going'
                                ? 'bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800'
                                : vp.rsvp === 'requested'
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-error-50 dark:bg-error-950/20 text-error-700 dark:text-error-400 border border-error-200 dark:border-error-800'
                            }`}>
                              {vp.rsvp === 'going' ? 'Approved' : vp.rsvp}
                            </span>
                            {vp.waitlisted && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                Waitlisted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Payment Information
                      </h4>
                      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Ticket Price</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vTicket ? `£${vTicket.price}` : 'Free event'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Discount Code Applied</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.discountCodeUsed ?? 'None'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Amount Paid</label>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">£{vAmountPaid.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Donation Information
                      </h4>
                      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Donation Amount</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.donationAmount ? `£${vp.donationAmount}` : 'No donation'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Gift Aid Claimed</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.giftAidClaimed ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {event.customQuestions && event.customQuestions.length > 0 && (
                      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                          Additional Registration Questions
                        </h4>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {event.customQuestions.map(q => {
                            const ans = vp.customAnswers?.[q.id];
                            const display =
                              ans === undefined || ans === '' ? '—' :
                              Array.isArray(ans) ? (ans.length > 0 ? ans.join(', ') : '—') :
                              typeof ans === 'boolean' ? (ans ? 'Yes' : 'No') :
                              String(ans);
                            if (!editingRegistration) {
                              return (
                                <div key={q.id} className="px-6 py-3.5">
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{q.label}</p>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">{display}</p>
                                </div>
                              );
                            }
                            const editAns = editAnswers[q.id];
                            return (
                              <div key={q.id} className="px-6 py-3.5">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">{q.label}</p>
                                {q.type === 'text' && (
                                  <input
                                    type="text"
                                    value={(editAns as string) ?? ''}
                                    onChange={e => setEditAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                )}
                                {q.type === 'date' && (
                                  <input
                                    type="date"
                                    value={(editAns as string) ?? ''}
                                    onChange={e => setEditAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                )}
                                {q.type === 'dropdown' && (
                                  <select
                                    value={(editAns as string) ?? ''}
                                    onChange={e => setEditAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  >
                                    <option value="">Select…</option>
                                    {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                )}
                                {q.type === 'radio' && (
                                  <div className="space-y-1">
                                    {(q.options ?? []).map(opt => (
                                      <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`edit-${q.id}`}
                                          checked={editAns === opt}
                                          onChange={() => setEditAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        />
                                        {opt}
                                      </label>
                                    ))}
                                  </div>
                                )}
                                {q.type === 'checkbox' && (q.options && q.options.length > 0 ? (
                                  <div className="space-y-1">
                                    {q.options.map(opt => {
                                      const sel = (editAns as string[]) ?? [];
                                      return (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={sel.includes(opt)}
                                            onChange={e => setEditAnswers(prev => {
                                              const cur = (prev[q.id] as string[]) ?? [];
                                              return { ...prev, [q.id]: e.target.checked ? [...cur, opt] : cur.filter(o => o !== opt) };
                                            })}
                                          />
                                          {opt}
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={(editAns as boolean) ?? false}
                                      onChange={e => setEditAnswers(prev => ({ ...prev, [q.id]: e.target.checked }))}
                                    />
                                    Yes
                                  </label>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Terms &amp; Conditions
                      </h4>
                      <div className="px-6 py-4">
                        <p className="text-sm text-neutral-900 dark:text-white">
                          {vp.termsAccepted ? 'Accepted at the time of registration.' : 'Not recorded.'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Other Registration Data
                      </h4>
                      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Email</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Phone</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.phone || '—'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Participant Type</label>
                          <p className="text-sm text-neutral-900 dark:text-white capitalize">{vp.memberType}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Coordinator</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.isCoordinator ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Refund Requested</label>
                          <p className="text-sm text-neutral-900 dark:text-white">{vp.refundRequested ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Compliance Status
                      </h4>
                      <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">First Aid</label>
                          <ComplianceBadge status={vMember?.compliance.firstAid} />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Safeguarding</label>
                          <ComplianceBadge status={vMember?.compliance.safeguardingTraining} />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">DBS</label>
                          <ComplianceBadge status={vMember?.compliance.dbs} />
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {([
                        { id: 'all',        label: 'All',          count: allParticipants.length },
                        { id: 'requested',  label: 'Requested',    count: requestedList.length   },
                        { id: 'going',      label: 'Approved',     count: goingList.length       },
                        { id: 'denied',     label: 'Denied',       count: deniedList.length      },
                        { id: 'waitlisted', label: 'Waiting List', count: waitlistedList.length  },
                        { id: 'refund',     label: 'Refund',       count: refundList.length      },
                      ] as { id: RsvpFilter; label: string; count: number }[]).map(f => (
                        <button
                          key={f.id}
                          onClick={() => setRsvpFilter(f.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            rsvpFilter === f.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {f.label}
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                            rsvpFilter === f.id ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                          }`}>{f.count}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={participantSearch}
                          onChange={e => setParticipantSearch(e.target.value)}
                          placeholder="Search participants..."
                          className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
                        />
                      </div>
                      <button
                        onClick={handleExportParticipants}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Export Participants
                      </button>
                    </div>
                  </div>
                  {filteredParticipants.length > 0 ? (
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                            {['#','First Name','Last Name','Member ID','Email','Phone','Post Code','Type','Ticket Type', ...(isMember ? [] : ['Action'])].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {filteredParticipants.map((p, idx) => {
                            const member = mockMembers.find(mem => mem.id === p.memberId);
                            const postCode = member?.postCode;
                            const firstName = member?.firstName ?? p.name.split(' ')[0];
                            const lastName = member?.surname ?? p.name.split(' ').slice(1).join(' ');
                            return (
                            <tr key={p.memberId} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                              <td className="px-4 py-3 text-xs text-neutral-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => onViewMember?.(p.memberId)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 text-left">{firstName}</button>
                                  {p.isCoordinator && (
                                    <span title="Coordinator" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 flex-shrink-0">
                                      <ShieldCheck className="w-3 h-3" />
                                    </span>
                                  )}
                                  {p.discountCodeUsed && (
                                    <span title={`Registered free with code "${p.discountCodeUsed}"`} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800 flex-shrink-0">
                                      Free (code)
                                    </span>
                                  )}
                                  {p.waitlisted && (
                                    <span title="Registered after capacity was reached" className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex-shrink-0">
                                      Waitlisted
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button onClick={() => onViewMember?.(p.memberId)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 text-left">{lastName}</button>
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}>{p.memberId}</td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}>
                                <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                  <Mail className="w-3 h-3 flex-shrink-0 text-neutral-400" /><span className="truncate max-w-[160px]">{p.email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}>
                                {p.phone ? (
                                  <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Phone className="w-3 h-3 flex-shrink-0 text-neutral-400" /><span>{p.phone}</span>
                                  </div>
                                ) : <span className="text-xs text-neutral-400">—</span>}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}>{postCode ?? '—'}</td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}><TypeBadge type={p.memberType} /></td>
                              <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer" onClick={() => onViewMember?.(p.memberId)}>{p.ticketTypeLabel ?? <span className="text-neutral-400">—</span>}</td>
                              {!isMember && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setViewingParticipantId(p.memberId)}
                                    title="View registration details"
                                    aria-label="View registration details"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleResendConfirmation(p.email)}
                                    title="Resend confirmation email"
                                    aria-label="Resend confirmation email"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  {p.refundRequested && (
                                    <button
                                      onClick={() => handleProcessRefund(p.memberId)}
                                      title="Refund requested"
                                      aria-label="Refund requested"
                                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors flex-shrink-0"
                                    >
                                      <Undo2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {p.rsvp === 'requested' ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleApprove(p.memberId)}
                                        title="Approve"
                                        aria-label="Approve"
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-success-600 hover:bg-success-700 text-white transition-colors"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeny(p.memberId)}
                                        title="Deny"
                                        aria-label="Deny"
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : p.rsvp === 'going' ? (
                                    p.isCoordinator ? (
                                      <button
                                        onClick={() => handleRemoveCoordinator(p.memberId)}
                                        title="Remove as Coordinator"
                                        aria-label="Remove as Coordinator"
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors"
                                      >
                                        <ShieldOff className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleMakeCoordinator(p.memberId)}
                                        title="Make Coordinator"
                                        aria-label="Make Coordinator"
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-white dark:bg-neutral-900 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-xs text-neutral-400">—</span>
                                  )}
                                  </div>
                                </td>
                              )}
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <UsersIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No participants in this category</p>
                      <p className="text-xs text-neutral-400 mt-1">Try switching to a different RSVP filter above.</p>
                    </div>
                  )}
                </div>
              ))}

              {/* ── MEDIA ── */}
              {activeTab === 'media' && (
                <div className="space-y-4">

                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Media Feed</h3>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {mediaPosts.length} {mediaPosts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUploadForm(v => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Media
                    </button>
                  </div>

                  {/* Upload form */}
                  {showUploadForm && (
                    <div className="border border-primary-200 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-950/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Post Media</h4>
                        <button onClick={cancelUpload} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-4 h-4" /></button>
                      </div>

                      {/* Type + Author */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Media Type</label>
                          <div className="flex gap-2">
                            {(['image', 'video'] as const).map(t => (
                              <label key={t} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 justify-center ${
                                uploadType === t
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                              }`}>
                                <input type="radio" name="uploadMediaType" value={t} checked={uploadType === t} onChange={() => { setUploadType(t); setUploadFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="sr-only" />
                                {t === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                                <span className="text-xs font-medium capitalize">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                          Caption <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={uploadCaption}
                          onChange={e => setUploadCaption(e.target.value)}
                          placeholder="Add a caption..."
                          rows={2}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Drop zone */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-700 rounded-xl p-6 text-center cursor-pointer transition-colors"
                        >
                          {uploadFiles.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                {uploadFiles.length} {uploadFiles.length === 1 ? 'file' : 'files'} selected
                              </p>
                              <p className="text-xs text-neutral-400 max-w-xs truncate">
                                {uploadFiles.slice(0, 2).map(f => f.name).join(', ')}
                                {uploadFiles.length > 2 ? ` +${uploadFiles.length - 2} more` : ''}
                              </p>
                              <button
                                onClick={e => { e.stopPropagation(); setUploadFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-xs text-error-600 dark:text-error-400 hover:underline mt-1"
                              >
                                Clear selection
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              {uploadType === 'image' ? <ImageIcon className="w-7 h-7 text-neutral-400" /> : <Video className="w-7 h-7 text-neutral-400" />}
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="text-primary-600 dark:text-primary-400 font-medium">Click to select</span> or drag and drop
                              </p>
                              <p className="text-xs text-neutral-400">
                                {uploadType === 'image' ? 'JPG, PNG, GIF, WEBP · multiple files supported' : 'MP4, MOV, AVI, WEBM · up to 100 MB each'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                        <button onClick={cancelUpload} className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={handlePostMedia}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Post{uploadFiles.length > 1 ? ` ${uploadFiles.length} Items` : ' Media'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {([
                      { id: 'all',   label: 'All',    count: mediaPosts.length, icon: null    },
                      { id: 'image', label: 'Images', count: imagePosts.length, icon: 'image' },
                      { id: 'video', label: 'Videos', count: videoPosts.length, icon: 'video' },
                    ] as { id: MediaFilter; label: string; count: number; icon: string | null }[]).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setMediaFilter(f.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          mediaFilter === f.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {f.icon === 'image' && <ImageIcon className="w-3 h-3" />}
                        {f.icon === 'video' && <Video className="w-3 h-3" />}
                        {f.label}
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                          mediaFilter === f.id ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}>{f.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Media grid */}
                  {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMedia.map(m => {
                        const grad     = getGradient(m.id);
                        const initials = m.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const userCount = mediaPosts.filter(p => p.memberId === m.memberId).length;
                        return (
                          <div key={m.id} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-md dark:hover:shadow-neutral-900/60 transition-shadow group">

                            {/* Thumbnail — click to open lightbox */}
                            <div
                              className="relative aspect-video overflow-hidden cursor-pointer"
                              onClick={() => openLightbox(m)}
                            >
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.caption ?? 'Media'}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                                  {m.type === 'image' && <ImageIcon className="w-8 h-8 text-white/40" />}
                                </div>
                              )}

                              {/* Darken overlay on hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                              {/* Video play overlay */}
                              {m.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${m.imageUrl ? 'bg-black/50' : 'bg-black/30 backdrop-blur-sm'}`}>
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              )}

                              {/* Type badge */}
                              <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                                {m.type === 'video' ? <><Video className="w-2.5 h-2.5" /> Video</> : <><ImageIcon className="w-2.5 h-2.5" /> Photo</>}
                              </span>

                              {/* User's total count badge */}
                              {userCount > 1 && (
                                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-semibold backdrop-blur-sm">
                                  <ImageIcon className="w-2.5 h-2.5" /> {userCount}
                                </span>
                              )}
                            </div>

                            {/* Card body */}
                            <div className="p-3">
                              {m.caption && (
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2.5 line-clamp-2 leading-relaxed">{m.caption}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-[9px] font-bold text-white leading-none">{initials}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  {m.memberId && onViewMember ? (
                                    <button onClick={() => onViewMember(m.memberId)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 truncate block text-left w-full">
                                      {m.memberName}
                                    </button>
                                  ) : (
                                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{m.memberName}</p>
                                  )}
                                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                    {sharedFormatDateTime(m.postedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Camera className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No media posts yet</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {mediaFilter !== 'all'
                          ? `No ${mediaFilter}s have been posted for this event.`
                          : 'Upload the first image or video using the button above.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── EVENT ANNOUNCEMENTS ── */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Event Announcements</h3>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {eventAnnouncements.length} {eventAnnouncements.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    {!isMember && (
                      <button
                        onClick={() => setShowAnnouncementForm(v => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-medium transition-colors"
                      >
                        <Megaphone className="w-3.5 h-3.5" /> Post Announcement
                      </button>
                    )}
                  </div>

                  {showAnnouncementForm && (
                    <div className="border border-primary-200 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-950/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">New Announcement</h4>
                        <button onClick={resetAnnouncementForm} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Title</label>
                        <input
                          type="text"
                          value={announcementTitle}
                          onChange={e => setAnnouncementTitle(e.target.value)}
                          placeholder="e.g. Parking update"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Message</label>
                        <RichTextEditor
                          value={announcementBody}
                          onChange={html => {
                            setAnnouncementBody(html);
                            const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
                            setAnnouncementBodyWordCount(text === '' ? 0 : text.split(/\s+/).filter(Boolean).length);
                          }}
                          placeholder="Write the announcement..."
                        />
                        <div className="flex items-center justify-end mt-1.5">
                          <span className={`text-xs font-medium ${
                            announcementBodyIsOver ? 'text-red-600 dark:text-red-400'
                            : announcementBodyWordCount >= 130 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-neutral-400 dark:text-neutral-500'
                          }`}>
                            {announcementBodyWordCount} / 150 words{announcementBodyIsOver ? ' — limit exceeded' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Cooldown — fixed, informational */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">How long before a member sees this again</label>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50">
                          <span className="text-sm text-neutral-900 dark:text-white font-medium">5 minutes</span>
                          <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">Fixed</span>
                        </div>
                      </div>

                      {/* Demographic Filters */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                          Demographic Filters <span className="text-neutral-400 font-normal">(optional — leave blank to notify all participants)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { id: 'requested',  label: 'Requested'    },
                            { id: 'going',      label: 'Approved'     },
                            { id: 'waitlisted', label: 'Waiting List' },
                          ] as { id: 'requested' | 'going' | 'waitlisted'; label: string }[]).map(opt => {
                            const checked = announcementTargets.includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
                                  checked
                                    ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() => setAnnouncementTargets(prev => prev.includes(opt.id) ? prev.filter(t => t !== opt.id) : [...prev, opt.id])}
                                />
                                {checked && <Check className="w-3.5 h-3.5" />}
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notification Channels */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Notification Channels</label>
                        <div className="space-y-3">
                          {/* Push */}
                          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Push Notification</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={announcementPushEnabled} onChange={e => setAnnouncementPushEnabled(e.target.checked)} />
                                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                              </label>
                            </div>
                            {announcementPushEnabled && (
                              <div className="space-y-3">
                                <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                  {([{ value: 'instant', label: '⚡ Send Instantly' }, { value: 'scheduled', label: '🕐 Schedule' }] as const).map(opt => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => setAnnouncementPushSchedule(opt.value)}
                                      className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                        announcementPushSchedule === opt.value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                                {announcementPushSchedule === 'scheduled' && (
                                  <input
                                    type="datetime-local"
                                    value={announcementPushScheduledAt}
                                    onChange={e => setAnnouncementPushScheduledAt(e.target.value)}
                                    className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Email */}
                          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Email Notification</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={announcementEmailEnabled} onChange={e => setAnnouncementEmailEnabled(e.target.checked)} />
                                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                              </label>
                            </div>
                            {announcementEmailEnabled && (
                              <div className="space-y-3">
                                <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                  {([{ value: 'instant', label: '⚡ Send Instantly' }, { value: 'scheduled', label: '🕐 Schedule' }] as const).map(opt => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => setAnnouncementEmailSchedule(opt.value)}
                                      className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                        announcementEmailSchedule === opt.value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                                {announcementEmailSchedule === 'scheduled' && (
                                  <input
                                    type="datetime-local"
                                    value={announcementEmailScheduledAt}
                                    onChange={e => setAnnouncementEmailScheduledAt(e.target.value)}
                                    className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          {/* In-app bell — always on, informational */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">In-App Bell Notification</p>
                              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Participants always receive this announcement in their notification bell. This cannot be disabled.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <SecondaryButton onClick={resetAnnouncementForm}>Cancel</SecondaryButton>
                        <button
                          onClick={handlePostAnnouncement}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                        >
                          {(announcementPushEnabled && announcementPushSchedule === 'scheduled') || (announcementEmailEnabled && announcementEmailSchedule === 'scheduled') ? 'Schedule Announcement' : 'Post Announcement'}
                        </button>
                      </div>
                    </div>
                  )}

                  {eventAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                      {eventAnnouncements.map(a => (
                        <div key={a.id} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                <Megaphone className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{a.title}</h4>
                                <p className="text-xs text-neutral-400 mt-0.5">{a.postedBy} · {formatDateTime(a.postedAt)}</p>
                              </div>
                            </div>
                            {!isMember && (
                              <button
                                onClick={() => handleDeleteAnnouncement(a.id)}
                                title="Delete announcement"
                                aria-label="Delete announcement"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 leading-relaxed prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: a.body }} />
                          {!isMember && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-3">
                              <span className="text-xs text-neutral-400">Sent to:</span>
                              {a.targetStatuses && a.targetStatuses.length > 0 ? (
                                a.targetStatuses.map(s => (
                                  <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                    {s === 'going' ? 'Approved' : s === 'waitlisted' ? 'Waiting List' : 'Requested'}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                  All Participants
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Megaphone className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No announcements yet</p>
                      <p className="text-xs text-neutral-400 mt-1">Updates about this Karyakram will appear here.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>

    {/* ── LIGHTBOX ─────────────────────────────────────────────────────────── */}
    {lightbox && currentMedia && (
      <div
        className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeLightbox}
      >
        <div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-neutral-950"
          onClick={e => e.stopPropagation()}
        >
          {/* Lightbox top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-neutral-900/80">
            {/* User info */}
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(currentMedia.id)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[9px] font-bold text-white">
                  {lightbox.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{lightbox.memberName}</p>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {lightboxTotal} {lightboxTotal === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Counter */}
            <span className="text-xs font-medium text-neutral-300 tabular-nums">
              {lightbox.currentIndex + 1} / {lightboxTotal}
            </span>

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media area */}
          <div className="relative flex items-center justify-center bg-black min-h-[50vh]">
            {/* Left arrow */}
            {lightboxTotal > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Content */}
            <div className="w-full flex items-center justify-center py-2">
              {currentMedia.imageUrl ? (
                <img
                  src={fullsizeUrl(currentMedia.imageUrl)}
                  alt={currentMedia.caption ?? 'Media'}
                  className="max-h-[62vh] max-w-full object-contain select-none"
                  draggable={false}
                />
              ) : (
                <div className={`w-full max-w-2xl aspect-video bg-gradient-to-br ${getGradient(currentMedia.id)} flex items-center justify-center mx-4 rounded-lg`}>
                  {currentMedia.type === 'video' ? (
                    <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  ) : (
                    <ImageIcon className="w-12 h-12 text-white/40" />
                  )}
                </div>
              )}
            </div>

            {/* Right arrow */}
            {lightboxTotal > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Lightbox footer */}
          <div className="px-5 py-4 bg-neutral-900/80 border-t border-white/10 space-y-1">
            {currentMedia.caption && (
              <p className="text-sm text-white/90 leading-relaxed">{currentMedia.caption}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {sharedFormatDateTime(currentMedia.postedAt)}
              </span>
              <span className="flex items-center gap-1">
                {currentMedia.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span className="capitalize">{currentMedia.type}</span>
              </span>
            </div>

            {/* Dot navigation strip */}
            {lightboxTotal > 1 && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {lightboxItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setLightbox(p => p ? { ...p, currentIndex: idx } : null)}
                    className={`transition-all rounded-full ${
                      idx === lightbox.currentIndex
                        ? 'w-5 h-1.5 bg-primary-400'
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── REQUEST TO ATTEND — ADDITIONAL QUESTIONS ────────────────────────────── */}
    {showAttendQuestions && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowAttendQuestions(false)}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <h4 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary-600" /> Register for Karyakram
            </h4>
            <button onClick={() => setShowAttendQuestions(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">

            {/* 1. Ticket type (if applicable) */}
            {hasTicketTypes && (
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary-600" /> Ticket Type <span className="text-error-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {event.priceCategories!.map(cat => (
                    <label
                      key={cat.id}
                      className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${
                        selectedTicketId === cat.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                          : 'border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ticketType"
                        value={cat.id}
                        checked={selectedTicketId === cat.id}
                        onChange={() => { setSelectedTicketId(cat.id); setTicketError(''); }}
                        className="mt-0.5 border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium text-neutral-900 dark:text-white">{cat.label}</span>
                          <span className="font-semibold text-neutral-900 dark:text-white flex-shrink-0">£{cat.price}</span>
                        </span>
                        {cat.description && (
                          <span className="block text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{cat.description}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {ticketError && <p className="text-xs text-error-600 mt-1">{ticketError}</p>}
              </div>
            )}

            {eventHasCoupon && (
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                  Discount / Free Registration Code <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value); setDiscountCodeError(''); }}
                  placeholder="Enter code if you have one"
                  className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    discountCodeError
                      ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30'
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                  }`}
                />
                {discountCodeError && <p className="text-xs text-error-600 mt-1">{discountCodeError}</p>}
              </div>
            )}

            {/* 2. Additional questions (if applicable) */}
            {(event.customQuestions ?? []).map(q => (
              <div key={q.id}>
                <div className="mb-2">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                    {q.label} {q.required && <span className="text-error-500">*</span>}
                  </label>
                  {q.description && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{q.description}</p>
                  )}
                </div>

                {q.type === 'text' && (
                  <input
                    type="text"
                    value={(attendAnswers[q.id] as string) ?? ''}
                    onChange={e => setAttendAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}

                {q.type === 'dropdown' && (
                  <select
                    value={(attendAnswers[q.id] as string) ?? ''}
                    onChange={e => setAttendAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select…</option>
                    {(q.options ?? []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {q.type === 'checkbox' && (
                  <div className="space-y-1.5">
                    {(q.options ?? []).map(opt => {
                      const selected = (attendAnswers[q.id] as string[]) ?? [];
                      const checked = selected.includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => setAttendAnswers(prev => {
                              const cur = (prev[q.id] as string[]) ?? [];
                              const next = e.target.checked ? [...cur, opt] : cur.filter(o => o !== opt);
                              return { ...prev, [q.id]: next };
                            })}
                            className="rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                          />
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
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={(attendAnswers[q.id] as string) === opt}
                          onChange={() => setAttendAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className="border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'date' && (
                  <input
                    type="date"
                    value={(attendAnswers[q.id] as string) ?? ''}
                    onChange={e => setAttendAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            {/* 3. Donation (if applicable) */}
            {event.donationEnabled && (
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                  Donation <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                {event.donationDescription && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">{event.donationDescription}</p>
                )}
                {event.donationAmounts && event.donationAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {event.donationAmounts.map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDonationAmount(String(amt))}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          donationAmount === String(amt)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        £{amt}
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-sm pl-6 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={giftAidChecked}
                    onChange={e => setGiftAidChecked(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Receive Gift Aid</span>
                </label>
              </div>
            )}

            {/* 4. Terms & Conditions — always shown */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2">
                <ScrollText className="w-3.5 h-3.5 text-primary-600" /> Terms &amp; Conditions
              </label>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-neutral-50 dark:bg-neutral-900">
                {event.termsSections && event.termsSections.length > 0 ? (
                  event.termsSections.map(section => (
                    <div key={section.id} className="mb-2 last:mb-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{section.title}</p>
                      <div
                        className="text-xs text-neutral-600 dark:text-neutral-400 prose dark:prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.description }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                    {event.termsAndConditions ?? EVENT_TERMS_AND_CONDITIONS}
                  </p>
                )}
              </div>
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => { setAgreedToTerms(e.target.checked); setTermsError(''); }}
                  className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                />
                <span>I agree to the Terms and Conditions <span className="text-error-500">*</span></span>
              </label>
              <p className="text-xs text-neutral-400 mt-1 pl-6">This is mandatory and will be recorded with your registration.</p>
              {termsError && <p className="text-xs text-error-600 mt-1">{termsError}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <SecondaryButton onClick={() => setShowAttendQuestions(false)}>Cancel</SecondaryButton>
            <button
              className={`${btnBase} bg-primary-600 hover:bg-primary-700 text-white`}
              onClick={handleSubmitAttendQuestions}
            >
              <Check className="w-3.5 h-3.5" /> {requiresPayment ? 'Pay and Register' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── PAYMENT DETAILS ──────────────────────────────────────────────────── */}
    {showPaymentDetails && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowPaymentDetails(false)}
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <h4 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary-600" /> Payment Details
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">All fields are required</p>
          </div>

          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Amount</label>
              {event.donationAmounts && event.donationAmounts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.donationAmounts.map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => { setPaymentAmount(String(amt)); setPaymentErrors(prev => ({ ...prev, amount: '' })); }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        paymentAmount === String(amt)
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      £{amt}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={e => { setPaymentAmount(e.target.value); setPaymentErrors(prev => ({ ...prev, amount: '' })); }}
                  placeholder="0.00"
                  className={`w-full text-sm pl-6 pr-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    paymentErrors.amount ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                  }`}
                />
              </div>
              {paymentErrors.amount && <p className="text-xs text-error-600 mt-1">{paymentErrors.amount}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Email address</label>
              <input
                type="email"
                value={paymentEmail}
                onChange={e => { setPaymentEmail(e.target.value); setPaymentErrors(prev => ({ ...prev, email: '' })); }}
                placeholder="you@example.com"
                className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  paymentErrors.email ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                }`}
              />
              {paymentErrors.email && <p className="text-xs text-error-600 mt-1">{paymentErrors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Card number</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={paymentCardNumber}
                  onChange={e => { setPaymentCardNumber(e.target.value); setPaymentErrors(prev => ({ ...prev, cardNumber: '' })); }}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full text-sm pl-9 pr-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    paymentErrors.cardNumber ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                  }`}
                />
              </div>
              {paymentErrors.cardNumber && <p className="text-xs text-error-600 mt-1">{paymentErrors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Expiry date</label>
                <input
                  type="text"
                  value={paymentExpiry}
                  onChange={e => { setPaymentExpiry(e.target.value); setPaymentErrors(prev => ({ ...prev, expiry: '' })); }}
                  placeholder="MM / YY"
                  className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    paymentErrors.expiry ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                  }`}
                />
                {paymentErrors.expiry && <p className="text-xs text-error-600 mt-1">{paymentErrors.expiry}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">CVC / CVV</label>
                <input
                  type="text"
                  value={paymentCVC}
                  onChange={e => { setPaymentCVC(e.target.value); setPaymentErrors(prev => ({ ...prev, cvc: '' })); }}
                  placeholder="•••"
                  className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    paymentErrors.cvc ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                  }`}
                />
                {paymentErrors.cvc && <p className="text-xs text-error-600 mt-1">{paymentErrors.cvc}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Cardholder name</label>
              <input
                type="text"
                value={paymentCardholderName}
                onChange={e => { setPaymentCardholderName(e.target.value); setPaymentErrors(prev => ({ ...prev, cardholderName: '' })); }}
                placeholder="Name as it appears on card"
                className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  paymentErrors.cardholderName ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                }`}
              />
              {paymentErrors.cardholderName && <p className="text-xs text-error-600 mt-1">{paymentErrors.cardholderName}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Billing postcode</label>
              <input
                type="text"
                value={paymentBillingPostcode}
                onChange={e => { setPaymentBillingPostcode(e.target.value); setPaymentErrors(prev => ({ ...prev, billingPostcode: '' })); }}
                placeholder="e.g. SW1A 1AA"
                className={`w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  paymentErrors.billingPostcode ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500'
                }`}
              />
              {paymentErrors.billingPostcode && <p className="text-xs text-error-600 mt-1">{paymentErrors.billingPostcode}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <SecondaryButton onClick={() => { setShowPaymentDetails(false); setPendingRegistration(null); }}>Cancel</SecondaryButton>
            <button
              className={`${btnBase} bg-primary-600 hover:bg-primary-700 text-white`}
              onClick={handleSubmitPayment}
            >
              <Check className="w-3.5 h-3.5" /> Pay and Register
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── KARYAKRAM CONFIRMATION ───────────────────────────────────────────── */}
    {showConfirmation && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowConfirmation(false)}
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 pt-8 pb-2 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-950/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-success-600 dark:text-success-400" />
            </div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white">Registration Confirmed</h4>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{event.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatDateTime(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                {event.locationType === 'online' ? <Globe className="w-3.5 h-3.5 flex-shrink-0" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{event.locationType === 'online' ? 'Online Karyakram' : (event.venueAddress || `${event.activityCentre} · ${event.town} · ${event.region} · ${event.country}`)}</span>
              </div>
              {confirmationTicketLabel && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Ticket Type: {confirmationTicketLabel}{confirmationTicketPrice !== null ? ` (£${confirmationTicketPrice})` : ''}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <img
                src={qrCodeUrl(`https://hssuk.org/events/${event.id}/checkin?member=${myMemberId ?? ''}`, 150)}
                alt="Your check-in QR code"
                className="w-[150px] h-[150px] rounded-lg border border-neutral-200 dark:border-neutral-800"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Show this QR code at the venue to check in.</p>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">{confirmationNote}</p>

            <button
              onClick={handleDownloadIcs}
              className={`${btnBase} w-full justify-center border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800`}
            >
              <Download className="w-3.5 h-3.5" /> Download .ics (Add to Calendar)
            </button>
          </div>

          <div className="flex items-center justify-center px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              className={`${btnBase} bg-primary-600 hover:bg-primary-700 text-white`}
              onClick={() => setShowConfirmation(false)}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
