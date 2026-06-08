module.exports = {
	apps: [
		{
			name: 'ableton-control-server',
			script: './apps/server/src/index.js',
			max_memory_restart: '300M',
			autorestart: true,
			exp_backoff_restart_delay: 100,
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			merge_logs: true,
			log_date_format: 'YYYY-MM-DD HH:mm Z',
		},
	],
};
