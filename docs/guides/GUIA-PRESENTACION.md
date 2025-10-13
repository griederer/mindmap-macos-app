# 📖 Guía: Cómo Usar el Modo Presentación

## 🎯 Resumen Rápido

El **Modo Presentación** te permite convertir tu mindmap en slides profesionales con 3 pasos:

1. **Capturar** 📸 - Graba el estado actual como slide
2. **Organizar** 🎬 - Reordena slides en el panel
3. **Presentar** ▶️ - Modo pantalla completa con navegación

---

## 📸 Paso 1: Capturar Slides

### ¿Cómo capturar?
1. Organiza tu mindmap como quieres que se vea (expande/colapsa nodos)
2. Haz click en **📸 Add Slide** (toolbar superior)
3. **¡NUEVO!** Verás una notificación azul:
   ```
   ┌─────────────────────────────┐
   │ 📸  Slide 1 capturado       │
   │     "Root overview"         │
   └─────────────────────────────┘
   ```
4. **¡NUEVO!** El panel de slides se abre automáticamente en la primera captura
5. La notificación desaparece después de 3 segundos
6. El contador se actualiza: **"1 slide"** → **"2 slides"** → ...

### ¿Qué se captura?
✅ Nodos expandidos/colapsados
✅ Zoom y posición (pan)
✅ Categorías visibles
✅ Relaciones visibles
✅ Modo focus (si está activo)
✅ Paneles de información abiertos
✅ Imágenes en pantalla completa

### Ejemplo: Crear 3 Slides
```
Slide 1: Vista general
- Root colapsado
- Zoom: 1.0
→ Click 📸 → "Slide 1 capturado: Root overview"

Slide 2: Detalle de Riesgos
- Expande nodo "Riesgos"
- Zoom: 1.5
→ Click 📸 → "Slide 2 capturado: Riesgos expanded"

Slide 3: Estrategia Completa
- Expande todo
- Muestra categorías
→ Click 📸 → "Slide 3 capturado: Estrategia Completa overview"
```

---

## 🎬 Paso 2: Gestionar Slides

### Abrir Panel de Slides
1. Click en botón **🎬** (arriba derecha, junto a categorías)
2. Se abre panel lateral con tus slides

### Panel de Slides
```
┌─────────────────────────────────────┐
│  🎬 Slides de Presentación      ✕  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 1  [🖼️ Thumbnail]            │   │
│  │    Root overview             │   │
│  │                         👁️ 🗑️ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 2  [🖼️ Thumbnail]            │   │
│  │    Riesgos expanded          │   │
│  │                         👁️ 🗑️ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 3  [🖼️ Thumbnail]            │   │
│  │    Estrategia overview       │   │
│  │                         👁️ 🗑️ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Acciones Disponibles

#### 📌 Reordenar (Drag & Drop)
1. Arrastra cualquier slide
2. Suéltalo en la nueva posición
3. Los números se actualizan automáticamente

#### 👁️ Vista Previa
1. Click en icono **👁️**
2. El mindmap cambia a ese estado
3. **NO** entra en modo presentación
4. Puedes editar después de ver

#### 🗑️ Eliminar
1. Click en icono **🗑️**
2. Aparece confirmación: "¿Eliminar slide 2?"
3. Click "OK" para eliminar
4. El slide se borra permanentemente

---

## ▶️ Paso 3: Presentar

### Iniciar Presentación
1. Click en botón **▶️ Present** (se hace visible cuando tienes slides)
2. Pantalla completa negra (95% opacidad)
3. Mindmap centrado
4. Contador abajo derecha: **"1/3"**
5. Hint arriba: "Presiona ESC para salir"

### Navegación con Teclado

| Tecla | Acción |
|-------|--------|
| **→** (Flecha derecha) | Siguiente slide |
| **←** (Flecha izquierda) | Slide anterior |
| **1-9** | Saltar a slides 1-9 |
| **0** | Saltar a slide 10 |
| **ESC** | Salir de presentación |

### Animaciones Automáticas
- **Nodos se expanden/colapsan** suavemente (300ms)
- **Zoom y pan** interpolados (500ms)
- **Pasos intermedios** para nodos distantes
- **60fps** garantizado

### Ejemplo de Navegación
```
Estado inicial: Slide 1 (Root colapsado)

Press →
  ↓
[Animación: Root expande → Riesgos expande]
  ↓
Slide 2 (Riesgos expanded)
Contador: "2/3"

Press →
  ↓
[Animación: más nodos expanden]
  ↓
Slide 3 (Todo expandido)
Contador: "3/3" (última slide, contador fade)

Press ←
  ↓
[Animación reversa: nodos colapsan]
  ↓
Slide 2

Press ESC
  ↓
Salir, restaurar estado original
```

---

## 🎨 Feedback Visual Mejorado

### Notificación de Captura (NUEVO)
Cada vez que capturas un slide, aparece una notificación:

**Posición:** Arriba derecha
**Duración:** 3 segundos
**Animación:** Desliza desde la derecha

```
┌────────────────────────────────────┐
│  📸  Slide 5 capturado             │
│      "Risk Assessment details"     │
└────────────────────────────────────┘
```

**Colores:**
- Fondo: Azul `#2196F3` (95% opacidad)
- Texto: Blanco
- Sombra: Negra suave

