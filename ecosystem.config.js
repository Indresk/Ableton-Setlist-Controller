module.exports = {
	apps: [
		{
			name: 'ableton-control-server',
			script: './apps/server/src/index.js',
			// En modo producción no es ideal que babel/node haga on-the-fly transformations si no están pre-compilados,
			// pero dado que el proyecto corre directo con Node + ES Modules, configuraremos node_args para ello.
			// Se reiniciará la app si consume más de 300 MB de memoria RAM.
			max_memory_restart: '300M',
			// Reinicia automáticamente si el proceso muere (excepto si fue explícitamente detenido)
			autorestart: true,
			// Intenta reconectar con un delay incremental para no devorar la CPU si la falla es recurrente
			exp_backoff_restart_delay: 100,
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			// Fusionamos logs para stdout/stderr en un solo stream
			merge_logs: true,
			log_date_format: 'YYYY-MM-DD HH:mm Z',
		},
	],
};
