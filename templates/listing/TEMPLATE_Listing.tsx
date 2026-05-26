/**
 * TEMPLATE LISTING COMPONENT
 * 
 * HOW TO USE:
 * 1. Copy this entire file to your new project
 * 2. Rename: TEMPLATE_Listing.tsx → EmployeeListing.tsx (or ProductListing.tsx, etc.)
 * 3. Find and Replace (Ctrl+H):
 *    - "Item" → "Employee" (or Product, Invoice, etc.)
 *    - "item" → "employee" (or product, invoice, etc.)
 *    - "ITEM" → "EMPLOYEE" (or PRODUCT, INVOICE, etc.)
 * 4. Update mockData import to your data file
 * 5. Customize fields in the render (name, email, phone → your fields)
 * 
 * RESULT: Full listing page with breadcrumb, stats, filters, 4 views (grid, list, table, kanban)
 */

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, LayoutGrid, List as ListIcon, Table2, ChevronDown, 
  ChevronUp, ChevronRight, MoreVertical, Mail, Phone, User, Users as UsersIcon,
  Edit, Trash2, Clock, Target, TrendingUp, Upload, Download, Printer, 
  Columns3, SlidersHorizontal, ArrowLeft, RefreshCw, Building2, Copy, 
  CheckCircle2, ExternalLink, AlertTriangle, X, Calendar as CalendarIcon
} from 'lucide-react';

// Import reusable components (Adjust path when copying to your project)
import { PageHeader, PrimaryButton, IconButton, SearchBar, SummaryWidgets } from '../../src/app/components/hb/listing';

// Import type for widgets if needed, or define locally
import { type WidgetConfig } from '../../src/app/components/ManageWidgetsModal';

// REPLACE THIS: Import your mockData
import { mockItems, getStatusColor, getPriorityColor, formatDate, type Item } from './mockData';

type ViewMode = 'grid' | 'list' | 'table' | 'kanban';
type FilterType = 'all' | 'active' | 'inactive' | 'pending';

export function ItemListing() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [items, setItems] = useState(mockItems);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Widget configuration for SummaryWidgets
  const [widgets] = useState<WidgetConfig[]>([
    {
      id: "total-locations", // Use IDs that match your widgetCalculator logic
      label: "Total Items",
      description: "Total number of items",
      enabled: true,
      type: 'predefined',
      icon: 'Target',
      color: 'indigo',
    },
    {
      id: "active-locations",
      label: "Active Items",
      description: "Currently active items",
      enabled: true,
      type: 'predefined',
      icon: 'TrendingUp',
      color: 'emerald',
      trend: 12,
      trendDirection: 'up',
    },
    {
      id: "pending-locations", // Example ID
      label: "Pending Items",
      description: "Items awaiting approval",
      enabled: true,
      type: 'predefined',
      icon: 'Clock',
      color: 'amber',
    },
    {
      id: "inactive-locations",
      label: "Inactive Items",
      description: "Archived or inactive items",
      enabled: true,
      type: 'predefined',
      icon: 'Users',
      color: 'rose',
    },
  ]);

  // Filter items based on search and filter
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        
        {/* ========== PAGE HEADER ========== */}
        <PageHeader
          title="Item Management"
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'Management', href: '#' },
            { label: 'Item Management', current: true }
          ]}
        >
          <PrimaryButton 
            icon={Plus} 
            onClick={() => setShowAddDrawer(true)}
          >
            Add New Item
          </PrimaryButton>

          <IconButton 
            icon={RefreshCw} 
            onClick={() => {}} 
          />

          <div className="relative">
            <button 
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="w-10 h-10 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
                <button className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Import</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span className="text-sm">Print</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2">
                  <Columns3 className="w-4 h-4" />
                  <span className="text-sm">Manage Columns</span>
                </button>
              </div>
            )}
          </div>
        </PageHeader>

        {/* ========== SUMMARY DASHBOARD ========== */}
        <SummaryWidgets 
          widgets={widgets} 
          data={items} 
          onManageWidgets={() => { /* Implement widget management modal */ }} 
        />

        {/* ========== FILTERS & SEARCH BAR ========== */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-600" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Filter & View Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-950 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <span className="text-sm">All Items</span>
                    </button>
                    <button
                      onClick={() => { setFilterStatus('active'); setShowFilterDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <span className="text-sm">Active</span>
                    </button>
                    <button
                      onClick={() => { setFilterStatus('pending'); setShowFilterDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <span className="text-sm">Pending</span>
                    </button>
                    <button
                      onClick={() => { setFilterStatus('inactive'); setShowFilterDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <span className="text-sm">Inactive</span>
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-950 rounded-lg transition-colors flex items-center gap-2"
                >
                  {viewMode === 'grid' && <LayoutGrid className="w-5 h-5" />}
                  {viewMode === 'list' && <ListIcon className="w-5 h-5" />}
                  {viewMode === 'table' && <Table2 className="w-5 h-5" />}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showViewDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => { setViewMode('grid'); setShowViewDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-sm">Grid View</span>
                    </button>
                    <button
                      onClick={() => { setViewMode('list'); setShowViewDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2"
                    >
                      <ListIcon className="w-4 h-4" />
                      <span className="text-sm">List View</span>
                    </button>
                    <button
                      onClick={() => { setViewMode('table'); setShowViewDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2"
                    >
                      <Table2 className="w-4 h-4" />
                      <span className="text-sm">Table View</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== LIST VIEW ========== */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Left Side - Main Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {item.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== GRID VIEW ========== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <h3 className="text-neutral-900 dark:text-white mb-1 truncate">
                    {item.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.phone}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Created {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== TABLE VIEW ========== */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex flex-col gap-1">
                          <span>{item.email}</span>
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="text-neutral-900 dark:text-white mb-2">
              No Items Found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first item'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowAddDrawer(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Item
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
