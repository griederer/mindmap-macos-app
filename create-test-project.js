#!/usr/bin/env node

/**
 * Create Test Projects for v5.0 Development
 * Usage: node create-test-project.js [simple|content|images|categories|full]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECTS_DIR = path.join(require('os').homedir(), 'Documents', 'PWC Mindmaps', 'v5-tests');

// Ensure test directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

/**
 * Generate stable node ID
 * @param {string} title - Node title
 * @returns {string} - Format: "slug-hash8"
 */
function generateNodeId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  const hash = crypto
    .createHash('sha256')
    .update(title + Date.now() + Math.random())
    .digest('hex')
    .substring(0, 8);

  return `${slug}-${hash}`;
}

/**
 * Phase 1: Simple nodes only
 */
function createSimpleProject() {
  const projectName = 'Phase1-Simple-Nodes';

  const node1Id = generateNodeId('Cloud Security');
  const node2Id = generateNodeId('Identity Management');
  const node3Id = generateNodeId('Data Encryption');
  const node4Id = generateNodeId('Network Security');
  const node5Id = generateNodeId('Compliance');

  const project = {
    $schema: './mindmap-schema.json',
    version: '5.0.0',
    name: projectName,
    content: `Cloud Security
1. Identity Management
2. Data Encryption
3. Network Security
4. Compliance`,
    nodes: {
      [node1Id]: {
        id: node1Id,
        title: 'Cloud Security',
        description: '',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node2Id]: {
        id: node2Id,
        title: 'Identity Management',
        description: '',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node3Id]: {
        id: node3Id,
        title: 'Data Encryption',
        description: '',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node4Id]: {
        id: node4Id,
        title: 'Network Security',
        description: '',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node5Id]: {
        id: node5Id,
        title: 'Compliance',
        description: '',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      }
    },
    categories: [],
    relationships: [],
    connections: [],
    customOrders: {},
    nodePositions: {},
    focusedNode: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '5.0.0',
      nodeCount: 5
    }
  };

  return { project, projectName };
}

/**
 * Phase 2: Nodes with descriptions and notes
 */
function createContentProject() {
  const projectName = 'Phase2-Content-Test';

  const node1Id = generateNodeId('Risk Management');
  const node2Id = generateNodeId('Risk Identification');
  const node3Id = generateNodeId('Risk Assessment');

  const project = {
    $schema: './mindmap-schema.json',
    version: '5.0.0',
    name: projectName,
    content: `Risk Management
1. Risk Identification
2. Risk Assessment`,
    nodes: {
      [node1Id]: {
        id: node1Id,
        title: 'Risk Management',
        description: 'Systematic process for managing organizational risks',
        notes: `## Overview

Risk management is a critical process that helps organizations:
- Identify potential threats
- Assess their impact
- Develop mitigation strategies

## Key Principles

1. **Proactive approach**: Anticipate risks before they occur
2. **Data-driven decisions**: Use metrics and analytics
3. **Continuous improvement**: Regular review and updates`,
        images: [],
        showInfo: true,  // Open by default to see content
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node2Id]: {
        id: node2Id,
        title: 'Risk Identification',
        description: 'Process of finding and documenting potential risks',
        notes: `## Methods

- **Brainstorming sessions** with stakeholders
- **SWOT analysis** (Strengths, Weaknesses, Opportunities, Threats)
- **Historical data review**
- **Expert interviews**`,
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node3Id]: {
        id: node3Id,
        title: 'Risk Assessment',
        description: 'Evaluate likelihood and impact of identified risks',
        notes: '',  // No extended notes for this one
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      }
    },
    categories: [],
    relationships: [],
    connections: [],
    customOrders: {},
    nodePositions: {},
    focusedNode: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '5.0.0',
      nodeCount: 3
    }
  };

  return { project, projectName };
}

/**
 * Phase 3: Nodes with images
 */
