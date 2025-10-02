/**
 * NodeReorderManager - Handles drag-and-drop reordering of mindmap nodes
 *
 * Features:
 * - Drag and drop nodes to reorder siblings
 * - Visual feedback during drag
 * - Persist custom order in project data
 * - Restore order on load
 */

class NodeReorderManager {
    constructor(mindmapEngine) {
        this.mindmapEngine = mindmapEngine;
        this.draggedNode = null;
        this.draggedElement = null;
        this.dropTarget = null;
        this.dropIndicator = null;
        this.customOrders = {}; // { parentId: { childId: order } }

        this.initializeDropIndicator();
    }

    /**
     * Initialize the drop indicator element
     */
    initializeDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.dropIndicator.style.display = 'none';
        document.body.appendChild(this.dropIndicator);
    }

    /**
     * Make a node draggable
     * @param {HTMLElement} nodeElement - The node DOM element
     * @param {object} nodeData - The node data object
     */
    makeDraggable(nodeElement, nodeData) {
        nodeElement.dataset.nodeId = nodeData.id;

        // Make the node content draggable (not the whole node, not just text)
        const nodeContent = nodeElement.querySelector('.node-content');
        if (!nodeContent) return;

        nodeContent.draggable = true;
        nodeContent.style.cursor = 'move';

        // Prevent drag if clicking on buttons
        nodeContent.addEventListener('mousedown', (e) => {
            if (e.target.closest('.action-btn') || e.target.closest('.toggle-icon')) {
                nodeContent.draggable = false;
            } else {
                nodeContent.draggable = true;
            }
        });

        nodeContent.addEventListener('dragstart', (e) => {
            // Double check we're not dragging from a button
            if (e.target.closest('.action-btn') || e.target.closest('.toggle-icon')) {
                e.preventDefault();
                return;
            }
            this.handleDragStart(e, nodeElement, nodeData);
        });

        nodeContent.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });

        // Node element handles dragover and drop events
        nodeElement.addEventListener('dragover', (e) => {
            this.handleDragOver(e, nodeElement, nodeData);
        });

        nodeElement.addEventListener('drop', (e) => {
            this.handleDrop(e, nodeElement, nodeData);
        });

        nodeElement.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e);
        });
    }

    /**
     * Handle drag start event
     */
    handleDragStart(e, element, nodeData) {
        this.draggedNode = nodeData;
        this.draggedElement = element;

        element.style.opacity = '0.5';
        element.classList.add('dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', element.innerHTML);

        console.log('✓ Drag started:', nodeData.title);
    }

    /**
     * Handle drag end event
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.style.opacity = '';
            this.draggedElement.classList.remove('dragging');
        }

        // Clean up
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        });

        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }

        this.draggedNode = null;
        this.draggedElement = null;
        this.dropTarget = null;

        console.log('✓ Drag ended');
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e, element, nodeData) {
        if (!this.draggedNode || this.draggedNode.id === nodeData.id) {
            return;
        }

        // Prevent default to allow drop
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Check if nodes share the same parent (siblings)
        if (!this.areSiblings(this.draggedNode, nodeData)) {
            return;
        }

        // Calculate drop position
        const rect = element.getBoundingClientRect();
        const midpoint = rect.top + (rect.height / 2);
        const isTopHalf = e.clientY < midpoint;

        // Update visual feedback
        element.classList.remove('drag-over-top', 'drag-over-bottom');
        element.classList.add(isTopHalf ? 'drag-over-top' : 'drag-over-bottom');

        // Position drop indicator
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'block';
            this.dropIndicator.style.left = `${rect.left}px`;
            this.dropIndicator.style.width = `${rect.width}px`;

            if (isTopHalf) {
                this.dropIndicator.style.top = `${rect.top - 2}px`;
            } else {
                this.dropIndicator.style.top = `${rect.bottom - 2}px`;
            }
        }

        this.dropTarget = { node: nodeData, element, isTopHalf };
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(e) {
        const element = e.currentTarget;
        element.classList.remove('drag-over-top', 'drag-over-bottom');
    }

    /**
     * Handle drop event
     */
    handleDrop(e, element, nodeData) {
        e.preventDefault();
        e.stopPropagation();

        console.log('📍 Drop event - dragged:', this.draggedNode?.title, '→ target:', this.dropTarget?.node?.title);

        if (!this.draggedNode) {
            console.warn('❌ No dragged node');
            return;
        }

        if (!this.dropTarget) {
            console.warn('❌ No drop target');
            return;
        }

        // Check if trying to drop on itself
        if (this.draggedNode.id === this.dropTarget.node.id) {
            console.warn('❌ Cannot drop on itself');
            return;
        }

        // Check if siblings
        if (!this.areSiblings(this.draggedNode, this.dropTarget.node)) {
            console.warn('❌ Cannot reorder: nodes are not siblings');
            return;
        }

        // Perform reorder
        console.log('🔄 Reordering nodes...');
        this.reorderNodes(this.draggedNode, this.dropTarget.node, this.dropTarget.isTopHalf);

        // Clean up
        element.classList.remove('drag-over-top', 'drag-over-bottom');

        console.log('✅ Reorder completed successfully');
    }

    /**
     * Check if two nodes are siblings (share same parent)
     * @param {object} node1 - First node
     * @param {object} node2 - Second node
     * @returns {boolean} - True if siblings
     */
    areSiblings(node1, node2) {
        const parent1 = this.findParent(node1.id);
        const parent2 = this.findParent(node2.id);

        return parent1 && parent2 && parent1.id === parent2.id;
    }

    /**
     * Find parent node of a given node
     * @param {string} nodeId - Node ID to find parent for
     * @returns {object|null} - Parent node or null
     */
    findParent(nodeId) {
        const findParentRecursive = (node, searchId) => {
            if (!node.children) return null;

            for (const child of node.children) {
                if (child.id === searchId) {
                    return node;
                }
                const found = findParentRecursive(child, searchId);
                if (found) return found;
            }
            return null;
        };

        return findParentRecursive(this.mindmapEngine.nodes, nodeId);
    }

    /**
     * Reorder nodes in the tree
     * @param {object} draggedNode - Node being dragged
     * @param {object} targetNode - Target node
     * @param {boolean} insertBefore - Insert before (true) or after (false)
     */
    reorderNodes(draggedNode, targetNode, insertBefore) {
        const parent = this.findParent(draggedNode.id);

        if (!parent || !parent.children) {
            console.error('❌ Parent not found for node:', draggedNode.id);
            return;
        }

        console.log('🔍 Before reorder:', parent.children.map(c => c.title));

        // Remove dragged node from current position
        const draggedIndex = parent.children.findIndex(c => c.id === draggedNode.id);
        if (draggedIndex === -1) {
            console.error('❌ Dragged node not in parent');
            return;
        }

        console.log(`📤 Removing "${draggedNode.title}" from index ${draggedIndex}`);
        parent.children.splice(draggedIndex, 1);

        // Find new target index (after removal)
        let targetIndex = parent.children.findIndex(c => c.id === targetNode.id);
        if (targetIndex === -1) {
            console.error('❌ Target node not found');
            return;
        }

        // Adjust index if inserting after
        if (!insertBefore) {
            targetIndex++;
        }

        console.log(`📥 Inserting "${draggedNode.title}" at index ${targetIndex} (${insertBefore ? 'before' : 'after'} "${targetNode.title}")`);

        // Insert at new position
        parent.children.splice(targetIndex, 0, draggedNode);

        console.log('🔍 After reorder:', parent.children.map(c => c.title));

        // 🔧 FIX 4: Secuencia ordenada con timing correcto

        // PASO 1: Actualizar orden personalizado
        this.updateCustomOrder(parent);
        console.log('💾 Custom order updated');

        // PASO 2: Forzar aplicación del orden (asegurar consistencia)
        this.applyCustomOrder(parent);
        console.log('✅ Custom order applied to parent.children');

        // PASO 3: Marcar como dirty DESPUÉS de actualizar datos
        if (window.projectManager) {
            window.projectManager.markDirty();
        }

        // PASO 4: Re-render usando setTimeout para garantizar que el estado está estable
        setTimeout(() => {
            console.log('🎨 Rendering nodes with new order');
            this.mindmapEngine.renderNodes(this.mindmapEngine.nodes);
            console.log(`✅ Reordered: ${draggedNode.title} ${insertBefore ? 'before' : 'after'} ${targetNode.title}`);
        }, 0);
    }

    /**
     * Update custom order for a parent's children
     * @param {object} parent - Parent node
     */
    updateCustomOrder(parent) {
        if (!this.customOrders[parent.id]) {
            this.customOrders[parent.id] = {};
        }

        parent.children.forEach((child, index) => {
            this.customOrders[parent.id][child.id] = index;
        });
    }

    /**
     * Apply custom order to children
     * @param {object} parent - Parent node
     */
    applyCustomOrder(parent) {
        if (!parent.children || !this.customOrders[parent.id]) {
            return;
        }

        // 🔧 FIX 5: CREAR NUEVO array ordenado (no modificar in-place)
        const orderedChildren = [...parent.children].sort((a, b) => {
            const orderA = this.customOrders[parent.id][a.id];
            const orderB = this.customOrders[parent.id][b.id];

            if (orderA === undefined && orderB === undefined) return 0;
            if (orderA === undefined) return 1;
            if (orderB === undefined) return -1;

            return orderA - orderB;
        });

        // REEMPLAZAR array completo para evitar referencias viejas
        parent.children = orderedChildren;

        console.log('🔄 Applied custom order to parent:', parent.title,
                    'Children:', parent.children.map(c => c.title));
    }

    /**
     * Export custom orders for persistence
     * @returns {object} - Custom orders object
     */
    exportOrders() {
        return JSON.parse(JSON.stringify(this.customOrders));
    }

    /**
     * Import custom orders from saved data
     * @param {object} orders - Custom orders object
     */
    importOrders(orders) {
        if (orders && typeof orders === 'object') {
            this.customOrders = orders;
            this.applyOrdersToTree(this.mindmapEngine.nodes);
        }
    }

    /**
     * Apply custom orders to entire tree recursively
     * @param {object} node - Root node
     */
    applyOrdersToTree(node) {
        if (!node) return;

        this.applyCustomOrder(node);

        if (node.children) {
            node.children.forEach(child => this.applyOrdersToTree(child));
        }
    }

    /**
     * Clear all custom orders
     */
    clearOrders() {
        this.customOrders = {};
    }
}

// Export for use in mindmap-engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeReorderManager;
}
if (typeof window !== 'undefined') {
    window.NodeReorderManager = NodeReorderManager;
}
