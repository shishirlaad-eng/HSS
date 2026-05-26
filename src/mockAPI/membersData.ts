// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Members Mock Data
// ─────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'pending' | 'pending-parental-consent' | 'inactive' | 'rejected';
export type ComplianceStatus = 'pending' | 'completed';
export type ConsentStatus = 'n/a' | 'pending' | 'granted';
export type Gender = 'male' | 'female';
export type AgeCategory = 'child' | 'teen' | 'adult';
export type MemberType = 'adult' | 'teen' | 'child';

export interface MemberCompliance {
  dbs: ComplianceStatus;
  firstAid: ComplianceStatus;
  parentalConsent: ConsentStatus;
}

export interface Member {
  id: string;
  memberType: MemberType;
  name: string;
  email: string;
  guardianEmail?: string;
  guardianName?: string;
  phone?: string;
  dateOfBirth: string;        // ISO date string
  gender: Gender;
  jobTitle: string;           // Role within HSS (Sevak, Karyavah, Shikshak, etc.)
  orgRole: string;            // Organisational role label
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  status: MemberStatus;
  registrationDate: string;   // ISO date string
  compliance: MemberCompliance;
  dbsRef?: string;
  firstAidRef?: string;
  eventsAttended: number;
  shakhaSessionsAttended: number;
}

// ── Helpers ──────────────────────────────────────────────────

export function getAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function getAgeCategory(dateOfBirth: string): AgeCategory {
  const age = getAge(dateOfBirth);
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  return 'adult';
}

export const AGE_CATEGORY_LABELS: Record<AgeCategory, string> = {
  child: 'Child (<13)',
  teen:  'Teen (13–17)',
  adult: 'Adult (18+)',
};

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  adult: 'Adult',
  teen:  'Teen',
  child: 'Child',
};

// ── Masters Cascade Data ──────────────────────────────────────

export const MASTERS_CASCADE = {
  countries: [
    'HSS UK', 'HSS Ireland', 'HSS Channel Islands',
    'HSS United States', 'HSS Canada', 'HSS Germany',
    'HSS Norway', 'HSS Denmark', 'HSS Finland',
  ],
  regions: {
    'HSS UK':              ['London & South East', 'Midlands', 'North West', 'Yorkshire & Humber', 'Scotland', 'Wales'],
    'HSS Ireland':         ['Dublin', 'Cork'],
    'HSS Channel Islands': ['Jersey', 'Guernsey'],
    'HSS United States':   ['East Coast', 'West Coast'],
    'HSS Canada':          ['Ontario', 'British Columbia'],
    'HSS Germany':         ['Bayern', 'Berlin'],
    'HSS Norway':          ['Oslo'],
    'HSS Denmark':         ['Copenhagen'],
    'HSS Finland':         ['Helsinki'],
  } as Record<string, string[]>,
  towns: {
    'London & South East': ['Wembley', 'Harrow', 'Southall', 'Ilford'],
    'Midlands':            ['Birmingham', 'Coventry', 'Leicester', 'Derby'],
    'North West':          ['Manchester', 'Liverpool'],
    'Yorkshire & Humber':  ['Leeds', 'Sheffield'],
    'Scotland':            ['Edinburgh', 'Glasgow'],
    'Wales':               ['Cardiff'],
    'Dublin':              ['Dublin City'],
    'Cork':                ['Cork City'],
    'Jersey':              ['St Helier'],
    'Guernsey':            ['St Peter Port'],
    'East Coast':          ['New York', 'Boston'],
    'West Coast':          ['Los Angeles', 'San Francisco'],
    'Ontario':             ['Toronto', 'Ottawa'],
    'British Columbia':    ['Vancouver'],
    'Bayern':              ['Munich'],
    'Berlin':              ['Berlin City'],
    'Oslo':                ['Oslo City'],
    'Copenhagen':          ['Copenhagen City'],
    'Helsinki':            ['Helsinki City'],
  } as Record<string, string[]>,
  centres: {
    'Wembley':         ['Wembley Activity Centre'],
    'Harrow':          ['Harrow Activity Centre'],
    'Southall':        ['Southall Activity Centre'],
    'Ilford':          ['Ilford Activity Centre'],
    'Birmingham':      ['Birmingham East Activity Centre', 'Birmingham West Activity Centre'],
    'Coventry':        ['Coventry Activity Centre'],
    'Leicester':       ['Leicester Activity Centre'],
    'Derby':           ['Derby Activity Centre'],
    'Manchester':      ['Manchester Central Activity Centre'],
    'Liverpool':       ['Liverpool Activity Centre'],
    'Leeds':           ['Leeds North Activity Centre'],
    'Sheffield':       ['Sheffield Activity Centre'],
    'Edinburgh':       ['Edinburgh Activity Centre'],
    'Glasgow':         ['Glasgow Activity Centre'],
    'Cardiff':         ['Cardiff Activity Centre'],
    'Dublin City':     ['Dublin Activity Centre'],
    'Cork City':       ['Cork Activity Centre'],
    'St Helier':       ['Jersey Activity Centre'],
    'St Peter Port':   ['Guernsey Activity Centre'],
    'New York':        ['New York Activity Centre'],
    'Boston':          ['Boston Activity Centre'],
    'Los Angeles':     ['Los Angeles Activity Centre'],
    'San Francisco':   ['San Francisco Activity Centre'],
    'Toronto':         ['Toronto Activity Centre'],
    'Ottawa':          ['Ottawa Activity Centre'],
    'Vancouver':       ['Vancouver Activity Centre'],
    'Munich':          ['Munich Activity Centre'],
    'Berlin City':     ['Berlin Activity Centre'],
    'Oslo City':       ['Oslo Activity Centre'],
    'Copenhagen City': ['Copenhagen Activity Centre'],
    'Helsinki City':   ['Helsinki Activity Centre'],
  } as Record<string, string[]>,
};

