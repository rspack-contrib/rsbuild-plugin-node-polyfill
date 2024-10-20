import type { RsbuildPlugin } from '@rsbuild/core';
import { ProtocolImportsPlugin } from './ProtocolImportsPlugin.js';
import * as nodeLibs from './libs.js';

type Globals = {
	process?: boolean;
	Buffer?: boolean;
};

export type PluginNodePolyfillOptions = {
	/**
	 * Whether to provide polyfill of globals.
	 * @default
	 * {
	 *   Buffer: true,
	 *   process: true,
	 * }
	 */
	globals?: Globals;
	/**
	 * Whether to polyfill Node.js builtin modules starting with `node:`.
	 * @see https://nodejs.org/api/esm.html#node-imports
	 * @default true
	 */
	protocolImports?: boolean;
	/**
	 * Exclude certain modules to be polyfilled.
	 * This option is mutually exclusive with {@link PluginNodePolyfillOptions.include | `include`}.
	 * @default undefined
	 */
	exclude?: string[];
	/**
	 * Only include certain modules to be polyfilled.
	 * This option is mutually exclusive with {@link PluginNodePolyfillOptions.exclude | `exclude`}.
	 * @default undefined
	 */
	include?: string[];
};

export const getResolveFallback = ({
	protocolImports,
	exclude,
	include,
}: Pick<
	PluginNodePolyfillOptions,
	'protocolImports' | 'exclude' | 'include'
>) => {
	if (exclude && include) {
		throw new Error('`include` is mutually exclusive with `exclude`.');
	}

	const resolvedNodeLibs = include
		? include
		: Object.keys(nodeLibs).filter((name) => {
				return !(exclude || []).includes(name);
			});

	const fallback: Record<string, string | false> = {};

	for (const name of resolvedNodeLibs) {
		const libPath = nodeLibs[name as keyof typeof nodeLibs];

		fallback[name] = libPath ?? false;

		if (protocolImports) {
			fallback[`node:${name}`] = fallback[name];
		}
	}

	return fallback;
};

export const getProvideGlobals = async (globals?: Globals) => {
	const result: Record<string, string | string[]> = {};

	if (globals?.Buffer !== false) {
		result.Buffer = [nodeLibs.buffer, 'Buffer'];
	}
	if (globals?.process !== false) {
		result.process = [nodeLibs.process];
	}

	return result;
};

export const PLUGIN_NODE_POLYFILL_NAME = 'rsbuild:node-polyfill';

export function pluginNodePolyfill(
	options: PluginNodePolyfillOptions = {},
): RsbuildPlugin {
	const { protocolImports = true, include, exclude } = options;

	return {
		name: PLUGIN_NODE_POLYFILL_NAME,

		setup(api) {
			api.modifyBundlerChain(async (chain, { isServer, bundler }) => {
				// The server bundle does not require node polyfill
				if (isServer) {
					return;
				}

				// module polyfill
				chain.resolve.fallback.merge(
					getResolveFallback({ protocolImports, include: include, exclude }),
				);

				const provideGlobals = await getProvideGlobals(options.globals);
				if (Object.keys(provideGlobals).length) {
					chain
						.plugin('node-polyfill-provide')
						.use(bundler.ProvidePlugin, [provideGlobals]);
				}

				if (protocolImports) {
					chain.plugin('protocol-imports').use(ProtocolImportsPlugin);
				}
			});
		},
	};
}
