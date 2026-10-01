# HANDOFF — Big L Driving School website rebuild

**Last updated:** 2026-10-02 (AEST)
**Branch:** `rebuild-2026` (all work lives here; pushed to `origin`)
**Live site:** https://www.bigl.co.nz — **LIVE on the rebuild** since 2026-10-01
(first deploy run `36936938754`; `gh-pages` = `00721a5`)
**Repo:** `git@github.com:bigldrivingschool/bigl-site.git`

This file is the single source of truth for picking this project back up. Read it
top to bottom before touching anything.

---

## 1. What this project is

`bigl.co.nz` — brochure site for **Big L Driving School** (Silverdale, Auckland,
NZ). Four pages + 404. Was originally a 2017 **Hugo** build (v0.25.1) with
**Bootstrap 3.3.7 + jQuery 3.1.1 + Font Awesome 4.7.0**, deployed to `gh-pages`.

It has been **rebuilt from scratch as plain static HTML/CSS** — no framework, no
JavaScript bundler, no dependencies. The old Hugo/Bootstrap output is abandoned.

## 2. Branch map (IMPORTANT)

| Branch | What it is |
|---|---|
| `rebuild-2026` | **Active work.** The new clean site. Everything here. |
| `gh-pages` | **Live.** Published output of the rebuild. Never edit by hand — it is wiped and rewritten on every deploy (`force_orphan`). |
| `gh-pages-archive` | The **old Hugo/Bootstrap site** frozen at `2a7c0a8`. Rollback ref — see §5.1. |
| `master` | 2017 Hugo **source** (`content/`, `themes/`, etc.). Reference only. |

**Recovering old content:** the last good old-site commit is `2a7c0a8`
(`Update mock test price`). Use `git show 2a7c0a8:<path>` to read original
files, e.g. `git show 2a7c0a8:services/index.html`. All original copy has
already been migrated — this is only for re-checking parity.

## 3. Architecture

Plain static HTML/CSS. No build step is *required* to serve it — the only
"build" is inlining shared partials into the pages.

```
_header.html      ← shared header (inlined into every page)  ┐
_footer.html      ← shared footer (inlined into every page)  ├─ EDIT THESE,
_pricing.html     ← shared pricing block (home + services)   │  not the pages
_callbar.html     ← sticky mobile "Call now" bar (every page)┘
build.py          ← inlines the partials into the 5 pages

_og-card.html     ← source for the 1200×630 social share card (dev file,
                    excluded from the published site — see §8)

index.html              ← home
services/index.html     ← services + pricing
instructors/index.html  ← PK's bio
contact/index.html      ← contact methods
404.html                ← styled 404 (noindex)

css/style.css     ← the ONLY stylesheet (~480 lines, hand-written)
js/main.js        ← mobile nav toggle + active-link highlight (~36 lines)
img/              ← hero-banner.jpg, logo.svg, logo.png, og-cover.png,
                    favicon*, apple-touch-icon, placeholder.png
```

### The partial system (⚠ read this)

Pages contain **marker comments** around shared regions:

```html
<!--@header-->
   ...content here gets replaced on every build...
<!--/@header-->
```

The same pattern is used for `<!--@callbar-->`, `<!--@footer-->` and
`<!--@pricing-->`.

`python3 build.py` replaces everything between each marker pair with the current
partial. **It is idempotent** — safe to run repeatedly.

**THE RULE:** never hand-edit the header/footer/pricing inside a page. Edit the
partial (`_header.html`, `_footer.html`, `_pricing.html`) and run `build.py`.
Hand-editing a page's header region just gets overwritten on the next build.

## 4. Run it locally

```bash
cd ~/Dev/bigl-site
python3 build.py                 # refresh partials (do this first)
python3 -m http.server 8080
# open http://localhost:8080/
```

Pages: `/`, `/services/`, `/instructors/`, `/contact/` — all must return 200.

## 5. Deploy (GitHub Pages)

Workflow: `.github/workflows/deploy.yml`

