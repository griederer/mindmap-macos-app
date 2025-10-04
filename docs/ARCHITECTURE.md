# Arquitectura - PWC Mindmap MacOS App

## 📐 Visión General

La aplicación está construida con **arquitectura de estado centralizado** usando el patrón Manager/Coordinator, similar a Redux pero más ligero y específico para el dominio de mindmaps.

```
┌─────────────────────────────────────────────────────────────┐
│                       RENDERER (UI)                          │
│  - MindmapRenderer class                                     │
│  - Event handlers                                            │
│  - DOM manipulation                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MANAGER COORDINATOR                         │
│  - Unified API for all state operations                     │
│  - Coordinates between all managers                          │
│  - Single source of truth                                    │
└─────┬──────────┬──────────┬──────────┬─────────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│  State  │ │ Category │ │Relation │ │  Image   │
│ Manager │ │ Manager  │ │ Manager │ │ Manager  │
└─────────┘ └──────────┘ └─────────┘ └──────────┘
      │          │          │          │
      └──────────┴──────────┴──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Project File │
              │   (.pmap)    │
              └──────────────┘
```

## 🏗️ Componentes Principales

### 1. ManagerCoordinator

**Ubicación**: `src/managers/manager-integration.js`

**Responsabilidades**:
- Inicializa todos los managers
- Proporciona API unificada para el renderer
- Coordina operaciones entre managers
- Sincroniza estado entre managers

**API Principal**:
```javascript
const coordinator = new ManagerCoordinator();

// State operations
coordinator.loadProject(projectData, projectPath);
coordinator.getState();
coordinator.updateState({ content: '...' });
coordinator.exportForSave();
coordinator.undo() / redo();

// Category operations
coordinator.createCategory(name, color);
coordinator.assignCategoryToNode(categoryId, nodeId);
coordinator.getAllCategories();

// Relationship operations
coordinator.createRelationship(name, color, dashPattern);
coordinator.connectNodes(fromNodeId, toNodeId, relationshipId);
coordinator.getAllConnections();

// Image operations
coordinator.addImageToNode(nodeId, imageData);
coordinator.getNodeImages(nodeId);

// Focus & Selection
coordinator.setFocusedNode(nodeId);
coordinator.setSelectedNode(nodeId);
```

### 2. StateManager

**Ubicación**: `src/managers/state-manager.js`

**Responsabilidades**:
- Gestiona estado inmutable de la aplicación
- Implementa undo/redo con historial
- Notifica cambios a subscriptores
- Maneja carga/guardado de proyectos

**Características**:
- ✅ Estado inmutable (shallow copy en cada update)
- ✅ History tracking (50 estados máximo)
- ✅ Subscriber pattern para reactive updates
- ✅ isDirty flag para cambios no guardados

**TypeScript Types** (via JSDoc):
```javascript
/**
 * @typedef {Object} MindmapState
 * @property {string|null} currentProject
 * @property {string|null} projectPath
 * @property {string} content - Markdown content
 * @property {Object.<string, any>} nodes - Node data by ID
 * @property {Category[]} categories
 * @property {Relationship[]} relationships
 * @property {Connection[]} connections
 * @property {string|null} focusedNodeId
 * @property {string|null} selectedNodeId
 * @property {Object.<string, number>} customOrders
 * @property {Object.<string, {x: number, y: number}>} customPositions
 * @property {Object.<string, any>} metadata
 * @property {boolean} isDirty
 */
```

### 3. CategoryManager

**Ubicación**: `src/managers/category-manager.js`

**Responsabilidades**:
- CRUD operations para categorías
- Asignación de categorías a nodos
- Tracking de nodos por categoría

**Data Structure**:
```javascript
Category {
  id: string,          // e.g., "cat-1234567890-0"
  name: string,        // e.g., "Important"
  color: string,       // e.g., "#ff6b6b"
  nodeIds: string[]    // e.g., ["node-0", "node-3"]
}
```

### 4. RelationshipManager

**Ubicación**: `src/managers/relationship-manager.js`

**Responsabilidades**:
- CRUD operations para tipos de relaciones
- Gestión de conexiones entre nodos
- Tracking bidireccional de relaciones

**Data Structures**:
```javascript
Relationship {
  id: string,          // e.g., "rel-1234567890-0"
  name: string,        // e.g., "depends on"
  color: string,       // e.g., "#4dabf7"
  dashPattern: string  // SVG dash pattern, e.g., "5,5"
}

Connection {
  id: string,           // e.g., "conn-1234567890-0"
  fromNodeId: string,   // e.g., "node-0"
  toNodeId: string,     // e.g., "node-1"
  relationshipId: string // e.g., "rel-1234567890-0"
}
```

