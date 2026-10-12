// ─────────────────────────────────────────────────────────────
// HSS UK — Policy View (member-facing, read-only)
// Renders one policy's title + rich content (bold, hyperlinks etc. visible,
// not raw HTML source). Reached from the Policies list or directly at
// /policies/<url-extension>. Hidden policies are never shown.
// ─────────────────────────────────────────────────────────────
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { SecondaryButton } from './hb/listing';
import { findPolicy } from '../../mockAPI/staticPagesData';
import { formatDateTime } from '../../utils/formatDate';

// Existing pages predate rich text and store plain '\n'-delimited text —
// render that with real line/paragraph breaks. Content that already contains
// markup (anything authored via the rich text editor) is left untouched.
function toDisplayHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

// `policyId` is the policy's URL extension (or id).
export default function PolicyView({ policyId, onBack }: { policyId: string | null; onBack: () => void }) {
  const found = findPolicy(policyId);
  const page = found && found.visible !== false ? found : undefined;

  if (!page) {
    return (
      <div className="px-6 pt-2 pb-6">
        <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Policies</SecondaryButton>
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">Policy not found.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-2 pb-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto">
        {/* Title first, at the top of the page */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{page.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5" /> Last reviewed {formatDateTime(page.lastReviewedDate)}
            </p>
          </div>
          <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Policies</SecondaryButton>
        </div>

        <div className="mt-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
          {page.content.trim() ? (
            <div
              className="px-6 py-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed prose dark:prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: toDisplayHtml(page.content) }}
            />
          ) : (
            <p className="px-6 py-6 text-sm text-neutral-600 dark:text-neutral-400">
              This policy is available as a document.
            </p>
          )}
          {page.externalUrl && (
            <div className="px-6 pb-6">
              <a
                href={page.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-700 dark:text-primary-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Open the full policy document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
