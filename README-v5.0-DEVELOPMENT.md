# v5.0 JSON Standardization - Development Guide

**Branch**: `feature/v5.0-json-standardization`
**Status**: Phase 1 Ready for Testing
**Created**: 2025-01-11

---

## 🎯 Objetivo

Estandarizar el formato JSON (.pmap) para que Claude Code pueda crear mindmaps que la app renderice perfectamente al 100%.

### Problemas Resueltos

✅ **Node IDs estables** - Ya no cambian al reordenar
✅ **Descripción vs Notas** - Clara distinción de propósitos
✅ **Imágenes estructuradas** - Siempre objetos con metadata
✅ **Categorías bidireccionales** - Sincronización automática
✅ **Validación completa** - JSON Schema + validadores semánticos

---

## 📁 Archivos Clave

```
mindmap-macos-app/
├── tasks/
│   ├── 0001-prd-json-format-standardization.md  ← PRD completo (600+ líneas)
│   └── IMPLEMENTATION-PLAN-v5.0.md              ← Plan de implementación por fases
├── create-test-project.js                        ← Generador de tests
└── README-v5.0-DEVELOPMENT.md                    ← Este archivo
```

---

## 🧪 Estrategia de Testing

### Incremental por Fases

#### ✅ Phase 1: Node Structure (LISTO PARA PROBAR)
**Objetivo**: IDs estables + estructura básica

**Test File**: `/Users/gonzaloriederer/Documents/PWC Mindmaps/v5-tests/Phase1-Simple-Nodes.pmap`

**Cómo Probar**:
```bash
# 1. Abrir la app
cd ~/Documents/GitHub/mindmap-macos-app
npm start

# 2. En la app:
# File → Open → Phase1-Simple-Nodes.pmap

# 3. Verificar:
# - Se ven los 5 nodos
# - No hay errores en consola
# - Los nodos expanden/colapsan
# - El zoom funciona
```

**Resultado Esperado**:
- ✅ 5 nodos visibles: Cloud Security (root) + 4 hijos
- ✅ Sin errores en console.log
- ✅ Layout correcto (jerárquico)

**Si falla**: La app actual no soporta el nuevo formato. Necesitamos actualizar `mindmap-engine.js`.

---

#### ⏳ Phase 2: Content (Descriptions + Notes)
**Test File**: `Phase2-Content-Test.pmap`

**Generar**:
```bash
node create-test-project.js content
```

**Probar**:
1. Abrir archivo en app
2. Click en botón "i" del nodo "Risk Management"
3. Verificar que se abre panel con:
   - **Description**: "Systematic process for managing organizational risks"
   - **Notes**: Contenido markdown extendido con ## headings

---

#### ⏳ Phase 3: Images
**Test File**: `Phase3-Images-Test.pmap`

**Generar**:
```bash
node create-test-project.js images
```

**Probar**:
1. Abrir archivo
2. Ver nodo "Technology Stack"
3. Abrir info panel
4. Verificar:
   - Imagen de Unsplash carga correctamente
   - Aparece atribución del fotógrafo
   - Click en imagen abre lightbox

---

#### ⏳ Phase 4: Categories
**Test File**: `Phase4-Categories-Test.pmap`

**Generar**:
```bash
node create-test-project.js categories
```

