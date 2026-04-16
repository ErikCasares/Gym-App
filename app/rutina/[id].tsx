// =======================
// IMPORTS
// =======================
import {
  View, Text, FlatList, TextInput, TouchableOpacity
} from 'react-native';

import { useLocalSearchParams } from 'expo-router'; // obtener params de la ruta (id)
import { useEffect, useState, useRef } from 'react';

import {
  obtenerRutinas,
  agregarEjercicio,
  toggleEjercicio,
  eliminarEjercicio
} from '../../src/storage'; // funciones de storage

import { Animated } from 'react-native'; // animaciones
import { EJERCICIOS } from '../../src/ejercicios'; // lista base de ejercicios



// =======================
// COMPONENTE PRINCIPAL
// =======================
export default function RutinaDetalle() {
const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
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
  return (
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

                    {/* BOTON MOSTRAR SELECTOR */}
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
    {mostrarSelector && (
      <View>
        {/* BUSCADOR */}
        <TextInput
          placeholder="Buscar ejercicio..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            marginTop: 20
          }}
        />

        {/* FILTRO POR GRUPO */}
        <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' }}>
          {grupos.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGrupoSeleccionado(g)}
              style={{
                padding: 8,
                backgroundColor: grupoSeleccionado === g ? '#000' : '#ddd',
                borderRadius: 20,
                marginRight: 5,
                marginBottom: 5
              }}
            >
              <Text style={{
                color: grupoSeleccionado === g ? '#fff' : '#000'
              }}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

                {/* BOTON AGREGAR (CONFIRMAR) */}
                <TouchableOpacity
                  onPress={agregar}
                  disabled={!varianteSeleccionada}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: varianteSeleccionada ? '#000' : '#ccc',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#fff' }}>Agregar</Text>
                </TouchableOpacity>
            </View>
            )}
        {/* LISTA DE EJERCICIOS DISPONIBLES */}
        {ejerciciosFiltrados.map((e) => (
  <TouchableOpacity
    key={e.id}
    onPress={() => {
      setEjercicioSeleccionado(e);
      setVarianteSeleccionada(null);
    }}
    style={{
      padding: 10,
      backgroundColor:
        ejercicioSeleccionado?.id === e.id ? '#000' : '#fff',
      borderRadius: 10,
      marginBottom: 5,
      marginTop: 5
    }}
  >
    <Text style={{
      color: ejercicioSeleccionado?.id === e.id ? '#fff' : '#000',
      fontWeight: '600'
    }}>
      {e.nombre}
    </Text>

    <Text style={{
      color: ejercicioSeleccionado?.id === e.id ? '#fff' : '#666',
      fontSize: 12
    }}>
      {e.grupo} • {e.dificultad}
    </Text>
  </TouchableOpacity>
        ))}
          </View>
)}
      </View>
 
    </View>
  );
}