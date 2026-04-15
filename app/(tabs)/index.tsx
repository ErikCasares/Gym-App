import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerRutinas } from '../../src/storage';
import { eliminarRutina } from '../../src/storage';
import { Alert } from 'react-native'; // arriba del archivo
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';



export default function Home() {
  const router = useRouter();
  const [rutinas, setRutinas] = useState([]);

  const cargarRutinas = async () => {
    const data = await obtenerRutinas();
    setRutinas(data);
  };

  useFocusEffect(
    useCallback(() => {
      cargarRutinas();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 70 }}>
      
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        💪 Mis Rutinas
      </Text>

      <FlatList
        data={rutinas}
        keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={{
              backgroundColor: '#fff',
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
    
            <TouchableOpacity onPress={() => router.push(`/rutina/${index}`)}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                {item.nombre}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
            
            onPress={() => {
              Alert.alert(
                "Eliminar rutina",
                "¿Seguro que querés borrarla?",
                [
                  { text: "Cancelar" },
                  {
                    text: "Eliminar",
                    onPress: async () => {
                      await eliminarRutina(index);
                      cargarRutinas();
                    }
                  }
                ]
              );
            }}
           >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>

          </View>
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