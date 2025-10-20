/**
 * UI Components for enhanced user interactions
 * Handles toasts, tooltips, modals, and other UI enhancements
 */

class UIComponents {
    constructor(app) {
        this.app = app;
        this.toastContainer = null;
        this.setupToastContainer();
        this.setupTooltips();
        this.setupModals();
    }

    setupToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.toastContainer);
    }

    // Replace the current showToast implementation with this:
showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    // Remove 'animate-slide-in' to avoid transform conflicts
    toast.className = `toast ${type}`;

    const icon = this.getToastIcon(type);
    const colorClass = this.getToastColorClass(type);

    toast.innerHTML = `
        <div class="flex items-center gap-3 p-4 rounded-lg shadow-lg ${colorClass} text-white">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="flex-shrink-0 ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    this.toastContainer.appendChild(toast);

    // Let layout apply, then slide in by adding 'show'
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove after duration: slide out, then remove
    setTimeout(() => {
        if (!toast.parentNode) return;
        toast.classList.remove('show');
        // Wait for the CSS transition to finish before removing
        const removeAfter = () => {
            if (toast.parentNode) toast.remove();
        };
        toast.addEventListener('transitionend', removeAfter, { once: true });
        // Fallback in case transitionend doesn't fire
        setTimeout(removeAfter, 400);
    }, duration);
}

    getToastIcon(type) {
        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>`
        };
        return icons[type] || icons.info;
    }

    getToastColorClass(type) {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        return colors[type] || colors.info;
    }

    setupTooltips() {
        // Add tooltip functionality to elements with data-tooltip attribute
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element && !element.querySelector('.tooltip-text')) {
                this.createTooltip(element);
            }
        });
    }

    createTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = tooltipText;
        
        element.classList.add('tooltip');
        element.appendChild(tooltip);
    }

    setupModals() {
        // Setup modal functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-target]')) {
                const modalId = e.target.getAttribute('data-modal-target');
                this.showModal(modalId);
            }
            
            if (e.target.matches('[data-modal-close]') || e.target.matches('.modal-backdrop')) {
                this.hideModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
        
        // Focus first input in modal
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    hideModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
        document.body.classList.remove('overflow-hidden');
    }

    // Copy to clipboard functionality
    async copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(successMessage, 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast(successMessage, 'success');
        }
    }

    // Show loading overlay
    showLoadingOverlay(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center gap-3 shadow-xl">
                <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span class="text-gray-700 loading-text-shimmer">${message}</span>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Show confirmation dialog
    showConfirmationDialog(message, onConfirm, onCancel = null) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex-shrink-0">
                        <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">Confirm Action</h3>
                </div>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex gap-3 justify-end">
                    <button class="btn btn-secondary" data-cancel>Cancel</button>
                    <button class="btn btn-danger" data-confirm>Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('[data-confirm]').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (onConfirm) onConfirm();
        });

        dialog.querySelector('[data-cancel]').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (onCancel) onCancel();
        });

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                if (onCancel) onCancel();
            }
        });
    }

    // Show help tooltip
    showHelpTooltip(element, content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg';
        tooltip.textContent = content;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
        
        document.body.appendChild(tooltip);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 5000);
    }

    // Animate element
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Show progress bar
    showProgressBar(container, progress, message = '') {
        const progressBar = document.createElement('div');
        progressBar.className = 'w-full bg-gray-200 rounded-full h-2.5';
        progressBar.innerHTML = `
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
        `;
        
        if (message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'text-sm text-gray-600 mt-1';
            messageEl.textContent = message;
            container.appendChild(messageEl);
        }
        
        container.appendChild(progressBar);
        return progressBar;
    }

    // Update progress bar
    updateProgressBar(progressBar, progress, message = '') {
        const fill = progressBar.querySelector('.bg-blue-600');
        if (fill) {
            fill.style.width = `${progress}%`;
        }
        
        if (message) {
            const messageEl = progressBar.parentNode.querySelector('.text-sm');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }
}
