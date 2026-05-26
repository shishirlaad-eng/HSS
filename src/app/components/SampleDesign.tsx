import { useState, useMemo, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  MoreVertical,
  Plus,
  BarChart3,
  RefreshCw,
  Upload,
  Download,
  Printer,
  Eye,
  Edit2,
  Trash2,
  GitBranch,
  Briefcase,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { 
  PageHeader, 
  PrimaryButton, 
  IconButton, 
  SummaryWidgets, 
  ViewModeSwitcher, 
  AdvancedSearchPanel, 
  FilterChips, 
  SearchBar, 
  Pagination,
  ColumnVisibilityPanel,
  type ColumnConfig
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  FormModal,
  FormSection,
  FormField,
  FormLabel,
  FormInput,
  FormFooter,
  FormSelect,
  StatusSlider,
} from './hb/common';
import { SecondaryButton } from './hb/listing';
import EmployeeDetail from './EmployeeDetail';
import ImageViewerModal from './ImageViewerModal';

// Sample data interface
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

// Mock data with real images
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    position: 'Senior Developer',
    location: 'New York',
    status: 'active',
    joinDate: '2022-01-15',
    salary: '$95,000',
    manager: 'John Smith',
    team: 'Frontend Team',
    avatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY3NDIxMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 234-5678',
    department: 'Design',
    position: 'UI/UX Designer',
    location: 'San Francisco',
    status: 'active',
    joinDate: '2021-06-20',
    salary: '$85,000',
    manager: 'Emma Davis',
    team: 'Design Team',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMmFub3RoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njc0MjMxMjMw&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    phone: '+1 (555) 345-6789',
    department: 'Marketing',
    position: 'Marketing Manager',
    location: 'Chicago',
    status: 'on-leave',
    joinDate: '2020-03-10',
    salary: '$78,000',
    manager: 'David Wilson',
    team: 'Marketing Team',
    avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzY3NDQ4MTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@company.com',
    phone: '+1 (555) 456-7890',
    department: 'Engineering',
    position: 'Backend Developer',
    location: 'Austin',
    status: 'active',
    joinDate: '2023-02-01',
    salary: '$92,000',
    manager: 'John Smith',
    team: 'Backend Team',
    avatar: 'https://images.unsplash.com/photo-1622169804256-0eb6873ff441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZW1wbG95ZWUlMjBoZWFkc2hvdHxlbnwxfHx8fDE3Njc0NDgxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+1 (555) 567-8901',
    department: 'Sales',
    position: 'Sales Representative',
    location: 'Boston',
    status: 'inactive',
    joinDate: '2019-11-05',
    salary: '$65,000',
    manager: 'Robert Brown',
    team: 'Sales Team',
    avatar: 'https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY3MzUyNzI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    phone: '+1 (555) 678-9012',
    department: 'HR',
    position: 'HR Manager',
    location: 'Seattle',
    status: 'active',
    joinDate: '2021-08-15',
    salary: '$75,000',
    manager: 'Susan Miller',
    team: 'HR Team',
    avatar: 'https://images.unsplash.com/photo-1758518731468-98e90ffd7430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZW1wbG95ZWUlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njc0NDgxMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

type ViewMode = 'grid' | 'list' | 'table';
type FilterType = 'all' | 'active' | 'inactive' | 'on-leave';

export default function SampleDesign() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('grid');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Employee | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const employeeColumns: ColumnConfig[] = [
    { key: 'id', label: 'Employee Id' },
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Job Title' },
    { key: 'location', label: 'Office Location' },
    { key: 'status', label: 'Work Status' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    email: true,
    phone: true,
    department: true,
    position: true,
    location: true,
    status: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderSortArrow = (field: keyof Employee) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Action menu state
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Summary widgets toggle state (default closed)
  const [showSummary, setShowSummary] = useState(false);

  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  // Filter options for the AdvancedSearchPanel
  const filterOptions = {
    'Status': ['Active', 'On Leave', 'Inactive'],
    'Department': ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'],
    'Location': ['New York', 'San Francisco', 'Chicago', 'Austin', 'Boston', 'Seattle'],
    'Position': ['Senior Developer', 'UI/UX Designer', 'Marketing Manager', 'Backend Developer', 'Sales Representative', 'HR Manager'],
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    status: 'active',
    joinDate: '',
  });

  // Filter employees
  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = searchQuery === '' ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply advanced filters
    const matchesFilters = filters.every(filter => {
      if (filter.field === 'Status') {
        return filter.values.some(v => {
          const statusMap: Record<string, string> = {
            'Active': 'active',
            'On Leave': 'on-leave',
            'Inactive': 'inactive'
          };
          return statusMap[v] === emp.status;
        });
      } else if (filter.field === 'Department') {
        return filter.values.includes(emp.department);
      } else if (filter.field === 'Location') {
        return filter.values.includes(emp.location);
      } else if (filter.field === 'Position') {
        return filter.values.includes(emp.position);
      }
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  // Calculate sorted and paginated data
  const sortedEmployees = useMemo(() => {
    if (!sortField) return filteredEmployees;
    return [...filteredEmployees].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEmployees, currentPage, itemsPerPage]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Status badge helper
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

  // Handle actions
  const handleView = (employee: Employee) => {
    setPreviousViewMode(viewMode); // Save current view mode
    setSelectedEmployee(employee);
    setShowDetailView(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(employee);
    setShowEditModal(true);
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      console.log('Delete employee:', employee.id);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      location: '',
      status: 'active',
      joinDate: '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setSelectedEmployee(null);
    setViewMode(previousViewMode); // Restore previous view mode
  };

  const handleImageClick = (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    if (employee.avatar) {
      setSelectedImage({ url: employee.avatar, name: employee.name });
      setShowImageViewer(true);
    }
  };

  // Show detail view if selected
  if (showDetailView && selectedEmployee) {
    return (
      <>
        <EmployeeDetail
          employee={selectedEmployee}
          onBack={handleBackFromDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Add/Edit Modal - Rendered on top of detail view */}
        <FormModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          title={showEditModal ? 'Edit Employee' : 'Add New Employee'}
          description={showEditModal ? 'Update employee information' : 'Enter employee details to add to the system'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit}>
            <FormSection title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormLabel htmlFor="name" required>Full Name</FormLabel>
                  <FormInput
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="email" required>Email Address</FormLabel>
                  <FormInput
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="phone" required>Phone Number</FormLabel>
                  <FormInput
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="joinDate" required>Join Date</FormLabel>
                  <FormInput
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Work Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormLabel htmlFor="department" required>Department</FormLabel>
                  <FormSelect
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </FormSelect>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="position" required>Position</FormLabel>
                  <FormInput
                    id="position"
                    type="text"
                    placeholder="Job title"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="location" required>Location</FormLabel>
                  <FormInput
                    id="location"
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="status" required>Status</FormLabel>
                  <StatusSlider
                    value={formData.status || 'active'}
                    onChange={val => setFormData({ ...formData, status: val })}
                    options={[
                      { value: 'active', label: 'Active', color: 'bg-success-500' },
                      { value: 'on-leave', label: 'On Leave', color: 'bg-warning-500' },
                      { value: 'inactive', label: 'Inactive', color: 'bg-error-500' },
                    ]}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormFooter>
              <SecondaryButton
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">
                {showEditModal ? 'Update Employee' : 'Add Employee'}
              </PrimaryButton>
            </FormFooter>
          </form>
        </FormModal>
      </>
    );
  }

  return (
    <div className="px-6 py-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        {/* ========== PAGE HEADER ========== */}
        <PageHeader
          title="Employee Management"
          breadcrumbs={[
            { label: 'HB Templates', href: '#' },
            { label: 'Sample Page', current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={() => setShowColumnPanel(!showColumnPanel)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search employees..."
            />

            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={filterOptions}
            />

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={employeeColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />

            <PrimaryButton icon={Plus} onClick={handleAdd}>
              Add Employee
            </PrimaryButton>

            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
            <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />
            
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: Upload, label: 'Import', onClick: () => {} },
                { icon: Download, label: 'Export', onClick: () => {} },
                { icon: Printer, label: 'Print', onClick: () => {} },
              ]}
            />

            <ViewModeSwitcher
              currentMode={viewMode}
              onChange={setViewMode}
            />
          </div>
        </PageHeader>

        {/* ========== SUMMARY WIDGETS ========== */}
        {showSummary && (
          <SummaryWidgets
            widgets={[
              {
                label: 'Total Employees',
                value: mockEmployees.length.toString(),
                trend: '+12%',
                trendDirection: 'up',
              },
              {
                label: 'Active',
                value: mockEmployees.filter(e => e.status === 'active').length.toString(),
                trend: '+5%',
                trendDirection: 'up',
              },
              {
                label: 'On Leave',
                value: mockEmployees.filter(e => e.status === 'on-leave').length.toString(),
                trend: '0%',
                trendDirection: 'neutral',
              },
              {
                label: 'Inactive',
                value: mockEmployees.filter(e => e.status === 'inactive').length.toString(),
                trend: '-2%',
                trendDirection: 'down',
              },
            ]}
          />
        )}

        {/* ========== ACTIVE FILTER CHIPS ========== */}
        {filters.filter(f => f.values.length > 0).length > 0 && (
          <FilterChips
            filters={filters.filter(f => f.values.length > 0)}
            onRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
            onClearAll={() => setFilters([])}
          />
        )}

        {/* ========== LIST VIEW ========== */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {paginatedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => handleView(employee)}>
                    {/* Extreme left Checkbox */}
                    <div onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(employee.id)}
                        onChange={() => toggleSelect(employee.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </div>
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        onClick={(e) => handleImageClick(e, employee)}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all cursor-zoom-in"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-neutral-900 dark:text-white truncate">
                          {employee.name}
                        </span>
                        {getStatusBadge(employee.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{employee.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{employee.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{employee.department}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenuId(openActionMenuId === employee.id ? null : employee.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown menu */}
                    {openActionMenuId === employee.id && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(employee);
                            setOpenActionMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(employee);
                            setOpenActionMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Change Hierarchy');
                            setOpenActionMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                        >
                          <GitBranch className="w-4 h-4" />
                          Change Hierarchy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Change Job Status');
                            setOpenActionMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          Change Job Status
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(employee);
                            setOpenActionMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 transition-colors border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== GRID VIEW ========== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md hover:border-primary-600 dark:hover:border-primary-400 transition-all cursor-pointer relative group"
              >
                {/* 3-dot menu button */}
                <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(employee.id)}
                    onChange={() => toggleSelect(employee.id)}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenActionMenuId(openActionMenuId === employee.id ? null : employee.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown menu */}
                  {openActionMenuId === employee.id && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(employee);
                          setOpenActionMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee);
                          setOpenActionMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Change Hierarchy');
                          setOpenActionMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                      >
                        <GitBranch className="w-4 h-4" />
                        Change Hierarchy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Change Job Status');
                          setOpenActionMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        Change Job Status
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee);
                          setOpenActionMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 transition-colors border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div onClick={() => handleView(employee)}>
                  <div className="flex items-start gap-3 mb-3">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        onClick={(e) => handleImageClick(e, employee)}
                        className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all cursor-zoom-in"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-all">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className="flex-1 pr-8">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                        {employee.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {employee.position}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <Mail className="w-3.5 h-3.5" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {employee.department}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {employee.location}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end" onClick={e => e.stopPropagation()}>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== TABLE VIEW ========== */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(paginatedEmployees.map(emp => emp.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                        {visibleColumns.id && (
                          <th 
                            onClick={() => handleSort('id')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Employee Id {renderSortArrow('id')}
                          </th>
                        )}
                        {visibleColumns.name && (
                          <th 
                            onClick={() => handleSort('name')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Name {renderSortArrow('name')}
                          </th>
                        )}
                        {visibleColumns.email && (
                          <th 
                            onClick={() => handleSort('email')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Email {renderSortArrow('email')}
                          </th>
                        )}
                        {visibleColumns.phone && (
                          <th 
                            onClick={() => handleSort('phone')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Phone {renderSortArrow('phone')}
                          </th>
                        )}
                        {visibleColumns.department && (
                          <th 
                            onClick={() => handleSort('department')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Department {renderSortArrow('department')}
                          </th>
                        )}
                        {visibleColumns.position && (
                          <th 
                            onClick={() => handleSort('position')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Position {renderSortArrow('position')}
                          </th>
                        )}
                        {visibleColumns.location && (
                          <th 
                            onClick={() => handleSort('location')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Location {renderSortArrow('location')}
                          </th>
                        )}
                        {visibleColumns.status && (
                          <th 
                            onClick={() => handleSort('status')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Status {renderSortArrow('status')}
                          </th>
                        )}
                        {visibleColumns.joinDate && (
                          <th 
                            onClick={() => handleSort('joinDate')}
                            className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                          >
                            Join Date {renderSortArrow('joinDate')}
                          </th>
                        )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer relative group"
                    >
                      <td className="px-4 py-3 w-12" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(employee.id)}
                          onChange={() => toggleSelect(employee.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </td>
                          {visibleColumns.id && (
                            <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4">
                              {employee.id}
                            </td>
                          )}
                          {visibleColumns.name && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {employee.avatar ? (
                                  <img
                                    src={employee.avatar}
                                    alt={employee.name}
                                    onClick={(e) => handleImageClick(e, employee)}
                                    className="w-8 h-8 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all cursor-zoom-in"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {employee.name}
                                </span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.email && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.email}
                            </td>
                          )}
                          {visibleColumns.phone && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.phone}
                            </td>
                          )}
                          {visibleColumns.department && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.department}
                            </td>
                          )}
                          {visibleColumns.position && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.position}
                            </td>
                          )}
                          {visibleColumns.location && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.location}
                            </td>
                          )}
                          {visibleColumns.status && (
                            <td className="px-6 py-4">
                              {getStatusBadge(employee.status)}
                            </td>
                          )}
                          {visibleColumns.joinDate && (
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {employee.joinDate}
                            </td>
                          )}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(openActionMenuId === employee.id ? null : employee.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown menu */}
                          {openActionMenuId === employee.id && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden z-50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(employee);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(employee);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Change Hierarchy');
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                              >
                                <GitBranch className="w-4 h-4" />
                                Change Hierarchy
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Change Job Status');
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
                              >
                                <Briefcase className="w-4 h-4" />
                                Change Job Status
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(employee);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 transition-colors border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination - Only show if 20+ employees */}
        {filteredEmployees.length >= 20 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
            totalItems={filteredEmployees.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(count) => {
              setItemsPerPage(count);
              setCurrentPage(1);
            }}
          />
        )}

        {/* ========== ADD/EDIT MODAL ========== */}
        <FormModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          title={showEditModal ? 'Edit Employee' : 'Add New Employee'}
          description={showEditModal ? 'Update employee information' : 'Enter employee details to add to the system'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit}>
            <FormSection title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormLabel htmlFor="name" required>Full Name</FormLabel>
                  <FormInput
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="email" required>Email Address</FormLabel>
                  <FormInput
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="phone" required>Phone Number</FormLabel>
                  <FormInput
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="joinDate" required>Join Date</FormLabel>
                  <FormInput
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Work Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormLabel htmlFor="department" required>Department</FormLabel>
                  <FormSelect
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </FormSelect>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="position" required>Position</FormLabel>
                  <FormInput
                    id="position"
                    type="text"
                    placeholder="Job title"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="location" required>Location</FormLabel>
                  <FormInput
                    id="location"
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="status" required>Status</FormLabel>
                  <FormSelect
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </FormSelect>
                </FormField>
              </div>
            </FormSection>

            <FormFooter>
              <SecondaryButton
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">
                {showEditModal ? 'Update Employee' : 'Add Employee'}
              </PrimaryButton>
            </FormFooter>
          </form>
        </FormModal>

        {/* ========== IMAGE VIEWER MODAL ========== */}
        <ImageViewerModal
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          imageUrl={selectedImage?.url || ''}
          employeeName={selectedImage?.name || ''}
        />
      </div>
    </div>
  );
}