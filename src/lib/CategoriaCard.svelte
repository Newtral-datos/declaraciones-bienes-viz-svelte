<script>
  // meta: { titulo, icon (svg), color, bg } de CATEGORIAS
  // filas: array de partidas de la declaración
  // render: fila -> { label, meta?, value? }
  let { meta, filas, render } = $props();

  let isEmpty = $derived(!filas || filas.length === 0);
</script>

<div class="b-declaracion__card{isEmpty ? ' b-declaracion__card--empty' : ''}">
  <div class="b-declaracion__card-header">
    <span class="b-declaracion__card-icon" style="background-color: {meta.bg}; color: {meta.color};">
      {@html meta.icon}
    </span>
    <span class="b-declaracion__card-title">{meta.titulo}</span>
  </div>

  {#if isEmpty}
    <p class="b-declaracion__empty-text">Nada declarado en esta categoría.</p>
  {:else}
    {#each filas as fila, index (index)}
      {@const row = render(fila)}
      <div class="b-declaracion__row">
        <span class="b-declaracion__row-label">
          {row.label}
          {#if row.meta}<span class="b-declaracion__row-meta">{row.meta}</span>{/if}
        </span>
        {#if row.value}<span class="b-declaracion__row-value">{row.value}</span>{/if}
      </div>
    {/each}
  {/if}
</div>
