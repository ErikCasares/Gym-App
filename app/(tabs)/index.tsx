import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { obtenerRutinas, eliminarRutina } from '../../src/storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { RUTINAS as RUTINAS_PREARMADAS } from '../../src/rutinasBase';
import { usarPlantilla, guardarRutina } from '../../src/storage';


export default function Home() {
  const router = useRouter();
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [modoPrearmada, setModoPrearmada] = useState(false);
  const theme = useTheme();

  const translateY = useState(new Animated.Value(0))[0];
  useEffect(() => {
  if (visible) {
    translateY.setValue(0);
  }
}, [visible]);
  const headerPanEnabled = useRef(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return headerPanEnabled.current && gestureState.dy > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120 || gestureState.vy > 1.2) {
        setVisible(false);
        translateY.setValue(0);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    }
  });

  const crearRutina = async () => {
    if (!nombre) return;
    const { guardarRutina } = require('../../src/storage');
    await guardarRutina({ nombre });
    setNombre('');
    setVisible(false);
    cargarRutinas();
  };

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
          <TouchableOpacity
            onPress={() => router.push(`/rutina/${index}`)}
            style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border
            }}
          >
            {/* NOMBRE */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.text,
                flex: 1
              }}
            >
              {item.nombre}
            </Text>

            {/* ELIMINAR */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
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
              <Text style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: 16 }}>
                X
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        onPress={() => {
          setModoPrearmada(false);
          translateY.setValue(0);
          setVisible(true);
        }}
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

      {/* BOTÓN PREARMADAS */}
      <TouchableOpacity
        onPress={() => {
          setModoPrearmada(true);
          setNombre('');
          translateY.setValue(0);
          setVisible(true);
        }}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 100,
          backgroundColor: theme.card,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 22,
            fontWeight: '600'
          }}
        >
          ★
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end'
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                backgroundColor: theme.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                maxHeight: '80%',
                transform: [{ translateY }]
              }}
            >

              {/* HANDLE */}
              <View
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => (headerPanEnabled.current = true)}
                onResponderRelease={() => (headerPanEnabled.current = false)}
                style={{
                  width: 40,
                  height: 5,
                  backgroundColor: theme.border,
                  borderRadius: 10,
                  alignSelf: 'center',
                  marginBottom: 10
                }}
              />

              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 15,
                color: theme.text
              }}>
                {modoPrearmada ? 'Rutinas prearmadas' : 'Nueva rutina'}
              </Text>

              {modoPrearmada && (
                <FlatList
                  data={RUTINAS_PREARMADAS}
                  keyExtractor={(item) => item.id.toString()}
                  style={{ marginBottom: 15 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={async () => {
                        
                        await usarPlantilla(item);
                        setVisible(false);
                        cargarRutinas();
                      }}
                      style={{
                        backgroundColor: theme.background,
                        padding: 15,
                        borderRadius: 12,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: theme.border
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                        {item.nombre}
                      </Text>

                      <Text style={{ fontSize: 12, color: theme.muted, marginTop: 5 }}>
                        {item.ejercicios.length} ejercicios
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              {!modoPrearmada && (
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
              )}

              {!modoPrearmada && (
                <TouchableOpacity
                  onPress={crearRutina}
                  style={{
                    backgroundColor: theme.primary,
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>
                    Guardar
                  </Text>
                </TouchableOpacity>
              )}

            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}