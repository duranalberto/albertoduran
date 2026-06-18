# Project AI Skills

This repository keeps project-local Codex skills in `.agents/skills/`. These
skills are intended for this project only and should not be installed globally
unless they become useful across unrelated workspaces.

Restart Codex after adding, removing, or updating skills so the skill metadata
can be discovered.

## Installed Skills

| Skill | Installed path | Source | Extraction detail |
| :-- | :-- | :-- | :-- |
| `pretty-mermaid` | `.agents/skills/Pretty-mermaid-skills/` | <https://github.com/imxv/Pretty-mermaid-skills> | `main` at `e33f086d3b5bcec9f28632e4bd9c348b02bb2278` |
| `design-doc-mermaid` | `.agents/skills/design-doc-mermaid/` | <https://github.com/SpillwaveSolutions/design-doc-mermaid> | `main` at `e13f987306d5cd7a34f541927a3228343dd90e45` |
| `mdx-blog-writer` | `.agents/skills/mdx-blog-writer/` | Local Claude skill bundle provided as `mdx-blog-writer.skill` | Extracted from archive path `mdx-blog-writer/`; original archive SHA-256 was `4a3bbdf6163b877cbcca0be5943403263e3cb1b76d6b23b6d0a432cabb35884b` |

## Skill Notes

### `pretty-mermaid`

Use this skill for rendering, theming, beautifying, or batch-processing Mermaid
diagrams. It includes rendering scripts, theme references, and example Mermaid
diagram assets.

The installed copy was extracted from the root of
`imxv/Pretty-mermaid-skills`, which contains a top-level `SKILL.md`.

### `design-doc-mermaid`

Use this skill for creating design-document diagrams from text descriptions or
source code, including activity, deployment, sequence, and architecture diagrams.
It includes design-document templates, diagram guides, examples, and Python
utilities for Mermaid extraction and image conversion.

The installed copy was extracted from the root of
`SpillwaveSolutions/design-doc-mermaid`, which contains a top-level `SKILL.md`.

### `mdx-blog-writer`

Use this skill for drafting, revising, humanizing, and formatting
albertoduran.com journal publications in MDX. It includes rules for the local
Astro content collection, frontmatter conventions, hook structure, writing
voice, Markdown formatting, and when to include Mermaid diagrams.

When the skill is used for a file under `src/thejournal/`, pair it with
`docs/THEJOURNAL_PUBLICATION_GUIDE.md` so the draft follows the site's
reader-facing publication intent, 8-to-15 displayed minute target, standalone
and vault file shapes, and `src/content/processors/` publishing rules.

The installed copy was extracted from a local Claude skill bundle provided as
`mdx-blog-writer.skill`, from archive path `mdx-blog-writer/`. The original
archive is not required after extraction; the committed artifact is the adapted
skill folder under `.agents/skills/mdx-blog-writer/`. The installed copy has
been adapted for this project by aligning its frontmatter guidance with
`src/content.config.ts`, the existing `src/thejournal/` layout, and local
Mermaid rendering guardrails.

## Maintenance

When updating a project-local skill:

1. Record the source repository, branch, and commit in this file.
2. Keep the skill under `.agents/skills/<skill-folder>/`.
3. Verify the installed skill folder contains `SKILL.md`.
4. Use `python3` in project-local skill examples; this workspace does not expose a `python` command.
5. Restart Codex after the update.
