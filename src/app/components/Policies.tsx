// ─────────────────────────────────────────────────────────────
// HSS UK — Policies (member-facing landing page)
// Read-only list of the Visible policies (Terms & Conditions, Privacy Policy and any
// admin-added policy). Each title is a link: it opens the policy page, or redirects to
// the policy's external URL / PDF when one is configured. Publicly reachable at /policies.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { PageHeader, SearchBar } from './hb/listing';
import { mockStaticPages, StaticPage, policyPath } from '../../mockAPI/staticPagesData';
import { formatDateTime } from '../../utils/formatDate';

export default function Policies({ onSelectPolicy }: { onSelectPolicy: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mockStaticPages.filter((page: StaticPage) =>
      page.visible !== false && page.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="px-6 pt-2 pb-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Policies"
          subtitle="Privacy Policy, Terms & Conditions and other HSS UK policies."
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search policies..." />
        </PageHeader>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPages.map(page => (
            <div
              key={page.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800 rounded-lg p-5 hover:shadow-md transition-all shadow-sm flex flex-col"
            >
              <h4 className="text-base font-semibold mb-3">
                {page.externalUrl ? (
                  <a
                    href={page.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-700 dark:text-primary-400 hover:underline"
                  >
                    {page.name}
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                ) : (
                  <a
                    href={policyPath(page)}
                    onClick={e => { e.preventDefault(); onSelectPolicy(page.id); }}
                    className="text-primary-700 dark:text-primary-400 hover:underline"
                  >
                    {page.name}
                  </a>
                )}
              </h4>

              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-auto">
                <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>Last reviewed {formatDateTime(page.lastReviewedDate)}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No policies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
