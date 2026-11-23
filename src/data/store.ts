import type { Checkin, Habit, HabitDraft } from '../lib/types';

/** Interface commune au backend Supabase et au mode démo (localStorage). */
export interface Store {
  listHabits(): Promise<Habit[]>;
  createHabit(draft: HabitDraft): Promise<Habit>;
  updateHabit(id: string, patch: Partial<HabitDraft>): Promise<void>;
  archiveHabit(id: string): Promise<void>;
  listCheckins(from: string, to: string): Promise<Checkin[]>;
  setCheckin(habitId: string, day: string, done: boolean): Promise<void>;
}
