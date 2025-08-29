# StudyTimer – Memory Reference File

## Purpose & Goals
- **Target:** Students (anyone studying)  
- **Problem:** Burnout from no breaks → app automates study/break cycles  
- **Goal:** Website MVP (not monetized yet)  

## Core Features
- Study timers (Pomodoro, 50/10, 90/15–20, 2/30)  
- Log what was studied (session notes)  
- Calendar block creation (Google Calendar integration)  
- Leaderboards (time studied → weekly, monthly, lifetime)  
- User accounts: Supabase (Google Auth, magic link, 30-day session)  
- Admin: ban/delete accounts, view user count & time spent (no access to study notes)  

## User Flow
1. First visit → login/signup (Google Auth)  
2. Main study page → select study length + method → timer starts  
3. Timer functions: pause / end  
4. On end → prompt "What did you learn today?" → logs session  
5. Data stored: duration, time, notes → leaderboard score  
6. Pages:  
   - Main Timer  
   - Profile (history, notes, edit account)  
   - Leaderboard  

## UX Guidelines
- Clean, dark UI  
- Button animations, smooth scrolling  
- Laptop-oriented (desktop-first, mobile responsive)  

## System Architecture
- **Frontend:** Next.js, Tailwind, TypeScript  
- **Backend:** Supabase (Postgres DB, Auth, API)  
- **Hosting:** Vercel  
- **Auth:** Google only  

## Database
- **Entities:**  
  - Users  
  - Study Sessions (time, duration, notes, method)  
  - Leaderboard scores  
- **Relations:** one-to-many (user → sessions)  

## Security
- HTTPS/SSL  
- Secure cookies, input validation  
- Auth via Supabase  

## Design
- Dark color scheme  
- Simple logo + favicon  
- Consistent UI typography  
- Accessibility compliance (WCAG basic)  

## Testing
- Unit tests (timer, logging)  
- Integration tests (frontend ↔ backend, calendar)  
- End-to-end flow test (login → study → log → leaderboard)  
- Load testing before launch  

## Deployment
- Host on Vercel  
- Supabase backend + Postgres DB  