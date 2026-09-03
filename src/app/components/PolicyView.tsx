// ─────────────────────────────────────────────────────────────
// HSS UK — Policy View (member-facing, read-only)
// Renders one policy's title + rich content (bold, hyperlinks etc. visible,
// not raw HTML source). Reached by clicking a card on Policies.tsx.
// ─────────────────────────────────────────────────────────────
import { ArrowLeft, FileText, Clock, User as UserIcon } from 'lucide-react';
import { SecondaryButton } from './hb/listing';
import { mockStaticPages } from '../../mockAPI/staticPagesData';
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

export default function PolicyView({ policyId, onBack }: { policyId: string | null; onBack: () => void }) {
  const page = mockStaticPages.find(p => p.id === policyId);

  if (!page) {
    return (
      <div className="p-6">
        <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Policies</SecondaryButton>
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">Policy not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto">
        <SecondaryButton icon={ArrowLeft} onClick={onBack}>Back to Policies</SecondaryButton>

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{page.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDateTime(page.lastUpdated)}</span>
              <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> By {page.updatedBy}</span>
            </div>
          </div>
          <div
            className="px-6 py-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed prose dark:prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: toDisplayHtml(page.content) }}
          />
        </div>
      </div>
    </div>
  );
}
