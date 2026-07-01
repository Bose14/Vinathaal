import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('appTheme') === 'dark');

  const toggleTheme = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem('appTheme', next ? 'dark' : 'light');
      return next;
    });

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
