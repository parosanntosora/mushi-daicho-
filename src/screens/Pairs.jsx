import { useMemo } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { EmptyState } from "../components/ui/Bits.jsx";
import { IconPair } from "../components/icons.jsx";
import { individualDisplayName } from "../utils/constants.js";
import { formatDateJp } from "../utils/id.js";

export function Pairs({ onOpenPair }) {
  const { pairs, getIndividual } = useData();

  const sorted = useMemo(
    () => pairs.slice().sort((a, b) => (b.startDate || "").localeCompare(a.startDate || "")),
    [pairs]
  );

  return (
    <div className="screen">
      <Header title="ペア記録" subtitle={`${pairs.length}件の産卵セット`} />
      <div className="scroll-area">
        {pairs.length === 0 ? (
          <EmptyState
            icon={<IconPair />}
            title="まだペアが登録されていません"
            description={"右下の + ボタンから\nオス×メスの産卵セットを記録しましょう"}
          />
        ) : (
          <div className="card-list" style={{ paddingTop: 8 }}>
            {sorted.map((pair) => {
              const male = getIndividual(pair.maleId);
              const female = getIndividual(pair.femaleId);
              return (
                <button key={pair.id} className="pair-card" onClick={() => onOpenPair(pair.id)}>
                  <div className="pair-card-names">
                    <span>{male ? individualDisplayName(male) : "未設定"}</span>
                    <span className="pair-card-x">×</span>
                    <span>{female ? individualDisplayName(female) : "未設定"}</span>
                  </div>
                  <div className="pair-card-meta">
                    {pair.startDate && <span>開始 {formatDateJp(pair.startDate)}</span>}
                  </div>
                  {pair.resultNote && <p className="pair-card-note">{pair.resultNote}</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
