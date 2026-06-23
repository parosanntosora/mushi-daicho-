import { useRef, useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { ConfirmSheet } from "../components/ui/Sheet.jsx";
import { IconCase, IconDownload, IconUpload, IconTrash, IconChevronRight, IconBeetle } from "../components/icons.jsx";

export function Settings({ onOpenCases }) {
  const { individuals, pairs, cases, exportJson, importJson, resetAll } = useData();
  const fileInputRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleExport = () => {
    exportJson();
    showToast("バックアップを書き出しました");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setPendingImport(json);
    } catch (err) {
      showToast("ファイルを読み込めませんでした");
    }
  };

  const confirmImport = () => {
    try {
      importJson(pendingImport);
      showToast("データを復元しました");
    } catch (err) {
      showToast(err.message || "復元に失敗しました");
    }
    setPendingImport(null);
  };

  return (
    <div className="screen">
      <Header title="設定" />
      <div className="scroll-area">
        <p className="section-title">ケース</p>
        <div className="settings-group">
          <button className="settings-row" onClick={onOpenCases}>
            <span className="settings-row-icon">
              <IconCase />
            </span>
            <span className="settings-row-text">
              <span className="settings-row-title">ケースを管理</span>
              <span className="settings-row-desc">{cases.length}件のケースを登録中</span>
            </span>
            <IconChevronRight style={{ color: "var(--color-text-tertiary)" }} />
          </button>
        </div>

        <p className="section-title">データのバックアップ</p>
        <div className="settings-group">
          <button className="settings-row" onClick={handleExport}>
            <span className="settings-row-icon is-accent">
              <IconDownload />
            </span>
            <span className="settings-row-text">
              <span className="settings-row-title">JSONを書き出す</span>
              <span className="settings-row-desc">個体・ペア・ケースをまとめて保存</span>
            </span>
          </button>
          <button className="settings-row" onClick={() => fileInputRef.current?.click()}>
            <span className="settings-row-icon is-accent">
              <IconUpload />
            </span>
            <span className="settings-row-text">
              <span className="settings-row-title">JSONから復元する</span>
              <span className="settings-row-desc">書き出したファイルを読み込みます</span>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <p className="section-title">記録の状況</p>
        <div className="settings-group">
          <div className="settings-row">
            <span className="settings-row-icon">
              <IconBeetle />
            </span>
            <span className="settings-row-text">
              <span className="settings-row-title">登録数</span>
              <span className="settings-row-desc">
                個体 {individuals.length}匹 ・ ペア {pairs.length}件 ・ ケース {cases.length}件
              </span>
            </span>
          </div>
        </div>

        <p className="section-title">データの削除</p>
        <div className="settings-group">
          <button className="settings-row" onClick={() => setResetConfirmOpen(true)}>
            <span className="settings-row-icon" style={{ background: "#FBEAE6", color: "#B3402F" }}>
              <IconTrash />
            </span>
            <span className="settings-row-text">
              <span className="settings-row-title" style={{ color: "#B3402F" }}>
                すべてのデータを削除
              </span>
              <span className="settings-row-desc">この端末に保存された記録をすべて消去します</span>
            </span>
          </button>
        </div>

        <p className="about-card">
          むし台帳<br />
          データはこの端末のブラウザ内にのみ保存されます。
          機種変更の際は「JSONを書き出す」でバックアップしてください。
        </p>
      </div>

      <ConfirmSheet
        open={!!pendingImport}
        title="データを復元しますか？"
        description="現在この端末に保存されている個体・ペア・ケースの記録は、選んだファイルの内容で上書きされます。"
        confirmLabel="復元する"
        danger={false}
        onCancel={() => setPendingImport(null)}
        onConfirm={confirmImport}
      />

      <ConfirmSheet
        open={resetConfirmOpen}
        title="すべてのデータを削除しますか？"
        description="個体・ペア・ケースの記録がすべて消去されます。先にバックアップを書き出すことをおすすめします。元に戻せません。"
        confirmLabel="すべて削除する"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetAll();
          setResetConfirmOpen(false);
          showToast("すべてのデータを削除しました");
        }}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
