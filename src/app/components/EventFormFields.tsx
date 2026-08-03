import { useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { FormField, FormLabel, FormInput, FormSelect, RichTextEditor } from './hb/common';
import type { EventPriceCategory, EventCustomQuestion, EventTermsSection } from '../../mockAPI/eventsData';
import type { AgeGroup } from '../../mockAPI/membersData';

// ─── Target Audience helpers (shared across Create/Edit forms) ───────────────
export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'bal',     label: 'Bal(ika) (0-5)'   },
  { value: 'shishu',  label: 'Shishu (6-11)'    },
  { value: 'kishor',  label: 'Kishor(i) (12-16)' },
  { value: 'tarun',   label: 'Tarun(i) (17-30)'  },
  { value: 'yuva',    label: 'Yuva(ti) (30-60)'  },
  { value: 'jyestha', label: 'Jyestha(a) (60+)'  },
];

export const AUDIENCE_AGE_LABELS: Record<AgeGroup, string> = {
  bal:     'Bal(ika) (0-5)',
  shishu:  'Shishu (6-11)',
  kishor:  'Kishor(i) (12-16)',
  tarun:   'Tarun(i) (17-30)',
  yuva:    'Yuva(ti) (30-60)',
  jyestha: 'Jyestha(a) (60+)',
};

