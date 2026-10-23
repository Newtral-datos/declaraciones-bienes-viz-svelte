<script>
  import Avatar from './Avatar.svelte';
  import DeclaracionDetalle from './DeclaracionDetalle.svelte';
  import { partidoDe, normaliza } from './formato.js';
  import { ORDENES, ordenPor, compararCifras } from './ordenes.js';

  // Navegación de tres niveles, igual que DeclaracionesNav en Playground.js:
  //   1) índice de grupos  2) diputados del grupo  3) ficha completa
  //
  // Y dos mandos ortogonales que se cruzan con ella: el buscador elige
  // QUIÉNES salen y el orden EN QUÉ ORDEN. Al ser independientes se
  // combinan, y de ahí sale gratis lo que si no habría que programar
  // aparte: ordenar por vehículos dentro del PP, o buscar «madrid» y ver
  // quién declara más depósitos de los diputados por Madrid.
  let { declaraciones } = $props();

  let selectedPartido = $state(null);
  let selectedFuente = $state(null);
  let consulta = $state('');
  let orden = $state('grupo');

  // Ordenado por número de declaraciones, no alfabéticamente: es la única
  // jerarquía que da el dato, y los puntos conductores llevan el ojo a
  // cifras que así se pueden comparar de un vistazo.
  let grupos = $derived.by(() => {
    const cuenta = new Map();
    for (const declaracion of declaraciones) {
      const partido = partidoDe(declaracion);
      cuenta.set(partido, (cuenta.get(partido) || 0) + 1);
    }
    return [...cuenta]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'));
  });

  // Por palabras y no por cadena entera, para que «alos ana» encuentre a
  // «Ana Isabel Alós López»: quien busca recuerda el nombre y el
  // apellido, rara vez el orden del impreso.
  let terminos = $derived(normaliza(consulta).split(/\s+/).filter(Boolean));
  let buscando = $derived(terminos.length > 0);

  // Delante, quien tiene una palabra del nombre que empieza por lo
  // escrito: teclear «alos» es buscar a Alós, no a cualquiera que lleve
  // esas letras en medio. Detrás, los que coinciden por el grupo o la
  // provincia.
  //
  // Dentro de cada grupo, alfabético por el nombre completo. No por
  // apellido: en castellano se archiva por el primero, y saber dónde
  // acaban los nombres de pila y empieza el apellido no se puede deducir
  // de «Cayetana Álvarez de Toledo Peralta-Ramos». Antes que inventar un
  // criterio que falle en la mitad de las fichas, un orden que se explica.
  let resultados = $derived.by(() => {
    if (!buscando) {
      return [];
    }
    const empiezaPor = declaracion =>
      normaliza(declaracion.nombre)
        .split(/\s+/)
        .some(palabra => palabra.startsWith(terminos[0]))
        ? 0
        : 1;

    return declaraciones
      .filter(declaracion => {
        const campos = normaliza(
          `${declaracion.nombre} ${partidoDe(declaracion)} ${declaracion.circunscripcion || ''}`
        );
        return terminos.every(termino => campos.includes(termino));
      })
      .sort((a, b) => empiezaPor(a) - empiezaPor(b) || a.nombre.localeCompare(b.nombre, 'es'));
  });

  let diputados = $derived(
    selectedPartido ? declaraciones.filter(d => partidoDe(d) === selectedPartido) : []
  );

  // Buscar es ir a por alguien de todo el registro, así que la consulta
  // manda sobre el grupo abierto mientras esté escrita.
  let enGrupo = $derived(Boolean(selectedPartido) && !buscando);
  let ambito = $derived(buscando ? resultados : enGrupo ? diputados : declaraciones);

  let clasificando = $derived(orden !== 'grupo');
  let ordenActivo = $derived(ordenPor(orden));

  // El índice de grupos sólo tiene sentido en la portada, sin filtrar y
  // sin ordenar por cifra: en cuanto pasa cualquiera de las tres cosas, lo
  // que se lista son personas.
  let vista = $derived(
    clasificando ? 'clasificacion' : buscando ? 'resultados' : enGrupo ? 'grupo' : 'grupos'
  );

  // Empate a cifra, alfabético, para que la lista no baile entre recargas.
  let clasificacion = $derived.by(() => {
    if (!clasificando) {
      return [];
    }
    return ambito
      .map(declaracion => ({ declaracion, ...ordenActivo.cifra(declaracion) }))
      .sort(
        (a, b) =>
          compararCifras(a, b) || a.declaracion.nombre.localeCompare(b.declaracion.nombre, 'es')
      );
  });

  let hayCifrasIncompletas = $derived(clasificacion.some(entrada => entrada.incompleta));

  let declaracionSeleccionada = $derived(
    selectedFuente ? declaraciones.find(d => d.fuente_pdf === selectedFuente) : null
  );

  let tituloIndice = $derived(
    vista === 'clasificacion'
      ? ordenActivo.titulo
      : vista === 'resultados'
        ? 'Resultados'
        : 'Índice por grupo'
  );

  let notaIndice = $derived.by(() => {
    const cuantas = ambito.length;
    const unidad = cuantas === 1 ? 'declaración' : 'declaraciones';
    if (buscando) {
      return `${cuantas} ${unidad} de ${declaraciones.length}`;
    }
    if (vista === 'grupos') {
      return `${cuantas} ${unidad} · ${grupos.length} grupos`;
    }
    return `${cuantas} ${unidad}`;
  });

  function volverAlIndice() {
    selectedFuente = null;
    selectedPartido = null;
    consulta = '';
  }

  function abrirGrupo(nombre) {
    selectedPartido = nombre;
    selectedFuente = null;
    consulta = '';
  }

  function alTeclearEnBuscador(evento) {
    if (evento.key === 'Escape') {
      consulta = '';
    }
    // Enter abre el primero de la lista: con el nombre escrito entero
    // suele ser el único, y es el camino corto que pide un buscador.
    if (evento.key === 'Enter') {
      const primero = clasificando ? clasificacion[0]?.declaracion : ambito[0];
      if (primero) {
        evento.preventDefault();
        selectedFuente = primero.fuente_pdf;
      }
    }
  }
