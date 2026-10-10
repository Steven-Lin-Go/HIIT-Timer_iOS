import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from './src/components/AppShell';
import { useNavStore } from './src/stores/navStore';
import { useTimerStore } from './src/stores/timerStore';

// Android entry point. Metro picks this file over App.tsx on Android only, so
// iOS keeps running App.tsx untouched. The tree below mirrors App.tsx; the one
// addition is handling the Android system back button/gesture, which iOS does
// not have.
export default function App() {
  useAndroidBack();

  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

// Steps back through the app's own navigation (navStore) instead of letting
// the system close the activity. Returning false at the timer home falls
// through to Android's default, which leaves the app.
function useAndroidBack() {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const nav = useNavStore.getState();

      if (nav.settingsOpen) {
        nav.closeSettings();
        return true;
      }

      if (nav.activeTab !== 'timer') {
        nav.setTab('timer');
        return true;
      }

      if (nav.timerScreen === 'setup') {
        // Same as the setup screen's own back button.
        nav.setTimerScreen('home');
        nav.setTab(nav.setupReturnTo);
        return true;
      }

      if (nav.timerScreen === 'run') {
        const timer = useTimerStore.getState();
        if (timer.isComplete) {
          // A finished session has nothing left to keep; same as FINISH.
          timer.resetTimer();
        } else {
          // Keep the session: pause it so START on the home screen resumes it.
          timer.pauseTimer();
        }
        nav.setTimerScreen('home');
        return true;
      }

      return false;
    });
    return () => sub.remove();
  }, []);
}
