import { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, ErrorText } from './hb/common/Form';
import { RichTextEditor, StatusSlider } from './hb/common';
import { StaticPage, nextStaticPageId } from '../../mockAPI/staticPagesData';
import { toast } from 'sonner';

interface StaticPageEditProps {
  page?: StaticPage;
  onBack: () => void;
  onCreate?: (page: StaticPage) => void;
  onSave?: (page: StaticPage) => void;
}

const VISIBILITY_OPTIONS = [
  { value: 'visible', label: 'Visible', color: 'bg-success-500' },
  { value: 'hidden', label: 'Hidden', color: 'bg-neutral-400 dark:bg-neutral-600' },
];

// Existing pages predate the rich text editor and store plain '\n'-delimited
// text — turn that into paragraphs/line-breaks so it reads correctly once
// loaded into a contentEditable HTML editor. Content that already contains
// markup (anything authored/edited since) is left untouched.
function toEditableHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function StaticPageEdit({ page, onBack, onCreate, onSave }: StaticPageEditProps) {
  const isCreate = !page;
  const [name, setName] = useState(page?.name ?? '');
  const [content, setContent] = useState(() => toEditableHtml(page?.content ?? ''));
  const [visible, setVisible] = useState(page?.visible ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isCreate) {
      setHasChanges(name.trim() !== '' || stripHtml(content) !== '');
    } else {
      setHasChanges(name !== page!.name || content !== toEditableHtml(page!.content) || visible !== (page!.visible ?? true));
    }
  }, [name, content, visible]);

  const validateContent = (html: string) => {
    const text = stripHtml(html);
    if (!text) return 'Content is required.';
    if (text.length < 20) return 'Content must be at least 20 characters.';
    if (text.length > 20000) return 'Content must not exceed 20,000 characters.';
    if (/<script|iframe|on\w+=/i.test(html)) return 'Content contains unsupported elements or scripts.';
    return null;
  };

  const nameError = !name.trim() ? 'Title is required.' : null;

  const handleSave = async () => {
    setNameTouched(true);
    const validationError = validateContent(content);
    if (nameError || validationError) {
      setError(validationError);
      if (validationError) toast.error(validationError);
      else if (nameError) toast.error(nameError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (isCreate) {
        const created: StaticPage = {
          id: nextStaticPageId(),
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          content,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
          visible,
        };
        onCreate?.(created);
        toast.success('Policy created successfully.');
      } else {
        const updated: StaticPage = {
          ...page!,
          name: name.trim(),
          content,
          visible,
          lastUpdated: new Date().toISOString(),
        };
        onSave?.(updated);
        toast.success('Page updated successfully.');
      }
      setHasChanges(false);
      onBack();
    } catch (err) {
      setError('Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
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
          title={isCreate ? 'Add Policy' : 'Static Page Details'}
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Static Pages', onClick: onBack },
            { label: isCreate ? 'Add Policy' : 'Edit Page', current: true },
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
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isCreate ? 'Create Policy' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <FileText className="w-4 h-4 text-primary-600" />
            {isCreate ? 'New Policy' : 'Page Content Editor'}
          </div>

          <div className="space-y-4">
            <FormField>
              <FormLabel required>Title</FormLabel>
              <FormInput
                value={name}
                onChange={e => { setName(e.target.value); }}
                onBlur={() => setNameTouched(true)}
                placeholder="e.g. Refund Policy"
                className={nameTouched && nameError ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
              />
              <ErrorText>{nameTouched ? nameError ?? undefined : undefined}</ErrorText>
            </FormField>

            <FormField>
              <FormLabel>Visibility</FormLabel>
              <StatusSlider
                value={visible ? 'visible' : 'hidden'}
                onChange={v => setVisible(v === 'visible')}
                options={VISIBILITY_OPTIONS}
                className="max-w-xs"
              />
              <p className="text-xs text-neutral-400 mt-1.5">
                Controls whether this page appears on the member-facing Policies page.
              </p>
            </FormField>

            <FormField>
              <FormLabel required>Content</FormLabel>
              <RichTextEditor
                value={content}
                onChange={html => { setContent(html); setError(null); }}
                placeholder="Enter page content here..."
                minHeight="360px"
                maxHeight="640px"
                className={(error || (validationError && stripHtml(content).length > 0)) ? 'border-error-400 dark:border-error-600' : ''}
              />
              <ErrorText>{error || (validationError && stripHtml(content).length > 0 ? validationError : undefined)}</ErrorText>
            </FormField>

            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Minimum 20 characters required</span>
              <span className={stripHtml(content).length > 20000 ? 'text-error-500' : ''}>
                {stripHtml(content).length.toLocaleString()} / 20,000 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
