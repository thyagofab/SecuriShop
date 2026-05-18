import { createContext, useContext } from 'react';

export type SecurityModeContextValue = {
  isSecureMode: boolean;
  toggleSecureMode: () => void;
  setSecureMode: (value: boolean) => void;
};

export const SecurityModeContext = createContext<SecurityModeContextValue | undefined>(undefined);

export const useSecurityMode = () => {
  const context = useContext(SecurityModeContext);
  if (!context) {
    throw new Error('useSecurityMode deve ser usado dentro de SecurityModeProvider.');
  }
  return context;
};
