'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Locale = 'en' | 'zh';

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  pathname: string;
  setPathname: (p: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children?: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  // Default to root
  const [pathname, setPathname] = useState<string>('/');

  return (
    <AppContext.Provider value={{ locale, setLocale, pathname, setPathname }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
