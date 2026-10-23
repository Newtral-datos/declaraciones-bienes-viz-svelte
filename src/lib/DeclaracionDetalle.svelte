<script>
  import Avatar from './Avatar.svelte';
  import TransparentiaCard from './TransparentiaCard.svelte';
  import CategoriaCard from './CategoriaCard.svelte';
  import { CATEGORIAS } from './categorias.js';
  import { formatEuros, enFemenino } from './formato.js';

  let { declaracion } = $props();

  let totalRentas = $derived((declaracion.rentas || []).reduce((sum, r) => sum + (r.euros || 0), 0));
  let totalDepositos = $derived(
    (declaracion.depositos || []).reduce((sum, r) => sum + (r.saldo_euros || 0), 0)
  );

  // Mismo orden y mismos campos que el array `categorias` de Playground.js
  let categorias = $derived([
    {
      key: 'rentas',
      filas: declaracion.rentas,
      render: r => ({ label: r.concepto, value: formatEuros(r.euros) }),
    },
    {
      key: 'bienes_inmuebles',
      filas: declaracion.bienes_inmuebles,
      render: r => ({
        label: r.clase,
        meta: `${r.situacion || '—'} | ${r.fecha_adquisicion || '—'}`,
        value: r.derecho_titulo,
        // El único valor del impreso que no es una cifra ni una fecha: el
        // título de propiedad, texto libre que llega a 54 caracteres
        // («12,48% PLENO DOMINIOHERENCIA GRUCOCA INMOBILIARIA S.L.»).
        // Sin esto se pinta como una cifra —en una línea y sin encogerse—
        // y se sale de la tarjeta.
        texto: true,
      }),
    },
    {
      key: 'depositos',
      filas: declaracion.depositos,
      render: r => ({ label: r.tipo, value: formatEuros(r.saldo_euros) }),
    },
    {
      key: 'vehiculos',
      filas: declaracion.vehiculos,
      render: r => ({ label: r.descripcion, value: r.fecha_adquisicion }),
    },
    {
      key: 'deuda_publica_y_acciones',
      filas: declaracion.deuda_publica_y_acciones,
      render: r => ({ label: r.descripcion || r.clase, value: formatEuros(r.valor_euros) }),
    },
    {
      key: 'otros_bienes_no_declarados',
      filas: declaracion.otros_bienes_no_declarados,
      render: r => ({ label: r.descripcion, value: formatEuros(r.valor_euros) }),
    },
    {
      key: 'deudas',
      filas: declaracion.deudas,
      render: r => ({
        label: r.descripcion_acreedor,
        meta: r.fecha_concesion,
        value: formatEuros(r.saldo_pendiente_euros),
      }),
    },
  ]);
</script>

<div class="b-declaracion__profile">
  <div class="b-declaracion__profile-header">
    <Avatar
      class="b-declaracion__profile-avatar"
      nombre={declaracion.nombre}
      fotoUrl={declaracion.foto_url}
    />
    <div class="b-declaracion__profile-identity">
      <h4 class="c-title c-title--xl b-declaracion__profile-name">{declaracion.nombre}</h4>
      <div class="b-declaracion__profile-tags">
        <span class="b-declaracion__tag">
          {enFemenino(declaracion.cargo, declaracion.genero)} | {declaracion.circunscripcion || '—'}
        </span>
        {#if declaracion.partido}
          <span class="b-declaracion__tag">{declaracion.partido}</span>
        {/if}
        {#if declaracion.estado_civil}
          <span class="b-declaracion__tag">
            {enFemenino(declaracion.estado_civil, declaracion.genero)}
          </span>
        {/if}
        <!-- Sólo si la hay: sin PDF no se puede afirmar de qué día es el
             impreso, y una etiqueta con un guión ocupa el mismo sitio sin
             decir nada. -->
        {#if declaracion.fecha_declaracion}
          <span class="b-declaracion__tag">Declarado {declaracion.fecha_declaracion}</span>
        {/if}
        <span class="b-declaracion__tag">Credencial {declaracion.fecha_credencial || '—'}</span>
      </div>
    </div>
    <div class="b-declaracion__links">
      <TransparentiaCard {declaracion} />
      <a
        class="b-declaracion__link"
        href={declaracion.fuente_pdf}
        target="_blank"
        rel="noreferrer"
      >
        Ver PDF original ↗
      </a>
    </div>
  </div>

  <div class="b-declaracion__stats">
    <div>
      <div class="b-declaracion__stat-value">{formatEuros(totalRentas)}</div>
      <div class="b-declaracion__stat-label">Rentas anuales declaradas</div>
    </div>
    <div>
      <div class="b-declaracion__stat-value">{formatEuros(declaracion.irpf_pagado)}</div>
      <div class="b-declaracion__stat-label">IRPF pagado</div>
    </div>
    <div>
      <div class="b-declaracion__stat-value">{(declaracion.bienes_inmuebles || []).length}</div>
      <div class="b-declaracion__stat-label">Bienes inmuebles</div>
    </div>
    <div>
      <div class="b-declaracion__stat-value">{formatEuros(totalDepositos)}</div>
      <div class="b-declaracion__stat-label">En depósitos</div>
    </div>
    <div>
      <div class="b-declaracion__stat-value">{(declaracion.vehiculos || []).length}</div>
      <div class="b-declaracion__stat-label">Vehículos</div>
    </div>
  </div>

  <div class="b-declaracion__grid">
    {#each categorias as categoria (categoria.key)}
      <CategoriaCard meta={CATEGORIAS[categoria.key]} filas={categoria.filas} render={categoria.render} />
    {/each}
  </div>

  {#if declaracion.observaciones}
    <div class="b-declaracion__observaciones">
      <strong>Observaciones: </strong>{declaracion.observaciones}
    </div>
  {/if}
</div>
