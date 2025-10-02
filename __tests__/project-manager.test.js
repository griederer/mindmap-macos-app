/**
 * ProjectManager Tests
 */

const ProjectManager = require('../project-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('ProjectManager', () => {
    let projectManager;
    let testDir;

    beforeEach(() => {
        // Create a temporary test directory
        testDir = path.join(os.tmpdir(), 'pwc-mindmap-test-' + Date.now());

        // Mock the projects directory
        projectManager = new ProjectManager();
        projectManager.projectsDir = testDir;
        projectManager.metadataFile = path.join(testDir, '.metadata.json');

        // Initialize test directory
        projectManager.initializeProjectsDirectory();
    });

    afterEach(() => {
        // Clean up test directory
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('Initialization', () => {
        test('should create projects directory', () => {
            expect(fs.existsSync(testDir)).toBe(true);
        });

        test('should create Templates subdirectory', () => {
            const templatesDir = path.join(testDir, 'Templates');
            expect(fs.existsSync(templatesDir)).toBe(true);
        });

        test('should create Archives subdirectory', () => {
            const archivesDir = path.join(testDir, 'Archives');
            expect(fs.existsSync(archivesDir)).toBe(true);
        });

        test('should create default template', () => {
            const templatePath = path.join(testDir, 'Templates', 'Default Template.pmap');
            expect(fs.existsSync(templatePath)).toBe(true);
        });

        test('should initialize metadata', () => {
            expect(projectManager.metadata).toBeDefined();
            expect(projectManager.metadata.recentProjects).toEqual([]);
            expect(projectManager.metadata.favorites).toEqual([]);
        });
    });

    describe('Project Creation', () => {
        test('should create a new project', () => {
            const result = projectManager.createProject('Test Project');

            expect(result.projectData).toBeDefined();
            expect(result.projectPath).toBeDefined();
            expect(result.projectData.name).toBe('Test Project');
            expect(fs.existsSync(result.projectPath)).toBe(true);
        });

        test('should throw error for duplicate project', () => {
            projectManager.createProject('Duplicate Test');

            expect(() => {
                projectManager.createProject('Duplicate Test');
            }).toThrow();
        });

        test('should sanitize project names', () => {
            const result = projectManager.createProject('Test/Project<>:|?*');
            const filename = path.basename(result.projectPath);

            expect(filename).not.toContain('/');
            expect(filename).not.toContain('<');
            expect(filename).not.toContain('>');
        });

        test('should add created project to recent projects', () => {
            const result = projectManager.createProject('Recent Project');

            expect(projectManager.metadata.recentProjects).toContain(result.projectPath);
        });
    });

    describe('Project Loading', () => {
        test('should load existing project', () => {
            const created = projectManager.createProject('Load Test');
            const loaded = projectManager.loadProject(created.projectPath);

            expect(loaded.name).toBe('Load Test');
        });

        test('should throw error for non-existent project', () => {
            const fakePath = path.join(testDir, 'nonexistent.pmap');

            expect(() => {
                projectManager.loadProject(fakePath);
            }).toThrow();
        });
    });

    describe('Project Saving', () => {
        test('should save project data', () => {
            const created = projectManager.createProject('Save Test');

            const updatedData = {
                ...created.projectData,
                content: 'Updated content'
            };

            const result = projectManager.saveProject(created.projectPath, updatedData);
            expect(result).toBe(true);

            const loaded = projectManager.loadProject(created.projectPath);
            expect(loaded.content).toBe('Updated content');
        });

        test('should update modification timestamp', () => {
            const created = projectManager.createProject('Timestamp Test');
            const originalModified = created.projectData.metadata.modified;

            // Wait a moment to ensure timestamp difference
            setTimeout(() => {
                projectManager.saveProject(created.projectPath, created.projectData);
                const loaded = projectManager.loadProject(created.projectPath);

                expect(loaded.metadata.modified).not.toBe(originalModified);
            }, 10);
        });
    });

    describe('Project Listing', () => {
        test('should list all projects', () => {
            projectManager.createProject('Project 1');
            projectManager.createProject('Project 2');
            projectManager.createProject('Project 3');

            const projects = projectManager.listProjects();

            expect(projects.length).toBeGreaterThanOrEqual(3);
        });

        test('should sort projects by modification date', () => {
            const proj1 = projectManager.createProject('First');

            setTimeout(() => {
                const proj2 = projectManager.createProject('Second');
                const projects = projectManager.listProjects();

                expect(projects[0].name).toBe('Second');
            }, 10);
        });
    });

    describe('Recent Projects', () => {
        test('should return recent projects', () => {
            projectManager.createProject('Recent 1');
            projectManager.createProject('Recent 2');

            const recent = projectManager.getRecentProjects(10);

            expect(recent.length).toBeGreaterThanOrEqual(2);
        });

        test('should limit recent projects count', () => {
            for (let i = 0; i < 15; i++) {
                projectManager.createProject(`Project ${i}`);
            }

            const recent = projectManager.getRecentProjects(5);

            expect(recent.length).toBe(5);
        });

        test('should filter out non-existent projects', () => {
            const created = projectManager.createProject('To Delete');

            // Manually delete the file
            fs.unlinkSync(created.projectPath);

            const recent = projectManager.getRecentProjects(10);

            expect(recent.every(p => p !== null)).toBe(true);
        });
    });

    describe('Project Deletion', () => {
        test('should move project to archive', () => {
            const created = projectManager.createProject('Archive Test');

            projectManager.deleteProject(created.projectPath, true);

            const archivePath = path.join(testDir, 'Archives', path.basename(created.projectPath));
            expect(fs.existsSync(archivePath)).toBe(true);
            expect(fs.existsSync(created.projectPath)).toBe(false);
        });

        test('should permanently delete project', () => {
            const created = projectManager.createProject('Delete Test');

            projectManager.deleteProject(created.projectPath, false);

            expect(fs.existsSync(created.projectPath)).toBe(false);
        });

        test('should remove from recent projects', () => {
            const created = projectManager.createProject('Remove Test');

            projectManager.deleteProject(created.projectPath, false);

            expect(projectManager.metadata.recentProjects).not.toContain(created.projectPath);
        });
    });

    describe('Project Export', () => {
        test('should export to JSON', () => {
            const created = projectManager.createProject('Export Test');
            const exportPath = path.join(testDir, 'export.json');

            projectManager.exportProject(created.projectPath, exportPath, 'json');

            expect(fs.existsSync(exportPath)).toBe(true);

            const exported = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
            expect(exported.name).toBe('Export Test');
        });

        test('should export to markdown', () => {
            const created = projectManager.createProject('MD Export');
            const exportPath = path.join(testDir, 'export.md');

            projectManager.exportProject(created.projectPath, exportPath, 'md');

            expect(fs.existsSync(exportPath)).toBe(true);
        });
    });

    describe('Project Import', () => {
        test('should import JSON file', () => {
            const sourceData = {
                name: 'Imported Project',
                content: 'Test content',
                nodes: []
            };

            const sourcePath = path.join(testDir, 'import.json');
            fs.writeFileSync(sourcePath, JSON.stringify(sourceData));

            const result = projectManager.importProject(sourcePath);

            expect(result.projectData.name).toBe('Imported Project');
            expect(fs.existsSync(result.projectPath)).toBe(true);
        });

        test('should import text file', () => {
            const sourcePath = path.join(testDir, 'import.txt');
            fs.writeFileSync(sourcePath, 'Plain text content');

            const result = projectManager.importProject(sourcePath, 'Text Import');

            expect(result.projectData.content).toBe('Plain text content');
        });
    });

    describe('Utility Functions', () => {
        test('should get projects directory', () => {
            const dir = projectManager.getProjectsDirectory();
            expect(dir).toBe(testDir);
        });

        test('should get last opened project', () => {
            const created = projectManager.createProject('Last Opened');

            const lastOpened = projectManager.getLastOpenedProject();
            expect(lastOpened).toBe(created.projectPath);
        });

        test('should sanitize filenames correctly', () => {
            const sanitized = projectManager.sanitizeFilename('File<>:|?*/Name');
            expect(sanitized).not.toMatch(/[<>:|?*\/]/);
        });
    });
});
