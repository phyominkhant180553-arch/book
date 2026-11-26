# Quiet Pages — implementation plan

## Product goal

Turn the supplied AetherBook Node.js/PWA reader into a premium publication site with an editorial landing page, a focused reader, a 50-page free preview, and a calm purchase invitation at the preview boundary. This first delivery uses a generated 64-page local demo PDF. The book provider boundary is kept server-side so the full book can move to private Supabase Storage later without changing the reader UI.

## Implementation approach

- Use a small Node.js + Express server with compression and no framework build step.
- Serve an editorial landing page at `/`, the reader at `/read`, and a static route manifest at `/manus-routes.json`.
- Keep the full demo PDF outside the public directory. Generate and serve a separate 50-page preview PDF through `/api/book-preview.pdf`.
- Return book metadata through `/api/book-info`, including the free-page threshold and future purchase URL.
- Keep `/api/book.pdf` protected and return a clear not-unlocked response in demo mode; the eventual Supabase provider will replace this handler with entitlement verification and signed private storage access.
- Use PDF.js and StPageFlip from pinned CDN URLs, following the supplied sample's working reader foundation.
- Add a motion-led landing page, full-screen single-purpose reader, gesture-first page turning and zoom, progress indicator, end-of-preview overlay, gentle purchase CTA, watermark overlay, visibility-change cover, print suppression, and shortcut deterrents.
- Use safe server logs with event names and numeric metadata only; never log signed URLs, tokens, book text, or personal/payment data.

## Project structure

```text
quietpages/
├── books/
│   ├── sample-book.pdf              # generated 64-page demo, kept server-side
│   ├── sample-book-preview.pdf      # generated 50-page preview, served by API
│   └── README.md                    # Supabase migration notes
├── public/
│   ├── index.html                   # landing page + reader UI + client logic
│   ├── sw.js                        # lightweight PWA cache
│   ├── manifest.webmanifest         # install metadata
│   └── manus-routes.json            # route declarations for Webdev
├── server.js                        # API, protected book boundary, safe logging
├── package.json                     # pinned Node toolchain and dependencies
├── pnpm-workspace.yaml              # pnpm 11 lifecycle policy
├── plan.md
└── TODO.md
```

## Design direction

Three possible styles were considered:

- **Midnight Margins** (0.08): cinematic dark editorial surfaces with warm paper highlights and restrained copper details.
- **Sunlit Folio** (0.06): tactile parchment neutrals, moss-green accents, and generous printed-book whitespace.
- **Ultraviolet Chapter** (0.05): midnight violet, soft lavender, and luminous cream for a more contemporary digital identity.

Chosen direction: **Midnight Margins**.

- **Design movement:** late-night literary journal meets boutique bookshop window.
- **Core principles:** quiet confidence, tactile reading focus, generous pacing, and warmth at the conversion moment.
- **Color philosophy:** ink-black and graphite make the reader feel sheltered; parchment and copper signal the physical book and make the purchase invitation feel human rather than transactional.
- **Layout paradigm:** an asymmetrical editorial composition with a floating cover on the left and a narrative column on the right; the reader switches to a full-viewport single-purpose stage with controls floating over the book.
- **Signature elements:** copper hairline rules, oversized serif chapter numerals, and a faint bookplate-like watermark.
- **Interaction philosophy:** the landing page invites motion and discovery; the reader gets out of the way so swipes, pinch zoom, wheel zoom, keyboard arrows, and a few tactile floating controls do the work.
- **Animation:** GSAP-powered staged hero reveal, cover parallax, horizontal text rail movement, and purchase-card reveal; the reading surface keeps ambient particles and restrained page-turn feedback.
- **Typography system:** DM Serif Display for display moments, Inter for controls and metadata, and Georgia fallback for resilience.
- **Brand essence:** a private reading room for a book you want to stay with; intimate, literary, trustworthy.
- **Brand voice:** warm and invitational, never urgent. Example lines: “Begin with the first 50 pages.” and “If the story has found you, the rest is waiting.”
- **Wordmark & logo:** a small open-book glyph built from two copper arcs beside the QUIET PAGES wordmark.
- **Signature brand color:** burnished copper `#C78962`.

## Material constraints

The current demo is intentionally self-contained and does not require Supabase keys. The server uses a provider boundary and a protected full-book route so the later migration can use Supabase private storage, signed URLs, and entitlement checks. Screenshot protection is implemented as a practical deterrent, not an absolute guarantee; the UI communicates this through watermarking rather than promising impossible prevention.

## Runtime and serving

The managed runtime listens on port 3000 and runs `pnpm start` from the project root. The server listens on `0.0.0.0`, serves `public/`, and keeps `/api/*` before the SPA fallback. The project is configured for managed server support; database remains off for this sample-only stage.
