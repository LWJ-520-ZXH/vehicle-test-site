import { json, err, serverErr, authEnabled, dbFirst, dbRun, signJWT, setJWTCookie } from '../../_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!authEnabled(env)) return json({ error: '后端未启用' }, 503);
  const reqId = crypto.randomUUID();
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const purpose = url.searchParams.get('purpose') || 'login';
    if (!token) return err('请求失败', 400);

    const now = Math.floor(Date.now() / 1000);
    // token_hash 匹配 + 未过期 + used_at 为 NULL
    const row = await dbFirst(
      env,
      'SELECT id, user_id, expires_at, used_at FROM magic_tokens WHERE token_hash = ? AND purpose = ? AND expires_at > ?',
      [await hashToken(token), purpose, now]
    );
    if (!row) return err('链接已过期或无效', 400);
    if (row.used_at) return err('链接已使用', 400);

    // 原子置 used_at；影响行数 0 说明并发/已使用
    const upd = await dbRun(env, 'UPDATE magic_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL', [now, row.id]);
    if (upd.meta?.changes === 0) return err('链接已使用', 400);

    const user = await dbFirst(env, 'SELECT id, email, status, token_version FROM users WHERE id = ? AND deleted_at IS NULL', [row.user_id]);
    if (!user) return err('请求失败', 400);

    await dbRun(env, 'UPDATE users SET last_login = ? WHERE id = ?', [now, user.id]);

    const payload = {
      sub: user.id,
      ver: user.token_version,
      iat: now,
      exp: now + 7 * 24 * 3600, // 7 天
    };
    const jwt = await signJWT(payload, env.JWT_SECRET);

    return json({ email: user.email, status: user.status }, 200, {
      'Set-Cookie': setJWTCookie(jwt),
    });
  } catch (e) {
    console.error('verify error', reqId, e);
    return serverErr(reqId);
  }
}
