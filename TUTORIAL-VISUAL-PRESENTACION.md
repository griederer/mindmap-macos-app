# 📸 Tutorial Visual: Modo Presentación

## 🎯 Objetivo
Aprender a crear y presentar slides desde tu mindmap en **menos de 2 minutos**.

---

## 📋 Estado Inicial

### Lo que ves ahora:
- ✅ Proyecto "Cybersecurity Best Practices" cargado
- ✅ Panel de slides vacío (derecha): "No hay slides aún..."
- ✅ Botón 📸 visible en toolbar (pero no activo aún)
- ✅ Mindmap con nodo "Network Security" expandido

---

## 🚀 Paso 1: Capturar Primera Slide

### Acción:
```
1. Click en botón 📸 (toolbar superior)
```

### ✨ Lo que SUCEDERÁ:
```
┌─────────────────────────────────────────┐
│  NOTIFICACIÓN (top-right, 3 segundos)  │
│  ┌─────────────────────────────────┐   │
│  │ 📸  Slide 1 capturado           │   │
│  │     "Cybersecurity Best         │   │
│  │      Practices overview"        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PANEL DERECHO (se abre automáticamente)│
│  ┌─────────────────────────────────┐   │
│  │ 🎬 Slides de Presentación    ✕ │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │  1  [🖼️ Thumbnail pequeño]     │   │
│  │     "Network Security..."       │   │
│  │                          👁️ 🗑️  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TOOLBAR (actualización)                │
│  📸 1 slide    ▶️ Present               │
└─────────────────────────────────────────┘
```

### Resultado:
- ✅ Notificación azul confirma captura
- ✅ Panel se abre mostrando thumbnail
- ✅ Contador: "1 slide"
- ✅ Botón "▶️ Present" aparece

---

## 🔄 Paso 2: Capturar Segunda Slide (Vista Diferente)

### Acción:
```
1. Colapsa nodo "Network Security" (click en flecha)
2. Expande nodo "Access Control"
3. Click en 📸
```

### ✨ Lo que SUCEDERÁ:
```
┌─────────────────────────────────────────┐
│  NOTIFICACIÓN                           │
│  📸  Slide 2 capturado                  │
│      "Access Control expanded"          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PANEL (actualiza, NO abre de nuevo)   │
│  ┌─────────────────────────────────┐   │
│  │ 🎬 Slides de Presentación    ✕ │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │  1  [🖼️ Thumbnail]              │   │
│  │     "Network Security..."       │   │
│  │                          👁️ 🗑️  │   │
│  │                                 │   │
│  │  2  [🖼️ Thumbnail]  ← NUEVO     │   │
│  │     "Access Control..."         │   │
│  │                          👁️ 🗑️  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TOOLBAR                                │
│  📸 2 slides    ▶️ Present              │
└─────────────────────────────────────────┘
```

---

## 🎨 Paso 3: Capturar Tercera Slide (Todo Expandido)

### Acción:
```
1. Expande TODOS los nodos (click en todas las flechas)
2. Activa categorías (botón 🏷️ si existe)
3. Zoom out un poco (Cmd + -)
4. Click en 📸
```

### Resultado:
```
📸  Slide 3 capturado
    "Cybersecurity Best Practices overview"

Panel actualizado con 3 slides:
1. Network Security (vista original)
2. Access Control expanded
3. Todo expandido con categorías
```

---

## 🎬 Paso 4: Gestionar Slides en el Panel

### Acciones Disponibles:

#### A) **Vista Previa** 👁️
```
1. Click en 👁️ de cualquier slide
→ El mindmap cambia a ese estado
→ NO entra en modo presentación
→ Puedes verificar cómo se ve
```

#### B) **Reordenar** (Drag & Drop)
```
1. Arrastra slide 3
2. Suéltalo entre slide 1 y 2
→ Orden cambia automáticamente
→ Números se actualizan: 1, 2, 3
```

#### C) **Eliminar** 🗑️
```
1. Click en 🗑️ de slide 2
2. Confirmación: "¿Eliminar slide 2?"
3. Click OK
→ Slide eliminado
→ Panel muestra solo 2 slides
→ Contador: "2 slides"
```

---

## ▶️ Paso 5: PRESENTAR

### Acción:
```
1. Click en botón ▶️ Present (toolbar)
```

### ✨ Lo que SUCEDERÁ:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Presiona ESC para salir                    │
│                                                         │
│                                                         │
│                                                         │
│         ┌─────────────────────────────┐                │
│         │  Cybersecurity Best         │                │
│         │  Practices                  │                │
│         │                             │                │
│         │  [Mindmap centrado]         │                │
│         │                             │                │
│         └─────────────────────────────┘                │
│                                                         │
│                                                         │
│                                                  1/3    │
└─────────────────────────────────────────────────────────┘

