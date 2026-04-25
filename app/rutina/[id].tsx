// =========================================
// 📦 PANTALLA: DETALLE DE RUTINA
// Esta pantalla permite:
// - Ver ejercicios y entrada en calor
// - Marcar progreso
// - Agregar / eliminar ejercicios
// =========================================
// =======================
// IMPORTS
// =======================

import { useLocalSearchParams, Stack, useRouter  } from 'expo-router'; // obtener params de la ruta (id)
import { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  PanResponder,
  Pressable,
  Vibration
} from 'react-native';

import { Audio } from 'expo-av';

import {
  obtenerRutinas,
  agregarEjercicio,
  toggleEjercicio,
  completarEjercicio,
  eliminarEjercicio,
  renombrarRutina,
  guardarHistorial
} from '../../src/storage'; // funciones de storage

import { EJERCICIOS } from '../../src/ejercicios'; // lista base de ejercicios
import { useTheme } from '../../src/theme/ThemeContext';


// =======================
// Componente principal
// =======================
export default function RutinaDetalle() {
const fadeAnim = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(0)).current;
const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
const headerPanEnabled = useRef(false);
const theme = useTheme();

// =======================
// GESTOS (DRAG PARA CERRAR MODAL)
// =======================
const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Solo activar el pan si el touch empezó en el header
      return headerPanEnabled.current && gestureState.dy > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      // reset del flag al soltar
      headerPanEnabled.current = false;
      if (gestureState.dy > 120 || gestureState.vy > 1.2) {
        setMostrarSelector(false);
        translateY.setValue(0);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      headerPanEnabled.current = false;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true
      }).start();
    }
  })
).current;
  // =======================
  // ESTADO PRINCIPAL Y PARAMETROS
  // =======================
  const { id } = useLocalSearchParams(); // id de la rutina

  const [mostrarSelector, setMostrarSelector] = useState(false); // mostrar/ocultar selector
  const [rutina, setRutina] = useState<any>(null); // rutina actual
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const formatearEquipo = (equipo) => {
    if (!equipo || equipo.length === 0) return '';

    if (equipo.includes('sin equipo')) return 'Peso corporal';

    return equipo.join(' + ');
    };
  const rutinaIndex = Number(id); // convertir id a número

  // =======================
  // BUSQUEDA Y FILTRO DE EJERCICIOS
  // =======================
  const [busqueda, setBusqueda] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('Todos');

  const grupos = ['Todos', ...new Set(EJERCICIOS.map(e => e.grupo))];

