# Pretty Mermaid Skill

这是项目本地的 Codex skill，用 `beautiful-mermaid` 将 Mermaid 图表渲染为 SVG 或 ASCII。安装目录是 `.agents/skills/Pretty-mermaid-skills/`，来源记录在 `docs/AI_SKILLS.md`。

## 功能

- 支持 SVG 和 ASCII 输出。
- `scripts/themes.mjs` 当前报告 14 个可用主题。
- 包含 flowchart、sequence、state、class、ER 模板。
- 支持单文件渲染和批量渲染。

## 本地使用

从 skill 目录运行命令：

```bash
cd .agents/skills/Pretty-mermaid-skills
node scripts/themes.mjs
node scripts/render.mjs --input diagram.mmd --output diagram.svg --theme tokyo-night
node scripts/render.mjs --input diagram.mmd --format ascii --use-ascii
node scripts/batch.mjs --input-dir ./diagrams --output-dir ./rendered --format svg --theme github-dark
```

如果缺少 `beautiful-mermaid`，脚本首次运行时会尝试自动安装依赖。这可能在 skill 目录下生成 `node_modules/` 或 `package-lock.json`。除非项目明确决定锁定该 skill 的依赖，否则把这些文件当作本地生成物。

## 可用主题

| Light Themes | Dark Themes | Other |
| :--- | :--- | :--- |
| tokyo-night-light | zinc-dark | nord |
| github-light | tokyo-night | nord-light |
| catppuccin-latte | tokyo-night-storm | dracula |
| solarized-light | catppuccin-mocha | one-dark |
| | github-dark | |
| | solarized-dark | |

## 资源

- `SKILL.md` 是 Codex 使用这个 skill 的主要说明。
- `references/DIAGRAM_TYPES.md` 说明 Mermaid 图表语法。
- `references/THEMES.md` 说明主题选择。
- `references/api_reference.md` 说明本地脚本参数。
- `assets/example_diagrams/` 包含示例 `.mmd` 文件。
