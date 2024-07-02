import { defineConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '../src';

export default defineConfig({
	plugins: [pluginNodePolyfill()],
});
