import { json, serverErr, requireAuth, checkRateLimit, sanitizeNote, dbFirst, dbRun, sendFeishu, sendOwnerEmail } from './_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const reqId = crypto.randomUUID();
  try {
    const auth = await requireAuth(request, env);
    if (!auth.user) return json({ error: '请先登录' }, 401);

    const rl = await checkRateLimit(env, `user:${auth.user.id}:apply`, 5, 86400);
    if (!rl.ok) return json({ error: '申请过于频繁' }, 429, { 'Retry-After': String(rl.retryAfter) });

    if (auth.user.status === 'approved') {
      return json({ message: '您已拥有全部权限' });
    }

    const body = await request.json().catch(() => ({}));
    const note = sanitizeNote(body.note);

    const existing = await dbFirst(env, 'SELECT id FROM applications WHERE user_id = ? AND status = ?', [auth.user.id, 'pending']);
    if (existing) {
      return json({ message: '您的申请已在处理中' });
    }

    const now = Math.floor(Date.now() / 1000);
    await dbRun(env, 'INSERT INTO applications (user_id, email, note, status, created_at) VALUES (?, ?, ?, ?, ?)', [
      auth.user.id,
      auth.user.email,
      note,
      'pending',
      now,
    ]);

    const text = [
      '车载测试学堂权限申请',
      `邮箱：${auth.user.email}`,
      `备注：${note || '无'}`,
      `时间：${new Date(now * 1000).toLocaleString('zh-CN')}`,
      '请在 D1 中将该用户 status 改为 approved。',
    ].join('\n');

    await Promise.allSettled([
      sendFeishu(env, text),
      sendOwnerEmail(env, '车载测试学堂权限申请', text),
    ]);

    return json({ message: '申请已提交' });
  } catch (e) {
    console.error('apply error', reqId, e);
    return serverErr(reqId);
  }
}
