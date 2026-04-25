import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { obtenerHistorial, eliminarEntradaHistorial } from '../../src/storage';
import { useTheme } from '../../src/theme/ThemeContext';

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Historial() {
  const theme = useTheme();
  const [historial, setHistorial] = useState<any[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);

  const cargar = async () => {
    const data = await obtenerHistorial();
    setHistorial(data);
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const eliminar = (index: number) => {
    Alert.alert('Eliminar sesión', '¿Querés borrar esta entrada del historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => { await eliminarEntradaHistorial(index); cargar(); }
      }
    ]);
  };

  if (historial.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 6 }}>Sin historial aún</Text>
        <Text style={{ fontSize: 14, color: theme.muted, textAlign: 'center' }}>
          Completá una rutina y tocá "Finalizar rutina" para guardar tu sesión acá.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 70 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
        Historial
      </Text>

      <FlatList
        data={historial}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const abierto = expandido === index;
          return (
            <TouchableOpacity
              onPress={() => setExpandido(abierto ? null : index)}
              style={{
                backgroundColor: theme.card,
                borderRadius: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: 'hidden'
              }}
            >
              {/* CABECERA */}
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{item.rutinaNombre}</Text>
                  <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{formatFecha(item.fecha)}</Text>
                </View>
                <TouchableOpacity onPress={() => eliminar(index)} style={{ marginRight: 12 }}>
                  <Text style={{ color: theme.danger || '#ff4d4d', fontWeight: '700' }}>X</Text>
                </TouchableOpacity>
                <Text style={{ color: theme.muted, fontSize: 16 }}>{abierto ? '▲' : '▼'}</Text>
              </View>

              {/* STATS RESUMEN */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 14, gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.primary }}>
                    {item.ejerciciosCompletados}
                    <Text style={{ fontSize: 12, color: theme.muted }}>/{item.ejerciciosTotal}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>ejercicios</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.primary }}>
                    {item.pesoTotalKg ? item.pesoTotalKg.toLocaleString('es-AR') : '0'}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>kg totales</Text>
                </View>
              </View>

              {/* DETALLE EXPANDIBLE */}
              {abierto && item.ejercicios?.length > 0 && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>EJERCICIOS</Text>
                  {item.ejercicios.map((e: any, i: number) => (
                    <View key={i} style={{
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor: theme.border
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{e.nombre}</Text>
                        {e.pesoEjercicio > 0 && (
                          <Text style={{ color: theme.muted, fontSize: 13 }}>
                            {e.pesoEjercicio.toLocaleString('es-AR')} kg
                          </Text>
                        )}
                      </View>
                      {e.seriesData?.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {e.seriesData.map((s: any, j: number) => (
                            <View key={j} style={{
                              backgroundColor: theme.background,
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderWidth: 1,
                              borderColor: theme.border
                            }}>
                              <Text style={{ fontSize: 12, color: theme.text }}>
                                S{j + 1}: {s.reps || '—'} rep{s.peso ? ` × ${s.peso}kg` : ''}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
