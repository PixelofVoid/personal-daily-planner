export function makeUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function stampOf(item) {
  return String(item?.updated || item?.created || '');
}

function withUuid(item) {
  if (!item || typeof item !== 'object') return item;
  return { ...item, uuid: item.uuid || makeUuid() };
}

function mergeByUuid(left = [], right = [], childKey) {
  const map = new Map();
  const add = (raw) => {
    if (!raw || typeof raw !== 'object') return;
    const item = withUuid(raw);
    if (childKey && Array.isArray(item[childKey])) {
      item[childKey] = item[childKey].map(withUuid);
    }
    const prev = map.get(item.uuid);
    if (!prev) {
      map.set(item.uuid, item);
      return;
    }
    const newer = stampOf(item) >= stampOf(prev) ? item : prev;
    const older = newer === item ? prev : item;
    if (childKey) {
      newer[childKey] = mergeByUuid(older[childKey] || [], newer[childKey] || []);
    }
    map.set(item.uuid, newer);
  };
  left.forEach(add);
  right.forEach(add);
  return [...map.values()];
}

export function tagUuids(data) {
  const src = data && typeof data === 'object' ? data : {};
  return {
    notes: mergeByUuid(src.notes || [], []),
    tasks: mergeByUuid(src.tasks || [], []),
    goals: mergeByUuid(src.goals || [], []),
    plans: mergeByUuid(src.plans || [], [], 'steps'),
    grocery_lists: mergeByUuid(src.grocery_lists || [], [], 'items'),
  };
}

export function mergePlannerData(local, remote) {
  const L = tagUuids(local);
  const R = tagUuids(remote);
  return {
    notes: mergeByUuid(L.notes, R.notes),
    tasks: mergeByUuid(L.tasks, R.tasks),
    goals: mergeByUuid(L.goals, R.goals),
    plans: mergeByUuid(L.plans, R.plans, 'steps'),
    grocery_lists: mergeByUuid(L.grocery_lists, R.grocery_lists, 'items'),
  };
}

export function touch(item, stamp) {
  return { ...withUuid(item), updated: stamp };
}
