import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { Header, Input, EmptyState, RoleGuard, DealRoomCard } from '../../src/components';
import { useDealRooms } from '../../src/hooks/useDealRooms';
import { DealRoom } from '../../src/types/dealRoom';

export default function DealRoomsListScreen() {
  const router = useRouter();
  const {
    dealRooms,
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    refresh,
  } = useDealRooms();

  const handleRoomPress = (room: DealRoom) => {
    router.push({
      pathname: '/(deal-room)/[id]',
      params: { id: room._id },
    } as any);
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
          title="Deal Rooms"
          subtitle="Confidential Due Diligence Workspaces"
          showBack
          onBack={() => router.back()}
        />

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search workspaces by brand, territory..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Workspaces List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.teal} />
            <Text style={styles.loadingText}>Loading authorized deal rooms...</Text>
          </View>
        ) : (
          <FlatList
            data={dealRooms}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DealRoomCard room={item} onPress={() => handleRoomPress(item)} />
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
                icon="briefcase-outline"
                title="No Deal Rooms Found"
                description={
                  searchQuery
                    ? `No workspaces matched "${searchQuery}".`
                    : 'You do not have any active deal room workspaces. Deal rooms are initialized upon mutual agreement or enquiry review.'
                }
                actionLabel="Refresh"
                onAction={refresh}
              />
            }
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.xs,
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
