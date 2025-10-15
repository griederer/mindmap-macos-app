/**
 * Tests to verify old presentation system has been completely removed
 * Task 1.6 - Write tests verifying old system is removed
 */

const fs = require('fs');
const path = require('path');

describe('Old Presentation System Removal', () => {
  describe('File Removal', () => {
    test('presentation-manager.js should not exist in root', () => {
      const filePath = path.join(__dirname, 'presentation-manager.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    test('presentation-ui.js should not exist in root', () => {
      const filePath = path.join(__dirname, 'presentation-ui.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    test('presentation-manager.test.js should not exist in root', () => {
      const filePath = path.join(__dirname, 'presentation-manager.test.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });
  });

  describe('Backup Verification', () => {
    test('temp-clone directory should exist', () => {
      const dirPath = path.join(__dirname, 'temp-clone');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    test('backup files should exist in temp-clone', () => {
      const backupFiles = [
        'presentation-manager.js',
        'presentation-ui.js',
        'presentation-manager.test.js'
      ];

      backupFiles.forEach(file => {
        const filePath = path.join(__dirname, 'temp-clone', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('HTML Cleanup', () => {
    let indexHtml;

    beforeAll(() => {
      const htmlPath = path.join(__dirname, 'index.html');
      indexHtml = fs.readFileSync(htmlPath, 'utf-8');
    });

    test('should not contain presentModeBtn button', () => {
      expect(indexHtml).not.toMatch(/id="presentModeBtn"/);
    });

    test('should not contain addSlideBtn button', () => {
      expect(indexHtml).not.toMatch(/id="addSlideBtn"/);
    });

    test('should not contain slideCounter element', () => {
      expect(indexHtml).not.toMatch(/id="slideCounter"/);
    });

    test('should not contain presentBtn button', () => {
      expect(indexHtml).not.toMatch(/id="presentBtn"/);
    });

    test('should not contain slidesPanel', () => {
      expect(indexHtml).not.toMatch(/id="slidesPanel"/);
    });

    test('should not contain toggleSlidesPanel button', () => {
      expect(indexHtml).not.toMatch(/id="toggleSlidesPanel"/);
    });

    test('should not contain presentationOverlay', () => {
      expect(indexHtml).not.toMatch(/id="presentationOverlay"/);
    });

    test('should not contain presentationContent', () => {
      expect(indexHtml).not.toMatch(/id="presentationContent"/);
    });

    test('should not contain presentationCounter', () => {
      expect(indexHtml).not.toMatch(/id="presentationCounter"/);
    });

    test('should not reference presentation-manager.js script', () => {
      expect(indexHtml).not.toMatch(/<script src="presentation-manager\.js"><\/script>/);
    });

    test('should not reference presentation-ui.js script', () => {
      expect(indexHtml).not.toMatch(/<script src="presentation-ui\.js"><\/script>/);
    });
  });

  describe('Project Structure', () => {
    test('presentations directory should exist', () => {
      const dirPath = path.join(__dirname, 'presentations');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    test('.gitignore should ignore .presentation files', () => {
      const gitignorePath = path.join(__dirname, '.gitignore');
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignore).toMatch(/presentations\/\*\.presentation/);
    });
  });
});
