import { useState } from 'react';
import { 
  ArrowLeft,
  Calendar,
  Mail,
  User as UserIcon,
  ToggleLeft,
  ToggleRight,
  Clock,
  Layout,
  Users as UsersIcon,
  PlusCircle,
  CalendarDays,
  Edit
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { StatCard } from './hb/common/StatCard';
import { User } from '../../mockAPI/usersData';

interface UserDetailProps {
  user: User;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: (user: User) => void;
}

export default function UserDetail({ user, onBack, onEdit, onToggleStatus }: UserDetailProps) {
  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'events'>('overview');

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        {/* PROFILE HEADER SECTION */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            {/* Left Side - User Info */}
            <div className="flex-1">
              {/* Name and Position/ID */}
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{ fontSize: '18px', fontWeight: '600' }} className="text-neutral-900 dark:text-white">
                  {user.name}
                </h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700"></div>
                <span style={{ fontWeight: 'medium' }} className="text-sm text-neutral-900 dark:text-white">
                  Platform User
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span style={{ fontWeight: '400' }} className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                  {user.id}
                </span>
              </div>

              {/* Contact Details Row */}
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <a href={`mailto:${user.email}`} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </a>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(user.createdDate)}</span>
                </span>
              </div>

              {/* Status Tags Row */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(user.status)}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Standard Account</span>
                </span>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>
                Back
              </SecondaryButton>
              <PrimaryButton icon={Edit} onClick={onEdit}>
                Edit Profile
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN - Tabs + Content (70%) */}
          <div className="flex-1 lg:w-[70%] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col">
            {/* HORIZONTAL TABS */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
              <div className="flex px-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'events'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Events Participation
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 bg-white dark:bg-neutral-950 flex-1">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      label="Created" 
                      value={user.metrics.totalEventsCreated} 
                      icon={PlusCircle}
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                    <StatCard 
                      label="Joined" 
                      value={user.metrics.totalEventsJoined} 
                      icon={UsersIcon}
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                    <StatCard 
                      label="Active" 
                      value={user.metrics.activeEvents} 
                      icon={CalendarDays}
                      valueClassName="text-success-600 dark:text-success-400"
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                    <StatCard 
                      label="Expired" 
                      value={user.metrics.expiredEvents} 
                      icon={Clock}
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                  </div>

                  {/* Account Information Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Account Information
                    </h4>
                    <div className="px-6 pb-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Full Name
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white font-medium">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Email Address
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white font-medium">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Account ID
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white font-mono">{user.id}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Account Created
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">{formatDate(user.createdDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-8">
                  {/* Created Events Table */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Created Events
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50/50 dark:bg-neutral-900/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Event Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Expiry Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {user.createdEvents.length > 0 ? (
                            user.createdEvents.map((event) => (
                              <tr key={event.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white font-medium">{event.name}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    event.status === 'active' 
                                      ? 'bg-success-50 text-success-600 border border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
                                      : 'bg-neutral-50 text-neutral-600 border border-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                  }`}>
                                    {event.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{formatDate(event.expiryDate)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center text-xs text-neutral-500">No events created</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Joined Events Table */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Joined Events
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50/50 dark:bg-neutral-900/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Event Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Host</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">RSVP</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {user.joinedEvents.length > 0 ? (
                            user.joinedEvents.map((event) => (
                              <tr key={event.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white font-medium">{event.name}</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{event.host}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    event.rsvpStatus === 'going' 
                                      ? 'bg-primary-50 text-primary-600 border border-primary-100 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900/30' 
                                      : 'bg-neutral-50 text-neutral-600 border border-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                  }`}>
                                    {event.rsvpStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    event.status === 'active' 
                                      ? 'bg-success-50 text-success-600 border border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
                                      : 'bg-error-50 text-error-600 border border-error-100 dark:bg-error-950/20 dark:text-error-400 dark:border-error-900/30'
                                  }`}>
                                    {event.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-10 text-center text-xs text-neutral-500">No events joined</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (30%) */}
          <div className="lg:w-[30%] space-y-6">
            {/* Account Status Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Account Controls
              </h4>
              <div className="px-6 pb-6 pt-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                      Status
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider font-bold">
                      {user.status}
                    </p>
                  </div>
                  <button 
                    onClick={() => onToggleStatus(user)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      user.status === 'active' ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        user.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                  <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-normal italic">
                    Changing the account status will immediately affect the user's ability to access the mobile application and web portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Avatar Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Profile Avatar
              </h4>
              <div className="px-6 py-10 flex flex-col items-center justify-center bg-neutral-50/30 dark:bg-neutral-900/30">
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-950 border-4 border-white dark:border-neutral-900 shadow-md flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold mb-4">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
