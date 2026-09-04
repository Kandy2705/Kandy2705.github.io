# Kandy2705 Portfolio

Dark + neon-pink bilingual portfolio for **Ngô Ngọc Triệu Mẫn**, designed around the provided mockup and built to be easy to maintain without editing source code after the first deployment.

## What is included

- React + TypeScript + Vite + Tailwind CSS.
- Dark / neon pink responsive UI for laptop and phone.
- English by default with an EN/VI switch stored in `localStorage`.
- Real icons from `lucide-react`.
- Project categories: **All, Web, Mobile App, Game, AR/VR, Research, Other**.
- Project search, category filtering and full case-study pages.
- Blog with Markdown editor, search and tags.
- Experience, Education, Skills, Certificates, Awards, Research and Languages.
- Award ↔ Certificate many-to-many relationship.
- Certificate image/PDF viewer modal.
- Google OAuth admin at `/admin`.
- Admin CRUD for projects, blog, experience, education, skills, certificates, awards, research, languages and profile.
- Supabase Storage media manager.
- Contact form: stores messages in Supabase and optionally emails them through a Supabase Edge Function + Resend.
- View counters for projects and blog posts.
- Optional GA4.
- SEO metadata, robots.txt, dynamic sitemap generation and custom 404 handling for GitHub Pages.
- GitHub Actions deployment workflow.
- Loading animation using the MN logo.

## Your files already included

The repository includes lightweight printable CV pages in `public/cv/`:

- `game-developer-en.html`
- `game-developer-vi.html`
- `web-developer-vi.html`

The public CV button automatically uses the English Game Developer CV in EN mode and the Vietnamese Game Developer CV in VI mode. Each page has a **Print / Save as PDF** button. You can later upload the original PDF CVs to Supabase Storage and replace the URLs from `/admin/profile`.

The website logo is the reusable **MN monogram SVG component** (`src/components/MnMonogram.tsx`), so it stays crisp at every size and does not depend on a binary image file.

To use your real portrait without Supabase, place it at:

`public/images/profile/profile.jpg`

You can later upload/replace it from Admin → Profile instead.

---

# 1. Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The public site works with built-in fallback content even before Supabase is configured. `/admin` will show setup instructions until valid Supabase variables exist.

# 2. Create Supabase backend

1. Create a new Supabase project.
2. Open **SQL Editor**.
3. Run:

`supabase/migrations/202609040001_portfolio.sql`

This creates the database, seed data, RLS policies, view-counter functions, admin whitelist and the `portfolio-media` Storage bucket.

The only admin email is hard-restricted to:

`man.ngoman2705@gmail.com`

The SQL policy also enforces this server-side; hiding the Admin page alone is not the security mechanism.

# 3. Configure Google login

## Google Cloud

Create an OAuth 2.0 Web Client and add this **Authorized redirect URI**:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

## Supabase

Go to Authentication → Providers → Google and paste the Client ID and Client Secret.

Then go to Authentication → URL Configuration:

Site URL:

```text
https://kandy2705.github.io
```

Redirect URLs:

```text
http://localhost:5173/**
https://kandy2705.github.io/**
```

`/admin` then supports Google login. Any Google account other than `man.ngoman2705@gmail.com` is rejected, and RLS blocks its writes even if someone modifies the frontend.

# 4. Environment variables

Create `.env` locally:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_GA_MEASUREMENT_ID=
VITE_SITE_URL=https://kandy2705.github.io
```

Never commit `.env`.

The Supabase **anon key is intentionally a browser key**. Security is provided by RLS. Never put a Supabase service-role key in this frontend.

# 5. Contact email delivery

Messages are always stored in `contact_messages` first. Email delivery is done by the included Edge Function.

Install the Supabase CLI, link your project, then deploy:

```bash
supabase functions deploy send-contact-email
```

Set secrets:

```bash
supabase secrets set RESEND_API_KEY=YOUR_RESEND_KEY
supabase secrets set CONTACT_TO_EMAIL=man.ngoman2705@gmail.com
supabase secrets set CONTACT_FROM_EMAIL="Portfolio <your-verified-domain@example.com>"
```

If you do not configure Resend, messages are still stored and visible under Admin → Messages; only the email copy will fail.

# 6. Deploy to GitHub Pages

Because your GitHub username is `Kandy2705`, create a repository named exactly:

```text
Kandy2705.github.io
```

Push this source to `main`.

In GitHub → Settings → Secrets and variables → Actions, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GA_MEASUREMENT_ID` (optional)

Then Settings → Pages → Source: **GitHub Actions**.

Every push to `main` builds and deploys the website to:

`https://kandy2705.github.io`

The project includes GitHub Pages SPA fallback logic, so direct routes such as `/admin`, `/projects/agentic-ar` and `/blog/...` work after deployment.

# 7. How to add content later

Visit:

`https://kandy2705.github.io/admin`

Sign in with `man.ngoman2705@gmail.com`.

You can then add/edit/delete:

- Projects
- Blog posts
- Work experience
- Education / graduation thesis
- Skills
- Certificates
- Awards and their linked certificates
- Research
- Languages
- Profile data and profile image
- Media uploads
- Contact messages

There is intentionally **no Draft state and no separate Preview step**, matching the requested workflow: Save means Publish.

# 8. Source structure

```text
src/
├── components/        shared visual components
├── features/
│   └── admin/         admin dashboard and CRUD
├── hooks/             React Query hooks
├── i18n/              English / Vietnamese UI text
├── layouts/           public layout
├── lib/               Supabase, constants, fallback seed data
├── pages/             public routes
├── services/          data / contact API layer
├── styles/            dark pink visual system
└── types/             content types

supabase/
├── migrations/        database schema, RLS and seed data
└── functions/         contact email Edge Function
```

The public UI does not read giant hard-coded page components for content. Once Supabase is configured, the content layer loads database records instead, so new projects and posts do not require source edits.

# 9. Visual direction

The implementation follows the approved dark / deep-plum + neon-pink visual language: glass panels, soft glow, elegant display typography, project cards and animated accents, while keeping the code functional, responsive and maintainable.
