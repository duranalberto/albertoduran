# MDX Rules — Reference Guide

Complete formatting and structure rules for albertoduran.com `.mdx` journal
posts. Apply every rule on every post, every time.

Project facts:

- Journal source files live under `src/thejournal/`.
- The content collection is `thejournal` in `src/content.config.ts`.
- Standalone posts and vault root `index.mdx` files need an `image`.
- Child vault entries can inherit the vault root image, but add an image when
  the entry needs its own card or social preview.
- Existing posts include `author: "Alberto Duran"` as a house convention.
- Routes use trailing slashes and are generated from the file path.

---

## Frontmatter Template

Every post must begin with YAML frontmatter. Fill in required fields before
delivering the file.

```yaml
---
title: "Write a clear, specific, SEO-friendly title"
description: "One or two sentences summarizing the post's main value."
author: "Alberto Duran"
image: "../assets/thejournal/stock/01.avif"
tags: ["tag1", "tag2", "tag3"]
pubDate: YYYY-MM-DD
# updatePubDate: YYYY-MM-DD
# github: "repository-name-or-url"
# order: 100
---
```

**Field rules:**

- `title` — sentence case, under 65 characters, no trailing period.
- `description` — between 120 and 160 characters, written for the SEO meta description.
- `author` — always "Alberto Duran" unless specified otherwise. This is a project convention, not part of the current schema.
- `image` — required for standalone posts and vault roots. Use the correct relative path from the MDX file to `src/assets/thejournal/...`.
- `tags` — 2 to 6 lowercase tags. Prefer hyphens for multi-word tags unless an existing project tag uses spaces.
- `pubDate` — ISO 8601 format: `YYYY-MM-DD`.
- `updatePubDate` — optional. Use only when revising an existing publication after `pubDate`.
- `github` — optional related repository slug or URL. Match existing posts, which often use a repository name.
- `order` — optional manual ordering value for vault entries. Defaults to `100`.

The active schema requires `title` and `pubDate`. It accepts `description`,
`image`, `github`, `tags`, `updatePubDate`, and `order`. Keep `author` for
consistency with existing content unless the user asks otherwise.

---

## Document Structure Template

Follow this order for every post. The hook paragraph and `---` before every H2 are mandatory.

```
---
[frontmatter]
---

[Optional: import statements for MDX components]

Hook paragraph — 40–90 words, no heading above it. Signals the problem,
promises the payoff, earns attention with a concrete observation or scenario.

---

## First Section Title

Content.

### Subsection (H3, if needed)

Content.

---

## Second Section Title

Content.

---

## Final Section

Content.
```

---

## MDX-Specific Rules

- Code blocks inside the MDX file are plain strings. Do not let opening or closing triple backticks break the file structure.
- Always declare the language after the opening triple backticks of every code block.
- When using MDX components (callouts, alerts, cards), import them at the top of the file, immediately after the frontmatter.
- Keep the frontmatter block as plain YAML. No MDX syntax inside the frontmatter.
- Do not add Mermaid `%%{init: ...}%%` theme blocks. The project renderer owns Mermaid theme output.

---

## Markdown Rules

### Headings

Use `#` signs to define heading levels. Always put a space between the `#` and the heading text. Always add a blank line before and after each heading.

```
# H1 — Page title (used once, in frontmatter title field only)
## H2 — Main sections
### H3 — Subsections within H2
#### H4 — Sub-subsections when needed
```

Never skip heading levels. The H1 belongs in the frontmatter — never in the document body.

### Section Separators

**Every H2 must be preceded by a `---` horizontal rule.** No exceptions. This applies to the first H2 after the hook paragraph too.

```
[end of previous section content]

---

## Next Section Title
```

The `---` goes on its own line with a blank line above and below.

### Paragraphs

Separate paragraphs with a blank line. Never indent paragraphs with tabs or spaces (unless inside a list). Each paragraph must be between 20 and 80 words.

### Emphasis

Use `**double asterisks**` for bold. Use `*single asterisks*` for italic. Always use asterisks, not underscores.

Bold highlights the most important phrase in a paragraph when it genuinely changes how the reader understands the sentence. Don't bold for decoration.

### Lists

Use unordered lists with `-` as the delimiter. Be consistent within a list — never mix `-`, `*`, and `+`.

```
- First item
- Second item
  - Nested item (indented with 2 spaces)
```

Use ordered lists when sequence matters. Each bullet must be a complete thought, not a one-word fragment. Minimum one full sentence per item.

### Blockquotes

Use `>` to call out a key quote, a principle, or an important aside.

```
> The goal is not to sound smart. The goal is to be useful.
```

### Code — Inline

Use backticks for inline code or technical terms: `npm install`.

### Code — Blocks (Fenced)

Use triple backticks with the language identifier. Required for all code samples.

Always declare the language. Never leave a fenced code block without a language tag.

Supported identifiers: `js`, `ts`, `jsx`, `tsx`, `css`, `html`, `bash`, `json`, `yaml`, `python`, `sql`, `mdx`, `mermaid`.

### Horizontal Rules

Use `---` on its own line to create a visual separator. Always add a blank line before and after.

### Links

Standard link syntax: `[Link text](https://example.com)`

Link text must describe the destination. Never use "click here" or "read more" as link text.

### Images

```
![Descriptive alt text](/path/to/image.jpg "Optional title")
```

Always write meaningful alt text. Describe what the image shows, not just a generic caption.

### Tables

Use tables to compare options, list parameters, or present structured data. Tables are for data comparison, not for layout. If the content isn't genuinely tabular, use a list instead.

---

## Visual Variety Checklist

Before delivering the file, confirm the post passes every item:

- [ ] Hook paragraph present, 40–90 words, no heading above it.
- [ ] Every H2 in the body preceded by `---` on its own line.
- [ ] At least 2 H2 subheadings.
- [ ] At least 1 H3 subheading.
- [ ] At least 1 unordered or ordered list.
- [ ] At least 1 bold emphasis (not just in headings).
- [ ] At least 1 code block (technical posts) or 1 blockquote (opinion or narrative posts).
- [ ] Mermaid diagram included if the post contains a process, workflow, system, sequence, or data model.
- [ ] No section longer than 4 consecutive paragraphs without a visual break.
- [ ] No paragraph shorter than 20 words or longer than 80 words.

---

## Quick Reference — What Not to Do

| Rule | Wrong | Right |
| ---- | ----- | ----- |
| Hook paragraph | Starting with a definition | Start with a scenario, fact, or direct admission |
| `---` before H2 | `## Section` with no separator | `---\n\n## Section` |
| No em dashes | "It works — most of the time." | "It works most of the time." |
| No colons in prose | "The answer is: use a hook." | "The answer is to use a hook." |
| No banned words | "This robust solution leverages..." | "This setup uses..." |
| No salesperson triads | "You can. You will. You must." | "You can do this in three steps." |
| No hollow contrasts | "This isn't a tutorial, it's a guide." | "This is a practical guide." |
| Active over passive | "The config was updated by the user." | "The user updated the config." |
| Specific link text | "Click here to learn more." | "Read the deployment guide." |
| Code block with lang | ` ```\ncode\n``` ` | ` ```js\ncode\n``` ` |
| Mermaid — no custom theme | ` ```mermaid\n%%{init:...}%%\ngraph TD` | ` ```mermaid\ngraph TD` |
