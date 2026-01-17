import { type CustomPartialBlock } from "@/entities";

// UI設計に必要な情報だけを抽出した ViewModel
export type ArticleNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "numberedList"; items: string[] }
  | { type: "checkList"; items: { text: string; checked: boolean }[] }
  | { type: "toggle"; title: string; children: ArticleNode[]; open?: boolean }
  | { type: "code"; code: string; language?: string }
  | { type: "image"; url: string; caption?: string; alt?: string }
  | { type: "quote"; text: string }
  | { type: "divider" }
  | { type: "table"; rows: { cells: string[] }[] };

/**
 * BlockNote の inline content から純粋なテキストを抽出
 * ここだけが「unsafe」領域 - BlockNote内部構造に依存
 */
function extractText(block: CustomPartialBlock): string {
  if (!Array.isArray(block.content)) return "";
  return block.content
    .map((c: unknown) => {
      if (typeof c === "object" && c !== null && "text" in c) {
        return (c as { text?: string }).text || "";
      }
      return "";
    })
    .join("");
}

/**
 * CustomPartialBlock を ArticleNode に変換
 * BlockNote 依存を1箇所に隔離
 */
function blockToNode(block: CustomPartialBlock): ArticleNode | null {
  switch (block.type) {
    case "heading":
      const level = Math.min(
        Math.max((block.props?.level as number) || 1, 1),
        3,
      ) as 1 | 2 | 3;
      return {
        type: "heading",
        level,
        text: extractText(block),
      };

    case "paragraph":
      const text = extractText(block);
      if (!text.trim()) return null; // 空の段落は除外
      return {
        type: "paragraph",
        text,
      };

    case "bulletListItem":
      return {
        type: "bulletList",
        items: [extractText(block)],
      };

    case "numberedListItem":
      return {
        type: "numberedList",
        items: [extractText(block)],
      };

    case "checkListItem":
      return {
        type: "checkList",
        items: [
          {
            text: extractText(block),
            checked: !!block.props?.checked,
          },
        ],
      };

    case "codeBlock":
      return {
        type: "code",
        code: extractText(block),
        language: block.props?.language as string | undefined,
      };

    case "toggleListItem":
      return {
        type: "toggle",
        title: extractText(block),
        children: [], // 今は空、必要に応じて子ブロック処理を実装
      };

    case "quote":
      return {
        type: "quote",
        text: extractText(block),
      };

    case "image":
      return {
        type: "image",
        url: (block.props?.url as string) || "",
        caption: block.props?.caption as string | undefined,
        alt: block.props?.name as string | undefined,
      };

    case "divider":
      return { type: "divider" };

    case "table":
      const tableContent = block.content as unknown;
      if (
        typeof tableContent !== "object" ||
        tableContent === null ||
        !("rows" in tableContent)
      ) {
        return null;
      }

      const tableData = tableContent as { rows?: unknown[] };
      if (!Array.isArray(tableData.rows)) return null;

      const rows = tableData.rows.map((row: unknown) => {
        if (typeof row !== "object" || row === null || !("cells" in row)) {
          return { cells: [] };
        }

        const rowData = row as { cells?: unknown[] };
        if (!Array.isArray(rowData.cells)) {
          return { cells: [] };
        }

        return {
          cells: rowData.cells.map((cell: unknown) => {
            if (
              typeof cell !== "object" ||
              cell === null ||
              !("content" in cell)
            ) {
              return "";
            }

            const cellData = cell as { content?: unknown[] };
            if (!Array.isArray(cellData.content)) {
              return "";
            }

            return cellData.content
              .map((c: unknown) => {
                if (typeof c === "object" && c !== null && "text" in c) {
                  return (c as { text?: string }).text || "";
                }
                return "";
              })
              .join("");
          }),
        };
      });

      return {
        type: "table",
        rows,
      };

    default:
      // 未対応のブロックタイプは null を返す
      return null;
  }
}

/**
 * リストアイテムをグループ化する処理
 * 連続するリストアイテムを1つのリストにまとめる
 */
function groupListItems(nodes: ArticleNode[]): ArticleNode[] {
  const result: ArticleNode[] = [];
  let currentBulletList: string[] = [];
  let currentNumberedList: string[] = [];
  let currentCheckList: { text: string; checked: boolean }[] = [];

  const flushCurrentLists = () => {
    if (currentBulletList.length > 0) {
      result.push({ type: "bulletList", items: [...currentBulletList] });
      currentBulletList = [];
    }
    if (currentNumberedList.length > 0) {
      result.push({ type: "numberedList", items: [...currentNumberedList] });
      currentNumberedList = [];
    }
    if (currentCheckList.length > 0) {
      result.push({ type: "checkList", items: [...currentCheckList] });
      currentCheckList = [];
    }
  };

  for (const node of nodes) {
    if (node.type === "bulletList") {
      // 他のリストをフラッシュしてから追加
      if (currentNumberedList.length > 0 || currentCheckList.length > 0) {
        flushCurrentLists();
      }
      currentBulletList.push(...node.items);
    } else if (node.type === "numberedList") {
      // 他のリストをフラッシュしてから追加
      if (currentBulletList.length > 0 || currentCheckList.length > 0) {
        flushCurrentLists();
      }
      currentNumberedList.push(...node.items);
    } else if (node.type === "checkList") {
      // 他のリストをフラッシュしてから追加
      if (currentBulletList.length > 0 || currentNumberedList.length > 0) {
        flushCurrentLists();
      }
      currentCheckList.push(...node.items);
    } else {
      // リストではないアイテムが来たら、現在のリストをフラッシュ
      flushCurrentLists();
      result.push(node);
    }
  }

  // 最後に残ったリストをフラッシュ
  flushCurrentLists();

  return result;
}

/**
 * CustomPartialBlock[] から ArticleNode[] への変換（エントリーポイント）
 * BlockNote依存を完全に隔離し、UI側は純粋な ArticleNode のみを扱う
 */
export function convertBlocksToNodes(
  blocks: CustomPartialBlock[],
): ArticleNode[] {
  const nodes = blocks
    .map(blockToNode)
    .filter((node): node is ArticleNode => node !== null);

  return groupListItems(nodes);
}
