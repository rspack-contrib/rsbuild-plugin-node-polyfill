import type { RsbuildPlugin } from '@rsbuild/core';
import { builtinMappingResolved } from './libs.js';

type GlobalsOption = {
	/**
	 * Whether to inject the polyfill for direct identifier usage,
	 * e.g. `Buffer` or `process` (bare usage without any object prefix).
	 * @default true
	 */
	bare?: boolean;
	/**
	 * Whether to inject the polyfill for usage via the `global` object,
	 * e.g. `global.Buffer` or `global.process`.
	 * @default false
	 */
	global?: boolean;
	/**
	 * Whether to inject the polyfill for usage via the `globalThis` object,
	 * e.g. `globalThis.Buffer` or `globalThis.process`.
	 * @default false
	 */
	globalThis?: boolean;
};

type Globals = {
	/**
	 * Configure polyfill injection for the `process` global variable.
	 * - Set to `false` to disable all polyfills for `process`.
	 * - Set to `true` to enable only bare identifier polyfill (e.g. `process`).
	 * - Or provide a {@link GlobalsOption} object for fine-grained control.
	 */
	process?: boolean | GlobalsOption;
	/**
	 * Configure polyfill injection for the `Buffer` global variable.
	 * - Set to `false` to disable all polyfills for `Buffer`.
	 * - Set to `true` to enable only bare identifier polyfill (e.g. `Buffer`).
	 * - Or provide a {@link GlobalsOption} object for fine-grained control.
	 */
	Buffer?: boolean | GlobalsOption;
};

export type PluginNodePolyfillOptions = {
	/**
	 * Whether to provide polyfill of globals.
	 * @default
	 * {
	 *   Buffer: {
	 *     bare: true,
	 *     global: false,
	 *  	 globalThis: false,
	 *   }
	 *   process: {
	 *     bare: true,
	 *  	 global: false,
	 * 	   globalThis: false,
	 *   }
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
	globals: Globals = {},
	overrides?: PluginNodePolyfillOptions['overrides'],
) => {
	const result: Record<string, string | string[]> = {};
	const defaultOptions: GlobalsOption = {
		bare: true,
		global: false,
		globalThis: false,
	};

	// Buffer polyfill
	if (globals.Buffer !== false) {
		const options =
			typeof globals.Buffer === 'object'
				? { ...defaultOptions, ...globals.Buffer }
				: { ...defaultOptions };
		const value = [resolvePolyfill('buffer', overrides) as string, 'Buffer'];

		if (options.bare) {
			result.Buffer = value;
		}
		if (options.global) {
			result['global.Buffer'] = value;
		}
		if (options.globalThis) {
			result['globalThis.Buffer'] = value;
		}
	}

	// process polyfill
	if (globals.process !== false) {
		const options =
			typeof globals.process === 'object'
				? { ...defaultOptions, ...globals.process }
				: { ...defaultOptions };
		const value = [resolvePolyfill('process', overrides) as string];

		if (options.bare) {
			result.process = value;
		}
		if (options.global) {
			result['global.process'] = value;
		}
		if (options.globalThis) {
			result['globalThis.process'] = value;
		}
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
			api.modifyBundlerChain(async (chain, { isServer, rspack }) => {
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
						.use(rspack.ProvidePlugin, [provideGlobals]);
				}

				// Remove the `node:` prefix
				// see: https://github.com/webpack/webpack/issues/14166
				if (protocolImports) {
					const regex = /^node:/;
					chain
						.plugin('protocol-imports')
						.use(rspack.NormalModuleReplacementPlugin, [
							regex,
							(resource) => {
								resource.request = resource.request.replace(regex, '');
							},
						]);
				}
			});
		},
	};
}

export {
	builtinMappingResolved,
	resolvedPolyfillToModules,
} from './libs.js';
