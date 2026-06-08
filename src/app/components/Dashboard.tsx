// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Dashboard
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
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
  Percent,
  Award,
} from 'lucide-react';
import { PageHeader } from './hb/listing';
import { StatCard } from './hb/common';
import { mockMembers, MASTERS_CASCADE, getAgeGroupLabel } from '../../mockAPI/membersData';
import { mockEvents } from '../../mockAPI/eventsData';
import { useRoleScope } from '../contexts/RoleScopeContext';

// ── Mock Announcements ────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  body: string;
  postedAt: string;
  priority: 'high' | 'medium' | 'low';
  postedBy: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'National SSV 2026 — Registrations Now Open',
    body: 'The annual Sangh Shiksha Varg 2026 is scheduled for August. All shakha leaders and members are encouraged to register their participants before 15 July 2026.',
    postedAt: '2026-05-20T09:00:00Z',
    priority: 'high',
    postedBy: 'HSS UK National Office',
  },
  {
    id: 'ANN-002',
    title: 'DBS Renewal — Updated Guidance',
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
    postedBy: 'HSS UK National Office',
  },
  {
    id: 'ANN-004',
    title: 'Membership Portal — Scheduled Maintenance',
    body: 'The membership portal will undergo maintenance on 1 June 2026 between 02:00–06:00 BST. Members may experience brief interruptions during this window.',
    postedAt: '2026-05-08T11:00:00Z',
    priority: 'low',
    postedBy: 'IT Operations',
  },
  {
    id: 'ANN-005',
    title: 'New Activity Centre — Birmingham West Now Active',
    body: 'We are pleased to announce that Birmingham West Activity Centre is now fully operational. Shakha activities begin from 1 June 2026.',
    postedAt: '2026-05-05T08:00:00Z',
    priority: 'medium',
    postedBy: 'Regional Coordinator — Midlands',
  },
];

