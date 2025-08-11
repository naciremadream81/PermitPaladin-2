import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { log } from './vite';

export class LocalFileStorage {
  private uploadPath: string;

  constructor(uploadPath: string = './uploads') {
    this.uploadPath = uploadPath;
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
      log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    documentType: string,
    packageId: string
  ): Promise<{
    fileName: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    objectPath: string;
  }> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${nanoid()}${fileExtension}`;
    const packageDir = path.join(this.uploadPath, packageId);
    const filePath = path.join(packageDir, fileName);

    // Ensure package directory exists
    await fs.mkdir(packageDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    log(`File uploaded: ${filePath} (${file.size} bytes)`);

    return {
      fileName,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      objectPath: path.join(packageId, fileName),
    };
  }

  async getFile(objectPath: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.uploadPath, objectPath);
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      log(`Error reading file ${objectPath}: ${error}`);
      return null;
    }
  }

  async deleteFile(objectPath: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadPath, objectPath);
      await fs.unlink(filePath);
      log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      log(`Error deleting file ${objectPath}: ${error}`);
      return false;
    }
  }

  async getFileInfo(objectPath: string): Promise<{
    size: number;
    exists: boolean;
    path: string;
  } | null> {
    try {
      const filePath = path.join(this.uploadPath, objectPath);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        exists: true,
        path: filePath,
      };
    } catch (error) {
      return {
        size: 0,
        exists: false,
        path: '',
      };
    }
  }

  async listPackageFiles(packageId: string): Promise<string[]> {
    try {
      const packageDir = path.join(this.uploadPath, packageId);
      const files = await fs.readdir(packageDir);
      return files;
    } catch (error) {
      return [];
    }
  }

  async cleanupPackageFiles(packageId: string): Promise<boolean> {
    try {
      const packageDir = path.join(this.uploadPath, packageId);
      await fs.rm(packageDir, { recursive: true, force: true });
      log(`Cleaned up package directory: ${packageDir}`);
      return true;
    } catch (error) {
      log(`Error cleaning up package directory ${packageId}: ${error}`);
      return false;
    }
  }
}