export function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
      checked
        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
    }`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
      {label}
    </label>
  );
}

export function toggleArr<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

// ─── Price Categories Editor ──────────────────────────────────────────────────
export function PriceCategoriesEditor({
  categories,
  onChange,
  disabled,
}: {
  categories: EventPriceCategory[];
  onChange: (next: EventPriceCategory[]) => void;
  disabled?: boolean;
}) {
  const addCategory = () => {
    onChange([...categories, { id: `PC-${Date.now()}`, label: '', price: 0 }]);
  };
  const updateCategory = (id: string, field: 'label' | 'price' | 'description', value: string) => {
    onChange(categories.map(c => {
      if (c.id !== id) return c;
      if (field === 'label') return { ...c, label: value };
      if (field === 'description') return { ...c, description: value };
      return { ...c, price: parseFloat(value) || 0 };
    }));
  };
  const removeCategory = (id: string) => {
    onChange(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-2">
      {categories.length > 0 && (
        <div className="flex items-center gap-2 px-0.5">
          <span className="flex-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Ticket Type / Title</span>
          <span className="w-32 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Price (GBP)</span>
          <span className="w-8" />
        </div>
      )}
      {categories.map(cat => (
        <div key={cat.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <FormInput
              value={cat.label}
              onChange={e => updateCategory(cat.id, 'label', e.target.value)}
              placeholder="e.g. Adult, Child, Helper, Adult (part-time)"
              disabled={disabled}
              className="flex-1"
            />
            <div className="relative w-32">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
              <FormInput
                type="number"
                value={String(cat.price)}
                onChange={e => updateCategory(cat.id, 'price', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={disabled}
                className="pl-6"
              />
            </div>
            <button
              type="button"
              onClick={() => removeCategory(cat.id)}
              disabled={disabled}
              className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <FormInput
            value={cat.description ?? ''}
            onChange={e => updateCategory(cat.id, 'description', e.target.value)}
            placeholder="Short description for this ticket type (optional)"
            disabled={disabled}
            className="text-xs"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addCategory}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 disabled:hover:text-neutral-600 dark:disabled:hover:text-neutral-400"
      >
        <Plus className="w-3.5 h-3.5" /> Add ticket type
      </button>
    </div>
  );
}

// ─── Donation Amounts Editor ───────────────────────────────────────────────────
// Preset donation amounts an admin can offer alongside the free-text donation
// field, e.g. £10 / £25 / £50 quick-select chips at registration.
export function DonationAmountsEditor({
  amounts,
  onChange,
  disabled,
}: {
  amounts: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
}) {
  const addAmount = () => onChange([...amounts, 0]);
  const updateAmount = (idx: number, value: string) => {
    onChange(amounts.map((a, i) => i === idx ? (parseFloat(value) || 0) : a));
  };
  const removeAmount = (idx: number) => onChange(amounts.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {amounts.map((amt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
            <FormInput
              type="number"
              value={String(amt)}
              onChange={e => updateAmount(idx, e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={disabled}
              className="pl-6"
            />
          </div>
          <button
            type="button"
            onClick={() => removeAmount(idx)}
            disabled={disabled}
            className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addAmount}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 disabled:hover:text-neutral-600 dark:disabled:hover:text-neutral-400"
      >
        <Plus className="w-3.5 h-3.5" /> Add donation amount
      </button>
    </div>
  );
}

// ─── Custom Questions Editor ──────────────────────────────────────────────────
export function CustomQuestionsEditor({
  questions,
  onChange,
}: {
  questions: EventCustomQuestion[];
  onChange: (next: EventCustomQuestion[]) => void;
}) {
  const addQuestion = () => {
    onChange([...questions, { id: `CQ-${Date.now()}`, label: '', type: 'text', required: false }]);
  };
  const updateQuestion = (id: string, patch: Partial<EventCustomQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...patch } : q));
  };
  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };
  const updateOption = (id: string, idx: number, value: string) => {
    onChange(questions.map(q => {
      if (q.id !== id) return q;
      const options = [...(q.options ?? [])];
      options[idx] = value;
      return { ...q, options };
    }));
  };
  const addOption = (id: string) => {
    onChange(questions.map(q => q.id === id ? { ...q, options: [...(q.options ?? []), ''] } : q));
  };
  const removeOption = (id: string, idx: number) => {
    onChange(questions.map(q => {
      if (q.id !== id) return q;
      return { ...q, options: (q.options ?? []).filter((_, i) => i !== idx) };
    }));
  };

  return (
    <div className="space-y-3">
      {questions.map(q => (
        <div key={q.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 space-y-2 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <FormInput
              value={q.label}
              onChange={e => updateQuestion(q.id, { label: e.target.value })}
              placeholder="Question text"
              className="flex-1"
            />
            <FormSelect
              value={q.type}
              onChange={e => updateQuestion(q.id, { type: e.target.value as EventCustomQuestion['type'], options: (e.target.value === 'dropdown' || e.target.value === 'radio' || e.target.value === 'checkbox') ? (q.options ?? ['']) : undefined })}
              className="w-40"
            >
              <option value="text">Single-line text</option>
              <option value="dropdown">Dropdown</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio Button</option>
              <option value="date">Date Input</option>
            </FormSelect>
            <button
              type="button"
              onClick={() => removeQuestion(q.id)}
              className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <FormInput
            value={q.description ?? ''}
            onChange={e => updateQuestion(q.id, { description: e.target.value })}
            placeholder="Description shown below the question (optional) — explain why you're asking"
            className="text-xs"
          />

          {(q.type === 'dropdown' || q.type === 'radio') && (
            <div className="space-y-1.5 pl-2">
              {(q.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <FormInput
                    value={opt}
                    onChange={e => updateOption(q.id, idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(q.id, idx)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(q.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add option
              </button>
            </div>
          )}

          <label className="inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={q.required}
              onChange={e => updateQuestion(q.id, { required: e.target.checked })}
              className="rounded border-neutral-300 dark:border-neutral-700"
            />
            Mandatory
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add custom question
      </button>
    </div>
  );
}

// ─── Event Image Upload ───────────────────────────────────────────────────────
export function EventImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <FormField className="md:col-span-2">
      <FormLabel>Event Banner</FormLabel>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="Event" className="w-24 h-24 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800" />
        ) : (
          <div className="w-24 h-24 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Upload Banner
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs font-medium text-error-600 hover:underline text-left"
            >
              Remove banner
            </button>
          )}
        </div>
      </div>
    </FormField>
  );
}

// ─── Terms & Conditions Sections Editor ───────────────────────────────────────
// Lets an admin define multiple editable sections (Terms and Conditions,
// Privacy Policy, etc.) — each with a title and a rich-text description.
export function TermsSectionsEditor({
  sections,
  onChange,
  disabled,
}: {
  sections: EventTermsSection[];
  onChange: (next: EventTermsSection[]) => void;
  disabled?: boolean;
}) {
  const addSection = () => {
    onChange([...sections, { id: `TS-${Date.now()}`, title: '', description: '' }]);
  };
  const updateSection = (id: string, patch: Partial<EventTermsSection>) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...patch } : s));
  };
  const removeSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div key={section.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <FormInput
              value={section.title}
              onChange={e => updateSection(section.id, { title: e.target.value })}
              placeholder="Section title (e.g. Terms and Conditions, Privacy Policy)"
              disabled={disabled}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              disabled={disabled}
              className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <RichTextEditor
            value={section.description}
            onChange={html => updateSection(section.id, { description: html })}
            placeholder="Section description…"
            disabled={disabled}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 disabled:hover:text-neutral-600 dark:disabled:hover:text-neutral-400"
      >
        <Plus className="w-3.5 h-3.5" /> Add Section
      </button>
    </div>
  );
}
