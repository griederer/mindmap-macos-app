// Renderer Process - UI Logic and Event Handling
class MindmapRenderer {
    constructor() {
        this.panelVisible = true;
        this.scale = 1.0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };
        this.isSpacePressed = false;

        this.init();
        this.setupEventListeners();
        this.setupElectronIntegration();
    }

    init() {
        // Initialize with sample data
        this.generateMindmap();

        // Reset view
        setTimeout(() => {
            this.resetView();
        }, 100);
    }

    setupEventListeners() {
        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target);
        });

        // Button events
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateMindmap();
        });

        document.getElementById('expandAllBtn').addEventListener('click', () => {
            window.mindmapEngine.expandAll();
        });

        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            window.mindmapEngine.collapseAll();
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetView();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('togglePanelBtn').addEventListener('click', () => {
            this.togglePanel();
        });

        // Modal events
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveNodeBtn').addEventListener('click', () => {
            window.mindmapEngine.saveNodeData();
        });

        document.getElementById('closeShortcutsBtn').addEventListener('click', () => {
            this.closeShortcuts();
        });

        // Image upload
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e.target);
        });

        // Context menu events
        document.getElementById('contextEdit').addEventListener('click', () => {
            if (window.contextNodeId && window.contextNodeTitle) {
                window.mindmapEngine.editNode(window.contextNodeId, window.contextNodeTitle);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextToggleInfo').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.toggleInfo(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextToggleChildren').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.toggleNode(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextAddChild').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.addChildNode(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextDelete').addEventListener('click', () => {
            if (window.contextNodeId) {
                if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                    window.mindmapEngine.deleteNode(window.contextNodeId);
                }
            }
            this.hideContextMenu();
        });

        // Keyboard events
        this.setupKeyboardShortcuts();

        // Drag and zoom functionality
        this.setupMindmapInteraction();

        // Prevent context menu on mindmap
        document.getElementById('mindmapContainer').addEventListener('contextmenu', (e) => {
            if (e.target.id === 'mindmapContainer' || e.target.classList.contains('mindmap-wrapper')) {
                e.preventDefault();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Track space key for pan mode
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.isSpacePressed = true;
                document.getElementById('mindmapContainer').style.cursor = 'grab';
            }

            // Global shortcuts
            if (e.metaKey || e.ctrlKey) {
                switch (e.code) {
                    case 'KeyN':
                        e.preventDefault();
                        this.newMindmap();
                        break;
                    case 'KeyS':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.saveFileAs();
                        } else {
                            this.saveFile();
                        }
                        break;
                    case 'KeyO':
                        e.preventDefault();
                        this.openFile();
                        break;
                    case 'KeyF':
                        e.preventDefault();
                        this.showFind();
                        break;
                    case 'Equal': // Cmd/Ctrl + =
                    case 'NumpadAdd':
                        e.preventDefault();
                        this.zoomIn();
                        break;
                    case 'Minus':
                    case 'NumpadSubtract':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                    case 'Digit0':
                    case 'Numpad0':
                        e.preventDefault();
                        this.resetZoom();
                        break;
                    case 'Backslash':
                        e.preventDefault();
                        this.togglePanel();
                        break;
                    case 'KeyI':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.toggleInfo(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.editNode(window.mindmapEngine.selectedNode, 'Selected Node');
                        }
                        break;
                }

                // Expand/Collapse with Shift
                if (e.shiftKey) {
                    switch (e.code) {
                        case 'KeyE':
                            e.preventDefault();
                            window.mindmapEngine.expandAll();
                            break;
                        case 'KeyC':
                            e.preventDefault();
                            window.mindmapEngine.collapseAll();
                            break;
                    }
                }
            }

            // Node manipulation (without Cmd/Ctrl)
            if (!e.metaKey && !e.ctrlKey) {
                switch (e.code) {
                    case 'Tab':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.addChildNode(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        // Add sibling node (would need parent reference)
                        break;
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                                window.mindmapEngine.deleteNode(window.mindmapEngine.selectedNode);
                            }
                        }
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = false;
                document.getElementById('mindmapContainer').style.cursor = 'grab';
            }
        });
    }

    setupMindmapInteraction() {
        const container = document.getElementById('mindmapContainer');
        const wrapper = document.getElementById('mindmapWrapper');

        // Zoom with mouse wheel
        container.addEventListener('wheel', (e) => {
            if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? 0.95 : 1.05;
                this.scale *= delta;
                this.scale = Math.min(Math.max(this.scale, 0.3), 3);

                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                wrapper.style.transformOrigin = `${x}px ${y}px`;
                wrapper.style.transform = `scale(${this.scale})`;
            }
        });

        // Mouse drag to pan
        container.addEventListener('mousedown', (e) => {
            if (this.isSpacePressed || e.target === container ||
                e.target.classList.contains('mindmap-wrapper') ||
                e.target.classList.contains('mindmap-nodes')) {
                this.isDragging = true;
                container.style.cursor = 'grabbing';
                this.dragStart.x = e.pageX;
                this.dragStart.y = e.pageY;
                this.dragStart.scrollLeft = container.scrollLeft;
                this.dragStart.scrollTop = container.scrollTop;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const x = e.pageX - this.dragStart.x;
                const y = e.pageY - this.dragStart.y;
                container.scrollLeft = this.dragStart.scrollLeft - x * 1.5;
                container.scrollTop = this.dragStart.scrollTop - y * 1.5;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                container.style.cursor = this.isSpacePressed ? 'grab' : 'grab';
            }
        });
    }

    setupElectronIntegration() {
        if (window.electronAPI) {
            window.electronAPI.onMenuAction((action, data) => {
                switch (action) {
                    case 'menu-new':
                        this.newMindmap();
                        break;
                    case 'menu-save':
                        this.saveFile();
                        break;
                    case 'menu-export-image':
                        this.exportImage();
                        break;
                    case 'menu-export-json':
                        this.exportData();
                        break;
                    case 'menu-find':
                        this.showFind();
                        break;
                    case 'menu-zoom-in':
                        this.zoomIn();
                        break;
                    case 'menu-zoom-out':
                        this.zoomOut();
                        break;
                    case 'menu-zoom-reset':
                        this.resetZoom();
                        break;
                    case 'menu-expand-all':
                        window.mindmapEngine.expandAll();
                        break;
                    case 'menu-collapse-all':
                        window.mindmapEngine.collapseAll();
                        break;
                    case 'menu-toggle-sidebar':
                        this.togglePanel();
                        break;
                    case 'menu-add-child':
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.addChildNode(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'menu-edit-node':
                        if (window.mindmapEngine.selectedNode) {
                            const node = window.mindmapEngine.findNode(window.mindmapEngine.selectedNode, window.mindmapEngine.nodes);
                            if (node) {
                                window.mindmapEngine.editNode(window.mindmapEngine.selectedNode, node.title);
                            }
                        }
                        break;
                    case 'menu-delete-node':
                        if (window.mindmapEngine.selectedNode) {
                            if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                                window.mindmapEngine.deleteNode(window.mindmapEngine.selectedNode);
                            }
                        }
                        break;
                    case 'menu-toggle-info':
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.toggleInfo(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'show-preferences':
                        this.showPreferences();
                        break;
                    case 'show-shortcuts':
                        this.showShortcuts();
                        break;
                    case 'file-opened':
                        this.loadFileContent(data);
                        break;
                    case 'save-file-as':
                        this.saveFileAs(data);
                        break;
                }
            });
        }
    }

    generateMindmap() {
        const input = document.getElementById('outlineInput').value;
        if (!input.trim()) {
            alert('Por favor ingresa un esquema');
            return;
        }

        window.mindmapEngine.nodeData = {};
        const root = window.mindmapEngine.parseOutline(input);
        window.mindmapEngine.renderNodes(root);
    }

    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('outlineInput').value = content;
            this.generateMindmap();
        };
        reader.readAsText(file);
        input.value = ''; // Reset input
    }

    handleImageUpload(input) {
        if (input.files && window.currentEditingNode) {
            Array.from(input.files).forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert('Solo se permiten archivos de imagen');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert('El tamaño de la imagen debe ser menor a 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!window.mindmapEngine.nodeData[window.currentEditingNode]) {
                        window.mindmapEngine.nodeData[window.currentEditingNode] = { notes: '', images: [], showInfo: false };
                    }
                    if (!window.mindmapEngine.nodeData[window.currentEditingNode].images) {
                        window.mindmapEngine.nodeData[window.currentEditingNode].images = [];
                    }

                    if (e.target.result && e.target.result.startsWith('data:image')) {
                        window.mindmapEngine.nodeData[window.currentEditingNode].images.push(e.target.result);
                        const node = window.mindmapEngine.findNode(window.currentEditingNode, window.mindmapEngine.nodes);
                        if (node) {
                            window.mindmapEngine.editNode(window.currentEditingNode, node.title);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        input.value = ''; // Reset input
    }

    togglePanel() {
        const panel = document.getElementById('inputPanel');
        const btn = document.getElementById('togglePanelBtn');
        this.panelVisible = !this.panelVisible;

        if (this.panelVisible) {
            panel.classList.remove('collapsed');
            btn.classList.remove('panel-hidden');
            btn.innerHTML = '◀';
            btn.style.left = '320px';
        } else {
            panel.classList.add('collapsed');
            btn.classList.add('panel-hidden');
            btn.innerHTML = '▶';
            btn.style.left = '0';
        }
    }

    resetView() {
        const wrapper = document.getElementById('mindmapWrapper');
        const container = document.getElementById('mindmapContainer');
        this.scale = 1.0;
        wrapper.style.transform = `scale(${this.scale})`;
        wrapper.style.transformOrigin = '250px 600px';
        container.scrollTo(0, 400);
    }

    zoomIn() {
        this.scale *= 1.2;
        this.scale = Math.min(this.scale, 3);
        document.getElementById('mindmapWrapper').style.transform = `scale(${this.scale})`;
    }

    zoomOut() {
        this.scale *= 0.8;
        this.scale = Math.max(this.scale, 0.3);
        document.getElementById('mindmapWrapper').style.transform = `scale(${this.scale})`;
    }

    resetZoom() {
        this.scale = 1.0;
        document.getElementById('mindmapWrapper').style.transform = `scale(${this.scale})`;
    }

    exportData() {
        const exportObj = window.mindmapEngine.exportData();
        const dataStr = JSON.stringify(exportObj, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `mindmap-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportImage() {
        // Create a temporary canvas for export
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size (you might want to adjust this based on your mindmap size)
        canvas.width = 2000;
        canvas.height = 1500;

        // Draw background
        ctx.fillStyle = '#fafaf8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // This is a simplified export - you'd need to implement proper node rendering to canvas
        alert('Exportación de imagen en desarrollo. Por ahora usa la captura de pantalla del sistema.');
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }

    hideContextMenu() {
        document.getElementById('contextMenu').classList.remove('active');
    }

    showShortcuts() {
        document.getElementById('shortcutsModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }

    closeShortcuts() {
        document.getElementById('shortcutsModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }

    newMindmap() {
        if (confirm('¿Crear un nuevo mapa mental? Se perderán los cambios no guardados.')) {
            document.getElementById('outlineInput').value = '';
            window.mindmapEngine.nodeData = {};
            // Set default content
            document.getElementById('outlineInput').value = `Nuevo Mapa Mental
1. Idea Principal
* Subtema 1
* Subtema 2
2. Segunda Idea
* Desarrollo
* Conclusiones`;
            this.generateMindmap();
        }
    }

    saveFile() {
        if (window.electronAPI) {
            const data = window.mindmapEngine.exportData();
            // This would need to be implemented with proper file dialog
            console.log('Save file functionality would go here');
        }
    }

    saveFileAs() {
        if (window.electronAPI) {
            const data = window.mindmapEngine.exportData();
            // This would trigger the save dialog from main process
            console.log('Save as functionality would go here');
        }
    }

    openFile() {
        // Trigger file open dialog
        document.getElementById('fileInput').click();
    }

    loadFileContent(data) {
        try {
            if (data.path.endsWith('.json') || data.path.endsWith('.pmap')) {
                const parsed = JSON.parse(data.content);
                if (parsed.nodes) {
                    window.mindmapEngine.importData(parsed);
                } else {
                    throw new Error('Invalid mindmap file format');
                }
            } else {
                document.getElementById('outlineInput').value = data.content;
                this.generateMindmap();
            }
        } catch (error) {
            alert(`Error al cargar el archivo: ${error.message}`);
        }
    }

    showFind() {
        const searchTerm = prompt('Buscar nodo:');
        if (searchTerm) {
            this.findAndHighlightNode(searchTerm);
        }
    }

    findAndHighlightNode(searchTerm) {
        const nodes = document.querySelectorAll('.node-text');
        nodes.forEach(node => {
            if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                node.parentElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                node.parentElement.style.border = '3px solid #DC6900';
                setTimeout(() => {
                    node.parentElement.style.border = '';
                }, 3000);
            }
        });
    }

    showPreferences() {
        alert('Panel de preferencias en desarrollo');
    }
}

// Initialize renderer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mindmapRenderer = new MindmapRenderer();
});