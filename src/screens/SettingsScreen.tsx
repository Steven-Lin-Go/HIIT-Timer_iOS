import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { ThemeMotif } from '../components/ThemeMotif';
import { useT } from '../i18n/useT';
import { deleteBackground, pickBackground } from '../lib/background';
import { useHistoryStore } from '../stores/historyStore';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { PALETTES, type ThemeName } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';
import type { BackgroundLevel } from '../types';

const THEMES: ThemeName[] = ['fitness', 'bohemia', 'zen', 'ikea'];
const LEVELS: BackgroundLevel[] = ['subtle', 'medium', 'bold'];

// Screen 6: settings — sound/haptics/voice, time format, language, theme, body
// weight (for calorie estimates), plus data reset. Persisted via settingsStore.
export function SettingsScreen() {
  const settings = useSettingsStore();
  const update = useSettingsStore((s) => s.update);
  const closeSettings = useNavStore((s) => s.closeSettings);
  const clearHistory = useHistoryStore((s) => s.clear);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const [picking, setPicking] = useState(false);

  const chooseBackground = async () => {
    if (picking) return;
    setPicking(true);
    const result = await pickBackground();
    setPicking(false);
    if (result.status === 'saved') {
      // Drop the previous file only once the new one is safely in place.
      const previous = settings.backgroundUri;
      update({ backgroundUri: result.uri });
      deleteBackground(previous);
    } else if (result.status === 'denied') {
      Alert.alert(t('settings.background'), t('settings.backgroundDenied'));
    } else if (result.status === 'failed') {
      Alert.alert(t('settings.background'), t('settings.backgroundFailed'));
    }
  };

  const removeBackground = () => {
    const previous = settings.backgroundUri;
    update({ backgroundUri: null });
    deleteBackground(previous);
  };

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
        <View style={styles.themeGrid}>
          {THEMES.map((name) => {
            const p = PALETTES[name];
            const selected = settings.theme === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => update({ theme: name })}
                style={[
                  styles.tile,
                  { backgroundColor: p.bg, borderColor: selected ? p.work : c.border },
                  selected && styles.tileSelected,
                ]}
              >
                <ThemeMotif variant="hero" theme={name} />
                <View style={[styles.tileRing, { borderColor: p.work }]} />
                <Text style={[styles.tileLabel, { color: p.text }]}>{t(`theme.${name}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.group}>{t('settings.group.background')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.background')}</Text>
            <View style={styles.bgActions}>
              {settings.backgroundUri ? (
                <Image source={{ uri: settings.backgroundUri }} style={styles.thumb} />
              ) : null}
              <Pressable disabled={picking} hitSlop={8} onPress={chooseBackground}>
                <Text style={[styles.action, picking && styles.actionBusy]}>
                  {settings.backgroundUri
                    ? t('settings.backgroundChange')
                    : t('settings.backgroundChoose')}
                </Text>
              </Pressable>
              {settings.backgroundUri ? (
                <Pressable hitSlop={8} onPress={removeBackground}>
                  <Text style={[styles.action, { color: c.danger }]}>
                    {t('settings.backgroundRemove')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={[styles.row, styles.last, !settings.backgroundUri && styles.rowDisabled]}>
            <Text style={styles.rowLabel}>{t('settings.backgroundLevel')}</Text>
            <View style={styles.segment}>
              {LEVELS.map((level) => (
                <Pressable
                  key={level}
                  disabled={!settings.backgroundUri}
                  onPress={() => update({ backgroundLevel: level })}
                  style={[
                    styles.segmentBtn,
                    settings.backgroundLevel === level && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings.backgroundLevel === level && styles.segmentTextActive,
                    ]}
                  >
                    {t(`level.${level}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.hint}>{t('settings.backgroundHint')}</Text>

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

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
    body: { padding: spacing.lg },
    group: {
      color: c.muted,
      fontSize: f.small,
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
      fontSize: f.label,
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
      fontSize: f.small,
      fontWeight: '800',
    },
    segmentTextActive: {
      color: c.text,
    },
    rowDisabled: { opacity: 0.45 },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tile: {
      borderRadius: radius.lg,
      borderWidth: 1,
      height: 104,
      justifyContent: 'flex-end',
      overflow: 'hidden',
      padding: spacing.sm,
      // Two per row, accounting for the gap between them.
      width: '48.5%',
    },
    tileSelected: { borderWidth: 2 },
    tileRing: {
      borderRadius: radius.pill,
      borderWidth: 3,
      height: 34,
      left: spacing.sm,
      position: 'absolute',
      top: spacing.sm,
      width: 34,
    },
    tileLabel: {
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1,
    },
    bgActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
    },
    thumb: {
      borderRadius: radius.sm,
      height: 34,
      width: 22,
    },
    action: {
      color: c.work,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1,
    },
    actionBusy: { opacity: 0.5 },
    hint: {
      color: c.muted,
      fontSize: f.small,
      lineHeight: 19,
      marginTop: spacing.sm,
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
      fontSize: f.label,
      fontWeight: '800',
      minWidth: 60,
      textAlign: 'center',
    },
    version: {
      color: c.muted,
      fontSize: f.small,
      marginTop: spacing.xl,
      textAlign: 'center',
    },
  });
