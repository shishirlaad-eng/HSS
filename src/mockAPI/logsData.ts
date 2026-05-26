/**
 * MOCK LOG DATA
 */

export interface LoginLog {
  id: string;
  userName: string;
  email: string;
  role: string;
  loginTime: string;
  logoutTime: string | null;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  status: 'Success' | 'Failed';
  failureReason?: string;
  location: string;
  sessionDuration?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  module: string;
  actionType: 'Create' | 'Update' | 'Delete' | 'Status Change' | 'Import' | 'Export' | 'Login' | 'Permission Update';
  recordName: string;
  recordId: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  details: {
    before?: any;
    after?: any;
    changedFields?: string[];
  };
}

export interface APILog {
  id: string;
  apiName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  requestTime: string;
  responseTime: string; // duration in ms
  user: string;
  requestPayload: string;
  responsePayload: string;
  headers: Record<string, string>;
}

export interface EmailLog {
  id: string;
  recipientName: string;
  recipientEmail: string;
  templateName: string;
  subject: string;
  sentAt: string;
  status: 'Delivered' | 'Failed' | 'Sent' | 'Bounced';
  triggeredBy: string;
  failureReason?: string;
  contentPreview: string;
}

export const mockLoginLogs: LoginLog[] = [
  {
    id: 'LOG-101',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Super Admin',
    loginTime: '2026-05-18T10:00:00Z',
    logoutTime: '2026-05-18T12:30:00Z',
    ipAddress: '192.168.1.1',
    device: 'MacBook Pro',
    browser: 'Chrome 124.0',
    os: 'macOS 14.4',
    status: 'Success',
    location: 'Mumbai, India',
    sessionDuration: '2h 30m'
  },
  {
    id: 'LOG-102',
    userName: 'Sarah Smith',
    email: 'sarah.s@example.com',
    role: 'Editor',
    loginTime: '2026-05-17T09:15:00Z',
    logoutTime: null,
    ipAddress: '192.168.1.45',
    device: 'Windows PC',
    browser: 'Firefox 125.0',
    os: 'Windows 11',
    status: 'Success',
    location: 'London, UK'
  },
  {
    id: 'LOG-103',
    userName: 'Unknown',
    email: 'hacker@malicious.com',
    role: 'None',
    loginTime: '2026-05-15T08:45:00Z',
    logoutTime: null,
    ipAddress: '45.12.33.102',
    device: 'Linux PC',
    browser: 'Safari 17.0',
    os: 'Ubuntu 22.04',
    status: 'Failed',
    failureReason: 'Invalid Password',
    location: 'Unknown'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-501',
    user: 'John Doe',
    module: 'User Management',
    actionType: 'Update',
    recordName: 'Sarah Smith',
    recordId: 'USR-002',
    description: 'Updated user role from Viewer to Editor',
    timestamp: '2026-05-18T11:20:00Z',
    ipAddress: '192.168.1.1',
    details: {
      before: { role: 'Viewer' },
      after: { role: 'Editor' },
      changedFields: ['role']
    }
  },
  {
    id: 'AUD-502',
    user: 'System',
    module: 'Email Templates',
    actionType: 'Status Change',
    recordName: 'Welcome Email',
    recordId: 'TMP-10',
    description: 'Deactivated template due to outdated branding',
    timestamp: '2026-05-16T10:05:00Z',
    ipAddress: '127.0.0.1',
    details: {
      before: { status: 'active' },
      after: { status: 'inactive' },
      changedFields: ['status']
    }
  }
];

export const mockAPILogs: APILog[] = [
  {
    id: 'API-901',
    apiName: 'Get User List',
    endpoint: '/api/v1/users',
    method: 'GET',
    status: 200,
    requestTime: '2026-05-18T12:00:00Z',
    responseTime: '124',
    user: 'John Doe',
    requestPayload: '{}',
    responsePayload: '{"data": [...], "total": 1284}',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' }
  },
  {
    id: 'API-902',
    apiName: 'Update Role',
    endpoint: '/api/v1/roles/2',
    method: 'PUT',
    status: 403,
    requestTime: '2026-05-16T11:45:00Z',
    responseTime: '45',
    user: 'Sarah Smith',
    requestPayload: '{"name": "Senior Editor"}',
    responsePayload: '{"error": "Forbidden", "message": "Insufficient permissions"}',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' }
  }
];

export const mockEmailLogs: EmailLog[] = [
  {
    id: 'EML-201',
    recipientName: 'Alice Cooper',
    recipientEmail: 'alice@gmail.com',
    templateName: 'Password Reset',
    subject: 'Reset your password',
    sentAt: '2026-05-18T12:10:00Z',
    status: 'Delivered',
    triggeredBy: 'Self (Forgot Password)',
    contentPreview: 'Hello Alice, you requested a password reset...'
  },
  {
    id: 'EML-202',
    recipientName: 'Bob Builder',
    recipientEmail: 'bob@example.com',
    templateName: 'Monthly Report',
    subject: 'Your usage report for April',
    sentAt: '2026-05-16T09:00:00Z',
    status: 'Failed',
    failureReason: 'Mailbox full',
    triggeredBy: 'System Scheduler',
    contentPreview: 'Hi Bob, attached is your report...'
  }
];
