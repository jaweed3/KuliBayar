'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { API_BASE, CHAIN } from '@/lib/config';

interface AuthState {
  address: string | null;
  role: number | null; // 0=Kuli, 1=Kontraktor, null=none
  profileId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => void;
  setRole: (role: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialState(): AuthState {
  try {
    const saved = sessionStorage.getItem('kb_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isLoading: false };
    }
  } catch { /* ignore */ }
  return { address: null, role: null, profileId: null, isAuthenticated: false, isLoading: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const persist = (s: AuthState) => {
    sessionStorage.setItem('kb_auth', JSON.stringify(s));
  };

  const signIn = useCallback(async () => {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
    if (!accounts.length) throw new Error('No wallet connected');

    const address = accounts[0];
    setState(s => ({ ...s, isLoading: true }));

    try {
      // 1. Get nonce
      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const { nonce } = await nonceRes.json();

      // 2. Sign SIWE message with MetaMask
      const domain = window.location.host;
      const scheme = window.location.protocol === 'https:' ? 'https' : 'http';
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address,
        '',
        'Sign in to KuliBayar',
        '',
        `URI: ${scheme}://${domain}`,
        `Version: 1`,
        `Chain ID: ${CHAIN.id}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join('\n');

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      }) as string;

      // 3. Verify
      const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce, domain }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Verification failed');
      }

      const { role, profileId } = await verifyRes.json();
      const newState: AuthState = {
        address,
        role,
        profileId,
        isAuthenticated: true,
        isLoading: false,
      };
      setState(newState);
      persist(newState);
    } catch (e) {
      setState(s => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('kb_auth');
    setState({ address: null, role: null, profileId: null, isAuthenticated: false, isLoading: false });
  }, []);

  const setRole = useCallback((role: number) => {
    setState(s => {
      const next = { ...s, role };
      persist(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Helper: get headers for API calls
export function authHeaders(address: string | null): Record<string, string> {
  if (!address) return {};
  return { 'X-Wallet-Address': address };
}
