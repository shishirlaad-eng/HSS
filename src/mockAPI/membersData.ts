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
export type ResponsibilityType = 'Pramukh' | 'Pramukh (Saha)' | 'Toli';
export type ResponsibilityLevel = 'Kendriya / National' | 'Vibhaag / Region' | 'Nagar / Town' | 'Shakha / Activity center';

export const DIETARY_REQUIREMENTS: DietaryRequirement[] = [
  'FODMAP',
  'Gluten-free',
  'No Onions Or Garlic',
  'Vegan',
];

export const RESPONSIBILITY_TYPE_OPTIONS: ResponsibilityType[] = [
  'Pramukh',
  'Pramukh (Saha)',
  'Toli',
];

export const RESPONSIBILITY_LEVEL_OPTIONS: ResponsibilityLevel[] = [
  'Kendriya / National',
  'Vibhaag / Region',
  'Nagar / Town',
  'Shakha / Activity center',
];

export const FIRST_AID_QUALIFICATION_OPTIONS = [
  '1-day First Aid qualification',
  '3-day First Aid at Work qualification',
  'Doctor registered and licensed with the General Medical Council',
  'Nurse registered with the Nursing and Midwifery Council',
  'Paramedic registered with the Health and Care Professions Council',
] as const;

export type FirstAidQualification = typeof FIRST_AID_QUALIFICATION_OPTIONS[number];

export const SAFEGUARDING_LEVEL_OPTIONS = [
  'Basic Awareness (Level 1)',
  'Child Protection Intermediate (Level 2)',
  'Child Protection Advanced (Level 3)',
  'Lead Practitioner (Level 4)',
  'Designated Safeguarding Lead (DSL)',
] as const;

export type SafeguardingLevel = typeof SAFEGUARDING_LEVEL_OPTIONS[number];

// ── Karyakartas — members who hold a sangh responsibility ─────
// Only the members listed here have a Responsibility (Type + Level)
// assigned. Everyone else has none — this drives the "Karyakartas"
// view in Members Management. Spread across scopes so every role
// sees a few within their hierarchy.
export const KARYAKARTA_ASSIGNMENTS: Record<string, { type: ResponsibilityType; level: ResponsibilityLevel }> = {
  // Wembley Activity Centre (Town Head / Activity Centre Admin / Regional / National / Super)
  'MBR-001': { type: 'Pramukh', level: 'Shakha / Activity center' },
  'WBL-001': { type: 'Pramukh', level: 'Nagar / Town' },
  'WBL-002': { type: 'Pramukh (Saha)', level: 'Shakha / Activity center' },
  'WBL-003': { type: 'Toli',    level: 'Shakha / Activity center' },
  'WBL-005': { type: 'Pramukh (Saha)', level: 'Shakha / Activity center' },
  'WBL-007': { type: 'Pramukh', level: 'Nagar / Town' },
  'WBL-009': { type: 'Pramukh', level: 'Shakha / Activity center' },
  'WBL-010': { type: 'Toli',    level: 'Shakha / Activity center' },
  // Harrow (London & South East — Regional / National / Super)
  'MBR-002': { type: 'Pramukh (Saha)', level: 'Nagar / Town' },
  // Birmingham (Midlands — National / Super)
  'MBR-003': { type: 'Pramukh', level: 'Vibhaag / Region' },
};

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
  safeguardingTraining?: ComplianceStatus;
}

export interface PreviousResponsibility {
  responsibilityType: ResponsibilityType;
  responsibilityLevel: ResponsibilityLevel;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface ResponsibilityAssignment {
  responsibilityLevel: ResponsibilityLevel;
  sanghResponsibility: string;
  responsibilityType: ResponsibilityType;
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
  additionalJobTitles?: string[]; // Additional HSS roles held by the member
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
  safeguardingTrainingDate?: string;
  safeguardingTrainingLevel?: SafeguardingLevel;
  medicalInfoDeclared?: boolean;
  medicalInfoDetails?: string;
  isFirstAider?: boolean;
  firstAidQualificationLevel?: FirstAidQualification;
  firstAidQualificationExpiryDate?: string;
  dietaryRequirements?: DietaryRequirement[];
  occupation?: string;
  spokenLanguages?: string[];
  originatingStateIndia?: string;
  adminRole?: string;
  adminRoles?: string[];
  responsibilityType?: ResponsibilityType;
  responsibilityLevel?: ResponsibilityLevel;
  responsibilities?: ResponsibilityAssignment[];
  previousResponsibilities?: PreviousResponsibility[];
  eventsAttended: number;
  shakhaSessionsAttended: number;
}

// ── Helpers ──────────────────────────────────────────────────

// A "Karyakarta" is a member who has a sangh Responsibility assigned
export function hasResponsibility(m: Member): boolean {
  return !!m.responsibilityType && !!m.responsibilityLevel;
}

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
    compliance: {
      ...member.compliance,
      // Deterministic mock: ~2/3 of members have completed safeguarding training
      safeguardingTraining: member.compliance.safeguardingTraining
        ?? (member.id.charCodeAt(member.id.length - 1) % 3 !== 0 ? 'completed' : 'pending'),
    },
    medicalInfoDeclared: member.medicalInfoDeclared ?? false,
    medicalInfoDetails: member.medicalInfoDetails ?? '',
    isFirstAider: member.isFirstAider ?? member.compliance.firstAid === 'completed',
    dietaryRequirements: member.dietaryRequirements ?? [],
    occupation: member.occupation ?? (member.memberType === 'adult' ? 'Professional' : 'Student'),
    spokenLanguages: member.spokenLanguages ?? ['English'],
    originatingStateIndia: member.originatingStateIndia ?? '',
    responsibilityType: member.responsibilityType ?? KARYAKARTA_ASSIGNMENTS[member.id]?.type,
    responsibilityLevel: member.responsibilityLevel ?? KARYAKARTA_ASSIGNMENTS[member.id]?.level,
    previousResponsibilities: member.previousResponsibilities ?? [
      { responsibilityType: 'Pramukh (Saha)', responsibilityLevel: 'Shakha / Activity center', startDate: '2022-04-01', endDate: '2023-03-31' },
      { responsibilityType: 'Toli', responsibilityLevel: 'Nagar / Town', startDate: '2023-04-01', endDate: '2024-03-31' },
    ],
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
    orgRole: 'Shakha Admin',
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

