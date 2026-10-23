import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeUuid, tagUuids } from './merge';

const DATA_KEY = 'planner-data-v1';
const SETTINGS_KEY = 'planner-settings-v1';

export function emptyData() {
  return {
    notes: [],
    plans: [],
    tasks: [],
    goals: [],
    grocery_lists: [],
  };
}

export function normalizeData(raw) {
  const base = emptyData();
  const parsed = raw && typeof raw === 'object' ? raw : {};
  for (const key of Object.keys(base)) {
    base[key] = Array.isArray(parsed[key]) ? parsed[key] : [];
  }
  return tagUuids(base);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export function nowStamp(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localISO(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateInput(raw) {
  const text = String(raw || '').trim().toLowerCase();
  if (!text) return '';
  if (text === 'today') return localISO();
  if (text === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localISO(d);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [y, m, day] = text.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== day) return null;
  return text;
}

export function nextId(items) {
  const list = Array.isArray(items) ? items : [];
  return Math.max(0, ...list.map((item) => item.id || 0)) + 1;
}

export function uncheckedFirst(items) {
  return [
    ...items.filter((item) => !item.done),
    ...items.filter((item) => item.done),
  ];
}

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [data, setData] = useState(emptyData());
  const [settings, setSettings] = useState({
    theme: 'system',
    hideDoneTasks: false,
    showCalendar: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DATA_KEY);
        if (raw) {
          setData(normalizeData(JSON.parse(raw)));
        }
        const sraw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (sraw) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(sraw) }));
        }
      } catch {
        // Keep empty defaults if storage is unreadable.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(next));
  }, []);

  const persistSettings = useCallback(async (next) => {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const patch = useCallback(
    async (updater) => {
      const next = typeof updater === 'function' ? updater(data) : updater;
      await persist(next);
    },
    [data, persist]
  );

  const api = useMemo(() => {
    const addNote = (title, body) =>
      patch((d) => ({
        ...d,
        notes: [
          ...d.notes,
          {
            id: nextId(d.notes),
            uuid: makeUuid(),
            title,
            body,
            created: nowStamp(),
            updated: nowStamp(),
          },
        ],
      }));

    const updateNote = (id, fields) =>
      patch((d) => ({
        ...d,
        notes: d.notes.map((n) =>
          n.id === id ? { ...n, ...fields, updated: nowStamp() } : n
        ),
      }));

    const deleteNote = (id) =>
      patch((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));

    const addTask = (title, due) =>
      patch((d) => ({
        ...d,
        tasks: [
          ...d.tasks,
          {
            id: nextId(d.tasks),
            uuid: makeUuid(),
            title,
            due: due || '',
            done: false,
            created: nowStamp(),
            updated: nowStamp(),
          },
        ],
      }));

    const toggleTask = (id) =>
      patch((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done, updated: nowStamp() } : t
        ),
      }));

    const updateTask = (id, fields) =>
      patch((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id ? { ...t, ...fields, updated: nowStamp() } : t
        ),
      }));

    const deleteTask = (id) =>
      patch((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));

    const addPlan = (title, description) =>
      patch((d) => ({
        ...d,
        plans: [
          ...d.plans,
          {
            id: nextId(d.plans),
            uuid: makeUuid(),
            title,
            description: description || '',
            created: nowStamp(),
            updated: nowStamp(),
            steps: [],
          },
        ],
      }));

    const updatePlan = (id, fields) =>
      patch((d) => ({
        ...d,
        plans: d.plans.map((p) => (p.id === id ? { ...p, ...fields } : p)),
      }));

    const deletePlan = (id) =>
      patch((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== id) }));

    const addStep = (planId, text) =>
      patch((d) => ({
        ...d,
        plans: d.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                steps: [
                  ...p.steps,
                  { id: nextId(p.steps), uuid: makeUuid(), text, done: false, updated: nowStamp() },
                ],
                updated: nowStamp(),
              }
            : p
        ),
      }));

    const toggleStep = (planId, stepId) =>
      patch((d) => ({
        ...d,
        plans: d.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === stepId ? { ...s, done: !s.done, updated: nowStamp() } : s
                ),
              }
            : p
        ),
      }));

    const deleteStep = (planId, stepId) =>
      patch((d) => ({
        ...d,
        plans: d.plans.map((p) =>
          p.id === planId
            ? { ...p, steps: p.steps.filter((s) => s.id !== stepId) }
            : p
        ),
      }));

    const addGoal = (title, description, target_date, status = 'not started') =>
      patch((d) => ({
        ...d,
        goals: [
          ...d.goals,
          {
            id: nextId(d.goals),
            uuid: makeUuid(),
            title,
            description: description || '',
            status: status || 'not started',
            target_date: target_date || '',
            created: nowStamp(),
            updated: nowStamp(),
          },
        ],
      }));

    const updateGoal = (id, fields) =>
      patch((d) => ({
        ...d,
        goals: d.goals.map((g) =>
          g.id === id ? { ...g, ...fields, updated: nowStamp() } : g
        ),
      }));

    const deleteGoal = (id) =>
      patch((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));

    const addList = (name) =>
      patch((d) => ({
        ...d,
        grocery_lists: [
          ...d.grocery_lists,
          {
            id: nextId(d.grocery_lists),
            uuid: makeUuid(),
            name,
            created: nowStamp(),
            updated: nowStamp(),
            items: [],
          },
        ],
      }));

    const renameList = (id, name) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.map((l) => (l.id === id ? { ...l, name } : l)),
      }));

    const deleteList = (id) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.filter((l) => l.id !== id),
      }));

    const addItems = (listId, entries) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.map((l) => {
          if (l.id !== listId) return l;
          let items = [...l.items];
          entries.forEach(({ name, quantity }) => {
            items.push({
              id: nextId(items),
              uuid: makeUuid(),
              name,
              quantity: quantity || '',
              done: false,
              updated: nowStamp(),
            });
          });
          return { ...l, items };
        }),
      }));

    const toggleItem = (listId, itemId) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((i) =>
                  i.id === itemId ? { ...i, done: !i.done, updated: nowStamp() } : i
                ),
              }
            : l
        ),
      }));

    const deleteItem = (listId, itemId) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
            : l
        ),
      }));

    const clearCheckedItems = (listId) =>
      patch((d) => ({
        ...d,
        grocery_lists: d.grocery_lists.map((l) =>
          l.id === listId ? { ...l, items: l.items.filter((i) => !i.done) } : l
        ),
      }));

    const clearAllCompleted = () =>
      patch((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => !t.done),
        goals: d.goals.filter((g) => g.status !== 'done'),
        plans: d.plans.map((p) => ({
          ...p,
          steps: p.steps.filter((s) => !s.done),
        })),
        grocery_lists: d.grocery_lists.map((l) => ({
          ...l,
          items: l.items.filter((i) => !i.done),
        })),
      }));

    const countCompleted = () => {
      const tasks = data.tasks.filter((t) => t.done).length;
      const goals = data.goals.filter((g) => g.status === 'done').length;
      const steps = data.plans.reduce(
        (n, p) => n + p.steps.filter((s) => s.done).length,
        0
      );
      const items = data.grocery_lists.reduce(
        (n, l) => n + l.items.filter((i) => i.done).length,
        0
      );
      return { tasks, goals, steps, items, total: tasks + goals + steps + items };
    };

    const search = (query) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return [];
      const hits = [];
      data.notes.forEach((n) => {
        if (`${n.title} ${n.body}`.toLowerCase().includes(needle)) {
          hits.push({ kind: 'Notes', id: n.id, title: n.title, route: 'NoteEdit', params: { id: n.id } });
        }
      });
      data.tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(needle)) {
          hits.push({ kind: 'Tasks', id: t.id, title: t.title, route: 'Tasks' });
        }
      });
      data.plans.forEach((p) => {
        const blob = `${p.title} ${p.steps.map((s) => s.text).join(' ')}`.toLowerCase();
        if (blob.includes(needle)) {
          hits.push({ kind: 'Plans', id: p.id, title: p.title, route: 'PlanDetail', params: { id: p.id } });
        }
      });
      data.goals.forEach((g) => {
        if (`${g.title} ${g.description}`.toLowerCase().includes(needle)) {
          hits.push({ kind: 'Goals', id: g.id, title: g.title, route: 'Goals' });
        }
      });
      data.grocery_lists.forEach((l) => {
        if (l.name.toLowerCase().includes(needle)) {
          hits.push({
            kind: 'Shopping list',
            id: l.id,
            title: l.name,
            route: 'ShoppingDetail',
            params: { id: l.id },
          });
        }
      });
      return hits;
    };

    return {
      addNote,
      updateNote,
      deleteNote,
      addTask,
      toggleTask,
      updateTask,
      deleteTask,
      addPlan,
      updatePlan,
      deletePlan,
      addStep,
      toggleStep,
      deleteStep,
      addGoal,
      updateGoal,
      deleteGoal,
      addList,
      renameList,
      deleteList,
      addItems,
      toggleItem,
      deleteItem,
      clearCheckedItems,
      clearAllCompleted,
      countCompleted,
      search,
    };
  }, [data, patch]);

  const visibleTasks = useMemo(() => {
    const tasks = uncheckedFirst(data.tasks);
    return settings.hideDoneTasks ? tasks.filter((t) => !t.done) : tasks;
  }, [data.tasks, settings.hideDoneTasks]);

  const value = {
    ready,
    data,
    settings,
    setTheme: (theme) => persistSettings({ ...settings, theme }),
    setHideDoneTasks: (hideDoneTasks) => persistSettings({ ...settings, hideDoneTasks }),
    setShowCalendar: (showCalendar) => persistSettings({ ...settings, showCalendar }),
    visibleTasks,
    ...api,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider');
  return ctx;
}
