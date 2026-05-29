// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Members Mock Data
// ─────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'pending' | 'pending-parental-consent' | 'inactive' | 'rejected';
export type ComplianceStatus = 'pending' | 'completed';
export type ConsentStatus = 'n/a' | 'pending' | 'granted';
export type Gender = 'male' | 'female';
export type AgeCategory = 'child' | 'teen' | 'adult';
export type MemberType = 'adult' | 'teen' | 'child';
export type AgeGroup = 'bal' | 'shishu' | 'kishor' | 'tarun' | 'yuva' | 'jyestha';
export type DietaryRequirement = 'FODMAP' | 'Gluten-free' | 'No Onions Or Garlic' | 'Vegan';
export type ResponsibilityType = 'Pramukh' | 'Saha' | 'Toli';
export type ResponsibilityLevel = 'Kendriya / National' | 'Vibhaag / Region' | 'Nagar / Town' | 'Shakha / Activity center';

export const DIETARY_REQUIREMENTS: DietaryRequirement[] = [
  'FODMAP',
  'Gluten-free',
  'No Onions Or Garlic',
  'Vegan',
];

export const RESPONSIBILITY_TYPE_OPTIONS: ResponsibilityType[] = [
  'Pramukh',
  'Saha',
  'Toli',
];

export const RESPONSIBILITY_LEVEL_OPTIONS: ResponsibilityLevel[] = [
  'Kendriya / National',
  'Vibhaag / Region',
  'Nagar / Town',
  'Shakha / Activity center',
];

export const ROLE_TYPE_OPTIONS = [
  'Ghatnayak',
  'Sankhya',
  'Shikshak',
  'Mukhya Shikshak',
  'Karyawaha',
  'Shareerik',
  'Bauddhik',
  'Sewa',
  'Sampark',
  'Nidhi',
  'Vyavestha',
  'Prachaar',
  'Bal(ika)',
  'Shishu',
  'Kishor(i)',
  'Tarun(i)',
  'Yuva(ti)',
  'Jyestha(a)',
  'Karyalay',
  'SSV',
  'Vistaar',
  'Sanghchalak',
  'Hindu Sahitya Kendra',
] as const;

export const SPOKEN_LANGUAGE_OPTIONS = [
  'Assamese',
  'Bengali',
  'English',
  'Gujarati',
  'Hindi',
  'Kannada',
  'Konkani',
  'Malayalam',
  'Marathi',
  'Nepali',
  'Odia',
  'Punjabi',
  'Sanskrit',
  'Tamil',
  'Telugu',
  'Other',
] as const;

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  bal: 'Bal (0-5)',
  shishu: 'Shishu (6-11)',
  kishor: 'Kishor (12-16)',
  tarun: 'Tarun (17-30)',
  yuva: 'Yuva (30-60)',
  jyestha: 'Jyestha (60+)',
};

export interface MemberCompliance {
  dbs: ComplianceStatus;
  firstAid: ComplianceStatus;
  parentalConsent: ConsentStatus;
}

