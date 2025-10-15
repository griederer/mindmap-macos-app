/**
 * StateEngine - Captures and compares complete mindmap state
 *
 * Responsibilities:
 * - Capture complete mindmap state (camera, nodes, panels, modals, relationships)
 * - Compare two states and generate diff objects
 * - Serialize/deserialize state to/from JSON
 * - Validate state integrity
 *
 * State Structure:
 * {
 *   camera: { x, y, zoom },
 *   expandedNodes: [nodeId1, nodeId2, ...],
 *   focusedNode: nodeId | null,
 *   infoPanel: { open: boolean, nodeId: string | null },
 *   imageModal: { open: boolean, nodeId: string | null, imageIndex: number | null },
 *   visibleRelationships: [relId1, relId2, ...],
 *   focusMode: boolean
 * }
 */

class StateEngine {
  /**
   * Captures the current complete state of the mindmap
   * @param {MindmapEngine} mindmapEngine - Reference to the mindmap engine
   * @returns {Object} Complete state snapshot
   */
  captureState(mindmapEngine) {
    return {
      camera: {
        x: mindmapEngine.camera.x,
        y: mindmapEngine.camera.y,
        zoom: mindmapEngine.camera.zoom
      },
      expandedNodes: Array.from(mindmapEngine.expandedNodes || []),
      focusedNode: mindmapEngine.focusedNode || null,
      infoPanel: {
        open: mindmapEngine.infoPanel?.open || false,
        nodeId: mindmapEngine.infoPanel?.nodeId || null
      },
      imageModal: {
        open: mindmapEngine.imageModal?.open || false,
        nodeId: mindmapEngine.imageModal?.nodeId || null,
        imageIndex: mindmapEngine.imageModal?.imageIndex || null
      },
      visibleRelationships: Array.from(mindmapEngine.visibleRelationships || []),
      focusMode: mindmapEngine.focusMode || false
    };
  }

  /**
   * Compares two states and returns differences
   * @param {Object} state1 - First state
   * @param {Object} state2 - Second state
   * @returns {Object} Diff object with changes needed to go from state1 to state2
   * {
   *   nodesToExpand: [],
   *   nodesToCollapse: [],
   *   infoPanelChange: { action: 'open'|'close', nodeId },
   *   imageModalChange: { action: 'open'|'close', nodeId, imageIndex },
   *   relationshipsToShow: [],
   *   relationshipsToHide: [],
   *   focusChange: { enabled: boolean, nodeId }
   * }
   */
  compareStates(state1, state2) {
    const diff = {
      nodesToExpand: [],
      nodesToCollapse: [],
      infoPanelChange: null,
      imageModalChange: null,
      relationshipsToShow: [],
      relationshipsToHide: [],
      focusChange: null,
      cameraChange: null
    };

    // Compare expanded nodes
    const set1 = new Set(state1.expandedNodes);
    const set2 = new Set(state2.expandedNodes);

    diff.nodesToExpand = state2.expandedNodes.filter(id => !set1.has(id));
    diff.nodesToCollapse = state1.expandedNodes.filter(id => !set2.has(id));

    // Compare info panel
    if (state1.infoPanel.open !== state2.infoPanel.open) {
      diff.infoPanelChange = {
        action: state2.infoPanel.open ? 'open' : 'close',
        nodeId: state2.infoPanel.nodeId
      };
    }

    // Compare image modal
    if (state1.imageModal.open !== state2.imageModal.open) {
      diff.imageModalChange = {
        action: state2.imageModal.open ? 'open' : 'close',
        nodeId: state2.imageModal.nodeId,
        imageIndex: state2.imageModal.imageIndex
      };
    }

    // Compare relationships
    const relSet1 = new Set(state1.visibleRelationships);
    const relSet2 = new Set(state2.visibleRelationships);

    diff.relationshipsToShow = state2.visibleRelationships.filter(id => !relSet1.has(id));
    diff.relationshipsToHide = state1.visibleRelationships.filter(id => !relSet2.has(id));

    // Compare focus mode
    if (state1.focusMode !== state2.focusMode) {
      diff.focusChange = {
        enabled: state2.focusMode,
        nodeId: state2.focusedNode
      };
    }

    // Compare camera
    if (state1.camera.x !== state2.camera.x ||
        state1.camera.y !== state2.camera.y ||
        state1.camera.zoom !== state2.camera.zoom) {
      diff.cameraChange = {
        x: state2.camera.x,
        y: state2.camera.y,
        zoom: state2.camera.zoom
      };
    }

    return diff;
  }

  /**
   * Validates state object structure and integrity
   * @param {Object} state - State to validate
   * @returns {Object} { valid: boolean, errors: [] }
   */
  validateState(state) {
    const errors = [];

    // Validate required properties exist
    const requiredProps = ['camera', 'expandedNodes', 'focusedNode', 'infoPanel', 'imageModal', 'visibleRelationships', 'focusMode'];
    for (const prop of requiredProps) {
      if (!(prop in state)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // If basic structure is invalid, return early
    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Validate camera structure
    if (!state.camera || typeof state.camera !== 'object') {
      errors.push('camera must be an object');
    } else {
      if (typeof state.camera.x !== 'number') errors.push('camera.x must be a number');
      if (typeof state.camera.y !== 'number') errors.push('camera.y must be a number');
      if (typeof state.camera.zoom !== 'number') errors.push('camera.zoom must be a number');
    }

    // Validate expandedNodes
    if (!Array.isArray(state.expandedNodes)) {
      errors.push('expandedNodes must be an array');
    }

    // Validate focusedNode (can be string or null)
    if (state.focusedNode !== null && typeof state.focusedNode !== 'string') {
      errors.push('focusedNode must be a string or null');
    }

    // Validate infoPanel structure
    if (!state.infoPanel || typeof state.infoPanel !== 'object') {
      errors.push('infoPanel must be an object');
    } else {
      if (typeof state.infoPanel.open !== 'boolean') {
        errors.push('infoPanel.open must be a boolean');
      }
      if (!('nodeId' in state.infoPanel)) {
        errors.push('infoPanel must have nodeId property');
      }
    }

    // Validate imageModal structure
    if (!state.imageModal || typeof state.imageModal !== 'object') {
      errors.push('imageModal must be an object');
    } else {
      if (typeof state.imageModal.open !== 'boolean') {
        errors.push('imageModal.open must be a boolean');
      }
      if (!('nodeId' in state.imageModal)) {
        errors.push('imageModal must have nodeId property');
      }
      if (!('imageIndex' in state.imageModal)) {
        errors.push('imageModal must have imageIndex property');
      }
    }

    // Validate visibleRelationships
    if (!Array.isArray(state.visibleRelationships)) {
      errors.push('visibleRelationships must be an array');
    }

    // Validate focusMode
    if (typeof state.focusMode !== 'boolean') {
      errors.push('focusMode must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Serializes state to JSON string
   * @param {Object} state - State object
   * @returns {string} JSON string
   */
  serializeState(state) {
    return JSON.stringify(state);
  }

  /**
   * Deserializes JSON string to state object
   * @param {string} json - JSON string
   * @returns {Object} State object
   */
  deserializeState(json) {
    return JSON.parse(json);
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateEngine;
}
