/**
 * DETAIL VIEW PAGE TEMPLATE
 * 
 * Reusable template for detail/view pages following HB design system.
 * Based on LocationDetail.tsx and EXACT_SPECIFICATIONS.md
 * 
 * FEATURES:
 * - Header with back button, title, and action buttons
 * - Status badge with dropdown
 * - More actions menu (Edit, Delete, etc.)
 * - Tab navigation (Overview, Related Data)
 * - Delete confirmation modal with type-to-confirm
 * - Edit modal integration
 * - Responsive design
 * - Dark mode support
 * 
 * USAGE:
 * 1. Copy this template
 * 2. Replace DataItem type with your data type
 * 3. Customize tabs and content sections
 * 4. Update action handlers
 * 5. Adjust fields and metadata
 * 
 * FILES TO CUSTOMIZE:
 * - Type definitions (DataItem interface)
 * - Tab content (renderOverviewTab, renderRelatedTab)
 * - Status options
 * - Action menu items
 * - Form modal component
 */

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  Check,
  AlertTriangle,
  // Add your specific icons here
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../components/ui/command';
import { DeleteConfirmationModal } from '../components/hb/modals';

// ==================== TYPE DEFINITIONS ====================

/**
 * Replace this with your actual data type
 */
interface DataItem {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  // Add your fields here
  code?: string;
  description?: string;
  type?: string;
  createdDate?: string;
  createdBy?: string;
  modifiedDate?: string;
  modifiedBy?: string;
}

/**
 * Status option configuration
 */
interface StatusOption {
  value: DataItem['status'];
  label: string;
  color: string;
}

/**
 * Action menu item configuration
 */
interface ActionMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

// ==================== PROPS ====================

interface DetailViewTemplateProps {
  /** ID of the item to display */
  itemId: string;
  
  /** Callback when back button is clicked */
  onBack: () => void;
  
  /** Callback when item is deleted */
  onDelete?: (item: DataItem) => void;
  
  /** Callback when item is edited */
  onEdit?: (item: DataItem) => void;
  
  /** Optional: Fetch item data (if not using mock data) */
  fetchItem?: (id: string) => Promise<DataItem>;
  
  /** Optional: Initial item data */
  initialData?: DataItem;
}

// ==================== COMPONENT ====================

