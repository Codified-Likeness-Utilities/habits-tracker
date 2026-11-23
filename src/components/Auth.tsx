import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Sky } from './Sky';

export function Auth({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      setStatus('sent');
    }
  }

  return (
    <main className="auth">
      <Sky moment="evening" className="auth-sky" />
      <div className="auth-panel">
        <p className="eyebrow">Rituels</p>
        <h1 className="display">Une petite chose, chaque jour.</h1>
        <p className="lede">
          Les grands changements commencent par des gestes minuscules. Construisons vos rituels, un matin
          après l’autre.
        </p>
        {status === 'sent' ? (
          <div className="auth-sent" role="status">
            <strong>Regardez votre boîte mail ✉️</strong>
            <span>
              Un lien de connexion vient d’être envoyé à <b>{email}</b>.
            </span>
            <button className="link" onClick={() => setStatus('idle')}>
              Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="email" className="sr-only">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi…' : 'Recevoir mon lien magique'}
            </button>
            {error && <p className="form-error">{error}</p>}
            <p className="fine">Pas de mot de passe : un simple lien par e-mail.</p>
          </form>
        )}
      </div>
    </main>
  );
}
