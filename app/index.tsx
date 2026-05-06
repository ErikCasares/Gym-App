import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeContext';

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('seen_welcome');
        if (seen === 'true') {
          // si ya lo vio, ir directo a las tabs
          router.replace('/(tabs)');
          return;
        }
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const entrar = async () => {
    try {
      await AsyncStorage.setItem('seen_welcome', 'true');
    } catch (e) {
      /* ignore */
    }
    router.replace('/(tabs)');
  };

  if (loading) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.card}>
        <Image
          source={require('../assets/hero.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Gym‑App</Text>
        <Text style={[styles.lead, { color: theme.muted }]}>
          Crea rutinas, lleva historial y entrena con temporizador. Empezá ahora.
        </Text>

        <TouchableOpacity
          onPress={entrar}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Entrar a Mis rutinas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/web/landing')}
          style={[styles.link, { borderColor: theme.border }]}
        >
          <Text style={{ color: theme.text }}>Ver landing / más información</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { alignItems: 'center', padding: 24, borderRadius: 16 },
  image: { width: 160, height: 160, marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  lead: { fontSize: 14, textAlign: 'center', marginBottom: 18 },
  button: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, marginBottom: 12 },
  link: { padding: 12, borderRadius: 10, borderWidth: 1, paddingHorizontal: 16 }
});