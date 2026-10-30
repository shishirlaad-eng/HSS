import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { FormModal } from './hb/common';
import {
  OtherDakshinaRecord,
  resolveLocationForShakha,
  addOtherDakshinaRecords,
} from '../../mockAPI/otherDakshinaData';

interface OtherDakshinaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedRow {
  shakhaId: string;
  reference: string;
  shakha: string;
  date: string;
  amount: number;
  isValid: boolean;
  error?: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell.trim()); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(c => c.length > 0)) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) rows.push(row);
  }
  return rows;
}

function normalizeDate(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  // If DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return trimmed;
}

export default function OtherDakshinaUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: OtherDakshinaUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFileName('');
    setParsedRows([]);
    setIsDragging(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const allRows = parseCsv(text);
        if (allRows.length < 2) {
          toast.error('CSV file contains no data rows.');
          return;
        }

        const headers = allRows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const colShakhaId = headers.findIndex(h => h.includes('shakhaid') || h === 'id' || h === 'centreid');
        const colRef = headers.findIndex(h => h.includes('ref') || h === 'reference');
        const colShakha = headers.findIndex(h => h === 'shakha' || h.includes('centre') || h.includes('activitycentre'));
        const colDate = headers.findIndex(h => h === 'date' || h.includes('paymentdate'));
        const colAmount = headers.findIndex(h => h === 'amount' || h.includes('dakshina'));

        if (colRef === -1 || colShakha === -1 || colAmount === -1) {
          toast.error('CSV missing required columns: Reference, Shakha, and Amount.');
          return;
        }

        const dataRows = allRows.slice(1);
        const parsed: ParsedRow[] = dataRows.map((r, idx) => {
          const rawRef = colRef !== -1 ? r[colRef] ?? '' : '';
          const rawShakha = colShakha !== -1 ? r[colShakha] ?? '' : '';
          const rawShakhaId = colShakhaId !== -1 ? r[colShakhaId] ?? '' : `SHK-${idx + 1}`;
          const rawDate = colDate !== -1 ? r[colDate] ?? '' : new Date().toISOString().split('T')[0];
          const rawAmount = colAmount !== -1 ? r[colAmount] ?? '' : '0';

          const cleanAmount = parseFloat(rawAmount.replace(/[£$,]/g, ''));
          const formattedDate = normalizeDate(rawDate);

          const errors: string[] = [];
          if (!rawRef) errors.push('Missing Reference');
          if (!rawShakha) errors.push('Missing Shakha');
          if (isNaN(cleanAmount) || cleanAmount <= 0) errors.push('Invalid Amount');
          if (!formattedDate) errors.push('Invalid Date');

          return {
            shakhaId: rawShakhaId || `SHK-${idx + 1}`,
            reference: rawRef,
            shakha: rawShakha,
            date: formattedDate || new Date().toISOString().split('T')[0],
            amount: isNaN(cleanAmount) ? 0 : Math.round(cleanAmount * 100) / 100,
            isValid: errors.length === 0,
            error: errors.join(', '),
          };
        });

        setParsedRows(parsed);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        toast.error('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const sampleCsv = [
      'Shakha ID,Reference,Shakha,Date,Amount',
      'SHK-WBL,REF-2026-0801,Wembley Activity Centre,2026-08-15,150.00',
      'SHK-HRW,REF-2026-0802,Harrow Activity Centre,2026-08-20,250.00',
      'SHK-BME,REF-2026-0803,Birmingham East Activity Centre,2026-08-25,120.00',
      'SHK-MNC,REF-2026-0804,Manchester Central Activity Centre,2026-09-02,180.00',
    ].join('\n');

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_other_dakshina_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample CSV template downloaded.');
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const totalAmount = validRows.reduce((sum, r) => sum + r.amount, 0);

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      toast.error('No valid records to import.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const recordsToSave: OtherDakshinaRecord[] = validRows.map((r, i) => {
        const loc = resolveLocationForShakha(r.shakha);
        return {
          id: `OD-IMP-${Date.now()}-${i + 1}`,
          shakhaId: r.shakhaId,
          reference: r.reference,
          shakha: r.shakha,
          date: r.date,
          amount: r.amount,
          country: loc.country,
          region: loc.region,
          town: loc.town,
          uploadedAt: new Date().toISOString(),
        };
      });

      addOtherDakshinaRecords(recordsToSave);
      setIsProcessing(false);
      toast.success(`Successfully imported ${validRows.length} Other Dakshina records!`);
      onSuccess(validRows.length);
      handleClose();
    }, 400);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Other Dakshina Records"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Upload a CSV file containing Other Dakshina records. Records are attributed directly to the Shakha (not against any specific member).
        </p>

        {/* Download Sample Template Bar */}
        <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">Need the template format?</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Expected columns: Shakha ID, Reference, Shakha, Date, Amount</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download Sample CSV
          </button>
        </div>

        {/* Drag & Drop File Zone */}
        {!fileName ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 bg-neutral-50/50 dark:bg-neutral-900/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Click to select or drag and drop your CSV file
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              File must be in .csv format with headers: Shakha ID, Reference, Shakha, Date, Amount
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{fileName}</p>
                <p className="text-xs text-neutral-500">{parsedRows.length} total rows parsed</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetState}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preview of Parsed Records */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {validRows.length} valid
                </span>
                {parsedRows.length - validRows.length > 0 && (
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <AlertCircle className="w-4 h-4" /> {parsedRows.length - validRows.length} with errors
                  </span>
                )}
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                Total to Import: <span className="text-emerald-600 font-bold">£{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg slim-scroll">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-100 dark:bg-neutral-900 sticky top-0 font-semibold text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <th className="px-3.5 py-2">Shakha ID</th>
                    <th className="px-3.5 py-2">Reference</th>
                    <th className="px-3.5 py-2">Shakha</th>
                    <th className="px-3.5 py-2">Date</th>
                    <th className="px-3.5 py-2 text-right">Amount</th>
                    <th className="px-3.5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className={r.isValid ? '' : 'bg-rose-50/40 dark:bg-rose-950/10'}>
                      <td className="px-3.5 py-2 font-mono text-neutral-600 dark:text-neutral-400">{r.shakhaId}</td>
                      <td className="px-3.5 py-2 font-medium text-neutral-900 dark:text-white">{r.reference}</td>
                      <td className="px-3.5 py-2 text-neutral-600 dark:text-neutral-300">{r.shakha}</td>
                      <td className="px-3.5 py-2 text-neutral-600 dark:text-neutral-400">{r.date}</td>
                      <td className="px-3.5 py-2 text-right font-semibold text-neutral-900 dark:text-white">
                        £{r.amount.toFixed(2)}
                      </td>
                      <td className="px-3.5 py-2">
                        {r.isValid ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200" title={r.error}>
                            {r.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={validRows.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Importing...' : `Import ${validRows.length} Records`}
          </button>
        </div>
      </div>
    </FormModal>
  );
}
