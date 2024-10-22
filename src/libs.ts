import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const builtinMappingResolved = {
	assert: require.resolve('assert/'),
	buffer: require.resolve('buffer/'),
	child_process: null,
	cluster: null,
	console: require.resolve('console-browserify'),
	constants: require.resolve('constants-browserify'),
	crypto: require.resolve('crypto-browserify'),
	dgram: null,
	dns: null,
	domain: require.resolve('domain-browser'),
	events: require.resolve('events/'),
	fs: null,
	http: require.resolve('stream-http'),
	https: require.resolve('https-browserify'),
	module: null,
	net: null,
	os: require.resolve('os-browserify/browser.js'),
	path: require.resolve('path-browserify'),
	punycode: require.resolve('punycode/'),
	process: require.resolve('process/browser.js'),
	querystring: require.resolve('querystring-es3/'),
	readline: null,
	repl: null,
	stream: require.resolve('stream-browserify'),
	_stream_duplex: require.resolve('readable-stream/lib/_stream_duplex.js'),
	_stream_passthrough: require.resolve(
		'readable-stream/lib/_stream_passthrough.js',
	),
	_stream_readable: require.resolve('readable-stream/lib/_stream_readable.js'),
	_stream_transform: require.resolve(
		'readable-stream/lib/_stream_transform.js',
	),
	_stream_writable: require.resolve('readable-stream/lib/_stream_writable.js'),
	string_decoder: require.resolve('string_decoder/'),
	sys: require.resolve('util/util.js'),
	timers: require.resolve('timers-browserify'),
	tls: null,
	tty: require.resolve('tty-browserify'),
	url: require.resolve('url/'),
	util: require.resolve('util/util.js'),
	vm: require.resolve('vm-browserify'),
	zlib: require.resolve('browserify-zlib'),
} as const;

export const resolvedPolyfillToModules = Object.fromEntries(
	Object.entries(builtinMappingResolved)
		.filter(([key]) => key !== null)
		.map(([key, value]) => [value, key]),
);
