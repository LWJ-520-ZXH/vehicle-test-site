import { json, serverErr, authEnabled, checkRateLimit, getClientIP, isValidEmail, dbFirst, dbRun, randomToken, hashToken, sendMagicLinkEmail } from '../../_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!authEnabled(env)) return json({ error: '后端未启用' }, 503);
  const reqId = crypto.randomUUID();
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return json({ message: '若邮箱有效，登录链接已发送' });
    }

    const ip = getClientIP(request);
    const rl1 = await checkRateLimit(env, `ip:${ip}:auth`, 20, 3600);
    if (!rl1.ok) return json({ error: '请求过于频繁' }, 429, { 'Retry-After': String(rl1.retryAfter) });
    const rl2 = await checkRateLimit(env, `email:${email}:auth`, 5, 600);
    if (!rl2.ok) return json({ error: '请求过于频繁' }, 429, { 'Retry-After': String(rl2.retryAfter) });

    const now = Math.floor(Date.now() / 1000);
    const user = await dbFirst(env, 'SELECT id, status, deleted_at FROM users WHERE email = ?', [email]);
    if (!user || user.deleted_at) {
      // 统一响应，不暴露是否注册
      return json({ message: '若邮箱有效，登录链接已发送' });
    }

    const token = randomToken();
    const tokenHash = await hashToken(token);
    const expires = now + 15 * 60;
    await dbRun(env, 'INSERT INTO magic_tokens (user_id, token_hash, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)', [user.id, tokenHash, 'login', expires, now]);

    const link = `${new URL(request.url).origin}/api/auth/verify?token=${token}&purpose=login`;
    const mail = await sendMagicLinkEmail(env, email, link);

    const resp = { message: '若邮箱有效，登录链接已发送' };
    if (mail && !mail.ok && mail.reason === 'not_configured') resp.dev_magic_link = link;
    return json(resp);
  } catch (e) {
    console.error('login error', reqId, e);
    return serverErr(reqId);
  }
}
