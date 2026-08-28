import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavStore } from '../stores/navStore';
import { useTheme } from '../theme/useTheme';
import type { Palette } from '../theme/palettes';
import { font } from '../theme/fitness';

interface Props {
  title: string;
  onBack?: () => void;
  right?: 'settings' | 'none';
}

// Shared top bar: optional back chevron, centered title, optional gear that
// opens the full-screen settings.
export function ScreenHeader({ title, onBack, right = 'settings' }: Props) {
  const openSettings = useNavStore((s) => s.openSettings);
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} hitSlop={10}>
            <Text style={styles.icon}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.right]}>
        {right === 'settings' ? (
          <Pressable accessibilityRole="button" onPress={openSettings} hitSlop={10}>
            <Text style={styles.icon}>⚙</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    side: {
      width: 40,
    },
    right: {
      alignItems: 'flex-end',
    },
    title: {
      color: c.text,
      flex: 1,
      fontSize: font.h3,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
    },
    icon: {
      color: c.text,
      fontSize: 26,
      fontWeight: '700',
    },
  });
