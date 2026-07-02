import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, UserPlus, User, Mail, Lock, Briefcase, Trash2, Crown } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Sheet } from '@/components/Sheet';
import { Fab } from '@/components/Fab';
import { Reveal, PressableScale } from '@/components/motion';
import { api } from '@/api/client';
import { validatePassword } from '@/utils/password';
import { PasswordStrength } from '@/components/PasswordStrength';

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  isOwner: boolean;
}

export default function Team() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [seats, setSeats] = useState<{ total: number; used: number; available: number }>({ total: 0, used: 0, available: 0 });
  const [addOpen, setAddOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(() => {
    api.team
      .list()
      .then((r: any) => {
        setMembers(r.members ?? []);
        setSeats(r.seats ?? { total: 0, used: 0, available: 0 });
      })
      .catch(() => {});
  }, []);

  useEffect(() => load(), [load]);
  useFocusEffect(useCallback(() => load(), [load]));

  const remove = async (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    try {
      await api.team.remove(id);
    } catch {
      /* surfaced by reload */
    }
    setConfirmId(null);
    load();
  };

  const full = seats.available <= 0;
  let idx = 0;

  return (
    <View style={{ flex: 1 }}>
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
                Team members
              </Text>
            </View>
          </View>
        </Reveal>

        {/* Seat usage */}
        <Reveal index={idx++}>
          <Card elevation={2} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="caption" tone="subtle" weight="semibold" style={{ letterSpacing: 0.4 }}>
                SEATS IN USE
              </Text>
              <Text variant="bodySm" weight="bold" mono>
                {seats.used} / {seats.total}
              </Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${seats.total ? Math.min(100, (seats.used / seats.total) * 100) : 0}%`,
                  height: '100%',
                  backgroundColor: full ? t.colors.warning : t.colors.accent,
                }}
              />
            </View>
            <Text variant="caption" tone={full ? 'warning' : 'subtle'}>
              {full
                ? 'All seats are in use — add more seats in Billing to invite another member.'
                : `${seats.available} seat${seats.available === 1 ? '' : 's'} available`}
            </Text>
          </Card>
        </Reveal>

        {/* Members */}
        <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
          {members.map((m, i) => (
            <View
              key={m.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: t.spacing.xl,
                paddingVertical: 14,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: t.colors.divider,
              }}
            >
              <Avatar initials={m.initials} size={42} />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                    {m.name}
                  </Text>
                  {m.isOwner && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: t.colors.accentSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 }}>
                      <Crown size={11} color={t.colors.accent} strokeWidth={2.5} />
                      <Text variant="micro" weight="bold" tone="accent">
                        Owner
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="caption" tone="subtle" numberOfLines={1}>
                  {m.role} · {m.email}
                </Text>
              </View>
              {!m.isOwner && m.id !== user?.id && (
                <PressableScale onPress={() => remove(m.id)} scaleTo={0.9} accessibilityLabel={`Remove ${m.name}`} style={{ padding: 8 }}>
                  <Trash2 size={17} color={confirmId === m.id ? t.colors.danger : t.colors.textSubtle} strokeWidth={2.2} />
                </PressableScale>
              )}
            </View>
          ))}
          {confirmId && (
            <Text variant="micro" tone="danger" weight="medium" style={{ paddingHorizontal: t.spacing.xl, paddingBottom: 12 }}>
              Tap the trash icon again to confirm removal.
            </Text>
          )}
        </Card>
      </Screen>

      <Fab icon={UserPlus} label="Add member" onPress={() => setAddOpen(true)} />
      <AddMemberSheet visible={addOpen} full={full} onClose={() => setAddOpen(false)} onAdded={load} />
    </View>
  );
}

function AddMemberSheet({ visible, full, onClose, onAdded }: { visible: boolean; full: boolean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setEmail('');
      setRole('');
      setPassword('');
      setError(undefined);
      setSaving(false);
    }
  }, [visible]);

  const submit = async () => {
    if (name.trim().length < 2) return setError('Enter the member’s name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Enter a valid email address');
    const pwErr = validatePassword(password);
    if (pwErr) return setError(pwErr);
    setError(undefined);
    setSaving(true);
    try {
      await api.team.add({ name: name.trim(), email: email.trim(), password, role: role.trim() || undefined });
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Could not add member.');
      setSaving(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add team member" subtitle="They sign in with this email & temporary password">
      <View style={{ gap: 16 }}>
        {full && (
          <Text variant="caption" tone="warning" weight="medium">
            All seats are in use. Add more seats in Billing first.
          </Text>
        )}
        <Field label="Full name *" icon={User} value={name} onChangeText={setName} placeholder="e.g. Sara Ahmed" autoFocus />
        <Field
          label="Work email *"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="sara@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field label="Role" icon={Briefcase} value={role} onChangeText={setRole} placeholder="e.g. Accountant" />
        <View style={{ gap: 10 }}>
          <Field label="Temporary password *" icon={Lock} value={password} onChangeText={setPassword} placeholder="Min 8 — letters & numbers" secure autoComplete="password-new" />
          <PasswordStrength password={password} />
        </View>
        {error && (
          <Text variant="caption" tone="danger" weight="medium">
            {error}
          </Text>
        )}
        <Button label="Add member" onPress={submit} loading={saving} disabled={full} nativeID="submit-member" />
      </View>
    </Sheet>
  );
}
