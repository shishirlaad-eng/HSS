import { MASTERS_CASCADE } from './membersData';

export interface OtherDakshinaRecord {
  id: string;
  shakhaId: string;
  reference: string;
  shakha: string; // Activity Centre name
  date: string;   // YYYY-MM-DD
  amount: number;
  country: string;
  region: string;
  town: string;
  uploadedAt: string;
}

export const INITIAL_MOCK_OTHER_DAKSHINA: OtherDakshinaRecord[] = [
  {
    id: 'OD-001',
    shakhaId: 'SHK-WBL',
    reference: 'REF-2026-0501',
    shakha: 'Wembley Activity Centre',
    date: '2026-05-18',
    amount: 150.00,
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Wembley',
    uploadedAt: '2026-05-19T10:30:00Z',
  },
  {
    id: 'OD-002',
    shakhaId: 'SHK-HRW',
    reference: 'REF-2026-0502',
    shakha: 'Harrow Activity Centre',
    date: '2026-05-24',
    amount: 220.00,
    country: 'HSS UK',
    region: 'London & South East',
    town: 'Harrow',
    uploadedAt: '2026-05-25T11:15:00Z',
  },
  {
    id: 'OD-003',
    shakhaId: 'SHK-BME',
    reference: 'REF-2026-0601',
    shakha: 'Birmingham East Activity Centre',
    date: '2026-06-08',
    amount: 95.00,
    country: 'HSS UK',
    region: 'Midlands',
    town: 'Birmingham',
    uploadedAt: '2026-06-09T09:40:00Z',
  },
  {
    id: 'OD-004',
    shakhaId: 'SHK-MNC',
    reference: 'REF-2026-0602',
    shakha: 'Manchester Central Activity Centre',
    date: '2026-06-15',
    amount: 180.00,
    country: 'HSS UK',
    region: 'North West',
    town: 'Manchester',
    uploadedAt: '2026-06-16T14:20:00Z',
  },
  {
    id: 'OD-005',
    shakhaId: 'SHK-LDS',
    reference: 'REF-2026-0701',
    shakha: 'Leeds North Activity Centre',
    date: '2026-07-04',
    amount: 135.50,
    country: 'HSS UK',
    region: 'Yorkshire & Humber',
    town: 'Leeds',
    uploadedAt: '2026-07-05T12:00:00Z',
  },
];

const STORAGE_KEY = 'hss_other_dakshina_records';

/**
 * Resolves country, region (Vibhag), and town (Nagar) for a given Shakha / activityCentre name.
 */
export function resolveLocationForShakha(shakhaName: string): { country: string; region: string; town: string } {
  const norm = shakhaName.trim().toLowerCase();
  for (const [town, centres] of Object.entries(MASTERS_CASCADE.centres)) {
    if (centres.some(c => c.toLowerCase() === norm || c.toLowerCase().includes(norm) || norm.includes(c.toLowerCase()))) {
      for (const [region, towns] of Object.entries(MASTERS_CASCADE.towns)) {
        if (towns.includes(town)) {
          return { country: 'HSS UK', region, town };
        }
      }
      return { country: 'HSS UK', region: '', town };
    }
  }
  return { country: 'HSS UK', region: '', town: '' };
}

/**
 * Load all Other Dakshina records from persistent storage (fallback to initial mock data).
 */
export function getOtherDakshinaRecords(): OtherDakshinaRecord[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_OTHER_DAKSHINA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_OTHER_DAKSHINA));
      return INITIAL_MOCK_OTHER_DAKSHINA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_OTHER_DAKSHINA;
  } catch (err) {
    console.error('Error reading other dakshina records from localStorage:', err);
    return INITIAL_MOCK_OTHER_DAKSHINA;
  }
}

/**
 * Save Other Dakshina records to localStorage and dispatch custom event for instant sync across tabs/components.
 */
export function saveOtherDakshinaRecords(records: OtherDakshinaRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('hss_other_dakshina_updated', { detail: records }));
  } catch (err) {
    console.error('Error saving other dakshina records to localStorage:', err);
  }
}

/**
 * Append newly imported records to the existing store.
 */
export function addOtherDakshinaRecords(newRecords: OtherDakshinaRecord[]): OtherDakshinaRecord[] {
  const current = getOtherDakshinaRecords();
  const updated = [...newRecords, ...current];
  saveOtherDakshinaRecords(updated);
  return updated;
}
