import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { parseDateInput, usePlanner } from '../store';
import { useColors } from '../theme';
import { askConfirm, BackLink, Button, Card, Empty, Fab, Field, FormModal, notify, Pill, Screen, Title } from '../ui';

const STATUSES = ['not started', 'in progress', 'done'];

export default function GoalsScreen({ navigation }) {
  const colors = useColors();
  const { data, addGoal, updateGoal, deleteGoal } = usePlanner();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState('not started');

  const startAdd = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setTarget('');
    setStatus('not started');
    setOpen(true);
  };

  const startEdit = (goal) => {
    setEditing(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTarget(goal.target_date || '');
    setStatus(goal.status || 'not started');
    setOpen(true);
  };

  const save = async () => {
    if (!title.trim()) return;
    const parsed = parseDateInput(target);
    if (target.trim() && parsed === null) {
      notify('Date', 'Use YYYY-MM-DD, today, or tomorrow.');
      return;
    }
    if (editing) {
      await updateGoal(editing.id, {
        title: title.trim(),
        description: description.trim(),
        target_date: parsed || editing.target_date || '',
        status,
      });
    } else {
      await addGoal(title.trim(), description.trim(), parsed || '', status);
    }
    setOpen(false);
  };

  return (
    <Screen colors={colors}>
      <BackLink colors={colors} label="More" onPress={() => navigation.goBack()} />
      <Title colors={colors} subtitle="Track bigger aims and their status.">
        Goals
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {(Array.isArray(data.goals) ? data.goals : []).length === 0 ? (
          <Empty colors={colors} text="No goals yet." />
        ) : (
          (data.goals || []).map((goal) => (
            <Card key={goal.id} colors={colors} onPress={() => startEdit(goal)}>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
                {(goal.status || 'not started').toUpperCase()}
              </Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
                {goal.title}
              </Text>
              {goal.description ? (
                <Text style={{ color: colors.muted, marginTop: 6 }}>{goal.description}</Text>
              ) : null}
              {goal.target_date ? (
                <Text style={{ color: colors.muted, marginTop: 6 }}>Target {goal.target_date}</Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
      <Fab colors={colors} onPress={startAdd} />
      <FormModal
        colors={colors}
        visible={open}
        title={editing ? 'Edit goal' : 'New goal'}
        onClose={() => setOpen(false)}
      >
        <Field colors={colors} label="Goal" value={title} onChangeText={setTitle} autoFocus />
        <Field
          colors={colors}
          label="Why it matters"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
        />
        <Field
          colors={colors}
          label="Target date"
          value={target}
          onChangeText={setTarget}
          placeholder="YYYY-MM-DD, today, or tomorrow"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {STATUSES.map((s) => (
            <Pill key={s} colors={colors} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
        <Button colors={colors} label="Save" onPress={save} disabled={!title.trim()} />
        {editing ? (
          <Button
            colors={colors}
            kind="danger"
            label="Delete"
            onPress={() => {
              askConfirm('Delete goal', `Delete “${editing.title}”?`, async () => {
                await deleteGoal(editing.id);
                setOpen(false);
              });
            }}
          />
        ) : null}
        <Button colors={colors} kind="ghost" label="Cancel" onPress={() => setOpen(false)} />
      </FormModal>
    </Screen>
  );
}
