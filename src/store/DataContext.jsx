import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { loadAll, saveCollection, exportData, importData, clearAllData } from "./db.js";
import { generateId } from "../utils/id.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [individuals, setIndividuals] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [cases, setCases] = useState([]);
  const [ready, setReady] = useState(false);

  // 初回読み込み
  useEffect(() => {
    const data = loadAll();
    setIndividuals(data.individuals);
    setPairs(data.pairs);
    setCases(data.cases);
    setReady(true);
  }, []);

  // 変更のたびに永続化
  useEffect(() => {
    if (ready) saveCollection("individuals", individuals);
  }, [individuals, ready]);

  useEffect(() => {
    if (ready) saveCollection("pairs", pairs);
  }, [pairs, ready]);

  useEffect(() => {
    if (ready) saveCollection("cases", cases);
  }, [cases, ready]);

  // ---------- Individuals ----------
  const addIndividual = useCallback((data) => {
    const id = generateId("ind");
    const now = new Date().toISOString();
    setIndividuals((prev) => [
      ...prev,
      { id, createdAt: now, updatedAt: now, photo: null, ...data },
    ]);
    return id;
  }, []);

  const updateIndividual = useCallback((id, patch) => {
    setIndividuals((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
      )
    );
  }, []);

  const deleteIndividual = useCallback((id) => {
    setIndividuals((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const getIndividual = useCallback(
    (id) => individuals.find((it) => it.id === id) || null,
    [individuals]
  );

  // ---------- Pairs ----------
  const addPair = useCallback((data) => {
    const id = generateId("pair");
    const now = new Date().toISOString();
    setPairs((prev) => [...prev, { id, createdAt: now, updatedAt: now, ...data }]);
    return id;
  }, []);

  const updatePair = useCallback((id, patch) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deletePair = useCallback((id) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPair = useCallback((id) => pairs.find((p) => p.id === id) || null, [pairs]);

  // ---------- Cases ----------
  const addCase = useCallback((data) => {
    const id = generateId("case");
    const now = new Date().toISOString();
    setCases((prev) => [...prev, { id, createdAt: now, ...data }]);
    return id;
  }, []);

  const updateCase = useCallback((id, patch) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCase = useCallback((id) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCase = useCallback((id) => cases.find((c) => c.id === id) || null, [cases]);

  // ---------- Derived ----------
  const speciesList = useMemo(() => {
    const set = new Set();
    individuals.forEach((it) => it.species && set.add(it.species));
    cases.forEach((c) => c.species && set.add(c.species));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [individuals, cases]);

  const childrenOfIndividual = useCallback(
    (id) => individuals.filter((it) => it.fatherId === id || it.motherId === id),
    [individuals]
  );

  // ---------- Import / Export ----------
  const exportJson = useCallback(() => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `mushi-daicho-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importJson = useCallback((jsonObj) => {
    const result = importData(jsonObj);
    setIndividuals(result.individuals);
    setPairs(result.pairs);
    setCases(result.cases);
  }, []);

  const resetAll = useCallback(() => {
    clearAllData();
    setIndividuals([]);
    setPairs([]);
    setCases([]);
  }, []);

  const value = {
    ready,
    individuals,
    pairs,
    cases,
    speciesList,
    addIndividual,
    updateIndividual,
    deleteIndividual,
    getIndividual,
    addPair,
    updatePair,
    deletePair,
    getPair,
    addCase,
    updateCase,
    deleteCase,
    getCase,
    childrenOfIndividual,
    exportJson,
    importJson,
    resetAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData は DataProvider の内側で使ってください");
  return ctx;
}
