/**
 * TEMPLATE MOCK DATA FILE
 * 
 * HOW TO USE:
 * 1. Copy this file to your new project
 * 2. Rename: TEMPLATE_mockData.ts → mockData.ts
 * 3. Update the Item interface with your fields
 * 4. Update mockItems array with your data
 * 5. Customize helper functions if needed
 * 
 * EXAMPLE REPLACEMENTS:
 * - For Employees: name, email, phone, department, role, joinDate
 * - For Products: name, sku, price, category, stock, supplier
 * - For Invoices: invoiceNumber, customerName, amount, dueDate, status
 */

// ========== TYPE DEFINITIONS ==========

export type ItemStatus = 'active' | 'pending' | 'inactive';
export type ItemPriority = 'high' | 'medium' | 'low';

export interface Item {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ItemStatus;
  priority?: ItemPriority;
  createdAt: string;
  updatedAt: string;
  
  // CUSTOMIZE: Add your specific fields here
  // For Employees:
  // department?: string;
  // role?: string;
  // joinDate?: string;
  // salary?: number;
  
  // For Products:
  // sku?: string;
  // price?: number;
  // category?: string;
  // stock?: number;
  
  // For Invoices:
  // invoiceNumber?: string;
  // amount?: number;
  // dueDate?: string;
  // customerName?: string;
}

// ========== MOCK DATA ==========

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    priority: 'high',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    priority: 'medium',
    createdAt: '2024-02-20',
    updatedAt: '2024-12-14',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 (555) 345-6789',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-03-10',
    updatedAt: '2024-12-13',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    priority: 'medium',
    createdAt: '2024-04-05',
    updatedAt: '2024-12-12',
  },
  // Add more mock items as needed
];

// ========== HELPER FUNCTIONS ==========

/**
 * Get status color classes for badges
 */
export const getStatusColor = (status: ItemStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400';
    case 'pending':
      return 'bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-400';
    case 'inactive':
      return 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400';
    default:
      return 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400';
  }
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority: ItemPriority): string => {
  switch (priority) {
    case 'high':
      return 'bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-400';
    case 'medium':
      return 'bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-400';
    case 'low':
      return 'bg-info-100 dark:bg-info-950 text-info-700 dark:text-info-400';
    default:
      return 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400';
  }
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Get item by ID
 */
export const getItemById = (id: string): Item | undefined => {
  return mockItems.find(item => item.id === id);
};

/**
 * Calculate days ago from date
 */
export const getDaysAgo = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ========== FILTER & SEARCH HELPERS ==========

/**
 * Filter items by status
 */
export const filterByStatus = (items: Item[], status: ItemStatus | 'all'): Item[] => {
  if (status === 'all') return items;
  return items.filter(item => item.status === status);
};

/**
 * Search items by query (searches name, email, phone)
 */
export const searchItems = (items: Item[], query: string): Item[] => {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.email.toLowerCase().includes(lowerQuery) ||
    item.phone.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort items by field
 */
export const sortItems = (
  items: Item[],
  field: keyof Item,
  direction: 'asc' | 'desc' = 'asc'
): Item[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// ========== STATISTICS HELPERS ==========

/**
 * Get statistics for items
 */
export const getItemStats = (items: Item[]) => {
  return {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    pending: items.filter(i => i.status === 'pending').length,
    inactive: items.filter(i => i.status === 'inactive').length,
    highPriority: items.filter(i => i.priority === 'high').length,
    mediumPriority: items.filter(i => i.priority === 'medium').length,
    lowPriority: items.filter(i => i.priority === 'low').length,
  };
};

/**
 * Get percentage
 */
export const getPercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// ========== EXPORT ALL ==========

export default {
  mockItems,
  getStatusColor,
  getPriorityColor,
  formatDate,
  formatCurrency,
  getItemById,
  getDaysAgo,
  getInitials,
  truncateText,
  filterByStatus,
  searchItems,
  sortItems,
  getItemStats,
  getPercentage,
};
