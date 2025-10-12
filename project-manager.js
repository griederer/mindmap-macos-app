/**
 * ProjectManager - Handles file-based project storage and management
 *
 * Features:
 * - Persistent file storage in ~/Documents/PWC Mindmaps/
 * - Auto-save every 30 seconds
 * - Project metadata tracking
 * - Recent projects list
 * - Import/Export workflows
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

class ProjectManager {
    constructor() {
        // Default projects directory
        this.projectsDir = path.join(os.homedir(), 'Documents', 'PWC Mindmaps');
        this.metadataFile = path.join(this.projectsDir, '.metadata.json');
        this.metadata = {
            recentProjects: [],
            favorites: [],
            lastOpened: null
        };

        this.initializeProjectsDirectory();
        this.loadMetadata();
    }

    /**
     * Initialize the projects directory structure
     */
    initializeProjectsDirectory() {
        try {
            if (!fs.existsSync(this.projectsDir)) {
                fs.mkdirSync(this.projectsDir, { recursive: true });
                console.log(`Created projects directory: ${this.projectsDir}`);
            }

            // Create subdirectories
            const subdirs = ['Templates', 'Archives'];
            subdirs.forEach(subdir => {
                const dirPath = path.join(this.projectsDir, subdir);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
            });

            // Create default template if it doesn't exist
            this.createDefaultTemplate();
        } catch (error) {
            console.error('Error initializing projects directory:', error);
            throw error;
        }
    }

    /**
     * Create a default project template
     */
    createDefaultTemplate() {
        const templatePath = path.join(this.projectsDir, 'Templates', 'Default Template.pmap');

        if (!fs.existsSync(templatePath)) {
            const defaultTemplate = {
                name: 'Default Template',
                nodes: [],
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    version: '1.0'
                },
                categories: [],
                relationships: [],
                content: `Project Title
1. Main Topic
* Subtopic 1
* Subtopic 2
2. Next Topic
* Detail A
* Detail B`
            };

            fs.writeFileSync(templatePath, JSON.stringify(defaultTemplate, null, 2));
            console.log('Created default template');
        }
    }

    /**
     * Load metadata from disk
     */
    loadMetadata() {
        try {
            if (fs.existsSync(this.metadataFile)) {
                const data = fs.readFileSync(this.metadataFile, 'utf-8');
                this.metadata = JSON.parse(data);
            } else {
                this.saveMetadata();
            }
        } catch (error) {
            console.error('Error loading metadata:', error);
            this.metadata = {
                recentProjects: [],
                favorites: [],
                lastOpened: null
            };
        }
    }

    /**
     * Save metadata to disk
     */
    saveMetadata() {
        try {
            fs.writeFileSync(this.metadataFile, JSON.stringify(this.metadata, null, 2));
        } catch (error) {
            console.error('Error saving metadata:', error);
        }
    }

    /**
     * Create a new project
     * @param {string} projectName - Name of the project
     * @param {string} template - Template to use (optional)
     * @returns {object} - Project data and file path
     */
    createProject(projectName, template = null) {
        try {
            const sanitizedName = this.sanitizeFilename(projectName);
            const projectPath = path.join(this.projectsDir, `${sanitizedName}.pmap`);

            // Check if project already exists
            if (fs.existsSync(projectPath)) {
                throw new Error(`Project "${projectName}" already exists`);
            }

            let projectData;
            if (template) {
                // Load template
                const templatePath = path.join(this.projectsDir, 'Templates', `${template}.pmap`);
                if (fs.existsSync(templatePath)) {
                    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
                    projectData = { ...templateData, name: projectName };
                }
            }

            if (!projectData) {
                // Create from scratch
                projectData = {
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
            }

            // Update timestamps
            projectData.metadata.created = new Date().toISOString();
            projectData.metadata.modified = new Date().toISOString();

            // Ensure presentation structure exists
            if (!projectData.presentation) {
                projectData.presentation = {
                    slides: [],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                };
            }

            // Save project file
            fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));

            // Update metadata
            this.addToRecentProjects(projectPath);
            this.metadata.lastOpened = projectPath;
            this.saveMetadata();

            return { projectData, projectPath };
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    /**
     * Load a project from disk
     * @param {string} projectPath - Full path to project file
     * @returns {object} - Project data
     */
    loadProject(projectPath) {
        try {
            if (!fs.existsSync(projectPath)) {
                throw new Error(`Project file not found: ${projectPath}`);
            }

            const data = fs.readFileSync(projectPath, 'utf-8');
            let projectData = JSON.parse(data);

            console.log('[DEBUG] Loaded project data:', {
                version: projectData.version,
                hasNodesObject: typeof projectData.nodes === 'object',
                nodesIsArray: Array.isArray(projectData.nodes),
                hasContent: !!projectData.content,
                contentLength: projectData.content ? projectData.content.length : 0
            });

            // ✨ v5.0 Migration: Convert v5.0 format to v4.0 compatible format
            if (projectData.version === '5.0.0' && projectData.nodes && typeof projectData.nodes === 'object' && !Array.isArray(projectData.nodes)) {
                console.log('[v5.0 Migration] Detecting v5.0 format, converting to v4.0 compatible...');
                projectData = this.migrateV5ToV4(projectData);
            }

            // Ensure presentation data structure exists (migration)
            if (!projectData.presentation) {
                projectData.presentation = {
                    slides: [],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                };
            }

            // Update metadata
            this.addToRecentProjects(projectPath);
            this.metadata.lastOpened = projectPath;
            this.saveMetadata();

            return projectData;
        } catch (error) {
            console.error('Error loading project:', error);
            throw error;
        }
    }

    /**
     * Migrate v5.0 format to v4.0 compatible format
     * @param {object} v5Data - v5.0 project data
     * @returns {object} - v4.0 compatible project data
     */
    migrateV5ToV4(v5Data) {
        console.log('[v5.0 Migration] Starting migration...');

        // Use existing content field (which has the outline structure)
        const content = v5Data.content || this.convertV5NodesToOutline(v5Data.nodes);
        console.log('[v5.0 Migration] Content field:', content);

        // Create ID mapping: v5 ID -> v4 ID (node-0, node-1, etc.)
        const v5ToV4IdMap = {};
        const nodeIds = Object.keys(v5Data.nodes);
        nodeIds.forEach((v5Id, index) => {
            v5ToV4IdMap[v5Id] = `node-${index}`;
        });

        console.log('[v5.0 Migration] ID Mapping:', v5ToV4IdMap);

        // ✨ Convert v5.0 relationships to v4.0 format (relationships + connections)
        const { relationships, connections } = this.convertV5RelationshipsToV4(
            v5Data.relationships || [],
            v5ToV4IdMap
        );

        console.log('[v5.0 Migration] Converted relationships:', relationships.length, 'connections:', connections.length);

        // Build v4.0 compatible structure
        const v4Data = {
            name: v5Data.name,
            content: content,
            nodes: this.extractV5NodeDataWithMapping(v5Data.nodes, v5ToV4IdMap),
            metadata: v5Data.metadata || {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: '4.0'
            },
            categories: v5Data.categories || [],
            relationships: relationships,
            connections: connections,
            customOrders: v5Data.customOrders || {},
            presentation: v5Data.presentation || {
                slides: [],
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };

        console.log('[v5.0 Migration] Migration complete. Node count:', Object.keys(v4Data.nodes).length);
        console.log('[v5.0 Migration] Migrated data:', v4Data);
        return v4Data;
    }

    /**
     * Convert v5.0 relationships to v4.0 format (separate relationships and connections)
     * v5.0: relationships have a "nodes" array with 2 node IDs
     * v4.0: relationships define types, connections link specific nodes
     * @param {Array} v5Relationships - v5.0 relationships array
     * @param {Object} idMap - Mapping from v5 IDs to v4 IDs
     * @returns {{relationships: Array, connections: Array}} - v4.0 relationships and connections
     */
    convertV5RelationshipsToV4(v5Relationships, idMap) {
        const relationships = [];
        const connections = [];
        let connCounter = 0;

        v5Relationships.forEach(v5Rel => {
            // Create v4.0 relationship type (without the "nodes" field)
            const v4Rel = {
                id: v5Rel.id,
                name: v5Rel.name,
                color: v5Rel.color,
                dashPattern: Array.isArray(v5Rel.dashPattern)
                    ? v5Rel.dashPattern.join(',')  // Convert [5, 5] to "5,5"
                    : (v5Rel.dashPattern || '0')    // Or keep existing string
            };
            relationships.push(v4Rel);

            // Create v4.0 connection if v5 relationship has nodes defined
            if (v5Rel.nodes && v5Rel.nodes.length >= 2) {
                const fromV5Id = v5Rel.nodes[0];
                const toV5Id = v5Rel.nodes[1];
                const fromV4Id = idMap[fromV5Id];
                const toV4Id = idMap[toV5Id];

                if (fromV4Id && toV4Id) {
                    const connection = {
                        id: `conn-${Date.now()}-${connCounter++}`,
                        fromNodeId: fromV4Id,
                        toNodeId: toV4Id,
                        relationshipId: v5Rel.id
                    };
                    connections.push(connection);
                    console.log(`[v5.0 Migration] Created connection: ${fromV4Id} -> ${toV4Id} (${v5Rel.name})`);
                } else {
                    console.warn(`[v5.0 Migration] Could not map node IDs for relationship ${v5Rel.id}: ${fromV5Id}, ${toV5Id}`);
                }
            }
        });

        return { relationships, connections };
    }

    /**
     * Convert v5.0 nodes object to outline format
     * @param {object} nodesObj - v5.0 nodes object
     * @param {string} existingContent - Existing content field (fallback)
     * @returns {string} - Outline text
     */
    convertV5NodesToOutline(nodesObj, existingContent) {
        // If content field exists and is not empty, use it as a base
        if (existingContent && existingContent.trim()) {
            return existingContent;
        }

        // Otherwise, build outline from nodes hierarchy
        // Find root node (typically the first one or one with no parent references)
        const nodeIds = Object.keys(nodesObj);
        if (nodeIds.length === 0) {
            return 'Empty Project';
        }

        // Build parent-child map from content field or assume order
        // For Phase 1, we'll use the simple content field approach
        // The content field in v5.0 test files has the structure already
        const lines = [];

        // Add nodes in order (this is a simple Phase 1 implementation)
        nodeIds.forEach((nodeId, index) => {
            const node = nodesObj[nodeId];
            if (index === 0) {
                // Root node
                lines.push(node.title);
            } else {
                // Child nodes (for Phase 1, all are level 1)
                lines.push(`${index}. ${node.title}`);
            }
        });

        return lines.join('\n');
    }

    /**
     * Extract node data (descriptions, notes, images) from v5.0 nodes with ID mapping
     * @param {object} nodesObj - v5.0 nodes object
     * @param {object} idMap - Mapping from v5 IDs to v4 IDs
     * @returns {object} - nodeData structure for v4.0
     */
    extractV5NodeDataWithMapping(nodesObj, idMap) {
        const nodeData = {};

        Object.keys(nodesObj).forEach(v5Id => {
            const v5Node = nodesObj[v5Id];
            const v4Id = idMap[v5Id];

            if (!v4Id) {
                console.warn(`[v5.0 Migration] No v4 ID mapping for v5 ID: ${v5Id}`);
                return;
            }

            // Create v4.0 compatible nodeData entry with v4 ID as key
            nodeData[v4Id] = {
                description: v5Node.description || '',
                notes: v5Node.notes || '',
                images: v5Node.images || [],
                showInfo: v5Node.showInfo || false,
                categories: v5Node.categoryIds || [],
                relationships: v5Node.relationshipIds || []
            };
        });

        console.log('[v5.0 Migration] Extracted node data:', nodeData);
        return nodeData;
    }

    /**
     * Save a project to disk
     * @param {string} projectPath - Full path to project file
     * @param {object} projectData - Project data to save
     * @returns {boolean} - Success status
     */
    saveProject(projectPath, projectData) {
        try {
            // Update modification timestamp
            if (!projectData.metadata) {
                projectData.metadata = {};
            }
            projectData.metadata.modified = new Date().toISOString();

            // Update presentation modified timestamp if presentation data exists
            if (projectData.presentation && projectData.presentation.slides && projectData.presentation.slides.length > 0) {
                projectData.presentation.modified = new Date().toISOString();
            }

            // Save to disk
            fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));

            // Update metadata
            this.addToRecentProjects(projectPath);
            this.saveMetadata();

            return true;
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    }

    /**
     * Get list of all projects in the projects directory
     * @returns {array} - Array of project info objects
     */
    listProjects() {
        try {
            const files = fs.readdirSync(this.projectsDir);
            const projects = [];

            files.forEach(file => {
                if (file.endsWith('.pmap')) {
                    const filePath = path.join(this.projectsDir, file);
                    const stats = fs.statSync(filePath);

                    try {
                        const data = fs.readFileSync(filePath, 'utf-8');
                        const projectData = JSON.parse(data);

                        projects.push({
                            name: projectData.name || path.basename(file, '.pmap'),
                            path: filePath,
                            modified: stats.mtime,
                            created: stats.birthtime,
                            size: stats.size
                        });
                    } catch (parseError) {
                        console.error(`Error parsing project ${file}:`, parseError);
                    }
                }
            });

            // Sort by modification date (newest first)
            projects.sort((a, b) => b.modified - a.modified);

            return projects;
        } catch (error) {
            console.error('Error listing projects:', error);
            return [];
        }
    }

    /**
     * Get recent projects
     * @param {number} limit - Maximum number of recent projects to return
     * @returns {array} - Array of recent project paths
     */
    getRecentProjects(limit = 10) {
        const recentProjects = this.metadata.recentProjects
            .filter(projectPath => fs.existsSync(projectPath))
            .slice(0, limit);

        // Clean up non-existent projects
        this.metadata.recentProjects = recentProjects;
        this.saveMetadata();

        return recentProjects.map(projectPath => {
            try {
                const data = fs.readFileSync(projectPath, 'utf-8');
                const projectData = JSON.parse(data);
                return {
                    name: projectData.name || path.basename(projectPath, '.pmap'),
                    path: projectPath
                };
            } catch (error) {
                return null;
            }
        }).filter(p => p !== null);
    }

    /**
     * Add project to recent projects list
     * @param {string} projectPath - Full path to project file
     */
    addToRecentProjects(projectPath) {
        // Remove if already exists
        this.metadata.recentProjects = this.metadata.recentProjects.filter(p => p !== projectPath);

        // Add to front
        this.metadata.recentProjects.unshift(projectPath);

        // Keep only last 20
        this.metadata.recentProjects = this.metadata.recentProjects.slice(0, 20);
    }

    /**
     * Delete a project
     * @param {string} projectPath - Full path to project file
     * @param {boolean} moveToArchive - Whether to archive instead of delete
     * @returns {boolean} - Success status
     */
    deleteProject(projectPath, moveToArchive = true) {
        try {
            if (!fs.existsSync(projectPath)) {
                throw new Error('Project file not found');
            }

            if (moveToArchive) {
                const archivePath = path.join(
                    this.projectsDir,
                    'Archives',
                    path.basename(projectPath)
                );
                fs.renameSync(projectPath, archivePath);
            } else {
                fs.unlinkSync(projectPath);
            }

            // Remove from recent projects
            this.metadata.recentProjects = this.metadata.recentProjects.filter(p => p !== projectPath);
            this.saveMetadata();

            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    /**
     * Export project to different format
     * @param {string} projectPath - Source project path
     * @param {string} exportPath - Destination path
     * @param {string} format - Export format (json, md, txt)
     * @returns {boolean} - Success status
     */
    exportProject(projectPath, exportPath, format = 'json') {
        try {
            const projectData = this.loadProject(projectPath);

            let exportContent;
            switch (format) {
                case 'json':
                    exportContent = JSON.stringify(projectData, null, 2);
                    break;
                case 'md':
                case 'txt':
                    exportContent = projectData.content || '';
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            fs.writeFileSync(exportPath, exportContent);
            return true;
        } catch (error) {
            console.error('Error exporting project:', error);
            throw error;
        }
    }

    /**
     * Import project from file
     * @param {string} sourcePath - Source file path
     * @param {string} projectName - Name for the imported project
     * @returns {object} - Imported project data and path
     */
    importProject(sourcePath, projectName = null) {
        try {
            const ext = path.extname(sourcePath).toLowerCase();
            const content = fs.readFileSync(sourcePath, 'utf-8');

            let projectData;

            if (ext === '.json' || ext === '.pmap') {
                projectData = JSON.parse(content);
            } else {
                // Import as text content
                projectData = {
                    name: projectName || path.basename(sourcePath, ext),
                    nodes: [],
                    metadata: {
                        created: new Date().toISOString(),
                        modified: new Date().toISOString(),
                        version: '1.0',
                        importedFrom: sourcePath
                    },
                    categories: [],
                    relationships: [],
                    content: content
                };
            }

            // Save as new project
            const sanitizedName = this.sanitizeFilename(
                projectName || projectData.name || 'Imported Project'
            );
            const newProjectPath = path.join(this.projectsDir, `${sanitizedName}.pmap`);

            fs.writeFileSync(newProjectPath, JSON.stringify(projectData, null, 2));

            this.addToRecentProjects(newProjectPath);
            this.saveMetadata();

            return { projectData, projectPath: newProjectPath };
        } catch (error) {
            console.error('Error importing project:', error);
            throw error;
        }
    }

    /**
     * Sanitize filename for safe file system usage
     * @param {string} filename - Original filename
     * @returns {string} - Sanitized filename
     */
    sanitizeFilename(filename) {
        return filename
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Get the projects directory path
     * @returns {string} - Projects directory path
     */
    getProjectsDirectory() {
        return this.projectsDir;
    }

    /**
     * Get the last opened project path
     * @returns {string|null} - Last opened project path
     */
    getLastOpenedProject() {
        return this.metadata.lastOpened;
    }
}

module.exports = ProjectManager;
