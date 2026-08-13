import { json, serverErr, requireAuth, clearJWTCookie, dbRun } from './_shared.js';

export async function onRequestDelete(context) {
  const { request, env } = context;
  const reqId = crypto.randomUUID();
  try {
    const auth = await requireAuth(request, env);
    if (!auth.user) return json({ error: '未登录' }, 401);

    const uid = auth.user.id;
    await dbRun(env, 'DELETE FROM magic_tokens WHERE user_id = ?', [uid]);
    await dbRun(env, 'DELETE FROM applications WHERE user_id = ?', [uid]);
    await dbRun(env, 'DELETE FROM users WHERE id = ?', [uid]);

    return json({ message: '账号已注销' }, 200, { 'Set-Cookie': clearJWTCookie() });
  } catch (e) {
    console.error('delete me error', reqId, e);
    return serverErr(reqId);
  }
}
