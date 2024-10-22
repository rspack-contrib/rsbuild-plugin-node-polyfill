import { expect, test } from 'vitest';
import {
	builtinMappingResolved,
	getResolveFallback,
	resolvePolyfill,
} from '../../src/index';

test('resolvePolyfill', () => {
	expect(resolvePolyfill('fs', { fs: 'memfs' })).toBe('memfs');
	expect(resolvePolyfill('fs')).toBe(null);
	expect(resolvePolyfill('buffer')).toBe(builtinMappingResolved.buffer);
});

test('getResolveFallback', () => {
	const defaultFallback = getResolveFallback({});
	const withProtocolImportsFallback = getResolveFallback({
		protocolImports: true,
	});

	expect(Object.keys(defaultFallback)).toMatchInlineSnapshot(`
		[
		  "assert",
		  "buffer",
		  "child_process",
		  "cluster",
		  "console",
		  "constants",
		  "crypto",
		  "dgram",
		  "dns",
		  "domain",
		  "events",
		  "fs",
		  "http",
		  "https",
		  "module",
		  "net",
		  "os",
		  "path",
		  "punycode",
		  "process",
		  "querystring",
		  "readline",
		  "repl",
		  "stream",
		  "_stream_duplex",
		  "_stream_passthrough",
		  "_stream_readable",
		  "_stream_transform",
		  "_stream_writable",
		  "string_decoder",
		  "sys",
		  "timers",
		  "tls",
		  "tty",
		  "url",
		  "util",
		  "vm",
		  "zlib",
		]
	`);

	expect(Object.keys(withProtocolImportsFallback)).toMatchInlineSnapshot(`
		[
		  "assert",
		  "node:assert",
		  "buffer",
		  "node:buffer",
		  "child_process",
		  "node:child_process",
		  "cluster",
		  "node:cluster",
		  "console",
		  "node:console",
		  "constants",
		  "node:constants",
		  "crypto",
		  "node:crypto",
		  "dgram",
		  "node:dgram",
		  "dns",
		  "node:dns",
		  "domain",
		  "node:domain",
		  "events",
		  "node:events",
		  "fs",
		  "node:fs",
		  "http",
		  "node:http",
		  "https",
		  "node:https",
		  "module",
		  "node:module",
		  "net",
		  "node:net",
		  "os",
		  "node:os",
		  "path",
		  "node:path",
		  "punycode",
		  "node:punycode",
		  "process",
		  "node:process",
		  "querystring",
		  "node:querystring",
		  "readline",
		  "node:readline",
		  "repl",
		  "node:repl",
		  "stream",
		  "node:stream",
		  "_stream_duplex",
		  "node:_stream_duplex",
		  "_stream_passthrough",
		  "node:_stream_passthrough",
		  "_stream_readable",
		  "node:_stream_readable",
		  "_stream_transform",
		  "node:_stream_transform",
		  "_stream_writable",
		  "node:_stream_writable",
		  "string_decoder",
		  "node:string_decoder",
		  "sys",
		  "node:sys",
		  "timers",
		  "node:timers",
		  "tls",
		  "node:tls",
		  "tty",
		  "node:tty",
		  "url",
		  "node:url",
		  "util",
		  "node:util",
		  "vm",
		  "node:vm",
		  "zlib",
		  "node:zlib",
		]
	`);

	expect(Object.keys(withProtocolImportsFallback).length).toBe(
		Object.keys(defaultFallback).length * 2,
	);

	const excludeFs = getResolveFallback({ exclude: ['fs'] });
	expect(
		Object.keys(defaultFallback).filter(
			(k) => !Object.keys(excludeFs).includes(k),
		),
	).toStrictEqual(['fs']);

	expect(Object.keys(getResolveFallback({ exclude: ['fs'] }))).not.toContain(
		'fs',
	);

	expect(Object.keys(getResolveFallback({ include: ['fs'] }))).toStrictEqual([
		'fs',
	]);

	const overrides = getResolveFallback({ overrides: { fs: 'memfs' } });
	expect(overrides.fs).toStrictEqual('memfs');
	expect({ ...overrides, fs: defaultFallback.fs }).toStrictEqual(
		defaultFallback,
	);

	expect(() =>
		getResolveFallback({ include: ['fs'], exclude: ['path'] }),
	).toThrowErrorMatchingInlineSnapshot(
		'[Error: `include` is mutually exclusive with `exclude`.]',
	);
});
