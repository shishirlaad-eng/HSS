// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Announcements Mock Data
// ─────────────────────────────────────────────────────────────

export type AnnouncementStatus    = 'draft' | 'sent' | 'scheduled';
export type AnnouncementScope     = 'national' | 'region' | 'town' | 'centre';
export type AnnouncementContent   = 'text' | 'image' | 'video';
export type NotificationSchedule  = 'instant' | 'scheduled';

export interface AnnouncementNotification {
  enabled: boolean;
  schedule: NotificationSchedule;
  scheduledAt?: string; // ISO datetime — only when schedule === 'scheduled'
}

export interface Announcement {
  id: string;
  title: string;
  body: string;

  // Content
  contentType: AnnouncementContent;
  mediaUrl?: string;          // URL for image/video
  cooldownHours: number;      // 0 = no cooldown

  // Priority & Status
  priority: 'high' | 'medium' | 'low';
  status: AnnouncementStatus;

  // Audience scope (hierarchy) — legacy singular fields, kept for list/detail display
  scope: AnnouncementScope;
  targetRegion?: string;
  targetTown?: string;
  targetCentre?: string;

  // Audience scope — multi-select (empty array = All)
  targetRegions?: string[];
  targetTowns?: string[];
  targetCentres?: string[];

  // Send to specific members only, bypassing scope/demographic filters
  targetMemberIds?: string[];

  // Demographic filters (empty array = all)
  filterAgeCategories: ('child' | 'teen' | 'adult')[];
  filterGenders: ('male' | 'female')[];
  filterResponsibilityLevels?: string[];
  filterJobTitles: string[];
  filterResponsibilityTypes?: string[];

  // Notifications
  push: AnnouncementNotification;
  email: AnnouncementNotification;

  // Meta
  createdAt: string;
  sentAt?: string;
  postedBy: string;
  estimatedReach: number;
}

