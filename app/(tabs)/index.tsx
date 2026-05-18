import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Inicio() {
  const router = useRouter();
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);

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
          onPress={() => router.push('/(tabs)/rutinas')}
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
            onPress={() => setShowModal(true)}
            style={[styles.button, { borderColor: theme.border }]}
          >
            <Text style={{ color: theme.text }}>Más info</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Acerca de Gym‑App</Text>
            <Text style={[styles.modalText, { color: theme.muted }]}>
              Gym‑App es una aplicación minimalista para crear y gestionar rutinas, registrar sesiones y controlar tiempos de entrenamiento.
              Diseñada para ser rápida y fácil de usar, permite crear rutinas personalizadas, llevar un historial de entrenamientos y utilizar temporizadores integrados.
              Versión 1.0 — desarrollada con React Native y Expo.
              Para sugerencias o contribuciones, visita el repositorio del proyecto.
            </Text>

            <Pressable
              onPress={() => setShowModal(false)}
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  row: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalView: { width: '85%', padding: 20, borderRadius: 12, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalText: { fontSize: 14, marginBottom: 18, textAlign: 'center' },
  closeButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'center' },
});