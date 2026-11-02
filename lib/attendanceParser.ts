// Robust BNI "Laporan Kehadiran Karyawan" PDF and Excel/CSV parser

const MONTH_MAP: Record<string, string> = {
  january: '01', januari: '01', jan: '01',
  february: '02', februari: '02', feb: '02',
  march: '03', maret: '03', mar: '03',
  april: '04', apr: '04',
  may: '05', mei: '05',
  june: '06', juni: '06', jun: '06',
  july: '07', juli: '07', jul: '07',
  august: '08', agustus: '08', aug: '08', agu: '08',
  september: '09', sep: '09',
  october: '10', oktober: '10', oct: '10', okt: '10',
  november: '11', nov: '11',
  december: '12', desember: '12', dec: '12', des: '12',
};

export interface ExtractedAttendanceRow {
  date: string; // YYYY-MM-DD
  dayNum: number;
  inTime: string; // HH:mm:ss
  outTime: string; // HH:mm:ss
  missingCheckout: boolean;
  isHoliday: boolean;
  ket: string; // e.g. 'H', 'T', 'LIB', etc.
}

export function parseDateString(dayStr: string, monthStr: string, yearStr: string): string | null {
  const m = MONTH_MAP[monthStr.toLowerCase()];
  if (!m) return null;
  const day = dayStr.padStart(2, '0');
  const year = yearStr.length === 2 ? `20${yearStr}` : yearStr;
  return `${year}-${m}-${day}`;
}

export function normalizeTime(t: string): string {
  if (!t) return '';
  const parts = t.split(':');
  if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  if (parts.length === 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  return t;
}

// Extract directly from structured PDF text items
export async function extractAttendanceFromPDF(file: File): Promise<ExtractedAttendanceRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const rows: ExtractedAttendanceRow[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // Find table header items to determine column X boundaries
    // Headers typically include: "Tanggal", "Tipe Work Time", "Work Time", "Jam Check In", "Jam Check Out", "Total Jam Kerja", "Ket"
    let xCheckInMin = 0;
    let xCheckInMax = 0;
    let xCheckOutMin = 0;
    let xCheckOutMax = 0;

    for (const item of items) {
      const text = (item.str || '').trim().toLowerCase();
      const x = item.transform[4];
      if (text.includes('check in')) {
        xCheckInMin = x - 25;
        xCheckInMax = x + 65;
      } else if (text.includes('check out')) {
        xCheckOutMin = x - 25;
        xCheckOutMax = x + 65;
      }
    }

    // Group items by line (similar Y coordinate within ~5 units)
    const rowsMap = new Map<number, any[]>();
    for (const item of items) {
      const str = (item.str || '').trim();
      if (!str) continue;
      const y = Math.round(item.transform[5] / 4) * 4;
      if (!rowsMap.has(y)) {
        rowsMap.set(y, []);
      }
      rowsMap.get(y)!.push(item);
    }

    const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);

    const dateRegex = /\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/i;
    const timeRegex = /^\d{1,2}:\d{2}(?::\d{2})?$/;

    for (const y of sortedY) {
      const lineItems = rowsMap.get(y)!;
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

      const lineStr = lineItems.map((it) => it.str).join(' ');
      const dateMatch = lineStr.match(dateRegex);
      if (!dateMatch) continue;

      const dayStr = dateMatch[1];
      const monthStr = dateMatch[2];
      const yearStr = dateMatch[3];
      const formattedDate = parseDateString(dayStr, monthStr, yearStr);
      if (!formattedDate) continue;

      const dayNum = parseInt(dayStr, 10);
      const isLibur = /\b(LIB|Libur)\b/i.test(lineStr);

      let inTime = '';
      let outTime = '';
      let missingCheckout = false;

      if (isLibur) {
        inTime = '08:00:00';
        outTime = '17:00:00';
      } else {
        // Method 1: Check items by X column coordinates if header was found
        if (xCheckInMin > 0 && xCheckOutMin > 0) {
          for (const it of lineItems) {
            const val = (it.str || '').trim();
            const itX = it.transform[4];
            if (timeRegex.test(val)) {
              if (itX >= xCheckInMin && itX <= xCheckInMax && !inTime) {
                inTime = val;
              } else if (itX >= xCheckOutMin && itX <= xCheckOutMax && !outTime) {
                outTime = val;
              }
            } else if (val === '-') {
              if (itX >= xCheckOutMin && itX <= xCheckOutMax) {
                outTime = '';
              }
            }
          }
        }

        // Method 2: If coordinate match didn't catch both, parse tokens from line string
        if (!inTime) {
          const idx = lineStr.indexOf(dateMatch[0]);
          const afterDate = lineStr.substring(idx + dateMatch[0].length);
          // Remove schedule range (e.g. 07:30:00-16:30:00 or 08:00-17:00)
          const cleaned = afterDate.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*-\s*\d{1,2}:\d{2}(?::\d{2})?\b/g, ' [SCHED] ');
          const tokens = cleaned.trim().split(/\s+/);

          const timeTokens: string[] = [];
          for (let i = 0; i < tokens.length; i++) {
            const tok = tokens[i];
            if (timeRegex.test(tok)) {
              timeTokens.push(tok);
            } else if (tok === '-' && timeTokens.length === 1) {
              // check-out is '-'
              timeTokens.push('-');
            }
          }

          if (timeTokens.length >= 2) {
            inTime = timeTokens[0];
            outTime = timeTokens[1] === '-' ? '' : timeTokens[1];
          } else if (timeTokens.length === 1) {
            inTime = timeTokens[0];
            outTime = '';
          }
        }

        if (inTime && !outTime) {
          missingCheckout = true;
        }
      }

      let ket = '';
      if (/\bH\b/.test(lineStr)) ket = 'H';
      else if (/\bT\b/.test(lineStr)) ket = 'T';
      else if (isLibur) ket = 'LIB';

      rows.push({
        date: formattedDate,
        dayNum,
        inTime: inTime ? normalizeTime(inTime) : '',
        outTime: outTime ? normalizeTime(outTime) : '',
        missingCheckout,
        isHoliday: isLibur,
        ket,
      });
    }
  }

  // Remove duplicate dates if any (keep latest)
  const uniqueMap = new Map<string, ExtractedAttendanceRow>();
  for (const r of rows) {
    uniqueMap.set(r.date, r);
  }

  return Array.from(uniqueMap.values());
}

