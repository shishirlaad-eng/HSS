export interface EventPriceCategory {
  id: string;
  label: string;
  description?: string;   // short description shown alongside this ticket type
  price: number;
}

export interface EventCustomQuestion {
  id: string;
  label: string;
  description?: string;    // shown below the question to explain why it's asked
  type: 'text' | 'dropdown' | 'checkbox' | 'radio' | 'date';
  options?: string[];      // for 'dropdown', 'radio' and 'checkbox' (multi-select)
  required: boolean;
}

export interface EventTermsSection {
  id: string;
  title: string;
  description: string;   // rich-text HTML
}

export interface Event {
  id: string;
  name: string;
  host: string;
  status: 'draft' | 'published' | 'active' | 'cancelled' | 'completed';

  // Masters scope (used for Target Audience — Vibhag/Nagar/Shakha)
  country: string;
  region: string;
  town: string;
  activityCentre: string;

  // Venue — physical or online
  locationType: 'physical' | 'online';
  venueAddress?: string;   // Required when locationType === 'physical'
  onlineUrl?: string;      // Required when locationType === 'online'

  // Schedule
  startDate: string;   // ISO datetime
  endDate: string;     // ISO datetime (renamed from expiryDate)
  createdDate: string;
  lastUpdated: string;
  // Registration window — when members are allowed to register, separate from
  // when the Karyakram itself runs. Optional; blank = registration always open.
  registrationStartDate?: string;   // date (yyyy-mm-dd)
  registrationEndDate?: string;     // date (yyyy-mm-dd)

  // Payment
  paymentType: 'paid' | 'free';
  price?: number;      // Legacy single price (used when no price categories defined)
  priceCategories?: EventPriceCategory[];   // Multiple ticket/price tiers
  // Coupon code the event admin has picked for this Karyakram, from the reusable
  // pool at HSS UK Setup > Lists and Options > Events > Coupons. Shared manually
  // with the relevant attendee; overrides the payable amount to £0 when applied.
  couponCode?: string;
  // Optional donation add-on — when enabled, a member registering can choose to
  // donate a custom amount on top of/regardless of the ticket price.
  donationEnabled?: boolean;

  // Configuration
  capacity?: number;
  // When capacity is full, new registrations are waitlisted instead of blocked.
  waitlistEnabled?: boolean;
  description?: string;
  imageUrl?: string;
  termsAndConditions?: string;   // legacy single-blob field, kept for older events
  termsSections?: EventTermsSection[];   // editable Terms/Privacy Policy/etc. sections

  // Registration confirmation email sent to a member once their request to
  // attend is accepted. Body supports the EVENT_CONFIRMATION_VARIABLES tokens.
  confirmationSubject?: string;
  confirmationMessage?: string;   // rich-text HTML

  // Target audience — multi-select scope (Suchana-style broadcast; separate from
  // the admin-ownership country/region/town/activityCentre above). Empty = All.
  targetRegions?: string[];
  targetTowns?: string[];
  targetCentres?: string[];
  targetMemberIds?: string[];   // set when inviting specific members only

  // Target audience filters
  filterAgeCategories?: ('bal' | 'shishu' | 'kishor' | 'tarun' | 'yuva' | 'jyestha')[];
  filterGenders?: ('male' | 'female')[];
  filterJobTitles?: string[];
  filterResponsibilityLevels?: string[];
  filterResponsibilityTypes?: string[];

  // Guest registration — payment is configured separately from member pricing,
  // since a Karyakram may charge guests a different amount (or nothing) than members.
  guestRegistrationEnabled?: boolean;
  guestPaymentType?: 'paid' | 'free';
  guestPrice?: number;   // GBP; only meaningful when guestPaymentType === 'paid'

  // Custom registration questions
  customQuestions?: EventCustomQuestion[];

  // Participant metrics (kept as-is — FINAL)
  metrics: {
    going: number;
    maybe: number;
    notGoing: number;
    participantCount: number;
    mediaCount: number;
  };

  chatState: 'active' | 'archived';

  // Optional governance fields
  cancelledDate?: string;
  cancellationReason?: string;
}

// ─── Standard Terms & Conditions shown on all events ─────────────────────────
export const EVENT_TERMS_AND_CONDITIONS = `By registering for this event, you agree to the following terms:
1. Registrations are confirmed on a first-come, first-served basis, subject to capacity.
2. Cancellations must be made at least 48 hours before the event start time for any applicable refund.
3. HSS (UK) reserves the right to amend, postpone, or cancel the event due to unforeseen circumstances.
4. Participants are responsible for their own conduct and must follow all on-site safety instructions.
5. Photographs and videos may be taken during the event for promotional purposes.
6. Personal data submitted during registration will be handled in accordance with the HSS (UK) Privacy Policy.`;

