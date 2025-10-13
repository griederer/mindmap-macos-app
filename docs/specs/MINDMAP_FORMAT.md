# Mindmap Format Guide

This guide explains how to create mindmaps using the markdown/text format supported by PWC Mindmap Pro.

## Basic Structure

The mindmap uses a hierarchical text format with indentation to represent different levels of nodes.

### Root Node

The first line without any indentation is the **root node** (central topic):

```
IA Responsable
```

### First Level Nodes

Lines starting with a number followed by a period create **first-level nodes** (main branches):

```
1. Core Principles
2. AI Risks & Challenges
3. Regulatory Landscape
```

### Second Level Nodes

Lines starting with `*` (asterisk) after first-level nodes create **second-level nodes** (sub-branches):

```
1. Core Principles
* Fairness & Non-discrimination
* Transparency
* Accountability
```

### Third Level Nodes

Lines with `   *` (3 spaces + asterisk) create **third-level nodes** (detailed items):

```
* Fairness & Non-discrimination
   * Bias prevention
   * Equitable outcomes
   * Inclusive design
```

### Fourth Level (Details/Descriptions)

Lines with `   * Topic | Description` add detailed information to third-level nodes:

```
   * Bias prevention | Techniques for detecting and mitigating biases in data and algorithms
   * Equitable outcomes | Ensuring fair impact across different demographic groups
```

The pipe character `|` separates the node title from its description.

## Complete Example

```
IA Responsable
1. Core Principles
* Fairness & Non-discrimination
   * Bias prevention | Techniques for detecting and mitigating biases in data and algorithms
   * Equitable outcomes | Ensuring fair impact across different demographic groups
   * Inclusive design | Considering diversity from the design phase
* Transparency
   * Explainable AI (XAI) | Methods for interpreting decisions of complex models
   * Model interpretability | Balance between accuracy and explainability
   * Decision documentation | Complete record of decision-making process
* Accountability
   * Clear ownership | Defining who is responsible for each component
   * Audit trails | Maintaining detailed records of all operations
2. AI Risks & Challenges
* Technical Risks
   * Algorithmic bias | Biases in training data and algorithm design
   * Model drift | Performance degradation over time
* Social Risks
   * Job displacement | Automation and job loss
   * Digital divide | Unequal access to AI technologies
```

## Hierarchy Summary

| Level | Format | Example |
|-------|--------|---------|
| **Root** | Plain text | `IA Responsable` |
| **Level 1** | `N.` | `1. Core Principles` |
| **Level 2** | `*` | `* Fairness & Non-discrimination` |
| **Level 3** | `   *` (3 spaces) | `   * Bias prevention` |
| **Level 4** | `   * Title \| Description` | `   * Bias prevention \| Techniques for detecting...` |

## Special Characters

- **`.`** (period after number): Marks first-level nodes
- **`*`** (asterisk): Marks second and third-level nodes
- **`|`** (pipe): Separates node title from description
- **Spaces**: 3 spaces before `*` indicate third-level nodes

## Best Practices

1. **Keep titles concise** - Node titles should be short and descriptive
2. **Use descriptions wisely** - Add descriptions only when additional context is needed
3. **Consistent indentation** - Use exactly 3 spaces for third-level indentation
4. **Logical grouping** - Group related concepts under the same branch
5. **Balanced structure** - Try to keep branches roughly balanced in complexity

## Editing in the App

Once loaded:
- **Double-click** a node to edit its content
- **Right-click** for context menu options
- **Add descriptions** in the edit modal's "Descripción" field
- **Add notes** in the "Notas Adicionales" field
- **Upload images** to enhance nodes with visual content

## File Formats Supported

The app accepts:
- `.md` - Markdown files
- `.txt` - Plain text files
- `.pmap` - Mindmap format files
- `.json` - JSON format files

## Loading Your Mindmap

1. Click "📄 Cargar archivo" button
2. Select your formatted text/markdown file
3. Or paste directly into the text area
4. Click "GENERAR MAPA MENTAL"

## Tips

- Start with a clear central topic
- Break down complex ideas into 3-5 main branches (Level 1)
- Add 3-7 sub-branches per main branch (Level 2)
- Use Level 3 for specific details or examples
- Use descriptions (with `|`) to add explanatory text
- Keep the overall structure balanced and not too deep

## Example Projects

The app includes example mindmaps you can reference:
- **IA Responsable** (default) - Responsible AI framework
- Create your own following the same structure

---

**Need help?** Load the default mindmap and use "Exportar" to see the exact format of a working mindmap.
