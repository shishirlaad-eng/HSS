// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HSS UK Membership Management System - Dashboard
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useMemo, useState, useEffect } from 'react';
import {
  Users,
  Globe2,
  MapPin,
  Building2,
  CalendarDays,
  Megaphone,
  UserPlus,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
  CalendarClock,
  AlertCircle,
  UserCheck,
  Heart,
  CheckCheck,
  XCircle,
  Award,
  PoundSterling,
  ShieldCheck,
  X,
  Check,
  ListChecks,
  IdCard,
} from 'lucide-react';
import { PageHeader } from './hb/listing';
import { StatCard } from './hb/common';
import { mockMembers, MASTERS_CASCADE, getAgeGroupLabel, getAgeGroup, AGE_GROUP_LABELS } from '../../mockAPI/membersData';
import { mockEvents, type Event as HSSSEvent } from '../../mockAPI/eventsData';
import { mockSessions } from '../../mockAPI/attendanceData';
import { mockDonations } from '../../mockAPI/donationsData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, RoleScope } from '../../mockAPI/roleScope';

// â”€â”€ Mock Announcements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Announcement {
  id: string;
  title: string;
  body: string;
  postedAt: string;
  priority: 'high' | 'medium' | 'low';
  postedBy: string;
  eventId?: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'National SSV 2026 - Registrations Now Open',
    body: 'The annual Sangh Shiksha Varg 2026 is scheduled for August. All shakha leaders and members are encouraged to register their participants before 15 July 2026.',
    postedAt: '2026-05-20T09:00:00Z',
    priority: 'high',
    postedBy: 'National Head',
    eventId: 'EVT-111',
  },
  {
    id: 'ANN-002',
    title: 'DBS Renewal - Updated Guidance',
    body: 'New DBS renewal guidelines are in effect from June 2026. All active volunteers with DBS expiry before December 2026 must initiate renewal by 30 June.',
    postedAt: '2026-05-15T10:30:00Z',
    priority: 'high',
    postedBy: 'Compliance Team',
  },
  {
    id: 'ANN-003',
    title: 'Volunteer Recognition Awards 2026',
    body: 'Nominations are open for the annual Volunteer Recognition Awards. Submit your nominations for outstanding seva contributors by 10 June 2026.',
    postedAt: '2026-05-10T14:00:00Z',
    priority: 'medium',
    postedBy: 'National Head',
  },
  {
    id: 'ANN-004',
    title: 'Membership Portal - Scheduled Maintenance',
    body: 'The membership portal will undergo maintenance on 1 June 2026 between 02:00-06:00 BST. Members may experience brief interruptions during this window.',
    postedAt: '2026-05-08T11:00:00Z',
    priority: 'low',
    postedBy: 'IT Operations',
  },
  {
    id: 'ANN-005',
    title: 'New Activity Centre - Birmingham West Now Active',
    body: 'We are pleased to announce that Birmingham West Activity Centre is now fully operational. Shakha activities begin from 1 June 2026.',
    postedAt: '2026-05-05T08:00:00Z',
    priority: 'medium',
    postedBy: 'Regional Coordinator - Midlands',
  },
];

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string): string {
  const now   = new Date();
  const date  = new Date(iso);
  const diffMs   = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  { const d = diffDays; return `${d} ${d === 1 ? 'day' : 'days'} ago`; }
  if (diffDays < 30) { const w = Math.floor(diffDays / 7); return `${w} ${w === 1 ? 'week' : 'weeks'} ago`; }
  const m = Math.floor(diffDays / 30); return `${m} ${m === 1 ? 'month' : 'months'} ago`;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const EVENT_STATUS_CFG = {
  active:    { dot: 'bg-success-500',  label: 'Active',    text: 'text-success-700 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800'  },
  published: { dot: 'bg-blue-500',     label: 'Published', text: 'text-blue-700 dark:text-blue-400',        bg: 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'              },
  draft:     { dot: 'bg-neutral-400',  label: 'Draft',     text: 'text-neutral-600 dark:text-neutral-400',  bg: 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'   },
  completed: { dot: 'bg-amber-500',    label: 'Completed', text: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'          },
  cancelled: { dot: 'bg-error-500',    label: 'Cancelled', text: 'text-error-700 dark:text-error-400',      bg: 'bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800'          },
};

const PRIORITY_CFG = {
  high:   { icon: AlertCircle, color: 'text-red-500 dark:text-red-400',           bg: 'bg-red-50 dark:bg-red-950/30'     },
  medium: { icon: Clock,       color: 'text-amber-500 dark:text-amber-400',        bg: 'bg-amber-50 dark:bg-amber-950/30'  },
  low:    { icon: Circle,      color: 'text-neutral-400 dark:text-neutral-500',    bg: 'bg-neutral-50 dark:bg-neutral-800' },
};

const MEMBER_STATUS_CFG = {
  active:                     { label: 'Active',            dot: 'bg-success-500', text: 'text-success-700 dark:text-success-400' },
  pending:                    { label: 'Pending Approval',  dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400'    },
  'pending-parental-consent': { label: 'Parental Consent',  dot: 'bg-violet-500',  text: 'text-violet-700 dark:text-violet-400'  },
  inactive:                   { label: 'Inactive',          dot: 'bg-neutral-400', text: 'text-neutral-600 dark:text-neutral-400' },
  rejected:                   { label: 'Rejected',          dot: 'bg-error-500',   text: 'text-error-700 dark:text-error-400'    },
};

//â”€â”€ Mock Donations (member view) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockMyDonations = [
  { id: 'DON-001', datetime: '2026-05-28T14:32:00', amount: 25.00,  type: 'recurring' },
  { id: 'DON-002', datetime: '2026-04-15T09:15:00', amount: 50.00,  type: 'online'    },
  { id: 'DON-003', datetime: '2026-03-22T18:47:00', amount: 10.00,  type: 'recurring' },
  { id: 'DON-004', datetime: '2026-02-10T11:05:00', amount: 100.00, type: 'online'    },
  { id: 'DON-005', datetime: '2026-01-05T16:20:00', amount: 25.00,  type: 'recurring' },
];

// â”€â”€ Mock Attendance (member view) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockMyAttendance = [
  { id: 'ATT-001', session: 'Shakha - Wembley Activity Centre',     date: '2026-06-01', status: 'present' },
  { id: 'ATT-002', session: 'Shakha - Wembley Activity Centre',     date: '2026-05-25', status: 'present' },
  { id: 'ATT-003', session: 'Youth Leadership Workshop',            date: '2026-05-20', status: 'present' },
  { id: 'ATT-004', session: 'Shakha - Wembley Activity Centre',     date: '2026-05-18', status: 'absent'  },
  { id: 'ATT-005', session: 'Shakha - Wembley Activity Centre',     date: '2026-05-11', status: 'present' },
  { id: 'ATT-006', session: 'Annual Sports Day',                    date: '2026-05-04', status: 'present' },
  { id: 'ATT-007', session: 'Shakha - Wembley Activity Centre',     date: '2026-04-27', status: 'absent'  },
  { id: 'ATT-008', session: 'Bal Vihar - Cultural Evening',        date: '2026-04-20', status: 'present' },
];

// â”€â”€ Mock current logged-in member â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockCurrentMember = {
  firstName:           'John',
  lastName:            'Doe',
  memberId:            'HSS-00001',
  shakha:              'Harrow Activity Centre',
  town:                'Harrow',
  vibhaag:             'London & South East',
  sanghResponsibility: 'Ghatnayak',
  sanghResponsibility2:'Shakha Mukhya Shikshak',
  joinDate:            '2019-06-15',
  ageGroup:            'Tarun',
  status:              'Active',
};

// â”€â”€ Member / Teen Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MemberDashboard({
  onNavigate,
  onNavigateToEvent,
  onNavigateToAnnouncement,
}: {
  onNavigate?: (page: string) => void;
  onNavigateToEvent?: (eventId: string) => void;
  onNavigateToAnnouncement?: (announcementId: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);

  const [registerEvent, setRegisterEvent] = useState<HSSSEvent | null>(null);
  const [registerAnswers, setRegisterAnswers] = useState<Record<string, string | boolean>>({});
  const [registered, setRegistered] = useState<Set<string>>(new Set());

  const upcomingEvents = useMemo(
    () => mockEvents
      .filter(e => e.status === 'published' || e.status === 'active')
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 10),
    [],
  );

  const presentCount  = mockMyAttendance.filter(a => a.status === 'present').length;
  const absentCount   = mockMyAttendance.filter(a => a.status === 'absent').length;
  const attendancePct = Math.round((presentCount / mockMyAttendance.length) * 100);
  const presentAnotherShakha = mockMyAttendance.filter(
    a => a.status === 'present' && a.session.includes('Shakha') && !a.session.includes(mockCurrentMember.shakha),
  ).length;
  const highPriority  = mockAnnouncements.filter(a => a.priority === 'high').length;

  return (
    <>
    <div className="px-6 py-6">

      {/* Member Identity Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-[32px] font-bold text-neutral-900 dark:text-white leading-tight">
              {mockCurrentMember.firstName} {mockCurrentMember.lastName}{' '}
              <span className="text-xl font-medium text-neutral-400 dark:text-neutral-500">[{mockCurrentMember.memberId}]</span>
            </h1>
          </div>
        </div>
      </div>

      {/* â”€â”€ Row 1: Donut stat cards - My Attendance · Suchana · Karyakrams · My Dakshina â”€â”€ */}
      {(() => {
        const C      = 2 * Math.PI * 24;
        const offset = C / 4;
        const totalDakshina = mockMyDonations.reduce((s, d) => s + d.amount, 0);
        const registeredEvents = 2;
        const onlineDakshina = 150;
        const recurringDakshina = 60;
        const donutCards = [
          {
            label:    'My Attendance',
            arc:      (attendancePct / 100) * C,
            color:    '#172E4D',
            center:   `${attendancePct}%`,
            centerSub: 'YTD',
            segments: [
              { label: 'Present', value: presentCount, color: '#4EAE33' },
              { label: 'Absent', value: absentCount, color: '#F9B03D' },
            ],
            detail:   `${presentAnotherShakha} Present in Another Shakha`,
            detailRows: [],
            sub:      `${presentCount} Present · ${absentCount} Absent`,
            bg:       'bg-slate-50 dark:bg-slate-900/40',
            track:    'text-slate-200 dark:text-slate-700',
            onClick:  () => onNavigate?.('attendance-log'),
          },
          {
            label:    'Suchana',
            arc:      (Math.min(mockAnnouncements.length, 10) / 10) * C,
            color:    '#F9B03D',
            display:  'stat',
            center:   `${mockAnnouncements.length}`,
            segments: [
              { label: 'High Priority', value: highPriority, color: '#F9B03D' },
              { label: 'Other Suchana', value: Math.max(mockAnnouncements.length - highPriority, 0), color: '#F9B03D' },
            ],
            detail:   '',
            detailRows: [],
            sub:      `${highPriority} High Priority`,
            bg:       'bg-amber-50 dark:bg-amber-900/20',
            track:    'text-amber-100 dark:text-amber-900/60',
            onClick:  () => onNavigate?.('announcements'),
          },
          {
            label:    'Karyakrams',
            arc:      (Math.min(upcomingEvents.length, 10) / 10) * C,
            color:    '#378ADD',
            center:   `${upcomingEvents.length}`,
            segments: [
              { label: 'Registered', value: registeredEvents, color: '#4EAE33' },
              { label: 'Not Registered', value: Math.max(upcomingEvents.length - registeredEvents, 0), color: '#378ADD' },
            ],
            detail:   `${Math.max(upcomingEvents.length - registeredEvents, 0)} Not Registered`,
            detailRows: [],
            sub:      `${registeredEvents} Registered`,
            bg:       'bg-sky-50 dark:bg-sky-950/30',
            track:    'text-sky-100 dark:text-sky-900/60',
            onClick:  () => onNavigate?.('event-management'),
          },
          {
            label:    'My Dakshina',
            display:  'split',
            arc:      Math.min(totalDakshina / 500, 1) * C,
            color:    '#1D9E75',
            center:   `£${totalDakshina.toFixed(0)}`,
            segments: [
              { label: 'Online', value: onlineDakshina, color: '#1D9E75', prefix: '£' },
              { label: 'Recurring', value: recurringDakshina, color: '#65c44a', prefix: '£' },
            ],
            sub:      'YTD Total',
            detail:   '',
            detailRows: ['150 Online', '60 Recurring'],
            bg:       'bg-emerald-50 dark:bg-emerald-950/30',
            track:    'text-emerald-100 dark:text-emerald-900/60',
            onClick:  () => onNavigate?.('my-donations'),
          },
        ];
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {donutCards.map(card => {
              const segmentTotal = card.segments.reduce((sum, segment) => sum + segment.value, 0);
              let segmentCursor = offset;

              return (
              <div
                key={card.label}
                role={card.onClick ? 'button' : undefined}
                tabIndex={card.onClick ? 0 : undefined}
                className={`flex flex-col items-center py-5 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:border-transparent ${card.bg}${card.onClick ? ' cursor-pointer' : ''}`}
                onClick={card.onClick}
                onKeyDown={card.onClick ? e => e.key === 'Enter' && card.onClick?.() : undefined}
              >
                <p className="text-[21px] font-bold text-neutral-600 dark:text-neutral-400 mb-3 text-center" style={{ fontFamily: "'Ramilias', serif" }}>{card.label}</p>
                {(card as any).display === 'stat' ? (
                  /* â”€â”€ Big Stat: Suchana â”€â”€ */
                  <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <span className="text-6xl font-bold leading-none" style={{ color: card.color }}>{card.center}</span>
                    <p className="mt-3 text-xs font-semibold" style={{ color: card.color }}>
                      {card.sub}
                    </p>
                    <p className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                      {card.segments[1].value} Other
                    </p>
                  </div>
                ) : (card as any).display === 'split' ? (
                  /* â”€â”€ Split Metric: My Dakshina â”€â”€ */
                  <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <span className="text-5xl font-bold leading-none" style={{ color: card.color }}>{card.center}</span>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5 mb-4">{card.sub}</p>
                    <div className="flex items-center gap-5">
                      {card.segments.map((seg, i) => (
                        <div key={seg.label} className="flex flex-col items-center">
                          <span className="text-lg font-bold leading-none" style={{ color: seg.color }}>{seg.prefix ?? ''}{seg.value}</span>
                          <span className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1">{seg.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* â”€â”€ Donut chart (default) â”€â”€ */
                  <>
                  <svg width="120" height="120" viewBox="0 0 60 60" aria-hidden="true">
                    <circle
                      cx="30" cy="30" r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      className={card.track}
                    />
                    {card.segments.map(segment => {
                      const dash = segmentTotal > 0 ? (segment.value / segmentTotal) * C : 0;
                      const dashOffset = segmentCursor;
                      segmentCursor -= dash;
                      return (
                        <circle
                          key={`${card.label}-${segment.color}`}
                          cx="30" cy="30" r="24"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="7"
                          strokeDasharray={animated ? `${dash} ${C - dash}` : `0 ${C}`}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="butt"
                          className="cursor-help transition-opacity hover:opacity-80"
                          style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                          <title>{card.label} - {segment.label}: {segment.value}</title>
                        </circle>
                      );
                    })}
                    <text
                      x="30" y={card.centerSub ? "29" : "34"}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="currentColor"
                      className="text-neutral-900 dark:text-white"
                    >{card.center}</text>
                    {card.centerSub && (
                      <text
                        x="30" y="41"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="500"
                        fill="currentColor"
                        className="text-neutral-500 dark:text-neutral-400"
                      >{card.centerSub}</text>
                    )}
                  </svg>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-3 text-center leading-relaxed">{card.sub}</p>
                  {card.detail && (
                    <p className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1 text-center leading-relaxed">{card.detail}</p>
                  )}
                  {card.detailRows.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
                      {card.detailRows.map(row => (
                        <span key={row} className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          <PoundSterling className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {row}
                        </span>
                      ))}
                    </div>
                  )}
                  </>
                )}
              </div>
              );
            })}
          </div>
        );
      })()}

      {/* â”€â”€ Row 2: My Profile + My Attendance list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">

        {/* My Profile card */}
        <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">My Profile</h3>
            </div>
            <button onClick={() => onNavigate?.('my-profile')} className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-5 py-5 flex-1 flex">
            <div className="flex-1 grid grid-cols-2 gap-x-6">
              {/* Left column: core profile fields */}
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Shakha</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.shakha}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Nagar</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.town}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Vibhag</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.vibhaag}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Age Category</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">
                      {AGE_GROUP_LABELS[mockCurrentMember.ageGroup.toLowerCase() as keyof typeof AGE_GROUP_LABELS] ?? mockCurrentMember.ageGroup}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${
                      mockCurrentMember.status === 'Active'
                        ? 'bg-success-50 dark:bg-success-950/20 border-success-200 dark:border-success-800'
                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}>
                      <span className={`whitespace-nowrap ${mockCurrentMember.status === 'Active' ? 'text-success-700 dark:text-success-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {mockCurrentMember.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right column: member ID + responsibilities */}
              <div className="flex flex-col">
                <div className="flex items-start gap-2 mb-5">
                  <IdCard className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Member ID</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.memberId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Responsibilities</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.sanghResponsibility}</p>
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{mockCurrentMember.sanghResponsibility2}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Attendance attendance list */}
        <div className="flex flex-col cursor-pointer" onClick={() => onNavigate?.('attendance-log')}>
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col flex-1 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-colors" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">My Attendance</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {attendancePct}%
                </span>
              </div>
              <button onClick={e => { e.stopPropagation(); onNavigate?.('attendance-log'); }} className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1 overflow-y-auto">
              {mockMyAttendance.slice(0, 3).map(att => (
                <div
                  key={att.id}
                  role="button" tabIndex={0}
                  className="px-5 py-3 flex items-center overflow-hidden cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  onClick={() => onNavigate?.('attendance-log')}
                  onKeyDown={e => e.key === 'Enter' && onNavigate?.('attendance-log')}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-semibold text-neutral-900 dark:text-white truncate">{att.session}</p>
                      <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">{formatDate(att.date)}</p>
                    </div>
                    {att.status === 'present'
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400 border border-success-200 dark:border-success-800 flex-shrink-0"><CheckCircle2 className="w-3 h-3" /> Present</span>
                      : <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex-shrink-0">Absent</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Row 3: Suchana + Upcoming Karyakrams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Suchana */}
        <div>
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Suchana</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {mockAnnouncements.length}
                </span>
              </div>
              <button onClick={() => onNavigate?.('announcements')} className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {mockAnnouncements.slice(0, 3).map(ann => {
                const pcfg = PRIORITY_CFG[ann.priority];
                const PIcon = pcfg.icon;
                return (
                  <div
                    key={ann.id}
                    role="button" tabIndex={0}
                    className="px-5 py-3 flex items-center overflow-hidden cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    onClick={() => onNavigateToAnnouncement?.(ann.id)}
                    onKeyDown={e => e.key === 'Enter' && onNavigateToAnnouncement?.(ann.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${pcfg.bg}`}>
                        <PIcon className={`w-3.5 h-3.5 ${pcfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-[16px] font-semibold text-neutral-900 dark:text-white leading-snug" style={{ fontFamily: "'Ramilias', serif" }}>{ann.title}</h4>
                          <span className="text-[12px] text-neutral-400 dark:text-neutral-500 flex-shrink-0 mt-0.5">{timeAgo(ann.postedAt)}</span>
                        </div>
                        <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{ann.body}</p>
                        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-1">Posted by {ann.postedBy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Karyakrams */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col flex-1 overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Upcoming Karyakrams</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {upcomingEvents.length}
                </span>
              </div>
              <button onClick={() => onNavigate?.('event-management')} className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">No upcoming events scheduled.</div>
              ) : upcomingEvents.slice(0, 3).map(event => {
                const cfg = EVENT_STATUS_CFG[event.status] ?? EVENT_STATUS_CFG.draft;
                return (
                  <div
                    key={event.id}
                    role="button" tabIndex={0}
                    className="px-5 py-3 flex items-center overflow-hidden cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    onClick={() => onNavigateToEvent?.(event.id)}
                    onKeyDown={e => e.key === 'Enter' && onNavigateToEvent?.(event.id)}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex-shrink-0 w-12 text-center pt-0.5">
                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400 leading-tight">{new Date(event.startDate).getDate()}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-medium">{new Date(event.startDate).toLocaleString('en-GB', { month: 'short' })}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">{new Date(event.startDate).getFullYear()}</div>
                      </div>
                      <div className="w-px self-stretch bg-neutral-100 dark:bg-neutral-800 my-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[16px] font-semibold text-neutral-900 dark:text-white" style={{ fontFamily: "'Ramilias', serif" }}>{event.name}</span>
                          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                          <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.activityCentre}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {registered.has(event.id)
                          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800">Registered</span>
                          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">Not Yet Registered</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>

      {/* â”€â”€ Register Modal â”€â”€ */}
      {registerEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRegisterEvent(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800" style={{ borderTop: '3px solid #172E4D' }}>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary-600" />
                Register - <span style={{ fontFamily: "'Ramilias', serif" }}>{registerEvent.name}</span>
              </h4>
              <button onClick={() => setRegisterEvent(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {(!registerEvent.customQuestions || registerEvent.customQuestions.length === 0) ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center py-4">
                  No additional questions required. Click <strong>Submit</strong> to register.
                </p>
              ) : registerEvent.customQuestions.map(q => (
                <div key={q.id}>
                  {q.type !== 'checkbox' && (
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                      {q.label} {q.required && <span className="text-red-500">*</span>}
                    </label>
                  )}
                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={(registerAnswers[q.id] as string) ?? ''}
                      onChange={e => setRegisterAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                  {q.type === 'dropdown' && (
                    <select
                      value={(registerAnswers[q.id] as string) ?? ''}
                      onChange={e => setRegisterAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select...</option>
                      {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {q.type === 'checkbox' && (
                    <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(registerAnswers[q.id] as boolean) ?? false}
                        onChange={e => setRegisterAnswers(prev => ({ ...prev, [q.id]: e.target.checked }))}
                        className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{q.label} {q.required && <span className="text-red-500">*</span>}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setRegisterEvent(null)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const missing = (registerEvent.customQuestions ?? []).find(q => {
                    if (!q.required) return false;
                    const ans = registerAnswers[q.id];
                    return q.type === 'checkbox' ? ans !== true : !ans || !(ans as string).trim();
                  });
                  if (missing) { alert(`Please answer: "${missing.label}"`); return; }
                  setRegistered(prev => new Set([...prev, registerEvent.id]));
                  setRegisterEvent(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#172E4D] text-white hover:bg-[#172E4D]/80 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// â”€â”€ Hierarchy KPI Section (Regional / Town / Activity Centre) â”€â”€

// Age-group membership labels are NOT sangh responsibilities - exclude them
// when counting "Shakha Karyakartas" (members holding a sangh responsibility).
const AGE_GROUP_ROLE_LABELS = new Set([
  'Bal(ika)', 'Shishu', 'Kishor(i)', 'Tarun(i)', 'Yuva(ti)', 'Jyestha(a)',
]);

interface KpiSubMetric {
  label: string;
  value: string | number;
  tone?: 'default' | 'primary' | 'amber' | 'emerald' | 'red';
}

const SUB_TONE: Record<NonNullable<KpiSubMetric['tone']>, string> = {
  default:  'text-neutral-500 dark:text-neutral-400',
  primary:  'text-primary-600 dark:text-primary-400',
  amber:    'text-amber-600 dark:text-amber-400',
  emerald:  'text-emerald-600 dark:text-emerald-400',
  red:      'text-red-600 dark:text-red-400',
};

function KpiCard({
  title, value, icon: Icon, subMetrics, onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subMetrics: KpiSubMetric[];
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={`p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors ${
        interactive ? 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-700' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {subMetrics.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 truncate font-semibold">{s.label}</span>
            <span className={`font-medium flex-shrink-0 ${SUB_TONE[s.tone ?? 'default']}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HierarchyKpiSection({
  scope,
  onNavigate,
}: {
  scope: RoleScope;
  onNavigate?: (page: string) => void;
}) {
  const kpis = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const gbp = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`;

    // â”€â”€ Attendance â”€â”€
    const completedSessions = filterByScope(mockSessions, scope).filter(s => s.status === 'completed');
    const rateOf = (s: typeof completedSessions[number]) => {
      const present = s.attendanceRecords.filter(r => r.status === 'present').length;
      const absent  = s.attendanceRecords.filter(r => r.status === 'absent').length;
      const denom = present + absent;
      return denom > 0 ? (present / denom) * 100 : 0;
    };
    const sortedSessions = [...completedSessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const last4 = sortedSessions.slice(0, 4);
    const avgLast4 = last4.length
      ? Math.round(last4.reduce((sum, s) => sum + rateOf(s), 0) / last4.length) : 0;
    const ytdSessions = completedSessions.filter(s => new Date(s.date).getFullYear() === currentYear);
    const avgYTD = ytdSessions.length
      ? Math.round(ytdSessions.reduce((sum, s) => sum + rateOf(s), 0) / ytdSessions.length) : 0;
    const sessionsHeldYTD = ytdSessions.length;

    // â”€â”€ Suchana â”€â”€
    const suchanaActive = mockAnnouncements.length;
    const suchanaHigh   = mockAnnouncements.filter(a => a.priority === 'high').length;

    // â”€â”€ Members (scoped) â”€â”€
    const scopedMembers = filterByScope(mockMembers, scope);
    const pendingApprovals = scopedMembers.filter(
      m => m.status === 'pending' || m.status === 'pending-parental-consent',
    );
    const pendingParental = pendingApprovals.filter(m => m.status === 'pending-parental-consent').length;

    const karyakartas = scopedMembers.filter(
      m => m.status === 'active' && !AGE_GROUP_ROLE_LABELS.has(m.jobTitle),
    ).length;

    // â”€â”€ Upcoming Karyakrams - events any member of this Shakha is eligible for â”€â”€
    const isEligibleForShakha = (e: typeof mockEvents[number]) => {
      if (!e.filterAgeCategories && !e.filterGenders && !e.filterJobTitles) return true;
      return scopedMembers.some(m => {
        const ageOk    = !e.filterAgeCategories || e.filterAgeCategories.includes(getAgeGroup(m.dateOfBirth));
        const genderOk = !e.filterGenders || e.filterGenders.includes(m.gender);
        const jobOk    = !e.filterJobTitles || e.filterJobTitles.includes(m.jobTitle);
        return ageOk && genderOk && jobOk;
      });
    };
    const allUpcomingList = mockEvents
      .filter(e => e.status === 'published' || e.status === 'active')
      .filter(isEligibleForShakha);
    const allUpcomingActive = allUpcomingList.filter(e => e.status === 'active').length;
    const allUpcomingPublished = allUpcomingList.filter(e => e.status === 'published').length;

    // â”€â”€ Nidhi (donations) â”€â”€
    const receivedDonations = filterByScope(mockDonations, scope).filter(d => d.status === 'received');
    const totalIncome = receivedDonations.reduce((sum, d) => sum + d.amount, 0);
    const onlineTotal = receivedDonations.filter(d => d.channel === 'online').reduce((sum, d) => sum + d.amount, 0);
    const cashTotal   = receivedDonations.filter(d => d.channel === 'cash').reduce((sum, d) => sum + d.amount, 0);
    const giftAidClaimable = receivedDonations.filter(d => d.giftAid).reduce((sum, d) => sum + d.amount, 0) * 0.25;

    // â”€â”€ Compliance â”€â”€
    const firstAiders  = scopedMembers.filter(m => m.isFirstAider).length;
    const dbsApproved  = scopedMembers.filter(m => m.compliance.dbs === 'Approved').length;
    const safeguarding = scopedMembers.filter(m => m.compliance.safeguardingTraining === 'Certified').length;

    return {
      avgLast4, avgYTD, sessionsHeldYTD,
      suchanaActive, suchanaHigh,
      allUpcoming: allUpcomingList.length, allUpcomingActive, allUpcomingPublished,
      pendingApprovals: pendingApprovals.length, pendingParental,
      karyakartas,
      totalIncome, onlineTotal, cashTotal, giftAidClaimable,
      firstAiders, dbsApproved, safeguarding,
      gbp,
    };
  }, [scope]);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Sankhya */}
        <KpiCard
          title="Sankhya"
          value={kpis.sessionsHeldYTD}
          icon={CheckCheck}
          onClick={() => onNavigate?.('attendance-log')}
          subMetrics={[
            { label: 'Shakhas held YTD', value: kpis.sessionsHeldYTD, tone: 'primary' },
            { label: 'Avg - last 4 Shakhas', value: kpis.avgLast4 },
            { label: 'Avg - YTD', value: kpis.avgYTD },
          ]}
        />

        {/* 2. Suchana */}
        <KpiCard
          title="Suchana"
          value={kpis.suchanaActive}
          icon={Megaphone}
          onClick={() => onNavigate?.('announcements')}
          subMetrics={[
            { label: 'High priority', value: kpis.suchanaHigh, tone: 'red' },
          ]}
        />

        {/* 3. Pending Shakha Approvals */}
        {scope.level !== 'centre' && (
          <KpiCard
            title="Pending Shakha Approvals"
            value={kpis.pendingApprovals}
            icon={ClipboardCheck}
            onClick={() => onNavigate?.('pending-approvals')}
            subMetrics={[
              { label: 'Awaiting your approval', value: kpis.pendingApprovals, tone: 'amber' },
              { label: 'Awaiting parental consent', value: kpis.pendingParental },
            ]}
          />
        )}

        {/* 5. Shakha Karyakartas */}
        <KpiCard
          title="Shakha Karyakartas"
          value={kpis.karyakartas}
          icon={Award}
          onClick={() => onNavigate?.('members')}
          subMetrics={[
            { label: 'Holding sangh responsibility', value: kpis.karyakartas, tone: 'primary' },
          ]}
        />

        {/* 6. Nidhi */}
        <KpiCard
          title="Nidhi"
          value={kpis.gbp(kpis.totalIncome)}
          icon={PoundSterling}
          onClick={() => onNavigate?.('report-donations')}
          subMetrics={[
            { label: 'Online', value: kpis.gbp(kpis.onlineTotal), tone: 'primary' },
            { label: 'Cash', value: kpis.gbp(kpis.cashTotal) },
          ]}
        />

        {/* 7. Compliance */}
        <KpiCard
          title="Compliance"
          value={kpis.dbsApproved}
          icon={ShieldCheck}
          onClick={() => onNavigate?.('members')}
          subMetrics={[
            { label: 'DBS approved', value: kpis.dbsApproved, tone: 'emerald' },
            { label: 'First aiders', value: kpis.firstAiders, tone: 'primary' },
            { label: 'Safeguarding complete', value: kpis.safeguarding },
          ]}
        />

        {/* Upcoming Karyakrams - placed after Compliance */}
        <KpiCard
          title="Upcoming Karyakrams"
          value={kpis.allUpcoming}
          icon={CalendarDays}
          onClick={() => onNavigate?.('event-management')}
          subMetrics={[
            { label: 'Active', value: kpis.allUpcomingActive, tone: 'primary' },
            { label: 'Published', value: kpis.allUpcomingPublished, tone: 'amber' },
          ]}
        />

      </div>
    </div>
  );
}