  // ── Wembley Activity Centre — 200 members (WBL-001 to WBL-200) ───────────
  // Matches the attendance record IDs used in SES-001

  { id:'WBL-001', memberType:'adult',  name:'Vikram Singh',       email:'vikram.singh@hssuk.org',       dateOfBirth:'1966-02-14', gender:'male',   jobTitle:'Ghatnayak',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:35 },
  { id:'WBL-002', memberType:'adult',  name:'Priya Patel',        email:'priya.patel@hssuk.org',        dateOfBirth:'1995-01-15', gender:'female', jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:22 },
  { id:'WBL-003', memberType:'adult',  name:'Rahul Mehta',        email:'rahul.mehta@hssuk.org',        dateOfBirth:'1996-05-20', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:11, shakhaSessionsAttended:41 },
  { id:'WBL-004', memberType:'youth',  name:'Kavya Reddy',        email:'kavya.reddy@hssuk.org',        dateOfBirth:'2010-03-15', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:2,  shakhaSessionsAttended:15 },
  { id:'WBL-005', memberType:'adult',  name:'Nikhil Joshi',       email:'nikhil.joshi@hssuk.org',       dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:29 },
  { id:'WBL-006', memberType:'adult',  name:'Sneha Gupta',        email:'sneha.gupta@hssuk.org',        dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:18 },
  { id:'WBL-007', memberType:'adult',  name:'Amit Kumar',         email:'amit.kumar@hssuk.org',         dateOfBirth:'1968-07-22', gender:'male',   jobTitle:'Sanghchalak',            orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:12, shakhaSessionsAttended:48 },
  { id:'WBL-008', memberType:'adult',  name:'Nisha Kapoor',       email:'nisha.kapoor@hssuk.org',       dateOfBirth:'1999-11-05', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-009', memberType:'adult',  name:'Rajesh Verma',       email:'rajesh.verma@hssuk.org',       dateOfBirth:'1970-04-09', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:15, shakhaSessionsAttended:52 },
  { id:'WBL-010', memberType:'adult',  name:'Pooja Shah',         email:'pooja.shah@hssuk.org',         dateOfBirth:'2000-07-14', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-011', memberType:'adult',  name:'Sachin Rao',         email:'sachin.rao@hssuk.org',         dateOfBirth:'2001-02-28', gender:'male',   jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:33 },
  { id:'WBL-012', memberType:'adult',  name:'Lata Krishnan',      email:'lata.krishnan@hssuk.org',      dateOfBirth:'1972-11-17', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:40 },
  { id:'WBL-013', memberType:'adult',  name:'Deepak Bose',        email:'deepak.bose@hssuk.org',        dateOfBirth:'1974-03-28', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:14, shakhaSessionsAttended:55 },
  { id:'WBL-014', memberType:'adult',  name:'Geeta Menon',        email:'geeta.menon@hssuk.org',        dateOfBirth:'1944-06-12', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:8  },
  { id:'WBL-015', memberType:'adult',  name:'Kiran Trivedi',      email:'kiran.trivedi@hssuk.org',      dateOfBirth:'2002-09-18', gender:'male',   jobTitle:'Prachaar',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-016', memberType:'adult',  name:'Sunita Pandey',      email:'sunita.pandey@hssuk.org',      dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-017', memberType:'adult',  name:'Arun Chatterjee',    email:'arun.chatterjee@hssuk.org',    dateOfBirth:'1976-09-05', gender:'male',   jobTitle:'Vyavestha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-018', memberType:'adult',  name:'Maya Saxena',        email:'maya.saxena@hssuk.org',        dateOfBirth:'1978-06-19', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:36 },
  { id:'WBL-019', memberType:'adult',  name:'Vivek Mishra',       email:'vivek.mishra@hssuk.org',       dateOfBirth:'2004-12-22', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-020', memberType:'adult',  name:'Rekha Pillai',       email:'rekha.pillai@hssuk.org',       dateOfBirth:'1980-01-30', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:32 },
  { id:'WBL-021', memberType:'adult',  name:'Gaurav Tiwari',      email:'gaurav.tiwari@hssuk.org',      dateOfBirth:'2005-06-30', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-022', memberType:'adult',  name:'Hema Banerjee',      email:'hema.banerjee@hssuk.org',      dateOfBirth:'1982-12-08', gender:'female', jobTitle:'Hindu Sahitya Kendra',   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:11, shakhaSessionsAttended:44 },
  { id:'WBL-023', memberType:'adult',  name:'Yogesh Desai',       email:'yogesh.desai@hssuk.org',       dateOfBirth:'2006-01-11', gender:'male',   jobTitle:'Nidhi',                  orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:28 },
  { id:'WBL-024', memberType:'adult',  name:'Kavita Agarwal',     email:'kavita.agarwal@hssuk.org',     dateOfBirth:'2007-08-03', gender:'female', jobTitle:'Shakha / Activity center',orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:14 },
  { id:'WBL-025', memberType:'adult',  name:'Manish Rao',         email:'manish.rao@hssuk.org',         dateOfBirth:'2008-10-16', gender:'male',   jobTitle:'Sankhya',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-026', memberType:'adult',  name:'Sonia Mehta',        email:'sonia.mehta@hssuk.org',        dateOfBirth:'1995-01-15', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:25 },
  { id:'WBL-027', memberType:'youth',  name:'Rohit Das',          email:'rohit.das@hssuk.org',          dateOfBirth:'2011-07-22', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:2,  shakhaSessionsAttended:12 },
  { id:'WBL-028', memberType:'youth',  name:'Aarti Dubey',        email:'aarti.dubey@hssuk.org',        dateOfBirth:'2012-01-10', gender:'female', jobTitle:'Bal(ika)',               orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:9  },
  { id:'WBL-029', memberType:'adult',  name:'Pankaj Chaudhary',   email:'pankaj.chaudhary@hssuk.org',   dateOfBirth:'1996-05-20', gender:'male',   jobTitle:'Shareerik',              orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-030', memberType:'adult',  name:'Devika Roy',         email:'devika.roy@hssuk.org',         dateOfBirth:'1997-08-10', gender:'female', jobTitle:'Karyalay',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:21 },
  { id:'WBL-031', memberType:'adult',  name:'Sunil Malhotra',     email:'sunil.malhotra@hssuk.org',     dateOfBirth:'1984-05-24', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:37 },
  { id:'WBL-032', memberType:'adult',  name:'Vandana Srivastava', email:'vandana.srivastava@hssuk.org', dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-033', memberType:'adult',  name:'Hemant Arora',       email:'hemant.arora@hssuk.org',       dateOfBirth:'1986-10-13', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:12, shakhaSessionsAttended:46 },
  { id:'WBL-034', memberType:'adult',  name:'Indu Ghosh',         email:'indu.ghosh@hssuk.org',         dateOfBirth:'1947-11-03', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:6  },
  { id:'WBL-035', memberType:'child',  name:'Ishaan Naik',        email:'ishaan.naik@hssuk.org',        dateOfBirth:'2015-06-15', gender:'male',   jobTitle:'Shishu',                 orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'pending', firstAid:'pending', parentalConsent:'granted'}, eventsAttended:0,  shakhaSessionsAttended:5  },
  { id:'WBL-036', memberType:'youth',  name:'Anika Sharma',       email:'anika.sharma@hssuk.org',       dateOfBirth:'2013-09-05', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:8  },
  { id:'WBL-037', memberType:'adult',  name:'Raj Patel',          email:'raj.patel@hssuk.org',          dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-038', memberType:'adult',  name:'Divya Singh',        email:'divya.singh@hssuk.org',        dateOfBirth:'2000-07-14', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-039', memberType:'adult',  name:'Ganesh Nair',        email:'ganesh.nair@hssuk.org',        dateOfBirth:'1988-04-02', gender:'male',   jobTitle:'Ghatnayak',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:39 },
  { id:'WBL-040', memberType:'adult',  name:'Pritha Joshi',       email:'pritha.joshi@hssuk.org',       dateOfBirth:'2001-02-28', gender:'female', jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-041', memberType:'adult',  name:'Rakesh Yadav',       email:'rakesh.yadav@hssuk.org',       dateOfBirth:'2002-09-18', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-042', memberType:'adult',  name:'Smita Gupta',        email:'smita.gupta@hssuk.org',        dateOfBirth:'1990-08-27', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:33 },
  { id:'WBL-043', memberType:'adult',  name:'Chetan Mehta',       email:'chetan.mehta@hssuk.org',       dateOfBirth:'1992-03-16', gender:'male',   jobTitle:'Sanghchalak',            orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:36 },
  { id:'WBL-044', memberType:'youth',  name:'Payal Verma',        email:'payal.verma@hssuk.org',        dateOfBirth:'2014-04-28', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:7  },
  { id:'WBL-045', memberType:'adult',  name:'Bhavesh Iyer',       email:'bhavesh.iyer@hssuk.org',       dateOfBirth:'2003-04-07', gender:'male',   jobTitle:'Prachaar',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-046', memberType:'adult',  name:'Chanchal Rao',       email:'chanchal.rao@hssuk.org',       dateOfBirth:'2004-12-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:14 },
  { id:'WBL-047', memberType:'adult',  name:'Dilip Pillai',       email:'dilip.pillai@hssuk.org',       dateOfBirth:'1966-02-14', gender:'male',   jobTitle:'Vyavestha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:22 },
  { id:'WBL-048', memberType:'adult',  name:'Falak Reddy',        email:'falak.reddy@hssuk.org',        dateOfBirth:'2005-06-30', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-049', memberType:'adult',  name:'Gopal Bose',         email:'gopal.bose@hssuk.org',         dateOfBirth:'1950-02-18', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:5  },
  { id:'WBL-050', memberType:'adult',  name:'Harsha Trivedi',     email:'harsha.trivedi@hssuk.org',     dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-051', memberType:'adult',  name:'Jayesh Kapoor',      email:'jayesh.kapoor@hssuk.org',      dateOfBirth:'2007-08-03', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-052', memberType:'adult',  name:'Kamini Dixit',       email:'kamini.dixit@hssuk.org',       dateOfBirth:'1968-07-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:29 },
  { id:'WBL-053', memberType:'adult',  name:'Lalit Menon',        email:'lalit.menon@hssuk.org',        dateOfBirth:'2008-10-16', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-054', memberType:'adult',  name:'Madhuri Saxena',     email:'madhuri.saxena@hssuk.org',     dateOfBirth:'1995-01-15', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-055', memberType:'adult',  name:'Naveen Pandey',      email:'naveen.pandey@hssuk.org',      dateOfBirth:'1996-05-20', gender:'male',   jobTitle:'Nidhi',                  orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-056', memberType:'adult',  name:'Nalini Mishra',      email:'nalini.mishra@hssuk.org',      dateOfBirth:'1970-04-09', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:36 },
  { id:'WBL-057', memberType:'adult',  name:'Omkar Tiwari',       email:'omkar.tiwari@hssuk.org',       dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'Shareerik',              orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:21 },
  { id:'WBL-058', memberType:'adult',  name:'Padma Dubey',        email:'padma.dubey@hssuk.org',        dateOfBirth:'1952-08-25', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:4  },
  { id:'WBL-059', memberType:'adult',  name:'Prakash Banerjee',   email:'prakash.banerjee@hssuk.org',   dateOfBirth:'1972-11-17', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:11, shakhaSessionsAttended:42 },
  { id:'WBL-060', memberType:'adult',  name:'Revati Agarwal',     email:'revati.agarwal@hssuk.org',     dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:18 },
  { id:'WBL-061', memberType:'adult',  name:'Sanjeev Chatterjee', email:'sanjeev.chatterjee@hssuk.org', dateOfBirth:'1974-03-28', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2020-06-15T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:12, shakhaSessionsAttended:47 },
  { id:'WBL-062', memberType:'adult',  name:'Savitri Das',        email:'savitri.das@hssuk.org',        dateOfBirth:'1955-05-07', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:7  },
  { id:'WBL-063', memberType:'adult',  name:'Tilak Srivastava',   email:'tilak.srivastava@hssuk.org',   dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:25 },
  { id:'WBL-064', memberType:'adult',  name:'Tanvi Roy',          email:'tanvi.roy@hssuk.org',          dateOfBirth:'2000-07-14', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-065', memberType:'adult',  name:'Uday Ghosh',         email:'uday.ghosh@hssuk.org',         dateOfBirth:'2001-02-28', gender:'male',   jobTitle:'Karyalay',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:28 },
  { id:'WBL-066', memberType:'adult',  name:'Urvashi Malhotra',   email:'urvashi.malhotra@hssuk.org',   dateOfBirth:'2002-09-18', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:21 },
  { id:'WBL-067', memberType:'adult',  name:'Vijay Khanna',       email:'vijay.khanna@hssuk.org',       dateOfBirth:'1976-09-05', gender:'male',   jobTitle:'Ghatnayak',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:32 },
  { id:'WBL-068', memberType:'adult',  name:'Varsha Arora',       email:'varsha.arora@hssuk.org',       dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-069', memberType:'adult',  name:'Yogendra Bhatia',    email:'yogendra.bhatia@hssuk.org',    dateOfBirth:'1957-09-14', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:6  },
  { id:'WBL-070', memberType:'adult',  name:'Yamini Sethi',       email:'yamini.sethi@hssuk.org',       dateOfBirth:'2004-12-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:15 },
  { id:'WBL-071', memberType:'adult',  name:'Aditya Chopra',      email:'aditya.chopra@hssuk.org',      dateOfBirth:'2005-06-30', gender:'male',   jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-072', memberType:'adult',  name:'Amita Anand',        email:'amita.anand@hssuk.org',        dateOfBirth:'1978-06-19', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-073', memberType:'adult',  name:'Baldev Goel',        email:'baldev.goel@hssuk.org',        dateOfBirth:'1980-01-30', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:35 },
  { id:'WBL-074', memberType:'adult',  name:'Bharati Hegde',      email:'bharati.hegde@hssuk.org',      dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-075', memberType:'adult',  name:'Chandresh Naik',     email:'chandresh.naik@hssuk.org',     dateOfBirth:'2007-08-03', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-076', memberType:'youth',  name:'Charu Rathod',       email:'charu.rathod@hssuk.org',       dateOfBirth:'2010-03-15', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:2,  shakhaSessionsAttended:10 },
  { id:'WBL-077', memberType:'child',  name:'Dhruv Samant',       email:'dhruv.samant@hssuk.org',       dateOfBirth:'2016-02-20', gender:'male',   jobTitle:'Shishu',                 orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'pending', firstAid:'pending', parentalConsent:'granted'}, eventsAttended:0,  shakhaSessionsAttended:4  },
  { id:'WBL-078', memberType:'adult',  name:'Deepmala Upadhyay',  email:'deepmala.upadhyay@hssuk.org',  dateOfBirth:'2008-10-16', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-079', memberType:'adult',  name:'Eknath Vyas',        email:'eknath.vyas@hssuk.org',        dateOfBirth:'1960-01-29', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:5  },
  { id:'WBL-080', memberType:'adult',  name:'Esha Sharma',        email:'esha.sharma@hssuk.org',        dateOfBirth:'1995-01-15', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-081', memberType:'adult',  name:'Girish Patel',       email:'girish.patel@hssuk.org',       dateOfBirth:'1996-05-20', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:18 },
  { id:'WBL-082', memberType:'adult',  name:'Gauri Kumar',        email:'gauri.kumar@hssuk.org',        dateOfBirth:'1982-12-08', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-083', memberType:'adult',  name:'Hitesh Singh',       email:'hitesh.singh@hssuk.org',       dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'Prachaar',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-084', memberType:'youth',  name:'Hansika Nair',       email:'hansika.nair@hssuk.org',       dateOfBirth:'2011-07-22', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:8  },
  { id:'WBL-085', memberType:'adult',  name:'Ilesh Iyer',         email:'ilesh.iyer@hssuk.org',         dateOfBirth:'1998-03-25', gender:'male',   jobTitle:'Nidhi',                  orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-086', memberType:'adult',  name:'Indumati Joshi',     email:'indumati.joshi@hssuk.org',     dateOfBirth:'1962-06-08', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:3  },
  { id:'WBL-087', memberType:'adult',  name:'Jatin Mehta',        email:'jatin.mehta@hssuk.org',        dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:28 },
  { id:'WBL-088', memberType:'adult',  name:'Janaki Gupta',       email:'janaki.gupta@hssuk.org',       dateOfBirth:'1984-05-24', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:35 },
  { id:'WBL-089', memberType:'adult',  name:'Kapil Verma',        email:'kapil.verma@hssuk.org',        dateOfBirth:'2000-07-14', gender:'male',   jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-090', memberType:'adult',  name:'Kamakshi Desai',     email:'kamakshi.desai@hssuk.org',     dateOfBirth:'2001-02-28', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-091', memberType:'adult',  name:'Laxman Shah',        email:'laxman.shah@hssuk.org',        dateOfBirth:'1986-10-13', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:11, shakhaSessionsAttended:43 },
  { id:'WBL-092', memberType:'adult',  name:'Lalitha Rao',        email:'lalitha.rao@hssuk.org',        dateOfBirth:'1988-04-02', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:32 },
  { id:'WBL-093', memberType:'adult',  name:'Madhav Pillai',      email:'madhav.pillai@hssuk.org',      dateOfBirth:'2002-09-18', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-094', memberType:'adult',  name:'Mrunal Bose',        email:'mrunal.bose@hssuk.org',        dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-095', memberType:'adult',  name:'Navin Trivedi',      email:'navin.trivedi@hssuk.org',      dateOfBirth:'2004-12-22', gender:'male',   jobTitle:'Karyalay',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-096', memberType:'adult',  name:'Namrata Kapoor',     email:'namrata.kapoor@hssuk.org',     dateOfBirth:'2005-06-30', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-097', memberType:'youth',  name:'Parth Dixit',        email:'parth.dixit@hssuk.org',        dateOfBirth:'2012-01-10', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:2,  shakhaSessionsAttended:11 },
  { id:'WBL-098', memberType:'adult',  name:'Purnima Menon',      email:'purnima.menon@hssuk.org',      dateOfBirth:'1990-08-27', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-099', memberType:'adult',  name:'Ranjit Krishnan',    email:'ranjit.krishnan@hssuk.org',    dateOfBirth:'1992-03-16', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-100', memberType:'adult',  name:'Ratna Reddy',        email:'ratna.reddy@hssuk.org',        dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-101', memberType:'adult',  name:'Siddharth Saxena',   email:'siddharth.saxena@hssuk.org',   dateOfBirth:'2007-08-03', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-102', memberType:'adult',  name:'Sharda Pandey',      email:'sharda.pandey@hssuk.org',      dateOfBirth:'1944-06-12', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:4  },
  { id:'WBL-103', memberType:'adult',  name:'Trivikram Mishra',   email:'trivikram.mishra@hssuk.org',   dateOfBirth:'1966-02-14', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:39 },
  { id:'WBL-104', memberType:'adult',  name:'Trupti Tiwari',      email:'trupti.tiwari@hssuk.org',      dateOfBirth:'2008-10-16', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-105', memberType:'adult',  name:'Ujjwal Dubey',       email:'ujjwal.dubey@hssuk.org',       dateOfBirth:'1995-01-15', gender:'male',   jobTitle:'Shareerik',              orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-106', memberType:'adult',  name:'Urmila Chaudhary',   email:'urmila.chaudhary@hssuk.org',   dateOfBirth:'1968-07-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:28 },
  { id:'WBL-107', memberType:'adult',  name:'Vishnu Banerjee',    email:'vishnu.banerjee@hssuk.org',    dateOfBirth:'1970-04-09', gender:'male',   jobTitle:'Sanghchalak',            orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:35 },
  { id:'WBL-108', memberType:'adult',  name:'Vaidehi Agarwal',    email:'vaidehi.agarwal@hssuk.org',    dateOfBirth:'1996-05-20', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:18 },
  { id:'WBL-109', memberType:'adult',  name:'Wasim Srivastava',   email:'wasim.srivastava@hssuk.org',   dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-110', memberType:'adult',  name:'Yamuna Chatterjee',  email:'yamuna.chatterjee@hssuk.org',  dateOfBirth:'1972-11-17', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:32 },
  { id:'WBL-111', memberType:'youth',  name:'Yuvraj Das',         email:'yuvraj.das@hssuk.org',         dateOfBirth:'2013-09-05', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:6  },
  { id:'WBL-112', memberType:'adult',  name:'Zeenat Roy',         email:'zeenat.roy@hssuk.org',         dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-113', memberType:'adult',  name:'Aniket Ghosh',       email:'aniket.ghosh@hssuk.org',       dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-114', memberType:'adult',  name:'Achala Malhotra',    email:'achala.malhotra@hssuk.org',    dateOfBirth:'2000-07-14', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-115', memberType:'adult',  name:'Bharat Khanna',      email:'bharat.khanna@hssuk.org',      dateOfBirth:'1974-03-28', gender:'male',   jobTitle:'Ghatnayak',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:38 },
  { id:'WBL-116', memberType:'adult',  name:'Bipasha Arora',      email:'bipasha.arora@hssuk.org',      dateOfBirth:'2001-02-28', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-117', memberType:'adult',  name:'Cyrus Bhatia',       email:'cyrus.bhatia@hssuk.org',       dateOfBirth:'2002-09-18', gender:'male',   jobTitle:'Prachaar',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-118', memberType:'youth',  name:'Chandana Sethi',     email:'chandana.sethi@hssuk.org',     dateOfBirth:'2014-04-28', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:7  },
  { id:'WBL-119', memberType:'adult',  name:'Devraj Chopra',      email:'devraj.chopra@hssuk.org',      dateOfBirth:'1976-09-05', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:11, shakhaSessionsAttended:43 },
  { id:'WBL-120', memberType:'adult',  name:'Darshana Anand',     email:'darshana.anand@hssuk.org',     dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-121', memberType:'child',  name:'Eshan Goel',         email:'eshan.goel@hssuk.org',         dateOfBirth:'2017-10-08', gender:'male',   jobTitle:'Shishu',                 orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'pending', firstAid:'pending', parentalConsent:'granted'}, eventsAttended:0,  shakhaSessionsAttended:3  },
  { id:'WBL-122', memberType:'adult',  name:'Eshita Hegde',       email:'eshita.hegde@hssuk.org',       dateOfBirth:'2004-12-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-123', memberType:'adult',  name:'Faisal Naik',        email:'faisal.naik@hssuk.org',        dateOfBirth:'2005-06-30', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-124', memberType:'adult',  name:'Gitanjali Yadav',    email:'gitanjali.yadav@hssuk.org',    dateOfBirth:'1978-06-19', gender:'female', jobTitle:'Hindu Sahitya Kendra',   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:30 },
  { id:'WBL-125', memberType:'adult',  name:'Gajanan Rathod',     email:'gajanan.rathod@hssuk.org',     dateOfBirth:'1980-01-30', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-126', memberType:'adult',  name:'Hemmalini Samant',   email:'hemmalini.samant@hssuk.org',   dateOfBirth:'1947-11-03', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:4  },
  { id:'WBL-127', memberType:'adult',  name:'Hardev Thakkar',     email:'hardev.thakkar@hssuk.org',     dateOfBirth:'1950-02-18', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:5  },
  { id:'WBL-128', memberType:'adult',  name:'Ila Upadhyay',       email:'ila.upadhyay@hssuk.org',       dateOfBirth:'1982-12-08', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-129', memberType:'adult',  name:'Indrajit Vyas',      email:'indrajit.vyas@hssuk.org',      dateOfBirth:'1984-05-24', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:34 },
  { id:'WBL-130', memberType:'adult',  name:'Jyoti Sharma',       email:'jyoti.sharma@hssuk.org',       dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-131', memberType:'adult',  name:'Jeevan Patel',       email:'jeevan.patel@hssuk.org',       dateOfBirth:'2007-08-03', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-132', memberType:'adult',  name:'Kanchan Kumar',      email:'kanchan.kumar@hssuk.org',      dateOfBirth:'2008-10-16', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-133', memberType:'adult',  name:'Kamlesh Singh',      email:'kamlesh.singh@hssuk.org',      dateOfBirth:'1986-10-13', gender:'male',   jobTitle:'Vyavestha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-134', memberType:'adult',  name:'Laleh Nair',         email:'laleh.nair@hssuk.org',         dateOfBirth:'1995-01-15', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-135', memberType:'adult',  name:'Lokesh Iyer',        email:'lokesh.iyer@hssuk.org',        dateOfBirth:'1996-05-20', gender:'male',   jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-136', memberType:'adult',  name:'Meenakshi Joshi',    email:'meenakshi.joshi@hssuk.org',    dateOfBirth:'1988-04-02', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-137', memberType:'adult',  name:'Milind Mehta',       email:'milind.mehta@hssuk.org',       dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-138', memberType:'adult',  name:'Nirupama Gupta',     email:'nirupama.gupta@hssuk.org',     dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-139', memberType:'adult',  name:'Nilesh Verma',       email:'nilesh.verma@hssuk.org',       dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'Nidhi',                  orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-140', memberType:'youth',  name:'Ojasvini Desai',     email:'ojasvini.desai@hssuk.org',     dateOfBirth:'2010-03-15', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:7  },
  { id:'WBL-141', memberType:'youth',  name:'Parth Shah',         email:'parth.shah@hssuk.org',         dateOfBirth:'2011-07-22', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:2,  shakhaSessionsAttended:9  },
  { id:'WBL-142', memberType:'adult',  name:'Prabha Rao',         email:'prabha.rao@hssuk.org',         dateOfBirth:'1990-08-27', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:28 },
  { id:'WBL-143', memberType:'adult',  name:'Qadir Pillai',       email:'qadir.pillai@hssuk.org',       dateOfBirth:'2000-07-14', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-144', memberType:'adult',  name:'Radha Bose',         email:'radha.bose@hssuk.org',         dateOfBirth:'1952-08-25', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:4  },
  { id:'WBL-145', memberType:'adult',  name:'Rajiv Trivedi',      email:'rajiv.trivedi@hssuk.org',      dateOfBirth:'1992-03-16', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:38 },
  { id:'WBL-146', memberType:'adult',  name:'Rukmini Kapoor',     email:'rukmini.kapoor@hssuk.org',     dateOfBirth:'1966-02-14', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-147', memberType:'adult',  name:'Santosh Dixit',      email:'santosh.dixit@hssuk.org',      dateOfBirth:'2001-02-28', gender:'male',   jobTitle:'Karyalay',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-148', memberType:'adult',  name:'Shailaja Menon',     email:'shailaja.menon@hssuk.org',     dateOfBirth:'2002-09-18', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-149', memberType:'adult',  name:'Tejas Krishnan',     email:'tejas.krishnan@hssuk.org',     dateOfBirth:'2003-04-07', gender:'male',   jobTitle:'Shareerik',              orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:22 },
  { id:'WBL-150', memberType:'adult',  name:'Surekha Reddy',      email:'surekha.reddy@hssuk.org',      dateOfBirth:'1968-07-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-151', memberType:'adult',  name:'Umang Saxena',       email:'umang.saxena@hssuk.org',       dateOfBirth:'2004-12-22', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-152', memberType:'adult',  name:'Tripta Pandey',      email:'tripta.pandey@hssuk.org',      dateOfBirth:'2005-06-30', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-153', memberType:'adult',  name:'Vasudev Mishra',     email:'vasudev.mishra@hssuk.org',     dateOfBirth:'1955-05-07', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:6  },
  { id:'WBL-154', memberType:'adult',  name:'Vidya Tiwari',       email:'vidya.tiwari@hssuk.org',       dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-155', memberType:'adult',  name:'Wirendra Dubey',     email:'wirendra.dubey@hssuk.org',     dateOfBirth:'2007-08-03', gender:'male',   jobTitle:'Sankhya',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-156', memberType:'adult',  name:'Wasima Chaudhary',   email:'wasima.chaudhary@hssuk.org',   dateOfBirth:'2008-10-16', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-157', memberType:'youth',  name:'Yash Banerjee',      email:'yash.banerjee@hssuk.org',      dateOfBirth:'2012-01-10', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:8  },
  { id:'WBL-158', memberType:'adult',  name:'Yashoda Agarwal',    email:'yashoda.agarwal@hssuk.org',    dateOfBirth:'1970-04-09', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:24 },
  { id:'WBL-159', memberType:'adult',  name:'Zayd Srivastava',    email:'zayd.srivastava@hssuk.org',    dateOfBirth:'1995-01-15', gender:'male',   jobTitle:'Prachaar',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-160', memberType:'adult',  name:'Zakia Chatterjee',   email:'zakia.chatterjee@hssuk.org',   dateOfBirth:'1996-05-20', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-161', memberType:'adult',  name:'Abhishek Das',       email:'abhishek.das@hssuk.org',       dateOfBirth:'1997-08-10', gender:'male',   jobTitle:'Bauddhik',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:22 },
  { id:'WBL-162', memberType:'adult',  name:'Alpana Roy',         email:'alpana.roy@hssuk.org',         dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-163', memberType:'adult',  name:'Bina Ghosh',         email:'bina.ghosh@hssuk.org',         dateOfBirth:'1972-11-17', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:27 },
  { id:'WBL-164', memberType:'adult',  name:'Birendra Malhotra',  email:'birendra.malhotra@hssuk.org',  dateOfBirth:'1974-03-28', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:31 },
  { id:'WBL-165', memberType:'adult',  name:'Charulata Khanna',   email:'charulata.khanna@hssuk.org',   dateOfBirth:'1957-09-14', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:4  },
  { id:'WBL-166', memberType:'adult',  name:'Chhaya Arora',       email:'chhaya.arora@hssuk.org',       dateOfBirth:'1999-11-05', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:15 },
  { id:'WBL-167', memberType:'adult',  name:'Damayanti Bhatia',   email:'damayanti.bhatia@hssuk.org',   dateOfBirth:'1976-09-05', gender:'female', jobTitle:'Hindu Sahitya Kendra',   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:26 },
  { id:'WBL-168', memberType:'adult',  name:'Dinesh Sethi',       email:'dinesh.sethi@hssuk.org',       dateOfBirth:'2000-07-14', gender:'male',   jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-169', memberType:'adult',  name:'Eshwar Chopra',      email:'eshwar.chopra@hssuk.org',      dateOfBirth:'1978-06-19', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:34 },
  { id:'WBL-170', memberType:'adult',  name:'Ekta Anand',         email:'ekta.anand@hssuk.org',         dateOfBirth:'2001-02-28', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-171', memberType:'adult',  name:'Farida Goel',        email:'farida.goel@hssuk.org',        dateOfBirth:'2002-09-18', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-172', memberType:'youth',  name:'Falguni Hegde',      email:'falguni.hegde@hssuk.org',      dateOfBirth:'2013-09-05', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:6  },
  { id:'WBL-173', memberType:'adult',  name:'Gaurishankar Naik',  email:'gaurishankar.naik@hssuk.org',  dateOfBirth:'1960-01-29', gender:'male',   jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:2,  shakhaSessionsAttended:5  },
  { id:'WBL-174', memberType:'adult',  name:'Gunjan Yadav',       email:'gunjan.yadav@hssuk.org',       dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-175', memberType:'adult',  name:'Himani Rathod',      email:'himani.rathod@hssuk.org',      dateOfBirth:'2004-12-22', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-176', memberType:'adult',  name:'Harish Samant',      email:'harish.samant@hssuk.org',      dateOfBirth:'1980-01-30', gender:'male',   jobTitle:'Mukhya Shikshak',        orgRole:'Shakha Teacher', country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:10, shakhaSessionsAttended:38 },
  { id:'WBL-177', memberType:'adult',  name:'Imran Thakkar',      email:'imran.thakkar@hssuk.org',      dateOfBirth:'2005-06-30', gender:'male',   jobTitle:'SSV',                    orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:18 },
  { id:'WBL-178', memberType:'adult',  name:'Ila Sharma',         email:'ila.sharma@hssuk.org',         dateOfBirth:'2006-01-11', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-179', memberType:'adult',  name:'Jitendra Vyas',      email:'jitendra.vyas@hssuk.org',      dateOfBirth:'1982-12-08', gender:'male',   jobTitle:'Sanghchalak',            orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:30 },
  { id:'WBL-180', memberType:'adult',  name:'Jasmin Sharma',      email:'jasmin.sharma@hssuk.org',      dateOfBirth:'2007-08-03', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:12 },
  { id:'WBL-181', memberType:'adult',  name:'Krunal Patel',       email:'krunal.patel@hssuk.org',       dateOfBirth:'2008-10-16', gender:'male',   jobTitle:'Vistaar',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-182', memberType:'youth',  name:'Komal Iyer',         email:'komal.iyer@hssuk.org',         dateOfBirth:'2014-04-28', gender:'female', jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:5  },
  { id:'WBL-183', memberType:'adult',  name:'Keyur Mehta',        email:'keyur.mehta@hssuk.org',        dateOfBirth:'1995-01-15', gender:'male',   jobTitle:'Nidhi',                  orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:19 },
  { id:'WBL-184', memberType:'child',  name:'Ketki Gupta',        email:'ketki.gupta@hssuk.org',        dateOfBirth:'2018-03-25', gender:'female', jobTitle:'Shishu',                 orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'pending', firstAid:'pending', parentalConsent:'granted'}, eventsAttended:0,  shakhaSessionsAttended:2  },
  { id:'WBL-185', memberType:'adult',  name:'Lavanya Verma',      email:'lavanya.verma@hssuk.org',      dateOfBirth:'1996-05-20', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-186', memberType:'adult',  name:'Laxmi Desai',        email:'laxmi.desai@hssuk.org',        dateOfBirth:'1984-05-24', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-187', memberType:'adult',  name:'Minal Shah',         email:'minal.shah@hssuk.org',         dateOfBirth:'1997-08-10', gender:'female', jobTitle:'Tarun(i)',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:17 },
  { id:'WBL-188', memberType:'adult',  name:'Mahesh Rao',         email:'mahesh.rao@hssuk.org',         dateOfBirth:'1986-10-13', gender:'male',   jobTitle:'Ghatnayak',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:9,  shakhaSessionsAttended:34 },
  { id:'WBL-189', memberType:'adult',  name:'Neepa Pillai',       email:'neepa.pillai@hssuk.org',       dateOfBirth:'1998-03-25', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-08-25T10:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-190', memberType:'adult',  name:'Neeraj Bose',        email:'neeraj.bose@hssuk.org',        dateOfBirth:'1999-11-05', gender:'male',   jobTitle:'Shareerik',              orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2022-02-14T09:30:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:20 },
  { id:'WBL-191', memberType:'adult',  name:'Padmini Trivedi',    email:'padmini.trivedi@hssuk.org',    dateOfBirth:'1963-12-20', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2025-01-15T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:3  },
  { id:'WBL-192', memberType:'adult',  name:'Omvati Kapoor',      email:'omvati.kapoor@hssuk.org',      dateOfBirth:'1945-08-10', gender:'female', jobTitle:'Jyestha(a)',             orgRole:'Senior Member',  country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:1,  shakhaSessionsAttended:3  },
  { id:'WBL-193', memberType:'adult',  name:'Paresh Dixit',       email:'paresh.dixit@hssuk.org',       dateOfBirth:'2000-07-14', gender:'male',   jobTitle:'Karyalay',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-03-10T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:5,  shakhaSessionsAttended:18 },
  { id:'WBL-194', memberType:'adult',  name:'Parvati Menon',      email:'parvati.menon@hssuk.org',      dateOfBirth:'1988-04-02', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:6,  shakhaSessionsAttended:23 },
  { id:'WBL-195', memberType:'adult',  name:'Rohan Sharma',       email:'rohan.sharma@hssuk.org',       dateOfBirth:'2001-02-28', gender:'male',   jobTitle:'Sampark',                orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'pending', firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-196', memberType:'adult',  name:'Preethi Reddy',      email:'preethi.reddy@hssuk.org',      dateOfBirth:'2002-09-18', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-01-05T09:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:3,  shakhaSessionsAttended:13 },
  { id:'WBL-197', memberType:'adult',  name:'Ketan Patel',        email:'ketan.patel@hssuk.org',        dateOfBirth:'1974-03-28', gender:'male',   jobTitle:'Karyawaha',              orgRole:'Volunteer',      country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-01-20T10:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:8,  shakhaSessionsAttended:30 },
  { id:'WBL-198', memberType:'adult',  name:'Shweta Gupta',       email:'shweta.gupta@hssuk.org',       dateOfBirth:'2003-04-07', gender:'female', jobTitle:'Shikshak',               orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2023-09-18T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:4,  shakhaSessionsAttended:16 },
  { id:'WBL-199', memberType:'youth',  name:'Akshay Mehta',       email:'akshay.mehta@hssuk.org',       dateOfBirth:'2010-03-15', gender:'male',   jobTitle:'Kishor(i)',              orgRole:'Youth Member',   country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2024-07-22T10:00:00Z', compliance:{dbs:'completed',firstAid:'pending', parentalConsent:'granted'}, eventsAttended:1,  shakhaSessionsAttended:7  },
  { id:'WBL-200', memberType:'adult',  name:'Leela Joshi',        email:'leela.joshi@hssuk.org',        dateOfBirth:'1990-08-27', gender:'female', jobTitle:'Sewa',                   orgRole:'Member',         country:'HSS UK', region:'London & South East', town:'Wembley', activityCentre:'Wembley Activity Centre', status:'active', registrationDate:'2021-07-08T11:00:00Z', compliance:{dbs:'completed',firstAid:'completed',parentalConsent:'n/a'}, eventsAttended:7,  shakhaSessionsAttended:25 },
];

export const mockMembers: Member[] = rawMockMembers.map(withRegistrationFields);

// ── Filter Options (used by AdvancedSearchPanel) ──────────────

export const MEMBER_FILTER_OPTIONS: Record<string, string[]> = {
  'Status':            ['Active', 'Pending Approval', 'Pending Parental Consent', 'Inactive', 'Rejected'],
  'Age Groups (years old)': Object.values(AGE_GROUP_LABELS),
  'Gender':            ['Male', 'Female'],
  'Responsibility':    [...ROLE_TYPE_OPTIONS],
  'Country':           MASTERS_CASCADE.countries,
  'Vibhaag':           Object.keys(MASTERS_CASCADE.towns),
  'Nagar':             Object.values(MASTERS_CASCADE.towns).flat(),
  'Shakha':            Object.values(MASTERS_CASCADE.centres).flat(),
  'DBS Status':        ['Pending', 'Completed'],
  'First Aid Status':  ['Pending', 'Completed'],
};