**Contenido:**
- **Título:** "Slide X capturado"
- **Descripción:** Auto-generada (max 240px)

### Contador de Slides
**Ubicación:** Junto al botón "📸 Add Slide"
**Formato:** "X slide(s)"
**Actualización:** Tiempo real

### Botón Present
**Visibilidad:** Solo aparece cuando hay slides
**Ubicación:** Toolbar principal
**Icono:** ▶️

---

## 🔄 Workflow Completo

### Ejemplo Práctico: Presentación de Proyecto

#### Setup (5 minutos)
```
1. Abre proyecto "Cybersecurity Best Practices"

2. Captura Slide 1: Overview
   - Todo colapsado, zoom 1.0
   📸 → "Slide 1 capturado: Root overview"

3. Expande "Access Control"
   - Zoom 1.3
   📸 → "Slide 2 capturado: Access Control expanded"

4. Expande "Network Security"
   - Muestra categorías
   📸 → "Slide 3 capturado: Network Security details"

5. Activa modo focus en "Risk Assessment"
   - Zoom 1.5
   📸 → "Slide 4 capturado: Focus: Risk Assessment"

6. Todo expandido, muestra relaciones
   📸 → "Slide 5 capturado: Estrategia Completa overview"

Resultado: 5 slides, listo para presentar
```

#### Revisar (2 minutos)
```
1. Click 🎬 → Abre panel
2. Reordena si necesario (drag & drop)
3. Vista previa de cada slide (👁️)
4. Elimina slides innecesarias (🗑️)
```

#### Presentar (10 minutos)
```
1. Click ▶️ Present
2. Pantalla completa
3. Navega con →/← o números
4. Explica cada slide
5. ESC para salir
```

---

## ❓ Preguntas Frecuentes

### ¿Puedo editar después de capturar?
Sí, capturar un slide NO bloquea el mindmap. Puedes seguir editando.

### ¿Se guardan las slides?
Sí, se guardan en el archivo `.pmap` automáticamente.

### ¿Cuántas slides puedo tener?
Recomendado: 10-15 slides (óptimo para memoria)
Máximo técnico: 50+ slides (< 50MB)

### ¿Puedo exportar las slides?
Actualmente las slides están en el `.pmap`. Exportación futura en desarrollo.

### ¿Funciona con imágenes?
Sí, si tienes una imagen en pantalla completa, se captura ese estado.

### ¿Qué pasa si cierro la app?
Las slides se guardan en el `.pmap`. Al reabrir, están disponibles.

### ¿Puedo duplicar un slide?
No directamente. Workaround: vuelve al estado y captura de nuevo.

---

## 🎯 Tips Pro

### 1. **Usa Descripciones Claras**
Las descripciones auto-generadas usan:
- Modo focus: "Focus: [nombre nodo]"
- Imagen activa: "[nombre nodo] (image)"
- Expandido: "[nombre nodo] expanded"
- Detalles: "[nombre nodo] details"

### 2. **Planifica el Flujo**
Orden lógico:
1. Overview general (todo colapsado)
2. Zoom progresivo (cada sección)
3. Detalles específicos (focus mode)
4. Resumen final (todo visible)

### 3. **Combina Técnicas**
- Slide 1: Overview + categorías
- Slide 2: Focus + zoom
- Slide 3: Relaciones visibles
- Slide 4: Imagen destacada

### 4. **Práctica Navegación**
Antes de presentar:
- Prueba con →/← (flujo natural)
- Prueba números (saltos rápidos)
- Verifica ESC (salida limpia)

---

## 🚀 Atajos Rápidos

### Creación
```
Ctrl/Cmd + P  → Abrir panel presentación (futuro)
📸 Click      → Capturar slide actual
```

### Presentación
```
▶️ Click  → Iniciar
→         → Siguiente
←         → Anterior
1-9, 0    → Saltar a slide
ESC       → Salir
```

---

## ✨ Características Nuevas (Esta Versión)

### 1. **Notificación Visual** 📢
- Toast azul al capturar
- Muestra número y descripción
- Auto-desaparece en 3s

### 2. **Panel Auto-Abierto** 🎬
- El panel se abre automáticamente en la PRIMERA captura
- Ya no necesitas buscar el botón 🎬
- Las slides siguientes solo actualizan el panel

### 3. **Feedback Mejorado**
- Contador actualizado en tiempo real
- Botón Present se activa dinámicamente
- Panel se refresca automáticamente

### 4. **Animaciones Suaves**
- 60fps garantizado
- Cubic-bezier easing profesional
- Transiciones naturales

---

**¡Ahora ya sabes usar el Modo Presentación! 🎉**

Para cualquier duda, revisa `DEMO-PRESENTATION-MODE.md` para detalles técnicos.
