# Book storage

The generated `sample-book.pdf` is the complete 64-page demo source. `sample-book-preview.pdf` contains only the first 50 pages and is the only PDF served by the unauthenticated preview route.

For production, keep the complete book in a **private Supabase Storage bucket**. The intended migration is:

1. Set `SUPABASE_URL` and a server-only `SUPABASE_SERVICE_ROLE_KEY` through the Webdev secret flow; never expose the service-role key in browser code.
2. Replace the local file provider in `server.js` with a Supabase Storage download or short-lived signed URL created only after an entitlement check.
3. Store reader purchase entitlements in Supabase Postgres and verify the payment provider webhook server-side before unlocking the complete book.
4. Keep the public reader on the preview route and use `Cache-Control: private, no-store` for private book responses.

The sample intentionally keeps the full demo file outside `public/` and returns a protected response from `/api/book.pdf` until an entitlement provider is wired.
