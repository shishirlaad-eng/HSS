/**
 * REUSABLE ICON BUTTON COMPONENT
 * 
 * Standard icon button used throughout listing pages
 * Supports both simple click actions and dropdown menus
 * 
 * SPECIFICATIONS:
 * - Size: 40px × 40px (w-10 h-10)
 * - Border: 1px solid neutral-200 (dark: neutral-800)
 * - Border Radius: 8px (rounded-lg)
 * - Hover Border: primary-300 (dark: primary-700)
 * - Background: white (dark: neutral-950)
 * - Icon Size: 16px × 16px (w-4 h-4)
 * - Icon Color: neutral-600 (dark: neutral-400)
 * - Transition: all properties (transition-all)
 * 
 * USAGE:
 * Simple button:
 * <IconButton icon={Search} onClick={handleSearch} title="Search" />
 * 
 * Dropdown menu:
 * <IconButton 
 *   icon={MoreVertical} 
 *   title="More options"
 *   menuItems={[
 *     { icon: Upload, label: 'Import', onClick: handleImport },
 *     { icon: Download, label: 'Export', onClick: handleExport },
 *     { divider: true },
 *     { icon: Printer, label: 'Print', onClick: handlePrint }
 *   ]}
 * />
 */

import { LucideIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface MenuItem {
  icon?: LucideIcon;
  label?: string;
  onClick?: () => void;
  divider?: boolean;
}

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  className?: string;
  menuItems?: MenuItem[];
  borderless?: boolean;
}

export function IconButton({ 
  icon: Icon, 
  onClick, 
  title, 
  active = false, 
  className = '',
  menuItems,
  borderless = false
}: IconButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleClick = () => {
    if (menuItems && menuItems.length > 0) {
      setIsMenuOpen(!isMenuOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        title={title}
        className={`
          ${borderless ? 'w-7 h-7' : 'w-10 h-10'} 
          flex items-center justify-center 
          text-neutral-600 dark:text-neutral-400 
          ${borderless 
            ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded' 
            : `bg-white dark:bg-neutral-950 border rounded-lg ${
                active || isMenuOpen
                  ? 'border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700'
              }`
          }
          transition-all
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        <Icon className={borderless ? "w-4 h-4" : "w-5 h-5"} />
      </button>

      {/* Dropdown Menu */}
      {menuItems && menuItems.length > 0 && isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50 py-1"
        >
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div 
                  key={`divider-${index}`}
                  className="border-t border-neutral-200 dark:border-neutral-800 my-1"
                />
              );
            }

            const ItemIcon = item.icon;

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
              >
                {ItemIcon && <ItemIcon className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
