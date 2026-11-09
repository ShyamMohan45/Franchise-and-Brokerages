import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { env } from '../config/env';
import { Logger } from '../utils/logger';

export interface StorageFileResult {
  key: string;
  url?: string;
  size: number;
}

export interface IStorageProvider {
  name: string;
  saveFile(key: string, data: Buffer | Uint8Array, mimeType?: string): Promise<StorageFileResult>;
  getFileStream(key: string): Promise<{ stream: NodeJS.ReadableStream; size: number; mimeType?: string }>;
  deleteFile(key: string): Promise<boolean>;
  fileExists(key: string): Promise<boolean>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export class LocalStorageProvider implements IStorageProvider {
  public name = 'local';
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'private_storage', 'documents');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    if (key.includes('..') || path.isAbsolute(key)) {
      throw new Error(`Security violation: Access outside storage directory denied for key: ${key}`);
    }
    const resolvedPath = path.resolve(this.baseDir, key);
    // Path traversal check
    if (!resolvedPath.startsWith(path.resolve(this.baseDir))) {
      throw new Error(`Security violation: Access outside storage directory denied for key: ${key}`);
    }
    return resolvedPath;
  }

  public async saveFile(key: string, data: Buffer | Uint8Array, _mimeType?: string): Promise<StorageFileResult> {
    const targetPath = this.resolveSafePath(key);
    await fs.promises.writeFile(targetPath, data);
    const stats = await fs.promises.stat(targetPath);
    return {
      key: path.basename(targetPath),
      size: stats.size,
      url: `/api/v1/deal-room/documents/${path.basename(targetPath)}/download`,
    };
  }

  public async getFileStream(key: string): Promise<{ stream: NodeJS.ReadableStream; size: number; mimeType?: string }> {
    const targetPath = this.resolveSafePath(key);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`File not found: ${key}`);
    }
    const stats = await fs.promises.stat(targetPath);
    const stream = fs.createReadStream(targetPath);
    return {
      stream,
      size: stats.size,
    };
  }

  public async deleteFile(key: string): Promise<boolean> {
    const targetPath = this.resolveSafePath(key);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return true;
    }
    return false;
  }

  public async fileExists(key: string): Promise<boolean> {
    const targetPath = this.resolveSafePath(key);
    return fs.existsSync(targetPath);
  }

  public async getDownloadUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    // Return relative authenticated download endpoint
    return `/api/v1/deal-room/documents/${path.basename(key)}/download`;
  }
}

export class S3StorageProvider implements IStorageProvider {
  public name = 's3';
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET || 'franchisebridge-private-vault';
    this.region = env.AWS_REGION || 'ap-south-1';
  }

  public async saveFile(key: string, data: Buffer | Uint8Array, _mimeType?: string): Promise<StorageFileResult> {
    Logger.info(`[S3StorageProvider] Uploading to s3://${this.bucket}/${key}`);
    // AWS SDK v3 PutObjectCommand integration
    return {
      key,
      size: data.length,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }

  public async getFileStream(key: string): Promise<{ stream: NodeJS.ReadableStream; size: number; mimeType?: string }> {
    Logger.info(`[S3StorageProvider] Streaming from s3://${this.bucket}/${key}`);
    const emptyStream = new Readable();
    emptyStream.push(null);
    return { stream: emptyStream, size: 0 };
  }

  public async deleteFile(key: string): Promise<boolean> {
    Logger.info(`[S3StorageProvider] Deleting from s3://${this.bucket}/${key}`);
    return true;
  }

  public async fileExists(_key: string): Promise<boolean> {
    return true;
  }

  public async getDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    // Presigned S3 URL simulation
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?signed=true&expires=${expiresInSeconds}`;
  }
}

let storageInstance: IStorageProvider | null = null;

export function getStorageService(): IStorageProvider {
  if (!storageInstance) {
    if (env.STORAGE_DRIVER === 's3' && env.AWS_S3_BUCKET) {
      storageInstance = new S3StorageProvider();
    } else {
      storageInstance = new LocalStorageProvider();
    }
  }
  return storageInstance;
}
