import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { loadConfig } from '@rsbuild/core';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should add node-polyfill when add node-polyfill plugin', async ({
	page,
}) => {
	const rsbuild = await createRsbuild({
		cwd: __dirname,
		rsbuildConfig: (await loadConfig({ cwd: __dirname })).content,
	});

	const { server, urls } = await rsbuild.startDevServer();

	await page.goto(urls[0]);

	const test = page.locator('#test');
	await expect(test).toHaveText('Hello Rsbuild!');

	const testQueryString = page.locator('#test-querystring');
	await expect(testQueryString).toHaveText('foo=bar');

	await server.close();
});
