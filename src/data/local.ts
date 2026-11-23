import { addDays, toDayKey } from '../lib/dates';
import type { Checkin, Habit } from '../lib/types';
import type { Store } from './store';

const KEY = 'habits-tracker:demo';

interface State {
  habits: Habit[];
  checkins: Checkin[];
}

function seed(): State {
  const now = new Date().toISOString();
  const today = toDayKey(new Date());
  const habits: Habit[] = [
    { id: 'h1', name: 'Boire un grand verre d’eau', emoji: '💧', moment: 'morning', days: [1, 2, 3, 4, 5, 6, 7], position: 1, created_at: now },
    { id: 'h2', name: 'Cinq minutes d’étirements', emoji: '🧘', moment: 'morning', days: [1, 2, 3, 4, 5], position: 2, created_at: now },
    { id: 'h3', name: 'Marcher 20 minutes', emoji: '🚶', moment: 'afternoon', days: [1, 2, 3, 4, 5, 6, 7], position: 3, created_at: now },
    { id: 'h4', name: 'Lire dix pages', emoji: '📖', moment: 'evening', days: [1, 2, 3, 4, 5, 6, 7], position: 4, created_at: now },
    { id: 'h5', name: 'Écrans éteints à 22 h', emoji: '🌙', moment: 'evening', days: [1, 2, 3, 4, 7], position: 5, created_at: now },
  ];
  const checkins: Checkin[] = [];
  for (let i = 1; i <= 20; i++) {
    const day = addDays(today, -i);
    habits.forEach((h, idx) => {
      if ((i * 7 + idx * 3) % 5 !== 0) checkins.push({ habit_id: h.id, day });
    });
  }
  return { habits, checkins };
}

export function localStore(): Store {
  const load = (): State => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as State;
    } catch {
      /* stockage indisponible : on repart d'un état neuf */
    }
    const s = seed();
    save(s);
    return s;
  };
  const save = (s: State) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  };

  return {
    async listHabits() {
      return [...load().habits].sort((a, b) => a.position - b.position);
    },
    async createHabit(draft) {
      const s = load();
      const habit: Habit = {
        ...draft,
        id: crypto.randomUUID(),
        position: Math.max(0, ...s.habits.map((h) => h.position)) + 1,
        created_at: new Date().toISOString(),
      };
      s.habits.push(habit);
      save(s);
      return habit;
    },
    async updateHabit(id, patch) {
      const s = load();
      s.habits = s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h));
      save(s);
    },
    async archiveHabit(id) {
      const s = load();
      s.habits = s.habits.filter((h) => h.id !== id);
      s.checkins = s.checkins.filter((c) => c.habit_id !== id);
      save(s);
    },
    async listCheckins(from, to) {
      return load().checkins.filter((c) => c.day >= from && c.day <= to);
    },
    async setCheckin(habitId, day, done) {
      const s = load();
      s.checkins = s.checkins.filter((c) => !(c.habit_id === habitId && c.day === day));
      if (done) s.checkins.push({ habit_id: habitId, day });
      save(s);
    },
  };
}
