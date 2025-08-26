import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { loadConfig } from '@rsbuild/core';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should resolve v8 to empty object', async ({ page }) => {
	const rsbuild = await createRsbuild({
		cwd: __dirname,
		rsbuildConfig: (await loadConfig({ cwd: __dirname })).content,
	});

	const { server, urls } = await rsbuild.startDevServer();

	await page.goto(urls[0]);

	// @ts-expect-error
	const v8 = await page.evaluate(() => window.testV8);
	expect(v8).toEqual({});

	await server.close();
});
