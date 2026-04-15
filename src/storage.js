import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rutinas';

// guardar rutina
export const guardarRutina = async (rutina) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.push(rutina);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// obtener rutinas
export const obtenerRutinas = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};