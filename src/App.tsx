import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { localStore } from './data/local';
import type { Store } from './data/store';
import { supabase, supabaseStore } from './data/supabase';
import { useTracker } from './data/useTracker';
import { currentMoment, toDayKey } from './lib/dates';
import type { Habit, Moment } from './lib/types';
import { Auth } from './components/Auth';
import { HabitSheet } from './components/HabitSheet';
import { Journey } from './components/Journey';
import { Today } from './components/Today';
import { IconLogout, IconPath, IconPlus, IconSun } from './components/icons';

export function App() {
  if (!supabase) return <Tracker store={demoStore} demo />;
  return <SupabaseGate client={supabase} />;
}

const demoStore = localStore();

function SupabaseGate({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [client]);

  const userId = session?.user.id;
  const store = useMemo(() => (userId ? supabaseStore(client) : null), [client, userId]);

  if (session === undefined) return <Splash />;
  if (!session || !store) return <Auth client={client} />;
  return <Tracker key={userId} store={store} onSignOut={() => client.auth.signOut()} />;
}

function Splash() {
  return (
    <div className="splash" aria-busy="true">
      <span className="splash-sun" />
    </div>
  );
}

type Sheet = { habit: Habit | null; moment: Moment } | null;

function Tracker({ store, demo, onSignOut }: { store: Store; demo?: boolean; onSignOut?: () => void }) {
  const [toast, setToast] = useState<string | null>(null);
  const onError = useCallback((msg: string) => setToast(msg), []);
  const { habits, doneFor, loading, toggle, save, archive } = useTracker(store, onError);

  const [today, setToday] = useState(() => toDayKey(new Date()));
  const [day, setDay] = useState(today);
  const [tab, setTab] = useState<'today' | 'journey'>('today');
  const [sheet, setSheet] = useState<Sheet>(null);

  // Passage à minuit (ou retour sur un onglet resté ouvert) : on avance au nouveau jour.
  useEffect(() => {
    const tick = () => setToday(toDayKey(new Date()));
    const id = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  useEffect(() => setDay(today), [today]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const openNew = (moment: Moment = currentMoment()) => setSheet({ habit: null, moment });
  const openEdit = (habit: Habit) => setSheet({ habit, moment: habit.moment });

  return (
    <div className="app">
      {demo && (
        <div className="demo-banner">
          Mode démo — données stockées dans ce navigateur. Configurez Supabase pour synchroniser.
        </div>
      )}
      <main className="content">
        {loading ? (
          <Splash />
        ) : tab === 'today' ? (
          <Today
            today={today}
            day={day}
            onSelectDay={setDay}
            habits={habits}
            doneFor={doneFor}
            onToggle={toggle}
            onEdit={openEdit}
            onAdd={openNew}
          />
        ) : (
          <Journey today={today} habits={habits} doneFor={doneFor} onEdit={openEdit} />
        )}
      </main>

      <nav className="tabbar" aria-label="Navigation principale">
        <button className={tab === 'today' ? 'is-on' : ''} onClick={() => setTab('today')}>
          <IconSun /> <span>Aujourd’hui</span>
        </button>
        <button className="fab" onClick={() => openNew()} aria-label="Nouvelle habitude">
          <IconPlus size={26} />
        </button>
        <button className={tab === 'journey' ? 'is-on' : ''} onClick={() => setTab('journey')}>
          <IconPath /> <span>Parcours</span>
        </button>
      </nav>

      {onSignOut && (
        <button className="signout icon-btn" onClick={onSignOut} aria-label="Se déconnecter" title="Se déconnecter">
          <IconLogout size={18} />
        </button>
      )}

      {sheet && (
        <HabitSheet
          key={sheet.habit?.id ?? 'new'}
          habit={sheet.habit}
          defaultMoment={sheet.moment}
          onClose={() => setSheet(null)}
          onSave={save}
          onArchive={archive}
        />
      )}

      {toast && (
        <div className="toast" role="alert">
          {toast}
        </div>
      )}
    </div>
  );
}
