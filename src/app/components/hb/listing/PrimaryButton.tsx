/**
 * REUSABLE PRIMARY BUTTON COMPONENT
 * 
 * Main action button used throughout listing pages
 * 
 * SPECIFICATIONS:
 * - Height: 40px (py-2)
 * - Padding: 16px horizontal (px-4)
 * - Background: primary-600
 * - Hover Background: primary-700
 * - Active Background: primary-800
 * - Text Color: white
 * - Border Radius: 8px (rounded-lg)
 * - Icon Size: 16px × 16px (w-4 h-4)
 * - Gap between icon and text: 8px (gap-2)
 * - Transition: colors (transition-colors)
 * - Font Size: 14px (default)
 * 
 * USAGE:
 * <PrimaryButton icon={Plus} onClick={handleAdd}>Add Lead</PrimaryButton>
 * <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
 */

import { LucideIcon } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  hideTextOnMobile?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  children,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  hideTextOnMobile = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2
        bg-primary-600
        hover:bg-primary-700
        active:bg-primary-800
        text-btn-text
        rounded-lg
        transition-colors
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className={hideTextOnMobile ? 'hidden md:inline' : ''}>{children}</span>
    </button>
  );
}
