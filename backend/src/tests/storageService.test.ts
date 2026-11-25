import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Readable, Writable } from 'stream';
import {
  LocalStorageProvider,
  S3StorageProvider,
  getStorageService,
  setStorageService,
} from '../services/storageService';
import { S3Client } from '@aws-sdk/client-s3';
import { uploadDocumentFile, downloadDocument } from '../controllers/documentController';
import { downloadDealDocument, deleteDealDocument } from '../controllers/dealRoomController';
import { env } from '../config/env';
import { SOPDocument } from '../models/SOPDocument';
import { LegalDocument } from '../models/LegalDocument';
import { DealRoom } from '../models/DealRoom';
import { DealDocument } from '../models/DealDocument';
import { AuditLog } from '../models/AuditLog';

// Helper mock response stream for Express
class MockResponse extends Writable {
  public statusCode = 200;
  public headers: Record<string, any> = {};
  public body: any = null;
  public chunks: Buffer[] = [];
  public downloadedFile: { filePath: string; fileName: string } | null = null;

  _write(chunk: any, encoding: string, callback: () => void) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }

  setHeader(key: string, val: any) {
    this.headers[key] = val;
    return this;
  }

  download(filePath: string, fileName: string) {
    this.downloadedFile = { filePath, fileName };
    return this;
  }

  getStreamContent(): string {
    return Buffer.concat(this.chunks).toString();
  }
}

function createMockRequest(options: any = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    user: { _id: '507f1f77bcf86cd799439011', role: 'admin', email: 'admin@franchisebridge.com' },
    ...options,
  };
}

