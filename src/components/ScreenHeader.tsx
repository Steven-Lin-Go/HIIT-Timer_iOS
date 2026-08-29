import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavStore } from '../stores/navStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import { type FontScale } from '../theme/fitness';

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
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.tap}>
            <Text style={styles.icon}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.right]}>
        {right === 'settings' ? (
          <Pressable accessibilityRole="button" onPress={openSettings} style={styles.tap}>
            <Text style={styles.icon}>⚙</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    side: {
      width: 44,
    },
    right: {
      alignItems: 'flex-end',
    },
    // 44pt is the smallest comfortable touch target on iOS; the glyphs alone
    // are about half that.
    tap: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    title: {
      color: c.text,
      flex: 1,
      fontSize: f.h3,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
    },
    icon: {
      color: c.text,
      fontSize: f.glyph,
      fontWeight: '700',
    },
  });
