import { API_BASE } from '@/lib/config';

// Ponytail: auto-attach wallet header from session
function getWalletAddress(): string | null {
  try {
    const saved = sessionStorage.getItem('kb_auth');
    return saved ? JSON.parse(saved).address : null;
  } catch { return null; }
}

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const address = getWalletAddress();
  const headers = new Headers(init?.headers);
  if (address) headers.set('X-Wallet-Address', address);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
