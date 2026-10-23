import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from './theme';

export function Screen({ colors, children, padded = true }) {
  return (
    <SafeAreaView style={[styles.flex, styles.screen, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.flex, padded && styles.pad]}>{children}</View>
    </SafeAreaView>
  );
}

export function BackLink({ colors, label = 'Back', onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.backLink}>
      <Text style={{ color: colors.accent, fontWeight: '700' }}>← {label}</Text>
    </Pressable>
  );
}

let presentConfirm = null;

export function ConfirmProvider({ children }) {
  const colors = useColors();
  const [dialog, setDialog] = useState(null);

  const present = useCallback(
    ({ title, message, confirmLabel }) =>
      new Promise((resolve) => {
        setDialog({ title, message, confirmLabel, resolve });
      }),
    []
  );

  useEffect(() => {
    presentConfirm = present;
    return () => {
      if (presentConfirm === present) presentConfirm = null;
    };
  }, [present]);

  const finish = (ok) => {
    const resolve = dialog?.resolve;
    setDialog(null);
    if (resolve) resolve(ok);
  };

  return (
    <View style={[styles.flex, styles.screen]}>
      {children}
      {dialog ? (
        <View
          style={[
            styles.modalLayer,
            styles.confirmLayer,
            { backgroundColor: colors.overlay },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => finish(false)} />
          <View style={[styles.modalCard, styles.confirmCard, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{dialog.title}</Text>
            {dialog.message ? (
              <Text style={[styles.confirmMessage, { color: colors.muted }]}>{dialog.message}</Text>
            ) : null}
            <Button
              colors={colors}
              kind="danger"
              label={dialog.confirmLabel || 'Delete'}
              onPress={() => finish(true)}
            />
            <Button colors={colors} kind="ghost" label="Cancel" onPress={() => finish(false)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function notify(title, message) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert([title, message].filter(Boolean).join('\n\n'));
    return;
  }
  Alert.alert(title, message);
}

export function askConfirm(title, message, onYes, confirmLabel = 'Delete') {
  if (Platform.OS === 'web') {
    if (presentConfirm) {
      presentConfirm({ title, message, confirmLabel }).then((ok) => {
        if (ok) onYes();
      });
      return;
    }
    const ok =
      typeof window !== 'undefined' &&
      window.confirm([title, message].filter(Boolean).join('\n\n'));
    if (ok) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onYes },
  ]);
}

export function Title({ colors, children, subtitle }) {
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, { color: colors.text }]}>{children}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Empty({ colors, text }) {
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.muted }]}>{text}</Text>
    </View>
  );
}

export function Card({ colors, children, onPress, style }) {
  const body = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.surface2 }}
      style={[styles.cardPress, styles.clickable]}
    >
      {body}
    </Pressable>
  );
}

export function DangerLink({ colors, label = 'Delete', onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.dangerLink, styles.clickable]}>
      <Text style={{ color: colors.danger, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Check({ colors, checked, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[
        styles.check,
        styles.clickable,
        {
          borderColor: checked ? colors.accent : colors.muted,
          backgroundColor: checked ? colors.accent : 'transparent',
        },
      ]}
    >
      {checked ? <Text style={[styles.checkMark, { color: colors.fabText }]}>✓</Text> : null}
    </Pressable>
  );
}

export function Pill({ colors, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        styles.clickable,
        {
          backgroundColor: active ? colors.accentSoft : colors.surface2,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={{ color: active ? colors.accentText : colors.text, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Button({ colors, label, onPress, kind = 'primary', disabled }) {
  const bg =
    kind === 'danger' ? colors.danger : kind === 'ghost' ? 'transparent' : colors.accent;
  const fg = kind === 'ghost' ? colors.text : kind === 'danger' ? '#fff' : colors.fabText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles.clickable,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1, borderColor: colors.border },
        kind === 'ghost' && styles.buttonGhost,
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ colors, label, value, onChangeText, placeholder, multiline, autoFocus }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        autoFocus={Platform.OS === 'android' ? false : autoFocus}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.inputMulti,
          { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      />
    </View>
  );
}

export function Fab({ colors, onPress, label = '+' }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, styles.clickable, { backgroundColor: colors.fab }]}
    >
      <Text style={[styles.fabText, { color: colors.fabText }]}>{label}</Text>
    </Pressable>
  );
}

export function FormModal({ colors, visible, title, children, onClose }) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  // In-tree overlay instead of React Native Modal — Modal + native-stack
  // crashes on some Android devices when opening Goals add/edit.
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.modalLayer,
        { backgroundColor: colors.overlay, paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.modalCard, { backgroundColor: colors.bg }]}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.modalScroll}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

export function Loading({ colors }) {
  return (
    <View style={[styles.flex, styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function useStyles(colors) {
  return useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
  }), [colors]);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: Platform.OS === 'web' ? { minHeight: '100%', height: '100%' } : {},
  pad: { paddingHorizontal: 20, paddingTop: 8 },
  backLink: { marginBottom: 8, alignSelf: 'flex-start', paddingVertical: 4 },
  clickable: Platform.OS === 'web' ? { cursor: 'pointer' } : {},
  cardPress: { width: '100%' },
  dangerLink: { paddingVertical: 8, paddingHorizontal: 4 },
  confirmLayer: { zIndex: 300, elevation: 40 },
  confirmCard: { maxWidth: 420 },
  confirmMessage: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  center: { alignItems: 'center', justifyContent: 'center' },
  titleBlock: { marginBottom: 16, marginTop: 8 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { marginTop: 4, fontSize: 15 },
  empty: { paddingVertical: 28 },
  emptyText: { fontSize: 16, lineHeight: 22 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 14, fontWeight: '800' },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonGhost: { borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { marginBottom: 12 },
  fieldLabel: { marginBottom: 6, fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { fontSize: 28, fontWeight: '500', marginTop: -2 },
  modalLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
    elevation: 24,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalScroll: { maxHeight: 460 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
});
