import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
      url: `/api/v1/documents/${path.basename(targetPath)}/download`,
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
    return `/api/v1/documents/${path.basename(key)}/download`;
  }
}

export class S3StorageProvider implements IStorageProvider {
  public name = 's3';
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor(bucket?: string, region?: string, client?: S3Client) {
    this.bucket = bucket || env.AWS_S3_BUCKET || 'franchisebridge-private-vault';
    this.region = region || env.AWS_REGION || 'ap-south-1';

    if (client) {
      this.client = client;
    } else {
      const config: S3ClientConfig = {
        region: this.region,
      };

      if (env.AWS_ENDPOINT) {
        config.endpoint = env.AWS_ENDPOINT;
        config.forcePathStyle = true;
      }

      if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
        config.credentials = {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        };
      }
      // If credentials are omitted, AWS SDK v3 falls back to the default credential provider chain
      // (environment variables, IAM roles for EC2/ECS/Kubernetes, Web Identity tokens).

      this.client = new S3Client(config);
    }
  }

  private resolveSafeKey(key: string): string {
    if (key.includes('..')) {
      throw new Error(`Security violation: Key contains invalid traversal sequence: ${key}`);
    }
    // Strip leading slashes to conform to AWS S3 key conventions
    return key.replace(/^\/+/, '');
  }

  public async saveFile(key: string, data: Buffer | Uint8Array, mimeType?: string): Promise<StorageFileResult> {
    const safeKey = this.resolveSafeKey(key);
    const bodyBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const contentType = mimeType || 'application/octet-stream';

    Logger.info(`[S3StorageProvider] Uploading to s3://${this.bucket}/${safeKey} (${bodyBuffer.length} bytes, ${contentType})`);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: safeKey,
      Body: bodyBuffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        'uploaded-by': 'franchisebridge-backend',
        'upload-timestamp': new Date().toISOString(),
      },
    });

    await this.client.send(command);

    return {
      key: safeKey,
      size: bodyBuffer.length,
      // For private documents, return the internal authenticated download endpoint to preserve authorization
      url: `/api/v1/documents/${path.basename(safeKey)}/download`,
    };
  }

  public async getFileStream(key: string): Promise<{ stream: NodeJS.ReadableStream; size: number; mimeType?: string }> {
    const safeKey = this.resolveSafeKey(key);
    Logger.info(`[S3StorageProvider] Streaming from s3://${this.bucket}/${safeKey}`);

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: safeKey,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error(`S3 GetObject returned empty body for key: ${safeKey}`);
      }

      // In Node.js environment with AWS SDK v3, response.Body is a Readable stream
      const stream = response.Body as unknown as NodeJS.ReadableStream;
      const size = response.ContentLength ?? 0;
      const mimeType = response.ContentType;

      return {
        stream,
        size,
        mimeType,
      };
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        throw new Error(`File not found: ${key}`);
      }
      throw err;
    }
  }

  public async deleteFile(key: string): Promise<boolean> {
    const safeKey = this.resolveSafeKey(key);
    Logger.info(`[S3StorageProvider] Deleting from s3://${this.bucket}/${safeKey}`);

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: safeKey,
      });

      await this.client.send(command);
      return true;
    } catch (err: any) {
      Logger.error(`[S3StorageProvider] Error deleting file s3://${this.bucket}/${safeKey}:`, err);
      return false;
    }
  }

  public async fileExists(key: string): Promise<boolean> {
    const safeKey = this.resolveSafeKey(key);
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: safeKey,
      });
      await this.client.send(command);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      Logger.warn(`[S3StorageProvider] fileExists check encountered non-404 error for key ${safeKey}: ${err.message}`);
      return false;
    }
  }

  public async getDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const safeKey = this.resolveSafeKey(key);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: safeKey,
    });

    // Generate secure time-limited presigned URL via AWS SDK v3
    return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

let storageInstance: IStorageProvider | null = null;

export function getStorageService(): IStorageProvider {
  if (!storageInstance) {
    if (env.STORAGE_DRIVER === 's3' && env.AWS_S3_BUCKET) {
      storageInstance = new S3StorageProvider();
    } else {
      if (env.isProduction) {
        throw new Error(
          'Production storage misconfiguration: AWS S3 is required in production (STORAGE_DRIVER=s3 and AWS_S3_BUCKET). Local disk storage is prohibited on ephemeral containers.'
        );
      }
      storageInstance = new LocalStorageProvider();
    }
  }
  return storageInstance;
}

export function setStorageService(provider: IStorageProvider | null): void {
  storageInstance = provider;
}
