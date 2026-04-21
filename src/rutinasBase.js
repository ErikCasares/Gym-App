import { EJERCICIOS } from './ejercicios';

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


export const RUTINAS = [
  {
    id: 1,
    nombre: 'Pecho y tríceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo constante', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de hombros'), variante: 'Rotación hacia adelante', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Flexiones inclinadas'), variante: 'Manos en banco', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Press banca'), variante: 'Press con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Aperturas'), variante: 'Aperturas con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Fondos'), variante: 'Fondos en paralelas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Extensión tríceps'), variante: 'Extensión en polea', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false }
    ]
  },

  {
    id: 2,
    nombre: 'Espalda y bíceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Skipping'), variante: 'Skipping bajo', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de cadera'), variante: 'Círculos amplios', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo con banda'), variante: 'Agarre ancho', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Dominadas'), variante: 'Dominadas asistidas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo'), variante: 'Remo con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Jalón al pecho'), variante: 'Jalón agarre ancho', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl bíceps'), variante: 'Curl alternado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false }
    ]
  },

  {
    id: 3,
    nombre: 'Piernas completo',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo constante', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de cadera'), variante: 'Círculos controlados', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla libre (calentamiento)'), variante: 'Lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla'), variante: 'Sentadilla con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Prensa'), variante: 'Prensa inclinada', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Peso muerto'), variante: 'Peso muerto convencional', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl femoral'), variante: 'Curl acostado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Extensión de cuádriceps'), variante: 'Extensión en máquina', completado: false }
    ]
  },

  {
    id: 4,
    nombre: 'Full Body básico',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo rápido', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de hombros'), variante: 'Rotación hacia atrás', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha (calentamiento)'), variante: 'Plancha frontal', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla'), variante: 'Sentadilla libre', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Press banca'), variante: 'Press con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo'), variante: 'Remo con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Press militar'), variante: 'Press con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false }
    ]
  }
];