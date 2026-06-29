// ─────────────────────────────────────────────────────────────
// HSS UK MMS — First Aid Incident Mock Data
// ─────────────────────────────────────────────────────────────

export type IncidentType =
  | 'Minor Injury'
  | 'Major Injury'
  | 'Illness'
  | 'Allergic Reaction'
  | 'Other';

export type IncidentOutcome =
  | 'Returned to Activity'
  | 'Sent Home'
  | 'Taken to Hospital'
  | 'Ambulance Called';

export const INCIDENT_TYPES: IncidentType[] = [
  'Minor Injury',
  'Major Injury',
  'Illness',
  'Allergic Reaction',
  'Other',
];

export const INCIDENT_OUTCOMES: IncidentOutcome[] = [
  'Returned to Activity',
  'Sent Home',
  'Taken to Hospital',
  'Ambulance Called',
];

export interface FirstAidIncident {
  id: string;
  // Scope fields (for filterByScope compatibility)
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  // Core fields
  dateTime: string;                    // ISO datetime
  sessionId?: string;                  // optional link to ShakhaSession.id
  sessionPersonInCharge?: string;      // person in charge of the session
  incidentSite?: string;               // specific location within venue e.g. "sports hall"
  isShakhaMember: boolean;
  memberId?: string;                   // if isShakhaMember
  casualtyName: string;                // display name
  casualtyAddress?: string;            // address of injured person
  incidentType: IncidentType;
  incidentDescription: string;
  activityAtTimeOfIncident?: string;   // what activity was taking place e.g. training/game
  firstAidGiven: string;
  firstAiderName: string;
  outcome: IncidentOutcome;
  contactedParents?: boolean;
  contactedPolice?: boolean;
  contactedAmbulance?: boolean;
  reportedBy: string;
  witnesses?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  declarationName?: string;            // name of person signing the declaration
  declarationRole?: string;            // responsibility in Shakha
  declarationDate?: string;            // ISO date of signing
  createdAt: string;                   // ISO datetime
  updatedAt: string;                   // ISO datetime
}

export const mockIncidents: FirstAidIncident[] = [
  {
    id: 'FAI-001',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    dateTime: '2026-03-12T10:30:00',
    sessionId: 'SES-040',
    sessionPersonInCharge: 'Ramesh Sharma',
    incidentSite: 'Outdoor drill area',
    isShakhaMember: true,
    memberId: 'WBL-003',
    casualtyName: 'Arjun Patel',
    casualtyAddress: '14 Park Avenue, Wembley, HA9 8LE',
    incidentType: 'Minor Injury',
    incidentDescription: 'Member twisted ankle during outdoor activity drill. No swelling observed initially.',
    activityAtTimeOfIncident: 'Outdoor physical drill',
    firstAidGiven: 'RICE protocol applied — rest, ice pack for 10 minutes, compression bandage, limb elevated.',
    firstAiderName: 'Ramesh Sharma',
    outcome: 'Sent Home',
    contactedParents: true,
    contactedPolice: false,
    contactedAmbulance: false,
    reportedBy: 'Ramesh Sharma',
    witnesses: 'Sunil Kumar, Priya Mehta',
    followUpRequired: true,
    followUpNotes: 'Parent contacted. Advised to visit GP if pain persists beyond 48 hours.',
    declarationName: 'Ramesh Sharma',
    declarationRole: 'Mukhya Shikshak',
    declarationDate: '2026-03-12',
    createdAt: '2026-03-12T11:00:00',
    updatedAt: '2026-03-12T11:00:00',
  },
  {
    id: 'FAI-002',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    dateTime: '2026-04-05T14:15:00',
    sessionPersonInCharge: 'Anita Desai',
    incidentSite: 'Main hall',
    isShakhaMember: false,
    casualtyName: 'Visitor (Parent)',
    casualtyAddress: 'Unknown — visitor',
    incidentType: 'Illness',
    incidentDescription: 'Parent visitor felt faint and dizzy during Karyakram. No loss of consciousness.',
    activityAtTimeOfIncident: 'Karyakram (cultural programme)',
    firstAidGiven: 'Seated in cool area, given water, monitored for 20 minutes. Recovery observed.',
    firstAiderName: 'Anita Desai',
    outcome: 'Returned to Activity',
    contactedParents: false,
    contactedPolice: false,
    contactedAmbulance: false,
    reportedBy: 'Anita Desai',
    followUpRequired: false,
    declarationName: 'Anita Desai',
    declarationRole: 'Karyavah',
    declarationDate: '2026-04-05',
    createdAt: '2026-04-05T14:45:00',
    updatedAt: '2026-04-05T14:45:00',
  },
  {
    id: 'FAI-003',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    dateTime: '2026-05-18T09:00:00',
    sessionId: 'SES-042',
    sessionPersonInCharge: 'Ramesh Sharma',
    incidentSite: 'Changing area',
    isShakhaMember: true,
    memberId: 'WBL-007',
    casualtyName: 'Rohit Nair',
    casualtyAddress: '7 Elm Close, Wembley, HA0 2TQ',
    incidentType: 'Allergic Reaction',
    incidentDescription: 'Member developed hives on forearms shortly after arrival. Suspected contact allergy.',
    activityAtTimeOfIncident: 'Getting changed before session',
    firstAidGiven: 'Area washed with water. Antihistamine (member\'s own, parent-authorised) administered. Monitored for 30 minutes.',
    firstAiderName: 'Ramesh Sharma',
    outcome: 'Sent Home',
    contactedParents: true,
    contactedPolice: false,
    contactedAmbulance: false,
    reportedBy: 'Ramesh Sharma',
    witnesses: 'Kavya Reddy',
    followUpRequired: true,
    followUpNotes: 'Parents informed. Advised allergy review with GP before next session.',
    declarationName: 'Ramesh Sharma',
    declarationRole: 'Mukhya Shikshak',
    declarationDate: '2026-05-18',
    createdAt: '2026-05-18T09:45:00',
    updatedAt: '2026-05-18T09:45:00',
  },
];
