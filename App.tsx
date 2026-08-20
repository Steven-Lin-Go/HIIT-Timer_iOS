import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useTimerStore } from './src/stores/timerStore';
import { WorkoutSession } from './src/types';

const WORKOUT_PRESETS: WorkoutSession[] = [
  {
    id: 'tabata-8',
    name: 'Tabata 8',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    createdAt: new Date(),
  },
  {
    id: 'power-5',
    name: 'Power 5',
    workTime: 30,
    restTime: 15,
    rounds: 5,
    createdAt: new Date(),
  },
  {
    id: 'starter-4',
    name: 'Starter 4',
    workTime: 40,
    restTime: 20,
    rounds: 4,
    createdAt: new Date(),
  },
];

const PHASE_META = {
  prepare: {
    label: '準備',
    subtitle: '先調整呼吸與姿勢，準備好就開始。',
    accent: '#8D9BFF',
    card: '#17203D',
  },
  work: {
    label: '運動',
    subtitle: '現在是工作區間，保持節奏。',
    accent: '#7CF1B1',
    card: '#122A22',
  },
  rest: {
    label: '休息',
    subtitle: '放慢速度，讓身體恢復下一輪。',
    accent: '#FFD36B',
    card: '#2B2111',
  },
  complete: {
    label: '完成',
    subtitle: '今天的訓練已結束，可以重新開始或換課表。',
    accent: '#FF7D7D',
    card: '#2A1417',
  },
} as const;

const DEFAULT_SESSION = WORKOUT_PRESETS[0]!;

