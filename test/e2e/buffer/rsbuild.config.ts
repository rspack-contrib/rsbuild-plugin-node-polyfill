import { defineConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

export default defineConfig({
	plugins: [pluginNodePolyfill()],
	server: {
		port: 4000,
	},
});
