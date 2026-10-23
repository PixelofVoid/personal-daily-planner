import { ScrollView, Text, View } from 'react-native';
import { usePlanner } from '../store';
import { useColors } from '../theme';
import { askConfirm, Card, notify, Pill, Screen, Title } from '../ui';

export default function MoreScreen({ navigation }) {
  const colors = useColors();
  const { settings, setTheme, setShowCalendar, countCompleted, clearAllCompleted } = usePlanner();
  const counts = countCompleted();

  const clear = () => {
    if (!counts.total) {
      notify('Nothing to clear', 'There are no completed items.');
      return;
    }
    const parts = [];
    if (counts.tasks) parts.push(`${counts.tasks} task(s)`);
    if (counts.steps) parts.push(`${counts.steps} plan step(s)`);
    if (counts.goals) parts.push(`${counts.goals} goal(s)`);
    if (counts.items) parts.push(`${counts.items} shopping item(s)`);
    askConfirm(
      'Clear all completed',
      `Permanently delete ${parts.join(', ')}?`,
      () => clearAllCompleted(),
      'Clear'
    );
  };

  return (
    <Screen colors={colors}>
      <Title colors={colors} subtitle="Plans, goals, search, calendar, and appearance.">
        More
      </Title>
      <ScrollView>
        <Card colors={colors} onPress={() => navigation.navigate('Plans')}>
          <Row title="Plans" hint="Multi-step plans" colors={colors} />
        </Card>
        <Card colors={colors} onPress={() => navigation.navigate('Goals')}>
          <Row title="Goals" hint="Bigger aims and status" colors={colors} />
        </Card>
        <Card colors={colors} onPress={() => navigation.navigate('Search')}>
          <Row title="Search" hint="Find anything you saved" colors={colors} />
        </Card>
        <Card colors={colors} onPress={clear}>
          <Row title="Clear all completed" hint="Remove finished tasks, steps, goals, and checked items" colors={colors} />
        </Card>

        <Text style={{ color: colors.muted, fontWeight: '700', marginTop: 18, marginBottom: 10 }}>
          APPEARANCE
        </Text>
        <Card colors={colors}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>Theme</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['system', 'light', 'dark'].map((mode) => (
              <Pill
                key={mode}
                colors={colors}
                label={mode[0].toUpperCase() + mode.slice(1)}
                active={settings.theme === mode}
                onPress={() => setTheme(mode)}
              />
            ))}
          </View>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Light and dark are available. System follows your phone.
          </Text>
        </Card>
        <Card colors={colors}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>Calendar</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Pill
              colors={colors}
              label="Hidden"
              active={!settings.showCalendar}
              onPress={() => setShowCalendar(false)}
            />
            <Pill
              colors={colors}
              label="Show on Today"
              active={!!settings.showCalendar}
              onPress={() => setShowCalendar(true)}
            />
          </View>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Optional month view on the Today tab. Off by default.
          </Text>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

function Row({ title, hint, colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>{hint}</Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 22 }}>›</Text>
    </View>
  );
}
