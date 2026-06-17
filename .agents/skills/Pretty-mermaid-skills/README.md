# Pretty Mermaid Skill

Project-local Codex skill for rendering Mermaid diagrams as SVG or ASCII with the `beautiful-mermaid` library. The installed bundle lives in `.agents/skills/Pretty-mermaid-skills/` and is tracked in `docs/AI_SKILLS.md`.

## Features

- SVG and ASCII output.
- 14 locally available themes reported by `scripts/themes.mjs`.
- Templates for flowchart, sequence, state, class, and ER diagrams.
- Single-file and batch rendering scripts.

## Local Usage

Run commands from this skill directory:

```bash
cd .agents/skills/Pretty-mermaid-skills
node scripts/themes.mjs
node scripts/render.mjs --input diagram.mmd --output diagram.svg --theme tokyo-night
node scripts/render.mjs --input diagram.mmd --format ascii --use-ascii
node scripts/batch.mjs --input-dir ./diagrams --output-dir ./rendered --format svg --theme github-dark
```

The scripts auto-install `beautiful-mermaid` on first run if it is missing. That can create local generated files such as `node_modules/` and `package-lock.json` inside this skill directory. Treat those as generated artifacts unless the project explicitly decides to commit them.

## Available Themes

| Light Themes | Dark Themes | Other |
| :--- | :--- | :--- |
| tokyo-night-light | zinc-dark | nord |
| github-light | tokyo-night | nord-light |
| catppuccin-latte | tokyo-night-storm | dracula |
| solarized-light | catppuccin-mocha | one-dark |
| | github-dark | |
| | solarized-dark | |

## Resources

- `SKILL.md` contains the operational workflow for Codex.
- `references/DIAGRAM_TYPES.md` covers Mermaid syntax patterns.
- `references/THEMES.md` describes theme selection.
- `references/api_reference.md` documents local script options.
- `assets/example_diagrams/` contains starter `.mmd` files.

## Maintenance

When updating this skill, verify `node scripts/themes.mjs` and adjust theme counts or examples if the local dependency reports a different list. Update `docs/AI_SKILLS.md` with the source commit or extraction detail.
