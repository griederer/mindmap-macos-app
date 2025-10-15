/**
 * AnimationEngine - Handles smooth animations for presentation mode
 *
 * Features:
 * - Path calculation for distant nodes (intermediate steps)
 * - Node expansion/collapse animations with cubic-bezier easing
 * - Info panel fade in/out animations
 * - Smooth zoom/pan camera movements
 * - Animation queuing for sequential playback
 * - User input waiting for manual progression
 */

class AnimationEngine {
    constructor(mindmapEngine) {
        this.mindmapEngine = mindmapEngine;
        this.animationQueue = [];
        this.isAnimating = false;
        this.isPaused = false;
        this.resumeCallback = null;
    }

    /**
     * Calculate the path of nodes between two states
     * @param {object} fromState - Starting state
     * @param {object} toState - Target state
     * @returns {object} - Path information with nodes to expand/collapse
     */
    calculateNodePath(fromState, toState) {
        const path = {
            toExpand: [],
            toCollapse: [],
            distance: 0
        };

        // Find nodes to expand (in toState but not in fromState)
        toState.expandedNodes.forEach(nodeId => {
            if (!fromState.expandedNodes.includes(nodeId)) {
                path.toExpand.push(nodeId);
            }
        });

        // Find nodes to collapse (in fromState but not in toState)
        fromState.expandedNodes.forEach(nodeId => {
            if (!toState.expandedNodes.includes(nodeId)) {
                path.toCollapse.push(nodeId);
            }
        });

        // Calculate distance (simple sum for now)
        path.distance = path.toExpand.length + path.toCollapse.length;

        return path;
    }

    /**
     * Generate intermediate steps for distant nodes
     * @param {object} path - Path from calculateNodePath
     * @returns {Array} - Array of animation steps
     */
    generateIntermediateSteps(path) {
        const steps = [];

        // If distance is small (0-2 changes), no intermediate steps needed
        if (path.distance <= 2) {
            return steps;
        }

        // For distant transitions, create step-by-step expansion
        // First collapse all nodes that need to collapse
        if (path.toCollapse.length > 0) {
            path.toCollapse.forEach(nodeId => {
                steps.push({
                    type: 'collapse',
                    nodeId: nodeId,
                    duration: 300
                });
            });
        }

        // Then expand nodes in hierarchical order (parent before children)
        if (path.toExpand.length > 0) {
            const orderedExpand = this.orderNodesByHierarchy(path.toExpand);
            orderedExpand.forEach(nodeId => {
                steps.push({
                    type: 'expand',
                    nodeId: nodeId,
                    duration: 300
                });
            });
        }

        return steps;
    }

    /**
     * Order nodes by hierarchy (parents before children)
     * @param {Array} nodeIds - Array of node IDs
     * @returns {Array} - Ordered array of node IDs
     */
    orderNodesByHierarchy(nodeIds) {
        return nodeIds
            .map(id => {
                const node = this.mindmapEngine.nodes.find(n => n.id === id);
                return { id, level: node ? node.level : 999 };
            })
            .sort((a, b) => a.level - b.level)
            .map(item => item.id);
    }

