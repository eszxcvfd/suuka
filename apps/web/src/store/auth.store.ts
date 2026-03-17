import { useMemo, useState } from 'react';

export interface SessionUser {
  email: string;
  displayName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export function useAuthStore(): AuthState {
  const [user, setUser] = useState<SessionUser | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      async signIn(email: string, password: string): Promise<void> {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        setUser({ email, displayName: email.split('@')[0] ?? email });
      },
      signOut(): void {
        setUser(null);
      },
    }),
    [user],
  );

  return value;
}
