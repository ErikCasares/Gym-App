import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';

const colors = {
  light: {
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#111111',
    subtext: '#666666',
    primary: '#4caf50',
    border: '#e0e0e0',
    muted: '#999999',
    shadow: '#000000'
  },
  dark: {
    background: '#0f0f0f',     // fondo general
    card: '#1c1c1e',           // cards tipo iOS
    text: '#ffffff',
    subtext: '#a1a1a6',
    primary: '#4caf50',
    border: '#2c2c2e',
    muted: '#555555',
    shadow: '#000000',
    surface: '#888888ff'
  }
};

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};