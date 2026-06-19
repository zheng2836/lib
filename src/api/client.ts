const API = '/api';

// GitHub 配置（从构建时注入或 Worker 环境变量获取）
const GH_OWNER = 'zheng2836';
const GH_REPO = 'lib';
const GH_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;

export async function login(password: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.json();
}

export async function checkAuth(): Promise<boolean> {
  const res = await fetch(`${API}/auth/login`, { method: 'GET' });
  const data = await res.json();
  return data.authenticated === true;
}

// 获取 GitHub Token（Worker 返回，不暴露在前端代码中）
let _ghToken = '';
async function getGhToken(): Promise<string> {
  if (_ghToken) return _ghToken;
  const res = await fetch(`${API}/gh-token`);
  const data = await res.json();
  if (!data.token) throw new Error('无法获取 GitHub Token');
  _ghToken = data.token;
  return _ghToken;
}

function ghHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

// 浏览器端文件转 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadBook(
  file: File,
  title: string,
  author: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = await getGhToken();
    const base64 = await fileToBase64(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const id = crypto.randomUUID().slice(0, 8);
    const safeName = title.replace(/[^\w\u4e00-\u9fff]/g, '-').toLowerCase();
    const filename = `${safeName}-${id}.${ext}`;

    // 直接从浏览器调用 GitHub API 上传文件
    const uploadRes = await fetch(`${GH_API}/contents/books/${filename}`, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({
        message: `添加书籍: ${title}`,
        content: base64,
      }),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return { ok: false, error: `GitHub 文件上传失败 (${uploadRes.status}): ${err.slice(0, 300)}` };
    }

    // 读取当前 books.json
    let books: any[] = [];
    let sha: string | undefined;
    const metaRes = await fetch(`${GH_API}/contents/books.json`, { headers: ghHeaders(token) });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      sha = meta.sha;
      try { books = JSON.parse(atob(meta.content.replace(/\n/g, ''))); } catch { books = []; }
    }

    const newBook = {
      id, title, author: author || '', description: description || '',
      format: ext, filename, fileSize: file.size,
      createdAt: new Date().toISOString(),
    };
    books.push(newBook);

    // 更新 books.json
    const metaBody = btoa(unescape(encodeURIComponent(JSON.stringify(books, null, 2))));
    const updateRes = await fetch(`${GH_API}/contents/books.json`, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({
        message: `更新书籍列表: 添加《${title}》`,
        content: metaBody,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!updateRes.ok) {
      return { ok: false, error: '更新 books.json 失败' };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || '上传出错' };
  }
}

export async function deleteBook(
  filename: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = await getGhToken();

    // 删除文件
    const fileRes = await fetch(`${GH_API}/contents/books/${filename}`, { headers: ghHeaders(token) });
    if (fileRes.ok) {
      const fileMeta = await fileRes.json();
      await fetch(`${GH_API}/contents/books/${filename}`, {
        method: 'DELETE',
        headers: ghHeaders(token),
        body: JSON.stringify({ message: `删除书籍: ${filename}`, sha: fileMeta.sha }),
      });
    }

    // 更新 books.json
    const metaRes = await fetch(`${GH_API}/contents/books.json`, { headers: ghHeaders(token) });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      let books: any[] = [];
      try { books = JSON.parse(atob(meta.content.replace(/\n/g, ''))); } catch { books = []; }
      books = books.filter(b => b.filename !== filename);
      const metaBody = btoa(unescape(encodeURIComponent(JSON.stringify(books, null, 2))));
      await fetch(`${GH_API}/contents/books.json`, {
        method: 'PUT',
        headers: ghHeaders(token),
        body: JSON.stringify({
          message: `更新书籍列表: 删除 ${filename}`,
          content: metaBody,
          sha: meta.sha,
        }),
      });
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || '删除出错' };
  }
}
