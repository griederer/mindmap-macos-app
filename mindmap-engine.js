// Mindmap Engine - Core logic for mindmap rendering and manipulation
class MindmapEngine {
    constructor() {
        this.nodes = null;
        this.nodeData = {};
        this.positions = {};
        this.selectedNode = null;
        this.focusedNodeId = null; // For presentation focus mode
        this.scale = 1.0;
        this.canvas = null;
        this.ctx = null;
        this.animationFrameId = null;
        this.isDirty = false;
        this.nodeWidths = {};
        this.connectionPaths = [];

        // Initialize node reorder manager
        this.reorderManager = new NodeReorderManager(this);

        this.initCanvas();
        this.setupAnimationLoop();
        this.setupImageLightbox();
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

        // 🔧 FIX: Cache para arrays ordenados - garantiza consistencia
        const sortedChildrenCache = new Map();

        // ✨ v2.6: Smart node ordering by importance
        const sortChildrenByImportance = (children, parentNode) => {
            // 🔧 FIX 3: Si ya calculamos el orden para este nodo, usar cache
            if (parentNode && sortedChildrenCache.has(parentNode.id)) {
                return sortedChildrenCache.get(parentNode.id);
            }

            let sortedArray;

            // If custom order exists, apply it
            if (this.reorderManager && parentNode) {
                const hasCustomOrder = this.reorderManager.customOrders[parentNode.id];
                if (hasCustomOrder) {
                    // 🔧 FIX 1: SIEMPRE devolver COPIA para evitar referencias compartidas
                    const childrenCopy = [...(children || [])];
                    const parentCopy = { ...parentNode, children: childrenCopy };
                    this.reorderManager.applyOrder(parentCopy);
                    sortedArray = [...parentCopy.children]; // Copia del resultado
                }
            }

            // Otherwise, sort by importance
            if (!sortedArray) {
                sortedArray = [...(children || [])].sort((a, b) => {
                    // Priority 1: Nodes with visible info panels
                    const aHasInfo = this.nodeData[a.id]?.showInfo ? 1 : 0;
                    const bHasInfo = this.nodeData[b.id]?.showInfo ? 1 : 0;
                    if (aHasInfo !== bHasInfo) return bHasInfo - aHasInfo;

                    // Priority 2: Number of children (more children = more important)
                    const aChildren = (a.children || []).length;
                    const bChildren = (b.children || []).length;
                    if (aChildren !== bChildren) return bChildren - aChildren;

                    // Priority 3: Title length (more content = more important)
                    return b.title.length - a.title.length;
                });
            }

            // 🔧 FIX 3: Guardar en cache para consistencia
            if (parentNode) {
                sortedChildrenCache.set(parentNode.id, sortedArray);
            }

            return sortedArray;
        };

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

            // ✨ v2.6: Sort children before calculating height (usa cache)
            const sortedChildren = sortChildrenByImportance(node.children, node);

            let totalHeight = 0;
            sortedChildren.forEach(child => {
                totalHeight += calculateHeight(child);
            });

            // ✨ v2.6: Adaptive padding based on content
            let padding = verticalPadding;
            const hasLargeChildren = sortedChildren.some(child => this.nodeData[child.id]?.showInfo);

            if (hasLargeChildren) {
                padding = verticalPadding * 1.5; // More space for info panels
            } else if (sortedChildren.length > 5) {
                padding = verticalPadding * 0.7; // Less space when many nodes
            }

            totalHeight += (sortedChildren.length - 1) * padding;

            return Math.max(baseHeight, totalHeight);
        };

