# PWC Mindmap Pro - MCP Server Design

## 1. Executive Summary

Este documento detalla el diseño completo de un MCP (Model Context Protocol) server para PWC Mindmap Pro, permitiendo a Claude Code controlar la aplicación directamente mediante comandos naturales.

### Casos de Uso Objetivo

```
Usuario: "Crear mindmap sobre el espacio con 2 nodos: planetas y lunas"
Claude Code → MCP → App: Crea mindmap, agrega nodos, busca imágenes, las agrega

Usuario: "Reordenar los nodos para que lunas aparezca primero"
Claude Code → MCP → App: Reordena los nodos

Usuario: "Crear una categoría 'astronomía' y asignarla a ambos nodos"
Claude Code → MCP → App: Crea categoría y la asigna
```

---

## 2. Arquitectura de la Aplicación Actual

### 2.1 Estructura de Datos

#### Proyecto (.pmap file)
```json
{
  "name": "Nombre del Proyecto",
  "content": "Texto indentado que se parsea a nodos",
  "nodes": {
    "node-0": {
      "description": "Descripción del nodo",
      "notes": "Notas adicionales",
      "images": ["data:image/png;base64,..."],
      "showInfo": false,
      "categories": ["cat-123", "cat-456"],
      "relationships": ["rel-789"]
    }
  },
  "categories": [
    {
      "id": "cat-123",
      "name": "Categoría 1",
      "color": "#FF5733",
      "icon": "star"
    }
  ],
  "relationships": [
    {
      "id": "rel-123",
      "from": "node-0",
      "to": "node-5",
      "type": "relacionado",
      "color": "#3498db"
    }
  ],
  "customOrders": {
    "node-0": {
      "node-1": 0,
      "node-2": 1
    }
  },
  "metadata": {
    "created": "2025-01-01T00:00:00.000Z",
    "modified": "2025-01-01T00:00:00.000Z",
    "version": "1.0"
  }
}
```

#### Formato de Content (texto indentado)
```
Título Root | Descripción del root
1. Nodo Nivel 1 | Descripción nivel 1
* Nodo Nivel 2 | Descripción nivel 2
   * Nodo Nivel 3 | Descripción nivel 3
2. Otro Nodo Nivel 1
* Subtema
```

**Reglas de parsing**:
- Primera línea = root node
- `|` separa título de descripción
- `1.`, `2.`, etc. = nivel 1
- `*` o `-` = nivel 2+
- Indentación (3 espacios) = niveles adicionales

#### Nodos Estructurados (generados por parseOutline)
```javascript
{
  id: "node-0",
  title: "Título del nodo",
  description: "Descripción inline",
  children: [...],
  level: 0,
  expanded: false
}
```

### 2.2 APIs Disponibles

#### IPC Handlers (main.js)
```javascript
// ProjectManager operations
ipcMain.handle('pm-create-project', async (event, { projectName, template }) => {...})
ipcMain.handle('pm-load-project', async (event, { projectPath }) => {...})
ipcMain.handle('pm-save-project', async (event, { projectPath, projectData }) => {...})
ipcMain.handle('pm-list-projects', async () => {...})
ipcMain.handle('pm-get-recent-projects', async (event, { limit }) => {...})
ipcMain.handle('pm-delete-project', async (event, { projectPath, moveToArchive }) => {...})
ipcMain.handle('pm-export-project', async (event, { projectPath, exportPath, format }) => {...})
ipcMain.handle('pm-import-project', async (event, { sourcePath, projectName }) => {...})
```

#### Renderer Methods (mindmapEngine)
```javascript
parseOutline(text)              // Parsea texto a estructura de nodos
renderNodes(root)               // Renderiza nodos en canvas
editNode(nodeId, nodeTitle)     // Abre modal de edición
updateInfoPanel(nodeId)         // Actualiza panel de info
findNode(nodeId, root)          // Busca nodo por ID
reorderManager.reorderNodes()   // Reordena nodos
```

#### Renderer Methods (mindmapRenderer)
```javascript
loadProject(projectId)          // Carga proyecto
saveProjects()                  // Guarda proyectos
addNewProject()                 // Crea proyecto nuevo
generateMindmap()               // Parsea content → renderiza
categories.push({...})          // Agrega categoría
relationships.push({...})       // Agrega relación
assignCategoryToNode()          // Asigna categoría a nodo
assignRelationshipToNode()      // Asigna relación a nodo
```

