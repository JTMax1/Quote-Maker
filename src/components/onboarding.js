/**
 * Onboarding Modal & Setup Wizard
 * Guides user to pick canvas ratio, author details, toggles, and default signature preset.
 */

import { CANVAS_FORMATS, DEFAULT_PRESETS } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';

export class OnboardingModal {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.totalSteps = 3;
    this.profile = StorageService.getProfile();
    this.selectedRatio = this.profile.defaultRatio || '1:1';
    this.selectedPresetId = this.profile.activePresetId || 'editorial-vogue';
    this.tempAuthor = this.profile.name || '';
    this.tempHandle = this.profile.handle || '';
    this.tempShowDate = this.profile.showDate ?? true;
    this.tempShowAuthor = this.profile.showAuthor ?? true;
    this.tempShowCategory = this.profile.showCategory ?? true;
    this.tempShowWatermark = this.profile.showWatermark ?? true;

    this.modalEl = null;
    this.render();
  }

  render() {
    // Remove existing if any
    const existing = document.getElementById('onboardingModal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'onboardingModal';
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-label', 'QuoteForge Setup Wizard');

    this.modalEl.innerHTML = `
      <div class="onboarding-card">
        <!-- Stepper Header -->
        <div class="stepper-header">
          <div class="step-indicators">
            <div class="step-item ${this.currentStep === 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}" id="stepInd1">
              <span class="step-num">1</span>
              <span>Canvas Format</span>
            </div>
            <div class="step-item ${this.currentStep === 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}" id="stepInd2">
              <span class="step-num">2</span>
              <span>Elements & Metadata</span>
            </div>
            <div class="step-item ${this.currentStep === 3 ? 'active' : ''}" id="stepInd3">
              <span class="step-num">3</span>
              <span>Signature Style</span>
            </div>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="stepProgressFill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
          </div>
        </div>

        <!-- Step Body Container -->
        <div class="step-body" id="onboardingStepContent">
          <!-- Dynamically populated -->
        </div>

        <!-- Stepper Footer -->
        <div class="stepper-footer">
          <button class="btn-glass" id="onboardingBackBtn" ${this.currentStep === 1 ? 'style="visibility: hidden;"' : ''}>
            ← Back
          </button>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-glass" id="onboardingSkipBtn">
              Skip for now
            </button>
            <button class="btn-primary" id="onboardingNextBtn">
              ${this.currentStep === this.totalSteps ? 'Save Signature Preset 🚀' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.renderStepContent();
  }

  bindEvents() {
    const backBtn = this.modalEl.querySelector('#onboardingBackBtn');
    const nextBtn = this.modalEl.querySelector('#onboardingNextBtn');
    const skipBtn = this.modalEl.querySelector('#onboardingSkipBtn');

    // Backdrop click dismiss
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Escape key dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        this.close();
      }
    });

    backBtn.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.saveCurrentStepData();
        this.currentStep--;
        this.updateStepView();
      }
    });

    nextBtn.addEventListener('click', () => {
      this.saveCurrentStepData();
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepView();
      } else {
        this.finishOnboarding();
      }
    });

    skipBtn.addEventListener('click', () => {
      this.close();
    });
  }

  renderStepContent() {
    const container = this.modalEl.querySelector('#onboardingStepContent');

    if (this.currentStep === 1) {
      container.innerHTML = `
        <div class="step-heading">
          <h2>Select Your Default Canvas</h2>
          <p>Choose the primary aspect ratio you intend to craft quotes for. You can switch anytime.</p>
        </div>
        <div class="format-grid" role="radiogroup" aria-label="Default Canvas Format">
          ${CANVAS_FORMATS.map(f => `
            <div class="format-card ${this.selectedRatio === f.id ? 'selected' : ''}" data-ratio="${f.id}" role="radio" aria-checked="${this.selectedRatio === f.id}" tabindex="0" aria-label="${f.label} (${f.id})">
              <div class="format-icon-shape" aria-hidden="true">${f.id}</div>
              <div class="format-title">${f.label}</div>
              <div class="format-sub">${f.sublabel}</div>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.format-card').forEach(card => {
        const selectCard = () => {
          container.querySelectorAll('.format-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('selected');
          card.setAttribute('aria-checked', 'true');
          this.selectedRatio = card.dataset.ratio;
        };

        card.addEventListener('click', selectCard);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectCard();
          }
        });
      });

    } else if (this.currentStep === 2) {
      container.innerHTML = `
        <div class="step-heading">
          <h2>Configure Canvas Elements</h2>
          <p>Set whether quotes should display dates, author names, category tags, or watermarks.</p>
        </div>
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="obAuthorInput">Author Name</label>
            <input type="text" class="form-input" id="obAuthorInput" value="${this.tempAuthor}" placeholder="e.g. Marcus Aurelius" aria-label="Author Name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="obHandleInput">Handle / Subtitle</label>
            <input type="text" class="form-input" id="obHandleInput" value="${this.tempHandle}" placeholder="e.g. @stoic_quotes" aria-label="Handle or Subtitle" />
          </div>
        </div>

        <div class="toggles-list">
          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Show Author & Handle</span>
              <span class="toggle-desc">Display creator name and handle below the quote</span>
            </div>
            <label class="switch" for="obToggleAuthor">
              <input type="checkbox" id="obToggleAuthor" aria-label="Toggle author and handle display" ${this.tempShowAuthor ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Show Date Stamp</span>
              <span class="toggle-desc">Render timestamp (e.g. Sep 2026) in upper header</span>
            </div>
            <label class="switch" for="obToggleDate">
              <input type="checkbox" id="obToggleDate" aria-label="Toggle date stamp display" ${this.tempShowDate ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Show Category / Topic Badge</span>
              <span class="toggle-desc">Display topic tag like #Wisdom, Philosophy, or Tech</span>
            </div>
            <label class="switch" for="obToggleCategory">
              <input type="checkbox" id="obToggleCategory" aria-label="Toggle category badge display" ${this.tempShowCategory ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Watermark / Brand Stamp</span>
              <span class="toggle-desc">Subtle copyright stamp in bottom corner</span>
            </div>
            <label class="switch" for="obToggleWatermark">
              <input type="checkbox" id="obToggleWatermark" aria-label="Toggle watermark stamp display" ${this.tempShowWatermark ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
    } else if (this.currentStep === 3) {
      container.innerHTML = `
        <div class="step-heading">
          <h2>Pick Your Signature Aesthetic</h2>
          <p>Select your favorite preset theme. Whenever you type a quote, it will automatically render in this style.</p>
        </div>
        <div class="onboarding-presets-grid" role="radiogroup" aria-label="Preset Themes">
          ${DEFAULT_PRESETS.slice(0, 9).map(p => `
            <div class="preset-mini-card ${this.selectedPresetId === p.id ? 'selected' : ''}" 
                 data-preset-id="${p.id}" 
                 role="radio"
                 tabindex="0"
                 aria-checked="${this.selectedPresetId === p.id}"
                 aria-label="${p.name} theme"
                 style="background: ${p.gradient || p.background}; color: ${p.textColor};">
              <span class="preset-mini-name">${p.name}</span>
              <span class="preset-mini-font">${p.fontFamily}</span>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.preset-mini-card').forEach(card => {
        const selectPreset = () => {
          container.querySelectorAll('.preset-mini-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('selected');
          card.setAttribute('aria-checked', 'true');
          this.selectedPresetId = card.dataset.presetId;
        };

        card.addEventListener('click', selectPreset);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectPreset();
          }
        });
      });
    }
  }

  saveCurrentStepData() {
    if (this.currentStep === 2) {
      const authorEl = this.modalEl.querySelector('#obAuthorInput');
      const handleEl = this.modalEl.querySelector('#obHandleInput');
      const dateEl = this.modalEl.querySelector('#obToggleDate');
      const authorToggleEl = this.modalEl.querySelector('#obToggleAuthor');
      const catEl = this.modalEl.querySelector('#obToggleCategory');
      const watermarkEl = this.modalEl.querySelector('#obToggleWatermark');

      if (authorEl) this.tempAuthor = authorEl.value.trim();
      if (handleEl) this.tempHandle = handleEl.value.trim();
      if (dateEl) this.tempShowDate = dateEl.checked;
      if (authorToggleEl) this.tempShowAuthor = authorToggleEl.checked;
      if (catEl) this.tempShowCategory = catEl.checked;
      if (watermarkEl) this.tempShowWatermark = watermarkEl.checked;
    }
  }

  updateStepView() {
    // Update progress indicators
    for (let i = 1; i <= this.totalSteps; i++) {
      const el = this.modalEl.querySelector(`#stepInd${i}`);
      if (el) {
        el.className = `step-item ${this.currentStep === i ? 'active' : ''} ${this.currentStep > i ? 'completed' : ''}`;
      }
    }

    const fill = this.modalEl.querySelector('#stepProgressFill');
    if (fill) {
      fill.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
    }

    const backBtn = this.modalEl.querySelector('#onboardingBackBtn');
    if (backBtn) {
      backBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    const nextBtn = this.modalEl.querySelector('#onboardingNextBtn');
    if (nextBtn) {
      nextBtn.innerHTML = this.currentStep === this.totalSteps ? 'Save Signature Preset 🚀' : 'Continue →';
    }

    this.renderStepContent();
  }

  finishOnboarding() {
    const updatedProfile = {
      ...this.profile,
      name: this.tempAuthor || this.profile.name || 'Anonymous Creator',
      handle: this.tempHandle || this.profile.handle || '',
      defaultRatio: this.selectedRatio,
      showDate: this.tempShowDate,
      showAuthor: this.tempShowAuthor,
      showCategory: this.tempShowCategory,
      showWatermark: this.tempShowWatermark,
      activePresetId: this.selectedPresetId,
      onboarded: true
    };

    StorageService.saveProfile(updatedProfile);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    Toast.show('Signature Preset Saved! Ready to forge quotes.', 'success');
    this.close();

    if (this.onComplete) {
      this.onComplete(updatedProfile);
    }
  }

  open() {
    this.currentStep = 1;
    this.profile = StorageService.getProfile();
    this.selectedRatio = this.profile.defaultRatio || '1:1';
    this.selectedPresetId = this.profile.activePresetId || 'editorial-vogue';
    this.tempAuthor = this.profile.name || '';
    this.tempHandle = this.profile.handle || '';
    this.tempShowDate = this.profile.showDate ?? true;
    this.tempShowAuthor = this.profile.showAuthor ?? true;
    this.tempShowCategory = this.profile.showCategory ?? true;
    this.tempShowWatermark = this.profile.showWatermark ?? true;

    this.updateStepView();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