// ── Mock Data — 10 members with full variety ─────────────────

export const mockMembers: Member[] = [
  {
    id: 'MBR-001',
    memberType: 'adult',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    phone: '+44 7711 234567',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    jobTitle: 'Karyavah',
    orgRole: 'Volunteer',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    status: 'active',
    registrationDate: '2023-06-10T09:00:00Z',
    compliance: { dbs: 'completed', firstAid: 'completed', parentalConsent: 'n/a' },
    dbsRef: 'DBS-2024-001',
    firstAidRef: 'FA-2023-001',
    eventsAttended: 14,
    shakhaSessionsAttended: 52,
  },
  {
    id: 'MBR-002',
    memberType: 'adult',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+44 7722 345678',
    dateOfBirth: '1995-07-22',
    gender: 'female',
    jobTitle: 'Sevika',
    orgRole: 'Member',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    status: 'active',
    registrationDate: '2023-09-01T10:30:00Z',
    compliance: { dbs: 'completed', firstAid: 'pending', parentalConsent: 'n/a' },
    dbsRef: 'DBS-2023-002',
    eventsAttended: 8,
    shakhaSessionsAttended: 30,
  },
  {
    id: 'MBR-003',
    memberType: 'adult',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@example.com',
    phone: '+44 7733 456789',
    dateOfBirth: '1985-11-08',
    gender: 'male',
    jobTitle: 'Mukhya Shikshak',
    orgRole: 'Shakha Teacher',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    status: 'active',
    registrationDate: '2022-01-20T08:00:00Z',
    compliance: { dbs: 'completed', firstAid: 'completed', parentalConsent: 'n/a' },
    dbsRef: 'DBS-2022-003',
    firstAidRef: 'FA-2022-003',
    eventsAttended: 22,
    shakhaSessionsAttended: 104,
  },
  {
    id: 'MBR-004',
    memberType: 'teen',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    guardianEmail: 'rajesh.gupta@example.com',
    guardianName: 'Rajesh Gupta',
    phone: '+44 7744 567890',
    dateOfBirth: '2008-05-14',
    gender: 'female',
    jobTitle: 'Shiksha Arthi',
    orgRole: 'Teen Member',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Coventry',
    activityCentre: 'Coventry Activity Centre',
    status: 'active',
    registrationDate: '2024-01-15T11:00:00Z',
    compliance: { dbs: 'pending', firstAid: 'completed', parentalConsent: 'granted' },
    eventsAttended: 5,
    shakhaSessionsAttended: 18,
  },
  {
    id: 'MBR-005',
    memberType: 'adult',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+44 7755 678901',
    dateOfBirth: '1978-09-30',
    gender: 'male',
    jobTitle: 'Ghatna Pramukh',
    orgRole: 'Activity Centre Admin',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    status: 'active',
    registrationDate: '2021-08-05T14:00:00Z',
    compliance: { dbs: 'completed', firstAid: 'completed', parentalConsent: 'n/a' },
    dbsRef: 'DBS-2021-005',
    firstAidRef: 'FA-2021-005',
    eventsAttended: 35,
    shakhaSessionsAttended: 156,
  },
  {
    id: 'MBR-006',
    memberType: 'adult',
    name: 'Anita Verma',
    email: 'anita.verma@example.com',
    phone: '+44 7766 789012',
    dateOfBirth: '2000-12-03',
    gender: 'female',
    jobTitle: 'Sevika',
    orgRole: 'Member',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    status: 'pending',
    registrationDate: '2025-04-20T09:30:00Z',
    compliance: { dbs: 'pending', firstAid: 'pending', parentalConsent: 'n/a' },
    eventsAttended: 0,
    shakhaSessionsAttended: 0,
  },
  {
    id: 'MBR-007',
    memberType: 'teen',
    name: 'Rohan Joshi',
    email: 'rohan.joshi@example.com',
    guardianEmail: 'meena.joshi@example.com',
    guardianName: 'Meena Joshi',
    dateOfBirth: '2010-02-19',
    gender: 'male',
    jobTitle: 'Shiksha Arthi',
    orgRole: 'Teen Member',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    status: 'pending-parental-consent',
    registrationDate: '2025-05-01T10:00:00Z',
    compliance: { dbs: 'completed', firstAid: 'completed', parentalConsent: 'pending' },
    eventsAttended: 0,
    shakhaSessionsAttended: 2,
  },
  {
    id: 'MBR-008',
    memberType: 'adult',
    name: 'Kavita Nair',
    email: 'kavita.nair@example.com',
    phone: '+44 7788 901234',
    dateOfBirth: '1988-06-27',
    gender: 'female',
    jobTitle: 'Shikshak',
    orgRole: 'Shakha Teacher',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    status: 'inactive',
    registrationDate: '2022-03-14T08:00:00Z',
    compliance: { dbs: 'pending', firstAid: 'completed', parentalConsent: 'n/a' },
    firstAidRef: 'FA-2022-008',
    eventsAttended: 11,
    shakhaSessionsAttended: 44,
  },
  {
    id: 'MBR-009',
    memberType: 'adult',
    name: 'Deepak Rao',
    email: 'deepak.rao@example.com',
    phone: '+44 7799 012345',
    dateOfBirth: '1993-04-11',
    gender: 'male',
    jobTitle: 'Sevak',
    orgRole: 'Member',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Leicester',
    activityCentre: 'Leicester Activity Centre',
    status: 'rejected',
    registrationDate: '2025-02-10T13:00:00Z',
    compliance: { dbs: 'pending', firstAid: 'pending', parentalConsent: 'n/a' },
    eventsAttended: 0,
    shakhaSessionsAttended: 0,
  },
  {
    id: 'MBR-010',
    memberType: 'child',
    name: 'Divya Krishnan',
    email: 'divya.krishnan@example.com',
    guardianEmail: 'suresh.krishnan@example.com',
    guardianName: 'Suresh Krishnan',
    dateOfBirth: '2014-08-25',
    gender: 'female',
    jobTitle: 'Shiksha Arthi',
    orgRole: 'Child Member',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    status: 'active',
    registrationDate: '2024-09-01T09:00:00Z',
    compliance: { dbs: 'completed', firstAid: 'completed', parentalConsent: 'granted' },
    eventsAttended: 3,
    shakhaSessionsAttended: 12,
  },
];

// ── Filter Options (used by AdvancedSearchPanel) ──────────────

export const MEMBER_FILTER_OPTIONS: Record<string, string[]> = {
  'Status':            ['Active', 'Pending Approval', 'Pending Parental Consent', 'Inactive', 'Rejected'],
  'Member Type':       ['Adult', 'Teen', 'Child'],
  'Gender':            ['Male', 'Female'],
  'Country':           MASTERS_CASCADE.countries,
  'Region':            Object.keys(MASTERS_CASCADE.towns),
  'Town':              Object.values(MASTERS_CASCADE.towns).flat(),
  'Activity Centre':   Object.values(MASTERS_CASCADE.centres).flat(),
  'DBS Status':        ['Pending', 'Completed'],
  'First Aid Status':  ['Pending', 'Completed'],
};
