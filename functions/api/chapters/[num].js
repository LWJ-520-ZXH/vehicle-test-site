import { json, err, serverErr, requireAuth, authEnabled, dbFirst } from '../../_shared.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const reqId = crypto.randomUUID();
  try {
    const num = parseInt(params.num, 10);
    if (!num) return err('请求失败', 400);

    const row = await dbFirst(env, 'SELECT access_level, content_json FROM chapters WHERE num = ?', [num]);
    if (!row) return err('章节不存在', 404);

    // 熔断模式：直接返回正文
    if (!authEnabled(env)) {
      return json(JSON.parse(row.content_json));
    }

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
