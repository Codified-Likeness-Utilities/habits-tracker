import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Checkin, Habit, HabitDraft } from '../lib/types';
import type { Store } from './store';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { flowType: 'pkce' } }) : null;

const HABIT_COLUMNS = 'id, name, emoji, moment, days, position, created_at';

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function supabaseStore(client: SupabaseClient): Store {
  return {
    async listHabits() {
      return check(
        await client
          .from('habits')
          .select(HABIT_COLUMNS)
          .is('archived_at', null)
          .order('position')
          .order('created_at'),
      ) as Habit[];
    },
    async createHabit(draft: HabitDraft) {
      return check(
        await client
          .from('habits')
          .insert({ ...draft, position: Date.now() % 2_000_000_000 })
          .select(HABIT_COLUMNS)
          .single(),
      ) as Habit;
    },
    async updateHabit(id, patch) {
      check(await client.from('habits').update(patch).eq('id', id));
    },
    async archiveHabit(id) {
      check(await client.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', id));
    },
    async listCheckins(from, to) {
      return check(
        await client.from('checkins').select('habit_id, day').gte('day', from).lte('day', to),
      ) as Checkin[];
    },
    async setCheckin(habitId, day, done) {
      if (done) {
        check(
          await client
            .from('checkins')
            .upsert({ habit_id: habitId, day }, { onConflict: 'habit_id,day', ignoreDuplicates: true }),
        );
      } else {
        check(await client.from('checkins').delete().eq('habit_id', habitId).eq('day', day));
      }
    },
  };
}