**Probar**:
1. Abrir archivo
2. Verificar colores de nodos:
   - "Critical Task" = borde rojo (#dc2626)
   - "Important Task" = borde rojo
   - "Normal Task" = borde naranja (#f59e0b)
   - "Low Priority Task" = borde verde (#10b981)
3. Probar filtro de categorías en sidebar

---

#### ⏳ Phase 5: Full Integration
**Test File**: `Phase5-Full-Integration.pmap`

**Generar**:
```bash
node create-test-project.js full
```

**Probar**:
1. Abrir archivo
2. Verificar TODO:
   - 5 nodos
   - Descripción + notas
   - 1 imagen en nodo root
   - Categorías con colores
   - Relaciones dibujadas en canvas (líneas punteadas y sólidas)
3. Interacciones:
   - Expandir/colapsar
   - Info panels
   - Lightbox
   - Filtros

---

## 🔧 Implementación

### Estado Actual

| Component | Status | Notes |
|-----------|--------|-------|
| **PRD** | ✅ Complete | 600+ líneas documentadas |
| **Test Infrastructure** | ✅ Complete | 5 test files generados |
| **Phase 1: Nodes** | ✅ **COMPLETE** | Auto-migration implementada ✨ |
| **Phase 2: Content** | ⏳ Not Started | Requiere actualizar parseOutline() |
| **Phase 3: Images** | ⏳ Not Started | Requiere updateInfoPanel() |
| **Phase 4: Categories** | ⏳ Not Started | Requiere renderNode() + CSS |
| **Phase 5: Relationships** | ⏳ Not Started | Requiere drawConnections() |

---

## 🚀 Próximos Pasos

### Paso 1: Probar Compatibilidad Actual
```bash
# Abrir app y cargar Phase1-Simple-Nodes.pmap
npm start
```

**Resultado esperado**:
- ✅ Si funciona: La app v4.0 ya lee el formato v5.0 (retrocompatible)
- ❌ Si falla: Necesitamos implementar Phase 1 (actualizar mindmap-engine.js)

---

### Paso 2: Implementar Phase 1 (si es necesario)

**Archivos a modificar**:

#### `mindmap-engine.js`
```javascript
// 1. Agregar función generateNodeId()
generateNodeId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  const hash = crypto
    .createHash('sha256')
    .update(title + Date.now())
    .digest('hex')
    .substring(0, 8);

  return `${slug}-${hash}`;
}

// 2. Actualizar parseOutline() para usar IDs estables
parseOutline(text) {
  // ... existing logic ...

  // OLD: node.id = `node-${nodeId++}`;
  // NEW:
  node.id = this.generateNodeId(node.title);

  // ... rest of parsing ...
}

// 3. Actualizar renderNodes() para leer nuevo formato
renderNodes(root) {
  // Support both old (node-0) and new (cloud-security-abc123) IDs
  const nodeData = this.nodeData[node.id] || {};

  // Read from structured format
  const title = nodeData.title || node.title;
  const description = nodeData.description || '';
  const notes = nodeData.notes || '';

  // ... rest of rendering ...
}
```

---

### Paso 3: Implementar Phases 2-5

Seguir el plan en `IMPLEMENTATION-PLAN-v5.0.md` fase por fase.

Cada fase:
1. Generar test file
2. Abrir en app
3. Verificar funcionalidad
4. Fix bugs
5. Commit
6. Siguiente fase

---

## 🐛 Troubleshooting

### Issue: "App no carga el archivo"

**Causa**: Formato JSON inválido

**Solución**:
```bash
# Validar JSON
cat "/Users/gonzaloriederer/Documents/PWC Mindmaps/v5-tests/Phase1-Simple-Nodes.pmap" | jq .

# Si hay error de sintaxis, regenerar:
node create-test-project.js simple
```

---

### Issue: "Nodos no se ven en la app"

**Causa**: La app espera formato v4.0 (`node-0`, `node-1`)

**Solución**: Implementar migración automática en `project-manager.js`:
```javascript
loadProject(projectPath) {
  const data = JSON.parse(fs.readFileSync(projectPath));

  // Detect v5.0 format
  if (data.version === '5.0.0') {
    // Already in new format
    return data;
  }

  // Migrate from v4.0
  return this.migrateToV5(data);
}
```

---

### Issue: "Console muestra errores de nodeData[nodeId]"

**Causa**: Código busca nodeData con IDs viejos

**Solución**: Actualizar todas las referencias:
```javascript
// OLD:
const data = this.nodeData[`node-${index}`];

// NEW:
const data = this.nodeData[node.id];  // Use node.id directly
```

---

## 📊 Progreso

### Commits en esta rama

```bash
# Ver commits
git log --oneline feature/v5.0-json-standardization

# Resultado esperado:
# acdd30b feat: add incremental testing infrastructure for v5.0
# 01d7d5d docs: add PRD for JSON format standardization v5.0
```

---

## 🔄 Merge Strategy

### Cuando TODO esté listo:

```bash
# 1. Asegurar que todas las fases funcionan
npm test

# 2. Actualizar README principal
git add README.md

# 3. Merge a develop
git checkout develop
git merge feature/v5.0-json-standardization

# 4. Push
git push origin develop

# 5. Create PR to main (cuando esté 100% estable)
```

---

## 📚 Documentación

- **PRD Completo**: `tasks/0001-prd-json-format-standardization.md`
- **Plan de Implementación**: `tasks/IMPLEMENTATION-PLAN-v5.0.md`
- **Formato v5.0 Spec**: Ver Appendix A en PRD

---

## ✅ Checklist Final (Antes de Merge)

- [ ] Todas las 5 fases implementadas
- [ ] Todos los test files funcionan
- [ ] Sin errores en consola
- [ ] Migración de v4.0 → v5.0 funciona
- [ ] MCP server actualizado (17 tools)
- [ ] Documentación completa
- [ ] Tests automatizados creados
- [ ] Performance aceptable (< 100ms render time)

---

## 🤝 Contribuyendo

Si encuentras bugs durante testing:

1. Documentar en IMPLEMENTATION-PLAN-v5.0.md (sección Issues)
2. Crear issue en GitHub
3. Fix y commit con mensaje descriptivo

---

**Built with ❤️ for perfect MCP-App synchronization**