</script>

{#snippet mandos()}
  <div class="b-registro__orders">
    <span class="b-registro__order-label" id="registro-orden">Ordenar por</span>
    <div class="b-registro__order-tabs" role="group" aria-labelledby="registro-orden">
      {#each ORDENES as opcion (opcion.clave)}
        <button
          type="button"
          class="b-registro__order-tab{orden === opcion.clave
            ? ' b-registro__order-tab--activo'
            : ''}"
          aria-pressed={orden === opcion.clave}
          onclick={() => (orden = opcion.clave)}
        >
          {opcion.etiqueta}
        </button>
      {/each}
    </div>
  </div>

  <div class="b-registro__search">
    <label class="b-registro__search-label" for="registro-buscar">Buscar</label>
    <input
      id="registro-buscar"
      class="b-registro__search-input"
      type="text"
      autocomplete="off"
      spellcheck="false"
      enterkeyhint="go"
      placeholder="Nombre, grupo o circunscripción"
      bind:value={consulta}
      onkeydown={alTeclearEnBuscador}
    />
    {#if consulta}
      <button type="button" class="b-registro__search-clear" onclick={() => (consulta = '')}>
        Borrar
      </button>
    {/if}
  </div>
{/snippet}

{#snippet filaDiputado(declaracion, posicion, cifra)}
  <button
    type="button"
    class="b-registro__result"
    onclick={() => (selectedFuente = declaracion.fuente_pdf)}
  >
    {#if posicion}
      <span class="b-registro__result-rank">{posicion}</span>
    {/if}
    <Avatar
      class="b-registro__result-photo"
      nombre={declaracion.nombre}
      fotoUrl={declaracion.foto_url}
    />
    <span class="b-registro__result-text">
      <span class="b-registro__result-name">{declaracion.nombre}</span>
      <span class="b-registro__result-meta">
        {partidoDe(declaracion)} · {declaracion.circunscripcion || '—'}
      </span>
    </span>
    <span class="b-registro__result-dots" aria-hidden="true"></span>
    {#if cifra}
      <span class="b-registro__result-figure">
        {ordenActivo.formato(cifra.valor)}{#if cifra.incompleta}<span
            class="b-registro__result-flag"
            title="Hay partidas declaradas sin importe legible: la cifra es un mínimo">*</span
          >{/if}
      </span>
    {/if}
    <span class="b-registro__party-go" aria-hidden="true">→</span>
  </button>
{/snippet}

{#if declaracionSeleccionada}
  <!-- Nivel 3: ficha de un diputado concreto -->
  {@const grupo = partidoDe(declaracionSeleccionada)}
  <nav class="b-registro__trail" aria-label="Dónde estás">
    <button type="button" class="b-registro__back" onclick={() => (selectedFuente = null)}>
      <span class="b-registro__back-arrow" aria-hidden="true">←</span>
      {clasificando ? ordenActivo.etiqueta : buscando ? 'Resultados' : grupo}
    </button>
    <p class="b-registro__crumbs">
      <button type="button" class="b-registro__crumb" onclick={volverAlIndice}>Índice</button>
      <span class="b-registro__crumb-sep" aria-hidden="true">/</span>
      <button type="button" class="b-registro__crumb" onclick={() => abrirGrupo(grupo)}>
        {grupo}
      </button>
      <span class="b-registro__crumb-sep" aria-hidden="true">/</span>
      <span class="b-registro__crumb--current" aria-current="page">
        {declaracionSeleccionada.nombre}
      </span>
    </p>
  </nav>

  <DeclaracionDetalle declaracion={declaracionSeleccionada} />
{:else}
  {#if enGrupo}
    <nav class="b-registro__trail" aria-label="Dónde estás">
      <button type="button" class="b-registro__back" onclick={volverAlIndice}>
        <span class="b-registro__back-arrow" aria-hidden="true">←</span>
        Índice
      </button>
      <p class="b-registro__crumbs">
        <button type="button" class="b-registro__crumb" onclick={volverAlIndice}>Índice</button>
        <span class="b-registro__crumb-sep" aria-hidden="true">/</span>
        <span class="b-registro__crumb--current" aria-current="page">{selectedPartido}</span>
      </p>
    </nav>
  {/if}

  <div class="b-registro__index">
    <!-- Dentro de un grupo manda su nombre; fuera, lo que se está
         consultando: el índice, unos resultados o una clasificación. -->
    {#if enGrupo}
      <div class="b-registro__level">
        <h2 class="b-registro__level-title">{selectedPartido}</h2>
        <span class="b-registro__index-note">{notaIndice}</span>
      </div>
    {:else}
      <div class="b-registro__index-head">
        <h2 class="b-registro__index-title">{tituloIndice}</h2>
        <span class="b-registro__index-note" aria-live="polite">{notaIndice}</span>
      </div>
    {/if}

    {@render mandos()}

    {#if clasificando && ordenActivo.nota}
      <p class="b-registro__caption">{ordenActivo.nota}</p>
    {/if}

    {#if vista === 'grupos'}
      {#each grupos as grupo (grupo.nombre)}
        <button type="button" class="b-registro__party" onclick={() => abrirGrupo(grupo.nombre)}>
          <span class="b-registro__party-name">{grupo.nombre}</span>
          <span class="b-registro__party-dots" aria-hidden="true"></span>
          <span class="b-registro__party-count">
            {grupo.total}<span class="b-registro__party-unit">
              {grupo.total === 1 ? 'declaración' : 'declaraciones'}
            </span>
          </span>
          <span class="b-registro__party-go" aria-hidden="true">→</span>
        </button>
      {/each}
    {:else if vista === 'clasificacion'}
      {#each clasificacion as entrada, indice (entrada.declaracion.fuente_pdf)}
        {@render filaDiputado(entrada.declaracion, indice + 1, entrada)}
      {/each}

      {#if hayCifrasIncompletas}
        <p class="b-registro__footnote">
          * Esa declaración tiene alguna partida sin importe legible en el PDF: la cifra es un
          mínimo, no el total.
        </p>
      {/if}
    {:else if vista === 'grupo'}
      <div class="b-registro__people">
        {#each diputados as declaracion (declaracion.fuente_pdf)}
          <button
            type="button"
            class="b-registro__person"
            onclick={() => (selectedFuente = declaracion.fuente_pdf)}
          >
            <Avatar
              class="b-registro__person-photo"
              nombre={declaracion.nombre}
              fotoUrl={declaracion.foto_url}
            />
            <span class="b-registro__person-text">
              <span class="b-registro__person-name">{declaracion.nombre}</span>
              <span class="b-registro__person-meta">{declaracion.circunscripcion || '—'}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else}
      {#each resultados as declaracion (declaracion.fuente_pdf)}
        {@render filaDiputado(declaracion, null, null)}
      {/each}
    {/if}

    {#if buscando && ambito.length === 0}
      <div class="b-registro__notice">
        <span class="b-registro__notice-label">Ningún diputado coincide</span>
        <p class="b-registro__notice-text">
          No hay nadie que responda a «{consulta}» entre las declaraciones publicadas. Prueba con
          el apellido, el grupo o la provincia.
        </p>
      </div>
    {/if}
  </div>
{/if}
