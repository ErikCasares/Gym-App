import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ThemedText({ style, children }) {
  const theme = useTheme();

  return (
    <Text
      style={[
        {
          color: theme.text
        },
        style
      ]}
    >
      {children}
    </Text>
  );
}