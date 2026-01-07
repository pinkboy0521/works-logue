"use client";

import { PartialBlock } from "@blocknote/core";
import Image from "next/image";
import { useState } from "react";

// BlockNoteコンテンツ用型定義
interface TextContent {
  type: string;
  text: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
}

interface TableCell {
  content: TextContent[];
}

interface TableRow {
  cells: TableCell[];
}

interface BlockNoteRendererProps {
  blocks: PartialBlock[];
  className?: string;
}

// トグルリスト用のコンポーネント
function ToggleListItem({
  content,
  childBlocks,
  blockId,
}: {
  content: string;
  childBlocks?: PartialBlock[];
  blockId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-muted-foreground text-sm select-none">
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="text-foreground">{content}</span>
      </div>
      {isOpen && childBlocks && childBlocks.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {childBlocks.map((childBlock, index) => (
            <BlockRenderer
              key={childBlock.id || `${blockId}-child-${index}`}
              block={childBlock}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 個別ブロックレンダラー
function BlockRenderer({
  block,
  index,
}: {
  block: PartialBlock;
  index: number;
}) {
  const key = block.id || `block-${index}`;

  switch (block.type) {
    case "heading":
      const level = block.props?.level || 1;
      const textContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      switch (level) {
        case 1:
          return (
            <h1 key={key} className="text-2xl font-bold mb-4 text-foreground">
              {textContent}
            </h1>
          );
        case 2:
          return (
            <h2 key={key} className="text-xl font-bold mb-3 text-foreground">
              {textContent}
            </h2>
          );
        case 3:
          return (
            <h3 key={key} className="text-lg font-bold mb-2 text-foreground">
              {textContent}
            </h3>
          );
        default:
          return (
            <h4 key={key} className="text-base font-bold mb-2 text-foreground">
              {textContent}
            </h4>
          );
      }

    case "paragraph":
      const paragraphContent = (block.content as TextContent[])?.map(
        (content, i: number) => (
          <span
            key={i}
            className={
              content.styles?.bold
                ? "font-bold"
                : content.styles?.italic
                  ? "italic"
                  : ""
            }
          >
            {content.text || ""}
          </span>
        ),
      );

      return (
        <p key={key} className="mb-4 text-muted-foreground leading-relaxed">
          {paragraphContent}
        </p>
      );

    case "bulletListItem":
      const listContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      return (
        <li key={key} className="text-muted-foreground mb-1">
          {listContent}
        </li>
      );

    case "numberedListItem":
      const numberedContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      return (
        <li key={key} className="text-muted-foreground mb-1">
          {numberedContent}
        </li>
      );

    case "checkListItem":
      const checkContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";
      const isChecked = block.props?.checked || false;

      return (
        <li
          key={key}
          className="flex items-center gap-2 text-muted-foreground mb-1"
        >
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="rounded border-muted-foreground"
          />
          <span className={isChecked ? "line-through" : ""}>
            {checkContent}
          </span>
        </li>
      );

    case "toggleListItem":
      const toggleContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      return (
        <ToggleListItem
          key={key}
          content={toggleContent}
          childBlocks={block.children}
          blockId={key}
        />
      );

    case "codeBlock":
      const codeContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      return (
        <pre
          key={key}
          className="mb-4 p-4 bg-muted text-muted-foreground rounded-lg overflow-x-auto"
        >
          <code>{codeContent}</code>
        </pre>
      );

    case "image":
      const imageUrl = block.props?.url;
      return imageUrl ? (
        <div key={key} className="mb-4">
          <Image
            src={imageUrl}
            alt={block.props?.caption || ""}
            width={800}
            height={400}
            className="max-w-full h-auto rounded-lg"
          />
          {block.props?.caption && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              {block.props.caption}
            </p>
          )}
        </div>
      ) : null;

    case "quote":
      const quoteContent =
        (block.content as TextContent[])
          ?.map((content) => content.text || "")
          .join("") || "";

      return (
        <blockquote
          key={key}
          className="mb-4 pl-4 border-l-4 border-primary bg-muted/20 py-3 italic text-foreground"
        >
          {quoteContent}
        </blockquote>
      );

    case "table":
      if (
        block.content &&
        block.content.rows &&
        Array.isArray(block.content.rows)
      ) {
        return (
          <div key={key} className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border">
              <tbody>
                {(block.content as { rows: TableRow[] }).rows.map(
                  (row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.cells &&
                        row.cells.map((cell, cellIndex) => {
                          const cellContent =
                            cell.content
                              ?.map((content) => content.text || "")
                              .join("") || "";
                          return (
                            <td
                              key={`cell-${rowIndex}-${cellIndex}`}
                              className="border border-border px-3 py-2 text-foreground"
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        );
      }
      return null;

    case "divider":
      return <hr key={key} className="mb-4 border-t border-border" />;

    default:
      return (
        <div
          key={key}
          className="mb-2 p-2 bg-muted/20 rounded text-sm text-muted-foreground"
        >
          未対応のブロック: {block.type}
        </div>
      );
  }
}

export function BlockNoteRenderer({
  blocks,
  className = "",
}: BlockNoteRendererProps) {
  const renderListItems = (items: PartialBlock[], listType: "ul" | "ol") => {
    const ListComponent = listType === "ul" ? "ul" : "ol";
    return (
      <ListComponent className="list-disc list-inside space-y-1 mb-4">
        {items.map((item, index) => (
          <BlockRenderer
            key={item.id || `${listType}-${index}`}
            block={item}
            index={index}
          />
        ))}
      </ListComponent>
    );
  };

  const groupedBlocks = blocks.reduce(
    (acc, block, index) => {
      if (block.type === "bulletListItem") {
        if (!acc.currentBulletList) {
          acc.currentBulletList = [];
        }
        acc.currentBulletList.push(block);
      } else {
        if (acc.currentBulletList) {
          acc.result.push({
            type: "bulletList",
            items: acc.currentBulletList,
            key: `bullet-group-${acc.result.length}`,
          });
          acc.currentBulletList = null;
        }

        if (block.type === "numberedListItem") {
          if (!acc.currentNumberedList) {
            acc.currentNumberedList = [];
          }
          acc.currentNumberedList.push(block);
        } else {
          if (acc.currentNumberedList) {
            acc.result.push({
              type: "numberedList",
              items: acc.currentNumberedList,
              key: `numbered-group-${acc.result.length}`,
            });
            acc.currentNumberedList = null;
          }

          if (block.type === "checkListItem") {
            if (!acc.currentCheckList) {
              acc.currentCheckList = [];
            }
            acc.currentCheckList.push(block);
          } else {
            if (acc.currentCheckList) {
              acc.result.push({
                type: "checkList",
                items: acc.currentCheckList,
                key: `check-group-${acc.result.length}`,
              });
              acc.currentCheckList = null;
            }
            acc.result.push({ type: "block", block, index });
          }
        }
      }
      return acc;
    },
    {
      result: [] as Array<
        | { type: "block"; block: PartialBlock; index: number }
        | {
            type: "bulletList" | "numberedList" | "checkList";
            items: PartialBlock[];
            key: string;
          }
      >,
      currentBulletList: null as PartialBlock[] | null,
      currentNumberedList: null as PartialBlock[] | null,
      currentCheckList: null as PartialBlock[] | null,
    },
  );

  // 残りのリストがある場合の処理
  if (groupedBlocks.currentBulletList) {
    groupedBlocks.result.push({
      type: "bulletList",
      items: groupedBlocks.currentBulletList,
      key: `bullet-group-${groupedBlocks.result.length}`,
    });
  }
  if (groupedBlocks.currentNumberedList) {
    groupedBlocks.result.push({
      type: "numberedList",
      items: groupedBlocks.currentNumberedList,
      key: `numbered-group-${groupedBlocks.result.length}`,
    });
  }
  if (groupedBlocks.currentCheckList) {
    groupedBlocks.result.push({
      type: "checkList",
      items: groupedBlocks.currentCheckList,
      key: `check-group-${groupedBlocks.result.length}`,
    });
  }

  return (
    <div className={className}>
      {groupedBlocks.result.map((item) => {
        if (item.type === "block") {
          return (
            <BlockRenderer
              key={item.block.id || `block-${item.index}`}
              block={item.block}
              index={item.index}
            />
          );
        } else if (item.type === "bulletList") {
          return <div key={item.key}>{renderListItems(item.items, "ul")}</div>;
        } else if (item.type === "numberedList") {
          return <div key={item.key}>{renderListItems(item.items, "ol")}</div>;
        } else if (item.type === "checkList") {
          return (
            <div key={item.key} className="space-y-1 mb-4">
              {item.items.map((checkItem, index) => (
                <BlockRenderer
                  key={checkItem.id || `check-${index}`}
                  block={checkItem}
                  index={index}
                />
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
