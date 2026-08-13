import { RESP_HEADERS } from './_shared.js';

export async function onRequest(context) {
  const { request, next } = context;
  const method = request.method;
  const isStateChanging = ['POST', 'DELETE', 'PUT', 'PATCH'].includes(method);

  // 纵深防御：所有状态变更请求必须带 X-Requested-With: fetch（同源 fetch 自动附加）
  if (isStateChanging && request.headers.get('X-Requested-With') !== 'fetch') {
    return new Response(JSON.stringify({ error: '拒绝访问' }), {
      status: 403,
      headers: { ...RESP_HEADERS },
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  Object.entries(RESP_HEADERS).forEach(([k, v]) => {
    if (k !== 'Cache-Control' || !headers.has('Cache-Control')) {
      headers.set(k, v);
    }
  });
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return new Response(response.body, { status: response.status, headers });
}
