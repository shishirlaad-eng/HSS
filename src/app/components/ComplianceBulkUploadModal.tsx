import { useRef, useState } from 'react';
import { AlertTriangle, Download, FileUp, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FormModal } from './hb/common';
import { PrimaryButton } from './hb/listing';
import { buildXlsx } from '../../utils/xlsxWriter';
import {
  Member,
  CertStatus,
  DBSStatus,
  FIRST_AID_QUALIFICATION_OPTIONS,
  SAFEGUARDING_LEVEL_OPTIONS,
  FirstAidQualification,
  SafeguardingLevel,
} from '../../mockAPI/membersData';

export type ComplianceUploadType = 'firstAid' | 'dbs' | 'safeguarding';

const MAX_ROWS = 500;

const TYPE_LABELS: Record<ComplianceUploadType, string> = {
  firstAid:     'First Aid',
  dbs:          'DBS',
  safeguarding: 'Safeguarding',
};

const REQUIRED_COLUMNS: Record<ComplianceUploadType, string[]> = {
  safeguarding: ['Membership Id', 'First Name', 'Last Name', 'Level of Training', 'Date Complete', 'Safeguarding Status'],
  dbs: [
    'Membership Id', 'First Name', 'Last Name', 'DBS Status', 'DBS Cert Number', 'DBS Cert Date', 'DBS Cert File',
    'DBS Update Service', 'DBS Update Service No.', 'Application Under Process', 'Cert Received From', 'Verified By',
  ],
  firstAid: ['Membership Id', 'First Name', 'Last Name', 'First Aid Status', 'Expiry Date', 'First Aid Qualification', 'Cert Upload'],
};

interface RowError { row: number; field: string; message: string }

interface ParsedRow { member: Member; apply: () => void }

