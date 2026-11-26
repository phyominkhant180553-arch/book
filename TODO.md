# Quiet Pages — delivery outcomes

## Editorial landing page

- [ ] The site presents a premium landing page with a book-cover presentation, book title, author label, synopsis, chapter preview, and a clear “Begin free preview” CTA.
- [ ] The landing page explains that the first 50 pages are free and introduces the complete-book purchase option without aggressive sales language.
- [ ] The visual system feels premium, literary, calm, and trustworthy on desktop and mobile.

## Reading view and preview boundary

- [ ] The reader is a full-screen, comfortable long-form reading surface across desktop and mobile, without chapter tabs or unnecessary navigation panels.
- [ ] The reader loads the generated sample PDF and supports page turning through vertical/horizontal swipe, wheel/keyboard navigation, previous/next controls, pinch zoom, zoom buttons, and keyboard zoom shortcuts.
- [ ] Readers can access pages 1–50 for free, with progress shown as current page out of 50 free pages.
- [ ] When the reader reaches the end of page 50, a soft paywall appears with warm purchase messaging and a purchase CTA.
- [ ] The complete book is not exposed through the unauthenticated preview route; the protected full-book route is reserved for a future verified entitlement.

## Protection and observability

- [ ] The reader adds a subtle watermark and practical screenshot/printing deterrents without claiming that screenshots can be made impossible.
- [ ] Visibility changes cover the content until the reader returns, and print/save/context-menu shortcuts are intercepted where browsers allow.
- [ ] Production-safe logs include only allowlisted event names and non-sensitive numeric metadata; no book content, tokens, signed URLs, or payment data are logged.

## Supabase-ready boundary

- [ ] The server keeps private book delivery behind API routes so Supabase private Storage and entitlement checks can replace the local demo provider later.
- [ ] Book metadata and purchase URL are configuration-driven rather than hard-coded into reader behavior.

## Webdev delivery

- [ ] `/manus-routes.json` declares `/`, `/read`, and `/about` and is served as JSON.
- [ ] The managed development server is declared on port 3000 and responds successfully.
- [ ] The project passes the available source checks and is saved as a checkpoint on `origin/main`.
