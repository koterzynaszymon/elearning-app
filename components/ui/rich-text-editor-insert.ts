import type { Editor, JSONContent } from "@tiptap/react";

export type EditorRange = {
  readonly from: number;
  readonly to: number;
};

/** What the author had highlighted when they asked for help. */
export type EditorSelectionSnapshot = {
  readonly text: string;
  /** `null` when nothing was highlighted (only a caret). */
  readonly range: EditorRange | null;
};

export type InsertMode = "replace" | "after" | "cursor";

export type InsertTarget =
  | { readonly mode: "replace" | "after"; readonly range: EditorRange; readonly expectedText: string }
  | { readonly mode: "cursor" };

/**
 * `applied` — inserted where requested.
 * `fallback-cursor` — the source passage changed since the question was asked,
 * so the text went in at the caret instead.
 */
export type InsertOutcome = "applied" | "fallback-cursor" | "empty";

export interface RichTextEditorHandle {
  insertText(text: string, target: InsertTarget): InsertOutcome;
}

const PARAGRAPH_SPLIT = /\n{2,}/;

export function snapshotSelection(editor: Editor): EditorSelectionSnapshot {
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, " ").trim();
  return { text, range: text.length > 0 ? { from, to } : null };
}

export function textToInlineNodes(line: string): JSONContent[] {
  const parts = line.split("\n");
  return parts.flatMap((part, index): JSONContent[] => {
    const nodes: JSONContent[] = part.length > 0 ? [{ type: "text", text: part }] : [];
    return index < parts.length - 1 ? [...nodes, { type: "hardBreak" }] : nodes;
  });
}

export function textToParagraphs(text: string): JSONContent[] {
  return text
    .trim()
    .split(PARAGRAPH_SPLIT)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => ({ type: "paragraph", content: textToInlineNodes(block) }));
}

function isRangeStillValid(editor: Editor, range: EditorRange, expectedText: string): boolean {
  const size = editor.state.doc.content.size;
  if (range.from < 0 || range.to > size || range.from >= range.to) return false;
  return editor.state.doc.textBetween(range.from, range.to, " ").trim() === expectedText;
}

/** Position right after the top-level block that contains `pos`. */
function endOfTopLevelBlock(editor: Editor, pos: number): number {
  const resolved = editor.state.doc.resolve(pos);
  return resolved.depth === 0 ? pos : resolved.after(1);
}

function replaceRange(editor: Editor, range: EditorRange, paragraphs: JSONContent[]): void {
  // A one-paragraph answer stays inline so it doesn't split the sentence's block.
  const content = paragraphs.length === 1 ? (paragraphs[0].content ?? []) : paragraphs;
  editor.chain().focus().insertContentAt(range, content).run();
}

function insertAfterBlock(editor: Editor, range: EditorRange, paragraphs: JSONContent[]): void {
  const pos = endOfTopLevelBlock(editor, range.to);
  editor.chain().focus().insertContentAt(pos, paragraphs).run();
}

function insertAtCursor(editor: Editor, paragraphs: JSONContent[]): void {
  editor.chain().focus().insertContent(paragraphs).run();
}

export function insertTextIntoEditor(
  editor: Editor,
  text: string,
  target: InsertTarget,
): InsertOutcome {
  const paragraphs = textToParagraphs(text);
  if (paragraphs.length === 0) return "empty";

  if (target.mode === "cursor") {
    insertAtCursor(editor, paragraphs);
    return "applied";
  }

  if (!isRangeStillValid(editor, target.range, target.expectedText)) {
    insertAtCursor(editor, paragraphs);
    return "fallback-cursor";
  }

  if (target.mode === "replace") {
    replaceRange(editor, target.range, paragraphs);
  } else {
    insertAfterBlock(editor, target.range, paragraphs);
  }
  return "applied";
}
