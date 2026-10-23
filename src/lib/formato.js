// Como en Playground.js —null/undefined -> '—', resto en euros es-ES— con
// una diferencia: el punto de los millares también en las cifras de cuatro
// dígitos.
//
// es-ES no lo pone («6238,92 €»): la convención del español reserva el
// separador para cinco dígitos en adelante, y así lo trae el ICU de los
// navegadores en `minimumGroupingDigits`. Pero aquí las cifras se leen en
// columna, unas debajo de otras, y una sin punto en medio de otras que lo
// llevan se lee como de otro orden de magnitud. Se gana más alineando la
// columna que respetando la regla.
//
// `useGrouping: 'always'` es de Intl.NumberFormat v3 (Chrome 106, Safari
// 16.4, Firefox 116). En un navegador anterior el valor se interpretaba
// como booleano, así que 'always' vale true y se queda en el
// comportamiento de hoy: no se rompe, sólo no mejora.
export const formatEuros = value =>
  value == null
    ? '—'
    : value.toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR',
        useGrouping: 'always',
      });

export function initials(nombre) {
  if (!nombre) {
    return '?';
  }
  const parts = nombre.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export const partidoDe = d => d.partido || 'Sin partido';

// El impreso oficial sólo trae el masculino —«Casado», «Diputado»— para
// todo el mundo, pero el JSON trae `genero`, así que la ficha sí puede
// concordar.
//
// Mapa cerrado y no la regla «-o final → -a»: con la regla, un futuro
// «Pareja de hecho» saldría «Pareja de hecha». Lo que no esté en el mapa
// se pinta tal cual viene, que es peor estilo pero nunca una palabra
// inventada.
const FEMENINO = {
  Casado: 'Casada',
  Soltero: 'Soltera',
  Divorciado: 'Divorciada',
  Separado: 'Separada',
  Viudo: 'Viuda',
  Diputado: 'Diputada',
};

// `genero` viene 'H', 'M' o vacío. Sin dato no se toca nada: deducir el
// género de alguien por su nombre de pila es justo la clase de inferencia
// que aquí no se hace.
export const enFemenino = (texto, genero) =>
  genero === 'M' ? FEMENINO[texto] || texto : texto;

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
