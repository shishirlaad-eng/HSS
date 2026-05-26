import { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Edit, 
  Clock, 
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  PageHeader, 
  IconButton,
  SearchBar,
  ViewModeSwitcher,
  ColumnVisibilityPanel,
  type ColumnConfig
} from './hb/listing';
import { ReadOnlyBanner } from './hb/common/ReadOnlyBanner';
import { mockStaticPages, StaticPage } from '../../mockAPI/staticPagesData';
import StaticPageEdit from './StaticPageEdit';

type ViewMode = 'grid' | 'list' | 'table';

export default function StaticPages() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pages] = useState<StaticPage[]>(mockStaticPages);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const pageColumns: ColumnConfig[] = [
    { key: 'id', label: 'Page Id' },
    { key: 'name', label: 'Page Name' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'updatedBy', label: 'Updated By' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    lastUpdated: true,
    updatedBy: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const sortedPages = useMemo(() => {
    return [...filteredPages].sort((a, b) => {
      let aVal = (a as any)[sortField] || '';
      let bVal = (b as any)[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPages, sortField, sortDirection]);

  const handleEditPage = (page: StaticPage) => {
    setSelectedPage(page);
    setShowEdit(true);
  };

  const handleBackToList = () => {
    setShowEdit(false);
    setSelectedPage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showEdit && selectedPage) {
    return (
      <StaticPageEdit 
        page={selectedPage} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Static Pages"
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Static Pages', current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onToggleColumns={() => setShowColumnPanel(!showColumnPanel)}
              placeholder="Search pages..."
            />
            <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: Download, label: 'Export CSV', onClick: () => {} },
              ]}
            />
            <ViewModeSwitcher
              currentMode={viewMode}
              onChange={setViewMode}
            />

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={pageColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>
        </PageHeader>

        {/* SYSTEM NOTICE BANNER */}
        <ReadOnlyBanner 
          message="Static pages are predefined system pages. Pages cannot be created, deleted, or renamed here." 
          className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 mb-4"
        />

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {sortedPages.map((page) => (
              <div
                key={page.id}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group shadow-sm ${
                  selectedIds.has(page.id)
                    ? 'border-primary-300 dark:border-primary-600'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
                onClick={() => handleEditPage(page)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(page.id)}
                        onChange={() => toggleSelection(page.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                        title="Select"
                      />
                    </div>

                    <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-neutral-900 dark:text-white font-semibold truncate">
                          {page.name}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono ml-auto md:ml-0">
                          {page.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{formatDate(page.lastUpdated)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{page.updatedBy}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-4" onClick={e => e.stopPropagation()}>
                    <IconButton 
                      icon={Edit}
                      borderless={true}
                      onClick={() => handleEditPage(page)}
                      title="Edit Page"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedPages.map((page) => (
              <div
                key={page.id}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group shadow-sm flex flex-col ${
                  selectedIds.has(page.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800'
                }`}
                onClick={() => handleEditPage(page)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(page.id)}
                      onChange={() => toggleSelection(page.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                      title="Select"
                    />
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
                  <p className="text-xs text-neutral-400 font-mono mb-4">
                    {page.id}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{formatDate(page.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">By {page.updatedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end items-center mt-auto" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">System Page</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DATA TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === sortedPages.length && sortedPages.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(sortedPages.map(p => p.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th 
                        onClick={() => handleSort('id')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Page Id {renderSortArrow('id')}
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Page Name {renderSortArrow('name')}
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th 
                        onClick={() => handleSort('lastUpdated')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Last Updated {renderSortArrow('lastUpdated')}
                      </th>
                    )}
                    {visibleColumns.updatedBy && (
                      <th 
                        onClick={() => handleSort('updatedBy')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Updated By {renderSortArrow('updatedBy')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {sortedPages.map((page) => (
                    <tr 
                      key={page.id} 
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                      onClick={() => handleEditPage(page)}
                    >
                      <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(page.id)}
                          onChange={() => toggleSelection(page.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </td>
                      {visibleColumns.id && (
                        <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 font-mono">
                          {page.id}
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {page.name}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.lastUpdated && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {formatDate(page.lastUpdated)}
                          </div>
                        </td>
                      )}
                      {visibleColumns.updatedBy && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                            {page.updatedBy}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div
                          className="flex items-center justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton 
                            icon={Edit}
                            borderless={true}
                            onClick={() => handleEditPage(page)}
                            title="Edit Page"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER INFO */}
        <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600 italic">
          <ShieldCheck className="w-3.5 h-3.5" />
          Predefined system pages are essential for app operations and cannot be modified at structural level.
        </div>
      </div>
    </div>
  );
}
