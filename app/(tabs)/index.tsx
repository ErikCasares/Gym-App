import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  obtenerRutinas, eliminarRutina,
  obtenerCarpetas, crearCarpeta, eliminarCarpeta, asignarCarpeta,
  usarPlantilla, guardarRutina
} from '../../src/storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { RUTINAS as RUTINAS_PREARMADAS } from '../../src/rutinasBase';
import * as DocumentPicker from 'expo-document-picker';

export default function Home() {
  const router = useRouter();
  const theme = useTheme();

  const [rutinas, setRutinas] = useState<any[]>([]);
  const [carpetas, setCarpetas] = useState<any[]>([]);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [modoModal, setModoModal] = useState<'rutina' | 'prearmada' | 'carpeta'>('rutina');

  const [modalMoverVisible, setModalMoverVisible] = useState(false);
  const [rutinaAMover, setRutinaAMover] = useState<number | null>(null);

  const translateY = useState(new Animated.Value(0))[0];
  useEffect(() => { if (visible) translateY.setValue(0); }, [visible]);
  const headerPanEnabled = useRef(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => headerPanEnabled.current && g.dy > 10,
    onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 120 || g.vy > 1.2) { setVisible(false); translateY.setValue(0); }
      else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    }
  });

  // =======================
  // CARGA
  // =======================
  const cargarDatos = async () => {
    const [data, caps] = await Promise.all([obtenerRutinas(), obtenerCarpetas()]);
    setRutinas(data);
    setCarpetas(caps);
    setExpandidas(prev => prev);
  };

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const toggleExpandida = (id: string) => {
    setExpandidas(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
      return nuevo;
    });
  };

  // =======================
  // LISTA AGRUPADA
  // =======================
  const listaItems = () => {
    const items: any[] = [];
    const conIndex = rutinas.map((r, i) => ({ ...r, globalIndex: i }));

    for (const carpeta of carpetas) {
      const enCarpeta = conIndex.filter(r => r.carpetaId === carpeta.id);
      const expandida = expandidas.has(carpeta.id);
      items.push({ key: `c-${carpeta.id}`, type: 'carpeta', carpeta, count: enCarpeta.length, expandida });
      if (expandida) {
        for (const r of enCarpeta) {
          items.push({ key: `r-${r.globalIndex}`, type: 'rutina', rutina: r, globalIndex: r.globalIndex });
        }
      }
    }

    const sinCarpeta = conIndex.filter(r => !r.carpetaId);
    if (sinCarpeta.length > 0) {
      if (carpetas.length > 0) items.push({ key: 'sin-carpeta-header', type: 'sinCarpeta' });
      for (const r of sinCarpeta) {
        items.push({ key: `r-${r.globalIndex}`, type: 'rutina', rutina: r, globalIndex: r.globalIndex });
      }
    }

    return items;
  };

  // =======================
  // IMPORT
  // =======================
  const parsearBloqueReps = (repsStr: string) => {
    const match = repsStr.match(/^(\d+)x(.+)$/);
    return match ? { series: match[1], reps: match[2] } : { series: '1', reps: repsStr };
  };

  const importarFormatoSemana = async (datos: any) => {
    const carpeta = await crearCarpeta(`Semana ${datos.semana}`);
    for (const dia of datos.dias) {
      const ejercicios: any[] = [];
      for (const ej of dia.ejercicios) {
        for (const bloque of ej.series) {
          const { series, reps } = parsearBloqueReps(bloque.reps);
          const intensidad = bloque.intensidad !== undefined
            ? (typeof bloque.intensidad === 'number' ? `${bloque.intensidad}%` : String(bloque.intensidad))
            : '';
          ejercicios.push({ nombre: ej.nombre, variante: intensidad, series, reps, completado: false });
        }
      }
      await usarPlantilla({ nombre: `Día ${dia.dia}`, carpetaId: carpeta.id, entradaEnCalor: [], ejercicios });
    }
  };

  const importarDesdeArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const datos = JSON.parse(await fetch(result.assets[0].uri).then(r => r.text()));

      if (datos.semana !== undefined && Array.isArray(datos.dias)) {
        Alert.alert(
          'Importar plan',
          `¿Importar semana ${datos.semana} con ${datos.dias.length} día(s) en carpeta "Semana ${datos.semana}"?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Importar', onPress: async () => { await importarFormatoSemana(datos); cargarDatos(); } }
          ]
        );
        return;
      }

      if (datos.nombre && Array.isArray(datos.ejercicios)) {
        Alert.alert(
          'Importar rutina',
          `¿Importar "${datos.nombre}" con ${datos.ejercicios.length} ejercicio(s)?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Importar', onPress: async () => { await usarPlantilla(datos); cargarDatos(); } }
          ]
        );
        return;
      }

      Alert.alert('Archivo inválido', 'Formato no reconocido.');
    } catch {
      Alert.alert('Error', 'No se pudo leer el archivo.');
    }
  };

  // =======================
  // ACCIONES
  // =======================
  const crearRutina = async () => {
    if (!nombre.trim()) return;
    await guardarRutina({ nombre: nombre.trim() });
    setNombre(''); setVisible(false); cargarDatos();
  };

  const nuevaCarpeta = async () => {
    if (!nombre.trim()) return;
    await crearCarpeta(nombre.trim());
    setNombre(''); setVisible(false); cargarDatos();
  };

  const moverACarpeta = async (carpetaId: string | null) => {
    if (rutinaAMover === null) return;
    await asignarCarpeta(rutinaAMover, carpetaId);
    setModalMoverVisible(false); setRutinaAMover(null); cargarDatos();
  };

  // =======================
  // RENDER ITEMS
  // =======================
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'carpeta') {
      return (
        <TouchableOpacity
          onPress={() => toggleExpandida(item.carpeta.id)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, marginTop: 8, gap: 8 }}
        >
          <Text style={{ fontSize: 14, color: theme.muted }}>{item.expandida ? '▼' : '▶'}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, flex: 1 }}>
            📁 {item.carpeta.nombre}
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted }}>
            {item.count} rutina{item.count !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                'Eliminar carpeta',
                `¿Eliminar "${item.carpeta.nombre}"? Las rutinas quedarán sin carpeta.`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: async () => { await eliminarCarpeta(item.carpeta.id); cargarDatos(); } }
                ]
              );
            }}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text style={{ color: theme.danger || '#ff4d4d', fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    if (item.type === 'sinCarpeta') {
      return (
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginTop: 16, marginBottom: 4, paddingHorizontal: 4 }}>
          SIN CARPETA
        </Text>
      );
    }

    const { rutina, globalIndex } = item;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/rutina/${globalIndex}`)}
        style={{
          backgroundColor: theme.card,
          padding: 15,
          borderRadius: 12,
          marginBottom: 8,
          marginLeft: rutina.carpetaId ? 16 : 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text, flex: 1 }}>
          {rutina.nombre}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {carpetas.length > 0 && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setRutinaAMover(globalIndex); setModalMoverVisible(true); }}>
              <Text style={{ fontSize: 16 }}>📁</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                'Eliminar rutina',
                '¿Seguro que querés borrarla?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: async () => { await eliminarRutina(globalIndex); cargarDatos(); } }
                ]
              );
            }}
          >
            <Text style={{ color: theme.danger || '#ff4d4d', fontWeight: 'bold', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // =======================
  // UI
  // =======================
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 70 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: theme.text }}>
        Mis rutinas
      </Text>

      <FlatList
        data={listaItems()}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* MODAL MOVER A CARPETA */}
      <Modal visible={modalMoverVisible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setModalMoverVisible(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card, borderRadius: 20,
            padding: 24, width: '85%', borderWidth: 1, borderColor: theme.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
              Mover a carpeta
            </Text>
            {carpetas.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => moverACarpeta(c.id)}
                style={{
                  padding: 14, borderRadius: 12,
                  backgroundColor: theme.background,
                  marginBottom: 8, borderWidth: 1, borderColor: theme.border
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '600' }}>📁 {c.nombre}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => moverACarpeta(null)}
              style={{
                padding: 14, borderRadius: 12,
                backgroundColor: theme.background,
                marginTop: 4, borderWidth: 1, borderColor: theme.border
              }}
            >
              <Text style={{ color: theme.muted }}>Sin carpeta</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* BOTONES FLOTANTES */}
      <TouchableOpacity
        onPress={() => { setModoModal('carpeta'); setNombre(''); translateY.setValue(0); setVisible(true); }}
        style={{
          position: 'absolute', bottom: 30, left: 30,
          backgroundColor: theme.card, width: 60, height: 60, borderRadius: 30,
          justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border
        }}
      >
        <Text style={{ fontSize: 22 }}>📁</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={importarDesdeArchivo}
        style={{
          position: 'absolute', bottom: 30, right: 170,
          backgroundColor: theme.card, width: 60, height: 60, borderRadius: 30,
          justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border
        }}
      >
        <Text style={{ fontSize: 22 }}>📂</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { setModoModal('prearmada'); setNombre(''); translateY.setValue(0); setVisible(true); }}
        style={{
          position: 'absolute', bottom: 30, right: 100,
          backgroundColor: theme.card, width: 60, height: 60, borderRadius: 30,
          justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border
        }}
      >
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '600' }}>★</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { setModoModal('rutina'); setNombre(''); translateY.setValue(0); setVisible(true); }}
        style={{
          position: 'absolute', bottom: 30, right: 30,
          backgroundColor: theme.primary, width: 60, height: 60, borderRadius: 30,
          justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border
        }}
      >
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* BOTTOM SHEET */}
      <Modal transparent visible={visible} animationType="none">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setVisible(false)}
        >
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                backgroundColor: theme.card,
                borderTopLeftRadius: 20, borderTopRightRadius: 20,
                padding: 20, maxHeight: '80%',
                transform: [{ translateY }]
              }}
            >
              <View
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => (headerPanEnabled.current = true)}
                onResponderRelease={() => (headerPanEnabled.current = false)}
                style={{
                  width: 40, height: 5, backgroundColor: theme.border,
                  borderRadius: 10, alignSelf: 'center', marginBottom: 10
                }}
              />

              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 15, color: theme.text }}>
                {modoModal === 'prearmada' ? 'Rutinas prearmadas' : modoModal === 'carpeta' ? 'Nueva carpeta' : 'Nueva rutina'}
              </Text>

              {modoModal === 'prearmada' && (
                <FlatList
                  data={RUTINAS_PREARMADAS}
                  keyExtractor={item => item.id.toString()}
                  style={{ marginBottom: 15 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={async () => { await usarPlantilla(item); setVisible(false); cargarDatos(); }}
                      style={{
                        backgroundColor: theme.background, padding: 15,
                        borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>{item.nombre}</Text>
                      <Text style={{ fontSize: 12, color: theme.muted, marginTop: 5 }}>{item.ejercicios.length} ejercicios</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              {(modoModal === 'rutina' || modoModal === 'carpeta') && (
                <>
                  <TextInput
                    placeholder={modoModal === 'carpeta' ? 'Ej: Semana 1' : 'Ej: Pecho y tríceps'}
                    placeholderTextColor={theme.muted}
                    value={nombre}
                    onChangeText={setNombre}
                    style={{
                      backgroundColor: theme.background, padding: 14,
                      borderRadius: 12, color: theme.text,
                      borderWidth: 1, borderColor: theme.border, marginBottom: 15
                    }}
                  />
                  <TouchableOpacity
                    onPress={modoModal === 'carpeta' ? nuevaCarpeta : crearRutina}
                    style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>Guardar</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
