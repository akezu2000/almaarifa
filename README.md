# Al Ma'arifa — website

Static site (no build tooling, no dependencies). Six pages, self-hosted fonts, works offline.

```
almaarifa-site/
├── index.html          Home
├── courses.html        Full catalog with Free / Paid / Small-cohort / Coming-soon filters
├── enroll.html         Enrollment + payment (JazzCash / Easypaisa / Stripe → WhatsApp)
├── ruqyah.html         Ruqyah Shariyah service page + FAQ
├── about.html          Vision, mission, the name, curriculum pillars
├── contact.html        WhatsApp-first enquiry form
├── build.py            Regenerates all 6 pages (edit this for content changes)
└── assets/
    ├── css/style.css   Design system — all colours & type in one place
    ├── js/site.js      Mobile nav, scroll reveal, filters, enrollment logic, WhatsApp composer
    ├── fonts/          Inter + Lora variable woff2 (self-hosted, no CDN)
    └── img/            Logo, horizontal lockup, favicons, 6 slides from your PDFs
```

## Run it
```bash
cd almaarifa-site && python3 -m http.server 8000
```

## Deploy
Drag `almaarifa-site/` onto [app.netlify.com/drop](https://app.netlify.com/drop) — no build step.
Also works on Vercel, Cloudflare Pages or GitHub Pages as-is.

## Editing
- **Course catalog & fees** → edit `COURSES` and `FEES` at the top of `build.py`, then `python3 build.py`.
- **Page copy** → edit the `page_*()` functions in `build.py`, then rebuild.
  (Editing the `.html` files directly works too — you just lose the rebuild option.)
- **Colours & fonts** → the `:root` block at the top of `assets/css/style.css`.

## Design system (as specified)
| Token | Value | Used for |
|---|---|---|
| Deep teal | `#1A434E` | Headings, primary buttons, dark sections, footer |
| Warm sand | `#F7F4EF` | Page background, light header |
| Warm ochre | `#C08A2E` | Kickers, accents, primary CTA |
| Body ink | `#2B2B2B` | Body text (never pure black on sand) |
| Muted slate teal | `#4A6B74` | Captions, tagline, metadata |
| Headings | **Lora** 600/700 | Hero, H1–H3, wordmark |
| Body | **Inter** 400/500/600 | Body, UI, buttons |

Body line-height 1.62, body text 17px (16px on mobile).

## The logo
**Used exactly as supplied — copied byte-for-byte, never redrawn, traced or recoloured.**

**Horizontal lockup (navbar).** The original mark is 1 : 2.81 (very tall), so the navbar now uses a
horizontal lockup: the untouched mark (78px tall) beside the wordmark `AL MA'ARIFA` in Lora Bold with
the tagline beneath. The lockup is live HTML text, not an image, so it stays crisp on retina screens
and is readable by screen readers. Ratio goes from 1 : 2.81 to about **2.4 : 1**.

Ready-made PNG lockups (for email signatures, slides, social) are in `/home/user/logo-assets/`:

| File | Use |
|---|---|
| `logo-lockup-horizontal-charcoal-1200h.png` | Master, charcoal — matches the mark exactly |
| `logo-lockup-horizontal-charcoal-{600,400,200}h.png` | Web / email sizes |
| `logo-lockup-horizontal-teal-600h.png` | Wordmark in deep teal (brand palette) |
| `logo-lockup-horizontal-white-600h.png` | For dark backgrounds |

CSS pins `filter:none !important; height:auto; width:auto` on the mark so no theme or framework
can stretch, squash or recolour it. If you later find the mark already contains the name, delete
the `.brand-text` span in the header to run the mark alone.

## Payments
`enroll.html` collects the program, name and WhatsApp number, then sends a pre-filled confirmation
to `0321-0911127`. Three methods are offered, in this order: **Nayapay** (Pakistan),
**International transfer** (Payoneer / Meezan Bank), **Card** (Stripe).

Configure them at the top of `build.py`:

1. **Nayapay (live)** — the receiving account is already set:
   `Ayesha Kashif — 0321-0911127`. The page shows the account title and number, the student
   transfers the fee, then sends the transaction ID or screenshot on WhatsApp. No merchant API needed.
2. **International transfer (live)** — Payoneer `akezu2000@gmail.com`, and Meezan Bank
   `Ayesha Kashif` / `PK39MEZN0002590102802657` / SWIFT `MEZNPKKAGRD`.
   `MEZNPKKAGRD` is Meezan House, Karachi — the **Global Remittance Department**, the desk that
   handles inbound foreign transfers; Meezan's own inward-remittance guideline quotes the same
   code. `MEZNPKKAXXX` (head office) is a valid fallback.
   **If you blank any field, that row simply isn't rendered** — no placeholder is ever published.
3. **Add more accounts** — append to `PAYMENT_ACCOUNTS` (JazzCash, Easypaisa, bank transfer…).
   Any account whose number contains `X` is treated as a placeholder and hidden automatically,
   so you can add the structure now and fill numbers in later.
4. **Card / online payment** — paste any hosted payment link into `STRIPE_DEFAULT`
   (or per-course links into `STRIPE_LINKS`) and the button goes live. The button is
   provider-neutral on purpose: a Payoneer Payment Link, Paddle, 2Checkout or Stripe all work,
   and the page never names the provider.

   **Note: Stripe is not available in Pakistan.** Pakistani businesses cannot sign up with a
   Pakistani address, CNIC or bank account, and payouts to Pakistan aren't supported. A Stripe
   account is only possible through a foreign entity (US/UK LLC, ~$500 via Stripe Atlas), which
   brings its own tax and compliance obligations.

   Practical options, in order of effort:
   - **Payoneer Payment Links** — you already have the account. *Get Paid → Payment Links*,
     generate a link, share it on WhatsApp or paste it here. Cards cost ~3.2–3.99% + $0.49.
     Payoneer documents this service as business billing, so for individual students it is
     safest as a link you send manually rather than the site's default checkout.
   - **Paddle or 2Checkout (Verifone)** — merchant-of-record providers that do work with
     Pakistani businesses and are built for consumer checkout.
   - **US/UK LLC + Stripe** — the full solution, most paperwork.
5. **Fees** — three kinds, all in one place:

   ```python
   FEES         = {"Effective Parenting — Raising a Momin": 3000, ...}  # one-off / per-course
   MONTHLY_FEES = {"Tajweed-ul-Quran": 2000}    # charged every month
   FEE_NOTES    = {"Study of Classical Texts": "Depends on the module"}
   ZOOM_FEE     = 500                           # Zoom contribution on free classes
   ```

   Unlisted paid courses show "Fee on request".

**Complete fee structure as of now** (28 programs):

- **Free** — Tafseer (short & long), Dawra-e-Quran, Names of Allah, Arabic Grammar, Victimhood
  (free lecture), Open Lectures, Ruqyah, individual counseling
- **PKR 500 / month, Zoom contribution** — Seerah, Fiqh, Thematic Study. **Charged once per
  student, not per course**: one payment covers every live class she attends.
- **PKR 2,000 / month** — Tajweed (a real fee, so classified *paid*)
- **One-off** — Parenting 3,000 · Emotional Intelligence 3,000 · Different by Design 2,500 ·
  Tazkiyat-un-Nafs 2,500 · Emotional Resolution (The Islamic Way) 2,000 · Seven Habits 2,000 ·
  Four Bodies 1,000 · Anger Management 1,000 · Time Management 1,000 · Rewire Your Habits 1,000 ·
  Alchemy of Happiness 1,000
- **Coming soon** — Mentorship, Muslim Narcissist, Biographies; Study of Classical Texts reads
  *"Depends on the module"*

**Different by Design** (2,500) replaced the **Marriage Masterclass**, which has been removed
from the catalog. It covers the God-given differences between men and women, inspired by
John Gray's *Men Are from Mars, Women Are from Venus*, grounded in the Quran and Sunnah.

### The Zoom contribution (a third fee state)
Long-running live classes are taught **free of charge**, but students pay **PKR 500 per month**
towards the Zoom room. That is not a course fee, and the site says so explicitly:

    ZOOM_FEE = 500
    ZOOM_FEE_COURSES = ["Seerat-un-Nabi Series",
                        "Fiqh of Salah and Taharah",
                        "Thematic Study of the Quran"]

Add or remove names there. Those cards show **Free** + **Zoom 500/month** badges, a
`PKR 500 / month` fee line, and the note *"Tuition is free. The monthly amount covers the Zoom
room only — it is not a course fee."* They still take payment on the enroll page (the button
reads *Send Zoom contribution on WhatsApp*), while genuinely free programs skip payment entirely.

