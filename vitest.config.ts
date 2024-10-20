import { defineConfig, mergeConfig } from 'vitest/config';

export default {
	test: {
		include: ['./test/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
	},
};