📌 Características:
- Fondo negro 95% opacidad
- Mindmap centrado
- Contador abajo derecha: "1/3"
- Hint arriba: "Presiona ESC para salir"
- Todo lo demás OCULTO (sidebar, toolbar, panels)
```

---

## ⌨️ Paso 6: Navegar en Presentación

### Teclado:

#### **→ Flecha Derecha** - Siguiente Slide
```
Estado: Slide 1
Press →
  ↓
[Animación suave 300ms]
  ↓
Estado: Slide 2
Contador: "2/3"
```

#### **← Flecha Izquierda** - Slide Anterior
```
Estado: Slide 2
Press ←
  ↓
[Animación reversa 300ms]
  ↓
Estado: Slide 1
Contador: "1/3"
```

#### **Números 1-3** - Saltar a Slide
```
Press "3"
  ↓
[Animación directa a slide 3]
  ↓
Estado: Slide 3
Contador: "3/3"
```

#### **ESC** - Salir
```
Press ESC
  ↓
[Sale de pantalla completa]
  ↓
Restaura estado original
Panel y toolbar visibles de nuevo
```

---

## 🎯 Ejemplo Completo: Presentación 3 Slides

### Setup (2 minutos):
```
Slide 1: Vista General
- Todo colapsado
- Zoom 1.0
- 📸 → "Root overview"

Slide 2: Network Security Detalle
- Solo "Network Security" expandido
- Zoom 1.3
- 📸 → "Network Security expanded"

Slide 3: Vista Completa
- Todo expandido
- Categorías visibles
- Zoom 0.8
- 📸 → "Complete strategy overview"
```

### Presentar (5 minutos):
```
▶️ Click Present

[Slide 1] Explicas visión general
Press →

[Slide 2] Detalles de Network Security
Press →

[Slide 3] Estrategia completa
Press ESC

[Fin] Vuelves a edición normal
```

---

## ✅ Checklist de Funciones

### Captura de Slides:
- [x] Click 📸 captura estado actual
- [x] Notificación azul confirma
- [x] Panel se abre automáticamente (primera vez)
- [x] Thumbnail generado (120x80px)
- [x] Descripción auto-generada

### Gestión de Slides:
- [x] Panel lateral derecho
- [x] Drag & drop para reordenar
- [x] Vista previa (👁️) sin presentar
- [x] Eliminar slide (🗑️) con confirmación
- [x] Contador actualizado ("X slides")

### Presentación:
- [x] Botón ▶️ Present (aparece con slides)
- [x] Pantalla completa negra
- [x] → Siguiente slide
- [x] ← Slide anterior
- [x] 1-9, 0 saltar a slide específico
- [x] ESC salir y restaurar
- [x] Animaciones suaves 60fps
- [x] Contador "X/Y" visible

---

## 🐛 Troubleshooting

### Problema: "No veo el botón 📸"
**Solución:**
- Recarga la app (Cmd + R)
- Verifica que tengas un proyecto cargado

### Problema: "El panel no se abre"
**Solución:**
- Click manual en botón 🎬 (derecha)
- Verifica que capturaste al menos 1 slide

### Problema: "Notificación no aparece"
**Solución:**
- Verifica en consola (Cmd + Shift + I)
- El slide SÍ se capturó, solo falta notificación visual

### Problema: "Presentación no cambia de slide"
**Solución:**
- Verifica que estás EN modo presentación (pantalla negra)
- Usa teclas de flecha (no click)

---

## 🎉 ¡Listo para Presentar!

**Tu workflow ahora:**
1. 📸 Captura slides mientras editas
2. 🎬 Revisa en panel lateral
3. ▶️ Presenta con teclado
4. 🎯 Impresiona a tu audiencia

**Tiempo total de aprendizaje: 2 minutos**
**Tiempo de crear presentación: 5 minutos**
**Impacto: Profesional y fluido ✨**

---

## 📚 Recursos Adicionales

- **Guía Completa:** `GUIA-PRESENTACION.md`
- **Demo Técnico:** `DEMO-PRESENTATION-MODE.md`
- **Tests:** `presentation-manager.test.js` (30 tests)
- **Animaciones:** `animation-engine.test.js` (21 tests)

---

**Creado:** Octubre 8, 2025
**Versión:** PWC Mindmap Pro v4.0
**Feature:** Presentation Mode
