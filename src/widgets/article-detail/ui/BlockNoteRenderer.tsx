"use client";

import Image from "next/image";
import { type CustomPartialBlock } from "@/entities";
import { useState } from "react";
import {
  convertBlocksToNodes,
  type ArticleNode,
} from "../lib/articleViewModel";
import { Card, CardContent } from "@/shared";

interface BlockNoteRendererProps {
  blocks: CustomPartialBlock[];
  className?: string;
}

/**
 * メインコンポーネント
 * PartialBlock[] → ArticleNode[] → UI の流れ
 */
export function BlockNoteRenderer({
  blocks,
  className = "",
}: BlockNoteRendererProps) {
  // BlockNote依存を1回だけここで解決
  const nodes = convertBlocksToNodes(blocks);

  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      <ArticleRenderer nodes={nodes} />
    </div>
  );
}

/**
 * 純粋なUI描画コンポーネント
 * BlockNoteの知識は一切含まない
 */
function ArticleRenderer({ nodes }: { nodes: ArticleNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </>
  );
}

/**
 * トグルコンポーネント（Accordionの代替）
 */
function ToggleRenderer({
  node,
}: {
  node: Extract<ArticleNode, { type: "toggle" }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border border-border rounded-lg">
      <button
        className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-muted-foreground text-sm">
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="font-medium">{node.title}</span>
      </button>
      {isOpen && (
        <div className="p-3 pt-0 border-t border-border">
          <ArticleRenderer nodes={node.children} />
        </div>
      )}
    </div>
  );
}

/**
 * 個別ノード描画 - shadcn/Tailwind専用
 */
function NodeRenderer({ node }: { node: ArticleNode }) {
  switch (node.type) {
    case "heading":
      const HeadingTag = `h${node.level}` as "h1" | "h2" | "h3";
      const headingClass = {
        1: "text-3xl font-bold mb-6 text-foreground",
        2: "text-2xl font-bold mb-4 text-foreground",
        3: "text-xl font-bold mb-3 text-foreground",
      }[node.level];

      return <HeadingTag className={headingClass}>{node.text}</HeadingTag>;

    case "paragraph":
      return (
        <p className="mb-4 text-foreground leading-relaxed">{node.text}</p>
      );

    case "bulletList":
      return (
        <ul className="mb-4 list-disc list-inside space-y-1 text-foreground">
          {node.items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );

    case "numberedList":
      return (
        <ol className="mb-4 list-decimal list-inside space-y-1 text-foreground">
          {node.items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );

    case "checkList":
      return (
        <div className="mb-4 space-y-2">
          {node.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                disabled
                className="rounded border-border"
              />
              <span
                className={`text-foreground ${item.checked ? "line-through opacity-75" : ""}`}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      );

    case "toggle":
      return <ToggleRenderer node={node} />;

    case "code":
      return (
        <Card className="mb-4">
          <CardContent className="p-4">
            <pre className="text-sm overflow-x-auto">
              <code className="text-foreground font-mono">{node.code}</code>
            </pre>
          </CardContent>
        </Card>
      );

    case "image":
      return (
        <div className="mb-4">
          <div className="relative w-full">
            <Image
              src={node.url}
              alt={node.alt || node.caption || "画像"}
              width={800}
              height={400}
              className="rounded-lg object-cover w-full h-auto"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {node.caption && (
            <p className="text-sm text-muted-foreground mt-2 text-center italic">
              {node.caption}
            </p>
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote className="mb-4 pl-4 border-l-4 border-primary bg-muted/50 py-2 italic">
          <p className="text-foreground">{node.text}</p>
        </blockquote>
      );

    case "table":
      if (node.rows.length === 0) return null;

      return (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <tbody>
              {node.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-border px-3 py-2 text-foreground"
                    >
                      {cell || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "divider":
      return <hr className="my-6 border-border" />;

    default:
      // 未知のノードタイプは何も描画しない
      return null;
  }
}
