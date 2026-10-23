import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { uncheckedFirst, usePlanner } from '../store';
import { useColors } from '../theme';
import {
  askConfirm,
  Button,
  BackLink,
  Card,
  Check,
  DangerLink,
  Empty,
  Fab,
  Field,
  FormModal,
  Screen,
  Title,
} from '../ui';

export function PlansScreen({ navigation }) {
  const colors = useColors();
  const { data, addPlan, deletePlan } = usePlanner();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const save = async () => {
    if (!title.trim()) return;
    await addPlan(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Screen colors={colors}>
      <BackLink colors={colors} label="More" onPress={() => navigation.goBack()} />
      <Title colors={colors} subtitle="Open a plan to check off steps.">
        Plans
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {data.plans.length === 0 ? (
          <Empty colors={colors} text="No plans yet." />
        ) : (
          data.plans.map((plan) => {
            const total = plan.steps.length;
            const done = plan.steps.filter((s) => s.done).length;
            return (
              <Card key={plan.id} colors={colors} onPress={() => navigation.navigate('PlanDetail', { id: plan.id })}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{plan.title}</Text>
                <Text style={{ color: colors.muted, marginTop: 6 }}>
                  {done}/{total} steps
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
      <Fab colors={colors} onPress={() => setOpen(true)} />
      <FormModal colors={colors} visible={open} title="New plan" onClose={() => setOpen(false)}>
        <Field colors={colors} label="Title" value={title} onChangeText={setTitle} autoFocus />
        <Field
          colors={colors}
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
        />
        <Button colors={colors} label="Save" onPress={save} disabled={!title.trim()} />
        <Button colors={colors} kind="ghost" label="Cancel" onPress={() => setOpen(false)} />
      </FormModal>
    </Screen>
  );
}

export function PlanDetailScreen({ route, navigation }) {
  const colors = useColors();
  const { data, addStep, toggleStep, deleteStep, updatePlan, deletePlan } = usePlanner();
  const plan = data.plans.find((p) => p.id === route.params.id);
  const [stepText, setStepText] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(plan?.title || '');
  const [description, setDescription] = useState(plan?.description || '');

  if (!plan) {
    return (
      <Screen colors={colors}>
        <Empty colors={colors} text="Plan not found." />
      </Screen>
    );
  }

  const steps = uncheckedFirst(plan.steps);

  return (
    <Screen colors={colors}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.accent, fontWeight: '700', marginBottom: 8 }}>← Plans</Text>
      </Pressable>
      <Title colors={colors} subtitle={plan.description || 'Add steps and check them off.'}>
        {plan.title}
      </Title>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {steps.length === 0 ? (
          <Empty colors={colors} text="No steps yet." />
        ) : (
          steps.map((step) => (
            <Card key={step.id} colors={colors}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Check colors={colors} checked={step.done} onPress={() => toggleStep(plan.id, step.id)} />
                <Text
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    textDecorationLine: step.done ? 'line-through' : 'none',
                    opacity: step.done ? 0.55 : 1,
                  }}
                >
                  {step.text}
                </Text>
                <DangerLink
                  colors={colors}
                  onPress={() =>
                    askConfirm('Delete step', `Delete “${step.text}”?`, () =>
                      deleteStep(plan.id, step.id)
                    )
                  }
                />
              </View>
            </Card>
          ))
        )}
        <Field colors={colors} label="New step" value={stepText} onChangeText={setStepText} placeholder="Write a step" />
        <Button
          colors={colors}
          label="Add step"
          onPress={async () => {
            if (!stepText.trim()) return;
            await addStep(plan.id, stepText.trim());
            setStepText('');
          }}
          disabled={!stepText.trim()}
        />
        <Button colors={colors} kind="ghost" label={editing ? 'Close editor' : 'Edit plan details'} onPress={() => setEditing(!editing)} />
        {editing ? (
          <View style={{ marginTop: 8 }}>
            <Field colors={colors} label="Title" value={title} onChangeText={setTitle} />
            <Field colors={colors} label="Description" value={description} onChangeText={setDescription} />
            <Button
              colors={colors}
              label="Save details"
              onPress={() => updatePlan(plan.id, { title: title.trim() || plan.title, description })}
            />
            <Button
              colors={colors}
              kind="danger"
              label="Delete plan"
              onPress={() => {
                askConfirm('Delete plan', `Delete “${plan.title}”?`, async () => {
                  await deletePlan(plan.id);
                  navigation.goBack();
                });
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
