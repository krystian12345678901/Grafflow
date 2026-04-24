# Uruchomienie aplikacji na Vercel + Supabase

Ten projekt został przebudowany pod **Vercel + Supabase**.

## Co usunięto

Usunięto niepotrzebne elementy dla tego wariantu:
- backend Express/Prisma,
- Docker Compose,
- Nginx.

## 1) Wymagania

- Konto Supabase
- Konto Vercel
- Node.js 22+

## 2) Konfiguracja Supabase

1. Utwórz projekt w Supabase.
2. Włącz `Email/Password` w `Authentication -> Providers`.
3. Ustaw `Site URL` i `Redirect URLs` na adres aplikacji (Vercel + localhost).
4. Skopiuj:
   - `Project URL`,
   - `anon public key`.

## 3) Zmienne środowiskowe

W Vercel dodaj:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Lokalnie:
```bash
cp .env.example .env
```

## 4) Uruchomienie lokalne

```bash
cd frontend
npm install
npm run dev
```

## 5) Deploy na Vercel

### Opcja A (rekomendowana)
- Import repo do Vercel,
- ustaw **Root Directory** na `frontend`,
- dodaj env vars,
- deploy.

### Opcja B
- deploy z root repo przez `vercel.json`.

## 6) Bezpieczeństwo

- Nigdy nie używaj `service_role` w frontendzie.
- Używaj tylko `anon key`.
- Włącz RLS dla tabel danych biznesowych.
- Ogranicz polityki do `auth.uid()` i ról.
- Włącz email confirmation oraz limity logowania po stronie Supabase Auth.

## 7) Co działa teraz

- Rejestracja (`signUp`)
- Logowanie (`signInWithPassword`)
- Reset hasła (`resetPasswordForEmail`)
- Wylogowanie (`signOut`)
- Trwała sesja (`getSession`, `onAuthStateChange`)
