# Restaurant System — እውነተኛ ስሪት

ይህ የNext.js + Supabase ሙሉ web application ነው። በChrome በስልክም በcomputerም ይሰራል።

## 1. Supabase
1. በSupabase ላይ አዲስ project ፍጠር።
2. SQL Editor ክፈት።
3. `supabase/schema.sql` አስገባ እና Run አድርግ።
4. `supabase/rls-policies.sql` አስገባ እና Run አድርግ።
5. Project Settings → API ውስጥ Project URL እና anon/public key ውሰድ።

## 2. Environment
`.env.example` ን `.env.local` ብለህ ቀይር እና `NEXT_PUBLIC_SUPABASE_URL` እና `NEXT_PUBLIC_SUPABASE_ANON_KEY` ሙላ።

`SUPABASE_SERVICE_ROLE_KEY` ን በbrowser/client code ውስጥ አታስገባ። ከserver-side API/cron ብቻ ይጠቀማል።

## 3. Run
```bash
npm install
npm run dev
```
ከዚያ `http://localhost:3000` ክፈት።

## 4. Online በነፃ
Vercel/Netlify ላይ deploy ማድረግ ይቻላል። Git repository ካለ በመገናኘት projectን deploy አድርግ። Environment Variables ውስጥ Supabase values አስገባ።

## አስፈላጊ
ይህ ZIP የproduction-ready source ነው፤ እውነተኛ database እንዲሰራ የራስህ Supabase project መፍጠር እና environment variables ማስገባት አለብህ። እነዚህ ከሌሉ እኔ እውነተኛ database በራሴ ላይ ልፈጥርልህ አልችልም።
