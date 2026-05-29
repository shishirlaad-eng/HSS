// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Attendance Mock Data
// ─────────────────────────────────────────────────────────────

export type SessionFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'one-off';
export type SessionStatus    = 'scheduled' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'unmarked';

export const SHAKHA_TYPES = [
  'Swayamsevak Shakha',
  'Sewa Shakha',
  'Parivaar Shakha',
  'Milan',
  'Sampark Kendra',
] as const;

export type ShakhaType = typeof SHAKHA_TYPES[number];

export interface ShakhaSession {
  id: string;
  title: string;
  activityCentre: string;
  region: string;
  town: string;
  shakhaType?: ShakhaType;
  frequency: SessionFrequency;
  dayOfWeek: number;        // 0=Sun … 6=Sat
  startTime: string;        // "HH:MM"
  endTime: string;          // "HH:MM"
  date: string;             // ISO date "YYYY-MM-DD" — the specific occurrence
  status: SessionStatus;
  attendanceRecords: AttendanceRecord[];
  totalExpected: number;
}

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  gender: 'male' | 'female';
  ageCategory: 'child' | 'teen' | 'adult';
  jobTitle: string;
  status: AttendanceStatus;
  markedAt?: string;        // ISO datetime
}

// ── Helper ────────────────────────────────────────────────────
function d(date: string) { return date; }

export function getSessionShakhaType(session: ShakhaSession): ShakhaType | '—' {
  if (session.shakhaType) return session.shakhaType;

  const titleParts = session.title.split(' — ');
  const titleSuffix = titleParts.length > 1 ? titleParts[titleParts.length - 1] : '';
  if ((SHAKHA_TYPES as readonly string[]).includes(titleSuffix)) return titleSuffix as ShakhaType;

  if (session.activityCentre.includes('Wembley')) return 'Swayamsevak Shakha';
  if (session.activityCentre.includes('Harrow')) return 'Parivaar Shakha';
  if (session.activityCentre.includes('Birmingham')) return 'Parivaar Shakha';
  if (session.activityCentre.includes('Manchester')) return 'Sewa Shakha';
  if (session.activityCentre.includes('Leeds')) return 'Milan';
  if (session.activityCentre.includes('Edinburgh')) return 'Sampark Kendra';

  return '—';
}

// ── Mock Sessions (May–June 2026, spread across centres) ─────

