'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

// Define the shape of your context
interface AppContextType {
  locale: string;
  setLocale: (locale: string) => void;
  pathname: string;
  setPathname: (pathname: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export type Locale = string;

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state
  const [locale, setLocale] = useState('en');
  const [pathname, setPathname] = useState('/');

  const value = {
    locale,
    setLocale,
    pathname,
    setPathname
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
