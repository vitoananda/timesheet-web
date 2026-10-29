'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { TimesheetConfig, DayRecord, DEFAULT_CONFIG } from '@/types/timesheet';
import { TimesheetTable } from '@/components/TimesheetTable';
import { ConfigModal } from '@/components/ConfigModal';

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

  const printAreaRef = useRef<HTMLDivElement>(null);

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
    } else {
      setFormStatus(isWeekend ? '' : 'P');
      setFormStart('08:00:00');
      setFormEnd('17:00:00');
      setFormActivity('');
      setFormProjectName('');
      setFormProjectId('');
      setFormAip('');
      setFormIsHoliday(false);
    }
  }, [selectedDate, records]);

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

  // Helper to immediately update current day in live records state as well as local storage
  const updateCurrentDayLive = (field: keyof DayRecord, value: any) => {
    setRecords((prev) => {
      const rec = prev[selectedDate] || {
        date: selectedDate,
        startTime: formStart,
        endTime: formEnd,
        totalHour: calcHours(formStart, formEnd),
        status: formStatus,
        activity: formActivity,
      };
      const updated = { ...rec, [field]: value };
      if (field === 'startTime' || field === 'endTime') {
        const s = field === 'startTime' ? value : formStart;
        const e = field === 'endTime' ? value : formEnd;
        updated.totalHour = calcHours(s, e);
      }
      const newRecs = { ...prev, [selectedDate]: updated };
      localStorage.setItem('ts_records', JSON.stringify(newRecs));
      return newRecs;
    });
  };

  // Save current day to Mongo Atlas & confirm
  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalHour = calcHours(formStart, formEnd);

    const updatedRecord: DayRecord = {
      date: selectedDate,
      startTime: formStart.split(':').length === 2 ? `${formStart}:00` : formStart,
      endTime: formEnd.split(':').length === 2 ? `${formEnd}:00` : formEnd,
      totalHour,
      status: formStatus,
      activity: formActivity,
      projectName: formProjectName || undefined,
      projectId: formProjectId || undefined,
      aip: formAip || undefined,
      isHoliday: formIsHoliday,
    };

    const newRecords = { ...records, [selectedDate]: updatedRecord };
    setRecords(newRecords);
    localStorage.setItem('ts_records', JSON.stringify(newRecords));

    // Save to Mongo Atlas if configured
    try {
      const res = await fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'record', record: updatedRecord }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMongoConnected(true);
        setSaveStatusMsg('Saved to MongoDB Atlas!');
      } else {
        setSaveStatusMsg('Saved locally');
      }
    } catch (err) {
      setSaveStatusMsg('Saved locally');
    }

    setTimeout(() => setSaveStatusMsg(''), 2000);
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
    setSelectedDate(`${nextP}-01`);
  };

  const handleNextMonth = () => {
    const [y, m] = period.split('-').map(Number);
    const next = new Date(y, m, 1);
    const nextP = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setPeriod(nextP);
    setSelectedDate(`${nextP}-01`);
  };

  // Download PDF matching A4 landscape
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsDownloadingPdf(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename: `Timesheet_${config.name.replace(/\s+/g, '_')}_${period}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      };

      await html2pdf().set(opt).from(printAreaRef.current).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* TOP APP BAR */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Daily Activity & Timesheet</h1>
            <p className="text-[11px] text-slate-500">PT. Bank Negara Indonesia / MII Template Replica</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white rounded-lg text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <input
              type="month"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setSelectedDate(`${e.target.value}-01`);
              }}
              className="bg-transparent font-semibold text-xs text-slate-800 outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-white rounded-lg text-slate-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300"
          >
            <Settings className="w-3.5 h-3.5" />
            Repeated Values
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-500/25"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: DAILY ACTIVITY LOGGER FORM */}
        <div className="no-print xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Daily Activity Entry
              </h2>
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  if (todayStr.startsWith(period)) setSelectedDate(todayStr);
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Set to Today
              </button>
            </div>

            <form onSubmit={handleSaveDay} className="space-y-3.5">
              {/* Date & Holiday Toggle */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setSelectedDate(newDate);
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
                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={formIsHoliday}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormIsHoliday(checked);
                      updateCurrentDayLive('isHoliday', checked);
                      if (checked) {
                        setFormStatus('');
                        setFormStart('08:00:00');
                        setFormEnd('17:00:00');
                        updateCurrentDayLive('status', '');
                        updateCurrentDayLive('startTime', '08:00:00');
                        updateCurrentDayLive('endTime', '17:00:00');
                      } else {
                        const dateObj = new Date(selectedDate);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                        const s = isWeekend ? '' : 'P';
                        setFormStatus(s);
                        updateCurrentDayLive('status', s);
                      }
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-3 h-3 bg-[#9ca3af] rounded border border-slate-500 inline-block"></span>
                    <span>Grey out this row (National Holiday / Day Off)</span>
                  </div>
                </label>
              </div>

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
                      className={`flex items-center gap-1.5 p-1.5 border rounded-lg cursor-pointer text-xs ${
                        formStatus === s.val
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600'
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
                        className="text-blue-600"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    step="1"
                    value={formEnd}
                    onChange={(e) => {
                      setFormEnd(e.target.value);
                      updateCurrentDayLive('endTime', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Activity / Remark */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Activity / Remark</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = !formActivity.trim() ? '• ' : formActivity + '\n• ';
                      setFormActivity(updated);
                      updateCurrentDayLive('activity', updated);
                    }}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
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
                    onChange={(e) => setFormProjectName(e.target.value)}
                    placeholder={`Project Name (Default: ${config.rowProjectName})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    placeholder={`Project ID (Default: ${config.rowProjectId.replace('\n', ' ')})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={formAip}
                    onChange={(e) => setFormAip(e.target.value)}
                    placeholder={`AIP Fitur (Default: ${config.rowAip.replace('\n', ' ')})`}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
              </details>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition"
                >
                  <Save className="w-4 h-4" /> Save Day Activity
                </button>
                {saveStatusMsg && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {saveStatusMsg}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Configuration status card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-xs space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Storage & Logo Settings
            </h3>
            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div>
                <b>Logo file:</b> Place your logo image as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600">public/images/logo.png</code>.
              </div>
              <div>
                <b>MongoDB Atlas:</b> Add your URI in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">.env.local</code> to auto-sync to cloud. Currently: <span className={isMongoConnected ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>{isMongoConnected ? "Connected" : "Local Storage Mode"}</span>.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXACT TEMPLATE PREVIEW & PDF RENDER */}
        <div className="xl:col-span-8 overflow-x-auto pb-8">
          <div className="no-print mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Preview:</span>
              <span>Exact Excel Template Replica (A4 Landscape)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px] font-bold">
                <span className="w-2.5 h-2.5 bg-[#9ca3af] rounded-sm inline-block"></span> Gray = Weekends
              </span>
            </div>
          </div>

          <TimesheetTable
            ref={printAreaRef}
            period={period}
            config={config}
            records={records}
            onSelectDay={setSelectedDate}
            selectedDate={selectedDate}
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
