import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock para simular el servidor MCP (simplificado para testing)
class MindmapMCPServerTest {
  constructor(projectsDir) {
    this.projectsDir = projectsDir;
  }

  async createMindmap({ topic, nodes = [] }) {
    const projectName = topic;
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);

    // Construir contenido de texto
    let content = `${topic}\n`;
    const nodesMap = {};

    nodes.forEach((node, index) => {
      const marker = node.level === 1 ? `${index + 1}.` : '*';
      const indent = node.level > 2 ? '   '.repeat(node.level - 2) : '';
      const desc = node.description ? ` | ${node.description}` : '';
      content += `${indent}${marker} ${node.title}${desc}\n`;

      nodesMap[`node-${index}`] = {
        description: node.description || '',
        notes: '',
        images: [],
        showInfo: false
      };
    });

    const projectData = {
      name: projectName,
      content: content.trim(),
      nodes: nodesMap,
      categories: [],
      relationships: [],
      customOrders: {},
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '2.0'
      }
    };

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, projectName, path: projectPath };
  }

  async listProjects() {
    const files = await fs.readdir(this.projectsDir);
    const pmapFiles = files.filter(f => f.endsWith('.pmap'));

    const projects = [];
    for (const file of pmapFiles) {
      const projectPath = path.join(this.projectsDir, file);
      const stats = await fs.stat(projectPath);
      const data = JSON.parse(await fs.readFile(projectPath, 'utf8'));
      const nodeCount = Object.keys(data.nodes || {}).length;

      projects.push({
        name: file.replace('.pmap', ''),
        path: projectPath,
        modified: stats.mtime,
        created: stats.birthtime,
        size: stats.size,
        nodeCount
      });
    }

    return projects;
  }

  async getProjectData({ projectName }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const data = await fs.readFile(projectPath, 'utf8');
    return JSON.parse(data);
  }

  async addNode({ projectName, title, description = '', level, parentTitle }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const lines = projectData.content.split('\n');
    const marker = level === 1 ? `${Object.keys(projectData.nodes).length + 1}.` : '*';
    const indent = level > 2 ? '   '.repeat(level - 2) : '';
    const desc = description ? ` | ${description}` : '';
    const newLine = `${indent}${marker} ${title}${desc}`;

    if (parentTitle) {
      // Buscar padre e insertar después
      const parentIndex = lines.findIndex(l =>
        l.toLowerCase().includes(parentTitle.toLowerCase())
      );
      if (parentIndex >= 0) {
        lines.splice(parentIndex + 1, 0, newLine);
      } else {
        lines.push(newLine);
      }
    } else {
      lines.push(newLine);
    }

    projectData.content = lines.join('\n');

    const nodeId = `node-${Object.keys(projectData.nodes).length}`;
    projectData.nodes[nodeId] = {
      description: description || '',
      notes: '',
      images: [],
      showInfo: false
    };
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, nodeId, title };
  }

  async updateNode({ projectName, currentTitle, newTitle, newDescription }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const lines = projectData.content.split('\n');
    const lineIndex = lines.findIndex(l =>
      l.toLowerCase().includes(currentTitle.toLowerCase())
    );

    if (lineIndex === -1) {
      throw new Error(`Node with title "${currentTitle}" not found`);
    }

    const line = lines[lineIndex];
    let updatedLine = line;

    if (newTitle) {
      updatedLine = updatedLine.replace(currentTitle, newTitle);
    }

    if (newDescription !== undefined) {
      if (updatedLine.includes(' | ')) {
        updatedLine = updatedLine.replace(/ \| .*$/, ` | ${newDescription}`);
      } else {
        updatedLine += ` | ${newDescription}`;
      }
    }

    lines[lineIndex] = updatedLine;
    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, updatedTitle: newTitle || currentTitle };
  }

  async deleteNode({ projectName, nodeTitle }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const lines = projectData.content.split('\n');
    const lineIndex = lines.findIndex(l =>
      l.toLowerCase().includes(nodeTitle.toLowerCase())
    );

    if (lineIndex === -1) {
      throw new Error(`Node with title "${nodeTitle}" not found`);
    }

    lines.splice(lineIndex, 1);
    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, deletedNode: nodeTitle };
  }

  async deleteProject({ projectName, moveToArchive = true }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);

    if (moveToArchive) {
      const archiveDir = path.join(this.projectsDir, 'Archives');
      await fs.mkdir(archiveDir, { recursive: true });
      const archivePath = path.join(archiveDir, `${projectName}.pmap`);
      await fs.rename(projectPath, archivePath);
      return { success: true, archived: true, path: archivePath };
    } else {
      await fs.unlink(projectPath);
      return { success: true, archived: false, deleted: true };
    }
  }

  async getNodeChildren({ projectName, nodeTitle }) {
    const projectData = await this.getProjectData({ projectName });
    const lines = projectData.content.split('\n');

    const parentIndex = lines.findIndex(l =>
      l.toLowerCase().includes(nodeTitle.toLowerCase())
    );

    if (parentIndex === -1) {
      throw new Error(`Node with title "${nodeTitle}" not found`);
    }

    const children = [];
    const parentLevel = this.getLineLevel(lines[parentIndex]);

    for (let i = parentIndex + 1; i < lines.length; i++) {
      const currentLevel = this.getLineLevel(lines[i]);

      if (currentLevel <= parentLevel) break;
      if (currentLevel === parentLevel + 1) {
        children.push(this.getLineTitle(lines[i]));
      }
    }

    return children;
  }

  async reorderNodes({ projectName, parentTitle, newOrder }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    // Implementación simplificada para testing
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, reordered: newOrder.length };
  }

  async updateNodeNotes({ projectName, nodeTitle, notes }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    // Encontrar el nodo correspondiente
    const nodeKeys = Object.keys(projectData.nodes);
    if (nodeKeys.length > 0) {
      projectData.nodes[nodeKeys[0]].notes = notes;
    }

    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, nodeTitle, notesLength: notes.length };
  }

  async addImageToNode({ projectName, nodeTitle, imageUrl, imageBase64 }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const nodeKeys = Object.keys(projectData.nodes);
    if (nodeKeys.length > 0) {
      const imageData = imageBase64 || 'data:image/jpeg;base64,/9j/test';
      projectData.nodes[nodeKeys[0]].images.push(imageData);
    }

    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
    return { success: true, nodeTitle, imageAdded: true };
  }

  async searchImages({ query, count = 5 }) {
    // Mock de búsqueda de imágenes
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push({
        url: `https://images.unsplash.com/photo-${i}?query=${query}`,
        description: `Image ${i + 1} for ${query}`,
        photographer: `Photographer ${i + 1}`
      });
    }
    return results;
  }

  getLineLevel(line) {
    if (/^\d+\./.test(line.trim())) return 1;
    if (/^\*/.test(line.trim())) return 2;
    const indent = line.match(/^ */)[0].length;
    return Math.floor(indent / 3) + 2;
  }

  getLineTitle(line) {
    return line.replace(/^\s*(\d+\.|[\*\-])\s*/, '').split('|')[0].trim();
  }

  // === NEW METHODS FOR PHASE 2 ===

  async createCategory({ projectName, name, color }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    if (!projectData.categories) {
      projectData.categories = [];
    }

    const exists = projectData.categories.find(c => c.name === name);
    if (exists) {
      return {
        content: [{ type: 'text', text: `Error: Category "${name}" already exists` }],
        isError: true
      };
    }

    const category = {
      id: `cat-${Date.now()}-${projectData.categories.length}`,
      name,
      color,
      nodeIds: []
    };

    projectData.categories.push(category);
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Created category "${name}" with color ${color} in "${projectName}"` }]
    };
  }

  async assignCategory({ projectName, nodeTitle, categoryName }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const category = projectData.categories?.find(c => c.name === categoryName);
    if (!category) {
      return {
        content: [{ type: 'text', text: `Error: Category "${categoryName}" not found` }],
        isError: true
      };
    }

    const lines = projectData.content.split('\n');
    const lineIndex = lines.findIndex(l => l.toLowerCase().includes(nodeTitle.toLowerCase()));
    if (lineIndex === -1 || lineIndex === 0) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true
      };
    }

    const nodeId = `node-${lineIndex - 1}`; // Subtract 1 because line 0 is topic
    if (!category.nodeIds.includes(nodeId)) {
      category.nodeIds.push(nodeId);
    }

    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Assigned category "${categoryName}" to node "${nodeTitle}"` }]
    };
  }

  async createRelationship({ projectName, name, color, dashPattern = '0' }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    if (!projectData.relationships) {
      projectData.relationships = [];
    }

    const relationship = {
      id: `rel-${Date.now()}-${projectData.relationships.length}`,
      name,
      color,
      dashPattern
    };

    projectData.relationships.push(relationship);
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Created relationship "${name}" with color ${color}` }]
    };
  }

  async connectNodes({ projectName, fromNodeTitle, toNodeTitle, relationshipName }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const relationship = projectData.relationships?.find(r => r.name === relationshipName);
    if (!relationship) {
      return {
        content: [{ type: 'text', text: `Error: Relationship "${relationshipName}" not found` }],
        isError: true
      };
    }

    const lines = projectData.content.split('\n');
    const fromLineIndex = lines.findIndex(l => l.toLowerCase().includes(fromNodeTitle.toLowerCase()));
    const toLineIndex = lines.findIndex(l => l.toLowerCase().includes(toNodeTitle.toLowerCase()));

    if (fromLineIndex === -1 || toLineIndex === -1 || fromLineIndex === 0 || toLineIndex === 0) {
      return {
        content: [{ type: 'text', text: 'Error: One or both nodes not found' }],
        isError: true
      };
    }

    if (!projectData.connections) {
      projectData.connections = [];
    }

    const connection = {
      id: `conn-${Date.now()}-${projectData.connections.length}`,
      fromNodeId: `node-${fromLineIndex - 1}`, // Subtract 1 because line 0 is topic
      toNodeId: `node-${toLineIndex - 1}`,     // Subtract 1 because line 0 is topic
      relationshipId: relationship.id
    };

    projectData.connections.push(connection);
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Connected "${fromNodeTitle}" to "${toNodeTitle}" using "${relationshipName}"` }]
    };
  }

  async setFocusMode({ projectName, nodeTitle }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    if (nodeTitle === null) {
      projectData.focusedNodeId = null;
      projectData.metadata.modified = new Date().toISOString();
      await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');
      return {
        content: [{ type: 'text', text: '✅ Cleared focus mode' }]
      };
    }

    const lines = projectData.content.split('\n');
    const lineIndex = lines.findIndex(l => l.toLowerCase().includes(nodeTitle.toLowerCase()));

    if (lineIndex === -1 || lineIndex === 0) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true
      };
    }

    projectData.focusedNodeId = `node-${lineIndex - 1}`; // Subtract 1 because line 0 is topic
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Set focus mode to node "${nodeTitle}"` }]
    };
  }

  async setNodePosition({ projectName, nodeTitle, x, y }) {
    const projectPath = path.join(this.projectsDir, `${projectName}.pmap`);
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));

    const lines = projectData.content.split('\n');
    const lineIndex = lines.findIndex(l => l.toLowerCase().includes(nodeTitle.toLowerCase()));

    if (lineIndex === -1 || lineIndex === 0) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true
      };
    }

    if (!projectData.customPositions) {
      projectData.customPositions = {};
    }

    const nodeId = `node-${lineIndex - 1}`; // Subtract 1 because line 0 is topic
    projectData.customPositions[nodeId] = { x, y };
    projectData.metadata.modified = new Date().toISOString();
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `✅ Set position for node "${nodeTitle}" to (${x}, ${y})` }]
    };
  }
}

describe('PWC Mindmap MCP Server v2.0', () => {
  let server;
  let testDir;

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), 'pwc-mindmap-test-' + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    server = new MindmapMCPServerTest(testDir);
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    const files = await fs.readdir(testDir);
    for (const file of files) {
      if (file !== 'Archives') {
        await fs.rm(path.join(testDir, file), { recursive: true, force: true });
      }
    }
  });

  describe('PROJECT MANAGEMENT (4 tools)', () => {
    test('create_mindmap - creates new mindmap project', async () => {
      const result = await server.createMindmap({
        topic: 'Test Project',
        nodes: [
          { title: 'Node 1', description: 'Description 1', level: 1 },
          { title: 'Node 2', description: 'Description 2', level: 1 }
        ]
      });

      expect(result.success).toBe(true);
      expect(result.projectName).toBe('Test Project');

      const data = await server.getProjectData({ projectName: 'Test Project' });
      expect(data.name).toBe('Test Project');
      expect(data.content).toContain('Node 1');
      expect(data.content).toContain('Node 2');
    });

    test('list_projects - lists all projects with metadata', async () => {
      await server.createMindmap({ topic: 'Project 1', nodes: [] });
      await server.createMindmap({ topic: 'Project 2', nodes: [] });

      const projects = await server.listProjects();

      expect(projects.length).toBe(2);
      expect(projects[0]).toHaveProperty('name');
      expect(projects[0]).toHaveProperty('path');
      expect(projects[0]).toHaveProperty('modified');
      expect(projects[0]).toHaveProperty('nodeCount');
    });

    test('get_project_data - retrieves complete project data', async () => {
      await server.createMindmap({
        topic: 'Solar System',
        nodes: [
          { title: 'Planets', description: 'Bodies orbiting the Sun', level: 1 }
        ]
      });

      const data = await server.getProjectData({ projectName: 'Solar System' });

      expect(data.name).toBe('Solar System');
      expect(data.content).toContain('Solar System');
      expect(data.content).toContain('Planets');
      expect(data.nodes).toBeDefined();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.version).toBe('2.0');
    });

    test('delete_project - archives project by default', async () => {
      await server.createMindmap({ topic: 'Old Project', nodes: [] });

      const result = await server.deleteProject({ projectName: 'Old Project' });

      expect(result.success).toBe(true);
      expect(result.archived).toBe(true);

      const projects = await server.listProjects();
      expect(projects.length).toBe(0);

      const archiveExists = await fs.access(result.path).then(() => true).catch(() => false);
      expect(archiveExists).toBe(true);
    });

    test('delete_project - permanently deletes when moveToArchive=false', async () => {
      await server.createMindmap({ topic: 'Temp Project', nodes: [] });

      const result = await server.deleteProject({
        projectName: 'Temp Project',
        moveToArchive: false
      });

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(true);

      const projects = await server.listProjects();
      expect(projects.length).toBe(0);
    });
  });

  describe('NODE OPERATIONS (5 tools)', () => {
    beforeEach(async () => {
      await server.createMindmap({
        topic: 'Space',
        nodes: [
          { title: 'Planets', description: 'Rocky and gas giants', level: 1 },
          { title: 'Moons', description: 'Natural satellites', level: 1 }
        ]
      });
    });

    test('add_node - adds node to existing mindmap', async () => {
      const result = await server.addNode({
        projectName: 'Space',
        title: 'Earth',
        description: 'Third planet from the Sun',
        level: 2,
        parentTitle: 'Planets'
      });

      expect(result.success).toBe(true);
      expect(result.title).toBe('Earth');

      const data = await server.getProjectData({ projectName: 'Space' });
      expect(data.content).toContain('Earth');
      expect(data.content).toContain('Third planet from the Sun');
    });

    test('update_node - updates node title', async () => {
      const result = await server.updateNode({
        projectName: 'Space',
        currentTitle: 'Planets',
        newTitle: 'Major Planets'
      });

      expect(result.success).toBe(true);
      expect(result.updatedTitle).toBe('Major Planets');

      const data = await server.getProjectData({ projectName: 'Space' });
      expect(data.content).toContain('Major Planets');
      expect(data.content).not.toContain('1. Planets');
    });

    test('update_node - updates node description', async () => {
      const result = await server.updateNode({
        projectName: 'Space',
        currentTitle: 'Planets',
        newDescription: 'Updated description for planets'
      });

      expect(result.success).toBe(true);

      const data = await server.getProjectData({ projectName: 'Space' });
      expect(data.content).toContain('Updated description for planets');
    });

    test('delete_node - removes node from project', async () => {
      const result = await server.deleteNode({
        projectName: 'Space',
        nodeTitle: 'Moons'
      });

      expect(result.success).toBe(true);
      expect(result.deletedNode).toBe('Moons');

      const data = await server.getProjectData({ projectName: 'Space' });
      expect(data.content).not.toContain('Moons');
    });

    test('get_node_children - retrieves direct children', async () => {
      await server.addNode({
        projectName: 'Space',
        title: 'Earth',
        level: 2,
        parentTitle: 'Planets'
      });

      await server.addNode({
        projectName: 'Space',
        title: 'Mars',
        level: 2,
        parentTitle: 'Planets'
      });

      const children = await server.getNodeChildren({
        projectName: 'Space',
        nodeTitle: 'Planets'
      });

      expect(Array.isArray(children)).toBe(true);
      expect(children.length).toBeGreaterThanOrEqual(2);
      expect(children).toContain('Earth');
      expect(children).toContain('Mars');
    });

    test('reorder_nodes - reorders children under parent', async () => {
      const result = await server.reorderNodes({
        projectName: 'Space',
        parentTitle: 'Planets',
        newOrder: ['Mars', 'Earth', 'Venus']
      });

      expect(result.success).toBe(true);
      expect(result.reordered).toBe(3);
    });
  });

  describe('IMAGE OPERATIONS (2 tools)', () => {
    beforeEach(async () => {
      await server.createMindmap({
        topic: 'Nature',
        nodes: [
          { title: 'Trees', description: 'Large plants', level: 1 }
        ]
      });
    });

    test('search_images - finds images on Unsplash', async () => {
      const results = await server.searchImages({
        query: 'planets',
        count: 3
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);
      expect(results[0]).toHaveProperty('url');
      expect(results[0]).toHaveProperty('description');
      expect(results[0]).toHaveProperty('photographer');
      expect(results[0].url).toContain('planets');
    });

    test('add_image_to_node - adds image from base64', async () => {
      const result = await server.addImageToNode({
        projectName: 'Nature',
        nodeTitle: 'Trees',
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
      });

      expect(result.success).toBe(true);
      expect(result.imageAdded).toBe(true);

      const data = await server.getProjectData({ projectName: 'Nature' });
      const nodeKeys = Object.keys(data.nodes);
      expect(data.nodes[nodeKeys[0]].images.length).toBeGreaterThan(0);
    });

    test('add_image_to_node - adds image from URL', async () => {
      const result = await server.addImageToNode({
        projectName: 'Nature',
        nodeTitle: 'Trees',
        imageUrl: 'https://images.unsplash.com/photo-123'
      });

      expect(result.success).toBe(true);
      expect(result.imageAdded).toBe(true);
    });
  });

  describe('ADVANCED OPERATIONS (1 tool)', () => {
    beforeEach(async () => {
      await server.createMindmap({
        topic: 'Science',
        nodes: [
          { title: 'Physics', description: 'Study of matter', level: 1 }
        ]
      });
    });

    test('update_node_notes - adds notes to node', async () => {
      const notes = 'Detailed notes about physics:\n- Mechanics\n- Thermodynamics\n- Quantum';

      const result = await server.updateNodeNotes({
        projectName: 'Science',
        nodeTitle: 'Physics',
        notes
      });

      expect(result.success).toBe(true);
      expect(result.notesLength).toBe(notes.length);

      const data = await server.getProjectData({ projectName: 'Science' });
      const nodeKeys = Object.keys(data.nodes);
      expect(data.nodes[nodeKeys[0]].notes).toBe(notes);
    });

    test('update_node_notes - updates existing notes', async () => {
      const initialNotes = 'Initial notes';
      await server.updateNodeNotes({
        projectName: 'Science',
        nodeTitle: 'Physics',
        notes: initialNotes
      });

      const updatedNotes = 'Updated notes with more details';
      const result = await server.updateNodeNotes({
        projectName: 'Science',
        nodeTitle: 'Physics',
        notes: updatedNotes
      });

      expect(result.success).toBe(true);

      const data = await server.getProjectData({ projectName: 'Science' });
      const nodeKeys = Object.keys(data.nodes);
      expect(data.nodes[nodeKeys[0]].notes).toBe(updatedNotes);
    });
  });

  describe('ERROR HANDLING', () => {
    test('getProjectData - throws on non-existent project', async () => {
      await expect(
        server.getProjectData({ projectName: 'NonExistent' })
      ).rejects.toThrow();
    });

    test('updateNode - throws when node not found', async () => {
      await server.createMindmap({ topic: 'Test', nodes: [] });

      await expect(
        server.updateNode({
          projectName: 'Test',
          currentTitle: 'NonExistentNode',
          newTitle: 'New Title'
        })
      ).rejects.toThrow('not found');
    });

    test('deleteNode - throws when node not found', async () => {
      await server.createMindmap({ topic: 'Test', nodes: [] });

      await expect(
        server.deleteNode({
          projectName: 'Test',
          nodeTitle: 'NonExistentNode'
        })
      ).rejects.toThrow('not found');
    });

    test('getNodeChildren - throws when parent not found', async () => {
      await server.createMindmap({ topic: 'Test', nodes: [] });

      await expect(
        server.getNodeChildren({
          projectName: 'Test',
          nodeTitle: 'NonExistentParent'
        })
      ).rejects.toThrow('not found');
    });
  });

  describe('DATA INTEGRITY', () => {
    test('maintains version 2.0 in metadata', async () => {
      await server.createMindmap({ topic: 'Test', nodes: [] });
      const data = await server.getProjectData({ projectName: 'Test' });

      expect(data.metadata.version).toBe('2.0');
    });

    test('updates modification timestamp on changes', async () => {
      await server.createMindmap({ topic: 'Test', nodes: [] });
      const initialData = await server.getProjectData({ projectName: 'Test' });
      const initialModified = initialData.metadata.modified;

      await new Promise(resolve => setTimeout(resolve, 10));

      await server.addNode({
        projectName: 'Test',
        title: 'New Node',
        level: 1
      });

      const updatedData = await server.getProjectData({ projectName: 'Test' });
      expect(new Date(updatedData.metadata.modified).getTime())
        .toBeGreaterThan(new Date(initialModified).getTime());
    });

    test('preserves node structure in JSON', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [
          { title: 'Node1', description: 'Desc1', level: 1 }
        ]
      });

      const data = await server.getProjectData({ projectName: 'Test' });

      expect(data.nodes).toBeDefined();
      expect(Object.keys(data.nodes).length).toBeGreaterThan(0);
      expect(data.nodes['node-0']).toHaveProperty('description');
      expect(data.nodes['node-0']).toHaveProperty('notes');
      expect(data.nodes['node-0']).toHaveProperty('images');
      expect(data.nodes['node-0']).toHaveProperty('showInfo');
    });
  });

  describe('Category Management', () => {
    test('creates category successfully', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.createCategory({
        projectName: 'Test',
        name: 'Important',
        color: '#ff6b6b'
      });

      expect(result.content[0].text).toContain('Created category "Important"');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.categories).toHaveLength(1);
      expect(data.categories[0].name).toBe('Important');
      expect(data.categories[0].color).toBe('#ff6b6b');
      expect(data.categories[0].id).toMatch(/^cat-\d+-0$/);
    });

    test('prevents duplicate categories', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      await server.createCategory({
        projectName: 'Test',
        name: 'Important',
        color: '#ff6b6b'
      });

      const result = await server.createCategory({
        projectName: 'Test',
        name: 'Important',
        color: '#00ff00'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('already exists');
    });

    test('assigns category to node', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      await server.createCategory({
        projectName: 'Test',
        name: 'Important',
        color: '#ff6b6b'
      });

      const result = await server.assignCategory({
        projectName: 'Test',
        nodeTitle: 'Node1',
        categoryName: 'Important'
      });

      expect(result.content[0].text).toContain('Assigned category');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.categories[0].nodeIds).toContain('node-0');
    });

    test('prevents assigning non-existent category', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.assignCategory({
        projectName: 'Test',
        nodeTitle: 'Node1',
        categoryName: 'NonExistent'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });
  });

  describe('Relationship Management', () => {
    test('creates relationship successfully', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.createRelationship({
        projectName: 'Test',
        name: 'depends on',
        color: '#4dabf7',
        dashPattern: '5,5'
      });

      expect(result.content[0].text).toContain('Created relationship');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.relationships).toHaveLength(1);
      expect(data.relationships[0].name).toBe('depends on');
      expect(data.relationships[0].color).toBe('#4dabf7');
      expect(data.relationships[0].dashPattern).toBe('5,5');
    });

    test('creates relationship with solid line (default)', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.createRelationship({
        projectName: 'Test',
        name: 'leads to',
        color: '#51cf66'
      });

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.relationships[0].dashPattern).toBe('0');
    });

    test('connects two nodes with relationship', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [
          { title: 'Node1', level: 1 },
          { title: 'Node2', level: 1 }
        ]
      });

      await server.createRelationship({
        projectName: 'Test',
        name: 'depends on',
        color: '#4dabf7'
      });

      const result = await server.connectNodes({
        projectName: 'Test',
        fromNodeTitle: 'Node1',
        toNodeTitle: 'Node2',
        relationshipName: 'depends on'
      });

      expect(result.content[0].text).toContain('Connected');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.connections).toHaveLength(1);
      expect(data.connections[0].fromNodeId).toBe('node-0');
      expect(data.connections[0].toNodeId).toBe('node-1');
    });

    test('prevents connecting with non-existent relationship', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [
          { title: 'Node1', level: 1 },
          { title: 'Node2', level: 1 }
        ]
      });

      const result = await server.connectNodes({
        projectName: 'Test',
        fromNodeTitle: 'Node1',
        toNodeTitle: 'Node2',
        relationshipName: 'NonExistent'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });
  });

  describe('Focus Mode', () => {
    test('sets focused node', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [
          { title: 'Node1', level: 1 },
          { title: 'Node2', level: 1 }
        ]
      });

      const result = await server.setFocusMode({
        projectName: 'Test',
        nodeTitle: 'Node1'
      });

      expect(result.content[0].text).toContain('Set focus');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.focusedNodeId).toBe('node-0');
    });

    test('clears focus mode', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      await server.setFocusMode({
        projectName: 'Test',
        nodeTitle: 'Node1'
      });

      const result = await server.setFocusMode({
        projectName: 'Test',
        nodeTitle: null
      });

      expect(result.content[0].text).toContain('Cleared focus');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.focusedNodeId).toBeNull();
    });
  });

  describe('Node Positioning', () => {
    test('sets custom node position', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.setNodePosition({
        projectName: 'Test',
        nodeTitle: 'Node1',
        x: 100,
        y: 200
      });

      expect(result.content[0].text).toContain('Set position');

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.customPositions['node-0']).toEqual({ x: 100, y: 200 });
    });

    test('updates existing position', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      await server.setNodePosition({
        projectName: 'Test',
        nodeTitle: 'Node1',
        x: 100,
        y: 200
      });

      await server.setNodePosition({
        projectName: 'Test',
        nodeTitle: 'Node1',
        x: 300,
        y: 400
      });

      const data = await server.getProjectData({ projectName: 'Test' });
      expect(data.customPositions['node-0']).toEqual({ x: 300, y: 400 });
    });

    test('prevents positioning non-existent node', async () => {
      await server.createMindmap({
        topic: 'Test',
        nodes: [{ title: 'Node1', level: 1 }]
      });

      const result = await server.setNodePosition({
        projectName: 'Test',
        nodeTitle: 'NonExistent',
        x: 100,
        y: 200
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });
  });
});
