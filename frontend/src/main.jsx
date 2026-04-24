import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { supabase } from './lib/supabase.js';

const PASSWORD_POLICY = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function AuthView() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignup && !PASSWORD_POLICY.test(password)) {
      setLoading(false);
      setMessage('Hasło: min. 8 znaków + duża litera + cyfra + znak specjalny.');
      return;
    }

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      setLoading(false);
      setMessage(error ? 'Nie udało się wysłać maila resetującego.' : 'Jeśli konto istnieje, link został wysłany.');
      return;
    }

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });

    setLoading(false);

    if (error) {
      setMessage(isLogin ? 'Nieprawidłowe dane logowania.' : 'Nie udało się utworzyć konta.');
      return;
    }

    if (isSignup) {
      setMessage('Konto utworzone. Potwierdź email i zaloguj się.');
    }
  };

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Photo Platform</h1>
      <p className="mt-1 text-sm text-slate-600">Wersja: Vercel + Supabase</p>

      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isForgot ? (
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            type="password"
            required
            minLength={8}
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}

        <button className="w-full rounded-md bg-slate-900 px-3 py-2 text-white" disabled={loading} type="submit">
          {loading ? 'Proszę czekać...' : isLogin ? 'Zaloguj' : isSignup ? 'Zarejestruj' : 'Wyślij reset'}
        </button>
      </form>

      <div className="mt-3 space-y-1 text-sm">
        <button className="underline" type="button" onClick={() => setMode(isLogin ? 'signup' : 'login')}>
          {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz konto? Zaloguj się'}
        </button>
        <br />
        <button className="underline" type="button" onClick={() => setMode(isForgot ? 'login' : 'forgot')}>
          {isForgot ? 'Wróć do logowania' : 'Nie pamiętasz hasła?'}
        </button>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </main>
  );
}

function LoggedInView({ user, onLogout }) {
  return (
    <main className="mx-auto mt-16 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Zalogowano</h2>
      <p className="mt-2 text-sm text-slate-700">Email: {user?.email}</p>
      <button className="mt-4 rounded-md border border-slate-300 px-3 py-2" type="button" onClick={onLogout}>
        Wyloguj
      </button>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setBooting(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (booting) return <div className="p-6">Ładowanie sesji...</div>;

  if (!session) return <AuthView />;

  return <LoggedInView user={session.user} onLogout={() => supabase.auth.signOut()} />;
}

createRoot(document.getElementById('root')).render(<App />);