const ejerciciosFiltrados = EJERCICIOS.filter(e => {
  const coincideBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
  const coincideGrupo =
    grupoSeleccionado === 'Todos' || e.grupo === grupoSeleccionado;

  return coincideBusqueda && coincideGrupo && e.tipo === 'ejercicio';
});

  // =======================
  // INPUTS (FORMULARIO AGREGAR)
  // =======================
  const [nombre, setNombre] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');
  const router = useRouter();

  // ---- sonido / alarma ----
  const soundRef = useRef<Audio.Sound | null>(null);

  const playAlarm = async () => {
    try {
      // si hay un sonido cargado, detener y descargar primero
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      // intenta cargar un asset local (añade /assets/alarm.mp3 en tu proyecto)
      // si no existe, el require lanzará; el catch hará fallback a vibración
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/alarm.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;
      // opcional: no esperar a que termine
    } catch (e) {
      // fallback: vibrar si no hay asset o fallo en audio
      Vibration.vibrate([500, 200, 500]);
    }
  };

  useEffect(() => {
    return () => {
      // cleanup sonido al desmontar
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch {}
          soundRef.current = null;
        }
      })();
    };
  }, []);

  // =======================
  // TEMPORIZADOR
  // =======================
  const [mostrarRenombrar, setMostrarRenombrar] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const [descripcionVisible, setDescripcionVisible] = useState(false);
  const [ejercicioDescripcion, setEjercicioDescripcion] = useState<any>(null);

  const [mostrarCompletar, setMostrarCompletar] = useState(false);
  const [ejercicioCompletando, setEjercicioCompletando] = useState<any>(null);
  const [seriesData, setSeriesData] = useState<{reps: string, peso: string}[]>([]);

  const [agregarSeries, setAgregarSeries] = useState('');
  const [agregarReps, setAgregarReps] = useState('');

  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [resumenFinalizar, setResumenFinalizar] = useState<any>(null);

  const [mostrarTimer, setMostrarTimer] = useState(false);
  const [timerSegundos, setTimerSegundos] = useState(60);
  const [timerInicial, setTimerInicial] = useState(60);
  const [timerActivo, setTimerActivo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActivo && timerSegundos > 0) {
      timerRef.current = setInterval(() => {
        setTimerSegundos(s => s - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timerSegundos === 0) {
        setTimerActivo(false);
        // reproducir alarma cuando llega a 0
        playAlarm();
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActivo, timerSegundos]);

  const resetTimer = (segundos: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActivo(false);
    setTimerSegundos(segundos);
    setTimerInicial(segundos);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  // =======================
  // ANIMACION BARRA DE PROGRESO
  // =======================
  const progressAnim = useRef(new Animated.Value(0)).current;

  // =======================
  // CARGA DE DATOS (STORAGE)
  // =======================
  const cargar = async () => {
    const data = await obtenerRutinas();
    setRutina(data[rutinaIndex]);
  };

  // =======================
  // FINALIZAR RUTINA
  // =======================
  const abrirFinalizar = () => {
    if (!rutina) return;
    const todos = [
      ...(rutina.entradaEnCalor || []),
      ...(rutina.ejercicios || [])
    ];
    const completados = todos.filter(e => e.completado);

    const ejerciciosDetalle = completados
      .filter(e => e.tipo === 'ejercicio' || !e.tipo || e.tipo !== 'entrada')
      .map(e => {
        const seriesD: {reps: string, peso: string}[] = e.seriesData || [];
        const pesoEjercicio = seriesD.reduce((acc, s) => {
          const r = parseFloat(s.reps) || 0;
          const p = parseFloat(s.peso) || 0;
          return acc + r * p;
        }, 0);
        return { nombre: e.nombre, seriesData: seriesD, pesoEjercicio };
      });

    const pesoTotal = ejerciciosDetalle.reduce((acc, e) => acc + e.pesoEjercicio, 0);

    setResumenFinalizar({
      rutinaNombre: rutina.nombre,
      fecha: new Date().toISOString(),
      ejerciciosCompletados: completados.length,
      ejerciciosTotal: todos.length,
      pesoTotalKg: pesoTotal,
      ejercicios: ejerciciosDetalle
    });
    setMostrarFinalizar(true);
  };

  const confirmarFinalizar = async () => {
    if (!resumenFinalizar) return;
    await guardarHistorial(resumenFinalizar);
    setMostrarFinalizar(false);
    router.back();
  };

  // =======================
  // LOGICA DE COLOR SEGUN PROGRESO
  // =======================
  const getColor = () => {
    // usar valores del theme con fallback
    const danger = theme?.danger || '#ff4d4d';
    const warning = theme?.primary || '#ffcc00';
    const success = theme?.success || '#4caf50';

    if (progreso < 0.3) return danger; // rojo
    if (progreso < 0.7) return warning; // amarillo / primary
    return success; // verde
  };

  // =======================
  // EFECTOS (USEEFFECT)
  // =======================
  useEffect(() => {
    cargar(); // cargar al iniciar
  }, []);

  useEffect(() => {
    // animación cada vez que cambia el progreso
    Animated.timing(progressAnim, {
      toValue: progreso,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [progreso]);

  useEffect(() => {
    if (mostrarSelector) {
        fadeAnim.setValue(0); // reset
        Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
        }).start();
    }
}, [mostrarSelector]);
  // =======================
  // LOGICA PARA AGREGAR EJERCICIO
  // =======================
const agregar = async () => {
  if (!ejercicioSeleccionado || !varianteSeleccionada) return;

await agregarEjercicio(
  rutinaIndex,
  {
    nombre: ejercicioSeleccionado.nombre,
    variante: varianteSeleccionada,
    grupo: ejercicioSeleccionado.grupo,
    dificultad: ejercicioSeleccionado.dificultad,
    equipo: ejercicioSeleccionado.equipo,
    series: agregarSeries || ejercicioSeleccionado.series.toString(),
    reps: agregarReps || ejercicioSeleccionado.reps.toString(),
    completado: false
  },
  ejercicioSeleccionado.tipo // 👈 IMPORTANTE
);

  setEjercicioSeleccionado(null);
  setVarianteSeleccionada(null);
  setAgregarSeries('');
  setAgregarReps('');
  setMostrarSelector(false);

  cargar();
};

  // =======================
  // CALCULO DE PROGRESO
  // =======================
  if (!rutina) return null;

  const total = (rutina.entradaEnCalor?.length || 0) + (rutina.ejercicios?.length || 0);

  const completados = [
    ...(rutina.entradaEnCalor || []),
    ...(rutina.ejercicios || [])
  ].filter(e => e.completado).length;

  const progreso = total > 0 ? completados / total : 0;

  // =======================
  // UI (RENDER PRINCIPAL)
  // =======================
  return (<>
<Stack.Screen
  options={{
    title: rutina?.nombre || 'Rutina',
    headerBackTitle: 'Volver',
    headerShown: false,
  }}
/>
    <View style={{ 
        flex: 1, 
        padding: 20, 
        backgroundColor: theme.background, 
        paddingTop: 70 }}>
      
      {/* TITULO */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>
          {rutina.nombre}
        </Text>
        <TouchableOpacity
          onPress={() => { setNuevoNombre(rutina.nombre); setMostrarRenombrar(true); }}
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginRight: 70
          }}
        >
          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Renombrar</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DESCRIPCION */}
      <Modal visible={descripcionVisible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setDescripcionVisible(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            width: '88%',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
              {ejercicioDescripcion?.nombre}
            </Text>
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>
              {ejercicioDescripcion?.grupo} {ejercicioDescripcion?.variante ? `• ${ejercicioDescripcion.variante}` : ''}
            </Text>
            <Text style={{ fontSize: 15, color: theme.text, lineHeight: 24 }}>
              {ejercicioDescripcion?.descripcion}
            </Text>
            <TouchableOpacity
              onPress={() => setDescripcionVisible(false)}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL RENOMBRAR */}
      <Modal visible={mostrarRenombrar} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setMostrarRenombrar(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            width: '85%',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
              Renombrar rutina
            </Text>
            <TextInput
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              placeholder="Nombre de la rutina"
              placeholderTextColor={theme.muted}
              style={{
                backgroundColor: theme.background,
                padding: 12,
                borderRadius: 12,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 16
              }}
            />
            <TouchableOpacity
              onPress={async () => {
                if (!nuevoNombre.trim()) return;
                await renombrarRutina(rutinaIndex, nuevoNombre.trim());
                setMostrarRenombrar(false);
                cargar();
              }}
              style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* PROGRESO */}
        <View style={{ marginTop: 20 }}>
        <Text style={{
            fontSize: 16,
            marginBottom: 5,
            fontWeight: '600',
            color: theme.text
        }}>
            {Math.round(progreso * 100)}% completado
        </Text>
        {/* BARRA ANIMADA */}
        <View style={{
          height: 10,
          backgroundColor: theme.border,
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: getColor(),
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }}
          />
        </View>
      </View>

      {/* BARRA SIMPLE (duplicada) */}
      <View style={{
        height: 10,
        backgroundColor: theme.border,
        borderRadius: 10,
        overflow: 'hidden'
      }}>
        <View style={{
          width: `${progreso * 100}%`,
          height: '100%',
          backgroundColor: theme?.success || '#4caf50'
        }} />
      </View>

      {/* =======================
          LISTA: ENTRADA EN CALOR + EJERCICIOS
      ======================= */}
      <FlatList
        data={[
          { tipo: 'titulo', label: '🔥 Entrada en calor' },
          ...(rutina.entradaEnCalor || []).map((e, i) => ({ ...e, tipo: 'entrada', originalIndex: i })),
          { tipo: 'titulo', label: '💪 Ejercicios' },
          ...(rutina.ejercicios || []).map((e, i) => ({ ...e, tipo: 'ejercicio', originalIndex: i }))
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          if (item.tipo === 'titulo') {
            return (
              <Text style={{
                marginTop: 15,
                fontSize: 16,
                fontWeight: '700',
                color: theme.text
              }}>
                {item.label}
              </Text>
            );
          }

          return (
            <View style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border
            }}>

              <TouchableOpacity onPress={async () => {
                if (item.completado) {
                  // ya completado → desmarcar
                  const tipoStorage = item.tipo === 'entrada' ? 'entradaEnCalor' : 'ejercicios';
                  await toggleEjercicio(rutinaIndex, item.originalIndex, tipoStorage);
                  cargar();
                } else {
                  // abrir modal para confirmar series/reps
                  setEjercicioCompletando(item);
                  const n = parseInt(String(item.series ?? '1')) || 1;
                  setSeriesData(Array.from({ length: n }, () => ({ reps: String(item.reps ?? ''), peso: '' })));
                  setMostrarCompletar(true);
                }
              }}>
                <Text style={{
                  fontSize: 18,
                  textDecorationLine: item.completado ? 'line-through' : 'none',
                  color: item.completado ? theme.success : theme.text, fontWeight: '800'
                }}>
                  {item.nombre || item.label || 'Ejercicio'} - {item.series && item.reps ? `${item.series}x${item.reps}` : ''}
                </Text>

                <Text style={{
                  fontSize: 14,
                  color: item.completado ? theme.success : theme.text, fontWeight: '600'
                }}>
                  {item.variante ? `${item.variante}` : ''}
                  {item.grupo ? ` • ${item.grupo}` : ''}
                </Text>

                <Text style={{
                  fontSize: 13,
                  color: theme.muted
                }}>
                  {item.equipo ? formatearEquipo(item.equipo) : ''}
                </Text>

                {item.completado && item.seriesData && item.seriesData.length > 0 && (
                  <View style={{ marginTop: 6, gap: 2 }}>
                    {item.seriesData.map((s: {reps: string, peso: string}, i: number) => (
                      <Text key={i} style={{ fontSize: 12, color: theme.success }}>
                        S{i + 1}: {s.reps ? `${s.reps} reps` :  '—'} × {s.peso || 0}kg
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {item.descripcion && (
                  <TouchableOpacity onPress={() => { setEjercicioDescripcion(item); setDescripcionVisible(true); }}>
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      borderWidth: 1, borderColor: theme.border,
                      justifyContent: 'center', alignItems: 'center'
                    }}>
                      <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '700' }}>i</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={async () => {
                  if (item.tipo === 'entrada') {
                    await eliminarEjercicio(rutinaIndex, item.originalIndex, 'entradaEnCalor');
                  } else {
                    await eliminarEjercicio(rutinaIndex, item.originalIndex, 'ejercicios');
                  }
                  cargar();
                }}>
                  <Text style={{ color: theme?.danger || 'red' }}>X</Text>
                </TouchableOpacity>
              </View>

            </View>
          );
        }}
      />

      {/* =======================
          MODAL: SELECTOR DE EJERCICIOS
      ======================= */}
      <View>
                    {/* BOTÓN MOSTRAR SELECTOR */}
            <TouchableOpacity
              onPress={() => setMostrarSelector(!mostrarSelector)}
              style={{
                backgroundColor: theme.primary ,
                padding: 12,
                borderRadius: 10,
                marginTop: 20,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: theme.onPrimary  }}>
                {mostrarSelector ? 'Cerrar' : 'Agregar ejercicio'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={abrirFinalizar}
              style={{
                backgroundColor: theme.success || '#4caf50',
                padding: 12,
                borderRadius: 10,
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Finalizar rutina</Text>
            </TouchableOpacity>
      </View>
      {/* BOTÓN FLOTANTE TEMPORIZADOR */}
      <TouchableOpacity
        onPress={() => setMostrarTimer(true)}
        style={{
          position: 'absolute',
          top: 70,
          right: 20,
          backgroundColor: theme.card,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Text style={{ fontSize: 24 }}>⏱</Text>
      </TouchableOpacity>

      {/* MODAL TEMPORIZADOR */}
      <Modal visible={mostrarTimer} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setMostrarTimer(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 30,
            width: '80%',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 20 }}>
              Temporizador
            </Text>

            {/* DISPLAY */}
            <Text style={{
              fontSize: 64,
              fontWeight: '200',
              color: timerSegundos === 0 ? (theme.success || '#4caf50') : theme.text,
              marginBottom: 24
            }}>
              {formatTimer(timerSegundos)}
            </Text>

            {/* PRESETS */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {[30, 60, 90, 120].map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => resetTimer(s)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: timerSegundos === s && !timerActivo ? theme.primary : theme.background,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                >
                  <Text style={{ color: timerSegundos === s && !timerActivo ? theme.onPrimary : theme.text, fontSize: 13 }}>
                    {s < 60 ? `${s}s` : `${s / 60}min`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CONTROLES */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setTimerActivo(a => !a)}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 30,
                  paddingVertical: 12,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: theme.onPrimary, fontWeight: '600', fontSize: 16 }}>
                  {timerActivo ? 'Pausar' : 'Iniciar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => resetTimer(timerInicial)}
                style={{
                  backgroundColor: theme.background,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <Text style={{ color: theme.text, fontSize: 16 }}>Reset</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL FINALIZAR RUTINA */}
      <Modal visible={mostrarFinalizar} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setMostrarFinalizar(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            width: '90%',
            maxHeight: '80%',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 2 }}>
              Sesión completada
            </Text>
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>
              {resumenFinalizar ? new Date(resumenFinalizar.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            </Text>

            {/* STATS GLOBALES */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: theme.primary }}>
                  {resumenFinalizar?.ejerciciosCompletados ?? 0}
                  <Text style={{ fontSize: 13, color: theme.muted }}>/{resumenFinalizar?.ejerciciosTotal ?? 0}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>Ejercicios</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: theme.background, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: theme.primary }}>
                  {resumenFinalizar?.pesoTotalKg ? resumenFinalizar.pesoTotalKg.toLocaleString('es-AR') : '0'}
                </Text>
                <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>kg totales</Text>
              </View>
            </View>

            {/* DETALLE POR EJERCICIO */}
            {resumenFinalizar?.ejercicios?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>DETALLE</Text>
                {resumenFinalizar.ejercicios.map((e: any, i: number) => (
                  <View key={i} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                    borderBottomWidth: i < resumenFinalizar.ejercicios.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border
                  }}>
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{e.nombre}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: theme.text, fontSize: 13 }}>
                        {e.seriesData?.length ?? 0} series
                      </Text>
                      {e.pesoEjercicio > 0 && (
                        <Text style={{ color: theme.muted, fontSize: 12 }}>
                          {e.pesoEjercicio.toLocaleString('es-AR')} kg
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={confirmarFinalizar}
              style={{ backgroundColor: theme.success || '#4caf50', padding: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Guardar en historial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMostrarFinalizar(false)}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={{ color: theme.muted }}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL COMPLETAR EJERCICIO */}
      <Modal visible={mostrarCompletar} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setMostrarCompletar(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            width: '90%',
            maxHeight: '80%',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 2 }}>
              {ejercicioCompletando?.nombre}
            </Text>
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>
              Registra reps y peso por serie
            </Text>

            {/* CABECERA */}
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ width: 48, color: theme.muted, fontSize: 12, fontWeight: '600' }}>Serie</Text>
              <Text style={{ flex: 1, color: theme.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>Reps</Text>
              <View style={{ width: 20 }} />
              <Text style={{ flex: 1, color: theme.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>Peso (kg)</Text>
            </View>

            {/* FILAS POR SERIE */}
            {seriesData.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: theme.background,
                  borderWidth: 1, borderColor: theme.border,
                  justifyContent: 'center', alignItems: 'center'
                }}>
                  <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <TextInput
                  value={s.reps}
                  onChangeText={v => setSeriesData(prev => prev.map((x, j) => j === i ? { ...x, reps: v } : x))}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={theme.muted}
                  style={{
                    flex: 1,
                    backgroundColor: theme.background,
                    padding: 10,
                    borderRadius: 10,
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                    fontSize: 18,
                    textAlign: 'center',
                    fontWeight: '700'
                  }}
                />
                <Text style={{ color: theme.muted, fontSize: 16 }}>×</Text>
                <TextInput
                  value={s.peso}
                  onChangeText={v => setSeriesData(prev => prev.map((x, j) => j === i ? { ...x, peso: v } : x))}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor={theme.muted}
                  style={{
                    flex: 1,
                    backgroundColor: theme.background,
                    padding: 10,
                    borderRadius: 10,
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                    fontSize: 18,
                    textAlign: 'center',
                    fontWeight: '700'
                  }}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={async () => {
                if (!ejercicioCompletando) return;
                const tipoStorage = ejercicioCompletando.tipo === 'entrada' ? 'entradaEnCalor' : 'ejercicios';
                await completarEjercicio(rutinaIndex, ejercicioCompletando.originalIndex, tipoStorage, seriesData);
                setMostrarCompletar(false);
                setEjercicioCompletando(null);
                cargar();
              }}
              style={{ backgroundColor: theme.success || '#4caf50', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 6 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Completado ✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMostrarCompletar(false)}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={{ color: theme.muted }}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

              <Modal visible={mostrarSelector}  animationType="slide"  transparent={true}
>
<Pressable
  style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  }}
  onPress={() => setMostrarSelector(false)}
>

    {/* CONTENEDOR */}
<Pressable onPress={() => {}} style={{ alignSelf: 'stretch' }}>
  <Animated.View
    {...panResponder.panHandlers}
style={{
  backgroundColor: theme?.surface || theme?.card,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  maxHeight: '85%',
  width: '100%',
  transform: [{ translateY }],
  shadowColor: theme.shadow,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10
}}
  >
  {/* HANDLE */}
  <View style={{
    width: 40,
    height: 5,
    backgroundColor: theme.muted,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10
  }} />
      {/* HEADER */}
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => { headerPanEnabled.current = true; }}
        onResponderRelease={() => { headerPanEnabled.current = false; }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10 ,
          marginTop: 20 
        }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Seleccionar ejercicio
        </Text>
        {/* BOTÓN BACK */}
        <TouchableOpacity onPress={() => setMostrarSelector(false)}>
            <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        {/* TÍTULO */}
        <Text style={{
            fontSize: 20,
            fontWeight: '600'
        }}>
            {rutina?.nombre}
        </Text>
        {/* ESPACIADOR */}
        <View style={{ width: 24 }} />

        <TouchableOpacity onPress={() => setMostrarSelector(false)}>
          <Text style={{ fontSize: 18 }}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <TextInput
        placeholder="Buscar ejercicio..."
        placeholderTextColor={theme?.muted || '#999'}
        value={busqueda}
        onChangeText={setBusqueda}
        style={{
          backgroundColor: theme.background,
          padding: 12,
          borderRadius: 12,
          marginTop: 15,
          color: theme.text,
          borderColor: theme.border,
          borderWidth: 1
        }}
      />

      {/* LISTA */}
      <FlatList
        data={ejerciciosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setEjercicioSeleccionado(item);
              setVarianteSeleccionada(null);
              setAgregarSeries(String(item.series ?? ''));
              setAgregarReps(String(item.reps ?? ''));
            }}
            style={{
              padding: 12,
              backgroundColor:
                ejercicioSeleccionado?.id === item.id ? theme.primary : theme.background,
              borderRadius: 12,
              marginBottom: 8
            }}
          >
            <Text style={{
              color:
                ejercicioSeleccionado?.id === item.id  ? '#fff'  : theme.text,
              fontWeight: '600'
            }}>
              {item.nombre}
            </Text>

            <Text style={{
              fontSize: 12,
              color: ejercicioSeleccionado?.id === item.id ? (theme?.onPrimary || '#fff') : (theme?.muted || '#666')
            }}>
              {item.grupo} • {item.dificultad}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* VARIANTES + SERIES/REPS */}
      {ejercicioSeleccionado && (
        <View style={{ marginTop: 10, padding: 10, borderWidth: 5, borderColor: theme.card, borderRadius: 10 }}>
          <Text style={{ marginBottom: 5, color: theme.text }}>Variantes:</Text>

          {ejercicioSeleccionado.variantes.map((v, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setVarianteSeleccionada(v)}
              style={{
                padding: 8,
                backgroundColor:
                  varianteSeleccionada === v ? (theme?.onPrimary || '#fff') : (theme?.muted || '#666'),
                borderRadius: 10,
                marginBottom: 5
              }}
            >
              <Text style={{ color: theme?.text || '#000' }}>{v}</Text>
            </TouchableOpacity>
          ))}

          {/* INPUTS SERIES / REPS */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 4 }}>Series</Text>
              <TextInput
                value={agregarSeries}
                onChangeText={setAgregarSeries}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={theme.muted}
                style={{
                  backgroundColor: theme.background,
                  padding: 10,
                  borderRadius: 10,
                  color: theme.text,
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 18,
                  textAlign: 'center',
                  fontWeight: '700'
                }}
              />
            </View>
            <View style={{ justifyContent: 'flex-end', paddingBottom: 10 }}>
              <Text style={{ color: theme.muted, fontSize: 18 }}>×</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 4 }}>Reps</Text>
              <TextInput
                value={agregarReps}
                onChangeText={setAgregarReps}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={theme.muted}
                style={{
                  backgroundColor: theme.background,
                  padding: 10,
                  borderRadius: 10,
                  color: theme.text,
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 18,
                  textAlign: 'center',
                  fontWeight: '700'
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* BOTÓN AGREGAR */}
      <TouchableOpacity
        onPress={agregar}
        style={{
          backgroundColor: theme?.primary || '#000',
          padding: 15,
          borderRadius: 10,
          marginTop: 10,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: theme?.onPrimary || '#fff' }}>
          Agregar
        </Text>
      </TouchableOpacity>

  </Animated.View>
</Pressable>
</Pressable>
</Modal>
    </View>
    </>
    
  );
}