// ── Mock Announcements ────────────────────────────────────────

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'National SSV 2026 — Registrations Now Open',
    body: 'The annual Sangh Shiksha Varg 2026 is scheduled for August at a national venue. All shakha leaders and members are encouraged to register their participants before 15 July 2026. Registration can be completed through the membership portal under Karyakrams. Accommodation and transport guidance will be shared with registered participants by 1 July.',
    contentType: 'image',
    mediaUrl: 'https://hssuk.org/wp-content/uploads/2025/09/Large-Banner-1-scaled.jpg',
    cooldownHours: 24,
    priority: 'high',
    status: 'sent',
    scope: 'national',
    filterAgeCategories: [],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: true,  schedule: 'instant' },
    email: { enabled: true,  schedule: 'instant' },
    createdAt: '2026-05-20T09:00:00Z',
    sentAt:    '2026-05-20T09:00:00Z',
    postedBy: 'National Head',
    estimatedReach: 847,
  },
  {
    id: 'ANN-002',
    title: 'DBS Renewal — Updated Guidance for All Volunteers',
    body: 'New DBS renewal guidelines are in effect from June 2026. All active volunteers with a DBS expiry date before December 2026 must initiate renewal by 30 June. Please log in to the compliance portal to check your DBS status and begin the renewal process. The Compliance Team is available for support via email.',
    contentType: 'text',
    cooldownHours: 0,
    priority: 'high',
    status: 'sent',
    scope: 'national',
    filterAgeCategories: ['adult'],
    filterGenders: [],
    filterJobTitles: ['Karyawaha', 'Shikshak', 'Mukhya Shikshak', 'Ghatnayak'],
    push:  { enabled: true,  schedule: 'instant' },
    email: { enabled: true,  schedule: 'instant' },
    createdAt: '2026-05-15T10:30:00Z',
    sentAt:    '2026-05-15T10:30:00Z',
    postedBy: 'Compliance Team',
    estimatedReach: 312,
  },
  {
    id: 'ANN-003',
    title: 'Volunteer Recognition Awards 2026 — Nominations Open',
    body: 'Nominations are now open for the annual Volunteer Recognition Awards. This year we are accepting nominations across five categories: Outstanding Seva, Youth Leadership, Community Impact, Long Service (10+ years), and Rookie of the Year. Submit nominations by 10 June 2026 via the portal. Award ceremony will be held at the AGM.',
    contentType: 'text',
    cooldownHours: 48,
    priority: 'medium',
    status: 'sent',
    scope: 'national',
    filterAgeCategories: [],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: true,  schedule: 'instant' },
    email: { enabled: false, schedule: 'instant' },
    createdAt: '2026-05-10T14:00:00Z',
    sentAt:    '2026-05-10T14:00:00Z',
    postedBy: 'National Head',
    estimatedReach: 847,
  },
  {
    id: 'ANN-004',
    title: 'Khel Pratiyogita 2026 — London Region Qualifiers',
    body: 'The London & South East region qualifiers for Khel Pratiyogita 2026 are scheduled for 28 June at Wembley Activity Centre. All participants must register by 15 June. Categories: U-12, U-16, U-18, and Open. Events include athletics, team sports, and traditional games. Contact your centre coordinator to register your team.',
    contentType: 'image',
    mediaUrl: 'https://careful-indigo-moose.hssuk.org/wp-content/uploads/2025/08/khel-comp-1.png',
    cooldownHours: 12,
    priority: 'medium',
    status: 'sent',
    scope: 'region',
    targetRegion: 'London & South East',
    filterAgeCategories: ['child', 'teen'],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: true,  schedule: 'instant' },
    email: { enabled: true,  schedule: 'instant' },
    createdAt: '2026-05-08T11:00:00Z',
    sentAt:    '2026-05-08T11:00:00Z',
    postedBy: 'London & SE Regional Coordinator',
    estimatedReach: 143,
  },
  {
    id: 'ANN-005',
    title: 'New Activity Centre — Birmingham West Now Active',
    body: 'We are pleased to announce that Birmingham West Activity Centre is now fully operational. Shakha activities begin from 1 June 2026. Members in the Birmingham West area are encouraged to transfer their registration to the new centre. Please contact the Midlands regional team for more information on the transfer process.',
    contentType: 'text',
    cooldownHours: 0,
    priority: 'medium',
    status: 'scheduled',
    scope: 'region',
    targetRegion: 'Midlands',
    filterAgeCategories: [],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: true,  schedule: 'scheduled', scheduledAt: '2026-05-31T08:00:00Z' },
    email: { enabled: true,  schedule: 'scheduled', scheduledAt: '2026-05-31T08:00:00Z' },
    createdAt: '2026-05-22T09:00:00Z',
    postedBy: 'Midlands Regional Coordinator',
    estimatedReach: 198,
  },
  {
    id: 'ANN-006',
    title: 'Membership Portal — Scheduled Maintenance Window',
    body: 'The membership portal will undergo planned maintenance on Sunday 1 June 2026 between 02:00–06:00 BST. During this window members may experience brief interruptions when accessing the portal. All data is safe and no action is required. We apologise for any inconvenience.',
    contentType: 'text',
    cooldownHours: 0,
    priority: 'low',
    status: 'scheduled',
    scope: 'national',
    filterAgeCategories: [],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: true,  schedule: 'scheduled', scheduledAt: '2026-05-29T18:00:00Z' },
    email: { enabled: false, schedule: 'instant' },
    createdAt: '2026-05-21T14:00:00Z',
    postedBy: 'IT Operations',
    estimatedReach: 847,
  },
  {
    id: 'ANN-007',
    title: 'Manchester Shakha — Summer Schedule Update',
    body: 'Due to school summer holidays, the Manchester Shakha schedule will change from 28 July to 1 September 2026. Shakhas will move to Saturday mornings (10:00–12:00) during this period. Please ensure all members and parents are informed. The regular Thursday evening Shakhas will resume from 4 September.',
    contentType: 'text',
    cooldownHours: 0,
    priority: 'low',
    status: 'draft',
    scope: 'town',
    targetRegion: 'North West',
    targetTown: 'Manchester',
    filterAgeCategories: [],
    filterGenders: [],
    filterJobTitles: [],
    push:  { enabled: false, schedule: 'instant' },
    email: { enabled: true,  schedule: 'instant'  },
    createdAt: '2026-05-24T10:00:00Z',
    postedBy: 'Manchester Centre Coordinator',
    estimatedReach: 67,
  },
];
