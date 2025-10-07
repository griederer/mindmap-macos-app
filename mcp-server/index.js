#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Projects directory path
const PROJECTS_DIR = path.join(os.homedir(), 'Documents', 'PWC Mindmaps');
const METADATA_FILE = path.join(PROJECTS_DIR, '.metadata.json');

// Unsplash API (free tier - 50 requests/hour)
const UNSPLASH_ACCESS_KEY = 'demo'; // Replace with your own key for production

/**
 * PWC Mindmap MCP Server - Complete Edition
 * Full control over mindmap creation and manipulation
 */
class MindmapMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'pwc-mindmap-mcp',
        version: '2.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // === PROJECT MANAGEMENT ===
        {
          name: 'list_projects',
          description: 'List all mindmap projects with metadata',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'create_mindmap',
          description: 'Create a new mindmap project',
          inputSchema: {
            type: 'object',
            properties: {
              topic: { type: 'string', description: 'Main topic/title' },
              nodes: {
                type: 'array',
                description: 'Initial nodes (optional)',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    level: { type: 'number' },
                  },
                  required: ['title', 'level'],
                },
              },
            },
            required: ['topic'],
          },
        },
        {
          name: 'get_project_data',
          description: 'Get complete project data',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
            },
            required: ['projectName'],
          },
        },
        {
          name: 'delete_project',
          description: 'Delete a mindmap project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              moveToArchive: {
                type: 'boolean',
                description: 'Move to archive instead of permanent delete (default: true)',
              },
            },
            required: ['projectName'],
          },
        },

        // === NODE OPERATIONS ===
        {
          name: 'add_node',
          description: 'Add a new node to mindmap',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              level: { type: 'number' },
              parentTitle: { type: 'string' },
            },
            required: ['projectName', 'title', 'level'],
          },
        },
        {
          name: 'update_node',
          description: 'Update existing node title/description',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              currentTitle: { type: 'string', description: 'Current title to find node' },
              newTitle: { type: 'string', description: 'New title (optional)' },
              newDescription: { type: 'string', description: 'New description (optional)' },
            },
            required: ['projectName', 'currentTitle'],
          },
        },
        {
          name: 'delete_node',
          description: 'Delete a node and its children',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              nodeTitle: { type: 'string' },
            },
            required: ['projectName', 'nodeTitle'],
          },
        },
        {
          name: 'get_node_children',
          description: 'Get all children of a specific node',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              nodeTitle: { type: 'string' },
            },
            required: ['projectName', 'nodeTitle'],
          },
        },
        {
          name: 'reorder_nodes',
          description: 'Reorder children nodes under a parent',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              parentTitle: { type: 'string', description: 'Parent node title (null for root level)' },
              newOrder: {
                type: 'array',
                description: 'Array of node titles in desired order',
                items: { type: 'string' },
              },
            },
            required: ['projectName', 'newOrder'],
          },
        },

        // === IMAGE OPERATIONS ===
        {
          name: 'search_images',
          description: 'Search for images on Unsplash',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              count: { type: 'number', description: 'Number of results (default: 5)' },
            },
            required: ['query'],
          },
        },
        {
          name: 'add_image_to_node',
          description: 'Add image to a node from URL or base64',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              nodeTitle: { type: 'string' },
              imageUrl: { type: 'string', description: 'Image URL to download' },
              imageBase64: { type: 'string', description: 'Base64 encoded image' },
            },
            required: ['projectName', 'nodeTitle'],
          },
        },

        // === ADVANCED OPERATIONS ===
        {
          name: 'update_node_notes',
          description: 'Update additional notes for a node',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              nodeTitle: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['projectName', 'nodeTitle', 'notes'],
          },
        },

        // === CATEGORY MANAGEMENT ===
        {
          name: 'create_category',
          description: 'Create a new category for node organization',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              name: { type: 'string', description: 'Category name' },
              color: { type: 'string', description: 'Hex color code (e.g., #ff6b6b)' },
            },
            required: ['projectName', 'name', 'color'],
          },
        },
        {
          name: 'assign_category',
          description: 'Assign a category to a node',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              nodeTitle: { type: 'string', description: 'Node title' },
              categoryName: { type: 'string', description: 'Category name' },
            },
            required: ['projectName', 'nodeTitle', 'categoryName'],
          },
        },

        // === RELATIONSHIP MANAGEMENT ===
        {
          name: 'create_relationship',
          description: 'Create a new relationship type for connections',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              name: { type: 'string', description: 'Relationship name (e.g., "depends on")' },
              color: { type: 'string', description: 'Hex color code' },
              dashPattern: {
                type: 'string',
                description: 'SVG dash pattern (e.g., "5,5" for dashed, "0" for solid)',
                default: '0'
              },
            },
            required: ['projectName', 'name', 'color'],
          },
        },
        {
          name: 'connect_nodes',
          description: 'Create a connection between two nodes',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              fromNodeTitle: { type: 'string', description: 'Source node title' },
              toNodeTitle: { type: 'string', description: 'Target node title' },
              relationshipName: { type: 'string', description: 'Relationship type name' },
            },
            required: ['projectName', 'fromNodeTitle', 'toNodeTitle', 'relationshipName'],
          },
        },

        // === LAYOUT CONTROL ===
        {
          name: 'set_focus_mode',
          description: 'Set focused node for filtered view',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              nodeTitle: { type: 'string', description: 'Node title to focus (null to unfocus)' },
            },
            required: ['projectName'],
          },
        },
        {
          name: 'set_node_position',
          description: 'Set custom position for a node',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: { type: 'string', description: 'Project name' },
              nodeTitle: { type: 'string', description: 'Node title' },
              x: { type: 'number', description: 'X coordinate' },
              y: { type: 'number', description: 'Y coordinate' },
            },
            required: ['projectName', 'nodeTitle', 'x', 'y'],
          },
        },

        // === NATURAL LANGUAGE INTERFACE ===
        {
          name: 'create_mindmap_smart',
          description: 'Create mindmap from natural language (auto-detects structure). Use this for conversational mindmap creation.',
          inputSchema: {
            type: 'object',
            properties: {
              topic: { type: 'string', description: 'Main topic/title' },
              nodeDescriptions: {
                type: 'array',
                description: 'Array of node descriptions in plain text (e.g., ["Security Policies", "Threat Detection"])',
                items: { type: 'string' },
              },
            },
            required: ['topic'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Project Management
          case 'list_projects':
            return await this.listProjects();
          case 'create_mindmap':
            return await this.createMindmap(args);
          case 'get_project_data':
            return await this.getProjectData(args);
          case 'delete_project':
            return await this.deleteProject(args);

          // Node Operations
          case 'add_node':
            return await this.addNode(args);
          case 'update_node':
            return await this.updateNode(args);
          case 'delete_node':
            return await this.deleteNode(args);
          case 'get_node_children':
            return await this.getNodeChildren(args);
          case 'reorder_nodes':
            return await this.reorderNodes(args);

          // Image Operations
          case 'search_images':
            return await this.searchImages(args);
          case 'add_image_to_node':
            return await this.addImageToNode(args);

          // Advanced Operations
          case 'update_node_notes':
            return await this.updateNodeNotes(args);

          // Category Management
          case 'create_category':
            return await this.createCategory(args);
          case 'assign_category':
            return await this.assignCategory(args);

          // Relationship Management
          case 'create_relationship':
            return await this.createRelationship(args);
          case 'connect_nodes':
            return await this.connectNodes(args);

          // Layout Control
          case 'set_focus_mode':
            return await this.setFocusMode(args);
          case 'set_node_position':
            return await this.setNodePosition(args);

          // Natural Language Interface
          case 'create_mindmap_smart':
            return await this.createMindmapSmart(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // ==================== PROJECT MANAGEMENT ====================

  async listProjects() {
    try {
      await fs.mkdir(PROJECTS_DIR, { recursive: true });
      const files = await fs.readdir(PROJECTS_DIR);
      const projects = [];

      for (const file of files) {
        if (file.endsWith('.pmap')) {
          const filePath = path.join(PROJECTS_DIR, file);
          const stats = await fs.stat(filePath);
          const data = await fs.readFile(filePath, 'utf-8');
          const projectData = JSON.parse(data);

          projects.push({
            name: projectData.name || path.basename(file, '.pmap'),
            path: filePath,
            modified: stats.mtime,
            created: stats.birthtime,
            size: stats.size,
            nodeCount: (projectData.content.match(/\n/g) || []).length,
          });
        }
      }

      projects.sort((a, b) => b.modified - a.modified);

      return {
        content: [
          {
            type: 'text',
            text: `Found ${projects.length} projects:\n\n${projects
              .map(
                (p, i) =>
                  `${i + 1}. ${p.name}\n   Modified: ${new Date(p.modified).toLocaleString()}\n   Nodes: ~${p.nodeCount}`
              )
              .join('\n\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing projects: ${error.message}` }],
        isError: true,
      };
    }
  }

  async createMindmap({ topic, nodes = [] }) {
    const sanitizedName = topic.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, ' ').trim();
    const projectPath = path.join(PROJECTS_DIR, `${sanitizedName}.pmap`);

    try {
      await fs.access(projectPath);
      return {
        content: [{ type: 'text', text: `Error: Project "${topic}" already exists` }],
        isError: true,
      };
    } catch (error) {
      // Project doesn't exist, proceed
    }

    let content = `${topic}\n`;
    const nodesObject = {};

    if (nodes && nodes.length > 0) {
      nodes.forEach((node, index) => {
        const indent = this.getIndentString(node.level);
        const marker = node.level === 1 ? `${index + 1}.` : '*';
        const desc = node.description ? ` | ${node.description}` : '';
        content += `${indent}${marker} ${node.title}${desc}\n`;

        // Create node entry in nodes object
        nodesObject[`node-${index}`] = {
          description: node.description || '',
          notes: '',
          images: [],
          showInfo: false,
        };
      });
    } else {
      content += '1. Main Idea\n* Subtopic 1\n* Subtopic 2\n';
      // Create default nodes
      nodesObject['node-0'] = { description: '', notes: '', images: [], showInfo: false };
      nodesObject['node-1'] = { description: '', notes: '', images: [], showInfo: false };
      nodesObject['node-2'] = { description: '', notes: '', images: [], showInfo: false };
    }

    const projectData = {
      name: topic,
      content: content.trim(),
      nodes: nodesObject,
      categories: [],
      relationships: [],
      customOrders: {},
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '2.0',
      },
    };

    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    // Update metadata to sync with Electron app
    await this.updateMetadata(projectPath);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Created mindmap "${topic}"\nPath: ${projectPath}\nNodes: ${nodes.length || 2}`,
        },
      ],
    };
  }

  async getProjectData({ projectName }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      const projectData = JSON.parse(data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(projectData, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }
  }

  async deleteProject({ projectName, moveToArchive = true }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    try {
      await fs.access(projectPath);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    if (moveToArchive) {
      const archiveDir = path.join(PROJECTS_DIR, 'Archives');
      await fs.mkdir(archiveDir, { recursive: true });
      const archivePath = path.join(archiveDir, `${projectName}.pmap`);
      await fs.rename(projectPath, archivePath);
      return {
        content: [{ type: 'text', text: `✅ Moved "${projectName}" to Archives` }],
      };
    } else {
      await fs.unlink(projectPath);
      return {
        content: [{ type: 'text', text: `✅ Permanently deleted "${projectName}"` }],
      };
    }
  }

  // ==================== NODE OPERATIONS ====================

  async addNode({ projectName, title, description = '', level, parentTitle }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    const indent = this.getIndentString(level);
    const marker = level === 1 ? `${this.getNextNumberedIndex(lines)}.` : '*';
    const desc = description ? ` | ${description}` : '';
    const newLine = `${indent}${marker} ${title}${desc}`;

    if (parentTitle) {
      const parentIndex = lines.findIndex(
        (line) => this.cleanTitle(line).toLowerCase() === parentTitle.toLowerCase()
      );

      if (parentIndex === -1) {
        return {
          content: [{ type: 'text', text: `Error: Parent node "${parentTitle}" not found` }],
          isError: true,
        };
      }

      lines.splice(parentIndex + 1, 0, newLine);
    } else {
      lines.push(newLine);
    }

    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));
    await this.updateMetadata(projectPath);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added node "${title}" to "${projectName}"${parentTitle ? ` under "${parentTitle}"` : ''}`,
        },
      ],
    };
  }

  async updateNode({ projectName, currentTitle, newTitle, newDescription }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === currentTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${currentTitle}" not found` }],
        isError: true,
      };
    }

    const line = lines[nodeIndex];
    const level = this.getLineLevel(line);
    const indent = this.getIndentString(level);
    const marker = this.getLineMarker(line);

    const title = newTitle || currentTitle;
    let desc = '';

    if (newDescription !== undefined) {
      desc = newDescription ? ` | ${newDescription}` : '';
    } else {
      // Keep existing description
      const parts = line.split('|');
      if (parts.length > 1) {
        desc = ` | ${parts[1].trim()}`;
      }
    }

    lines[nodeIndex] = `${indent}${marker} ${title}${desc}`;

    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Updated node "${currentTitle}" in "${projectName}"`,
        },
      ],
    };
  }

  async deleteNode({ projectName, nodeTitle }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    // Find and remove children (same or higher indent level following the node)
    const nodeLevel = this.getLineLevel(lines[nodeIndex]);
    const linesToRemove = [nodeIndex];

    for (let i = nodeIndex + 1; i < lines.length; i++) {
      const lineLevel = this.getLineLevel(lines[i]);
      if (lineLevel > nodeLevel) {
        linesToRemove.push(i);
      } else {
        break;
      }
    }

    // Remove in reverse to maintain indices
    linesToRemove.reverse().forEach((index) => lines.splice(index, 1));

    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Deleted node "${nodeTitle}" and ${linesToRemove.length - 1} children from "${projectName}"`,
        },
      ],
    };
  }

  async getNodeChildren({ projectName, nodeTitle }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    const nodeLevel = this.getLineLevel(lines[nodeIndex]);
    const children = [];

    for (let i = nodeIndex + 1; i < lines.length; i++) {
      const lineLevel = this.getLineLevel(lines[i]);
      if (lineLevel === nodeLevel + 1) {
        children.push(this.cleanTitle(lines[i]));
      } else if (lineLevel <= nodeLevel) {
        break;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Children of "${nodeTitle}":\n${children.length > 0 ? children.map((c, i) => `${i + 1}. ${c}`).join('\n') : 'No children'}`,
        },
      ],
    };
  }

  async reorderNodes({ projectName, parentTitle, newOrder }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    let parentIndex = -1;
    let targetLevel = 1;

    if (parentTitle) {
      parentIndex = lines.findIndex(
        (line) => this.cleanTitle(line).toLowerCase() === parentTitle.toLowerCase()
      );

      if (parentIndex === -1) {
        return {
          content: [{ type: 'text', text: `Error: Parent node "${parentTitle}" not found` }],
          isError: true,
        };
      }

      targetLevel = this.getLineLevel(lines[parentIndex]) + 1;
    }

    // Find all children at target level
    const childrenIndices = [];
    const startIndex = parentTitle ? parentIndex + 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const lineLevel = this.getLineLevel(lines[i]);

      if (parentTitle && lineLevel <= this.getLineLevel(lines[parentIndex])) {
        break;
      }

      if (lineLevel === targetLevel) {
        childrenIndices.push(i);
      }
    }

    // Extract and reorder
    const childrenLines = childrenIndices.map((i) => lines[i]);
    const reorderedLines = newOrder
      .map((title) =>
        childrenLines.find((line) => this.cleanTitle(line).toLowerCase() === title.toLowerCase())
      )
      .filter(Boolean);

    // Replace in original array
    childrenIndices.forEach((index, i) => {
      if (reorderedLines[i]) {
        lines[index] = reorderedLines[i];
      }
    });

    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Reordered ${reorderedLines.length} nodes under "${parentTitle || 'root'}" in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== IMAGE OPERATIONS ====================

  async searchImages({ query, count = 5 }) {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          per_page: count,
          client_id: UNSPLASH_ACCESS_KEY,
        },
      });

      const results = response.data.results.map((img) => ({
        url: img.urls.small,
        description: img.description || img.alt_description,
        photographer: img.user.name,
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} images for "${query}":\n\n${results
              .map((img, i) => `${i + 1}. ${img.description || 'No description'}\n   URL: ${img.url}\n   By: ${img.photographer}`)
              .join('\n\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching images: ${error.message}\nNote: Using demo key with limited access`,
          },
        ],
        isError: true,
      };
    }
  }

  async addImageToNode({ projectName, nodeTitle, imageUrl, imageBase64 }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Find node in content to generate nodeId
    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    // Generate nodeId (this is a simplified version - app generates proper IDs)
    const nodeId = `node-${nodeIndex}`;

    let imageData = imageBase64;

    if (imageUrl && !imageBase64) {
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        imageData = `data:${mimeType};base64,${base64}`;
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error downloading image: ${error.message}` }],
          isError: true,
        };
      }
    }

    if (!projectData.nodes[nodeId]) {
      projectData.nodes[nodeId] = {
        description: '',
        notes: '',
        images: [],
        showInfo: false,
      };
    }

    projectData.nodes[nodeId].images = projectData.nodes[nodeId].images || [];
    projectData.nodes[nodeId].images.push(imageData);
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added image to node "${nodeTitle}" in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== ADVANCED OPERATIONS ====================

  async updateNodeNotes({ projectName, nodeTitle, notes }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    const nodeId = `node-${nodeIndex}`;

    if (!projectData.nodes[nodeId]) {
      projectData.nodes[nodeId] = {
        description: '',
        notes: '',
        images: [],
        showInfo: false,
      };
    }

    projectData.nodes[nodeId].notes = notes;
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Updated notes for "${nodeTitle}" in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== CATEGORY MANAGEMENT ====================

  async createCategory({ projectName, name, color }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Initialize categories array if not exists
    if (!projectData.categories) {
      projectData.categories = [];
    }

    // Check if category already exists
    const exists = projectData.categories.find(c => c.name === name);
    if (exists) {
      return {
        content: [{ type: 'text', text: `Error: Category "${name}" already exists` }],
        isError: true,
      };
    }

    // Create category
    const category = {
      id: `cat-${Date.now()}-${projectData.categories.length}`,
      name,
      color,
      nodeIds: []
    };

    projectData.categories.push(category);
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Created category "${name}" with color ${color} in "${projectName}"`,
        },
      ],
    };
  }

  async assignCategory({ projectName, nodeTitle, categoryName }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Find category
    const category = projectData.categories?.find(c => c.name === categoryName);
    if (!category) {
      return {
        content: [{ type: 'text', text: `Error: Category "${categoryName}" not found` }],
        isError: true,
      };
    }

    // Find node
    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    const nodeId = `node-${nodeIndex}`;

    // Assign category to node
    if (!category.nodeIds.includes(nodeId)) {
      category.nodeIds.push(nodeId);
      projectData.metadata.modified = new Date().toISOString();
      await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Assigned category "${categoryName}" to node "${nodeTitle}" in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== RELATIONSHIP MANAGEMENT ====================

  async createRelationship({ projectName, name, color, dashPattern = '0' }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Initialize relationships array if not exists
    if (!projectData.relationships) {
      projectData.relationships = [];
    }

    // Check if relationship already exists
    const exists = projectData.relationships.find(r => r.name === name);
    if (exists) {
      return {
        content: [{ type: 'text', text: `Error: Relationship "${name}" already exists` }],
        isError: true,
      };
    }

    // Create relationship
    const relationship = {
      id: `rel-${Date.now()}-${projectData.relationships.length}`,
      name,
      color,
      dashPattern
    };

    projectData.relationships.push(relationship);
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Created relationship "${name}" with color ${color} in "${projectName}"`,
        },
      ],
    };
  }

  async connectNodes({ projectName, fromNodeTitle, toNodeTitle, relationshipName }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Find relationship
    const relationship = projectData.relationships?.find(r => r.name === relationshipName);
    if (!relationship) {
      return {
        content: [{ type: 'text', text: `Error: Relationship "${relationshipName}" not found` }],
        isError: true,
      };
    }

    // Find nodes
    const lines = projectData.content.split('\n');
    const fromNodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === fromNodeTitle.toLowerCase()
    );
    const toNodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === toNodeTitle.toLowerCase()
    );

    if (fromNodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${fromNodeTitle}" not found` }],
        isError: true,
      };
    }

    if (toNodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${toNodeTitle}" not found` }],
        isError: true,
      };
    }

    const fromNodeId = `node-${fromNodeIndex}`;
    const toNodeId = `node-${toNodeIndex}`;

    // Initialize connections array if not exists
    if (!projectData.connections) {
      projectData.connections = [];
    }

    // Create connection
    const connection = {
      id: `conn-${Date.now()}-${projectData.connections.length}`,
      fromNodeId,
      toNodeId,
      relationshipId: relationship.id
    };

    projectData.connections.push(connection);
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Connected "${fromNodeTitle}" to "${toNodeTitle}" with relationship "${relationshipName}" in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== LAYOUT CONTROL ====================

  async setFocusMode({ projectName, nodeTitle = null }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    if (!nodeTitle) {
      // Unfocus
      projectData.focusedNodeId = null;
      projectData.metadata.modified = new Date().toISOString();
      await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

      return {
        content: [
          {
            type: 'text',
            text: `✅ Cleared focus mode in "${projectName}"`,
          },
        ],
      };
    }

    // Find node
    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    const nodeId = `node-${nodeIndex}`;
    projectData.focusedNodeId = nodeId;
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Set focus mode to "${nodeTitle}" in "${projectName}"`,
        },
      ],
    };
  }

  async setNodePosition({ projectName, nodeTitle, x, y }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: Project "${projectName}" not found` }],
        isError: true,
      };
    }

    // Find node
    const lines = projectData.content.split('\n');
    const nodeIndex = lines.findIndex(
      (line) => this.cleanTitle(line).toLowerCase() === nodeTitle.toLowerCase()
    );

    if (nodeIndex === -1) {
      return {
        content: [{ type: 'text', text: `Error: Node "${nodeTitle}" not found` }],
        isError: true,
      };
    }

    const nodeId = `node-${nodeIndex}`;

    // Initialize customPositions if not exists
    if (!projectData.customPositions) {
      projectData.customPositions = {};
    }

    projectData.customPositions[nodeId] = { x, y };
    projectData.metadata.modified = new Date().toISOString();

    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Set position of "${nodeTitle}" to (${x}, ${y}) in "${projectName}"`,
        },
      ],
    };
  }

  // ==================== NATURAL LANGUAGE INTERFACE ====================

  async createMindmapSmart({ topic, nodeDescriptions = [] }) {
    // Parse natural language descriptions and auto-assign levels
    const nodes = nodeDescriptions.map((desc, index) => {
      // Simple heuristic: if description is short (< 30 chars), it's likely a level 1 node
      // Otherwise, treat as level 2 for more detail
      const isShortTitle = desc.length < 30;

      return {
        title: desc,
        description: '', // No description separator in natural language
        level: isShortTitle ? 1 : 1, // All top-level by default for simplicity
      };
    });

    // Call existing create_mindmap with smart defaults
    return await this.createMindmap({ topic, nodes });
  }

  // ==================== METADATA MANAGEMENT ====================

  async loadMetadata() {
    try {
      const data = await fs.readFile(METADATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Metadata doesn't exist, return default
      return {
        recentProjects: [],
        favorites: [],
        lastOpened: null,
      };
    }
  }

  async saveMetadata(metadata) {
    try {
      await fs.mkdir(PROJECTS_DIR, { recursive: true });
      await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  async updateMetadata(projectPath) {
    const metadata = await this.loadMetadata();

    // Remove if already exists
    metadata.recentProjects = (metadata.recentProjects || []).filter((p) => p !== projectPath);

    // Add to front
    metadata.recentProjects.unshift(projectPath);

    // Keep only last 20
    metadata.recentProjects = metadata.recentProjects.slice(0, 20);

    // Update last opened
    metadata.lastOpened = projectPath;

    await this.saveMetadata(metadata);
  }

  // ==================== HELPER METHODS ====================

  getIndentString(level) {
    if (level === 1) return '';
    if (level === 2) return '';
    return '   '.repeat(level - 2);
  }

  getNextNumberedIndex(lines) {
    let maxIndex = 0;
    lines.forEach((line) => {
      const match = line.match(/^(\d+)\./);
      if (match) {
        maxIndex = Math.max(maxIndex, parseInt(match[1]));
      }
    });
    return maxIndex + 1;
  }

  cleanTitle(line) {
    return line
      .trim()
      .replace(/^\d+\.\s*/, '')
      .replace(/^#+\s*/, '')
      .replace(/^\*+\s*/, '')
      .replace(/^-\s*/, '')
      .replace(/\*\*/g, '')
      .split('|')[0]
      .trim();
  }

  getLineLevel(line) {
    const trimmed = line.trim();
    const spaces = line.match(/^(\s*)/)[1].length;

    if (/^\d+\./.test(trimmed)) return 1;
    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      if (spaces === 0) return 2;
      return 2 + Math.floor(spaces / 3);
    }
    return 1;
  }

  getLineMarker(line) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+\.|\*|-)/);
    return match ? match[1] : '';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('PWC Mindmap MCP server v2.0 running on stdio');
  }
}

const server = new MindmapMCPServer();
server.run().catch(console.error);
