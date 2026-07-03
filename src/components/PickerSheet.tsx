import React, { useMemo, useState, useEffect } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Check, ChevronDown, Search, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './motion';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface PickerOption {
  key: string;
  label: string;
  /** Optional left adornment, e.g. a flag emoji. */
  left?: string;
}

/** A Field-styled pressable that opens a picker sheet. */
export function SelectField({
  label,
  icon: Icon,
  value,
  placeholder,
  onPress,
  nativeID,
}: {
  label: string;
  icon?: LucideIcon;
  value?: string;
  placeholder: string;
  onPress: () => void;
  nativeID?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Text variant="bodySm" weight="medium" tone="muted">
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        nativeID={nativeID}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          borderRadius: t.radius.lg,
          borderWidth: 1.5,
          borderColor: pressed ? t.colors.accent : t.colors.border,
          backgroundColor: t.colors.surface,
          paddingHorizontal: 14,
          gap: 10,
        })}
      >
        {Icon && <Icon size={18} color={t.colors.textSubtle} strokeWidth={2.2} />}
        <Text variant="body" tone={value ? 'default' : 'subtle'} style={{ flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

/** Searchable option picker inside the standard bottom sheet. */
export function PickerSheet({
  visible,
  onClose,
  title,
  options,
  selectedKey,
  onSelect,
  searchable = true,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption[];
  selectedKey?: string;
  onSelect: (option: PickerOption) => void;
  searchable?: boolean;
}) {
  const t = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: 12 }}>
        {searchable && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              height: 44,
              borderRadius: t.radius.lg,
              borderWidth: 1.5,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surface,
              paddingHorizontal: 14,
            }}
          >
            <Search size={17} color={t.colors.textSubtle} strokeWidth={2.2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={t.colors.textSubtle}
              style={
                {
                  flex: 1,
                  fontFamily: t.fonts.regular,
                  fontSize: 15,
                  color: t.colors.text,
                  height: '100%',
                  outlineStyle: 'none',
                } as any
              }
            />
          </View>
        )}
        {/* Plain mapped list on purpose: the Sheet already scrolls, and nesting a
            VirtualizedList inside its ScrollView breaks touch handling. The option
            count is small (< 60), so virtualization buys nothing. */}
        <View>
          {filtered.length === 0 && (
            <Text variant="bodySm" tone="subtle" center style={{ paddingVertical: 24 }}>
              No matches
            </Text>
          )}
          {filtered.map((item, index) => {
            const active = item.key === selectedKey;
            return (
              <PressableScale
                key={item.key}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                nativeID={`pick-${item.key.replace(/[^a-zA-Z0-9]/g, '_')}`}
                scaleTo={0.98}
                accessibilityLabel={item.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 6,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: t.colors.divider,
                }}
              >
                {item.left && <Text style={{ fontSize: 20 }}>{item.left}</Text>}
                <Text variant="body" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'default'} style={{ flex: 1 }}>
                  {item.label}
                </Text>
                {active && <Check size={18} color={t.colors.accent} strokeWidth={2.6} />}
              </PressableScale>
            );
          })}
        </View>
      </View>
    </Sheet>
  );
}
