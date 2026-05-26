/**
 * REUSABLE SECONDARY BUTTON COMPONENT
 * 
 * Secondary action button (bordered style)
 * 
 * SPECIFICATIONS:
 * - Height: 40px (py-2)
 * - Padding: 16px horizontal (px-4)
 * - Border: 1px solid neutral-300 (dark: neutral-700)
 * - Text Color: neutral-700 (dark: neutral-300)
 * - Hover Background: neutral-50 (dark: neutral-900)
 * - Border Radius: 8px (rounded-lg)
 * - Icon Size: 16px × 16px (w-4 h-4)
 * - Gap: 8px (gap-2)
 * - Transition: colors (transition-colors)
 * 
 * USAGE:
 * <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
 * <SecondaryButton icon={Download}>Export</SecondaryButton>
 */

import { LucideIcon } from 'lucide-react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export function SecondaryButton({ 
  children, 
  icon: Icon, 
  onClick, 
  type = 'button',
  className = '' 
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-4 py-2 
        border border-neutral-300 dark:border-neutral-700 
        text-neutral-700 dark:text-neutral-300 
        hover:bg-neutral-50 dark:hover:bg-neutral-900 
        rounded-lg 
        transition-colors 
        flex items-center justify-center gap-2
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
