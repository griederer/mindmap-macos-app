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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Projects directory path
const PROJECTS_DIR = path.join(os.homedir(), 'Documents', 'PWC Mindmaps');

/**
 * PWC Mindmap MCP Server
 * Enables Claude Code to create and manipulate mindmaps
 */
class MindmapMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'pwc-mindmap-mcp',
        version: '1.0.0',
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
        {
          name: 'create_mindmap',
          description: 'Create a new mindmap project with a topic and optional nodes',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Main topic/title of the mindmap',
              },
              nodes: {
                type: 'array',
                description: 'Initial nodes to add (optional)',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    level: {
                      type: 'number',
                      description: 'Indentation level (1=numbered list, 2+=bullet points)',
                    },
                  },
                  required: ['title', 'level'],
                },
              },
            },
            required: ['topic'],
          },
        },
        {
          name: 'add_node',
          description: 'Add a new node to an existing mindmap',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project (without .pmap extension)',
              },
              title: {
                type: 'string',
                description: 'Title of the new node',
              },
              description: {
                type: 'string',
                description: 'Description/definition for the node (optional)',
              },
              level: {
                type: 'number',
                description: 'Indentation level (1=numbered, 2+=bullets)',
              },
              parentTitle: {
                type: 'string',
                description: 'Title of the parent node (optional, adds at end if not specified)',
              },
            },
            required: ['projectName', 'title', 'level'],
          },
        },
        {
          name: 'get_project_data',
          description: 'Get complete data from a mindmap project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project (without .pmap extension)',
              },
            },
            required: ['projectName'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_mindmap':
            return await this.createMindmap(args);
          case 'add_node':
            return await this.addNode(args);
          case 'get_project_data':
            return await this.getProjectData(args);
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

  /**
   * Create a new mindmap project
   */
  async createMindmap({ topic, nodes = [] }) {
    // Sanitize project name
    const sanitizedName = topic
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\\s+/g, ' ')
      .trim();

    const projectPath = path.join(PROJECTS_DIR, `${sanitizedName}.pmap`);

    // Check if project already exists
    try {
      await fs.access(projectPath);
      return {
        content: [
          {
            type: 'text',
            text: `Error: Project "${topic}" already exists`,
          },
        ],
        isError: true,
      };
    } catch (error) {
      // Project doesn't exist, proceed
    }

    // Build content in the app's text format
    let content = `${topic}\n`;

    if (nodes && nodes.length > 0) {
      nodes.forEach((node, index) => {
        const indent = this.getIndentString(node.level);
        const marker = node.level === 1 ? `${index + 1}.` : '*';
        const desc = node.description ? ` | ${node.description}` : '';
        content += `${indent}${marker} ${node.title}${desc}\n`;
      });
    } else {
      // Add default structure
      content += '1. Main Idea\n* Subtopic 1\n* Subtopic 2\n';
    }

    // Create project data structure
    const projectData = {
      name: topic,
      content: content.trim(),
      nodes: {},
      categories: [],
      relationships: [],
      customOrders: {},
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0',
      },
    };

    // Ensure projects directory exists
    await fs.mkdir(PROJECTS_DIR, { recursive: true });

    // Write project file
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Created mindmap "${topic}" at:\n${projectPath}\n\nNodes added: ${nodes.length || 2}`,
        },
      ],
    };
  }

  /**
   * Add a node to an existing mindmap
   */
  async addNode({ projectName, title, description = '', level, parentTitle }) {
    const projectPath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

    // Load existing project
    let projectData;
    try {
      const data = await fs.readFile(projectPath, 'utf-8');
      projectData = JSON.parse(data);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Project "${projectName}" not found`,
          },
        ],
        isError: true,
      };
    }

    // Parse current content to find where to insert
    const lines = projectData.content.split('\n');

    // Build new node line
    const indent = this.getIndentString(level);
    const marker = level === 1 ? `${this.getNextNumberedIndex(lines)}.` : '*';
    const desc = description ? ` | ${description}` : '';
    const newLine = `${indent}${marker} ${title}${desc}`;

    // If parentTitle is specified, find it and add as child
    if (parentTitle) {
      const parentIndex = lines.findIndex(line =>
        this.cleanTitle(line).toLowerCase() === parentTitle.toLowerCase()
      );

      if (parentIndex === -1) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Parent node "${parentTitle}" not found`,
            },
          ],
          isError: true,
        };
      }

      // Insert after parent
      lines.splice(parentIndex + 1, 0, newLine);
    } else {
      // Add at the end
      lines.push(newLine);
    }

    // Update project content
    projectData.content = lines.join('\n');
    projectData.metadata.modified = new Date().toISOString();

    // Save updated project
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added node "${title}" to "${projectName}"${parentTitle ? ` under "${parentTitle}"` : ''}`,
        },
      ],
    };
  }

  /**
   * Get project data
   */
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
        content: [
          {
            type: 'text',
            text: `Error: Project "${projectName}" not found`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Helper: Get indent string for a given level
   */
  getIndentString(level) {
    if (level === 1) return '';
    if (level === 2) return '';
    return '   '.repeat(level - 2);
  }

  /**
   * Helper: Get next numbered index for level 1 items
   */
  getNextNumberedIndex(lines) {
    let maxIndex = 0;
    lines.forEach(line => {
      const match = line.match(/^(\\d+)\\./);
      if (match) {
        maxIndex = Math.max(maxIndex, parseInt(match[1]));
      }
    });
    return maxIndex + 1;
  }

  /**
   * Helper: Clean title from line
   */
  cleanTitle(line) {
    return line.trim()
      .replace(/^\\d+\\.\\s*/, '')
      .replace(/^#+\\s*/, '')
      .replace(/^\\*+\\s*/, '')
      .replace(/^-\\s*/, '')
      .replace(/\\*\\*/g, '')
      .split('|')[0]
      .trim();
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('PWC Mindmap MCP server running on stdio');
  }
}

const server = new MindmapMCPServer();
server.run().catch(console.error);
