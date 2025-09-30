// Mindmap Engine - Core logic for mindmap rendering and manipulation
class MindmapEngine {
    constructor() {
        this.nodes = null;
        this.nodeData = {};
        this.positions = {};
        this.selectedNode = null;
        this.scale = 1.0;
        this.canvas = null;
        this.ctx = null;
        this.animationFrameId = null;
        this.isDirty = false;
        this.nodeWidths = {};
        this.connectionPaths = [];

        this.initCanvas();
        this.setupAnimationLoop();
    }

    initCanvas() {
        this.canvas = document.getElementById('connectionCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Enable hardware acceleration
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Set canvas size
        this.canvas.width = 4000;
        this.canvas.height = 3000;
    }

    setupAnimationLoop() {
        const animate = () => {
            if (this.isDirty) {
                this.drawConnections();
                this.isDirty = false;
            }
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    parseOutline(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return { id: 'root', title: 'Root', children: [], level: -1 };

        let nodeId = 0;

        // Parse first line for root
        const firstLineParts = lines[0].split('|');
        const rootTitle = firstLineParts[0].replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim();
        const rootDescription = firstLineParts[1] ? firstLineParts[1].trim() : '';

        const root = {
            id: `node-${nodeId++}`,
            title: rootTitle,
            description: rootDescription,
            children: [],
            level: 0,
            expanded: false
        };

        // Initialize root node data with description (or update if exists)
        if (!this.nodeData[root.id]) {
            this.nodeData[root.id] = {
                description: rootDescription || '',
                notes: '',
                images: [],
                showInfo: false
            };
        } else {
            // Update description if node already exists
            this.nodeData[root.id].description = rootDescription || '';
        }

        const stack = [root];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            const level = this.getIndentLevel(line);
            const parts = line.split('|');
            const titlePart = parts[0];
            const description = parts[1] ? parts[1].trim() : '';
            const title = this.cleanTitle(titlePart);

            if (title) {
                const node = {
                    id: `node-${nodeId++}`,
                    title: title,
                    description: description,
                    children: [],
                    level: level,
                    expanded: false
                };

                // Initialize node data with description from parse (or update if exists)
                if (!this.nodeData[node.id]) {
                    this.nodeData[node.id] = {
                        description: description || '',  // Main description (max 50 words)
                        notes: '',                       // Additional notes (optional)
                        images: [],                      // Images array
                        showInfo: false                  // Info panel visibility
                    };
                } else {
                    // Update description if node already exists
                    this.nodeData[node.id].description = description || '';
                }

                // Find parent at appropriate level
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                // Add as child to the current top of stack
                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(node);
                    stack.push(node);
                }
            }
        }

        return root;
    }

    getIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        const spaces = match ? match[1].length : 0;
        const trimmed = line.trim();

        if (/^#+\s/.test(trimmed)) {
            const headerLevel = trimmed.match(/^(#+)/)[1].length;
            return headerLevel - 1;
        }

        if (/^\d+\./.test(trimmed)) {
            return 1;
        }

        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            if (spaces === 0) return 2;
            return 2 + Math.floor(spaces / 3);
        }

        if (spaces > 0) {
            return 2 + Math.floor(spaces / 3);
        }

        return 1;
    }

    cleanTitle(line) {
        return line.trim()
            .replace(/^\d+\.\s*/, '')
            .replace(/^#+\s*/, '')
            .replace(/^\*+\s*/, '')
            .replace(/^\-\s*/, '')
            .replace(/\*\*/g, '')
            .split('|')[0]
            .trim();
    }

    getNodeWidth(level) {
        const widths = {
            0: 180,
            1: 160,
            2: 140,
            3: 130,
            4: 120
        };
        return widths[Math.min(level, 4)] || 120;
    }

    calculateNodePositions(root, startX = 300, startY = 1500) {
        const positions = {};
        const levelWidth = 320;
        const minNodeHeight = 70;
        const verticalPadding = 40;
        const infoBoxMinHeight = 280;

        // Calculate height including info boxes
        const calculateHeight = (node) => {
            let baseHeight = minNodeHeight;

            if (this.nodeData[node.id]?.showInfo) {
                const data = this.nodeData[node.id];
                let infoHeight = 150;

                if (data.notes) {
                    const lines = data.notes.split('\n').length;
                    const chars = data.notes.length;
                    infoHeight += Math.min(250, lines * 25 + chars / 8);
                }

                if (data.images && data.images.length > 0) {
                    const rows = Math.ceil(data.images.length / 3);
                    infoHeight += rows * 100 + 30;
                }

                baseHeight += Math.max(infoBoxMinHeight, infoHeight);
            }

            if (!node.children || node.children.length === 0 || !node.expanded) {
                return baseHeight;
            }

            let totalHeight = 0;
            node.children.forEach(child => {
                totalHeight += calculateHeight(child);
            });

            let padding = verticalPadding;
            if (node.children.some(child => this.nodeData[child.id]?.showInfo)) {
                padding = verticalPadding * 2;
            }

            totalHeight += (node.children.length - 1) * padding;

            return Math.max(baseHeight, totalHeight);
        };

        // Position nodes recursively
        const traverse = (node, x, y, parentId = null, level = 0) => {
            positions[node.id] = { x, y, parentId, level };

            if (node.children && node.children.length > 0 && node.expanded) {
                const childrenHeights = node.children.map(child => calculateHeight(child));

                let padding = verticalPadding;
                if (node.children.some(child => this.nodeData[child.id]?.showInfo)) {
                    padding = verticalPadding * 2;
                }

                const totalHeight = childrenHeights.reduce((sum, h) => sum + h, 0) +
                                  (node.children.length - 1) * padding;

                let currentY = y - totalHeight / 2;

                node.children.forEach((child, index) => {
                    const childHeight = childrenHeights[index];
                    const childY = currentY + childHeight / 2;
                    traverse(child, x + levelWidth, childY, node.id, level + 1);
                    currentY += childHeight + padding;
                });
            }
        };

        traverse(root, startX, startY);
        return positions;
    }

    drawConnections() {
        if (!this.ctx || !this.nodes) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const drawNodeConnections = (node) => {
            if (!node || !node.children || node.children.length === 0 || !node.expanded) return;

            const parentPos = this.positions[node.id];
            if (!parentPos) return;

            node.children.forEach(child => {
                const childPos = this.positions[child.id];
                if (!childPos) return;

                // Calculate connection points based on node widths
                const parentWidth = this.getNodeWidth(parentPos.level);
                const childWidth = this.getNodeWidth(childPos.level);

                const startX = parentPos.x + (parentWidth / 2);
                const startY = parentPos.y;
                const endX = childPos.x - (childWidth / 2);
                const endY = childPos.y;

                // Draw straight horizontal line
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = 'rgba(245, 184, 149, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Recursively draw child connections
                drawNodeConnections(child);
            });
        };

        drawNodeConnections(this.nodes);
    }

    renderNodes(root) {
        const container = document.getElementById('nodesContainer');

        this.nodes = root;
        this.positions = this.calculateNodePositions(root);
        this.isDirty = true;

        // Build map of existing nodes
        const existingNodes = container.querySelectorAll('.node');
        const existingNodeMap = new Map();

        existingNodes.forEach(node => {
            const nodeId = node.dataset.nodeId;
            if (nodeId) {
                existingNodeMap.set(nodeId, node);
            }
        });

        // Track which nodes should exist after this render
        const nodesToKeep = new Set();

        const updateOrCreateNode = (node, level = 0) => {
            const pos = this.positions[node.id];
            if (!pos) return;

            nodesToKeep.add(node.id);

            // Check if node already exists
            let nodeEl = existingNodeMap.get(node.id);
            const isNewNode = !nodeEl;

            if (isNewNode) {
                // Create new node
                nodeEl = document.createElement('div');
                nodeEl.className = 'node';
                nodeEl.style.position = 'absolute';
                nodeEl.setAttribute('data-node-id', node.id);
                container.appendChild(nodeEl);
            }

            // Update position (will animate if node exists)
            nodeEl.style.left = pos.x + 'px';
            nodeEl.style.top = pos.y + 'px';
            nodeEl.style.transform = 'translate(-50%, -50%)';

            // Update or create content
            const hasChildren = node.children && node.children.length > 0;
            const levelClass = level === 0 ? 'central' : `level-${level}`;

            let nodeContent = nodeEl.querySelector('.node-content');
            if (!nodeContent || isNewNode) {
                nodeEl.innerHTML = ''; // Clear if recreating
                nodeContent = document.createElement('div');
                nodeContent.className = `node-content ${levelClass}`;

                // Double-click for editing
                nodeContent.ondblclick = (e) => {
                    e.stopPropagation();
                    this.editNode(node.id, node.title);
                };

                // Right-click context menu
                nodeContent.oncontextmenu = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showContextMenu(e, node.id, node.title);
                };

                // Click to select
                nodeContent.onclick = (e) => {
                    e.stopPropagation();
                    this.selectNode(node.id);
                };

                // Create actions
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'node-actions';
                actionsDiv.innerHTML = `
                    <button class="action-btn" onclick="mindmapEngine.editNode('${node.id}', '${node.title.replace(/'/g, "\\'")}')">Editar</button>
                    <button class="action-btn" onclick="mindmapEngine.toggleInfo('${node.id}')">Info</button>
                `;
                nodeContent.appendChild(actionsDiv);

                // Create text span
                const textSpan = document.createElement('span');
                textSpan.className = 'node-text';
                textSpan.textContent = node.title;
                nodeContent.appendChild(textSpan);

                // Add toggle if has children
                if (hasChildren) {
                    const toggleSpan = document.createElement('span');
                    toggleSpan.className = 'toggle-icon';
                    toggleSpan.textContent = node.expanded ? '−' : '+';
                    toggleSpan.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNode(node.id);
                    };
                    nodeContent.appendChild(toggleSpan);
                }

                nodeEl.appendChild(nodeContent);

                // Extra info panel - Show description + notes + images
                const extraInfo = document.createElement('div');
                extraInfo.className = 'node-extra-info';
                extraInfo.id = `info-${node.id}`;

                const data = this.nodeData[node.id] || {};

                // Add 'active' class if showInfo is true
                if (data.showInfo) {
                    extraInfo.classList.add('active');
                }

                let infoHTML = '';

                // Priority order: description > notes > images
                const hasDescription = data.description && data.description.trim();
                const hasNotes = data.notes && data.notes.trim();
                const hasImages = data.images && data.images.length > 0;

                if (hasDescription || hasNotes || hasImages) {
                    // 1. Show user-defined description (from edit modal)
                    if (hasDescription) {
                        const formattedDesc = data.description
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br>');
                        infoHTML += `<div class="info-description">${formattedDesc}</div>`;
                    }
                    // 2. Show additional notes (optional)
                    if (hasNotes) {
                        const formattedNotes = data.notes
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br>');
                        infoHTML += `<div class="info-notes">${formattedNotes}</div>`;
                    }
                    // 3. Show uploaded images
                    if (hasImages) {
                        infoHTML += '<div class="info-images">';
                        data.images.forEach((img, idx) => {
                            if (img && img.startsWith('data:image')) {
                                infoHTML += `<img src="${img}" alt="Image ${idx + 1}" />`;
                            }
                        });
                        infoHTML += '</div>';
                    }
                } else {
                    infoHTML = '<div class="info-empty">Sin información adicional. Haz doble clic para agregar.</div>';
                }

                extraInfo.innerHTML = infoHTML;
                nodeEl.appendChild(extraInfo);
            } else {
                // Update existing node content
                const textSpan = nodeContent.querySelector('.node-text');
                if (textSpan) textSpan.textContent = node.title;

                const toggleSpan = nodeContent.querySelector('.toggle-icon');
                if (hasChildren && toggleSpan) {
                    toggleSpan.textContent = node.expanded ? '−' : '+';
                }
            }

            // Render children if expanded
            if (node.children && node.expanded) {
                node.children.forEach(child => {
                    updateOrCreateNode(child, level + 1);
                });
            }
        };

        // Update/create all visible nodes
        updateOrCreateNode(root);

        // Remove nodes that no longer exist or are hidden
        existingNodeMap.forEach((nodeEl, nodeId) => {
            if (!nodesToKeep.has(nodeId)) {
                // Fade out and remove
                nodeEl.style.opacity = '0';
                nodeEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (nodeEl.parentNode) {
                        nodeEl.parentNode.removeChild(nodeEl);
                    }
                }, 300);
            }
        });
    }

    toggleNode(nodeId) {
        const node = this.findNode(nodeId, this.nodes);
        if (node && node.children && node.children.length > 0) {
            node.expanded = !node.expanded;
            this.renderNodes(this.nodes);
        }
    }

    selectNode(nodeId) {
        // Remove previous selection
        document.querySelectorAll('.node.selected').forEach(n => {
            n.classList.remove('selected');
        });

        // Add selection to current node
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            nodeEl.classList.add('selected');
            this.selectedNode = nodeId;
        }
    }

    editNode(nodeId, nodeTitle) {
        window.currentEditingNode = nodeId;
        const modal = document.getElementById('editModal');
        const overlay = document.getElementById('modalOverlay');
        const data = this.nodeData[nodeId] || { description: '', notes: '', images: [] };
        const node = this.findNode(nodeId, this.nodes);

        document.getElementById('modalTitle').textContent = `Editar: ${nodeTitle}`;
        document.getElementById('modalNodeTitle').value = node ? node.title : nodeTitle;
        document.getElementById('modalDescription').value = data.description || '';
        document.getElementById('modalNotes').value = data.notes || '';

        const imagesContainer = document.getElementById('modalImages');
        imagesContainer.innerHTML = '';

        if (data.images && data.images.length > 0) {
            data.images.forEach((img, idx) => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'uploaded-image';
                imgDiv.innerHTML = `
                    <img src="${img}" alt="Image ${idx + 1}">
                    <button class="remove-image" onclick="mindmapEngine.removeImage(${idx})">×</button>
                `;
                imagesContainer.appendChild(imgDiv);
            });
        }

        setTimeout(() => {
            modal.classList.add('active');
            overlay.classList.add('active');
        }, 10);
    }

    toggleInfo(nodeId) {
        // Initialize nodeData if it doesn't exist
        if (!this.nodeData[nodeId]) {
            this.nodeData[nodeId] = { description: '', notes: '', images: [], showInfo: false };
        }

        // Toggle the showInfo flag
        this.nodeData[nodeId].showInfo = !this.nodeData[nodeId].showInfo;

        // Find the info panel element
        const infoPanel = document.getElementById(`info-${nodeId}`);

        if (infoPanel) {
            // Toggle 'active' class directly
            if (this.nodeData[nodeId].showInfo) {
                infoPanel.classList.add('active');
            } else {
                infoPanel.classList.remove('active');
            }
        }

        // Recalculate positions and redraw if needed (for spacing adjustments)
        this.positions = this.calculateNodePositions(this.nodes);
        this.isDirty = true;
    }

    expandAll() {
        const expand = (node) => {
            if (node.children && node.children.length > 0) {
                node.expanded = true;
                node.children.forEach(child => expand(child));
            }
        };
        expand(this.nodes);
        this.renderNodes(this.nodes);
    }

    collapseAll() {
        const collapse = (node) => {
            if (node.children && node.children.length > 0) {
                node.expanded = false;
                node.children.forEach(child => collapse(child));
            }
        };
        collapse(this.nodes);
        this.renderNodes(this.nodes);
    }

    findNode(nodeId, nodeOrArray) {
        if (!nodeOrArray) return null;

        if (Array.isArray(nodeOrArray)) {
            for (let node of nodeOrArray) {
                const found = this.findNode(nodeId, node);
                if (found) return found;
            }
            return null;
        }

        if (nodeOrArray.id === nodeId) return nodeOrArray;
        if (nodeOrArray.children) {
            for (let child of nodeOrArray.children) {
                const found = this.findNode(nodeId, child);
                if (found) return found;
            }
        }
        return null;
    }

    showContextMenu(e, nodeId, nodeTitle) {
        const menu = document.getElementById('contextMenu');
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';

        window.contextNodeId = nodeId;
        window.contextNodeTitle = nodeTitle;

        setTimeout(() => {
            menu.classList.add('active');
        }, 10);

        // Hide menu when clicking elsewhere
        const hideMenu = () => {
            menu.classList.remove('active');
            document.removeEventListener('click', hideMenu);
        };

        setTimeout(() => {
            document.addEventListener('click', hideMenu);
        }, 100);
    }

    addChildNode(parentId) {
        const parent = this.findNode(parentId, this.nodes);
        if (!parent) return;

        const newNode = {
            id: `node-${Date.now()}`,
            title: 'Nuevo Nodo',
            description: '',
            children: [],
            level: parent.level + 1,
            expanded: false
        };

        if (!parent.children) {
            parent.children = [];
        }

        parent.children.push(newNode);
        parent.expanded = true;

        this.nodeData[newNode.id] = {
            description: '',
            notes: '',
            images: [],
            showInfo: false
        };

        this.renderNodes(this.nodes);

        // Auto-edit the new node
        setTimeout(() => {
            this.editNode(newNode.id, newNode.title);
        }, 100);
    }

    deleteNode(nodeId) {
        if (this.nodes.id === nodeId) {
            alert('No puedes eliminar el nodo raíz');
            return;
        }

        const deleteFromParent = (parent) => {
            if (!parent.children) return false;

            const index = parent.children.findIndex(child => child.id === nodeId);
            if (index !== -1) {
                parent.children.splice(index, 1);
                delete this.nodeData[nodeId];
                return true;
            }

            for (let child of parent.children) {
                if (deleteFromParent(child)) return true;
            }

            return false;
        };

        if (deleteFromParent(this.nodes)) {
            this.renderNodes(this.nodes);
        }
    }

    removeImage(index) {
        if (window.currentEditingNode && this.nodeData[window.currentEditingNode]) {
            this.nodeData[window.currentEditingNode].images.splice(index, 1);
            const node = this.findNode(window.currentEditingNode, this.nodes);
            if (node) {
                this.editNode(window.currentEditingNode, node.title);
            }
        }
    }

    exportData() {
        return {
            nodes: this.nodes,
            nodeData: this.nodeData,
            timestamp: new Date().toISOString()
        };
    }

    importData(data) {
        this.nodes = data.nodes;
        this.nodeData = data.nodeData || {};
        this.renderNodes(this.nodes);
    }

    saveNodeData() {
        const nodeId = window.currentEditingNode;
        if (!nodeId) return;

        const node = this.findNode(nodeId, this.nodes);
        if (node) {
            const newTitle = document.getElementById('modalNodeTitle').value.trim();
            if (newTitle) {
                node.title = newTitle;
            }
        }

        if (!this.nodeData[nodeId]) {
            this.nodeData[nodeId] = { description: '', notes: '', images: [], showInfo: false };
        }

        // Save description and notes
        this.nodeData[nodeId].description = document.getElementById('modalDescription').value;
        this.nodeData[nodeId].notes = document.getElementById('modalNotes').value;

        this.renderNodes(this.nodes);

        // Close modal
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }
}

// Create global instance
window.mindmapEngine = new MindmapEngine();