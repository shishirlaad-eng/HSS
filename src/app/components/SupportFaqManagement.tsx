import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  RefreshCw,
  Trash2,
  MoreVertical,
  HelpCircle,
  X,
  AlertTriangle,
  ChevronDown,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MODULE_SUBMODULE_LIST,
  FAQItem,
  getFAQItems,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem,
  getSubmodulesForModule,
  FAQ_UPDATE_EVENT,
} from '../../mockAPI/faqData';

type SortColumn = 'moduleName' | 'submoduleName' | 'question' | 'status';
type SortDirection = 'asc' | 'desc';

export default function SupportFaqManagement() {
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getFAQItems());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter Popover states
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('moduleName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Active action menu row ID
  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Selected FAQ for View/Edit/Status change/Delete
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);

  // Add/Edit Form State
  const [formModule, setFormModule] = useState('');
  const [formSubmodule, setFormSubmodule] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync state on updates / storage events
  useEffect(() => {
    const handleUpdate = () => {
      setFaqs(getFAQItems());
    };
    window.addEventListener(FAQ_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(FAQ_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moduleDropdownRef.current &&
        !moduleDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModuleDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActionMenuRowId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Distinct Module names for dropdown
  const allModules = useMemo(() => {
    const map = new Set<string>();
    MODULE_SUBMODULE_LIST.forEach((m) => map.add(m.moduleName));
    return Array.from(map).sort();
  }, []);

  // Dynamic Submodules for Add/Edit Form based on selected module
  const dynamicSubmodules = useMemo(() => {
    if (!formModule) return [];
    return getSubmodulesForModule(formModule);
  }, [formModule]);

  // Handle module multi-select toggle
  const toggleModuleSelection = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
    setCurrentPage(1);
  };

  const selectAllModules = () => {
    setSelectedModules([]);
    setCurrentPage(1);
  };

  // Filtered & Sorted FAQs
  const filteredFaqs = useMemo(() => {
    let result = [...faqs];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.moduleName.toLowerCase().includes(q) ||
          f.submoduleName.toLowerCase().includes(q)
      );
    }

    // Module filter
    if (selectedModules.length > 0) {
      result = result.filter((f) => selectedModules.includes(f.moduleName));
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortColumn] || '';
      let valB = b[sortColumn] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [faqs, searchQuery, selectedModules, statusFilter, sortColumn, sortDirection]);

  // Pagination calculation
  const totalItems = filteredFaqs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const currentFaqsPage = useMemo(() => {
    return filteredFaqs.slice(startIndex, endIndex);
  }, [filteredFaqs, startIndex, endIndex]);

  // Handle sorting toggle
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormModule('');
    setFormSubmodule('');
    setFormQuestion('');
    setFormAnswer('');
    setFormStatus('active');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setFormModule(faq.moduleName);
    setFormSubmodule(faq.submoduleName);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormStatus(faq.status);
    setFormErrors({});
    setIsEditModalOpen(true);
    setActionMenuRowId(null);
  };

  // Open View Modal
  const handleOpenViewModal = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setIsViewModalOpen(true);
    setActionMenuRowId(null);
  };

  // Open Status Confirmation
  const handleOpenStatusConfirm = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setIsStatusConfirmOpen(true);
    setActionMenuRowId(null);
  };

  // Open Delete Confirmation
  const handleOpenDeleteConfirm = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setIsDeleteConfirmOpen(true);
    setActionMenuRowId(null);
  };

  // Validate Add/Edit form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formModule) errors.module = 'Module name is required.';
    if (!formSubmodule) errors.submodule = 'Sub-module name is required.';
    if (!formQuestion.trim()) errors.question = 'Question is required.';
    if (!formAnswer.trim()) errors.answer = 'Answer is required.';
    return errors;
  };

  // Submit Add FAQ
  const handleCreateFaq = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields.');
      return;
    }

    const subItem = MODULE_SUBMODULE_LIST.find(
      (m) => m.moduleName === formModule && m.submoduleName === formSubmodule
    );
    const moduleSubmoduleId =
      subItem?.id || `${formModule.toLowerCase().replace(/\s+/g, '-')}:${formSubmodule.toLowerCase().replace(/\s+/g, '-')}`;

    addFAQItem({
      moduleSubmoduleId,
      moduleId: subItem?.moduleId || formModule.toLowerCase().replace(/\s+/g, '-'),
      moduleName: formModule,
      submoduleId: subItem?.submoduleId || formSubmodule.toLowerCase().replace(/\s+/g, '-'),
      submoduleName: formSubmodule,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      status: formStatus,
    });

    toast.success('FAQ created successfully.');
    setIsAddModalOpen(false);
  };

  // Submit Edit FAQ
  const handleUpdateFaq = () => {
    if (!selectedFaq) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields.');
      return;
    }

    const subItem = MODULE_SUBMODULE_LIST.find(
      (m) => m.moduleName === formModule && m.submoduleName === formSubmodule
    );
    const moduleSubmoduleId =
      subItem?.id || `${formModule.toLowerCase().replace(/\s+/g, '-')}:${formSubmodule.toLowerCase().replace(/\s+/g, '-')}`;

    updateFAQItem(selectedFaq.id, {
      moduleSubmoduleId,
      moduleId: subItem?.moduleId || formModule.toLowerCase().replace(/\s+/g, '-'),
      moduleName: formModule,
      submoduleId: subItem?.submoduleId || formSubmodule.toLowerCase().replace(/\s+/g, '-'),
      submoduleName: formSubmodule,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      status: formStatus,
    });

    toast.success('FAQ updated successfully.');
    setIsEditModalOpen(false);
  };

  // Confirm Status Change
  const handleConfirmStatusChange = () => {
    if (!selectedFaq) return;
    const targetStatus = selectedFaq.status === 'active' ? 'inactive' : 'active';
    updateFAQItem(selectedFaq.id, { status: targetStatus });
    toast.success(`FAQ marked as ${targetStatus === 'active' ? 'Active' : 'Inactive'}.`);
    setIsStatusConfirmOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedFaq) return;
    deleteFAQItem(selectedFaq.id);
    toast.success('FAQ deleted successfully.');
    setIsDeleteConfirmOpen(false);
  };

  // Render sorting arrow icon
  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 space-y-6">
      {/* ── Heading Row (matching Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Manage contextual help questions and answers displayed throughout the application.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New FAQ
        </button>
      </div>

      {/* ── Search & Filter Bar (matching Screenshot 1) ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by question, answer, or module..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters dropdowns */}
        <div className="flex items-center gap-3">
          {/* Modules multi-select filter */}
          <div className="relative" ref={moduleDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsModuleDropdownOpen(!isModuleDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className="inline-flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <span className="text-neutral-500 dark:text-neutral-400 font-normal">Modules:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {selectedModules.length === 0 || selectedModules.length === allModules.length
                  ? 'All'
                  : selectedModules.length === 1
                  ? selectedModules[0]
                  : `${selectedModules.length} selected`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isModuleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-30 p-2 text-sm max-h-72 overflow-y-auto slim-scroll">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Filter by Module
                  </span>
                  <button
                    onClick={selectAllModules}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Select All
                  </button>
                </div>
                {allModules.map((mod) => {
                  const isChecked = selectedModules.includes(mod);
                  return (
                    <label
                      key={mod}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer text-neutral-700 dark:text-neutral-300"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModuleSelection(mod)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                      <span className="text-xs font-medium leading-none">{mod}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status filter dropdown */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsModuleDropdownOpen(false);
              }}
              className="inline-flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <span className="text-neutral-500 dark:text-neutral-400 font-normal">Status:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
                {statusFilter}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-30 p-1.5 text-sm">
                {(['all', 'active', 'inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setIsStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      statusFilter === st
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="capitalize">{st}</span>
                    {statusFilter === st && <Check className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-200" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table (matching Screenshot 1) ── */}
      <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <th
                onClick={() => handleSort('moduleName')}
                className="px-4 py-3.5 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Module Name</span>
                  {renderSortIcon('moduleName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('submoduleName')}
                className="px-4 py-3.5 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sub-module Name</span>
                  {renderSortIcon('submoduleName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('question')}
                className="px-4 py-3.5 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors select-none max-w-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span>Question</span>
                  {renderSortIcon('question')}
                </div>
              </th>
              <th className="px-4 py-3.5 select-none max-w-sm">
                <span>Answer</span>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3.5 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th className="px-4 py-3.5 text-right select-none">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {currentFaqsPage.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                  <HelpCircle className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No frequently asked questions found</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    Try adjusting your search criteria, module filter, or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              currentFaqsPage.map((faq) => (
                <tr
                  key={faq.id}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors group"
                >
                  {/* Module Name */}
                  <td className="px-4 py-3.5 font-semibold text-neutral-900 dark:text-white whitespace-nowrap text-sm">
                    {faq.moduleName}
                  </td>

                  {/* Sub-module Name */}
                  <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-300 whitespace-nowrap text-sm">
                    {faq.submoduleName}
                  </td>

                  {/* Question */}
                  <td className="px-4 py-3.5 font-medium text-neutral-900 dark:text-white text-sm max-w-xs">
                    <span className="line-clamp-2" title={faq.question}>
                      {faq.question}
                    </span>
                  </td>

                  {/* Answer */}
                  <td className="px-4 py-3.5 text-neutral-500 dark:text-neutral-400 text-xs max-w-sm">
                    <span className="line-clamp-1 truncate block" title={faq.answer}>
                      {faq.answer}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {faq.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions Dropdown Button */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuRowId(actionMenuRowId === faq.id ? null : faq.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Row actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {actionMenuRowId === faq.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-4 top-10 w-40 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-40 p-1 text-sm text-left animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          onClick={() => handleOpenViewModal(faq)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-500" />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(faq)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenStatusConfirm(faq)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                          Change Status
                        </button>
                        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                        <button
                          onClick={() => handleOpenDeleteConfirm(faq)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-error-500" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer (matching Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems}
        </div>

        <div className="flex items-center gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                    validCurrentPage === pageNum
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="text-neutral-400 text-xs px-1">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                    validCurrentPage === totalPages
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: Add New FAQ (matching Screenshot 2) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                    Add New FAQ
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Create a new contextual FAQ for your application
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto slim-scroll">
              {/* Module Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Module Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formModule}
                    onChange={(e) => {
                      const mod = e.target.value;
                      setFormModule(mod);
                      const submodules = getSubmodulesForModule(mod);
                      if (submodules.length === 1) {
                        setFormSubmodule(submodules[0].submoduleName);
                      } else {
                        setFormSubmodule('');
                      }
                      setFormErrors((prev) => ({ ...prev, module: '', submodule: '' }));
                    }}
                    className={`w-full h-10 px-3 pr-9 bg-white dark:bg-neutral-950 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white ${
                      formErrors.module ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <option value="" disabled>Select a Module...</option>
                    {allModules.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.module && <p className="text-xs text-error-500 mt-1">{formErrors.module}</p>}
              </div>

              {/* Sub-module Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sub-module Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formSubmodule}
                    disabled={!formModule}
                    onChange={(e) => {
                      setFormSubmodule(e.target.value);
                      setFormErrors((prev) => ({ ...prev, submodule: '' }));
                    }}
                    className={`w-full h-10 px-3 pr-9 bg-white dark:bg-neutral-950 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white disabled:bg-neutral-50 dark:disabled:bg-neutral-900/60 disabled:text-neutral-400 disabled:cursor-not-allowed ${
                      formErrors.submodule ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <option value="" disabled>
                      {formModule ? 'Select a Sub-module...' : 'Select a Module first...'}
                    </option>
                    {dynamicSubmodules.map((sub) => (
                      <option key={sub.id} value={sub.submoduleName}>
                        {sub.submoduleName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.submodule && <p className="text-xs text-error-500 mt-1">{formErrors.submodule}</p>}
              </div>

              {/* Question */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Question <span className="text-error-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {formQuestion.length} / 500
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={500}
                  value={formQuestion}
                  onChange={(e) => {
                    setFormQuestion(e.target.value);
                    setFormErrors((prev) => ({ ...prev, question: '' }));
                  }}
                  placeholder="e.g. How do I read the dashboard summary cards?"
                  className={`w-full h-10 px-3 bg-white dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white placeholder:text-neutral-400 ${
                    formErrors.question ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                />
                {formErrors.question && <p className="text-xs text-error-500 mt-1">{formErrors.question}</p>}
              </div>

              {/* Answer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Answer <span className="text-error-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {formAnswer.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formAnswer}
                  onChange={(e) => {
                    setFormAnswer(e.target.value);
                    setFormErrors((prev) => ({ ...prev, answer: '' }));
                  }}
                  placeholder="Provide a clear, helpful explanation (up to 1,000 characters)..."
                  className={`w-full p-3 bg-white dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-y ${
                    formErrors.answer ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                />
                {formErrors.answer && <p className="text-xs text-error-500 mt-1">{formErrors.answer}</p>}
              </div>

              {/* Status Segmented Control (matching Screenshot 2) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      formStatus === 'active'
                        ? 'bg-[#22c55e] text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('inactive')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      formStatus === 'inactive'
                        ? 'bg-neutral-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    INACTIVE
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
                  Controls whether this question is displayed in contextual help popovers.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFaq}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Create FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit FAQ (matching Screenshot 5) ── */}
      {isEditModalOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                    Edit FAQ
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Update frequently asked question content
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto slim-scroll">
              {/* Module Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Module Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formModule}
                    onChange={(e) => {
                      const mod = e.target.value;
                      setFormModule(mod);
                      const submodules = getSubmodulesForModule(mod);
                      if (submodules.length === 1) {
                        setFormSubmodule(submodules[0].submoduleName);
                      } else {
                        setFormSubmodule('');
                      }
                      setFormErrors((prev) => ({ ...prev, module: '', submodule: '' }));
                    }}
                    className={`w-full h-10 px-3 pr-9 bg-white dark:bg-neutral-950 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white ${
                      formErrors.module ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {allModules.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.module && <p className="text-xs text-error-500 mt-1">{formErrors.module}</p>}
              </div>

              {/* Sub-module Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sub-module Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formSubmodule}
                    onChange={(e) => {
                      setFormSubmodule(e.target.value);
                      setFormErrors((prev) => ({ ...prev, submodule: '' }));
                    }}
                    className={`w-full h-10 px-3 pr-9 bg-white dark:bg-neutral-950 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white ${
                      formErrors.submodule ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {dynamicSubmodules.map((sub) => (
                      <option key={sub.id} value={sub.submoduleName}>
                        {sub.submoduleName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.submodule && <p className="text-xs text-error-500 mt-1">{formErrors.submodule}</p>}
              </div>

              {/* Question */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Question <span className="text-error-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {formQuestion.length} / 500
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={500}
                  value={formQuestion}
                  onChange={(e) => {
                    setFormQuestion(e.target.value);
                    setFormErrors((prev) => ({ ...prev, question: '' }));
                  }}
                  className={`w-full h-10 px-3 bg-white dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white ${
                    formErrors.question ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                />
                {formErrors.question && <p className="text-xs text-error-500 mt-1">{formErrors.question}</p>}
              </div>

              {/* Answer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Answer <span className="text-error-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {formAnswer.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formAnswer}
                  onChange={(e) => {
                    setFormAnswer(e.target.value);
                    setFormErrors((prev) => ({ ...prev, answer: '' }));
                  }}
                  className={`w-full p-3 bg-white dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white resize-y ${
                    formErrors.answer ? 'border-error-500 ring-1 ring-error-500/20' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                />
                {formErrors.answer && <p className="text-xs text-error-500 mt-1">{formErrors.answer}</p>}
              </div>

              {/* Status Segmented Control */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      formStatus === 'active'
                        ? 'bg-[#22c55e] text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('inactive')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      formStatus === 'inactive'
                        ? 'bg-neutral-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    INACTIVE
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
                  Controls whether this question is displayed in contextual help popovers.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateFaq}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: View FAQ Details (matching Screenshot 3) ── */}
      {isViewModalOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                    View FAQ Details
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Frequently asked question specifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (matching Screenshot 3) */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto slim-scroll">
              {/* Module & Sub-module 2-column info card */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                    MODULE NAME
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-sm">
                    <Layers className="w-4 h-4 text-neutral-500" />
                    {selectedFaq.moduleName}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                    SUB-MODULE NAME
                  </span>
                  <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                    {selectedFaq.submoduleName}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
                  STATUS
                </span>
                {selectedFaq.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                    Inactive
                  </span>
                )}
              </div>

              {/* Question */}
              <div>
                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
                  QUESTION
                </span>
                <div className="p-3.5 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-900 dark:text-white text-sm leading-snug">
                  {selectedFaq.question}
                </div>
              </div>

              {/* Full Answer */}
              <div>
                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
                  FULL ANSWER
                </span>
                <div className="p-4 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedFaq.answer}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end bg-neutral-50/50 dark:bg-neutral-900/50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Change FAQ Status Confirmation (matching Screenshot 4) ── */}
      {isStatusConfirmOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Change FAQ Status
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to change the status of this FAQ to{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {selectedFaq.status === 'active' ? 'Inactive' : 'Active'}
              </span>
              ?
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsStatusConfirmOpen(false)}
                className="px-5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 w-32 transition-colors"
              >
                Cancel
              </button>

              {selectedFaq.status === 'active' ? (
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors w-36"
                >
                  Mark Inactive
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors w-36"
                >
                  Mark Active
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete FAQ Confirmation ── */}
      {isDeleteConfirmOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-50 dark:bg-error-950/40 text-error-600 dark:text-error-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Delete FAQ
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete this question? It will be permanently removed from the application and contextual support popups.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
