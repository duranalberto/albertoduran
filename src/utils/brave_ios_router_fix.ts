// Brave iOS ClientRouter suppression patch

const SUPPRESS_AFTER_SCROLL_MS = 350;

let lastInteractionEnd = 0;
let scrollSettleTimer: number | null = null;

function markInteractionEndSoon() {
  if (scrollSettleTimer) {
    clearTimeout(scrollSettleTimer);
  }

  scrollSettleTimer = window.setTimeout(() => {
    lastInteractionEnd = Date.now();
  }, 120);
}

window.addEventListener(
  "touchend",
  () => {
    lastInteractionEnd = Date.now();
  },
  { passive: true },
);

window.addEventListener(
  "touchcancel",
  () => {
    lastInteractionEnd = Date.now();
  },
  { passive: true },
);

window.addEventListener("scroll", markInteractionEndSoon, {
  passive: true,
  capture: true,
});

function resolveUrl(url?: string | URL | null) {
  if (!url) return null;
  try {
    return new URL(url.toString(), location.href).href;
  } catch {
    return null;
  }
}

function shouldSuppress(url?: string | URL | null) {
  const now = Date.now();

  if (now - lastInteractionEnd > SUPPRESS_AFTER_SCROLL_MS) {
    return false;
  }

  const newUrl = resolveUrl(url);

  if (newUrl && newUrl === location.href) {
    return true;
  }

  return false;
}

const originalReplace = history.replaceState.bind(history);
const originalPush = history.pushState.bind(history);

history.replaceState = function (state, title, url) {
  if (shouldSuppress(url)) return;
  return originalReplace(state, title, url);
};

history.pushState = function (state, title, url) {
  if (shouldSuppress(url)) return;
  return originalPush(state, title, url);
};

console.debug("[Brave iOS Router Fix] Active");

export {};
