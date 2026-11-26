const compression = require('compression');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const BOOK_DIR = path.join(__dirname, 'books');
const FULL_BOOK_PATH = path.join(BOOK_DIR, 'paing-book.pdf');
const PREVIEW_BOOK_PATH = path.join(BOOK_DIR, 'paing-book-preview.pdf');
const FULL_BOOK_PARTS = ['paing-book.pdf.part-01', 'paing-book.pdf.part-02', 'paing-book.pdf.part-03', 'paing-book.pdf.part-04'].map((name) => path.join(BOOK_DIR, name));
const PUBLIC_DIR = path.join(__dirname, 'public');
const FREE_PREVIEW_PAGES = 66;
const TOTAL_BOOK_PAGES = 99;

const book = {
  title: process.env.BOOK_TITLE || 'The Journey from the Cosmos to Consciousness',
  author: process.env.BOOK_AUTHOR || 'Paing',
  eyebrow: 'စကြဝဠာမှ အသိစိတ်အထိ စူးစမ်းရှာဖွေမှု',
  dek: 'ဒီစာအုပ်ဟာ “ငါတို့ ဘယ်ကလာတာလဲ?” ဆိုတဲ့ မေးခွန်းနဲ့ စတင်ပြီး မဟာပေါက်ကွဲမှုကနေ သက်ရှိဘဝ၊ လူသားနဲ့ “ငါ” လို့ခေါ်တဲ့ အတ္တဇာတ်လမ်းအထိ ခရီးဆက်သွားစေပါတယ်။',
  price: process.env.BOOK_PRICE || 'စာအုပ်အပြည့်အစုံ · မကြာမီ',
  purchaseUrl: process.env.BOOK_PURCHASE_URL || '#purchase',
  previewPages: FREE_PREVIEW_PAGES,
  totalPages: TOTAL_BOOK_PAGES,
  chapters: []
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
    return res.status(404).json({ error: 'The book file is not connected yet.' });
  }

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${downloadName}"`);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'private, no-store');
  return fs.createReadStream(filePath).pipe(res);
}

function ensureFullBook() {
  if (fs.existsSync(FULL_BOOK_PATH)) return true;
  if (!FULL_BOOK_PARTS.every((part) => fs.existsSync(part))) return false;
  fs.copyFileSync(FULL_BOOK_PARTS[0], FULL_BOOK_PATH);
  for (const part of FULL_BOOK_PARTS.slice(1)) fs.appendFileSync(FULL_BOOK_PATH, fs.readFileSync(part));
  return true;
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
    source: 'local-authentic-book',
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

const BOOK_ART_ASSETS = new Set(['cover.png', 'cosmos.jpg', 'earth.jpg', 'life.jpg', 'human-origins.jpg', 'brain.jpg', 'consciousness.jpg']);
app.get('/images/book/:asset', (req, res, next) => {
  if (!BOOK_ART_ASSETS.has(req.params.asset)) return next();
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(path.join(PUBLIC_DIR, 'images', 'book', req.params.asset));
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

app.listen(PORT, HOST, () => {
  ensureFullBook();
  safeLog('info', 'server_started', {
    port: PORT,
    production: IS_PRODUCTION,
    previewReady: fs.existsSync(PREVIEW_BOOK_PATH),
    fullBookPresent: fs.existsSync(FULL_BOOK_PATH)
  });
});