### 5. ImageManager

**Ubicación**: `src/managers/image-manager.js`

**Responsabilidades**:
- Gestión de imágenes adjuntas a nodos
- Soporte para base64 y URLs
- Conversión URL → base64

**Data Structure**:
```javascript
NodeImagesMap {
  "node-0": [
    "data:image/jpeg;base64,/9j/4AAQ...",
    "https://example.com/image.jpg"
  ],
  "node-1": [...]
}
```

## 🔄 Flujo de Datos

### Carga de Proyecto

```
1. User clicks "Open Project"
         ↓
2. Renderer calls: coordinator.loadProject(data, path)
         ↓
3. ManagerCoordinator:
   - StateManager.loadProject() → sets state
   - Triggers subscriber notifications
         ↓
4. Managers auto-sync via subscribers:
   - CategoryManager.loadCategories()
   - RelationshipManager.loadData()
   - ImageManager.loadFromNodeData()
         ↓
5. Renderer receives state change notification
         ↓
6. UI updates to reflect new project
```

### Modificación de Estado

```
1. User makes change (e.g., adds category)
         ↓
2. Renderer calls: coordinator.createCategory(name, color)
         ↓
3. ManagerCoordinator:
   - CategoryManager.createCategory() → creates category
   - StateManager.addCategory(category) → updates state
   - History recorded for undo/redo
         ↓
4. StateManager notifies all subscribers
         ↓
5. Renderer updates UI with new category
```

### Guardado de Proyecto

```
1. User clicks "Save"
         ↓
2. Renderer calls: coordinator.exportForSave()
         ↓
3. ManagerCoordinator collects data from all managers:
   - StateManager.exportForSave() → base state
   - CategoryManager.exportCategories() → categories
   - RelationshipManager.exportData() → relationships + connections
   - ImageManager enriches nodes with images
         ↓
4. Returns unified project data object
         ↓
5. Renderer saves to .pmap file
         ↓
6. coordinator.markSaved() → clears isDirty flag
```

## 🎯 Patrones de Diseño Aplicados

### 1. **Facade Pattern** (ManagerCoordinator)
- Simplifica API compleja de múltiples managers
- Oculta complejidad de coordinación
- Punto de entrada único para el renderer

### 2. **Observer Pattern** (StateManager subscribers)
- Reactive updates cuando el estado cambia
- Desacoplamiento entre managers y UI
- Múltiples observadores pueden reaccionar al mismo cambio

### 3. **Command Pattern** (Undo/Redo)
- Cada cambio de estado es un "comando"
- Historial de comandos para undo/redo
- Estados inmutables permiten time-travel

### 4. **Manager Pattern**
- Separación de responsabilidades por dominio
- Cada manager gestiona una sola preocupación
- Fácil de testear y mantener

## 📦 Formato de Archivo (.pmap)

```json
{
  "name": "Project Name",
  "content": "Markdown representation of nodes",
  "nodes": {
    "node-0": {
      "description": "...",
      "notes": "...",
      "images": ["data:image/jpeg;base64,..."],
      "showInfo": false
    }
  },
  "categories": [
    {
      "id": "cat-123-0",
      "name": "Important",
      "color": "#ff6b6b",
      "nodeIds": ["node-0", "node-3"]
    }
  ],
  "relationships": [
    {
      "id": "rel-123-0",
      "name": "depends on",
      "color": "#4dabf7",
      "dashPattern": "5,5"
    }
  ],
  "connections": [
    {
      "id": "conn-123-0",
      "fromNodeId": "node-0",
      "toNodeId": "node-1",
      "relationshipId": "rel-123-0"
    }
  ],
  "customOrders": {
    "node-0": 1,
    "node-1": 0
  },
  "customPositions": {
    "node-0": { "x": 100, "y": 200 }
  },
  "focusedNodeId": "node-0",
  "metadata": {
    "created": "2025-10-03T...",
    "modified": "2025-10-03T...",
    "version": "2.0"
  }
}
```

## 🔧 Integración con MCP Server

El MCP server (`mcp-server/index.js`) lee y escribe archivos `.pmap` directamente, sin usar los managers (ya que corre en proceso separado de Node.js).

**19 MCP Tools disponibles**:

