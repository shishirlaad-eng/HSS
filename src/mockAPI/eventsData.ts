export interface Event {
  id: string;
  name: string;
  host: string;
  coHosts: string[];
  status: 'draft' | 'published' | 'active' | 'cancelled' | 'completed';

  // Masters scope
  country: string;
  region: string;
  town: string;
  activityCentre: string;

  // Schedule
  startDate: string;   // ISO datetime
  endDate: string;     // ISO datetime (renamed from expiryDate)
  createdDate: string;
  lastUpdated: string;

  // Payment
  paymentType: 'paid' | 'free';
  price?: number;      // Required when paymentType === 'paid'

  // Configuration
  capacity?: number;

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
  rsvp: 'going' | 'maybe' | 'notGoing';
}

export const mockParticipants: Record<string, EventParticipant[]> = {
  'EVT-101': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'maybe'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'maybe'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'notGoing' },
    { memberId: 'MBR-009', name: 'Deepak Rao',      email: 'deepak.rao@example.com',    phone: '+44 7799 012345', memberType: 'adult', rsvp: 'notGoing' },
    { memberId: 'MBR-010', name: 'Divya Krishnan',  email: 'divya.krishnan@example.com',phone: '',               memberType: 'child', rsvp: 'going'    },
  ],
  'EVT-103': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'maybe'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'notGoing' },
  ],
  'EVT-104': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'maybe'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'notGoing' },
  ],
  'EVT-105': [
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'maybe'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'notGoing' },
  ],
  'EVT-109': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'maybe'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'maybe'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'notGoing' },
    { memberId: 'MBR-010', name: 'Divya Krishnan',  email: 'divya.krishnan@example.com',phone: '',               memberType: 'child', rsvp: 'notGoing' },
  ],
  'EVT-110': [
    { memberId: 'MBR-001', name: 'Arjun Sharma',    email: 'arjun.sharma@example.com',  phone: '+44 7711 234567', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-002', name: 'Priya Patel',     email: 'priya.patel@example.com',   phone: '+44 7722 345678', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-003', name: 'Rahul Mehta',     email: 'rahul.mehta@example.com',   phone: '+44 7733 456789', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-004', name: 'Sneha Gupta',     email: 'sneha.gupta@example.com',   phone: '+44 7744 567890', memberType: 'teen',  rsvp: 'going'    },
    { memberId: 'MBR-005', name: 'Vikram Nair',     email: 'vikram.nair@example.com',   phone: '+44 7755 678901', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-006', name: 'Ananya Joshi',    email: 'ananya.joshi@example.com',  phone: '+44 7766 789012', memberType: 'adult', rsvp: 'going'    },
    { memberId: 'MBR-007', name: 'Rohan Verma',     email: 'rohan.verma@example.com',   phone: '+44 7777 890123', memberType: 'teen',  rsvp: 'maybe'    },
    { memberId: 'MBR-008', name: 'Kavita Nair',     email: 'kavita.nair@example.com',   phone: '+44 7788 901234', memberType: 'adult', rsvp: 'notGoing' },
  ],
};

export const mockEvents: Event[] = [
  {
    id: 'EVT-101',
    name: 'Youth Leadership Summit',
    host: 'Sarah Johnson',
    coHosts: ['Michael Chen', 'Emma Davis'],
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    startDate: '2026-05-20T10:00:00Z',
    endDate: '2026-05-20T18:00:00Z',
    createdDate: '2026-03-10T09:00:00Z',
    lastUpdated: '2026-05-18T14:30:00Z',
    paymentType: 'free',
    capacity: 200,
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
    host: 'Sarah Johnson',
    coHosts: [],
    status: 'draft',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    startDate: '2026-07-15T09:00:00Z',
    endDate: '2026-07-15T17:00:00Z',
    createdDate: '2026-05-01T10:00:00Z',
    lastUpdated: '2026-05-10T11:00:00Z',
    paymentType: 'paid',
    price: 25,
    capacity: 50,
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
    coHosts: ['Sarah Johnson'],
    status: 'published',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    startDate: '2026-06-10T18:30:00Z',
    endDate: '2026-06-10T21:30:00Z',
    createdDate: '2026-04-20T13:00:00Z',
    lastUpdated: '2026-05-15T09:45:00Z',
    paymentType: 'free',
    capacity: 150,
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
    coHosts: ['Emma Davis'],
    status: 'completed',
    country: 'HSS UK',
    region: 'Scotland',
    town: 'Edinburgh',
    activityCentre: 'Edinburgh Activity Centre',
    startDate: '2026-03-01T09:00:00Z',
    endDate: '2026-03-01T17:00:00Z',
    createdDate: '2026-01-05T08:00:00Z',
    lastUpdated: '2026-03-02T10:00:00Z',
    paymentType: 'free',
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
    coHosts: ['Sarah Johnson', 'David Park'],
    status: 'active',
    country: 'HSS Ireland',
    region: 'Dublin',
    town: 'Dublin City',
    activityCentre: 'Dublin Activity Centre',
    startDate: '2026-05-22T19:00:00Z',
    endDate: '2026-05-22T23:00:00Z',
    createdDate: '2026-03-15T11:00:00Z',
    lastUpdated: '2026-05-20T16:00:00Z',
    paymentType: 'paid',
    price: 75,
    capacity: 100,
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
    coHosts: [],
    status: 'cancelled',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    startDate: '2026-04-12T08:00:00Z',
    endDate: '2026-04-12T12:00:00Z',
    createdDate: '2026-02-01T09:00:00Z',
    lastUpdated: '2026-04-05T14:00:00Z',
    paymentType: 'free',
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
    coHosts: ['Michael Chen'],
    status: 'draft',
    country: 'HSS UK',
    region: 'Wales',
    town: 'Cardiff',
    activityCentre: 'Cardiff Activity Centre',
    startDate: '2026-08-01T18:00:00Z',
    endDate: '2026-08-01T21:00:00Z',
    createdDate: '2026-05-22T10:00:00Z',
    lastUpdated: '2026-05-22T10:00:00Z',
    paymentType: 'free',
    capacity: 80,
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
    coHosts: ['Emma Davis'],
    status: 'published',
    country: 'HSS UK',
    region: 'Scotland',
    town: 'Glasgow',
    activityCentre: 'Glasgow Activity Centre',
    startDate: '2026-09-20T14:00:00Z',
    endDate: '2026-09-20T20:00:00Z',
    createdDate: '2026-05-18T12:00:00Z',
    lastUpdated: '2026-05-23T09:00:00Z',
    paymentType: 'paid',
    price: 15,
    capacity: 300,
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
    coHosts: [],
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    startDate: '2026-05-24T10:00:00Z',
    endDate: '2026-05-24T16:00:00Z',
    createdDate: '2026-04-01T08:00:00Z',
    lastUpdated: '2026-05-21T11:30:00Z',
    paymentType: 'free',
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
    coHosts: ['David Park'],
    status: 'completed',
    country: 'HSS United States',
    region: 'East Coast',
    town: 'New York',
    activityCentre: 'New York Activity Centre',
    startDate: '2026-02-10T11:00:00Z',
    endDate: '2026-02-10T19:00:00Z',
    createdDate: '2025-12-01T09:00:00Z',
    lastUpdated: '2026-02-11T10:00:00Z',
    paymentType: 'paid',
    price: 30,
    capacity: 500,
    metrics: {
      going: 445,
      maybe: 60,
      notGoing: 25,
      participantCount: 530,
      mediaCount: 890,
    },
    chatState: 'archived',
  },
];