// ── CSV helpers ────────────────────────────────────────────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function toIsoDate(v: string): string | null {
  const s = v.trim();
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) { y = +match[1]; m = +match[2]; d = +match[3]; }
  else if ((match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) { d = +match[1]; m = +match[2]; y = +match[3]; }
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function matchOption<T extends string>(v: string, options: readonly T[]): T | undefined {
  const n = v.trim().toLowerCase();
  return options.find(o => o.toLowerCase() === n);
}

const parseYesNo = (v: string): boolean | undefined => {
  const n = v.trim().toLowerCase();
  if (n === 'yes' || n === 'y' || n === 'true') return true;
  if (n === 'no' || n === 'n' || n === 'false') return false;
  return undefined;
};

const normKeyLocal = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Identify which upload a file is for from its header row: each type has one
// status column the other two lack.
function detectType(headerRow: string[]): ComplianceUploadType | undefined {
  const headers = new Set(headerRow.map(normKeyLocal));
  const marker: Record<ComplianceUploadType, string> = {
    firstAid: 'First Aid Status',
    dbs: 'DBS Status',
    safeguarding: 'Safeguarding Status',
  };
  const hits = (Object.keys(marker) as ComplianceUploadType[]).filter(t => headers.has(normKeyLocal(marker[t])));
  return hits.length === 1 ? hits[0] : undefined;
}

// One workbook, one tab per compliance type, each holding just the mandatory
// column headers. Save a filled tab as CSV to upload it.
function downloadBlankWorkbook() {
  const blob = buildXlsx([
    { name: 'Safeguarding', rows: [REQUIRED_COLUMNS.safeguarding] },
    { name: 'DBS',          rows: [REQUIRED_COLUMNS.dbs] },
    { name: 'First Aid',    rows: [REQUIRED_COLUMNS.firstAid] },
  ]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'compliance_bulk_upload_blank.xlsx';
  a.click();
}

function downloadBlankCsv(type: ComplianceUploadType) {
  const csv = REQUIRED_COLUMNS[type].join(',') + '\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `${type === 'firstAid' ? 'first_aid' : type}_bulk_upload_blank.csv`;
  a.click();
}

// ── Validation ─────────────────────────────────────────────────────

function validate(
  type: ComplianceUploadType,
  records: string[][],
  members: Member[],
): { total: number; errors: RowError[]; valid: ParsedRow[]; fatal?: string } {
  const required = REQUIRED_COLUMNS[type];
  const [headerRow, ...dataRows] = records;
  const headerIdx: Record<string, number> = {};
  headerRow.forEach((h, i) => { headerIdx[normKey(h)] = i; });
  const missing = required.filter(c => headerIdx[normKey(c)] === undefined);
  if (missing.length) return { total: 0, errors: [], valid: [], fatal: `Missing required column(s): ${missing.join(', ')}.` };
  if (dataRows.length === 0) return { total: 0, errors: [], valid: [], fatal: 'File has no data rows.' };
  if (dataRows.length > MAX_ROWS) return { total: dataRows.length, errors: [], valid: [], fatal: `File has ${dataRows.length} rows. Maximum is ${MAX_ROWS} per upload.` };

  const byId = new Map(members.map(m => [m.id.toLowerCase(), m]));
  const seen = new Set<string>();
  const errors: RowError[] = [];
  const valid: ParsedRow[] = [];

  dataRows.forEach((cells, idx) => {
    const rowNo = idx + 2; // header is row 1
    const get = (col: string) => (cells[headerIdx[normKey(col)]] ?? '').trim();
    const rowErrors: RowError[] = [];
    const err = (field: string, message: string) => rowErrors.push({ row: rowNo, field, message });

    const id = get('Membership Id');
    const firstName = get('First Name');
    const lastName = get('Last Name');
    let member: Member | undefined;
    if (!id) err('Membership Id', 'Membership Id is required.');
    else {
      member = byId.get(id.toLowerCase());
      if (!member) err('Membership Id', `No member found with ID ${id} in your scope.`);
      else if (seen.has(member.id)) err('Membership Id', `Duplicate row for ${member.id}.`);
    }
    if (!firstName) err('First Name', 'First Name is required.');
    if (!lastName) err('Last Name', 'Last Name is required.');
    if (member && firstName && lastName) {
      const mFirst = (member.firstName ?? member.name.split(' ')[0]).toLowerCase();
      const mLast = (member.surname ?? member.name.split(' ').slice(1).join(' ')).toLowerCase();
      if (mFirst !== firstName.toLowerCase() || mLast !== lastName.toLowerCase()) {
        err('First Name / Last Name', `Name does not match member record (${member.name}).`);
      }
    }

    let apply: (() => void) | null = null;

    if (type === 'safeguarding') {
      const level = matchOption<SafeguardingLevel>(get('Level of Training'), SAFEGUARDING_LEVEL_OPTIONS);
      const date = toIsoDate(get('Date Complete'));
      const status = matchOption<CertStatus>(get('Safeguarding Status'), ['Certified', 'Expired', 'N/A']);
      if (!get('Level of Training')) err('Level of Training', 'Level of Training is required.');
      else if (!level) err('Level of Training', 'Not a recognised level of training.');
      if (!get('Date Complete')) err('Date Complete', 'Date Complete is required.');
      else if (!date) err('Date Complete', 'Invalid date. Use YYYY-MM-DD or DD/MM/YYYY.');
      if (!get('Safeguarding Status')) err('Safeguarding Status', 'Safeguarding Status is required.');
      else if (!status) err('Safeguarding Status', 'Must be Certified, Expired or N/A.');
      apply = () => {
        if (!member) return;
        member.compliance = { ...member.compliance, safeguardingTraining: status };
        member.safeguardingTrainingLevel = level;
        member.safeguardingTrainingDate = date ?? undefined;
      };
    }

    if (type === 'dbs') {
      const status = matchOption<DBSStatus>(get('DBS Status'), ['Approved', 'Pending', 'N/A']);
      const certNo = get('DBS Cert Number');
      const certDateRaw = get('DBS Cert Date');
      const certDate = toIsoDate(certDateRaw);
      const certFile = get('DBS Cert File');
      const updateSvc = parseYesNo(get('DBS Update Service'));
      const updateNo = get('DBS Update Service No.');
      const underProcess = parseYesNo(get('Application Under Process'));
      const receivedFrom = get('Cert Received From');
      const verifiedBy = get('Verified By');
      const approved = status === 'Approved';
      if (!get('DBS Status')) err('DBS Status', 'DBS Status is required.');
      else if (!status) err('DBS Status', 'Must be Approved, Pending or N/A.');
      if (!get('DBS Update Service')) err('DBS Update Service', 'DBS Update Service is required.');
      else if (updateSvc === undefined) err('DBS Update Service', 'Must be Yes or No.');
      if (updateSvc && !updateNo) err('DBS Update Service No.', 'Required when DBS Update Service is Yes.');
      if (!get('Application Under Process')) err('Application Under Process', 'Application Under Process is required.');
      else if (underProcess === undefined) err('Application Under Process', 'Must be Yes or No.');
      if (approved && !certNo) err('DBS Cert Number', 'Required when DBS Status is Approved.');
      if (approved && !certDateRaw) err('DBS Cert Date', 'Required when DBS Status is Approved.');
      if (certDateRaw && !certDate) err('DBS Cert Date', 'Invalid date. Use YYYY-MM-DD or DD/MM/YYYY.');
      if (approved && !certFile) err('DBS Cert File', 'Required when DBS Status is Approved.');
      if (approved && !receivedFrom) err('Cert Received From', 'Required when DBS Status is Approved.');
      if (approved && !verifiedBy) err('Verified By', 'Required when DBS Status is Approved.');
      apply = () => {
        if (!member) return;
        member.compliance = { ...member.compliance, dbs: status ?? member.compliance.dbs };
        member.dbsCertificateNumber = certNo || undefined;
        member.dbsCertificateDate = certDate ?? undefined;
        member.dbsCertificateFile = certFile || undefined;
        member.dbsUpdateService = updateSvc;
        member.dbsUpdateServiceNumber = updateSvc ? updateNo : undefined;
        member.dbsAppUnderProcess = underProcess;
        member.dbsCertificateReceivedFrom = receivedFrom || undefined;
        member.dbsCheckedBy = verifiedBy || undefined;
      };
    }

    if (type === 'firstAid') {
      const status = matchOption<CertStatus>(get('First Aid Status'), ['Certified', 'Expired', 'N/A']);
      const expiryRaw = get('Expiry Date');
      const expiry = toIsoDate(expiryRaw);
      const qualRaw = get('First Aid Qualification');
      const qual = matchOption<FirstAidQualification>(qualRaw, FIRST_AID_QUALIFICATION_OPTIONS);
      const certFile = get('Cert Upload');
      const holds = status === 'Certified' || status === 'Expired';
      if (!get('First Aid Status')) err('First Aid Status', 'First Aid Status is required.');
      else if (!status) err('First Aid Status', 'Must be Certified, Expired or N/A.');
      if (holds && !expiryRaw) err('Expiry Date', 'Required when First Aid Status is Certified or Expired.');
      if (expiryRaw && !expiry) err('Expiry Date', 'Invalid date. Use YYYY-MM-DD or DD/MM/YYYY.');
      if (holds && !qualRaw) err('First Aid Qualification', 'Required when First Aid Status is Certified or Expired.');
      else if (qualRaw && !qual) err('First Aid Qualification', 'Not a recognised First Aid qualification.');
      if (holds && !certFile) err('Cert Upload', 'Required when First Aid Status is Certified or Expired.');
      apply = () => {
        if (!member) return;
        member.compliance = { ...member.compliance, firstAid: status ?? member.compliance.firstAid };
        member.isFirstAider = holds;
        member.firstAidQualificationLevel = holds ? qual : undefined;
        member.firstAidQualificationExpiryDate = holds ? expiry ?? undefined : undefined;
        member.firstAidCertificateFile = holds ? certFile : undefined;
      };
    }

    if (rowErrors.length) errors.push(...rowErrors);
    else if (member && apply) { seen.add(member.id); valid.push({ member, apply }); }
    else if (member) seen.add(member.id);
  });

  return { total: dataRows.length, errors, valid };
}

// ── Modal ──────────────────────────────────────────────────────────

export default function ComplianceBulkUploadModal({
  isOpen,
  onClose,
  members,
  onApplied,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onApplied: () => void;
}) {
  const [step, setStep] = useState<'upload' | 'results'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [fileName, setFileName] = useState('');
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [validRows, setValidRows] = useState<ParsedRow[]>([]);
  const [fatal, setFatal] = useState<string | undefined>();
  const [type, setType] = useState<ComplianceUploadType | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload'); setFileName(''); setTotal(0); setErrors([]); setValidRows([]); setFatal(undefined); setType(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    if (isProcessing || isConfirming) return;
    reset();
    onClose();
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { toast.error('Please upload a CSV file.'); return; }
    setIsProcessing(true);
    try {
      const records = parseCsv(await file.text());
      setFileName(file.name);
      if (records.length === 0) {
        setTotal(0); setErrors([]); setValidRows([]); setFatal('File is empty.');
      } else {
        const detected = detectType(records[0]);
        setType(detected);
        if (!detected) {
          setTotal(0); setErrors([]); setValidRows([]);
          setFatal('Could not tell which upload this is. Use one of the blank CSVs: it must contain exactly one of "First Aid Status", "DBS Status" or "Safeguarding Status".');
          setStep('results');
          return;
        }
        const result = validate(detected, records, members);
        setTotal(result.total); setErrors(result.errors); setValidRows(result.valid); setFatal(result.fatal);
      }
      setStep('results');
    } catch {
      toast.error('Unable to read the file. Please try again.');
    } finally {
      setIsProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleConfirm = async () => {
    if (validRows.length === 0) { toast.error('No valid rows to upload.'); return; }
    setIsConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    validRows.forEach(r => r.apply());
    setIsConfirming(false);
    const label = type ? TYPE_LABELS[type] : 'Compliance';
    toast.success(`${validRows.length} ${label} record${validRows.length === 1 ? '' : 's'} updated.`);
    onApplied();
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const errorRowCount = new Set(errors.map(e => e.row)).size;

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Compliance Bulk Upload" maxWidth="max-w-2xl">
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto slim-scroll">

        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Download the blank sample file. It has 3 tabs (Safeguarding, DBS, First Aid), each with the mandatory columns for that type. Fill one tab, then save it as CSV to upload.
            </p>
            <button
              type="button"
              onClick={downloadBlankWorkbook}
              className="inline-flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download sample
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Or download a single CSV:</span>
            {(Object.keys(TYPE_LABELS) as ComplianceUploadType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => downloadBlankCsv(t)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />

        {step === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
            }`}
          >
            <FileUp className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {isProcessing ? 'Processing file...' : 'Drop your CSV file here, or click to browse'}
            </p>
            <p className="text-xs text-neutral-400">CSV files only. Max {MAX_ROWS} rows per upload.</p>
          </div>
        )}

        {step === 'results' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Rows', value: total, cls: 'text-neutral-900 dark:text-white' },
                { label: 'Valid Rows', value: validRows.length, cls: 'text-[#3d8928]' },
                { label: 'Error Rows', value: errorRowCount, cls: errorRowCount > 0 ? 'text-error-600' : 'text-neutral-900 dark:text-white' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              File: <span className="font-medium text-neutral-700 dark:text-neutral-300">{fileName}</span>{type && <> · Type: <span className="font-medium text-neutral-700 dark:text-neutral-300">{TYPE_LABELS[type]}</span></>}
            </p>

            {fatal && (
              <div className="flex items-center gap-2 p-3 bg-[#fff0f0] border border-[#ffaaab] rounded-lg">
                <AlertTriangle className="w-4 h-4 text-error-600 flex-shrink-0" />
                <p className="text-xs text-[#9a0c17]">{fatal}</p>
              </div>
            )}

            {errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-error-600 uppercase tracking-wider mb-2">Row-level errors</p>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Row</th>
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Field</th>
                        <th className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {errors.map((e, i) => (
                        <tr key={i} className="bg-white dark:bg-neutral-950">
                          <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{e.row}</td>
                          <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{e.field}</td>
                          <td className="px-3 py-2 text-error-600 dark:text-[#f87171]">{e.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!fatal && validRows.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#fff0f0] border border-[#ffaaab] rounded-lg">
                <AlertTriangle className="w-4 h-4 text-error-600 flex-shrink-0" />
                <p className="text-xs text-[#9a0c17]">No valid rows found. Please correct the errors and re-upload.</p>
              </div>
            )}

            <button
              onClick={reset}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ← Upload a different file
            </button>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
        <button
          onClick={handleClose}
          disabled={isProcessing || isConfirming}
          className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {step === 'upload' && (
          <PrimaryButton icon={Upload} onClick={() => fileRef.current?.click()} disabled={isProcessing}>
            Upload CSV
          </PrimaryButton>
        )}
        {step === 'results' && (
          <PrimaryButton onClick={handleConfirm} disabled={isConfirming || validRows.length === 0} isLoading={isConfirming}>
            {isConfirming ? 'Uploading...' : `Confirm Bulk Upload${validRows.length ? ` (${validRows.length})` : ''}`}
          </PrimaryButton>
        )}
      </div>
    </FormModal>
  );
}
