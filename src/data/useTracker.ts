import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, toDayKey } from '../lib/dates';
import type { Habit, HabitDraft } from '../lib/types';
import type { Store } from './store';

/** Historique chargé pour calculer séries et statistiques. */
const HISTORY_DAYS = 400;

export function useTracker(store: Store, onError: (msg: string) => void) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [done, setDone] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const today = toDayKey(new Date());
    try {
      const [hs, cs] = await Promise.all([
        store.listHabits(),
        store.listCheckins(addDays(today, -HISTORY_DAYS), addDays(today, 7)),
      ]);
      const map = new Map<string, Set<string>>();
      for (const c of cs) {
        if (!map.has(c.habit_id)) map.set(c.habit_id, new Set());
        map.get(c.habit_id)!.add(c.day);
      }
      setHabits(hs);
      setDone(map);
    } catch (e) {
      onError(`Chargement impossible : ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [store, onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyLocal = (habitId: string, day: string, value: boolean) =>
    setDone((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(habitId));
      if (value) set.add(day);
      else set.delete(day);
      next.set(habitId, set);
      return next;
    });

  /** Mise à jour optimiste, annulée si le serveur refuse. */
  const toggle = useCallback(
    async (habitId: string, day: string) => {
      const value = !done.get(habitId)?.has(day);
      applyLocal(habitId, day, value);
      try {
        await store.setCheckin(habitId, day, value);
      } catch (e) {
        applyLocal(habitId, day, !value);
        onError(`Pas enregistré : ${(e as Error).message}`);
      }
    },
    [done, store, onError],
  );

  const save = useCallback(
    async (draft: HabitDraft, id?: string) => {
      try {
        if (id) {
          await store.updateHabit(id, draft);
          setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, ...draft } : h)));
        } else {
          const created = await store.createHabit(draft);
          setHabits((hs) => [...hs, created]);
        }
        return true;
      } catch (e) {
        onError(`Enregistrement impossible : ${(e as Error).message}`);
        return false;
      }
    },
    [store, onError],
  );

  const archive = useCallback(
    async (id: string) => {
      try {
        await store.archiveHabit(id);
        setHabits((hs) => hs.filter((h) => h.id !== id));
      } catch (e) {
        onError(`Suppression impossible : ${(e as Error).message}`);
      }
    },
    [store, onError],
  );

  const doneFor = useMemo(() => {
    const empty = new Set<string>();
    return (habitId: string) => done.get(habitId) ?? empty;
  }, [done]);

  return { habits, doneFor, loading, toggle, save, archive };
}
