// individuals（個体配列）から、種類ごとの血統フォレスト（ツリーの集まり）を構築する。
// 各個体は「父」を優先し、いなければ「母」をたどって1本の主系統に配置する。
// もう一方の親はノード上に注記として表示する想定（utils側では id を保持するのみ）。

export function buildForest(individuals) {
  const bySpecies = new Map();
  individuals.forEach((ind) => {
    const key = ind.species?.trim() || "種類未設定";
    if (!bySpecies.has(key)) bySpecies.set(key, []);
    bySpecies.get(key).push(ind);
  });

  const forest = [];

  for (const [species, list] of bySpecies.entries()) {
    const idSet = new Set(list.map((i) => i.id));
    const nodeMap = new Map(list.map((i) => [i.id, { individual: i, children: [] }]));
    const roots = [];

    list.forEach((ind) => {
      const node = nodeMap.get(ind.id);
      const hasFather = ind.fatherId && idSet.has(ind.fatherId);
      const hasMother = ind.motherId && idSet.has(ind.motherId);
      const primaryParentId = hasFather ? ind.fatherId : hasMother ? ind.motherId : null;

      if (primaryParentId) {
        nodeMap.get(primaryParentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    const genRank = (g) => {
      if (!g) return 99;
      const m = String(g).toUpperCase().match(/^F(\d+)/);
      if (m) return Number(m[1]);
      if (String(g).toUpperCase() === "WD") return 0;
      return 50;
    };

    const sortNodes = (nodes) => {
      nodes.sort((a, b) => {
        const r = genRank(a.individual.generation) - genRank(b.individual.generation);
        if (r !== 0) return r;
        return (a.individual.acquiredDate || "").localeCompare(b.individual.acquiredDate || "");
      });
      nodes.forEach((n) => sortNodes(n.children));
    };
    sortNodes(roots);

    forest.push({ species, roots, count: list.length });
  }

  forest.sort((a, b) => a.species.localeCompare(b.species, "ja"));
  return forest;
}
