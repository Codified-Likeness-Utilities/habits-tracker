import { currentMoment, formatLong, isoWeekday, weekOf, WEEKDAY_INITIALS } from '../lib/dates';
import { currentStreak, isScheduled } from '../lib/streaks';
import { MOMENTS, type Habit, type Moment } from '../lib/types';
import { Sky } from './Sky';
import { IconCheck, IconFlame, IconPlus } from './icons';

interface Props {
  today: string;
  day: string;
  onSelectDay: (day: string) => void;
  habits: Habit[];
  doneFor: (habitId: string) => ReadonlySet<string>;
  onToggle: (habitId: string, day: string) => void;
  onEdit: (habit: Habit) => void;
  onAdd: (moment: Moment) => void;
}

const GREETING: Record<Moment, string> = {
  morning: 'Bonjour',
  afternoon: 'Bel après-midi',
  evening: 'Bonsoir',
};

export function Today({ today, day, onSelectDay, habits, doneFor, onToggle, onEdit, onAdd }: Props) {
  const moment = currentMoment();
  const scheduled = habits.filter((h) => isScheduled(h, day));
  const doneCount = scheduled.filter((h) => doneFor(h.id).has(day)).length;
  const isToday = day === today;

  return (
    <>
      <header className={`hero hero-${moment}`}>
        <Sky moment={moment} className="hero-sky" />
        <div className="hero-text">
          <p className="eyebrow">{isToday ? GREETING[moment] : formatLong(day)}</p>
          <h1 className="display">
            {scheduled.length === 0
              ? 'Une page blanche.'
              : doneCount === scheduled.length
                ? 'Journée accomplie.'
                : isToday
                  ? 'Votre journée, en douceur.'
                  : 'Retour en arrière.'}
          </h1>
          {scheduled.length > 0 && (
            <p className="hero-meta">
              {doneCount} sur {scheduled.length} gestes · {isToday ? formatLong(day) : 'modifiable'}
            </p>
          )}
        </div>
      </header>

      <WeekStrip today={today} day={day} onSelect={onSelectDay} habits={habits} doneFor={doneFor} />

      <div className="rituals">
        {MOMENTS.map((m) => {
          const list = scheduled.filter((h) => h.moment === m.id);
          const n = list.filter((h) => doneFor(h.id).has(day)).length;
          const complete = list.length > 0 && n === list.length;
          return (
            <section key={m.id} className={`ritual ritual-${m.id} ${complete ? 'is-complete' : ''}`}>
              <header className="ritual-head">
                <div>
                  <h2 className="display-sm">{m.label}</h2>
                  <p className="ritual-hint">{complete ? 'Rituel accompli — bravo.' : m.hint}</p>
                </div>
                {list.length > 0 && (
                  <Ring value={n / list.length} label={`${n}/${list.length}`} />
                )}
              </header>
              <ul className="habit-list">
                {list.map((h) => {
                  const checked = doneFor(h.id).has(day);
                  const streak = currentStreak(h, doneFor(h.id), day);
                  return (
                    <li key={h.id} className={`habit ${checked ? 'is-done' : ''}`}>
                      <button className="habit-main" onClick={() => onEdit(h)}>
                        <span className="habit-emoji" aria-hidden="true">{h.emoji}</span>
                        <span className="habit-text">
                          <span className="habit-name">{h.name}</span>
                          {streak > 1 && (
                            <span className="habit-streak">
                              <IconFlame size={14} /> {streak} jours d’affilée
                            </span>
                          )}
                        </span>
                      </button>
                      <button
                        className="check"
                        onClick={() => onToggle(h.id, day)}
                        aria-pressed={checked}
                        aria-label={checked ? `Annuler « ${h.name} »` : `Valider « ${h.name} »`}
                      >
                        <IconCheck size={20} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button className="add-inline" onClick={() => onAdd(m.id)}>
                <IconPlus size={16} /> Ajouter un geste
              </button>
            </section>
          );
        })}
      </div>
    </>
  );
}

function WeekStrip({
  today, day, onSelect, habits, doneFor,
}: { today: string; day: string; onSelect: (d: string) => void } & Pick<Props, 'habits' | 'doneFor'>) {
  return (
    <nav className="week" aria-label="Jours de la semaine">
      {weekOf(today).map((d) => {
        const sched = habits.filter((h) => isScheduled(h, d));
        const ratio = sched.length ? sched.filter((h) => doneFor(h.id).has(d)).length / sched.length : 0;
        const future = d > today;
        return (
          <button
            key={d}
            className={`week-day ${d === day ? 'is-selected' : ''} ${d === today ? 'is-today' : ''}`}
            disabled={future}
            onClick={() => onSelect(d)}
            aria-current={d === day ? 'date' : undefined}
            aria-label={formatLong(d)}
          >
            <span className="week-initial">{WEEKDAY_INITIALS[isoWeekday(d) - 1]}</span>
            <Ring value={future ? 0 : ratio} label={String(Number(d.slice(8)))} small />
          </button>
        );
      })}
    </nav>
  );
}

function Ring({ value, label, small }: { value: number; label: string; small?: boolean }) {
  const r = small ? 14 : 20;
  const c = 2 * Math.PI * r;
  const size = (r + 4) * 2;
  return (
    <span className={`ring ${small ? 'ring-sm' : ''} ${value >= 1 ? 'is-full' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">{label}</span>
    </span>
  );
}
