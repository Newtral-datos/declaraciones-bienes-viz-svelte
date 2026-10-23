<script>
  import logoTransparentia from '../assets/logo_transparentia.png';
  import { formatEuros, enFemenino } from './formato.js';

  let { declaracion } = $props();
</script>

{#if declaracion.url_transparentia}
  <a
    class="b-declaracion__transparentia-card"
    href={declaracion.url_transparentia}
    target="_blank"
    rel="noreferrer"
  >
    <div class="b-declaracion__transparentia-banner">
      <img class="b-declaracion__transparentia-logo" src={logoTransparentia} alt="Transparentia" />
    </div>
    <div class="b-declaracion__transparentia-info">
      <span class="b-declaracion__transparentia-name">{declaracion.nombre}</span>
      <span class="b-declaracion__transparentia-role">
        {enFemenino(declaracion.cargo, declaracion.genero)}{declaracion.circunscripcion
          ? ` de ${declaracion.circunscripcion}`
          : ''}
      </span>
      {#if declaracion.sueldo_real_euros != null}
        <span class="b-declaracion__transparentia-salary">
          <strong>{formatEuros(declaracion.sueldo_real_euros)}</strong> (sueldo anual)
        </span>
      {/if}
    </div>
  </a>
{/if}
