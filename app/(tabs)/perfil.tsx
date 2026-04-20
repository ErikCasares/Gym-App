import { View, TextInput, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useTheme } from '../../src/theme/ThemeContext';
import ThemedText from '../../src/components/ThemedText';
import Button from '../../src/components/Button';

export default function Perfil() {
  const theme = useTheme();

  const STORAGE_KEY = 'perfil_usuario';
  const OBJETIVO_KEY = 'objetivo_usuario';

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [editando, setEditando] = useState(false);
  const [mostrarObjetivos, setMostrarObjetivos] = useState(false);
  const [objetivo, setObjetivo] = useState('');
  const [mostrarEditar, setMostrarEditar] = useState(false);

  const OBJETIVOS = [
    'Ganar masa muscular',
    'Perder grasa',
    'Mantener peso'
  ];

  const guardar = async () => {
    const perfil = { nombre, edad, peso };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    await AsyncStorage.setItem(OBJETIVO_KEY, objetivo);
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
      const obj = await AsyncStorage.getItem(OBJETIVO_KEY);
      if (obj) setObjetivo(obj);
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
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6
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
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3
        }}>

          <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
            Nombre: {nombre || '-'}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
            Edad: {edad || '-'}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
            Peso: {peso || '-'} kg
          </ThemedText>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <View>
              <ThemedText style={{
                fontSize: 16,
                color: theme.muted
              }}>
                Objetivo
              </ThemedText>

              <ThemedText style={{
                fontSize: 18,
                fontWeight: '600',
                color: objetivo ? theme.text : theme.muted
              }}>
                {objetivo || 'No definido'}
              </ThemedText>
            </View>

            <Button
              title="Modificar"
              onPress={() => setMostrarObjetivos(true)}
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Button title="Modificar perfil" onPress={() => setMostrarEditar(true)} />
          </View>

        </View>
      ) : null}

      <Modal visible={mostrarEditar} transparent animationType="slide" statusBarTranslucent>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 20
          }}
          onPress={() => setMostrarEditar(false)}
        >
          <Pressable onPress={() => {}}>
            <View style={{
              backgroundColor: theme.card,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border
            }}>

              <ThemedText style={{
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 15
              }}>
                Editar perfil
              </ThemedText>

              <TextInput
                placeholder="Nombre"
                placeholderTextColor={theme.muted}
                value={nombre}
                onChangeText={setNombre}
                style={{
                  backgroundColor: theme.background,
                  padding: 12,
                  borderRadius: 10,
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
                  backgroundColor: theme.background,
                  padding: 12,
                  borderRadius: 10,
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
                  backgroundColor: theme.background,
                  padding: 12,
                  borderRadius: 10,
                  color: theme.text,
                  borderWidth: 1,
                  borderColor: theme.border,
                  marginBottom: 15
                }}
              />

              <TouchableOpacity
                onPress={async () => {
                  await guardar();
                  setMostrarEditar(false);
                }}
                style={{
                  backgroundColor: theme.primary,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ color: theme.onPrimary }}>
                  Guardar cambios
                </ThemedText>
              </TouchableOpacity>

            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={mostrarObjetivos} transparent animationType="slide">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 20
          }}
          onPress={() => setMostrarObjetivos(false)}
        >
          <Pressable onPress={() => {}}>
            <View style={{
              backgroundColor: theme.card,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border
            }}>

              <ThemedText style={{
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 15
              }}>
                Objetivo personal
              </ThemedText>

              <View style={{ marginBottom: 15 }}>
                {OBJETIVOS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setObjetivo(item)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      backgroundColor: objetivo === item ? theme.primary : theme.background,
                      borderWidth: 1,
                      borderColor: theme.border
                    }}
                  >
                    <ThemedText style={{
                      color: objetivo === item ? theme.onPrimary : theme.text
                    }}>
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.setItem(OBJETIVO_KEY, objetivo);
                  setMostrarObjetivos(false);
                }}
                style={{
                  backgroundColor: theme.primary,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ color: theme.onPrimary }}>
                  Guardar objetivo
                </ThemedText>
              </TouchableOpacity>

            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}