export type Moment = 'morning' | 'afternoon' | 'evening';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  moment: Moment;
  /** Jours ISO : 1 = lundi … 7 = dimanche. */
  days: number[];
  position: number;
  created_at: string;
}

export type HabitDraft = Pick<Habit, 'name' | 'emoji' | 'moment' | 'days'>;

export interface Checkin {
  habit_id: string;
  /** Date locale au format AAAA-MM-JJ. */
  day: string;
}

export const MOMENTS: { id: Moment; label: string; short: string; hint: string }[] = [
  { id: 'morning', label: 'Rituel du matin', short: 'Matin', hint: 'Pour bien démarrer' },
  { id: 'afternoon', label: 'Rituel de l’après-midi', short: 'Après-midi', hint: 'Garder l’élan' },
  { id: 'evening', label: 'Rituel du soir', short: 'Soir', hint: 'Ralentir et récupérer' },
];