// ── Helpers ───────────────────────────────────────────────────

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
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
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
  active:    { dot: 'bg-emerald-500', label: 'Active',    text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' },
  published: { dot: 'bg-primary-500', label: 'Published', text: 'text-primary-700 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800' },
  draft:     { dot: 'bg-neutral-400', label: 'Draft',     text: 'text-neutral-600 dark:text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700' },
  completed: { dot: 'bg-sky-500',     label: 'Completed', text: 'text-sky-700 dark:text-sky-400',         bg: 'bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800' },
  cancelled: { dot: 'bg-red-500',     label: 'Cancelled', text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' },
};

const PRIORITY_CFG = {
  high:   { icon: AlertCircle, color: 'text-red-500 dark:text-red-400',           bg: 'bg-red-50 dark:bg-red-950/30'     },
  medium: { icon: Clock,       color: 'text-amber-500 dark:text-amber-400',        bg: 'bg-amber-50 dark:bg-amber-950/30'  },
  low:    { icon: Circle,      color: 'text-neutral-400 dark:text-neutral-500',    bg: 'bg-neutral-50 dark:bg-neutral-800' },
};

const MEMBER_STATUS_CFG = {
  active:                     { label: 'Active',            dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  pending:                    { label: 'Pending Approval',  dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400'   },
  'pending-parental-consent': { label: 'Parental Consent',  dot: 'bg-violet-500',  text: 'text-violet-700 dark:text-violet-400' },
  inactive:                   { label: 'Inactive',          dot: 'bg-neutral-400', text: 'text-neutral-500 dark:text-neutral-400' },
  rejected:                   { label: 'Rejected',          dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-400'       },
};

const AGE_GROUP_CHIP = 'bg-[#f1fced] text-[#3d8928] border border-[#b8efa0] dark:bg-[#1a2e14] dark:text-[#86efac] dark:border-[#166534]';

// ── Mock Donations (member view) ──────────────────────────────

const mockMyDonations = [
  { id: 'DON-001', datetime: '2026-05-28T14:32:00', amount: 25.00  },
  { id: 'DON-002', datetime: '2026-04-15T09:15:00', amount: 50.00  },
  { id: 'DON-003', datetime: '2026-03-22T18:47:00', amount: 10.00  },
  { id: 'DON-004', datetime: '2026-02-10T11:05:00', amount: 100.00 },
  { id: 'DON-005', datetime: '2026-01-05T16:20:00', amount: 25.00  },
];

// ── Mock Attendance (member view) ─────────────────────────────

const mockMyAttendance = [
  { id: 'ATT-001', session: 'Shakha — Wembley Activity Centre',     date: '2026-06-01', status: 'present' },
  { id: 'ATT-002', session: 'Shakha — Wembley Activity Centre',     date: '2026-05-25', status: 'present' },
  { id: 'ATT-003', session: 'Youth Leadership Workshop',            date: '2026-05-20', status: 'present' },
  { id: 'ATT-004', session: 'Shakha — Wembley Activity Centre',     date: '2026-05-18', status: 'absent'  },
  { id: 'ATT-005', session: 'Shakha — Wembley Activity Centre',     date: '2026-05-11', status: 'present' },
  { id: 'ATT-006', session: 'Annual Sports Day',                    date: '2026-05-04', status: 'present' },
  { id: 'ATT-007', session: 'Shakha — Wembley Activity Centre',     date: '2026-04-27', status: 'absent'  },
  { id: 'ATT-008', session: 'Bal Vihar — Cultural Evening',        date: '2026-04-20', status: 'present' },
];

// ── Mock current logged-in member ─────────────────────────────

const mockCurrentMember = {
  firstName:          'John',
  lastName:           'Doe',
  shakha:             'Harrow Activity Centre',
  town:               'Harrow',
  vibhaag:            'London & South East',
  sanghResponsibility:'Ghatnayak',
};

// ── Member / Teen Dashboard ────────────────────────────────────

function MemberDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const upcomingEvents = useMemo(
    () => mockEvents
      .filter(e => e.status === 'published' || e.status === 'active')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [],
  );

  const presentCount  = mockMyAttendance.filter(a => a.status === 'present').length;
  const absentCount   = mockMyAttendance.filter(a => a.status === 'absent').length;
  const attendancePct = Math.round((presentCount / mockMyAttendance.length) * 100);
  const highPriority  = mockAnnouncements.filter(a => a.priority === 'high').length;

  return (
    <div className="px-6 py-6">

      {/* Member Identity Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
            {mockCurrentMember.firstName} {mockCurrentMember.lastName}
          </h1>
          <span className="text-neutral-300 dark:text-neutral-600 font-light text-xl leading-tight">|</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 flex-shrink-0" />
              {mockCurrentMember.sanghResponsibility}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 flex-shrink-0" />
              {mockCurrentMember.shakha}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {mockCurrentMember.town}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="flex items-center gap-1">
              <Globe2 className="w-3 h-3 flex-shrink-0" />
              {mockCurrentMember.vibhaag}
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('donate')}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Heart className="w-4 h-4" />
          Donate
        </button>
      </div>

      {/* ── Row 1: Stat cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* My Attendance */}
        <div
          role="button" tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('sessions')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('sessions')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">My Attendance</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{attendancePct}%</p>
              <p className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">Current month</p>
              <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400">
                {presentCount} present · {absentCount} absent
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Upcoming Karyakrams */}
        <div
          role="button" tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('event-management')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('event-management')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Upcoming Karyakrams</p>
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
          role="button" tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('announcements')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('announcements')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Suchana</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{mockAnnouncements.length}</p>
              <p className="text-xs mt-1.5 text-red-600 dark:text-red-400">
                {highPriority} high priority
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* My Donations */}
        <div
          role="button" tabIndex={0}
          className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          onClick={() => onNavigate?.('donate')}
          onKeyDown={e => e.key === 'Enter' && onNavigate?.('donate')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">My Donations</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                £{mockMyDonations.reduce((s, d) => s + d.amount, 0).toFixed(0)}
              </p>
              <p className="text-xs mt-1 text-primary-600 dark:text-primary-400">
                {mockMyDonations.length} donation{mockMyDonations.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Upcoming Karyakrams + My Attendance ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">

        {/* Upcoming Karyakrams list (2/3) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Upcoming Karyakrams</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {upcomingEvents.length}
                </span>
              </div>
              <button onClick={() => onNavigate?.('event-management')} className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">No upcoming events scheduled.</div>
              ) : upcomingEvents.map(event => {
                const cfg = EVENT_STATUS_CFG[event.status] ?? EVENT_STATUS_CFG.draft;
                return (
                  <div key={event.id} className="px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 text-center pt-0.5">
                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400 leading-tight">{new Date(event.startDate).getDate()}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-medium">{new Date(event.startDate).toLocaleString('en-GB', { month: 'short' })}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">{new Date(event.startDate).getFullYear()}</div>
                      </div>
                      <div className="w-px self-stretch bg-neutral-100 dark:bg-neutral-800 my-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{event.name}</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                          <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{formatEventTime(event.startDate)} – {formatEventTime(event.endDate)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.activityCentre}</span>
                          <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" />{event.metrics.participantCount} registered</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {event.paymentType === 'paid'
                          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">£{event.price}</span>
                          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Free</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Attendance list (1/3) */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">My Attendance</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {attendancePct}%
                </span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1 overflow-y-auto">
              {mockMyAttendance.map(att => (
                <div key={att.id} className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{att.session}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{formatDate(att.date)}</p>
                    </div>
                    {att.status === 'present'
                      ? <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Present</span>
                      : <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Absent</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Announcements + Donations ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Announcements (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Suchana</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {mockAnnouncements.length}
                </span>
              </div>
              <button onClick={() => onNavigate?.('announcements')} className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {mockAnnouncements.map(ann => {
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
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">{ann.title}</h4>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 mt-0.5">{timeAgo(ann.postedAt)}</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{ann.body}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">Posted by {ann.postedBy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Donations (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">My Donations</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {mockMyDonations.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1 overflow-y-auto">
              {mockMyDonations.map(don => (
                <div key={don.id} className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {new Date(don.datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="text-neutral-400 dark:text-neutral-500 ml-1">
                        {new Date(don.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      £{don.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Total: <span className="font-semibold text-neutral-900 dark:text-white">£{mockMyDonations.reduce((s, d) => s + d.amount, 0).toFixed(2)}</span>
              </span>
              <button
                onClick={() => onNavigate?.('donate')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Heart className="w-3.5 h-3.5" />
                Donate
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Dashboard Component ───────────────────────────────────────

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {

  const { selectedRole } = useRoleScope();

  // Member (18+) and Teen get a simplified personal dashboard
  const isMemberRole = selectedRole === 'Member (18+)' || selectedRole === 'Teen (13–17)';
  if (isMemberRole) {
    return <MemberDashboard onNavigate={onNavigate} />;
  }

  // Hide org-structure cards that are redundant for the current role's scope
  const hideRegions  = selectedRole === 'Regional Head' || selectedRole === 'Town Head' || selectedRole === 'Activity Centre Admin';
  const hideTowns    = selectedRole === 'Town Head' || selectedRole === 'Activity Centre Admin';
  const hideCentres  = selectedRole === 'Activity Centre Admin';

  // ── Derived KPI values ──────────────────────────────────────

  const totalMembers   = mockMembers.length;
  const activeMembers  = mockMembers.filter(m => m.status === 'active').length;
  const pendingApprovals = mockMembers.filter(
    m => m.status === 'pending' || m.status === 'pending-parental-consent',
  ).length;

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

      {/* ── Page Header ──────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle={`${greeting} — here's what's happening across the network`}
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Dashboard', current: true },
        ]}
      >
        <button
          onClick={() => onNavigate?.('donate')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Heart className="w-4 h-4" />
          Donate
        </button>
      </PageHeader>

      {/* ── Row 1: Org structure KPIs ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Members"
          value={totalMembers}
          icon={Users}
          trend={{ value: `${activeMembers} active · ${pendingApprovals} pending`, positive: true }}
        />
        {!hideRegions && (
          <StatCard
            label="Vibhaag"
            value={regionsCount}
            icon={Globe2}
            trend={{ value: `Across ${MASTERS_CASCADE.countries.length} countries`, positive: true }}
          />
        )}
        {!hideTowns && (
          <StatCard
            label="Nagar"
            value={townsCount}
            icon={MapPin}
            trend={{ value: `Across ${regionsCount} vibhaags`, positive: true }}
          />
        )}
        {!hideCentres && (
          <StatCard
            label="Shakha"
            value={centresCount}
            icon={Building2}
            trend={{ value: `Across ${townsCount} nagars`, positive: true }}
          />
        )}
      </div>

      {/* ── Row 2: Activity KPIs ─────────────────────────── */}
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Upcoming Karyakrams</p>
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Suchana</p>
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Recent Registrations</p>
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">Pending Approvals</p>
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

      {/* ── Section: Upcoming Karyakrams + Pending Approvals ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Upcoming Karyakrams list (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Upcoming Karyakrams</h3>
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
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                              {formatEventTime(event.startDate)} – {formatEventTime(event.endDate)}
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
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
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
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Pending Approvals</h3>
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
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${AGE_GROUP_CHIP} flex-shrink-0`}>
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

      {/* ── Section: Announcements + Recent Registrations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Announcements (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Suchana</h3>
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

        {/* Recent Registrations (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Registrations</h3>
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
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${AGE_GROUP_CHIP}`}>
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
      </div>

    </div>
  );
}
