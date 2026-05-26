export interface EventMetric {
  label: string;
  count: number;
}

export interface CreatedEvent {
  id: string;
  name: string;
  status: 'active' | 'expired';
  expiryDate: string;
}

export interface JoinedEvent {
  id: string;
  name: string;
  host: string;
  rsvpStatus: 'going' | 'maybe' | 'not-going';
  status: 'active' | 'expired' | 'canceled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdDate: string;
  metrics: {
    totalEventsCreated: number;
    totalEventsJoined: number;
    activeEvents: number;
    expiredEvents: number;
  };
  createdEvents: CreatedEvent[];
  joinedEvents: JoinedEvent[];
}

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    status: 'active',
    createdDate: '2024-01-15T10:00:00Z',
    metrics: {
      totalEventsCreated: 12,
      totalEventsJoined: 45,
      activeEvents: 3,
      expiredEvents: 54,
    },
    createdEvents: [
      { id: 'EVT-101', name: 'Tech Conference 2024', status: 'active', expiryDate: '2024-12-20T18:00:00Z' },
      { id: 'EVT-102', name: 'Product Launch Workshop', status: 'expired', expiryDate: '2024-03-10T15:00:00Z' },
      { id: 'EVT-103', name: 'Networking Mixer', status: 'active', expiryDate: '2024-06-15T20:00:00Z' },
    ],
    joinedEvents: [
      { id: 'EVT-201', name: 'AI Summit', host: 'Michael Chen', rsvpStatus: 'going', status: 'active' },
      { id: 'EVT-202', name: 'Startup Pitch Day', host: 'Emma Davis', rsvpStatus: 'maybe', status: 'expired' },
      { id: 'EVT-203', name: 'Design Thinking Webinar', host: 'Lisa Anderson', rsvpStatus: 'going', status: 'active' },
    ],
  },
  {
    id: 'USR-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    status: 'active',
    createdDate: '2024-02-20T14:30:00Z',
    metrics: {
      totalEventsCreated: 5,
      totalEventsJoined: 20,
      activeEvents: 1,
      expiredEvents: 24,
    },
    createdEvents: [
      { id: 'EVT-104', name: 'Developer Meetup', status: 'active', expiryDate: '2024-07-01T19:00:00Z' },
    ],
    joinedEvents: [
      { id: 'EVT-201', name: 'AI Summit', host: 'Sarah Johnson', rsvpStatus: 'going', status: 'active' },
    ],
  },
  {
    id: 'USR-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    status: 'inactive',
    createdDate: '2023-11-05T09:15:00Z',
    metrics: {
      totalEventsCreated: 0,
      totalEventsJoined: 10,
      activeEvents: 0,
      expiredEvents: 10,
    },
    createdEvents: [],
    joinedEvents: [
      { id: 'EVT-205', name: 'Marketing Strategy 101', host: 'David Park', rsvpStatus: 'not-going', status: 'expired' },
    ],
  },
  {
    id: 'USR-004',
    name: 'David Park',
    email: 'david.park@example.com',
    status: 'active',
    createdDate: '2024-03-12T11:45:00Z',
    metrics: {
      totalEventsCreated: 8,
      totalEventsJoined: 15,
      activeEvents: 2,
      expiredEvents: 21,
    },
    createdEvents: [],
    joinedEvents: [],
  },
  {
    id: 'USR-005',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    status: 'active',
    createdDate: '2024-04-01T16:20:00Z',
    metrics: {
      totalEventsCreated: 2,
      totalEventsJoined: 5,
      activeEvents: 1,
      expiredEvents: 6,
    },
    createdEvents: [],
    joinedEvents: [],
  },
];
