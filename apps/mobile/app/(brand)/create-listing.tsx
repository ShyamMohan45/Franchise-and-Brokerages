import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Header, Card, Input, Button, RoleGuard } from '../../src/components';
import { FranchiseService } from '../../src/services/franchiseService';
import { CreateFranchisePayload } from '../../src/types/franchise';

export default function CreateListingScreen() {
  const router = useRouter();

  const [brandName, setBrandName] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('Food & Beverage');
  const [summary, setSummary] = useState('');
  const [brandStory, setBrandStory] = useState('');
  const [minInvestment, setMinInvestment] = useState('2500000');
  const [maxInvestment, setMaxInvestment] = useState('5000000');
  const [franchiseFee, setFranchiseFee] = useState('600000');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('6');
  const [minSpace, setMinSpace] = useState('500');
  const [maxSpace, setMaxSpace] = useState('1200');
  const [minStaff, setMinStaff] = useState('2');
  const [maxStaff, setMaxStaff] = useState('8');
  const [trainingWeeks, setTrainingWeeks] = useState('2');
  const [idealProfile, setIdealProfile] = useState(
    'Passionate retail entrepreneur with active management capacity and liquid capital readiness'
  );
  const [locations, setLocations] = useState('Mumbai, Bengaluru, Delhi NCR, Hyderabad');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!brandName.trim() || brandName.trim().length < 2) {
      errs.brandName = 'Brand Name must be at least 2 characters';
    }
    if (!summary.trim() || summary.trim().length < 10) {
      errs.summary = 'Summary must be at least 10 characters (backend requirement)';
    }
    if (!brandStory.trim() || brandStory.trim().length < 10) {
      errs.brandStory = 'Brand Story must be at least 10 characters';
    }
    if (!minInvestment || isNaN(parseFloat(minInvestment))) {
      errs.minInvestment = 'Valid minimum investment is required';
    }
    if (!maxInvestment || isNaN(parseFloat(maxInvestment))) {
      errs.maxInvestment = 'Valid maximum investment is required';
    }
    if (!franchiseFee || isNaN(parseFloat(franchiseFee))) {
      errs.franchiseFee = 'Valid franchise fee is required';
    }
    if (!idealProfile.trim() || idealProfile.trim().length < 10) {
      errs.idealProfile = 'Ideal profile must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateFranchisePayload = {
        brandName: brandName.trim(),
        opportunityTitle: opportunityTitle.trim() || `${brandName.trim()} Franchise Opportunity`,
        tagline: tagline.trim() || 'Premier Franchise Opportunity',
        industry: industry.trim(),
        summary: summary.trim(),
        brandStory: brandStory.trim(),
        businessModel: 'FOFO',
        franchiseModelType: 'both',
        totalInvestmentMin: parseFloat(minInvestment),
        totalInvestmentMax: parseFloat(maxInvestment),
        initialFranchiseFee: parseFloat(franchiseFee),
        royaltyPercentage: parseFloat(royaltyPercentage) || 5,
        commercialSpaceMinSqFt: parseInt(minSpace) || 500,
        commercialSpaceMaxSqFt: parseInt(maxSpace) || 1500,
        staffRequiredMin: parseInt(minStaff) || 2,
        staffRequiredMax: parseInt(maxStaff) || 6,
        trainingDurationWeeks: parseInt(trainingWeeks) || 2,
        idealFranchiseeProfile: idealProfile.trim(),
        expansionLocations: locations
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        status: 'DRAFT',
      };

      await FranchiseService.createFranchise(payload);
      Alert.alert(
        'Listing Created',
        'Your franchise opportunity draft has been created successfully. You can review and submit it for platform review.',
        [{ text: 'View Listings', onPress: () => router.replace('/(brand)/listings') }]
      );
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message || 'Could not create franchise listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Create Franchise Listing"
          subtitle="Publish New Opportunity"
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
            {/* Identity Card */}
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Brand Identity & Concept</Text>

              <Input
                label="Registered Brand Name *"
                placeholder="e.g. Chai Craft Roasters"
                value={brandName}
                onChangeText={(val) => {
                  setBrandName(val);
                  if (errors.brandName) setErrors((p) => ({ ...p, brandName: '' }));
                }}
                error={errors.brandName}
              />

              <Input
                label="Opportunity Title (Optional)"
                placeholder="e.g. Master Franchise Partnership - High-Street Cafe"
                value={opportunityTitle}
                onChangeText={setOpportunityTitle}
              />

              <Input
                label="Tagline / Motto"
                placeholder="e.g. Authentic Artisan Beverages Reimagined"
                value={tagline}
                onChangeText={setTagline}
              />

              <Input
                label="Industry Category *"
                placeholder="e.g. Food & Beverage, Retail, Healthcare"
                value={industry}
                onChangeText={setIndustry}
              />

              <Input
                label="Short Summary * (Min 10 chars)"
                placeholder="Executive summary of the business concept"
                value={summary}
                onChangeText={(val) => {
                  setSummary(val);
                  if (errors.summary) setErrors((p) => ({ ...p, summary: '' }));
                }}
                multiline
                numberOfLines={2}
                error={errors.summary}
              />

              <Input
                label="Brand Story * (Min 10 chars)"
                placeholder="Founding background, growth story, outlet milestones"
                value={brandStory}
                onChangeText={(val) => {
                  setBrandStory(val);
                  if (errors.brandStory) setErrors((p) => ({ ...p, brandStory: '' }));
                }}
                multiline
                numberOfLines={3}
                error={errors.brandStory}
              />
            </Card>

            {/* Financials Card */}
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Financial Tiers</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Investment (₹) *"
                    placeholder="2500000"
                    value={minInvestment}
                    onChangeText={(val) => {
                      setMinInvestment(val);
                      if (errors.minInvestment) setErrors((p) => ({ ...p, minInvestment: '' }));
                    }}
                    keyboardType="numeric"
                    error={errors.minInvestment}
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Max Investment (₹) *"
                    placeholder="5000000"
                    value={maxInvestment}
                    onChangeText={(val) => {
                      setMaxInvestment(val);
                      if (errors.maxInvestment) setErrors((p) => ({ ...p, maxInvestment: '' }));
                    }}
                    keyboardType="numeric"
                    error={errors.maxInvestment}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Initial Franchise Fee (₹) *"
                    placeholder="600000"
                    value={franchiseFee}
                    onChangeText={(val) => {
                      setFranchiseFee(val);
                      if (errors.franchiseFee) setErrors((p) => ({ ...p, franchiseFee: '' }));
                    }}
                    keyboardType="numeric"
                    error={errors.franchiseFee}
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Royalty Percentage (%)"
                    placeholder="6"
                    value={royaltyPercentage}
                    onChangeText={setRoyaltyPercentage}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Card>

            {/* Space & Operations Card */}
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Space & Operating Requirements</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Space (Sq Ft)"
                    placeholder="500"
                    value={minSpace}
                    onChangeText={setMinSpace}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Max Space (Sq Ft)"
                    placeholder="1200"
                    value={maxSpace}
                    onChangeText={setMaxSpace}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Staff"
                    placeholder="2"
                    value={minStaff}
                    onChangeText={setMinStaff}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Training Weeks"
                    placeholder="2"
                    value={trainingWeeks}
                    onChangeText={setTrainingWeeks}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Ideal Franchisee Profile * (Min 10 chars)"
                placeholder="Operational background, leadership qualifications, net worth"
                value={idealProfile}
                onChangeText={(val) => {
                  setIdealProfile(val);
                  if (errors.idealProfile) setErrors((p) => ({ ...p, idealProfile: '' }));
                }}
                multiline
                numberOfLines={2}
                error={errors.idealProfile}
              />

              <Input
                label="Target Expansion Locations (Comma separated)"
                placeholder="Mumbai, Bengaluru, Pune, Delhi NCR"
                value={locations}
                onChangeText={setLocations}
              />
            </Card>

            <Button
              title="Save Opportunity Draft"
              onPress={handleSubmit}
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
