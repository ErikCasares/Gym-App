import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ThemedView({ style, children }) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
          padding: 20
        },
        style
      ]}
    >
      {children}
    </View>
  );
}