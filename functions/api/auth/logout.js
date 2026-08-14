import { json, serverErr, authEnabled, requireAuth, clearJWTCookie, dbRun } from '../_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!authEnabled(env)) return json({ error: '后端未启用' }, 503);
  const reqId = crypto.randomUUID();
  try {
    const auth = await requireAuth(request, env);
    if (auth.user) {
      // 升 token_version 使该用户所有 JWT 立即失效
      await dbRun(env, 'UPDATE users SET token_version = token_version + 1 WHERE id = ?', [auth.user.id]);
    }
    return json({ message: '已退出' }, 200, { 'Set-Cookie': clearJWTCookie() });
  } catch (e) {
    console.error('logout error', reqId, e);
    return serverErr(reqId);
  }
}
