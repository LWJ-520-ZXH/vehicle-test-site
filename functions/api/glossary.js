import { json, serverErr, requireAuth, authEnabled, dbAll, serveStaticJSON } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const reqId = crypto.randomUUID();
  try {
    if (!authEnabled(env)) {
      const data = await serveStaticJSON(env, '/data/glossary.json');
      return data ? json({ glossary: data }) : serverErr(reqId);
    }

    const auth = await requireAuth(request, env);
    if (!auth.user) return json({ error: '请先登录' }, 401);

    const isApproved = auth.user.status === 'approved';
    const sql = isApproved
      ? 'SELECT content_json FROM glossary ORDER BY id'
      : 'SELECT content_json FROM glossary WHERE access_level = ? ORDER BY id';
    const params = isApproved ? [] : ['public'];
    const rows = await dbAll(env, sql, params);
    return json({ glossary: (rows.results || []).map(r => JSON.parse(r.content_json)) });
  } catch (e) {
    console.error('glossary error', reqId, e);
    return serverErr(reqId);
  }
}
