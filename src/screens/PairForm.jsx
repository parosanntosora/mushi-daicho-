import { useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { FieldGroup, TextField, TextAreaField, SelectField } from "../components/ui/Field.jsx";
import { PrimaryButton } from "../components/ui/Bits.jsx";
import { individualDisplayName, individualSubLabel } from "../utils/constants.js";
import { todayStr } from "../utils/id.js";

const BLANK = {
  maleId: "",
  femaleId: "",
  startDate: todayStr(),
  setupNote: "",
  resultNote: "",
};

export function PairForm({ pairId, onDone, onCancel }) {
  const { individuals, addPair, updatePair, getPair } = useData();
  const editing = pairId ? getPair(pairId) : null;
  const [form, setForm] = useState(() => (editing ? { ...BLANK, ...editing } : { ...BLANK }));

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const males = individuals.filter((i) => i.sex !== "female");
  const females = individuals.filter((i) => i.sex !== "male");

  const optionsFor = (list) =>
    list.map((p) => ({
      value: p.id,
      label: `${individualDisplayName(p)}（${individualSubLabel(p) || "詳細未設定"}）`,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      maleId: form.maleId || null,
      femaleId: form.femaleId || null,
    };
    if (editing) {
      updatePair(pairId, payload);
      onDone(pairId);
    } else {
      const newId = addPair(payload);
      onDone(newId);
    }
  };

  const canSubmit = form.maleId && form.femaleId;

  return (
    <form className="screen" onSubmit={handleSubmit}>
      <Header
        title={editing ? "ペアを編集" : "ペアを登録"}
        onBack={onCancel}
        right={
          <button type="submit" className="header-text-btn" disabled={!canSubmit}>
            保存
          </button>
        }
      />
      <div className="scroll-area">
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="オス個体" required>
              <SelectField value={form.maleId} onChange={set("maleId")} placeholder="選択してください" options={optionsFor(males)} />
            </FieldGroup>
            <FieldGroup label="メス個体" required>
              <SelectField value={form.femaleId} onChange={set("femaleId")} placeholder="選択してください" options={optionsFor(females)} />
            </FieldGroup>
            <FieldGroup label="開始日">
              <TextField value={form.startDate} onChange={set("startDate")} type="date" mono />
            </FieldGroup>
          </div>
        </div>

        <p className="section-title">記録</p>
        <div className="form-section">
          <div className="form-card">
            <FieldGroup label="セット内容メモ" hint="マットの種類・温度・容器など">
              <TextAreaField value={form.setupNote} onChange={set("setupNote")} placeholder="例）発酵マット・25℃・中ケース" />
            </FieldGroup>
            <FieldGroup label="結果メモ" hint="採れた卵・幼虫の数など">
              <TextAreaField value={form.resultNote} onChange={set("resultNote")} placeholder="例）幼虫12頭を割り出し" />
            </FieldGroup>
          </div>
        </div>

        <p className="field-hint" style={{ padding: "0 16px 8px" }}>
          生まれた子は、個体登録の際に「父個体・母個体」としてこのペアを指定してください。
        </p>

        <div className="detail-actions">
          <PrimaryButton type="submit" full disabled={!canSubmit}>
            {editing ? "保存する" : "登録する"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
