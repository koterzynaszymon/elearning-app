import { describe, expect, it } from "vitest";
import { textToInlineNodes, textToParagraphs } from "./rich-text-editor-insert";

describe("textToParagraphs", () => {
  it("splits blank-line separated blocks into paragraphs", () => {
    const nodes = textToParagraphs("First.\n\nSecond.");
    expect(nodes).toEqual([
      { type: "paragraph", content: [{ type: "text", text: "First." }] },
      { type: "paragraph", content: [{ type: "text", text: "Second." }] },
    ]);
  });

  it("turns single newlines into hard breaks", () => {
    expect(textToInlineNodes("a\nb")).toEqual([
      { type: "text", text: "a" },
      { type: "hardBreak" },
      { type: "text", text: "b" },
    ]);
  });

  it("returns nothing for whitespace-only answers", () => {
    expect(textToParagraphs("  \n\n  ")).toEqual([]);
  });

  it("keeps HTML-looking output as literal text", () => {
    const [paragraph] = textToParagraphs('<img src=x onerror="alert(1)">');
    expect(paragraph.content).toEqual([
      { type: "text", text: '<img src=x onerror="alert(1)">' },
    ]);
  });
});
