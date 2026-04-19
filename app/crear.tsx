import { View, TextInput, Modal, Pressable } from 'react-native';
import { useState } from 'react';
import { guardarRutina } from '../src/storage';
import { useRouter } from 'expo-router';

import ThemedView from '../src/components/ThemedView';
import ThemedText from '../src/components/ThemedText';
import Button from '../src/components/Button';
import { useTheme } from '../src/theme/ThemeContext';

export default function Crear() {
  const [nombre, setNombre] = useState('');
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const guardar = async () => {
    if (!nombre) return;

    await guardarRutina({ nombre });
    setNombre('');
    setVisible(false);
    router.back();
  };

  return (
    <ThemedView style={{ justifyContent: 'center', alignItems: 'center' }}>

      <Button title="Crear rutina" onPress={() => setVisible(true)} />

      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: '90%',
              backgroundColor: theme.card,
              padding: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border
            }}
          >

            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 15
            }}>
              Nueva rutina
            </ThemedText>

            <TextInput
              placeholder="Ej: Pecho y tríceps"
              placeholderTextColor={theme.muted}
              value={nombre}
              onChangeText={setNombre}
              style={{
                backgroundColor: theme.background,
                padding: 14,
                borderRadius: 12,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 15
              }}
            />

            <Button title="Guardar" onPress={guardar} />

          </Pressable>
        </Pressable>
      </Modal>

    </ThemedView>
  );
}