Current fee structure: **Tafseer (short and long) and Dawra-e-Quran are free**;
**Seerah, Fiqh and Thematic Study** are free tuition with the **PKR 500/month** Zoom contribution;
**Tajweed is PKR 2,000/month** (a real fee, so it is classified *paid*, not Zoom).

Seerat-un-Nabi and Fiqh of Salah were originally listed as paid and are now **free**; Tajweed was
originally listed as free and is now **paid**, per your instruction. Note this corrects the
brochure line "all Quran-related programs are free" — the site copy has been updated to match
reality rather than the brochure.

Nothing is stored on the site — no database, no card data touches this codebase.

## Imagery
All photography was generated for this site in the brand palette (deep teal, warm sand, gold).
Nothing is stock, nothing is lifted from the PDFs. Rules used: **no faces** on any image of a
person, modest dress throughout, no animals, no text baked into images.

| File | Where |
|---|---|
| `hero-arch.jpg` | Home hero — mashrabiya screen, geometric light |
| `arch-light.jpg` | About — archway and warm light |
| `stilllife-quran.jpg` | Courses page — open Quran and prayer beads |
| `stilllife-lantern.jpg` | Ruqyah page — lantern, olive oil, dates |
| `woman-reading.jpg` | Home — sister reading by a window |
| `woman-dua.jpg` | About & Ruqyah — sister in supplication |
| `phase-sprout/branch/tree.jpg` | Home — olive sapling, branch, fruit (Sprout / Branch / Tree) |

