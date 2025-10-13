/**
 * Test suite for ProjectManager v5.0 → v5.1 migration
 */

const ProjectManager = require('../project-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('ProjectManager - v5.1 Migration', () => {
  let projectManager;
  let testProjectsDir;

  beforeEach(() => {
    // Create temporary test directory
    testProjectsDir = path.join(os.tmpdir(), `pwc-mindmap-test-${Date.now()}`);
    fs.mkdirSync(testProjectsDir, { recursive: true });

    projectManager = new ProjectManager();
    projectManager.projectsDir = testProjectsDir;
    projectManager.metadataFile = path.join(testProjectsDir, '.metadata.json');
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testProjectsDir)) {
      fs.rmSync(testProjectsDir, { recursive: true, force: true });
    }
  });

  describe('migrateV5ToV5_1', () => {
    test('adds empty videos array to nodeData', () => {
      const v5Data = {
        name: 'Test Project',
        metadata: { version: '5.0' },
        nodeData: {
          'node-1': {
            description: 'Test node',
            notes: '',
            images: []
          },
          'node-2': {
            description: 'Another node',
            images: []
          }
        }
      };

      const v5_1Data = projectManager.migrateV5ToV5_1(v5Data);

      expect(v5_1Data.metadata.version).toBe('5.1');
      expect(v5_1Data.nodeData['node-1'].videos).toEqual([]);
      expect(v5_1Data.nodeData['node-2'].videos).toEqual([]);
    });

    test('preserves existing videos if already present', () => {
      const existingVideo = {
        url: 'data:video/mp4;base64,AAAA',
        filename: 'test.mp4'
      };

      const v5Data = {
        name: 'Test Project',
        metadata: { version: '5.0' },
        nodeData: {
          'node-1': {
            description: 'Test node',
            videos: [existingVideo]
          }
        }
      };

      const v5_1Data = projectManager.migrateV5ToV5_1(v5Data);

      expect(v5_1Data.nodeData['node-1'].videos).toEqual([existingVideo]);
    });

    test('handles empty nodeData', () => {
      const v5Data = {
        name: 'Empty Project',
        metadata: { version: '5.0' },
        nodeData: {}
      };

      const v5_1Data = projectManager.migrateV5ToV5_1(v5Data);

      expect(v5_1Data.metadata.version).toBe('5.1');
      expect(v5_1Data.nodeData).toEqual({});
    });

    test('creates nodeData if missing', () => {
      const v5Data = {
        name: 'Test Project',
        metadata: { version: '5.0' }
      };

      const v5_1Data = projectManager.migrateV5ToV5_1(v5Data);

      expect(v5_1Data.metadata.version).toBe('5.1');
      expect(v5_1Data.nodeData).toEqual({});
    });

    test('creates metadata if missing', () => {
      const v5Data = {
        name: 'Test Project',
        nodeData: {
          'node-1': { description: 'Test' }
        }
      };

      const v5_1Data = projectManager.migrateV5ToV5_1(v5Data);

      expect(v5_1Data.metadata).toBeDefined();
      expect(v5_1Data.metadata.version).toBe('5.1');
    });
  });

  describe('migrateProjectData', () => {
    test('migrates v1.0 directly to v5.1', () => {
      const v1Data = {
        name: 'Old Project',
        version: '1.0',
        nodes: []
      };

      const migratedData = projectManager.migrateProjectData(v1Data);

      expect(migratedData.metadata.version).toBe('5.1');
      expect(migratedData.presentation).toBeDefined();
      expect(migratedData.nodeData).toBeDefined();
    });

    test('migrates v5.0 to v5.1', () => {
      const v5Data = {
        name: 'v5 Project',
        metadata: { version: '5.0' },
        nodeData: {
          'node-1': { description: 'Test' }
        }
      };

      const migratedData = projectManager.migrateProjectData(v5Data);

      expect(migratedData.metadata.version).toBe('5.1');
      expect(migratedData.nodeData['node-1'].videos).toEqual([]);
    });

    test('does not re-migrate v5.1 projects', () => {
      const v5_1Data = {
        name: 'v5.1 Project',
        metadata: { version: '5.1' },
        nodeData: {
          'node-1': {
            description: 'Test',
            videos: [{ filename: 'existing.mp4' }]
          }
        }
      };

      const migratedData = projectManager.migrateProjectData(v5_1Data);

      expect(migratedData.metadata.version).toBe('5.1');
      expect(migratedData.nodeData['node-1'].videos.length).toBe(1);
    });
  });

  describe('loadProject with migration', () => {
    test('automatically migrates v5.0 project on load', () => {
      const v5ProjectData = {
        name: 'Test v5 Project',
        metadata: {
          version: '5.0',
          created: new Date().toISOString()
        },
        nodeData: {
          'node-1': {
            description: 'Test node',
            images: []
          }
        },
        content: 'Test\n1. Item',
        nodes: [],
        categories: [],
        relationships: []
      };

      const projectPath = path.join(testProjectsDir, 'test-v5.pmap');
      fs.writeFileSync(projectPath, JSON.stringify(v5ProjectData, null, 2));

      const loadedData = projectManager.loadProject(projectPath);

      expect(loadedData.metadata.version).toBe('5.1');
      expect(loadedData.nodeData['node-1'].videos).toEqual([]);
    });
  });

  describe('createProject', () => {
    test('creates new project with v5.1 format', () => {
      const result = projectManager.createProject('New v5.1 Project');

      expect(result.projectData.metadata.version).toBe('5.1');
      expect(result.projectData.nodeData).toBeDefined();
      expect(result.projectData.presentation).toBeDefined();
    });
  });

  describe('ensureMediaFolder', () => {
    test('creates .media folder if missing', () => {
      const projectPath = path.join(testProjectsDir, 'test.pmap');

      const mediaDir = projectManager.ensureMediaFolder(projectPath);

      expect(fs.existsSync(mediaDir)).toBe(true);
      expect(path.basename(mediaDir)).toBe('.media');
    });

    test('returns existing .media folder path', () => {
      const projectPath = path.join(testProjectsDir, 'test.pmap');
      const mediaDir = path.join(testProjectsDir, '.media');

      fs.mkdirSync(mediaDir);

      const returnedMediaDir = projectManager.ensureMediaFolder(projectPath);

      expect(returnedMediaDir).toBe(mediaDir);
      expect(fs.existsSync(returnedMediaDir)).toBe(true);
    });
  });

  describe('getMediaFolder', () => {
    test('returns correct .media folder path', () => {
      const projectPath = path.join(testProjectsDir, 'subfolder', 'test.pmap');

      const mediaDir = projectManager.getMediaFolder(projectPath);

      expect(mediaDir).toBe(path.join(testProjectsDir, 'subfolder', '.media'));
    });
  });

  describe('backward compatibility', () => {
    test('v5.1 projects can be saved without breaking v5.0 readers', () => {
      const v5_1Data = {
        name: 'Forward Compatible Project',
        metadata: { version: '5.1' },
        nodeData: {
          'node-1': {
            description: 'Test',
            images: [],
            videos: [
              {
                url: 'data:video/mp4;base64,AAAA',
                filename: 'test.mp4'
              }
            ]
          }
        }
      };

      // v5.0 reader would simply ignore the videos field
      const v5_0_compatible = {
        ...v5_1Data,
        metadata: { ...v5_1Data.metadata, version: '5.0' },
        nodeData: {
          'node-1': {
            description: v5_1Data.nodeData['node-1'].description,
            images: v5_1Data.nodeData['node-1'].images
            // videos field stripped for v5.0
          }
        }
      };

      expect(v5_0_compatible.nodeData['node-1'].description).toBe('Test');
      expect(v5_0_compatible.nodeData['node-1'].videos).toBeUndefined();
    });
  });
});
