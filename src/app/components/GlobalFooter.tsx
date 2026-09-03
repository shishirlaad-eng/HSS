import React from 'react';

interface GlobalFooterProps {
  isSidebarCollapsed?: boolean;
  menuOrientation?: 'vertical' | 'horizontal';
  onNavigate?: (pageId: string) => void;
}

export function GlobalFooter({ onNavigate }: GlobalFooterProps) {
  return (
    <footer
      className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800"
    >
      <div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1 text-center sm:text-left">
          <span>&copy; 2026 My HSS. All Rights Reserved.</span>
          {onNavigate && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onNavigate('policies')}
                className="underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
              >
                Policies
              </button>
            </>
          )}
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
