/**
 * QuoteForge Application Entry Point
 * Orchestrates navigation, views, onboarding, and reactive state.
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
import { OnboardingModal } from './components/onboarding.js';
import { Editor } from './components/editor.js';
import { PresetPicker } from './components/presetPicker.js';
import { HistoryView } from './components/historyView.js';
import { CommunityView } from './components/communityView.js';
import { TemplateStudio } from './components/templateStudio.js';
import { Toast } from './components/toast.js';

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
    this.checkOnboarding();
    this.initServiceWorker();
  }

  renderAppShell() {
    const appEl = document.getElementById('app');
    const profile = StorageService.getProfile();
    const safeName = profile.name || 'C';
    const initial = escapeHtml(safeName[0].toUpperCase());

    appEl.innerHTML = `
      <!-- Header -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand">
            <div class="brand-icon" aria-hidden="true">❝</div>
            <span class="brand-text">QuoteForge</span>
            <span class="brand-badge">Studio</span>
          </div>

          <!-- Navigation Tabs -->
          <nav class="nav-tabs" id="appNavTabs" aria-label="Main Navigation">
            <button class="tab-btn active" data-tab="editor" aria-label="Create Quote Editor">
              <span>✍️</span>
              <span>Create Quote</span>
            </button>
            <button class="tab-btn" data-tab="presets" aria-label="Browse Presets Catalog">
              <span>🎨</span>
              <span>Presets</span>
            </button>
            <button class="tab-btn" data-tab="history" aria-label="View Saved History">
              <span>🕰</span>
              <span>History</span>
            </button>
            <button class="tab-btn" data-tab="community" aria-label="Community Showcase Feed">
              <span>🌐</span>
              <span>Community</span>
            </button>
            <button class="tab-btn" data-tab="studio" aria-label="Template Studio Creator">
              <span>📐</span>
              <span>Template Studio</span>
            </button>
          </nav>

          <!-- Header Actions -->
          <div class="header-actions">
            <button class="btn-glass" id="btnExportBackup" title="Export Quotes & Themes Backup (JSON)" aria-label="Export backup" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; border-radius: var(--radius-full);">
              <span>💾</span>
              <span class="desktop-only" style="margin-left: 0.25rem;">Backup</span>
            </button>
            <button class="btn-glass" id="btnImportBackup" title="Restore Quotes & Themes Backup (JSON)" aria-label="Restore backup" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; border-radius: var(--radius-full);">
              <span>📂</span>
              <span class="desktop-only" style="margin-left: 0.25rem;">Restore</span>
            </button>
            <input type="file" id="inputRestoreJson" accept=".json,application/json" style="display: none;" aria-label="Upload backup JSON file" />

            <button class="profile-chip" id="btnProfilePreset" title="Edit Signature Preset" aria-label="Edit signature profile preset">
              <div class="avatar-initial" id="headerAvatar">${initial}</div>
              <span style="font-weight: 600;" id="headerProfileName">${escapeHtml(profile.name || 'My Preset')}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);" aria-hidden="true">⚙️</span>
            </button>
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
    `;
  }

  initComponents() {
    const editorContainer = document.getElementById('view-editor');
    const presetsContainer = document.getElementById('view-presets');
    const historyContainer = document.getElementById('view-history');
    const communityContainer = document.getElementById('view-community');
    const studioContainer = document.getElementById('view-studio');

    // 1. Live Editor Component
    this.components.editor = new Editor(
      editorContainer,
      // onOpenPresets
      () => this.switchTab('presets'),
      // onOpenStudio
      () => this.switchTab('studio'),
      // onQuotePublished
      () => {
        if (this.components.community) this.components.community.refresh();
      }
    );

    // 2. Preset Picker Component
    this.components.presets = new PresetPicker(
      presetsContainer,
      // onSelectPreset
      (preset) => {
        this.components.editor.applyPreset(preset);
        this.switchTab('editor');
      }
    );

    // 3. History Gallery Component
    this.components.history = new HistoryView(
      historyContainer,
      // onRemixQuote
      (quoteItem) => {
        this.components.editor.state.quote = quoteItem.quote;
        this.components.editor.state.author = quoteItem.author;
        this.components.editor.state.category = quoteItem.category || this.components.editor.state.category;
        this.components.editor.state.handle = quoteItem.handle || this.components.editor.state.handle;
        this.components.editor.state.ratio = quoteItem.ratio || '1:1';
        if (quoteItem.styles) {
          this.components.editor.state.styles = { ...quoteItem.styles };
        }
        this.components.editor.syncFormValues();
        this.components.editor.scheduleRender();
        this.switchTab('editor');
      },
      // onGoToEditor
      () => this.switchTab('editor')
    );

    // 4. Community Showcase Component
    this.components.community = new CommunityView(
      communityContainer,
      // onRemixStyle
      (communityItem) => {
        this.components.editor.state.quote = communityItem.quote;
        this.components.editor.state.author = communityItem.author;
        this.components.editor.state.category = communityItem.category;
        this.components.editor.state.handle = communityItem.handle;
        this.components.editor.state.ratio = communityItem.ratio || '1:1';
        if (communityItem.customStyles) {
          this.components.editor.state.styles = { ...communityItem.customStyles };
        }
        this.components.editor.syncFormValues();
        this.components.editor.scheduleRender();
        this.switchTab('editor');
      }
    );

    // 5. Template Studio Component
    this.components.studio = new TemplateStudio(
      studioContainer,
      // onTemplatePublished
      (savedTemplate) => {
        if (this.components.presets) this.components.presets.renderCards();
        this.components.editor.applyPreset(savedTemplate);
        this.switchTab('editor');
      }
    );

    // 6. Onboarding Modal
    this.components.onboarding = new OnboardingModal((updatedProfile) => {
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

    // Profile & Preset Button
    const btnProfile = document.getElementById('btnProfilePreset');
    if (btnProfile) {
      btnProfile.addEventListener('click', () => {
        this.components.onboarding.open();
      });
    }

    // Export Backup JSON
    const btnExport = document.getElementById('btnExportBackup');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const jsonStr = StorageService.exportBackupJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quoteforge-backup-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Toast.show('Exported QuoteForge backup JSON!', 'success');
      });
    }

    // Import / Restore Backup JSON
    const btnImport = document.getElementById('btnImportBackup');
    const inputRestore = document.getElementById('inputRestoreJson');
    if (btnImport && inputRestore) {
      btnImport.addEventListener('click', () => {
        inputRestore.click();
      });

      inputRestore.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const result = StorageService.importBackupJSON(text);
          if (result.success) {
            Toast.show(`Restored backup with ${result.count} quotes!`, 'success');
            // Refresh views with restored data
            const updatedProfile = StorageService.getProfile();
            this.updateHeaderProfile(updatedProfile);
            if (this.components.editor) this.components.editor.updateProfile(updatedProfile);
            if (this.components.history) this.components.history.refresh();
            if (this.components.presets) this.components.presets.renderCards();
          } else {
            Toast.show(result.error || 'Failed to parse backup JSON', 'error');
          }
        } catch (err) {
          Toast.show('Error reading backup file', 'error');
        }
        inputRestore.value = '';
      });
    }
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
      });
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update active tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update active view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${tabName}`);
    });

    // Specific refresh hooks
    if (tabName === 'history' && this.components.history) {
      this.components.history.refresh();
    } else if (tabName === 'community' && this.components.community) {
      this.components.community.refresh();
    } else if (tabName === 'editor' && this.components.editor) {
      this.components.editor.scheduleRender();
    }
  }

  updateHeaderProfile(profile) {
    const initial = (profile.name || 'C')[0].toUpperCase();
    const avatarEl = document.getElementById('headerAvatar');
    const nameEl = document.getElementById('headerProfileName');
    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = profile.name || 'My Preset';
  }

  checkOnboarding() {
    const profile = StorageService.getProfile();
    if (!profile.onboarded) {
      // Auto open onboarding modal for new users!
      setTimeout(() => {
        this.components.onboarding.open();
      }, 350);
    }
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
