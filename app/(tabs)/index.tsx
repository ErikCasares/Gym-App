import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { obtenerRutinas, eliminarRutina } from '../../src/storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Home() {
  const router = useRouter();
  const [rutinas, setRutinas] = useState([]);
  const theme = useTheme();

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
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        padding: 20,
        paddingTop: 70
      }}
    >
      {/* TÍTULO */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 20,
          color: theme.text
        }}
      >
        Mis rutinas
      </Text>

      {/* LISTA */}
      <FlatList
        data={rutinas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',

              // sombra suave (modo oscuro friendly)
              borderWidth: 1,
              borderColor: theme.border
            }}
          >
            {/* NOMBRE */}
            <TouchableOpacity onPress={() => router.push(`/rutina/${index}`)}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.text
                }}
              >
                {item.nombre}
              </Text>
            </TouchableOpacity>

            {/* ELIMINAR */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Eliminar rutina',
                  '¿Seguro que querés borrarla?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Eliminar',
                      style: 'destructive',
                      onPress: async () => {
                        await eliminarRutina(index);
                        cargarRutinas();
                      }
                    }
                  ]
                );
              }}
            >
              <Text
                style={{
                  color: '#ff4d4d',
                  fontWeight: 'bold',
                  fontSize: 16
                }}
              >
                X
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        onPress={() => router.push('/crear')}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          backgroundColor: theme.primary,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',

          // sombra + borde para dark mode
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 30,
            fontWeight: '300'
          }}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}