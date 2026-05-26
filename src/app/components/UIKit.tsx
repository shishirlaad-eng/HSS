import { useState } from 'react';
import {
  Check,
  Copy,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  Settings,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Loader2,
  ChevronRight,
  Home,
  Package,
  Tag,
  MoreVertical,
  Copy as CopyIcon,
  Archive,
  Filter,
  Calendar,
} from 'lucide-react';
import {
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Breadcrumb,
  SearchBar,
  ViewModeSwitcher,
  Pagination,
  FilterPopup,
  FilterChips,
  DateRangeFilter,
  FlyoutMenu,
  FlyoutMenuItem,
  FlyoutMenuDivider,
} from './hb/listing';
import {
  FormModal,
  FormLabel,
  FormInput,
  FormTextarea,
  FormGrid,
  FormFooter,
  FormField,
  StatCard,
} from './hb/common';
import { Button } from './ui/button';
import { Badge, StatusDot } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { toast } from 'sonner';

// Code snippet component with copy functionality
function CodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg bg-neutral-900 dark:bg-neutral-950 p-4 my-4">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="text-sm text-neutral-100 overflow-x-auto pr-12">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Section component
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-12 scroll-mt-20">
      <h2 className="mb-6">{title}</h2>
      {children}
    </div>
  );
}

// Subsection component
function Subsection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-8 scroll-mt-20">
      <h3 className="mb-2">{title}</h3>
      {description && <p className="text-muted mb-4">{description}</p>}
      {children}
    </div>
  );
}

// Example box component
function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 mb-4">
      {children}
    </div>
  );
}