const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainder}`;
};

export default function App() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 700;

  const {
    currentPhase,
    currentRound,
    currentSession,
    isComplete,
    isPaused,
    isRunning,
    pauseTimer,
    resetTimer,
    setSession,
    startTimer,
    tick,
    timeRemaining,
    totalRounds,
  } = useTimerStore();

  const beep = useAudioPlayer(require('./assets/beep.wav'));
  const lastCueRef = useRef<string | null>(null);

  // Play cues even when the iOS ringer switch is on silent — a muted phone must
  // still beep during a workout.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentSession) {
      setSession(DEFAULT_SESSION);
    }
  }, [currentSession, setSession]);

  // Audio + haptic cue on each phase change, so users training without looking
  // at the screen hear/feel work, rest, and completion boundaries.
  useEffect(() => {
    const cue = isComplete ? 'complete' : currentPhase;
    const previous = lastCueRef.current;
    lastCueRef.current = cue;

    // Skip first render and silent transitions (reset/setSession leave the timer
    // idle and not complete).
    if (previous === null || previous === cue || (!isRunning && !isComplete)) {
      return;
    }

    beep.seekTo(0);
    beep.play();

    if (cue === 'complete') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (cue === 'work') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } else if (cue === 'rest') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [beep, currentPhase, isComplete, isRunning]);

  useEffect(() => {
    if (!isRunning || isPaused || isComplete || !currentSession) {
      return;
    }

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession, isComplete, isPaused, isRunning, tick]);

  // Recompute immediately when returning to foreground so a backgrounded/locked
  // session catches up instantly instead of waiting for the next interval.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        tick();
      }
    });

    return () => sub.remove();
  }, [tick]);

  const displayPhase = isComplete ? 'complete' : currentPhase;
  const phaseMeta = PHASE_META[displayPhase];
  const status = isComplete
    ? '已完成'
    : isPaused
      ? '已暫停'
      : isRunning
        ? '計時中'
        : '待機中';
  const startButtonLabel = isComplete
    ? '重新開始'
    : isPaused
      ? '繼續'
      : isRunning
        ? '進行中'
        : '開始';
  const canStart = Boolean(currentSession) && (!isRunning || isPaused || isComplete);
  const canPause = isRunning && !isPaused && !isComplete;
  const canReset = Boolean(currentSession);

  const header = (
    <View
      style={[
        styles.header,
        isLandscape && styles.headerLandscape,
        isTablet && styles.headerTablet,
      ]}
    >
      <Text style={styles.eyebrow}>iOS only · Stage 2</Text>
      <Text
        style={[
          styles.title,
          isLandscape && styles.titleLandscape,
          isTablet && styles.titleTablet,
        ]}
      >
        HIIT Timer
      </Text>
      <Text
        style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}
        numberOfLines={isLandscape ? 2 : undefined}
      >
        直接在手機上跑的間歇訓練計時器，含預設課表與完整階段切換。
      </Text>
    </View>
  );

  const timerPanel = (
    <View
      style={[
        styles.timerCard,
        isLandscape && styles.timerCardLandscape,
        isTablet && styles.timerCardTablet,
        { backgroundColor: phaseMeta.card },
      ]}
    >
      <View style={styles.timerCardTopRow}>
        <View style={[styles.phasePill, { borderColor: phaseMeta.accent }]}>
          <Text style={[styles.phasePillText, { color: phaseMeta.accent }]}>
            {phaseMeta.label}
          </Text>
        </View>
        <Text style={styles.status}>{status}</Text>
      </View>

      <Text
        style={[
          styles.time,
          isLandscape && styles.timeLandscape,
          isTablet && styles.timeTablet,
        ]}
      >
        {formatClock(timeRemaining)}
      </Text>
      <Text
        style={[
          styles.phaseSubtitle,
          isLandscape && styles.phaseSubtitleLandscape,
        ]}
      >
        {phaseMeta.subtitle}
      </Text>

      <View style={[styles.divider, isLandscape && styles.dividerLandscape]} />

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>回合</Text>
          <Text style={styles.metricValue}>
            {currentRound} / {totalRounds || '—'}
          </Text>
        </View>
        <View style={styles.metricSpacer} />
        <View>
          <Text style={styles.metricLabel}>課表</Text>
          <Text style={styles.metricValue}>
            {currentSession?.name ?? '尚未設定'}
          </Text>
        </View>
      </View>
    </View>
  );

  const controlsPanel = (
    <View
      style={[
        styles.controlsCard,
        isLandscape && styles.controlsCardLandscape,
        isTablet && styles.controlsCardTablet,
      ]}
    >
      <Text style={styles.sectionTitle}>控制</Text>
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!canStart}
          onPress={startTimer}
          style={({ pressed }) => [
            styles.primaryButton,
            isLandscape && styles.buttonLandscape,
            isTablet && styles.buttonTablet,
            pressed && styles.buttonPressed,
            !canStart && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>{startButtonLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!canPause}
          onPress={pauseTimer}
          style={({ pressed }) => [
            styles.secondaryButton,
            isLandscape && styles.buttonLandscape,
            isTablet && styles.buttonTablet,
            pressed && styles.buttonPressed,
            !canPause && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.secondaryButtonText}>暫停</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!canReset}
          onPress={resetTimer}
          style={({ pressed }) => [
            styles.ghostButton,
            isLandscape && styles.buttonLandscape,
            isTablet && styles.buttonTablet,
            pressed && styles.buttonPressed,
            !canReset && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.ghostButtonText}>重設</Text>
        </Pressable>
      </View>
    </View>
  );

  const presetsPanel = (
    <View style={[styles.presetsCard, isLandscape && styles.presetsCardLandscape]}>
      <View style={styles.presetsHeader}>
        <Text style={styles.sectionTitle}>預設課表</Text>
        <Text style={styles.presetsHint}>點一下即可切換</Text>
      </View>

      <View style={[styles.presetList, isLandscape && styles.presetListLandscape]}>
        {WORKOUT_PRESETS.map((preset) => {
          const isSelected = currentSession?.id === preset.id;

          return (
            <Pressable
              key={preset.id}
              accessibilityRole="button"
              onPress={() => setSession(preset)}
              style={({ pressed }) => [
                styles.presetCard,
                isLandscape && styles.presetCardLandscape,
                isTablet && styles.presetCardTablet,
                isSelected && styles.presetCardSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.presetRow}>
                <Text style={styles.presetName}>{preset.name}</Text>
                {isSelected ? <Text style={styles.selectedTag}>使用中</Text> : null}
              </View>
              <Text style={styles.presetMeta}>
                {preset.workTime}s / {preset.restTime}s · {preset.rounds} rounds
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape,
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLandscape ? (
          <View
            style={[
              styles.landscapeLayout,
              isTablet && styles.landscapeLayoutTablet,
            ]}
          >
            <View style={styles.landscapePrimary}>
              {header}
              {timerPanel}
            </View>
            <View style={styles.landscapeSecondary}>
              {controlsPanel}
              {presetsPanel}
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.portraitLayout,
              isTablet && styles.portraitLayoutTablet,
            ]}
          >
            {header}
            {timerPanel}
            {controlsPanel}
            {presetsPanel}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050B16',
  },
  backgroundGlowTop: {
    backgroundColor: 'rgba(124, 241, 177, 0.14)',
    borderRadius: 999,
    height: 260,
    left: -80,
    position: 'absolute',
    top: -120,
    width: 260,
  },
  backgroundGlowBottom: {
    backgroundColor: 'rgba(141, 155, 255, 0.12)',
    borderRadius: 999,
    bottom: -100,
    height: 240,
    position: 'absolute',
    right: -80,
    width: 240,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  scrollContentLandscape: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  scrollContentTablet: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 32,
  },
  portraitLayout: {
    width: '100%',
  },
  portraitLayoutTablet: {
    alignSelf: 'center',
    maxWidth: 760,
  },
  landscapeLayout: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  landscapeLayoutTablet: {
    alignSelf: 'center',
    gap: 32,
    maxWidth: 1180,
  },
  landscapePrimary: {
    flex: 1.08,
    justifyContent: 'center',
    minWidth: 0,
  },
  landscapeSecondary: {
    flex: 0.92,
    justifyContent: 'center',
    minWidth: 0,
  },
  header: {
    marginBottom: 20,
  },
  headerLandscape: {
    marginBottom: 10,
  },
  headerTablet: {
    marginBottom: 20,
  },
  eyebrow: {
    color: '#7CF1B1',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 8,
  },
  titleLandscape: {
    fontSize: 30,
    marginTop: 3,
  },
  titleTablet: {
    fontSize: 48,
    marginTop: 6,
  },
  subtitle: {
    color: '#9BA7C7',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  subtitleLandscape: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  timerCard: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  timerCardLandscape: {
    borderRadius: 24,
    padding: 16,
  },
  timerCardTablet: {
    borderRadius: 32,
    padding: 26,
  },
  timerCardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phasePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phasePillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  status: {
    color: '#D7DDF0',
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    color: '#FFFFFF',
    fontSize: 86,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 96,
    marginTop: 10,
    textAlign: 'center',
  },
  timeLandscape: {
    fontSize: 68,
    lineHeight: 74,
    marginTop: 2,
  },
  timeTablet: {
    fontSize: 104,
    lineHeight: 112,
    marginTop: 8,
  },
  phaseSubtitle: {
    color: '#D7DDF0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  phaseSubtitleLandscape: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    height: 1,
    marginVertical: 18,
    width: '100%',
  },
  dividerLandscape: {
    marginVertical: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricSpacer: {
    width: 12,
  },
  metricLabel: {
    color: '#9BA7C7',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  controlsCard: {
    marginTop: 16,
  },
  controlsCardLandscape: {
    marginTop: 0,
  },
  controlsCardTablet: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#7CF1B1',
    borderRadius: 18,
    flex: 1,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#04110A',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#14213B',
    borderColor: '#2A3A63',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 16,
  },
  ghostButtonText: {
    color: '#D7DDF0',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonLandscape: {
    borderRadius: 15,
    paddingVertical: 12,
  },
  buttonTablet: {
    borderRadius: 19,
    paddingVertical: 17,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  presetsCard: {
    marginTop: 18,
  },
  presetsCardLandscape: {
    marginTop: 12,
  },
  presetsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetsHint: {
    color: '#9BA7C7',
    fontSize: 13,
  },
  presetList: {
    gap: 10,
    marginTop: 12,
  },
  presetListLandscape: {
    gap: 7,
    marginTop: 8,
  },
  presetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  presetCardLandscape: {
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  presetCardTablet: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  presetCardSelected: {
    borderColor: '#7CF1B1',
    backgroundColor: 'rgba(124, 241, 177, 0.09)',
  },
  presetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  selectedTag: {
    color: '#7CF1B1',
    fontSize: 12,
    fontWeight: '700',
  },
  presetMeta: {
    color: '#9BA7C7',
    fontSize: 13,
    marginTop: 8,
  },
});
