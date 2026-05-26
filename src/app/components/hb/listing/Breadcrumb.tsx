/**
 * REUSABLE BREADCRUMB COMPONENT
 * 
 * Navigation breadcrumb trail
 * 
 * SPECIFICATIONS:
 * - Font Size: 14px (text-sm)
 * - Link Color: neutral-600 (dark: neutral-400)
 * - Link Hover: primary-600 (dark: primary-400)
 * - Current Color: neutral-900 (dark: white)
 * - Separator: ChevronRight
 * - Separator Size: 16px × 16px (w-4 h-4)
 * - Separator Color: neutral-400 (dark: neutral-600)
 * - Gap: 8px (gap-2)
 * - Transition: colors (transition-colors)
 * 
 * USAGE:
 * <Breadcrumb>
 *   <BreadcrumbItem href="#">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="#">CRM</BreadcrumbItem>
 *   <BreadcrumbItem current>Leads</BreadcrumbItem>
 * </Breadcrumb>
 */

import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ children, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {children}
    </nav>
  );
}

interface BreadcrumbItemProps {
  children: React.ReactNode;
  href?: string;
  current?: boolean;
  onClick?: () => void;
}

export function BreadcrumbItem({ children, href = '#', current = false, onClick }: BreadcrumbItemProps) {
  if (current) {
    return <span className="text-neutral-900 dark:text-white">{children}</span>;
  }

  return (
    <>
      <a 
        href={href}
        onClick={onClick}
        className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {children}
      </a>
      <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
    </>
  );
}
