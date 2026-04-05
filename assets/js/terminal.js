(() => {
  const palette = document.getElementById("command-palette");
  if (!palette) return;

  const closePalette = () => {
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
  };

  const openPalette = () => {
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    const input = palette.querySelector(".palette-input");
    if (input instanceof HTMLInputElement) {
      input.value = "";
      input.focus();
      filterPalette("");
    }
  };

  const filterPalette = (query) => {
    const items = palette.querySelectorAll(".palette-list li");
    items.forEach((item) => {
      const link = item.querySelector("a");
      const text = link ? link.textContent?.toLowerCase() : "";
      const match = text?.includes(query.toLowerCase());
      item.style.display = match ? "block" : "none";
    });
  };

  const paletteButton = document.querySelector("[data-palette-open]");
  if (paletteButton) {
    paletteButton.addEventListener("click", () => {
      openPalette();
    });
  }

  document.addEventListener("keydown", (event) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const comboPressed = (isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "k";

    if (comboPressed) {
      event.preventDefault();
      if (palette.classList.contains("open")) {
        closePalette();
      } else {
        openPalette();
      }
    }

    if (event.key === "Escape") {
      closePalette();
    }
  });

  palette.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.matches("[data-palette-close]") || target.closest("[data-palette-close]"))) {
      closePalette();
    }

    const link = target instanceof HTMLAnchorElement ? target : target instanceof HTMLElement ? target.closest("a") : null;
    if (link instanceof HTMLAnchorElement) {
      const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
      const linkPath = new URL(link.href).pathname.replace(/\/index\.html$/, "/");
      if (currentPath === linkPath) {
        event.preventDefault();
        closePalette();
      }
    }
  });

  const paletteInput = palette.querySelector(".palette-input");
  if (paletteInput instanceof HTMLInputElement) {
    paletteInput.addEventListener("input", (event) => {
      filterPalette(event.target.value);
    });

    paletteInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const firstVisible = palette.querySelector(".palette-list li:not([style*='display: none']) a");
        if (firstVisible instanceof HTMLAnchorElement) {
          firstVisible.click();
        }
      }
    });
  }
})();

(() => {
  const overlay = document.getElementById("boot-overlay");
  if (!overlay) return;

  const navEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navEntry?.type === "reload";
  const hasSeenBoot = sessionStorage.getItem("bootSeen") === "true";
  const shouldShowBoot = isReload || !hasSeenBoot;

  if (!shouldShowBoot) {
    overlay.classList.remove("active");
    return;
  }

  sessionStorage.setItem("bootSeen", "true");

  const screens = overlay.querySelectorAll(".boot-screen");
  const stepItems = overlay.querySelectorAll("[data-step]");
  const progressBar = overlay.querySelector("[data-progress-bar]");
  const showScreen = (index) => {
    screens.forEach((screen, idx) => {
      screen.classList.toggle("active", idx === index);
    });
  };

  const runBootSteps = () => {
    stepItems.forEach((item) => item.classList.remove("active"));
    let current = 0;
    const total = stepItems.length;

    const tick = () => {
      if (current >= total) return;
      stepItems[current].classList.add("active");
      if (progressBar) {
        const progress = Math.round(((current + 1) / total) * 100);
        progressBar.style.width = `${progress}%`;
      }
      current += 1;
      window.setTimeout(tick, 260);
    };

    tick();
  };

  overlay.classList.add("active");
  showScreen(0);
  runBootSteps();

  window.setTimeout(() => {
    showScreen(1);
  }, 3200);

  window.setTimeout(() => {
    overlay.classList.remove("active");
  }, 7200);
})();
