# HTML Minifier Integration

This integration minifies generated HTML files after Astro finishes the static build. It is registered in `astro.config.mjs` through `customHtmlMinifier()` and implemented in `plugin.ts`.

## Responsibility

- Runs during the `astro:build:done` hook.
- Finds every `*.html` file under the build output directory.
- Minifies HTML with `html-minifier-terser`.
- Preserves code-oriented fragments that should keep their internal whitespace.

It does not process JavaScript or CSS assets emitted by Vite. Vite owns those files through the production build options in `astro.config.mjs`.

## Current Options

The exported `HTML_MINIFIER_OPTIONS` value enables:

- `collapseWhitespace`
- `removeComments`
- `minifyJS`
- `minifyCSS`
- `ignoreCustomFragments` for `<pre>`, `<code>`, and `<kbd>` blocks

Those ignored fragments protect rendered code samples and keyboard snippets in journal content.

## Error Handling

Each file is minified independently. If one file fails, the integration logs the failed path and error, finishes the current batch, and then fails the build with a summary of every failed file.

## Cache Behavior

The integration has no cache of its own. It rewrites generated files in `dist/` on every production build. Cache invalidation is handled by the normal Astro/Vite output hashes and by deployment-layer behavior.

## Known Limitations

- The integration assumes generated HTML is valid enough for `html-minifier-terser`.
- If new content components require whitespace preservation, add their HTML wrappers to `ignoreCustomFragments` and cover the behavior with a focused unit test.
