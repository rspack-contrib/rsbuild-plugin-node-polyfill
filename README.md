# @rsbuild/plugin-node-polyfill

An Rsbuild plugin to automatically inject polyfills for [Node.js builtin modules](https://nodejs.org/api/modules.html#built-in-modules) into the browser side.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-node-polyfill">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-node-polyfill?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@rsbuild/plugin-node-polyfill?minimal=true"><img src="https://img.shields.io/npm/dm/@rsbuild/plugin-node-polyfill.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## When to use

Normally, we don't need to use Node builtin modules on the browser side. However, it is possible to use some Node builtin modules when the code will run on both the Node side and the browser side, and this plugin provides browser versions of polyfills for these Node builtin modules.

By using the Node Polyfill plugin, polyfills for Node builtin modules are automatically injected into the browser-side, allowing you to use these modules on the browser side with confidence.

## Usage

Install:

```bash
npm add @rsbuild/plugin-node-polyfill -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";

export default {
  plugins: [pluginNodePolyfill()],
};
```

## Node Polyfills

### Globals

- `Buffer`
- `process`

When you use the above global variables in your code, the corresponding polyfill will be automatically injected.

For instance, the following code would inject the `Buffer` polyfill:

```ts
const bufferData = Buffer.from("abc");
```

You can disable this behavior through the `globals` option of the plugin:

```ts
pluginNodePolyfill({
  globals: {
    Buffer: false,
    process: false,
  },
});
```

### Modules

- `assert`
- `buffer`
- `console`
- `constants`
- `crypto`
- `domain`
- `events`
- `http`
- `https`
- `os`
- `path`
- `punycode`
- `process`
- `querystring`
- `stream`
- `_stream_duplex`
- `_stream_passthrough`
- `_stream_readable`
- `_stream_transform`
- `_stream_writable`
- `string_decoder`
- `sys`
- `timers`
- `tty`
- `url`
- `util`
- `vm`
- `zlib`

When the above module is referenced in code via import / require syntax, the corresponding polyfill will be injected.

```ts
import { Buffer } from "buffer";

const bufferData = Buffer.from("abc");
```

### Fallbacks

- `child_process`
- `cluster`
- `dgram`
- `dns`
- `fs`
- `module`
- `net`
- `readline`
- `repl`
- `tls`

Currently there is no polyfill for the above modules on the browser side, so when you import the above modules, it will automatically fallback to an empty object.

```ts
import fs from "fs";

console.log(fs); // -> {}
```

## Options

### globals

Used to specify whether to inject polyfills for global variables.

- **Type:**

```ts
type Globals = {
  process?: boolean;
  Buffer?: boolean;
};
```

- **Default:**

```ts
const defaultGlobals = {
  Buffer: true,
  process: true,
};
```

### protocolImports

Whether to polyfill Node.js builtin modules starting with `node:`.

- **Type:** `boolean`
- **Default:** `true`

For example, if you disable `protocolImports`, modules such as `node:path`, `node:http`, etc. will not be polyfilled.

```ts
pluginNodePolyfill({
  protocolImports: false,
});
```

### only

Specify an array of modules for which polyfills should be injected. If this option is set, only the specified modules will be polyfilled. `only` is mutually exclusive with [`exclude`](#exclude).

- **Type:** `string[]`
- **Default:** `undefined`

```ts
pluginNodePolyfill({
  only: ["buffer", "crypto"], // Only "buffer" and "crypto" modules will be polyfilled.
});
```

### exclude

Specify an array of modules for which polyfills should not be injected from the default. If this option is set, the specified modules will be excluded from polyfilled. `exclude` is mutually exclusive with [`only`](#only).

- **Type:** `string[]`
- **Default:** `undefined`

```ts
pluginNodePolyfill({
  exclude: ["http", "https"], // All modules except "http" and "https" will be polyfilled.
});
```

## License

[MIT](./LICENSE).
