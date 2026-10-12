import { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, ErrorText } from './hb/common/Form';
import { RichTextEditor, StatusSlider } from './hb/common';
import { StaticPage, nextStaticPageId, isSlugTaken, slugify } from '../../mockAPI/staticPagesData';
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

// <input type="datetime-local"> works in local time with no timezone suffix.
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isValidExternalUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function StaticPageEdit({ page, onBack, onCreate, onSave }: StaticPageEditProps) {
  const isCreate = !page;
  const [name, setName] = useState(page?.name ?? '');
  const [content, setContent] = useState(() => toEditableHtml(page?.content ?? ''));
  const [visible, setVisible] = useState(page?.visible ?? true);
  const [slug, setSlug] = useState(page?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(!!page);
  const [slugTouched, setSlugTouched] = useState(false);
  const [reviewed, setReviewed] = useState(() => toLocalInput(page?.lastReviewedDate ?? new Date().toISOString()));
  const [externalUrl, setExternalUrl] = useState(page?.externalUrl ?? '');
  const [urlTouched, setUrlTouched] = useState(false);
  const [sourceTab, setSourceTab] = useState<'content' | 'external'>(page?.externalUrl && !page.content.trim() ? 'external' : 'content');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isCreate) {
      setHasChanges(name.trim() !== '' || stripHtml(content) !== '');
    } else {
      setHasChanges(
        name !== page!.name || content !== toEditableHtml(page!.content) || visible !== (page!.visible ?? true)
        || slug !== page!.slug || reviewed !== toLocalInput(page!.lastReviewedDate) || externalUrl.trim() !== (page!.externalUrl ?? ''),
      );
    }
  }, [name, content, visible, slug, reviewed, externalUrl]);

  const hasExternal = externalUrl.trim() !== '';

  const validateContent = (html: string) => {
    const text = stripHtml(html);
    // Content is optional when the policy links to an external URL / PDF.
    if (!text && hasExternal) return null;
    if (!text) return 'Content is required.';
    if (text.length < 20) return 'Content must be at least 20 characters.';
    if (text.length > 20000) return 'Content must not exceed 20,000 characters.';
    if (/<script|iframe|on\w+=/i.test(html)) return 'Content contains unsupported elements or scripts.';
    return null;
  };

  const nameError = !name.trim() ? 'Title is required.' : null;
  const slugError = !slug.trim() ? 'URL extension is required.'
    : !SLUG_RE.test(slug) ? 'Use lowercase letters, numbers and single hyphens only (e.g. privacy-policy).'
    : isSlugTaken(slug, page?.id) ? 'This URL extension is already used by another policy.'
    : null;
  const reviewedError = !reviewed || isNaN(new Date(reviewed).getTime()) ? 'Last Reviewed Date is required.' : null;
  const urlError = hasExternal && !isValidExternalUrl(externalUrl.trim()) ? 'Enter a valid link starting with http:// or https://.' : null;

  const handleSave = async () => {
    setNameTouched(true);
    setSlugTouched(true);
    setUrlTouched(true);
    const validationError = validateContent(content);
    const firstError = nameError || slugError || reviewedError || urlError || validationError;
    if (firstError) {
      setError(validationError);
      if (!nameError && !slugError && !reviewedError) setSourceTab(urlError && !validationError ? 'external' : 'content');
      toast.error(firstError);
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
          slug,
          content,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
          lastReviewedDate: new Date(reviewed).toISOString(),
          externalUrl: externalUrl.trim() || undefined,
          visible,
        };
        onCreate?.(created);
        toast.success('Policy created successfully.');
      } else {
        const updated: StaticPage = {
          ...page!,
          name: name.trim(),
          slug,
          content,
          visible,
          lastUpdated: new Date().toISOString(),
          lastReviewedDate: new Date(reviewed).toISOString(),
          externalUrl: externalUrl.trim() || undefined,
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

  const tabBtn = (id: 'content' | 'external', label: string, filled: boolean) => (
    <button
      type="button"
      onClick={() => setSourceTab(id)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
        sourceTab === id
          ? 'border-primary-600 text-primary-700 dark:text-primary-300 dark:border-primary-400'
          : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
      }`}
    >
      {label}
      {filled && <span className="w-1.5 h-1.5 rounded-full bg-success-500" aria-label="Has a value" />}
    </button>
  );

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
        />

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
                onChange={e => { setName(e.target.value); if (!slugEdited) setSlug(slugify(e.target.value)); }}
                onBlur={() => setNameTouched(true)}
                placeholder="e.g. Refund Policy"
                className={nameTouched && nameError ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
              />
              <ErrorText>{nameTouched ? nameError ?? undefined : undefined}</ErrorText>
            </FormField>

            {/* URL Extension and Last Reviewed Date side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>URL Extension</FormLabel>
                <div className="flex items-stretch">
                  <span className="inline-flex items-center px-3 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border border-r-0 border-neutral-200 dark:border-neutral-700 rounded-l-lg whitespace-nowrap">/policies/</span>
                  <FormInput
                    value={slug}
                    onChange={e => { setSlugEdited(true); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
                    onBlur={() => setSlugTouched(true)}
                    placeholder="privacy-policy"
                    className={`rounded-l-none ${slugTouched && slugError ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}`}
                  />
                </div>
                <ErrorText>{slugTouched ? slugError ?? undefined : undefined}</ErrorText>
                <p className="text-xs text-neutral-400 mt-1.5">
                  A meaningful page address, e.g. /policies/{slug || 'privacy-policy'}. Suggested from the title; you can change it.
                </p>
              </FormField>

              <FormField>
                <FormLabel required>Last Reviewed Date</FormLabel>
                <FormInput
                  type="datetime-local"
                  value={reviewed}
                  onChange={e => setReviewed(e.target.value)}
                />
                <ErrorText>{reviewedError ?? undefined}</ErrorText>
                <p className="text-xs text-neutral-400 mt-1.5">
                  Shown to members. Update it every time the policy is reviewed, even if the content has not changed.
                </p>
              </FormField>
            </div>

            {/* Content / External URL tabs */}
            <div>
              <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-4">
                {tabBtn('content', 'Content', stripHtml(content).length > 0)}
                {tabBtn('external', 'External URL / PDF Link', hasExternal)}
              </div>

              {sourceTab === 'content' && (
                <FormField>
                  <FormLabel required={!hasExternal}>Content</FormLabel>
                  <RichTextEditor
                    value={content}
                    onChange={html => { setContent(html); setError(null); }}
                    placeholder="Enter page content here..."
                    minHeight="360px"
                    maxHeight="640px"
                    className={(error || (validationError && stripHtml(content).length > 0)) ? 'border-error-400 dark:border-error-600' : ''}
                  />
                  <ErrorText>{error || (validationError && stripHtml(content).length > 0 ? validationError : undefined)}</ErrorText>
                  <div className="flex justify-between items-center text-xs text-neutral-400 mt-2">
                    <span>{hasExternal ? 'Optional when an external link is set' : 'Minimum 20 characters required'}</span>
                    <span className={stripHtml(content).length > 20000 ? 'text-error-500' : ''}>
                      {stripHtml(content).length.toLocaleString()} / 20,000 characters
                    </span>
                  </div>
                </FormField>
              )}

              {sourceTab === 'external' && (
                <FormField>
                  <FormLabel>External URL / PDF Link</FormLabel>
                  <FormInput
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                    onBlur={() => setUrlTouched(true)}
                    placeholder="https://drive.example.com/privacy-policy.pdf"
                    className={urlTouched && urlError ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                  />
                  <ErrorText>{urlTouched ? urlError ?? undefined : undefined}</ErrorText>
                  <p className="text-xs text-neutral-400 mt-1.5">
                    Optional. If set, the policy title on the member-facing Policies page opens this link instead of the page content, and Content becomes optional.
                  </p>
                </FormField>
              )}
            </div>

            {/* Visibility at the bottom */}
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
          </div>

          {/* Actions at the bottom */}
          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
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
        </div>
      </div>
    </div>
  );
}
