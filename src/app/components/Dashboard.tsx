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
  ArrowLeft,
  Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { PageHeader } from './hb/listing';
import { StatCard } from './hb/common';
import { mockMembers, MASTERS_CASCADE, getAgeGroupLabel, getAgeGroup, AGE_GROUP_LABELS, RESPONSIBILITY_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import { mockEvents, mockParticipants, type Event as HSSSEvent } from '../../mockAPI/eventsData';
import { mockSessions } from '../../mockAPI/attendanceData';
import { mockDonations, type IncomeStream } from '../../mockAPI/donationsData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, RoleScope } from '../../mockAPI/roleScope';
import { formatDate as sharedFormatDate } from '../../utils/formatDate';
import { getChildProfileSummary } from './MyProfile';

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
  return sharedFormatDate(iso);
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
  active:                     { label: 'Active',            chipCls: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800' },
  pending:                    { label: 'Pending Approval',  chipCls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' },
  'pending-parental-consent': { label: 'Parental Consent',  chipCls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800' },
  inactive:                   { label: 'Inactive',          chipCls: 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800' },
  rejected:                   { label: 'Rejected',          chipCls: 'bg-error-50 text-error-700 border-error-200 dark:bg-error-950 dark:text-error-400 dark:border-error-800' },
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
  vibhag:             'London & South East',
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
  childAccounts = [],
  onSwitchProfile,
  activeChildId = null,
  onBack,
  backLabel,
}: {
  onNavigate?: (page: string) => void;
  onNavigateToEvent?: (eventId: string) => void;
  onNavigateToAnnouncement?: (announcementId: string) => void;
  childAccounts?: { id: string; firstName: string; surname: string }[];
  onSwitchProfile?: (childId: string | null) => void;
  activeChildId?: string | null;
  onBack?: () => void;
  backLabel?: string;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const activeChild = activeChildId ? childAccounts.find(c => c.id === activeChildId) : null;
  const childSummary = activeChildId ? getChildProfileSummary(activeChildId) : null;
  const currentMember = activeChildId
    ? {
        firstName:            childSummary?.firstName || activeChild?.firstName || 'Child',
        lastName:             childSummary?.surname || activeChild?.surname || '',
        memberId:             activeChildId,
        shakha:               childSummary?.activityCentre || '—',
        town:                 childSummary?.town || '—',
        vibhag:               childSummary?.region || '—',
        sanghResponsibility:  '',
        sanghResponsibility2: '',
        joinDate:             mockCurrentMember.joinDate,
        ageGroup:             childSummary?.dateOfBirth ? getAgeGroup(childSummary.dateOfBirth) : 'bal',
        status:               'Active',
      }
    : mockCurrentMember;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);

  const [registerEvent, setRegisterEvent] = useState<HSSSEvent | null>(null);
  const [registerAnswers, setRegisterAnswers] = useState<Record<string, string | boolean | string[]>>({});
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
    a => a.status === 'present' && a.session.includes('Shakha') && !a.session.includes(currentMember.shakha),
  ).length;
  const highPriority  = mockAnnouncements.filter(a => a.priority === 'high').length;

  return (
    <>
    <div className="px-6 py-6">

      {/* Member Identity Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-1 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel || 'Back'}
            </button>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-[32px] font-bold text-neutral-900 dark:text-white leading-tight">
              {currentMember.firstName} {currentMember.lastName}{' '}
              <span className="text-xl font-medium text-neutral-400 dark:text-neutral-500">[{currentMember.memberId}]</span>
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
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.shakha}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Nagar</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.town}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Vibhag</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.vibhag}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Age Category</p>
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">
                      {AGE_GROUP_LABELS[currentMember.ageGroup.toLowerCase() as keyof typeof AGE_GROUP_LABELS] ?? currentMember.ageGroup}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${
                      currentMember.status === 'Active'
                        ? 'bg-success-50 dark:bg-success-950/20 border-success-200 dark:border-success-800'
                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}>
                      <span className={`whitespace-nowrap ${currentMember.status === 'Active' ? 'text-success-700 dark:text-success-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {currentMember.status}
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
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.memberId}</p>
                  </div>
                </div>
                {!activeChildId && (
                <div className="flex items-start gap-1.5 mb-5">
                  <Award className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Responsibilities</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.sanghResponsibility}</p>
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug">{currentMember.sanghResponsibility2}</p>
                    </div>
                  </div>
                </div>
                )}

                {!activeChildId && childAccounts.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">My Children</p>
                      <div className="flex flex-col gap-1.5">
                        {childAccounts.map(child => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => onSwitchProfile?.(child.id)}
                            className="flex items-center justify-between gap-2 text-left rounded-md -mx-1.5 px-1.5 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          >
                            <span className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug truncate">
                              {child.firstName} {child.surname}
                            </span>
                            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                              {child.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-700 dark:bg-error-950 dark:text-error-400 border border-error-200 dark:border-error-800 flex-shrink-0"><XCircle className="w-3 h-3" /> Absent</span>
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
                <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">No upcoming Karyakrams scheduled.</div>
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
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
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
                    <div className="space-y-1.5">
                      {(q.options ?? []).map(opt => {
                        const selected = (registerAnswers[q.id] as string[]) ?? [];
                        const checked = selected.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => setRegisterAnswers(prev => {
                                const cur = (prev[q.id] as string[]) ?? [];
                                const next = e.target.checked ? [...cur, opt] : cur.filter(o => o !== opt);
                                return { ...prev, [q.id]: next };
                              })}
                              className="rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
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
                    return q.type === 'checkbox' ? !Array.isArray(ans) || ans.length === 0 : !ans || !(ans as string).trim();
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

// â”€â”€ Shakha analytics charts â”€â”€ colours/helpers, mirrors KaryakartaReport.tsx's
// established chart styling so the visual language matches the rest of the app.

const CHART_PALETTE = [
  '#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1',
];

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  pending: '#f59e0b',
  'pending-parental-consent': '#8b5cf6',
  inactive: '#9ca3af',
  rejected: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending Approval',
  'pending-parental-consent': 'Parental Consent',
  inactive: 'Inactive',
  rejected: 'Rejected',
};

const AGE_COLORS: Record<AgeGroup, string> = {
  bal:     '#fde68a',
  shishu:  '#fbbf24',
  kishor:  '#f59e0b',
  tarun:   '#d97706',
  yuva:    '#b45309',
  jyestha: '#92400e',
};

const INCOME_COLORS: Record<string, string> = {
  'online-donation': '#3b82f6',
  'cash-income': '#22c55e',
  'standing-order': '#f59e0b',
};
const INCOME_LABELS: Record<string, string> = {
  'online-donation': 'Online Donations',
  'cash-income': 'Cash Income',
  'standing-order': 'Regular Standing Order Payments',
};

const COMPLIANCE_NOT_SET = 'Not Set';

function chartFmt(n: number) { return n.toLocaleString(); }

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? chartFmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, hint, onClick, children }: {
  title: string;
  subtitle?: string;
  hint?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e => e.key === 'Enter' && onClick()) : undefined}
      className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm ${onClick ? 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
        {hint && (
          <div className="group relative flex-shrink-0">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <div className="hidden group-hover:block absolute right-0 top-5 z-10 w-56 p-2.5 rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white text-[11px] leading-relaxed shadow-xl">
              {hint}
            </div>
          </div>
        )}
      </div>
      {children}
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

    // â”€â”€ Chart: Membership Status Breakdown â”€â”€
    const statusOrder: (typeof scopedMembers[number]['status'])[] = ['active', 'pending', 'pending-parental-consent', 'inactive', 'rejected'];
    const statusData = statusOrder
      .map(s => ({ key: s, name: STATUS_LABELS[s], value: scopedMembers.filter(m => m.status === s).length }))
      .filter(d => d.value > 0);

    // â”€â”€ Chart: Age Group Distribution â”€â”€
    const ageOrder: AgeGroup[] = ['bal', 'shishu', 'kishor', 'tarun', 'yuva', 'jyestha'];
    const ageData = ageOrder.map(g => ({
      key: g,
      group: AGE_GROUP_LABELS[g].split(' ')[0],
      count: scopedMembers.filter(m => getAgeGroup(m.dateOfBirth) === g).length,
    }));

    // â”€â”€ Chart: Income Stream Split â”€â”€
    const incomeStreamOrder: IncomeStream[] = ['online-donation', 'cash-income', 'standing-order'];
    const incomeStreamData = incomeStreamOrder
      .map(s => ({ key: s, name: INCOME_LABELS[s], value: receivedDonations.filter(d => d.incomeStream === s).reduce((sum, d) => sum + d.amount, 0) }))
      .filter(d => d.value > 0);

    // â”€â”€ Chart: Monthly Attendance Trend â”€â”€ last 8 Shakhas held, oldest to newest
    const last8Sessions = [...sortedSessions].slice(0, 8).reverse();
    const last8AvgRate = last8Sessions.length
      ? Math.round(last8Sessions.reduce((sum, s) => sum + rateOf(s), 0) / last8Sessions.length) : 0;
    const attendanceTrendData = last8Sessions.map(s => ({
      date: sharedFormatDate(s.date),
      rate: Math.round(rateOf(s)),
      average: last8AvgRate,
      present: s.attendanceRecords.filter(r => r.status === 'present').length,
    }));

    // â”€â”€ Chart: Responsibility Type â”€â”€
    const respTypeData = [...RESPONSIBILITY_TYPE_OPTIONS, COMPLIANCE_NOT_SET]
      .map(t => ({
        key: t,
        name: t,
        value: t === COMPLIANCE_NOT_SET
          ? scopedMembers.filter(m => !m.responsibilityType).length
          : scopedMembers.filter(m => m.responsibilityType === t).length,
      }))
      .filter(d => d.value > 0);

    // â”€â”€ Chart: this Shakha's own recent Sankhya history (Held vs Present) â”€â”€
    // Kept scoped to the admin's own Shakha rather than comparing other centres —
    // a Shakha Admin has no visibility into other centres anywhere else in the app.
    const recentSessionsData = last8Sessions.map(s => ({
      date: sharedFormatDate(s.date),
      held: 1,
      present: s.attendanceRecords.filter(r => r.status === 'present').length,
    }));

    // â”€â”€ Chart: Compliance â€” DBS / First Aid / Safeguarding â”€â”€
    const dbsData = [
      { name: 'Approved', value: scopedMembers.filter(m => m.compliance.dbs === 'Approved').length },
      { name: 'Pending',  value: scopedMembers.filter(m => m.compliance.dbs === 'Pending').length },
    ];
    const firstAidData = [
      { name: 'Certified', value: scopedMembers.filter(m => m.compliance.firstAid === 'Certified').length },
      { name: 'Expired',   value: scopedMembers.filter(m => m.compliance.firstAid === 'Expired').length },
    ];
    const safeguardingData = [
      { name: 'Certified', value: scopedMembers.filter(m => m.compliance.safeguardingTraining === 'Certified').length },
      { name: 'Expired',   value: scopedMembers.filter(m => m.compliance.safeguardingTraining === 'Expired').length },
    ];

    return {
      avgLast4, avgYTD, sessionsHeldYTD,
      suchanaActive, suchanaHigh,
      allUpcoming: allUpcomingList.length, allUpcomingActive, allUpcomingPublished,
      pendingApprovals: pendingApprovals.length, pendingParental,
      karyakartas,
      totalIncome, onlineTotal, cashTotal, giftAidClaimable,
      firstAiders, dbsApproved, safeguarding,
      gbp,
      statusData, ageData, incomeStreamData, attendanceTrendData, respTypeData,
      recentSessionsData, dbsData, firstAidData, safeguardingData,
    };
  }, [scope]);

  return (
    <div className="mb-8">
      {/* â”€â”€ Analytics charts â”€â”€ same layout for every admin role; the underlying
          queries are scoped via filterByScope(scope), so a national-level admin
          sees org-wide data while a Shakha Admin sees just their own centre. */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Membership Status Breakdown */}
          <ChartCard
            title="Membership Status Breakdown"
            subtitle="Distribution of members by current status"
            onClick={() => onNavigate?.('members')}
          >
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={kpis.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {kpis.statusData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.key]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {kpis.statusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[d.key] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white flex-shrink-0">{chartFmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Monthly Attendance Trend */}
          <ChartCard
            title="Monthly Attendance Trend"
            subtitle="Shakhas and attendance rate over time"
            hint="Shows the last 8 Shakhas held. The line is the attendance rate for each Shakha; the flat reference line is the average across those 8. Hover a point to see the exact rate."
            onClick={() => onNavigate?.('attendance-log')}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpis.attendanceTrendData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="rate" name="Attendance Rate %" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="average" name="Average %" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Age Group Distribution */}
          <ChartCard
            title="Age Group Distribution"
            subtitle="Members across HSS age groups"
            onClick={() => onNavigate?.('members')}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpis.ageData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Members" radius={[4, 4, 0, 0]}>
                  {kpis.ageData.map((entry, i) => <Cell key={i} fill={AGE_COLORS[entry.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Responsibility Type */}
          <ChartCard
            title="Responsibility Type"
            subtitle="Pramukh / Pramukh (Saha) / Toli breakdown"
            hint="Shows the different Karyakarta responsibilities held in the Shakha."
            onClick={() => onNavigate?.('karyakartas')}
          >
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={kpis.respTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {kpis.respTypeData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {kpis.respTypeData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white flex-shrink-0">{chartFmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Income Stream Split */}
          <ChartCard
            title="Income Stream Split"
            subtitle="Online donations, cash income and regular standing order payments"
            onClick={() => onNavigate?.('report-donations')}
          >
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={kpis.incomeStreamData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {kpis.incomeStreamData.map((d, i) => <Cell key={i} fill={INCOME_COLORS[d.key]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} formatter={(v: number) => kpis.gbp(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {kpis.incomeStreamData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: INCOME_COLORS[d.key] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white flex-shrink-0">{kpis.gbp(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Recent Sankhya history + Compliance box */}
          <ChartCard
            title="Recent Shakhas"
            subtitle="Held vs present, last 8 Shakhas at this centre"
            onClick={() => onNavigate?.('compliance')}
          >
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={kpis.recentSessionsData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="held" name="Shakha" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-4 mb-2">
              Compliance — Certified vs Expired/Pending
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'DBS', data: kpis.dbsData },
                { label: 'First Aid', data: kpis.firstAidData },
                { label: 'Safeguarding', data: kpis.safeguardingData },
              ].map((box, i) => (
                <div key={i}>
                  <p className="text-[10px] text-center text-neutral-500 dark:text-neutral-400 mb-1">{box.label}</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={box.data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#6b7280' }} interval={0} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                        {box.data.map((d, j) => <Cell key={j} fill={d.name === 'Approved' || d.name === 'Certified' ? '#22c55e' : '#f59e0b'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </ChartCard>

      </div>
    </div>
  );
}

// â”€â”€ Shakha Admin Dashboard â”€â”€ Sankhya trend, Sankhya by Ayu Shreni, and
// clickable approval/compliance info boxes. Replaces HierarchyKpiSection's
// generic panels for the Shakha Admin role only.

function ShakhaAdminDashboard({
  scope,
  onNavigate,
}: {
  scope: RoleScope;
  onNavigate?: (page: string) => void;
}) {
  const kpis = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const scopedMembers = filterByScope(mockMembers, scope);
    const scopedMemberIds = new Set(scopedMembers.map(m => m.id));

    const rollingSessions = filterByScope(mockSessions, scope)
      .filter(s => s.status === 'completed' && new Date(s.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // â”€â”€ Panel 1: Sankhya - Rolling 3 months (total / average / male / female) â”€â”€
    const sankhyaRaw = rollingSessions.map(s => {
      const present = s.attendanceRecords.filter(r => r.status === 'present');
      return {
        date: sharedFormatDate(s.date),
        total: present.length,
        male: present.filter(r => r.gender === 'male').length,
        female: present.filter(r => r.gender === 'female').length,
      };
    });
    const avgTotal = sankhyaRaw.length
      ? Math.round(sankhyaRaw.reduce((sum, d) => sum + d.total, 0) / sankhyaRaw.length) : 0;
    const sankhyaTrendData = sankhyaRaw.map(d => ({ ...d, average: avgTotal }));

    // â”€â”€ Panel 2: Sankhya by Ayu Shreni - Rolling 3 months (average male/female) â”€â”€
    const ageOrder: AgeGroup[] = ['shishu', 'bal', 'kishor', 'tarun', 'yuva', 'jyestha'];
    const sessionCount = rollingSessions.length || 1;
    const ageGroupAvgData = ageOrder.map(g => {
      const maleTotal = rollingSessions.reduce((sum, s) =>
        sum + s.attendanceRecords.filter(r => r.status === 'present' && r.ageCategory === g && r.gender === 'male').length, 0);
      const femaleTotal = rollingSessions.reduce((sum, s) =>
        sum + s.attendanceRecords.filter(r => r.status === 'present' && r.ageCategory === g && r.gender === 'female').length, 0);
      return {
        key: g,
        group: AGE_GROUP_LABELS[g].split(' ')[0],
        male: Math.round(maleTotal / sessionCount),
        female: Math.round(femaleTotal / sessionCount),
      };
    });

    // â”€â”€ Panel 3: member registrations pending Karyawaha approval â”€â”€
    const pendingMemberApprovals = scopedMembers.filter(m => m.status === 'pending').length;

    // â”€â”€ Panel 4: karyakram registrations pending Karyawaha approval â”€â”€
    let pendingEventApprovals = 0;
    mockEvents.forEach(e => {
      (mockParticipants[e.id] ?? []).forEach(p => {
        if (p.rsvp === 'requested' && scopedMemberIds.has(p.memberId)) pendingEventApprovals++;
      });
    });

    // â”€â”€ Panel 5: Compliance â€” DBS / First Aid â”€â”€
    const dbsApproved    = scopedMembers.filter(m => m.compliance.dbs === 'Approved').length;
    const dbsPending     = scopedMembers.filter(m => m.compliance.dbs === 'Pending').length;
    const faCertified    = scopedMembers.filter(m => m.compliance.firstAid === 'Certified').length;
    const faExpired      = scopedMembers.filter(m => m.compliance.firstAid === 'Expired').length;

    return {
      sankhyaTrendData, ageGroupAvgData,
      pendingMemberApprovals, pendingEventApprovals,
      dbsApproved, dbsPending, faCertified, faExpired,
    };
  }, [scope]);

  return (
    <div className="mb-8">
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel 1: Sankhya - Rolling 3 months (top left) */}
        <ChartCard
          title="Sankhya - Rolling 3 months"
          subtitle="Shakhas held in the last 3 months - total, average, male and female Sankhya"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={kpis.sankhyaTrendData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="total"   name="Sankhya" stroke="#172E4D" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="average" name="Average" stroke="#f59e0b" strokeWidth={2}   strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="male"    name="Male"    stroke="#3b82f6" strokeWidth={2}   dot={{ r: 3 }} />
              <Line type="monotone" dataKey="female"  name="Female"  stroke="#ec4899" strokeWidth={2}   dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Panel 2: Sankhya by Ayu Shreni - Rolling 3 months (top right) */}
        <ChartCard
          title="Sankhya by Ayu Shreni - Rolling 3 months"
          subtitle="Average Sankhya per age group over the last 3 months, split by gender"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={kpis.ageGroupAvgData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="male"   name="Male"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="female" name="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Row 2: clickable info boxes */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Panel 3: pending member registrations */}
        <KpiCard
          title="Pending Karyawaha Approvals"
          value={kpis.pendingMemberApprovals}
          icon={UserPlus}
          subMetrics={[{ label: 'Member registrations awaiting approval', value: kpis.pendingMemberApprovals }]}
          onClick={() => onNavigate?.('pending-approvals')}
        />

        {/* Panel 4: pending karyakram registrations */}
        <KpiCard
          title="Karyakram Registrations Pending Approval"
          value={kpis.pendingEventApprovals}
          icon={CalendarDays}
          subMetrics={[{ label: 'Registrations awaiting approval', value: kpis.pendingEventApprovals }]}
          onClick={() => onNavigate?.('event-management')}
        />

        {/* Panel 5: Compliance - DBS / First Aid */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate?.('compliance')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('compliance')}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-neutral-600 dark:text-neutral-400">Compliance</p>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">DBS</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{kpis.dbsApproved}</span>
                <span className="text-neutral-500 dark:text-neutral-400">Approved</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="font-bold text-amber-600 dark:text-amber-400">{kpis.dbsPending}</span>
                <span className="text-neutral-500 dark:text-neutral-400">Pending</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">First Aid</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{kpis.faCertified}</span>
                <span className="text-neutral-500 dark:text-neutral-400">Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="font-bold text-red-600 dark:text-red-400">{kpis.faExpired}</span>
                <span className="text-neutral-500 dark:text-neutral-400">Expired</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// â”€â”€ Dashboard Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DashboardProps {
  onNavigate?: (page: string) => void;
  onNavigateToEvent?: (eventId: string) => void;
  onNavigateToAnnouncement?: (announcementId: string) => void;
  childAccounts?: { id: string; firstName: string; surname: string }[];
  onSwitchProfile?: (childId: string | null) => void;
  activeChildId?: string | null;
  onBack?: () => void;
  backLabel?: string;
}

export default function Dashboard({ onNavigate, onNavigateToEvent, onNavigateToAnnouncement, childAccounts = [], onSwitchProfile, activeChildId = null, onBack, backLabel }: DashboardProps) {

  const { selectedRole, scope } = useRoleScope();

  // Member (18+) and Teen get a simplified personal dashboard
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  if (isMemberRole) {
    return (
      <MemberDashboard
        onNavigate={onNavigate}
        onNavigateToEvent={onNavigateToEvent}
        onNavigateToAnnouncement={onNavigateToAnnouncement}
        childAccounts={childAccounts}
        onSwitchProfile={onSwitchProfile}
        activeChildId={activeChildId}
        onBack={onBack}
        backLabel={backLabel}
      />
    );
  }

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
            ? `Nagar: ${scope.town} · Vibhag: ${scope.region}`
            : scope.town && !scope.centre
              ? `Vibhag: ${scope.region}`
              : scope.region && !scope.town
                ? `Country: ${scope.country}`
                : scope.country && !scope.region
                  ? undefined
                  : `${greeting} - here's what's happening across the network`
        }
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Dashboard', current: true },
        ]}
      >
      </PageHeader>

      {/* Shakha Admin gets its own Sankhya-focused dashboard; every other admin
          role keeps the generic HierarchyKpiSection panels. Both are scoped via
          filterByScope(scope). */}
      {selectedRole === 'Shakha Admin' ? (
        <ShakhaAdminDashboard scope={scope} onNavigate={onNavigate} />
      ) : (
        <HierarchyKpiSection scope={scope} onNavigate={onNavigate} />
      )}

    </div>
  );
}
