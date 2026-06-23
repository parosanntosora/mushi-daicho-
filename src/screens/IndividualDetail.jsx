import { useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { GenerationBadge, StatusDot, SexMark, PrimaryButton, GhostButton } from "../components/ui/Bits.jsx";
import { ConfirmSheet } from "../components/ui/Sheet.jsx";
import { IconEdit, IconChevronRight } from "../components/icons.jsx";
import { individualDisplayName, sexLabel } from "../utils/constants.js";
import { formatDateJp } from "../utils/id.js";

export function IndividualDetail({ individualId, onBack, onEdit, onOpenIndividual, onDeleted }) {
  const { getIndividual, getCase, childrenOfIndividual, deleteIndividual } = useData();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ind = getIndividual(individualId);

  if (!ind) {
    return (
      <div className="screen">
        <Header title="個体詳細" onBack={onBack} />
        <div className="scroll-area">
          <p className="page-pad">この個体は削除されました。</p>
        </div>
      </div>
    );
  }

  const father = ind.fatherId ? getIndividual(ind.fatherId) : null;
  const mother = ind.motherId ? getIndividual(ind.motherId) : null;
  const caseObj = ind.caseId ? getCase(ind.caseId) : null;
  const children = childrenOfIndividual(ind.id);

  const rows = [
    ["産地", ind.locality],
    ["サイズ", ind.sizeMm ? `${ind.sizeMm} mm` : ""],
    ["色つや", ind.color],
    ["取得日", formatDateJp(ind.acquiredDate)],
    ["ケース", caseObj?.name],
    ["性別", sexLabel(ind.sex)],
  ].filter(([, v]) => v);

  return (
    <div className="screen">
      <Header
        title="個体詳細"
        onBack={onBack}
        right={
          <button className="header-icon-btn" onClick={() => onEdit(ind.id)} aria-label="編集">
            <IconEdit />
          </button>
        }
      />
      <div className="scroll-area">
        <div className="detail-hero">
          <div className="detail-hero-top">
            <div>
              <p className="detail-hero-species">{individualDisplayName(ind)}</p>
              {ind.label && <p className="detail-hero-label">{ind.species}</p>}
            </div>
          </div>
          <div className="detail-hero-badges">
            <GenerationBadge generation={ind.generation} />
            <SexMark sex={ind.sex} />
            <StatusDot status={ind.status} />
          </div>
        </div>

        {rows.length > 0 && (
          <div className="detail-grid">
            {rows.map(([label, value]) => (
              <div className="detail-kv" key={label}>
                <span className="detail-kv-label">{label}</span>
                <span className={`detail-kv-value${["サイズ"].includes(label) ? " mono" : ""}`}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-block">
          <p className="detail-block-title">親の記録</p>
          <div className="parent-link-row">
            <button
              className={`parent-link${father ? "" : " is-empty"}`}
              disabled={!father}
              onClick={() => father && onOpenIndividual(father.id)}
            >
              <p className="parent-link-role">父個体</p>
              <p className="parent-link-name">{father ? individualDisplayName(father) : "未設定"}</p>
            </button>
            <button
              className={`parent-link${mother ? "" : " is-empty"}`}
              disabled={!mother}
              onClick={() => mother && onOpenIndividual(mother.id)}
            >
              <p className="parent-link-role">母個体</p>
              <p className="parent-link-name">{mother ? individualDisplayName(mother) : "未設定"}</p>
            </button>
          </div>
        </div>

        {children.length > 0 && (
          <div className="detail-block">
            <p className="detail-block-title">子（{children.length}匹）</p>
            <div className="children-list">
              {children.map((child) => (
                <button key={child.id} className="ind-card" onClick={() => onOpenIndividual(child.id)}>
                  <div className="ind-card-main">
                    <div className="ind-card-top">
                      <span className="ind-card-species">{individualDisplayName(child)}</span>
                      <GenerationBadge generation={child.generation} />
                      <SexMark sex={child.sex} />
                    </div>
                  </div>
                  <IconChevronRight className="ind-card-chevron" />
                </button>
              ))}
            </div>
          </div>
        )}

        {ind.note && (
          <div className="detail-block">
            <p className="detail-block-title">備考メモ</p>
            <p className="detail-note">{ind.note}</p>
          </div>
        )}

        <div className="detail-actions">
          <PrimaryButton full onClick={() => onEdit(ind.id)}>
            編集する
          </PrimaryButton>
          <GhostButton danger full onClick={() => setConfirmOpen(true)}>
            削除する
          </GhostButton>
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title="この個体を削除しますか？"
        description="削除すると、この個体を親として参照している子の記録からは親情報が外れます。元に戻せません。"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteIndividual(ind.id);
          setConfirmOpen(false);
          onDeleted();
        }}
      />
    </div>
  );
}
