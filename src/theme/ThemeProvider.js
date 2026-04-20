import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';

const colors = {
  light: {
    background: '#CDD5DB',
    card: '#A8B5C4',
    text: '#071739',
    subtext: '#4B6382',
    primary: '#A68B66',
    border: '#4B6382',
    muted: '#A8B5C4',
    shadow: '#000000',
    surface: '#E3C390',
    success: '#4CAF50',
    danger: '#ff4d4d',
  },
  dark: {
    background: '#071739',
    card: '#4B6382',
    text: '#E3C390',
    subtext: '#A8B5C4',
    primary: '#E3C390',
    border: '#A68B66',
    muted: '#4B6382',
    shadow: '#000000',
    surface: '#CDD5DB',
    success: '#4CAF50',
    danger: '#ff4d4d',
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