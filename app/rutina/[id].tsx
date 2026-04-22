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
  Pressable
} from 'react-native';

import {
  obtenerRutinas,
  agregarEjercicio,
  toggleEjercicio,
  eliminarEjercicio
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
  const [rutina, setRutina] = useState(null); // rutina actual
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
    series: ejercicioSeleccionado.series.toString(),
    reps: ejercicioSeleccionado.reps.toString(),
    completado: false
  },
  ejercicioSeleccionado.tipo // 👈 IMPORTANTE
);

  setEjercicioSeleccionado(null);
  setVarianteSeleccionada(null);
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
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: theme.text  
      }}>
        {rutina.nombre}
      </Text>

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
                if (item.tipo === 'entrada') {
                  await toggleEjercicio(rutinaIndex, item.originalIndex, 'entradaEnCalor');
                } else {
                  await toggleEjercicio(rutinaIndex, item.originalIndex, 'ejercicios');
                }
                cargar();
              }}>
                <Text style={{
                  fontSize: 16,
                  textDecorationLine: item.completado ? 'line-through' : 'none',
                  color: item.completado ? theme.success : theme.text,
                }}>
                  {item.nombre || item.label || 'Ejercicio'} {item.variante ? `- ${item.variante}` : ''}
                </Text>

                <Text style={{
                  fontSize: 12,
                  color: item.completado ? theme.success : theme.text
                }}>
                  {item.series && item.reps ? `${item.series}x${item.reps}` : ''}
                  {item.dificultad ? ` • ${item.dificultad}` : ''}
                </Text>

                <Text style={{
                  fontSize: 12,
                  color: theme.muted
                }}>
                  {item.equipo ? formatearEquipo(item.equipo) : ''}
                </Text>
              </TouchableOpacity>

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
          );
        }}
      />

      {/* =======================
          MODAL: SELECTOR DE EJERCICIOS
      ======================= */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ marginBottom: 10, color: theme.text }}>Seleccionar ejercicio</Text>

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
      </View>
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

      {/* VARIANTES */}
      {ejercicioSeleccionado && (
        <View style={{ marginTop: 10 , padding: 10, borderWidth : 5 , borderColor: theme.card, borderRadius: 10}}>
          <Text style={{ marginBottom: 5 }}>Variantes:</Text>

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