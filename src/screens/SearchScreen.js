import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { usePlanner } from '../store';
import { useColors } from '../theme';
import { Card, Empty, Field, Screen, Title } from '../ui';

export default function SearchScreen({ navigation }) {
  const colors = useColors();
  const { search } = usePlanner();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => search(query), [query, search]);

  return (
    <Screen colors={colors}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.accent, fontWeight: '700', marginBottom: 8 }}>← More</Text>
      </Pressable>
      <Title colors={colors} subtitle="Notes, tasks, plans, goals, and shopping lists.">
        Search
      </Title>
      <Field colors={colors} value={query} onChangeText={setQuery} placeholder="Type a word" autoFocus />
      <ScrollView>
        {!query.trim() ? (
          <Empty colors={colors} text="Start typing to search." />
        ) : hits.length === 0 ? (
          <Empty colors={colors} text="No matches." />
        ) : (
          hits.map((hit) => (
            <Card
              key={`${hit.kind}-${hit.id}`}
              colors={colors}
              onPress={() => {
                const parent = navigation.getParent();
                if (hit.route === 'NoteEdit') parent?.navigate('Notes');
                else if (hit.route === 'Tasks') parent?.navigate('Tasks');
                else if (hit.route === 'Goals') navigation.navigate('Goals');
                else if (hit.route === 'ShoppingDetail') {
                  parent?.navigate('Shop', { screen: 'ShoppingDetail', params: hit.params });
                } else if (hit.params) navigation.navigate(hit.route, hit.params);
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
                {hit.kind.toUpperCase()}
              </Text>
              <Text style={{ color: colors.text, fontSize: 17, marginTop: 4 }}>
                {hit.id}. {hit.title}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
