import { useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Unlink } from "lucide-react";
import { cn } from "../../ui/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (editorRef.current && lastValue.current !== value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      lastValue.current = value;
    }
  }, [value]);

  const execCommand = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastValue.current = html;
      onChange(html);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter the URL to link (e.g. https://example.com)');
    if (!url || !url.trim()) return;
    editorRef.current?.focus();
    document.execCommand('createLink', false, url.trim());
    if (editorRef.current) {
      // Make inserted links open in a new tab
      editorRef.current.querySelectorAll('a:not([target])').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      const html = editorRef.current.innerHTML;
      lastValue.current = html;
      onChange(html);
    }
  };

  const handleRemoveLink = () => execCommand('unlink');

  const toolButtons: { icon: React.ElementType; command: string; arg?: string; title: string }[] = [
    { icon: Bold,        command: 'bold',              title: 'Bold' },
    { icon: Italic,      command: 'italic',            title: 'Italic' },
    { icon: Underline,   command: 'underline',         title: 'Underline' },
    { icon: AlignLeft,   command: 'justifyLeft',       title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter',     title: 'Align Center' },
    { icon: AlignRight,  command: 'justifyRight',       title: 'Align Right' },
    { icon: List,        command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList',   title: 'Numbered List' },
  ];

  return (
    <div className={cn("border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 bg-neutral-50 dark:bg-neutral-900 p-1.5 border-b border-neutral-200 dark:border-neutral-800">
        {toolButtons.map(({ icon: Icon, command, arg, title }) => (
          <button
            key={command}
            type="button"
            onClick={() => execCommand(command, arg)}
            title={title}
            className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />
        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Link"
          className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRemoveLink}
          title="Remove Link"
          className="w-7 h-7 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={e => {
          const html = e.currentTarget.innerHTML;
          lastValue.current = html;
          onChange(html);
        }}
        className="w-full min-h-[100px] max-h-[280px] overflow-y-auto slim-scroll p-3 text-sm text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none leading-relaxed prose dark:prose-invert max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400"
        style={{ outline: 'none' }}
      />
    </div>
  );
}