Source files at full resolution are in `~/img-raw/`; the three exploration samples are in
`~/samples/`. The About page's "the name" section uses real typography instead of an image.

## Ruqyah booklet
`ruqyah.html` is built from `Ruqyah-Booklet.pdf`. The English guidance (conditions, method,
prophetic medicine, prevention, Q&A) is reproduced on the page; **the Arabic text of the Ruqyah is
not** — it is served as the original PDF download (`assets/files/Ruqyah-Booklet.pdf`, 2.5 MB),
so the words of Allah are never re-typed or paraphrased here.

The booklet is published by **Ummah Welfare Trust** and credited at the foot of the page. If it
is not yours to distribute, delete `assets/files/Ruqyah-Booklet.pdf` and remove the two download
buttons from `page_ruqyah()` in `build.py`.

## Still needs real data
1. **A hosted card-payment link** — Payoneer Payment Link, Paddle or 2Checkout (see above).
2. **Course fees** — all 17 paid programs still read "Fee on request".
3. **Fees** — every paid course still reads "Fee on request".
4. **Schedule** — batch start dates, class days/times, duration per course.
5. **Cohort size** — "Small cohort" is stated but no seat count.
6. **Instructor bios & photos** — no teacher names came through in the PDFs.
7. **Testimonials** — none invented.
8. **Urdu version** — the brochure mixes English and Urdu (e.g. *خوف کی کہانی: بقا سے تبدیلی تک*).
   A bilingual version would need an Urdu/Arabic font (e.g. Noto Naskh Arabic) added to `assets/fonts/`.

## Source material used
Text taken verbatim from `AL_Maarifa_Brochure.pdf`, plus OCR of the two image-only PDFs
(`Almaarifa_Identity.pdf`, `Al Maarifa Presents.pdf`) for the brand definition, Heart–Mind Circuit,
curriculum pillars and Sprout / Branch / Tree life phases. Contact number `0321-0911127` came from
the last slide of *Al Maarifa Presents*; email `almaarifa.hub@gmail.com` as supplied.
**Live site:** https://almaarifa.net  ·  Domain registered 18 Sep 2026 (renewal 18 Sep 2027)
  Registered via WebSouls · Hosted on Netlify · TLS from Let's Encrypt (auto-renewed by Netlify)
