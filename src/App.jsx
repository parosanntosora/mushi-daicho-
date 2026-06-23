import { useState } from "react";
import { DataProvider } from "./store/DataContext.jsx";
import { TabBar } from "./components/TabBar.jsx";
import { Home } from "./screens/Home.jsx";
import { IndividualDetail } from "./screens/IndividualDetail.jsx";
import { IndividualForm } from "./screens/IndividualForm.jsx";
import { Pairs } from "./screens/Pairs.jsx";
import { PairDetail } from "./screens/PairDetail.jsx";
import { PairForm } from "./screens/PairForm.jsx";
import { FamilyTree } from "./screens/FamilyTree.jsx";
import { Settings } from "./screens/Settings.jsx";
import { CasesManager } from "./screens/CasesManager.jsx";
import { IconPlus } from "./components/icons.jsx";

// -----------------------------------------------------------------------
// ルーティング状態: { screen, params }
// screen: 'home' | 'individual_detail' | 'individual_form'
//         'pairs' | 'pair_detail' | 'pair_form'
//         'tree' | 'settings' | 'cases'
// -----------------------------------------------------------------------

function AppInner() {
  const [tab, setTab] = useState("home");
  const [stack, setStack] = useState([]); // { screen, params }[]

  const push = (screen, params = {}) => setStack((s) => [...s, { screen, params }]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const clearStack = () => setStack([]);

  const handleTabChange = (t) => {
    setTab(t);
    clearStack();
  };

  const top = stack[stack.length - 1] || null;

  // ---- ホーム・ツリー・ペア一覧から個体詳細を開く共通ハンドラ ----
  const openIndividual = (id) => push("individual_detail", { id });
  const openIndividualForm = (id) => push("individual_form", { id });

  const openPair = (id) => push("pair_detail", { id });
  const openPairForm = (id) => push("pair_form", { id });

  // ---- FABの押下処理 ----
  const handleFab = () => {
    if (tab === "pairs") {
      openPairForm(null);
    } else {
      openIndividualForm(null);
    }
  };

  const showFab = !top && (tab === "home" || tab === "pairs");

  // ---- 押されたスクリーンをレンダリング ----
  const renderTop = () => {
    if (!top) return null;
    const { screen, params } = top;

    if (screen === "individual_detail") {
      return (
        <div className="pushed-screen">
          <IndividualDetail
            individualId={params.id}
            onBack={pop}
            onEdit={(id) => push("individual_form", { id })}
            onOpenIndividual={(id) => push("individual_detail", { id })}
            onDeleted={pop}
          />
        </div>
      );
    }

    if (screen === "individual_form") {
      return (
        <div className="pushed-screen">
          <IndividualForm
            individualId={params.id || null}
            onDone={(id) => {
              pop();
              // 新規なら詳細へ
              if (!params.id) push("individual_detail", { id });
            }}
            onCancel={pop}
          />
        </div>
      );
    }

    if (screen === "pair_detail") {
      return (
        <div className="pushed-screen">
          <PairDetail
            pairId={params.id}
            onBack={pop}
            onEdit={(id) => push("pair_form", { id })}
            onOpenIndividual={openIndividual}
            onDeleted={pop}
          />
        </div>
      );
    }

    if (screen === "pair_form") {
      return (
        <div className="pushed-screen">
          <PairForm
            pairId={params.id || null}
            onDone={(id) => {
              pop();
              if (!params.id) push("pair_detail", { id });
            }}
            onCancel={pop}
          />
        </div>
      );
    }

    if (screen === "cases") {
      return (
        <CasesManager onBack={pop} />
      );
    }

    return null;
  };

  const renderTab = () => {
    if (tab === "home") return <Home onOpenIndividual={openIndividual} />;
    if (tab === "pairs") return <Pairs onOpenPair={openPair} />;
    if (tab === "tree") return <FamilyTree onOpenIndividual={(id) => { clearStack(); openIndividual(id); }} />;
    if (tab === "settings") return <Settings onOpenCases={() => push("cases")} />;
    return null;
  };

  return (
    <div className="app-shell">
      {renderTab()}
      {renderTop()}
      {showFab && (
        <button className="fab" onClick={handleFab} aria-label={tab === "pairs" ? "ペアを追加" : "個体を追加"}>
          <IconPlus />
        </button>
      )}
      {!top && <TabBar active={tab} onChange={handleTabChange} />}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
