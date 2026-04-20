import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rutinas';
export const usarPlantilla = async (rutinaBase) => {
  const nuevaRutina = {
    nombre: rutinaBase.nombre,
    ejercicios: rutinaBase.ejercicios.map(e => ({
      ejercicioId: e.ejercicioId,
      variante: e.variante,
      completado: false
    }))
  };

  await guardarRutina(nuevaRutina);
};
export const guardarRutina = async (rutina) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  rutinas.push({
    ...rutina,
    ejercicios: rutina.ejercicios ? rutina.ejercicios : []
  });

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

export const guardarPerfil = async (perfil) => {
  await AsyncStorage.setItem('perfil', JSON.stringify(perfil));
};

export const obtenerPerfil = async () => {
  const data = await AsyncStorage.getItem('perfil');
  return data ? JSON.parse(data) : null;
};

export const agregarEjercicio = async (rutinaIndex, ejercicio) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  if (!rutinas[rutinaIndex]) return;

  if (!rutinas[rutinaIndex].ejercicios) {
    rutinas[rutinaIndex].ejercicios = [];
  }

  rutinas[rutinaIndex].ejercicios.push(ejercicio);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const toggleEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  if (!rutinas[rutinaIndex] || !rutinas[rutinaIndex].ejercicios[ejercicioIndex]) return;

  rutinas[rutinaIndex].ejercicios[ejercicioIndex].completado =
    !rutinas[rutinaIndex].ejercicios[ejercicioIndex].completado;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const eliminarEjercicio = async (rutinaIndex, ejercicioIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  if (!rutinas[rutinaIndex] || !rutinas[rutinaIndex].ejercicios) return;

  rutinas[rutinaIndex].ejercicios.splice(ejercicioIndex, 1);

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};