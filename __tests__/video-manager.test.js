/**
 * @jest-environment jsdom
 */

// Mock crypto API before loading VideoManager
const mockCrypto = {
  subtle: {
    digest: jest.fn()
  }
};

// Set up crypto mock in both window and global
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

const VideoManager = require('../src/managers/video-manager');

describe('VideoManager', () => {
  let videoManager;

  beforeEach(() => {
    videoManager = new VideoManager();
  });

  describe('Constructor', () => {
    test('initializes with empty nodeVideos map', () => {
      expect(videoManager.nodeVideos).toEqual({});
    });

    test('sets correct configuration constants', () => {
      expect(videoManager.MAX_FILE_SIZE).toBe(10 * 1024 * 1024); // 10MB
      expect(videoManager.MAX_DURATION).toBe(30); // 30 seconds
      expect(videoManager.STORAGE_THRESHOLD).toBe(2 * 1024 * 1024); // 2MB
      expect(videoManager.MAX_VIDEOS_PER_NODE).toBe(3);
      expect(videoManager.ACCEPTED_FORMATS).toEqual(['video/mp4', 'video/webm']);
      expect(videoManager.THUMBNAIL_WIDTH).toBe(200);
      expect(videoManager.THUMBNAIL_HEIGHT).toBe(150);
      expect(videoManager.THUMBNAIL_QUALITY).toBe(0.8);
    });
  });

  describe('addVideo', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      thumbnail: 'data:image/jpeg;base64,/9j/',
      filename: 'test.mp4',
      size: 1048576,
      duration: 10,
      storageType: 'embedded',
      addedAt: '2025-10-13T00:00:00Z'
    };

    test('adds video to node and returns index', () => {
      const index = videoManager.addVideo('node-1', mockVideoData);

      expect(index).toBe(0);
      expect(videoManager.nodeVideos['node-1']).toEqual([mockVideoData]);
    });

    test('adds multiple videos to same node', () => {
      const video1 = { ...mockVideoData, filename: 'video1.mp4' };
      const video2 = { ...mockVideoData, filename: 'video2.mp4' };

      const index1 = videoManager.addVideo('node-1', video1);
      const index2 = videoManager.addVideo('node-1', video2);

      expect(index1).toBe(0);
      expect(index2).toBe(1);
      expect(videoManager.nodeVideos['node-1'].length).toBe(2);
    });

    test('adds videos to different nodes independently', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-2', mockVideoData);

      expect(videoManager.nodeVideos['node-1'].length).toBe(1);
      expect(videoManager.nodeVideos['node-2'].length).toBe(1);
    });

    test('throws error when max videos limit reached', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-1', mockVideoData);

      expect(() => {
        videoManager.addVideo('node-1', mockVideoData);
      }).toThrow('Maximum 3 videos per node');
    });
  });

  describe('removeVideo', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      filename: 'test.mp4'
    };

    test('removes video at valid index', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-1', { ...mockVideoData, filename: 'test2.mp4' });

      const result = videoManager.removeVideo('node-1', 0);

      expect(result).toBe(true);
      expect(videoManager.nodeVideos['node-1'].length).toBe(1);
      expect(videoManager.nodeVideos['node-1'][0].filename).toBe('test2.mp4');
    });

    test('removes node entry when last video deleted', () => {
      videoManager.addVideo('node-1', mockVideoData);

      videoManager.removeVideo('node-1', 0);

      expect(videoManager.nodeVideos['node-1']).toBeUndefined();
    });

    test('returns false for invalid index', () => {
      videoManager.addVideo('node-1', mockVideoData);

      const result = videoManager.removeVideo('node-1', 5);

      expect(result).toBe(false);
    });

    test('returns false for non-existent node', () => {
      const result = videoManager.removeVideo('non-existent', 0);

      expect(result).toBe(false);
    });

    test('returns false for negative index', () => {
      videoManager.addVideo('node-1', mockVideoData);

      const result = videoManager.removeVideo('node-1', -1);

      expect(result).toBe(false);
    });
  });

  describe('getNodeVideos', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      filename: 'test.mp4'
    };

    test('returns videos for existing node', () => {
      videoManager.addVideo('node-1', mockVideoData);

      const videos = videoManager.getNodeVideos('node-1');

      expect(videos).toEqual([mockVideoData]);
    });

    test('returns empty array for node without videos', () => {
      const videos = videoManager.getNodeVideos('node-1');

      expect(videos).toEqual([]);
    });
  });

  describe('hasVideos', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      filename: 'test.mp4'
    };

    test('returns true when node has videos', () => {
      videoManager.addVideo('node-1', mockVideoData);

      expect(videoManager.hasVideos('node-1')).toBe(true);
    });

    test('returns false when node has no videos', () => {
      expect(videoManager.hasVideos('node-1')).toBe(false);
    });

    test('returns false after all videos removed', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.removeVideo('node-1', 0);

      expect(videoManager.hasVideos('node-1')).toBe(false);
    });
  });

  describe('getVideoCount', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      filename: 'test.mp4'
    };

    test('returns correct count for node with videos', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-1', mockVideoData);

      expect(videoManager.getVideoCount('node-1')).toBe(2);
    });

    test('returns 0 for node without videos', () => {
      expect(videoManager.getVideoCount('node-1')).toBe(0);
    });
  });

  describe('clearNodeVideos', () => {
    const mockVideoData = {
      url: 'data:video/mp4;base64,AAAA',
      filename: 'test.mp4'
    };

    test('clears all videos for node', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-1', mockVideoData);

      videoManager.clearNodeVideos('node-1');

      expect(videoManager.nodeVideos['node-1']).toBeUndefined();
      expect(videoManager.hasVideos('node-1')).toBe(false);
    });

    test('does not affect other nodes', () => {
      videoManager.addVideo('node-1', mockVideoData);
      videoManager.addVideo('node-2', mockVideoData);

      videoManager.clearNodeVideos('node-1');

      expect(videoManager.hasVideos('node-2')).toBe(true);
    });
  });

  describe('validateVideo', () => {
    // Mock file factory
    const createMockFile = (type, size) => {
      return {
        type,
        size,
        name: 'test.mp4'
      };
    };

    // Mock getVideoDuration to avoid actual video loading
    beforeEach(() => {
      videoManager.getVideoDuration = jest.fn().mockResolvedValue(15); // 15 seconds
    });

    test('accepts valid MP4 file', async () => {
      const file = createMockFile('video/mp4', 5 * 1024 * 1024); // 5MB

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('accepts valid WebM file', async () => {
      const file = createMockFile('video/webm', 5 * 1024 * 1024);

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(true);
    });

    test('rejects invalid format', async () => {
      const file = createMockFile('video/avi', 5 * 1024 * 1024);

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only MP4 and WebM are supported');
    });

    test('rejects file exceeding size limit', async () => {
      const file = createMockFile('video/mp4', 11 * 1024 * 1024); // 11MB

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
      expect(result.error).toContain('10.0MB');
    });

    test('rejects file exceeding duration limit', async () => {
      videoManager.getVideoDuration.mockResolvedValue(35); // 35 seconds
      const file = createMockFile('video/mp4', 5 * 1024 * 1024);

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Video too long');
      expect(result.error).toContain('30 seconds');
    });

    test('rejects file with unreadable duration', async () => {
      videoManager.getVideoDuration.mockRejectedValue(new Error('Failed to load'));
      const file = createMockFile('video/mp4', 5 * 1024 * 1024);

      const result = await videoManager.validateVideo(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Could not read video duration');
    });
  });

  describe('determineStorageType', () => {
    test('returns embedded for small files', () => {
      expect(videoManager.determineStorageType(1024 * 1024)).toBe('embedded'); // 1MB
      expect(videoManager.determineStorageType(1.5 * 1024 * 1024)).toBe('embedded'); // 1.5MB
    });

    test('returns external for files at threshold', () => {
      expect(videoManager.determineStorageType(2 * 1024 * 1024)).toBe('external'); // 2MB
    });

    test('returns external for large files', () => {
      expect(videoManager.determineStorageType(5 * 1024 * 1024)).toBe('external'); // 5MB
      expect(videoManager.determineStorageType(10 * 1024 * 1024)).toBe('external'); // 10MB
    });
  });

  describe('formatDuration', () => {
    test('formats duration under 1 minute', () => {
      expect(videoManager.formatDuration(45)).toBe('0:45');
      expect(videoManager.formatDuration(5)).toBe('0:05');
    });

    test('formats duration over 1 minute', () => {
      expect(videoManager.formatDuration(85)).toBe('1:25');
      expect(videoManager.formatDuration(125)).toBe('2:05');
    });

    test('formats exact minutes', () => {
      expect(videoManager.formatDuration(60)).toBe('1:00');
      expect(videoManager.formatDuration(120)).toBe('2:00');
    });

    test('handles decimal seconds', () => {
      expect(videoManager.formatDuration(85.7)).toBe('1:25');
      expect(videoManager.formatDuration(45.3)).toBe('0:45');
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes', () => {
      expect(videoManager.formatFileSize(500)).toBe('500 B');
      expect(videoManager.formatFileSize(1023)).toBe('1023 B');
    });

    test('formats kilobytes', () => {
      expect(videoManager.formatFileSize(1024)).toBe('1.0 KB');
      expect(videoManager.formatFileSize(5120)).toBe('5.0 KB');
      expect(videoManager.formatFileSize(1536)).toBe('1.5 KB');
    });

    test('formats megabytes', () => {
      expect(videoManager.formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(videoManager.formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
      expect(videoManager.formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('loadFromNodeData', () => {
    const mockNodeData = {
      'node-1': {
        description: 'Test node',
        notes: '',
        images: [],
        videos: [
          {
            url: 'data:video/mp4;base64,AAAA',
            filename: 'video1.mp4',
            size: 1048576,
            duration: 10
          }
        ]
      },
      'node-2': {
        description: 'Another node',
        videos: [
          {
            url: 'data:video/mp4;base64,BBBB',
            filename: 'video2.mp4',
            size: 2048576,
            duration: 15
          },
          {
            url: 'data:video/mp4;base64,CCCC',
            filename: 'video3.mp4',
            size: 3048576,
            duration: 20
          }
        ]
      },
      'node-3': {
        description: 'Node without videos',
        images: []
      }
    };

    test('loads videos from nodeData', () => {
      videoManager.loadFromNodeData(mockNodeData);

      expect(videoManager.nodeVideos['node-1'].length).toBe(1);
      expect(videoManager.nodeVideos['node-2'].length).toBe(2);
      expect(videoManager.nodeVideos['node-3']).toBeUndefined();
    });

    test('preserves video metadata', () => {
      videoManager.loadFromNodeData(mockNodeData);

      const video = videoManager.nodeVideos['node-1'][0];
      expect(video.filename).toBe('video1.mp4');
      expect(video.size).toBe(1048576);
      expect(video.duration).toBe(10);
    });

    test('clears existing videos before loading', () => {
      videoManager.nodeVideos = {
        'old-node': [{ filename: 'old.mp4' }]
      };

      videoManager.loadFromNodeData(mockNodeData);

      expect(videoManager.nodeVideos['old-node']).toBeUndefined();
      expect(videoManager.nodeVideos['node-1']).toBeDefined();
    });

    test('handles empty nodeData', () => {
      videoManager.loadFromNodeData({});

      expect(videoManager.nodeVideos).toEqual({});
    });
  });

  describe('exportToNodeData', () => {
    test('exports videos to nodeData format', () => {
      const mockVideo = {
        url: 'data:video/mp4;base64,AAAA',
        filename: 'test.mp4',
        size: 1048576,
        duration: 10
      };

      videoManager.addVideo('node-1', mockVideo);
      videoManager.addVideo('node-2', mockVideo);

      const exported = videoManager.exportToNodeData();

      expect(exported['node-1'].videos.length).toBe(1);
      expect(exported['node-2'].videos.length).toBe(1);
    });

    test('exports multiple videos per node', () => {
      const video1 = { filename: 'video1.mp4' };
      const video2 = { filename: 'video2.mp4' };

      videoManager.addVideo('node-1', video1);
      videoManager.addVideo('node-1', video2);

      const exported = videoManager.exportToNodeData();

      expect(exported['node-1'].videos.length).toBe(2);
      expect(exported['node-1'].videos[0].filename).toBe('video1.mp4');
      expect(exported['node-1'].videos[1].filename).toBe('video2.mp4');
    });

    test('returns empty object when no videos', () => {
      const exported = videoManager.exportToNodeData();

      expect(exported).toEqual({});
    });

    test('round-trip preserves data', () => {
      const original = {
        'node-1': {
          videos: [
            {
              url: 'data:video/mp4;base64,AAAA',
              filename: 'test.mp4',
              size: 1048576,
              duration: 10,
              storageType: 'embedded'
            }
          ]
        }
      };

      videoManager.loadFromNodeData(original);
      const exported = videoManager.exportToNodeData();

      expect(exported['node-1'].videos).toEqual(original['node-1'].videos);
    });
  });

  describe('generateFileHash', () => {
    test('generates hash from file', async () => {
      // Setup crypto digest mock to return specific hash
      const mockHashBuffer = new Uint8Array([
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
      ]);

      mockCrypto.subtle.digest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const mockFile = {
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      };

      const hash = await videoManager.generateFileHash(mockFile);

      expect(hash).toHaveLength(16);
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^[0-9a-f]{16}$/); // Verify hex format
      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
    });
  });
});
