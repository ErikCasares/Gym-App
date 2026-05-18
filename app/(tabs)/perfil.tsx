import { View, TextInput, Modal, TouchableOpacity, Pressable, FlatList, Text, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerHistorial } from '../../src/storage';
import { useTheme } from '../../src/theme/ThemeContext';
import ThemedText from '../../src/components/ThemedText';
import Button from '../../src/components/Button';
import { marcarDiaEntrenado, obtenerDiasEntrenados, obtenerEntrenamientoPorFecha } from '../../src/storage';
import { useRouter } from 'expo-router';

export default function Perfil() {
  const theme = useTheme();
  const router = useRouter();

  const STORAGE_KEY = 'perfil_usuario';
  const OBJETIVO_KEY = 'objetivo_usuario';

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [editando, setEditando] = useState(false);
  const [mostrarObjetivos, setMostrarObjetivos] = useState(false);
  const [objetivo, setObjetivo] = useState('');
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDetalleFecha, setMostrarDetalleFecha] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [detalleNota, setDetalleNota] = useState<any>(null);

  // historial modal
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historialList, setHistorialList] = useState<any[]>([]);
  const [vista, setVista] = useState<'calendario' | 'historial'>('calendario');

  const [diasEntrenados, setDiasEntrenados] = useState({});
  const [entrenamientos, setEntrenamientos] = useState({});

  // control de mes visible en el calendario
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const prevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  // Swipe horizontal para cambiar mes
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dy) < 30,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) {
          nextMonth();
        } else if (g.dx > 50) {
          prevMonth();
        }
      }
    })
  ).current;

  // Sincronizar calendario desde historial: marca días y añade detalles
  const syncDesdeHistorial = async () => {
    try {
      const hist = await obtenerHistorial(); // espera array de entradas con .fecha
      const diasMap: Record<string, boolean> = {};
      const detalles: Record<string, any> = {};

      hist.forEach((h: any) => {
        if (!h?.fecha) return;
        // normalizar a 'YYYY-MM-DD'
        const key = new Date(h.fecha).toISOString().slice(0, 10);
        diasMap[key] = true;
        detalles[key] = h;
      });

      setDiasEntrenados(diasMap);
      setEntrenamientos(detalles);
    } catch (e) {
      console.warn('Error sincronizando historial -> calendario', e);
    }
  };

  useEffect(() => {
    syncDesdeHistorial();
  }, []);

  // Recargar automáticamente cuando la pantalla gane foco (por ejemplo al volver de finalizar rutina)
  useFocusEffect(useCallback(() => {
    syncDesdeHistorial();
  }, []));

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
    (async () => {
      const dias = await obtenerDiasEntrenados();
      setDiasEntrenados(dias);

      const data = {};
      for (const fecha in dias) {
        if (dias[fecha]) {
          const entrenamiento = await obtenerEntrenamientoPorFecha(fecha);
          data[fecha] = entrenamiento;
        }
      }
      setEntrenamientos(data);
    })();
  }, []);
  const generarDiasMes = (añoParam: number, mesParam: number) => {
    const total = new Date(añoParam, mesParam + 1, 0).getDate();
    return { año: añoParam, mes: mesParam, dias: Array.from({ length: total }, (_, i) => i + 1) };
  };

  const formatMesMMM_AAAA = (añoParam: number, mesParam: number) => {
    const d = new Date(añoParam, mesParam, 1);
    let m = d.toLocaleString('es-AR', { month: 'short' });
    m = m.replace('.', ''); // quitar posible punto en abreviatura (ej. "may.")
    m = m.charAt(0).toUpperCase() + m.slice(1);
    return `${m}-${d.getFullYear()}`;
  };
  
  const { año, mes, dias } = generarDiasMes(currentYear, currentMonth);

  // Generar matriz de semanas (lunes primero). Cada semana es un array de 7 elementos (número de día o null).
  const generarSemanas = (añoParam: number, mesParam: number) => {
    const firstDay = new Date(añoParam, mesParam, 1);
    // getDay(): 0=Dom,1=Lun,... convertir a índice con Lunes=0
    const startIndex = (firstDay.getDay() + 6) % 7;
    const total = new Date(añoParam, mesParam + 1, 0).getDate();
    const semanas: (number | null)[][] = [];
    let dia = 1;

    // primera semana
    const primeraSemana = Array(7).fill(null) as (number | null)[];
    for (let i = startIndex; i < 7 && dia <= total; i++) {
      primeraSemana[i] = dia++;
    }
    semanas.push(primeraSemana);

    // semanas completas siguientes
    while (dia <= total) {
      const semana = Array(7).fill(null) as (number | null)[];
      for (let i = 0; i < 7 && dia <= total; i++) {
        semana[i] = dia++;
      }
      semanas.push(semana);
    }

    return semanas;
  };
  const semanas = generarSemanas(currentYear, currentMonth);

  const toggleDia = async (fecha: string) => {
    // alternar marca en storage y refrescar estados locales
    const actual = !!diasEntrenados[fecha];
    await marcarDiaEntrenado(fecha, !actual);
    const dias = await obtenerDiasEntrenados();
    setDiasEntrenados(dias);

    if (!actual) {
      const entrenamiento = await obtenerEntrenamientoPorFecha(fecha);
      setEntrenamientos(prev => ({ ...prev, [fecha]: entrenamiento }));
      setDetalleNota(entrenamiento ?? null);
    } else {
      setEntrenamientos(prev => {
        const copy = { ...prev };
        delete copy[fecha];
        return copy;
      });
      setDetalleNota(null);
    }
  };

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const abrirDetalle = async (fecha: string) => {
    setFechaSeleccionada(fecha);

    // buscar en historial una entrada con la misma fecha (normalizada a YYYY-MM-DD)
    try {
      const hist = await obtenerHistorial();
      const key = new Date(fecha).toISOString().slice(0, 10);
      const entry = hist.find((h: any) => {
        if (!h?.fecha) return false;
        return new Date(h.fecha).toISOString().slice(0, 10) === key;
      });

      setDetalleNota(entry ?? null);
    } catch (e) {
      console.warn('Error buscando historial para fecha', fecha, e);
      setDetalleNota(null);
    }

    setMostrarDetalleFecha(true);
  };

  const abrirHistorial = async () => {
    try {
      const h = await obtenerHistorial();
      setHistorialList(Array.isArray(h) ? h : []);
      setVista('historial');
    } catch (e) {
      console.warn('Error cargando historial', e);
      setHistorialList([]);
      setVista('historial');
    }
  };

  const abrirDesdeHistorial = (entry: any) => {
    if (!entry?.fecha) return;
    const key = new Date(entry.fecha).toISOString().slice(0, 10);
    setFechaSeleccionada(key);
    setDetalleNota(entry);
    setMostrarHistorial(false);
    setMostrarDetalleFecha(true);
  };

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

      <View style={{ marginTop: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setVista('calendario')}>
              <ThemedText style={{
                fontSize: 18,
                fontWeight: '700',
                color: vista === 'calendario' ? theme.primary : theme.muted
              }}>
                Calendario
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={abrirHistorial}>
              <ThemedText style={{
                fontSize: 18,
                fontWeight: '700',
                color: vista === 'historial' ? theme.primary : theme.muted
              }}>
                Historial
              </ThemedText>
            </TouchableOpacity>
          </View>

          {vista === 'calendario' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
                <ThemedText style={{ color: theme.muted }}>{'‹'}</ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', marginHorizontal: 6 }}>
                {formatMesMMM_AAAA(año, mes)}
              </ThemedText>
              <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
                <ThemedText style={{ color: theme.muted }}>{'›'}</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {vista === 'calendario' && (
          <View {...panResponder.panHandlers}>
             {/* Encabezado de días (Lun..Dom) */}
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
               {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                 <ThemedText key={d} style={{ width: 42, textAlign: 'center', color: theme.muted }}>{d}</ThemedText>
               ))}
             </View>
 
             {/* Semanas */}
             {semanas.map((semana, idx) => (
               <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                 {semana.map((d, i) => {
                   if (!d) {
                     return <View key={i} style={{ width: 42, height: 42 }} />;
                   }
                   const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                   const entrenado = !!diasEntrenados[fecha];
                   return (
                     <TouchableOpacity
                       key={i}
                       onPress={() => abrirDetalle(fecha)}
                       style={{
                         width: 42,
                         height: 42,
                         borderRadius: 21,
                         justifyContent: 'center',
                         alignItems: 'center',
                         backgroundColor: entrenado ? theme.success : theme.card,
                         borderWidth: 1,
                         borderColor: theme.border
                       }}
                     >
                       <ThemedText style={{ color: entrenado ? '#fff' : theme.text }}>
                         {d}
                       </ThemedText>
                     </TouchableOpacity>
                   );
                 })}
               </View>
             ))}
           </View>
        )}

        {vista === 'historial' && (
          <View>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Historial de entrenamientos
            </ThemedText>
            {historialList.length === 0 ? (
              <ThemedText style={{ color: theme.muted }}>No hay registros</ThemedText>
            ) : (
              <FlatList
                data={historialList}
                keyExtractor={(item, i) => (item.id ?? i).toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => abrirDesdeHistorial(item)}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border
                    }}
                  >
                    <ThemedText style={{ fontWeight: '600' }}>
                      {item.rutinaNombre || 'Entrenamiento'} · {formatFecha(item.fecha)}
                    </ThemedText>
                    <Text style={{ color: theme.muted, marginTop: 4 }}>
                      {item.ejercicios?.length ?? 0} ejercicios · {item.pesoTotalKg ? `${item.pesoTotalKg} kg` : '0 kg'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setVista('calendario')}
                style={{
                  backgroundColor: theme.background,
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ color: theme.text }}>Cerrar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Modal detalle día */}
      <Modal visible={mostrarDetalleFecha} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 20
          }}
          onPress={() => setMostrarDetalleFecha(false)}
        >
          <Pressable onPress={() => {}}>
            <View style={{
              backgroundColor: theme.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              maxHeight: '80%'
            }}>
              {detalleNota && detalleNota.rutinaNombre ? (
                <>
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    {detalleNota.rutinaNombre} · {formatFecha(detalleNota.fecha)}
                  </ThemedText>

                  <View style={{ flexDirection: 'row', paddingBottom: 12, gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: theme.primary }}>
                        {detalleNota.ejerciciosCompletados}
                        <Text style={{ fontSize: 12, color: theme.muted }}>/{detalleNota.ejerciciosTotal}</Text>
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>ejercicios</Text>
                    </View>

                    <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: theme.primary }}>
                        {detalleNota.pesoTotalKg ? detalleNota.pesoTotalKg.toLocaleString('es-AR') : '0'}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>kg totales</Text>
                    </View>
                  </View>

                  {detalleNota.notas ? (
                    <>
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>NOTAS</ThemedText>
                      <ThemedText style={{ fontSize: 13, color: theme.text, fontStyle: 'italic', marginBottom: 12 }}>
                        {detalleNota.notas}
                      </ThemedText>
                    </>
                  ) : null}

                  {detalleNota.ejercicios?.length > 0 && (
                    <>
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>EJERCICIOS</ThemedText>
                      <View style={{ maxHeight: 220 }}>
                        <FlatList
                          data={detalleNota.ejercicios}
                          keyExtractor={(_, i) => i.toString()}
                          renderItem={({ item }: any, idx) => (
                            <View key={idx} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{item.nombre}</Text>
                                {item.pesoEjercicio > 0 && (
                                  <Text style={{ color: theme.muted, fontSize: 13 }}>
                                    {item.pesoEjercicio.toLocaleString('es-AR')} kg
                                  </Text>
                                )}
                              </View>

                              {item.seriesData?.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                  {item.seriesData.map((s: any, j: number) => (
                                    <View key={j} style={{
                                      backgroundColor: theme.background,
                                      borderRadius: 8,
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      borderWidth: 1,
                                      borderColor: theme.border,
                                      marginRight: 6,
                                      marginBottom: 6
                                    }}>
                                      <Text style={{ fontSize: 12, color: theme.text }}>
                                        S{j + 1}: {s.reps || '—'} rep{s.peso ? ` × ${s.peso}kg` : ''}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          )}
                        />
                      </View>
                    </>
                  )}
                </>
              ) : (
                <>
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    {fechaSeleccionada}
                  </ThemedText>
                  <ThemedText style={{ marginBottom: 12, color: theme.muted }}>
                    {diasEntrenados[fechaSeleccionada || ''] ? 'Marcado como entrenado' : 'No hay registro de entrenamiento'}
                  </ThemedText>
                </>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!fechaSeleccionada) return;
                    await toggleDia(fechaSeleccionada);
                    setMostrarDetalleFecha(false);
                  }}
                  style={{
                    backgroundColor: theme.primary,
                    padding: 12,
                    borderRadius: 10,
                    flex: 1,
                    marginRight: 8,
                    alignItems: 'center'
                  }}
                >
                  <ThemedText style={{ color: theme.onPrimary }}>
                    {diasEntrenados[fechaSeleccionada || ''] ? 'Desmarcar' : 'Marcar como entrenado'}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMostrarDetalleFecha(false)}
                  style={{
                    backgroundColor: theme.background,
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <ThemedText style={{ color: theme.text }}>Cerrar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}