// Extract from text or CSV/Excel
export function parseAttendanceText(fullText: string): ExtractedAttendanceRow[] {
  const lines = fullText.split(/\r?\n/);
  const rows: ExtractedAttendanceRow[] = [];

  const dateRegex = /\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/i;
  const timeRegex = /^\d{1,2}:\d{2}(?::\d{2})?$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(dateRegex);
    if (!dateMatch) continue;

    const dayStr = dateMatch[1];
    const monthStr = dateMatch[2];
    const yearStr = dateMatch[3];
    const formattedDate = parseDateString(dayStr, monthStr, yearStr);
    if (!formattedDate) continue;

    const dayNum = parseInt(dayStr, 10);
    const isLibur = /\b(LIB|Libur)\b/i.test(trimmed);

    const idx = trimmed.indexOf(dateMatch[0]);
    const afterDate = trimmed.substring(idx + dateMatch[0].length);
    const cleaned = afterDate.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*-\s*\d{1,2}:\d{2}(?::\d{2})?\b/g, ' [SCHED] ');
    const tokens = cleaned.trim().split(/[\s,]+/);

    let inTime = '';
    let outTime = '';
    let missingCheckout = false;

    if (isLibur) {
      inTime = '08:00:00';
      outTime = '17:00:00';
    } else {
      const timeTokens: string[] = [];
      for (const tok of tokens) {
        if (timeRegex.test(tok)) {
          timeTokens.push(tok);
        } else if (tok === '-' && timeTokens.length === 1) {
          timeTokens.push('-');
        }
      }

      if (timeTokens.length >= 2) {
        inTime = timeTokens[0];
        outTime = timeTokens[1] === '-' ? '' : timeTokens[1];
      } else if (timeTokens.length === 1) {
        inTime = timeTokens[0];
        outTime = '';
      }

      if (inTime && !outTime) {
        missingCheckout = true;
      }
    }

    let ket = '';
    if (/\bH\b/.test(trimmed)) ket = 'H';
    else if (/\bT\b/.test(trimmed)) ket = 'T';
    else if (isLibur) ket = 'LIB';

    rows.push({
      date: formattedDate,
      dayNum,
      inTime: inTime ? normalizeTime(inTime) : '',
      outTime: outTime ? normalizeTime(outTime) : '',
      missingCheckout,
      isHoliday: isLibur,
      ket,
    });
  }

  const uniqueMap = new Map<string, ExtractedAttendanceRow>();
  for (const r of rows) {
    uniqueMap.set(r.date, r);
  }
  return Array.from(uniqueMap.values());
}

// Extract from Excel/CSV
export async function extractRowsFromExcel(file: File): Promise<ExtractedAttendanceRow[]> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csvText = XLSX.utils.sheet_to_csv(worksheet);
  return parseAttendanceText(csvText);
}
