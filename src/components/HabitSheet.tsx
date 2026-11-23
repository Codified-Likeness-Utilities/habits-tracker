import { useEffect, useState, type FormEvent } from 'react';
import { WEEKDAY_INITIALS } from '../lib/dates';
import { MOMENTS, type Habit, type HabitDraft } from '../lib/types';
import { IconClose } from './icons';

const EMOJIS = ['💧', '🧘', '🚶', '🏃', '📖', '✍️', '🥗', '🍎', '🌙', '😴', '🦷', '💊', '🎧', '🧠', '🌿', '☀️', '📵', '🙏', '🎨', '💪'];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
const MOMENT_EMOJI = { morning: '🌅', afternoon: '🌤️', evening: '🌙' } as const;

interface Props {
  habit: Habit | null;
  defaultMoment: HabitDraft['moment'];
  onClose: () => void;
  onSave: (draft: HabitDraft, id?: string) => Promise<boolean>;
  onArchive: (id: string) => void;
}

export function HabitSheet({ habit, defaultMoment, onClose, onSave, onArchive }: Props) {
  const [draft, setDraft] = useState<HabitDraft>(
    habit
      ? { name: habit.name, emoji: habit.emoji, moment: habit.moment, days: habit.days }
      : { name: '', emoji: '✨', moment: defaultMoment, days: ALL_DAYS },
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleDay = (d: number) =>
    setDraft((s) => {
      const days = s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d].sort();
      return days.length ? { ...s, days } : s;
    });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    const ok = await onSave({ ...draft, name: draft.name.trim() }, habit?.id);
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form
        className="sheet"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="sheet-grip" />
        <header className="sheet-head">
          <h2 id="sheet-title" className="display-sm">
            {habit ? 'Ajuster l’habitude' : 'Une nouvelle habitude'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </header>

        <label className="field">
          <span>Quel petit geste ?</span>
          <div className="name-row">
            <span className="name-emoji" aria-hidden="true">{draft.emoji}</span>
            <input
              autoFocus
              maxLength={80}
              placeholder="Ex. Méditer trois minutes"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
        </label>

        <fieldset className="field">
          <legend>Un symbole</legend>
          <div className="emoji-grid">
            {EMOJIS.map((em) => (
              <button
                type="button"
                key={em}
                className={`emoji-opt ${draft.emoji === em ? 'is-on' : ''}`}
                onClick={() => setDraft({ ...draft, emoji: em })}
                aria-pressed={draft.emoji === em}
              >
                {em}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Dans quel rituel ?</legend>
          <div className="moment-row">
            {MOMENTS.map((m) => (
              <button
                type="button"
                key={m.id}
                className={`moment-opt moment-${m.id} ${draft.moment === m.id ? 'is-on' : ''}`}
                onClick={() => setDraft({ ...draft, moment: m.id })}
                aria-pressed={draft.moment === m.id}
              >
                <span aria-hidden="true">{MOMENT_EMOJI[m.id]}</span>
                {m.short}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Quels jours ?</legend>
          <div className="days-row">
            {ALL_DAYS.map((d) => (
              <button
                type="button"
                key={d}
                className={`day-opt ${draft.days.includes(d) ? 'is-on' : ''}`}
                onClick={() => toggleDay(d)}
                aria-pressed={draft.days.includes(d)}
                aria-label={['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'][d - 1]}
              >
                {WEEKDAY_INITIALS[d - 1]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="sheet-actions">
          {habit && (
            <button
              type="button"
              className="btn-ghost danger"
              onClick={() => {
                if (confirm(`Retirer « ${habit.name} » de vos rituels ?`)) {
                  onArchive(habit.id);
                  onClose();
                }
              }}
            >
              Retirer
            </button>
          )}
          <button className="btn-primary" disabled={busy || !draft.name.trim()}>
            {habit ? 'Enregistrer' : 'Ajouter à mon rituel'}
          </button>
        </div>
      </form>
    </div>
  );
}
