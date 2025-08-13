// import { Storage, File } from "@google-cloud/storage";
import { ObjectAclPolicy, getObjectAclPolicy, setObjectAclPolicy } from "./objectAcl";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

// Simple local storage implementation
export const objectStorageClient = {
  bucket: (bucketName: string) => ({
    file: (fileName: string) => ({
      name: fileName,
      bucket: { name: bucketName }
    })
  })
};

export class ObjectStorageService {
  private uploadDir = "./uploads";

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getObjectEntityFile(fileId: string): Promise<any> {
    const filePath = path.join(this.uploadDir, fileId);
    if (fs.existsSync(filePath)) {
      return {
        name: fileId,
        bucket: { name: "local" },
        path: filePath
      };
    }
    throw new Error("File not found");
  }

  async canAccessObjectEntity(params: { objectFile: any; userId: string; permission: string }): Promise<boolean> {
    // Simple access control - for now, allow all access
    return true;
  }

  async downloadObject(objectFile: any, res: any): Promise<void> {
    const filePath = objectFile.path;
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    // Generate a unique filename
    const fileId = nanoid();
    return `/api/upload/${fileId}`;
  }

  async trySetObjectEntityAclPolicy(params: {
    objectFile: any;
    aclPolicy: ObjectAclPolicy;
  }): Promise<string> {
    // For local storage, just return the file path
    return params.objectFile.path || params.objectFile.name;
  }
}
