import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User as UserIcon,
  Users as UsersIcon,
  Clock,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Edit,
  Play,
  Trash2,
  MapPin,
  CreditCard,
  AlertTriangle,
  Mail,
  Phone,
  Upload,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { SecondaryButton } from './hb/listing';
import { StatCard } from './hb/common/StatCard';
import {
  Event,
  EventParticipant,
  EventMedia,
  mockParticipants,
  mockMediaPosts,
} from '../../mockAPI/eventsData';
import { mockMembers, getAgeGroupLabel } from '../../mockAPI/membersData';
import { toast } from 'sonner';

// ─── Age group display labels (matches HSS naming convention) ─────────────────
const AUDIENCE_AGE_LABELS: Record<string, string> = {
  bal:     'Bal(ika) (0-5)',
  shishu:  'Shishu (6-11)',
  kishor:  'Kishor(i) (12-16)',
  tarun:   'Tarun(i) (17-30)',
  yuva:    'Yuva(ti) (30-60)',
  jyestha: 'Jyestha(a) (60+)',
};

// ─── Cutoff helpers ────────────────────────────────────────────────────────────
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);
const canModify   = (event: Event) => !isPastStart(event);
const canDelete   = (event: Event) => !isPastStart(event) && event.status !== 'completed';

// ─── Gradient palette (used when no imageUrl present) ─────────────────────────
const MEDIA_GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-orange-400 to-red-500',
  'from-green-400 to-emerald-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-indigo-400 to-violet-600',
];

