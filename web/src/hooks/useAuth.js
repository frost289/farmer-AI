import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { LanguageContext } from '../context/LanguageContext.jsx';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
