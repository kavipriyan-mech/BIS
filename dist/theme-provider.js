// theme-provider.js
(function() {
  const STORAGE_KEY = "bis_theme_id";
  const MODE_STORAGE_KEY = "bis_theme_mode";
  const DEFAULT_THEME_ID = "glassmorphism";
  const DEFAULT_MODE = "dark";
  const THEME_REGISTRY = [
    {
      id: "glassmorphism",
      name: "BIS Official (Glass)",
      category: "Glassmorphism",
      designTag: "GLASS",
      badgeText: "DEFAULT",
      swatches: ["#3b82f6", "#06b6d4", "#6366f1"],
      path: "themes/glassmorphism/theme.css"
    },
    {
      id: "neobrutalism",
      name: "Neobrutalism",
      category: "Neobrutalism",
      designTag: "BRUTAL",
      badgeText: "FEATURED",
      swatches: ["#F59E0B", "#4F46E5", "#0F172A"],
      path: "themes/neobrutalism/theme.css"
    },
    {
      id: "hallmark",
      name: "Hallmark Editorial",
      category: "Anti-AI Slop",
      designTag: "CRAFT",
      badgeText: "TACTILE",
      swatches: ["#EA580C", "#1C1917", "#FAF7F2"],
      path: "themes/hallmark/theme.css"
    },
    {
      id: "claymorphism",
      name: "Claymorphism",
      category: "Claymorphism",
      designTag: "PUFFY",
      badgeText: "CLAY",
      swatches: ["#3B82F6", "#F43F5E", "#EEF2F7"],
      path: "themes/claymorphism/theme.css"
    },
    {
      id: "skeumorphism",
      name: "Skeuomorphism",
      category: "Skeuomorphism",
      designTag: "TACTILE",
      badgeText: "MATERIAL",
      swatches: ["#1D4ED8", "#D97706", "#F1F3F7"],
      path: "themes/skeumorphism/theme.css"
    },
    {
      id: "neumorphism",
      name: "Neumorphism",
      category: "Neumorphism",
      designTag: "EXTRUDE",
      badgeText: "SOFT",
      swatches: ["#0284C7", "#4F46E5", "#E8ECF2"],
      path: "themes/neumorphism/theme.css"
    },
    {
      id: "storytelling",
      name: "Storytelling",
      category: "Storytelling",
      designTag: "NARRATIVE",
      badgeText: "STORY",
      swatches: ["#4338CA", "#D97706", "#FAF8F5"],
      path: "themes/storytelling/theme.css"
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk Neon",
      category: "Retro Sci-Fi",
      designTag: "CYBER",
      badgeText: "NEON",
      swatches: ["#00F0FF", "#FF007F", "#070712"],
      path: "themes/cyberpunk/theme.css"
    },
    {
      id: "dracula",
      name: "Dracula Violet",
      category: "Dark Mode",
      designTag: "DRACULA",
      badgeText: "POPULAR",
      swatches: ["#BD93F9", "#FF79C6", "#282A36"],
      path: "themes/dracula/theme.css"
    }
  ];
  const FONT_REGISTRY = {
    glassmorphism: "family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600",
    neobrutalism: "family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600",
    hallmark: "family=Fraunces:opsz,wght@9..144,400..700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500",
    claymorphism: "family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    skeumorphism: "family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    neumorphism: "family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600",
    storytelling: "family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    cyberpunk: "family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600",
    dracula: "family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600"
  };
  function getFontLink() {
    let link = document.getElementById("theme-fonts");
    if (!link) {
      link = document.createElement("link");
      link.id = "theme-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    return link;
  }
  function loadFontsForTheme(themeId) {
    const q = FONT_REGISTRY[themeId];
    if (!q)
      return;
    const href = "https://fonts.googleapis.com/css2?" + q + "&display=swap";
    const link = getFontLink();
    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href);
    }
  }

  class ThemeProvider {
    constructor() {
      this.registry = [...THEME_REGISTRY];
      this.currentThemeId = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID;
      this.currentMode = localStorage.getItem(MODE_STORAGE_KEY) || DEFAULT_MODE;
      this.isOpen = false;
    }
    getLinkElement() {
      let link = document.getElementById("theme-stylesheet");
      if (!link) {
        link = document.createElement("link");
        link.id = "theme-stylesheet";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      return link;
    }
    init() {
      this.ensureLucide();
      this.applyThemeStylesheet(this.currentThemeId);
      this.applyMode(this.currentMode);
      this.setupDropdownDOM();
      this.bindEvents();
    }
    ensureLucide() {
      const load = () => {
        if (window.lucide || document.getElementById("lucide-script"))
          return;
        const s = document.createElement("script");
        s.id = "lucide-script";
        s.src = "lucide.min.js";
        s.async = true;
        s.onload = () => {
          if (window.lucide) {
            try {
              window.lucide.createIcons();
            } catch (e) {}
          }
        };
        document.head.appendChild(s);
      };
      if (document.readyState === "complete" || document.readyState === "interactive") {
        window.setTimeout(load, 0);
      } else {
        window.addEventListener("load", () => window.setTimeout(load, 0));
      }
    }
    registerTheme(themeObj) {
      if (!themeObj || !themeObj.id || !themeObj.path)
        return false;
      const idx = this.registry.findIndex((t) => t.id === themeObj.id);
      if (idx >= 0) {
        this.registry[idx] = { ...this.registry[idx], ...themeObj };
      } else {
        this.registry.push(themeObj);
      }
      this.renderDropdownItems();
      return true;
    }
    getThemes() {
      return this.registry;
    }
    getCurrentTheme() {
      return this.registry.find((t) => t.id === this.currentThemeId) || this.registry[0];
    }
    getCurrentMode() {
      return this.currentMode;
    }
    applyThemeStylesheet(themeId) {
      const theme = this.registry.find((t) => t.id === themeId) || this.registry[0];
      const link = this.getLinkElement();
      const newHref = theme.path;
      if (link.getAttribute("href") !== newHref) {
        link.setAttribute("href", newHref);
      }
      document.documentElement.setAttribute("data-theme", theme.id);
      this.currentThemeId = theme.id;
      localStorage.setItem(STORAGE_KEY, theme.id);
      loadFontsForTheme(theme.id);
      this.updateHeaderButtonText();
      this.renderDropdownItems();
    }
    applyMode(mode) {
      const validMode = mode === "light" || mode === "dark" ? mode : DEFAULT_MODE;
      document.documentElement.setAttribute("data-mode", validMode);
      this.currentMode = validMode;
      localStorage.setItem(MODE_STORAGE_KEY, validMode);
      document.querySelectorAll(".mode-toggle-btn, .mobile-mode-toggle").forEach((btn) => {
        const iconEl = btn.querySelector(".mode-icon");
        const labelEl = btn.querySelector(".mode-label");
        if (validMode === "light") {
          if (iconEl)
            iconEl.innerHTML = '<i data-lucide="sun"></i>';
          if (labelEl)
            labelEl.textContent = "Light";
          btn.setAttribute("title", "Switch to Dark Mode");
          btn.setAttribute("aria-label", "Switch to Dark Mode");
        } else {
          if (iconEl)
            iconEl.innerHTML = '<i data-lucide="moon"></i>';
          if (labelEl)
            labelEl.textContent = "Dark";
          btn.setAttribute("title", "Switch to Light Mode");
          btn.setAttribute("aria-label", "Switch to Light Mode");
        }
      });
      document.querySelectorAll(".mode-seg-btn").forEach((btn) => {
        const val = btn.getAttribute("data-mode-val");
        btn.classList.toggle("active", val === validMode);
      });
      if (window.lucide) {
        const rootHeader = document.querySelector(".header");
        if (rootHeader)
          window.lucide.createIcons({ root: rootHeader });
      }
    }
    setMode(mode) {
      if (this.currentMode === mode)
        return;
      const performSwitch = () => {
        this.applyMode(mode);
      };
      if (document.startViewTransition) {
        document.startViewTransition(() => performSwitch());
      } else {
        performSwitch();
      }
    }
    toggleMode() {
      this.setMode(this.currentMode === "dark" ? "light" : "dark");
    }
    setTheme(themeId) {
      if (this.currentThemeId === themeId) {
        this.closeDropdown();
        return;
      }
      const performSwitch = () => {
        this.applyThemeStylesheet(themeId);
        this.closeDropdown();
      };
      if (document.startViewTransition) {
        document.startViewTransition(() => performSwitch());
      } else {
        performSwitch();
      }
    }
    updateHeaderButtonText() {
      const current = this.getCurrentTheme();
      document.querySelectorAll(".theme-btn-name").forEach((el) => {
        el.textContent = current.name;
      });
    }
    setupDropdownDOM() {
      let wrapper = document.querySelector(".theme-switcher-wrapper");
      if (!wrapper) {
        const btn = document.getElementById("themePickerBtn");
        if (btn) {
          wrapper = document.createElement("div");
          wrapper.className = "theme-switcher-wrapper";
          btn.parentNode.insertBefore(wrapper, btn);
          wrapper.appendChild(btn);
        }
      }
      if (wrapper && !document.getElementById("themeDropdownMenu")) {
        const dropdownHtml = `
          <div id="themeDropdownMenu" class="theme-dropdown-menu hidden" role="menu" aria-orientation="vertical">
            <div class="theme-dropdown-header">
              <span>Theme System</span>
              <div class="theme-mode-segmented-control" role="radiogroup" aria-label="Appearance Mode">
                <button type="button" class="mode-seg-btn ${this.currentMode === "light" ? "active" : ""}" data-mode-val="light" title="Light Mode"><i data-lucide="sun"></i> Light</button>
                <button type="button" class="mode-seg-btn ${this.currentMode === "dark" ? "active" : ""}" data-mode-val="dark" title="Dark Mode"><i data-lucide="moon"></i> Dark</button>
              </div>
            </div>
            <div class="theme-dropdown-list" id="themeDropdownList">
              <!-- Dynamically populated -->
            </div>
          </div>
        `;
        wrapper.insertAdjacentHTML("beforeend", dropdownHtml);
      }
      this.renderDropdownItems();
    }
    renderDropdownItems() {
      const list = document.getElementById("themeDropdownList");
      if (!list)
        return;
      list.innerHTML = this.registry.map((theme) => {
        const isActive = theme.id === this.currentThemeId;
        const swatchesHtml = theme.swatches.map((c) => `<span class="theme-drop-swatch" style="background:${c}"></span>`).join("");
        return `
          <button type="button" class="theme-dropdown-item ${isActive ? "active" : ""}" data-theme-id="${theme.id}" role="menuitem">
            <div class="theme-item-left">
              <span class="theme-item-name">${theme.name}</span>
              <span class="theme-item-tag">${theme.designTag}</span>
            </div>
            <div class="theme-item-right">
              <div class="theme-drop-swatches">${swatchesHtml}</div>
              <span class="theme-item-check">${isActive ? '<i data-lucide="check"></i>' : ""}</span>
            </div>
          </button>
        `;
      }).join("");
      list.querySelectorAll(".theme-dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = item.getAttribute("data-theme-id");
          this.setTheme(id);
        });
      });
      if (window.lucide) {
        const rootMenu = document.getElementById("themeDropdownMenu");
        if (rootMenu)
          window.lucide.createIcons({ root: rootMenu });
      }
    }
    bindEvents() {
      document.addEventListener("click", (e) => {
        const modeToggle = e.target.closest("#modeToggleBtn, .mode-toggle-btn, .mobile-mode-toggle");
        if (modeToggle) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMode();
          return;
        }
        const modeSeg = e.target.closest(".mode-seg-btn");
        if (modeSeg) {
          e.preventDefault();
          e.stopPropagation();
          const selectedMode = modeSeg.getAttribute("data-mode-val");
          if (selectedMode)
            this.setMode(selectedMode);
          return;
        }
        const trigger = e.target.closest("#themePickerBtn, .theme-picker-trigger");
        if (trigger) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleDropdown();
          return;
        }
        const dropdown = document.getElementById("themeDropdownMenu");
        if (dropdown && !dropdown.contains(e.target) && this.isOpen) {
          this.closeDropdown();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.closeDropdown();
        }
      });
    }
    toggleDropdown() {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }
    openDropdown() {
      const dropdown = document.getElementById("themeDropdownMenu");
      const btn = document.getElementById("themePickerBtn");
      if (dropdown) {
        dropdown.classList.remove("hidden");
        this.isOpen = true;
        if (btn)
          btn.setAttribute("aria-expanded", "true");
      }
    }
    closeDropdown() {
      const dropdown = document.getElementById("themeDropdownMenu");
      const btn = document.getElementById("themePickerBtn");
      if (dropdown) {
        dropdown.classList.add("hidden");
        this.isOpen = false;
        if (btn)
          btn.setAttribute("aria-expanded", "false");
      }
    }
  }
  window.ThemeProvider = new ThemeProvider;
})();
