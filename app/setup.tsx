import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Building2, User, Mail, Lock, Briefcase, Globe, Wallet, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Text } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';
import { PressableScale, Reveal } from '@/components/motion';
import { CURRENCIES, INDUSTRIES, PLANS, ANNUAL_DISCOUNT } from '@/data/currencies';
import { COUNTRIES, OWNER_ROLES } from '@/data/countries';
import { PickerSheet, SelectField } from '@/components/PickerSheet';
import { computeBilling } from '@/data/billing';
import { formatUSD } from '@/data/format';
import { useKeyboardHeight } from '@/utils/useKeyboardHeight';
import { validatePassword } from '@/utils/password';
import { PasswordStrength } from '@/components/PasswordStrength';

const STEP_TITLES = [
  { title: 'Company profile', sub: 'Tell us about your business' },
  { title: 'Base currency', sub: 'Every amount in the app uses this' },
  { title: 'Opening financials', sub: 'Your starting capital & revenue' },
  { title: 'Your account', sub: 'You’ll be the owner / super admin' },
  { title: 'Team & seats', sub: 'How many people will use Vantage?' },
];

const LAST_STEP = STEP_TITLES.length - 1;

const TEAM_SIZES = ['Just me', '2-10', '11-50', '50+'];

function previewAmount(symbol: string) {
  const sep = symbol.length <= 1 ? '' : ' ';
  return `${symbol}${sep}1,250,000`;
}