// ─── Variables available in the Event Confirmation email body ───────────────
export const EVENT_CONFIRMATION_VARIABLES: { token: string; description: string }[] = [
  { token: '{{member_name}}',      description: 'Full name of the registering member' },
  { token: '{{event_name}}',       description: 'Karyakram title' },
  { token: '{{event_date}}',       description: 'Karyakram start date' },
  { token: '{{event_time}}',       description: 'Karyakram start time' },
  { token: '{{event_location}}',   description: 'Venue address or online link' },
  { token: '{{ticket_type}}',      description: 'Ticket type selected at registration' },
  { token: '{{amount_paid}}',      description: 'Amount paid for the registration' },
  { token: '{{registration_id}}',  description: 'Unique registration reference' },
];

export const DEFAULT_CONFIRMATION_SUBJECT = 'Your registration for {{event_name}} is confirmed';
export const DEFAULT_CONFIRMATION_MESSAGE =
  '<p>Dear {{member_name}},</p>' +
  '<p>Your registration for <strong>{{event_name}}</strong> on {{event_date}} at {{event_time}} has been confirmed.</p>' +
  '<p><strong>Venue:</strong> {{event_location}}<br/><strong>Ticket Type:</strong> {{ticket_type}}<br/><strong>Amount Paid:</strong> {{amount_paid}}</p>' +
  '<p>Your registration reference is {{registration_id}}. Please keep this for your records.</p>' +
  '<p>We look forward to seeing you there.</p>';

// ─── Media data ──────────────────────────────────────────────────────────────
export interface EventMedia {
  id: string;
  memberId: string;       // empty string for admin-uploaded posts
  memberName: string;
  type: 'image' | 'video';
  caption?: string;
  postedAt: string;       // ISO datetime
  imageUrl?: string;      // picsum thumbnail (800×450); videos omit this
}

// ─── Real HSS UK event image sources ─────────────────────────────────────────
// Sports:  https://hssuk.org/events/sports_competition/
// SSV:     https://hssuk.org/events/sangh-shiksha-varg/
// Sewa:    https://hssuk.org/events/sewa-activity/

