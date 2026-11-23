import { describe, expect, it } from 'vitest';
import { addDays, isoWeekday, weekOf } from './dates';
import { bestStreak, completionRate, currentStreak } from './streaks';

const daily = { days: [1, 2, 3, 4, 5, 6, 7] };
const weekdays = { days: [1, 2, 3, 4, 5] };
// 2026-11-23 est un lundi.
const MON = '2026-11-23';

describe('dates', () => {
  it('calcule le jour ISO et la semaine', () => {
    expect(isoWeekday(MON)).toBe(1);
    expect(isoWeekday('2026-11-29')).toBe(7);
    expect(weekOf('2026-11-26')).toEqual([
      '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29',
    ]);
  });
  it('traverse les changements de mois et d’heure', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('currentStreak', () => {
  it('compte les jours consécutifs jusqu’à aujourd’hui', () => {
    const done = new Set([MON, addDays(MON, -1), addDays(MON, -2)]);
    expect(currentStreak(daily, done, MON)).toBe(3);
  });
  it('ne casse pas la série si aujourd’hui n’est pas encore fait', () => {
    const done = new Set([addDays(MON, -1), addDays(MON, -2)]);
    expect(currentStreak(daily, done, MON)).toBe(2);
  });
  it('casse la série sur un jour prévu manqué', () => {
    const done = new Set([MON, addDays(MON, -2)]);
    expect(currentStreak(daily, done, MON)).toBe(1);
  });
  it('ignore les jours non prévus (week-end)', () => {
    // Lundi + vendredi précédent : le week-end n'est pas prévu.
    const done = new Set([MON, addDays(MON, -3)]);
    expect(currentStreak(weekdays, done, MON)).toBe(2);
  });
  it('vaut 0 sans aucun check-in', () => {
    expect(currentStreak(daily, new Set(), MON)).toBe(0);
  });
});

describe('bestStreak', () => {
  it('trouve la plus longue série', () => {
    const done = new Set(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06']);
    expect(bestStreak(daily, done)).toBe(3);
  });
});

describe('completionRate', () => {
  it('rapporte les jours faits aux jours prévus', () => {
    const done = new Set([MON, addDays(MON, -1)]);
    expect(completionRate(daily, done, MON, 4)).toBe(0.5);
  });
});