export interface Member {
  id: string;
  memberType: MemberType;
  name: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  email: string;
  secondaryEmail?: string;
  guardianEmail?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  phone?: string;
  secondaryPhone?: string;
  buildingName?: string;
  addressLine1?: string;
  addressLine2?: string;
  contactTownCity?: string;
  postCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  emergencyContactRelationship?: string;
  dateOfBirth: string;        // ISO date string
  gender: Gender;
  jobTitle: string;           // Role within HSS (Ghatnayak, Shikshak, Karyawaha, etc.)
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
  medicalInfoDeclared?: boolean;
  medicalInfoDetails?: string;
  isFirstAider?: boolean;
  dietaryRequirements?: DietaryRequirement[];
  occupation?: string;
  spokenLanguages?: string[];
  originatingStateIndia?: string;
  responsibilityType?: ResponsibilityType;
  responsibilityLevel?: ResponsibilityLevel;
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

export function getAgeGroup(dateOfBirth: string): AgeGroup {
  const age = getAge(dateOfBirth);
  if (age <= 5) return 'bal';
  if (age <= 11) return 'shishu';
  if (age <= 16) return 'kishor';
  if (age <= 30) return 'tarun';
  if (age <= 60) return 'yuva';
  return 'jyestha';
}

export function getAgeGroupLabel(dateOfBirth: string): string {
  return AGE_GROUP_LABELS[getAgeGroup(dateOfBirth)];
}

export function getMemberTypeFromAge(dateOfBirth: string): MemberType {
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

function splitMemberName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    surname: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function withRegistrationFields(member: Member): Member {
  const nameParts = splitMemberName(member.name);
  const isMinor = member.memberType === 'teen' || member.memberType === 'child';
  const guardianName = member.guardianName ?? (isMinor ? `Parent of ${member.name}` : undefined);
  const guardianEmail = member.guardianEmail ?? (isMinor ? `guardian.${member.email}` : undefined);
  const guardianPhone = member.guardianPhone ?? (isMinor ? member.phone ?? '+44 7700 000000' : undefined);

  return {
    ...member,
    firstName: member.firstName ?? nameParts.firstName,
    middleName: member.middleName ?? nameParts.middleName,
    surname: member.surname ?? nameParts.surname,
    secondaryEmail: member.secondaryEmail ?? '',
    secondaryPhone: member.secondaryPhone ?? '',
    buildingName: member.buildingName ?? '',
    addressLine1: member.addressLine1 ?? `${member.activityCentre.replace(' Activity Centre', '')} Community Hall`,
    addressLine2: member.addressLine2 ?? '',
    contactTownCity: member.contactTownCity ?? member.town,
    postCode: member.postCode ?? 'AB1 2CD',
    emergencyContactName: member.emergencyContactName ?? guardianName ?? 'Emergency Contact',
    emergencyContactPhone: member.emergencyContactPhone ?? guardianPhone ?? member.phone ?? '+44 7700 000000',
    emergencyContactEmail: member.emergencyContactEmail ?? guardianEmail ?? member.email,
    emergencyContactRelationship: member.emergencyContactRelationship ?? (isMinor ? 'Parent / Guardian' : 'Family'),
    guardianName,
    guardianEmail,
    guardianPhone,
    guardianRelationship: member.guardianRelationship ?? (isMinor ? 'Parent / Guardian' : undefined),
    medicalInfoDeclared: member.medicalInfoDeclared ?? false,
    medicalInfoDetails: member.medicalInfoDetails ?? '',
    isFirstAider: member.isFirstAider ?? member.compliance.firstAid === 'completed',
    dietaryRequirements: member.dietaryRequirements ?? [],
    occupation: member.occupation ?? (member.memberType === 'adult' ? 'Professional' : 'Student'),
    spokenLanguages: member.spokenLanguages ?? ['English'],
    originatingStateIndia: member.originatingStateIndia ?? '',
    responsibilityType: member.responsibilityType ?? 'Pramukh',
    responsibilityLevel: member.responsibilityLevel ?? 'Shakha / Activity center',
  };
}

// ── Mock Data — 10 members with full variety ─────────────────

const rawMockMembers: Member[] = [
  {
    id: 'MBR-001',
    memberType: 'adult',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    phone: '+44 7711 234567',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    jobTitle: 'Ghatnayak',
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
    jobTitle: 'Sankhya',
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
    jobTitle: 'Shikshak',
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
    jobTitle: 'Mukhya Shikshak',
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
    jobTitle: 'Karyawaha',
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
    jobTitle: 'Shareerik',
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
    jobTitle: 'Bauddhik',
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
    jobTitle: 'Sewa',
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
    jobTitle: 'Sampark',
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
    jobTitle: 'Nidhi',
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

export const mockMembers: Member[] = rawMockMembers.map(withRegistrationFields);

// ── Filter Options (used by AdvancedSearchPanel) ──────────────

export const MEMBER_FILTER_OPTIONS: Record<string, string[]> = {
  'Status':            ['Active', 'Pending Approval', 'Pending Parental Consent', 'Inactive', 'Rejected'],
  'Age Groups (years old)': Object.values(AGE_GROUP_LABELS),
  'Gender':            ['Male', 'Female'],
  'Country':           MASTERS_CASCADE.countries,
  'Region':            Object.keys(MASTERS_CASCADE.towns),
  'Town':              Object.values(MASTERS_CASCADE.towns).flat(),
  'Activity Centre':   Object.values(MASTERS_CASCADE.centres).flat(),
  'DBS Status':        ['Pending', 'Completed'],
  'First Aid Status':  ['Pending', 'Completed'],
};
