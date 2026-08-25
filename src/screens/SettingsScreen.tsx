import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { useHistoryStore } from '../stores/historyStore';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { colors, font, radius, spacing } from '../theme/fitness';

// Screen 6: settings — sound/haptics/voice, time format, units, body weight
// (for calorie estimates), plus data reset. Persisted via settingsStore.
export function SettingsScreen() {
  const settings = useSettingsStore();
  const update = useSettingsStore((s) => s.update);
  const closeSettings = useNavStore((s) => s.closeSettings);
  const clearHistory = useHistoryStore((s) => s.clear);

  return (
    <View style={styles.container}>
      <ScreenHeader title="SETTINGS" onBack={closeSettings} right="none" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.group}>TIMER</Text>
        <View style={styles.card}>
          <Choice
            label="Time Format"
            options={['MM:SS', 'SS']}
            value={settings.timeFormat}
            onSelect={(v) => update({ timeFormat: v as 'MM:SS' | 'SS' })}
          />
          <Toggle
            label="Sound"
            value={settings.sound}
            onChange={(sound) => update({ sound })}
          />
          <Toggle
            label="Vibration"
            value={settings.vibration}
            onChange={(vibration) => update({ vibration })}
          />
          <Toggle
            label="Countdown Voice"
            value={settings.countdownVoice}
            onChange={(countdownVoice) => update({ countdownVoice })}
            last
          />
        </View>

        <Text style={styles.group}>GENERAL</Text>
        <View style={styles.card}>
          <Choice
            label="Units"
            options={['metric', 'imperial']}
            value={settings.units}
            onSelect={(v) => update({ units: v as 'metric' | 'imperial' })}
          />
          <View style={[styles.row, styles.last]}>
            <Text style={styles.rowLabel}>Body Weight</Text>
            <View style={styles.weight}>
              <Pressable
                hitSlop={8}
                onPress={() => update({ bodyWeightKg: Math.max(30, settings.bodyWeightKg - 1) })}
              >
                <Text style={styles.weightBtn}>−</Text>
              </Pressable>
              <Text style={styles.weightValue}>{settings.bodyWeightKg} kg</Text>
              <Pressable
                hitSlop={8}
                onPress={() => update({ bodyWeightKg: Math.min(250, settings.bodyWeightKg + 1) })}
              >
                <Text style={styles.weightBtn}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.group}>DATA</Text>
        <View style={styles.card}>
          <Pressable style={[styles.row, styles.last]} onPress={clearHistory}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>
              Clear Workout History
            </Text>
          </Pressable>
        </View>

        <Text style={styles.version}>HIIT Timer · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.last]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.work, false: colors.surfaceAlt }}
        thumbColor={colors.text}
      />
    </View>
  );
}

function Choice({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segment}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[styles.segmentBtn, value === opt && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, value === opt && styles.segmentTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    padding: spacing.lg,
  },
  group: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  last: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  segment: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  segmentActive: {
    backgroundColor: colors.work,
  },
  segmentText: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.text,
  },
  weight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  weightBtn: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  weightValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    minWidth: 60,
    textAlign: 'center',
  },
  version: {
    color: colors.muted,
    fontSize: font.small,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
