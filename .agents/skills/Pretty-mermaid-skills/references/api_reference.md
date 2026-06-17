# Pretty Mermaid Local API Reference

This reference documents the scripts included with the project-local `pretty-mermaid` skill. Run commands from `.agents/skills/Pretty-mermaid-skills/`.

## Scripts

### `scripts/render.mjs`

Render one Mermaid `.mmd` file as SVG or ASCII.

```bash
node scripts/render.mjs --input diagram.mmd --output diagram.svg --format svg --theme tokyo-night
node scripts/render.mjs --input diagram.mmd --format ascii --use-ascii
```

Common options:

- `--input`, `-i`: input Mermaid file. Required.
- `--output`, `-o`: output path. Defaults to stdout.
- `--format`, `-f`: `svg` or `ascii`. Defaults to `svg`.
- `--theme`, `-t`: one of the themes listed by `scripts/themes.mjs`.
- `--transparent`: transparent SVG background.
- `--bg`, `--fg`, `--line`, `--accent`, `--muted`, `--surface`, `--border`: custom color overrides.
- `--font`: SVG font family. Defaults to Inter.
- `--use-ascii`, `--padding-x`, `--padding-y`, `--box-border-padding`: ASCII output controls.

### `scripts/batch.mjs`

Render every `.mmd` file in a directory.

```bash
node scripts/batch.mjs --input-dir ./diagrams --output-dir ./rendered --format svg --theme github-dark --workers 4
```

### `scripts/themes.mjs`

Print the locally available Beautiful Mermaid themes. This installed copy currently reports 14 themes.

```bash
node scripts/themes.mjs
```

## Dependency Behavior

The scripts auto-install the local `beautiful-mermaid` dependency on first run if it is missing. That may create `node_modules/` and `package-lock.json` inside the skill directory. Treat those as local generated artifacts unless the project intentionally decides to vendor-lock skill dependencies.
