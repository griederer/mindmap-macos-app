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
     * Helper: Find a node by ID in the tree
     * @param {string} nodeId - ID to search for
     * @returns {object|null} - Found node or null
     */
    findNodeById(nodeId) {
        const search = (node) => {
            if (node.id === nodeId) return node;
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const found = search(child);
                    if (found) return found;
                }
            }
            return null;
        };
        return this.mindmapEngine.nodes ? search(this.mindmapEngine.nodes) : null;
    }

    /**
     * Capture the current mindmap state
     * @returns {object} - Serialized state snapshot
     */
    captureCurrentState() {
        // Get expanded nodes from mindmap engine (recursive traversal)
        const expandedNodes = [];
        const collectExpanded = (node) => {
            if (node.expanded) {
                expandedNodes.push(node.id);
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => collectExpanded(child));
            }
        };
        if (this.mindmapEngine.nodes) {
            collectExpanded(this.mindmapEngine.nodes);
        }

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
            const node = this.findNodeById(state.focusedNode);
            if (node) {
                parts.push(`Focus: ${node.text}`);
            }
        }

        // Check for active image
        if (state.activeImage) {
            const node = this.findNodeById(state.activeImage.nodeId);
            if (node) {
                parts.push(`${node.text} (image)`);
            }
        }

        // Check for expanded nodes
        if (state.expandedNodes.length > 0) {
            const expandedNode = this.findNodeById(state.expandedNodes[0]);
            if (expandedNode && !parts.length) {
                parts.push(`${expandedNode.text} expanded`);
            }
        }

        // Check for open info panels
        if (state.openInfoPanels.length > 0) {
            const infoNode = this.findNodeById(state.openInfoPanels[0]);
            if (infoNode && !parts.length) {
                parts.push(`${infoNode.text} details`);
            }
        }

        // Default to root overview if nothing specific
        if (parts.length === 0) {
            const rootNode = this.mindmapEngine.nodes; // Root is the nodes object itself
            if (rootNode && rootNode.text) {
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
        // Use renderer's comprehensive state capture if available, otherwise use local method
        const state = window.renderer ? window.renderer.captureCurrentState() : this.captureCurrentState();
        const description = customDescription || this.generateSlideDescription(state);

        const slide = {
            id: this.nextSlideId++,
            description,
            timestamp: new Date().toISOString(),
            state: state  // Store the complete state object for canvas-based presentation
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

        console.log('[PresentationManager] nextSlide:', {
            from: this.currentSlideIndex,
            to: this.currentSlideIndex + 1,
            toSlide: {
                description: toSlide.description,
                expandedNodes: toSlide.expandedNodes,
                zoom: toSlide.zoom,
                pan: toSlide.pan
            }
        });

        // For now, use direct state restore without animations
        // TODO: Re-enable animations once working
        this.restoreState(toSlide);

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

        console.log('[PresentationManager] previousSlide:', {
            from: this.currentSlideIndex,
            to: this.currentSlideIndex - 1
        });

        // For now, use direct state restore without animations
        this.restoreState(toSlide);

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

        // Expand/collapse nodes (recursive traversal)
        const processNode = (node) => {
            const shouldBeExpanded = state.expandedNodes.includes(node.id);

            // Set expanded state directly on data
            if (node.children && node.children.length > 0) {
                node.expanded = shouldBeExpanded;

                // Also update the DOM element class if it exists
                if (node.element) {
                    if (shouldBeExpanded) {
                        node.element.classList.add('expanded');
                    } else {
                        node.element.classList.remove('expanded');
                    }
                }
            }

            // Process children recursively
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => processNode(child));
            }
        };
        if (this.mindmapEngine.nodes) {
            processNode(this.mindmapEngine.nodes);
        }

        // Set categories and relationships visibility
        if (state.categoriesVisible !== undefined) {
            this.mindmapEngine.categoriesVisible = state.categoriesVisible;
        }
        if (state.relationshipsVisible !== undefined) {
            this.mindmapEngine.relationshipsVisible = state.relationshipsVisible;
        }

        console.log('[PresentationManager] restoreState - about to render:', {
            nodeCount: this.countNodes(this.mindmapEngine.nodes),
            expandedInState: state.expandedNodes.length,
            zoom: this.mindmapEngine.zoom,
            pan: this.mindmapEngine.pan
        });

        // Re-render the mindmap
        if (this.mindmapEngine.renderNodes && this.mindmapEngine.nodes) {
            this.mindmapEngine.renderNodes(this.mindmapEngine.nodes);
        }

        // Redraw connections
        if (this.mindmapEngine.drawConnections) {
            this.mindmapEngine.drawConnections();
        }

        // Close all existing info panels first
        document.querySelectorAll('.info-panel.active').forEach(panel => {
            panel.classList.remove('active');
        });

        // Restore info panels
        if (state.openInfoPanels && state.openInfoPanels.length > 0) {
            state.openInfoPanels.forEach(nodeId => {
                // Find the info panel for this node
                const panel = document.querySelector(`.info-panel[data-node-id="${nodeId}"]`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        }

        // Close existing fullscreen image first
        const existingOverlay = document.querySelector('.image-overlay.active');
        if (existingOverlay) {
            existingOverlay.classList.remove('active');
        }

        // Restore active fullscreen image
        if (state.activeImage) {
            const overlay = document.querySelector('.image-overlay');
            if (overlay) {
                const img = overlay.querySelector('img');
                if (img) {
                    img.src = state.activeImage.imageUrl;
                    img.dataset.nodeId = state.activeImage.nodeId;
                }
                overlay.classList.add('active');
            }
        }

        // Restore focus mode
        if (state.focusedNode) {
            this.mindmapEngine.focusedNodeId = state.focusedNode;
        } else {
            this.mindmapEngine.focusedNodeId = null;
        }

        console.log('[PresentationManager] restoreState - render complete');
    }

    /**
     * Helper: Count nodes in tree (for debugging)
     */
    countNodes(node) {
        let count = 1;
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                count += this.countNodes(child);
            });
        }
        return count;
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