export default function UIKit() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Table of contents
  const tableOfContents = [
    {
      id: 'foundations', label: 'Foundations', items: [
        { id: 'design-tokens', label: 'Design Tokens' },
        { id: 'typography', label: 'Typography' },
        { id: 'colors', label: 'Colors' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'elevation', label: 'Elevation' },
      ]
    },
    {
      id: 'components', label: 'Components', items: [
        { id: 'buttons', label: 'Buttons' },
        { id: 'form-elements', label: 'Form Elements' },
        { id: 'tables', label: 'Tables' },
        { id: 'cards', label: 'Cards' },
        { id: 'modals', label: 'Modals' },
        { id: 'alerts-toasts', label: 'Alerts & Toasts' },
        { id: 'badges-tags', label: 'Badges & Tags' },
        { id: 'iconography', label: 'Iconography' },
        { id: 'micro-components', label: 'Micro Components' },
        { id: 'hb-components', label: 'HB Components' },
        { id: 'advanced-components', label: 'Advanced Shadcn Components' },
      ]
    },
    {
      id: 'navigation', label: 'Navigation', items: [
        { id: 'nav-sidebar', label: 'Sidebar' },
        { id: 'nav-header', label: 'Header' },
        { id: 'nav-tabs', label: 'Tabs' },
        { id: 'nav-breadcrumbs', label: 'Breadcrumbs' },
      ]
    },
    {
      id: 'patterns', label: 'Patterns', items: [
        { id: 'listing-page', label: 'Listing Page' },
        { id: 'form-page', label: 'Form Page' },
        { id: 'detail-page', label: 'Detail Page' },
        { id: 'dashboard', label: 'Dashboard' },
      ]
    },
    {
      id: 'states', label: 'States', items: [
        { id: 'loading', label: 'Loading' },
        { id: 'empty', label: 'Empty' },
        { id: 'error', label: 'Error' },
        { id: 'success', label: 'Success' },
      ]
    },
    { id: 'responsive', label: 'Responsive Rules' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1>UI Kit</h1>
              <p className="text-muted mt-1">
                Comprehensive design system and component library
              </p>
            </div>
            <Button onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Export Documentation
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Table of Contents Sidebar */}
          <aside className="w-64 shrink-0 sticky top-24 h-fit">
            <nav className="space-y-1">
              {tableOfContents.map((section) => (
                <div key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    {section.label}
                  </a>
                  {section.items && (
                    <div className="ml-3 space-y-1">
                      {section.items.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="block px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-5xl">
            {/* FOUNDATIONS */}
            <Section id="foundations" title="Foundations">

              {/* Design Tokens */}
              <Subsection
                id="design-tokens"
                title="Design Tokens"
                description="Core design values used throughout the system"
              >
                <ExampleBox>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3">Border Radius</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-600 rounded"></div>
                          <span className="text-sm">default: 6px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-600 rounded-md"></div>
                          <span className="text-sm">md: 8px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-600 rounded-lg"></div>
                          <span className="text-sm">lg: 12px</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3">Shadows</h4>
                      <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-neutral-900 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm">shadow-sm</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-900 shadow rounded-lg">
                          <span className="text-sm">shadow</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-900 shadow-md rounded-lg">
                          <span className="text-sm">shadow-md</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ExampleBox>
              </Subsection>

              {/* Typography */}
              <Subsection
                id="typography"
                title="Typography"
                description="Inter font family with systematic type scale defined in globals.css"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <div>
                      <h1>Heading 1</h1>
                      <p className="text-small text-neutral-500 mt-1">32px / 40px / 700 / -0.02em</p>
                    </div>
                    <Separator />
                    <div>
                      <h2>Heading 2</h2>
                      <p className="text-small text-neutral-500 mt-1">24px / 32px / 600 / -0.01em</p>
                    </div>
                    <Separator />
                    <div>
                      <h3>Heading 3</h3>
                      <p className="text-small text-neutral-500 mt-1">18px / 26px / 600</p>
                    </div>
                    <Separator />
                    <div>
                      <h4>Heading 4</h4>
                      <p className="text-small text-neutral-500 mt-1">16px / 24px / 600</p>
                    </div>
                    <Separator />
                    <div>
                      <p>Body text - The quick brown fox jumps over the lazy dog</p>
                      <p className="text-small text-neutral-500 mt-1">14px / 22px / 400</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-lead">Lead text - Important paragraph text</p>
                      <p className="text-small text-neutral-500 mt-1">16px / 24px / 400</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-small">Small text - Helper and secondary information</p>
                      <p className="text-small text-neutral-500 mt-1">12px / 18px / 400</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted">Muted text - De-emphasized content</p>
                      <p className="text-small text-neutral-500 mt-1">14px / 20px / 400 / neutral-400</p>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Typography is defined in globals.css
// Use semantic HTML elements - NO Tailwind font classes!

<h1>Page Title</h1>           // 32px, bold
<h2>Section Heading</h2>       // 24px, semibold
<h3>Subsection</h3>            // 18px, semibold
<p>Body paragraph text</p>     // 14px, normal
<p className="text-lead">Important text</p>
<p className="text-small">Helper text</p>
<p className="text-muted">De-emphasized text</p>`} />
              </Subsection>

              {/* Colors */}
              <Subsection
                id="colors"
                title="Colors"
                description="Systematic color palette with theme support and dark mode"
              >
                <ExampleBox>
                  <div className="space-y-6">
                    {/* Primary Colors */}
                    <div>
                      <h4 className="mb-3">Primary (Indigo)</h4>
                      <div className="grid grid-cols-10 gap-2">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                          <div key={shade} className="text-center">
                            <div className={`h-12 rounded bg-primary-${shade}`}></div>
                            <span className="text-xs mt-1 block">{shade}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Neutral Colors */}
                    <div>
                      <h4 className="mb-3">Neutral (Gray)</h4>
                      <div className="grid grid-cols-10 gap-2">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                          <div key={shade} className="text-center">
                            <div className={`h-12 rounded bg-neutral-${shade} border border-neutral-200 dark:border-neutral-800`}></div>
                            <span className="text-xs mt-1 block">{shade}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Semantic Colors */}
                    <div>
                      <h4 className="mb-3">Semantic Colors</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="h-12 rounded bg-success-500"></div>
                          <span className="text-sm mt-2 block">Success</span>
                          <span className="text-xs text-neutral-500">success-500</span>
                        </div>
                        <div>
                          <div className="h-12 rounded bg-warning-500"></div>
                          <span className="text-sm mt-2 block">Warning</span>
                          <span className="text-xs text-neutral-500">warning-500</span>
                        </div>
                        <div>
                          <div className="h-12 rounded bg-error-500"></div>
                          <span className="text-sm mt-2 block">Error</span>
                          <span className="text-xs text-neutral-500">error-500</span>
                        </div>
                        <div>
                          <div className="h-12 rounded bg-info-500"></div>
                          <span className="text-sm mt-2 block">Info</span>
                          <span className="text-xs text-neutral-500">info-500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Use semantic color names from globals.css
// Supports 5 themes: natural, slate, nord, midnight, warm

// Primary
bg-primary-500 text-primary-600 border-primary-300

// Neutrals
bg-neutral-50 text-neutral-900 border-neutral-200

// Semantic
bg-success-500 text-success-600
bg-warning-500 text-warning-600
bg-error-500 text-error-600
bg-info-500 text-info-600`} />
              </Subsection>

              {/* Spacing */}
              <Subsection
                id="spacing"
                title="Spacing"
                description="Consistent spacing scale (4px base unit)"
              >
                <ExampleBox>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((space) => (
                      <div key={space} className="flex items-center gap-4">
                        <div className={`h-8 bg-primary-500 rounded`} style={{ width: `${space * 4}px` }}></div>
                        <span className="text-sm font-mono">space-{space} = {space * 4}px</span>
                      </div>
                    ))}
                  </div>
                </ExampleBox>
              </Subsection>

              {/* Elevation */}
              <Subsection
                id="elevation"
                title="Elevation"
                description="Shadow system for visual hierarchy with proper borders"
              >
                <ExampleBox>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-950 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h4 className="mb-2">Level 1 (shadow-sm)</h4>
                      <p className="text-small text-neutral-600 dark:text-neutral-400">Subtle elevation with border</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-950 shadow rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h4 className="mb-2">Level 2 (shadow)</h4>
                      <p className="text-small text-neutral-600 dark:text-neutral-400">Default cards with border</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-950 shadow-md rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h4 className="mb-2">Level 3 (shadow-md)</h4>
                      <p className="text-small text-neutral-600 dark:text-neutral-400">Elevated elements</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-950 shadow-lg rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h4 className="mb-2">Level 4 (shadow-lg)</h4>
                      <p className="text-small text-neutral-600 dark:text-neutral-400">Modals and overlays</p>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Always use borders with shadows!
// NO black borders - use neutral-200 (light) / neutral-800 (dark)

<div className="shadow-sm border border-neutral-200 dark:border-neutral-800">
  Subtle elevation
</div>

<div className="shadow-md border border-neutral-200 dark:border-neutral-800">
  Medium elevation
</div>`} />
              </Subsection>
            </Section>

            {/* COMPONENTS */}
            <Section id="components" title="Components">

              {/* Buttons */}
              <Subsection
                id="buttons"
                title="Buttons"
                description="Primary, secondary, and icon buttons following HB component specs"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3">HB Buttons (Preferred)</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <PrimaryButton icon={Plus}>Add New</PrimaryButton>
                        <SecondaryButton icon={Download}>Export</SecondaryButton>
                        <IconButton icon={Settings} title="Settings" />
                        <IconButton icon={Trash2} title="Delete" />
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-3">Shadcn/ui Variants</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-3">Sizes</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-3">States</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button disabled>Disabled</Button>
                        <Button>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading
                        </Button>
                      </div>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// HB Components (40px height, proper borders)
import { PrimaryButton, SecondaryButton, IconButton } from './components/hb/listing';

<PrimaryButton icon={Plus}>Add New</PrimaryButton>
<SecondaryButton icon={Download}>Export</SecondaryButton>
<IconButton icon={Settings} title="Settings" />

// Shadcn/ui buttons
import { Button } from './components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>`} />
              </Subsection>

              {/* Form Elements */}
              <Subsection
                id="form-elements"
                title="Form Elements"
                description="Complete form inputs with proper focus states (primary-500 ring)"
              >
                {/* Text Inputs */}
                <ExampleBox>
                  <h4 className="mb-4 font-medium">Text Inputs</h4>
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Text Input</FormLabel>
                      <FormInput placeholder="Enter text..." />
                    </FormField>
                    <FormField>
                      <FormLabel>Email Input</FormLabel>
                      <FormInput type="email" placeholder="email@example.com" />
                    </FormField>
                    <FormField>
                      <FormLabel>Password</FormLabel>
                      <FormInput type="password" placeholder="••••••••" />
                    </FormField>
                    <FormField>
                      <FormLabel>Number</FormLabel>
                      <FormInput type="number" placeholder="0" />
                    </FormField>
                  </FormGrid>
                  <div className="mt-4">
                    <FormField>
                      <FormLabel>Textarea</FormLabel>
                      <FormTextarea rows={4} placeholder="Enter description..." />
                    </FormField>
                  </div>
                </ExampleBox>

                {/* Select Dropdown */}
                <ExampleBox>
                  <h4 className="mb-4 font-medium">Select Dropdown</h4>
                  <FormGrid cols={2}>
                    <FormField>
                      <FormLabel required>Department</FormLabel>
                      <Select>
                        <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField>
                      <FormLabel>Role</FormLabel>
                      <Select>
                        <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="designer">Designer</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </FormGrid>
                </ExampleBox>

                {/* Dropdown Design Specifications */}
                <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                  <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">Select Dropdown Specifications</h4>
                  <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1.5">
                    <li>• <strong>Trigger:</strong> h-10 (40px) with rounded-lg corners</li>
                    <li>• <strong>Dropdown Panel:</strong> shadow-md, rounded-lg, z-[100] (appears above modals)</li>
                    <li>• <strong>Items:</strong> First has rounded-t-lg, last has rounded-b-lg, middle items square</li>
                    <li>• <strong>Focus State:</strong> Primary-50 background with primary-900 text</li>
                    <li>• <strong>Checkmark:</strong> Primary-600 color, right-aligned (8px from edge)</li>
                    <li>• <strong>Animation:</strong> Fade-in + zoom-in (95% → 100%), smooth transitions</li>
                  </ul>
                </div>

                <CodeBlock code={`// ✅ CORRECT: Select Dropdown Implementation
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

<Select>
  <SelectTrigger className="h-10 bg-white dark:bg-neutral-900">
    <SelectValue placeholder="Select department..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="engineering">Engineering</SelectItem>
    <SelectItem value="sales">Sales</SelectItem>
    <SelectItem value="hr">Human Resources</SelectItem>
  </SelectContent>
</Select>

// KEY DESIGN POINTS:
// ✓ SelectContent: rounded-lg (12px) corners with shadow-md
// ✓ SelectItem: NO blanket rounded class
// ✓ First item: Gets rounded-t-lg (top corners only)
// ✓ Last item: Gets rounded-b-lg (bottom corners only)
// ✓ Middle items: Square corners (no rounding)
// ✓ Focus: Primary-50 background, primary-900 text
// ✓ Checkmark: Primary-600 color, right-aligned`} />

                {/* Checkboxes */}
                <ExampleBox>
                  <h4 className="mb-4 font-medium">Checkboxes</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                        I agree to the terms and conditions
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="marketing" defaultChecked />
                      <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                        Send me marketing emails
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="newsletter" />
                      <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
                        Subscribe to newsletter
                      </Label>
                    </div>
                  </div>
                </ExampleBox>

                {/* Radio Buttons */}
                <ExampleBox>
                  <h4 className="mb-4 font-medium">Radio Buttons</h4>
                  <FormField>
                    <FormLabel>Employment Type</FormLabel>
                    <RadioGroup defaultValue="full-time" className="mt-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="full-time" id="full-time" />
                        <Label htmlFor="full-time" className="text-sm font-normal cursor-pointer">
                          Full-time
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="part-time" id="part-time" />
                        <Label htmlFor="part-time" className="text-sm font-normal cursor-pointer">
                          Part-time
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="contract" id="contract" />
                        <Label htmlFor="contract" className="text-sm font-normal cursor-pointer">
                          Contract
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>
                </ExampleBox>

                {/* Switches */}
                <ExampleBox>
                  <h4 className="mb-4 font-medium">Switches</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications" className="text-sm font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Receive email about your account activity
                        </p>
                      </div>
                      <Switch id="notifications" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails" className="text-sm font-medium">
                          Marketing Emails
                        </Label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Receive emails about new products and features
                        </p>
                      </div>
                      <Switch id="marketing-emails" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="security-alerts" className="text-sm font-medium">
                          Security Alerts
                        </Label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Get notified about security updates
                        </p>
                      </div>
                      <Switch id="security-alerts" defaultChecked />
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`import { FormGrid, FormField, FormLabel, FormInput } from './components/hb/common';
import { Checkbox, RadioGroup, RadioGroupItem, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui';

// Text Input - Focus shows primary-500 ring (NOT black)
<FormInput 
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter name..."
/>

// Select Dropdown - Proper styling with rounded corners and shadow-md
<Select>
  <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    {/* SelectContent has: rounded-lg, shadow-md, z-[100], p-1 viewport */}
    {/* SelectItems have: rounded-none middle, first:rounded-t-lg, last:rounded-b-lg */}
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// Checkbox - White checkmark on PRIMARY BLUE background when checked
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree</Label>
</div>

// Radio Group - PRIMARY BLUE border with small WHITE circle when selected
<RadioGroup defaultValue="option1">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option1" id="opt1" />
    <Label htmlFor="opt1">Option 1</Label>
  </div>
</RadioGroup>

// Switch - Active state uses PRIMARY background
<div className="flex items-center justify-between">
  <Label>Enable feature</Label>
  <Switch defaultChecked />
</div>`} />
              </Subsection>

              {/* Tables */}
              <Subsection
                id="tables"
                title="Tables"
                description="Data tables with proper borders and spacing"
              >
                <ExampleBox>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-neutral-950">
                        {[
                          { name: 'John Doe', email: 'john@example.com', status: 'Active' },
                          { name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
                          { name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                            <td className="px-4 py-3 text-sm">{row.name}</td>
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{row.email}</td>
                            <td className="px-4 py-3">
                              <Badge variant="status-dot">
                                <StatusDot color={row.status === 'Active' ? 'success' : 'neutral'} />
                                {row.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CopyIcon className="w-4 h-4" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Archive className="w-4 h-4" />
                                      Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive">
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Tables: Actions column shows ONLY "More" button
// All actions (View, Edit, Delete) are INSIDE the dropdown menu
import { Badge, StatusDot } from './components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuSeparator 
} from './components/ui/dropdown-menu';
import { Eye, Edit, MoreVertical, Trash2, Copy, Archive } from 'lucide-react';

<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
  <table className="w-full">
    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-neutral-950">
      <tr className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
        <td className="px-4 py-3 text-sm">John Doe</td>
        <td className="px-4 py-3">
          <Badge variant="status-dot">
            <StatusDot color="success" />
            Active
          </Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end">
            {/* ONLY show More button - all actions inside dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>`} />
              </Subsection>

              {/* Cards */}
              <Subsection
                id="cards"
                title="Cards"
                description="Container components with proper borders"
              >
                <ExampleBox>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Simple Card</CardTitle>
                        <CardDescription>Card with title and description</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Card content area with proper spacing.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Card with Icon
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                            <span className="font-medium">1,234</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ExampleBox>
              </Subsection>

              {/* Modals */}
              <Subsection
                id="modals"
                title="Modals"
                description="FormModal component for dialogs"
              >
                <ExampleBox>
                  <Button onClick={() => setShowFormModal(true)}>
                    Open Form Modal
                  </Button>
                </ExampleBox>

                <FormModal
                  isOpen={showFormModal}
                  onClose={() => setShowFormModal(false)}
                  title="Example Form Modal"
                  description="Modal with form inside"
                >
                  <form onSubmit={(e) => { e.preventDefault(); setShowFormModal(false); toast.success('Saved!'); }}>
                    <FormGrid cols={2}>
                      <FormField>
                        <FormLabel required>First Name</FormLabel>
                        <FormInput placeholder="Enter first name..." />
                      </FormField>
                      <FormField>
                        <FormLabel required>Last Name</FormLabel>
                        <FormInput placeholder="Enter last name..." />
                      </FormField>
                    </FormGrid>
                    <FormFooter>
                      <SecondaryButton onClick={() => setShowFormModal(false)}>Cancel</SecondaryButton>
                      <PrimaryButton type="submit">Save</PrimaryButton>
                    </FormFooter>
                  </form>
                </FormModal>
              </Subsection>

              {/* Alerts & Toasts */}
              <Subsection
                id="alerts-toasts"
                title="Alerts & Toasts"
                description="User feedback components"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Information</AlertTitle>
                      <AlertDescription>
                        This is an informational alert.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Something went wrong.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button onClick={() => toast.success('Success message!')}>
                        Success Toast
                      </Button>
                      <Button variant="outline" onClick={() => toast.error('Error message!')}>
                        Error Toast
                      </Button>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`import { toast } from 'sonner';

toast.success('Operation completed!');
toast.error('Something went wrong!');
toast.info('Here is some information.');`} />
              </Subsection>

              {/* Badges & Tags */}
              <Subsection
                id="badges-tags"
                title="Badges & Tags"
                description="We have 2 badge patterns: Dot badges (for all status displays) and tags (filters)"
              >
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important: Badge Pattern Rules</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li><strong>Pattern 1 & 2 (Dot Badge):</strong> Gray text + gray border + colorful dot (for tables, reports, and listings)</li>
                      <li><strong>Pattern 3 (Tags):</strong> Outline with remove button (for filters)</li>
                      <li className="text-error-600 dark:text-error-400">❌ Never use black borders - always use neutral-200/800</li>
                      <li className="text-success-600 dark:text-success-400">✅ Use dot badges consistently across all views (Grid, List, Table)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <ExampleBox>
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-2">Pattern 1: Status Badge with Dot (Preferred for Tables/Reports)</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Gray background + gray border + gray text + colorful dot
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="status-dot">
                          <StatusDot color="success" />
                          Active
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="warning" />
                          Pending
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="error" />
                          Inactive
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="info" />
                          Scheduled
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="neutral" />
                          Unknown
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-2">Pattern 2: Status Badge with Dot (For Listing Pages)</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Gray background + gray border + gray text + colorful dot
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="status-dot">
                          <StatusDot color="success" />
                          Active
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="warning" />
                          Pending
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="error" />
                          Inactive
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="info" />
                          Scheduled
                        </Badge>
                        <Badge variant="status-dot">
                          <StatusDot color="neutral" />
                          Draft
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-2">Pattern 3: Tags (Removable Filter Chips)</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Outline style with remove button
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
                          <Tag className="w-3 h-3" />
                          <span>JavaScript</span>
                          <button className="hover:text-error-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                        <span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
                          <Tag className="w-3 h-3" />
                          <span>TypeScript</span>
                          <button className="hover:text-error-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                        <span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
                          <Tag className="w-3 h-3" />
                          <span>React</span>
                          <button className="hover:text-error-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-2">Shadcn Variants (Generic Use)</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Use for non-status purposes (categories, labels, etc.)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                      </div>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`import { Badge, StatusDot } from './components/ui/badge';

// Pattern 1 & 2: Status Badge with Dot ✅ PREFERRED
// Use consistently across ALL views (Grid, List, Table)
<Badge variant="status-dot">
  <StatusDot color="success" />
  Active
</Badge>
<Badge variant="status-dot">
  <StatusDot color="warning" />
  Pending
</Badge>
<Badge variant="status-dot">
  <StatusDot color="error" />
  Inactive
</Badge>

// Pattern 3: Tags with Remove Button
<span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
  <Tag className="w-3 h-3" />
  <span>Tag Name</span>
  <button onClick={handleRemove} className="hover:text-error-500">
    <X className="w-3 h-3" />
  </button>
</span>

// Shadcn Variants (Generic)
<Badge variant="default">Label</Badge>
<Badge variant="outline">Category</Badge>`} />
              </Subsection>

              {/* Iconography */}
              <Subsection
                id="iconography"
                title="Iconography"
                description="Lucide React icons (v0.487.0) - Always verify icon exists before importing!"
              >
                <ExampleBox>
                  <div className="grid grid-cols-6 gap-4">
                    {[
                      { Icon: Plus, name: 'Plus' },
                      { Icon: Search, name: 'Search' },
                      { Icon: Download, name: 'Download' },
                      { Icon: Trash2, name: 'Trash2' },
                      { Icon: Edit, name: 'Edit' },
                      { Icon: Eye, name: 'Eye' },
                      { Icon: Settings, name: 'Settings' },
                      { Icon: Users, name: 'Users' },
                      { Icon: Building2, name: 'Building2' },
                      { Icon: TrendingUp, name: 'TrendingUp' },
                      { Icon: AlertCircle, name: 'AlertCircle' },
                      { Icon: CheckCircle, name: 'CheckCircle' },
                    ].map(({ Icon, name }) => (
                      <div key={name} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        <Icon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{name}</span>
                      </div>
                    ))}
                  </div>
                </ExampleBox>

                <CodeBlock code={`// IMPORTANT: Always verify icon exists in lucide-react before importing!
// Use bash tool to check: grep "IconName" lucide-react/dist/esm/icons/index.js

import { Plus, Search, Download, Trash2 } from 'lucide-react';

<Plus className="w-4 h-4" />              // 16px
<Search className="w-5 h-5" />            // 20px
<Download className="w-6 h-6" />          // 24px`} />
              </Subsection>

              {/* Micro Components */}
              <Subsection
                id="micro-components"
                title="Micro Components"
                description="Small reusable UI elements"
              >
                <ExampleBox>
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3">Separator</h4>
                      <div className="space-y-2">
                        <p className="text-sm">Content above</p>
                        <Separator />
                        <p className="text-sm">Content below</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3">Avatar / Icon Circle</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-error-100 dark:bg-error-900 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3">Loading Spinner</h4>
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3">Pill/Chip</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          Active
                        </span>
                        <span className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                          Featured
                        </span>
                        <span className="px-3 py-1 text-sm rounded-full bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3">Progress Indicators</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Success</span>
                            <span>90%</span>
                          </div>
                          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-success-500 rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Separator
import { Separator } from './components/ui/separator';
<Separator />

// Avatar/Icon Circle
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
  <Users className="w-5 h-5 text-primary-600" />
</div>

// Stat Card
<div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
  <p className="text-small text-neutral-600 mb-1">Label</p>
  <p className="text-2xl font-semibold">1,234</p>
</div>

// Loading Spinner
import { Loader2 } from 'lucide-react';
<Loader2 className="w-6 h-6 animate-spin text-primary-600" />

// Pill/Chip
<span className="px-3 py-1 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800">
  Label
</span>

// Progress Bar
<div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
  <div className="h-full bg-primary-500" style={{ width: '75%' }}></div>
</div>`} />
              </Subsection>

              {/* HB Components */}
              <Subsection
                id="hb-components"
                title="HB Components"
                description="Custom listing and form components with 40px height standard"
              >
                <ExampleBox>
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3">Search Bar (40px, Expandable)</h4>
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search..."
                      />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">View Mode Switcher (40px)</h4>
                      <ViewModeSwitcher
                        value={viewMode}
                        onChange={setViewMode}
                      />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Pagination</h4>
                      <Pagination
                        currentPage={1}
                        totalPages={10}
                        onPageChange={() => { }}
                        totalItems={200}
                        itemsPerPage={20}
                      />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Stat Cards (Dashboard Metrics)</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <StatCard
                          label="Total Users"
                          value="1,234"
                          icon={Users}
                        />
                        <StatCard
                          label="Active"
                          value="987"
                          icon={CheckCircle}
                          valueClassName="text-success-600 dark:text-success-400"
                          trend={{ value: "+12%", positive: true }}
                        />
                        <StatCard
                          label="Revenue"
                          value="$45.2K"
                          icon={TrendingUp}
                          valueClassName="text-primary-600 dark:text-primary-400"
                          trend={{ value: "+15%", positive: true }}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Filter Popup (Advanced Filters)</h4>
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => setShowFilterPopup(!showFilterPopup)}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Advanced Filters {filters.length > 0 && `(${filters.length})`}
                        </Button>
                        <FilterPopup
                          isOpen={showFilterPopup}
                          onClose={() => setShowFilterPopup(false)}
                          filters={filters}
                          onFiltersChange={setFilters}
                          filterOptions={{
                            'Status': ['Active', 'Inactive', 'Pending'],
                            'Department': ['Engineering', 'Sales', 'HR', 'Marketing'],
                            'Role': ['Manager', 'Developer', 'Designer', 'Analyst']
                          }}
                          onApply={() => console.log('Filters applied:', filters)}
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                          Multi-condition filter with "Where" and "What" selection
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Filter Chips</h4>
                      <FilterChips
                        filters={[
                          { id: '1', field: 'Status', values: ['Active', 'Pending'] },
                          { id: '2', field: 'Department', values: ['Engineering'] },
                        ]}
                        onRemove={(id) => console.log('Remove', id)}
                        onClearAll={() => console.log('Clear all')}
                      />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                        Shows active filters with remove buttons
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Date Range Filter</h4>
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => setShowDateRange(!showDateRange)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {startDate && endDate ? `${startDate} - ${endDate}` : 'Select Date Range'}
                        </Button>
                        <DateRangeFilter
                          isOpen={showDateRange}
                          onClose={() => setShowDateRange(false)}
                          startDate={startDate}
                          endDate={endDate}
                          onApply={(start, end, label) => {
                            setStartDate(start);
                            setEndDate(end);
                            console.log('Date range applied:', start, end, label);
                          }}
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                          Preset ranges + custom date selection
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Breadcrumb</h4>
                      <Breadcrumb
                        items={[
                          { label: 'Home', href: '/' },
                          { label: 'Products', href: '/products' },
                          { label: 'Electronics', current: true },
                        ]}
                      />
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// All HB components are 40px height with proper borders
import {
  SearchBar,
  ViewModeSwitcher,
  Pagination,
  Breadcrumb,
  FilterPopup,
  FilterChips,
  DateRangeFilter,
  FlyoutMenu,
} from './components/hb/listing';
import { StatCard } from './components/hb/common';

// Search Bar (40px, expandable with filter button)
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search..."
  onAdvancedSearch={() => setShowFilters(true)}
  activeFilterCount={2}  // Shows badge when filters active
/>

// Advanced Filter Popup
<FilterPopup
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  filters={filters}
  onFiltersChange={setFilters}
  filterOptions={{
    'Status': ['Active', 'Inactive', 'Pending'],
    'Department': ['Engineering', 'Sales', 'HR']
  }}
  onApply={handleApplyFilters}
/>

// Filter Chips (shows active filters)
<FilterChips
  filters={filters}
  onRemove={(id) => removeFilter(id)}
  onClearAll={() => setFilters([])}
/>

// Date Range Filter
<DateRangeFilter
  isOpen={showDateRange}
  onClose={() => setShowDateRange(false)}
  startDate={startDate}
  endDate={endDate}
  onApply={(start, end) => setDateRange(start, end)}
/>

// View Mode Switcher (40px, icon buttons)
<ViewModeSwitcher value={view} onChange={setView} />

// Stat Cards (Dashboard metrics with icons and trends)
<div className="grid grid-cols-3 gap-4">
  <StatCard 
    label="Total Users" 
    value="1,234"
    icon={Users}
  />
  <StatCard 
    label="Revenue" 
    value="$45.2K"
    icon={TrendingUp}
    valueClassName="text-primary-600"
    trend={{ value: "+15%", positive: true }}
  />
</div>`} />
              </Subsection>

              {/* Advanced Shadcn Components */}
              <Subsection
                id="advanced-components"
                title="Advanced Shadcn Components"
                description="Additional Shadcn/ui components available in the design system"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      The following Shadcn components are available and ready to use:
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-2">Overlays</h5>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          <li>• Dialog</li>
                          <li>• Sheet (Drawer)</li>
                          <li>• Drawer</li>
                          <li>• Popover</li>
                          <li>• Tooltip</li>
                          <li>• Hover Card</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Navigation</h5>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          <li>• Command</li>
                          <li>• Context Menu</li>
                          <li>• Menubar</li>
                          <li>• Navigation Menu</li>
                          <li>• Accordion</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Data Display</h5>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          <li>• Carousel</li>
                          <li>• Chart</li>
                          <li>• Calendar</li>
                          <li>• Avatar</li>
                          <li>• Skeleton</li>
                          <li>• Progress</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Layout</h5>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          <li>• Resizable</li>
                          <li>• Scroll Area</li>
                          <li>• Aspect Ratio</li>
                          <li>• Collapsible</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Form Controls</h5>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          <li>• Toggle</li>
                          <li>• Toggle Group</li>
                          <li>• Slider</li>
                          <li>• Input OTP</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </ExampleBox>

                <CodeBlock code={`// Import any Shadcn component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Sheet, SheetContent, SheetHeader } from './components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Command, CommandInput, CommandList, CommandItem } from './components/ui/command';
import { Carousel, CarouselContent, CarouselItem } from './components/ui/carousel';
import { Calendar } from './components/ui/calendar';
import { Progress } from './components/ui/progress';
import { Skeleton } from './components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/accordion';
import { Slider } from './components/ui/slider';
import { Toggle, ToggleGroup, ToggleGroupItem } from './components/ui/toggle';

// All components follow the design system's styling
// See Shadcn/ui documentation for detailed usage`} />
              </Subsection>
            </Section>

            {/* NAVIGATION */}
            <Section id="navigation" title="Navigation">
              <Subsection
                id="nav-sidebar"
                title="Sidebar"
                description="Main navigation sidebar - always visible on left"
              >
                <ExampleBox>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <p className="text-sm">
                      The sidebar is always visible on the left side with proper borders (neutral-200/800).
                      See the live example on the left side of this screen.
                    </p>
                  </div>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="nav-header"
                title="Header"
                description="PageHeader component with breadcrumbs and actions"
              >
                <ExampleBox>
                  <PageHeader
                    title="Page Title"
                    breadcrumbs={[
                      { label: 'Home', href: '/' },
                      { label: 'Section', href: '/section' },
                      { label: 'Current Page', current: true },
                    ]}
                  >
                    <PrimaryButton icon={Plus}>Add New</PrimaryButton>
                    <IconButton icon={Download} title="Export" />
                  </PageHeader>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="nav-tabs"
                title="Tabs"
                description="Tabbed navigation with proper styling"
              >
                <ExampleBox>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <p className="text-sm">Overview content</p>
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-4">
                      <p className="text-sm">Analytics content</p>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4">
                      <p className="text-sm">Settings content</p>
                    </TabsContent>
                  </Tabs>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="nav-breadcrumbs"
                title="Breadcrumbs"
                description="Hierarchical navigation path"
              >
                <ExampleBox>
                  <Breadcrumb
                    items={[
                      { label: 'Home', href: '/' },
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Analytics', href: '/dashboard/analytics' },
                      { label: 'Reports', current: true },
                    ]}
                  />
                </ExampleBox>
              </Subsection>
            </Section>

            {/* PATTERNS */}
            <Section id="patterns" title="Patterns">
              <Subsection
                id="listing-page"
                title="Listing Page Pattern"
                description="Standard CRUD listing page with filters, search, and table"
              >
                <ExampleBox>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Listing Page Structure</AlertTitle>
                    <AlertDescription>
                      PageHeader → Filters (40px height) → Table (proper borders) → Pagination
                    </AlertDescription>
                  </Alert>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="form-page"
                title="Form Page Pattern"
                description="Create/Edit forms in modals with FormGrid"
              >
                <ExampleBox>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Form Pattern</AlertTitle>
                    <AlertDescription>
                      FormModal → FormGrid → FormField + FormLabel + FormInput → FormFooter
                    </AlertDescription>
                  </Alert>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="detail-page"
                title="Detail Page Pattern"
                description="Show detailed information with tabs and cards"
              >
                <ExampleBox>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Detail Page Structure</AlertTitle>
                    <AlertDescription>
                      PageHeader with edit actions → Tabs → Cards with proper borders
                    </AlertDescription>
                  </Alert>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="dashboard"
                title="Dashboard Pattern"
                description="Overview with metrics and data visualizations"
              >
                <ExampleBox>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Dashboard Structure</AlertTitle>
                    <AlertDescription>
                      Stat cards → Charts → Recent activity cards (all with proper borders)
                    </AlertDescription>
                  </Alert>
                </ExampleBox>
              </Subsection>
            </Section>

            {/* STATES */}
            <Section id="states" title="States">
              <Subsection
                id="loading"
                title="Loading State"
                description="Show loading indicators"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                      <span className="text-sm">Loading...</span>
                    </div>
                    <Button disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </Button>
                  </div>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="empty"
                title="Empty State"
                description="Show when no data available"
              >
                <ExampleBox>
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
                      <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="mb-2">No items found</h3>
                    <p className="text-muted mb-4">
                      Get started by creating your first item.
                    </p>
                    <PrimaryButton icon={Plus}>Add Item</PrimaryButton>
                  </div>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="error"
                title="Error State"
                description="Show when an error occurs"
              >
                <ExampleBox>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load data. Please try again.
                    </AlertDescription>
                  </Alert>
                </ExampleBox>
              </Subsection>

              <Subsection
                id="success"
                title="Success State"
                description="Success feedback"
              >
                <ExampleBox>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-success-600" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>
                        Your changes have been saved.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={() => toast.success('Saved successfully!')}>
                      Show Success Toast
                    </Button>
                  </div>
                </ExampleBox>
              </Subsection>
            </Section>

            {/* RESPONSIVE */}
            <Section id="responsive" title="Responsive Rules">
              <ExampleBox>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Breakpoints</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span>sm</span>
                        <code>640px+</code>
                      </div>
                      <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span>md</span>
                        <code>768px+</code>
                      </div>
                      <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span>lg</span>
                        <code>1024px+</code>
                      </div>
                      <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span>xl</span>
                        <code>1280px+</code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Best Practices</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Mobile-first approach (default → md: → lg:)</li>
                      <li>Test at 375px, 768px, 1440px</li>
                      <li>Use FormGrid for responsive layouts</li>
                      <li>Tables scroll horizontally on mobile</li>
                      <li>All elements have proper borders (neutral-200/800)</li>
                    </ul>
                  </div>
                </div>
              </ExampleBox>
            </Section>

            {/* ACCESSIBILITY */}
            <Section id="accessibility" title="Accessibility Guidelines">
              <ExampleBox>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Key Principles</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>All interactive elements are 40px minimum height</li>
                      <li>Color contrast meets WCAG AA (4.5:1)</li>
                      <li>No black borders - use neutral-200/800</li>
                      <li>Proper focus states with ring-2 ring-offset-2</li>
                      <li>Icon-only buttons have aria-label</li>
                      <li>Form fields properly labeled</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3">Checklist</h4>
                    <ul className="space-y-2 text-sm">
                      {[
                        'All buttons 40px height',
                        'Proper borders (neutral-200/800)',
                        'No black borders anywhere',
                        'Badges follow 3-pattern system',
                        'Table badges use dot pattern',
                        'Typography uses semantic HTML',
                        'Icons verified in lucide-react',
                        'Focus states visible',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ExampleBox>
            </Section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-center space-y-2">
                <p className="text-small text-neutral-600 dark:text-neutral-400">
                  UI Kit Documentation • Updated January 3, 2026
                </p>
                <p className="text-small text-neutral-500 dark:text-neutral-500">
                  Follows HB Component Guidelines • Aligned with Template Folder Patterns
                </p>
                <Alert className="mt-4 max-w-2xl mx-auto">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> All components match the /templates folder implementations.
                    Always reference template files for real-world usage patterns.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
