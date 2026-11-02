'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Settings,
  Database,
  CheckCircle,
  Save,
  Clock,
  Sparkles,
  Upload,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { TimesheetConfig, DayRecord, DEFAULT_CONFIG } from '@/types/timesheet';
import { TimesheetTable } from '@/components/TimesheetTable';
import { ConfigModal } from '@/components/ConfigModal';
import { extractAttendanceFromPDF, parseAttendanceText, extractRowsFromExcel } from '@/lib/attendanceParser';

// Sample dataset provided by user for September 2026
const SAMPLE_SEPTEMBER_2026: Record<string, Partial<DayRecord>> = {
  '2026-09-01': { startTime: '08:22:00', endTime: '18:08:00', totalHour: '09:46:00', status: 'P', activity: 'Develop Migration service to migrate old files to object storage' },
  '2026-09-02': { startTime: '08:22:00', endTime: '17:36:00', totalHour: '09:14:00', status: 'P', activity: 'Develop Migration service to migrate old files to object storage' },
  '2026-09-03': { startTime: '08:21:00', endTime: '18:11:00', totalHour: '09:50:00', status: 'P', activity: 'Develop Migration service to migrate old files to object storage' },
  '2026-09-04': { startTime: '08:03:00', endTime: '17:46:00', totalHour: '09:43:00', status: 'P', activity: '• Develop Migration service to migrate old files to object storage\n• Rollback file location to disk on upload endpoints' },
  '2026-09-05': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-06': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-07': { startTime: '08:22:00', endTime: '17:25:00', totalHour: '09:03:00', status: 'P', activity: 'Refactor masterdata feature to layered architecture' },
  '2026-09-08': { startTime: '08:17:00', endTime: '17:47:00', totalHour: '09:30:00', status: 'P', activity: 'Refactor masterdata feature to layered architecture' },
  '2026-09-09': { startTime: '08:24:00', endTime: '17:29:00', totalHour: '09:05:00', status: 'P', activity: '• Refactor masterdata feature to layered architecture\n• Fix SonarQube issues on masterdata endpoints' },
  '2026-09-10': { startTime: '08:21:00', endTime: '17:39:00', totalHour: '09:18:00', status: 'P', activity: 'Fix SonarQube issues on masterdata endpoints' },
  '2026-09-11': { startTime: '08:03:00', endTime: '17:40:00', totalHour: '09:37:00', status: 'P', activity: 'Create Unit tests for masterdata features' },
  '2026-09-12': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-13': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-14': { startTime: '08:22:00', endTime: '17:23:00', totalHour: '09:01:00', status: 'P', activity: 'Create Unit tests for masterdata features' },
  '2026-09-15': { startTime: '08:27:00', endTime: '17:28:00', totalHour: '09:01:00', status: 'P', activity: 'Create Unit tests for masterdata features' },
  '2026-09-16': { startTime: '08:25:00', endTime: '19:29:00', totalHour: '11:04:00', status: 'P', activity: 'Create Unit tests for masterdata features' },
  '2026-09-17': { startTime: '08:26:00', endTime: '17:27:00', totalHour: '09:01:00', status: 'P', activity: 'Refactor report feature to layered architecture' },
  '2026-09-18': { startTime: '08:06:00', endTime: '17:21:00', totalHour: '09:15:00', status: 'P', activity: 'Refactor report feature to layered architecture' },
  '2026-09-19': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-20': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-21': { startTime: '08:18:00', endTime: '17:31:00', totalHour: '09:13:00', status: 'P', activity: '• Refactor report feature to layered architecture\n• Fix SonarQube issues on report endpoints' },
  '2026-09-22': { startTime: '08:18:00', endTime: '17:19:00', totalHour: '09:01:00', status: 'P', activity: '• Refactor report feature to layered architecture\n• Fix SonarQube issues on report endpoints' },
  '2026-09-23': { startTime: '08:25:00', endTime: '17:26:00', totalHour: '09:01:00', status: 'P', activity: 'Create Unit tests for report features' },
  '2026-09-24': { startTime: '08:22:00', endTime: '17:23:00', totalHour: '09:01:00', status: 'P', activity: 'Refactor dashboard feature to layered architecture' },
  '2026-09-25': { startTime: '07:59:00', endTime: '17:20:00', totalHour: '09:21:00', status: 'P', activity: 'Refactor dashboard feature to layered architecture' },
  '2026-09-26': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-27': { startTime: '08:00:00', endTime: '17:00:00', totalHour: '09:00:00', status: '', activity: '' },
  '2026-09-28': { startTime: '08:17:00', endTime: '17:35:00', totalHour: '09:18:00', status: 'P', activity: '• Refactor dashboard feature to layered architecture\n• Fix SonarQube issues on dashboard feature\n• Create Unit tests for dashboard feature' },
  '2026-09-29': { startTime: '08:24:00', endTime: '17:26:00', totalHour: '09:02:00', status: 'P', activity: '• Refactor dashboard feature to layered architecture\n• Fix SonarQube issues on dashboard feature\n• Create Unit tests for dashboard feature' },
  '2026-09-30': { startTime: '07:58:00', endTime: '18:03:00', totalHour: '10:05:00', status: 'P', activity: '• Fix SonarQube issues on dashboard feature\n• Create Unit tests for dashboard feature' }
};

