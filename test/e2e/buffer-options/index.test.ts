import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { loadConfig } from '@rsbuild/core';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should polyfill global Buffer as expected', async ({ page }) => {
	const rsbuild = await createRsbuild({
		cwd: __dirname,
		rsbuildConfig: (await loadConfig({ cwd: __dirname })).content,
	});

	const { server, urls } = await rsbuild.startDevServer();

	await page.goto(urls[0]);

	const testBuffer1 = page.locator('#test-buffer1');
	await expect(testBuffer1).toHaveText('979899');

	const testBuffer2 = page.locator('#test-buffer2');
	await expect(testBuffer2).toHaveText('979899');

	const testBuffer3 = page.locator('#test-buffer3');
	await expect(testBuffer3).toHaveText('979899');

	await server.close();
});
