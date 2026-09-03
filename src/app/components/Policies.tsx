// ─────────────────────────────────────────────────────────────
// HSS UK — Policies (member-facing landing page)
// Read-only card grid of Terms & Conditions / Privacy Policy / any
// admin-authored policy, reached via the footer "Policies" link. Reuses the
// same card look as the admin Static Pages screen, minus admin controls.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { FileText, Clock, User as UserIcon } from 'lucide-react';
import { PageHeader, SearchBar } from './hb/listing';
import { mockStaticPages, StaticPage } from '../../mockAPI/staticPagesData';
import { formatDateTime } from '../../utils/formatDate';

export default function Policies({ onSelectPolicy }: { onSelectPolicy: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mockStaticPages.filter((page: StaticPage) =>
      page.name.toLowerCase().includes(q) || page.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Policies"
          subtitle="Privacy Policy, Terms & Conditions and other HSS UK policies."
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search policies..." />
        </PageHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPages.map(page => (
            <div
              key={page.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col"
              onClick={() => onSelectPolicy(page.id)}
            >
              <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-1">
                  {page.name}
                </h4>
                <p className="text-xs text-neutral-400 font-mono mb-4">
                  {page.id}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{formatDateTime(page.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">By {page.updatedBy}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end items-center mt-auto">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Policy</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No policies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
