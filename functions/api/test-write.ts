import { verifySession, type Env } from '../_utils';

// GET /api/test-write — 测试 Worker 能否写入 GitHub
export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!(await verifySession(context.request, context.env.ADMIN_PASSWORD))) {
    return new Response(JSON.stringify({ ok: false, error: '未登录' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = context.env;
  const ghBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
  const ghHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // 写入一个极小的测试文件
  const testContent = btoa('hello from worker ' + Date.now());
  const res = await fetch(`${ghBase}/contents/books/_worker-test.txt`, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message: 'Worker 写入测试',
      content: testContent,
    }),
  });

  const body = await res.text();
  return new Response(JSON.stringify({
    status: res.status,
    ok: res.ok,
    github_response: body.slice(0, 1000),
    env_check: {
      hasToken: !!GITHUB_TOKEN,
      tokenPrefix: GITHUB_TOKEN?.slice(0, 10),
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    }
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
