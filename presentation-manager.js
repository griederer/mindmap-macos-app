/**
 * PresentationManager - Manages presentation slides and state capture
 *
 * Features:
 * - Capture current mindmap state as slides
 * - Auto-generate slide descriptions
 * - Manage slide order and lifecycle
 * - Integration with mindmap-engine.js state
 */

class PresentationManager {
    constructor(mindmapEngine) {
        this.mindmapEngine = mindmapEngine;
        this.presentation = {
            slides: [],
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        this.nextSlideId = 1;
    }

    /**
     * Capture the current mindmap state
     * @returns {object} - Serialized state snapshot
     */
    captureCurrentState() {
        // Get expanded nodes from mindmap engine
        const expandedNodes = [];
        this.mindmapEngine.nodes.forEach(node => {
            if (node.element && node.element.classList.contains('expanded')) {
                expandedNodes.push(node.id);
            }
        });

        // Get open info panels
        const openInfoPanels = [];
        document.querySelectorAll('.info-panel.active').forEach(panel => {
            const nodeId = panel.dataset.nodeId;
            if (nodeId) {
                openInfoPanels.push(nodeId);
            }
        });

        // Get active full-screen image (if any)
        let activeImage = null;
        const imageOverlay = document.querySelector('.image-overlay.active');
        if (imageOverlay) {
            const img = imageOverlay.querySelector('img');
            if (img && img.dataset.nodeId) {
                activeImage = {
                    nodeId: img.dataset.nodeId,
                    imageUrl: img.src
                };
            }
        }

        // Get focused node (focus mode)
        let focusedNode = null;
        if (this.mindmapEngine.focusedNodeId) {
            focusedNode = this.mindmapEngine.focusedNodeId;
        }

        // Get zoom and pan state
        const zoom = this.mindmapEngine.zoom || 1.0;
        const pan = this.mindmapEngine.pan || { x: 0, y: 0 };

        // Get categories and relationships visibility
        const categoriesVisible = this.mindmapEngine.categoriesVisible !== false;
        const relationshipsVisible = this.mindmapEngine.relationshipsVisible !== false;

        return {
            expandedNodes,
            openInfoPanels,
            activeImage,
            focusedNode,
            zoom,
            pan,
            categoriesVisible,
            relationshipsVisible
        };
    }

    /**
     * Generate a descriptive title for a slide based on its state
     * @param {object} state - Captured state object
     * @returns {string} - Auto-generated description
     */
    generateSlideDescription(state) {
        const parts = [];

        // Check for focus mode
        if (state.focusedNode) {
            const node = this.mindmapEngine.nodes.find(n => n.id === state.focusedNode);
            if (node) {
                parts.push(`Focus: ${node.text}`);
            }
        }

        // Check for active image
        if (state.activeImage) {
            const node = this.mindmapEngine.nodes.find(n => n.id === state.activeImage.nodeId);
            if (node) {
                parts.push(`${node.text} (image)`);
            }
        }

        // Check for expanded nodes
        if (state.expandedNodes.length > 0) {
            const expandedNode = this.mindmapEngine.nodes.find(n => n.id === state.expandedNodes[0]);
            if (expandedNode && !parts.length) {
                parts.push(`${expandedNode.text} expanded`);
            }
        }

        // Check for open info panels
        if (state.openInfoPanels.length > 0) {
            const infoNode = this.mindmapEngine.nodes.find(n => n.id === state.openInfoPanels[0]);
            if (infoNode && !parts.length) {
                parts.push(`${infoNode.text} details`);
            }
        }

        // Default to root overview if nothing specific
        if (parts.length === 0) {
            const rootNode = this.mindmapEngine.nodes.find(n => n.level === 0);
            if (rootNode) {
                parts.push(`${rootNode.text} overview`);
            } else {
                parts.push('Overview');
            }
        }

        return parts.join(' - ');
    }

    /**
     * Add a new slide from the current mindmap state
     * @param {string} customDescription - Optional custom description (overrides auto-generated)
     * @returns {object} - The created slide object
     */
    addSlide(customDescription = null) {
        const state = this.captureCurrentState();
        const description = customDescription || this.generateSlideDescription(state);

        const slide = {
            id: this.nextSlideId++,
            description,
            expandedNodes: state.expandedNodes,
            openInfoPanels: state.openInfoPanels,
            activeImage: state.activeImage,
            focusedNode: state.focusedNode,
            zoom: state.zoom,
            pan: state.pan,
            categoriesVisible: state.categoriesVisible,
            relationshipsVisible: state.relationshipsVisible
        };

        this.presentation.slides.push(slide);
        this.presentation.modified = new Date().toISOString();

        return slide;
    }

    /**
     * Delete a slide by ID
     * @param {number} slideId - Slide ID to delete
     * @returns {boolean} - Success status
     */
    deleteSlide(slideId) {
        const index = this.presentation.slides.findIndex(s => s.id === slideId);
        if (index === -1) {
            return false;
        }

        this.presentation.slides.splice(index, 1);
        this.presentation.modified = new Date().toISOString();
        return true;
    }

    /**
     * Reorder slides
     * @param {number[]} newOrder - Array of slide IDs in desired order
     * @returns {boolean} - Success status
     */
    reorderSlides(newOrder) {
        if (newOrder.length !== this.presentation.slides.length) {
            return false;
        }

        const reordered = newOrder.map(id => {
            return this.presentation.slides.find(s => s.id === id);
        }).filter(s => s !== undefined);

        if (reordered.length !== this.presentation.slides.length) {
            return false;
        }

        this.presentation.slides = reordered;
        this.presentation.modified = new Date().toISOString();
        return true;
    }

    /**
     * Get slide count
     * @returns {number} - Number of slides
     */
    getSlideCount() {
        return this.presentation.slides.length;
    }

    /**
     * Get slide by ID
     * @param {number} slideId - Slide ID
     * @returns {object|null} - Slide object or null
     */
    getSlide(slideId) {
        return this.presentation.slides.find(s => s.id === slideId) || null;
    }

    /**
     * Get slide by index (0-based)
     * @param {number} index - Slide index
     * @returns {object|null} - Slide object or null
     */
    getSlideByIndex(index) {
        return this.presentation.slides[index] || null;
    }

    /**
     * Load presentation data from project
     * @param {object} presentationData - Presentation object from .pmap file
     */
    loadPresentation(presentationData) {
        if (!presentationData) {
            this.presentation = {
                slides: [],
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };
            this.nextSlideId = 1;
            return;
        }

        this.presentation = presentationData;

        // Calculate next slide ID
        if (this.presentation.slides.length > 0) {
            const maxId = Math.max(...this.presentation.slides.map(s => s.id));
            this.nextSlideId = maxId + 1;
        } else {
            this.nextSlideId = 1;
        }
    }

    /**
     * Export presentation data for saving
     * @returns {object} - Presentation data object
     */
    exportPresentation() {
        return this.presentation;
    }

    /**
     * Enter presentation mode
     * @param {object} animationEngine - Animation engine instance
     * @returns {boolean} - Success status
     */
    enterPresentationMode(animationEngine) {
        if (this.presentation.slides.length === 0) {
            return false;
        }

        // Store pre-presentation state for restoration
        this.prePresentationState = this.captureCurrentState();
        this.currentSlideIndex = 0;
        this.isPresenting = true;
        this.animationEngine = animationEngine;

        // Apply first slide
        this.renderSlide(0);

        return true;
    }

    /**
     * Exit presentation mode and restore previous state
     */
    exitPresentationMode() {
        if (!this.isPresenting) {
            return;
        }

        this.isPresenting = false;

        // Restore pre-presentation state
        if (this.prePresentationState) {
            this.restoreState(this.prePresentationState);
            this.prePresentationState = null;
        }

        this.currentSlideIndex = -1;
        this.animationEngine = null;
    }

    /**
     * Render a specific slide
     * @param {number} slideIndex - Slide index (0-based)
     */
    renderSlide(slideIndex) {
        const slide = this.presentation.slides[slideIndex];
        if (!slide) {
            console.error('Slide not found at index:', slideIndex);
            return;
        }

        this.currentSlideIndex = slideIndex;

        // Restore slide state (without animation for initial render)
        this.restoreState(slide);
    }

    /**
     * Navigate to next slide with animation
     * @returns {Promise} - Resolves when animation completes
     */
    async nextSlide() {
        if (!this.isPresenting || this.currentSlideIndex >= this.presentation.slides.length - 1) {
            return;
        }

        const fromSlide = this.presentation.slides[this.currentSlideIndex];
        const toSlide = this.presentation.slides[this.currentSlideIndex + 1];

        if (this.animationEngine) {
            await this.animationEngine.animateTransition(fromSlide, toSlide, false);
        } else {
            this.restoreState(toSlide);
        }

        this.currentSlideIndex++;
    }

    /**
     * Navigate to previous slide with reverse animation
     * @returns {Promise} - Resolves when animation completes
     */
    async previousSlide() {
        if (!this.isPresenting || this.currentSlideIndex <= 0) {
            return;
        }

        const fromSlide = this.presentation.slides[this.currentSlideIndex];
        const toSlide = this.presentation.slides[this.currentSlideIndex - 1];

        if (this.animationEngine) {
            await this.animationEngine.animateTransition(fromSlide, toSlide, false);
        } else {
            this.restoreState(toSlide);
        }

        this.currentSlideIndex--;
    }

    /**
     * Jump to a specific slide number (1-based for user)
     * @param {number} slideNumber - Slide number (1-10 for keys 1-0)
     * @returns {Promise} - Resolves when animation completes
     */
    async jumpToSlide(slideNumber) {
        const slideIndex = slideNumber - 1;

        if (!this.isPresenting || slideIndex < 0 || slideIndex >= this.presentation.slides.length) {
            return;
        }

        if (slideIndex === this.currentSlideIndex) {
            return; // Already on this slide
        }

        const fromSlide = this.presentation.slides[this.currentSlideIndex];
        const toSlide = this.presentation.slides[slideIndex];

        if (this.animationEngine) {
            await this.animationEngine.animateTransition(fromSlide, toSlide, false);
        } else {
            this.restoreState(toSlide);
        }

        this.currentSlideIndex = slideIndex;
    }

    /**
     * Restore mindmap to a specific state
     * @param {object} state - State object (slide or captured state)
     */
    restoreState(state) {
        // Set zoom and pan
        this.mindmapEngine.zoom = state.zoom;
        this.mindmapEngine.pan = { ...state.pan };
        this.mindmapEngine.updateTransform();

        // Expand/collapse nodes
        this.mindmapEngine.nodes.forEach(node => {
            const shouldBeExpanded = state.expandedNodes.includes(node.id);
            const isExpanded = node.element?.classList.contains('expanded');

            if (shouldBeExpanded !== isExpanded && node.element) {
                this.mindmapEngine.toggleChildren(node.id);
            }
        });

        // Set categories and relationships visibility
        if (state.categoriesVisible !== undefined) {
            this.mindmapEngine.categoriesVisible = state.categoriesVisible;
        }
        if (state.relationshipsVisible !== undefined) {
            this.mindmapEngine.relationshipsVisible = state.relationshipsVisible;
        }

        // Redraw connections
        if (this.mindmapEngine.drawConnections) {
            this.mindmapEngine.drawConnections();
        }

        // TODO: Handle info panels, active images, focus mode when needed
    }

    /**
     * Get current slide info for display
     * @returns {object|null} - Current slide info {current, total, canGoNext, canGoPrev}
     */
    getCurrentSlideInfo() {
        if (!this.isPresenting) {
            return null;
        }

        return {
            current: this.currentSlideIndex + 1,
            total: this.presentation.slides.length,
            canGoNext: this.currentSlideIndex < this.presentation.slides.length - 1,
            canGoPrev: this.currentSlideIndex > 0
        };
    }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationManager;
}