export const mockMediaPosts: Record<string, EventMedia[]> = {

  // ── EVT-101 · Youth Leadership Summit ── (SSV images — group training & ceremony shots)
  'EVT-101': [
    { id: 'MED-001', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Opening ceremony highlights!',            postedAt: '2026-05-20T11:30:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2025/09/Large-Banner-1-scaled.jpg' },
    { id: 'MED-002', memberId: 'MBR-002', memberName: 'Priya Patel',    type: 'video', caption: 'Leadership panel discussion',              postedAt: '2026-05-20T12:15:00Z' },
    { id: 'MED-003', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'image', caption: 'Group photo at the summit',                postedAt: '2026-05-20T13:00:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/IMG_1031-scaled.jpg' },
    { id: 'MED-004', memberId: 'MBR-005', memberName: 'Vikram Nair',    type: 'image', caption: 'Delegates in session',                    postedAt: '2026-05-20T14:20:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/H63_2036-scaled.jpg' },
    { id: 'MED-005', memberId: 'MBR-006', memberName: 'Ananya Joshi',   type: 'video', caption: 'Workshop on leadership skills',            postedAt: '2026-05-20T15:00:00Z' },
    { id: 'MED-006', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Award ceremony moments',                  postedAt: '2026-05-20T16:30:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/1KK00412-scaled.jpg' },
    { id: 'MED-007', memberId: 'MBR-004', memberName: 'Sneha Gupta',    type: 'image', caption: 'Networking session',                      postedAt: '2026-05-20T17:00:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/DSC_3954-scaled.jpg' },
    { id: 'MED-008', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'video', caption: 'Closing speech highlights',               postedAt: '2026-05-20T17:45:00Z' },
  ],

  // ── EVT-104 · Annual Sports Day ── (Khel Pratiyogita / sports competition photos)
  'EVT-104': [
    { id: 'MED-020', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Khel Pratiyogita 2025 — ready to compete!', postedAt: '2026-03-01T09:30:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/08/khel-comp-1.png' },
    { id: 'MED-021', memberId: 'MBR-002', memberName: 'Priya Patel',    type: 'video', caption: '100m sprint final',                         postedAt: '2026-03-01T10:00:00Z' },
    { id: 'MED-022', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'image', caption: 'Team spirit before kick-off',               postedAt: '2026-03-01T10:45:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/10/khel-comp-3.png' },
    { id: 'MED-023', memberId: 'MBR-004', memberName: 'Sneha Gupta',    type: 'image', caption: 'Athletes in action',                        postedAt: '2026-03-01T11:30:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/10/khel-comp-4.png' },
    { id: 'MED-024', memberId: 'MBR-005', memberName: 'Vikram Nair',    type: 'video', caption: 'Long jump competition',                     postedAt: '2026-03-01T12:15:00Z' },
    { id: 'MED-025', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Medal ceremony',                           postedAt: '2026-03-01T15:00:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2025/10/khel-comp-6.png' },
    { id: 'MED-026', memberId: 'MBR-002', memberName: 'Priya Patel',    type: 'image', caption: 'Relay race action',                        postedAt: '2026-03-01T15:45:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2020/08/widgets_gallery_1-500x500.jpg' },
    { id: 'MED-027', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'video', caption: 'Event highlights reel',                    postedAt: '2026-03-01T16:30:00Z' },
    { id: 'MED-028', memberId: 'MBR-007', memberName: 'Rohan Verma',    type: 'image', caption: 'Winners on the podium',                    postedAt: '2026-03-01T16:50:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2020/08/widgets_gallery_2-500x500.jpg' },
    { id: 'MED-029', memberId: 'MBR-008', memberName: 'Kavita Nair',    type: 'image', caption: 'Group celebration',                        postedAt: '2026-03-01T17:00:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2020/08/widgets_gallery_3-500x500.jpg' },
  ],

  // ── EVT-105 · Fundraising Gala ── (Sewa charity & community service photos)
  'EVT-105': [
    { id: 'MED-040', memberId: 'MBR-005', memberName: 'Vikram Nair',    type: 'image', caption: 'Sewa volunteers at the gala',              postedAt: '2026-05-22T19:30:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2025/08/63a7a342-3ab8-41c0-9b11-7408a14e327c-768x512.jpg' },
    { id: 'MED-041', memberId: 'MBR-006', memberName: 'Ananya Joshi',   type: 'video', caption: 'Welcome speeches',                         postedAt: '2026-05-22T20:00:00Z' },
    { id: 'MED-042', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Charity auction in full swing',            postedAt: '2026-05-22T20:45:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/12/Sewa-Charity-Shop.jpg' },
    { id: 'MED-043', memberId: 'MBR-005', memberName: 'Vikram Nair',    type: 'image', caption: 'Community support in action',              postedAt: '2026-05-22T21:15:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/12/1ec98215-afaa-47cc-bc80-dc05c448fd87.jpg' },
    { id: 'MED-044', memberId: 'MBR-006', memberName: 'Ananya Joshi',   type: 'video', caption: 'Fundraising target reached!',              postedAt: '2026-05-22T22:00:00Z' },
    { id: 'MED-045', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Closing moments of a wonderful evening',   postedAt: '2026-05-22T22:50:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/12/PHOTO-2024-07-14-12-55-35-1.jpg' },
  ],

  // ── EVT-110 · Heritage Festival 2026 ── (mix of SSV ceremony + Sewa community images)
  'EVT-110': [
    { id: 'MED-060', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'image', caption: 'Heritage exhibition opening',              postedAt: '2026-02-10T11:30:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/5-scaled.jpg' },
    { id: 'MED-061', memberId: 'MBR-002', memberName: 'Priya Patel',    type: 'video', caption: 'Cultural dance performance',               postedAt: '2026-02-10T12:00:00Z' },
    { id: 'MED-062', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'image', caption: 'Art installations',                        postedAt: '2026-02-10T12:45:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/2KK01628-scaled.jpg' },
    { id: 'MED-063', memberId: 'MBR-004', memberName: 'Sneha Gupta',    type: 'image', caption: 'Traditional costumes showcase',            postedAt: '2026-02-10T13:30:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/09/IMG_2123-scaled.jpg' },
    { id: 'MED-064', memberId: 'MBR-005', memberName: 'Vikram Nair',    type: 'video', caption: 'Music performance highlights',             postedAt: '2026-02-10T14:15:00Z' },
    { id: 'MED-065', memberId: 'MBR-006', memberName: 'Ananya Joshi',   type: 'image', caption: 'Food stalls and cuisine',                  postedAt: '2026-02-10T15:00:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/12/12.jpg' },
    { id: 'MED-066', memberId: 'MBR-007', memberName: 'Rohan Verma',    type: 'image', caption: 'Volunteer recognition ceremony',           postedAt: '2026-02-10T15:45:00Z', imageUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/12/H63_14161-scaled.jpg' },
    { id: 'MED-067', memberId: 'MBR-001', memberName: 'Arjun Sharma',   type: 'video', caption: 'Storytelling session',                    postedAt: '2026-02-10T16:30:00Z' },
    { id: 'MED-068', memberId: 'MBR-002', memberName: 'Priya Patel',    type: 'image', caption: 'Senior leaders address the gathering',     postedAt: '2026-02-10T17:00:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2025/12/image21.png' },
    { id: 'MED-069', memberId: 'MBR-003', memberName: 'Rahul Mehta',    type: 'image', caption: 'Closing ceremony',                        postedAt: '2026-02-10T18:30:00Z', imageUrl: 'https://hssuk.org/wp-content/uploads/2020/08/widgets_gallery_4-500x500.jpg' },
  ],
};

// ─── Participant data ────────────────────────────────────────────────────────
export interface EventParticipant {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  memberType: 'adult' | 'teen' | 'child';
  // Registration/approval status:
  //  requested = member asked to attend (awaiting approval)
  //  going     = approved by an admin
  //  denied    = rejected by an admin
  rsvp: 'requested' | 'going' | 'denied';
  // Participant designated as a coordinator for this event (set by event admin):
  isCoordinator?: boolean;
  // Answers to the event's customQuestions, keyed by EventCustomQuestion.id
  customAnswers?: Record<string, string | boolean | string[]>;
  // Set when this registration was accepted onto the waiting list because
  // capacity was already full at the time of registration.
  waitlisted?: boolean;
  // Coupon code applied at registration (from HSS UK Setup > Lists and Options >
  // Events > Coupons) — overrides the payable amount to £0 when valid and active.
  discountCodeUsed?: string;
  // Ticket type chosen at registration (from the event's priceCategories).
  ticketTypeId?: string;
  ticketTypeLabel?: string;
  // Optional custom donation amount added at registration (GBP).
  donationAmount?: number;
}

// ─── Coupons (HSS UK Setup > Lists and Options > Events > Coupons) ────────────
// Reusable, org-wide codes — not tied to a specific event. Shared by reference
// with ConfigurableListsMaster.tsx, which is the admin CRUD surface for this list.
export interface EventCoupon {
  id: string;
  name: string;           // the code itself, e.g. "PRACHARAK2026"
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export const mockCoupons: EventCoupon[] = [
  { id: 'CPN-001', name: 'PRACHARAK2026', status: 'active', lastUpdated: '2026-01-05' },
  { id: 'CPN-002', name: 'INVITED-GUEST', status: 'active', lastUpdated: '2026-01-05' },
];

export const mockParticipants: Record<string, EventParticipant[]> = {
  'EVT-101': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'requested'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'requested'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'denied' },
    { memberId: 'MBR-009', name: 'Deepak Rao',      email: 'deepak.rao@example.com',    phone: '+44 7799 012345', memberType: 'adult', rsvp: 'denied' },
    { memberId: 'MBR-010', name: 'Divya Krishnan',  email: 'divya.krishnan@example.com',phone: '',               memberType: 'child', rsvp: 'going'    },
  ],
  'EVT-103': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'requested'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'denied' },
  ],
  'EVT-104': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'requested'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'denied' },
  ],
  'EVT-105': [
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'requested'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'denied' },
  ],
  'EVT-109': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'requested'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'requested'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'denied' },
    { memberId: 'MBR-010', name: 'Divya Krishnan',  email: 'divya.krishnan@example.com',phone: '',               memberType: 'child', rsvp: 'denied' },
  ],
  'EVT-110': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'requested'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'denied' },
  ],
};