// â”€â”€ Dashboard Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DashboardProps {
  onNavigate?: (page: string) => void;
  onNavigateToEvent?: (eventId: string) => void;
  onNavigateToAnnouncement?: (announcementId: string) => void;
}

export default function Dashboard({ onNavigate, onNavigateToEvent, onNavigateToAnnouncement }: DashboardProps) {

  const { selectedRole, scope } = useRoleScope();

  // Member (18+) and Teen get a simplified personal dashboard
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  if (isMemberRole) {
    return (
      <MemberDashboard
        onNavigate={onNavigate}
        onNavigateToEvent={onNavigateToEvent}
        onNavigateToAnnouncement={onNavigateToAnnouncement}
      />
    );
  }

  // Hierarchy-scoped KPI section shown for these mid-tier admin roles
  const showHierarchyKpis =
    selectedRole === 'Vibhaag Admin' ||
    selectedRole === 'Nagar Admin' ||
    selectedRole === 'Shakha Admin';

  // Hide org-structure cards that are redundant for the current role's scope
  const hideRegions  = selectedRole === 'Vibhaag Admin' || selectedRole === 'Nagar Admin' || selectedRole === 'Shakha Admin';
  const hideTowns    = selectedRole === 'Nagar Admin' || selectedRole === 'Shakha Admin';
  const hideCentres  = selectedRole === 'Shakha Admin';

  // â”€â”€ Derived KPI values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const scopedTotalMembers = filterByScope(mockMembers, scope);
  const totalMembers   = scopedTotalMembers.length;
  const activeMembers  = scopedTotalMembers.filter(m => m.status === 'active').length;
  const inactiveMembers = scopedTotalMembers.filter(m => m.status === 'inactive').length;
  const pendingStatusApprovals = scopedTotalMembers.filter(m => m.status === 'pending').length;
  const pendingGuardianApprovals = scopedTotalMembers.filter(m => m.status === 'pending-parental-consent').length;
  const pendingApprovals = pendingStatusApprovals + pendingGuardianApprovals;

  const regionsCount = Object.values(MASTERS_CASCADE.regions).flat().length;
  const townsCount   = Object.values(MASTERS_CASCADE.towns).flat().length;
  const centresCount = Object.values(MASTERS_CASCADE.centres).flat().length;

  const upcomingEvents = useMemo(
    () => mockEvents
      .filter(e => e.status === 'published' || e.status === 'active')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [],
  );

  const recentRegistrations = useMemo(
    () => [...mockMembers]
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 6),
    [],
  );

  const pendingList = useMemo(
    () => mockMembers.filter(m => m.status === 'pending' || m.status === 'pending-parental-consent'),
    [],
  );

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-6 py-6">

      {/* â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <PageHeader
        title={
          scope.centre  ? `${scope.centre} - Dashboard`  :
          scope.town    ? `${scope.town} - Dashboard`    :
          scope.region  ? `${scope.region} - Dashboard`  :
          scope.country ? `${scope.country} - Dashboard` :
          "Dashboard"
        }
        subtitle={
          scope.centre
            ? `Nagar: ${scope.town}`
            : scope.town && !scope.centre
              ? `Vibhaag: ${scope.region}`
              : scope.region && !scope.town
                ? `Country: ${scope.country}`
                : scope.country && !scope.region
                  ? undefined
                  : showHierarchyKpis ? undefined : `${greeting} - here's what's happening across the network`
        }
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Dashboard', current: true },
        ]}
      >
      </PageHeader>

      {/* â”€â”€ Row 1: Org structure KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          subMetrics={[
            { label: 'Active', value: activeMembers, tone: 'emerald' },
            { label: 'Inactive', value: inactiveMembers },
            { label: 'Pending Approval', value: pendingStatusApprovals, tone: 'amber' },
            { label: 'Pending Parent/Guardian Approval', value: pendingGuardianApprovals, tone: 'amber' },
          ]}
        />
        {!hideRegions && (
          <StatCard
            label="Vibhaag"
            labelClassName="text-[14px] font-bold"
            valueClassName="font-bold"
            value={regionsCount}
            icon={Globe2}
            trend={{ value: `Across ${MASTERS_CASCADE.countries.length} countries`, positive: true }}
          />
        )}
        {!hideTowns && (
          <StatCard
            label="Nagar"
            labelClassName="text-[14px] font-bold"
            valueClassName="font-bold"
            value={townsCount}
            icon={MapPin}
            trend={{ value: `Across ${regionsCount} vibhaags`, positive: true }}
          />
        )}
        {!hideCentres && (
          <StatCard
            label="Shakha"
            labelClassName="text-[14px] font-bold"
            valueClassName="font-bold"
            value={centresCount}
            icon={Building2}
            trend={{ value: `Across ${townsCount} nagars`, positive: true }}
          />
        )}
      </div>

      {/* â”€â”€ Hierarchy-scoped KPIs (Regional / Town / Activity Centre) â”€â”€ */}
      {showHierarchyKpis && (
        <HierarchyKpiSection scope={scope} onNavigate={onNavigate} />
      )}

      {/* â”€â”€ Row 2: Activity KPIs (hidden for hierarchy roles - covered by Performance Overview) â”€â”€ */}
      {!showHierarchyKpis && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Upcoming Karyakrams */}
        <div
          role="button"
          tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('event-management')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('event-management')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Upcoming Karyakrams</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{upcomingEvents.length}</p>
              <p className="text-xs mt-1.5 text-primary-600 dark:text-primary-400">
                {upcomingEvents.filter(e => e.status === 'active').length} active ·{' '}
                {upcomingEvents.filter(e => e.status === 'published').length} published
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div
          role="button"
          tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('announcements')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('announcements')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Suchana</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{mockAnnouncements.length}</p>
              <p className="text-xs mt-1.5 text-red-600 dark:text-red-400">
                {mockAnnouncements.filter(a => a.priority === 'high').length} high priority
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div
          role="button"
          tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('members')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('members')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Recent Registrations</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{recentRegistrations.length}</p>
              <p className="text-xs mt-1.5 text-emerald-600 dark:text-emerald-400">
                Latest: {timeAgo(recentRegistrations[0]?.registrationDate ?? '')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          role="button"
          tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          onClick={() => onNavigate?.('pending-approvals')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('pending-approvals')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Pending Approvals</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{pendingApprovals}</p>
              <p className="text-xs mt-1.5 text-amber-600 dark:text-amber-400">
                {pendingList.filter(m => m.status === 'pending-parental-consent').length} awaiting parental consent
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* â”€â”€ Section: Upcoming Karyakrams + Pending Approvals â”€â”€â”€ */}
      {scope.level !== 'centre' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Upcoming Karyakrams list (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Upcoming Karyakrams</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {upcomingEvents.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('event-management')}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {upcomingEvents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No upcoming events scheduled.
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const cfg = EVENT_STATUS_CFG[event.status] ?? EVENT_STATUS_CFG.draft;
                  return (
                    <div key={event.id} className="px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="flex items-start gap-4">

                        {/* Date block */}
                        <div className="flex-shrink-0 w-12 text-center pt-0.5">
                          <div className="text-xl font-bold text-primary-600 dark:text-primary-400 leading-tight">
                            {new Date(event.startDate).getDate()}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-medium">
                            {new Date(event.startDate).toLocaleString('en-GB', { month: 'short' })}
                          </div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            {new Date(event.startDate).getFullYear()}
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="w-px self-stretch bg-neutral-100 dark:bg-neutral-800 my-0.5" />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {event.name}
                            </span>
                            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[12px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                              {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {event.activityCentre}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                              {event.metrics.participantCount} registered
                            </span>
                          </div>
                        </div>

                        {/* Fee badge */}
                        <div className="flex-shrink-0">
                          {event.paymentType === 'paid' ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              £{event.price}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Pending Approvals quick list (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Pending Approvals</h3>
                {pendingApprovals > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {pendingApprovals}
                  </span>
                )}
              </div>
              <button
                onClick={() => onNavigate?.('pending-approvals')}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendingList.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">All approvals up to date</p>
                </div>
              ) : (
                pendingList.map((member) => {
                  const sc = MEMBER_STATUS_CFG[member.status];
                  return (
                    <div key={member.id} className="px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(member.name)}`}>
                          {getInitials(member.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {member.name}
                          </div>
                          <div className={`inline-flex items-center gap-1 text-xs mt-0.5 ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex-shrink-0">
                          {getAgeGroupLabel(member.dateOfBirth)}
                        </span>
                      </div>
                      <p className="ml-11 text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        Registered {timeAgo(member.registrationDate)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* â”€â”€ Section: Announcements + Recent Registrations â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Announcements (2/3, or full-width for AC Admin) */}
        <div className={scope.level === 'centre' ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Suchana</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {mockAnnouncements.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('announcements')}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {mockAnnouncements.map((ann) => {
                const pcfg = PRIORITY_CFG[ann.priority];
                const PIcon = pcfg.icon;
                return (
                  <div key={ann.id} className="px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${pcfg.bg}`}>
                        <PIcon className={`w-3.5 h-3.5 ${pcfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
                            {ann.title}
                          </h4>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 mt-0.5">
                            {timeAgo(ann.postedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                          {ann.body}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                          Posted by {ann.postedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Registrations (1/3) - hidden for AC Admin */}
        {scope.level !== 'centre' && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Recent Registrations</h3>
                </div>
                <button
                  onClick={() => onNavigate?.('members')}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentRegistrations.map((member) => {
                  const sc = MEMBER_STATUS_CFG[member.status];
                  return (
                    <div key={member.id} className="px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(member.name)}`}>
                          {getInitials(member.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {member.activityCentre}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            {getAgeGroupLabel(member.dateOfBirth)}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </div>
                      </div>
                      <p className="ml-11 text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {formatDate(member.registrationDate)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

