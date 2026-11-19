import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { LanguageContext } from './LanguageContext.jsx';
import { clearSession, getSession, setSession } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { setLanguage } = useContext(LanguageContext);
  const [user, setUser] = useState(() => getSession().user ?? null);
  const [loading, setLoading] = useState(() => Boolean(getSession().accessToken));

  const reset = useCallback(() => {
    clearSession();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  // Restore the session and the saved language preference on page load.
  useEffect(() => {
    if (!getSession().accessToken) return;
    authService
      .getMe()
      .then((me) => {
        setSession({ ...getSession(), user: me });
        setUser(me);
        if (me.language) setLanguage(me.language);
      })
      .catch(reset)
      .finally(() => setLoading(false));
  }, [reset, setLanguage]);

  // The api client fires this when the refresh token is rejected.
  useEffect(() => {
    window.addEventListener('farmai:logout', reset);
    return () => window.removeEventListener('farmai:logout', reset);
  }, [reset]);

  const startSession = useCallback((data) => {
    setSession({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user });
    setUser(data.user);
    if (data.user?.language) setLanguage(data.user.language);
    return data.user;
  }, [setLanguage]);

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
    if (me.language) setLanguage(me.language);
  }, [setLanguage]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
