# 🎯 Natural Language Mindmap Creation Guide

## PWC Mindmap MCP v2.1.0 - Enhanced with Natural Language Interface

This guide shows you how to create mindmaps using **natural conversation** with Claude Code.

---

## ✨ What's New in v2.1.0

### **New Tool: `create_mindmap_smart`**

Create mindmaps by simply describing what you want - no need to specify levels or complex structures!

**Before (v2.0):**
```
Use create_mindmap with:
- topic: "Cybersecurity"
- nodes: [
    { title: "Security Policies", level: 1, description: "..." },
    { title: "Threat Detection", level: 1, description: "..." }
  ]
```

**Now (v2.1):**
```
Just say: "Create a cybersecurity mindmap with Security Policies and Threat Detection"
```

Claude will automatically use `create_mindmap_smart` to handle it!

---

## 🚀 Usage Examples

### Example 1: Simple Two-Node Mindmap
**You say:**
> "Create a mindmap about Cybersecurity with two nodes: Security Policies and Threat Detection"

**Claude does:**
```javascript
create_mindmap({
  topic: "Cybersecurity",
  nodes: [
    { title: "Security Policies", description: "Framework for organizational security", level: 1 },
    { title: "Threat Detection", description: "Monitoring and identifying threats", level: 1 }
  ]
})
```

**Result:**
```
Cybersecurity
1. Security Policies | Framework for organizational security
2. Threat Detection | Monitoring and identifying threats
```

---

### Example 2: Multi-Section Mindmap
**You say:**
> "Build a Risk Management mindmap with sections for Identification, Assessment, Mitigation, and Monitoring"

**Claude creates:**
```
Risk Management
1. Identification
2. Assessment
3. Mitigation
4. Monitoring
```

---

### Example 3: Detailed Mindmap with Descriptions
**You say:**
> "Create a Data Privacy mindmap covering GDPR Compliance, Data Encryption, Access Controls, and Audit Trails"

**Result:**
```
Data Privacy
1. GDPR Compliance
2. Data Encryption
3. Access Controls
4. Audit Trails
```

Then you can add details:
> "Add a description to GDPR Compliance: Ensuring adherence to EU data protection regulations"

---

## 🎨 Advanced Features

### Adding Child Nodes
After creating your mindmap, expand it naturally:

```
You: "Add 'Authentication Methods' under Access Controls"
Claude: Uses add_node with parentTitle="Access Controls"
```

### Searching and Adding Images
```
You: "Find images for cybersecurity and add one to the Security Policies node"
Claude:
  1. Uses search_images with query="cybersecurity"
  2. Uses add_image_to_node with selected image
```

### Creating Categories
```
You: "Create a category called 'Critical' with color #ff6b6b"
Claude: Uses create_category
```

### Connecting Nodes with Relationships
```
You: "Create a 'depends on' relationship and connect Threat Detection to Security Policies"
Claude:
  1. Uses create_relationship
  2. Uses connect_nodes
```

---

## 📝 Conversational Patterns

### Pattern 1: Create → View → Enhance
```
1. "Create a mindmap about Cloud Security"
2. "Show me the project data"
3. "Add Infrastructure Security and Application Security nodes"
4. "Add descriptions to both"
```

### Pattern 2: Create → Organize → Export
```
1. "Build an AI Ethics mindmap with 5 key principles"
2. "Reorder nodes to put Transparency first"
3. "Set focus mode on Transparency"
4. "Get the complete project data for export"
```

### Pattern 3: Batch Operations
```
1. "Create a Product Roadmap mindmap"
2. "Add these nodes: Q1 Features, Q2 Features, Q3 Features, Q4 Features"
3. "Create categories: High Priority (red), Medium Priority (yellow), Low Priority (green)"
4. "Assign High Priority to Q1 Features"
```

---

## 🔧 Behind the Scenes

When you say:
> "Create a cybersecurity mindmap with 2 nodes"

Claude Code:
1. **Identifies intent**: Creating a mindmap
2. **Extracts parameters**:
   - Topic: "cybersecurity"
   - Node count: 2
3. **Selects appropriate tool**: `create_mindmap` or `create_mindmap_smart`
4. **Auto-fills parameters**: Generates sensible defaults
5. **Executes**: Creates the mindmap file
6. **Confirms**: Shows you the result

