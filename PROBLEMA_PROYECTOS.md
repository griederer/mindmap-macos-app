# Problema: Proyectos PwC No Aparecen en la Aplicación

## Fecha
30 de septiembre de 2025

## Descripción del Problema
Los dos nuevos proyectos de PwC ("IA Responsable - PwC" y "Sostenibilidad ESG - PwC") fueron agregados al código fuente en `renderer.js` pero NO aparecen en el panel de proyectos de la aplicación después de reinicios múltiples.

## Contexto Completo

### Archivos de Mindmaps Creados
Se crearon exitosamente dos archivos:
1. **ia-responsable.md** - Mindmap sobre IA Responsable basado en presentación PwC
2. **sostenibilidad-esg.md** - Mindmap sobre Sostenibilidad ESG basado en presentación PwC

Ambos archivos están en el directorio raíz del proyecto y tienen contenido completo con formato correcto.

### Código Modificado
En `renderer.js`, líneas 11-197, se agregaron los dos proyectos al array de proyectos por defecto:

```javascript
constructor() {
    this.projects = [
        {
            id: 'ia-responsable',
            name: 'IA Responsable (Prueba Info)',
            content: `IA Responsable (Prueba Info)
...`
        },
        {
            id: 'esquema-entrada',
            name: 'ENTRADA DE ESQUEMA',
            content: `ENTRADA DE ESQUEMA
...`
        },
        {
            id: 'inteligencia-artificial',
            name: 'Inteligencia Artificial Responsable',
            content: `Inteligencia Artificial Responsable
...`
        },
        // NUEVOS PROYECTOS PWC - AGREGADOS AQUÍ
        {
            id: 'ia-responsable-pwc',
            name: 'IA Responsable - PwC',
            content: `IA Responsable
1. Desconfianza en la IA
...` // Contenido completo de ia-responsable.md (líneas 12-123)
        },
        {
            id: 'sostenibilidad-esg-pwc',
            name: 'Sostenibilidad ESG - PwC',
            content: `Confianza en Información de Sostenibilidad
1. Por qué es importante ESG
...` // Contenido completo de sostenibilidad-esg.md (líneas 124-197)
        }
    ];
}
```

### Función loadProjects()
En `renderer.js`, línea 870:

```javascript
loadProjects() {
    const savedProjects = localStorage.getItem('mindmap-projects');
    if (savedProjects) {
        this.projects = JSON.parse(savedProjects);
    } else {
        // Los proyectos default del constructor deberían usarse aquí
    }
    this.renderProjectsList();
}
```

**PROBLEMA IDENTIFICADO**: Si existe `mindmap-projects` en localStorage, SIEMPRE usa esos datos y NUNCA carga los proyectos por defecto del constructor.

## Intentos de Solución

### Intento 1: Reinicio Simple de la App
- **Acción**: Matar proceso Electron y reiniciar con `npm start`
- **Resultado**: ❌ Proyectos PwC no aparecen

### Intento 2: localStorage.clear() desde DevTools
- **Acción**:
  1. Abrir DevTools con Option+Command+I
  2. Ejecutar `localStorage.clear()` en consola
  3. Recargar app con Command+R
- **Resultado**: ❌ Proyectos PwC siguen sin aparecer

### Intento 3: Reinicio Completo Después de Clear
- **Acción**:
  1. `localStorage.clear()` en DevTools
  2. Matar proceso Electron: `pkill -f "electron.*mindmap-macos-app"`
  3. Esperar 2 segundos
  4. Reiniciar: `npm start`
- **Resultado**: ❌ Proyectos PwC TODAVÍA no aparecen

## Análisis Técnico

### Estado Actual del Código
1. ✅ Los proyectos PwC están correctamente definidos en `renderer.js` constructor
2. ✅ El contenido de los mindmaps está completo y con formato correcto
3. ✅ Los IDs son únicos: `ia-responsable-pwc` y `sostenibilidad-esg-pwc`
4. ❌ Los proyectos NO aparecen en la UI después de reinicios

### Posibles Causas