export function DetailViewTemplate({
  itemId,
  onBack,
  onDelete,
  onEdit,
  fetchItem,
  initialData
}: DetailViewTemplateProps) {
  
  // ========== STATE MANAGEMENT ==========
  const [item, setItem] = useState<DataItem | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<'overview' | 'related'>('overview');
  
  // Status dropdown
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  
  // More actions menu
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  // ========== DATA FETCHING ==========
  useEffect(() => {
    if (initialData) {
      setItem(initialData);
      setLoading(false);
      return;
    }

    if (fetchItem) {
      setLoading(true);
      fetchItem(itemId)
        .then(data => {
          setItem(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch item:', error);
          toast.error('Failed to load item details');
          setLoading(false);
        });
    }
  }, [itemId, fetchItem, initialData]);

  // ========== CLICK OUTSIDE HANDLER ==========
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setMoreActionsOpen(false);
      }
    };

    if (moreActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreActionsOpen]);

  // ========== EVENT HANDLERS ==========

  const handleStatusChange = (newStatus: DataItem['status']) => {
    if (!item) return;

    const updatedItem = { ...item, status: newStatus };
    setItem(updatedItem);
    setStatusDropdownOpen(false);
    
    // Call API to update status
    toast.success(`Status updated to ${newStatus}`);
    
    // If you have an onStatusChange callback
    // onStatusChange?.(updatedItem);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setMoreActionsOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setMoreActionsOpen(false);
  };

  const handleDelete = () => {
    if (!item) return;
    
    onDelete?.(item);
    toast.success('Item deleted successfully');
    
    // Navigate back after delete
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  const handleSaveEdit = (updatedData: Partial<DataItem>) => {
    if (!item) return;

    const updatedItem = { ...item, ...updatedData };
    setItem(updatedItem);
    setShowEditModal(false);
    
    onEdit?.(updatedItem);
    toast.success('Item updated successfully');
  };

  // ========== STATUS CONFIGURATION ==========
  const statusOptions: StatusOption[] = [
    { value: 'Active', label: 'Active', color: 'bg-emerald-500' },
    { value: 'Inactive', label: 'Inactive', color: 'bg-neutral-400' },
    { value: 'Pending', label: 'Pending', color: 'bg-amber-500' },
  ];

  const currentStatus = statusOptions.find(s => s.value === item?.status) || statusOptions[0];

  // ========== ACTION MENU CONFIGURATION ==========
  const actionMenuItems: ActionMenuItem[] = [
    {
      icon: Edit,
      label: 'Edit Details',
      onClick: handleEditClick,
    },
    {
      icon: Trash2,
      label: 'Delete Item',
      onClick: handleDeleteClick,
      variant: 'danger',
    },
  ];

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  // ========== NOT FOUND STATE ==========
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-neutral-400" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Item Not Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            The item you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER METHODS ==========

  /**
   * Render Overview Tab Content
   * Customize this with your specific fields
   */
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField 
            icon={MapPin}
            label="Code"
            value={item.code || 'N/A'}
          />
          <InfoField 
            icon={Users}
            label="Type"
            value={item.type || 'N/A'}
          />
          <InfoField 
            icon={Mail}
            label="Description"
            value={item.description || 'N/A'}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Metadata Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
          Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField 
            icon={Calendar}
            label="Created Date"
            value={item.createdDate || 'N/A'}
          />
          <InfoField 
            icon={Users}
            label="Created By"
            value={item.createdBy || 'N/A'}
          />
          <InfoField 
            icon={Calendar}
            label="Last Modified"
            value={item.modifiedDate || 'N/A'}
          />
          <InfoField 
            icon={Users}
            label="Modified By"
            value={item.modifiedBy || 'N/A'}
          />
        </div>
      </div>
    </div>
  );

  /**
   * Render Related Data Tab Content
   * Customize this with your related data
   */
  const renderRelatedTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
          Related Data
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Related data content goes here (e.g., employees, transactions, history)
        </p>
      </div>
    </div>
  );

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row: Back button and Actions */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              {/* More Actions Menu */}
              <div className="relative" ref={moreActionsRef}>
                <button
                  onClick={() => setMoreActionsOpen(!moreActionsOpen)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {moreActionsOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50 py-1">
                    {actionMenuItems.map((menuItem, index) => (
                      <button
                        key={index}
                        onClick={menuItem.onClick}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                          menuItem.variant === 'danger'
                            ? 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/20'
                            : 'text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <menuItem.icon className="w-3.5 h-3.5" />
                        {menuItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title and Status */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">
                {item.name}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                ID: {item.id}
              </p>
            </div>

            {/* Status Badge with Dropdown */}
            <Popover open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors bg-white dark:bg-neutral-900 shadow-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.color}`}></span>
                  {currentStatus.label}
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800" align="end">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {statusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleStatusChange(option.value)}
                          className="flex items-center gap-2 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-900 dark:hover:text-primary-100 text-neutral-700 dark:text-neutral-300"
                        >
                          <span className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                          {item.status === option.value && <Check className="ml-auto w-4 h-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'related'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Related Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'related' && renderRelatedTab()}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={item.name}
        itemType="Item"
        description="This action cannot be undone. All related data will be affected."
      />

      {/* Edit Modal - Replace with your actual form modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Edit Item
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Replace this with your actual form component
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveEdit({ name: item.name + ' (edited)' });
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

/**
 * Info Field Component
 * Displays a labeled field with icon
 */
interface InfoFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}

function InfoField({ icon: Icon, label, value, className = '' }: InfoFieldProps) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-neutral-900 dark:text-white font-medium truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default DetailViewTemplate;
