// Puerto de parlamentia-web/src/elements/Playground/DeclaracionIcons.js
//
// Allí cada icono era un componente React que escupía un <svg>. Aquí el
// SVG va como cadena y la tarjeta lo inyecta con {@html}: mismo marcado
// de salida, sin un fichero .svelte por icono.

const BASE_ATTRS =
  'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const svg = paths => `<svg ${BASE_ATTRS}>${paths}</svg>`;

export const ICON_COIN = svg(`
  <circle cx="12" cy="12" r="9" />
  <path d="M9.5 15.2c.5.7 1.4 1.1 2.5 1.1 1.7 0 3-1 3-2.3 0-1.4-1.2-2-3-2.4-1.8-.4-3-1-3-2.4C9 8 10.3 7 12 7c1.1 0 2 .4 2.5 1.1" />
  <path d="M12 6v1.2M12 16.3V17.5" />
`);

export const ICON_HOME = svg(`
  <path d="M4 11.5 12 4l8 7.5" />
  <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
`);

export const ICON_BANK = svg(`
  <path d="M3 10.5 12 5l9 5.5" />
  <path d="M5 10.5V19M9.5 10.5V19M14.5 10.5V19M19 10.5V19" />
  <path d="M3.5 19h17" />
`);

export const ICON_CAR = svg(`
  <path d="M4.5 16V12l2-4.5h11l2 4.5v4" />
  <path d="M4.5 16h15M6.5 16v2M17.5 16v2" />
  <circle cx="7.5" cy="16" r="1.4" />
  <circle cx="16.5" cy="16" r="1.4" />
`);

export const ICON_TRENDING_UP = svg(`
  <path d="M4 16.5 10 10l3.5 3.5L20 6.5" />
  <path d="M14.5 6.5H20v5.5" />
`);

export const ICON_ALERT_TRIANGLE = svg(`
  <path d="M12 4 21 19H3z" />
  <path d="M12 10v4M12 16.8v.2" />
`);

export const ICON_BOX = svg(`
  <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
  <path d="M3.5 8v8l8.5 4 8.5-4V8M12 12v8" />
`);

export const CATEGORIAS = {
  rentas: { titulo: 'Rentas percibidas', icon: ICON_COIN, color: '#739b67', bg: '#e2f1e6' },
  bienes_inmuebles: { titulo: 'Bienes inmuebles', icon: ICON_HOME, color: '#6595cf', bg: '#eaf1fa' },
  depositos: { titulo: 'Depósitos', icon: ICON_BANK, color: '#7f5a81', bg: '#f2ebf3' },
  vehiculos: { titulo: 'Vehículos', icon: ICON_CAR, color: '#e39264', bg: '#fbeee3' },
  deuda_publica_y_acciones: {
    titulo: 'Deuda pública y acciones',
    icon: ICON_TRENDING_UP,
    color: '#c9a227',
    bg: '#faf3dd',
  },
  otros_bienes_no_declarados: { titulo: 'Otros bienes', icon: ICON_BOX, color: '#5e5e5e', bg: '#f0f0f0' },
  deudas: { titulo: 'Deudas y préstamos', icon: ICON_ALERT_TRIANGLE, color: '#dd7461', bg: '#fdeae7' },
};
