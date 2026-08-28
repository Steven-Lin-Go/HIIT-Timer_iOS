import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { useT } from '../i18n/useT';
import { useHistoryStore } from '../stores/historyStore';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { ThemeName } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import type { Palette } from '../theme/palettes';
import { font, radius, spacing } from '../theme/fitness';

// Screen 6: settings — sound/haptics/voice, time format, language, theme, body
// weight (for calorie estimates), plus data reset. Persisted via settingsStore.
export function SettingsScreen() {
  const settings = useSettingsStore();
  const update = useSettingsStore((s) => s.update);
  const closeSettings = useNavStore((s) => s.closeSettings);
  const clearHistory = useHistoryStore((s) => s.clear);
  const c = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('header.settings')} onBack={closeSettings} right="none" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.group}>{t('settings.group.timer')}</Text>
        <View style={styles.card}>
          <Choice
            styles={styles}
            label={t('settings.timeFormat')}
            options={[
              { value: 'MM:SS', label: 'MM:SS' },
              { value: 'SS', label: 'SS' },
            ]}
            value={settings.timeFormat}
            onSelect={(v) => update({ timeFormat: v as 'MM:SS' | 'SS' })}
          />
          <Toggle styles={styles} label={t('settings.sound')} value={settings.sound} onChange={(sound) => update({ sound })} />
          <Toggle styles={styles} label={t('settings.vibration')} value={settings.vibration} onChange={(vibration) => update({ vibration })} />
          <Toggle
            styles={styles}
            label={t('settings.countdownVoice')}
            value={settings.countdownVoice}
            onChange={(countdownVoice) => update({ countdownVoice })}
            last
          />
        </View>

        <Text style={styles.group}>{t('settings.group.general')}</Text>
        <View style={styles.card}>
          <Choice
            styles={styles}
            label={t('settings.language')}
            options={[
              { value: 'zh-TW', label: '正體中文' },
              { value: 'en', label: 'English' },
            ]}
            value={settings.language}
            onSelect={(v) => update({ language: v as 'zh-TW' | 'en' })}
          />
          <View style={[styles.row, styles.last]}>
            <Text style={styles.rowLabel}>{t('settings.bodyWeight')}</Text>
            <View style={styles.weight}>
              <Pressable hitSlop={8} onPress={() => update({ bodyWeightKg: Math.max(30, settings.bodyWeightKg - 1) })}>
                <Text style={styles.weightBtn}>−</Text>
              </Pressable>
              <Text style={styles.weightValue}>{settings.bodyWeightKg} kg</Text>
              <Pressable hitSlop={8} onPress={() => update({ bodyWeightKg: Math.min(250, settings.bodyWeightKg + 1) })}>
                <Text style={styles.weightBtn}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.group}>{t('settings.group.appearance')}</Text>
        <View style={styles.card}>
          {(['fitness', 'bohemia', 'zen', 'ikea'] as ThemeName[]).map((name, i, arr) => (
            <Pressable
              key={name}
              onPress={() => update({ theme: name })}
              style={[styles.row, i === arr.length - 1 && styles.last]}
            >
              <Text style={styles.rowLabel}>{t(`theme.${name}`)}</Text>
              <View
                style={[
                  styles.radio,
                  settings.theme === name && { borderColor: c.work },
                ]}
              >
                {settings.theme === name ? <View style={[styles.radioDot, { backgroundColor: c.work }]} /> : null}
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.group}>{t('settings.group.data')}</Text>
        <View style={styles.card}>
          <Pressable style={[styles.row, styles.last]} onPress={clearHistory}>
            <Text style={[styles.rowLabel, { color: c.danger }]}>{t('settings.clearHistory')}</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>{t('settings.version')}</Text>
      </ScrollView>
    </View>
  );
}

function Toggle({
  styles,
  label,
  value,
  onChange,
  last,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.last]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function Choice({
  styles,
  label,
  options,
  value,
  onSelect,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segment}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[styles.segmentBtn, value === opt.value && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, value === opt.value && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1 },
    body: { padding: spacing.lg },
    group: {
      color: c.muted,
      fontSize: font.small,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    card: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
    },
    row: {
      alignItems: 'center',
      borderBottomColor: c.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    last: { borderBottomWidth: 0 },
    rowLabel: {
      color: c.text,
      fontSize: 16,
      fontWeight: '600',
    },
    segment: {
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.sm,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    segmentBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    segmentActive: {
      backgroundColor: c.work,
    },
    segmentText: {
      color: c.muted,
      fontSize: font.small,
      fontWeight: '800',
    },
    segmentTextActive: {
      color: c.text,
    },
    radio: {
      alignItems: 'center',
      borderColor: c.muted,
      borderRadius: radius.pill,
      borderWidth: 2,
      height: 22,
      justifyContent: 'center',
      width: 22,
    },
    radioDot: {
      borderRadius: radius.pill,
      height: 10,
      width: 10,
    },
    weight: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
    },
    weightBtn: {
      color: c.text,
      fontSize: 22,
      fontWeight: '800',
    },
    weightValue: {
      color: c.text,
      fontSize: 16,
      fontWeight: '800',
      minWidth: 60,
      textAlign: 'center',
    },
    version: {
      color: c.muted,
      fontSize: font.small,
      marginTop: spacing.xl,
      textAlign: 'center',
    },
  });