describe('Storage Service Test Suite (Local & AWS S3)', () => {
  const testDir = path.join(process.cwd(), 'private_storage', 'test_documents');

  beforeEach(() => {
    setStorageService(null);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    setStorageService(null);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. LocalStorageProvider Tests
  // ---------------------------------------------------------------------------
  describe('LocalStorageProvider', () => {
    it('should save a file, verify existence, read stream, and delete', async () => {
      const provider = new LocalStorageProvider(testDir);
      expect(provider.name).toBe('local');

      const content = Buffer.from('Confidential Deal Room Document Content');
      const testKey = 'deal_test_123.pdf';

      // 1. Save
      const saveResult = await provider.saveFile(testKey, content, 'application/pdf');
      expect(saveResult.key).toBe(testKey);
      expect(saveResult.size).toBe(content.length);
      expect(saveResult.url).toContain(`/api/v1/documents/${testKey}/download`);

      // 2. Exists
      const exists = await provider.fileExists(testKey);
      expect(exists).toBe(true);

      const notExists = await provider.fileExists('non_existent.pdf');
      expect(notExists).toBe(false);

      // 3. Read Stream
      const streamResult = await provider.getFileStream(testKey);
      expect(streamResult.size).toBe(content.length);

      const chunks: Buffer[] = [];
      for await (const chunk of streamResult.stream) {
        chunks.push(Buffer.from(chunk));
      }
      const streamContent = Buffer.concat(chunks).toString();
      expect(streamContent).toBe('Confidential Deal Room Document Content');

      // 4. Download URL
      const downloadUrl = await provider.getDownloadUrl(testKey);
      expect(downloadUrl).toBe(`/api/v1/documents/${testKey}/download`);

      // 5. Delete
      const deleted = await provider.deleteFile(testKey);
      expect(deleted).toBe(true);
      expect(await provider.fileExists(testKey)).toBe(false);
    });

    it('should prevent path traversal attempts', async () => {
      const provider = new LocalStorageProvider(testDir);
      const content = Buffer.from('Malicious content');

      await expect(provider.saveFile('../../etc/passwd', content)).rejects.toThrow(
        /Security violation/
      );
      await expect(provider.getFileStream('../outside.txt')).rejects.toThrow(
        /Security violation/
      );
      await expect(provider.deleteFile('/absolute/path/file.txt')).rejects.toThrow(
        /Security violation/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2. S3StorageProvider Tests (Using Mocked S3Client & offline SigV4)
  // ---------------------------------------------------------------------------
  describe('S3StorageProvider', () => {
    it('should upload to S3 via PutObjectCommand', async () => {
      const mockSend = vi.fn().mockResolvedValue({});
      const mockClient = { send: mockSend } as unknown as S3Client;

      const provider = new S3StorageProvider('test-bucket', 'us-east-1', mockClient);
      expect(provider.name).toBe('s3');

      const content = Buffer.from('S3 Deal Room Document Buffer');
      const result = await provider.saveFile('test_deal_room/doc1.pdf', content, 'application/pdf');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input.Bucket).toBe('test-bucket');
      expect(command.input.Key).toBe('test_deal_room/doc1.pdf');
      expect(command.input.ContentType).toBe('application/pdf');
      expect(command.input.ServerSideEncryption).toBe('AES256');

      expect(result.key).toBe('test_deal_room/doc1.pdf');
      expect(result.size).toBe(content.length);
      expect(result.url).toBe('/api/v1/documents/doc1.pdf/download');
    });

    it('should stream file from S3 via GetObjectCommand', async () => {
      const mockContent = 'Streamed S3 payload data';
      const readable = Readable.from([Buffer.from(mockContent)]);

      const mockSend = vi.fn().mockResolvedValue({
        Body: readable,
        ContentLength: Buffer.byteLength(mockContent),
        ContentType: 'application/pdf',
      });
      const mockClient = { send: mockSend } as unknown as S3Client;

      const provider = new S3StorageProvider('test-bucket', 'ap-south-1', mockClient);
      const fileData = await provider.getFileStream('documents/contract.pdf');

      expect(fileData.size).toBe(Buffer.byteLength(mockContent));
      expect(fileData.mimeType).toBe('application/pdf');

      const chunks: Buffer[] = [];
      for await (const chunk of fileData.stream) {
        chunks.push(Buffer.from(chunk));
      }
      expect(Buffer.concat(chunks).toString()).toBe(mockContent);
    });

    it('should verify fileExists via HeadObjectCommand', async () => {
      const mockSend = vi.fn().mockImplementation((command) => {
        if (command.input.Key === 'existing.pdf') {
          return Promise.resolve({ ContentLength: 1024 });
        }
        const error: any = new Error('Not Found');
        error.name = 'NotFound';
        error.$metadata = { httpStatusCode: 404 };
        return Promise.reject(error);
      });
      const mockClient = { send: mockSend } as unknown as S3Client;

      const provider = new S3StorageProvider('test-bucket', 'ap-south-1', mockClient);

      expect(await provider.fileExists('existing.pdf')).toBe(true);
      expect(await provider.fileExists('missing.pdf')).toBe(false);
    });

    it('should delete file via DeleteObjectCommand', async () => {
      const mockSend = vi.fn().mockResolvedValue({});
      const mockClient = { send: mockSend } as unknown as S3Client;

      const provider = new S3StorageProvider('test-bucket', 'ap-south-1', mockClient);
      const deleted = await provider.deleteFile('documents/to_delete.pdf');

      expect(deleted).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input.Bucket).toBe('test-bucket');
      expect(command.input.Key).toBe('documents/to_delete.pdf');
    });

    it('should return false if DeleteObjectCommand fails', async () => {
      const mockSend = vi.fn().mockRejectedValue(new Error('S3 Access Denied / 500 error'));
      const mockClient = { send: mockSend } as unknown as S3Client;

      const provider = new S3StorageProvider('test-bucket', 'ap-south-1', mockClient);
      const deleted = await provider.deleteFile('documents/missing.pdf');

      expect(deleted).toBe(false);
    });

    it('should generate an AWS Signature Version 4 presigned download URL', async () => {
      const realClient = new S3Client({
        region: 'ap-south-1',
        credentials: {
          accessKeyId: 'testAccessKey',
          secretAccessKey: 'testSecretKey',
        },
      });

      const provider = new S3StorageProvider('franchisebridge-vault', 'ap-south-1', realClient);

      const presignedUrl = await provider.getDownloadUrl('confidential_deals/fdd.pdf', 900);
      expect(presignedUrl).toBeDefined();
      expect(typeof presignedUrl).toBe('string');
      expect(presignedUrl).toContain('https://franchisebridge-vault.s3.ap-south-1.amazonaws.com/confidential_deals/fdd.pdf');
      expect(presignedUrl).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
      expect(presignedUrl).toContain('X-Amz-Expires=900');
      expect(presignedUrl).toContain('X-Amz-Signature=');
    });

    it('should prevent path traversal in S3 keys', async () => {
      const mockClient = { send: vi.fn() } as unknown as S3Client;
      const provider = new S3StorageProvider('test-bucket', 'ap-south-1', mockClient);

      await expect(provider.saveFile('../../malicious_s3_key.pdf', Buffer.from('data'))).rejects.toThrow(
        /Security violation/
      );
      await expect(provider.getFileStream('../forbidden.pdf')).rejects.toThrow(
        /Security violation/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Factory getStorageService Tests
  // ---------------------------------------------------------------------------
  describe('getStorageService Factory', () => {
    it('should return LocalStorageProvider by default when STORAGE_DRIVER is local', () => {
      const instance = getStorageService();
      expect(instance).toBeDefined();
      expect(instance.name).toBe('local');
    });

    it('should allow overriding or injecting mock storage instance', () => {
      const customProvider: any = { name: 'custom', saveFile: vi.fn() };
      setStorageService(customProvider);
      expect(getStorageService().name).toBe('custom');
    });

    it('should throw an error in production if STORAGE_DRIVER is local or bucket is unset', () => {
      setStorageService(null);
      const originalIsProduction = env.isProduction;
      (env as any).isProduction = true;
      (env as any).STORAGE_DRIVER = 'local';
      try {
        expect(() => getStorageService()).toThrow(/Production storage misconfiguration: AWS S3 is required/i);
      } finally {
        (env as any).isProduction = originalIsProduction;
        setStorageService(null);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Document Controller S3 Upload & Temp-File Cleanup Tests
  // ---------------------------------------------------------------------------
  describe('SOP / Legal S3 Upload & Temp-File Cleanup', () => {
    it('uploadDocumentFile should upload to S3, return storageKey, and clean up temp file in finally block', async () => {
      const tempUploadPath = path.join(testDir, 'temp-sop-upload.pdf');
      fs.writeFileSync(tempUploadPath, 'SOP Temporary File Content');
      expect(fs.existsSync(tempUploadPath)).toBe(true);

      const mockStorage = {
        name: 's3',
        saveFile: vi.fn().mockResolvedValue({
          key: 'sop-uuid-123.pdf',
          size: 26,
          url: '/api/v1/documents/sop-uuid-123.pdf/download',
        }),
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        file: {
          path: tempUploadPath,
          filename: 'temp-sop-upload.pdf',
          originalname: 'Standard_Operating_Procedure.pdf',
          mimetype: 'application/pdf',
          size: 26,
        },
      });
      const res = new MockResponse();

      await uploadDocumentFile(req as any, res as any);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.storageKey).toBe('sop-uuid-123.pdf');
      // For S3 documents, must return authenticated API endpoint, NEVER public /uploads/
      expect(res.body.data.fileUrl).toBe('/api/v1/documents/sop-uuid-123.pdf/download');
      expect(res.body.data.fileUrl).not.toContain('/uploads/');
      // Crucial: Must be cleaned up from filesystem in finally block
      expect(fs.existsSync(tempUploadPath)).toBe(false);
    });

    it('uploadDocumentFile should clean up temp file in finally block even when S3 upload fails', async () => {
      const tempUploadPath = path.join(testDir, 'temp-fail-upload.pdf');
      fs.writeFileSync(tempUploadPath, 'Will Fail S3 Upload');
      expect(fs.existsSync(tempUploadPath)).toBe(true);

      const mockStorage = {
        name: 's3',
        saveFile: vi.fn().mockRejectedValue(new Error('S3 Network Timeout / Access Denied')),
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        file: {
          path: tempUploadPath,
          filename: 'temp-fail-upload.pdf',
          originalname: 'Failed_Upload.pdf',
          mimetype: 'application/pdf',
          size: 20,
        },
      });
      const res = new MockResponse();

      await uploadDocumentFile(req as any, res as any);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain('Failed to upload document');
      // Temp file MUST still be deleted despite the error!
      expect(fs.existsSync(tempUploadPath)).toBe(false);
    });

    it('downloadDocument should stream file from S3 using storageKey', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Operations Manual',
        fileName: 'operations_manual.pdf',
        storageKey: 's3-sop-key-999.pdf',
        status: 'approved',
        business: { user: '507f1f77bcf86cd799439011' },
      };

      vi.spyOn(LegalDocument, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);
      vi.spyOn(SOPDocument, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockDoc),
      } as any);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const s3Stream = Readable.from([Buffer.from('Real S3 Streamed PDF Content')]);
      const mockStorage = {
        name: 's3',
        getFileStream: vi.fn().mockResolvedValue({
          stream: s3Stream,
          size: 29,
          mimeType: 'application/pdf',
        }),
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        query: {},
      });
      const res = new MockResponse();

      await downloadDocument(req as any, res as any);

      expect(mockStorage.getFileStream).toHaveBeenCalledWith('s3-sop-key-999.pdf');
      expect(res.headers['Content-Type']).toBe('application/pdf');
      expect(res.headers['Content-Disposition']).toContain('operations_manual.pdf');

      await new Promise((resolve) => res.on('finish', resolve));
      expect(res.getStreamContent()).toBe('Real S3 Streamed PDF Content');
    });

    it('downloadDocument should resolve document by storageKey when invoked via API download route', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439022',
        title: 'Franchise Disclosure Document Package',
        fileName: 'fdd_package_2026.pdf',
        storageKey: 'sop-uuid-123.pdf',
        status: 'approved',
        business: { user: '507f1f77bcf86cd799439011' },
      };

      vi.spyOn(LegalDocument, 'findOne').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockDoc),
      } as any);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const s3Stream = Readable.from([Buffer.from('Authenticated S3 FDD Stream')]);
      const mockStorage = {
        name: 's3',
        getFileStream: vi.fn().mockResolvedValue({
          stream: s3Stream,
          size: 27,
          mimeType: 'application/pdf',
        }),
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        params: { id: 'sop-uuid-123.pdf' }, // Calling with storageKey from returned fileUrl
        query: {},
      });
      const res = new MockResponse();

      await downloadDocument(req as any, res as any);

      expect(mockStorage.getFileStream).toHaveBeenCalledWith('sop-uuid-123.pdf');
      await new Promise((resolve) => res.on('finish', resolve));
      expect(res.getStreamContent()).toBe('Authenticated S3 FDD Stream');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Document Deletion Safety on S3 Failure
  // ---------------------------------------------------------------------------
  describe('Document Deletion Safety on S3 Failure', () => {
    it('deleteDealDocument should return 502 and preserve document in DB when S3 delete fails', async () => {
      const mockDoc = {
        _id: 'doc-123',
        dealRoom: 'room-123',
        storageKey: 'deals/contract.pdf',
        filePath: 'uploads/deals/contract.pdf',
        uploadedBy: '507f1f77bcf86cd799439011',
      };
      const mockRoom = {
        _id: 'room-123',
        documents: [mockDoc],
        save: vi.fn(),
      };

      vi.spyOn(DealRoom, 'findById').mockResolvedValue(mockRoom as any);
      vi.spyOn(DealDocument, 'findOne').mockResolvedValue(mockDoc as any);

      const mockStorage = {
        name: 's3',
        deleteFile: vi.fn().mockResolvedValue(false), // S3 deletion fails!
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        params: { id: 'room-123', docId: 'doc-123' },
      });
      const res = new MockResponse();

      await deleteDealDocument(req as any, res as any);

      expect(res.statusCode).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Failed to delete file from object storage. Document record was preserved.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Presigned URL Disabling & Confidentiality Enforcement
  // ---------------------------------------------------------------------------
  describe('Presigned URLs Security Policy', () => {
    it('ALLOW_PRESIGNED_URLS should default to false in configuration', () => {
      // Must be false by default to ensure secure backend proxy streaming
      expect(env.ALLOW_PRESIGNED_URLS).toBe(false);
    });

    it('downloadDocument should return 403 by default when format=presigned is requested', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439033',
        title: 'Franchise Disclosure Document',
        storageKey: 'legal_fdd_123.pdf',
        status: 'approved',
        business: { user: '507f1f77bcf86cd799439011' },
      };
      vi.spyOn(LegalDocument, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockDoc),
      } as any);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const req = createMockRequest({
        params: { id: '507f1f77bcf86cd799439033' },
        query: { format: 'presigned' },
      });
      const res = new MockResponse();

      await downloadDocument(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Presigned download URLs are disabled by security policy');
    });

    it('downloadDealDocument should return 403 by default when format=presigned is requested', async () => {
      const mockDoc = {
        _id: 'doc-999',
        title: 'Financial Statements',
        storageKey: 'financials.pdf',
        allowedRoles: ['admin'],
        accessHistory: [],
        save: vi.fn(),
      };
      const mockRoom = {
        _id: 'room-999',
        assignedBroker: null,
      };
      vi.spyOn(DealRoom, 'findById').mockResolvedValue(mockRoom as any);
      vi.spyOn(DealDocument, 'findOne').mockResolvedValue(mockDoc as any);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const req = createMockRequest({
        params: { id: 'room-999', docId: 'doc-999' },
        query: { format: 'presigned' },
      });
      const res = new MockResponse();

      await downloadDealDocument(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Presigned download URLs are disabled by security policy');
    });

    it('downloadDealDocument should allow presigned URL only when ALLOW_PRESIGNED_URLS is explicitly true', async () => {
      const originalAllow = env.ALLOW_PRESIGNED_URLS;
      (env as any).ALLOW_PRESIGNED_URLS = true;

      try {
        const mockDoc = {
          _id: 'doc-regular',
          title: 'Store Layout Diagram',
          storageKey: 'layout.pdf',
          fileName: 'layout.pdf',
          isInternalOnly: false,
          allowedRoles: ['admin'],
          accessHistory: [],
          save: vi.fn(),
        };
        const mockRoom = {
          _id: 'room-reg',
          assignedBroker: null,
        };
        vi.spyOn(DealRoom, 'findById').mockResolvedValue(mockRoom as any);
        vi.spyOn(DealDocument, 'findOne').mockResolvedValue(mockDoc as any);
        vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

        const mockStorage = {
          name: 's3',
          getDownloadUrl: vi.fn().mockResolvedValue('https://s3.amazonaws.com/presigned-url-mock'),
        };
        setStorageService(mockStorage as any);

        const req = createMockRequest({
          params: { id: 'room-reg', docId: 'doc-regular' },
          query: { format: 'presigned' },
        });
        const res = new MockResponse();

        await downloadDealDocument(req as any, res as any);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.downloadUrl).toBe('https://s3.amazonaws.com/presigned-url-mock');
      } finally {
        (env as any).ALLOW_PRESIGNED_URLS = originalAllow;
      }
    });

    it('downloadDealDocument should return 403 for internalOnly documents requesting presigned URLs even if ALLOW_PRESIGNED_URLS is true', async () => {
      const originalAllow = env.ALLOW_PRESIGNED_URLS;
      (env as any).ALLOW_PRESIGNED_URLS = true;

      try {
        const mockDoc = {
          _id: 'doc-internal',
          title: 'Internal Audit Notes',
          storageKey: 'internal_audit.pdf',
          isInternalOnly: true,
          allowedRoles: ['admin'],
          accessHistory: [],
          save: vi.fn(),
        };
        const mockRoom = {
          _id: 'room-int',
          assignedBroker: null,
        };
        vi.spyOn(DealRoom, 'findById').mockResolvedValue(mockRoom as any);
        vi.spyOn(DealDocument, 'findOne').mockResolvedValue(mockDoc as any);
        vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

        const req = createMockRequest({
          params: { id: 'room-int', docId: 'doc-internal' },
          query: { format: 'presigned' },
        });
        const res = new MockResponse();

        await downloadDealDocument(req as any, res as any);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('Presigned URLs are prohibited for internal confidential documents');
      } finally {
        (env as any).ALLOW_PRESIGNED_URLS = originalAllow;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Local Storage Regression Suite
  // ---------------------------------------------------------------------------
  describe('Local Storage Regression Suite', () => {
    it('uploadDocumentFile should preserve local file on disk when storage driver is local', async () => {
      const tempUploadPath = path.join(testDir, 'local-upload-kept.pdf');
      fs.writeFileSync(tempUploadPath, 'Local File Kept On Disk');
      expect(fs.existsSync(tempUploadPath)).toBe(true);

      const mockStorage = {
        name: 'local',
      };
      setStorageService(mockStorage as any);

      const req = createMockRequest({
        file: {
          path: tempUploadPath,
          filename: 'local-upload-kept.pdf',
          originalname: 'Local_Doc.pdf',
          mimetype: 'application/pdf',
          size: 24,
        },
      });
      const res = new MockResponse();

      await uploadDocumentFile(req as any, res as any);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.storageKey).toBe('local-upload-kept.pdf');
      expect(res.body.data.fileUrl).toBe('/uploads/local-upload-kept.pdf');
      // Crucial for local storage: local file is preserved on disk
      expect(fs.existsSync(tempUploadPath)).toBe(true);
    });

    it('downloadDocument should use res.download for local storage files', async () => {
      const localFilePath = path.join(process.cwd(), 'uploads', 'local-test-doc.pdf');
      const uploadsDir = path.dirname(localFilePath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(localFilePath, 'Local physical file content');

      try {
        const mockDoc = {
          _id: '507f1f77bcf86cd799439055',
          title: 'Local SOP Manual',
          storageKey: 'local-test-doc.pdf',
          status: 'approved',
          business: { user: '507f1f77bcf86cd799439011' },
        };
        vi.spyOn(LegalDocument, 'findById').mockReturnValue({
          populate: vi.fn().mockResolvedValue(null),
        } as any);
        vi.spyOn(SOPDocument, 'findById').mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockDoc),
        } as any);
        vi.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

        const mockStorage = {
          name: 'local',
        };
        setStorageService(mockStorage as any);

        const req = createMockRequest({
          params: { id: '507f1f77bcf86cd799439055' },
          query: {},
        });
        const res = new MockResponse();

        await downloadDocument(req as any, res as any);

        expect(res.downloadedFile).toBeDefined();
        expect(res.downloadedFile?.fileName).toBe('Local SOP Manual');
      } finally {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      }
    });
  });
});
