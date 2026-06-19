import { useState, useEffect, useCallback } from 'react';
import { checkAuth, login } from '../api/client';

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth()
      .then(setAuthed)
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  const doLogin = useCallback(async (password: string) => {
    const res = await login(password);
    if (res.ok) {
      setAuthed(true);
      return true;
    }
    return false;
  }, []);

  return { authed, loading, doLogin };
}
