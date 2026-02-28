# .devcontainer/Dockerfile
FROM node:24.13-alpine

# Install system dependencies
# Added 'github-cli' for seamless gh auth integration
RUN apk add --no-cache \
    git \
    zsh \
    curl \
    openssh \
    github-cli

# Switch to non-root user
USER node
WORKDIR /home/node

# --- Zsh & Oh My Zsh Setup ---

# 1. Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# 2. Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 3. Install Zsh Plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
    && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# --- Shell Configuration & Credential Logic ---

# We inject a script to handle the credential fallback logic
RUN echo 'export ZSH="$HOME/.oh-my-zsh"' > ~/.zshrc \
    && echo 'ZSH_THEME="powerlevel10k/powerlevel10k"' >> ~/.zshrc \
    && echo 'plugins=(git zsh-autosuggestions zsh-syntax-highlighting)' >> ~/.zshrc \
    && echo 'source $ZSH/oh-my-zsh.sh' >> ~/.zshrc \
    # Minimalist Prompt Configuration
    && echo 'POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(dir vcs)' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=()' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_SHORTEN_STRATEGY="truncate_to_first_and_last"' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_MODE="nerdfont-complete"' >> ~/.zshrc \
    && echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> ~/.zshrc \
    # --- GitHub Credential Fallback Logic ---
    && echo '' >> ~/.zshrc \
    && echo '# GitHub Credential Check' >> ~/.zshrc \
    && echo 'if [ -z "$GITHUB_TOKEN" ]; then' >> ~/.zshrc \
    && echo '  echo "⚠️  Notice: GITHUB_TOKEN not found in secrets."' >> ~/.zshrc \
    && echo '  echo "   Using VS Code Host Credentials (default behavior)."' >> ~/.zshrc \
    && echo 'else' >> ~/.zshrc \
    && echo '  echo "✅ GitHub Token detected. Authenticating gh cli..."' >> ~/.zshrc \
    # We export the token so the 'gh' tool uses it automatically
    && echo '  export GITHUB_TOKEN=$GITHUB_TOKEN' >> ~/.zshrc \
    && echo 'fi' >> ~/.zshrc

ENV SHELL /bin/zsh