// Mismo formateo que Playground.js: null/undefined -> '—', resto en euros es-ES.
export const formatEuros = value =>
  value == null ? '—' : value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export function initials(nombre) {
  if (!nombre) {
    return '?';
  }
  const parts = nombre.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export const partidoDe = d => d.partido || 'Sin partido';

// U+0300–U+036F son las marcas diacríticas que NFD deja sueltas tras
// separarlas de su letra. Va con `new RegExp` y no con un literal /…/g
// porque dentro de un literal habría que teclear los caracteres
// combinantes de verdad: invisibles en el editor y fáciles de romper al
// copiar y pegar.
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

// Minúsculas y sin tildes, para que «alos» encuentre a «Alós López» y
// «munoz» a «Muñoz»: quien busca a un diputado por el apellido no tiene
// por qué acertar con los acentos. El buscador compara siempre contra
// esto, nunca contra el texto tal cual se muestra.
export const normaliza = texto =>
  (texto || '')
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase();