---

## 3. Diseño del MCP Server

### 3.1 Arquitectura

```
Claude Code (MCP Client)
       ↓
MCP Server (Node.js)
       ↓
File System (~/Documents/PWC Mindmaps/*.pmap)
       ↓
PWC Mindmap App (lee archivos al abrirlos)
```

**Enfoque**: El MCP server manipulará los archivos .pmap directamente (JSON), y la app los cargará cuando el usuario los abra.

### 3.2 Ubicación del Código

```
/Users/gonzaloriederer/.claude-mcp-servers/
└── pwc-mindmap-mcp/
    ├── package.json
    ├── index.js              # MCP server principal
    ├── lib/
    │   ├── mindmap.js        # Lógica de manipulación de mindmaps
    │   ├── images.js         # Búsqueda/descarga de imágenes
    │   └── parser.js         # Parsing/generación de content text
    └── README.md
```

**Configuración en Claude Code**: `~/.claude-code/config.json`
```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/Users/gonzaloriederer/.claude-mcp-servers/pwc-mindmap-mcp/index.js"]
    }
  }
}
```

---

## 4. Herramientas MCP

### 4.1 create_mindmap
**Descripción**: Crea un nuevo mindmap con nodos iniciales

**Parámetros**:
```typescript
{
  name: string,              // Nombre del proyecto
  topic: string,             // Tema principal (root)
  description?: string,      // Descripción del root
  nodes?: Array<{            // Nodos iniciales
    title: string,
    description?: string,
    level: number,           // 1, 2, 3... (profundidad)
    parent?: string          // Título del padre (opcional)
  }>
}
```

**Retorno**:
```json
{
  "success": true,
  "projectPath": "/Users/.../PWC Mindmaps/Espacio.pmap",
  "nodeIds": {
    "Espacio": "node-0",
    "Planetas": "node-1",
    "Lunas": "node-2"
  }
}
```

**Ejemplo**:
```javascript
await create_mindmap({
  name: "Espacio",
  topic: "Espacio",
  description: "Exploración del sistema solar",
  nodes: [
    { title: "Planetas", description: "Cuerpos celestes que orbitan el sol", level: 1 },
    { title: "Lunas", description: "Satélites naturales de planetas", level: 1 }
  ]
})
```

---

### 4.2 add_node
**Descripción**: Agrega un nodo al mindmap actual

**Parámetros**:
```typescript
{
  projectPath: string,       // Path al .pmap
  parentTitle: string,       // Título del nodo padre
  title: string,             // Título del nuevo nodo
  description?: string,      // Descripción
  notes?: string,            // Notas adicionales
  position?: number          // Posición entre hermanos (opcional)
}
```

**Retorno**:
```json
{
  "success": true,
  "nodeId": "node-3"
}
```

---

### 4.3 add_image_to_node
**Descripción**: Agrega imagen(es) a un nodo

**Parámetros**:
```typescript
{
  projectPath: string,
  nodeTitle: string,         // Título del nodo
  imageUrls: string[]        // URLs de imágenes (se descargan y convierten a base64)
}
```

**Retorno**:
```json
{
  "success": true,
  "imagesAdded": 2
}
```

---

### 4.4 search_images
**Descripción**: Busca imágenes en internet para un concepto

**Parámetros**:
```typescript
{
  query: string,             // Término de búsqueda
  limit?: number             // Máximo de resultados (default: 5)
}
```

**Retorno**:
```json
{
  "success": true,
  "images": [
    {
      "url": "https://...",
      "title": "Planetas del sistema solar",
      "thumbnail": "https://..."
    }
  ]
}
```

**Implementación**: Usar API gratuita como Unsplash o Pexels

---

### 4.5 reorder_nodes
**Descripción**: Reordena nodos hermanos

**Parámetros**:
```typescript
{
  projectPath: string,
  parentTitle: string,       // Título del nodo padre
  newOrder: string[]         // Array con títulos en nuevo orden
}
```

**Ejemplo**:
```javascript
await reorder_nodes({
  projectPath: "~/Documents/PWC Mindmaps/Espacio.pmap",
  parentTitle: "Espacio",
  newOrder: ["Lunas", "Planetas"]  // Lunas ahora primero
})
```

