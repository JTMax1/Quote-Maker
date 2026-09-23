/**
 * QuoteForge Application Entry Point
 * Orchestrates navigation, views, profile settings, and reactive state.
 */

import './styles/base.css';
import './styles/layout.css';
import './styles/editor.css';
import './styles/onboarding.css';
import './styles/presets.css';
import './styles/history.css';
import './styles/community.css';
import './styles/template-studio.css';
import './styles/toast.css';

import { StorageService } from './services/storageService.js';
import { ProfileSettingsModal } from './components/profileSettingsModal.js';
import { Editor } from './components/editor.js';
import { PresetPicker } from './components/presetPicker.js';
import { HistoryView } from './components/historyView.js';
import { CommunityView } from './components/communityView.js';
import { TemplateStudio } from './components/templateStudio.js';
import { Toast } from './components/toast.js';
import { icon } from './utils/icons.js';
import { escapeHtml } from './utils/security.js';

class App {
  constructor() {
    this.currentTab = 'editor';
    this.components = {};
    this.init();
  }

  init() {
    this.renderAppShell();
    this.initComponents();
    this.bindGlobalEvents();
    this.initServiceWorker();
  }

  renderAppShell() {
    const appEl = document.getElementById('app');
    const profile = StorageService.getProfile();
    const safeName = profile.name || 'C';
    const initial = escapeHtml(safeName[0].toUpperCase());

    appEl.innerHTML = `
      <!-- Header -->
      <header class="app-header" role="banner">
        <div class="header-container">
          <div class="brand">
            <div class="brand-icon" aria-label="QuoteForge Logo">
              <img src="/icons/icon-192.png" alt="QuoteForge Logo" class="brand-logo-img" />
            </div>
            <span class="brand-text">QuoteForge</span>
            <span class="brand-badge">Studio</span>
          </div>

          <!-- Navigation Tabs -->
          <nav class="nav-tabs" id="appNavTabs" aria-label="Main Navigation">
            <button class="tab-btn active" data-tab="editor" aria-label="Create Quote Editor">
              <span aria-hidden="true">${icon('penTool', { size: 15 })}</span>
              <span>Create Quote</span>
            </button>
            <button class="tab-btn" data-tab="presets" aria-label="Browse Presets Catalog">
              <span aria-hidden="true">${icon('palette', { size: 15 })}</span>
              <span>Presets</span>
            </button>
            <button class="tab-btn" data-tab="history" aria-label="View Saved History">
              <span aria-hidden="true">${icon('clock', { size: 15 })}</span>
              <span>History</span>
            </button>
            <button class="tab-btn" data-tab="community" aria-label="Community Showcase Feed">
              <span aria-hidden="true">${icon('globe', { size: 15 })}</span>
              <span>Community</span>
            </button>
            <button class="tab-btn" data-tab="studio" aria-label="Template Studio Creator">
              <span aria-hidden="true">${icon('sliders', { size: 15 })}</span>
              <span>Template Studio</span>
            </button>
          </nav>

          <!-- Header Actions -->
          <div class="header-actions">
            <div class="desktop-actions">
              <button class="btn-glass btn-header-action" id="btnExportBackup" title="Export Quotes & Themes Backup (JSON)" aria-label="Export backup">
                <span aria-hidden="true">${icon('download', { size: 14 })}</span>
                <span>Backup</span>
              </button>
              <button class="btn-glass btn-header-action" id="btnImportBackup" title="Restore Quotes & Themes Backup (JSON)" aria-label="Restore backup">
                <span aria-hidden="true">${icon('upload', { size: 14 })}</span>
                <span>Restore</span>
              </button>
            </div>

            <button class="profile-chip" id="btnProfilePreset" title="Edit Signature Profile & Defaults" aria-label="Edit signature profile preset and defaults">
              <div class="avatar-initial" id="headerAvatar" aria-hidden="true">${initial}</div>
              <span class="profile-chip-name" id="headerProfileName">${escapeHtml(profile.name || 'My Preset')}</span>
              <span class="profile-gear-icon" aria-hidden="true">${icon('settings', { size: 13 })}</span>
            </button>

            <!-- Mobile Overflow Menu -->
            <div class="mobile-more-wrapper mobile-only">
              <button class="btn-glass btn-icon-only" id="btnMobileOverflow" aria-label="Open more options" aria-expanded="false" aria-haspopup="true">
                <span aria-hidden="true">${icon('moreVertical', { size: 18 })}</span>
              </button>
              <div class="mobile-overflow-dropdown" id="mobileOverflowMenu" role="menu" hidden>
                <button class="overflow-menu-item" id="btnMobileOpenProfile" role="menuitem">
                  <span aria-hidden="true">${icon('settings', { size: 15 })}</span>
                  <span>Signature & Settings</span>
                </button>
                <button class="overflow-menu-item" id="btnMobileExportBackup" role="menuitem">
                  <span aria-hidden="true">${icon('download', { size: 15 })}</span>
                  <span>Export Backup (JSON)</span>
                </button>
                <button class="overflow-menu-item" id="btnMobileImportBackup" role="menuitem">
                  <span aria-hidden="true">${icon('upload', { size: 15 })}</span>
                  <span>Restore Backup (JSON)</span>
                </button>
              </div>
            </div>

            <input type="file" id="inputRestoreJson" accept=".json,application/json" style="display: none;" aria-label="Upload backup JSON file" />
          </div>
        </div>
      </header>

      <!-- Main Content Views -->
      <main class="main-content">
        <!-- Editor View -->
        <section class="view-panel active" id="view-editor"></section>

        <!-- Presets View -->
        <section class="view-panel" id="view-presets"></section>

        <!-- History View -->
        <section class="view-panel" id="view-history"></section>

        <!-- Community View -->
        <section class="view-panel" id="view-community"></section>

        <!-- Template Studio View -->
        <section class="view-panel" id="view-studio"></section>
      </main>

      <!-- Footer / Status Toast Container -->
      <div id="toastContainer" class="toast-container" role="region" aria-label="Notifications"></div>
    `;
  }

