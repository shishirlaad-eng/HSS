// ─────────────────────────────────────────────────────────────
// HSS UK — Non-Member Accounts
// Records that land here:
//  - "Non-Member": chose the "Create Non-Member Account" flow — a
//    parent/guardian who isn't a member themselves, but can register
//    children for membership.
//  - "Adult Member" & "Child Member": member registration started
//    but still in Draft status (never submitted/approved). Until
//    registration is completed and approved, they're not a full HSS
//    member, so they land here with Draft status rather than All Members.
// Distinct from the Member records in membersData.ts either way.
// ─────────────────────────────────────────────────────────────

export type NonMemberAccountType = 'Child Member' | 'Adult Member' | 'Non-Member';
export type NonMemberAccountStatus = 'draft' | 'active' | 'inactive';

export interface NonMemberChildAccount {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string; // ISO datetime — when this child profile was added
}

export interface NonMemberAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registeredAt: string; // ISO datetime
  accountType: NonMemberAccountType;
  status: NonMemberAccountStatus;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  children: NonMemberChildAccount[];
}

export const mockNonMemberAccounts: NonMemberAccount[] = [
  {
    id: 'NMB-001',
    firstName: 'Fiona',
    lastName: 'Clarke',
    email: 'fiona.clarke@example.com',
    registeredAt: '2026-04-02T10:15:00Z',
    accountType: 'Non-Member',
    status: 'active',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    children: [
      { id: 'NMC-001', firstName: 'Oliver', lastName: 'Clarke', createdAt: '2026-04-03T11:00:00Z' },
    ],
  },
  {
    id: 'NMB-002',
    firstName: 'George',
    lastName: 'Wallace',
    email: 'george.wallace@example.com',
    registeredAt: '2026-05-18T09:30:00Z',
    accountType: 'Non-Member',
    status: 'active',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    children: [],
  },
  {
    id: 'NMB-003',
    firstName: 'Helen',
    lastName: 'Osei',
    email: 'helen.osei@example.com',
    registeredAt: '2026-06-01T14:00:00Z',
    accountType: 'Non-Member',
    status: 'inactive',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    children: [
      { id: 'NMC-002', firstName: 'Ama', lastName: 'Osei', createdAt: '2026-06-02T09:15:00Z' },
      { id: 'NMC-003', firstName: 'Kofi', lastName: 'Osei', createdAt: '2026-06-15T16:40:00Z' },
    ],
  },
  // ── "Adult Member" route (registration in Draft status) ───────────────
  {
    id: 'NMB-004',
    firstName: 'James',
    lastName: 'Whitfield',
    email: 'james.whitfield@example.com',
    registeredAt: '2026-07-09T08:20:00Z',
    accountType: 'Adult Member',
    status: 'draft',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    children: [],
  },
  {
    id: 'NMB-005',
    firstName: 'Meera',
    lastName: 'Chandra',
    email: 'meera.chandra@example.com',
    registeredAt: '2026-03-14T17:05:00Z',
    accountType: 'Adult Member',
    status: 'draft',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    children: [],
  },
  // ── "Child Member" route (registration in Draft status) ───────────────
  {
    id: 'NMB-006',
    firstName: 'Aarav',
    lastName: 'Patel',
    email: 'aarav.patel@example.com',
    registeredAt: '2026-08-20T11:45:00Z',
    accountType: 'Child Member',
    status: 'draft',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Brent',
    activityCentre: 'Kingsbury Activity Centre',
    children: [],
  },
  {
    id: 'NMB-007',
    firstName: 'Diya',
    lastName: 'Shah',
    email: 'diya.shah@example.com',
    registeredAt: '2026-09-05T14:10:00Z',
    accountType: 'Child Member',
    status: 'draft',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Leicester',
    activityCentre: 'Leicester Central Activity Centre',
    children: [],
  },
];