        // Position nodes recursively
        const traverse = (node, x, y, parentId = null, level = 0) => {
            positions[node.id] = { x, y, parentId, level };

            if (node.children && node.children.length > 0 && node.expanded) {
                // 🔧 FIX 2: Crear SNAPSHOT del array ANTES de cualquier operación
                const childrenSnapshot = [...node.children];

                // ✨ v2.6: Sort children by importance (usa cache)
                const sortedChildren = sortChildrenByImportance(childrenSnapshot, node);
                const childrenHeights = sortedChildren.map(child => calculateHeight(child));

                // ✨ v2.6: Adaptive padding
                let padding = verticalPadding;
                const hasLargeChildren = sortedChildren.some(child => this.nodeData[child.id]?.showInfo);

                if (hasLargeChildren) {
                    padding = verticalPadding * 1.5;
                } else if (sortedChildren.length > 5) {
                    padding = verticalPadding * 0.7;
                }

                const totalHeight = childrenHeights.reduce((sum, h) => sum + h, 0) +
                                  (sortedChildren.length - 1) * padding;

                let currentY = y - totalHeight / 2;

                sortedChildren.forEach((child, index) => {
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

                // ✨ v2.6: Smooth Bezier curved connections
                const controlDistance = Math.abs(endX - startX) * 0.5;

                const cp1x = startX + controlDistance;
                const cp1y = startY;
                const cp2x = endX - controlDistance;
                const cp2y = endY;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);

                // Draw Bezier curve
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

                // ✨ v3.0: WCAG AAA compliant connection lines (3.8:1 contrast)
                const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
                const level = parentPos.level;

                if (level === 0) {
                    // Central node: Rich orange with higher opacity
                    gradient.addColorStop(0, 'rgba(198, 93, 0, 0.9)');
                    gradient.addColorStop(1, 'rgba(220, 105, 0, 0.75)');
                } else if (level === 1) {
                    // Level 1: Medium orange with higher opacity
                    gradient.addColorStop(0, 'rgba(198, 93, 0, 0.75)');
                    gradient.addColorStop(1, 'rgba(220, 105, 0, 0.6)');
                } else {
                    // Deeper levels: Still visible with increased opacity
                    gradient.addColorStop(0, 'rgba(198, 93, 0, 0.6)');
                    gradient.addColorStop(1, 'rgba(220, 105, 0, 0.5)');
                }

                this.ctx.strokeStyle = gradient;

                // ✨ v2.6: Variable line thickness based on hierarchy
                this.ctx.lineWidth = level === 0 ? 3.5 : (level === 1 ? 2.5 : 1.8);

                // ✨ v2.6: Smooth line caps
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';

                this.ctx.stroke();

                // ✨ v2.6: Connection dots on important nodes
                if (level < 2) {
                    this.ctx.beginPath();
                    this.ctx.arc(startX, startY, 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(245, 184, 149, 0.8)';
                    this.ctx.fill();
                }

                // Recursively draw child connections
                drawNodeConnections(child);
            });
        };

        drawNodeConnections(this.nodes);

        // Draw relationship connections
        if (window.mindmapRenderer && window.mindmapRenderer.activeRelationships) {
            const activeRels = Array.from(window.mindmapRenderer.activeRelationships);
            const relationships = window.mindmapRenderer.relationships || [];

            activeRels.forEach(relId => {
                const relationship = relationships.find(r => r.id === relId);
                if (!relationship) return;

                const connectedNodes = relationship.nodes || [];

                // Draw mesh: connect each node to every other node
                for (let i = 0; i < connectedNodes.length; i++) {
                    for (let j = i + 1; j < connectedNodes.length; j++) {
                        const nodeId1 = connectedNodes[i];
                        const nodeId2 = connectedNodes[j];

                        // Use positions from the same system as parent-child connections
                        const pos1 = this.positions[nodeId1];
                        const pos2 = this.positions[nodeId2];

                        if (pos1 && pos2) {
                            // Calculate center points like parent-child connections
                            const width1 = this.getNodeWidth(pos1.level);
                            const width2 = this.getNodeWidth(pos2.level);

                            const x1 = pos1.x + (width1 / 2);
                            const y1 = pos1.y;
                            const x2 = pos2.x + (width2 / 2);
                            const y2 = pos2.y;

                            this.ctx.save();
                            this.ctx.strokeStyle = relationship.color;
                            this.ctx.globalAlpha = 0.4;
                            this.ctx.lineWidth = 2;
                            this.ctx.lineCap = 'round';
                            this.ctx.setLineDash(relationship.dashPattern || []);

                            this.ctx.beginPath();
                            this.ctx.moveTo(x1, y1);
                            this.ctx.lineTo(x2, y2);
                            this.ctx.stroke();

                            this.ctx.restore();
                        }
                    }
                }
            });

            // Reset line dash for normal connections
            this.ctx.setLineDash([]);
        }
    }

