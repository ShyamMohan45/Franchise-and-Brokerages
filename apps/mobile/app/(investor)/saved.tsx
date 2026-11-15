import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../src/theme';
import { Header, FranchiseCard, EmptyState, RoleGuard } from '../../src/components';
import { useSavedFranchises } from '../../src/hooks/useSavedFranchises';

export default function SavedFranchisesScreen() {
  const router = useRouter();
  const { savedItems, isLoading, isRefreshing, error, toggleSave, refresh } =
    useSavedFranchises();

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Saved Opportunities"
          subtitle="Your Shortlisted Portfolios"
          showBack
          onBack={() => router.back()}
        />

        {isLoading && !isRefreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading saved opportunities...</Text>
          </View>
        ) : (
          <FlatList
            data={savedItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const franchise = item.franchise;
              if (!franchise) return null;
              return (
                <FranchiseCard
                  listing={franchise}
                  onPress={() => router.push(`/(investor)/franchise/${franchise._id}`)}
                  isSaved={true}
                  onToggleSave={() => toggleSave(franchise._id)}
                />
              );
            }}
            ListEmptyComponent={
              <EmptyState
                title="No Saved Opportunities"
                description={
                  error ||
                  'You have not shortlisted any franchise opportunities yet. Browse the marketplace and tap the heart icon to save listings.'
                }
                actionLabel="Explore Marketplace"
                onAction={() => router.push('/(investor)/marketplace')}
                icon="heart"
              />
            }
            contentContainerStyle={styles.listContent}
            refreshing={isRefreshing}
            onRefresh={refresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.slate[500],
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
});
