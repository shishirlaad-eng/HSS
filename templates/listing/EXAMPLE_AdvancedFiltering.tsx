/**
 * EXAMPLE: ADVANCED FILTERING WITH SEARCHBAR + FILTERPOPUP + FILTERCHIPS
 * 
 * This example shows how to connect:
 * 1. SearchBar - with filter button and badge counter
 * 2. FilterPopup - advanced multi-filter dropdown
 * 3. FilterChips - displays active filters as removable chips
 * 
 * Copy this pattern to your listing page!
 */

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { 
  PageHeader, 
  PrimaryButton, 
  IconButton, 
  SearchBar,
  FilterPopup,
  FilterChips,
  SummaryWidgets,
  type FilterCondition 
} from '../../src/app/components/hb/listing';

// Mock data type
interface Employee {
  id: string;
  name: string;
  email: string;
  status: string;
  department: string;
  role: string;
}

// Mock data
const mockEmployees: Employee[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', department: 'Engineering', role: 'Developer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Active', department: 'Sales', role: 'Manager' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Suspended', department: 'HR', role: 'Recruiter' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', status: 'Exited', department: 'Engineering', role: 'Designer' },
];

export function AdvancedFilteringExample() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  // Data
  const [employees] = useState(mockEmployees);

  // Define what fields can be filtered and their options
  const filterOptions = {
    'Job Status': ['Active', 'Exited', 'Suspended'],
    'Department': ['Engineering', 'Sales', 'HR', 'Marketing'],
    'Role': ['Developer', 'Designer', 'Manager', 'Recruiter']
  };

  // Apply filters to data
  const filteredEmployees = employees.filter(employee => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Advanced filters
    const matchesFilters = filters.every(filter => {
      if (filter.values.length === 0) return true;
      
      // Map filter fields to employee properties
      const fieldMap: Record<string, keyof Employee> = {
        'Job Status': 'status',
        'Department': 'department',
        'Role': 'role'
      };
      
      const employeeValue = employee[fieldMap[filter.field]];
      return filter.values.includes(employeeValue);
    });

    return matchesSearch && matchesFilters;
  });

  // Count active filters for badge
  const activeFilterCount = filters.filter(f => f.values.length > 0).length;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        
        {/* ========== PAGE HEADER ========== */}
        <PageHeader
          title="Employee Management"
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'HR', href: '#' },
            { label: 'Employees', current: true }
          ]}
        >
          <PrimaryButton icon={Plus} onClick={() => {}}>
            Add Employee
          </PrimaryButton>
          <IconButton icon={RefreshCw} onClick={() => {}} />
        </PageHeader>

        {/* ========== SUMMARY WIDGETS ========== */}
        <SummaryWidgets 
          widgets={[
            { id: 'total', label: 'Total Employees', description: 'All employees', enabled: true, type: 'predefined', icon: 'Users', color: 'indigo' },
            { id: 'active', label: 'Active', description: 'Currently active', enabled: true, type: 'predefined', icon: 'CheckCircle2', color: 'emerald' },
          ]} 
          data={employees}
          onManageWidgets={() => {}}
        />

        {/* ========== FILTER SECTION ========== */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-5">
          
          {/* Search Bar + Filter Button */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-md">
              {/* SEARCHBAR with Filter Button */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search employees..."
                onAdvancedSearch={() => setShowFilterPopup(true)}
                activeFilterCount={activeFilterCount}
              />

              {/* FILTERPOPUP - positioned below SearchBar */}
              <FilterPopup
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
                title="Filter Employees"
              />
            </div>
          </div>

          {/* FILTERCHIPS - Shows active filters */}
          <FilterChips
            filters={filters}
            onRemove={(filterId) => {
              setFilters(filters.filter(f => f.id !== filterId));
            }}
            onClearAll={() => setFilters([])}
          />

          {/* Results Count */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>

        {/* ========== DATA VIEW ========== */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{employee.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">{employee.department}</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{employee.role}</span>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${employee.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}
                      ${employee.status === 'Suspended' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                      ${employee.status === 'Exited' ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' : ''}
                    `}>
                      {employee.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">No employees found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
