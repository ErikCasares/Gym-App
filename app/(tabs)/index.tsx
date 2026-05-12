import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Inicio() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image
          source={require('../../assets/hero.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: theme.text }]}>Gym‑App</Text>
        <Text style={[styles.lead, { color: theme.muted }]}>
          Crea rutinas, registra tus sesiones y entrena con temporizador.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/')}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Mis rutinas</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/perfil')}
            style={[styles.button, { borderColor: theme.border }]}
          >
            <Text style={{ color: theme.text }}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/web/landing')}
            style={[styles.button, { borderColor: theme.border }]}
          >
            <Text style={{ color: theme.text }}>Más info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1 },
  image: { width: 140, height: 140, marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  lead: { fontSize: 14, textAlign: 'center', marginBottom: 18 },
  primaryButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, marginBottom: 12 },
  button: { padding: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, marginHorizontal: 6 },
  row: { flexDirection: 'row', alignItems: 'center' }
});