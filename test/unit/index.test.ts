import { assert, test } from '@rstest/core';
import {
	builtinMappingResolved,
	getResolveFallback,
	resolvePolyfill,
} from '../../src/index';

test('resolvePolyfill', async () => {
	assert.equal(resolvePolyfill('fs', { fs: 'memfs' }), 'memfs');
	assert.equal(resolvePolyfill('fs'), null);
	assert.equal(resolvePolyfill('buffer'), builtinMappingResolved.buffer);
});

test('getResolveFallback', async () => {
	const defaultFallback = getResolveFallback({});
	const withProtocolImportsFallback = getResolveFallback({
		protocolImports: true,
	});

	assert.deepEqual(Object.keys(defaultFallback), [
		'assert',
		'buffer',
		'child_process',
		'cluster',
		'console',
		'constants',
		'crypto',
		'dgram',
		'dns',
		'domain',
		'events',
		'fs',
		'http',
		'https',
		'module',
		'net',
		'os',
		'path',
		'punycode',
		'process',
		'querystring',
		'readline',
		'repl',
		'stream',
		'_stream_duplex',
		'_stream_passthrough',
		'_stream_readable',
		'_stream_transform',
		'_stream_writable',
		'string_decoder',
		'sys',
		'timers',
		'tls',
		'tty',
		'url',
		'util',
		'vm',
		'zlib',
	]);

	assert.deepEqual(Object.keys(withProtocolImportsFallback), [
		'assert',
		'node:assert',
		'buffer',
		'node:buffer',
		'child_process',
		'node:child_process',
		'cluster',
		'node:cluster',
		'console',
		'node:console',
		'constants',
		'node:constants',
		'crypto',
		'node:crypto',
		'dgram',
		'node:dgram',
		'dns',
		'node:dns',
		'domain',
		'node:domain',
		'events',
		'node:events',
		'fs',
		'node:fs',
		'http',
		'node:http',
		'https',
		'node:https',
		'module',
		'node:module',
		'net',
		'node:net',
		'os',
		'node:os',
		'path',
		'node:path',
		'punycode',
		'node:punycode',
		'process',
		'node:process',
		'querystring',
		'node:querystring',
		'readline',
		'node:readline',
		'repl',
		'node:repl',
		'stream',
		'node:stream',
		'_stream_duplex',
		'node:_stream_duplex',
		'_stream_passthrough',
		'node:_stream_passthrough',
		'_stream_readable',
		'node:_stream_readable',
		'_stream_transform',
		'node:_stream_transform',
		'_stream_writable',
		'node:_stream_writable',
		'string_decoder',
		'node:string_decoder',
		'sys',
		'node:sys',
		'timers',
		'node:timers',
		'tls',
		'node:tls',
		'tty',
		'node:tty',
		'url',
		'node:url',
		'util',
		'node:util',
		'vm',
		'node:vm',
		'zlib',
		'node:zlib',
	]);

	assert.equal(
		Object.keys(withProtocolImportsFallback).length,
		Object.keys(defaultFallback).length * 2,
	);

	const excludeFs = getResolveFallback({ exclude: ['fs'] });
	assert.deepEqual(
		Object.keys(defaultFallback).filter(
			(k) => !Object.keys(excludeFs).includes(k),
		),
		['fs'],
	);

	assert.ok(
		!Object.keys(getResolveFallback({ exclude: ['fs'] })).includes('fs'),
	);

	assert.deepEqual(Object.keys(getResolveFallback({ include: ['fs'] })), [
		'fs',
	]);

	const overrides = getResolveFallback({ overrides: { fs: 'memfs' } });
	assert.equal(overrides.fs, 'memfs');
	assert.deepEqual({ ...overrides, fs: defaultFallback.fs }, defaultFallback);

	assert.throws(
		() => getResolveFallback({ include: ['fs'], exclude: ['path'] }),
		'`include` is mutually exclusive with `exclude`.',
	);
});