  initComponents() {
    // 1. Editor (Core Canvas & Controls)
    const editorContainer = document.getElementById('view-editor');
    this.components.editor = new Editor(editorContainer, {
      onSaveHistory: (item) => {
        if (this.components.history) this.components.history.refreshHistory();
      },
      onShareCommunity: (item) => {
        if (this.components.community) this.components.community.refreshQuotes();
        this.switchTab('community');
      },
      onOpenPresetPicker: () => {
        this.switchTab('presets');
      },
      onOpenStudio: () => {
        this.switchTab('studio');
      }
    });

    // 2. Preset Library View
    const presetsContainer = document.getElementById('view-presets');
    this.components.presets = new PresetPicker(presetsContainer, (selectedPreset) => {
      this.components.editor.applyPreset(selectedPreset, false);
      this.switchTab('editor');
    });

    // 3. History View
    const historyContainer = document.getElementById('view-history');
    this.components.history = new HistoryView(
      historyContainer,
      // onLoadHistoryItem
      (historyItem) => {
        this.components.editor.loadState(historyItem.canvasState);
        this.switchTab('editor');
      },
      // onShareCommunity
      (historyItem) => {
        if (this.components.community) this.components.community.refreshQuotes();
        this.switchTab('community');
      }
    );

    // 4. Community Feed View
    const communityContainer = document.getElementById('view-community');
    this.components.community = new CommunityView(communityContainer, (quoteItem) => {
      this.components.editor.loadState(quoteItem.canvasState);
      this.switchTab('editor');
    });

    // 5. Custom Template Studio View
    const studioContainer = document.getElementById('view-studio');
    this.components.studio = new TemplateStudio(
      studioContainer,
      // onTemplatePublished
      (savedTemplate) => {
        if (this.components.presets) this.components.presets.renderCards();
        this.components.editor.applyPreset(savedTemplate);
        this.switchTab('editor');
      }
    );

    // 6. Profile Settings Modal (Direct profile and default template editing)
    this.components.profileSettings = new ProfileSettingsModal((updatedProfile) => {
      this.components.editor.updateProfile(updatedProfile);
      this.updateHeaderProfile(updatedProfile);
    });
  }

