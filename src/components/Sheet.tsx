import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable, ScrollView, Keyboard, Platform, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

const { height: WIN_H } = Dimensions.get('window');

export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [kb, setKb] = useState(0);

  // Track the keyboard height so the sheet can sit *above* it on every platform.
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, (e) => setKb(e.endCoordinates?.height ?? 0));
    const onHide = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKb(0);
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={handleClose}
          accessibilityLabel="Dismiss"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.scrim }}
        />
        <View
          style={{
            backgroundColor: t.colors.bgElevated,
            borderTopLeftRadius: t.radius['2xl'],
            borderTopRightRadius: t.radius['2xl'],
            paddingHorizontal: t.spacing.xl,
            paddingTop: t.spacing.md,
            paddingBottom: kb > 0 ? t.spacing.xl : insets.bottom + t.spacing.xl,
            marginBottom: kb, // lift the whole sheet above the keyboard
            borderTopWidth: 1,
            borderColor: t.colors.border,
            ...t.shadow(3),
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: t.spacing.lg }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.borderStrong }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: t.spacing.xl }}>
            <View style={{ flex: 1 }}>
              <Text variant="h2" weight="bold">
                {title}
              </Text>
              {subtitle && (
                <Text variant="bodySm" tone="muted" style={{ marginTop: 2 }}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleClose}
              hitSlop={10}
              accessibilityLabel="Close"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: t.colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={t.colors.textMuted} strokeWidth={2.4} />
            </Pressable>
          </View>
          {/* Scrollable so even tall forms stay reachable above the keyboard. */}
          <ScrollView
            // Shrink the scroll area while the keyboard is up so the sheet
            // (lifted by marginBottom) never grows past the visible space.
            style={{ maxHeight: kb > 0 ? Math.max(200, WIN_H - kb - 260) : WIN_H * 0.62 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