#### Hipótesis 1: localStorage Persiste Después de clear()
- localStorage podría estar persistiendo datos entre sesiones
- Electron podría tener una capa de caché adicional
- El `localStorage.clear()` no está funcionando correctamente

#### Hipótesis 2: Inicialización del Constructor
- El constructor podría no estar ejecutándose correctamente
- Los proyectos por defecto podrían estar siendo sobrescritos antes de renderizarse
- Problema de timing: loadProjects() se ejecuta antes que termine el constructor

#### Hipótesis 3: Problema con userData de Electron
- Electron almacena datos en un directorio userData separado
- Este directorio podría contener una copia persistente de los proyectos
- Ubicación típica en macOS: `~/Library/Application Support/[app-name]/`

#### Hipótesis 4: Código de Renderizado
- `renderProjectsList()` podría estar usando una fuente de datos diferente
- Los proyectos nuevos podrían estar cargándose pero no renderizándose

### Logs y Debugging Intentados
- ✅ Verificado que el código está en el archivo (diff muestra las líneas agregadas)
- ✅ Confirmado que los archivos .md existen en el directorio
- ❌ NO se han revisado logs de Electron en consola
- ❌ NO se ha verificado el directorio userData de Electron
- ❌ NO se ha agregado logging para verificar si el constructor se ejecuta

## Próximos Pasos Sugeridos

### Opción 1: Eliminar userData de Electron
```bash
# Buscar directorio userData
find ~/Library/Application\ Support -name "*mindmap*" -type d

# Eliminar datos persistentes de Electron
rm -rf ~/Library/Application\ Support/mindmap-macos-app
```

### Opción 2: Forzar Reinicialización de Proyectos
Modificar `loadProjects()` para resetear localStorage en desarrollo:

```javascript
loadProjects() {
    // TEMPORAL: Forzar recarga de proyectos default
    localStorage.removeItem('mindmap-projects');

    const savedProjects = localStorage.getItem('mindmap-projects');
    if (savedProjects) {
        this.projects = JSON.parse(savedProjects);
    }
    this.renderProjectsList();
}
```

### Opción 3: Agregar Logging para Debug
```javascript
constructor() {
    console.log('Constructor ejecutándose...');
    this.projects = [
        // ... proyectos ...
    ];
    console.log('Proyectos cargados:', this.projects.length);
    console.log('Proyectos:', this.projects.map(p => p.name));
}

loadProjects() {
    console.log('loadProjects ejecutándose...');
    const savedProjects = localStorage.getItem('mindmap-projects');
    console.log('Proyectos en localStorage:', savedProjects);

    if (savedProjects) {
        this.projects = JSON.parse(savedProjects);
        console.log('Proyectos cargados desde localStorage:', this.projects.length);
    } else {
        console.log('Usando proyectos por defecto:', this.projects.length);
    }
    this.renderProjectsList();
}
```

### Opción 4: Verificar Método de Renderizado
Revisar `renderProjectsList()` para asegurar que está usando `this.projects`:

```javascript
renderProjectsList() {
    console.log('Renderizando proyectos:', this.projects.length);
    // ... código de renderizado ...
}
```

## Información Adicional

### Versión de Electron
28.1.0

### Sistema Operativo
macOS Darwin 25.0.0

### Estructura de Archivos
```
mindmap-macos-app/
├── main.js
├── renderer.js          # Archivo modificado con nuevos proyectos
├── index.html
├── ia-responsable.md    # Nuevo archivo
├── sostenibilidad-esg.md # Nuevo archivo
└── package.json
```

### Git Branch
v1.0-stable

## Solicitud para Otro Modelo

**Problema principal**: Los proyectos agregados al código NO aparecen en la UI a pesar de:
1. Estar correctamente definidos en el constructor
2. Haber limpiado localStorage múltiples veces
3. Haber reiniciado la aplicación completamente

**Pregunta clave**: ¿Por qué los proyectos default del constructor no se cargan en la UI cuando se supone que localStorage está vacío?

**Necesitamos**: Una solución definitiva para que los 5 proyectos (3 originales + 2 nuevos PwC) aparezcan en el panel de proyectos de la aplicación.