export const mockSessions: ShakhaSession[] = [

  // ── Wembley Activity Centre ───────────────────────────────
  {
    id: 'SES-001',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-05-07',
    status: 'completed',
    totalExpected: 12,
    attendanceRecords: [
      { memberId: 'MBR-001', memberName: 'Arjun Sharma',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Karyawaha',         status: 'present', markedAt: '2026-05-07T18:05:00Z' },
      { memberId: 'MBR-006', memberName: 'Deepa Nair',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-07T18:08:00Z' },
      { memberId: 'MBR-009', memberName: 'Ravi Kumar',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'absent'  },
      { memberId: 'MBR-010', memberName: 'Anita Desai',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-07T18:10:00Z' },
      { memberId: 'MBR-011', memberName: 'Suresh Pillai',  gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-07T18:12:00Z' },
      { memberId: 'MBR-012', memberName: 'Meera Iyer',     gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-07T18:15:00Z' },
    ],
  },
  {
    id: 'SES-002',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-05-14',
    status: 'completed',
    totalExpected: 12,
    attendanceRecords: [
      { memberId: 'MBR-001', memberName: 'Arjun Sharma',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Karyawaha',         status: 'present', markedAt: '2026-05-14T18:04:00Z' },
      { memberId: 'MBR-006', memberName: 'Deepa Nair',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'absent'  },
      { memberId: 'MBR-009', memberName: 'Ravi Kumar',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-14T18:07:00Z' },
      { memberId: 'MBR-010', memberName: 'Anita Desai',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-14T18:09:00Z' },
      { memberId: 'MBR-011', memberName: 'Suresh Pillai',  gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-14T18:11:00Z' },
      { memberId: 'MBR-012', memberName: 'Meera Iyer',     gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'absent'  },
    ],
  },
  {
    id: 'SES-003',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-05-21',
    status: 'completed',
    totalExpected: 12,
    attendanceRecords: [
      { memberId: 'MBR-001', memberName: 'Arjun Sharma',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Karyawaha',         status: 'present', markedAt: '2026-05-21T18:03:00Z' },
      { memberId: 'MBR-006', memberName: 'Deepa Nair',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-21T18:06:00Z' },
      { memberId: 'MBR-009', memberName: 'Ravi Kumar',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-21T18:08:00Z' },
      { memberId: 'MBR-010', memberName: 'Anita Desai',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'absent'  },
      { memberId: 'MBR-011', memberName: 'Suresh Pillai',  gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-21T18:10:00Z' },
      { memberId: 'MBR-012', memberName: 'Meera Iyer',     gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-21T18:13:00Z' },
    ],
  },
  {
    id: 'SES-004',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-05-28',
    status: 'scheduled',
    totalExpected: 12,
    attendanceRecords: [],
  },
  {
    id: 'SES-005',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-06-04',
    status: 'scheduled',
    totalExpected: 12,
    attendanceRecords: [],
  },

  // ── Harrow Activity Centre ────────────────────────────────
  {
    id: 'SES-006',
    title: 'Harrow Shakha — Saturday',
    activityCentre: 'Harrow Activity Centre',
    region: 'London & South East',
    town: 'Harrow',
    frequency: 'weekly',
    dayOfWeek: 6,
    startTime: '10:00',
    endTime:   '12:00',
    date: '2026-05-03',
    status: 'completed',
    totalExpected: 8,
    attendanceRecords: [
      { memberId: 'MBR-002', memberName: 'Priya Patel',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-03T10:04:00Z' },
      { memberId: 'MBR-007', memberName: 'Nikhil Joshi',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-03T10:06:00Z' },
      { memberId: 'MBR-013', memberName: 'Kavya Reddy',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'absent'  },
      { memberId: 'MBR-014', memberName: 'Arun Verma',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-03T10:09:00Z' },
    ],
  },
  {
    id: 'SES-007',
    title: 'Harrow Shakha — Saturday',
    activityCentre: 'Harrow Activity Centre',
    region: 'London & South East',
    town: 'Harrow',
    frequency: 'weekly',
    dayOfWeek: 6,
    startTime: '10:00',
    endTime:   '12:00',
    date: '2026-05-10',
    status: 'completed',
    totalExpected: 8,
    attendanceRecords: [
      { memberId: 'MBR-002', memberName: 'Priya Patel',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'absent'  },
      { memberId: 'MBR-007', memberName: 'Nikhil Joshi',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-10T10:05:00Z' },
      { memberId: 'MBR-013', memberName: 'Kavya Reddy',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-10T10:07:00Z' },
      { memberId: 'MBR-014', memberName: 'Arun Verma',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-10T10:10:00Z' },
    ],
  },
  {
    id: 'SES-008',
    title: 'Harrow Shakha — Saturday',
    activityCentre: 'Harrow Activity Centre',
    region: 'London & South East',
    town: 'Harrow',
    frequency: 'weekly',
    dayOfWeek: 6,
    startTime: '10:00',
    endTime:   '12:00',
    date: '2026-05-17',
    status: 'completed',
    totalExpected: 8,
    attendanceRecords: [
      { memberId: 'MBR-002', memberName: 'Priya Patel',    gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-17T10:03:00Z' },
      { memberId: 'MBR-007', memberName: 'Nikhil Joshi',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-17T10:05:00Z' },
      { memberId: 'MBR-013', memberName: 'Kavya Reddy',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-17T10:08:00Z' },
      { memberId: 'MBR-014', memberName: 'Arun Verma',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'absent'  },
    ],
  },
  {
    id: 'SES-009',
    title: 'Harrow Shakha — Saturday',
    activityCentre: 'Harrow Activity Centre',
    region: 'London & South East',
    town: 'Harrow',
    frequency: 'weekly',
    dayOfWeek: 6,
    startTime: '10:00',
    endTime:   '12:00',
    date: '2026-05-24',
    status: 'scheduled',
    totalExpected: 8,
    attendanceRecords: [],
  },
  {
    id: 'SES-010',
    title: 'Harrow Shakha — Saturday',
    activityCentre: 'Harrow Activity Centre',
    region: 'London & South East',
    town: 'Harrow',
    frequency: 'weekly',
    dayOfWeek: 6,
    startTime: '10:00',
    endTime:   '12:00',
    date: '2026-05-31',
    status: 'scheduled',
    totalExpected: 8,
    attendanceRecords: [],
  },

  // ── Birmingham East Activity Centre ───────────────────────
  {
    id: 'SES-011',
    title: 'Birmingham East Shakha',
    activityCentre: 'Birmingham East Activity Centre',
    region: 'Midlands',
    town: 'Birmingham',
    frequency: 'weekly',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime:   '13:00',
    date: '2026-05-04',
    status: 'completed',
    totalExpected: 10,
    attendanceRecords: [
      { memberId: 'MBR-003', memberName: 'Rahul Mehta',    gender: 'male',   ageCategory: 'adult', jobTitle: 'Mukhya Shikshak',  status: 'present', markedAt: '2026-05-04T11:02:00Z' },
      { memberId: 'MBR-004', memberName: 'Sneha Gupta',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-04T11:05:00Z' },
      { memberId: 'MBR-015', memberName: 'Kiran Bose',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'absent'  },
      { memberId: 'MBR-016', memberName: 'Pooja Trivedi',  gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-04T11:07:00Z' },
    ],
  },
  {
    id: 'SES-012',
    title: 'Birmingham East Shakha',
    activityCentre: 'Birmingham East Activity Centre',
    region: 'Midlands',
    town: 'Birmingham',
    frequency: 'weekly',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime:   '13:00',
    date: '2026-05-11',
    status: 'completed',
    totalExpected: 10,
    attendanceRecords: [
      { memberId: 'MBR-003', memberName: 'Rahul Mehta',    gender: 'male',   ageCategory: 'adult', jobTitle: 'Mukhya Shikshak',  status: 'present', markedAt: '2026-05-11T11:03:00Z' },
      { memberId: 'MBR-004', memberName: 'Sneha Gupta',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'absent'  },
      { memberId: 'MBR-015', memberName: 'Kiran Bose',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-11T11:06:00Z' },
      { memberId: 'MBR-016', memberName: 'Pooja Trivedi',  gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-11T11:08:00Z' },
    ],
  },
  {
    id: 'SES-013',
    title: 'Birmingham East Shakha',
    activityCentre: 'Birmingham East Activity Centre',
    region: 'Midlands',
    town: 'Birmingham',
    frequency: 'weekly',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime:   '13:00',
    date: '2026-05-18',
    status: 'completed',
    totalExpected: 10,
    attendanceRecords: [
      { memberId: 'MBR-003', memberName: 'Rahul Mehta',    gender: 'male',   ageCategory: 'adult', jobTitle: 'Mukhya Shikshak',  status: 'absent'  },
      { memberId: 'MBR-004', memberName: 'Sneha Gupta',    gender: 'female', ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-18T11:04:00Z' },
      { memberId: 'MBR-015', memberName: 'Kiran Bose',     gender: 'male',   ageCategory: 'adult', jobTitle: 'Sampark',             status: 'present', markedAt: '2026-05-18T11:06:00Z' },
      { memberId: 'MBR-016', memberName: 'Pooja Trivedi',  gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-18T11:09:00Z' },
    ],
  },
  {
    id: 'SES-014',
    title: 'Birmingham East Shakha',
    activityCentre: 'Birmingham East Activity Centre',
    region: 'Midlands',
    town: 'Birmingham',
    frequency: 'weekly',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime:   '13:00',
    date: '2026-05-25',
    status: 'scheduled',
    totalExpected: 10,
    attendanceRecords: [],
  },

  // ── Manchester Central ────────────────────────────────────
  {
    id: 'SES-015',
    title: 'Manchester Shakha — Thursday',
    activityCentre: 'Manchester Central Activity Centre',
    region: 'North West',
    town: 'Manchester',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '19:00',
    endTime:   '21:00',
    date: '2026-05-07',
    status: 'completed',
    totalExpected: 9,
    attendanceRecords: [
      { memberId: 'MBR-005', memberName: 'Vikram Singh',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Ghatnayak',   status: 'present', markedAt: '2026-05-07T19:02:00Z' },
      { memberId: 'MBR-008', memberName: 'Sonia Shah',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-07T19:04:00Z' },
      { memberId: 'MBR-017', memberName: 'Amit Rao',       gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'absent'  },
    ],
  },
  {
    id: 'SES-016',
    title: 'Manchester Shakha — Thursday',
    activityCentre: 'Manchester Central Activity Centre',
    region: 'North West',
    town: 'Manchester',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '19:00',
    endTime:   '21:00',
    date: '2026-05-14',
    status: 'completed',
    totalExpected: 9,
    attendanceRecords: [
      { memberId: 'MBR-005', memberName: 'Vikram Singh',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Ghatnayak',   status: 'absent'  },
      { memberId: 'MBR-008', memberName: 'Sonia Shah',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-14T19:05:00Z' },
      { memberId: 'MBR-017', memberName: 'Amit Rao',       gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-14T19:07:00Z' },
    ],
  },
  {
    id: 'SES-017',
    title: 'Manchester Shakha — Thursday',
    activityCentre: 'Manchester Central Activity Centre',
    region: 'North West',
    town: 'Manchester',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '19:00',
    endTime:   '21:00',
    date: '2026-05-21',
    status: 'completed',
    totalExpected: 9,
    attendanceRecords: [
      { memberId: 'MBR-005', memberName: 'Vikram Singh',   gender: 'male',   ageCategory: 'adult', jobTitle: 'Ghatnayak',   status: 'present', markedAt: '2026-05-21T19:01:00Z' },
      { memberId: 'MBR-008', memberName: 'Sonia Shah',     gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-21T19:03:00Z' },
      { memberId: 'MBR-017', memberName: 'Amit Rao',       gender: 'male',   ageCategory: 'adult', jobTitle: 'Shikshak',          status: 'present', markedAt: '2026-05-21T19:06:00Z' },
    ],
  },
  {
    id: 'SES-018',
    title: 'Manchester Shakha — Thursday',
    activityCentre: 'Manchester Central Activity Centre',
    region: 'North West',
    town: 'Manchester',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '19:00',
    endTime:   '21:00',
    date: '2026-05-28',
    status: 'scheduled',
    totalExpected: 9,
    attendanceRecords: [],
  },

  // ── Leeds North — Fortnightly ─────────────────────────────
  {
    id: 'SES-019',
    title: 'Leeds Shakha — Fortnightly',
    activityCentre: 'Leeds North Activity Centre',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    frequency: 'fortnightly',
    dayOfWeek: 6,
    startTime: '14:00',
    endTime:   '16:00',
    date: '2026-05-09',
    status: 'completed',
    totalExpected: 7,
    attendanceRecords: [
      { memberId: 'MBR-018', memberName: 'Deepak Sharma',  gender: 'male',   ageCategory: 'adult', jobTitle: 'Karyawaha',         status: 'present', markedAt: '2026-05-09T14:03:00Z' },
      { memberId: 'MBR-019', memberName: 'Nisha Kapoor',   gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-09T14:06:00Z' },
      { memberId: 'MBR-020', memberName: 'Rohit Dixit',    gender: 'male',   ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'absent'  },
    ],
  },
  {
    id: 'SES-020',
    title: 'Leeds Shakha — Fortnightly',
    activityCentre: 'Leeds North Activity Centre',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    frequency: 'fortnightly',
    dayOfWeek: 6,
    startTime: '14:00',
    endTime:   '16:00',
    date: '2026-05-23',
    status: 'completed',
    totalExpected: 7,
    attendanceRecords: [
      { memberId: 'MBR-018', memberName: 'Deepak Sharma',  gender: 'male',   ageCategory: 'adult', jobTitle: 'Karyawaha',         status: 'present', markedAt: '2026-05-23T14:02:00Z' },
      { memberId: 'MBR-019', memberName: 'Nisha Kapoor',   gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'absent'  },
      { memberId: 'MBR-020', memberName: 'Rohit Dixit',    gender: 'male',   ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'present', markedAt: '2026-05-23T14:05:00Z' },
    ],
  },
  {
    id: 'SES-021',
    title: 'Leeds Shakha — Fortnightly',
    activityCentre: 'Leeds North Activity Centre',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    frequency: 'fortnightly',
    dayOfWeek: 6,
    startTime: '14:00',
    endTime:   '16:00',
    date: '2026-06-06',
    status: 'scheduled',
    totalExpected: 7,
    attendanceRecords: [],
  },

  // ── Edinburgh — One-off special session ───────────────────
  {
    id: 'SES-022',
    title: 'Edinburgh — Special Yoga Session',
    activityCentre: 'Edinburgh Activity Centre',
    region: 'Scotland',
    town: 'Edinburgh',
    frequency: 'one-off',
    dayOfWeek: 0,
    startTime: '10:00',
    endTime:   '12:30',
    date: '2026-05-19',
    status: 'completed',
    totalExpected: 15,
    attendanceRecords: [
      { memberId: 'MBR-021', memberName: 'Rajan Menon',    gender: 'male',   ageCategory: 'adult', jobTitle: 'Mukhya Shikshak',  status: 'present', markedAt: '2026-05-19T10:02:00Z' },
      { memberId: 'MBR-022', memberName: 'Leela Nambiar',  gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-19T10:04:00Z' },
      { memberId: 'MBR-023', memberName: 'Suraj Pillai',   gender: 'male',   ageCategory: 'teen',  jobTitle: 'Kishor(i)',     status: 'absent'  },
      { memberId: 'MBR-024', memberName: 'Gita Krishnan',  gender: 'female', ageCategory: 'adult', jobTitle: 'Sewa',            status: 'present', markedAt: '2026-05-19T10:07:00Z' },
    ],
  },

  // ── June sessions ─────────────────────────────────────────
  {
    id: 'SES-023',
    title: 'Wembley Shakha — Weekly',
    activityCentre: 'Wembley Activity Centre',
    region: 'London & South East',
    town: 'Wembley',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime:   '20:00',
    date: '2026-06-11',
    status: 'scheduled',
    totalExpected: 12,
    attendanceRecords: [],
  },
  {
    id: 'SES-024',
    title: 'Birmingham East Shakha',
    activityCentre: 'Birmingham East Activity Centre',
    region: 'Midlands',
    town: 'Birmingham',
    frequency: 'weekly',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime:   '13:00',
    date: '2026-06-01',
    status: 'scheduled',
    totalExpected: 10,
    attendanceRecords: [],
  },
  {
    id: 'SES-025',
    title: 'Manchester Shakha — Thursday',
    activityCentre: 'Manchester Central Activity Centre',
    region: 'North West',
    town: 'Manchester',
    frequency: 'weekly',
    dayOfWeek: 4,
    startTime: '19:00',
    endTime:   '21:00',
    date: '2026-06-04',
    status: 'scheduled',
    totalExpected: 9,
    attendanceRecords: [],
  },
];
