export type DonationStatus = 'received' | 'pledged' | 'failed' | 'refunded';
export type DonationChannel = 'online' | 'bank-transfer' | 'cash' | 'cheque';
export type IncomeStream = 'online-donation' | 'cash-income' | 'standing-order';

export interface DonationRecord {
  id: string;
  date: string;
  amount: number;
  status: DonationStatus;
  channel: DonationChannel;
  country: string;
  region: string;
  town: string;
  activityCentre: string;
  donorType: 'member' | 'family' | 'organisation' | 'anonymous';
  giftAid: boolean;   // UK taxpayer Gift Aid declaration — adds 25% claimable on top
  incomeStream: IncomeStream;
}

export interface MemberDonationRecord {
  id: string;
  memberId: string;
  datetime: string;
  amount: number;
  activityCentre: string;
}

// Recorded Shakha is immutable transaction history across member transfers.
export const mockMemberDonations: MemberDonationRecord[] = [
  { id: 'MDON-001', memberId: 'WBL-001', datetime: '2026-05-28T14:32:00', amount: 25,  activityCentre: 'Wembley Activity Centre' },
  { id: 'MDON-002', memberId: 'WBL-001', datetime: '2026-04-15T09:15:00', amount: 50,  activityCentre: 'Wembley Activity Centre' },
  { id: 'MDON-003', memberId: 'WBL-001', datetime: '2026-03-22T18:47:00', amount: 10,  activityCentre: 'Harrow Activity Centre' },
  { id: 'MDON-004', memberId: 'WBL-001', datetime: '2026-02-10T11:05:00', amount: 100, activityCentre: 'Harrow Activity Centre' },
  { id: 'MDON-005', memberId: 'WBL-001', datetime: '2026-01-05T16:20:00', amount: 25,  activityCentre: 'Harrow Activity Centre' },
  { id: 'MDON-006', memberId: 'WBL-004', datetime: '2026-05-09T12:15:00', amount: 15,  activityCentre: 'Wembley Activity Centre' },
];

export const mockDonations: DonationRecord[] = [
  {
    id: 'DON-001',
    giftAid: true,
    date: '2026-01-12T10:30:00Z',
    amount: 250,
    status: 'received',
    channel: 'online',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    activityCentre: 'Wembley Activity Centre',
    donorType: 'member',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-002',
    giftAid: true,
    date: '2026-01-20T14:00:00Z',
    amount: 500,
    status: 'received',
    channel: 'bank-transfer',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    activityCentre: 'Birmingham East Activity Centre',
    donorType: 'family',
    incomeStream: 'standing-order',
  },
  {
    id: 'DON-003',
    giftAid: true,
    date: '2026-02-05T09:45:00Z',
    amount: 100,
    status: 'pledged',
    channel: 'online',
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    activityCentre: 'Manchester Central Activity Centre',
    donorType: 'member',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-004',
    giftAid: false,
    date: '2026-02-18T12:20:00Z',
    amount: 1000,
    status: 'received',
    channel: 'bank-transfer',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    activityCentre: 'Harrow Activity Centre',
    donorType: 'organisation',
    incomeStream: 'standing-order',
  },
  {
    id: 'DON-005',
    giftAid: false,
    date: '2026-03-03T16:15:00Z',
    amount: 75,
    status: 'received',
    channel: 'cash',
    country: 'HSS UK',
    region: 'Scotland',
    town: 'Edinburgh',
    activityCentre: 'Edinburgh Activity Centre',
    donorType: 'anonymous',
    incomeStream: 'cash-income',
  },
  {
    id: 'DON-006',
    giftAid: true,
    date: '2026-03-21T11:00:00Z',
    amount: 300,
    status: 'received',
    channel: 'online',
    country: 'HSS Ireland',
    region: 'Dublin',
    town: 'Dublin City',
    activityCentre: 'Dublin Activity Centre',
    donorType: 'family',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-007',
    giftAid: true,
    date: '2026-04-04T10:10:00Z',
    amount: 50,
    status: 'failed',
    channel: 'online',
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    activityCentre: 'Leeds North Activity Centre',
    donorType: 'member',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-008',
    giftAid: false,
    date: '2026-04-15T18:30:00Z',
    amount: 750,
    status: 'received',
    channel: 'cheque',
    country: 'HSS UK',
    region: 'Wales',
    town: 'Cardiff',
    activityCentre: 'Cardiff Activity Centre',
    donorType: 'organisation',
    incomeStream: 'standing-order',
  },
  {
    id: 'DON-009',
    giftAid: true,
    date: '2026-05-02T08:50:00Z',
    amount: 125,
    status: 'received',
    channel: 'online',
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Leicester',
    activityCentre: 'Leicester Activity Centre',
    donorType: 'member',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-010',
    giftAid: true,
    date: '2026-05-11T13:25:00Z',
    amount: 200,
    status: 'refunded',
    channel: 'bank-transfer',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Southall',
    activityCentre: 'Southall Activity Centre',
    donorType: 'family',
    incomeStream: 'standing-order',
  },
  {
    id: 'DON-011',
    giftAid: false,
    date: '2026-05-22T17:10:00Z',
    amount: 400,
    status: 'received',
    channel: 'online',
    country: 'HSS United States',
    region: 'East Coast',
    town: 'New York',
    activityCentre: 'New York Activity Centre',
    donorType: 'anonymous',
    incomeStream: 'online-donation',
  },
  {
    id: 'DON-012',
    giftAid: false,
    date: '2026-06-03T09:00:00Z',
    amount: 650,
    status: 'pledged',
    channel: 'bank-transfer',
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Ilford',
    activityCentre: 'Ilford Activity Centre',
    donorType: 'organisation',
    incomeStream: 'standing-order',
  },
];
