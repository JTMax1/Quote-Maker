/**
 * Enhanced Toast Notification System with WCAG a11y live announcements,
 * action buttons (e.g., Undo), and manual dismissal.
 */

import { icon } from '../utils/icons.js';

export class Toast {
  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.getElementById('toastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(this.container);
      }
    }
  }

  static show(message, type = 'info', options = {}) {
    this.init();

    // Support legacy signature: show(msg, type, durationNumber)
    let duration = 3000;
    let actionText = null;
    let onAction = null;
    let dismissible = true;

    if (typeof options === 'number') {
      duration = options;
    } else if (typeof options === 'object') {
      if (options.duration) duration = options.duration;
      if (options.actionText) {
        actionText = options.actionText;
        onAction = options.onAction;
        duration = options.duration || 6000; // longer for actions
      }
      if (options.dismissible !== undefined) dismissible = options.dismissible;
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'status');

    const iconNames = {
      success: 'checkCircle',
      error: 'xCircle',
      info: 'info',
      warning: 'alert'
    };

    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.innerHTML = icon(iconNames[type] || 'info', { size: 16 });

    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);

    // Optional interactive action button (e.g., Undo)
    let timer = null;
    const dismiss = () => {
      if (timer) clearTimeout(timer);
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    };

    if (actionText && typeof onAction === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = actionText;
      actionBtn.setAttribute('aria-label', `${actionText}: ${message}`);
      actionBtn.addEventListener('click', () => {
        onAction();
        dismiss();
      });
      toast.appendChild(actionBtn);
    }

    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close-btn';
      closeBtn.innerHTML = icon('x', { size: 13 });
      closeBtn.setAttribute('aria-label', 'Dismiss notification');
      closeBtn.addEventListener('click', dismiss);
      toast.appendChild(closeBtn);
    }

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    timer = setTimeout(dismiss, duration);

    return { dismiss };
  }
}

