import { addDays, isoWeekday } from './dates';
import type { Habit } from './types';

export const isScheduled = (habit: Pick<Habit, 'days'>, day: string) =>
  habit.days.includes(isoWeekday(day));

/**
 * Série en cours : nombre de jours *prévus* consécutifs réalisés, en remontant depuis `today`.
 * Les jours non prévus ne cassent pas la série. Si aujourd'hui n'est pas encore coché,
 * la série d'hier reste valable (on a jusqu'à minuit).
 */
export function currentStreak(
  habit: Pick<Habit, 'days'>,
  done: ReadonlySet<string>,
  today: string,
  maxLookback = 3650,
): number {
  let streak = 0;
  let day = today;
  for (let i = 0; i < maxLookback; i++, day = addDays(day, -1)) {
    if (!isScheduled(habit, day)) continue;
    if (done.has(day)) streak++;
    else if (day === today) continue;
    else break;
  }
  return streak;
}

/** Meilleure série historique, sur la plage couverte par les check-ins. */
export function bestStreak(habit: Pick<Habit, 'days'>, done: ReadonlySet<string>): number {
  if (done.size === 0) return 0;
  const sorted = [...done].sort();
  let best = 0;
  let run = 0;
  for (let day = sorted[0]; day <= sorted[sorted.length - 1]; day = addDays(day, 1)) {
    if (!isScheduled(habit, day)) continue;
    run = done.has(day) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** Taux de réalisation sur les `n` derniers jours prévus (aujourd'hui inclus). */
export function completionRate(
  habit: Pick<Habit, 'days'>,
  done: ReadonlySet<string>,
  today: string,
  n = 30,
): number {
  let scheduled = 0;
  let hit = 0;
  for (let i = 0; i < n; i++) {
    const day = addDays(today, -i);
    if (!isScheduled(habit, day)) continue;
    scheduled++;
    if (done.has(day)) hit++;
  }
  return scheduled === 0 ? 0 : hit / scheduled;
}
