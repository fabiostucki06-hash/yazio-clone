export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export interface MonthCell {
  key: string;
  day: number;
  inMonth: boolean;
}

export function addDays(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: MonthCell[] = [];
  for (let i = startWeekday; i > 0; i -= 1) {
    const date = new Date(Date.UTC(year, month, 1 - i));
    cells.push({ key: dateKeyOf(date), day: date.getUTCDate(), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: dateKeyOf(new Date(Date.UTC(year, month, day))), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const date = addDays(last.key, 1);
    cells.push({ key: date, day: new Date(`${date}T00:00:00Z`).getUTCDate(), inMonth: false });
  }
  return cells;
}

export function monthYearOf(dateKey: string): { year: number; month: number } {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

export function formatDateShort(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
