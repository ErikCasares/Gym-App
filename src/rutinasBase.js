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
    nombre: 'Día 1 – Pecho + tríceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Toe touches'), variante: 'Toe touches tumbado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Mountain climber'), variante: 'Mountain climber lento', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Bicicleta (Crunch bicicleta)'), variante: 'Bicicleta lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Press banca'), variante: 'Press con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Press inclinado'), variante: 'Press inclinado con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Aperturas'), variante: 'Aperturas con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Fondos'), variante: 'Fondos en paralelas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Extensión tríceps'), variante: 'Extensión en polea', completado: false }
    ]
  },

  {
    id: 2,
    nombre: 'Día 2 – Espalda + bíceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Toe touches'), variante: 'Toe touches tumbado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Mountain climber'), variante: 'Mountain climber lento', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Bicicleta (Crunch bicicleta)'), variante: 'Bicicleta lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Dominadas'), variante: 'Dominadas asistidas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo'), variante: 'Remo con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Jalón al pecho'), variante: 'Jalón agarre ancho', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl bíceps'), variante: 'Curl con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl bíceps'), variante: 'Curl martillo', completado: false }
    ]
  },

  {
    id: 3,
    nombre: 'Día 3 – Piernas',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Toe touches'), variante: 'Toe touches tumbado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Mountain climber'), variante: 'Mountain climber lento', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Bicicleta (Crunch bicicleta)'), variante: 'Bicicleta lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla'), variante: 'Sentadilla con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Prensa'), variante: 'Prensa inclinada', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Peso muerto'), variante: 'Peso muerto rumano', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl femoral'), variante: 'Curl acostado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Elevaciones de gemelos'), variante: 'Elevaciones de gemelos de pie', completado: false }
    ]
  },

  {
    id: 4,
    nombre: 'Día 4 – Hombros + core',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Toe touches'), variante: 'Toe touches tumbado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Mountain climber'), variante: 'Mountain climber lento', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Bicicleta (Crunch bicicleta)'), variante: 'Bicicleta lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Press militar'), variante: 'Press con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Elevaciones laterales'), variante: 'Elevaciones con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Pájaros (Rear delt fly)'), variante: 'Pájaros con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Encogimientos'), variante: 'Encogimientos con mancuernas', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false }
    ]
  },

  {
    id: 5,
    nombre: 'Día 5 – Full + abdomen',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Toe touches'), variante: 'Toe touches tumbado', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Mountain climber'), variante: 'Mountain climber lento', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Bicicleta (Crunch bicicleta)'), variante: 'Bicicleta lenta', completado: false }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Peso muerto'), variante: 'Peso muerto convencional', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Press inclinado'), variante: 'Press inclinado con barra', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo en máquina'), variante: 'Remo sentado en máquina', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Crunch'), variante: 'Crunch en máquina', completado: false },
      { ...EJERCICIOS.find(e => e.nombre === 'Elevaciones de piernas'), variante: 'Elevaciones de piernas tumbado', completado: false }
    ]
  }
];