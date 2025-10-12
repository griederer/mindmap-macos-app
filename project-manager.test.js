/**
 * Unit tests for ProjectManager presentation data handling
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock ProjectManager (simplified for testing)
class ProjectManager {
    constructor() {
        this.projectsDir = path.join(os.homedir(), 'Documents', 'PWC Mindmaps');
        this.metadataFile = path.join(this.projectsDir, '.metadata.json');
        this.metadata = {
            recentProjects: [],
            favorites: [],
            lastOpened: null
        };
    }

    loadProject(projectPath) {
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project file not found: ${projectPath}`);
        }

        const data = fs.readFileSync(projectPath, 'utf-8');
        const projectData = JSON.parse(data);

        // Ensure presentation data structure exists (migration)
        if (!projectData.presentation) {
            projectData.presentation = {
                slides: [],
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };
        }

        return projectData;
    }

    saveProject(projectPath, projectData) {
        if (!projectData.metadata) {
            projectData.metadata = {};
        }
        projectData.metadata.modified = new Date().toISOString();

        // Update presentation modified timestamp if presentation data exists
        if (projectData.presentation && projectData.presentation.slides && projectData.presentation.slides.length > 0) {
            projectData.presentation.modified = new Date().toISOString();
        }

        fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));
        return true;
    }

    createProject(projectName) {
        const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_ ]/g, '');
        const projectPath = path.join(this.projectsDir, `${sanitizedName}.pmap`);

        const projectData = {
            name: projectName,
            nodes: [],
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: '1.0'
            },
            categories: [],
            relationships: [],
            content: `${projectName}\n1. Main Idea\n* Subtopic 1\n* Subtopic 2`,
            presentation: {
                slides: [],
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };

        fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));
        return { projectData, projectPath };
    }
}

describe('ProjectManager - Presentation Data Handling', () => {
    let projectManager;
    let testDir;
    let testProjectPath;

    beforeEach(() => {
        // Create temp directory for tests
        testDir = path.join(os.tmpdir(), `pwc-mindmap-test-${Date.now()}`);
        fs.mkdirSync(testDir, { recursive: true });

        // Override projects directory for testing
        projectManager = new ProjectManager();
        projectManager.projectsDir = testDir;
        testProjectPath = path.join(testDir, 'test-project.pmap');
    });

    afterEach(() => {
        // Clean up test files
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('createProject()', () => {
        test('should create new project with empty presentation structure', () => {
            const result = projectManager.createProject('Test Project');

            expect(result.projectData).toBeDefined();
            expect(result.projectData.presentation).toBeDefined();
            expect(result.projectData.presentation.slides).toEqual([]);
            expect(result.projectData.presentation.created).toBeDefined();
            expect(result.projectData.presentation.modified).toBeDefined();
        });

        test('should save presentation structure to disk', () => {
            const result = projectManager.createProject('Test Project');
            const savedData = JSON.parse(fs.readFileSync(result.projectPath, 'utf-8'));

            expect(savedData.presentation).toBeDefined();
            expect(savedData.presentation.slides).toEqual([]);
        });
    });

    describe('loadProject()', () => {
        test('should load project with existing presentation data', () => {
            const projectData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString(), modified: new Date().toISOString() },
                presentation: {
                    slides: [
                        {
                            id: 1,
                            description: 'Test slide',
                            expandedNodes: ['node-0'],
                            openInfoPanels: [],
                            activeImage: null,
                            focusedNode: null,
                            zoom: 1.0,
                            pan: { x: 0, y: 0 },
                            categoriesVisible: true,
                            relationshipsVisible: true
                        }
                    ],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                }
            };

            fs.writeFileSync(testProjectPath, JSON.stringify(projectData));

            const loaded = projectManager.loadProject(testProjectPath);

            expect(loaded.presentation).toBeDefined();
            expect(loaded.presentation.slides).toHaveLength(1);
            expect(loaded.presentation.slides[0].description).toBe('Test slide');
        });

        test('should migrate old project without presentation data', () => {
            const oldProjectData = {
                name: 'Old Project',
                nodes: [],
                metadata: { created: new Date().toISOString(), modified: new Date().toISOString() }
                // No presentation field
            };

            fs.writeFileSync(testProjectPath, JSON.stringify(oldProjectData));

            const loaded = projectManager.loadProject(testProjectPath);

            expect(loaded.presentation).toBeDefined();
            expect(loaded.presentation.slides).toEqual([]);
            expect(loaded.presentation.created).toBeDefined();
            expect(loaded.presentation.modified).toBeDefined();
        });

        test('should throw error for non-existent project', () => {
            const nonExistentPath = path.join(testDir, 'nonexistent.pmap');

            expect(() => {
                projectManager.loadProject(nonExistentPath);
            }).toThrow('Project file not found');
        });
    });

    describe('saveProject()', () => {
        test('should save presentation data correctly', () => {
            const projectData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString() },
                presentation: {
                    slides: [
                        {
                            id: 1,
                            description: 'Root overview',
                            expandedNodes: ['node-0'],
                            openInfoPanels: [],
                            activeImage: null,
                            focusedNode: null,
                            zoom: 1.0,
                            pan: { x: 0, y: 0 },
                            categoriesVisible: true,
                            relationshipsVisible: true
                        }
                    ],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                }
            };

            const result = projectManager.saveProject(testProjectPath, projectData);
            expect(result).toBe(true);

            const saved = JSON.parse(fs.readFileSync(testProjectPath, 'utf-8'));
            expect(saved.presentation.slides).toHaveLength(1);
        });

        test('should update presentation modified timestamp when slides exist', () => {
            const projectData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString() },
                presentation: {
                    slides: [{ id: 1, description: 'Test' }],
                    created: '2025-01-01T00:00:00.000Z',
                    modified: '2025-01-01T00:00:00.000Z'
                }
            };

            projectManager.saveProject(testProjectPath, projectData);

            const saved = JSON.parse(fs.readFileSync(testProjectPath, 'utf-8'));
            expect(saved.presentation.modified).not.toBe('2025-01-01T00:00:00.000Z');
        });

        test('should not update presentation timestamp when no slides exist', () => {
            const projectData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString() },
                presentation: {
                    slides: [],
                    created: '2025-01-01T00:00:00.000Z',
                    modified: '2025-01-01T00:00:00.000Z'
                }
            };

            projectManager.saveProject(testProjectPath, projectData);

            const saved = JSON.parse(fs.readFileSync(testProjectPath, 'utf-8'));
            expect(saved.presentation.modified).toBe('2025-01-01T00:00:00.000Z');
        });

        test('should handle project without presentation field gracefully', () => {
            const projectData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString() }
                // No presentation field
            };

            const result = projectManager.saveProject(testProjectPath, projectData);
            expect(result).toBe(true);

            const saved = JSON.parse(fs.readFileSync(testProjectPath, 'utf-8'));
            expect(saved.presentation).toBeUndefined();
        });
    });

    describe('Presentation data integrity', () => {
        test('should preserve presentation data through save/load cycle', () => {
            const originalData = {
                name: 'Test',
                nodes: [],
                metadata: { created: new Date().toISOString(), modified: new Date().toISOString() },
                presentation: {
                    slides: [
                        {
                            id: 1,
                            description: 'Slide 1',
                            expandedNodes: ['node-0', 'node-1'],
                            openInfoPanels: ['node-0'],
                            activeImage: {
                                nodeId: 'node-0',
                                imageUrl: 'data:image/jpeg;base64,/9j/...'
                            },
                            focusedNode: 'node-1',
                            zoom: 1.5,
                            pan: { x: -50, y: -30 },
                            categoriesVisible: true,
                            relationshipsVisible: false
                        },
                        {
                            id: 2,
                            description: 'Slide 2',
                            expandedNodes: ['node-0'],
                            openInfoPanels: [],
                            activeImage: null,
                            focusedNode: null,
                            zoom: 1.0,
                            pan: { x: 0, y: 0 },
                            categoriesVisible: false,
                            relationshipsVisible: false
                        }
                    ],
                    created: '2025-10-07T16:00:00.000Z',
                    modified: '2025-10-07T16:15:00.000Z'
                }
            };

            // Save
            projectManager.saveProject(testProjectPath, originalData);

            // Load
            const loadedData = projectManager.loadProject(testProjectPath);

            // Verify data integrity
            expect(loadedData.presentation.slides).toHaveLength(2);
            expect(loadedData.presentation.slides[0].id).toBe(1);
            expect(loadedData.presentation.slides[0].expandedNodes).toEqual(['node-0', 'node-1']);
            expect(loadedData.presentation.slides[0].activeImage.nodeId).toBe('node-0');
            expect(loadedData.presentation.slides[0].zoom).toBe(1.5);
            expect(loadedData.presentation.slides[1].id).toBe(2);
        });
    });
});
