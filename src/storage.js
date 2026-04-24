import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rutinas';

// =======================
// CREAR RUTINA MANUAL
// =======================
export const guardarRutina = async (rutina) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.push({
    nombre: rutina.nombre,
    entradaEnCalor: [],
    ejercicios: []
  });

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// USAR PLANTILLA
// =======================
export const usarPlantilla = async (rutinaBase) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  const nuevaRutina = {
    nombre: rutinaBase.nombre,
    entradaEnCalor: (rutinaBase.entradaEnCalor || []).map(e => ({
      ...e,
      completado: false
    })),
    ejercicios: (rutinaBase.ejercicios || []).map(e => ({
      ...e,
      completado: false
    }))
  };

  rutinas.push(nuevaRutina);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// OBTENER
// =======================
export const obtenerRutinas = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// =======================
// ELIMINAR RUTINA
// =======================
export const eliminarRutina = async (index) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.splice(index, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// RENOMBRAR RUTINA
// =======================
export const renombrarRutina = async (index, nuevoNombre) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  if (!rutinas[index]) return;
  rutinas[index].nombre = nuevoNombre;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// AGREGAR EJERCICIO
// =======================
export const agregarEjercicio = async (rutinaIndex, nuevo, tipo = 'ejercicios') => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  const rutina = rutinas[rutinaIndex];

  if (!rutina.entradaEnCalor) rutina.entradaEnCalor = [];
  if (!rutina.ejercicios) rutina.ejercicios = [];

  if (tipo === 'entrada') {
    rutina.entradaEnCalor.unshift(nuevo);
  } else {
    rutina.ejercicios.push(nuevo);
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// TOGGLE
// =======================
export const toggleEjercicio = async (rutinaIndex, ejercicioIndex, tipo = 'ejercicios') => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  const lista = rutinas[rutinaIndex]?.[tipo];

  if (!lista || !lista[ejercicioIndex]) return;

  lista[ejercicioIndex].completado = !lista[ejercicioIndex].completado;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// ELIMINAR EJERCICIO
// =======================
export const eliminarEjercicio = async (rutinaIndex, ejercicioIndex, tipo = 'ejercicios') => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  const lista = rutinas[rutinaIndex][tipo];

  if (!lista) return;

  lista.splice(ejercicioIndex, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};