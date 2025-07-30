import { defineConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

export default defineConfig({
	plugins: [
		pluginNodePolyfill({
			globals: {
				Buffer: {
					bare: true,
					global: true,
					globalThis: true,
				},
			},
		}),
	],
	server: {
		port: 3700,
	},
});
