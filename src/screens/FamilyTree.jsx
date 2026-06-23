import { useMemo } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { EmptyState } from "../components/ui/Bits.jsx";
import { GenerationBadge, SexMark } from "../components/ui/Bits.jsx";
import { IconTree } from "../components/icons.jsx";
import { buildForest } from "../utils/familyTree.js";
import { individualDisplayName } from "../utils/constants.js";

function TreeNode({ node, otherParentRole, otherParentInd, onOpen }) {
  const { individual, children } = node;
  return (
    <div className="tree-node">
      <button className="tree-person-card" onClick={() => onOpen(individual.id)}>
        <SexMark sex={individual.sex} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="tree-person-name">{individualDisplayName(individual)}</p>
          {otherParentInd && (
            <p className="tree-person-other-parent">
              {otherParentRole}: {individualDisplayName(otherParentInd)}
            </p>
          )}
        </div>
        <GenerationBadge generation={individual.generation} />
      </button>

      {children.length > 0 && (
        <div className="tree-children">
          {children.map((child) => {
            const isFatherSide = child.individual.fatherId === individual.id;
            const otherId = isFatherSide ? child.individual.motherId : child.individual.fatherId;
            const role = isFatherSide ? "母" : "父";
            return (
              <TreeNode
                key={child.individual.id}
                node={child}
                otherParentRole={otherId ? role : null}
                otherParentInd={otherId ? findById(child._all, otherId) : null}
                onOpen={onOpen}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function findById(list, id) {
  return list?.find((i) => i.id === id) || null;
}

export function FamilyTree({ onOpenIndividual }) {
  const { individuals } = useData();

  const forest = useMemo(() => {
    const built = buildForest(individuals);
    // 他方の親を解決できるよう、各ノードに全個体配列の参照を持たせる
    const attachAll = (node) => {
      node._all = individuals;
      node.children.forEach(attachAll);
    };
    built.forEach((group) => group.roots.forEach(attachAll));
    return built;
  }, [individuals]);

  const hasAny = individuals.length > 0;

  return (
    <div className="screen">
      <Header title="家系図" subtitle={hasAny ? `${forest.length}種類` : null} />
      <div className="scroll-area">
        {!hasAny ? (
          <EmptyState
            icon={<IconTree />}
            title="家系図はまだありません"
            description={"個体を登録して父・母を設定すると\nここに血統ツリーが表示されます"}
          />
        ) : (
          forest.map((group) => (
            <div className="tree-species-block" key={group.species}>
              <div className="tree-species-header">
                <span className="tree-species-name">{group.species}</span>
                <span className="tree-species-count">{group.count}匹</span>
              </div>
              <div className="tree-roots">
                {group.roots.map((root) => (
                  <TreeNode key={root.individual.id} node={root} onOpen={onOpenIndividual} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
