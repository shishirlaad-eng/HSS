import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Mail,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MoreVertical,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List,
  Sparkles,
  Send,
  ArrowLeft,
  Check
} from 'lucide-react';
import { 
  PageHeader, 
  SearchBar, 
  Pagination, 
  IconButton,
  ViewModeSwitcher,
  PrimaryButton,
  ColumnVisibilityPanel,
  type ColumnConfig
} from './hb/listing';
import { 
  FormSection, 
  FormField, 
  FormLabel, 
  FormInput, 
  FormSelect 
} from './hb/common/Form';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';

export interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  category: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  content: string;
}

interface RichEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

function RichEditor({ initialValue, onChange, editorRef }: RichEditorProps) {
  const localRef = useRef(initialValue);

  // Initialize content editable HTML once on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, []);

  // Sync editor content when initialValue changes externally (e.g. template switch)
  useEffect(() => {
    if (editorRef.current) {
      if (localRef.current !== initialValue) {
        editorRef.current.innerHTML = initialValue;
        localRef.current = initialValue;
      }
    }
  }, [initialValue]);

  return (
    <div
      ref={editorRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={(e) => {
        const html = e.currentTarget.innerHTML;
        localRef.current = html;
        onChange(html);
      }}
      className="w-full p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 leading-relaxed prose dark:prose-invert max-w-none shadow-inner"
      style={{ outline: 'none' }}
      placeholder="Write your email contents here..."
    />
  );
}

const initialTemplates: EmailTemplateItem[] = [
  {
    id: 'TPL-001',
    name: 'User Welcome Email',
    subject: 'Welcome to {company_name}, {user_name}!',
    category: 'Onboarding',
    status: 'active',
    lastUpdated: '2024-03-01',
    content: '<h2>Welcome Aboard!</h2>\n<p>Hi {user_name},</p>\n<p>We are thrilled to have you join us at <strong>{company_name}</strong>. Your account has been successfully provisioned and you are ready to begin exploring our platform features.</p>\n<p>If you have any initial questions, feel free to drop by our support center.</p>\n<p>Best regards,<br/>The {company_name} Team</p>'
  },
  {
    id: 'TPL-002',
    name: 'Password Reset Request',
    subject: 'Action Required: Reset your password',
    category: 'Security',
    status: 'active',
    lastUpdated: '2024-03-05',
    content: '<h2>Password Reset Request</h2>\n<p>Hello {user_name},</p>\n<p>We received a request to reset the password associated with your account. If you made this request, please click the secure link below to proceed:</p>\n<p><a href="{reset_link}">Reset My Password</a></p>\n<p>If you did not request this change, please ignore this email or contact support immediately.</p>'
  },
  {
    id: 'TPL-003',
    name: 'Event Invitation Notification',
    subject: 'You have been invited to an upcoming event!',
    category: 'Events',
    status: 'active',
    lastUpdated: '2024-03-10',
    content: '<h2>New Event Invitation</h2>\n<p>Hi {user_name},</p>\n<p>You have been formally invited to participate in an exciting upcoming session. Check out the dashboard to view the complete schedule, confirm your RSVP, and review session resources.</p>\n<p>We look forward to seeing you there!</p>'
  },
  {
    id: 'TPL-004',
    name: 'Monthly Account Statement',
    subject: 'Your Monthly Activity Summary',
    category: 'Billing',
    status: 'inactive',
    lastUpdated: '2024-02-15',
    content: '<h2>Monthly Activity Summary</h2>\n<p>Dear {user_name},</p>\n<p>Your continuous activity summary for the preceding operational month is now available for download under your account portal.</p>'
  },
];

export default function EmailTemplates() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [templates, setTemplates] = useState<EmailTemplateItem[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value: string = '') => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setActiveTemplate(prev => prev ? { ...prev, content: html } : null);
    }
  };

  const templateColumns: ColumnConfig[] = [
    { key: 'id', label: 'Template Id' },
    { key: 'name', label: 'Template Name' },
    { key: 'subject', label: 'Subject Line' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    subject: true,
    category: true,
    status: true,
    lastUpdated: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Split Screen view/edit state
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplateItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const processedTemplates = useMemo(() => {
    let result = templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let aVal = a[sortField as keyof EmailTemplateItem] || '';
      let bVal = b[sortField as keyof EmailTemplateItem] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [templates, searchQuery, sortField, sortDirection]);

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedTemplates.slice(start, start + itemsPerPage);
  }, [processedTemplates, currentPage]);

  const totalPages = Math.ceil(processedTemplates.length / itemsPerPage);

  const renderStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
        isActive 
          ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs font-medium capitalize">{status}</span>
      </span>
    );
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  const handleCreate = () => {
    const newId = `TPL-${String(templates.length + 1).padStart(3, '0')}`;
    setActiveTemplate({
      id: newId,
      name: 'New Custom Template',
      subject: 'Notification from {company_name}',
      category: 'General',
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      content: '<h2>Hello {user_name},</h2>\n<p>Enter your customized email message here...</p>'
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!activeTemplate || !activeTemplate.name || !activeTemplate.subject) {
      toast.error('Please enter valid template name and subject.');
      return;
    }

    const exists = templates.some(t => t.id === activeTemplate.id);
    if (exists) {
      setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? activeTemplate : t));
    } else {
      setTemplates(prev => [...prev, activeTemplate]);
    }

    toast.success('Email template layout updated successfully.');
    setActiveTemplate(null);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this email layout?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template removed.');
    }
  };

  const insertPlaceholder = (code: string) => {
    if (!activeTemplate) return;
    editorRef.current?.focus();
    document.execCommand('insertText', false, ` ${code} `);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setActiveTemplate(prev => prev ? { ...prev, content: html } : null);
    } else {
      setActiveTemplate({
        ...activeTemplate,
        content: activeTemplate.content + ` ${code} `
      });
    }
    toast.success(`Inserted placeholder: ${code}`);
  };

  const insertTag = (startTag: string, endTag: string = '') => {
    if (!activeTemplate) return;
    setActiveTemplate({
      ...activeTemplate,
      content: activeTemplate.content + `\n${startTag}Sample Text${endTag}`
    });
  };

  // Dynamically interpret simple tags for realistic split screen preview
  const renderLivePreviewHTML = (rawContent: string, subjectLine: string) => {
    // Replace dummy variables for lively feel
    let filledSubject = subjectLine
      .replace(/{company_name}/g, 'FadeOut Social')
      .replace(/{user_name}/g, 'Sarah Johnson');

    let html = rawContent
      .replace(/{company_name}/g, '<strong>FadeOut Social</strong>')
      .replace(/{user_name}/g, 'Sarah Johnson')
      .replace(/{reset_link}/g, 'https://example.com/reset');

    // Convert basic newlines if not starting with HTML tags
    let lines = html.split('\n');
    let outputHtml = lines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<p') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    }).join('\n');

    return { filledSubject, outputHtml };
  };

  // ===================== SPLIT SCREEN DETAILS/EDIT VIEW =====================
  if (activeTemplate) {
    const previewData = renderLivePreviewHTML(activeTemplate.content, activeTemplate.subject);

    return (
      <div className="p-6 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
        <div className="max-w-[100%] mx-auto">
          {/* Top Bar inside edit mode */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTemplate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Back to Templates"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {isEditing ? 'Editing Template Layout' : 'Template Workspace'}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    {activeTemplate.id}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">Customize real-time contents and review responsiveness</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTemplate(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Discard
              </button>
              <PrimaryButton icon={Send} onClick={handleSaveTemplate}>
                Save Layout
              </PrimaryButton>
            </div>
          </div>

          {/* Custom Split Screen Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SECTION: RICH TEXT EDITOR LAYOUT */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5 text-primary-500" />
                  Editor Workspace
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Category:</span>
                  <FormSelect 
                    value={activeTemplate.category} 
                    onChange={e => setActiveTemplate({...activeTemplate, category: e.target.value})}
                    className="h-7 text-xs py-0 px-2 w-28"
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="Security">Security</option>
                    <option value="Events">Events</option>
                    <option value="Billing">Billing</option>
                    <option value="General">General</option>
                  </FormSelect>
                </div>
              </div>

              <div className="space-y-4">
                <FormField>
                  <FormLabel required>Template Name</FormLabel>
                  <FormInput
                    value={activeTemplate.name}
                    onChange={e => setActiveTemplate({...activeTemplate, name: e.target.value})}
                    placeholder="e.g. Welcome Message"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Subject Line</FormLabel>
                  <FormInput
                    value={activeTemplate.subject}
                    onChange={e => setActiveTemplate({...activeTemplate, subject: e.target.value})}
                    placeholder="Subject header..."
                  />
                  <p className="mt-1 text-[10px] text-neutral-400">Supports variable replacements like {"{company_name}"}</p>
                </FormField>

                {/* Customized Toolbar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="mb-0">Message Body</FormLabel>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Rich output active
                    </span>
                  </div>

                  {/* Formatting Tool Buttons */}
                  <div className="flex flex-wrap items-center gap-1 bg-neutral-50 dark:bg-neutral-950 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => executeCommand('formatBlock', '<h2>')}
                      className="px-2 py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('bold')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Bold Text"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('italic')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Italic Text"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('underline')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Underline Text"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
 
                    <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
 
                    <button
                      type="button"
                      onClick={() => executeCommand('justifyLeft')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('justifyCenter')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('justifyRight')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
 
                    <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
 
                    <button
                      type="button"
                      onClick={() => executeCommand('insertUnorderedList')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCommand('insertOrderedList')}
                      className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                  </div>
 
                  {/* Variables Insertion Palette */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-neutral-400">Variables:</span>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{user_name}')}
                      className="px-2 py-0.5 text-[10px] font-mono bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900 rounded hover:bg-primary-100 transition-colors"
                    >
                      + {"{user_name}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{company_name}')}
                      className="px-2 py-0.5 text-[10px] font-mono bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900 rounded hover:bg-primary-100 transition-colors"
                    >
                      + {"{company_name}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{reset_link}')}
                      className="px-2 py-0.5 text-[10px] font-mono bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900 rounded hover:bg-primary-100 transition-colors"
                    >
                      + {"{reset_link}"}
                    </button>
                  </div>
 
                  <RichEditor
                    initialValue={activeTemplate.content}
                    onChange={(html) => setActiveTemplate(prev => prev ? { ...prev, content: html } : null)}
                    editorRef={editorRef}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SECTION: LIVE PREVIEW PANEL */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-neutral-200/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex-1 flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-300 dark:border-neutral-800">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Live Preview Viewport
                    </span>
                    <span className="text-[10px] bg-white dark:bg-neutral-900 px-2 py-0.5 rounded text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                      Desktop Client Mode
                    </span>
                  </div>

                  {/* Rendered Container Frame Simulating Web Client */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
                    {/* Simulated Subject Header line */}
                    <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="text-[10px] text-neutral-400 uppercase">Subject Line Preview</div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate mt-0.5">
                        {previewData.filledSubject || <span className="text-neutral-400 italic">No subject</span>}
                      </div>
                    </div>

                    {/* Email Envelope Spacer Layout */}
                    <div className="p-5 text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed max-h-[360px] overflow-y-auto space-y-3.5 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-primary-600 [&>h2]:dark:text-primary-400 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-1 [&>p>a]:text-primary-600 [&>p>a]:underline">
                      <div dangerouslySetInnerHTML={{ __html: previewData.outputHtml }} />
                    </div>

                    {/* Standard Email Footer Spacer */}
                    <div className="bg-neutral-50 dark:bg-neutral-950/60 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 text-center">
                      Delivered securely via enterprise notification infrastructure.<br />
                      Unsubscribe options available under profile setup.
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-300 dark:border-neutral-900 text-[10px] text-neutral-500 italic text-center">
                  Changes rendered instantly to evaluate structural integrity and variables injection alignment.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ===================== STANDARD LISTING SCREENS =====================
  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Email Templates"
          subtitle="Configure transactional and notification correspondence schemas"
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Email Templates', current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onToggleColumns={() => setShowColumnPanel(!showColumnPanel)}
              placeholder="Search layouts..."
            />
            
            <PrimaryButton icon={Plus} onClick={handleCreate}>
              Add Template
            </PrimaryButton>

            <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />

            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: Download, label: 'Export', onClick: () => {} },
              ]}
            />

            <ViewModeSwitcher
              currentMode={viewMode}
              onChange={setViewMode}
            />

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={templateColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>
        </PageHeader>

        {/* ========== CARD VIEW DEFAULT ========== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {paginatedTemplates.length > 0 ? (
              paginatedTemplates.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[170px] ${
                    selectedIds.has(item.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                  }`}
                  onClick={() => {
                    setActiveTemplate(item);
                    setIsEditing(false);
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {item.id} • {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Minimalist Action Menu (Borderless) */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          title="Select"
                        />
                        <IconButton
                          icon={MoreVertical}
                          borderless={true}
                          title="Actions"
                          menuItems={[
                            { icon: Eye, label: 'Preview Split View', onClick: () => { setActiveTemplate(item); setIsEditing(false); } },
                            { icon: Edit, label: 'Edit Custom Layout', onClick: () => { setActiveTemplate(item); setIsEditing(true); } },
                            { divider: true },
                            { icon: Trash2, label: 'Delete Template', onClick: () => handleDelete(item.id) },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-50 dark:border-neutral-900">
                      <div className="text-[10px] text-neutral-400 uppercase">Subject Header:</div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 mt-0.5">
                        {item.subject}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Select/Status indicator */}
                  <div className="flex justify-end items-center pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No matching layout schemas found.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== LIST VIEW ========== */}
        {viewMode === 'list' && (
          <div className="space-y-2 mt-4">
            {paginatedTemplates.length > 0 ? (
              paginatedTemplates.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                    selectedIds.has(item.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/10'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => {
                    setActiveTemplate(item);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox placed at extreme LEFT position */}
                    <div onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        title="Select"
                      />
                    </div>

                    <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <div className="min-w-[180px]">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.id} • {item.category}
                        </span>
                      </div>

                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate flex-1">
                        Subject: {item.subject}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                    <IconButton
                      icon={MoreVertical}
                      borderless={true}
                      title="Actions"
                      menuItems={[
                        { icon: Eye, label: 'Preview Split View', onClick: () => { setActiveTemplate(item); setIsEditing(false); } },
                        { icon: Edit, label: 'Edit Custom Layout', onClick: () => { setActiveTemplate(item); setIsEditing(true); } },
                        { divider: true },
                        { icon: Trash2, label: 'Delete Template', onClick: () => handleDelete(item.id) },
                      ]}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No matching template schemas found.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== DATA TABLE VIEW (STICKY HEADER SCROLLING LAYOUT) ========== */}
        {viewMode === 'table' && (
          <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {/* Standardized Checkbox inside FIRST column */}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedTemplates.length && paginatedTemplates.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginatedTemplates.map(t => t.id)));
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
                        Template Id {renderSortIndicator('id')}
                      </th>
                    )}

                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Template Name {renderSortIndicator('name')}
                      </th>
                    )}

                    {visibleColumns.subject && (
                      <th 
                        onClick={() => handleSort('subject')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Subject Line {renderSortIndicator('subject')}
                      </th>
                    )}

                    {visibleColumns.category && (
                      <th 
                        onClick={() => handleSort('category')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Category {renderSortIndicator('category')}
                      </th>
                    )}

                    {visibleColumns.status && (
                      <th 
                        onClick={() => handleSort('status')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Status {renderSortIndicator('status')}
                      </th>
                    )}

                    {visibleColumns.lastUpdated && (
                      <th 
                        onClick={() => handleSort('lastUpdated')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Last Updated {renderSortIndicator('lastUpdated')}
                      </th>
                    )}

                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedTemplates.length > 0 ? (
                    paginatedTemplates.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTemplate(item);
                          setIsEditing(false);
                        }}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-3.5 text-sm font-mono text-primary-600 dark:text-primary-400 font-medium">
                            {item.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">
                            {item.name}
                          </td>
                        )}
                        {visibleColumns.subject && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">
                            {item.subject}
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                            {item.category}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-3.5">
                            {renderStatusBadge(item.status)}
                          </td>
                        )}
                        {visibleColumns.lastUpdated && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                            {new Date(item.lastUpdated).toLocaleDateString('en-GB')}
                          </td>
                        )}
                        <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={Eye}
                              borderless={true}
                              onClick={() => { setActiveTemplate(item); setIsEditing(false); }}
                              title="Preview Split Screen"
                            />
                            <IconButton
                              icon={Edit}
                              borderless={true}
                              onClick={() => { setActiveTemplate(item); setIsEditing(true); }}
                              title="Edit Custom Layout"
                            />
                            <IconButton
                              icon={Trash2}
                              borderless={true}
                              onClick={() => handleDelete(item.id)}
                              title="Delete Template"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-6 py-16 text-center text-sm text-neutral-500">
                          No templates found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== SEPARATE PAGINATION FOOTER ========== */}
        <div className="mt-6">
          {processedTemplates.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={processedTemplates.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

      </div>
    </div>
  );
}
