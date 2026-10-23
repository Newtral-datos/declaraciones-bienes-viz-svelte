<script>
  import { initials } from './formato.js';

  // Equivalente al componente Avatar de Playground.js: si hay foto se
  // pinta el <img> y, si falla la carga, se cae a las iniciales.
  let { nombre, fotoUrl, class: className } = $props();

  let hasError = $state(false);
</script>

{#if fotoUrl && !hasError}
  <img class={className} src={fotoUrl} alt={nombre} onerror={() => (hasError = true)} />
{:else}
  <span class={className}>{initials(nombre)}</span>
{/if}