    getNodeCenter(nodeElement) {
        const rect = nodeElement.getBoundingClientRect();
        const containerRect = document.getElementById('nodesContainer').getBoundingClientRect();

        // Calculate center position relative to the canvas/container
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
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
                // Create new node with initial state for fade-in animation
                nodeEl = document.createElement('div');
                nodeEl.className = 'node';
                nodeEl.style.position = 'absolute';
                nodeEl.setAttribute('data-node-id', node.id);

                // Set initial state (invisible, scaled down)
                nodeEl.style.opacity = '0';
                nodeEl.style.transform = 'translate(-50%, -50%) scale(0.8)';

                container.appendChild(nodeEl);

                // Trigger fade-in after a frame (expand animation)
                requestAnimationFrame(() => {
                    nodeEl.style.opacity = '1';
                    nodeEl.style.transform = 'translate(-50%, -50%) scale(1)';
                });
            }

            // Update position (will animate if node exists)
            nodeEl.style.left = pos.x + 'px';
            nodeEl.style.top = pos.y + 'px';

            // Ensure transform maintains scale(1) for existing nodes
            if (!isNewNode) {
                nodeEl.style.transform = 'translate(-50%, -50%) scale(1)';
            }

            // Update or create content
            const hasChildren = node.children && node.children.length > 0;
            const levelClass = level === 0 ? 'central' : `level-${level}`;

