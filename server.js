const compression = require('compression');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const BOOK_DIR = path.join(__dirname, 'books');
const FULL_BOOK_PATH = path.join(BOOK_DIR, 'sample-book.pdf');
const PREVIEW_BOOK_PATH = path.join(BOOK_DIR, 'sample-book-preview.pdf');
const PUBLIC_DIR = path.join(__dirname, 'public');
const FREE_PREVIEW_PAGES = 50;
const TOTAL_BOOK_PAGES = 64;

const book = {
  title: process.env.BOOK_TITLE || 'The Shape of Quiet',
  author: process.env.BOOK_AUTHOR || 'Aether Press · Sample Edition',
  eyebrow: 'A short book about making room for what matters',
  dek: 'A gentle, reflective sample publication for the Quiet Pages reading room.',
  price: process.env.BOOK_PRICE || 'Complete edition · coming soon',
  purchaseUrl: process.env.BOOK_PURCHASE_URL || '#purchase',
  previewPages: FREE_PREVIEW_PAGES,
  totalPages: TOTAL_BOOK_PAGES,
  chapters: [
    { label: 'A door left open', page: 3, note: 'The beginning of attention' },
    { label: 'The useful pause', page: 13, note: 'On doing less, more deliberately' },
    { label: 'Small weather', page: 25, note: 'What a day can teach us' },
    { label: 'A room of one’s own', page: 37, note: 'Boundaries as an invitation' },
    { label: 'The shape of quiet', page: 47, note: 'A practice you can keep' }
  ]
};

app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '32kb' }));

function safeLog(level, event, details = {}) {
  const allowed = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === 'number' || typeof value === 'boolean') allowed[key] = value;
  }
  const payload = { event, ...allowed };
  if (IS_PRODUCTION) {
    console[level](JSON.stringify(payload));
  } else {
    console[level](`[quietpages] ${event}`, allowed);
  }
}

function sendPdf(res, filePath, downloadName) {
  if (!fs.existsSync(filePath)) {
    safeLog('error', 'pdf_missing');
    return res.status(404).json({ error: 'The sample book is not connected yet.' });
  }

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${downloadName}"`);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'private, no-store');
  return fs.createReadStream(filePath).pipe(res);
}

function hasVerifiedEntitlement(req) {
  // Production replacement point: verify the authenticated Supabase entitlement here.
  // The demo deliberately returns false so the complete book is never exposed by default.
  return req.get('x-quietpages-entitlement') === 'verified-demo-entitlement' && process.env.ALLOW_DEMO_UNLOCK === 'true';
}

app.get('/api/book-info', (req, res) => {
  safeLog('info', 'book_info_requested', { previewPages: book.previewPages });
  res.json({
    ...book,
    source: 'local-demo-preview',
    hasPreview: fs.existsSync(PREVIEW_BOOK_PATH),
    hasFullBook: false,
    fullBookRequiresEntitlement: true
  });
});

app.get('/api/book-preview.pdf', (req, res) => {
  safeLog('info', 'preview_requested', { previewPages: FREE_PREVIEW_PAGES });
  return sendPdf(res, PREVIEW_BOOK_PATH, 'quiet-pages-preview.pdf');
});

app.get('/api/book.pdf', (req, res) => {
  if (!hasVerifiedEntitlement(req)) {
    safeLog('warn', 'full_book_denied', { previewPages: FREE_PREVIEW_PAGES });
    return res.status(403).json({
      error: 'The complete edition is available after purchase verification.',
      code: 'ENTITLEMENT_REQUIRED'
    });
  }
  safeLog('info', 'full_book_served', { totalPages: TOTAL_BOOK_PAGES });
  return sendPdf(res, FULL_BOOK_PATH, 'quiet-pages-complete-edition.pdf');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'quietpages', previewReady: fs.existsSync(PREVIEW_BOOK_PATH) });
});

app.use('/books', (req, res) => {
  safeLog('warn', 'private_path_denied');
  res.status(404).json({ error: 'Not found' });
});

app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Service-Worker-Allowed', '/');
    }
    if (filePath.endsWith('manifest.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
    if (filePath.endsWith('manus-routes.json')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    safeLog('info', 'server_started', {
      port: PORT,
      production: IS_PRODUCTION,
      previewReady: fs.existsSync(PREVIEW_BOOK_PATH),
      fullBookPresent: fs.existsSync(FULL_BOOK_PATH)
    });
  });
}