---

## 🎯 Best Practices

### ✅ DO
- Use clear, descriptive topics
- Keep node names concise (< 50 characters)
- Add descriptions for clarity
- Use categories to organize large mindmaps
- Leverage relationships for complex connections

### ❌ DON'T
- Use special characters in topic names (they're auto-sanitized)
- Create duplicate project names (will error)
- Forget to specify parent when adding nested nodes
- Delete projects without archiving (use `moveToArchive: true`)

---

## 🚀 Complete Workflow Example

```
You: "Create a comprehensive Incident Response mindmap"

Claude: ✅ Created mindmap "Incident Response"

You: "Add these sections: Detection, Analysis, Containment, Eradication, Recovery"

Claude: ✅ Added 5 nodes

You: "Add 'Email Alerts' and 'SIEM Monitoring' under Detection"

Claude: ✅ Added 2 child nodes under Detection

You: "Create a 'triggers' relationship with color #e74c3c"

Claude: ✅ Created relationship "triggers"

You: "Connect Detection to Analysis with triggers relationship"

Claude: ✅ Connected "Detection" to "Analysis"

You: "Search for incident response images"

Claude: Found 5 images:
1. Security operations center
2. Incident response team
3. ...

You: "Add the first image to the Detection node"

Claude: ✅ Added image to "Detection"

You: "Get the complete project data"

Claude: [Returns full JSON with all nodes, relationships, images, etc.]
```

---

## 📊 Available Tools Summary

| Tool | Purpose | Natural Language Example |
|------|---------|-------------------------|
| `create_mindmap` | Create new mindmap | "Create mindmap about X" |
| `create_mindmap_smart` | Create with auto-structure | "Build mindmap with A, B, C" |
| `add_node` | Add nodes | "Add Security Policies" |
| `update_node` | Modify nodes | "Change title to..." |
| `delete_node` | Remove nodes | "Delete the X node" |
| `search_images` | Find images | "Search for security images" |
| `add_image_to_node` | Attach images | "Add image to node X" |
| `create_category` | Create categories | "Create red category called Important" |
| `assign_category` | Tag nodes | "Mark X as Important" |
| `create_relationship` | Define connections | "Create 'depends on' relationship" |
| `connect_nodes` | Link nodes | "Connect A to B with depends on" |
| `set_focus_mode` | Presentation mode | "Focus on Security Policies" |
| `list_projects` | See all projects | "Show my mindmaps" |
| `get_project_data` | Export data | "Get project data for X" |
| `delete_project` | Archive/remove | "Delete project X" |

---

## 🎓 Learning Path

1. **Basic**: Create simple mindmaps with 2-3 nodes
2. **Intermediate**: Add child nodes, descriptions, images
3. **Advanced**: Use categories, relationships, focus mode
4. **Expert**: Batch operations, complex hierarchies, custom layouts

---

## 🔗 Integration with Electron App

All mindmaps created via MCP are immediately available in the PWC Mindmap Pro desktop app:

**Storage Location:**
```
~/Documents/PWC Mindmaps/
```

**File Format:**
```
ProjectName.pmap (JSON format)
```

**Auto-sync:**
- Changes via MCP → Visible in app (reload project)
- Changes in app → Visible via MCP (re-read file)

---

## 🐛 Troubleshooting

### "Project already exists"
```
Solution: Choose a different name or delete/archive the existing project
```

### "Node not found"
```
Solution: Check spelling (case-insensitive search used)
```

### "Category/Relationship not found"
```
Solution: Create it first with create_category or create_relationship
```

### "Invalid project name"
```
Solution: Avoid special characters: < > : " / \ | ? *
```

---

## 🎉 Quick Start Checklist

- [ ] MCP server installed: `claude mcp add pwc-mindmap node ~/Documents/GitHub/mindmap-macos-app/mcp-server/index.js`
- [ ] Test basic creation: "Create a test mindmap"
- [ ] List projects: "Show me all my mindmaps"
- [ ] Add nodes: "Add a node called Example"
- [ ] View data: "Get the project data"
- [ ] Clean up: "Delete the test project"

---

**Version:** 2.1.0
**Updated:** January 2025
**Author:** Gonzalo Riederer

🚀 **Ready to create amazing mindmaps with natural language!**
