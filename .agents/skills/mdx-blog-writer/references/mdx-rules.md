# MDX Rules — Reference Guide

Complete formatting and structure rules for `.mdx` blog posts. Apply every rule on every post, every time.

---

## Frontmatter Template

Every post must begin with this YAML frontmatter block. Fill in all fields before delivering the file.

```yaml
---
title: "Write a clear, specific, SEO-friendly title"
description: "One or two sentences summarizing the post's main value."
tags: ["tag1", "tag2", "tag3"]
pubDate: YYYY-MM-DD
author: "[Author name]"
---
```

**Field rules:**

- `title` — sentence case, under 65 characters, no trailing period.
- `description` — between 120 and 160 characters, written for the SEO meta description.
- `tags` — 2 to 5 lowercase tags, no spaces (use hyphens for multi-word tags).
- `pubDate` — ISO 8601 format: `YYYY-MM-DD`.
- `author` — use the user's provided byline first, then local context or publisher configuration. If no author is known, use a clear placeholder instead of inventing a name.

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
- Use MDX components only when the user, source material, or local publishing context confirms they exist. If component availability is unknown, use plain Markdown.
- When using MDX components, import them at the top of the file, immediately after the frontmatter.
- Keep the frontmatter block as plain YAML. No MDX syntax inside the frontmatter.
- Do not invent component names, import paths, or props. Reuse only components found in source material or local context.

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

## Adaptive Visual Variety Rules

Use visual variety to improve comprehension, not to satisfy a mechanical quota. Short posts, essays, and narrative pieces can be simpler than technical tutorials.

### Required for every complete MDX post

- [ ] Hook paragraph present, 40–90 words, no heading above it.
- [ ] Every H2 in the body preceded by `---` on its own line.
- [ ] At least 2 H2 subheadings.
- [ ] No section longer than 4 consecutive paragraphs without a visual break.
- [ ] No paragraph shorter than 20 words or longer than 80 words.

### Required when useful for the content

- [ ] At least 1 H3 subheading when a section has meaningful subtopics.
- [ ] At least 1 unordered or ordered list when multiple related items or steps appear.
- [ ] At least 1 code block for technical posts that explain implementation details.
- [ ] At least 1 blockquote for opinion, narrative, or principle-led posts when it highlights a memorable point.
- [ ] Mermaid diagram included if the post contains a process, workflow, system, sequence, or data model that prose alone would make harder to follow.

### Recommended, not mandatory

- [ ] Bold emphasis for the most important phrase in a paragraph, only when it improves scanning.
- [ ] Tables for genuine comparisons or structured data.
- [ ] Images when they add context the prose cannot provide as clearly.

---

## Pre-Delivery Validation

Before delivering a complete `.mdx` file, verify:

- [ ] Frontmatter exists, is valid YAML, and has no empty placeholder values unless the user asked for placeholders.
- [ ] `title`, `description`, `tags`, `pubDate`, and `author` are filled according to the field rules above.
- [ ] The body contains no H1.
- [ ] The hook paragraph appears immediately after frontmatter and imports.
- [ ] Every H2 is preceded by a `---` separator with blank lines around it.
- [ ] Every fenced code block has a language identifier.
- [ ] All links use descriptive link text.
- [ ] Images have meaningful alt text.
- [ ] Mermaid diagrams have no `%%{init: ...}%%` theme blocks or custom `themeVariables`.
- [ ] No unsupported facts, invented citations, or uncited direct quotes remain.
- [ ] Banned words and phrases from the main skill and humanizer reference have been removed.
- [ ] No em dashes appear in the delivered post body.
- [ ] Colons appear only in code blocks, frontmatter, URLs, or technical syntax.

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
