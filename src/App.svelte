<script>
  import DeclaracionesNav from './lib/DeclaracionesNav.svelte';
  import { partidoDe } from './lib/formato.js';

  // Misma carga que Playground.js: el JSON que publica el backoffice al
  // sincronizar, sin caché para ver los cambios al recargar. La ruta cuelga de
  // BASE_URL ('/' en dev, '/<repo>/' en GitHub Pages).
  const DATOS_URL = `${import.meta.env.BASE_URL}data/declaraciones-bienes.json`;

  let declaraciones = $state(null);
  let hasDeclaracionesError = $state(false);

  $effect(() => {
    fetch(DATOS_URL, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudieron cargar las declaraciones de bienes');
        }
        return response.json();
      })
      .then(data => (declaraciones = data))
      .catch(() => (hasDeclaracionesError = true));
  });

  let totalGrupos = $derived(
    declaraciones ? new Set(declaraciones.map(partidoDe)).size : 0
  );
</script>

<div id="content" class="page-content">
  <header class="b-registro__masthead">
    <div class="container b-registro__masthead-inner">
      <p class="b-registro__admin">
        <span>Diputación Permanente del Congreso | XV Legislatura</span>
        <span>Fuente: congreso.es</span>
      </p>

      <!-- Vive en public/, así que la URL cuelga de BASE_URL como la del
           JSON: en GitHub Pages la viz no está en la raíz del dominio.
           Las medidas van en el atributo para que el hueco esté reservado
           antes de que cargue y la cabecera no dé un salto. -->
      <img
        class="b-registro__logo"
        src="{import.meta.env.BASE_URL}logo_newtral.png"
        alt="Newtral"
        width="1143"
        height="236"
      />

      <h1 class="b-registro__title">Declaraciones de bienes y rentas</h1>

      <p class="b-registro__lede">
        Rentas, inmuebles, depósitos, vehículos y deudas de cada diputado
        de la diputación Permanente, tal y como los declara ante el Congreso.
      </p>

      <!-- El sello se pinta desde el principio con guiones en lugar de las
           cifras: si esperara a tener datos, la cabecera daría un salto al
           cargar. -->
      <div class="b-registro__stamp">
        <span class="b-registro__stamp-label">Verificado a mano</span>
        <span class="b-registro__stamp-figure">
          {declaraciones ? declaraciones.length : '—'} declaraciones<br />
          {totalGrupos || '—'} grupos parlamentarios
        </span>
        <span class="b-registro__stamp-rule"></span>
        <span class="b-registro__stamp-ref">Libro II | Legislatura XV</span>
      </div>
    </div>
  </header>

  <main class="container">
    {#if hasDeclaracionesError}
      <div class="b-registro__notice b-registro__notice--error">
        <span class="b-registro__notice-label">No se ha podido cargar el registro</span>
        <p class="b-registro__notice-text">
          Recarga la página. Si vuelve a fallar, el fichero de datos no está disponible.
        </p>
      </div>
    {:else if !declaraciones}
      <div class="b-registro__notice">
        <span class="b-registro__notice-bar"></span>
        <span class="b-registro__notice-label">Cargando el registro</span>
        <p class="b-registro__notice-text">Leyendo las declaraciones publicadas.</p>
      </div>
    {:else if declaraciones.length === 0}
      <div class="b-registro__notice">
        <span class="b-registro__notice-label">Registro vacío</span>
        <p class="b-registro__notice-text">
          Todavía no hay ninguna declaración publicada. Aparecerán aquí a medida que se
          verifiquen contra su PDF.
        </p>
      </div>
    {:else}
      <DeclaracionesNav {declaraciones} />
    {/if}
  </main>
</div>
