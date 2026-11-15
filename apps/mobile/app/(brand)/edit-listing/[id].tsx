import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Input, Button, RoleGuard } from '../../../src/components';
import { FranchiseService } from '../../../src/services/franchiseService';
import { FranchiseListing } from '../../../src/types/franchise';

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brandName, setBrandName] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('');
  const [summary, setSummary] = useState('');
  const [brandStory, setBrandStory] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [maxInvestment, setMaxInvestment] = useState('');
  const [franchiseFee, setFranchiseFee] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('5');
  const [minSpace, setMinSpace] = useState('500');
  const [maxSpace, setMaxSpace] = useState('1500');
  const [idealProfile, setIdealProfile] = useState('');
  const [locations, setLocations] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await FranchiseService.getFranchiseBySlugOrId(id);
        const l: FranchiseListing = data.listing;
        if (isMounted) {
          setBrandName(l.brandName || '');
          setOpportunityTitle(l.opportunityTitle || '');
          setTagline(l.tagline || '');
          setIndustry(l.industry || '');
          setSummary(l.summary || '');
          setBrandStory(l.brandStory || '');
          setMinInvestment(String(l.totalInvestmentMin || ''));
          setMaxInvestment(String(l.totalInvestmentMax || ''));
          setFranchiseFee(String(l.initialFranchiseFee || ''));
          setRoyaltyPercentage(String(l.royaltyPercentage ?? 5));
          setMinSpace(String(l.commercialSpaceMinSqFt || 500));
          setMaxSpace(String(l.commercialSpaceMaxSqFt || 1500));
          setIdealProfile(l.idealFranchiseeProfile || '');
          setLocations((l.expansionLocations || []).join(', '));
        }
      } catch (err: any) {
        Alert.alert('Load Error', err.message || 'Could not load listing details');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await FranchiseService.updateFranchise(id, {
        brandName: brandName.trim(),
        opportunityTitle: opportunityTitle.trim(),
        tagline: tagline.trim(),
        industry: industry.trim(),
        summary: summary.trim(),
        brandStory: brandStory.trim(),
        totalInvestmentMin: parseFloat(minInvestment),
        totalInvestmentMax: parseFloat(maxInvestment),
        initialFranchiseFee: parseFloat(franchiseFee),
        royaltyPercentage: parseFloat(royaltyPercentage),
        commercialSpaceMinSqFt: parseInt(minSpace) || 500,
        commercialSpaceMaxSqFt: parseInt(maxSpace) || 1500,
        idealFranchiseeProfile: idealProfile.trim(),
        expansionLocations: locations
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
      });

      Alert.alert('Saved', 'Listing updated successfully.', [
        { text: 'Done', onPress: () => router.replace('/(brand)/listings') },
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Edit Listing" showBack onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading listing data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Edit Franchise Listing"
          subtitle={brandName}
          showBack
          onBack={() => router.back()}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Brand Identity</Text>

              <Input
                label="Registered Brand Name"
                value={brandName}
                onChangeText={setBrandName}
              />

              <Input
                label="Opportunity Title"
                value={opportunityTitle}
                onChangeText={setOpportunityTitle}
              />

              <Input label="Tagline" value={tagline} onChangeText={setTagline} />

              <Input label="Industry" value={industry} onChangeText={setIndustry} />

              <Input
                label="Summary"
                value={summary}
                onChangeText={setSummary}
                multiline
                numberOfLines={2}
              />

              <Input
                label="Brand Story"
                value={brandStory}
                onChangeText={setBrandStory}
                multiline
                numberOfLines={3}
              />
            </Card>

            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Financial Requirements</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Investment (₹)"
                    value={minInvestment}
                    onChangeText={setMinInvestment}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Max Investment (₹)"
                    value={maxInvestment}
                    onChangeText={setMaxInvestment}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Franchise Fee (₹)"
                    value={franchiseFee}
                    onChangeText={setFranchiseFee}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Royalty %"
                    value={royaltyPercentage}
                    onChangeText={setRoyaltyPercentage}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Card>

            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Operating Requirements</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Space (Sq Ft)"
                    value={minSpace}
                    onChangeText={setMinSpace}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Max Space (Sq Ft)"
                    value={maxSpace}
                    onChangeText={setMaxSpace}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Ideal Franchisee Profile"
                value={idealProfile}
                onChangeText={setIdealProfile}
                multiline
                numberOfLines={2}
              />

              <Input
                label="Expansion Locations"
                value={locations}
                onChangeText={setLocations}
              />
            </Card>

            <Button
              title="Save Changes"
              onPress={handleUpdate}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  loadingText: {
    ...typography.body,
    color: colors.slate[500],
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy[900],
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
});
