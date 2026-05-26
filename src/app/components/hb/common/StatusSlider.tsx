import React from 'react';

interface StatusOption {
  value: string;
  label: string;
  color?: string; // Tailwind bg class
}

interface StatusSliderProps {
  value: string;
  onChange: (value: any) => void;
  options?: StatusOption[];
  className?: string;
}

const defaultOptions: StatusOption[] = [
  { value: 'active', label: 'Active', color: 'bg-success-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-neutral-400 dark:bg-neutral-600' },
];

export function StatusSlider({
  value,
  onChange,
  options = defaultOptions,
  className = ''
}: StatusSliderProps) {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const segmentWidth = 100 / options.length;

  return (
    <div className={`relative inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full h-11 border border-neutral-200 dark:border-neutral-700 shadow-inner overflow-hidden ${className}`}>
      {/* Sliding Background */}
      <div 
        className={`absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-sm ${options[activeIndex]?.color || 'bg-primary-600'}`}
        style={{ 
          width: `calc(${segmentWidth}% - 4px)`,
          left: `calc(${activeIndex * segmentWidth}% + ${activeIndex === 0 ? 4 : 2}px)` 
        }}
      />

      {/* Options */}
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative flex-1 flex items-center justify-center text-[11px] font-bold transition-colors duration-200 z-10 uppercase tracking-wider
            ${value === option.value ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
