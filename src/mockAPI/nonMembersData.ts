// ─────────────────────────────────────────────────────────────
// HSS UK — Non-Member Accounts
// Guardian-only accounts created via the public "Create Non-Member Account"
// flow (MemberRegistration.tsx with onAccountCreated set) — a parent/guardian
// who hasn't registered themselves as a member, but can register their
// children for membership. Distinct from the Member records in
// membersData.ts, which come from "Create Member Account".
// ─────────────────────────────────────────────────────────────

export interface NonMemberChildAccount {
  id: string;
  firstName: string;
  lastName: string;
}

export interface NonMemberAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registeredAt: string; // ISO datetime
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
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    children: [
      { id: 'NMC-001', firstName: 'Oliver', lastName: 'Clarke' },
    ],
  },
  {
    id: 'NMB-002',
    firstName: 'George',
    lastName: 'Wallace',
    email: 'george.wallace@example.com',
    registeredAt: '2026-05-18T09:30:00Z',
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
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    children: [
      { id: 'NMC-002', firstName: 'Ama', lastName: 'Osei' },
      { id: 'NMC-003', firstName: 'Kofi', lastName: 'Osei' },
    ],
  },
];
