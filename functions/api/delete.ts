import { verifySession, type Env } from '../_utils';

// POST /api/delete — 删除书籍
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!(await verifySession(context.request, context.env.ADMIN_PASSWORD))) {
    return json({ ok: false, error: '未登录' }, 401);
  }

  try {
    const { filename } = await context.request.json() as { filename: string };
    if (!filename) return json({ ok: false, error: '缺少文件名' }, 400);

    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = context.env;
    const ghBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
    const ghHeaders = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // 获取书籍文件 SHA（用于删除）
    const fileRes = await fetch(`${ghBase}/contents/books/${filename}`, {
      headers: ghHeaders,
    });
    if (fileRes.ok) {
      const fileMeta = await fileRes.json() as any;
      await fetch(`${ghBase}/contents/books/${filename}`, {
        method: 'DELETE',
        headers: ghHeaders,
        body: JSON.stringify({
          message: `删除书籍文件: ${filename}`,
          sha: fileMeta.sha,
        }),
      });
    }

    // 更新 books.json
    const metaRes = await fetch(`${ghBase}/contents/books.json`, {
      headers: ghHeaders,
    });

    if (metaRes.ok) {
      const meta = await metaRes.json() as any;
      const content = atob(meta.content.replace(/\n/g, ''));
      let books: any[] = [];
      try { books = JSON.parse(content); } catch { books = []; }

      books = books.filter(b => b.filename !== filename);
      const metaBody = btoa(unescape(encodeURIComponent(JSON.stringify(books, null, 2))));

      await fetch(`${ghBase}/contents/books.json`, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: `更新书籍列表: 删除 ${filename}`,
          content: metaBody,
          sha: meta.sha,
        }),
      });
    }

    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e.message || '未知错误' }, 500);
  }
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
