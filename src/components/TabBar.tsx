import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useT } from '../i18n/useT';
import { TabIcon } from './TabIcon';
import { useNavStore, type Tab } from '../stores/navStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import type { FontScale } from '../theme/fitness';
import type { StringKey } from '../i18n/strings';

const TABS: { key: Tab; labelKey: StringKey }[] = [
  { key: 'timer', labelKey: 'tab.timer' },
  { key: 'workouts', labelKey: 'tab.workouts' },
  { key: 'stats', labelKey: 'tab.stats' },
];

interface Props {
  orientation?: 'horizontal' | 'vertical';
  side?: 'left' | 'right';
}

// Bottom navigation in portrait; a narrow side ribbon in landscape.
export function TabBar({ orientation = 'horizontal', side = 'right' }: Props) {
  const activeTab = useNavStore((s) => s.activeTab);
  const setTab = useNavStore((s) => s.setTab);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const vertical = orientation === 'vertical';

  return (
    <View
      testID="main-tab-bar"
      style={[
        styles.bar,
        vertical ? styles.barVertical : styles.barHorizontal,
        vertical && (side === 'left' ? styles.barLeft : styles.barRight),
      ]}
    >
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            testID={`tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.labelKey)}
            aria-selected={active}
            onPress={() => setTab(tab.key)}
            style={[styles.tab, vertical && styles.tabVertical]}
          >
            <TabIcon name={tab.key} color={active ? c.work : c.muted} size={f.glyph} />
            <Text
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.5}
              numberOfLines={1}
              style={[styles.label, vertical && styles.labelVertical, active && styles.activeText]}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    bar: {
      backgroundColor: c.surface,
    },
    barHorizontal: {
      borderTopColor: c.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      paddingBottom: 22,
      paddingTop: 12,
    },
    barVertical: {
      flexDirection: 'column',
      paddingHorizontal: 6,
      paddingVertical: 8,
      width: 84,
    },
    barLeft: {
      borderRightColor: c.border,
      borderRightWidth: 1,
    },
    barRight: {
      borderLeftColor: c.border,
      borderLeftWidth: 1,
    },
    tab: {
      alignItems: 'center',
      flex: 1,
      gap: 3,
    },
    tabVertical: {
      justifyContent: 'center',
      minHeight: 64,
      width: '100%',
    },
    label: {
      textAlign: 'center',
      maxWidth: '100%',
      color: c.muted,
      fontSize: f.tab,
      fontWeight: '700',
      letterSpacing: 1,
    },
    labelVertical: {
      fontSize: Math.min(f.tab, 13),
      letterSpacing: 0.4,
    },
    activeText: {
      color: c.work,
    },
  });
