import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavStore, type Tab } from '../stores/navStore';
import { colors } from '../theme/fitness';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'timer', label: 'TIMER', icon: '◷' },
  { key: 'workouts', label: 'WORKOUTS', icon: '≣' },
  { key: 'stats', label: 'STATS', icon: '▦' },
];

// Bottom navigation matching the mockup's TIMER / WORKOUTS / STATS bar.
export function TabBar() {
  const activeTab = useNavStore((s) => s.activeTab);
  const setTab = useNavStore((s) => s.setTab);

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
            <Text style={[styles.label, active && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
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
    color: colors.muted,
    fontSize: 20,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeText: {
    color: colors.work,
  },
});
