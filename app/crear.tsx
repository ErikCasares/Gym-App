import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { guardarRutina } from '../src/storage';
import { useRouter } from 'expo-router';

export default function Crear() {
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  const guardar = async () => {
    if (!nombre) return;

    await guardarRutina({ nombre });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20 }}>

      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>
        Nueva Rutina
      </Text>

      <TextInput
        placeholder="Ej: Pecho y tríceps"
        value={nombre}
        onChangeText={setNombre}
        style={{
          backgroundColor: '#fff',
          padding: 15,
          borderRadius: 10,
          fontSize: 16,
          marginBottom: 20
        }}
      />

      <TouchableOpacity
        onPress={guardar}
        style={{
          backgroundColor: '#000',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          Guardar rutina
        </Text>
      </TouchableOpacity>

    </View>
  );
}