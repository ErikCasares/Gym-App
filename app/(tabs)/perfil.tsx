import { View, TextInput } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useTheme } from '../../src/theme/ThemeContext';
import ThemedText from '../../src/components/ThemedText';
import Button from '../../src/components/Button';

export default function Perfil() {
  const theme = useTheme();

  const STORAGE_KEY = 'perfil_usuario';

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [editando, setEditando] = useState(false);

  const guardar = async () => {
    const perfil = { nombre, edad, peso };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const perfil = JSON.parse(data);
        setNombre(perfil.nombre || '');
        setEdad(perfil.edad || '');
        setPeso(perfil.peso || '');
      }
    };

    cargarPerfil();
  }, []);

  return (
    <View style={{
      flex: 1,
      padding: 20,
      paddingTop: 70,
      backgroundColor: theme.background
    }}>

      <View style={{
        alignItems: 'center',
        marginBottom: 20
      }}>
        <View style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: theme.primary,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ThemedText style={{
            fontSize: 32,
            fontWeight: '700',
            color: theme.onPrimary
          }}>
            {nombre ? nombre.charAt(0).toUpperCase() : '?'}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={{
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20
      }}>
        Mi perfil
      </ThemedText>

      {/* MODO VISUAL */}
      {!editando ? (
        <View style={{
          backgroundColor: theme.card,
          padding: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border
        }}>

          <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
            Nombre: {nombre || '-'}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
            Edad: {edad || '-'}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, marginBottom: 20 }}>
            Peso: {peso || '-'} kg
          </ThemedText>

          <Button title="Editar perfil" onPress={() => setEditando(true)} />

        </View>
      ) : (

        /* MODO EDICIÓN */
        <View>

          <TextInput
            placeholder="Nombre"
            placeholderTextColor={theme.muted}
            value={nombre}
            onChangeText={setNombre}
            style={{
              backgroundColor: theme.card,
              padding: 14,
              borderRadius: 12,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 10
            }}
          />

          <TextInput
            placeholder="Edad"
            placeholderTextColor={theme.muted}
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
            style={{
              backgroundColor: theme.card,
              padding: 14,
              borderRadius: 12,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 10
            }}
          />

          <TextInput
            placeholder="Peso (kg)"
            placeholderTextColor={theme.muted}
            value={peso}
            onChangeText={setPeso}
            keyboardType="numeric"
            style={{
              backgroundColor: theme.card,
              padding: 14,
              borderRadius: 12,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 20
            }}
          />

          <Button
            title="Guardar cambios"
            onPress={() => {
              guardar();
              setEditando(false);
            }}
          />

        </View>
      )}

    </View>
  );
}