import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { PressableScale } from './motion';

export function Fab({ icon: Icon, label, onPress }: { icon: LucideIcon; label?: string; onPress: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', right: 18, bottom: insets.bottom + 18 }} pointerEvents="box-none">
      <PressableScale onPress={onPress} scaleTo={0.94} nativeID="fab" accessibilityLabel={label ?? 'Add'}>
        <LinearGradient
          colors={t.gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 50,
            borderRadius: 16,
            paddingHorizontal: label ? 18 : 0,
            width: label ? undefined : 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            ...t.shadow(3),
          }}
        >
          <Icon size={20} color="#FFFFFF" strokeWidth={2.6} />
          {label && (
            <Text variant="bodySm" weight="bold" style={{ color: '#FFFFFF' }}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </PressableScale>
    </View>
  );
}
