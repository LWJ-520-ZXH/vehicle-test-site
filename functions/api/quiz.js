import { json, serverErr, requireAuth, authEnabled, dbAll, serveAllQuizStatic } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const reqId = crypto.randomUUID();
  try {
    const url = new URL(request.url);
    const chapterNum = url.searchParams.get('chapterNum');

    // 熔断/休眠模式：直返静态题库（不依赖 D1）
    if (!authEnabled(env)) {
      const quiz = await serveAllQuizStatic(env, chapterNum ? parseInt(chapterNum, 10) : null);
      return json({ quiz });
    }

    const auth = await requireAuth(request, env);
    if (!auth.user || auth.user.status !== 'approved') {
      return json({ error: '权限不足' }, 403);
    }

    let sql = 'SELECT content_json FROM quiz';
    const params = [];
    if (chapterNum) {
      sql += ' WHERE chapter_num = ?';
      params.push(parseInt(chapterNum, 10));
    }
    const rows = await dbAll(env, sql, params);
    return json({ quiz: (rows.results || []).map(r => JSON.parse(r.content_json)) });
  } catch (e) {
    console.error('quiz error', reqId, e);
    return serverErr(reqId);
  }
}
