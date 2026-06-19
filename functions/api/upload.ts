import { verifySession, type Env } from '../_utils';

// POST /api/upload — 接收前端已编码的 base64，直接转发到 GitHub
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!(await verifySession(context.request, context.env.ADMIN_PASSWORD))) {
    return json({ ok: false, error: '未登录' }, 401);
  }

  try {
    const { base64, ext, title, author, description, fileSize } =
      await context.request.json() as {
        base64: string; ext: string; title: string;
        author: string; description: string; fileSize: number;
      };

    if (!base64 || !title) {
      return json({ ok: false, error: '缺少文件或书名' }, 400);
    }
    if (ext !== 'epub' && ext !== 'pdf') {
      return json({ ok: false, error: '只支持 epub/pdf 格式' }, 400);
    }

    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = context.env;
    const ghBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
    const ghHeaders = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const id = crypto.randomUUID().slice(0, 8);
    const safeName = title.replace(/[^\w\u4e00-\u9fff]/g, '-').toLowerCase();
    const filename = `${safeName}-${id}.${ext}`;
    const filePath = `books/${filename}`;

    // 直接转发 base64 到 GitHub（几乎不消耗 Worker CPU）
    const uploadRes = await fetch(`${ghBase}/contents/${filePath}`, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `添加书籍: ${title}`,
        content: base64,
      }),
    });

    if (!uploadRes.ok) {
      // 读取 GitHub 错误详情
      let ghErr = '';
      try { ghErr = await uploadRes.text(); } catch {}
      return json({ ok: false, error: `GitHub ${uploadRes.status}: ${ghErr.slice(0, 500)}` }, 500);
    }
    // 丢弃大响应体
    await uploadRes.body?.cancel();

    // 读取并更新 books.json
    const metaRes = await fetch(`${ghBase}/contents/books.json`, { headers: ghHeaders });
    let books: any[] = [];
    let sha: string | undefined;

    if (metaRes.ok) {
      const meta = await metaRes.json() as any;
      sha = meta.sha;
      const content = atob(meta.content.replace(/\n/g, ''));
      try { books = JSON.parse(content); } catch { books = []; }
    }

    const newBook = {
      id, title,
      author: author || '',
      description: description || '',
      format: ext,
      filename,
      fileSize: fileSize || 0,
      createdAt: new Date().toISOString(),
    };
    books.push(newBook);

    const metaBody = btoa(unescape(encodeURIComponent(JSON.stringify(books, null, 2))));
    const updateRes = await fetch(`${ghBase}/contents/books.json`, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `更新书籍列表: 添加《${title}》`,
        content: metaBody,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!updateRes.ok) {
      return json({ ok: false, error: '更新 books.json 失败' }, 500);
    }

    return json({ ok: true, book: newBook });
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
