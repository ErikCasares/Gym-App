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
    ejercicios: rutinaBase.ejercicios.map(e => ({
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
// EJERCICIOS
// =======================
export const agregarEjercicio = async (rutinaIndex, ejercicio) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas[rutinaIndex].ejercicios.push(ejercicio);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const toggleEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = JSON.parse(data);

  const ej = rutinas[rutinaIndex].ejercicios[ejercicioIndex];
  ej.completado = !ej.completado;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const eliminarEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = JSON.parse(data);

  rutinas[rutinaIndex].ejercicios.splice(ejercicioIndex, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};