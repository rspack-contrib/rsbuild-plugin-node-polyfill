import type { RsbuildPlugin } from '@rsbuild/core';
import { ProtocolImportsPlugin } from './ProtocolImportsPlugin.js';
import { builtinMappingResolved } from './libs.js';

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
	/**
	 * Override the default polyfills for specific modules.
	 * @default undefined
	 */
	overrides?: Record<string, string | false>;
	/**
	 * By default, the plugin only polyfills the browser-side code.
	 * If you want to polyfill the server-side code as well (when `output.target` is `node`),
	 * you can set the `force` option to `true`.
	 * @default false
	 */
	force?: boolean;
};

export const resolvePolyfill = (
	libPath: string,
	overrides?: PluginNodePolyfillOptions['overrides'],
) => {
	if (overrides?.[libPath] !== undefined) {
		return overrides[libPath];
	}

	return builtinMappingResolved[libPath as keyof typeof builtinMappingResolved];
};

export const getResolveFallback = ({
	protocolImports,
	exclude,
	include,
	overrides,
}: Pick<
	PluginNodePolyfillOptions,
	'protocolImports' | 'exclude' | 'include' | 'overrides'
>) => {
	if (exclude && include) {
		throw new Error('`include` is mutually exclusive with `exclude`.');
	}

	const resolvedNodeLibs = include
		? include
		: Object.keys(builtinMappingResolved).filter((name) => {
				return !(exclude || []).includes(name);
			});

	const fallback: Record<string, string | false> = {};

	for (const name of resolvedNodeLibs) {
		const libPath = resolvePolyfill(name, overrides);
		fallback[name] = libPath ?? false;

		if (protocolImports) {
			fallback[`node:${name}`] = fallback[name];
		}
	}

	return fallback;
};

export const getProvideGlobals = async (
	globals?: Globals,
	overrides?: PluginNodePolyfillOptions['overrides'],
) => {
	const result: Record<string, string | string[]> = {};

	if (globals?.Buffer !== false) {
		result.Buffer = [resolvePolyfill('buffer', overrides) as string, 'Buffer'];
		result['global.Buffer'] = result.Buffer;
		result['globalThis.Buffer'] = result.Buffer;
	}
	if (globals?.process !== false) {
		result.process = [resolvePolyfill('process', overrides) as string];
		result['global.process'] = result.process;
		result['globalThis.process'] = result.process;
	}

	return result;
};

export const PLUGIN_NODE_POLYFILL_NAME = 'rsbuild:node-polyfill';

export function pluginNodePolyfill(
	options: PluginNodePolyfillOptions = {},
): RsbuildPlugin {
	const {
		protocolImports = true,
		include,
		exclude,
		overrides,
		force = false,
	} = options;

	return {
		name: PLUGIN_NODE_POLYFILL_NAME,

		setup(api) {
			api.modifyBundlerChain(async (chain, { isServer, bundler }) => {
				// The server bundle does not require node polyfill
				if (isServer && !force) {
					return;
				}

				// module polyfill
				chain.resolve.fallback.merge(
					getResolveFallback({
						protocolImports,
						include: include,
						exclude,
						overrides,
					}),
				);

				const provideGlobals = await getProvideGlobals(
					options.globals,
					overrides,
				);

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

export {
	builtinMappingResolved,
	resolvedPolyfillToModules,
} from './libs.js';
