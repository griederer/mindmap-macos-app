/**
 * PresentationMode - Canvas-based presentation system
 *
 * Features:
 * - Canvas-based presentation (no fullscreen overlay)
 * - Keyboard navigation (arrow keys, ESC)
 * - Smooth state transitions between slides
 * - Direct integration with renderer state system
 */

class PresentationMode {
    constructor(renderer, presentationManager) {
        this.renderer = renderer;
        this.presentationManager = presentationManager;
        this.currentSlideIndex = 0;
        this.isActive = false;
        this.keyboardHandler = null;
    }

    /**
     * Start presentation mode
     * @returns {boolean} - Success status
     */
    start() {
        const slides = this.presentationManager.presentation.slides;

        if (slides.length === 0) {
            console.error('[PresentationMode] No slides to present');
            return false;
        }

        this.isActive = true;
        this.currentSlideIndex = 0;

        // Hide UI elements during presentation
        this.hideUIElements();

        // Set up keyboard navigation
        this.setupKeyboardNavigation();

        // Go to first slide
        this.goToSlide(0);

        console.log('[PresentationMode] Started presentation');
        return true;
    }

    /**
     * Stop presentation mode
     */
    stop() {
        if (!this.isActive) return;

        this.isActive = false;

        // Remove keyboard listener
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Show UI elements
        this.showUIElements();

        console.log('[PresentationMode] Stopped presentation');
    }

    /**
     * Navigate to specific slide
     * @param {number} index - Slide index (0-based)
     */
    goToSlide(index) {
        const slides = this.presentationManager.presentation.slides;

        if (index < 0 || index >= slides.length) {
            console.error('[PresentationMode] Invalid slide index:', index);
            return;
        }

        const slide = slides[index];
        this.currentSlideIndex = index;

        // Restore slide state using renderer's restoreState method
        if (slide.state) {
            this.renderer.restoreState(slide.state);
        }

        console.log(`[PresentationMode] Navigated to slide ${index + 1}/${slides.length}:`, slide.description);
    }

    /**
     * Navigate to next slide
     */
    nextSlide() {
        const slides = this.presentationManager.presentation.slides;

        if (this.currentSlideIndex < slides.length - 1) {
            this.goToSlide(this.currentSlideIndex + 1);
        } else {
            console.log('[PresentationMode] Already at last slide');
        }
    }

    /**
     * Navigate to previous slide
     */
    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.goToSlide(this.currentSlideIndex - 1);
        } else {
            console.log('[PresentationMode] Already at first slide');
        }
    }

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        this.keyboardHandler = (e) => {
            if (!this.isActive) return;

            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;

                case 'Escape':
                case 'q':
                case 'Q':
                    e.preventDefault();
                    this.stop();
                    break;

                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;

                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.presentationManager.presentation.slides.length - 1);
                    break;

                // Number keys 1-9 for quick navigation
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const slideNumber = parseInt(e.key);
                    this.goToSlide(slideNumber - 1);
                    break;
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
    }

    /**
     * Hide UI elements during presentation
     */
    hideUIElements() {
        // Hide toolbar
        const toolbar = document.getElementById('toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }

        // Hide capture log panel
        const capturePanel = document.getElementById('captureLogPanel');
        if (capturePanel) {
            capturePanel.style.display = 'none';
        }

        // Hide slide panel
        const slidePanel = document.getElementById('slidePanel');
        if (slidePanel) {
            slidePanel.style.display = 'none';
        }

        // Add presentation mode class to body
        document.body.classList.add('presentation-mode');
    }

    /**
     * Show UI elements after presentation
     */
    showUIElements() {
        // Show toolbar
        const toolbar = document.getElementById('toolbar');
        if (toolbar) {
            toolbar.style.display = '';
        }

        // Restore capture log panel if it was active
        const capturePanel = document.getElementById('captureLogPanel');
        if (capturePanel && window.captureLog && window.captureLog.isCaptureModeActive) {
            capturePanel.style.display = '';
        }

        // Restore slide panel visibility (check if it was open before)
        const slidePanel = document.getElementById('slidePanel');
        if (slidePanel) {
            slidePanel.style.display = '';
        }

        // Remove presentation mode class
        document.body.classList.remove('presentation-mode');
    }

    /**
     * Get current slide info
     * @returns {object} - {current, total, canGoNext, canGoPrev, description}
     */
    getCurrentSlideInfo() {
        if (!this.isActive) return null;

        const slides = this.presentationManager.presentation.slides;
        const currentSlide = slides[this.currentSlideIndex];

        return {
            current: this.currentSlideIndex + 1,
            total: slides.length,
            canGoNext: this.currentSlideIndex < slides.length - 1,
            canGoPrev: this.currentSlideIndex > 0,
            description: currentSlide ? currentSlide.description : ''
        };
    }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationMode;
}
