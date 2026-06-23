import { useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { FieldGroup, TextField, TextAreaField, SelectField, SegmentedControl, ComboField } from "../components/ui/Field.jsx";
import { PrimaryButton } from "../components/ui/Bits.jsx";
import { GENERATION_PRESETS, SEX_OPTIONS, STATUS_OPTIONS, individualDisplayName, individualSubLabel } from "../utils/constants.js";
import { todayStr } from "../utils/id.js";

const BLANK = {
  species: "",
  label: "",
  sex: "unknown",
  generation: "",
  fatherId: "",
  motherId: "",
  locality: "",
  sizeMm: "",
  color: "",
  acquiredDate: todayStr(),
  caseId: "",
  status: "alive",
  note: "",
};

export function IndividualForm({ individualId, onDone, onCancel }) {
  const { individuals, cases, speciesList, addIndividual, updateIndividual, getIndividual } = useData();
  const editing = individualId ? getIndividual(individualId) : null;
  const [form, setForm] = useState(() => (editing ? { ...BLANK, ...editing } : { ...BLANK }));

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const candidateParents = individuals.filter((i) => i.id !== individualId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.species.trim()) return;
    const payload = {
      ...form,
      species: form.species.trim(),
      label: form.label.trim(),
      sizeMm: form.sizeMm === "" ? "" : Number(form.sizeMm),
      fatherId: form.fatherId || null,
      motherId: form.motherId || null,
      caseId: form.caseId || null,
    };
    if (editing) {
      updateIndividual(individualId, payload);
      onDone(individualId);
    } else {
      const newId = addIndividual(payload);
      onDone(newId);
    }
  };

  return (
    <form className="screen" onSubmit={handleSubmit}>
      <Header
        title={editing ? "個体を編集" : "個体を登録"}
        onBack={onCancel}
        right={
          <button type="submit" className="header-text-btn" disabled={!form.species.trim()}>
            保存
          </button>
        }
      />
      <div className="scroll-area">
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="種類" required hint="クワガタ・カブトなど、自由に入力できます">
              <ComboField
                value={form.species}
                onChange={set("species")}
                options={speciesList}
                listId="species-list"
                placeholder="例）ニジイロクワガタ"
              />
            </FieldGroup>
            <FieldGroup label="ラベル / 個体ID" hint="未入力の場合は種類と世代から自動表示されます">
              <TextField value={form.label} onChange={set("label")} placeholder="例）2024-A個体" />
            </FieldGroup>
            <FieldGroup label="性別">
              <SegmentedControl value={form.sex} onChange={set("sex")} options={SEX_OPTIONS} />
            </FieldGroup>
            <FieldGroup label="世代" hint="WD（野外採取）/ F1 / F2 …">
              <ComboField value={form.generation} onChange={set("generation")} options={GENERATION_PRESETS} listId="gen-list" placeholder="例）WD" />
            </FieldGroup>
          </div>
        </div>

        <p className="section-title">親の記録</p>
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="父個体">
              <SelectField
                value={form.fatherId}
                onChange={set("fatherId")}
                placeholder="未設定"
                options={candidateParents.map((p) => ({
                  value: p.id,
                  label: `${individualDisplayName(p)}（${individualSubLabel(p) || "詳細未設定"}）`,
                }))}
              />
            </FieldGroup>
            <FieldGroup label="母個体">
              <SelectField
                value={form.motherId}
                onChange={set("motherId")}
                placeholder="未設定"
                options={candidateParents.map((p) => ({
                  value: p.id,
                  label: `${individualDisplayName(p)}（${individualSubLabel(p) || "詳細未設定"}）`,
                }))}
              />
            </FieldGroup>
          </div>
        </div>

        <p className="section-title">産地・特徴</p>
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="産地">
              <TextField value={form.locality} onChange={set("locality")} placeholder="例）西表島" />
            </FieldGroup>
            <FieldGroup label="サイズ (mm)">
              <TextField value={form.sizeMm} onChange={set("sizeMm")} type="number" inputMode="decimal" placeholder="例）72.5" mono />
            </FieldGroup>
            <FieldGroup label="色つや">
              <TextField value={form.color} onChange={set("color")} placeholder="例）赤味の強い個体" />
            </FieldGroup>
            <FieldGroup label="取得日">
              <TextField value={form.acquiredDate} onChange={set("acquiredDate")} type="date" mono />
            </FieldGroup>
          </div>
        </div>

        <p className="section-title">管理</p>
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="ケース">
              <SelectField
                value={form.caseId}
                onChange={set("caseId")}
                placeholder="未設定"
                options={cases.map((c) => ({ value: c.id, label: c.name }))}
              />
            </FieldGroup>
            <FieldGroup label="ステータス">
              <SelectField value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            </FieldGroup>
            <FieldGroup label="備考メモ">
              <TextAreaField value={form.note} onChange={set("note")} placeholder="血統メモ・気づいたことなど" />
            </FieldGroup>
          </div>
        </div>

        <div className="detail-actions">
          <PrimaryButton type="submit" full disabled={!form.species.trim()}>
            {editing ? "保存する" : "登録する"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
