export const EJERCICIOS = [
  {
    id: 1,
    nombre: 'Press banca',
    grupo: 'Pecho',
    series: 4,
    reps: 10,
    dificultad: 'media',
    equipo: ['barra', 'banco'],
    variantes: [
      'Press con barra',
      'Press con mancuernas',
      'Press en máquina'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 2,
    nombre: 'Aperturas',
    grupo: 'Pecho',
    series: 3,
    reps: 12,
    dificultad: 'media',
    equipo: ['mancuernas'],
    variantes: [
      'Aperturas con mancuernas',
      'Aperturas en máquina',
      'Aperturas en polea'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 3,
    nombre: 'Sentadilla',
    grupo: 'Piernas',
    series: 4,
    reps: 8,
    dificultad: 'alta',
    equipo: ['barra', 'peso corporal', 'mancuernas', 'kettlebell'],
    variantes: [
      'Sentadilla con barra',
      'Sentadilla goblet',
      'Sentadilla libre'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 4,
    nombre: 'Prensa',
    grupo: 'Piernas',
    series: 4,
    reps: 12,
    dificultad: 'media',
    equipo: ['máquina'],
    variantes: [
      'Prensa inclinada',
      'Prensa horizontal'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 5,
    nombre: 'Peso muerto',
    grupo: 'Espalda',
    series: 4,
    reps: 6,
    dificultad: 'alta',
    equipo: ['barra', 'peso corporal'],
    variantes: [
      'Peso muerto convencional',
      'Peso muerto rumano',
      'Peso muerto con mancuernas'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 6,
    nombre: 'Dominadas',
    grupo: 'Espalda',
    series: 3,
    reps: 8,
    dificultad: 'alta',
    equipo: ['barra', 'peso corporal'],
    variantes: [
      'Dominadas pronas',
      'Dominadas supinas',
      'Dominadas asistidas'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 7,
    nombre: 'Curl bíceps',
    grupo: 'Brazos',
    series: 3,
    reps: 12,
    dificultad: 'baja',
    equipo: ['mancuernas'],
    variantes: [
      'Curl alternado',
      'Curl con barra',
      'Curl martillo'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 8,
    nombre: 'Fondos',
    grupo: 'Brazos',
    series: 3,
    reps: 10,
    dificultad: 'media',
    equipo: ['paralelas', 'banco', 'peso corporal'],
    variantes: [
      'Fondos en paralelas',
      'Fondos en banco'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 9,
    nombre: 'Press militar',
    grupo: 'Hombros',
    series: 4,
    reps: 10,
    dificultad: 'media',
    equipo: ['barra'],
    variantes: [
      'Press con barra',
      'Press con mancuernas',
      'Press en máquina'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 10,
    nombre: 'Elevaciones laterales',
    grupo: 'Hombros',
    series: 3,
    reps: 15,
    dificultad: 'baja',
    equipo: ['mancuernas'],
    variantes: [
      'Elevaciones con mancuernas',
      'Elevaciones en polea'
    ],
    tipo: 'ejercicio'
  },

  // 🔽 NUEVOS EJERCICIOS

  {
    id: 11,
    nombre: 'Flexiones',
    grupo: 'Pecho',
    series: 3,
    reps: 15,
    dificultad: 'baja',
    equipo: ['peso corporal'],
    variantes: [
      'Flexiones clásicas',
      'Flexiones inclinadas',
      'Flexiones diamante'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 12,
    nombre: 'Remo',
    grupo: 'Espalda',
    series: 4,
    reps: 10,
    dificultad: 'media',
    equipo: ['barra'],
    variantes: [
      'Remo con barra',
      'Remo con mancuernas',
      'Remo en máquina'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 13,
    nombre: 'Jalón al pecho',
    grupo: 'Espalda',
    series: 3,
    reps: 12,
    dificultad: 'media',
    equipo: ['polea'],
    variantes: [
      'Jalón agarre ancho',
      'Jalón agarre cerrado'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 14,
    nombre: 'Zancadas',
    grupo: 'Piernas',
    series: 3,
    reps: 12,
    dificultad: 'media',
    equipo: ['mancuernas', 'peso corporal'],
    variantes: [
      'Zancadas caminando',
      'Zancadas estáticas'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 15,
    nombre: 'Hip thrust',
    grupo: 'Piernas',
    series: 4,
    reps: 10,
    dificultad: 'media',
    equipo: ['barra', 'banco', 'peso corporal'],
    variantes: [
      'Hip thrust con barra',
      'Hip thrust con peso corporal'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 16,
    nombre: 'Extensión de cuádriceps',
    grupo: 'Piernas',
    series: 3,
    reps: 15,
    dificultad: 'baja',
    equipo: ['máquina'],
    variantes: [
      'Extensión en máquina'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 17,
    nombre: 'Curl femoral',
    grupo: 'Piernas',
    series: 3,
    reps: 15,
    dificultad: 'baja',
    equipo: ['máquina'],
    variantes: [
      'Curl acostado',
      'Curl sentado'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 18,
    nombre: 'Elevaciones frontales',
    grupo: 'Hombros',
    series: 3,
    reps: 12,
    dificultad: 'baja',
    equipo: ['mancuernas'],
    variantes: [
      'Elevaciones con mancuernas',
      'Elevaciones con disco'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 19,
    nombre: 'Encogimientos',
    grupo: 'Hombros',
    series: 3,
    reps: 15,
    dificultad: 'baja',
    equipo: ['mancuernas'],
    variantes: [
      'Encogimientos con mancuernas',
      'Encogimientos con barra'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 20,
    nombre: 'Extensión tríceps',
    grupo: 'Brazos',
    series: 3,
    reps: 12,
    dificultad: 'baja',
    equipo: ['polea'],
    variantes: [
      'Extensión en polea',
      'Extensión con mancuerna'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 21,
    nombre: 'Plancha',
    grupo: 'Core',
    series: 3,
    reps: 30,
    dificultad: 'baja',
    equipo: ['sin equipo', 'peso corporal'],
    variantes: [
      'Plancha frontal',
      'Plancha lateral'
    ],
    tipo: 'ejercicio'
  },
  {
    id: 22,
    nombre: 'Crunch',
    grupo: 'Core',
    series: 3,
    reps: 20,
    dificultad: 'baja',
    equipo: ['peso corporal'],
    variantes: [
      'Crunch clásico',
      'Crunch en máquina'
    ],
    tipo: 'ejercicio'
  }
  ,
  {
    id: 101,
    nombre: 'Rotación de hombros',
    grupo: 'Movilidad',
    series: 2,
    reps: 15,
    dificultad: 'baja',
    equipo: ['sin equipo'],
    variantes: ['Rotación hacia adelante', 'Rotación hacia atrás'],
    tipo: 'entrada'
  },
  {
    id: 102,
    nombre: 'Rotación de cadera',
    grupo: 'Movilidad',
    series: 2,
    reps: 15,
    dificultad: 'baja',
    equipo: ['sin equipo'],
    variantes: ['Círculos amplios', 'Círculos controlados'],
    tipo: 'entrada'
  },
  {
    id: 103,
    nombre: 'Jumping jacks',
    grupo: 'Cardio',
    series: 2,
    reps: 30,
    dificultad: 'baja',
    equipo: ['sin equipo'],
    variantes: ['Ritmo constante', 'Ritmo rápido'],
    tipo: 'entrada'
  },
  {
    id: 104,
    nombre: 'Skipping',
    grupo: 'Cardio',
    series: 2,
    reps: 30,
    dificultad: 'baja',
    equipo: ['sin equipo'],
    variantes: ['Skipping bajo', 'Skipping alto'],
    tipo: 'entrada'
  },
  {
    id: 105,
    nombre: 'Flexiones inclinadas',
    grupo: 'Pecho',
    series: 2,
    reps: 15,
    dificultad: 'baja',
    equipo: ['peso corporal'],
    variantes: ['Manos en banco', 'Manos en pared'],
    tipo: 'entrada'
  },
  {
    id: 106,
    nombre: 'Remo con banda',
    grupo: 'Espalda',
    series: 2,
    reps: 15,
    dificultad: 'baja',
    equipo: ['banda'],
    variantes: ['Agarre ancho', 'Agarre cerrado'],
    tipo: 'entrada'
  },
  {
    id: 107,
    nombre: 'Sentadilla libre (calentamiento)',
    grupo: 'Piernas',
    series: 2,
    reps: 15,
    dificultad: 'baja',
    equipo: ['peso corporal'],
    variantes: ['Lenta', 'Con pausa'],
    tipo: 'entrada'
  },
  {
    id: 108,
    nombre: 'Plancha (calentamiento)',
    grupo: 'Core',
    series: 2,
    reps: 30,
    dificultad: 'baja',
    equipo: ['sin equipo'],
    variantes: ['Plancha frontal', 'Plancha corta'],
    tipo: 'entrada'
  }
];

