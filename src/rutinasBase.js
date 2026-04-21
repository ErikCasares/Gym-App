import { EJERCICIOS } from './ejercicios';

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


export const RUTINAS = [
  {
    id: 1,
    nombre: 'Pecho y tríceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo constante' },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de hombros'), variante: 'Rotación hacia adelante' },
      { ...EJERCICIOS.find(e => e.nombre === 'Flexiones inclinadas'), variante: 'Manos en banco' }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Press banca'), variante: 'Press con barra' },
      { ...EJERCICIOS.find(e => e.nombre === 'Aperturas'), variante: 'Aperturas con mancuernas' },
      { ...EJERCICIOS.find(e => e.nombre === 'Fondos'), variante: 'Fondos en paralelas' },
      { ...EJERCICIOS.find(e => e.nombre === 'Extensión tríceps'), variante: 'Extensión en polea' },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal' }
    ]
  },

  {
    id: 2,
    nombre: 'Espalda y bíceps',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Skipping'), variante: 'Skipping bajo' },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de cadera'), variante: 'Círculos amplios' },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo con banda'), variante: 'Agarre ancho' }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Dominadas'), variante: 'Dominadas asistidas' },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo'), variante: 'Remo con barra' },
      { ...EJERCICIOS.find(e => e.nombre === 'Jalón al pecho'), variante: 'Jalón agarre ancho' },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl bíceps'), variante: 'Curl alternado' },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal' }
    ]
  },

  {
    id: 3,
    nombre: 'Piernas completo',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo constante' },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de cadera'), variante: 'Círculos controlados' },
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla libre (calentamiento)'), variante: 'Lenta' }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla'), variante: 'Sentadilla con barra' },
      { ...EJERCICIOS.find(e => e.nombre === 'Prensa'), variante: 'Prensa inclinada' },
      { ...EJERCICIOS.find(e => e.nombre === 'Peso muerto'), variante: 'Peso muerto convencional' },
      { ...EJERCICIOS.find(e => e.nombre === 'Curl femoral'), variante: 'Curl acostado' },
      { ...EJERCICIOS.find(e => e.nombre === 'Extensión de cuádriceps'), variante: 'Extensión en máquina' }
    ]
  },

  {
    id: 4,
    nombre: 'Full Body básico',

    entradaEnCalor: [
      { ...EJERCICIOS.find(e => e.nombre === 'Jumping jacks'), variante: 'Ritmo rápido' },
      { ...EJERCICIOS.find(e => e.nombre === 'Rotación de hombros'), variante: 'Rotación hacia atrás' },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha (calentamiento)'), variante: 'Plancha frontal' }
    ],

    ejercicios: [
      { ...EJERCICIOS.find(e => e.nombre === 'Sentadilla'), variante: 'Sentadilla libre' },
      { ...EJERCICIOS.find(e => e.nombre === 'Press banca'), variante: 'Press con barra' },
      { ...EJERCICIOS.find(e => e.nombre === 'Remo'), variante: 'Remo con barra' },
      { ...EJERCICIOS.find(e => e.nombre === 'Press militar'), variante: 'Press con mancuernas' },
      { ...EJERCICIOS.find(e => e.nombre === 'Plancha'), variante: 'Plancha frontal' }
    ]
  }
];