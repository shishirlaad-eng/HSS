import React from 'react';

interface GlobalFooterProps {
  isSidebarCollapsed: boolean;
  menuOrientation: 'vertical' | 'horizontal';
}

export function GlobalFooter({ isSidebarCollapsed, menuOrientation }: GlobalFooterProps) {
  return (
    <footer 
      className={`fixed bottom-0 right-0 z-40 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${
        menuOrientation === 'horizontal'
          ? 'left-0'
          : isSidebarCollapsed
            ? 'left-16'
            : 'left-64'
      }`}
    >
      <div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="text-center sm:text-left">
          &copy; 2026 HB Admin Template. All Rights Reserved.
        </div>
        <div className="text-center sm:text-right">
          Designed and Developed by{' '}
          <a 
            href="https://www.hiddenbrains.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
          >
            Hidden Brains
          </a>
        </div>
      </div>
    </footer>
  );
}
