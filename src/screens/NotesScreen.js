import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { usePlanner } from '../store';
import { useColors } from '../theme';
import { askConfirm, Button, Card, Empty, Fab, Field, FormModal, Screen, Title } from '../ui';

export default function NotesScreen() {
  const colors = useColors();
  const { data, addNote, updateNote, deleteNote } = usePlanner();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const startAdd = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setOpen(true);
  };

  const startEdit = (note) => {
    setEditing(note);
    setTitle(note.title);
    setBody(note.body || '');
    setOpen(true);
  };

  const save = async () => {
    const name = title.trim();
    if (!name) return;
    if (editing) await updateNote(editing.id, { title: name, body: body.trim() });
    else await addNote(name, body.trim());
    setOpen(false);
  };

  return (
    <Screen colors={colors}>
      <Title colors={colors} subtitle="Tap a note to edit.">
        Notes
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {data.notes.length === 0 ? (
          <Empty colors={colors} text="No notes yet." />
        ) : (
          [...data.notes].reverse().map((note) => (
            <Card key={note.id} colors={colors} onPress={() => startEdit(note)}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{note.title}</Text>
              {note.body ? (
                <Text style={{ color: colors.muted, marginTop: 6 }} numberOfLines={3}>
                  {note.body}
                </Text>
              ) : null}
              <Text style={{ color: colors.muted, marginTop: 8, fontSize: 12 }}>{note.updated || note.created}</Text>
            </Card>
          ))
        )}
      </ScrollView>
      <Fab colors={colors} onPress={startAdd} />
      <FormModal
        colors={colors}
        visible={open}
        title={editing ? 'Edit note' : 'New note'}
        onClose={() => setOpen(false)}
      >
        <Field colors={colors} label="Title" value={title} onChangeText={setTitle} autoFocus />
        <Field colors={colors} label="Note" value={body} onChangeText={setBody} multiline />
        <Button colors={colors} label="Save" onPress={save} disabled={!title.trim()} />
        {editing ? (
          <Button
            colors={colors}
            kind="danger"
            label="Delete"
            onPress={() => {
              askConfirm('Delete note', `Delete “${editing.title}”?`, async () => {
                await deleteNote(editing.id);
                setOpen(false);
              });
            }}
          />
        ) : null}
        <Button colors={colors} kind="ghost" label="Cancel" onPress={() => setOpen(false)} />
        <View style={{ height: 12 }} />
      </FormModal>
    </Screen>
  );
}
