# Project Roadmap & Future Integrations: albertoduran

This document tracks planned features, technical integrations, and upcoming milestones to provide context for future development cycles.

## 1. Technical Integrations (Planned)

### 📊 Metrics & Analytics

- **Tool:** Plausible Analytics (or lightweight alternative).
- **Goal:** Privacy-friendly tracking without heavy JS bundles.
- **Implementation Strategy:** Add script to the main `Layout.astro` head, potentially using a Partytown integration to keep it off the main thread.

### ☁️ Cloudflare Integration

- **Platform:** Cloudflare Pages.
- **CI/CD:** Automatic builds from `master`.
- **Advanced Features:** Explore Cloudflare Workers for dynamic form handling on the `/contact` page if SSR becomes too heavy.

### 🤖 AI Model Integration (Claude/Gemini)

- **Goal:** Use AI for content suggestions or automated metadata generation for `.mdx` files.
- **Contextual Awareness:** Models should always refer to the `docs/` folder to maintain brand voice and technical standards.

## 2. Feature Backlog (Pending)

| Feature                | Priority   | Tech Notes                                                                                                                     |
| :--------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **CI Test Automation** | **Urgent** | **GitHub Actions to run `docs/TESTING_STRATEGY.md` (Vitest & Playwright) on every PR. Required for Git Workflow enforcement.** |
| **Contact Form**       | High       | Preact Island + Validation. Integration with Cloudflare Turnstile for spam.                                                    |
| **Dark Mode**          | Medium     | DaisyUI Theme Controller + Tailwind. Persist in LocalStorage.                                                                  |
| **RSS Feed**           | Medium     | Use `@astrojs/rss` as seen in `package.json`.                                                                                  |
| **Blog Search**        | Low        | Static index search or Pagefind integration.                                                                                   |

## 3. Implementation Logic for AI

When assisting with a "High" or "Medium" priority task:

1. **Architecture Alignment**: Ensure the solution is compatible with the "SPA-feel" and lifecycle hooks defined in `ARCHITECTURE_AND_ROUTING.md`.
2. **Dependency Management**: Do not introduce new dependencies without checking if an existing one (Preact, DaisyUI) can handle the task.
3. **Verification Requirement**: Always suggest or generate a test case following `docs/TESTING_STRATEGY.md` before finalizing a feature.
4. **Contextual Onboarding**: Before starting any task, the AI must confirm it has processed the rules defined in the **AI Usage Protocol** (located in `PROJECT_CONTEXT.md`).

## 4. Implement QA

### Quality Assurance & Testing

- **Vitest**: For Unit and Component testing (Preact logic).
- **Playwright**: For End-to-End (E2E) testing (Navigation and View Transitions).
- **Astro Check**: For static type-checking of `.astro` files.