function createImagesProject() {
  const projectName = 'Phase3-Images-Test';

  const node1Id = generateNodeId('Technology Stack');
  const node2Id = generateNodeId('Frontend');
  const node3Id = generateNodeId('Backend');

  const project = {
    $schema: './mindmap-schema.json',
    version: '5.0.0',
    name: projectName,
    content: `Technology Stack
1. Frontend
2. Backend`,
    nodes: {
      [node1Id]: {
        id: node1Id,
        title: 'Technology Stack',
        description: 'Modern web application architecture',
        notes: '',
        images: [
          {
            id: `img-${Date.now()}-1`,
            url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
            source: 'unsplash',
            photographer: 'Clément Hélardot',
            description: 'Code on screen'
          }
        ],
        showInfo: true,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node2Id]: {
        id: node2Id,
        title: 'Frontend',
        description: 'User interface layer',
        notes: '## Technologies\n- React\n- TypeScript\n- Tailwind CSS',
        images: [
          {
            id: `img-${Date.now()}-2`,
            url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
            source: 'unsplash',
            photographer: 'Lautaro Andreani',
            description: 'React logo'
          }
        ],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node3Id]: {
        id: node3Id,
        title: 'Backend',
        description: 'Server-side logic and APIs',
        notes: '',
        images: [],  // No images for this node
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      }
    },
    categories: [],
    relationships: [],
    connections: [],
    customOrders: {},
    nodePositions: {},
    focusedNode: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '5.0.0',
      nodeCount: 3
    }
  };

  return { project, projectName };
}

/**
 * Phase 4: Categories test
 */
function createCategoriesProject() {
  const projectName = 'Phase4-Categories-Test';

  const node1Id = generateNodeId('Project Tasks');
  const node2Id = generateNodeId('Critical Task');
  const node3Id = generateNodeId('Important Task');
  const node4Id = generateNodeId('Normal Task');
  const node5Id = generateNodeId('Low Priority Task');

  const catHighId = 'cat-high-priority';
  const catMediumId = 'cat-medium-priority';
  const catLowId = 'cat-low-priority';

  const project = {
    $schema: './mindmap-schema.json',
    version: '5.0.0',
    name: projectName,
    content: `Project Tasks
1. Critical Task
2. Important Task
3. Normal Task
4. Low Priority Task`,
    nodes: {
      [node1Id]: {
        id: node1Id,
        title: 'Project Tasks',
        description: 'All project activities',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node2Id]: {
        id: node2Id,
        title: 'Critical Task',
        description: 'Must be done immediately',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catHighId],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node3Id]: {
        id: node3Id,
        title: 'Important Task',
        description: 'Should be done soon',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catHighId],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node4Id]: {
        id: node4Id,
        title: 'Normal Task',
        description: 'Regular priority',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catMediumId],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node5Id]: {
        id: node5Id,
        title: 'Low Priority Task',
        description: 'Can wait',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catLowId],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      }
    },
    categories: [
      {
        id: catHighId,
        name: 'High Priority',
        color: '#dc2626',
        icon: '🔥',
        description: 'Critical items requiring immediate attention',
        nodeIds: [node2Id, node3Id],
        metadata: {
          created: new Date().toISOString(),
          usageCount: 2
        }
      },
      {
        id: catMediumId,
        name: 'Medium Priority',
        color: '#f59e0b',
        icon: '⚡',
        description: 'Important but not urgent',
        nodeIds: [node4Id],
        metadata: {
          created: new Date().toISOString(),
          usageCount: 1
        }
      },
      {
        id: catLowId,
        name: 'Low Priority',
        color: '#10b981',
        icon: '✓',
        description: 'Nice to have',
        nodeIds: [node5Id],
        metadata: {
          created: new Date().toISOString(),
          usageCount: 1
        }
      }
    ],
    relationships: [],
    connections: [],
    customOrders: {},
    nodePositions: {},
    focusedNode: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '5.0.0',
      nodeCount: 5,
      categoryCount: 3
    }
  };

  return { project, projectName };
}

/**
 * Phase 5: Full test with everything
 */
