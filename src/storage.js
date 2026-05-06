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
    ...(rutinaBase.carpetaId ? { carpetaId: rutinaBase.carpetaId } : {}),
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
  } else if (tipo === 'finalizacion') {
    if (!rutina.finalizacion) rutina.finalizacion = [];
    rutina.finalizacion.push(nuevo);
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
// COMPLETAR EJERCICIO (guarda series y reps reales)
// =======================
// seriesData: [{ reps: string, peso: string }, ...]
export const completarEjercicio = async (rutinaIndex, ejercicioIndex, tipo = 'ejercicios', seriesData) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];

  const lista = rutinas[rutinaIndex]?.[tipo];
  if (!lista || !lista[ejercicioIndex]) return;

  lista[ejercicioIndex].completado = true;
  lista[ejercicioIndex].seriesData = seriesData;

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// CARPETAS
// =======================
const CARPETAS_KEY = 'carpetas';

export const obtenerCarpetas = async () => {
  try {
    const data = await AsyncStorage.getItem(CARPETAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const crearCarpeta = async (nombre) => {
  const carpetas = await obtenerCarpetas();
  const nueva = { id: String(Date.now()), nombre };
  carpetas.push(nueva);
  await AsyncStorage.setItem(CARPETAS_KEY, JSON.stringify(carpetas));
  return nueva;
};

export const eliminarCarpeta = async (id) => {
  const carpetas = await obtenerCarpetas();
  await AsyncStorage.setItem(CARPETAS_KEY, JSON.stringify(carpetas.filter(c => c.id !== id)));
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];
  rutinas.forEach(r => { if (r.carpetaId === id) delete r.carpetaId; });
  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

export const asignarCarpeta = async (rutinaIndex, carpetaId) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];
  if (!rutinas[rutinaIndex]) return;
  if (carpetaId) rutinas[rutinaIndex].carpetaId = carpetaId;
  else delete rutinas[rutinaIndex].carpetaId;
  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// HISTORIAL
// =======================
const HISTORIAL_KEY = 'historial';

export const guardarHistorial = async (entrada) => {
  const data = await AsyncStorage.getItem(HISTORIAL_KEY);
  const historial = data ? JSON.parse(data) : [];
  historial.unshift(entrada); // más reciente primero
  await AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
};

export const obtenerHistorial = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORIAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const eliminarEntradaHistorial = async (index) => {
  const data = await AsyncStorage.getItem(HISTORIAL_KEY);
  const historial = data ? JSON.parse(data) : [];
  historial.splice(index, 1);
  await AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
};

// =======================
// RESETEAR RUTINA (desmarca completados y borra seriesData)
// =======================
export const resetearRutina = async (rutinaIndex) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];
  const rutina = rutinas[rutinaIndex];
  if (!rutina) return;

  ['entradaEnCalor', 'ejercicios', 'finalizacion'].forEach(tipo => {
    (rutina[tipo] || []).forEach(e => {
      e.completado = false;
      delete e.seriesData;
    });
  });

  await AsyncStorage.setItem(KEY, JSON.stringify(rutinas));
};

// =======================
// NOTAS DE RUTINA
// =======================
export const guardarNotas = async (rutinaIndex, notas) => {
  const data = await AsyncStorage.getItem(KEY);
  const rutinas = data ? JSON.parse(data) : [];
  if (!rutinas[rutinaIndex]) return;
  rutinas[rutinaIndex].notas = notas;
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

const CALENDAR_KEY = 'entrenamientos';

export const marcarDiaEntrenado = async (fecha = null, marcado = true) => {
  // fecha puede ser 'YYYY-MM-DD' o un objeto Date; si no se pasa, usa hoy
  const dia = fecha
    ? (typeof fecha === 'string' ? fecha : new Date(fecha).toISOString().slice(0, 10))
    : new Date().toISOString().split('T')[0];

  const data = await AsyncStorage.getItem(CALENDAR_KEY);
  const dias = data ? JSON.parse(data) : {};

  if (marcado) {
    dias[dia] = true;
  } else {
    delete dias[dia];
  }

  await AsyncStorage.setItem(CALENDAR_KEY, JSON.stringify(dias));
};

export const obtenerDiasEntrenados = async () => {
  const data = await AsyncStorage.getItem(CALENDAR_KEY);
  return data ? JSON.parse(data) : {};
};

export const obtenerEntrenamientoPorFecha = async (fecha) => {
  try {
    const data = await AsyncStorage.getItem(HISTORIAL_KEY);
    const historial = data ? JSON.parse(data) : [];

    return historial.find((h) => {
      if (!h?.fecha) return false;
      return new Date(h.fecha).toISOString().slice(0, 10) === fecha;
    });
  } catch (e) {
    console.log('Error obteniendo entrenamiento por fecha', e);
    return null;
  }
};