import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ENABLE_XSS_DEMO } from '../config/env';
import { SecurityModeContext } from './SecurityModeContext';

const STORAGE_KEY = 'xss_tcc_secure_mode';

export const SecurityModeProvider = ({ children }: { children: ReactNode }) => {
  const [isSecureMode, setIsSecureMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true' || stored === 'false') {
      return stored === 'true';
    }
    return !ENABLE_XSS_DEMO;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isSecureMode));
  }, [isSecureMode]);

  const toggleSecureMode = () => {
    setIsSecureMode((prev) => !prev);
  };

  const value = useMemo(
    () => ({ isSecureMode, toggleSecureMode, setSecureMode: setIsSecureMode }),
    [isSecureMode]
  );

  return <SecurityModeContext.Provider value={value}>{children}</SecurityModeContext.Provider>;
};
