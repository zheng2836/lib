import { verifySession, type Env } from '../_utils';

// GET /api/gh-token — 返回 GitHub Token 给已认证的前端
export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!(await verifySession(context.request, context.env.ADMIN_PASSWORD))) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ token: context.env.GITHUB_TOKEN }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
