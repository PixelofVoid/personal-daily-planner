import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { localISO, parseDateInput, usePlanner } from '../store';
import { useColors } from '../theme';
import { Card, Screen, Title } from '../ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TodayScreen() {
  const colors = useColors();
  const { data, settings, setShowCalendar } = usePlanner();
  const showCalendar = !!settings.showCalendar;
  const isDesktop = Platform.OS === 'web';
  const cellSize = isDesktop ? 44 : undefined;
  const gridWidth = isDesktop ? cellSize * 7 : undefined;
  const desktopCardWidth = isDesktop ? gridWidth + 34 : undefined;
  const today = localISO();
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const eventsByDay = useMemo(() => buildEvents(data), [data]);
  const cells = useMemo(
    () => monthCells(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const overdue = [];
  const dueToday = [];
  data.tasks.forEach((task) => {
    if (task.done) return;
    const due = parseDateInput(task.due);
    if (!due) return;
    if (due < today) overdue.push(task);
    else if (due === today) dueToday.push(task);
  });
  const goals = data.goals.filter((g) => g.status === 'in progress');
  const shopping = data.grocery_lists
    .map((l) => ({
      name: l.name,
      remaining: l.items.filter((i) => !i.done).length,
    }))
    .filter((l) => l.remaining > 0);

  const selectedEvents = eventsByDay[selected] || [];
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Screen colors={colors}>
      <Title colors={colors} subtitle={formatNiceDate()}>
        Today
      </Title>
      <Pressable
        onPress={() => setShowCalendar(!showCalendar)}
        style={{ alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 6 }}
      >
        <Text style={{ color: colors.accent, fontWeight: '700' }}>
          {showCalendar ? 'Hide calendar' : 'Show calendar'}
        </Text>
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {showCalendar ? (
        <Card
          colors={colors}
          style={
            isDesktop
              ? { width: desktopCardWidth, maxWidth: desktopCardWidth, alignSelf: 'center' }
              : undefined
          }
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Pressable
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              hitSlop={8}
            >
              <Text style={{ color: colors.accent, fontSize: 22, fontWeight: '700' }}>‹</Text>
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', color: colors.text, fontSize: 18, fontWeight: '700' }}>
              {monthLabel}
            </Text>
            <Pressable
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              hitSlop={8}
            >
              <Text style={{ color: colors.accent, fontSize: 22, fontWeight: '700' }}>›</Text>
            </Pressable>
          </View>
          <View style={isDesktop ? { width: gridWidth, alignSelf: 'center' } : undefined}>
          <View style={{ flexDirection: 'row' }}>
            {WEEKDAYS.map((d) => (
              <Text
                key={d}
                style={{
                  width: isDesktop ? cellSize : '14.28%',
                  textAlign: 'center',
                  color: colors.muted,
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 6,
                }}
              >
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: isDesktop ? gridWidth : '100%' }}>
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <View
                    key={`e-${idx}`}
                    style={{ width: isDesktop ? cellSize : '14.28%', height: isDesktop ? cellSize : 44 }}
                  />
                );
              }
              const iso = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(day)}`;
              const isToday = iso === today;
              const isSelected = iso === selected;
              const hasEvents = (eventsByDay[iso] || []).length > 0;
              return (
                <Pressable
                  key={iso}
                  onPress={() => setSelected(iso)}
                  style={{
                    width: isDesktop ? cellSize : '14.28%',
                    height: isDesktop ? cellSize : 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? colors.accent
                        : isToday
                          ? colors.accentSoft
                          : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.fabText : isToday ? colors.accentText : colors.text,
                        fontWeight: isToday || isSelected ? '700' : '500',
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                  {hasEvents ? (
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        marginTop: 2,
                        backgroundColor: isSelected ? colors.fabText : colors.accent,
                      }}
                    />
                  ) : (
                    <View style={{ height: 7 }} />
                  )}
                </Pressable>
              );
            })}
          </View>
          </View>
        </Card>
        ) : null}

        {showCalendar ? (
        <Section
          colors={colors}
          label={selected === today ? 'This day' : selected}
          style={
            isDesktop
              ? { width: desktopCardWidth, maxWidth: desktopCardWidth, alignSelf: 'center' }
              : undefined
          }
        >
          {selectedEvents.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 16, marginTop: 6 }}>Nothing on this date.</Text>
          ) : (
            selectedEvents.map((ev) => (
              <Text key={ev.key} style={{ color: colors.text, fontSize: 16, marginTop: 6 }}>
                {ev.kind}: {ev.title}
              </Text>
            ))
          )}
        </Section>
        ) : null}

        {overdue.length ? (
          <Section colors={colors} label="Overdue" tone="warning">
            {overdue.map((t) => (
              <Text key={t.id} style={{ color: colors.text, fontSize: 16, marginTop: 6 }}>
                {t.title}
              </Text>
            ))}
          </Section>
        ) : null}
        {dueToday.length ? (
          <Section colors={colors} label="Due today">
            {dueToday.map((t) => (
              <Text key={t.id} style={{ color: colors.text, fontSize: 16, marginTop: 6 }}>
                {t.title}
              </Text>
            ))}
          </Section>
        ) : null}
        {goals.length ? (
          <Section colors={colors} label="Goals in progress">
            {goals.map((g) => (
              <Text key={g.id} style={{ color: colors.text, fontSize: 16, marginTop: 6 }}>
                {g.title}
              </Text>
            ))}
          </Section>
        ) : null}
        {shopping.length ? (
          <Section colors={colors} label="Shopping">
            {shopping.map((l) => (
              <Text key={l.name} style={{ color: colors.text, fontSize: 16, marginTop: 6 }}>
                {l.name} · {l.remaining} remaining
              </Text>
            ))}
          </Section>
        ) : null}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

function Section({ colors, label, children, tone, style }) {
  const bg = tone === 'warning' ? colors.warningSoft : colors.surface;
  const fg = tone === 'warning' ? colors.warning : colors.accentText;
  return (
    <Card colors={colors} style={[{ backgroundColor: bg }, style]}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13, letterSpacing: 0.4 }}>
        {String(label).toUpperCase()}
      </Text>
      {children}
    </Card>
  );
}

function buildEvents(data) {
  const map = {};
  const add = (iso, kind, title, key) => {
    if (!iso) return;
    if (!map[iso]) map[iso] = [];
    map[iso].push({ kind, title, key });
  };
  (data.tasks || []).forEach((t) => {
    const due = parseDateInput(t.due);
    if (due) add(due, 'Task', t.title, `t-${t.uuid || t.id}`);
  });
  (data.goals || []).forEach((g) => {
    const due = parseDateInput(g.target_date);
    if (due) add(due, 'Goal', g.title, `g-${g.uuid || g.id}`);
  });
  (data.notes || []).forEach((n) => {
    const created = String(n.created || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(created)) add(created, 'Note', n.title, `n-${n.uuid || n.id}`);
  });
  return map;
}

function monthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatNiceDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
