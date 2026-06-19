import { createSession, sessionCookie, verifySession, type Env } from '../../_utils';

// POST /api/auth/login — 登录
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { password } = await context.request.json() as { password: string };
  if (password !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = await createSession(context.env.ADMIN_PASSWORD);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(token),
    },
  });
};

// GET /api/auth/login — 检查登录状态
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const authed = await verifySession(context.request, context.env.ADMIN_PASSWORD);
  return new Response(JSON.stringify({ authenticated: authed }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
