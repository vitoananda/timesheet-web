export interface TimesheetConfig {
  projectName: string;
  unitDivision: string;
  name: string;
  miiId: string;
  site: string;
  rowProjectName: string;
  rowProjectId: string;
  rowApp: string;
  rowAip: string;
  rowDivisi: string;
  rowDept: string;
  rowSubDept: string;
  sig1: string; // TTD PEGAWAI
  sig2: string; // DI PERIKSA OLEH
  sig3: string; // DISETUJUI OLEH
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  totalHour: string; // HH:mm:ss
  status: 'P' | 'S' | 'BT' | 'PM' | 'V' | 'X' | '';
  activity: string;
  projectName?: string;
  projectId?: string;
  app?: string;
  aip?: string;
  divisi?: string;
  dept?: string;
  subDept?: string;
  isHoliday?: boolean;
}

export const DEFAULT_CONFIG: TimesheetConfig = {
  projectName: "PT. BANK NEGARA INDONESIA, Tbk",
  unitDivision: "WEL / WDL",
  name: "VITO RIZQI ANANDA",
  miiId: "10000295 / 901451",
  site: "BNI",
  rowProjectName: "SIMON",
  rowProjectId: "60831,\n60832",
  rowApp: "",
  rowAip: "Enhancement\nSIMON Fase 6 & 7",
  rowDivisi: "WDL",
  rowDept: "WEL",
  rowSubDept: "RMS",
  sig1: "Vito Rizqi Ananda",
  sig2: "Nuke Wulandari",
  sig3: "Junid Baharuddin",
};
