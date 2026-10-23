// Órdenes en los que se puede consultar el índice.
//
// Cada uno saca su cifra de UNA sección del impreso y la etiqueta con el
// nombre de esa sección. Dos cosas que no hace, y no por descuido:
//
//   - No suma secciones entre sí. Un total tendría que dejar fuera el
//     valor de los inmuebles, que el formulario oficial no pide: saldría
//     una cifra que parece el patrimonio de alguien y no lo es. Es la
//     regla 8 de docs/AGENTS.md.
//   - No hay un orden por «casas». La sección se llama bienes inmuebles y
//     ahí dentro hay trasteros, plazas de garaje, naves industriales y
//     fincas rústicas; además `clase` es texto libre y en las 69 partidas
//     publicadas aparece con 35 grafías distintas («PISO», «Vivienda
//     habitual», «Vivienda unifamiliar. Tierra cultivo y bosque»…).
//     Separar las viviendas sería interpretar ese campo, y aquí lo que no
//     se puede afirmar no se afirma.
//
// Por lo mismo, el orden de inmuebles cuenta PARTIDAS y no inmuebles: hay
// filas que agrupan varias («13 fincas rústicas», «4 fincas urbanas», «2
// plazas de garaje»), así que llamar inmueble a cada fila sería contar
// mal. La cifra es un mínimo y la nota lo dice. Sacar el número de dentro
// del texto es justo la interpretación que no se hace: no cubriría «varias
// fincas» ni «8 finchas rústicas», que es como está escrita una de ellas.

import { formatEuros } from './formato.js';

// Una partida declarada sin importe legible no puede contar como 0: la
// suma saldría por debajo de la real y la clasificación mentiría. Se suma
// lo que hay y se avisa de que la cifra es un mínimo.
//
// Hoy no pasa en ninguna de las declaraciones publicadas, pero el esquema
// admite null en todos los campos numéricos, así que pasará.
function sumaDe(filas, campo) {
  const partidas = filas || [];

  // Sección vacía no es «cero euros declarados», es que no hay nada
  // declarado. Son cosas distintas y se pintan distinto: '—' y no '0 €'.
  if (partidas.length === 0) {
    return { valor: null, incompleta: false };
  }

  return {
    valor: partidas.reduce((total, fila) => total + (fila[campo] || 0), 0),
    incompleta: partidas.some(fila => fila[campo] == null),
  };
}

// Contar filas no interpreta nada: cero partidas son cero bienes, y eso
// sí se puede afirmar.
function cuentaDe(filas) {
  return { valor: (filas || []).length, incompleta: false };
}

const plural = (valor, singular, plural) => `${valor} ${valor === 1 ? singular : plural}`;

export const ORDENES = [
  {
    clave: 'grupo',
    etiqueta: 'Grupo',
  },
  {
    clave: 'depositos',
    etiqueta: 'Depósitos',
    titulo: 'Más declarado en depósitos',
    nota: 'Suma los saldos de la sección de depósitos: cuentas corrientes, a plazo y asimilados.',
    cifra: declaracion => sumaDe(declaracion.depositos, 'saldo_euros'),
    formato: formatEuros,
  },
  {
    clave: 'inmuebles',
    etiqueta: 'Inmuebles',
    titulo: 'Más partidas de bienes inmuebles',
    nota: 'Cuenta las partidas de la sección de bienes inmuebles, donde hay viviendas pero también garajes, trasteros, locales y fincas. Una partida puede agrupar varios bienes («13 fincas rústicas» cuenta como una), así que la cifra es un mínimo.',
    cifra: declaracion => cuentaDe(declaracion.bienes_inmuebles),
    formato: valor => plural(valor, 'partida', 'partidas'),
  },
  {
    clave: 'vehiculos',
    etiqueta: 'Vehículos',
    titulo: 'Más vehículos declarados',
    nota: 'Cuenta las partidas de la sección de vehículos: ahí cada una es un vehículo, con su marca y su fecha de adquisición.',
    cifra: declaracion => cuentaDe(declaracion.vehiculos),
    formato: valor => plural(valor, 'vehículo', 'vehículos'),
  },
  {
    clave: 'rentas',
    etiqueta: 'Rentas',
    titulo: 'Más rentas anuales declaradas',
    nota: 'Suma las rentas anuales que declara cada diputado. No es su patrimonio: son ingresos de un año.',
    cifra: declaracion => sumaDe(declaracion.rentas, 'euros'),
    formato: formatEuros,
  },
];

export const ordenPor = clave => ORDENES.find(orden => orden.clave === clave);

// De mayor a menor, y las secciones vacías al final: por debajo incluso
// de un 0, porque un 0 declarado dice algo y un hueco no dice nada.
export function compararCifras(a, b) {
  if (a.valor == null && b.valor == null) {
    return 0;
  }
  if (a.valor == null) {
    return 1;
  }
  if (b.valor == null) {
    return -1;
  }
  return b.valor - a.valor;
}
