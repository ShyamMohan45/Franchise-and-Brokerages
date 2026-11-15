import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { DealDocumentCategory } from '../../types/dealRoom';
import { UploadDocumentParams } from '../../services/dealRoomService';

interface UploadDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (params: UploadDocumentParams) => Promise<any>;
  isInternalPrivileged?: boolean;
}

const CATEGORIES: { label: string; value: DealDocumentCategory }[] = [
  { label: 'Franchise Disclosure (FDD)', value: 'FRANCHISE_DISCLOSURE' },
  { label: 'Financial Audit & P&L', value: 'FINANCIAL' },
  { label: 'Agreement Draft', value: 'AGREEMENT_DRAFT' },
  { label: 'Brand Profile', value: 'BRAND_PROFILE' },
  { label: 'Identity & Business Proof', value: 'IDENTITY_BUSINESS' },
  { label: 'Property & Location', value: 'PROPERTY_LOCATION' },
  { label: 'Due Diligence Evidence', value: 'DUE_DILIGENCE_EVIDENCE' },
  { label: 'Other Supporting', value: 'OTHER_SUPPORTING' },
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  visible,
  onClose,
  onUpload,
  isInternalPrivileged = false,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DealDocumentCategory>('FRANCHISE_DISCLOSURE');
  const [notes, setNotes] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'text/plain',
          'image/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        });
        if (!title.trim()) {
          // Default title to file name without extension
          const cleanTitle = asset.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          setTitle(cleanTitle);
        }
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err?.message || 'Could not select document');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Document title is required');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a document file to upload');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload({
        title: title.trim(),
        category,
        isInternalOnly,
        notes: notes.trim() || undefined,
        file: selectedFile,
      });

      // Reset
      setTitle('');
      setNotes('');
      setIsInternalOnly(false);
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message || 'Unable to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Upload Deal Document</Text>
              <Text style={styles.subtitle}>Secure Private Storage Vault</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text.muted} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* File Selection Box */}
            <Text style={styles.fieldLabel}>Select File *</Text>
            {selectedFile ? (
              <View style={styles.selectedFileBox}>
                <Ionicons name="document-attach" size={24} color={colors.accent.teal} />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                </View>
                <Pressable onPress={() => setSelectedFile(null)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pickFileBox} onPress={handlePickDocument}>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.primary.DEFAULT} />
                <Text style={styles.pickFileText}>Tap to select document from device</Text>
                <Text style={styles.pickFileSubtext}>PDF, Word, Excel, CSV, or Image (max 25MB)</Text>
              </Pressable>
            )}

            {/* Title */}
            <Input
              label="Document Title *"
              placeholder="e.g. Master Franchise Agreement Draft v2"
              value={title}
              onChangeText={setTitle}
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Document Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Internal Only Toggle (brokers & admins) */}
            {isInternalPrivileged && (
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Internal Broker Document</Text>
                  <Text style={styles.switchSubtext}>
                    Hidden from investor and brand owner participants.
                  </Text>
                </View>
                <Switch
                  value={isInternalOnly}
                  onValueChange={setIsInternalOnly}
                  trackColor={{ false: colors.border, true: colors.warning.DEFAULT }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}

            {/* Notes */}
            <Input
              label="Notes & Context (Optional)"
              placeholder="Add review guidelines or clause references..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.actionsRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Upload Securely"
              variant="primary"
              loading={isUploading}
              disabled={!selectedFile || !title.trim()}
              onPress={handleUpload}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  pickFileBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(49, 94, 251, 0.04)',
    marginBottom: spacing.md,
  },
  pickFileText: {
    ...typography.bodyBold,
    color: colors.primary.DEFAULT,
    marginTop: spacing.xs,
  },
  pickFileSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  fileInfo: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  fileName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 13,
  },
  fileSize: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warning.soft,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  switchLabel: {
    ...typography.bodyBold,
    color: colors.warning.text,
    fontSize: 13,
  },
  switchSubtext: {
    ...typography.caption,
    color: colors.warning.text,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
  },
});
