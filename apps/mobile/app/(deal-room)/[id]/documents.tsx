import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import {
  Header,
  Input,
  EmptyState,
  RoleGuard,
  DocumentCard,
  UploadDocumentModal,
} from '../../../src/components';
import { useDocuments } from '../../../src/hooks/useDocuments';
import { useAuth } from '../../../src/hooks/useAuth';
import { DealDocument } from '../../../src/types/dealRoom';

const CATEGORY_TABS = [
  { label: 'All Files', value: 'ALL' },
  { label: 'FDD & Disclosures', value: 'FRANCHISE_DISCLOSURE' },
  { label: 'Financial Audits', value: 'FINANCIAL' },
  { label: 'Agreement Drafts', value: 'AGREEMENT_DRAFT' },
  { label: 'Brand Profiles', value: 'BRAND_PROFILE' },
  { label: 'Identity & Legal', value: 'IDENTITY_BUSINESS' },
  { label: 'Property & Location', value: 'PROPERTY_LOCATION' },
  { label: 'Diligence Evidence', value: 'DUE_DILIGENCE_EVIDENCE' },
];

export default function DealRoomDocumentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    documents,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    downloadingDocId,
    refresh,
    uploadDocument,
    downloadDocument,
    updateStatus,
    deleteDocument,
  } = useDocuments(id || '');

  const isBrokerOrAdmin =
    user?.role === 'broker' || user?.role === 'admin' || user?.role === 'super_admin';

  const handleDownload = async (doc: DealDocument) => {
    try {
      await downloadDocument(doc._id, doc.fileName);
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Could not download file');
    }
  };

  const handleDelete = (doc: DealDocument) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc._id);
              Alert.alert('Success', 'Document removed successfully');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleReviewStatus = (doc: DealDocument) => {
    Alert.alert('Review Document', `Set review status for "${doc.title}":`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await updateStatus(doc._id, 'APPROVED');
            Alert.alert('Status Updated', 'Document marked as APPROVED');
          } catch (err: any) {
            Alert.alert('Error', err?.message);
          }
        },
      },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateStatus(doc._id, 'REJECTED');
            Alert.alert('Status Updated', 'Document marked as REJECTED');
          } catch (err: any) {
            Alert.alert('Error', err?.message);
          }
        },
      },
      {
        text: 'Under Review',
        onPress: async () => {
          try {
            await updateStatus(doc._id, 'UNDER_REVIEW');
          } catch (err: any) {
            Alert.alert('Error', err?.message);
          }
        },
      },
    ]);
  };

  return (
    <RoleGuard
      allowedRoles={[
        'investor',
        'business_owner',
        'brand_owner',
        'broker',
        'admin',
        'super_admin',
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Document Vault"
          subtitle="Encrypted Private File Repository"
          showBack
          onBack={() => router.back()}
          rightAction={
            <Pressable
              style={styles.uploadBtn}
              onPress={() => setIsUploadModalOpen(true)}
              hitSlop={8}
            >
              <Ionicons name="cloud-upload-outline" size={22} color={colors.accent.teal} />
            </Pressable>
          }
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search documents by title or file name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  style={[styles.tabChip, isSelected && styles.tabChipActive]}
                  onPress={() => setSelectedCategory(tab.value)}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      isSelected && styles.tabChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Documents List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.teal} />
            <Text style={styles.loadingText}>Loading private documents...</Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DocumentCard
                document={item}
                onDownload={() => handleDownload(item)}
                isDownloading={downloadingDocId === item._id}
                canReview={isBrokerOrAdmin}
                onUpdateStatus={() => handleReviewStatus(item)}
                canDelete={isBrokerOrAdmin || item.uploadedBy?._id === (user?.id || user?._id)}
                onDelete={() => handleDelete(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.accent.teal}
                colors={[colors.accent.teal]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="document-text-outline"
                title="No Documents Found"
                description={
                  searchQuery
                    ? `No files matched "${searchQuery}".`
                    : 'There are no uploaded documents in this category. Tap the upload button to add private files.'
                }
                actionLabel="Upload Document"
                onAction={() => setIsUploadModalOpen(true)}
              />
            }
          />
        )}

        {/* Upload Document Modal */}
        <UploadDocumentModal
          visible={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={uploadDocument}
          isInternalPrivileged={isBrokerOrAdmin}
        />
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  uploadBtn: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  tabsWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  tabChipText: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});
