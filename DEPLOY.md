# Deploy Quiet Pages on Vercel

1. Push this folder to a GitHub repo (or run `npx vercel` in it).
2. In Vercel, choose Add New > Project and import the repo. Leave the build settings as they are; `vercel.json` controls them.
3. Add the variables from `.env.example` under Settings > Environment Variables (BOOK_PURCHASE_URL turns on the purchase buttons).
4. Deploy. Open `/` for the landing page and `/read` for the reader. `/api/health` should return `{"ok":true,...}`.

Run locally: `pnpm install && pnpm start`, then open http://localhost:3000.

Replacing the sample book: put your full PDF in `books/` and the first 50 pages as the preview PDF, then update the two file names and page counts at the top of `server.js`.

Limit to know: a Vercel function response is capped at about 4.5 MB. Keep the preview PDF under that, or serve it from Supabase Storage or Vercel Blob.
