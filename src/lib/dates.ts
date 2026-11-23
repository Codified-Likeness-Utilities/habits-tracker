/** Les dates sont manipulées en jours *locaux* (AAAA-MM-JJ) pour éviter les décalages UTC. */

export function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromDayKey(key);
  d.setDate(d.getDate() + n);
  return toDayKey(d);
}

/** Jour ISO : 1 = lundi … 7 = dimanche. */
export function isoWeekday(key: string): number {
  const wd = fromDayKey(key).getDay();
  return wd === 0 ? 7 : wd;
}

/** Les 7 jours (lundi → dimanche) de la semaine contenant `key`. */
export function weekOf(key: string): string[] {
  const monday = addDays(key, 1 - isoWeekday(key));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function currentMoment(date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const h = date.getHours();
  if (h >= 4 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return 'evening';
}

const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
export const formatLong = (key: string) => longFmt.format(fromDayKey(key));
export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
