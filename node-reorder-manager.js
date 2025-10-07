/**
 * ULTRA-SIMPLE Node Reorder Manager
 * Manual drag-and-drop - SIMPLIFIED VERSION
 */

class NodeReorderManager {
    constructor(mindmapEngine) {
        this.engine = mindmapEngine;
        this.draggedNode = null;
        this.draggedElement = null;
        this.customOrders = {};
        console.log('🔧 NodeReorderManager initialized (SIMPLE v4)');
    }

    /**
     * Make a node draggable
     */
    makeDraggable(nodeElement, nodeData) {
        const content = nodeElement.querySelector('.node-content');
        if (!content) return;

        // Make it draggable
        nodeElement.draggable = true;
        nodeElement.style.cursor = 'grab';

        // DRAG START
        nodeElement.addEventListener('dragstart', (e) => {
            // Don't drag from buttons
            if (e.target.closest('.action-btn') || e.target.closest('.toggle-icon')) {
                e.preventDefault();
                return;
            }

            this.draggedNode = nodeData;
            this.draggedElement = nodeElement;
            nodeElement.style.opacity = '0.4';
            nodeElement.style.cursor = 'grabbing';

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', nodeElement.innerHTML);

            console.log('🎯 DRAG START:', nodeData.title);
        });

        // DRAG END
        nodeElement.addEventListener('dragend', (e) => {
            nodeElement.style.opacity = '1';
            nodeElement.style.cursor = 'grab';

            // Remove all highlights
            document.querySelectorAll('.node').forEach(el => {
                el.style.borderTop = '';
                el.style.borderBottom = '';
            });

            this.draggedNode = null;
            this.draggedElement = null;

            console.log('✅ DRAG END');
        });

        // DRAG OVER - CRITICAL for drop to work
        nodeElement.addEventListener('dragover', (e) => {
            // ALWAYS preventDefault - this is CRITICAL
            e.preventDefault();
            e.stopPropagation();

            if (!this.draggedNode) return;
            if (this.draggedNode.id === nodeData.id) return;

            e.dataTransfer.dropEffect = 'move';

            // Visual feedback - show where it will drop
            const rect = nodeElement.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const isTop = e.clientY < midpoint;

            // Clear both borders first
            nodeElement.style.borderTop = '';
            nodeElement.style.borderBottom = '';

            // Show drop position
            if (isTop) {
                nodeElement.style.borderTop = '3px solid #4CAF50';
            } else {
                nodeElement.style.borderBottom = '3px solid #4CAF50';
            }
        });

        // DROP - Use CAPTURE phase to catch events before children
        const dropHandler = (e) => {
            console.log('🔥 DROP EVENT FIRED on', e.target.className, '→ handled by', nodeElement.dataset.nodeId);

            e.preventDefault();
            e.stopPropagation(); // Stop it here after we handle it

            // Remove ALL highlights from all nodes
            document.querySelectorAll('.node').forEach(el => {
                el.style.borderTop = '';
                el.style.borderBottom = '';
            });

            if (!this.draggedNode) {
                console.log('❌ DROP FAILED: No draggedNode');
                return;
            }

            if (this.draggedNode.id === nodeData.id) {
                console.log('❌ DROP FAILED: Same node');
                return;
            }

            console.log(`📦 DROP: "${this.draggedNode.title}" → "${nodeData.title}"`);

            // Check if they're siblings
            const areSiblings = this.areSiblings(this.draggedNode, nodeData);
            console.log(`🔍 Are siblings? ${areSiblings}`);

            if (areSiblings) {
                // Calculate drop position
                const rect = nodeElement.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const insertBefore = e.clientY < midpoint;

                console.log(`📍 Insert ${insertBefore ? 'BEFORE' : 'AFTER'} (clientY: ${e.clientY}, midpoint: ${midpoint})`);

                this.reorder(this.draggedNode, nodeData, insertBefore);
            } else {
                const parent1 = this.findParent(this.draggedNode.id);
                const parent2 = this.findParent(nodeData.id);
                console.log(`⚠️  Not siblings - Parent1: ${parent1?.title}, Parent2: ${parent2?.title}`);
            }
        };

        // Add in CAPTURE phase (true = capture, false = bubble)
        nodeElement.addEventListener('drop', dropHandler, true);
    }

