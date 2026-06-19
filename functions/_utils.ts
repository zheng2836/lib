// HMAC 签名认证工具

const encoder = new TextEncoder();

async function createHmac(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export async function verifySession(request: Request, secret: string): Promise<boolean> {
  const token = getSessionToken(request);
  if (!token) return false;
  try {
    const [exp, sig] = token.split('.');
    if (Date.now() > Number(exp)) return false;
    const expected = await createHmac(secret, exp);
    return sig === expected;
  } catch {
    return false;
  }
}

export async function createSession(secret: string): Promise<string> {
  const exp = Date.now() + 86400000; // 24h
  const sig = await createHmac(secret, String(exp));
  return `${exp}.${sig}`;
}

export function sessionCookie(token: string): string {
  return `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

export interface Env {
  ADMIN_PASSWORD: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
}
