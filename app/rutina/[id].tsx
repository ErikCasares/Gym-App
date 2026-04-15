import {
  View, Text, FlatList, TextInput, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  obtenerRutinas,
  agregarEjercicio,
  toggleEjercicio,
  eliminarEjercicio
} from '../../src/storage';
import { Animated } from 'react-native';
import { EJERCICIOS } from '../../src/ejercicios';




export default function RutinaDetalle() {
  const { id } = useLocalSearchParams();
  const [rutina, setRutina] = useState(null);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const rutinaIndex = Number(id);
  const [busqueda, setBusqueda] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('Todos');
  const grupos = ['Todos', ...new Set(EJERCICIOS.map(e => e.grupo))];
  const ejerciciosFiltrados = EJERCICIOS.filter(e => {
    const coincideBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideGrupo =
      grupoSeleccionado === 'Todos' || e.grupo === grupoSeleccionado;

    return coincideBusqueda && coincideGrupo;
  });

  const [nombre, setNombre] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cargar = async () => {
    const data = await obtenerRutinas();
    setRutina(data[rutinaIndex]);
  };
  const getColor = () => {
    if (progreso < 0.3) return '#ff4d4d'; // rojo
    if (progreso < 0.7) return '#ffcc00'; // amarillo
    return '#4caf50'; // verde
  };

  useEffect(() => {
    cargar();
  }, []);
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progreso,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [progreso]);

  const agregar = async () => {
    if (!ejercicioSeleccionado) return;

    await agregarEjercicio(rutinaIndex, {
      nombre: ejercicioSeleccionado.nombre,
      grupo: ejercicioSeleccionado.grupo,
      series,
      reps,
      completado: false
    });

    setEjercicioSeleccionado(null);
    setSeries('');
    setReps('');
    cargar();
  };

  if (!rutina) return null;
  const total = rutina.ejercicios.length;

  const completados = rutina.ejercicios.filter(
      e => e.completado
  ).length;
  const progreso = total > 0 ? completados / total : 0;
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {rutina.nombre}
      </Text>
      <View style={{ marginTop: 20 }}>
  
<View style={{ marginTop: 20 }}>
  
  <Text style={{ 
    fontSize: 16, 
    marginBottom: 5,
    fontWeight: '600'
  }}>
    {Math.round(progreso * 100)}% completado
  </Text>

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

</View>
      {/* LISTA */}
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
            
            <TouchableOpacity onPress={async () => {
              await toggleEjercicio(rutinaIndex, index);
              cargar();
            }}>
              <Text style={{
                fontSize: 16,
                textDecorationLine: item.completado ? 'line-through' : 'none'
              }}>
                {item.nombre} ({item.series}x{item.reps})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => {
              await eliminarEjercicio(id, index);
              cargar();
            }}>
              <Text style={{ color: 'red' }}>X</Text>
            </TouchableOpacity>

          </View>
        )}
      />

      {/* FORM */}
      
      <View style={{ marginTop: 20 }}>
  <Text style={{ marginBottom: 10 }}>Seleccionar ejercicio</Text>
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
  {ejerciciosFiltrados.map((e) => (
    
    <TouchableOpacity
      key={e.id}
      onPress={() => setEjercicioSeleccionado(e)}
      style={{
        padding: 10,
        backgroundColor:
          ejercicioSeleccionado?.id === e.id ? '#000' : '#fff',
        borderRadius: 10,
        marginBottom: 5
      }}
    >
      <Text style={{
        color: ejercicioSeleccionado?.id === e.id ? '#fff' : '#000'
      }}>
        {e.nombre} ({e.grupo})
      </Text>
    </TouchableOpacity>
  ))}
  
  </View>

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
        <Text style={{ color: '#fff' }}>Agregar</Text>
      </TouchableOpacity>

    </View>
  );
}