export default function TimesheetPage() {
  const [period, setPeriod] = useState<string>('2026-09');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [config, setConfig] = useState<TimesheetConfig>(DEFAULT_CONFIG);
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfQuality, setPdfQuality] = useState<'compact' | 'high'>('compact');
  const [isExtractingAttendance, setIsExtractingAttendance] = useState(false);
  const [extractStatusMsg, setExtractStatusMsg] = useState('');
  const [saveStatusMsg, setSaveStatusMsg] = useState('');
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  // Daily form states
  const [formStatus, setFormStatus] = useState<DayRecord['status']>('P');
  const [formStart, setFormStart] = useState('08:00:00');
  const [formEnd, setFormEnd] = useState('17:00:00');
  const [formActivity, setFormActivity] = useState('');
  const [formProjectName, setFormProjectName] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAip, setFormAip] = useState('');
  const [formIsHoliday, setFormIsHoliday] = useState(false);
  const [formMissingCheckout, setFormMissingCheckout] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const hasUserEdited = useRef(false);

  const [selectedDates, setSelectedDates] = useState<string[]>([selectedDate]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const lastClickedDateRef = useRef<string>(selectedDate);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data: Load from LocalStorage + attempt MongoDB fetch
  useEffect(() => {
    const savedConfig = localStorage.getItem('ts_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error(e);
      }
    }

    const savedRecords = localStorage.getItem('ts_records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Pre-seed sample September data
      const initial: Record<string, DayRecord> = {};
      Object.entries(SAMPLE_SEPTEMBER_2026).forEach(([k, v]) => {
        initial[k] = {
          date: k,
          startTime: v.startTime || '08:00:00',
          endTime: v.endTime || '17:00:00',
          totalHour: v.totalHour || '09:00:00',
          status: (v.status as any) || '',
          activity: v.activity || '',
        };
      });
      setRecords(initial);
      localStorage.setItem('ts_records', JSON.stringify(initial));
    }

    // Try fetching from server route if Mongo Atlas URI configured
    fetch(`/api/timesheet?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setIsMongoConnected(data.connected);
        if (data.connected && data.records && Object.keys(data.records).length > 0) {
          setRecords((prev) => ({ ...prev, ...data.records }));
          if (data.config) setConfig(data.config);
        }
      })
      .catch((err) => console.log('Standalone mode:', err));
  }, [period]);

  // Sync Daily form fields when selectedDate changes
  useEffect(() => {
    const rec = records[selectedDate];
    const dateObj = new Date(selectedDate);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    if (rec) {
      setFormStatus(rec.status);
      setFormStart(rec.startTime || '08:00:00');
      setFormEnd(rec.endTime || '17:00:00');
      setFormActivity(rec.activity || '');
      setFormProjectName(rec.projectName || '');
      setFormProjectId(rec.projectId || '');
      setFormAip(rec.aip || '');
      setFormIsHoliday(!!rec.isHoliday);
      setFormMissingCheckout(!!rec.missingCheckout);
    } else {
      setFormStatus(isWeekend ? '' : 'P');
      setFormStart('08:00:00');
      setFormEnd('17:00:00');
      setFormActivity('');
      setFormProjectName('');
      setFormProjectId('');
      setFormAip('');
      setFormIsHoliday(false);
      setFormMissingCheckout(false);
    }
  }, [selectedDate, records]);

  const ID_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Set document.title to formatted filename: Vito Rizqi Ananda_BNI_DEV_TIMESHEET_{MMMM} {YYYY}
  useEffect(() => {
    const [yStr, mStr] = period.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const monthName = ID_MONTH_NAMES[m - 1] || 'Oktober';
    const yearName = y || new Date().getFullYear();
    const personName = config.sig1 || (config.name ? config.name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'Vito Rizqi Ananda');
    const pdfFileName = `${personName}_BNI_DEV_TIMESHEET_${monthName} ${yearName}`;
    document.title = pdfFileName;
  }, [period, config.name, config.sig1]);

  // Calculate duration
  const calcHours = (start: string, end: string) => {
    if (!start || !end) return '';
    const toSec = (s: string) => {
      const p = s.split(':').map(Number);
      return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
    };
    const diff = toSec(end) - toSec(start);
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Set standard working hours in 1 click
  const setQuickHours = (start: string, end: string) => {
    setFormStart(start);
    setFormEnd(end);
    setFormMissingCheckout(false);
    updateCurrentDaysLive('startTime', start);
    updateCurrentDaysLive('endTime', end);
  };

  // Compute live month attendance statistics for the preview header
  const monthStats = useMemo(() => {
    let p = 0, s = 0, v = 0, bt = 0, pm = 0, x = 0, totalHours = 0;
    const [y, m] = period.split('-').map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      const dKey = `${period}-${String(d).padStart(2, '0')}`;
      const rec = records[dKey];
      const dObj = new Date(y, m - 1, d);
      const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
      const isHoliday = !!rec?.isHoliday;
      if (!isWeekend && !isHoliday) {
        const status = rec?.status || 'P';
        if (status === 'P') p++;
        else if (status === 'S') s++;
        else if (status === 'V') v++;
        else if (status === 'BT') bt++;
        else if (status === 'PM') pm++;
        else if (status === 'X') x++;

        if (rec?.totalHour) {
          const [h] = rec.totalHour.split(':').map(Number);
          totalHours += h || 0;
        } else if (status === 'P') {
          totalHours += 9;
        }
      }
    }
    return { p, s, v, bt, pm, x, totalHours };
  }, [period, records]);

  // Helper to immediately update current day or all selected days in live records state and local storage
  const updateCurrentDaysLive = (field: keyof DayRecord, value: any) => {
    hasUserEdited.current = true;
    setRecords((prev) => {
      const newRecs = { ...prev };
      const targets = selectedDates.length > 0 ? selectedDates : [selectedDate];

      targets.forEach((dateKey) => {
        const rec = newRecs[dateKey] || {
          date: dateKey,
          startTime: formStart,
          endTime: formEnd,
          totalHour: calcHours(formStart, formEnd),
          status: formStatus,
          activity: formActivity,
        };
        const updated = { ...rec, [field]: value };
        if (field === 'startTime' || field === 'endTime') {
          const s = field === 'startTime' ? value : (rec.startTime || formStart);
          const e = field === 'endTime' ? value : (rec.endTime || formEnd);
          updated.totalHour = calcHours(s, e);
          if (field === 'endTime' && value) {
            updated.missingCheckout = false;
          }
        }
        newRecs[dateKey] = updated;
      });

      if (field === 'endTime' && value) {
        setFormMissingCheckout(false);
      }

      localStorage.setItem('ts_records', JSON.stringify(newRecs));
      return newRecs;
    });
  };

  // Backwards compatibility alias
  const updateCurrentDayLive = updateCurrentDaysLive;

  // Row selection handler supporting regular click, Ctrl/Cmd click, Shift click, and multi-select mode
  const handleSelectDay = (dateStr: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey || isMultiSelectMode) {
      setSelectedDates((prev) => {
        const exists = prev.includes(dateStr);
        let next: string[];
        if (exists) {
          if (prev.length <= 1) return prev; // keep at least 1 selected
          next = prev.filter((d) => d !== dateStr);
          setSelectedDate(next[next.length - 1]);
        } else {
          next = [...prev, dateStr].sort();
          setSelectedDate(dateStr);
        }
        return next;
      });
      lastClickedDateRef.current = dateStr;
    } else if (e?.shiftKey && lastClickedDateRef.current) {
      const [y, m] = period.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const allDates: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        allDates.push(`${period}-${String(d).padStart(2, '0')}`);
      }
      const idx1 = allDates.indexOf(lastClickedDateRef.current);
      const idx2 = allDates.indexOf(dateStr);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        const range = allDates.slice(start, end + 1);
        setSelectedDates(range);
        setSelectedDate(dateStr);
      }
    } else {
      setSelectedDates([dateStr]);
      setSelectedDate(dateStr);
      lastClickedDateRef.current = dateStr;
    }
  };

  // Select all Monday-Friday days in current period
  const handleSelectAllWeekdays = () => {
    const [y, m] = period.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const weekdays: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdays.push(`${period}-${String(d).padStart(2, '0')}`);
      }
    }
    setSelectedDates(weekdays);
    if (weekdays.length > 0) setSelectedDate(weekdays[0]);
  };

  // Select all days in current period
  const handleSelectAllDays = () => {
    const [y, m] = period.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const all: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      all.push(`${period}-${String(d).padStart(2, '0')}`);
    }
    setSelectedDates(all);
    if (all.length > 0) setSelectedDate(all[0]);
  };

  const handleClearSelection = () => {
    setSelectedDates([selectedDate]);
  };

  // Auto-save debounced effect: automatically saves to MongoDB Atlas / storage after user stops typing
  useEffect(() => {
    if (!hasUserEdited.current) return;
    if (Object.keys(records).length === 0) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const recordsList = Object.values(records);
        const res = await fetch('/api/timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'batch_records', records: recordsList }),
        });
        const data = await res.json();
        if (data?.success) {
          setIsMongoConnected(true);
        }
        setAutoSaveStatus('saved');
      } catch (err) {
        setAutoSaveStatus('saved');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [records]);

  // Save ALL days to MongoDB Atlas & localStorage in one single action
  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      localStorage.setItem('ts_records', JSON.stringify(records));
      const recordsList = Object.values(records);
      const res = await fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'batch_records', records: recordsList }),
      });
      const data = await res.json();
      if (data?.success) {
        setIsMongoConnected(true);
        setSaveStatusMsg('All records saved to MongoDB Atlas!');
      } else {
        setSaveStatusMsg('All records saved locally!');
      }
    } catch {
      setSaveStatusMsg('All records saved locally!');
    } finally {
      setIsSavingAll(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setSaveStatusMsg(''), 2500);
    }
  };

  const handleSaveDay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSaveAll();
  };

  // Handle uploading and parsing attendance file (PDF or Excel/CSV)
  const handleAttendanceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingAttendance(true);
    setExtractStatusMsg('Extracting attendance data...');

    try {
      let extractedRows = [];
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith('.pdf')) {
        extractedRows = await extractAttendanceFromPDF(file);
      } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv')) {
        extractedRows = await extractRowsFromExcel(file);
      } else {
        // Plain text fallback
        const text = await file.text();
        extractedRows = parseAttendanceText(text);
      }

      if (extractedRows.length === 0) {
        alert('Could not find date/time entries in this file. Please ensure it follows the BNI Laporan Kehadiran Karyawan format.');
        setIsExtractingAttendance(false);
        setExtractStatusMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Merge extracted rows into records
      const newRecords = { ...records };
      let updatedCount = 0;
      let missingCheckoutCount = 0;
      let detectedPeriod = '';

      for (const row of extractedRows) {
        if (!detectedPeriod) {
          detectedPeriod = row.date.slice(0, 7);
        }

        const existing = newRecords[row.date] || {};

        if (row.missingCheckout) {
          missingCheckoutCount++;
        }

        newRecords[row.date] = {
          date: row.date,
          startTime: row.inTime || existing.startTime || '08:00:00',
          endTime: row.outTime || existing.endTime || (row.missingCheckout ? '' : '17:00:00'),
          totalHour: (row.inTime && row.outTime) ? calcHours(row.inTime, row.outTime) : (row.missingCheckout ? '' : (existing.totalHour || '09:00:00')),
          status: row.isHoliday ? '' : (existing.status || 'P'),
          activity: existing.activity || '',
          projectName: existing.projectName,
          projectId: existing.projectId,
          app: existing.app,
          aip: existing.aip,
          divisi: existing.divisi,
          dept: existing.dept,
          subDept: existing.subDept,
          isHoliday: row.isHoliday || existing.isHoliday,
          missingCheckout: row.missingCheckout,
        };
        updatedCount++;
      }

      // If imported month differs from current month, switch month
      if (detectedPeriod && detectedPeriod !== period) {
        setPeriod(detectedPeriod);
        setSelectedDate(`${detectedPeriod}-01`);
      }

      setRecords(newRecords);
      localStorage.setItem('ts_records', JSON.stringify(newRecords));

      // Batch save to MongoDB Atlas if available
      try {
        await fetch('/api/timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'batch_records',
            records: Object.values(newRecords),
          }),
        });
      } catch (err) {
        console.log('Saved batch locally');
      }

      const msg = `Extracted ${updatedCount} dates! ${missingCheckoutCount > 0 ? `(${missingCheckoutCount} days missing check-out marked in red)` : ''}`;
      setExtractStatusMsg(msg);
      setTimeout(() => setExtractStatusMsg(''), 5000);
    } catch (err: any) {
      console.error('File parsing error:', err);
      alert(`Error extracting file: ${err.message || err}`);
    } finally {
      setIsExtractingAttendance(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save global config
  const handleSaveConfig = async (newConfig: TimesheetConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ts_config', JSON.stringify(newConfig));
    try {
      await fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'config', config: newConfig }),
      });
    } catch (err) {
      console.log('Saved config to local storage');
    }
  };

  // Add bullet helper
  const addBullet = () => {
    if (!formActivity.trim()) {
      setFormActivity('• ');
    } else {
      setFormActivity(formActivity + '\n• ');
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = period.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    const nextP = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    setPeriod(nextP);
    const firstDate = `${nextP}-01`;
    setSelectedDate(firstDate);
    setSelectedDates([firstDate]);
    lastClickedDateRef.current = firstDate;
  };

  const handleNextMonth = () => {
    const [y, m] = period.split('-').map(Number);
    const next = new Date(y, m, 1);
    const nextP = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setPeriod(nextP);
    const firstDate = `${nextP}-01`;
    setSelectedDate(firstDate);
    setSelectedDates([firstDate]);
    lastClickedDateRef.current = firstDate;
  };

  // Download Custom A4 Landscape PDF directly (No browser print dialog, no headers/footers)
  const handleDownloadPdf = async () => {
    const page1 = document.getElementById('timesheetPage1');
    const page2 = document.getElementById('timesheetPage2');
    if (!page1) return;

    setIsDownloadingPdf(true);

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      // Use onclone to physically strip checkboxes and selection highlights from the cloned snapshot before capture
      const onCloneHandler = (clonedDoc: Document) => {
        // Completely remove all checkboxes and pdf-hide elements from the cloned tree
        clonedDoc.querySelectorAll('.pdf-hide, [data-html2canvas-ignore]').forEach((el) => {
          el.remove();
        });
        // Remove blue selection highlights from cloned tree so normal days stay white
        clonedDoc.querySelectorAll('.selected-row').forEach((el) => {
          el.classList.remove('selected-row');
        });
      };

      const jpegQuality = pdfQuality === 'high' ? 0.85 : 0.65;

      // Capture Page 1 with rock-solid scale 2 and onclone cleanup
      const canvas1 = await html2canvas(page1, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: onCloneHandler,
      });

      // A4 Landscape is 297mm x 210mm with stream compression enabled
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const img1 = canvas1.toDataURL('image/jpeg', jpegQuality);
      const h1 = canvas1.width > 0 ? (canvas1.height * 297) / canvas1.width : 210;
      const safeH1 = !isNaN(h1) && h1 > 0 ? Math.min(h1, 210) : 210;
      pdf.addImage(img1, 'JPEG', 0, 0, 297, safeH1, undefined, 'FAST');

      // Capture Page 2 if exists
      if (page2) {
        const canvas2 = await html2canvas(page2, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: onCloneHandler,
        });

        pdf.addPage('a4', 'landscape');
        const img2 = canvas2.toDataURL('image/jpeg', jpegQuality);
        const h2 = canvas2.width > 0 ? (canvas2.height * 297) / canvas2.width : 210;
        const safeH2 = !isNaN(h2) && h2 > 0 ? Math.min(h2, 210) : 210;
        pdf.addImage(img2, 'JPEG', 0, 0, 297, safeH2, undefined, 'FAST');
      }

      // Custom filename pattern: Vito Rizqi Ananda_BNI_DEV_TIMESHEET_{MMMM} {YYYY}.pdf
      const [yStr, mStr] = period.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const monthName = ID_MONTH_NAMES[m - 1] || 'Oktober';
      const yearName = y || new Date().getFullYear();
      const personName = config.sig1 || (config.name ? config.name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'Vito Rizqi Ananda');
      const filename = `${personName}_BNI_DEV_TIMESHEET_${monthName} ${yearName}.pdf`;

      pdf.save(filename);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert('Could not generate PDF: ' + (err?.message || err));
    } finally {
      setIsDownloadingPdf(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans print:bg-white print:min-h-0 print:p-0 print:m-0 print:block">
      {/* FLOATING STATUS TOAST */}
      {extractStatusMsg && (
        <div className="fixed top-4 right-4 z-50 p-3 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{extractStatusMsg}</span>
          <button
            onClick={() => setExtractStatusMsg('')}
            className="ml-2 hover:bg-emerald-700/80 p-1 rounded font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP APP BAR */}
      <header className="no-print print:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-base text-slate-900 leading-tight">Daily Activity & Timesheet</h1>
            <p className="text-[11px] text-slate-500">PT. Bank Negara Indonesia / MII Template Replica</p>
          </div>
        </div>

        {/* Period Selector with readable Indonesian month display */}
        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800 tracking-wide select-none">
              {ID_MONTH_NAMES[(parseInt(period.split('-')[1], 10) || 1) - 1]} {period.split('-')[0]}
            </span>
            <input
              type="month"
              value={period}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                setPeriod(val);
                const firstDate = `${val}-01`;
                setSelectedDate(firstDate);
                setSelectedDates([firstDate]);
                lastClickedDateRef.current = firstDate;
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to jump to another month"
            />
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for Attendance Report */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttendanceFileUpload}
            accept=".pdf,.xlsx,.xls,.csv,.txt"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtractingAttendance}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition border border-emerald-300 shadow-2xs cursor-pointer"
            title="Import check-in & check-out times from BNI Laporan Kehadiran Karyawan (PDF/Excel)"
          >
            <Upload className="w-3.5 h-3.5" />
            {isExtractingAttendance ? 'Importing...' : 'Import Attendance'}
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300 cursor-pointer"
            title="Configure employee name, department, signatures, and default projects"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-60"
            title="Save all month records to database and local storage"
          >
            <Save className="w-3.5 h-3.5" />
            {isSavingAll ? 'Saving...' : 'Save All'}
          </button>

          {/* Download PDF button with compact / high-res quality pill */}
          <div className="inline-flex rounded-lg shadow-sm border border-blue-600 bg-blue-600">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold hover:bg-blue-700 transition rounded-l-lg cursor-pointer disabled:opacity-60"
              title={`Download PDF (${pdfQuality === 'compact' ? '< 300 KB' : '~700 KB'})`}
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
              <span className="text-[10px] bg-blue-500/90 text-white px-1.5 py-0.2 rounded font-medium">
                {pdfQuality === 'compact' ? '< 300 KB' : 'High Res'}
              </span>
            </button>
            <button
              onClick={() => setPdfQuality((q) => (q === 'compact' ? 'high' : 'compact'))}
              className="px-1.5 py-1.5 text-white hover:bg-blue-700 text-[10px] font-semibold border-l border-blue-500 rounded-r-lg transition cursor-pointer"
              title="Click to toggle between Compact (<300 KB) and High-Res (~700 KB) PDF export"
            >
              ⚙
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300 cursor-pointer"
            title="Print using system/browser printer dialog"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 print:p-0 print:m-0 print:max-w-none print:w-full print:block">
        
        {/* LEFT COLUMN: DAILY ACTIVITY LOGGER FORM */}
        <div className="no-print print:hidden xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            {/* Card Header & Multi-Select Controls */}
            <div className="pb-3 border-b border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {selectedDates.length > 1 ? `Multi-Row Edit (${selectedDates.length} Days)` : 'Daily Activity Entry'}
                  </h2>
                  {autoSaveStatus === 'saving' && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                      Saving...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Auto-saved
                    </span>
                  )}
                </div>
                {selectedDates.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Deselect All
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      if (todayStr.startsWith(period)) {
                        setSelectedDate(todayStr);
                        setSelectedDates([todayStr]);
                      }
                    }}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Set to Today
                  </button>
                )}
              </div>

              {/* Selection Toolbar: Always available */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-0.5 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMultiSelectMode}
                    onChange={(e) => setIsMultiSelectMode(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Multi-Select Mode</span>
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={handleSelectAllWeekdays}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer shadow-2xs"
                    title="Select all Monday-Friday workdays in the month"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllDays}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer shadow-2xs"
                    title="Select every day in the month"
                  >
                    All Days
                  </button>
                  {selectedDates.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 font-medium cursor-pointer"
                      title="Reset selection to 1 day"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Days Pills (when multiple) */}
              {selectedDates.length > 1 && (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-blue-900 font-semibold">
                    <span>Selected Days ({selectedDates.length}):</span>
                    <span className="text-[10px] text-blue-600 font-normal">Edits apply to all selected days</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                    {selectedDates.map((dKey) => {
                      const dayNum = parseInt(dKey.split('-')[2], 10);
                      return (
                        <span
                          key={dKey}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-blue-300 text-blue-800 text-[10px] rounded font-semibold shadow-2xs"
                        >
                          {dayNum}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedDates.length > 1) {
                                setSelectedDates(selectedDates.filter((d) => d !== dKey));
                              }
                            }}
                            className="hover:text-rose-600 text-slate-400 font-bold leading-none cursor-pointer"
                            title="Remove day from selection"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveDay} className="space-y-3.5">
              {/* Date Input (when single day) */}
              {selectedDates.length <= 1 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setSelectedDate(newDate);
                      setSelectedDates([newDate]);
                      if (newDate) {
                        const newPeriod = newDate.slice(0, 7);
                        if (newPeriod !== period) {
                          setPeriod(newPeriod);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-blue-500"
                    required
                  />
                </div>
              )}

              {/* National Holiday / Day Off toggle */}
              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={formIsHoliday}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormIsHoliday(checked);
                    updateCurrentDaysLive('isHoliday', checked);
                    if (checked) {
                      setFormStatus('');
                      setFormStart('08:00:00');
                      setFormEnd('17:00:00');
                      updateCurrentDaysLive('status', '');
                      updateCurrentDaysLive('startTime', '08:00:00');
                      updateCurrentDaysLive('endTime', '17:00:00');
                    } else {
                      const s = 'P';
                      setFormStatus(s);
                      updateCurrentDaysLive('status', s);
                    }
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-3 h-3 bg-[#a6a6a6] rounded border border-slate-500 inline-block"></span>
                  <span>{selectedDates.length > 1 ? `Grey out all ${selectedDates.length} days as Holidays / Off` : 'Grey out this row (National Holiday / Day Off)'}</span>
                </div>
              </label>

              {/* Attendance Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Attendance Status</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { val: 'P', label: 'Present (P)' },
                    { val: 'S', label: 'Sick (S)' },
                    { val: 'V', label: 'Vacation (V)' },
                    { val: 'BT', label: 'Trip (BT)' },
                    { val: 'PM', label: 'Permit (PM)' },
                    { val: 'X', label: 'Off / Resign (X)' },
                  ].map((s) => (
                    <label
                      key={s.val}
                      className={`flex items-center gap-1.5 p-1.5 border rounded-lg cursor-pointer text-xs transition ${
                        formStatus === s.val
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-800 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="attendanceStatus"
                        value={s.val}
                        checked={formStatus === s.val}
                        onChange={() => {
                          setFormStatus(s.val as any);
                          updateCurrentDayLive('status', s.val);
                        }}
                        className="text-blue-600 cursor-pointer"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-1.5">
                {formMissingCheckout && (
                  <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span><b>Check-out missing!</b> Enter end time manually:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickHours(formStart || '08:00:00', '17:00:00')}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Fix as 17:00
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time (Check-In)</label>
                    <input
                      type="time"
                      step="1"
                      value={formStart}
                      onChange={(e) => {
                        setFormStart(e.target.value);
                        updateCurrentDayLive('startTime', e.target.value);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                      <span>End Time (Check-Out)</span>
                      {formMissingCheckout && <span className="text-[10px] text-red-600 font-bold">Needs Input</span>}
                    </label>
                    <input
                      type="time"
                      step="1"
                      value={formEnd}
                      onChange={(e) => {
                        setFormEnd(e.target.value);
                        updateCurrentDayLive('endTime', e.target.value);
                      }}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs ${
                        formMissingCheckout && !formEnd
                          ? 'bg-red-50 border-red-400 focus:outline-red-500 text-red-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Working Hours Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                  <span className="text-slate-400 font-medium">Quick Hours:</span>
                  <button
                    type="button"
                    onClick={() => setQuickHours('08:00:00', '17:00:00')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
                  >
                    08:00 - 17:00 (9h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickHours('08:30:00', '17:30:00')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
                  >
                    08:30 - 17:30 (9h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickHours('09:00:00', '18:00:00')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
                  >
                    09:00 - 18:00 (9h)
                  </button>
                </div>
              </div>

              {/* Activity / Remark */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">Activity / Remark</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = !formActivity.trim() ? '• ' : formActivity + '\n• ';
                      setFormActivity(updated);
                      updateCurrentDayLive('activity', updated);
                    }}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  >
                    + Add bullet (•)
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formActivity}
                  onChange={(e) => {
                    setFormActivity(e.target.value);
                    updateCurrentDayLive('activity', e.target.value);
                  }}
                  placeholder="• Develop Migration service&#10;• Fix SonarQube issues"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-blue-500"
                />
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-medium">Quick Fill:</span>
                  {[
                    '• Develop & implement feature enhancements',
                    '• Bug fixing and performance optimizations',
                    '• Daily standup & sprint review meeting',
                    '• Code review, unit testing & documentation',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const updated = !formActivity.trim() ? preset : `${formActivity}\n${preset}`;
                        setFormActivity(updated);
                        updateCurrentDayLive('activity', updated);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded text-slate-600 transition cursor-pointer"
                    >
                      {preset.replace('• ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Overrides */}
              <details className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                <summary className="font-semibold text-slate-600 cursor-pointer select-none">
                  Custom Project override for this day (Optional)
                </summary>
                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    value={formProjectName}
                    onChange={(e) => {
                      setFormProjectName(e.target.value);
                      updateCurrentDayLive('projectName', e.target.value);
                    }}
                    placeholder={`Project Name (Default: ${config.rowProjectName})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={formProjectId}
                    onChange={(e) => {
                      setFormProjectId(e.target.value);
                      updateCurrentDayLive('projectId', e.target.value);
                    }}
                    placeholder={`Project ID (Default: ${config.rowProjectId.replace('\n', ' ')})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={formAip}
                    onChange={(e) => {
                      setFormAip(e.target.value);
                      updateCurrentDayLive('aip', e.target.value);
                    }}
                    placeholder={`AIP Fitur (Default: ${config.rowAip.replace('\n', ' ')})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
              </details>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSavingAll}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {isSavingAll ? 'Saving All...' : (selectedDates.length > 1 ? `Save All (${selectedDates.length} Days Selected)` : 'Save All Timesheet')}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edits save automatically as you type</span>
                </div>
                {saveStatusMsg && (
                  <div className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {saveStatusMsg}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: EXACT TEMPLATE PREVIEW & PDF RENDER */}
        <div className="xl:col-span-8 overflow-x-auto pb-8 print:p-0 print:m-0 print:w-full print:overflow-visible print:block">
          <div className="no-print print:hidden mb-2.5 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Preview:</span>
              <span className="text-slate-500 hidden sm:inline">A4 Landscape</span>
              {selectedDates.length > 1 ? (
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-300">
                  {selectedDates.length} rows selected
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Click any row to edit</span>
              )}
            </div>

            {/* Attendance Quick Stats */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                Present: <b className="text-blue-700">{monthStats.p}</b>
              </span>
              {monthStats.s > 0 && (
                <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                  Sick: <b>{monthStats.s}</b>
                </span>
              )}
              {monthStats.v > 0 && (
                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium border border-purple-200">
                  Vacation: <b>{monthStats.v}</b>
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                Total: <b className="text-emerald-700">{monthStats.totalHours} hrs</b>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSelectAllWeekdays}
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium cursor-pointer"
                  title="Select all Monday-Friday days"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllDays}
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium cursor-pointer"
                  title="Select all days in current month"
                >
                  All Days
                </button>
                {selectedDates.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 text-[11px] font-medium cursor-pointer"
                    title="Reset to 1 day selection"
                  >
                    Clear
                  </button>
                )}
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200">
                <span className="w-2.5 h-2.5 bg-[#a6a6a6] rounded-2xs inline-block"></span> Gray = Off
              </span>
            </div>
          </div>

          <TimesheetTable
            ref={printAreaRef}
            period={period}
            config={config}
            records={records}
            onSelectDay={handleSelectDay}
            selectedDate={selectedDate}
            selectedDates={selectedDates}
          />
        </div>

      </main>

      {/* CONFIG MODAL */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
