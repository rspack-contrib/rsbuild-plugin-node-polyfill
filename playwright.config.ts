import { defineConfig } from '@playwright/test';

export default defineConfig({
	testMatch: '*test/e2e/**/*.test.ts',
});
