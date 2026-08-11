/* ============================================================
   BIS Club Registration — Ultra-Lightweight Node.js Proxy Server
   ============================================================
   Features:
   - Uses zero third-party dependencies (pure Node.js native modules)
   - Parses .env configuration automatically
   - Handles CORS headers for web clients
   - Implements anti-bot honeypot protection
   - Safely forwards form submissions to Google Apps Script
   ============================================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ── 1. PARSE .ENV FILE ───────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

if (!APPS_SCRIPT_URL) {
  console.warn('⚠️ WARNING: APPS_SCRIPT_URL is not set in .env file!');
}

// ── 2. HELPER FUNCTIONS ──────────────────────────────────────────────
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
  });
  res.end(JSON.stringify(data));
}

// ── 3. HTTP SERVER ───────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health Check Endpoint
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    return sendJSON(res, 200, {
      status: 'online',
      message: 'BIS Club Proxy Server is running',
      timestamp: new Date().toISOString()
    });
  }

  // API Proxy Endpoint: POST /api/register
  if (req.method === 'POST' && url.pathname === '/api/register') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
      // Safety limit: 1MB payload max
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        let payload = {};
        if (body) {
          payload = JSON.parse(body);
        }

        // Honeypot anti-spam check (if bot field is populated)
        if (payload.hp_check || payload.bot_field) {
          console.warn('🤖 Spam bot detected and blocked.');
          return sendJSON(res, 200, {
            status: 'success',
            message: 'Registration received successfully.' // Subtle fake success to confuse bots
          });
        }

        if (!APPS_SCRIPT_URL) {
          return sendJSON(res, 500, {
            status: 'error',
            message: 'Server misconfiguration: APPS_SCRIPT_URL is missing.'
          });
        }

        console.log(`[${new Date().toLocaleTimeString()}] Proxying registration for: ${payload.fullName || 'Anonymous'}`);

        // Forward payload to Google Apps Script Web App
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });

        const contentType = response.headers.get('content-type') || '';
        let result = {};

        if (contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          result = { status: 'success', rawResponse: text };
        }

        return sendJSON(res, response.status || 200, result);

      } catch (err) {
        console.error('❌ Proxy Error:', err.message);
        return sendJSON(res, 500, {
          status: 'error',
          message: 'Failed to process registration proxy.',
          error: err.message
        });
      }
    });

    return;
  }

  // 404 Fallback
  return sendJSON(res, 404, { status: 'error', message: 'Endpoint not found.' });
});

// ── 4. START SERVER ──────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
🚀 BIS Club Ultra-Lite Proxy Server running!
📍 URL: http://localhost:${PORT}
🔗 Proxy Endpoint: http://localhost:${PORT}/api/register
  `);
});
