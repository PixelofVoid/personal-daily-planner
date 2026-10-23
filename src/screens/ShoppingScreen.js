import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { uncheckedFirst, usePlanner } from '../store';
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
  Screen,
  Title,
} from '../ui';

export function ShoppingScreen({ navigation }) {
  const colors = useColors();
  const { data, addList } = usePlanner();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const save = async () => {
    if (!name.trim()) return;
    await addList(name.trim());
    setName('');
    setOpen(false);
  };

  return (
    <Screen colors={colors}>
      <Title colors={colors} subtitle="Open a list to check items off as you shop.">
        Shopping
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {data.grocery_lists.length === 0 ? (
          <Empty colors={colors} text="No shopping lists yet." />
        ) : (
          data.grocery_lists.map((list) => {
            const total = list.items.length;
            const remaining = list.items.filter((i) => !i.done).length;
            return (
              <Card
                key={list.id}
                colors={colors}
                onPress={() => navigation.navigate('ShoppingDetail', { id: list.id })}
              >
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{list.name}</Text>
                <Text style={{ color: colors.muted, marginTop: 6 }}>
                  {remaining}/{total} remaining
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
      <Fab colors={colors} onPress={() => setOpen(true)} />
      <FormModal colors={colors} visible={open} title="New shopping list" onClose={() => setOpen(false)}>
        <Field colors={colors} label="List name" value={name} onChangeText={setName} autoFocus />
        <Button colors={colors} label="Create" onPress={save} disabled={!name.trim()} />
        <Button colors={colors} kind="ghost" label="Cancel" onPress={() => setOpen(false)} />
      </FormModal>
    </Screen>
  );
}

export function ShoppingDetailScreen({ route, navigation }) {
  const colors = useColors();
  const { data, addItems, toggleItem, deleteItem, clearCheckedItems, renameList, deleteList } =
    usePlanner();
  const list = data.grocery_lists.find((l) => l.id === route.params.id);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [listName, setListName] = useState(list?.name || '');

  if (!list) {
    return (
      <Screen colors={colors}>
        <Empty colors={colors} text="List not found." />
      </Screen>
    );
  }

  const items = uncheckedFirst(list.items);

  const add = async () => {
    if (!name.trim()) return;
    await addItems(list.id, [{ name: name.trim(), quantity: qty.trim() }]);
    setName('');
    setQty('');
  };

  return (
    <Screen colors={colors}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.accent, fontWeight: '700', marginBottom: 8 }}>← Shopping</Text>
      </Pressable>
      <Title colors={colors} subtitle="Tap the box to check an item off.">
        {list.name}
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {items.length === 0 ? (
          <Empty colors={colors} text="No items yet." />
        ) : (
          items.map((item) => (
            <Card key={item.id} colors={colors}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Check colors={colors} checked={item.done} onPress={() => toggleItem(list.id, item.id)} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      textDecorationLine: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.55 : 1,
                    }}
                  >
                    {item.name}
                  </Text>
                  {item.quantity ? (
                    <Text style={{ color: colors.muted, marginTop: 2 }}>{item.quantity}</Text>
                  ) : null}
                </View>
                <DangerLink
                  colors={colors}
                  onPress={() =>
                    askConfirm('Delete item', `Delete “${item.name}”?`, () =>
                      deleteItem(list.id, item.id)
                    )
                  }
                />
              </View>
            </Card>
          ))
        )}
        <Field colors={colors} label="Item" value={name} onChangeText={setName} placeholder="Milk" />
        <Field colors={colors} label="Quantity" value={qty} onChangeText={setQty} placeholder="Optional" />
        <Button colors={colors} label="Add item" onPress={add} disabled={!name.trim()} />
        <Button
          colors={colors}
          kind="ghost"
          label="Clear checked items"
          onPress={() => {
            const n = list.items.filter((i) => i.done).length;
            if (!n) {
              notify('Nothing to clear', 'No checked items on this list.');
              return;
            }
            askConfirm(
              'Clear checked',
              `Remove ${n} checked item(s)?`,
              () => clearCheckedItems(list.id),
              'Clear'
            );
          }}
        />
        <Button
          colors={colors}
          kind="ghost"
          label={renaming ? 'Close rename' : 'Rename list'}
          onPress={() => setRenaming(!renaming)}
        />
        {renaming ? (
          <View>
            <Field colors={colors} label="New name" value={listName} onChangeText={setListName} />
            <Button
              colors={colors}
              label="Save name"
              onPress={() => renameList(list.id, listName.trim() || list.name)}
            />
          </View>
        ) : null}
        <Button
          colors={colors}
          kind="danger"
          label="Delete list"
          onPress={() => {
            askConfirm('Delete list', `Delete “${list.name}”?`, async () => {
              await deleteList(list.id);
              navigation.goBack();
            });
          }}
        />
      </ScrollView>
    </Screen>
  );
}
