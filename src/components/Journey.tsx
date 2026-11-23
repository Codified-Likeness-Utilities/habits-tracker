import { addDays, isoWeekday, WEEKDAY_INITIALS } from '../lib/dates';
import { bestStreak, completionRate, currentStreak, isScheduled } from '../lib/streaks';
import type { Habit } from '../lib/types';
import { IconFlame } from './icons';

const WEEKS = 6;

interface Props {
  today: string;
  habits: Habit[];
  doneFor: (habitId: string) => ReadonlySet<string>;
  onEdit: (habit: Habit) => void;
}

export function Journey({ today, habits, doneFor, onEdit }: Props) {
  // Grille de WEEKS semaines se terminant par la semaine en cours (lundi → dimanche).
  const start = addDays(today, 1 - isoWeekday(today) - (WEEKS - 1) * 7);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));

  const overall = habits.length
    ? habits.reduce((acc, h) => acc + completionRate(h, doneFor(h.id), today, 30), 0) / habits.length
    : 0;

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Votre parcours</p>
        <h1 className="display">
          {habits.length === 0 ? 'Le voyage commence ici.' : `${Math.round(overall * 100)} % de constance`}
        </h1>
        <p className="lede">
          {habits.length === 0
            ? 'Ajoutez un premier geste depuis l’onglet Aujourd’hui.'
            : 'Sur les 30 derniers jours. La régularité compte plus que la perfection.'}
        </p>
      </header>

      <div className="journey-list">
        {habits.map((h) => {
          const done = doneFor(h.id);
          return (
            <article key={h.id} className={`journey-card ritual-${h.moment}`}>
              <button className="journey-top" onClick={() => onEdit(h)}>
                <span className="habit-emoji" aria-hidden="true">{h.emoji}</span>
                <span className="journey-name">{h.name}</span>
              </button>
              <dl className="stats">
                <div>
                  <dt>Série</dt>
                  <dd><IconFlame size={16} /> {currentStreak(h, done, today)}</dd>
                </div>
                <div>
                  <dt>Record</dt>
                  <dd>{bestStreak(h, done)}</dd>
                </div>
                <div>
                  <dt>30 jours</dt>
                  <dd>{Math.round(completionRate(h, done, today) * 100)} %</dd>
                </div>
              </dl>
              <div className="grid" role="img" aria-label={`Historique des ${WEEKS} dernières semaines`}>
                {WEEKDAY_INITIALS.map((l, i) => (
                  <span key={`l${i}`} className="grid-label">{l}</span>
                ))}
                {days.map((d) => {
                  const cls = d > today
                    ? 'is-future'
                    : !isScheduled(h, d)
                      ? 'is-off'
                      : done.has(d)
                        ? 'is-done'
                        : 'is-missed';
                  return <span key={d} className={`cell ${cls} ${d === today ? 'is-today' : ''}`} title={d} />;
                })}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