export default function Setup() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const { register } = useAuth();

  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Step 0 - company
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Picking a country silently selects its currency; the founder can still
  // change it on the currency step.
  const onPickCountry = (name: string) => {
    setCountry(name);
    const c = COUNTRIES.find((x) => x.name === name);
    if (c && CURRENCIES.some((cur) => cur.code === c.currency)) setCurrencyCode(c.currency);
  };

  // Step 1 - currency + opening financials
  const [currencyCode, setCurrencyCode] = useState('PKR');
  const [capital, setCapital] = useState('');
  const [revenue, setRevenue] = useState('');
  const toNum = (s: string) => {
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // Step 2 - account
  const [ownerName, setOwnerName] = useState('');
  const [role, setRole] = useState('Founder & CEO');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 3 - team & billing
  const [teamSize, setTeamSize] = useState(TEAM_SIZES[1]);
  const [seats, setSeats] = useState(5);
  const [plan, setPlan] = useState<'free' | 'starter' | 'growth' | 'scale'>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const selectedCurrency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const selectedPlan = PLANS.find((p) => p.key === plan) ?? PLANS[0];
  const bill = computeBilling(plan, seats, billingCycle);

  const goBack = () => {
    setErr(undefined);
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const finish = async () => {
    // Creates the company + owner via the API and signs the owner in (DB-only - no local fallback).
    setSubmitting(true);
    try {
      await register({
        name: companyName.trim(),
        industry,
        country: country.trim(),
        currencyCode: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
        capital: toNum(capital),
        revenue: toNum(revenue),
        teamSize,
        seats: bill.seats,
        plan,
        billingCycle,
        ownerName: ownerName.trim(),
        ownerRole: role.trim() || 'Founder & CEO',
        ownerEmail: email.trim(),
        password,
      });
      // On success the root Gate routes to the dashboard.
    } catch (e: any) {
      setErr(e?.message || 'Could not create your company. Please try again.');
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 0 && companyName.trim().length < 2) return setErr('Enter your company name');
    if (step === 2 && toNum(capital) <= 0)
      return setErr('Enter your working capital - a company can’t run on 0. Even a rough figure works.');
    if (step === 3) {
      if (ownerName.trim().length < 2) return setErr('Enter your name');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setErr('Enter a valid email address');
      const pwErr = validatePassword(password);
      if (pwErr) return setErr(pwErr);
    }
    setErr(undefined);
    if (step < LAST_STEP) setStep((s) => s + 1);
    else void finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Brand header + progress */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: 16, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={goBack}
            hitSlop={10}
            accessibilityLabel="Back"
            style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} color={t.colors.text} strokeWidth={2.2} />
          </Pressable>
          <LogoMark size={36} />
          <View style={{ flex: 1 }} />
          <Text variant="caption" tone="subtle" weight="semibold" mono>
            {step + 1}/{STEP_TITLES.length}
          </Text>
        </View>
        {/* Progress segments */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEP_TITLES.map((_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= step ? t.colors.accent : t.colors.surfaceAlt }}
            />
          ))}
        </View>
      </View>

      {/* Keyboard-height lift works on iOS AND Android edge-to-edge (where
          KeyboardAvoidingView with adjustResize silently does nothing). */}
      <View style={{ flex: 1, paddingBottom: kb }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Reveal index={0} key={`title-${step}`}>
            <View style={{ gap: 4 }}>
              <Text variant="h1" weight="bold" style={{ letterSpacing: -0.5 }}>
                {STEP_TITLES[step].title}
              </Text>
              <Text variant="body" tone="muted">
                {STEP_TITLES[step].sub}
              </Text>
            </View>
          </Reveal>

          {/* STEP 0 - COMPANY */}
          {step === 0 && (
            <Reveal index={1} key="s0">
              <View style={{ gap: 18 }}>
                <Field label="Company name *" icon={Building2} value={companyName} onChangeText={setCompanyName} placeholder="e.g. Northwind Traders" autoFocus />
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
                            backgroundColor: active ? t.colors.accentSoft : t.colors.surface,
                            borderWidth: 1,
                            borderColor: active ? t.colors.accent : t.colors.border,
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
                <SelectField
                  label="Country / region"
                  icon={Globe}
                  value={country}
                  placeholder="Select your country"
                  onPress={() => setCountryOpen(true)}
                  nativeID="pick-country"
                />
              </View>
            </Reveal>
          )}

          {/* STEP 1 - CURRENCY */}
          {step === 1 && (
            <Reveal index={1} key="s1">
              <View style={{ gap: 16 }}>
                <View style={{ alignItems: 'center', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.xl, paddingVertical: 22, gap: 4 }}>
                  <Text variant="caption" tone="subtle" weight="medium">
                    PREVIEW
                  </Text>
                  <Text variant="h1" weight="bold" mono tone="accent">
                    {previewAmount(selectedCurrency.symbol)}
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {CURRENCIES.map((c) => {
                    const active = c.code === currencyCode;
                    return (
                      <PressableScale
                        key={c.code}
                        onPress={() => setCurrencyCode(c.code)}
                        nativeID={`cur-${c.code}`}
                        scaleTo={0.98}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          padding: 14,
                          borderRadius: t.radius.lg,
                          backgroundColor: t.colors.surface,
                          borderWidth: 1.5,
                          borderColor: active ? t.colors.accent : t.colors.border,
                        }}
                      >
                        <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: active ? t.colors.accent : t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                          <Text weight="bold" mono style={{ color: active ? '#FFFFFF' : t.colors.textMuted }}>
                            {c.symbol}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="body" weight="semibold">
                            {c.name}
                          </Text>
                          <Text variant="caption" tone="subtle" mono>
                            {c.code}
                          </Text>
                        </View>
                        {active && <Check size={20} color={t.colors.accent} strokeWidth={2.8} />}
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            </Reveal>
          )}

          {/* STEP 2 - OPENING FINANCIALS */}
          {step === 2 && (
            <Reveal index={1} key="s-fin">
              <View style={{ gap: 16 }}>
                {/* Live preview of the dashboard numbers these fields drive */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.xl, padding: 16, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Wallet size={15} color={t.colors.accent} strokeWidth={2.4} />
                      <Text variant="micro" tone="subtle" weight="semibold" style={{ letterSpacing: 0.3 }}>
                        WORKING CAPITAL
                      </Text>
                    </View>
                    <Text variant="h3" weight="bold" mono tone="accent">
                      {selectedCurrency.symbol}{selectedCurrency.symbol.length <= 1 ? '' : ' '}{toNum(capital).toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.xl, padding: 16, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={15} color={t.colors.success} strokeWidth={2.4} />
                      <Text variant="micro" tone="subtle" weight="semibold" style={{ letterSpacing: 0.3 }}>
                        TOTAL REVENUE
                      </Text>
                    </View>
                    <Text variant="h3" weight="bold" mono style={{ color: t.colors.success }}>
                      {selectedCurrency.symbol}{selectedCurrency.symbol.length <= 1 ? '' : ' '}{toNum(revenue).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Field
                  label={`Working capital (${selectedCurrency.symbol}) *`}
                  icon={Wallet}
                  value={capital}
                  onChangeText={setCapital}
                  placeholder="e.g. 500000"
                  keyboardType="numeric"
                  autoFocus
                />
                <Field
                  label={`Total revenue so far (${selectedCurrency.symbol})`}
                  icon={TrendingUp}
                  value={revenue}
                  onChangeText={setRevenue}
                  placeholder="e.g. 1500000"
                  keyboardType="numeric"
                />
                <Text variant="caption" tone="subtle">
                  These power your CEO dashboard - Working Capital, Total Revenue, Net Profit and cash
                  runway. Working capital is required; you can fine-tune both anytime from Settings → Company.
                </Text>
              </View>
            </Reveal>
          )}

          {/* STEP 3 - ACCOUNT */}
          {step === 3 && (
            <Reveal index={1} key="s-acct">
              <View style={{ gap: 16 }}>
                <Field label="Your full name *" icon={User} value={ownerName} onChangeText={setOwnerName} placeholder="e.g. Alex Mercer" autoFocus />
                <SelectField
                  label="Your role"
                  icon={Briefcase}
                  value={role}
                  placeholder="Select your role"
                  onPress={() => setRoleOpen(true)}
                  nativeID="pick-role"
                />
                <Field
                  label="Work email *"
                  icon={Mail}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <View style={{ gap: 10 }}>
                  <Field label="Password *" icon={Lock} value={password} onChangeText={setPassword} placeholder="Min 8 - letters & numbers" secure autoComplete="password-new" />
                  <PasswordStrength password={password} />
                </View>
              </View>
            </Reveal>
          )}

          {/* STEP 4 - TEAM */}
          {step === 4 && (
            <Reveal index={1} key="s-team">
              <View style={{ gap: 20 }}>
                <View style={{ gap: 8 }}>
                  <Text variant="bodySm" weight="medium" tone="muted">
                    Team size
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {TEAM_SIZES.map((ts) => {
                      const active = ts === teamSize;
                      return (
                        <PressableScale
                          key={ts}
                          onPress={() => setTeamSize(ts)}
                          scaleTo={0.96}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 999,
                            backgroundColor: active ? t.colors.accentSoft : t.colors.surface,
                            borderWidth: 1,
                            borderColor: active ? t.colors.accent : t.colors.border,
                          }}
                        >
                          <Text variant="bodySm" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'}>
                            {ts}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>

                {/* Billing cycle (paid plans only) */}
                {plan !== 'free' && (
                <View style={{ gap: 8 }}>
                  <Text variant="bodySm" weight="medium" tone="muted">
                    Billing cycle
                  </Text>
                  <View style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 4, gap: 4 }}>
                    {(['monthly', 'annual'] as const).map((c) => {
                      const active = billingCycle === c;
                      return (
                        <PressableScale
                          key={c}
                          onPress={() => setBillingCycle(c)}
                          scaleTo={0.98}
                          style={{ flex: 1, paddingVertical: 11, borderRadius: t.radius.sm, alignItems: 'center', backgroundColor: active ? t.colors.surface : 'transparent', ...(active ? t.shadow(1) : {}) }}
                        >
                          <Text variant="bodySm" weight="semibold" tone={active ? 'accent' : 'subtle'}>
                            {c === 'monthly' ? 'Monthly' : `Annual · save ${Math.round(ANNUAL_DISCOUNT * 100)}%`}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>

                )}

                {/* Seats stepper (paid plans only) */}
                {plan !== 'free' && (
                <View style={{ gap: 8 }}>
                  <Text variant="bodySm" weight="medium" tone="muted">
                    Paid seats · min {selectedPlan.minSeats} on {selectedPlan.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.lg, padding: 10 }}>
                    <PressableScale onPress={() => setSeats((s) => Math.max(selectedPlan.minSeats, s - 1))} scaleTo={0.9} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={20} color={t.colors.text} strokeWidth={2.6} />
                    </PressableScale>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="h1" weight="bold" mono>
                        {bill.seats}
                      </Text>
                      <Text variant="micro" tone="subtle">
                        {bill.seats === 1 ? 'seat' : 'seats'}
                      </Text>
                    </View>
                    <PressableScale onPress={() => setSeats(Math.min(500, bill.seats + 1))} scaleTo={0.9} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
                    </PressableScale>
                  </View>
                </View>

                )}

                {/* Plans */}
                <View style={{ gap: 10 }}>
                  <Text variant="bodySm" weight="medium" tone="muted">
                    Plan
                  </Text>
                  {PLANS.map((p) => {
                    const active = p.key === plan;
                    return (
                      <PressableScale
                        key={p.key}
                        onPress={() => {
                          setPlan(p.key);
                          setSeats((s) => Math.max(s, p.minSeats));
                        }}
                        scaleTo={0.98}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          padding: 16,
                          borderRadius: t.radius.lg,
                          backgroundColor: t.colors.surface,
                          borderWidth: 1.5,
                          borderColor: active ? t.colors.accent : t.colors.border,
                        }}
                      >
                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: active ? t.colors.accent : t.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
                          {active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.colors.accent }} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="body" weight="bold">
                            {p.name}
                          </Text>
                          <Text variant="caption" tone="subtle">
                            {p.blurb} · from {p.minSeats} {p.minSeats === 1 ? 'seat' : 'seats'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text variant="bodySm" weight="bold" mono>
                            {formatUSD(p.pricePerSeat)}
                          </Text>
                          <Text variant="micro" tone="subtle">
                            /seat/mo
                          </Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>

                {/* Free trial summary */}
                {plan === 'free' && (
                  <View style={{ backgroundColor: t.colors.accentSoft, borderRadius: t.radius.xl, padding: 18, gap: 8 }}>
                    <Text variant="bodySm" weight="bold" tone="accent">
                      Free for 7 days · no card needed
                    </Text>
                    <Text variant="caption" tone="muted">
                      1 seat, full features. Shared statements carry a small sponsored message. Upgrade
                      anytime from Settings to invite your team and remove ads.
                    </Text>
                  </View>
                )}

                {/* Live order summary (paid plans only) */}
                {plan !== 'free' && (
                <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.xl, padding: 18, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="caption" tone="subtle" weight="semibold" style={{ letterSpacing: 0.5 }}>
                      ORDER SUMMARY
                    </Text>
                    <View style={{ backgroundColor: t.colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                      <Text variant="micro" weight="bold" tone="accent">
                        {selectedPlan.name.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="bodySm" tone="muted">
                      {bill.seats} {bill.seats === 1 ? 'seat' : 'seats'} × {formatUSD(billingCycle === 'annual' ? bill.annualPerSeat : bill.monthlyPerSeat)}
                      {billingCycle === 'annual' ? '/seat/yr' : '/seat/mo'}
                    </Text>
                    <Text variant="bodySm" weight="semibold" mono>
                      {formatUSD(billingCycle === 'annual' ? bill.annualTotal : bill.monthlyTotal)}
                    </Text>
                  </View>
                  {billingCycle === 'annual' && bill.annualSavings > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="bodySm" tone="success">
                        Annual saving ({Math.round(ANNUAL_DISCOUNT * 100)}%)
                      </Text>
                      <Text variant="bodySm" weight="semibold" mono tone="success">
                        −{formatUSD(bill.annualSavings)}
                      </Text>
                    </View>
                  )}
                  <View style={{ height: 1, backgroundColor: t.colors.border }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                      <Text variant="bodySm" weight="semibold">
                        Due today
                      </Text>
                      <Text variant="micro" tone="subtle">
                        {billingCycle === 'annual' ? 'billed yearly' : 'billed monthly'} · ≈ {formatUSD(Math.round(bill.effectiveMonthly))}/mo
                      </Text>
                    </View>
                    <Text variant="h2" weight="bold" mono tone="accent">
                      {formatUSD(bill.dueNow)}
                    </Text>
                  </View>
                </View>
                )}
              </View>
            </Reveal>
          )}

          {err && (
            <Text variant="caption" tone="danger" weight="medium">
              {err}
            </Text>
          )}
        </ScrollView>

        {/* Sticky CTA */}
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: kb > 0 ? 14 : insets.bottom + 14, borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: t.colors.bg }}>
          <Button
            label={
              step < LAST_STEP
                ? 'Continue'
                : plan === 'free'
                ? 'Start free trial'
                : `Create company · ${formatUSD(bill.dueNow)}`
            }
            iconRight={step < LAST_STEP ? ArrowRight : Check}
            onPress={next}
            loading={submitting}
            size="lg"
            nativeID="setup-continue"
          />
        </View>
      </View>

      <PickerSheet
        visible={countryOpen}
        onClose={() => setCountryOpen(false)}
        title="Select country"
        options={COUNTRIES.map((c) => ({ key: c.name, label: c.name, left: c.flag }))}
        selectedKey={country || undefined}
        onSelect={(o) => onPickCountry(o.key)}
      />
      <PickerSheet
        visible={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="Select your role"
        options={OWNER_ROLES.map((r) => ({ key: r, label: r }))}
        selectedKey={role}
        onSelect={(o) => setRole(o.key)}
        searchable={false}
      />
    </View>
  );
}
