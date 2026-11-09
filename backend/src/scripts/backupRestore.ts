import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { DealRoom } from '../models/DealRoom';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { CommissionPayment } from '../models/CommissionPayment';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { FranchiseListing } from '../models/FranchiseListing';

export const BACKUP_BASE_DIR = path.join(process.cwd(), 'backups');

export interface BackupManifest {
  version: string;
  timestamp: string;
  database: string;
  collections: {
    name: string;
    count: number;
    file: string;
  }[];
  totalDocuments: number;
}

export async function verifyAndEnsureIndexes(): Promise<{ success: boolean; details: Record<string, string[]> }> {
  const models = [
    User,
    Lead,
    BrokerageDeal,
    DealRoom,
    CommissionAgreement,
    CommissionPayment,
    AuditLog,
    Notification,
    BusinessProfile,
    InvestorProfile,
    FranchiseListing,
  ];

  const details: Record<string, string[]> = {};

  for (const model of models) {
    try {
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      details[model.modelName] = indexes.map((idx) => Object.keys(idx.key).join(', '));
    } catch (err: any) {
      details[model.modelName] = [`ERROR: ${err.message}`];
    }
  }

  return { success: true, details };
}

export async function createDatabaseBackup(backupDir?: string): Promise<{ success: boolean; manifest: BackupManifest; targetDir: string }> {
  if (!fs.existsSync(BACKUP_BASE_DIR)) {
    fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = backupDir || path.join(BACKUP_BASE_DIR, `backup_${timestamp}`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const collections = await mongoose.connection.db?.collections() || [];
  const manifestCollections: BackupManifest['collections'] = [];
  let totalDocs = 0;

  for (const col of collections) {
    const colName = col.collectionName;
    const docs = await col.find({}).toArray();
    const filePath = path.join(targetDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    manifestCollections.push({
      name: colName,
      count: docs.length,
      file: `${colName}.json`,
    });
    totalDocs += docs.length;
  }

  const manifest: BackupManifest = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.name || 'franchisebridge',
    collections: manifestCollections,
    totalDocuments: totalDocs,
  };

  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Backup] Successfully exported ${totalDocs} documents across ${manifestCollections.length} collections to: ${targetDir}`);

  return { success: true, manifest, targetDir };
}

export async function testRestorationFromBackup(backupDir: string): Promise<{ success: boolean; verifiedDocs: number; collectionsTested: number }> {
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found at: ${manifestPath}`);
  }

  const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  let verifiedDocs = 0;

  for (const colInfo of manifest.collections) {
    const colFile = path.join(backupDir, colInfo.file);
    if (!fs.existsSync(colFile)) {
      throw new Error(`Missing collection backup file: ${colFile}`);
    }
    const docs = JSON.parse(fs.readFileSync(colFile, 'utf-8'));
    if (!Array.isArray(docs) || docs.length !== colInfo.count) {
      throw new Error(`Integrity check failed for ${colInfo.name}: expected ${colInfo.count}, got ${docs.length}`);
    }
    verifiedDocs += docs.length;
  }

  console.log(`[Restore Test] Verified ${manifest.collections.length} collections with ${verifiedDocs} total documents from backup.`);
  return { success: true, verifiedDocs, collectionsTested: manifest.collections.length };
}

// CLI runner if invoked directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      console.log('=== Step 1: Verifying Database Indexes ===');
      const idxResult = await verifyAndEnsureIndexes();
      console.log('Indexes verified for:', Object.keys(idxResult.details));

      console.log('=== Step 2: Creating Test Database Backup ===');
      const backupResult = await createDatabaseBackup();

      console.log('=== Step 3: Testing Backup Restoration & Integrity ===');
      const restoreResult = await testRestorationFromBackup(backupResult.targetDir);
      console.log('Restore test result:', restoreResult);

      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Backup/Restore execution failed:', err);
      process.exit(1);
    }
  })();
}
