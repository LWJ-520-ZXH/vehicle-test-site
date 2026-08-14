import { json, err, serverErr, requireAuth, authEnabled, dbFirst, serveStaticJSON } from '../../_shared.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const reqId = crypto.randomUUID();
  try {
    const num = parseInt(params.num, 10);
    if (!num) return err('请求失败', 400);

    // 熔断/休眠模式：直返静态章节正文（不依赖 D1）
    if (!authEnabled(env)) {
      const data = await serveStaticJSON(env, `/data/chapter-content/${String(num).padStart(2, '0')}.json`);
      return data ? json(data) : err('章节不存在', 404);
    }

    const row = await dbFirst(env, 'SELECT access_level, content_json FROM chapters WHERE num = ?', [num]);
    if (!row) return err('章节不存在', 404);


    const auth = await requireAuth(request, env);
    if (!auth.user) return json({ error: '请先登录' }, 401);

    if (row.access_level === 'public' && auth.user.status === 'registered') {
      return json(JSON.parse(row.content_json));
    }
    if (auth.user.status === 'approved') {
      return json(JSON.parse(row.content_json));
    }
    return json({ error: '权限不足，可申请开通' }, 403);
  } catch (e) {
    console.error('chapters error', reqId, e);
    return serverErr(reqId);
  }
}