function createFullProject() {
  const projectName = 'Phase5-Full-Integration';

  const node1Id = generateNodeId('Software Development');
  const node2Id = generateNodeId('Planning');
  const node3Id = generateNodeId('Development');
  const node4Id = generateNodeId('Testing');
  const node5Id = generateNodeId('Deployment');

  const catHighId = 'cat-critical';
  const catMediumId = 'cat-important';
  const relDependsId = 'rel-depends-on';
  const relLeadsToId = 'rel-leads-to';

  const project = {
    $schema: './mindmap-schema.json',
    version: '5.0.0',
    name: projectName,
    content: `Software Development
1. Planning
2. Development
3. Testing
4. Deployment`,
    nodes: {
      [node1Id]: {
        id: node1Id,
        title: 'Software Development',
        description: 'Complete SDLC process',
        notes: `## Software Development Lifecycle

A comprehensive approach to building quality software:

1. **Planning**: Requirements gathering and design
2. **Development**: Writing code and implementing features
3. **Testing**: Quality assurance and bug fixing
4. **Deployment**: Release to production

Each phase is critical for success.`,
        images: [
          {
            id: `img-${Date.now()}-1`,
            url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
            source: 'unsplash',
            photographer: 'Ilya Pavlov',
            description: 'Code editor'
          }
        ],
        showInfo: true,
        categoryIds: [],
        relationshipIds: [],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node2Id]: {
        id: node2Id,
        title: 'Planning',
        description: 'Requirements and design phase',
        notes: '## Activities\n- Gather requirements\n- Create design documents\n- Plan sprints',
        images: [],
        showInfo: false,
        categoryIds: [catHighId],
        relationshipIds: [relLeadsToId],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node3Id]: {
        id: node3Id,
        title: 'Development',
        description: 'Implementation phase',
        notes: '## Best Practices\n- Write clean code\n- Follow style guides\n- Peer reviews',
        images: [],
        showInfo: false,
        categoryIds: [catHighId],
        relationshipIds: [relDependsId, relLeadsToId],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node4Id]: {
        id: node4Id,
        title: 'Testing',
        description: 'Quality assurance phase',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catMediumId],
        relationshipIds: [relDependsId],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      },
      [node5Id]: {
        id: node5Id,
        title: 'Deployment',
        description: 'Release to production',
        notes: '',
        images: [],
        showInfo: false,
        categoryIds: [catMediumId],
        relationshipIds: [relDependsId],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: 1
        }
      }
    },
    categories: [
      {
        id: catHighId,
        name: 'Critical',
        color: '#dc2626',
        icon: '🔥',
        description: 'Critical phases',
        nodeIds: [node2Id, node3Id],
        metadata: {
          created: new Date().toISOString(),
          usageCount: 2
        }
      },
      {
        id: catMediumId,
        name: 'Important',
        color: '#f59e0b',
        icon: '⚡',
        description: 'Important phases',
        nodeIds: [node4Id, node5Id],
        metadata: {
          created: new Date().toISOString(),
          usageCount: 2
        }
      }
    ],
    relationships: [
      {
        id: relDependsId,
        name: 'depends on',
        color: '#3b82f6',
        dashPattern: [5, 5],
        lineStyle: 'dashed',
        description: 'Dependency relationship',
        nodeIds: [node3Id, node4Id, node5Id],
        metadata: {
          created: new Date().toISOString(),
          connectionCount: 3
        }
      },
      {
        id: relLeadsToId,
        name: 'leads to',
        color: '#10b981',
        dashPattern: [],
        lineStyle: 'solid',
        description: 'Sequential flow',
        nodeIds: [node2Id, node3Id],
        metadata: {
          created: new Date().toISOString(),
          connectionCount: 2
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        fromNodeId: node2Id,
        toNodeId: node3Id,
        relationshipId: relLeadsToId,
        label: 'next',
        metadata: {
          created: new Date().toISOString()
        }
      },
      {
        id: 'conn-2',
        fromNodeId: node3Id,
        toNodeId: node4Id,
        relationshipId: relDependsId,
        label: 'requires',
        metadata: {
          created: new Date().toISOString()
        }
      },
      {
        id: 'conn-3',
        fromNodeId: node4Id,
        toNodeId: node5Id,
        relationshipId: relDependsId,
        label: 'before',
        metadata: {
          created: new Date().toISOString()
        }
      }
    ],
    customOrders: {},
    nodePositions: {},
    focusedNode: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '5.0.0',
      nodeCount: 5,
      categoryCount: 2,
      relationshipCount: 2
    }
  };

  return { project, projectName };
}

// Main execution
const testType = process.argv[2] || 'simple';
let result;

switch (testType) {
  case 'simple':
    result = createSimpleProject();
    break;
  case 'content':
    result = createContentProject();
    break;
  case 'images':
    result = createImagesProject();
    break;
  case 'categories':
    result = createCategoriesProject();
    break;
  case 'full':
    result = createFullProject();
    break;
  default:
    console.error(`Unknown test type: ${testType}`);
    console.error('Usage: node create-test-project.js [simple|content|images|categories|full]');
    process.exit(1);
}

const { project, projectName } = result;
const filePath = path.join(PROJECTS_DIR, `${projectName}.pmap`);

// Write file
fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

console.log(`✅ Created test project: ${projectName}`);
console.log(`📁 Location: ${filePath}`);
console.log(`📊 Nodes: ${Object.keys(project.nodes).length}`);
console.log(`🏷️  Categories: ${project.categories.length}`);
console.log(`🔗 Relationships: ${project.relationships.length}`);
console.log(`🔌 Connections: ${project.connections.length}`);
console.log('');
console.log('Next steps:');
console.log('1. Open PWC Mindmap Pro app');
console.log(`2. Open file: ${filePath}`);
console.log('3. Verify all features render correctly');
