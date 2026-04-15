import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerRutinas } from '../../src/storage';

export default function Home() {
  const router = useRouter();
  const [rutinas, setRutinas] = useState([]);

  const cargarRutinas = async () => {
    const data = await obtenerRutinas();
    setRutinas(data);
  };

  useEffect(() => {
    cargarRutinas();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 70 }}>
      
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        💪 Mis Rutinas
      </Text>

      <FlatList
        data={rutinas}
        keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => router.push(`/rutina/${index}`)}
              style={{
                backgroundColor: '#fff',
                padding: 15,
                borderRadius: 12,
                marginBottom: 10
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
)}
      />

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => router.push('/crear')}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          backgroundColor: '#000',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5
        }}
      >
        <Text style={{ color: '#fff', fontSize: 30}}>+</Text>
      </TouchableOpacity>
    </View>
  );
}