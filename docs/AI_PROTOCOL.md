# AI Usage Protocol: albertoduran

This document is the mandatory entry point for any AI assistant (Gemini, Claude, GPT, etc.) helping with the development of the albertoduran portfolio.

## 1. Onboarding Checklist

Before proposing any code, the AI must confirm it has processed the following "Source of Truth" documents in this order:

1. **`./PROJECT_CONTEXT.md`**: Understand the tech stack (Astro 5.1, Preact 10.28, DaisyUI 5.5) and core project goals.
2. **`./TECHNICAL_STACK.md`**: Absorb the "SPA-feel" requirements, View Transition lifecycle hooks, and path-to-file mappings.
3. **`./GIT_WORKFLOW.md`**: Adhere to the strict "One Commit Rule," rebasing requirements, and feature-branch naming.
4. **`./TESTING_STRATEGY.md`**: Acknowledge that no feature is "complete" without accompanying Vitest (Unit) or Playwright (E2E) tests.

## 2. Interaction Rules

### A. The "Verification First" Mandate

AI assistants are prohibited from suggesting a merge or completing a task without first providing the specific test cases required by the **Testing Strategy**. If you generate a Preact island, you MUST generate a corresponding `.test.tsx` file.

### B. Dependency Guardrails

Do not suggest adding new `npm` packages. The project is strictly scoped to the libraries listed in the **Project Context**. If a feature seems to require a new library, the AI must first explain why existing tools (Tailwind, DaisyUI, Preact) are insufficient.

### C. Git Safety

If a rebase conflict occurs during an automated task, the AI **MUST STOP** immediately. Do not attempt to force-push (`--force`) or use automated conflict resolution that could lead to code loss.

## 3. Prompting Examples for the User

**For a New Feature:**

> "I am working on the [Feature Name] as described in the Roadmap. I have read the Project Context and Technical Stack. Please generate the component using DaisyUI and the corresponding Vitest tests."

**For a Bug Fix:**

> "I found a bug in the navigation. I will create a branch `feature/fix-[description]`, fix the logic, and verify it with a Playwright test to ensure the View Transitions still work."
