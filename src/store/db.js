const STORAGE_PREFIX = "mushidaicho:v1:";

const KEYS = {
  individuals: `${STORAGE_PREFIX}individuals`,
  pairs: `${STORAGE_PREFIX}pairs`,
  cases: `${STORAGE_PREFIX}cases`,
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error("データの読み込みに失敗しました", e);
    return fallback;
  }
}

export function loadAll() {
  return {
    individuals: safeParse(localStorage.getItem(KEYS.individuals), []),
    pairs: safeParse(localStorage.getItem(KEYS.pairs), []),
    cases: safeParse(localStorage.getItem(KEYS.cases), []),
  };
}

export function saveCollection(name, data) {
  try {
    localStorage.setItem(KEYS[name], JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("保存に失敗しました", e);
    return false;
  }
}

export function exportData() {
  const data = loadAll();
  return {
    app: "mushi-daicho",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export function importData(json) {
  if (!json || typeof json !== "object") {
    throw new Error("ファイルの形式が正しくありません");
  }
  const { individuals, pairs, cases } = json;
  if (!Array.isArray(individuals) || !Array.isArray(pairs) || !Array.isArray(cases)) {
    throw new Error("バックアップファイルの中身が読み取れませんでした");
  }
  saveCollection("individuals", individuals);
  saveCollection("pairs", pairs);
  saveCollection("cases", cases);
  return { individuals, pairs, cases };
}

export function clearAllData() {
  localStorage.removeItem(KEYS.individuals);
  localStorage.removeItem(KEYS.pairs);
  localStorage.removeItem(KEYS.cases);
}

export const STORAGE_KEYS = KEYS;