            let nodeContent = nodeEl.querySelector('.node-content');
            if (!nodeContent || isNewNode) {
                nodeEl.innerHTML = ''; // Clear if recreating
                nodeContent = document.createElement('div');
                nodeContent.className = `node-content ${levelClass}`;
                nodeContent.id = node.id; // Add ID for category styling

                // Double-click for editing (only in edit mode)
                nodeContent.ondblclick = (e) => {
                    e.stopPropagation();
                    if (document.body.dataset.viewMode !== 'presentation') {
                        this.editNode(node.id, node.title);
                    }
                };

                // Right-click context menu (only in edit mode)
                nodeContent.oncontextmenu = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (document.body.dataset.viewMode !== 'presentation') {
                        this.showContextMenu(e, node.id, node.title);
                    }
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
                    <button class="action-btn edit-btn" onclick="mindmapEngine.editNode('${node.id}', '${node.title.replace(/'/g, "\\'")}')" title="Editar">
                        <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="action-btn focus-btn" onclick="mindmapEngine.toggleFocusMode('${node.id}')" title="Modo Enfoque">
                        <i data-lucide="target" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="action-btn info-btn" onclick="mindmapEngine.toggleInfo('${node.id}')" title="Info">
                        <i data-lucide="info" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="action-btn add-btn" onclick="mindmapEngine.addChildNode('${node.id}')" title="Agregar Hijo">
                        <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="mindmapEngine.confirmDeleteNode('${node.id}')" title="Eliminar">
                        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                    </button>
                `;
                nodeContent.appendChild(actionsDiv);

                // Initialize Lucide icons for this node
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => lucide.createIcons({ nameAttr: 'data-lucide' }), 10);
                }

                // Create text span
                const textSpan = document.createElement('span');
                textSpan.className = 'node-text';
                textSpan.textContent = node.title;
                nodeContent.appendChild(textSpan);

                // Add image indicator if node has images
                const nodeDataInfo = this.nodeData[node.id] || {};
                if (nodeDataInfo.images && nodeDataInfo.images.length > 0) {
                    const imageIndicator = document.createElement('span');
                    imageIndicator.className = 'image-indicator';
                    imageIndicator.title = `${nodeDataInfo.images.length} imagen(es)`;
                    imageIndicator.innerHTML = '<i data-lucide="image" style="width: 14px; height: 14px;"></i>';
                    nodeContent.appendChild(imageIndicator);
                }

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

                // Make node draggable for reordering
                this.reorderManager.makeDraggable(nodeEl, node);

                // Extra info panel - Show description + notes + images
                const extraInfo = document.createElement('div');
                extraInfo.className = 'node-extra-info';
                extraInfo.id = `info-${node.id}`;

                const data = this.nodeData[node.id] || {};

                // Add 'active' class if showInfo is true
                if (data.showInfo) {
                    extraInfo.classList.add('active');
                }

                nodeEl.appendChild(extraInfo);

                // Populate info panel content using the new method
                this.updateInfoPanel(node.id);
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
                // Fade out and remove (collapse animation)
                nodeEl.style.opacity = '0';
                nodeEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (nodeEl.parentNode) {
                        nodeEl.parentNode.removeChild(nodeEl);
                    }
                }, 400);
            }
        });

        // Reapply category filters after rendering (will apply styles if filter is active)
        if (window.mindmapRenderer) {
            setTimeout(() => {
                window.mindmapRenderer.applyFilters();
            }, 50);
        }
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

    toggleFocusMode(nodeId) {
        // Toggle focus: if clicking same node, unfocus. Otherwise, focus on new node
        if (this.focusedNodeId === nodeId) {
            // Unfocus all
            this.focusedNodeId = null;
            document.querySelectorAll('.node').forEach(n => {
                n.classList.remove('focused', 'unfocused');
            });
            // Update all focus buttons
            document.querySelectorAll('.focus-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        } else {
            // Focus on this node and its children
            this.focusedNodeId = nodeId;
            const targetNode = this.findNode(nodeId, this.nodes);
            const focusedIds = new Set([nodeId]);

            // Get all descendants
            if (targetNode) {
                this.getAllDescendants(targetNode, focusedIds);
            }

            // Apply focus/unfocus classes
            document.querySelectorAll('.node').forEach(nodeEl => {
                const elNodeId = nodeEl.dataset.nodeId;
                if (focusedIds.has(elNodeId)) {
                    nodeEl.classList.add('focused');
                    nodeEl.classList.remove('unfocused');
                } else {
                    nodeEl.classList.add('unfocused');
                    nodeEl.classList.remove('focused');
                }
            });

            // Update focus buttons
            document.querySelectorAll('.focus-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeFocusBtn = document.querySelector(`[data-node-id="${nodeId}"] .focus-btn`);
            if (activeFocusBtn) {
                activeFocusBtn.classList.add('active');
            }
        }
    }

    getAllDescendants(node, idsSet) {
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                idsSet.add(child.id);
                this.getAllDescendants(child, idsSet);
            });
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

        // Populate relationships selector
        if (window.mindmapRenderer && window.mindmapRenderer.populateNodeRelationshipsSelector) {
            window.mindmapRenderer.populateNodeRelationshipsSelector(nodeId);
        }

        setTimeout(() => {
            modal.classList.add('active');
            overlay.classList.add('active');
        }, 10);
    }

    updateInfoPanel(nodeId) {
        // Find the info panel element
        const infoPanel = document.getElementById(`info-${nodeId}`);
        if (!infoPanel) return;

        // Get node data or default to empty object
        const data = this.nodeData[nodeId] || {};

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

        infoPanel.innerHTML = infoHTML;
    }

    toggleInfo(nodeId) {
        // Initialize nodeData if it doesn't exist
        if (!this.nodeData[nodeId]) {
            this.nodeData[nodeId] = { description: '', notes: '', images: [], showInfo: false };
        }

        // Toggle the showInfo flag
        this.nodeData[nodeId].showInfo = !this.nodeData[nodeId].showInfo;

        // Auto-save nodeData to localStorage for current project
        this.saveNodeDataToStorage();

        // Refresh panel content before toggling visibility
        this.updateInfoPanel(nodeId);

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

        // Note: Position recalculation removed to prevent node movement when toggling info
        // Info panel uses CSS positioning that doesn't affect node layout
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

        // Add categories submenu if categories exist
        this.updateCategoriesSubmenu(menu, nodeId);

        // Add relationships submenu if relationships exist
        this.updateRelationshipsSubmenu(menu, nodeId);

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

    updateCategoriesSubmenu(menu, nodeId) {
        // Check if submenu already exists
        let submenu = menu.querySelector('.categories-submenu');

        if (!submenu) {
            // Create categories menu item with submenu
            const categoriesItem = document.createElement('div');
            categoriesItem.className = 'context-menu-item categories-menu-item';
            categoriesItem.innerHTML = '🏷️ Categorías ►';

            submenu = document.createElement('div');
            submenu.className = 'categories-submenu';
            submenu.style.display = 'none';

            categoriesItem.appendChild(submenu);

            // Insert before delete option
            const deleteItem = menu.querySelector('#contextDelete');
            menu.insertBefore(categoriesItem, deleteItem);

            // Toggle submenu on hover
            categoriesItem.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });

            categoriesItem.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        }

        // Clear and rebuild submenu
        submenu.innerHTML = '';

        if (window.mindmapRenderer && window.mindmapRenderer.categories.length > 0) {
            const nodeData = this.nodeData[nodeId] || {};
            const nodeCategories = nodeData.categories || [];

            window.mindmapRenderer.categories.forEach(category => {
                const item = document.createElement('div');
                item.className = 'category-submenu-item';

                const isAssigned = nodeCategories.includes(category.id);
                const checkbox = isAssigned ? '☑' : '☐';

                item.innerHTML = `
                    ${checkbox} <span style="display:inline-block;width:12px;height:12px;background:${category.color};border-radius:2px;margin-right:4px;"></span>
                    ${category.icon ? category.icon + ' ' : ''}${category.name}
                `;

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.mindmapRenderer) {
                        window.mindmapRenderer.assignCategoryToNode(nodeId, category.id);
                    }
                    this.updateCategoriesSubmenu(menu, nodeId);
                });

                submenu.appendChild(item);
            });
        } else {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'category-submenu-item disabled';
            emptyItem.textContent = 'No hay categorías';
            emptyItem.style.fontStyle = 'italic';
            emptyItem.style.opacity = '0.5';
            submenu.appendChild(emptyItem);
        }
    }

    updateRelationshipsSubmenu(menu, nodeId) {
        // Check if submenu already exists
        let submenu = menu.querySelector('.relationships-submenu');

        if (!submenu) {
            // Create relationships menu item with submenu
            const relationshipsItem = document.createElement('div');
            relationshipsItem.className = 'context-menu-item relationships-menu-item';
            relationshipsItem.innerHTML = '🔗 Relaciones ►';

            submenu = document.createElement('div');
            submenu.className = 'relationships-submenu';
            submenu.style.display = 'none';

            relationshipsItem.appendChild(submenu);

            // Insert before delete option
            const deleteItem = menu.querySelector('#contextDelete');
            menu.insertBefore(relationshipsItem, deleteItem);

            // Toggle submenu on hover
            relationshipsItem.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });

            relationshipsItem.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        }

        // Clear and rebuild submenu
        submenu.innerHTML = '';

        if (window.mindmapRenderer && window.mindmapRenderer.relationships.length > 0) {
            const nodeData = this.nodeData[nodeId] || {};
            const nodeRelationships = nodeData.relationships || [];

            window.mindmapRenderer.relationships.forEach(relationship => {
                const item = document.createElement('div');
                item.className = 'relationship-submenu-item';

                const isAssigned = nodeRelationships.includes(relationship.id);
                const checkbox = isAssigned ? '☑' : '☐';

                // Show line preview with dash pattern
                const dashPattern = relationship.dashPattern || [];
                const dashPatternStr = dashPattern.length > 0 ? dashPattern.join(',') : '';

                item.innerHTML = `
                    ${checkbox}
                    <svg width="16" height="12" style="display:inline-block;vertical-align:middle;margin-right:4px;">
                        <line x1="0" y1="6" x2="16" y2="6"
                              stroke="${relationship.color}"
                              stroke-width="2"
                              stroke-dasharray="${dashPatternStr}"/>
                    </svg>
                    ${relationship.name}
                `;

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.mindmapRenderer) {
                        window.mindmapRenderer.assignRelationshipToNode(nodeId, relationship.id);
                    }
                    this.updateRelationshipsSubmenu(menu, nodeId);
                });

                submenu.appendChild(item);
            });
        } else {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'relationship-submenu-item disabled';
            emptyItem.textContent = 'No hay relaciones';
            emptyItem.style.fontStyle = 'italic';
            emptyItem.style.opacity = '0.5';
            submenu.appendChild(emptyItem);
        }
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

    confirmDeleteNode(nodeId) {
        const node = this.findNode(nodeId, this.nodes);
        if (!node) return;

        const hasChildren = node.children && node.children.length > 0;
        const message = hasChildren
            ? `¿Eliminar "${node.title}" y todos sus nodos hijos?`
            : `¿Eliminar "${node.title}"?`;

        if (confirm(message)) {
            this.deleteNode(nodeId);
        }
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
            // Auto-save after deletion
            this.saveNodeDataToStorage();
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

        // Save relationships
        const selectedRelationships = [];
        const relCheckboxes = document.querySelectorAll('#nodeRelationshipsSelector input[type="checkbox"]:checked');
        relCheckboxes.forEach(cb => selectedRelationships.push(cb.value));

        if (!this.nodeData[nodeId]) {
            this.nodeData[nodeId] = {};
        }
        this.nodeData[nodeId].relationships = selectedRelationships;

        // Update relationship objects to include this node
        if (window.mindmapRenderer && window.mindmapRenderer.relationships) {
            window.mindmapRenderer.relationships.forEach(rel => {
                if (selectedRelationships.includes(rel.id)) {
                    if (!rel.nodes) rel.nodes = [];
                    if (!rel.nodes.includes(nodeId)) {
                        rel.nodes.push(nodeId);
                    }
                } else {
                    if (rel.nodes) {
                        rel.nodes = rel.nodes.filter(id => id !== nodeId);
                    }
                }
            });
            window.mindmapRenderer.saveRelationships();
        }

        // Auto-save nodeData to localStorage for current project
        this.saveNodeDataToStorage();

        this.renderNodes(this.nodes);

        // Redraw connections if any relationships are active
        if (window.mindmapRenderer && window.mindmapRenderer.activeRelationships && window.mindmapRenderer.activeRelationships.size > 0) {
            this.drawConnections();
        }

        // Close modal
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }

    saveNodeDataToStorage() {
        // Save to localStorage with current project ID
        if (window.mindmapRenderer && window.mindmapRenderer.currentProject) {
            localStorage.setItem(
                `mindmap-nodedata-${window.mindmapRenderer.currentProject}`,
                JSON.stringify(this.nodeData)
            );
        }
    }

    setupImageLightbox() {
        const overlay = document.getElementById('lightboxOverlay');
        const closeBtn = document.getElementById('lightboxClose');
        const lightboxImage = document.getElementById('lightboxImage');

        if (!overlay || !closeBtn || !lightboxImage) return;

        // Close lightbox function
        const closeLightbox = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 300);
        };

        // Event delegation for dynamically created images
        document.addEventListener('click', (e) => {
            if (e.target.matches('.info-images img')) {
                e.stopPropagation();
                const imgSrc = e.target.src;
                lightboxImage.src = imgSrc;
                overlay.classList.add('active');
                setTimeout(() => {
                    overlay.classList.add('show');
                }, 10);
            }
        });

        // Close on X button click
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        // Close on overlay click (not image)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeLightbox();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
}

// Create global instance
window.mindmapEngine = new MindmapEngine();