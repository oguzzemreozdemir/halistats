# HalıStats

Özel halısaha istatistik takip uygulaması (arkadaş grubu için). React + Vite + Tailwind,
veri kaynağı **Supabase**. Premium, mobile-first, koyu yeşil saha teması.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env    # sonra .env içindeki değerleri doldur
npm run dev
```

`.env` içeriği:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx   # anon / publishable key
```

Üretim derlemesi: `npm run build` → çıktı `dist/` klasörüne gelir.

## Supabase tablosu (bir kez SQL Editor'da çalıştır)

```sql
create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  player_id   text,
  player_name text,
  goals       integer not null default 0,
  assists     integer not null default 0,
  position    text,
  city        text,
  district    text,
  match_date  date,
  intensity   text check (intensity in ('Laubali','Normal','Tryhard')),
  match_scope text check (match_scope in ('Kişisel','Conclave')),
  is_conclave boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.matches enable row level security;
create policy "anon read matches"  on public.matches for select to anon using (true);
create policy "anon insert matches" on public.matches for insert to anon with check (true);
create index if not exists matches_created_at_idx on public.matches (created_at desc);
```

## Vercel'e deploy (özet)

1. Projeyi GitHub'a yükle.
2. Vercel → New Project → GitHub reposunu import et.
3. Framework otomatik "Vite" algılanır. Build: `npm run build`, Output: `dist`.
4. **Environment Variables** ekle (ÖNEMLİ — derleme sırasında gerekir):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy → `https://...vercel.app` linki hazır.

Env değişkenlerini deploy'dan sonra eklersen **yeniden deploy** etmen gerekir
(değerler build sırasında uygulamaya gömülür).

## Yapı

```
src/
  components/  AppShell, TopTabs, StatCard, EntryCard, PlayerCard, ChipSelect,
               CounterInput, LeaderboardTable, SectionHeader, Avatar, Toast
  pages/       Login, AddEntry, SonAktivite, Conclave, Leaderboard, Profile
  lib/         supabaseClient.js      (env'den okur; hard-code YOK)
  services/    matchService.js        (fetchMatches / addMatch, snake_case<->camelCase)
  data/        mockData.js            (oyuncular + seçenek listeleri)
  utils/       calculations.js        (tüm toplam/ortalama/sıralama/katsayılı gol)
  App.jsx      durum yönetimi + Supabase bağlantısı
```

## Notlar

- Maç modu (Laubali/Normal/Tryhard) sadece **Katsayılı Gol** liderlik sekmesinde
  ağırlık uygular: 0.75 / 1.00 / 1.25. Gerçek gol/asist/G+A hiçbir yerde değişmez.
- Konum önce il, sonra ilçe.
- Şu an gerçek auth yok; PIN girişi yalnızca görsel/kimlik seçimidir.
- Anon (publishable) key public'tir ve derlemede uygulamaya gömülür — bu normaldir;
  veriyi RLS korur.
```
