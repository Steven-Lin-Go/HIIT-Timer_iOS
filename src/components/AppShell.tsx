import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { speechLocale, voicePhrase } from '../lib/voice';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { TimerHomeScreen } from '../screens/TimerHomeScreen';
import { TimerSetupScreen } from '../screens/TimerSetupScreen';
import { WorkoutRunScreen } from '../screens/WorkoutRunScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AppBackdrop } from './AppBackdrop';
import { TabBar } from './TabBar';
import { useTheme } from '../theme/useTheme';
import type { Palette } from '../theme/palettes';

// Root shell: owns the timer runtime (ticking, audio/haptic/voice cues,
// background catch-up) and routes between tabs / sub-screens / settings.
export function AppShell() {
  const activeTab = useNavStore((s) => s.activeTab);
  const timerScreen = useNavStore((s) => s.timerScreen);
  const settingsOpen = useNavStore((s) => s.settingsOpen);

  const currentPhase = useTimerStore((s) => s.currentPhase);
  const currentSession = useTimerStore((s) => s.currentSession);
  const isComplete = useTimerStore((s) => s.isComplete);
  const isPaused = useTimerStore((s) => s.isPaused);
  const isRunning = useTimerStore((s) => s.isRunning);
  const timeRemaining = useTimerStore((s) => s.timeRemaining);
  const tick = useTimerStore((s) => s.tick);
  const setSession = useTimerStore((s) => s.setSession);

  const presets = useWorkoutStore((s) => s.presets);
  const soundOn = useSettingsStore((s) => s.sound);
  const vibrationOn = useSettingsStore((s) => s.vibration);
  const voiceOn = useSettingsStore((s) => s.countdownVoice);
  const lang = useSettingsStore((s) => s.language);
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const beep = useAudioPlayer(require('../../assets/beep.wav'));
  const lastCueRef = useRef<string | null>(null);
  const lastSpokenNumberRef = useRef<number | null>(null);

  // Muted phones must still beep during a workout.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // Seed the timer with the first preset on cold start.
  useEffect(() => {
    if (!currentSession && presets[0]) {
      setSession(presets[0]);
    }
  }, [currentSession, presets, setSession]);

  // Audio + haptic + voice cue on each phase change.
  useEffect(() => {
    const cue = isComplete ? 'complete' : currentPhase;
    const previous = lastCueRef.current;
    lastCueRef.current = cue;

    if (previous === null || previous === cue || (!isRunning && !isComplete)) {
      return;
    }

    if (soundOn) {
      beep.seekTo(0);
      beep.play();
    }

    if (vibrationOn) {
      if (cue === 'complete') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (cue === 'work') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }

    if (voiceOn) {
      Speech.stop();
      Speech.speak(voicePhrase(cue, lang), { language: speechLocale[lang] });
    }
  }, [beep, currentPhase, isComplete, isRunning, soundOn, vibrationOn, voiceOn, lang]);

  // Speak the final 3/2/1 seconds of the current segment.
  useEffect(() => {
    if (!voiceOn || !isRunning || isPaused || isComplete) {
      lastSpokenNumberRef.current = null;
      return;
    }
    if (timeRemaining >= 1 && timeRemaining <= 3) {
      if (lastSpokenNumberRef.current !== timeRemaining) {
        lastSpokenNumberRef.current = timeRemaining;
        Speech.speak(String(timeRemaining), { language: speechLocale[lang] });
      }
    } else {
      lastSpokenNumberRef.current = null;
    }
  }, [timeRemaining, voiceOn, lang, isRunning, isPaused, isComplete]);

  // 1s driver while running.
  useEffect(() => {
    if (!isRunning || isPaused || isComplete || !currentSession) {
      return;
    }
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [currentSession, isComplete, isPaused, isRunning, tick]);

  // Catch up immediately on foreground so a locked session doesn't wait a tick.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') tick();
    });
    return () => sub.remove();
  }, [tick]);

  const renderScreen = () => {
    if (activeTab === 'workouts') return <WorkoutsScreen />;
    if (activeTab === 'stats') return <StatsScreen />;
    if (timerScreen === 'setup') return <TimerSetupScreen />;
    if (timerScreen === 'run') return <WorkoutRunScreen />;
    return <TimerHomeScreen />;
  };

  const showTabBar =
    !settingsOpen && !(activeTab === 'timer' && (timerScreen === 'run' || timerScreen === 'setup'));

  // Only the timer home and the running workout carry a full backdrop and may
  // use the user's own photo; the data-dense screens get a corner ornament so
  // their lists and charts keep a plain, high-contrast ground.
  const onTimerScreen = activeTab === 'timer' && (timerScreen === 'home' || timerScreen === 'run');

  return (
    <View style={styles.root}>
      <AppBackdrop variant={onTimerScreen ? 'hero' : 'corner'} allowCustom={onTimerScreen} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style={c.statusBar} />
        <View style={styles.content}>{renderScreen()}</View>
        {showTabBar ? <TabBar /> : null}
        {settingsOpen ? (
          <View style={styles.overlay}>
            <SettingsScreen />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      backgroundColor: c.bg,
      flex: 1,
    },
    safeArea: { flex: 1 },
    content: { flex: 1 },
    overlay: {
      backgroundColor: c.bg,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  });