export const mockEvents: Event[] = [
  {
    id: 'EVT-101',
    name: 'Youth Leadership Summit',
    host: 'Sarah Johnson',
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    locationType: 'physical',
    venueAddress: 'Wembley Activity Centre, Forty Avenue, Wembley, HA9 8JX',
    startDate: '2026-05-20T10:00:00Z',
    endDate: '2026-05-20T18:00:00Z',
    createdDate: '2026-03-10T09:00:00Z',
    lastUpdated: '2026-05-18T14:30:00Z',
    paymentType: 'free',
    capacity: 200,
    description: 'A full-day summit bringing together young leaders from across HSS UK to develop leadership skills, share experiences, and build networks. Sessions include workshops on communication, community service, and Sangh values.',
    imageUrl: 'https://hssuk.org/wp-content/uploads/2025/09/Large-Banner-1-scaled.jpg',
    guestRegistrationEnabled: true,
    customQuestions: [
      { id: 'CQ-1', label: 'Dietary requirements', type: 'text', required: false },
      { id: 'CQ-2', label: 'T-shirt size', type: 'dropdown', options: ['S', 'M', 'L', 'XL'], required: true },
      { id: 'CQ-3', label: 'I agree to be photographed during the event', type: 'checkbox', required: true },
    ],
    metrics: {
      going: 156,
      maybe: 42,
      notGoing: 12,
      participantCount: 210,
      mediaCount: 85,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-102',
    name: 'Tech Workshop Series',
    customQuestions: [
      { id: 'CQ-102-1', label: 'What is your current experience level?', type: 'dropdown', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
      { id: 'CQ-102-2', label: 'Will you bring your own laptop?', type: 'dropdown', options: ['Yes', 'No — please arrange one'], required: true },
      { id: 'CQ-102-3', label: 'Any specific topics you would like covered?', type: 'text', required: false },
    ],
    host: 'Sarah Johnson',
    status: 'published',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    locationType: 'online',
    onlineUrl: 'https://meet.hssuk.org/tech-workshop-series',
    startDate: '2026-07-15T09:00:00Z',
    endDate: '2026-07-15T17:00:00Z',
    createdDate: '2026-05-01T10:00:00Z',
    lastUpdated: '2026-05-10T11:00:00Z',
    paymentType: 'paid',
    price: 25,
    priceCategories: [
      { id: 'PC-1', label: 'Standard', price: 25 },
      { id: 'PC-2', label: 'Student', price: 15 },
    ],
    capacity: 50,
    description: 'An intensive hands-on workshop series covering modern web development, AI tools, and digital skills for HSS members. Suitable for beginners and intermediate participants. Refreshments included.',
    metrics: {
      going: 0,
      maybe: 0,
      notGoing: 0,
      participantCount: 0,
      mediaCount: 0,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-103',
    name: 'Cultural Evening',
    host: 'David Park',
    status: 'published',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    locationType: 'physical',
    venueAddress: 'Manchester Central Activity Centre, Oxford Road, Manchester, M1 5QA',
    startDate: '2026-06-10T18:30:00Z',
    endDate: '2026-06-10T21:30:00Z',
    createdDate: '2026-04-20T13:00:00Z',
    lastUpdated: '2026-05-15T09:45:00Z',
    paymentType: 'free',
    capacity: 150,
    description: 'Celebrate the richness of Indian culture through classical music, dance performances, and traditional cuisine. Open to all HSS families and friends. A wonderful opportunity to connect with our heritage.',
    metrics: {
      going: 88,
      maybe: 25,
      notGoing: 7,
      participantCount: 120,
      mediaCount: 0,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-104',
    name: 'Annual Sports Day',
    host: 'Michael Chen',
    status: 'completed',
    country: 'HSS UK',
    region: 'Scotland',
    town: 'Edinburgh',
    activityCentre: 'Edinburgh Activity Centre',
    locationType: 'physical',
    venueAddress: 'Edinburgh Activity Centre, Meadowbank Stadium, Edinburgh, EH7 6AE',
    startDate: '2026-03-01T09:00:00Z',
    endDate: '2026-03-01T17:00:00Z',
    createdDate: '2026-01-05T08:00:00Z',
    lastUpdated: '2026-03-02T10:00:00Z',
    paymentType: 'free',
    description: 'A fun-filled day of friendly sporting competitions including cricket, kabaddi, and athletics for all age groups. Team spirit, fitness, and camaraderie are at the heart of this annual favourite.',
    metrics: {
      going: 210,
      maybe: 30,
      notGoing: 15,
      participantCount: 255,
      mediaCount: 340,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-105',
    name: 'Fundraising Gala',
    host: 'Emma Davis',
    status: 'active',
    country: 'HSS Ireland',
    region: 'Dublin',
    town: 'Dublin City',
    activityCentre: 'Dublin Activity Centre',
    locationType: 'physical',
    venueAddress: 'Dublin Activity Centre, O\'Connell Street, Dublin 1, D01 F5P2',
    startDate: '2026-05-22T19:00:00Z',
    endDate: '2026-05-22T23:00:00Z',
    createdDate: '2026-03-15T11:00:00Z',
    lastUpdated: '2026-05-20T16:00:00Z',
    paymentType: 'paid',
    price: 75,
    priceCategories: [
      { id: 'PC-1', label: 'Adult', price: 75 },
      { id: 'PC-2', label: 'Child (under 12)', price: 35 },
    ],
    capacity: 100,
    description: 'An elegant black-tie fundraising gala to support HSS community welfare and youth programmes. Includes a three-course dinner, live entertainment, and a charity auction. Smart dress required.',
    customQuestions: [
      { id: 'CQ-105-1', label: 'Dietary requirements', type: 'dropdown', options: ['None', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'Other'], required: true },
      { id: 'CQ-105-2', label: 'Do you require a table with wheelchair access?', type: 'dropdown', options: ['No', 'Yes'], required: true },
      { id: 'CQ-105-3', label: 'Any special requests or accessibility needs?', type: 'text', required: false },
    ],
    metrics: {
      going: 92,
      maybe: 18,
      notGoing: 5,
      participantCount: 115,
      mediaCount: 60,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-106',
    name: 'Charity Run 2026',
    host: 'David Park',
    status: 'cancelled',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    locationType: 'physical',
    venueAddress: 'Leeds North Activity Centre, Roundhay Park, Leeds, LS8 2HH',
    startDate: '2026-04-12T08:00:00Z',
    endDate: '2026-04-12T12:00:00Z',
    createdDate: '2026-02-01T09:00:00Z',
    lastUpdated: '2026-04-05T14:00:00Z',
    paymentType: 'free',
    description: 'A 5km charity run through Leeds city centre to raise funds for local community projects supported by HSS Yorkshire. All fitness levels welcome. Medals and refreshments for all finishers.',
    cancelledDate: '2026-04-05T14:00:00Z',
    cancellationReason: 'Venue unavailable due to unforeseen circumstances.',
    metrics: {
      going: 45,
      maybe: 12,
      notGoing: 3,
      participantCount: 60,
      mediaCount: 0,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-107',
    name: 'Community Iftar',
    host: 'Sarah Johnson',
    status: 'published',
    country: 'HSS UK',
    region: 'Wales',
    town: 'Cardiff',
    activityCentre: 'Cardiff Activity Centre',
    locationType: 'physical',
    venueAddress: 'Cardiff Activity Centre, Cathays, Cardiff, CF24 4HQ',
    startDate: '2026-08-01T18:00:00Z',
    endDate: '2026-08-01T21:00:00Z',
    createdDate: '2026-05-22T10:00:00Z',
    lastUpdated: '2026-05-22T10:00:00Z',
    paymentType: 'free',
    capacity: 80,
    description: 'A community Iftar gathering to foster interfaith friendships and celebrate shared values. All are welcome to break bread together in a spirit of unity, respect, and community.',
    customQuestions: [
      { id: 'CQ-107-1', label: 'Dietary requirements', type: 'dropdown', options: ['None', 'Vegetarian', 'Vegan', 'Halal only', 'Other'], required: true },
      { id: 'CQ-107-2', label: 'How many guests are you bringing?', type: 'dropdown', options: ['0', '1', '2', '3', '4+'], required: true },
    ],
    metrics: {
      going: 0,
      maybe: 0,
      notGoing: 0,
      participantCount: 0,
      mediaCount: 0,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-108',
    name: 'Winter Carnival',
    host: 'Michael Chen',
    status: 'published',
    country: 'HSS UK',
    region: 'Scotland',
    town: 'Glasgow',
    activityCentre: 'Glasgow Activity Centre',
    locationType: 'physical',
    venueAddress: 'Glasgow Activity Centre, Pollok Park, Glasgow, G43 1AT',
    startDate: '2026-09-20T14:00:00Z',
    endDate: '2026-09-20T20:00:00Z',
    createdDate: '2026-05-18T12:00:00Z',
    lastUpdated: '2026-05-23T09:00:00Z',
    paymentType: 'paid',
    price: 15,
    priceCategories: [
      { id: 'PC-1', label: 'Adult', price: 15 },
      { id: 'PC-2', label: 'Child', price: 8 },
      { id: 'PC-3', label: 'Family (2+2)', price: 40 },
    ],
    capacity: 300,
    description: 'A festive family carnival featuring stalls, games, seasonal food, live music, and activities for children and adults alike. Tickets include entry, two activity tokens, and a hot drink.',
    customQuestions: [
      { id: 'CQ-108-1', label: 'How many children (under 12) are attending with you?', type: 'dropdown', options: ['0', '1', '2', '3', '4+'], required: true },
      { id: 'CQ-108-2', label: 'Dietary requirements', type: 'dropdown', options: ['None', 'Vegetarian', 'Vegan', 'Jain', 'Nut allergy', 'Other'], required: true },
      { id: 'CQ-108-3', label: 'I give permission for my children to participate in all carnival activities', type: 'checkbox', required: false },
    ],
    metrics: {
      going: 12,
      maybe: 5,
      notGoing: 1,
      participantCount: 18,
      mediaCount: 0,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-109',
    name: 'HSS Annual General Meeting',
    host: 'Sarah Johnson',
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    locationType: 'physical',
    venueAddress: 'Harrow Activity Centre, Kenton Road, Harrow, HA3 8AE',
    startDate: '2026-05-24T10:00:00Z',
    endDate: '2026-05-24T16:00:00Z',
    createdDate: '2026-04-01T08:00:00Z',
    lastUpdated: '2026-05-21T11:30:00Z',
    paymentType: 'free',
    description: 'The annual general meeting for all HSS UK members and office bearers. Agenda includes review of the year\'s activities, financial report, election of new officers, and planning for the coming year. Attendance by all active members is strongly encouraged.',
    metrics: {
      going: 320,
      maybe: 55,
      notGoing: 20,
      participantCount: 395,
      mediaCount: 0,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-110',
    name: 'Heritage Festival 2026',
    host: 'Emma Davis',
    status: 'completed',
    country: 'HSS United States',
    region: 'East Coast',
    town: 'New York',
    activityCentre: 'New York Activity Centre',
    locationType: 'physical',
    venueAddress: 'New York Activity Centre, Flushing Meadows, Queens, NY 11368',
    startDate: '2026-02-10T11:00:00Z',
    endDate: '2026-02-10T19:00:00Z',
    createdDate: '2025-12-01T09:00:00Z',
    lastUpdated: '2026-02-11T10:00:00Z',
    paymentType: 'paid',
    price: 30,
    priceCategories: [
      { id: 'PC-1', label: 'General Admission', price: 30 },
      { id: 'PC-2', label: 'VIP', price: 75 },
    ],
    capacity: 500,
    guestRegistrationEnabled: true,
    description: 'A vibrant celebration of India\'s cultural heritage featuring folk performances, art exhibitions, traditional crafts, regional cuisine stalls, and talks on history and heritage. A must-attend for the whole family.',
    metrics: {
      going: 445,
      maybe: 60,
      notGoing: 25,
      participantCount: 530,
      mediaCount: 890,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-111',
    name: 'Sangh Shiksha Varg — Planning Meet',
    host: 'Sarah Johnson',
    status: 'published',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    locationType: 'physical',
    venueAddress: 'Wembley Activity Centre, Forty Avenue, Wembley, HA9 8JX',
    startDate: '2026-07-20T10:00:00Z',
    endDate: '2026-07-20T16:00:00Z',
    createdDate: '2026-06-10T09:00:00Z',
    lastUpdated: '2026-06-10T09:00:00Z',
    paymentType: 'free',
    capacity: 60,
    description: 'Planning meeting for the upcoming Sangh Shiksha Varg, covering schedule, logistics, and volunteer assignments.',
    customQuestions: [
      { id: 'CQ-111-1', label: 'Your role / responsibility in the Sangh', type: 'text', required: true },
      { id: 'CQ-111-2', label: 'Are you available for the full duration of the Shiksha Varg?', type: 'dropdown', options: ['Yes — full duration', 'Partial — please specify below', 'Not yet confirmed'], required: true },
      { id: 'CQ-111-3', label: 'Any constraints or notes for the planning team', type: 'text', required: false },
    ],
    metrics: {
      going: 0,
      maybe: 0,
      notGoing: 0,
      participantCount: 0,
      mediaCount: 0,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-112',
    name: 'Family Picnic Day',
    host: 'David Park',
    status: 'published',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    locationType: 'physical',
    venueAddress: 'Heaton Park, Manchester, M25 2SW',
    startDate: '2026-06-27T11:00:00Z',
    endDate: '2026-06-27T17:00:00Z',
    createdDate: '2026-05-25T10:00:00Z',
    lastUpdated: '2026-06-05T10:00:00Z',
    paymentType: 'free',
    capacity: 150,
    description: 'A relaxed outdoor picnic for HSS families — games, food stalls, and activities for children and adults.',
    customQuestions: [
      { id: 'CQ-112-1', label: 'Number of adults attending', type: 'dropdown', options: ['1', '2', '3', '4+'], required: true },
      { id: 'CQ-112-2', label: 'Number of children attending', type: 'dropdown', options: ['0', '1', '2', '3', '4+'], required: true },
      { id: 'CQ-112-3', label: 'Dietary requirements', type: 'dropdown', options: ['None', 'Vegetarian', 'Vegan', 'Jain', 'Other'], required: false },
    ],
    metrics: {
      going: 64,
      maybe: 18,
      notGoing: 4,
      participantCount: 86,
      mediaCount: 0,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-113',
    name: 'Shakha Sangam — Live Session',
    host: 'Michael Chen',
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    locationType: 'physical',
    venueAddress: 'Harrow Activity Centre, Kenton Road, Harrow, HA3 8AE',
    startDate: '2026-06-14T08:00:00Z',
    endDate: '2026-06-14T20:00:00Z',
    createdDate: '2026-05-01T09:00:00Z',
    lastUpdated: '2026-06-14T08:00:00Z',
    paymentType: 'free',
    capacity: 100,
    description: 'A day-long Shakha Sangam currently underway, bringing together members for combined drills, games, and discussions.',
    metrics: {
      going: 72,
      maybe: 10,
      notGoing: 3,
      participantCount: 85,
      mediaCount: 6,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-114',
    name: 'Spring Sports Meet',
    host: 'Emma Davis',
    status: 'completed',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    locationType: 'physical',
    venueAddress: 'Birmingham East Activity Centre, Coventry Road, Birmingham, B25 8AA',
    startDate: '2026-06-01T09:00:00Z',
    endDate: '2026-06-01T17:00:00Z',
    createdDate: '2026-04-15T08:00:00Z',
    lastUpdated: '2026-06-02T10:00:00Z',
    paymentType: 'free',
    capacity: 120,
    description: 'A friendly inter-Shakha sports meet featuring athletics, kabaddi, and team games. Concluded successfully with strong participation.',
    metrics: {
      going: 110,
      maybe: 15,
      notGoing: 5,
      participantCount: 130,
      mediaCount: 45,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-115',
    name: 'Wembley Yuva Talk Series',
    host: 'Sarah Johnson',
    status: 'published',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    locationType: 'physical',
    venueAddress: 'Wembley Activity Centre, Forty Avenue, Wembley, HA9 8JX',
    startDate: '2026-06-28T18:00:00Z',
    endDate: '2026-06-28T20:00:00Z',
    createdDate: '2026-06-01T10:00:00Z',
    lastUpdated: '2026-06-08T10:00:00Z',
    paymentType: 'free',
    capacity: 80,
    description: 'An evening talk series for Yuva members on leadership, career growth, and community service, followed by open discussion.',
    metrics: {
      going: 22,
      maybe: 6,
      notGoing: 1,
      participantCount: 29,
      mediaCount: 0,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-116',
    name: 'Wembley Shakha Anniversary',
    host: 'Sarah Johnson',
    status: 'completed',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    locationType: 'physical',
    venueAddress: 'Wembley Activity Centre, Forty Avenue, Wembley, HA9 8JX',
    startDate: '2026-05-09T10:00:00Z',
    endDate: '2026-05-09T18:00:00Z',
    createdDate: '2026-03-15T09:00:00Z',
    lastUpdated: '2026-05-10T10:00:00Z',
    paymentType: 'free',
    capacity: 200,
    description: 'A celebration marking the founding anniversary of the Wembley Shakha, with cultural performances, games, and a community meal.',
    metrics: {
      going: 180,
      maybe: 20,
      notGoing: 8,
      participantCount: 200,
      mediaCount: 120,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-117',
    name: 'Wembley Summer Trek',
    host: 'Sarah Johnson',
    status: 'cancelled',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    locationType: 'physical',
    venueAddress: 'Harrow Hill, Wembley, HA9',
    startDate: '2026-06-21T08:00:00Z',
    endDate: '2026-06-21T14:00:00Z',
    createdDate: '2026-05-20T09:00:00Z',
    lastUpdated: '2026-06-12T11:00:00Z',
    paymentType: 'free',
    capacity: 40,
    description: 'A group trek for Tarun and Yuva members. Cancelled due to adverse weather forecast.',
    cancelledDate: '2026-06-12T11:00:00Z',
    cancellationReason: 'Cancelled due to adverse weather forecast.',
    metrics: {
      going: 0,
      maybe: 0,
      notGoing: 0,
      participantCount: 0,
      mediaCount: 0,
    },
    chatState: 'archived',
  },
];
