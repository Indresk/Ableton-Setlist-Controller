export function healthRender(data) {
	const { ableton: abletonState, ...serverState } = data;
	const isOk = Boolean(serverState?.abletonConnected);

	const uptimeSeconds = Math.floor(data.uptime ?? 0);
	const uptimeMinutes = Math.floor(uptimeSeconds / 60);
	const uptimeHours = Math.floor(uptimeMinutes / 60);

	const startedAt = serverState?.startedAt
		? new Date(serverState.startedAt).toLocaleString('es-CO')
		: 'N/D';

	const timestamp = data.timestamp
		? new Date(data.timestamp).toLocaleString('es-CO')
		: new Date().toLocaleString('es-CO');

	const songsCount = abletonState?.songsCue?.length ?? 0;
	const tempo = abletonState?.tempo ?? '--';
	const isPlaying = Boolean(abletonState?.isPlaying);
	const connectedClients = serverState?.connectedClients ?? 0;

	const statusLabel = isOk ? 'Servidor operativo' : 'Sin conexión con Ableton';
	const statusClass = isOk ? 'is-ok' : 'is-error';
	const playingLabel = isPlaying ? 'Reproduciendo' : 'Detenido';
	const playingClass = isPlaying ? 'tone-playing' : 'tone-stop';

	return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Health view</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap");

      :root {
        --color-bg:#060c06;
        --color-surface:#0e1c0e;
        --color-surface-2:#162a16;
        --color-border:#1e3d1e;
        --color-border-2:#2d6329;
        --color-playing:#a3e635;
        --color-current:#facc15;
        --color-section:#38bdf8;
        --color-stop:#f87171;
        --color-text:#f0faf0;
        --color-text-2:#86efac;
        --color-text-muted:#4a7a4a;
        --radius-sm:8px;
        --radius-md:14px;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html, body {
        min-height: 100dvh;
      }

      body {
        background: var(--color-bg);
        color: var(--color-text);
        font-family: "Space Grotesk", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        padding: 24px 16px 40px;
      }

      .health-view {
        width: 100%;
        max-width: 880px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .health-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 4px 14px;
        border-bottom: 1px solid var(--color-border);
        flex-wrap: wrap;
      }

      .health-title {
        color: var(--color-text);
        letter-spacing: -.02em;
        text-transform: capitalize;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.1;
      }

      .health-back {
        letter-spacing: .08em;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        color: var(--color-text-2);
        border-radius: var(--radius-sm);
        white-space: nowrap;
        cursor: pointer;
        justify-content: center;
        align-items: center;
        padding: 7px 13px;
        font-size: .7rem;
        font-weight: 700;
        display: inline-flex;
        text-decoration: none;
        text-transform: uppercase;
      }

      .health-back:hover {
        background: var(--color-surface-2);
        border-color: var(--color-border-2);
      }

      .health-banner {
        background: var(--color-surface);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .health-banner.is-ok {
        border-color: var(--color-playing);
      }

      .health-banner.is-error {
        border-color: #7f1d1d;
      }

      .health-status {
        color: var(--color-text-muted);
        letter-spacing: .1em;
        text-transform: uppercase;
        align-items: center;
        gap: 8px;
        font-size: .72rem;
        font-weight: 700;
        display: flex;
      }

      .health-dot {
        border-style: solid;
        border-width: 2px;
        border-radius: 999px;
        width: 10px;
        height: 10px;
        display: inline-block;
      }

      .is-ok .health-dot {
        background: #14532d;
        border-color: #166534;
      }

      .is-error .health-dot {
        background: #450a0a;
        border-color: #7f1d1d;
      }

      .health-status strong {
        color: var(--color-text);
        letter-spacing: 0;
        text-transform: none;
        font-size: .95rem;
      }

      .health-meta {
        color: var(--color-text-muted);
        font-size: .82rem;
        text-align: right;
      }

      .health-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .metric-card {
        background: var(--color-surface);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 14px 14px 12px;
        min-height: 108px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
      }

      .metric-label {
        color: var(--color-text-muted);
        letter-spacing: .08em;
        text-transform: uppercase;
        font-size: .68rem;
        font-weight: 700;
      }

      .metric-value {
        color: var(--color-text);
        font-size: 1.7rem;
        line-height: 1;
        font-weight: 700;
        letter-spacing: -.03em;
      }

      .metric-sub {
        color: var(--color-text-2);
        font-size: .8rem;
        font-weight: 600;
      }

      .panel {
        background: var(--color-surface);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .panel-header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .panel-title {
        color: var(--color-text);
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: -.01em;
      }

      .panel-badge {
        color: var(--color-text-muted);
        font-size: .7rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .detail-list {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .detail-item {
        padding: 14px 16px;
        border-top: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 88px;
      }

      .detail-item:nth-child(odd) {
        border-right: 1px solid var(--color-border);
      }

      .detail-key {
        color: var(--color-text-muted);
        letter-spacing: .08em;
        text-transform: uppercase;
        font-size: .68rem;
        font-weight: 700;
      }

      .detail-value {
        color: var(--color-text);
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .tone-playing {
        color: var(--color-playing);
      }

      .tone-stop {
        color: var(--color-stop);
      }

      .tone-ok {
        color: var(--color-text-2);
      }

      .tone-error {
        color: var(--color-stop);
      }

      @media (max-width: 760px) {
        .health-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .detail-list {
          grid-template-columns: 1fr;
        }

        .detail-item:nth-child(odd) {
          border-right: none;
        }

        .health-meta {
          text-align: left;
        }
      }

      @media (max-width: 480px) {
        .health-grid {
          grid-template-columns: 1fr;
        }

        .health-title {
          font-size: 1.7rem;
        }

        .metric-value {
          font-size: 1.45rem;
        }
      }
    </style>
  </head>
  <body>
    <main class="health-view">
      <header class="health-header">
        <h1 class="health-title">Health view</h1>
        <a class="health-back" href="/">Volver a la aplicación</a>
      </header>

      <section class="health-banner ${statusClass}">
        <div class="health-status">
          <span class="health-dot"></span>
          <div>
            <div class="metric-label">Estado general</div>
            <strong>${statusLabel}</strong>
          </div>
        </div>

        <div class="health-meta">
          Última actualización<br />
          ${timestamp}
        </div>
      </section>

      <section class="health-grid">
        <article class="metric-card">
          <div class="metric-label">Ableton</div>
          <div class="metric-value ${isOk ? 'tone-ok' : 'tone-error'}">
            ${isOk ? 'Conectado' : 'Desconectado'}
          </div>
          <div class="metric-sub">Estado del bridge principal</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Reproducción</div>
          <div class="metric-value ${playingClass}">
            ${playingLabel}
          </div>
          <div class="metric-sub">Sincronización actual</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Tempo</div>
          <div class="metric-value">${tempo}</div>
          <div class="metric-sub">BPM reportados</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Clientes</div>
          <div class="metric-value">${connectedClients}</div>
          <div class="metric-sub">Conexiones activas</div>
        </article>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Detalles del sistema</h2>
          <span class="panel-badge">runtime</span>
        </div>

        <div class="detail-list">
          <div class="detail-item">
            <div class="detail-key">Uptime</div>
            <div class="detail-value">${uptimeSeconds}s</div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Resumen uptime</div>
            <div class="detail-value">${uptimeHours}h / ${uptimeMinutes}m</div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Inicio del servidor</div>
            <div class="detail-value">${startedAt}</div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Timestamp</div>
            <div class="detail-value">${timestamp}</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Estado de Ableton</h2>
          <span class="panel-badge">live session</span>
        </div>

        <div class="detail-list">
          <div class="detail-item">
            <div class="detail-key">Conexión</div>
            <div class="detail-value ${isOk ? 'tone-ok' : 'tone-error'}">
              ${isOk ? 'Disponible' : 'No disponible'}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Playback</div>
            <div class="detail-value ${playingClass}">
              ${playingLabel}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Tempo actual</div>
            <div class="detail-value">${tempo} BPM</div>
          </div>

          <div class="detail-item">
            <div class="detail-key">Songs en cue</div>
            <div class="detail-value">${songsCount}</div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}
