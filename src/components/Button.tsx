import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Button({ title, onPress }) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.primary,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center'
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}