import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Globe, Wallet, TrendingUp, Check } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Reveal, PressableScale } from '@/components/motion';
import { CURRENCIES, INDUSTRIES } from '@/data/currencies';

function toNum(s: string) {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export default function CompanyProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { company, saveCompany } = useAuth();

  const [name, setName] = useState(company?.name ?? '');
  const [industry, setIndustry] = useState(company?.industry ?? INDUSTRIES[0]);
  const [country, setCountry] = useState(company?.country ?? '');
  const [currencyCode, setCurrencyCode] = useState(company?.currencyCode ?? 'PKR');
  const [capital, setCapital] = useState(company?.capital ? String(company.capital) : '');
  const [revenue, setRevenue] = useState(company?.revenue ? String(company.revenue) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  const selectedCurrency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const onSave = async () => {
    if (name.trim().length < 2) {
      setError('Enter your company name');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await saveCompany({
        name: name.trim(),
        industry,
        country: country.trim(),
        currencyCode: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
        capital: toNum(capital),
        revenue: toNum(revenue),
      });
      setSaved(true);
      setTimeout(() => router.back(), 450);
    } catch (e: any) {
      setError(e?.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  let idx = 0;

  return (
    <Screen>
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityLabel="Back"
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} color={t.colors.text} strokeWidth={2.2} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="bodySm" tone="muted" weight="medium">
              Settings
            </Text>
            <Text variant="h1" weight="bold" style={{ letterSpacing: -0.5 }}>
              Company
            </Text>
          </View>
        </View>
      </Reveal>

      {/* Profile */}
      <Reveal index={idx++}>
        <Card elevation={1} style={{ gap: 16 }}>
          <Field label="Company name *" icon={Building2} value={name} onChangeText={setName} placeholder="e.g. Northwind Traders" />
          <View style={{ gap: 8 }}>
            <Text variant="bodySm" weight="medium" tone="muted">
              Industry
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {INDUSTRIES.map((ind) => {
                const active = ind === industry;
                return (
                  <PressableScale
                    key={ind}
                    onPress={() => setIndustry(ind)}
                    scaleTo={0.96}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 999,
                      backgroundColor: active ? t.colors.accentSoft : t.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? t.colors.accent : 'transparent',
                    }}
                  >
                    <Text variant="bodySm" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'}>
                      {ind}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <Field label="Country / region" icon={Globe} value={country} onChangeText={setCountry} placeholder="e.g. Pakistan" />
        </Card>
      </Reveal>

      {/* Currency */}
      <Reveal index={idx++}>
        <Card elevation={1} style={{ gap: 12 }}>
          <Text variant="bodySm" weight="semibold">
            Base currency
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CURRENCIES.map((c) => {
              const active = c.code === currencyCode;
              return (
                <PressableScale
                  key={c.code}
                  onPress={() => setCurrencyCode(c.code)}
                  scaleTo={0.96}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                    borderRadius: 999,
                    backgroundColor: active ? t.colors.accentSoft : t.colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: active ? t.colors.accent : 'transparent',
                  }}
                >
                  <Text weight="bold" mono style={{ color: active ? t.colors.accent : t.colors.textMuted }}>
                    {c.symbol}
                  </Text>
                  <Text variant="bodySm" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'} mono>
                    {c.code}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Card>
      </Reveal>

      {/* Financials */}
      <Reveal index={idx++}>
        <Card elevation={1} style={{ gap: 14 }}>
          <Text variant="bodySm" weight="semibold">
            Opening financials
          </Text>
          <Field
            label={`Working capital (${selectedCurrency.symbol})`}
            icon={Wallet}
            value={capital}
            onChangeText={setCapital}
            placeholder="0"
            keyboardType="numeric"
          />
          <Field
            label={`Total revenue (${selectedCurrency.symbol})`}
            icon={TrendingUp}
            value={revenue}
            onChangeText={setRevenue}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text variant="caption" tone="subtle">
            These drive your dashboard — Working Capital, Total Revenue, Net Profit and cash runway.
          </Text>
        </Card>
      </Reveal>

      {error && (
        <Text variant="caption" tone="danger" weight="medium">
          {error}
        </Text>
      )}

      <Reveal index={idx++}>
        <Button
          label={saved ? 'Saved' : 'Save changes'}
          icon={saved ? Check : undefined}
          onPress={onSave}
          loading={saving}
          nativeID="save-company"
        />
      </Reveal>
    </Screen>
  );
}