// ─── Lightbox image URL: real HSS images are already full-size ───────────────
const fullsizeUrl = (url: string) => url;

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Event['status'] }) {
  const map: Record<Event['status'], { bg: string; text: string; dot: string; label: string }> = {
    draft:     { bg: 'bg-neutral-50 dark:bg-neutral-900',    text: 'text-neutral-600 dark:text-neutral-400',  dot: 'bg-neutral-400',  label: 'Draft'     },
    published: { bg: 'bg-blue-50 dark:bg-blue-950/20',       text: 'text-blue-700 dark:text-blue-400',        dot: 'bg-blue-500',     label: 'Published' },
    active:    { bg: 'bg-success-50 dark:bg-success-950/20', text: 'text-success-700 dark:text-success-400',  dot: 'bg-success-500',  label: 'Active'    },
    cancelled: { bg: 'bg-error-50 dark:bg-error-950/20',     text: 'text-error-700 dark:text-error-400',      dot: 'bg-error-500',    label: 'Cancelled' },
    completed: { bg: 'bg-amber-50 dark:bg-amber-950/20',     text: 'text-amber-700 dark:text-amber-400',      dot: 'bg-amber-500',    label: 'Completed' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-transparent ${s.bg} ${s.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className="text-xs font-medium">{s.label}</span>
    </span>
  );
}

// ─── RSVP badge ────────────────────────────────────────────────────────────────
function RsvpBadge({ rsvp }: { rsvp: EventParticipant['rsvp'] }) {
  const map = {
    going:    { bg: 'bg-success-50 dark:bg-success-950/20', text: 'text-success-700 dark:text-success-400', dot: 'bg-success-500', label: 'Going'     },
    maybe:    { bg: 'bg-primary-50 dark:bg-primary-950/20', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500', label: 'Maybe'     },
    notGoing: { bg: 'bg-neutral-50 dark:bg-neutral-900',    text: 'text-neutral-600 dark:text-neutral-400', dot: 'bg-neutral-400', label: 'Not Going' },
  };
  const s = map[rsvp];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-transparent ${s.bg} ${s.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className="text-xs font-medium">{s.label}</span>
    </span>
  );
}

// ─── Member type badge ─────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: EventParticipant['memberType'] }) {
  const map = {
    adult: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
    teen:  'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400',
    child: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[type]}`}>
      {type}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab         = 'overview' | 'participants' | 'media';
type RsvpFilter  = 'all' | 'going' | 'maybe' | 'notGoing';
type MediaFilter = 'all' | 'image' | 'video';

interface LightboxState {
  memberId: string;
  memberName: string;
  currentIndex: number; // index within that user's media list
}

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onModify: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onViewMember?: (memberId: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EventDetail({
  event,
  onBack,
  onModify,
  onCancel,
  onDelete,
  onViewMember,
}: EventDetailProps) {

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const past                   = isPastStart(event);
  const modifyOk               = canModify(event);
  const deleteOk               = canDelete(event);
  const isCancelledOrCompleted = event.status === 'cancelled' || event.status === 'completed';

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Participants ────────────────────────────────────────────────────────────
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('all');
  const allParticipants = mockParticipants[event.id] ?? [];
  const goingList       = allParticipants.filter(p => p.rsvp === 'going');
  const maybeList       = allParticipants.filter(p => p.rsvp === 'maybe');
  const notGoingList    = allParticipants.filter(p => p.rsvp === 'notGoing');
  const filteredParticipants =
    rsvpFilter === 'all'      ? allParticipants :
    rsvpFilter === 'going'    ? goingList :
    rsvpFilter === 'maybe'    ? maybeList :
                                notGoingList;

  // ── Export participants as CSV ─────────────────────────────────────────────
  const handleExportParticipants = () => {
    if (!filteredParticipants.length) { toast.error('No participants to export.'); return; }

    const headers = [
      'Member ID', 'Name', 'Age Groups (years old)', 'Gender', 'Date of Birth',
      'Email', 'Secondary Email', 'Primary Contact Number', 'Secondary Contact Number',
      'Building Name', 'Address Line 1', 'Address Line 2', 'Town / City', 'Post Code',
      'Country', 'Vibhaag', 'Nagar', 'Shakha',
      'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Email', 'Emergency Relationship',
      'Guardian Name', 'Guardian Email', 'Guardian Phone',
      'Medical Info Declared', 'First Aider', 'Dietary Requirements',
      'Occupation', 'Originating State (India)', 'DBS Status', 'First Aid Status',
      'Member Status', 'Registration Date',
      'RSVP', 'Participant Type',
    ];

    const rsvpLabel = (r: EventParticipant['rsvp']) =>
      r === 'going' ? 'Going' : r === 'maybe' ? 'Maybe' : 'Not Going';

    const escape = (v: string | undefined | null) =>
      `"${(v ?? '').toString().replace(/"/g, '""')}"`;

    const rows = filteredParticipants.map(p => {
      const m = mockMembers.find(mem => mem.id === p.memberId);
      return [
        p.memberId,
        escape(p.name),
        escape(m ? getAgeGroupLabel(m.dateOfBirth) : ''),
        escape(m?.gender ?? ''),
        escape(m ? new Date(m.dateOfBirth).toLocaleDateString('en-GB') : ''),
        escape(p.email),
        escape(m?.secondaryEmail ?? ''),
        escape(p.phone),
        escape(m?.secondaryPhone ?? ''),
        escape(m?.buildingName ?? ''),
        escape(m?.addressLine1 ?? ''),
        escape(m?.addressLine2 ?? ''),
        escape(m?.contactTownCity ?? ''),
        escape(m?.postCode ?? ''),
        escape(m?.country ?? ''),
        escape(m?.region ?? ''),
        escape(m?.town ?? ''),
        escape(m?.activityCentre ?? ''),
        escape(m?.emergencyContactName ?? ''),
        escape(m?.emergencyContactPhone ?? ''),
        escape(m?.emergencyContactEmail ?? ''),
        escape(m?.emergencyContactRelationship ?? ''),
        escape(m?.guardianName ?? ''),
        escape(m?.guardianEmail ?? ''),
        escape(m?.guardianPhone ?? ''),
        escape(m?.medicalInfoDeclared ?? ''),
        m?.isFirstAider ? 'Yes' : 'No',
        escape(Array.isArray(m?.dietaryRequirements) ? m.dietaryRequirements.join('; ') : (m?.dietaryRequirements ?? '')),
        escape(m?.occupation ?? ''),
        escape(m?.originatingStateIndia ?? ''),
        escape(m?.compliance?.dbs ?? ''),
        escape(m?.compliance?.firstAid ?? ''),
        escape(m?.status ?? ''),
        m ? new Date(m.registrationDate).toLocaleDateString('en-GB') : '',
        rsvpLabel(p.rsvp),
        p.memberType.charAt(0).toUpperCase() + p.memberType.slice(1),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${event.id}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filteredParticipants.length} participant${filteredParticipants.length !== 1 ? 's' : ''} exported successfully.`);
  };

  // ── Media list (local, starts from mock) ───────────────────────────────────
  const [mediaPosts, setMediaPosts]         = useState<EventMedia[]>(mockMediaPosts[event.id] ?? []);
  const [mediaFilter, setMediaFilter]       = useState<MediaFilter>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType]         = useState<'image' | 'video'>('image');
  const [uploadCaption, setUploadCaption]   = useState('');
  const [uploadAuthor, setUploadAuthor]     = useState('');
  const [uploadFiles, setUploadFiles]       = useState<File[]>([]);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  const imagePosts    = mediaPosts.filter(m => m.type === 'image');
  const videoPosts    = mediaPosts.filter(m => m.type === 'video');
  const filteredMedia =
    mediaFilter === 'image' ? imagePosts :
    mediaFilter === 'video' ? videoPosts :
    mediaPosts;

  // Stable gradient keyed to a post's position in the full list
  const getGradient = (mediaId: string) => {
    const idx = mediaPosts.findIndex(m => m.id === mediaId);
    return MEDIA_GRADIENTS[(idx >= 0 ? idx : 0) % MEDIA_GRADIENTS.length];
  };

  // ── Upload handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(Array.from(e.target.files ?? []));
  };

  const cancelUpload = () => {
    setShowUploadForm(false);
    setUploadCaption('');
    setUploadAuthor('');
    setUploadFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostMedia = () => {
    const author  = uploadAuthor.trim() || 'Admin';
    const caption = uploadCaption.trim() || undefined;
    const count   = uploadFiles.length || 1;
    const now     = Date.now();

    const newPosts: EventMedia[] = Array.from({ length: count }, (_, i) => ({
      id: `MED-NEW-${now}-${i}`,
      memberId: '',
      memberName: author,
      type: uploadType,
      caption: caption ?? (uploadFiles[i] ? uploadFiles[i].name.replace(/\.[^/.]+$/, '') : undefined),
      postedAt: new Date(now + i * 1000).toISOString(),
    }));

    setMediaPosts(prev => [...newPosts, ...prev]);
    cancelUpload();
    toast.success(`${count} ${count === 1 ? 'item' : 'items'} posted successfully.`);
  };

  // ── Lightbox ────────────────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const getLightboxItems = (memberId: string) =>
    mediaPosts.filter(m => m.memberId === memberId);

  const openLightbox = (m: EventMedia) => {
    const items = getLightboxItems(m.memberId);
    const idx   = items.findIndex(i => i.id === m.id);
    setLightbox({ memberId: m.memberId, memberName: m.memberName, currentIndex: Math.max(0, idx) });
  };

  const closeLightbox = () => setLightbox(null);

  const lightboxItems  = lightbox ? getLightboxItems(lightbox.memberId) : [];
  const currentMedia   = lightbox ? lightboxItems[lightbox.currentIndex] ?? null : null;
  const lightboxTotal  = lightboxItems.length;

  const prevSlide = () =>
    setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex - 1 + lightboxTotal) % lightboxTotal } : null);

  const nextSlide = () =>
    setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex + 1) % lightboxTotal } : null);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const count = getLightboxItems(lightbox.memberId).length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex - 1 + count) % count } : null);
      if (e.key === 'ArrowRight') setLightbox(p => p ? { ...p, currentIndex: (p.currentIndex + 1) % count } : null);
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  // ── Button style helpers ────────────────────────────────────────────────────
  const btnBase     = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  const btnGhost    = `${btnBase} border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800`;
  const btnDanger   = `${btnBase} border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20`;
  const btnWarn     = `${btnBase} border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-white dark:bg-neutral-900 hover:bg-amber-50 dark:hover:bg-amber-950/20`;
  const btnDisabled = `${btnBase} border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-60`;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',     label: 'Event Overview'                           },
    { id: 'participants', label: `Participants (${allParticipants.length})` },
    { id: 'media',        label: `Media (${mediaPosts.length})`             },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">{event.name}</h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-sm text-neutral-500 font-mono">{event.id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                <div className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /><span>Host: {event.host}</span></div>
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><span>{event.activityCentre} · {event.town} · {event.region} · {event.country}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatDateTime(event.startDate)}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={event.status} />
                {event.paymentType === 'paid' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 text-xs font-medium">
                    <CreditCard className="w-3 h-3" /> Paid{event.price ? ` · £${event.price}` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-medium">Free</span>
                )}
                {event.capacity && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs">
                    <UsersIcon className="w-3 h-3" /> Cap: {event.capacity}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Events</SecondaryButton>
              {modifyOk ? (
                <button className={btnGhost} onClick={onModify}><Edit className="w-3.5 h-3.5" /> Modify</button>
              ) : (
                <button className={btnDisabled} title="This event can no longer be edited after it starts." disabled><Edit className="w-3.5 h-3.5" /> Modify</button>
              )}
              {!isCancelledOrCompleted && (
                <button className={btnWarn} onClick={onCancel}><XCircle className="w-3.5 h-3.5" /> Cancel Event</button>
              )}
              {deleteOk ? (
                <button className={btnDanger} onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              ) : (
                <button className={btnDisabled} title={event.status === 'completed' ? 'Completed events cannot be deleted.' : 'This event can no longer be deleted after it starts.'} disabled>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>

          {past && !isCancelledOrCompleted && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>This event has already started. Modify and Delete actions are locked.</span>
            </div>
          )}
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Tabs */}
          <div className="flex-1 lg:w-[70%] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col">

            {/* Tab bar */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
              <div className="flex px-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6 bg-white dark:bg-neutral-950 flex-1">

              {/* ── EVENT OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Going"     value={event.metrics.going}    icon={CheckCircle2} valueClassName="text-success-600 dark:text-success-400" className="bg-neutral-50 dark:bg-neutral-900/50" />
                    <StatCard label="Maybe"     value={event.metrics.maybe}    icon={HelpCircle}   valueClassName="text-primary-600 dark:text-primary-400"  className="bg-neutral-50 dark:bg-neutral-900/50" />
                    <StatCard label="Not Going" value={event.metrics.notGoing} icon={XCircle}      className="bg-neutral-50 dark:bg-neutral-900/50" />
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Event Description
                      </h4>
                      <p className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  )}

                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">Event Summary</h4>
                    <div className="px-6 pb-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        { label: 'Event ID',        value: event.id,           mono: true  },
                        { label: 'Event Title',     value: event.name                      },
                        { label: 'Country',         value: event.country                   },
                        { label: 'Vibhaag',         value: event.region                    },
                        { label: 'Nagar',           value: event.town                      },
                        { label: 'Shakha',          value: event.activityCentre            },
                        { label: 'Start Date/Time', value: formatDateTime(event.startDate) },
                        { label: 'End Date/Time',   value: formatDateTime(event.endDate)   },
                        { label: 'Payment Type',    value: event.paymentType === 'paid' ? `Paid${event.price ? ` · £${event.price}` : ''}` : 'Free' },
                        ...(event.capacity ? [{ label: 'Capacity', value: String(event.capacity) }] : []),
                      ].map(({ label, value, mono }) => (
                        <div key={label}>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">{label}</label>
                          <p className={`text-sm text-neutral-900 dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  {(event.filterAgeCategories?.length || event.filterGenders?.length || event.filterJobTitles?.length) ? (
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        Target Audience
                      </h4>
                      <div className="px-6 py-4 space-y-4">
                        {event.filterAgeCategories && event.filterAgeCategories.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Age Category</p>
                            <div className="flex flex-wrap gap-1.5">
                              {event.filterAgeCategories.map(c => (
                                <span key={c} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 text-xs font-medium">
                                  {AUDIENCE_AGE_LABELS[c] ?? c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.filterGenders && event.filterGenders.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Gender</p>
                            <div className="flex flex-wrap gap-1.5">
                              {event.filterGenders.map(g => (
                                <span key={g} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 text-xs font-medium capitalize">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.filterJobTitles && event.filterJobTitles.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Role Type / Job Title</p>
                            <div className="flex flex-wrap gap-1.5">
                              {event.filterJobTitles.map(r => (
                                <span key={r} className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg px-6 py-4">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Target Audience:</span> All members (no filters applied)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── PARTICIPANTS ── */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {([
                        { id: 'all',      label: 'All',       count: allParticipants.length },
                        { id: 'going',    label: 'Going',     count: goingList.length       },
                        { id: 'maybe',    label: 'Maybe',     count: maybeList.length       },
                        { id: 'notGoing', label: 'Not Going', count: notGoingList.length    },
                      ] as { id: RsvpFilter; label: string; count: number }[]).map(f => (
                        <button
                          key={f.id}
                          onClick={() => setRsvpFilter(f.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            rsvpFilter === f.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {f.label}
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                            rsvpFilter === f.id ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                          }`}>{f.count}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleExportParticipants}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Export Participants
                    </button>
                  </div>
                  {filteredParticipants.length > 0 ? (
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                            {['#','Name','Member ID','Email','Phone','Type','RSVP'].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {filteredParticipants.map((p, idx) => (
                            <tr key={p.memberId} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                              <td className="px-4 py-3 text-xs text-neutral-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => onViewMember?.(p.memberId)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 text-left">{p.name}</button>
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">{p.memberId}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                  <Mail className="w-3 h-3 flex-shrink-0 text-neutral-400" /><span className="truncate max-w-[160px]">{p.email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {p.phone ? (
                                  <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Phone className="w-3 h-3 flex-shrink-0 text-neutral-400" /><span>{p.phone}</span>
                                  </div>
                                ) : <span className="text-xs text-neutral-400">—</span>}
                              </td>
                              <td className="px-4 py-3"><TypeBadge type={p.memberType} /></td>
                              <td className="px-4 py-3"><RsvpBadge rsvp={p.rsvp} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <UsersIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No participants in this category</p>
                      <p className="text-xs text-neutral-400 mt-1">Try switching to a different RSVP filter above.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── MEDIA ── */}
              {activeTab === 'media' && (
                <div className="space-y-4">

                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Media Feed</h3>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {mediaPosts.length} {mediaPosts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUploadForm(v => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Media
                    </button>
                  </div>

                  {/* Upload form */}
                  {showUploadForm && (
                    <div className="border border-primary-200 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-950/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Post Media</h4>
                        <button onClick={cancelUpload} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-4 h-4" /></button>
                      </div>

                      {/* Type + Author */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Media Type</label>
                          <div className="flex gap-2">
                            {(['image', 'video'] as const).map(t => (
                              <label key={t} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 justify-center ${
                                uploadType === t
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                              }`}>
                                <input type="radio" name="uploadMediaType" value={t} checked={uploadType === t} onChange={() => { setUploadType(t); setUploadFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="sr-only" />
                                {t === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                                <span className="text-xs font-medium capitalize">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Posted by</label>
                          <input
                            type="text"
                            value={uploadAuthor}
                            onChange={e => setUploadAuthor(e.target.value)}
                            placeholder="Admin"
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                          Caption <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={uploadCaption}
                          onChange={e => setUploadCaption(e.target.value)}
                          placeholder="Add a caption..."
                          rows={2}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Drop zone */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-700 rounded-xl p-6 text-center cursor-pointer transition-colors"
                        >
                          {uploadFiles.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                {uploadFiles.length} {uploadFiles.length === 1 ? 'file' : 'files'} selected
                              </p>
                              <p className="text-xs text-neutral-400 max-w-xs truncate">
                                {uploadFiles.slice(0, 2).map(f => f.name).join(', ')}
                                {uploadFiles.length > 2 ? ` +${uploadFiles.length - 2} more` : ''}
                              </p>
                              <button
                                onClick={e => { e.stopPropagation(); setUploadFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-xs text-error-600 dark:text-error-400 hover:underline mt-1"
                              >
                                Clear selection
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              {uploadType === 'image' ? <ImageIcon className="w-7 h-7 text-neutral-400" /> : <Video className="w-7 h-7 text-neutral-400" />}
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="text-primary-600 dark:text-primary-400 font-medium">Click to select</span> or drag and drop
                              </p>
                              <p className="text-xs text-neutral-400">
                                {uploadType === 'image' ? 'JPG, PNG, GIF, WEBP · multiple files supported' : 'MP4, MOV, AVI, WEBM · up to 100 MB each'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                        <button onClick={cancelUpload} className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={handlePostMedia}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Post{uploadFiles.length > 1 ? ` ${uploadFiles.length} Items` : ' Media'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {([
                      { id: 'all',   label: 'All',    count: mediaPosts.length, icon: null    },
                      { id: 'image', label: 'Images', count: imagePosts.length, icon: 'image' },
                      { id: 'video', label: 'Videos', count: videoPosts.length, icon: 'video' },
                    ] as { id: MediaFilter; label: string; count: number; icon: string | null }[]).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setMediaFilter(f.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          mediaFilter === f.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {f.icon === 'image' && <ImageIcon className="w-3 h-3" />}
                        {f.icon === 'video' && <Video className="w-3 h-3" />}
                        {f.label}
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                          mediaFilter === f.id ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}>{f.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Media grid */}
                  {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMedia.map(m => {
                        const grad     = getGradient(m.id);
                        const initials = m.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const userCount = mediaPosts.filter(p => p.memberId === m.memberId).length;
                        return (
                          <div key={m.id} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-md dark:hover:shadow-neutral-900/60 transition-shadow group">

                            {/* Thumbnail — click to open lightbox */}
                            <div
                              className="relative aspect-video overflow-hidden cursor-pointer"
                              onClick={() => openLightbox(m)}
                            >
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.caption ?? 'Media'}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                                  {m.type === 'image' && <ImageIcon className="w-8 h-8 text-white/40" />}
                                </div>
                              )}

                              {/* Darken overlay on hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                              {/* Video play overlay */}
                              {m.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${m.imageUrl ? 'bg-black/50' : 'bg-black/30 backdrop-blur-sm'}`}>
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              )}

                              {/* Type badge */}
                              <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                                {m.type === 'video' ? <><Video className="w-2.5 h-2.5" /> Video</> : <><ImageIcon className="w-2.5 h-2.5" /> Photo</>}
                              </span>

                              {/* User's total count badge */}
                              {userCount > 1 && (
                                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-semibold backdrop-blur-sm">
                                  <ImageIcon className="w-2.5 h-2.5" /> {userCount}
                                </span>
                              )}
                            </div>

                            {/* Card body */}
                            <div className="p-3">
                              {m.caption && (
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2.5 line-clamp-2 leading-relaxed">{m.caption}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-[9px] font-bold text-white leading-none">{initials}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  {m.memberId && onViewMember ? (
                                    <button onClick={() => onViewMember(m.memberId)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 truncate block text-left w-full">
                                      {m.memberName}
                                    </button>
                                  ) : (
                                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{m.memberName}</p>
                                  )}
                                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                    {new Date(m.postedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Camera className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No media posts yet</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {mediaFilter !== 'all'
                          ? `No ${mediaFilter}s have been posted for this event.`
                          : 'Upload the first image or video using the button above.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="lg:w-[30%] space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">Host Information</h4>
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                    {event.host.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{event.host}</p>
                    <p className="text-xs text-neutral-500">Primary Host</p>
                  </div>
                </div>
                {event.coHosts.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Co-Hosts</label>
                    <div className="flex flex-wrap gap-2">
                      {event.coHosts.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">Event Configuration</h4>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Payment Type</span>
                  <span className="text-xs font-medium text-neutral-900 dark:text-white capitalize">{event.paymentType}</span>
                </div>
                {event.price !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Price</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-white">£{event.price}</span>
                  </div>
                )}
                {event.capacity !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Capacity</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-white">{event.capacity} people</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-3">HSS (UK) Setup Scope</label>
              <div className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                {[['Country', event.country], ['Vibhaag', event.region], ['Nagar', event.town], ['Shakha', event.activityCentre]].map(([k, v]) => (
                  <div key={k} className="flex gap-2"><span className="text-neutral-400 w-14 flex-shrink-0 text-xs">{k}</span><span>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── LIGHTBOX ─────────────────────────────────────────────────────────── */}
    {lightbox && currentMedia && (
      <div
        className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeLightbox}
      >
        <div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-neutral-950"
          onClick={e => e.stopPropagation()}
        >
          {/* Lightbox top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-neutral-900/80">
            {/* User info */}
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(currentMedia.id)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[9px] font-bold text-white">
                  {lightbox.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{lightbox.memberName}</p>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {lightboxTotal} {lightboxTotal === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Counter */}
            <span className="text-xs font-medium text-neutral-300 tabular-nums">
              {lightbox.currentIndex + 1} / {lightboxTotal}
            </span>

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media area */}
          <div className="relative flex items-center justify-center bg-black min-h-[50vh]">
            {/* Left arrow */}
            {lightboxTotal > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Content */}
            <div className="w-full flex items-center justify-center py-2">
              {currentMedia.imageUrl ? (
                <img
                  src={fullsizeUrl(currentMedia.imageUrl)}
                  alt={currentMedia.caption ?? 'Media'}
                  className="max-h-[62vh] max-w-full object-contain select-none"
                  draggable={false}
                />
              ) : (
                <div className={`w-full max-w-2xl aspect-video bg-gradient-to-br ${getGradient(currentMedia.id)} flex items-center justify-center mx-4 rounded-lg`}>
                  {currentMedia.type === 'video' ? (
                    <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  ) : (
                    <ImageIcon className="w-12 h-12 text-white/40" />
                  )}
                </div>
              )}
            </div>

            {/* Right arrow */}
            {lightboxTotal > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Lightbox footer */}
          <div className="px-5 py-4 bg-neutral-900/80 border-t border-white/10 space-y-1">
            {currentMedia.caption && (
              <p className="text-sm text-white/90 leading-relaxed">{currentMedia.caption}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(currentMedia.postedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1">
                {currentMedia.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span className="capitalize">{currentMedia.type}</span>
              </span>
            </div>

            {/* Dot navigation strip */}
            {lightboxTotal > 1 && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {lightboxItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setLightbox(p => p ? { ...p, currentIndex: idx } : null)}
                    className={`transition-all rounded-full ${
                      idx === lightbox.currentIndex
                        ? 'w-5 h-1.5 bg-primary-400'
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
