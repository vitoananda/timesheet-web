import React from 'react';
import { TimesheetConfig, DayRecord } from '@/types/timesheet';
import { MetrodataLogo } from './MetrodataLogo';

interface TimesheetTableProps {
  period: string; // YYYY-MM
  config: TimesheetConfig;
  records: Record<string, DayRecord>;
  onSelectDay: (dateStr: string) => void;
  selectedDate: string;
}

export const TimesheetTable = React.forwardRef<HTMLDivElement, TimesheetTableProps>(
  ({ period, config, records, onSelectDay, selectedDate }, ref) => {
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const totalDays = new Date(year, month, 0).getDate();
    const periodLabel = `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' })}-${String(year).slice(-2)}`;
    const endPeriodDisplay = `${totalDays}-${periodLabel}`;

    let countP = 0, countS = 0, countBT = 0, countPM = 0, countV = 0, countX = 0;

    const days = [];
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${yearStr}-${monthStr}-${dayStr}`;
      // Use YYYY, MM-1, DD to prevent any UTC timezone shift
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dateDisplay = `${day}-${dateObj.toLocaleString('en-US', { month: 'short' })}-${String(year).slice(-2)}`;
      const rec = records[dateKey];

      const isGreyedOut = isWeekend || !!rec?.isHoliday;

      const status = rec?.status !== undefined ? (isGreyedOut && !rec.status ? '' : rec.status) : (isGreyedOut ? '' : 'P');
      const startTime = isGreyedOut ? '08:00:00' : (rec?.startTime || '08:00:00');
      const endTime = isGreyedOut ? '17:00:00' : (rec?.endTime || '17:00:00');
      const totalHour = isGreyedOut ? '09:00:00' : (rec?.totalHour || '09:00:00');
      const activity = rec?.activity || '';

      const projectName = isGreyedOut && !activity ? '' : (rec?.projectName || config.rowProjectName);
      const projectId = isGreyedOut && !activity ? '' : (rec?.projectId || config.rowProjectId);
      const app = isGreyedOut && !activity ? '' : (rec?.app || config.rowApp);
      const aip = isGreyedOut && !activity ? '' : (rec?.aip || config.rowAip);
      const divisi = isGreyedOut && !activity ? '' : (rec?.divisi || config.rowDivisi);
      const dept = isGreyedOut && !activity ? '' : (rec?.dept || config.rowDept);
      const subDept = isGreyedOut && !activity ? '' : (rec?.subDept || config.rowSubDept);

      if (status === 'P') countP++;
      else if (status === 'S') countS++;
      else if (status === 'BT') countBT++;
      else if (status === 'PM') countPM++;
      else if (status === 'V') countV++;
      else if (status === 'X') countX++;

      days.push({
        day,
        dateKey,
        dateDisplay,
        isWeekend,
        isCustomHoliday: rec?.isHoliday,
        status,
        startTime,
        endTime,
        totalHour,
        activity,
        projectName,
        projectId,
        app,
        aip,
        divisi,
        dept,
        subDept,
      });
    }

    const formatTime = (t: string) => {
      if (!t) return '';
      const p = t.split(':');
      return p.length >= 2 ? `${p[0]}:${p[1]}` : t;
    };

    const formatHour = (t: string) => {
      if (!t) return '';
      const p = t.split(':');
      if (p.length >= 2) {
        return `${parseInt(p[0], 10)}:${p[1]}`;
      }
      return t;
    };

    return (
      <div
        ref={ref}
        id="timesheetSheet"
        className="sheet-page bg-white p-6 shadow-xl mx-auto text-black"
        style={{
          width: '297mm',
          minHeight: '210mm',
          boxSizing: 'border-box',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        {/* HEADER SECTION EXACT TO TEMPLATE */}
        <div className="flex justify-between items-start mb-2.5">
          <div className="text-[9px] leading-tight space-y-0.5">
            <div className="flex">
              <span className="w-28 font-bold text-slate-900">NAME of PROJECT</span>
              <span className="font-bold">: {config.projectName}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-bold text-slate-900">UNIT/DIVISION</span>
              <span>: {config.unitDivision}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-bold text-slate-900">NAME</span>
              <span className="font-bold uppercase">: {config.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-bold text-slate-900">MII ID</span>
              <span>: {config.miiId}</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex">
                <span className="w-28 font-bold text-slate-900">SITE</span>
                <span>: {config.site}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="inline-block w-4 h-3 bg-red-400 border border-slate-700"></span>
                <span>: Holiday</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-0.5">
              <div className="flex">
                <span className="w-28 font-bold text-slate-900">PERIODE</span>
                <span className="font-bold">{periodLabel}</span>
              </div>
              <div className="text-[8px] text-slate-700 italic">
                P = Present; S = Sick; V = Vacation; BT = Business Trip; PM = Permit; X = Not Working Anymore
              </div>
            </div>
          </div>

          {/* EXACT METRODATA LOGO IN HEADER */}
          <div className="flex flex-col items-end pr-2 pt-1">
            <MetrodataLogo />
          </div>
        </div>

        {/* EXACT TABLE TEMPLATE WITH PRECISE COLUMN PROPORTIONS */}
        <table
          className="report-table"
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: '8px',
            lineHeight: 1.15,
          }}
        >
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: '58px' }}>DATE</th>
              <th colSpan={2} style={{ width: '78px' }}>WORKING HOUR</th>
              <th rowSpan={2} style={{ width: '48px' }}>TOTAL<br />HOUR</th>
              <th colSpan={6}>STATUS ATTENDANCE</th>
              <th rowSpan={2} style={{ width: '275px' }}>ACTIVITY / REMARK</th>
              <th rowSpan={2} style={{ width: '58px' }}>Project Name</th>
              <th rowSpan={2} style={{ width: '48px' }}>Project ID</th>
              <th rowSpan={2} style={{ width: '54px' }}>Aplikasi<br />Terdampak</th>
              <th rowSpan={2} style={{ width: '100px' }}>AIP Fitur</th>
              <th rowSpan={2} style={{ width: '38px' }}>Divisi</th>
              <th rowSpan={2} style={{ width: '54px' }}>Departement</th>
              <th rowSpan={2} style={{ width: '64px' }}>Sub<br />Departement</th>
            </tr>
            <tr>
              <th style={{ width: '39px' }}>START</th>
              <th style={{ width: '39px' }}>END</th>
              <th style={{ width: '25px' }}>Present</th>
              <th style={{ width: '25px' }}>Sick</th>
              <th style={{ width: '30px' }}>Business<br />Trip</th>
              <th style={{ width: '25px' }}>Permit</th>
              <th style={{ width: '26px' }}>Vacation</th>
              <th style={{ width: '30px' }}>Not<br />Working</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const isSelected = d.dateKey === selectedDate;
              let rowBg = '';
              let rowClass = '';
              if (d.isWeekend || d.isCustomHoliday) {
                rowBg = '#9ca3af'; // Exact greyed out shade matching weekends / holidays
                rowClass = 'weekend-row';
              } else if (isSelected) {
                rowBg = '#e0f2fe';
              }

              return (
                <tr
                  key={d.dateKey}
                  onClick={() => onSelectDay(d.dateKey)}
                  className={`${rowClass} hover:opacity-90 transition-opacity`}
                  style={{
                    backgroundColor: rowBg || 'transparent',
                    cursor: 'pointer',
                  }}
                  title="Click to edit activity"
                >
                  <td className="font-bold text-center" style={{ backgroundColor: rowBg || undefined }}>{d.dateDisplay}</td>
                  <td className="text-center font-mono" style={{ backgroundColor: rowBg || undefined }}>{formatTime(d.startTime)}</td>
                  <td className="text-center font-mono" style={{ backgroundColor: rowBg || undefined }}>{formatTime(d.endTime)}</td>
                  <td className="text-center font-mono" style={{ backgroundColor: rowBg || undefined }}>{formatHour(d.totalHour)}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'P' ? 'P' : ''}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'S' ? 'S' : ''}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'BT' ? 'BT' : ''}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'PM' ? 'PM' : ''}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'V' ? 'V' : ''}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.status === 'X' ? 'X' : ''}</td>
                  <td className="text-left whitespace-pre-line leading-tight px-1.5" style={{ backgroundColor: rowBg || undefined }}>{d.activity}</td>
                  <td className="text-center font-bold" style={{ backgroundColor: rowBg || undefined }}>{d.projectName}</td>
                  <td className="text-center whitespace-pre-line leading-tight" style={{ backgroundColor: rowBg || undefined }}>{d.projectId}</td>
                  <td className="text-center" style={{ backgroundColor: rowBg || undefined }}>{d.app}</td>
                  <td className="text-center whitespace-pre-line leading-tight" style={{ backgroundColor: rowBg || undefined }}>{d.aip}</td>
                  <td className="text-center" style={{ backgroundColor: rowBg || undefined }}>{d.divisi}</td>
                  <td className="text-center" style={{ backgroundColor: rowBg || undefined }}>{d.dept}</td>
                  <td className="text-center" style={{ backgroundColor: rowBg || undefined }}>{d.subDept}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-white text-center">
              <td colSpan={4} className="text-right pr-2">TOTAL</td>
              <td>{countP}</td>
              <td>{countS}</td>
              <td>{countBT}</td>
              <td>{countPM}</td>
              <td>{countV}</td>
              <td>{countX}</td>
              <td className="text-left font-normal italic pl-2 text-slate-500"></td>
              <td></td>
              <td colSpan={6}></td>
            </tr>
          </tfoot>
        </table>

        {/* EXACT SIGNATURE BOX SECTION MATCHING EXCEL & PDF TEMPLATE */}
        <div className="signature-box-container mt-6" style={{ width: '420px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '8px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              border: '1px solid #000000',
            }}
          >
            <thead>
              <tr style={{ height: '22px' }}>
                <th
                  style={{
                    width: '33.33%',
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    verticalAlign: 'top',
                  }}
                >
                  TTD PEGAWAI,
                </th>
                <th
                  style={{
                    width: '33.33%',
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    verticalAlign: 'top',
                  }}
                >
                  DI PERIKSA OLEH,
                </th>
                <th
                  style={{
                    width: '33.33%',
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    verticalAlign: 'top',
                  }}
                >
                  DISETUJUI OLEH,
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row for signature space with names at bottom */}
              <tr style={{ height: '55px' }}>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                    paddingBottom: '4px',
                    fontWeight: 'normal',
                  }}
                >
                  ( {config.sig1 || config.name} )
                </td>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                    paddingBottom: '4px',
                    fontWeight: 'normal',
                  }}
                >
                  ( {config.sig2} )
                </td>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                    paddingBottom: '4px',
                    fontWeight: 'normal',
                  }}
                >
                  ( {config.sig3} )
                </td>
              </tr>
              {/* Row for Date */}
              <tr style={{ height: '20px' }}>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    verticalAlign: 'middle',
                    fontWeight: 'normal',
                  }}
                >
                  DATE : {endPeriodDisplay}
                </td>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    verticalAlign: 'middle',
                    fontWeight: 'normal',
                  }}
                >
                  DATE : {endPeriodDisplay}
                </td>
                <td
                  style={{
                    border: '1px solid #000000',
                    textAlign: 'left',
                    padding: '2px 4px',
                    verticalAlign: 'middle',
                    fontWeight: 'normal',
                  }}
                >
                  DATE : {endPeriodDisplay}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

TimesheetTable.displayName = 'TimesheetTable';
