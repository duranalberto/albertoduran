# Design Doc Mermaid Skill

Project-local Codex skill for creating Mermaid diagrams and design-document drafts. The installed bundle lives in `.agents/skills/design-doc-mermaid/` and is tracked in `docs/AI_SKILLS.md`.

## What It Provides

- Diagram guides for activity, deployment, architecture, and sequence diagrams.
- Code-to-diagram examples for Spring Boot, FastAPI, React, Python ETL, Node/Express, and Java web apps.
- Design document templates under `assets/`.
- Python utilities for extracting, validating, and rendering Mermaid diagrams.
- A resilient workflow guide for saving `.mmd` files, rendering images, and recovering from syntax errors.

## Local Usage

Run commands from this skill directory unless a command uses an explicit path:

```bash
cd .agents/skills/design-doc-mermaid
python3 scripts/extract_mermaid.py document.md --list-only
python3 scripts/extract_mermaid.py document.md --validate
python3 scripts/mermaid_to_image.py diagram.mmd output.svg
python3 scripts/resilient_diagram.py --code "flowchart TD; A-->B" --json
```

This workspace exposes `python3`, not `python`. The scripts use the Python standard library. Image rendering and validation require `mmdc` from `@mermaid-js/mermaid-cli` when you are not only extracting diagrams.

## Resource Map

```text
design-doc-mermaid/
├── SKILL.md
├── README.md
├── HIGH_CONTRAST_UPDATE.md
├── assets/
│   ├── architecture-design-template.md
│   ├── api-design-template.md
│   ├── database-design-template.md
│   ├── feature-design-template.md
│   └── system-design-template.md
├── examples/
│   ├── fastapi/
│   ├── java-webapp/
│   ├── node-webapp/
│   ├── python-etl/
│   ├── react/
│   └── spring-boot/
├── references/
│   ├── mermaid-diagram-guide.md
│   └── guides/
│       ├── code-to-diagram/README.md
│       ├── diagrams/
│       ├── resilient-workflow.md
│       ├── troubleshooting.md
│       └── unicode-symbols/guide.md
└── scripts/
    ├── extract_mermaid.py
    ├── mermaid_to_image.py
    └── resilient_diagram.py
```

## Current Status

The installed guide and example files listed above are present in this repository. Do not rely on upstream README status labels or marketplace install commands when working in this project; use this local bundle and the registry in `docs/AI_SKILLS.md` as the source of truth.

## Troubleshooting

1. Check `references/guides/troubleshooting.md` for the parser error.
2. Validate the diagram with `mmdc` when rendering matters.
3. If the local guide does not cover the issue, use the web/search tools available in the current Codex session and prefer official Mermaid documentation or the Mermaid repository.

## Maintenance

When updating this skill, keep all files under `.agents/skills/design-doc-mermaid/`, verify `SKILL.md` still exists, update `docs/AI_SKILLS.md` with the source commit or extraction detail, and restart Codex so the skill metadata is rediscovered.
