import type { StoredReport } from './bazi/types';

const STORAGE_KEY = 'bazi_reports';

export function saveReport(report: StoredReport): void {
  try {
    const reports = getAllReports();
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.unshift(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch { /* ignore */ }
}

export function getReport(id: string): StoredReport | null {
  try {
    return getAllReports().find(r => r.id === id) || null;
  } catch { return null; }
}

export function getAllReports(): StoredReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
