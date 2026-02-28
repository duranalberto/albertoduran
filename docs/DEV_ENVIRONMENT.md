# Development Environment Setup Guide: albertoduran

This document provides a comprehensive guide to the containerized development environment (DevContainer) used in this Astro, Preact, and TailwindCSS project.

## 1. Overview

We utilize **VS Code DevContainers** to ensure every developer works in an identical, pre-configured environment. This eliminates "it works on my machine" issues by encapsulating the operating system, tools, runtime (Node.js), and editor extensions within a Docker container.

## 2. Minimum Requirements (Host Machine)

Before cloning the repository, ensure your local machine meets these requirements:

1. **Docker Desktop:** Installed and running.
2. **Visual Studio Code:** Latest version.
3. **Dev Containers Extension:** Official extension by Microsoft.
4. **Font Installation (Crucial):**
   - The container terminal uses **"FiraCode Nerd Font"** to render icons (Git branches, file types).
   - **Action:** Download and install a Nerd Font on your **host operating system**.
   - [Download FiraCode Nerd Font](https://www.nerdfonts.com/font-downloads)

## 3. Quick Start for Developers

Follow these steps to spin up the environment:

### Step 1: Clone and Prepare Secrets

The project uses a secure `.env` strategy. The `.devcontainer` folder contains an example file, but strictly ignores the real secrets file.

1. Clone the repository.
2. Navigate to the `.devcontainer/` folder.
3. Create a copy of the example file:
   `cp .devcontainer/.env.example .devcontainer/.env`

Optional: Open `.devcontainer/.env` and add your `GITHUB_TOKEN` for `gh` CLI auto-authentication.

### Step 2: Build the Container

1. Open the project root folder in VS Code.
2. When the notification appears, click **Reopen in Container**.
3. _Alternative:_ Press `F1` and run **Dev Containers: Reopen in Container**.

---

## 4. What is Being Built?

### The Operating System (Dockerfile)

We build upon **Node.js 24.13 (LTS) Alpine**.

**Key Components Installed:**

- **Zsh (Z Shell):** Enhanced interactive shell.
- **Oh My Zsh:** Framework for Zsh management.
- **Powerlevel10k:** Theme configured for minimalism (relative path + git status only).
- **GitHub CLI (gh):** Tool for interacting with GitHub directly from the terminal.
- **Testing Infrastructure:** - **Vitest:** Pre-installed for unit and component testing.
  - **Playwright Dependencies:** All system-level Linux dependencies (libraries for Chromium, Firefox, and WebKit) are pre-installed in the Docker image.
  - **Benefit:** Commands like `npm test` and `npm run test:e2e` work immediately upon container start.

### Intelligent Secret Management

- It looks for a `.env` file in the `.devcontainer` folder.
- If a `GITHUB_TOKEN` is present, the `gh` CLI is automatically authenticated.
- Fallback: If no token is found, the shell notifies the user and reverts to standard host credential forwarding.

---

## 5. VS Code Configuration & Extensions

The setup is split between `devcontainer.json` (infrastructure/fonts) and `.vscode/settings.json` (project logic).

### Grouped Extension Strategy

- **UI & Aesthetics:** **Monokai++** for syntax and **Material Icon Theme** for the file explorer.
- **Core Logic:** Official **Astro**, **MDX**, and **TypeScript** support, plus React/Preact snippets.
- **Styling:** **Tailwind CSS** IntelliSense and custom regex for class detection.
- **QA & Formatting:** - **ESLint/Prettier/Markdownlint:** Maintain code and structure quality.
  - **Code Spell Checker:** Manages professionalism in code and documentation via a dedicated project dictionary located at `.vscode/dictionary.txt`.
- **Collaboration:** **Better Git Line Blame**, **GitGraph**, and **GitHub Pull Requests** for seamless teamwork.

### Project Settings (`.vscode/settings.json`)

To ensure consistency across all environments, the following logic is standardized in the repository:

- **Formatting:** `formatOnSave` enabled; Prettier handles `.astro`, `.mdx`, `.jsx`, and `.tsx` files.
- **Astro/MDX Optimization:** Includes Emmet support and Tailwind CSS language associations.
- **Auto-Imports:** JavaScript and TypeScript are configured to suggest and update imports on file moves automatically.
- **Spell Checker:** Linked to a local dictionary file to keep the configuration clean and portable.

### Container UI Overrides (`devcontainer.json`)

The following settings are applied specifically when running inside the container:

- **Font Ligatures:** Enabled for "Fira Code" (e.g., `=>` becomes a single arrow).
- **Terminal:** Integrated terminal set to `zsh` with "FiraCode Nerd Font" for icon rendering.

---

## 6. Detailed Dockerfile Breakdown

The construction follows these logical steps:

1. **Base Layer:** Uses `node:24.13-alpine`.
2. **Dependencies:** Installs `git`, `zsh`, `curl`, `github-cli`, and the Linux libraries required for Playwright/Vitest via `apk`.
3. **User Context:** Switches to `USER node` for security.
4. **Zsh Setup:** Installs Oh My Zsh, Powerlevel10k, and plugins (`autosuggestions`, `syntax-highlighting`).
5. **Dynamic Configuration:** Injects settings into `~/.zshrc` to handle the minimalist prompt and GITHUB_TOKEN export logic.