- Trigger: **`workflow_dispatch` only** (manual). Nothing auto-deploys. This is
  deliberate — deploying is a conscious act, never a side effect of a push.
- Action: `peaceiris/actions-gh-pages@v4`, `publish_dir: .`,
  `publish_branch: gh-pages`, **`force_orphan: true`** (wipes old Bootstrap files
  from `gh-pages` and replaces them wholesale).
- Runs `python3 build.py` first, then publishes.

- **To deploy again:** Actions tab → "Deploy to GitHub Pages" → Run workflow →
  **branch `rebuild-2026`** (the dropdown defaults to `master`, which the guard
  rejects). Live in ~1–2 min. `gh` is not installed on the dev machine, so this
  is done in the browser.
- `workflow_dispatch` workflows are only exposed when the file exists on the
  **default branch**, so `deploy.yml` is duplicated on `master` (which is why
  the guard step exists). Keep both copies in sync if you edit it.
- Pre-flight: `CNAME` = `www.bigl.co.nz` ✓, `.nojekyll` present ✓, Pages source
  = `gh-pages` / (root) ✓.

### 5.1 First deploy — DONE (2026-10-01)

Run `36936938754` on `rebuild-2026`, conclusion **success**, ~30 s. `gh-pages`
went `2a7c0a8` → `00721a5` and GitHub's `pages build and deployment` rebuilt the
site immediately.

Verified on the live domain afterwards: all four pages 200; call bar on every
page; 8-question FAQ on the homepage; `og-cover.png` on all four and 1200×630;
`robots.txt` / `sitemap.xml` / `CNAME` served; `/build.py`, `/handoff.md`,
`/_header.html`, `/_callbar.html`, `/_og-card.html`, `/_pricing.html` all 404;
junk URL → 404 status with the styled page; apex still 301s to `www`.

**Rollback:** `git push origin gh-pages-archive:gh-pages --force` restores the old
site in about a minute. `gh-pages-archive` holds `2a7c0a8`, the last old-site
commit.

Two gotchas learned the hard way:

1. **GitHub's Pages checks can't pass behind Cloudflare.** DNS is at Cloudflare
   with the proxy on (orange cloud), so `www` resolves to Cloudflare ranges and
   the apex carries a `TXT` record `"ALIAS for bigldrivingschool.github.io"`.
   Settings therefore shows "DNS Check in Progress" and **"Enforce HTTPS"
   greyed out, permanently**. That is cosmetic: TLS is terminated by Cloudflare
   (cert issued by Google Trust Services, `CN=bigl.co.nz`) and `http://` 301s to
   `https://`. Do **not** "fix" it by unproxying unless you mean to move TLS back
   to GitHub's Let's Encrypt.
2. **Cloudflare caches by file extension.** Probing a path that does not exist
   yet (e.g. `/css/style.css` while the old site is still live) caches the 404
   at the edge, and `.css` entries get a 4-hour TTL from the origin headers.
   Cost us a confusing few minutes after go-live; it expired on its own. HTML
   itself is `cf-cache-status: DYNAMIC`, and GitHub's CDN caches HTML ~10 min
   (`cache-control: max-age=600`), so allow ~10 min before judging a deploy.
   Cloudflare also runs **Email Obfuscation**, which rewrites `mailto:` links to
   `/cdn-cgi/l/email-protection#…`; harmless, but turn it off under Scrape Shield
   if you want the markup served exactly as written.

One-time setup, all done: push `rebuild-2026`, copy `deploy.yml` onto `master`
with the guard, create `gh-pages-archive`, confirm the Pages source.

**Future deploys are one step:** run the workflow from `rebuild-2026`.

Checklist after any deploy (GitHub Pages caches ~10 min, so hard-refresh):

- `/`, `/services/`, `/instructors/`, `/contact/` → 200
- live HTML contains `call-bar`, `faq__item`, `og-cover.png`
- `/img/og-cover.png` → 200 and 1200×630
- dev files → 404: `/build.py`, `/_header.html`, `/_callbar.html`,
  `/_og-card.html`, `/handoff.md`
