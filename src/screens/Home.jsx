import { useMemo, useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { FilterChip, GhostButton, EmptyState } from "../components/ui/Bits.jsx";
import { GenerationBadge, StatusDot, SexMark } from "../components/ui/Bits.jsx";
import { IconSearch, IconBeetle, IconChevronRight } from "../components/icons.jsx";
import { individualDisplayName } from "../utils/constants.js";

export function Home({ onOpenIndividual }) {
  const { individuals, cases } = useData();
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");

  const speciesOptions = useMemo(() => {
    const set = new Set(individuals.map((i) => i.species?.trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [individuals]);

  const caseOptions = useMemo(() => {
    return cases.slice().sort((a, b) => (a.name || "").localeCompare(b.name || "", "ja"));
  }, [cases]);

  const filtered = useMemo(() => {
    return individuals
      .filter((ind) => (speciesFilter === "all" ? true : ind.species === speciesFilter))
      .filter((ind) => (caseFilter === "all" ? true : ind.caseId === caseFilter))
      .filter((ind) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return [ind.species, ind.label, ind.locality, ind.color, ind.note]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [individuals, speciesFilter, caseFilter, query]);

  return (
    <div className="screen">
      <Header title="むし台帳" subtitle={`${individuals.length}匹を記録中`} />
      <div className="scroll-area">
        <div className="search-bar">
          <IconSearch />
          <input
            placeholder="種類・ラベル・産地で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {speciesOptions.length > 0 && (
          <div className="chip-row">
            <FilterChip active={speciesFilter === "all"} onClick={() => setSpeciesFilter("all")}>
              すべての種類
            </FilterChip>
            {speciesOptions.map((sp) => (
              <FilterChip key={sp} active={speciesFilter === sp} onClick={() => setSpeciesFilter(sp)}>
                {sp}
              </FilterChip>
            ))}
          </div>
        )}

        {caseOptions.length > 0 && (
          <div className="chip-row">
            <FilterChip active={caseFilter === "all"} onClick={() => setCaseFilter("all")}>
              すべてのケース
            </FilterChip>
            {caseOptions.map((c) => (
              <FilterChip key={c.id} active={caseFilter === c.id} onClick={() => setCaseFilter(c.id)}>
                {c.name}
              </FilterChip>
            ))}
          </div>
        )}

        {individuals.length === 0 ? (
          <EmptyState
            icon={<IconBeetle />}
            title="まだ個体が登録されていません"
            description={"右下の + ボタンから\n最初の1匹を登録してみましょう"}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<IconSearch />} title="条件に合う個体が見つかりません" />
        ) : (
          <>
            <p className="count-line">{filtered.length}匹を表示中</p>
            <div className="card-list">
              {filtered.map((ind) => {
                const caseObj = cases.find((c) => c.id === ind.caseId);
                return (
                  <button key={ind.id} className="ind-card" onClick={() => onOpenIndividual(ind.id)}>
                    <div className="ind-card-main">
                      <div className="ind-card-top">
                        <span className="ind-card-species">{individualDisplayName(ind)}</span>
                        <GenerationBadge generation={ind.generation} />
                        <SexMark sex={ind.sex} />
                      </div>
                      <div className="ind-card-meta">
                        <StatusDot status={ind.status} />
                        {ind.locality && <span className="dot">{ind.locality}</span>}
                        {ind.sizeMm && <span className="dot mono">{ind.sizeMm}mm</span>}
                        {caseObj && <span className="dot">{caseObj.name}</span>}
                      </div>
                    </div>
                    <IconChevronRight className="ind-card-chevron" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
