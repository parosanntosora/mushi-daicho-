import { useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { GenerationBadge, SexMark, PrimaryButton, GhostButton } from "../components/ui/Bits.jsx";
import { ConfirmSheet } from "../components/ui/Sheet.jsx";
import { IconEdit, IconChevronRight } from "../components/icons.jsx";
import { individualDisplayName } from "../utils/constants.js";
import { formatDateJp } from "../utils/id.js";

export function PairDetail({ pairId, onBack, onEdit, onOpenIndividual, onDeleted }) {
  const { getPair, getIndividual, individuals, deletePair } = useData();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pair = getPair(pairId);

  if (!pair) {
    return (
      <div className="screen">
        <Header title="ペア詳細" onBack={onBack} />
        <div className="scroll-area">
          <p className="page-pad">このペアは削除されました。</p>
        </div>
      </div>
    );
  }

  const male = pair.maleId ? getIndividual(pair.maleId) : null;
  const female = pair.femaleId ? getIndividual(pair.femaleId) : null;
  const children = individuals.filter(
    (i) => pair.maleId && pair.femaleId && i.fatherId === pair.maleId && i.motherId === pair.femaleId
  );

  return (
    <div className="screen">
      <Header
        title="ペア詳細"
        onBack={onBack}
        right={
          <button className="header-icon-btn" onClick={() => onEdit(pair.id)} aria-label="編集">
            <IconEdit />
          </button>
        }
      />
      <div className="scroll-area">
        <div className="detail-hero">
          <div className="detail-hero-top">
            <div>
              <p className="detail-hero-species">
                {male ? individualDisplayName(male) : "未設定"} × {female ? individualDisplayName(female) : "未設定"}
              </p>
              {pair.startDate && <p className="detail-hero-label">開始日 {formatDateJp(pair.startDate)}</p>}
            </div>
          </div>
        </div>

        <div className="detail-block">
          <p className="detail-block-title">父・母個体</p>
          <div className="parent-link-row">
            <button
              className={`parent-link${male ? "" : " is-empty"}`}
              disabled={!male}
              onClick={() => male && onOpenIndividual(male.id)}
            >
              <p className="parent-link-role">オス</p>
              <p className="parent-link-name">{male ? individualDisplayName(male) : "未設定"}</p>
            </button>
            <button
              className={`parent-link${female ? "" : " is-empty"}`}
              disabled={!female}
              onClick={() => female && onOpenIndividual(female.id)}
            >
              <p className="parent-link-role">メス</p>
              <p className="parent-link-name">{female ? individualDisplayName(female) : "未設定"}</p>
            </button>
          </div>
        </div>

        {pair.setupNote && (
          <div className="detail-block">
            <p className="detail-block-title">セット内容メモ</p>
            <p className="detail-note">{pair.setupNote}</p>
          </div>
        )}

        {pair.resultNote && (
          <div className="detail-block">
            <p className="detail-block-title">結果メモ</p>
            <p className="detail-note">{pair.resultNote}</p>
          </div>
        )}

        <div className="detail-block">
          <p className="detail-block-title">このペアの子（{children.length}匹）</p>
          {children.length === 0 ? (
            <p className="detail-note" style={{ color: "var(--color-text-tertiary)" }}>
              個体登録の際に、父・母個体としてこのペアを指定すると一覧に表示されます。
            </p>
          ) : (
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
          )}
        </div>

        <div className="detail-actions">
          <PrimaryButton full onClick={() => onEdit(pair.id)}>
            編集する
          </PrimaryButton>
          <GhostButton danger full onClick={() => setConfirmOpen(true)}>
            削除する
          </GhostButton>
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title="このペア記録を削除しますか？"
        description="子の個体記録は削除されません。元に戻せません。"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deletePair(pair.id);
          setConfirmOpen(false);
          onDeleted();
        }}
      />
    </div>
  );
}
