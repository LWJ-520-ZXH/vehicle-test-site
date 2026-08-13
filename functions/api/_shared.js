// 车载测试学堂 · Pages Functions 共享工具库
// 设计依据: docs/backend-content-platform.md (VT-SITE-ARCH-001 V2.0)

const COOKIE_NAME = '__Host-jwt';
const JWT_ALG = { name: 'HMAC', hash: 'SHA-256' };

export const RESP_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...RESP_HEADERS, ...extra },
  });
}

export function err(message = '请求失败', status = 400) {
  return json({ error: message }, status);
}

export function serverErr(requestId) {
  return json({ error: '请求失败' }, 500, { 'X-Request-Id': requestId || 'unknown' });
}

export function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export function authEnabled(env) {
  const v = env.AUTH_ENABLED;
  return v === undefined || v === 'true' || v === true;
}

// --- crypto helpers ---
const encoder = new TextEncoder();

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

export async function hashToken(token) {
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return bufToHex(buf);
}

export function randomToken(n = 32) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return bufToHex(arr);
}

async function importKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), JWT_ALG, false, ['sign', 'verify']);
}

export async function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return `${data}.${base64url(String.fromCharCode(...new Uint8Array(sig)))}`;
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(fromBase64url(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    const data = `${parts[0]}.${parts[1]}`;
    const sig = fromBase64url(parts[2]);
    const sigBuf = Uint8Array.from(sig, c => c.charCodeAt(0));
    const key = await importKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, sigBuf, encoder.encode(data));
    return ok ? payload : null;
  } catch (e) {
    return null;
  }
}

export function setJWTCookie(token) {
  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=604800', // 7 days
  ].join('; ');
}

export function clearJWTCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function parseCookie(header) {
  const map = {};
  if (!header) return map;
  header.split(';').forEach(c => {
    const [k, ...rest] = c.trim().split('=');
    if (k) map[k] = rest.join('=');
  });
  return map;
}

// --- D1 helpers ---
export async function dbFirst(env, sql, params = []) {
  try {
    return await env.DB.prepare(sql).bind(...params).first();
  } catch (e) {
    console.error('dbFirst error', e.message, sql, params);
    throw e;
  }
}

export async function dbRun(env, sql, params = []) {
  try {
    return await env.DB.prepare(sql).bind(...params).run();
  } catch (e) {
    console.error('dbRun error', e.message, sql, params);
    throw e;
  }
}

export async function dbAll(env, sql, params = []) {
  try {
    return await env.DB.prepare(sql).bind(...params).all();
  } catch (e) {
    console.error('dbAll error', e.message, sql, params);
    throw e;
  }
}

// --- KV rate limit (best-effort, eventual consistency) ---
export async function checkRateLimit(env, key, limit, windowSeconds) {
  if (!env.KV) return { ok: true }; // no KV = no limit
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSeconds);
  const kvKey = `rl:${key}:${bucket}`;
  try {
    const val = await env.KV.get(kvKey);
    const count = val ? parseInt(val, 10) : 0;
    if (count >= limit) return { ok: false, retryAfter: (bucket + 1) * windowSeconds - now };
    await env.KV.put(kvKey, String(count + 1), { expirationTtl: windowSeconds });
    return { ok: true };
  } catch (e) {
    console.error('rate limit error', e.message);
    return { ok: true }; // fail open
  }
}

// --- auth context ---
export async function requireAuth(request, env) {
  if (!authEnabled(env)) return { anonymous: true, user: null };
  const cookie = parseCookie(request.headers.get('Cookie'));
  const token = cookie[COOKIE_NAME];
  if (!token) return { anonymous: true, user: null, missing: true };
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return { anonymous: true, user: null, invalid: true };
  const row = await dbFirst(env, 'SELECT id, email, status, token_version, deleted_at FROM users WHERE id = ?', [payload.sub]);
  if (!row || row.deleted_at) return { anonymous: true, user: null, invalid: true };
  if (row.token_version !== payload.ver) return { anonymous: true, user: null, invalid: true };
  return { user: row };
}

// --- notifications ---
export async function sendMagicLinkEmail(env, email, link) {
  if (!env.EMAIL_API_KEY || !env.EMAIL_FROM) {
    console.log('email not configured, magic link for', email, link);
    return { ok: false, reason: 'not_configured' };
  }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: email,
        subject: '车载测试学堂登录链接',
        html: `<p>点击以下链接登录（15 分钟内有效，仅可使用一次）：</p><p><a href="${link}">${link}</a></p>`,
      }),
    });
    if (!resp.ok) {
      console.error('resend error', resp.status, await resp.text());
      return { ok: false, reason: 'provider_error' };
    }
    return { ok: true };
  } catch (e) {
    console.error('send email exception', e);
    return { ok: false, reason: 'exception' };
  }
}

export async function sendOwnerEmail(env, subject, text) {
  if (!env.OWNER_EMAIL || !env.EMAIL_API_KEY || !env.EMAIL_FROM) {
    console.log('owner email not configured');
    return { ok: false, reason: 'not_configured' };
  }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: env.OWNER_EMAIL,
        subject,
        text,
      }),
    });
    if (!resp.ok) {
      console.error('owner email error', resp.status, await resp.text());
      return { ok: false, reason: 'provider_error' };
    }
    return { ok: true };
  } catch (e) {
    console.error('owner email exception', e);
    return { ok: false, reason: 'exception' };
  }
}

export async function sendFeishu(env, text) {
  if (!env.FEISHU_WEBHOOK) {
    console.log('feishu not configured:', text);
    return { ok: false, reason: 'not_configured' };
  }
  try {
    const resp = await fetch(env.FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
    });
    if (!resp.ok) {
      console.error('feishu error', resp.status, await resp.text());
      return { ok: false, reason: 'provider_error' };
    }
    return { ok: true };
  } catch (e) {
    console.error('feishu exception', e);
    return { ok: false, reason: 'exception' };
  }
}

// --- input validation ---
export function sanitizeNote(note) {
  if (!note) return '';
  const s = String(note).trim();
  if (s.length > 500) return s.slice(0, 500);
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
