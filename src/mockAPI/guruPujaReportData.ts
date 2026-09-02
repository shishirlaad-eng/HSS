// ─────────────────────────────────────────────────────────────
// HSS UK — Guru Puja Report
// Reconciliation report for completed/active Guru Purnima utsav Shakhas —
// Cash + Cheque income per age category, banking details, and a completion
// flag distinct from the (separate) Guru Purnima Cash Income feature.
// ─────────────────────────────────────────────────────────────
import { AgeGroup } from './membersData';

export interface GuruPujaAmount {
  cash: number;
  cheque: number;
}

export interface GuruPujaReportEntry {
  id: string;
  sessionId: string;
  amounts: Record<AgeGroup, GuruPujaAmount>;
  dateBanked?: string;
  bankedBy?: string;
  payingInRefNo?: string;
  isComplete: boolean;
  recordedAt: string;
}

export const mockGuruPujaReportEntries: GuruPujaReportEntry[] = [
  {
    id: 'GPR-001',
    sessionId: 'SES-053',
    amounts: {
      bal:     { cash: 8.00,  cheque: 0 },
      shishu:  { cash: 12.50, cheque: 0 },
      kishor:  { cash: 15.00, cheque: 10.00 },
      tarun:   { cash: 22.00, cheque: 25.00 },
      yuva:    { cash: 18.75, cheque: 20.00 },
      jyestha: { cash: 9.25,  cheque: 15.00 },
    },
    dateBanked: '2026-07-22',
    bankedBy: 'Vikram Singh',
    payingInRefNo: 'PIR-2026-0719',
    isComplete: true,
    recordedAt: '2026-07-22T11:00:00Z',
  },
];

export function getGuruPujaReportEntry(sessionId: string): GuruPujaReportEntry | undefined {
  return mockGuruPujaReportEntries.find(e => e.sessionId === sessionId);
}

let nextSeq = mockGuruPujaReportEntries.length + 1;

export function saveGuruPujaReportEntry(
  data: Omit<GuruPujaReportEntry, 'id' | 'recordedAt'> & { id?: string },
): GuruPujaReportEntry {
  const existing = getGuruPujaReportEntry(data.sessionId);
  const entry: GuruPujaReportEntry = {
    ...data,
    id: existing?.id ?? data.id ?? `GPR-${String(nextSeq++).padStart(3, '0')}`,
    recordedAt: new Date().toISOString(),
  };
  if (existing) {
    const idx = mockGuruPujaReportEntries.findIndex(e => e.sessionId === data.sessionId);
    mockGuruPujaReportEntries[idx] = entry;
  } else {
    mockGuruPujaReportEntries.unshift(entry);
  }
  return entry;
}
