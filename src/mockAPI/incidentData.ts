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
  dateTime: string;            // ISO datetime
  sessionId?: string;          // optional link to ShakhaSession.id
  isShakhaMember: boolean;
  memberId?: string;           // if isShakhaMember
  casualtyName: string;        // display name
  incidentType: IncidentType;
  incidentDescription: string;
  firstAidGiven: string;
  firstAiderName: string;
  outcome: IncidentOutcome;
  reportedBy: string;
  witnesses?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime
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
    isShakhaMember: true,
    memberId: 'WBL-003',
    casualtyName: 'Arjun Patel',
    incidentType: 'Minor Injury',
    incidentDescription: 'Member twisted ankle during outdoor activity drill. No swelling observed initially.',
    firstAidGiven: 'RICE protocol applied — rest, ice pack for 10 minutes, compression bandage, limb elevated.',
    firstAiderName: 'Ramesh Sharma',
    outcome: 'Sent Home',
    reportedBy: 'Ramesh Sharma',
    witnesses: 'Sunil Kumar, Priya Mehta',
    followUpRequired: true,
    followUpNotes: 'Parent contacted. Advised to visit GP if pain persists beyond 48 hours.',
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
    isShakhaMember: false,
    casualtyName: 'Visitor (Parent)',
    incidentType: 'Illness',
    incidentDescription: 'Parent visitor felt faint and dizzy during Karyakram. No loss of consciousness.',
    firstAidGiven: 'Seated in cool area, given water, monitored for 20 minutes. Recovery observed.',
    firstAiderName: 'Anita Desai',
    outcome: 'Returned to Activity',
    reportedBy: 'Anita Desai',
    followUpRequired: false,
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
    isShakhaMember: true,
    memberId: 'WBL-007',
    casualtyName: 'Rohit Nair',
    incidentType: 'Allergic Reaction',
    incidentDescription: 'Member developed hives on forearms shortly after arrival. Suspected contact allergy.',
    firstAidGiven: 'Area washed with water. Antihistamine (member\'s own, parent-authorised) administered. Monitored for 30 minutes.',
    firstAiderName: 'Ramesh Sharma',
    outcome: 'Sent Home',
    reportedBy: 'Ramesh Sharma',
    witnesses: 'Kavya Reddy',
    followUpRequired: true,
    followUpNotes: 'Parents informed. Advised allergy review with GP before next session.',
    createdAt: '2026-05-18T09:45:00',
    updatedAt: '2026-05-18T09:45:00',
  },
];
