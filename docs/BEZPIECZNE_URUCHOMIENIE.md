# Uruchomienie aplikacji na Vercel + Supabase (instrukcja krok po kroku „klik po kliku”)

> Stan instrukcji: **2026-04-24**.  
> Uwaga: nazwy przycisków w panelach Vercel/Supabase mogą się minimalnie różnić między wersjami UI.

Ta instrukcja prowadzi Cię **dokładnie** przez każdy krok, aby uruchomić aplikację bez backendu self-hosted.

---

## 0) Co masz w tym repo

Wariant projektu to frontend Vite + React + Supabase Auth:
- `frontend/src/main.jsx` — formularze login/rejestracja/reset hasła i obsługa sesji,
- `frontend/src/lib/supabase.js` — klient Supabase,
- `.env.example` — wymagane zmienne,
- `vercel.json` — build/deploy dla Vercel,
- `supabase/policies.sql` — minimalny baseline RLS.

---

## 1) Załóż projekt Supabase — klik po kliku

1. Wejdź na: https://supabase.com/
2. Kliknij **Sign in** i zaloguj się.
3. W prawym górnym rogu kliknij **New project**.
4. Wybierz organizację (Organization).
5. Wypełnij:
   - **Name**: np. `photo-platform-prod`
   - **Database Password**: wygeneruj silne hasło (zapisz je bezpiecznie)
   - **Region**: wybierz najbliższy region użytkownikom (np. EU)
6. Kliknij **Create new project**.
7. Poczekaj aż status zmieni się na gotowy (zwykle 1–3 min).

---

## 2) Włącz logowanie email/hasło w Supabase

1. W lewym menu kliknij **Authentication**.
2. Kliknij zakładkę **Providers**.
3. Znajdź provider **Email**.
4. Upewnij się, że przełącznik **Enable Email Provider** jest włączony.
5. Upewnij się, że opcja logowania przez hasło jest aktywna.
6. Kliknij **Save** (jeśli widzisz przycisk zapisu).

---

## 3) Skonfiguruj URL-e redirect (krytyczne)

1. Nadal w **Authentication**, przejdź do **URL Configuration**.
2. Ustaw:
   - **Site URL**: tymczasowo `http://localhost:5173` (na czas testów lokalnych)
3. W sekcji **Redirect URLs** dodaj kolejno:
   - `http://localhost:5173`
   - `https://<twoja-aplikacja>.vercel.app`
4. Kliknij **Save**.

> Po wdrożeniu produkcyjnym ustaw jako główny Site URL adres z Vercel.

---

## 4) Pobierz klucze Supabase do env

1. W lewym menu kliknij **Project Settings** (ikona zębatki).
2. Wejdź w **API**.
3. Skopiuj:
   - **Project URL**
   - **anon / public key**
4. **Nie kopiuj `service_role` do frontendu**.

---

## 5) Wgraj RLS baseline (`supabase/policies.sql`)

1. W lewym menu kliknij **SQL Editor**.
2. Kliknij **New query**.
3. Otwórz lokalny plik `supabase/policies.sql`.
4. Skopiuj całą zawartość i wklej do edytora SQL w Supabase.
5. Kliknij **Run**.
6. Sprawdź, czy zapytanie zakończyło się bez błędów.
7. Ważne: ten skrypt celowo blokuje zmianę `profiles.role` przez zwykły update z frontendu.

---

## 6) Uruchom aplikację lokalnie

### 6.1 Przygotuj env lokalny

1. W katalogu repo skopiuj env:
   ```bash
   cp .env.example .env
   ```
2. Otwórz `.env` i ustaw:
   - `VITE_SUPABASE_URL=<Project URL>`
   - `VITE_SUPABASE_ANON_KEY=<anon key>`

### 6.2 Start frontendu

1. Wejdź do katalogu frontendu:
   ```bash
   cd frontend
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom aplikację:
   ```bash
   npm run dev
   ```
4. Otwórz przeglądarkę: `http://localhost:5173`

---

## 7) Test lokalny — dokładna ścieżka klikania

1. Na ekranie głównym kliknij **„Nie masz konta? Zarejestruj się”**.
2. Wpisz email i hasło spełniające zasady (min. 8, duża litera, cyfra, znak specjalny).
3. Kliknij **„Zarejestruj”**.
4. Otwórz skrzynkę mailową i kliknij link potwierdzający od Supabase.
5. Wróć do aplikacji.
6. Kliknij **„Masz konto? Zaloguj się”**.
7. Zaloguj się danymi konta.
8. Sprawdź, czy widzisz widok zalogowanego użytkownika.
9. Kliknij **„Wyloguj”** i potwierdź powrót do formularza logowania.
10. Przetestuj reset hasła:
    - kliknij **„Nie pamiętasz hasła?”**,
    - podaj email,
    - kliknij **„Wyślij reset”**,
    - użyj linku z maila.

---

## 8) Deploy na Vercel — klik po kliku

1. Wejdź na: https://vercel.com/
2. Kliknij **Add New...** → **Project**.
3. W sekcji importu repo kliknij **Import** przy właściwym repozytorium GitHub.
4. W konfiguracji projektu ustaw:
   - **Framework Preset**: Vite (jeśli nie wykryło, wybierz ręcznie)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (przy Root Directory = frontend)
   - **Output Directory**: `dist`
5. Rozwiń **Environment Variables** i dodaj:
   - `VITE_SUPABASE_URL` = Twój Project URL
   - `VITE_SUPABASE_ANON_KEY` = Twój anon key
6. Kliknij **Deploy**.
7. Po zakończeniu wdrożenia kliknij wygenerowany URL projektu.

---

## 9) Dokończ konfigurację Supabase po deployu

1. Skopiuj adres aplikacji z Vercel, np. `https://photo-platform.vercel.app`.
2. Wróć do Supabase → **Authentication** → **URL Configuration**.
3. Ustaw:
   - **Site URL**: adres z Vercel
   - **Redirect URLs**: dopisz/upewnij się, że adres z Vercel istnieje
4. Kliknij **Save**.

---

## 10) Checklist produkcyjny (must-have)

- [ ] W frontendzie używany jest tylko `anon key`.
- [ ] `service_role` nie pojawia się w Vercel env ani w kodzie frontendu.
- [ ] Email confirmation jest włączone.
- [ ] Site URL i Redirect URLs są poprawne.
- [ ] RLS jest aktywne dla tabel biznesowych.
- [ ] Co najmniej jedna polityka RLS ogranicza dane do `auth.uid()`.
- [ ] `profiles.role` nie może być zmienione przez użytkownika z frontendu (blokada triggerem).
- [ ] Konto testowe przechodzi pełny flow: register → verify email → login → logout → reset password.

---

## 11) Najczęstsze błędy i szybkie naprawy

### Błąd: „Brakuje VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY”
- Sprawdź `.env` lokalnie oraz env vars w Vercel.
- Po zmianie env lokalnie zrestartuj `npm run dev`.

### Błąd: link z maila resetu/rejestracji nie działa
- Sprawdź **Site URL** i **Redirect URLs** w Supabase.
- Upewnij się, że domena Vercel jest dokładnie taka sama (https, bez literówek).

### Błąd: logowanie działa lokalnie, ale nie działa na Vercel
- Sprawdź, czy env vars są dodane dla właściwego środowiska (Production/Preview/Development).
- Wykonaj ponowny deploy po dodaniu env vars.

---

## 12) Co aplikacja obsługuje aktualnie

- `signUp`
- `signInWithPassword`
- `resetPasswordForEmail`
- `signOut`
- `getSession`
- `onAuthStateChange`
