import { json, serverErr, authEnabled, requireAuth } from '../../_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!authEnabled(env)) return json({ error: '后端未启用' }, 503);
  const reqId = crypto.randomUUID();
  try {
    const auth = await requireAuth(request, env);
    if (!auth.user) return json({ error: '未登录' }, 401);
    return json({ email: auth.user.email, status: auth.user.status });
  } catch (e) {
    console.error('me error', reqId, e);
    return serverErr(reqId);
  }
}
