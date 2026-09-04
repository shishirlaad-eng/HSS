import { useState, useMemo } from 'react';
import {
  FileText,
  Edit,
  Clock,
  ShieldCheck,
  MoreVertical,
  Download,
  Plus,
} from 'lucide-react';
import {
  PageHeader,
  IconButton,
  PrimaryButton,
  SearchBar,
  useStickyListingHeader,
} from './hb/listing';
import { ReadOnlyBanner } from './hb/common/ReadOnlyBanner';
import { mockStaticPages, StaticPage } from '../../mockAPI/staticPagesData';
import { formatDateTime as sharedFormatDateTime } from '../../utils/formatDate';
import StaticPageEdit from './StaticPageEdit';

function VisibilityBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs whitespace-nowrap ${
        visible
          ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950/20 dark:text-success-400 dark:border-success-800'
          : 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
      }`}
    >
      {visible ? 'Visible' : 'Hidden'}
    </span>
  );
}

export default function StaticPages() {
  const [pages, setPages] = useState<StaticPage[]>(mockStaticPages);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const handleEditPage = (page: StaticPage) => {
    setSelectedPage(page);
    setShowEdit(true);
  };

  const handleBackToList = () => {
    setShowEdit(false);
    setSelectedPage(null);
    setShowCreate(false);
  };

  const handlePolicyCreated = (created: StaticPage) => {
    mockStaticPages.push(created);
    setPages(prev => [...prev, created]);
  };

  const handlePolicySaved = (updated: StaticPage) => {
    const idx = mockStaticPages.findIndex(p => p.id === updated.id);
    if (idx !== -1) mockStaticPages[idx] = updated;
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const formatDate = (dateString: string) => sharedFormatDateTime(dateString);

  if (showEdit && selectedPage) {
    return (
      <StaticPageEdit
        page={selectedPage}
        onBack={handleBackToList}
        onSave={handlePolicySaved}
      />
    );
  }

  if (showCreate) {
    return (
      <StaticPageEdit
        onBack={handleBackToList}
        onCreate={handlePolicyCreated}
      />
    );
  }

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Static Pages"
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Static Pages', current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search pages..."
            />
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: Download, label: 'Export CSV', onClick: () => {} },
              ]}
            />
            <PrimaryButton icon={Plus} onClick={() => setShowCreate(true)}>
              Add Policy
            </PrimaryButton>
          </div>
        </PageHeader>
        </div>

        {/* SYSTEM NOTICE BANNER */}
        <ReadOnlyBanner
          message="Static pages are predefined system pages. Pages cannot be created, deleted, or renamed here."
          className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 mb-4"
        />

        {/* GRID VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group shadow-sm flex flex-col"
              onClick={() => handleEditPage(page)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <IconButton
                    icon={Edit}
                    borderless={true}
                    onClick={() => handleEditPage(page)}
                    title="Edit Page"
                  />
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-1">
                  {page.name}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xs text-neutral-400 font-mono">
                    {page.id}
                  </p>
                  <VisibilityBadge visible={page.visible !== false} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">Last Updated {formatDate(page.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600 italic">
          <ShieldCheck className="w-3.5 h-3.5" />
          Predefined system pages are essential for app operations and cannot be modified at structural level.
        </div>
      </div>
    </div>
  );
}