### Project Management (4 tools)
- `create_mindmap` - Crear nuevo proyecto
- `list_projects` - Listar proyectos
- `get_project_data` - Obtener datos de proyecto
- `delete_project` - Eliminar proyecto

### Node Operations (5 tools)
- `add_node` - Agregar nodo
- `update_node` - Actualizar nodo
- `delete_node` - Eliminar nodo
- `get_node_children` - Obtener hijos de nodo
- `reorder_nodes` - Reordenar nodos

### Category Management (2 tools) **NEW in Phase 2**
- `create_category` - Crear categoría
- `assign_category` - Asignar categoría a nodo

### Relationship Management (2 tools) **NEW in Phase 2**
- `create_relationship` - Crear tipo de relación
- `connect_nodes` - Conectar dos nodos

### Image Operations (2 tools)
- `search_images` - Buscar imágenes en Unsplash
- `add_image_to_node` - Agregar imagen a nodo

### Layout Control (2 tools) **NEW in Phase 2**
- `set_focus_mode` - Establecer modo focus
- `set_node_position` - Posición personalizada

### Advanced Operations (1 tool)
- `update_node_notes` - Actualizar notas de nodo

## 🧪 Testing

**Test Coverage**:
- ✅ 36/36 MCP tests passing
- ✅ 23 original tests
- ✅ 13 new tests for Phase 2 tools
- ✅ 100% success rate

**Test Files**:
- `mcp-server/__tests__/index.test.js` - MCP server tests

## 🚀 Próximos Pasos

### Fase 5: Renderer Refactoring (Pendiente)
- Actualizar renderer para usar ManagerCoordinator
- Migrar lógica de categorías a managers
- Migrar lógica de relaciones a managers
- Migrar lógica de imágenes a managers

### Fase 6: Tests de Integración (Pendiente)
- Tests para ManagerCoordinator
- Tests para sincronización entre managers
- Tests de UI con managers

### Fase 7: Performance Optimization (Pendiente)
- Memoización de operaciones costosas
- Lazy loading de imágenes
- Virtual scrolling para nodos grandes

## 📚 Referencias

- **Patrón Manager**: Similar a Store en Flux/Redux
- **Estado Inmutable**: Inspirado en React/Redux
- **Observer Pattern**: Implementación similar a EventEmitter
- **Command Pattern**: Similar a Redux actions con undo/redo

## 🎓 Convenciones de Código

### Naming Conventions
- **Managers**: `XxxManager` (e.g., `StateManager`)
- **Node IDs**: `node-${lineIndex}` (e.g., `node-0`)
- **Category IDs**: `cat-${timestamp}-${counter}` (e.g., `cat-1234567890-0`)
- **Relationship IDs**: `rel-${timestamp}-${counter}`
- **Connection IDs**: `conn-${timestamp}-${counter}`)

### File Organization
```
mindmap-macos-app/
├── src/
│   └── managers/           # Manager classes
│       ├── state-manager.js
│       ├── category-manager.js
│       ├── relationship-manager.js
│       ├── image-manager.js
│       └── manager-integration.js
├── mcp-server/             # MCP integration
│   ├── index.js
│   └── __tests__/
├── docs/                   # Documentation
│   └── ARCHITECTURE.md     # This file
├── renderer.js             # UI logic (to be refactored)
├── main.js                 # Electron main process
└── index.html              # App HTML
```

## 💡 Decisiones de Arquitectura

### ¿Por qué Managers en lugar de Redux?

1. **Simplicidad**: Redux es overhead para una app Electron
2. **Type Safety**: JSDoc proporciona tipos sin TypeScript
3. **Dominio Específico**: Managers modelan el dominio directamente
4. **Sin Dependencias**: No necesitamos librerías externas

### ¿Por qué Estado Inmutable?

1. **Undo/Redo**: Historial de estados es trivial
2. **Debugging**: Fácil ver qué cambió
3. **Reactive Updates**: Detección de cambios confiable
4. **Time Travel**: Podemos volver a estados anteriores

### ¿Por qué Subscriber Pattern?

1. **Desacoplamiento**: Managers no conocen al renderer
2. **Extensibilidad**: Fácil agregar nuevos observadores
3. **Performance**: Solo se notifica cuando hay cambios
4. **Testabilidad**: Fácil mockear subscribers

---

**Versión**: 2.0
**Última Actualización**: 2025-10-03
**Autor**: Arquitectura implementada con Claude Code
