import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useT } from '../i18n/useT';
import { useNavStore, type Tab } from '../stores/navStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import type { FontScale } from '../theme/fitness';
import type { StringKey } from '../i18n/strings';

const TABS: { key: Tab; labelKey: StringKey; icon: string }[] = [
  { key: 'timer', labelKey: 'tab.timer', icon: '◷' },
  { key: 'workouts', labelKey: 'tab.workouts', icon: '≣' },
  { key: 'stats', labelKey: 'tab.stats', icon: '▦' },
];

// Bottom navigation matching the mockup's TIMER / WORKOUTS / STATS bar.
export function TabBar() {
  const activeTab = useNavStore((s) => s.activeTab);
  const setTab = useNavStore((s) => s.setTab);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => setTab(tab.key)}
            style={styles.tab}
          >
            <Text style={[styles.icon, active && styles.activeText]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.activeText]}>{t(tab.labelKey)}</Text>
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
      borderTopColor: c.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      paddingBottom: 22,
      paddingTop: 12,
    },
    tab: {
      alignItems: 'center',
      flex: 1,
      gap: 3,
    },
    icon: {
      color: c.muted,
      fontSize: 20,
    },
    label: {
      color: c.muted,
      fontSize: f.tab,
      fontWeight: '700',
      letterSpacing: 1,
    },
    activeText: {
      color: c.work,
    },
  });
