import { json, serverErr, authEnabled, checkRateLimit, getClientIP, isValidEmail, dbFirst, dbRun, randomToken, hashToken, sendMagicLinkEmail } from '../../_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!authEnabled(env)) return json({ error: '后端未启用' }, 503);
  const reqId = crypto.randomUUID();
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      // 统一响应，防止枚举
      return json({ message: '若邮箱有效，登录链接已发送' });
    }

    const ip = getClientIP(request);
    const rl1 = await checkRateLimit(env, `ip:${ip}:auth`, 20, 3600);
    if (!rl1.ok) return json({ error: '请求过于频繁' }, 429, { 'Retry-After': String(rl1.retryAfter) });
    const rl2 = await checkRateLimit(env, `email:${email}:auth`, 5, 600);
    if (!rl2.ok) return json({ error: '请求过于频繁' }, 429, { 'Retry-After': String(rl2.retryAfter) });

    const now = Math.floor(Date.now() / 1000);

    // 不存在则创建用户
    let user = await dbFirst(env, 'SELECT id, status, token_version FROM users WHERE email = ?', [email]);
    if (!user) {
      const res = await dbRun(env, 'INSERT INTO users (email, status, token_version, created_at) VALUES (?, ?, ?, ?)', [email, 'registered', 0, now]);
      user = { id: res.meta?.last_row_id || res.meta?.lastRowId || null, status: 'registered' };
      if (!user.id) {
        const row = await dbFirst(env, 'SELECT id FROM users WHERE email = ?', [email]);
        user.id = row.id;
      }
    }

    const token = randomToken();
    const tokenHash = await hashToken(token);
    const expires = now + 15 * 60; // 15 分钟
    await dbRun(env, 'INSERT INTO magic_tokens (user_id, token_hash, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)', [user.id, tokenHash, 'register', expires, now]);

    const link = `${new URL(request.url).origin}/api/auth/verify?token=${token}&purpose=register`;
    await sendMagicLinkEmail(env, email, link);

    return json({ message: '若邮箱有效，登录链接已发送' });
  } catch (e) {
    console.error('register error', reqId, e);
    return serverErr(reqId);
  }
}
