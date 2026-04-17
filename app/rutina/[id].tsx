// =======================
// IMPORTS
// =======================
import { Stack } from 'expo-router';

import { useLocalSearchParams } from 'expo-router'; // obtener params de la ruta (id)
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



// =======================
// Componente principal
// =======================
export default function RutinaDetalle() {
const fadeAnim = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(0)).current;
const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
const headerPanEnabled = useRef(false);

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
  // PARAMETROS Y STATES
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
  // BUSQUEDA Y FILTRO
  // =======================
  const [busqueda, setBusqueda] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('Todos');

  const grupos = ['Todos', ...new Set(EJERCICIOS.map(e => e.grupo))];

  const ejerciciosFiltrados = EJERCICIOS.filter(e => {
    const coincideBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideGrupo =
      grupoSeleccionado === 'Todos' || e.grupo === grupoSeleccionado;

    return coincideBusqueda && coincideGrupo;
  });

  // =======================
  // INPUTS (no usados del todo todavía)
  // =======================
  const [nombre, setNombre] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');

  // =======================
  // ANIMACION DE PROGRESO
  // =======================
  const progressAnim = useRef(new Animated.Value(0)).current;

  // =======================
  // CARGAR DATOS
  // =======================
  const cargar = async () => {
    const data = await obtenerRutinas();
    setRutina(data[rutinaIndex]);
  };

  // =======================
  // COLOR SEGUN PROGRESO
  // =======================
  const getColor = () => {
    if (progreso < 0.3) return '#ff4d4d'; // rojo
    if (progreso < 0.7) return '#ffcc00'; // amarillo
    return '#4caf50'; // verde
  };

  // =======================
  // EFECTOS
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
  // AGREGAR EJERCICIO
  // =======================
const agregar = async () => {
  if (!ejercicioSeleccionado || !varianteSeleccionada) return;

  await agregarEjercicio(rutinaIndex, {
    nombre: ejercicioSeleccionado.nombre,
    variante: varianteSeleccionada,
    grupo: ejercicioSeleccionado.grupo,
    dificultad: ejercicioSeleccionado.dificultad,
    equipo: ejercicioSeleccionado.equipo,
    series: ejercicioSeleccionado.series.toString(),
    reps: ejercicioSeleccionado.reps.toString(),
    completado: false
  });

  setEjercicioSeleccionado(null);
  setVarianteSeleccionada(null);
  setMostrarSelector(false);

  cargar();
};

  // =======================
  // CALCULOS DE PROGRESO
  // =======================
  if (!rutina) return null;

  const total = rutina.ejercicios.length;

  const completados = rutina.ejercicios.filter(
    e => e.completado
  ).length;

  const progreso = total > 0 ? completados / total : 0;

  // =======================
  // RENDER
  // =======================
  return (<>
<Stack.Screen
  options={{
    title: rutina?.nombre || 'Rutina',
    headerBackTitle: 'Volver'
  }}
/>
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      
      {/* TITULO */}
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {rutina.nombre}
      </Text>

      {/* PROGRESO */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '600' }}>
          {Math.round(progreso * 100)}% completado
        </Text>

        {/* BARRA ANIMADA */}
        <View style={{
          height: 12,
          backgroundColor: '#ddd',
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
        backgroundColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden'
      }}>
        <View style={{
          width: `${progreso * 100}%`,
          height: '100%',
          backgroundColor: '#4caf50'
        }} />
      </View>

      {/* =======================
          LISTA DE EJERCICIOS
      ======================= */}
      <FlatList
        data={rutina.ejercicios}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>

            {/* TOGGLE COMPLETADO */}
            <TouchableOpacity onPress={async () => {
              await toggleEjercicio(rutinaIndex, index);
              cargar();
            }}>
              <Text style={{
                    fontSize: 16,
                    textDecorationLine: item.completado ? 'line-through' : 'none'
                }}>
                    {item.nombre} - {item.variante}
                </Text>

                <Text style={{ fontSize: 12, color: '#666' }}>
                    {item.series}x{item.reps} • {item.dificultad}
                </Text>

                <Text style={{ fontSize: 12, color: '#999' }}>
                    {formatearEquipo(item.equipo)}
                </Text>
            </TouchableOpacity>

            {/* ELIMINAR */}
            <TouchableOpacity onPress={async () => {
              await eliminarEjercicio(rutinaIndex, index);
              cargar();
            }}>
              <Text style={{ color: 'red' }}>X</Text>
            </TouchableOpacity>

          </View>
        )}
      />

      {/* =======================
          SELECTOR DE EJERCICIOS
      ======================= */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ marginBottom: 10 }}>Seleccionar ejercicio</Text>

                    {/* BOTÓN MOSTRAR SELECTOR */}
            <TouchableOpacity
              onPress={() => setMostrarSelector(!mostrarSelector)}
              style={{
                backgroundColor: '#000',
                padding: 12,
                borderRadius: 10,
                marginTop: 20,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff' }}>
                {mostrarSelector ? 'Cerrar' : 'Agregar ejercicio'}
              </Text>
            </TouchableOpacity>
      </View>
              <Modal
  visible={mostrarSelector}
  animationType="slide"
  transparent={true}
>
<Pressable
  style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  }}
  onPress={() => setMostrarSelector(false)}
>

    {/* CONTENEDOR */}
<Pressable onPress={() => {}} style={{ alignSelf: 'stretch' }}>
  <Animated.View
    {...panResponder.panHandlers}
style={{
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  maxHeight: '80%',
  transform: [{ translateY }],
  marginBottom: 0
}}
  >
  {/* HANDLE */}
  <View style={{
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
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
          alignItems: 'center'
        }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Seleccionar ejercicio
        </Text>

        <TouchableOpacity onPress={() => setMostrarSelector(false)}>
          <Text style={{ fontSize: 18 }}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <TextInput
        placeholder="Buscar ejercicio..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={{
          backgroundColor: '#f0f0f0',
          padding: 12,
          borderRadius: 12,
          marginTop: 15
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
                ejercicioSeleccionado?.id === item.id ? '#000' : '#fff',
              borderRadius: 12,
              marginBottom: 8
            }}
          >
            <Text style={{
              color: ejercicioSeleccionado?.id === item.id ? '#fff' : '#000',
              fontWeight: '600'
            }}>
              {item.nombre}
            </Text>

            <Text style={{
              fontSize: 12,
              color: ejercicioSeleccionado?.id === item.id ? '#fff' : '#666'
            }}>
              {item.grupo} • {item.dificultad}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* VARIANTES */}
      {ejercicioSeleccionado && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ marginBottom: 5 }}>Variantes:</Text>

          {ejercicioSeleccionado.variantes.map((v, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setVarianteSeleccionada(v)}
              style={{
                padding: 8,
                backgroundColor:
                  varianteSeleccionada === v ? '#4caf50' : '#eee',
                borderRadius: 10,
                marginBottom: 5
              }}
            >
              <Text>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* BOTÓN AGREGAR */}
      <TouchableOpacity
        onPress={agregar}
        style={{
          backgroundColor: '#000',
          padding: 15,
          borderRadius: 10,
          marginTop: 10,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff' }}>
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