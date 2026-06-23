import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';
import { ExpenseSlice } from '@/data/mock';
import { formatCurrency } from '@/data/format';

export function DonutChart({
  data,
  size = 168,
  strokeWidth = 22,
  centerLabel,
  centerValue,
}: {
  data: ExpenseSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const t = useTheme();
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={t.colors.surfaceAlt}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * c;
            const seg = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${Math.max(dash - 2, 0)} ${c - Math.max(dash - 2, 0)}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                fill="none"
              />
            );
            offset += dash;
            return seg;
          })}
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        {centerValue && (
          <Text variant="h3" weight="bold" mono>
            {centerValue}
          </Text>
        )}
        {centerLabel && (
          <Text variant="micro" tone="subtle" weight="medium" style={{ letterSpacing: 0.6 }}>
            {centerLabel.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}

export function DonutLegend({ data }: { data: ExpenseSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <View style={{ gap: 12, flex: 1 }}>
      {data.map((d) => (
        <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: d.color }} />
          <Text variant="bodySm" weight="medium" style={{ flex: 1 }}>
            {d.label}
          </Text>
          <Text variant="bodySm" tone="muted" mono weight="medium">
            {Math.round((d.value / total) * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}
