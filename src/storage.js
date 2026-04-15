import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rutinas';

export const guardarRutina = async (rutina) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.push({ ...rutina, ejercicios: [] });

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const obtenerRutinas = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error leyendo rutinas:", error);
    return [];
  }
};

export const eliminarRutina = async (index) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.splice(index, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const agregarEjercicio = async (rutinaIndex, ejercicio) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  if (!rutinas[rutinaIndex].ejercicios) {
    rutinas[rutinaIndex].ejercicios = [];
  }

  rutinas[rutinaIndex].ejercicios.push(ejercicio);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const toggleEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = JSON.parse(data);

  rutinas[rutinaIndex].ejercicios[ejercicioIndex].completado =
    !rutinas[rutinaIndex].ejercicios[ejercicioIndex].completado;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const eliminarEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = JSON.parse(data);

  rutinas[rutinaIndex].ejercicios.splice(ejercicioIndex, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};