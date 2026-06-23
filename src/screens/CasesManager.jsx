import { useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { FieldGroup, TextField } from "../components/ui/Field.jsx";
import { PrimaryButton, GhostButton, EmptyState } from "../components/ui/Bits.jsx";
import { ConfirmSheet } from "../components/ui/Sheet.jsx";
import { IconCase, IconTrash } from "../components/icons.jsx";
import { generateId } from "../utils/id.js";

export function CasesManager({ onBack }) {
  const { cases, individuals, addCase, updateCase, deleteCase } = useData();
  const [newName, setNewName] = useState("");
  const [newSpecies, setNewSpecies] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    addCase({ name, species: newSpecies.trim() });
    setNewName("");
    setNewSpecies("");
  };

  return (
    <div className="screen" style={{ position: "fixed", inset: 0, maxWidth: 560, margin: "0 auto", background: "var(--color-bg)", zIndex: 40, display: "flex", flexDirection: "column" }}>
      <Header title="ケースを管理" onBack={onBack} />
      <div className="scroll-area">
        <p className="section-title">新しいケースを追加</p>
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="ケース名" required>
              <TextField value={newName} onChange={setNewName} placeholder="例）発酵マット中ケース A" />
            </FieldGroup>
            <FieldGroup label="種類（任意）">
              <TextField value={newSpecies} onChange={setNewSpecies} placeholder="例）ニジイロクワガタ" />
            </FieldGroup>
          </div>
        </div>
        <div style={{ padding: "0 16px 8px" }}>
          <PrimaryButton full onClick={handleAdd} disabled={!newName.trim()}>
            追加する
          </PrimaryButton>
        </div>

        {cases.length > 0 && (
          <>
            <p className="section-title">登録済みのケース</p>
            <div className="settings-group" style={{ margin: "0 16px 16px" }}>
              {cases.map((c) => {
                const cnt = individuals.filter((i) => i.caseId === c.id).length;
                return (
                  <div className="case-row" key={c.id}>
                    <div>
                      <p className="case-row-name">{c.name}</p>
                      {c.species && <p className="case-row-species">{c.species}</p>}
                      <p className="case-row-species">{cnt}匹収容中</p>
                    </div>
                    <button
                      style={{ color: "#B3402F", padding: "6px" }}
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`${c.name}を削除`}
                    >
                      <IconTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {cases.length === 0 && (
          <EmptyState
            icon={<IconCase />}
            title="ケースがまだありません"
            description="飼育ケースを登録すると、個体の管理画面で選択できるようになります"
          />
        )}
      </div>

      <ConfirmSheet
        open={!!deleteTarget}
        title={`「${deleteTarget?.name}」を削除しますか？`}
        description="このケースを設定している個体からケース情報が外れます。個体自体は削除されません。"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteCase(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
