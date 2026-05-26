import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  ArrowLeft,
  MoreVertical,
  HandCoins
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  location: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
  avatar?: string;
  salary?: string;
  manager?: string;
  team?: string;
}

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeDetail({ employee, onBack, onEdit, onDelete }: EmployeeDetailProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'attendance' | 'leave'>('personal');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Status badge helper following BADGE_GUIDELINES.md Pattern 1
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-success-500', label: 'Active' },
      inactive: { color: 'bg-error-500', label: 'Inactive' },
      'on-leave': { color: 'bg-warning-500', label: 'On Leave' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
        <div className={`w-1.5 h-1.5 rounded-full ${config.color}`}></div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        {/* PROFILE HEADER SECTION */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            {/* Left Side - Employee Info */}
            <div className="flex-1">
              {/* Name and Position */}
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{ fontSize: '18px', fontWeight: '600' }} className="text-neutral-900 dark:text-white">
                  {employee.name}
                </h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700"></div>
                <span style={{ fontWeight: 'medium' }} className="text-sm text-neutral-900 dark:text-white">
                  {employee.position}
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span style={{ fontWeight: '400' }} className="text-sm text-neutral-600 dark:text-neutral-400">
                  {employee.id}
                </span>
              </div>

              {/* Contact Details Row */}
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <a href={`mailto:${employee.email}`} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{employee.email}</span>
                </a>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <a href={`tel:${employee.phone}`} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{employee.phone}</span>
                </a>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{employee.department}</span>
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{employee.location}</span>
                </span>
              </div>

              {/* Status Tags Row */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(employee.status)}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">permanent</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Joined {formatDate(employee.joinDate)}</span>
                </span>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <button
                onClick={() => onEdit(employee)}
                className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                title="Edit Employee"
              >
                <Edit className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  title="More Actions"
                >
                  <MoreVertical className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </button>

                {/* More Actions Menu */}
                {showMoreMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Change Hierarchy');
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
                      >
                        <Users className="w-4 h-4" />
                        <span>Change Hierarchy</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Change Job Status');
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Change Job Status</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(employee);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-error-50 dark:hover:bg-error-950 transition-colors flex items-center gap-3 text-error-600 dark:text-error-400 border-t border-neutral-200 dark:border-neutral-800"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                title="Back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex gap-6">
          {/* LEFT COLUMN - Tabs + Content (70%) */}
          <div className="w-[70%] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {/* HORIZONTAL TABS */}
            <div className="border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'personal'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'attendance'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab('leave')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'leave'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Leave
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 bg-white dark:bg-neutral-950">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Personal Information Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Personal Information
                    </h4>
                    <div className="px-6 pb-6 pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Date of Birth
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">12 June 1985</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Gender
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Male</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Marital Status
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Married</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Nationality
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Nigerian</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            State of Origin
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Lagos</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            NIN
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">12345678901</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Address
                    </h4>
                    <div className="px-6 pb-6 pt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Street Address
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">45 Admiralty Way, Lekki Phase 1</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                              City
                            </label>
                            <p className="text-sm text-neutral-900 dark:text-white">Lagos</p>
                          </div>
                          <div>
                            <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                              State
                            </label>
                            <p className="text-sm text-neutral-900 dark:text-white">Lagos State</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Emergency Contact
                    </h4>
                    <div className="px-6 pb-6 pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Name
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Jane Doe</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Relationship
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">Spouse</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Phone Number
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">+1 (555) 987-6543</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Email
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">jane.doe@example.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Attendance records will appear here</p>
                </div>
              )}

              {activeTab === 'leave' && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Leave records will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (30%) */}
          <div className="w-[30%] space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Quick Actions
              </h4>
              <div className="px-6 pb-6 pt-4">
                <button className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2">
                  <HandCoins className="w-4 h-4" />
                  <span>Request Leave</span>
                </button>
              </div>
            </div>

            {/* Reporting Line Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Reporting Line
              </h4>
              <div className="px-6 pb-6 pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Reports to</span>
                    </div>
                    <p className="text-sm text-neutral-900 dark:text-white font-medium">{employee.manager || 'John Smith'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">General Manager</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Direct Reports</span>
                    </div>
                    <p className="text-sm text-neutral-900 dark:text-white">3 employees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Scope Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Working Scope
              </h4>
              <div className="px-6 pb-6 pt-4">
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span>Oversee all kitchen operations and food preparation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span>Manage kitchen staff including hiring, training, and scheduling</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span>Develop and update menu offerings with seasonal ingredients</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span>Ensure compliance with food safety and hygiene standards</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span>Control food costs and manage kitchen budget</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}