    /**
     * Check if two nodes are siblings
     */
    areSiblings(node1, node2) {
        const parent1 = this.findParent(node1.id);
        const parent2 = this.findParent(node2.id);

        if (!parent1 || !parent2) return false;
        return parent1.id === parent2.id;
    }

    /**
     * Find parent of a node
     */
    findParent(nodeId) {
        const search = (node) => {
            if (!node.children) return null;

            for (const child of node.children) {
                if (child.id === nodeId) return node;
                const found = search(child);
                if (found) return found;
            }
            return null;
        };

        return search(this.engine.nodes);
    }

    /**
     * Reorder nodes
     */
    reorder(draggedNode, targetNode, insertBefore) {
        const parent = this.findParent(draggedNode.id);
        if (!parent || !parent.children) {
            console.error('❌ Parent not found');
            return;
        }

        // Remove dragged node
        const draggedIndex = parent.children.findIndex(c => c.id === draggedNode.id);
        if (draggedIndex === -1) return;

        parent.children.splice(draggedIndex, 1);

        // Find new target position
        const targetIndex = parent.children.findIndex(c => c.id === targetNode.id);

        if (targetIndex === -1) {
            parent.children.push(draggedNode);
        } else {
            // Insert before or after based on drop position
            const insertIndex = insertBefore ? targetIndex : targetIndex + 1;
            parent.children.splice(insertIndex, 0, draggedNode);
        }

        console.log('📋 New order:', parent.children.map(c => c.title));

        // Save custom order
        this.saveOrder(parent);

        // Mark as dirty
        if (window.projectManager) {
            window.projectManager.markDirty();
        }

        // Re-render
        setTimeout(() => {
            this.engine.renderNodes(this.engine.nodes);
            console.log('✅ Reordered successfully');
        }, 0);
    }

    /**
     * Save custom order for a parent
     */
    saveOrder(parent) {
        if (!this.customOrders[parent.id]) {
            this.customOrders[parent.id] = {};
        }

        parent.children.forEach((child, index) => {
            this.customOrders[parent.id][child.id] = index;
        });

        console.log('💾 Saved order for', parent.title);
    }

    /**
     * Apply saved order to children
     */
    applyOrder(parent) {
        if (!parent.children || !this.customOrders[parent.id]) return;

        parent.children.sort((a, b) => {
            const orderA = this.customOrders[parent.id][a.id];
            const orderB = this.customOrders[parent.id][b.id];

            if (orderA === undefined && orderB === undefined) return 0;
            if (orderA === undefined) return 1;
            if (orderB === undefined) return -1;

            return orderA - orderB;
        });
    }

    /**
     * Apply orders to entire tree
     */
    applyOrdersToTree(node) {
        if (!node) return;

        this.applyOrder(node);

        if (node.children) {
            node.children.forEach(child => this.applyOrdersToTree(child));
        }
    }

    /**
     * Export orders for saving
     */
    exportOrders() {
        return JSON.parse(JSON.stringify(this.customOrders));
    }

    /**
     * Import orders from saved data
     */
    importOrders(orders) {
        if (orders && typeof orders === 'object') {
            this.customOrders = orders;
            this.applyOrdersToTree(this.engine.nodes);
            console.log('📥 Imported custom orders');
        }
    }

    /**
     * Clear all orders
     */
    clearOrders() {
        this.customOrders = {};
    }

    // Not used - for compatibility
    initializeTree() {}
    destroyAll() {}
    moveToParent() {}
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeReorderManager;
}
if (typeof window !== 'undefined') {
    window.NodeReorderManager = NodeReorderManager;
}
