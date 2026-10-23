import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { parseDateInput, usePlanner } from '../store';
import { useColors } from '../theme';
import {
  askConfirm,
  Button,
  Card,
  Check,
  DangerLink,
  Empty,
  Fab,
  Field,
  FormModal,
  notify,
  Pill,
  Screen,
  Title,
} from '../ui';

export default function TasksScreen() {
  const colors = useColors();
  const {
    visibleTasks,
    settings,
    setHideDoneTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  } = usePlanner();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const startAdd = () => {
    setEditing(null);
    setTitle('');
    setDue('');
    setOpen(true);
  };

  const startEdit = (task) => {
    setEditing(task);
    setTitle(task.title);
    setDue(task.due || '');
    setOpen(true);
  };

  const save = async () => {
    const name = title.trim();
    if (!name) return;
    const parsed = parseDateInput(due);
    if (due.trim() && parsed === null) {
      notify('Date', 'Use YYYY-MM-DD, today, or tomorrow.');
      return;
    }
    if (editing) {
      await updateTask(editing.id, { title: name, due: parsed || editing.due || '' });
    } else {
      await addTask(name, parsed || '');
    }
    setOpen(false);
  };

  return (
    <Screen colors={colors}>
      <Title colors={colors} subtitle="Tap a row to edit. Check it off when done.">
        Tasks
      </Title>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: colors.muted, flex: 1 }}>Hide completed</Text>
        <Switch
          value={settings.hideDoneTasks}
          onValueChange={setHideDoneTasks}
          trackColor={{ true: colors.accent }}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {visibleTasks.length === 0 ? (
          <Empty colors={colors} text={settings.hideDoneTasks ? 'No open tasks.' : 'No tasks yet.'} />
        ) : (
          visibleTasks.map((task) => (
            <Card key={task.id} colors={colors}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Check colors={colors} checked={task.done} onPress={() => toggleTask(task.id)} />
                <Pressable style={{ flex: 1 }} onPress={() => startEdit(task)}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 17,
                      textDecorationLine: task.done ? 'line-through' : 'none',
                      opacity: task.done ? 0.55 : 1,
                    }}
                  >
                    {task.title}
                  </Text>
                  {task.due ? (
                    <Text style={{ color: colors.muted, marginTop: 4 }}>Due {task.due}</Text>
                  ) : null}
                </Pressable>
                <DangerLink colors={colors} onPress={() => confirmDelete(task, deleteTask)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <Fab colors={colors} onPress={startAdd} />
      <FormModal
        colors={colors}
        visible={open}
        title={editing ? 'Edit task' : 'New task'}
        onClose={() => setOpen(false)}
      >
        <Field colors={colors} label="Task" value={title} onChangeText={setTitle} autoFocus />
        <Field
          colors={colors}
          label="Due date"
          value={due}
          onChangeText={setDue}
          placeholder="YYYY-MM-DD, today, or tomorrow"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <Pill colors={colors} label="Today" onPress={() => setDue('today')} active={due === 'today'} />
          <Pill
            colors={colors}
            label="Tomorrow"
            onPress={() => setDue('tomorrow')}
            active={due === 'tomorrow'}
          />
          <Pill colors={colors} label="None" onPress={() => setDue('')} active={!due} />
        </View>
        <Button colors={colors} label="Save" onPress={save} disabled={!title.trim()} />
        <Button colors={colors} kind="ghost" label="Cancel" onPress={() => setOpen(false)} />
      </FormModal>
    </Screen>
  );
}

function confirmDelete(task, deleteTask) {
  askConfirm('Delete task', `Delete “${task.title}”?`, () => deleteTask(task.id));
}
