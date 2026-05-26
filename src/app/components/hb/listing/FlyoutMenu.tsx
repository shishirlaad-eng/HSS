/**
 * REUSABLE FLYOUT MENU COMPONENT
 * 
 * Dropdown menu that appears on hover or click
 * 
 * SPECIFICATIONS:
 * - Width: Variable (default: 224px = w-56)
 * - Background: white
 * - Border: 1px solid neutral-200
 * - Border Radius: 8px (rounded-lg)
 * - Shadow: shadow-xl
 * - Z-index: 20 (z-20)
 * - Positioned: absolute
 * - Margin Top: 8px (mt-2)
 * 
 * MENU ITEM SPECIFICATIONS:
 * - Padding: 10px 16px (py-2.5 px-4)
 * - Font Size: 14px (text-sm)
 * - Text Color: neutral-700
 * - Hover Background: neutral-50
 * - Icon Size: 16px × 16px (w-4 h-4)
 * - Gap: 8px (gap-2)
 * - Transition: colors (transition-colors)
 * - First item: rounded-t-lg
 * - Last item: rounded-b-lg
 * 
 * USAGE:
 * <FlyoutMenu position="right">
 *   <FlyoutMenuItem icon={Upload} onClick={handleImport}>Import</FlyoutMenuItem>
 *   <FlyoutMenuItem icon={Download} onClick={handleExport}>Export</FlyoutMenuItem>
 * </FlyoutMenu>
 */

import { LucideIcon, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FlyoutMenuProps {
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
  className?: string;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function FlyoutMenu({ 
  children, 
  position = 'right',
  width = 'w-56',
  className = '',
  onClose,
  trigger
}: FlyoutMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside (for trigger mode)
  useEffect(() => {
    if (!trigger || !isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, trigger]);

  // Trigger Mode
  if (trigger) {
    return (
      <div className="relative inline-block" ref={menuRef}>
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
        
        {isOpen && (
          <div 
            className={`
              absolute top-full mt-2 
              ${position === 'right' ? 'right-0' : 'left-0'}
              ${width}
              bg-white dark:bg-neutral-950
              border border-neutral-200 dark:border-neutral-800
              rounded-lg shadow-xl 
              z-20
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Controlled Mode (Legacy)
  return (
    <>
      {onClose && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={onClose}
        />
      )}
      <div 
        className={`
          absolute top-full mt-2 
          ${position === 'right' ? 'right-0' : 'left-0'}
          ${width}
          bg-white dark:bg-neutral-950
          border border-neutral-200 dark:border-neutral-800
          rounded-lg shadow-xl 
          z-20
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {children}
      </div>
    </>
  );
}

interface FlyoutMenuItemProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  hasSubmenu?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  className?: string;
  asDiv?: boolean; // New prop to render as div instead of button when needed
}

export function FlyoutMenuItem({ 
  children, 
  icon: Icon, 
  onClick, 
  hasSubmenu = false,
  onMouseEnter,
  onMouseLeave,
  roundedTop = false,
  roundedBottom = false,
  className = '',
  asDiv = false,
}: FlyoutMenuItemProps) {
  const classes = `
    w-full px-4 py-2.5 
    text-left text-sm 
    text-neutral-700 dark:text-neutral-300
    hover:bg-primary-50 dark:hover:bg-primary-950/50
    hover:text-primary-900 dark:hover:text-primary-100
    transition-colors 
    flex items-center gap-2 
    ${hasSubmenu ? 'justify-between' : ''}
    ${roundedTop ? 'rounded-t-lg' : ''}
    ${roundedBottom ? 'rounded-b-lg' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </div>
      {hasSubmenu && <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />}
    </>
  );

  // If asDiv is true or if there are interactive children, render as div
  if (asDiv) {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={classes}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classes}
    >
      {content}
    </button>
  );
}

interface FlyoutMenuDividerProps {
  className?: string;
}

export function FlyoutMenuDivider({ className = '' }: FlyoutMenuDividerProps) {
  return (
    <div className={`border-t border-neutral-200 dark:border-neutral-800 my-1 ${className}`} />
  );
}

interface NestedFlyoutProps {
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function NestedFlyout({ children, width = 'w-48', className = '' }: NestedFlyoutProps) {
  return (
    <div 
      className={`
        absolute left-full top-0 ml-1 
        ${width}
        bg-white dark:bg-neutral-950
        border border-neutral-200 dark:border-neutral-800
        rounded-lg shadow-xl 
        z-30
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