---

### 4.6 create_category
**Descripción**: Crea una categoría

**Parámetros**:
```typescript
{
  projectPath: string,
  name: string,              // Nombre de la categoría
  color?: string,            // Color hex (default: random)
  icon?: string              // Icono (default: "tag")
}
```

**Retorno**:
```json
{
  "success": true,
  "categoryId": "cat-123"
}
```

---

### 4.7 assign_category
**Descripción**: Asigna categoría a nodo(s)

**Parámetros**:
```typescript
{
  projectPath: string,
  nodeTitles: string[],      // Títulos de nodos
  categoryName: string       // Nombre de categoría
}
```

---

### 4.8 create_relationship
**Descripción**: Crea relación entre nodos

**Parámetros**:
```typescript
{
  projectPath: string,
  fromTitle: string,         // Nodo origen
  toTitle: string,           // Nodo destino
  type?: string,             // Tipo (default: "relacionado")
  color?: string             // Color (default: "#3498db")
}
```

---

### 4.9 get_project_data
**Descripción**: Obtiene datos completos del proyecto actual

**Parámetros**:
```typescript
{
  projectPath: string
}
```

**Retorno**: Todo el contenido del .pmap file

---

### 4.10 list_projects
**Descripción**: Lista todos los proyectos disponibles

**Retorno**:
```json
{
  "projects": [
    {
      "name": "Espacio",
      "path": "~/Documents/PWC Mindmaps/Espacio.pmap",
      "modified": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4.11 update_node
**Descripción**: Actualiza descripción/notas de un nodo

**Parámetros**:
```typescript
{
  projectPath: string,
  nodeTitle: string,
  description?: string,      // Nueva descripción
  notes?: string             // Nuevas notas
}
```

---

### 4.12 delete_node
**Descripción**: Elimina un nodo y sus hijos

**Parámetros**:
```typescript
{
  projectPath: string,
  nodeTitle: string
}
```

---

## 5. Flujo de Comunicación

### Ejemplo: "Crear mindmap sobre espacio con planetas y lunas, buscar y agregar imágenes"

```
1. Claude Code recibe prompt del usuario
2. Claude Code invoca:

   create_mindmap({
     name: "Espacio",
     topic: "Espacio",
     nodes: [
       { title: "Planetas", description: "...", level: 1 },
       { title: "Lunas", description: "...", level: 1 }
     ]
   })

3. MCP Server:
   - Genera structure de nodos con IDs
   - Crea content text indentado
   - Inicializa nodeData
   - Guarda ~/Documents/PWC Mindmaps/Espacio.pmap

4. Claude Code invoca:

   search_images({ query: "planets solar system" })

5. MCP Server:
   - Llama a API de imágenes (Unsplash)
   - Retorna URLs

6. Claude Code invoca:

   add_image_to_node({
     projectPath: "~/Documents/PWC Mindmaps/Espacio.pmap",
     nodeTitle: "Planetas",
     imageUrls: ["https://..."]
   })

7. MCP Server:
   - Descarga imagen
   - Convierte a base64
   - Agrega a nodeData["node-1"].images
   - Guarda archivo

8. Usuario abre app → File > Open → Espacio.pmap
9. App carga y renderiza el mindmap completo
```

---

## 6. Implementación Técnica

### 6.1 Dependencias

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "axios": "^1.6.0",          // Para búsqueda de imágenes
    "sharp": "^0.33.0",         // Para procesar imágenes
    "uuid": "^9.0.0"            // Para generar IDs
  }
}
```

### 6.2 Módulos Principales

#### `lib/mindmap.js`
- `loadProject(path)` - Carga .pmap file
- `saveProject(path, data)` - Guarda .pmap file
- `generateContentText(nodes)` - Genera texto indentado
- `parseContentText(text)` - Parsea a estructura
- `addNode(parent, node)` - Agrega nodo
- `removeNode(nodeId)` - Elimina nodo
- `reorderChildren(parentId, newOrder)` - Reordena

#### `lib/images.js`
- `searchImages(query, limit)` - Busca en Unsplash/Pexels
- `downloadImage(url)` - Descarga imagen
- `imageToBase64(buffer)` - Convierte a base64
- `validateImage(buffer)` - Valida tamaño/formato

