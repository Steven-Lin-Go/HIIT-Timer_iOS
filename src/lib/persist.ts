import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

// Shared AsyncStorage adapter for every persisted zustand store, so all app
// data (workouts, history, settings) survives restarts.
export const asyncStorage = createJSONStorage(() => AsyncStorage);
