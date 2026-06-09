import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	build: {
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name].[ext]',
				chunkFileNames: 'assets/[name].js',
				entryFileNames: 'assets/[name].js',
			},
		},
	},
	css: {
		modules: {
			generateScopedName: '[name]__[local]',
		},
	},
});
