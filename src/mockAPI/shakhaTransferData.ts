export type TransferStatus = 'pending' | 'approved' | 'rejected';

export interface ShakhaTransferRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  fromCountry: string;
  fromRegion: string;
  fromTown: string;
  fromCentre: string;
  toCountry: string;
  toRegion: string;
  toTown: string;
  toCentre: string;
  status: TransferStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const REQUESTS_KEY = 'hssShakhaTransferRequests';
const OVERRIDES_KEY = 'hssMemberCentreOverrides';
export const TRANSFER_CHANGE_EVENT = 'hss-shakha-transfer-change';

export interface MemberCentreOverride {
  country: string;
  region: string;
  town: string;
  activityCentre: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(TRANSFER_CHANGE_EVENT));
}

export function getTransferRequests(): ShakhaTransferRequest[] {
  return readJson<ShakhaTransferRequest[]>(REQUESTS_KEY, []);
}

export function getPendingTransferForMember(memberId: string) {
  return getTransferRequests().find(request => request.memberId === memberId && request.status === 'pending');
}

export function createTransferRequest(
  request: Omit<ShakhaTransferRequest, 'id' | 'status' | 'requestedAt'>,
) {
  const requests = getTransferRequests();
  if (requests.some(item => item.memberId === request.memberId && item.status === 'pending')) {
    throw new Error('A Shakha transfer request is already pending.');
  }
  const next: ShakhaTransferRequest = {
    ...request,
    id: `TRF-${Date.now()}`,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  writeJson(REQUESTS_KEY, [next, ...requests]);
  return next;
}

export function reviewTransferRequest(
  requestId: string,
  status: Exclude<TransferStatus, 'pending'>,
  reviewedBy: string,
  rejectionReason = '',
) {
  const requests = getTransferRequests();
  const request = requests.find(item => item.id === requestId);
  if (!request) return;

  const updated = requests.map(item => item.id === requestId ? {
    ...item,
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
  } : item);
  writeJson(REQUESTS_KEY, updated);

  if (status === 'approved') {
    const overrides = getMemberCentreOverrides();
    overrides[request.memberId] = {
      country: request.toCountry,
      region: request.toRegion,
      town: request.toTown,
      activityCentre: request.toCentre,
    };
    writeJson(OVERRIDES_KEY, overrides);
  }
}

export function getMemberCentreOverrides(): Record<string, MemberCentreOverride> {
  return readJson<Record<string, MemberCentreOverride>>(OVERRIDES_KEY, {});
}

export function applyMemberCentreOverrides<T extends {
  id?: string;
  country?: string;
  region?: string;
  town?: string;
  activityCentre?: string;
  status?: string;
}>(items: T[]): T[] {
  const overrides = getMemberCentreOverrides();
  const pendingMemberIds = new Set(
    getTransferRequests()
      .filter(request => request.status === 'pending')
      .map(request => request.memberId),
  );

  return items.map(item => {
    const approvedItem = item.id && overrides[item.id] ? { ...item, ...overrides[item.id] } : item;
    if (item.id && pendingMemberIds.has(item.id) && 'status' in item) {
      return { ...approvedItem, status: 'pending' } as T;
    }
    return approvedItem;
  });
}
