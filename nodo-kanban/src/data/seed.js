export const TEAM = ['Ana', 'Luis', 'Marta', 'Juan', 'María'];

export const STATUSES = [
  { id: 0, key: 'pending', label: 'Pendiente' },
  { id: 1, key: 'in_progress', label: 'En progreso' },
  { id: 2, key: 'done', label: 'Completado' },
];

export const PRIORITIES = ['Baja', 'Media', 'Alta'];

export const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const todayStr = () => dayOffset(0);

export const normalizeText = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getHue = (s) =>
  [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export const createInitialProjects = () => [
  {
    id: 1,
    name: 'Lanzamiento web',
    tasks: [
      {
        id: 1,
        title: 'Diseñar landing page',
        description: 'Definir hero, propuesta de valor y versión responsive.',
        status: 0,
        priority: 2,
        assignee: 'Ana',
        tags: ['diseño', 'frontend'],
        due: dayOffset(1),
        comments: [],
      },
      {
        id: 2,
        title: 'Configurar base de datos',
        description: 'Crear tablas iniciales y migraciones.',
        status: 1,
        priority: 2,
        assignee: 'Luis',
        tags: ['backend', 'urgente'],
        due: dayOffset(3),
        comments: [
          { id: 'c1', user: 'Luis', text: 'Ya tengo el esquema listo.', at: Date.now() - 7200000 },
          { id: 'c2', user: 'Ana', text: 'Perfecto, lo reviso hoy.', at: Date.now() - 3600000 },
        ],
      },
      {
        id: 3,
        title: 'Redactar textos en español',
        description: '',
        status: 0,
        priority: 1,
        assignee: 'Marta',
        tags: ['contenido'],
        due: dayOffset(5),
        comments: [],
      },
      {
        id: 4,
        title: 'Registrar dominio',
        description: 'Configurar registros DNS y certificado SSL.',
        status: 2,
        priority: 0,
        assignee: 'Ana',
        tags: ['ops'],
        due: dayOffset(-2),
        comments: [],
      },
      {
        id: 5,
        title: 'API de autenticación',
        description: 'JWT y refresco de tokens.',
        status: 1,
        priority: 2,
        assignee: 'María',
        tags: ['backend', 'urgente'],
        due: dayOffset(2),
        comments: [],
      },
      {
        id: 6,
        title: 'Corregir bug del login móvil',
        description: 'El teclado cubre el botón en pantallas pequeñas.',
        status: 0,
        priority: 2,
        assignee: 'Juan',
        tags: ['bug', 'frontend', 'urgente'],
        due: dayOffset(-1),
        comments: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Soporte clientes',
    tasks: [
      {
        id: 7,
        title: 'Responder tickets pendientes',
        description: '',
        status: 1,
        priority: 1,
        assignee: 'Marta',
        tags: ['soporte'],
        due: dayOffset(0),
        comments: [],
      },
      {
        id: 8,
        title: 'Crear base de conocimiento',
        description: '',
        status: 0,
        priority: 0,
        assignee: 'Juan',
        tags: ['soporte', 'contenido'],
        due: dayOffset(9),
        comments: [],
      },
    ],
  },
];