- `/does-not-exist/` → 404 status and the styled 404 page
- old Bootstrap assets gone (e.g. `/css/bootstrap.min.css` → 404)
- `git ls-tree -r origin/gh-pages --name-only` lists only real site files — the
  authoritative check that `exclude_assets` still matches what you expect

Known and accepted at launch (deliberately not fixed first): `img/placeholder.png`
on `/instructors/`, condensed home service-card copy, placement/wording of the
privacy clause, the nav that does not actually stick, the 670×446 hero image, and
no GA4 tag. Also expected: the old Hugo `/categories/`, `/tags/` and `/index.xml`
URLs will 404 (they were unlinked taxonomy pages).

Post-launch: submit `sitemap.xml` and request indexing for the four pages in
Search Console, add GA4 when the property exists, then work the deferred list.

## 6. Business facts (use verbatim — these are corrected)

| Thing | Value |
|---|---|
| Instructor | Pravin Kalyan ("PK") — NZTA qualified, ex-VTNZ Driver Testing Officer, 37 yrs driving |
| Phone | **021 1066 077** (`tel:0211066077`) |
| Email | **bookings@bigl.co.nz** |
| Facebook | `https://www.facebook.com/BigLDrivingSchool` (capital L) |
| Google Place ID | `ChIJBZDNiJMjDW0R3TMZ0WI-Ld4` |
| Address | 40 Butler Stoney Crescent, Millwater, Silverdale 0932 |
| Service area | Millwater, Silverdale, Orewa, Rodney, Hibiscus Coast |
| Rating | 5.0 · **150+** Google reviews (never show an exact count — it goes stale) |
| Pricing | $80/1hr · $460/6×(1hr) · $750/10×(1hr) · $85/1hr mock test; "+$5/hr to use school vehicle" |

⚠ A **Google Maps API key** was embedded in the original source. It was removed.
**Do not reintroduce any hardcoded API key.**

## 7. Design system

**Colours** (CSS custom props in `:root` of `css/style.css`):
```
--red: #C8332C   --red-dark: #a82a24   --red-light: #fef2f2
--black: #0a0b09   --white: #fff   --gray-50/100/200/300/400/500/700
```

**Typography:** `Sora` (headings, 600/700/800) + `Inter` (body, 400–700), loaded
from Google Fonts in each page `<head>` (not the partial).

**Stars:** ratings use an **inline SVG sprite** (`<symbol id="icon-star">` in
`_header.html`) referenced via `<use href="#icon-star"/>`. This replaces Unicode
`★` so stars render identically on every OS. Gold fill via `currentColor`
(`#fbbc04`). Used on the home hero badge + review-bar only (removed from
testimonial cards on purpose).

**Accessibility:** `:focus-visible` outlines — 3px red on light backgrounds,
white on dark (`.top-bar`, `.hero`, `.cta`, `.call-bar`, `.site-footer`,
`.page-header`). `.skip-link` in `_header.html` jumps to `<main id="main"
tabindex="-1">` on every page. `scroll-behavior: smooth` is gated behind
`@media (prefers-reduced-motion: no-preference)`.

## 8. SEO setup (already done — keep it intact)

- **Directory URLs** (`/services/`, `/instructors/`, `/contact/`) — matches the
  old site, so no URL changes / no re-ranking risk. `404.html` is the only
  `.html` URL that stays (GitHub Pages convention).
- `sitemap.xml` — 4 URLs, `www` canonical.
- `robots.txt` — `Allow: /` + sitemap pointer.
- `CNAME` → `www.bigl.co.nz`.
- **JSON-LD `LocalBusiness`** on the homepage (includes `aggregateRating`,
  `@id`, `hasMap`, `sameAs` Facebook).
- Canonical + Open Graph + meta description on every page; `404.html` is
  `noindex`.
