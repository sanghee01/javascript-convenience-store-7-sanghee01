import fs from 'fs';
import path from 'path';

class FileLoader {
  constructor() {
    this.rootDir = process.cwd(); // 현재 작업 디렉토리
  }

  loadFile(relativeFilePath) {
    const fullPath = path.join(this.rootDir, relativeFilePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf-8').trim().split('\n');
  }
}

export default FileLoader;
