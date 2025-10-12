/**
 * PresentationUI - Manages the presentation slides panel and UI interactions
 *
 * Features:
 * - Slide panel rendering with thumbnails
 * - Drag-and-drop reordering
 * - Slide preview and deletion
 * - Real-time updates
 */

class PresentationUI {
    constructor(presentationManager, mindmapEngine) {
        this.presentationManager = presentationManager;
        this.mindmapEngine = mindmapEngine;
        this.slidePanel = null;
        this.slidesList = null;
        this.isPanelOpen = this.loadPanelState();
        this.sortable = null;

        this.init();
    }

    /**
     * Initialize the presentation UI
     */
    init() {
        this.slidePanel = document.getElementById('slidesPanel');
        this.slidesList = document.getElementById('slidesList');

        if (!this.slidePanel || !this.slidesList) {
            console.warn('Slide panel elements not found');
            return;
        }

        this.setupEventListeners();
        this.renderSlidePanel();

        // Set initial panel state
        if (this.isPanelOpen) {
            this.openPanel();
        }
    }

    /**
     * Setup event listeners for panel controls
     */
    setupEventListeners() {
        // Toggle panel button
        const toggleBtn = document.getElementById('toggleSlidesPanel');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePanel());
        }

        // Close panel button
        const closeBtn = document.getElementById('closeSlidesPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePanel());
        }

        // Collapse panel button
        const collapseBtn = document.getElementById('collapseSlidesPanel');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.closePanel());
        }
    }

    /**
     * Render the slide panel with all slides
     */
    renderSlidePanel() {
        if (!this.slidesList) return;

        const slides = this.presentationManager.presentation.slides;

        if (slides.length === 0) {
            this.slidesList.innerHTML = '<div class="no-slides-message">No hay slides aún. Haz clic en 📸 para capturar el estado actual.</div>';
            this.destroySortable();
            return;
        }

        this.slidesList.innerHTML = '';

        slides.forEach((slide, index) => {
            const slideItem = this.createSlideItem(slide, index);
            this.slidesList.appendChild(slideItem);
        });

        // Initialize drag-and-drop
        this.initSortable();
    }

    /**
     * Create a slide item element
     * @param {object} slide - Slide data
     * @param {number} index - Slide index
     * @returns {HTMLElement} - Slide item element
     */
    createSlideItem(slide, index) {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        slideItem.dataset.slideId = slide.id;

        // Slide number badge
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = index + 1;

        // Slide thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-thumbnail';

        // Generate thumbnail
        this.generateSlideThumbnail(slide).then(thumbnailUrl => {
            if (thumbnailUrl) {
                thumbnail.style.backgroundImage = `url(${thumbnailUrl})`;
            }
        });

        // Slide description
        const description = document.createElement('div');
        description.className = 'slide-description';
        description.textContent = slide.description;

        // Slide actions
        const actions = document.createElement('div');
        actions.className = 'slide-actions';

        const previewBtn = document.createElement('button');
        previewBtn.className = 'slide-action-btn';
        previewBtn.innerHTML = '👁️';
        previewBtn.title = 'Vista Previa';
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.previewSlide(slide.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'slide-action-btn delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Eliminar';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSlide(slide.id, index + 1);
        });

        actions.appendChild(previewBtn);
        actions.appendChild(deleteBtn);

        slideItem.appendChild(slideNumber);
        slideItem.appendChild(thumbnail);
        slideItem.appendChild(description);
        slideItem.appendChild(actions);

        return slideItem;
    }

    /**
     * Generate a thumbnail image for a slide using Canvas API
     * @param {object} slide - Slide data
     * @returns {Promise<string>} - Data URL of thumbnail
     */
    async generateSlideThumbnail(slide) {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Thumbnail dimensions (120x80px as per requirements)
                canvas.width = 120;
                canvas.height = 80;

                // Fill background
                ctx.fillStyle = '#f5f5f5';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw simplified representation
                ctx.fillStyle = '#333';
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Draw slide info
                const text = slide.description || 'Slide';
                const maxWidth = 100;

                // Wrap text if too long
                const words = text.split(' ');
                let line = '';
                let y = 30;
                const lineHeight = 12;

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && i > 0) {
                        ctx.fillText(line, canvas.width / 2, y);
                        line = words[i] + ' ';
                        y += lineHeight;

                        if (y > 70) break; // Max 4 lines
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, canvas.width / 2, y);

                // Draw zoom indicator
                ctx.font = '8px Inter, sans-serif';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'right';
                ctx.fillText(`${Math.round(slide.zoom * 100)}%`, canvas.width - 5, canvas.height - 5);

                // Draw expanded nodes indicator
                if (slide.expandedNodes && slide.expandedNodes.length > 0) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.beginPath();
                    ctx.arc(10, 10, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw info panel indicator
                if (slide.openInfoPanels && slide.openInfoPanels.length > 0) {
                    ctx.fillStyle = '#2196F3';
                    ctx.beginPath();
                    ctx.arc(20, 10, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw focus mode indicator
                if (slide.focusedNode) {
                    ctx.fillStyle = '#FF9800';
                    ctx.beginPath();
                    ctx.arc(30, 10, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                console.error('Error generating thumbnail:', error);
                resolve(null);
            }
        });
    }

    /**
     * Initialize SortableJS for drag-and-drop reordering
     */
    initSortable() {
        if (!this.slidesList || typeof Sortable === 'undefined') {
            console.warn('Sortable not available');
            return;
        }

        this.destroySortable();

        this.sortable = Sortable.create(this.slidesList, {
            animation: 150,
            handle: '.slide-item',
            ghostClass: 'slide-item-ghost',
            chosenClass: 'slide-item-chosen',
            dragClass: 'slide-item-drag',
            onEnd: (evt) => {
                const slideIds = Array.from(this.slidesList.children).map(el =>
                    parseInt(el.dataset.slideId)
                );

                const success = this.presentationManager.reorderSlides(slideIds);

                if (success) {
                    // Mark project as dirty
                    if (window.projectManager) {
                        window.projectManager.markDirty();
                    }

                    // Re-render to update slide numbers
                    this.renderSlidePanel();
                } else {
                    console.error('Failed to reorder slides');
                    this.renderSlidePanel(); // Revert to original order
                }
            }
        });
    }

    /**
     * Destroy sortable instance
     */
    destroySortable() {
        if (this.sortable) {
            this.sortable.destroy();
            this.sortable = null;
        }
    }

    /**
     * Delete a slide with confirmation
     * @param {number} slideId - Slide ID to delete
     * @param {number} slideNumber - Slide number for display
     */
    deleteSlide(slideId, slideNumber) {
        const confirmDelete = confirm(`¿Eliminar slide ${slideNumber}?`);

        if (confirmDelete) {
            const success = this.presentationManager.deleteSlide(slideId);

            if (success) {
                // Mark project as dirty
                if (window.projectManager) {
                    window.projectManager.markDirty();
                }

                // Update UI
                this.renderSlidePanel();
                this.updateSlideCounter();

                console.log(`Slide ${slideNumber} deleted`);
            } else {
                alert('Error al eliminar el slide');
            }
        }
    }

    /**
     * Preview a slide without entering presentation mode
     * @param {number} slideId - Slide ID to preview
     */
    previewSlide(slideId) {
        console.log('[PresentationUI] previewSlide called with slideId:', slideId);

        const slide = this.presentationManager.getSlide(slideId);
        console.log('[PresentationUI] Got slide:', slide);

        if (!slide) {
            console.error('[PresentationUI] Slide not found:', slideId);
            return;
        }

        // Store current state for restoration
        const currentState = this.presentationManager.captureCurrentState();
        console.log('[PresentationUI] Captured current state for restoration:', currentState);

        // Apply slide state
        console.log('[PresentationUI] Calling restoreSlideState with slide:', slide);
        this.restoreSlideState(slide);

        // Show notification
        this.showPreviewNotification(slide);
    }

    /**
     * Restore mindmap to slide state
     * @param {object} slide - Slide data
     */
    restoreSlideState(slide) {
        console.log('[PresentationUI] restoreSlideState called with slide:', slide);
        console.log('[PresentationUI] Slide state:', slide.state);
        console.log('[PresentationUI] window.renderer exists:', !!window.renderer);
        console.log('[PresentationUI] window.renderer.restoreState exists:', !!(window.renderer && window.renderer.restoreState));

        // Use the renderer's restoreState method with the slide's state object
        if (window.renderer && window.renderer.restoreState && slide.state) {
            console.log('[PresentationUI] Calling window.renderer.restoreState with state:', slide.state);
            window.renderer.restoreState(slide.state);
            console.log('[PresentationUI] window.renderer.restoreState call completed');
        } else {
            console.error('[PresentationUI] Cannot restore state - missing renderer, restoreState method, or slide.state');
        }
    }

    /**
     * Show preview notification
     * @param {object} slide - Slide data
     */
    showPreviewNotification(slide) {
        const notification = document.createElement('div');
        notification.className = 'slide-preview-notification';
        notification.textContent = `Vista Previa: ${slide.description}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Update slide counter in toolbar
     */
    updateSlideCounter() {
        const count = this.presentationManager.getSlideCount();
        const slideCounter = document.getElementById('slideCounter');

        if (slideCounter) {
            slideCounter.textContent = `${count} slide${count !== 1 ? 's' : ''}`;
            slideCounter.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    /**
     * Toggle panel open/closed
     */
    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    /**
     * Open panel
     */
    openPanel() {
        if (this.slidePanel) {
            this.slidePanel.classList.remove('hidden');
            this.isPanelOpen = true;
            this.savePanelState();
        }
    }

    /**
     * Close panel
     */
    closePanel() {
        if (this.slidePanel) {
            this.slidePanel.classList.add('hidden');
            this.isPanelOpen = false;
            this.savePanelState();
        }
    }

    /**
     * Save panel state to localStorage
     */
    savePanelState() {
        localStorage.setItem('presentation-panel-open', JSON.stringify(this.isPanelOpen));
    }

    /**
     * Load panel state from localStorage
     * @returns {boolean} - Panel open state
     */
    loadPanelState() {
        const saved = localStorage.getItem('presentation-panel-open');
        return saved ? JSON.parse(saved) : false;
    }

    /**
     * Refresh panel (re-render slides)
     */
    refresh() {
        this.renderSlidePanel();
        this.updateSlideCounter();
    }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationUI;
}