- **Social share card**: `og:image` is `img/og-cover.png` — a 1200×630 branded
  card (logo, "Driving Lessons", service area, 5.0 rating, phone + email on a
  black strip). `og:image:width/height/alt` and `twitter:card`
  (`summary_large_image`) + `twitter:title/description/image` are set on the
  four indexable pages; `404.html` gets the image tags only.
  The card is **generated**, not hand-drawn: edit `_og-card.html`, serve the
  repo on :8080, and screenshot `http://localhost:8080/_og-card.html` at
  1200×630 with device scale factor 1 into `img/og-cover.png`.

## 9. Known state / not-yet-done

| Item | Status |
|---|---|
| Deploy to production | **Done 2026-10-01** — see §5.1. Rollback ref: `gh-pages-archive`. |
| Instructor photo | `instructors/` uses `img/placeholder.png` — needs a real photo of PK. |
| FAQ section | **Built.** 8-question `<details>` accordion at `#faq` on the homepage + `FAQPage` JSON-LD in the page `<head>` (visible copy and schema text match exactly). |
| Sticky mobile "Call now" bar | **Built.** `_callbar.html` → `.call-bar`, fixed bottom bar, `tel:0211066077`, shown only ≤768px. |
| Social share card (`og:image`) | **Built.** `img/og-cover.png` (1200×630) + `twitter:card`. Source: `_og-card.html`. |
| Google Analytics | Old `UA-42097851-4` is **dead**. Needs a GA4 tag (owner must create it). |
| `prefers-reduced-motion` | **Handled.** `scroll-behavior: smooth` only applies under `no-preference`. |
| Skip-to-content link | **Built.** First element in `_header.html`; targets `<main id="main" tabindex="-1">`. |
| Dead CSS | Removed `hero__badge` (held the last Unicode ★), `btn--outline`, `pricing-tag`, `mb-3`, `service-detail`. |
| Sticky nav | ⚠ **Does not stick.** `.nav-bar` sets `position: sticky`, but its parent `.site-header` is only ~113px tall, so the nav scrolls away with the header. Fix = make `.site-header` the sticky element, or move `.nav-bar` out of it. Not actioned. |
| Gallery section | Removed (was placeholder tiles, no real photos). |

## 10. Suggested next tasks (priority order)

1. **Deploy** once the owner signs off (see §5).
2. **Real instructor photo** → replace `img/placeholder.png` on `/instructors/`
   (single biggest trust upgrade).
3. **Google Analytics** → GA4 tag once the owner creates the property.

Done (delete from this list when the next items land): sticky mobile call bar,
the homepage FAQ + `FAQPage` JSON-LD, and the 1200×630 social share card.

## 11. Rules of engagement (learned the hard way)

- **Only commit when the owner is happy.** Do not commit after every micro
  tweak — batch it. (Explicit owner preference.)
- **Run `python3 build.py` before committing.** Otherwise partial changes don't
  reach the pages.
- **Preserve original copy.** The owner cares about content parity — don't
  summarise or "streamline" text without being asked. Don't drop detail.
- **Don't change URLs.** Directory URLs are load-bearing for SEO.
- **No dependencies / no frameworks.** This was a deliberate choice
  (Next.js was explicitly rejected). Keep it plain HTML/CSS.
- **No review-solicitation/"salesy" copy.** The owner repeatedly stripped
  phrases like "Feel free to leave a review!" — keep copy factual.
- **Never hardcode secrets** (the old Maps API key stays gone).
- **Testimonials use first names only** (no surnames).

## 12. Quick verification before any push

```bash
cd ~/Dev/bigl-site
python3 build.py                                   # "Rebuilt N page(s)"
grep -c '★' index.html                             # expect 0 (SVG stars, not glyphs)
for p in / /services/ /instructors/ /contact/; do  # all expect 200
  curl -s -o /dev/null -w "$p %{http_code}\n" "http://localhost:8080$p"
done
```

---

*Everything in §6–§11 has already been implemented on `rebuild-2026` and pushed.
The outstanding gap between here and "done" is: a real instructor photo, the
optional polish in §10, and the manual deploy in §5.*
