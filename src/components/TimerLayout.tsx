import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

interface Props {
  children: (ringSize: number) => ReactNode;
  actions: ReactNode;
  centerAll?: boolean;
}

// Measure the space left AFTER the safe area, header and tab bar. Content and
// controls share a scroll container, so neither can paint over the other when
// the phone rotates, text grows, or the workout name wraps.
export function TimerLayout({ children, actions, centerAll = false }: Props) {
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const { fontScale } = useWindowDimensions();
  const columns = available.width >= 600 && available.width > available.height && fontScale <= 1.3;
  const bodyWidth = columns ? available.width * 0.55 : available.width;
  const ringSize = Math.max(0, Math.min(300, bodyWidth - 40, Math.max(190, available.height * 0.55)));

  return (
    <View style={styles.viewport} onLayout={({ nativeEvent: { layout } }) => setAvailable(layout)}>
      <ScrollView
        testID="timer-scroll"
        style={styles.viewport}
        contentContainerStyle={[
          styles.content,
          centerAll && styles.centeredContent,
          columns && styles.columns,
        ]}
      >
        <View
          testID="timer-body"
          style={[styles.body, centerAll && styles.centeredBody, columns && styles.bodyColumn]}
        >
          {available.width > 0 ? children(ringSize) : null}
        </View>
        <View testID="timer-actions" style={columns && styles.actionsColumn}>{actions}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, minHeight: 0 },
  content: { flexGrow: 1 },
  centeredContent: { justifyContent: 'center' },
  columns: { flexDirection: 'row', alignItems: 'center' },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 0,
    gap: 16,
    padding: 20,
  },
  centeredBody: { flexGrow: 0 },
  bodyColumn: { width: '55%', flexGrow: 0 },
  actionsColumn: { width: '45%' },
});