    /**
     * Animate node expansion with cubic-bezier easing
     * @param {string} nodeId - Node ID to expand
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} - Resolves when animation completes
     */
    animateNodeExpansion(nodeId, duration = 300) {
        return new Promise((resolve) => {
            const node = this.mindmapEngine.nodes.find(n => n.id === nodeId);

            if (!node || !node.element) {
                resolve();
                return;
            }

            // If already expanded, skip
            if (node.element.classList.contains('expanded')) {
                resolve();
                return;
            }

            // Get children container
            const childrenContainer = node.element.querySelector('.children');

            if (!childrenContainer) {
                // No children, just toggle
                this.mindmapEngine.toggleChildren(nodeId);
                resolve();
                return;
            }

            // Set up animation
            childrenContainer.style.height = '0px';
            childrenContainer.style.opacity = '0';
            childrenContainer.style.overflow = 'hidden';
            childrenContainer.style.transition = `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

            // Toggle to expand
            this.mindmapEngine.toggleChildren(nodeId);

            // Measure target height
            requestAnimationFrame(() => {
                const targetHeight = childrenContainer.scrollHeight;

                // Animate
                requestAnimationFrame(() => {
                    childrenContainer.style.height = `${targetHeight}px`;
                    childrenContainer.style.opacity = '1';

                    setTimeout(() => {
                        childrenContainer.style.height = '';
                        childrenContainer.style.opacity = '';
                        childrenContainer.style.overflow = '';
                        childrenContainer.style.transition = '';
                        resolve();
                    }, duration);
                });
            });
        });
    }

    /**
     * Animate node collapse with reverse animation
     * @param {string} nodeId - Node ID to collapse
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} - Resolves when animation completes
     */
    animateNodeCollapse(nodeId, duration = 300) {
        return new Promise((resolve) => {
            const node = this.mindmapEngine.nodes.find(n => n.id === nodeId);

            if (!node || !node.element) {
                resolve();
                return;
            }

            // If already collapsed, skip
            if (!node.element.classList.contains('expanded')) {
                resolve();
                return;
            }

            const childrenContainer = node.element.querySelector('.children');

            if (!childrenContainer) {
                this.mindmapEngine.toggleChildren(nodeId);
                resolve();
                return;
            }

            // Measure current height
            const currentHeight = childrenContainer.scrollHeight;

            // Set up animation
            childrenContainer.style.height = `${currentHeight}px`;
            childrenContainer.style.overflow = 'hidden';
            childrenContainer.style.transition = `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

            // Force reflow
            childrenContainer.offsetHeight;

            // Animate collapse
            childrenContainer.style.height = '0px';
            childrenContainer.style.opacity = '0';

            setTimeout(() => {
                this.mindmapEngine.toggleChildren(nodeId);
                childrenContainer.style.height = '';
                childrenContainer.style.opacity = '';
                childrenContainer.style.overflow = '';
                childrenContainer.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Animate image modal fade in/out
     * @param {string} nodeId - Node ID
     * @param {number} imageIndex - Image index
     * @param {string} action - 'open' or 'close'
     * @param {number} duration - Animation duration in ms (default 500ms)
     * @returns {Promise} - Resolves when animation completes
     */
    animateImageModal(nodeId, imageIndex, action, duration = 500) {
        return new Promise((resolve) => {
            const modal = document.querySelector('.image-modal');

            if (!modal) {
                resolve();
                return;
            }

            if (action === 'open') {
                modal.style.opacity = '0';
                modal.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                modal.classList.add('active');
                modal.setAttribute('data-node-id', nodeId);
                modal.setAttribute('data-image-index', imageIndex);

                requestAnimationFrame(() => {
                    modal.style.opacity = '1';

                    setTimeout(() => {
                        modal.style.opacity = '';
                        modal.style.transition = '';
                        resolve();
                    }, duration);
                });
            } else if (action === 'close') {
                modal.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                modal.style.opacity = '0';

                setTimeout(() => {
                    modal.classList.remove('active');
                    modal.removeAttribute('data-node-id');
                    modal.removeAttribute('data-image-index');
                    modal.style.opacity = '';
                    modal.style.transition = '';
                    resolve();
                }, duration);
            } else {
                resolve();
            }
        });
    }

    /**
     * Animate info panel fade in/out
     * @param {string} nodeId - Node ID
     * @param {string} action - 'show' or 'hide'
     * @param {number} duration - Animation duration in ms (updated to 350ms per PRD)
     * @returns {Promise} - Resolves when animation completes
     */
    animateInfoPanel(nodeId, action, duration = 350) {
        return new Promise((resolve) => {
            const panel = document.querySelector(`.info-panel[data-node-id="${nodeId}"]`);

            if (!panel) {
                resolve();
                return;
            }

            if (action === 'show') {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(-10px)';
                panel.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                panel.classList.add('active');

                requestAnimationFrame(() => {
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';

                    setTimeout(() => {
                        panel.style.opacity = '';
                        panel.style.transform = '';
                        panel.style.transition = '';
                        resolve();
                    }, duration);
                });
            } else if (action === 'hide') {
                panel.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    panel.classList.remove('active');
                    panel.style.opacity = '';
                    panel.style.transform = '';
                    panel.style.transition = '';
                    resolve();
                }, duration);
            } else {
                resolve();
            }
        });
    }

    /**
     * Animate relationship line show/hide
     * @param {string} relationshipId - Relationship ID
     * @param {string} action - 'show' or 'hide'
     * @param {number} duration - Animation duration in ms (default 300ms)
     * @returns {Promise} - Resolves when animation completes
     */
    animateRelationship(relationshipId, action, duration = 300) {
        return new Promise((resolve) => {
            const line = document.querySelector(`[data-relationship-id="${relationshipId}"]`);

            if (!line) {
                resolve();
                return;
            }

            // Get line total length for stroke-dasharray animation
            const length = line.getTotalLength ? line.getTotalLength() : 0;

            if (action === 'show') {
                // Start with line hidden
                line.setAttribute('stroke-dasharray', length);
                line.setAttribute('stroke-dashoffset', length);
                line.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                line.style.opacity = '1';

                requestAnimationFrame(() => {
                    // Animate line drawing
                    line.setAttribute('stroke-dashoffset', '0');

                    setTimeout(() => {
                        line.removeAttribute('stroke-dasharray');
                        line.removeAttribute('stroke-dashoffset');
                        line.style.transition = '';
                        resolve();
                    }, duration);
                });
            } else if (action === 'hide') {
                // Animate line erasing (reverse)
                line.setAttribute('stroke-dasharray', length);
                line.setAttribute('stroke-dashoffset', '0');
                line.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

                requestAnimationFrame(() => {
                    line.setAttribute('stroke-dashoffset', length);

                    setTimeout(() => {
                        line.style.opacity = '0';
                        line.removeAttribute('stroke-dasharray');
                        line.removeAttribute('stroke-dashoffset');
                        line.style.transition = '';
                        resolve();
                    }, duration);
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Animate focus mode activation/deactivation
     * @param {string} nodeId - Node ID to focus on (null for deactivate)
     * @param {string} action - 'activate' or 'deactivate'
     * @param {number} duration - Animation duration in ms (default 300ms)
     * @returns {Promise} - Resolves when animation completes
     */
    animateFocusMode(nodeId, action, duration = 300) {
        return new Promise((resolve) => {
            if (action === 'activate' && nodeId) {
                // Find target node
                const targetNode = this.mindmapEngine.nodes.find(n => n.id === nodeId);

                if (!targetNode || !targetNode.element) {
                    resolve();
                    return;
                }

                // Get all nodes
                const allNodes = document.querySelectorAll('.node');

                // Dim all other nodes
                allNodes.forEach(node => {
                    if (node !== targetNode.element) {
                        node.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                        node.style.opacity = '0.3';
                    }
                });

                // Highlight focused node
                targetNode.element.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                targetNode.element.style.opacity = '1';

                // Calculate camera position to center focused node
                // This is a simplified implementation - actual logic will depend on node positioning
                const targetZoom = this.mindmapEngine.zoom || 1.0;
                const targetPan = this.mindmapEngine.pan || { x: 0, y: 0 };

                // Animate camera movement
                this.animateZoomPan(targetZoom, targetPan, duration).then(() => {
                    setTimeout(() => {
                        allNodes.forEach(node => {
                            node.style.transition = '';
                        });
                        resolve();
                    }, 50);
                });
            } else if (action === 'deactivate') {
                // Restore opacity to all nodes
                const allNodes = document.querySelectorAll('.node');

                allNodes.forEach(node => {
                    node.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                    node.style.opacity = '1';
                });

                setTimeout(() => {
                    allNodes.forEach(node => {
                        node.style.transition = '';
                        node.style.opacity = '';
                    });
                    resolve();
                }, duration);
            } else {
                resolve();
            }
        });
    }

    /**
     * Animate zoom and pan smoothly
     * @param {number} targetZoom - Target zoom level
     * @param {object} targetPan - Target pan {x, y}
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} - Resolves when animation completes
     */
    animateZoomPan(targetZoom, targetPan, duration = 500) {
        return new Promise((resolve) => {
            const startZoom = this.mindmapEngine.zoom;
            const startPan = { ...this.mindmapEngine.pan };
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Cubic-bezier easing: ease-in-out
                const eased = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Interpolate zoom
                this.mindmapEngine.zoom = startZoom + (targetZoom - startZoom) * eased;

                // Interpolate pan
                this.mindmapEngine.pan.x = startPan.x + (targetPan.x - startPan.x) * eased;
                this.mindmapEngine.pan.y = startPan.y + (targetPan.y - startPan.y) * eased;

                // Update transform
                this.mindmapEngine.updateTransform();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * Add animation to queue
     * @param {Function} animationFn - Animation function that returns a Promise
     */
    queueAnimation(animationFn) {
        this.animationQueue.push(animationFn);

        if (!this.isAnimating) {
            this.processQueue();
        }
    }

    /**
     * Process animation queue sequentially
     */
    async processQueue() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }

        this.isAnimating = true;

        while (this.animationQueue.length > 0) {
            const animationFn = this.animationQueue.shift();

            try {
                await animationFn();
            } catch (error) {
                console.error('Animation error:', error);
            }

            // Check if paused
            if (this.isPaused) {
                await this.waitForUserInput();
            }
        }

        this.isAnimating = false;
    }

    /**
     * Wait for user input (arrow key) before continuing
     * @returns {Promise} - Resolves when user presses arrow key
     */
    waitForUserInput() {
        return new Promise((resolve) => {
            this.isPaused = true;
            this.resumeCallback = () => {
                this.isPaused = false;
                this.resumeCallback = null;
                resolve();
            };
        });
    }

    /**
     * Resume animation (called by keyboard handler)
     */
    resume() {
        if (this.resumeCallback) {
            this.resumeCallback();
        }
    }

    /**
     * Clear animation queue
     */
    clearQueue() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.isPaused = false;
        this.resumeCallback = null;
    }

    /**
     * Animate transition between two slide states
     * @param {object} fromState - Starting state
     * @param {object} toState - Target state
     * @param {boolean} waitForInput - Whether to wait for user input between steps
     * @returns {Promise} - Resolves when all animations complete
     */
    async animateTransition(fromState, toState, waitForInput = false) {
        // Calculate path
        const path = this.calculateNodePath(fromState, toState);

        // Generate intermediate steps if needed
        const steps = this.generateIntermediateSteps(path);

        // Clear existing queue
        this.clearQueue();

        // If no intermediate steps, do direct transition
        if (steps.length === 0) {
            // Collapse nodes
            for (const nodeId of path.toCollapse) {
                await this.animateNodeCollapse(nodeId);
            }

            // Expand nodes
            for (const nodeId of path.toExpand) {
                await this.animateNodeExpansion(nodeId);
            }

            // Animate zoom/pan
            await this.animateZoomPan(toState.zoom, toState.pan);
        } else {
            // Execute intermediate steps
            for (const step of steps) {
                if (step.type === 'expand') {
                    await this.animateNodeExpansion(step.nodeId, step.duration);
                } else if (step.type === 'collapse') {
                    await this.animateNodeCollapse(step.nodeId, step.duration);
                }

                // Wait for user input if requested
                if (waitForInput && steps.indexOf(step) < steps.length - 1) {
                    await this.waitForUserInput();
                }
            }

            // Final zoom/pan
            await this.animateZoomPan(toState.zoom, toState.pan);
        }
    }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationEngine;
}
