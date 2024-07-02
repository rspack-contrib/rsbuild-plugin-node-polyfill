# @rsbuild/plugin-node-polyfill

@rsbuild/plugin-node-polyfill is a Rsbuild plugin to do something.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-node-polyfill">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-node-polyfill?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

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

## Options

### foo

Some description.

- Type: `string`
- Default: `undefined`
- Example:

```js
pluginNodePolyfill({
  foo: "bar",
});
```

## License

[MIT](./LICENSE).
