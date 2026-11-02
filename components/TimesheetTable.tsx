import React from 'react';
import { TimesheetConfig, DayRecord } from '@/types/timesheet';
import { MetrodataLogo } from './MetrodataLogo';

interface TimesheetTableProps {
  period: string; // YYYY-MM
  config: TimesheetConfig;
  records: Record<string, DayRecord>;
  onSelectDay: (dateStr: string, e?: React.MouseEvent) => void;
  selectedDate?: string;
  selectedDates?: string[];
}

interface TimesheetDayItem {
  day: number;
  dateKey: string;
  dateDisplay: string;
  isWeekend: boolean;
  isCustomHoliday: boolean | undefined;
  status: string;
  startTime: string;
  endTime: string;
  totalHour: string;
  activity: string;
  projectName: string;
  projectId: string;
  app: string;
  aip: string;
  divisi: string;
  dept: string;
  subDept: string;
  missingCheckout: boolean;
}

export const TimesheetTable = React.forwardRef<HTMLDivElement, TimesheetTableProps>(
  ({ period, config, records, onSelectDay, selectedDate, selectedDates }, ref) => {
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const totalDays = new Date(year, month, 0).getDate();
    const periodLabel = `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' })}-${String(year).slice(-2)}`;
    const endPeriodDisplay = `${totalDays}-${periodLabel}`;

    let countP = 0, countS = 0, countBT = 0, countPM = 0, countV = 0, countX = 0;

    const days: TimesheetDayItem[] = [];
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
      const startTime = isGreyedOut && !rec?.startTime ? '08:00:00' : (rec?.startTime || '08:00:00');
      const endTime = isGreyedOut && !rec?.endTime ? '17:00:00' : (rec?.endTime || '17:00:00');
      const totalHour = isGreyedOut && !rec?.totalHour ? '09:00:00' : (rec?.totalHour || '09:00:00');
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
        missingCheckout: !!rec?.missingCheckout,
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

    const page1Days = days.slice(0, 25);
    const page2Days = days.slice(25);

    // Exact proportional column widths: Total = 1080px (fits 297mm landscape sheet with p-6)
    const colGroup = (
      <colgroup>
        <col style={{ width: '64px' }} />
        <col style={{ width: '40px' }} />
        <col style={{ width: '40px' }} />
        <col style={{ width: '44px' }} />
        <col style={{ width: '36px' }} />
        <col style={{ width: '26px' }} />
        <col style={{ width: '44px' }} />
        <col style={{ width: '30px' }} />
        <col style={{ width: '36px' }} />
        <col style={{ width: '46px' }} />
        <col style={{ width: '280px' }} />
        <col style={{ width: '54px' }} />
        <col style={{ width: '46px' }} />
        <col style={{ width: '52px' }} />
        <col style={{ width: '96px' }} />
        <col style={{ width: '36px' }} />
        <col style={{ width: '52px' }} />
        <col style={{ width: '58px' }} />
      </colgroup>
    );

    const tableHeader = (
      <thead>
        <tr>
          <th rowSpan={2} style={{ width: '64px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>DATE</th>
          <th colSpan={2} style={{ width: '80px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>WORKING HOUR</th>
          <th rowSpan={2} style={{ width: '44px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>TOTAL<br />HOUR</th>
          <th colSpan={6} style={{ width: '218px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>STATUS ATTENDANCE</th>
          <th rowSpan={2} style={{ width: '280px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>ACTIVITY / REMARK</th>
          <th rowSpan={2} style={{ width: '54px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Project Name</th>
          <th rowSpan={2} style={{ width: '46px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Project ID</th>
          <th rowSpan={2} style={{ width: '52px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Aplikasi<br />Terdampak</th>
          <th rowSpan={2} style={{ width: '96px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>AIP Fitur</th>
          <th rowSpan={2} style={{ width: '36px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Divisi</th>
          <th rowSpan={2} style={{ width: '52px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Departement</th>
          <th rowSpan={2} style={{ width: '58px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Sub<br />Departement</th>
        </tr>
        <tr>
          <th style={{ width: '40px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>START</th>
          <th style={{ width: '40px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>END</th>
          <th style={{ width: '36px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Present</th>
          <th style={{ width: '26px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Sick</th>
          <th style={{ width: '44px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Business<br />Trip</th>
          <th style={{ width: '30px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Permit</th>
          <th style={{ width: '36px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Vacation</th>
          <th style={{ width: '46px', border: '1px solid #000000', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', padding: '2px 2px' }}>Not<br />Working</th>
        </tr>
      </thead>
    );

    const renderDayRow = (d: TimesheetDayItem) => {
      const isSelected = selectedDates ? selectedDates.includes(d.dateKey) : d.dateKey === selectedDate;
      let rowBg = '';
      let rowClass = '';
      if (d.isWeekend || d.isCustomHoliday) {
        rowBg = '#a6a6a6'; // Pure neutral grey matching Excel template
        rowClass = 'weekend-row';
        if (isSelected) {
          rowClass += ' selected-row';
        }
      } else if (isSelected) {
        rowClass = 'selected-row';
      }

      return (
        <tr
          key={d.dateKey}
          onClick={(e) => onSelectDay(d.dateKey, e)}
          className={`${rowClass} hover:opacity-90 transition-opacity`}
          style={{
            cursor: 'pointer',
          }}
          title="Click to select | Ctrl+Click to toggle | Shift+Click for range"
        >
          <td className="font-bold text-center select-none" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>
            <span
              className="pdf-hide inline-block mr-1 text-[10px] text-blue-600 font-normal align-middle select-none"
              data-html2canvas-ignore="true"
            >
              {isSelected ? '☑' : '☐'}
            </span>
            {d.dateDisplay}
          </td>
          <td className="text-center font-mono" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{formatTime(d.startTime)}</td>
          <td
            className="text-center font-mono"
            style={{
              border: '1px solid #000000',
              backgroundColor: d.missingCheckout ? '#fecaca' : (isSelected ? undefined : (rowBg || undefined)),
              color: d.missingCheckout ? '#b91c1c' : undefined,
              fontWeight: d.missingCheckout ? 'bold' : 'normal',
            }}
            title={d.missingCheckout ? 'Missing Check-Out Time! Click to edit' : undefined}
          >
            {d.missingCheckout ? (
              <span className="inline-block px-1 py-0.5 rounded bg-red-100 text-red-700 text-[7px] font-bold">
                MISSING
              </span>
            ) : (
              formatTime(d.endTime)
            )}
          </td>
          <td className="text-center font-mono" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>
            {d.missingCheckout ? '-' : formatHour(d.totalHour)}
          </td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'P' ? 'P' : ''}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'S' ? 'S' : ''}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'BT' ? 'BT' : ''}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'PM' ? 'PM' : ''}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'V' ? 'V' : ''}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.status === 'X' ? 'X' : ''}</td>
          <td className="text-left whitespace-pre-line leading-tight px-1.5" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.activity}</td>
          <td className="text-center font-bold" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.projectName}</td>
          <td className="text-center whitespace-pre-line leading-tight" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.projectId}</td>
          <td className="text-center" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.app}</td>
          <td className="text-center whitespace-pre-line leading-tight" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.aip}</td>
          <td className="text-center" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.divisi}</td>
          <td className="text-center" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.dept}</td>
          <td className="text-center" style={{ border: '1px solid #000000', backgroundColor: isSelected ? undefined : (rowBg || undefined) }}>{d.subDept}</td>
        </tr>
      );
    };

    const tableFooter = (
      <tfoot>
        <tr className="font-bold bg-white text-center" style={{ height: '20px' }}>
          <td colSpan={4} className="text-right pr-2" style={{ border: '1px solid #000000' }}>TOTAL</td>
          <td style={{ border: '1px solid #000000' }}>{countP}</td>
          <td style={{ border: '1px solid #000000' }}>{countS}</td>
          <td style={{ border: '1px solid #000000' }}>{countBT}</td>
          <td style={{ border: '1px solid #000000' }}>{countPM}</td>
          <td style={{ border: '1px solid #000000' }}>{countV}</td>
          <td style={{ border: '1px solid #000000' }}>{countX}</td>
          <td className="text-left font-normal italic pl-2 text-slate-500" style={{ border: '1px solid #000000' }}></td>
          <td style={{ border: '1px solid #000000' }}></td>
          <td colSpan={6} style={{ border: '1px solid #000000' }}></td>
        </tr>
      </tfoot>
    );

    // Signature box spanning the first 10 columns with balanced equal widths (136px each, total = 408px)
    const signatureSection = (
      <div className="signature-box-container mt-6" style={{ width: '408px' }}>
        <table
          style={{
            width: '408px',
            borderCollapse: 'collapse',
            fontSize: '8px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            border: '1px solid #000000',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '136px' }} />
            <col style={{ width: '136px' }} />
            <col style={{ width: '136px' }} />
          </colgroup>
          <thead>
            <tr style={{ height: '22px' }}>
              <th
                style={{
                  width: '136px',
                  border: '1px solid #000000',
                  textAlign: 'center',
                  padding: '2px 4px',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff',
                  verticalAlign: 'middle',
                }}
              >
                TTD PEGAWAI,
              </th>
              <th
                style={{
                  width: '136px',
                  border: '1px solid #000000',
                  textAlign: 'center',
                  padding: '2px 4px',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff',
                  verticalAlign: 'middle',
                }}
              >
                DI PERIKSA OLEH,
              </th>
              <th
                style={{
                  width: '136px',
                  border: '1px solid #000000',
                  textAlign: 'center',
                  padding: '2px 4px',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff',
                  verticalAlign: 'middle',
                }}
              >
                DISETUJUI OLEH,
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Row for signature space with names at bottom */}
            <tr style={{ height: '85px' }}>
              <td
                style={{
                  width: '136px',
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
                  width: '136px',
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
                  width: '136px',
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
                  width: '136px',
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
                  width: '136px',
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
                  width: '136px',
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
    );

    return (
      <div ref={ref} id="timesheetContainer" className="flex flex-col gap-8 print:gap-0">
        {/* ================= PAGE 1 ================= */}
        <div
          id="timesheetPage1"
          className="sheet-page bg-white p-6 shadow-xl mx-auto text-black print:p-0 print:m-0 print:shadow-none print:w-full print:border-none print:break-after-page"
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
                  <span
                    className="inline-block w-4 h-3 border border-black"
                    style={{ backgroundColor: '#a6a6a6', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                  ></span>
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
              tableLayout: 'fixed',
              border: '1px solid #000000',
            }}
          >
            {colGroup}
            {tableHeader}
            <tbody>
              {page1Days.map(renderDayRow)}
            </tbody>
            {page2Days.length === 0 && tableFooter}
          </table>

          {page2Days.length === 0 && signatureSection}
        </div>

        {/* ================= PAGE 2 (if remaining days exist) ================= */}
        {page2Days.length > 0 && (
          <div
            id="timesheetPage2"
            className="sheet-page bg-white p-6 shadow-xl mx-auto text-black print:p-0 print:m-0 print:shadow-none print:w-full print:border-none"
            style={{
              width: '297mm',
              minHeight: '210mm',
              boxSizing: 'border-box',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            {/* CLEAN 14mm TOP SPACING REQUESTED BY USER */}
            <div style={{ height: '14mm' }} />

            {/* TABLE FOR REMAINING DAYS WITH HEADER + FOOTER */}
            <table
              className="report-table"
              style={{
                borderCollapse: 'collapse',
                width: '100%',
                fontSize: '8px',
                lineHeight: 1.15,
                tableLayout: 'fixed',
                border: '1px solid #000000',
              }}
            >
              {colGroup}
              <tbody>
                {page2Days.map(renderDayRow)}
              </tbody>
              {tableFooter}
            </table>

            {/* SIGNATURE SECTION MATCHING FIRST 10 COLUMNS OF THE TABLE */}
            {signatureSection}
          </div>
        )}
      </div>
    );
  }
);

TimesheetTable.displayName = 'TimesheetTable';
