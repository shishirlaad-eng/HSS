import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Globe, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormTextarea } from './hb/common/Form';
import { StaticPage } from '../../mockAPI/staticPagesData';
import { toast } from 'sonner';

interface StaticPageEditProps {
  page: StaticPage;
  onBack: () => void;
}

export default function StaticPageEdit({ page, onBack }: StaticPageEditProps) {
  const [content, setContent] = useState(page.content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(content !== page.content);
  }, [content, page.content]);

  const validateContent = (text: string) => {
    if (!text || text.trim().length === 0) {
      return "Content is required.";
    }
    if (text.trim().length < 20) {
      return "Content must be at least 20 characters.";
    }
    if (text.length > 20000) {
      return "Content must not exceed 20,000 characters.";
    }
    if (/<script|iframe|on\w+=/i.test(text)) {
      return "Content contains unsupported elements or scripts.";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Page updated successfully.");
      setHasChanges(false);
    } catch (err) {
      setError("Unable to update static page. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const validationError = validateContent(content);

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Static Page Details"
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Static Pages', onClick: onBack },
            { label: 'Edit Page', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={handleBack}>
              Back
            </SecondaryButton>
            <PrimaryButton 
              icon={Save} 
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!!validationError || !hasChanges || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <FileText className="w-4 h-4 text-primary-600" />
                Page Content Editor
              </div>

              <div className="space-y-4">
                <FormTextarea
                  label="Content"
                  value={content}
                  onChange={setContent}
                  placeholder="Enter page content here..."
                  rows={20}
                  error={error || (validationError && content.length > 0 ? validationError : undefined)}
                  required
                  className="font-sans leading-relaxed text-base"
                />
                
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Minimum 20 characters required</span>
                  <span className={content.length > 20000 ? "text-error-500" : ""}>
                    {content.length.toLocaleString()} / 20,000 characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR METADATA */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-6">Page Metadata</h3>
              
              <div className="space-y-5">
                <FormField label="Page Name">
                  <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    {page.name}
                  </div>
                </FormField>

                <FormField label="System Slug">
                  <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-sm text-neutral-500 dark:text-neutral-500 font-mono">
                    <Globe className="w-4 h-4 text-neutral-400" />
                    /{page.slug}
                  </div>
                </FormField>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5" />
                    <p className="text-xs text-primary-900 dark:text-primary-100 leading-normal">
                      Metadata is system-defined and cannot be changed to preserve application routing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* VALIDATION HINTS */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning-500" />
                Guidelines
              </h3>
              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 flex-shrink-0"></span>
                  Use clear, concise language for legal pages.
                </li>
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 flex-shrink-0"></span>
                  Avoid pasting content from word processors with heavy formatting.
                </li>
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 flex-shrink-0"></span>
                  HTML tags are not supported and will be filtered out.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