  bindGlobalEvents() {
    // Navigation Tabs
    const navTabs = document.getElementById('appNavTabs');
    navTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      const tabName = btn.dataset.tab;
      this.switchTab(tabName);
    });

    // Profile & Preset Button -> Opens dedicated ProfileSettingsModal
    const btnProfile = document.getElementById('btnProfilePreset');
    if (btnProfile) {
      btnProfile.addEventListener('click', () => {
        this.components.profileSettings.open();
      });
    }

    // Mobile Overflow Menu toggle
    const btnMobileOverflow = document.getElementById('btnMobileOverflow');
    const mobileOverflowMenu = document.getElementById('mobileOverflowMenu');
    if (btnMobileOverflow && mobileOverflowMenu) {
      const toggleMenu = (show) => {
        const isCurrentlyOpen = !mobileOverflowMenu.hidden;
        const willOpen = typeof show === 'boolean' ? show : !isCurrentlyOpen;
        mobileOverflowMenu.hidden = !willOpen;
        btnMobileOverflow.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      };

      btnMobileOverflow.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      document.addEventListener('click', (e) => {
        if (!mobileOverflowMenu.hidden && !mobileOverflowMenu.contains(e.target) && e.target !== btnMobileOverflow) {
          toggleMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileOverflowMenu.hidden) {
          toggleMenu(false);
          btnMobileOverflow.focus();
        }
      });
    }

    // Mobile Profile Settings button
    const btnMobileProfile = document.getElementById('btnMobileOpenProfile');
    if (btnMobileProfile) {
      btnMobileProfile.addEventListener('click', () => {
        if (mobileOverflowMenu) mobileOverflowMenu.hidden = true;
        this.components.profileSettings.open();
      });
    }

    // Export Backup JSON Helper
    const handleExportBackup = () => {
      if (mobileOverflowMenu) mobileOverflowMenu.hidden = true;
      const jsonStr = StorageService.exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `QuoteForge-Backup-${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
      Toast.show('Backup JSON exported successfully!', 'success');
    };

    const btnExport = document.getElementById('btnExportBackup');
    if (btnExport) btnExport.addEventListener('click', handleExportBackup);

    const btnMobileExport = document.getElementById('btnMobileExportBackup');
    if (btnMobileExport) btnMobileExport.addEventListener('click', handleExportBackup);

    // Import Backup JSON Helper
    const inputRestore = document.getElementById('inputRestoreJson');
    const triggerImport = () => {
      if (mobileOverflowMenu) mobileOverflowMenu.hidden = true;
      if (inputRestore) inputRestore.click();
    };

    const btnImport = document.getElementById('btnImportBackup');
    if (btnImport) btnImport.addEventListener('click', triggerImport);

    const btnMobileImport = document.getElementById('btnMobileImportBackup');
    if (btnMobileImport) btnMobileImport.addEventListener('click', triggerImport);

    if (inputRestore) {
      inputRestore.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            const success = StorageService.importBackupJSON(parsed);
            if (success) {
              Toast.show('Backup data restored successfully! Reloading...', 'success');
              setTimeout(() => window.location.reload(), 1200);
            } else {
              Toast.show('Invalid backup file format.', 'error');
            }
          } catch (err) {
            console.error('Import parse error:', err);
            Toast.show('Failed to parse JSON file.', 'error');
          }
        };
        reader.readAsText(file);
        // Reset file input so user can import the same file again if desired
        inputRestore.value = '';
      });
    }

    // Hash navigation (deep linking)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['editor', 'presets', 'history', 'community', 'studio'].includes(hash)) {
        this.switchTab(hash);
      }
    });

    // Handle initial hash if any
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['editor', 'presets', 'history', 'community', 'studio'].includes(initialHash)) {
      this.switchTab(initialHash);
    }
  }

  switchTab(tabName) {
    if (this.currentTab === tabName) return;
    this.currentTab = tabName;

    // Update nav tab buttons
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
      const isMatch = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // Update view panels
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${tabName}`);
    });

    // Trigger tab-specific refresh if needed
    if (tabName === 'history' && this.components.history) {
      this.components.history.refreshHistory();
    } else if (tabName === 'community' && this.components.community) {
      this.components.community.refreshQuotes();
    } else if (tabName === 'editor' && this.components.editor) {
      this.components.editor.scheduleRender();
    }

    // Scroll back to top on tab switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = tabName;
  }

  updateHeaderProfile(profile) {
    const initial = (profile.name || 'C')[0].toUpperCase();
    const avatarEl = document.getElementById('headerAvatar');
    const nameEl = document.getElementById('headerProfileName');
    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = profile.name || 'My Preset';
  }

  initServiceWorker() {
    // Optional PWA Service Worker registration placeholder
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
