/* ============================================================
   BIS Club — Dynamic Theme Provider & Dropdown Engine
   Supports isolated folder-based theme stylesheets (themes/*)
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'bis_theme_id';
  const DEFAULT_THEME_ID = 'glassmorphism';

  // Built-in Theme Folder Registry
  const THEME_REGISTRY = [
    {
      id: 'glassmorphism',
      name: 'BIS Official (Glass)',
      category: 'Glassmorphism',
      designTag: 'GLASS',
      badgeText: 'DEFAULT',
      swatches: ['#003478', '#C8102E', '#F4A900'],
      path: 'themes/glassmorphism/theme.css'
    },
    {
      id: 'neobrutalism',
      name: 'Neobrutalism',
      category: 'Neobrutalism',
      designTag: 'BRUTAL',
      badgeText: 'FEATURED ⚡',
      swatches: ['#FDC800', '#432DD7', '#1C293C'],
      path: 'themes/neobrutalism/theme.css'
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
      id: 'nordic-light',
      name: 'Nordic Clean (Light)',
      category: 'Light Mode',
      designTag: 'LIGHT',
      badgeText: 'LIGHT ☀️',
      swatches: ['#0284c7', '#e11d48', '#f8fafc'],
      path: 'themes/nordic-light/theme.css'
    },
    {
      id: 'emerald-aurora',
      name: 'Emerald Aurora',
      category: 'Nature Dark',
      designTag: 'AURORA',
      badgeText: 'DARK 🌲',
      swatches: ['#059669', '#10b981', '#03140e'],
      path: 'themes/emerald-aurora/theme.css'
    },
    {
      id: 'sunset-synth',
      name: 'Sunset Synthwave',
      category: 'Synthwave',
      designTag: 'SYNTH',
      badgeText: 'WARM 🌅',
      swatches: ['#ff455b', '#f97316', '#0f0a1c'],
      path: 'themes/sunset-synth/theme.css'
    },
    {
      id: 'royal-gold',
      name: 'Royal Gold & Onyx',
      category: 'Luxury',
      designTag: 'LUXURY',
      badgeText: 'GOLD 👑',
      swatches: ['#eab308', '#fef08a', '#0c0a09'],
      path: 'themes/royal-gold/theme.css'
    },
    {
      id: 'dracula',
      name: 'Dracula Violet',
      category: 'Dark Mode',
      designTag: 'DRACULA',
      badgeText: 'POPULAR 🧛',
      swatches: ['#bd93f9', '#ff79c6', '#181825'],
      path: 'themes/dracula/theme.css'
    },
    {
      id: 'tokyo-night',
      name: 'Tokyo Night',
      category: 'Dark Mode',
      designTag: 'TOKYO',
      badgeText: 'SLEEK 🌙',
      swatches: ['#7aa2f7', '#bb9af7', '#16161e'],
      path: 'themes/tokyo-night/theme.css'
    }
  ];

  class ThemeProvider {
    constructor() {
      this.registry = [...THEME_REGISTRY];
      this.currentThemeId = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID;
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
              <span>Select Theme System</span>
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
              <span class="theme-item-check">${isActive ? '✓' : ''}</span>
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
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
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
