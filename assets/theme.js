(() => {
  const system = matchMedia("(prefers-color-scheme: dark)");
  const key = "young-theme";
  const filePreview = location.protocol === "file:";

  function savedChoice() {
    if (filePreview) return new URL(location.href).searchParams.get("theme");
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  let choice = savedChoice();

  function apply() {
    const theme = choice === "dark" || choice === "light"
      ? choice
      : (system.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.querySelector(".theme-toggle")?.setAttribute("aria-pressed", String(theme === "dark"));
  }

  function carryFileChoice() {
    // Browsers can give each file its own storage. Carry the choice in local links.
    if (!filePreview || (choice !== "dark" && choice !== "light")) return;
    for (const link of document.links) {
      if (link.protocol !== "file:" || link.getAttribute("href").startsWith("#")) continue;
      const destination = new URL(link.href);
      destination.searchParams.set("theme", choice);
      link.href = destination.href;
    }
  }

  apply();
  system.addEventListener("change", apply);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && !filePreview) {
      choice = savedChoice();
      apply();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme-toggle");
    button.hidden = false;
    apply();
    carryFileChoice();
    button.addEventListener("click", () => {
      choice = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      apply();
      if (filePreview) {
        carryFileChoice();
        const current = new URL(location.href);
        current.searchParams.set("theme", choice);
        try {
          history.replaceState(null, "", current);
        } catch {
          // The choice still travels with local links if URL updates are restricted.
        }
        return;
      }
      try {
        localStorage.setItem(key, choice);
      } catch {
        // The toggle still works on this page without storage.
      }
    });
  });
})();