#### `lib/parser.js`
- `nodesToText(nodes)` - Convierte estructura a texto
- `textToNodes(text)` - Parsea texto (replica parseOutline)
- `findNodeByTitle(title, tree)` - Busca nodo
- `generateNodeIds(nodes)` - Genera IDs secuenciales

---

## 7. Limitaciones y Consideraciones

### 7.1 Sincronización
- **Problema**: MCP modifica archivos, pero app no se recarga automáticamente
- **Solución**: Usuario debe reabrir el archivo o hacer refresh
- **Mejora futura**: Implementar file watcher en la app

### 7.2 Concurrencia
- **Problema**: Si app y MCP modifican mismo archivo simultáneamente
- **Solución**: MCP debe verificar si app está corriendo y avisar al usuario
- **Implementación**: Usar file locks o timestamps

### 7.3 Búsqueda de Imágenes
- **Limitación**: APIs gratuitas tienen rate limits
- **Solución**: Implementar caché de búsquedas
- **Alternativa**: Permitir URLs directas sin búsqueda

---

## 8. Roadmap de Implementación

### Fase 1: Core (MVP)
- ✅ Diseño completo (este documento)
- ⏳ create_mindmap
- ⏳ add_node
- ⏳ get_project_data
- ⏳ Configuración MCP en Claude Code

### Fase 2: Imágenes
- ⏳ search_images (Unsplash API)
- ⏳ add_image_to_node
- ⏳ Descarga y conversión a base64

### Fase 3: Organización
- ⏳ create_category
- ⏳ assign_category
- ⏳ create_relationship
- ⏳ reorder_nodes

### Fase 4: Edición Avanzada
- ⏳ update_node
- ⏳ delete_node
- ⏳ move_node (cambiar padre)

### Fase 5: Mejoras
- ⏳ File watcher en app
- ⏳ Undo/redo
- ⏳ Validación de datos
- ⏳ Error handling robusto

---

## 9. Ejemplo de Uso Completo

```typescript
// Usuario: "Crear mindmap sobre IA con ética, riesgos y beneficios"

// Paso 1: Crear mindmap
const result = await create_mindmap({
  name: "IA Responsable",
  topic: "Inteligencia Artificial Responsable",
  description: "Desarrollo ético de sistemas de IA",
  nodes: [
    { title: "Ética", description: "Principios morales en IA", level: 1 },
    { title: "Riesgos", description: "Desafíos y amenazas", level: 1 },
    { title: "Beneficios", description: "Impacto positivo", level: 1 }
  ]
});

// Paso 2: Agregar sub-nodos
await add_node({
  projectPath: result.projectPath,
  parentTitle: "Ética",
  title: "Transparencia",
  description: "IA explicable y comprensible"
});

await add_node({
  projectPath: result.projectPath,
  parentTitle: "Ética",
  title: "Equidad",
  description: "Sin sesgos discriminatorios"
});

// Paso 3: Buscar imágenes
const aiImages = await search_images({
  query: "artificial intelligence ethics",
  limit: 3
});

// Paso 4: Agregar imágenes
await add_image_to_node({
  projectPath: result.projectPath,
  nodeTitle: "Ética",
  imageUrls: [aiImages.images[0].url]
});

// Paso 5: Crear categoría
await create_category({
  projectPath: result.projectPath,
  name: "Fundamentos",
  color: "#3498db"
});

// Paso 6: Asignar categoría
await assign_category({
  projectPath: result.projectPath,
  nodeTitles: ["Transparencia", "Equidad"],
  categoryName: "Fundamentos"
});

// Resultado: Archivo listo para abrir en la app
console.log(`Mindmap creado: ${result.projectPath}`);
```

---

## 10. Próximos Pasos

1. **Aprobar diseño** ✓
2. **Crear estructura de directorios** en `~/.claude-mcp-servers/pwc-mindmap-mcp/`
3. **Implementar MVP** (Fase 1):
   - Setup MCP server básico
   - Implementar create_mindmap
   - Implementar add_node
   - Probar con Claude Code
4. **Iterar** agregando funcionalidades de Fases 2-5

---

**¿Siguiente acción?** Implementar el MCP server basado en este diseño.
