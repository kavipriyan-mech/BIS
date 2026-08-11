/* ============================================================
   BIS Club — Dynamic Theme Provider & Dropdown Engine
   Supports isolated folder-based theme stylesheets (themes/*)
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'bis_theme_id';
  const MODE_STORAGE_KEY = 'bis_theme_mode';
  const DEFAULT_THEME_ID = 'glassmorphism';
  const DEFAULT_MODE = 'dark';

  // Built-in Theme Folder Registry
  const THEME_REGISTRY = [
    {
      id: 'glassmorphism',
      name: 'BIS Official (Glass)',
      category: 'Glassmorphism',
      designTag: 'GLASS',
      badgeText: 'DEFAULT',
      swatches: ['#3b82f6', '#06b6d4', '#6366f1'],
      path: 'themes/glassmorphism/theme.css'
    },
    {
      id: 'neobrutalism',
      name: 'Neobrutalism',
      category: 'Neobrutalism',
      designTag: 'BRUTAL',
      badgeText: 'FEATURED',
      swatches: ['#FDC800', '#432DD7', '#1C293C'],
      path: 'themes/neobrutalism/theme.css'
    },
    {
      id: 'hallmark',
      name: 'Hallmark Editorial',
      category: 'Anti-AI Slop',
      designTag: 'CRAFT',
      badgeText: 'TACTILE',
      swatches: ['#FC4C02', '#2D2825', '#FAF7F2'],
      path: 'themes/hallmark/theme.css'
    },
    {
      id: 'claymorphism',
      name: 'Claymorphism',
      category: 'Claymorphism',
      designTag: 'PUFFY',
      badgeText: 'CLAY',
      swatches: ['#2F6FE4', '#B22A3D', '#EEF1F5'],
      path: 'themes/claymorphism/theme.css'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      category: 'Retro Sci-Fi',
      designTag: 'CYBER',
      badgeText: 'NEON',
      swatches: ['#00f3ff', '#ff007f', '#070614'],
      path: 'themes/cyberpunk/theme.css'
    },
    {
      id: 'dracula',
      name: 'Dracula Violet',
      category: 'Dark Mode',
      designTag: 'DRACULA',
      badgeText: 'POPULAR',
      swatches: ['#bd93f9', '#ff79c6', '#181825'],
      path: 'themes/dracula/theme.css'
    }
  ];

  class ThemeProvider {
    constructor() {
      this.registry = [...THEME_REGISTRY];
      this.currentThemeId = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID;
      this.currentMode = localStorage.getItem(MODE_STORAGE_KEY) || DEFAULT_MODE;
      this.isOpen = false;
    }

    getLinkElement() {
      let link = document.getElementById('theme-stylesheet');
      if (!link) {
        link = document.createElement('link');
        link.id = 'theme-stylesheet';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      return link;
    }

    init() {
      this.applyThemeStylesheet(this.currentThemeId);
      this.applyMode(this.currentMode);
      this.setupDropdownDOM();
      this.bindEvents();
    }

    registerTheme(themeObj) {
      if (!themeObj || !themeObj.id || !themeObj.path) return false;
      const idx = this.registry.findIndex(t => t.id === themeObj.id);
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
      return this.registry.find(t => t.id === this.currentThemeId) || this.registry[0];
    }

    getCurrentMode() {
      return this.currentMode;
    }

    applyThemeStylesheet(themeId) {
      const theme = this.registry.find(t => t.id === themeId) || this.registry[0];
      const link = this.getLinkElement();
      
      const newHref = theme.path;
      if (link.getAttribute('href') !== newHref) {
        link.setAttribute('href', newHref);
      }

      document.documentElement.setAttribute('data-theme', theme.id);
      this.currentThemeId = theme.id;
      localStorage.setItem(STORAGE_KEY, theme.id);
      this.updateHeaderButtonText();
      this.renderDropdownItems();
    }

    applyMode(mode) {
      const validMode = (mode === 'light' || mode === 'dark') ? mode : DEFAULT_MODE;
      document.documentElement.setAttribute('data-mode', validMode);
      this.currentMode = validMode;
      localStorage.setItem(MODE_STORAGE_KEY, validMode);

      // Update Quick Mode Toggle buttons across DOM
      document.querySelectorAll('.mode-toggle-btn, .mobile-mode-toggle').forEach(btn => {
        const iconEl = btn.querySelector('.mode-icon');
        const labelEl = btn.querySelector('.mode-label');
        if (validMode === 'light') {
          if (iconEl) iconEl.innerHTML = '<i data-lucide="sun"></i>';
          if (labelEl) labelEl.textContent = 'Light';
          btn.setAttribute('title', 'Switch to Dark Mode');
          btn.setAttribute('aria-label', 'Switch to Dark Mode');
        } else {
          if (iconEl) iconEl.innerHTML = '<i data-lucide="moon"></i>';
          if (labelEl) labelEl.textContent = 'Dark';
          btn.setAttribute('title', 'Switch to Light Mode');
          btn.setAttribute('aria-label', 'Switch to Light Mode');
        }
      });

      // Update segment control buttons inside theme dropdown menu
      document.querySelectorAll('.mode-seg-btn').forEach(btn => {
        const val = btn.getAttribute('data-mode-val');
        btn.classList.toggle('active', val === validMode);
      });

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    setMode(mode) {
      if (this.currentMode === mode) return;

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
      this.setMode(this.currentMode === 'dark' ? 'light' : 'dark');
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
      document.querySelectorAll('.theme-btn-name').forEach(el => {
        el.textContent = current.name;
      });
    }

    setupDropdownDOM() {
      let wrapper = document.querySelector('.theme-switcher-wrapper');
      if (!wrapper) {
        const btn = document.getElementById('themePickerBtn');
        if (btn) {
          wrapper = document.createElement('div');
          wrapper.className = 'theme-switcher-wrapper';
          btn.parentNode.insertBefore(wrapper, btn);
          wrapper.appendChild(btn);
        }
      }

      if (wrapper && !document.getElementById('themeDropdownMenu')) {
        const dropdownHtml = `
          <div id="themeDropdownMenu" class="theme-dropdown-menu hidden" role="menu" aria-orientation="vertical">
            <div class="theme-dropdown-header">
              <span>Theme System</span>
              <div class="theme-mode-segmented-control" role="radiogroup" aria-label="Appearance Mode">
                <button type="button" class="mode-seg-btn ${this.currentMode === 'light' ? 'active' : ''}" data-mode-val="light" title="Light Mode"><i data-lucide="sun"></i> Light</button>
                <button type="button" class="mode-seg-btn ${this.currentMode === 'dark' ? 'active' : ''}" data-mode-val="dark" title="Dark Mode"><i data-lucide="moon"></i> Dark</button>
              </div>
            </div>
            <div class="theme-dropdown-list" id="themeDropdownList">
              <!-- Dynamically populated -->
            </div>
          </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', dropdownHtml);
      }

      this.renderDropdownItems();
    }

    renderDropdownItems() {
      const list = document.getElementById('themeDropdownList');
      if (!list) return;

      list.innerHTML = this.registry.map(theme => {
        const isActive = theme.id === this.currentThemeId;
        const swatchesHtml = theme.swatches.map(c => `<span class="theme-drop-swatch" style="background:${c}"></span>`).join('');

        return `
          <button type="button" class="theme-dropdown-item ${isActive ? 'active' : ''}" data-theme-id="${theme.id}" role="menuitem">
            <div class="theme-item-left">
              <span class="theme-item-name">${theme.name}</span>
              <span class="theme-item-tag">${theme.designTag}</span>
            </div>
            <div class="theme-item-right">
              <div class="theme-drop-swatches">${swatchesHtml}</div>
              <span class="theme-item-check">${isActive ? '<i data-lucide="check"></i>' : ''}</span>
            </div>
          </button>
        `;
      }).join('');

      list.querySelectorAll('.theme-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = item.getAttribute('data-theme-id');
          this.setTheme(id);
        });
      });

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        // Mode toggle clicks
        const modeToggle = e.target.closest('#modeToggleBtn, .mode-toggle-btn, .mobile-mode-toggle');
        if (modeToggle) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMode();
          return;
        }

        const modeSeg = e.target.closest('.mode-seg-btn');
        if (modeSeg) {
          e.preventDefault();
          e.stopPropagation();
          const selectedMode = modeSeg.getAttribute('data-mode-val');
          if (selectedMode) this.setMode(selectedMode);
          return;
        }

        // Theme dropdown clicks
        const trigger = e.target.closest('#themePickerBtn, .theme-picker-trigger');
        if (trigger) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleDropdown();
          return;
        }

        const dropdown = document.getElementById('themeDropdownMenu');
        if (dropdown && !dropdown.contains(e.target) && this.isOpen) {
          this.closeDropdown();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
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
      const dropdown = document.getElementById('themeDropdownMenu');
      const btn = document.getElementById('themePickerBtn');
      if (dropdown) {
        dropdown.classList.remove('hidden');
        this.isOpen = true;
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
    }

    closeDropdown() {
      const dropdown = document.getElementById('themeDropdownMenu');
      const btn = document.getElementById('themePickerBtn');
      if (dropdown) {
        dropdown.classList.add('hidden');
        this.isOpen = false;
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  window.ThemeProvider = new ThemeProvider();
})();
