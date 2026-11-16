import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { clearSession, getSession, setSession } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession().user ?? null);
  const [loading, setLoading] = useState(() => Boolean(getSession().accessToken));

  const reset = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Restore the session on page load.
  useEffect(() => {
    if (!getSession().accessToken) return;
    authService
      .getMe()
      .then((me) => {
        setSession({ ...getSession(), user: me });
        setUser(me);
      })
      .catch(reset)
      .finally(() => setLoading(false));
  }, [reset]);

  // The api client fires this when the refresh token is rejected.
  useEffect(() => {
    window.addEventListener('farmai:logout', reset);
    return () => window.removeEventListener('farmai:logout', reset);
  }, [reset]);

  const startSession = useCallback((data) => {
    setSession({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user });
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (body) => startSession(await authService.login(body)), [startSession]);
  const register = useCallback(
    async (body) => startSession(await authService.register(body)),
    [startSession],
  );

  const logout = useCallback(async () => {
    const { refreshToken } = getSession();
    if (refreshToken) await authService.logout(refreshToken).catch(() => {});
    reset();
  }, [reset]);

  const refreshUser = useCallback(async () => {
    const me = await authService.getMe();
    setSession({ ...getSession(), user: me });
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
