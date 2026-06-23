import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';
import { SeriesPoint } from '@/data/mock';

function smoothPath(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function AreaChart({ data, height = 200 }: { data: SeriesPoint[]; height?: number }) {
  const t = useTheme();
  const [w, setW] = React.useState(320);
  const padX = 6;
  const padTop = 12;
  const padBottom = 26;
  const innerH = height - padTop - padBottom;

  const max = Math.max(...data.map((d) => Math.max(d.revenue, d.expense))) * 1.1;
  const min = 0;
  const range = max - min || 1;
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1);

  const toPts = (key: 'revenue' | 'expense') =>
    data.map((d, i) => ({
      x: padX + i * stepX,
      y: padTop + innerH * (1 - (d[key] - min) / range),
    }));

  const revPts = toPts('revenue');
  const expPts = toPts('expense');
  const revLine = smoothPath(revPts);
  const expLine = smoothPath(expPts);
  const revArea = `${revLine} L ${revPts[revPts.length - 1].x} ${padTop + innerH} L ${revPts[0].x} ${padTop + innerH} Z`;
  const last = revPts[revPts.length - 1];

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => padTop + innerH * f);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      <Svg width={w} height={height}>
        <Defs>
          <LinearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.colors.accent} stopOpacity={t.mode === 'dark' ? 0.4 : 0.26} />
            <Stop offset="1" stopColor={t.colors.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {gridLines.map((y, i) => (
          <Line key={i} x1={padX} y1={y} x2={w - padX} y2={y} stroke={t.colors.divider} strokeWidth={1} />
        ))}
        <Path d={revArea} fill="url(#revArea)" />
        <Path
          d={expLine}
          stroke={t.colors.textSubtle}
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="none"
          strokeLinecap="round"
        />
        <Path d={revLine} stroke={t.colors.accent} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={6} fill={t.colors.accent} />
        <Circle cx={last.x} cy={last.y} r={11} fill={t.colors.accent} fillOpacity={0.18} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: padX, marginTop: -padBottom + 4 }}>
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <Text key={d.label} variant="micro" tone="subtle" mono>
              {d.label}
            </Text>
          ) : (
            <View key={d.label} style={{ width: 1 }} />
          )
        )}
      </View>
    </View>
  );
}
