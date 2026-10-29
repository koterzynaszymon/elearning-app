import { describe, expect, it } from "vitest";
import {
  countLessonWords,
  isBlankLessonHtml,
  lessonPlainText,
  sanitizeLessonHtml,
} from "./sanitize-html";

describe("sanitizeLessonHtml", () => {
  it("keeps the formatting the editor produces", () => {
    const html = "<h2>Title</h2><p><strong>bold</strong> and <em>italic</em></p><ul><li>one</li></ul>";
    expect(sanitizeLessonHtml(html)).toBe(html);
  });

  it("removes script tags and their content", () => {
    const out = sanitizeLessonHtml("<p>hi</p><script>alert(1)</script>");
    expect(out).toBe("<p>hi</p>");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeLessonHtml('<p onclick="alert(1)">hi</p>');
    expect(out).toBe("<p>hi</p>");
  });

  it("drops javascript: links", () => {
    const out = sanitizeLessonHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("discards iframes, images and styles", () => {
    const out = sanitizeLessonHtml(
      '<iframe src="https://evil.test"></iframe><img src=x onerror=alert(1)><style>p{}</style><p>ok</p>',
    );
    expect(out).toBe("<p>ok</p>");
  });

  it("forces safe rel and target on links", () => {
    const out = sanitizeLessonHtml('<a href="https://example.com" target="_self">x</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain("_self");
  });
});

describe("lessonPlainText", () => {
  it("strips every tag and non-breaking space entity", () => {
    expect(lessonPlainText("<p>a&nbsp;<strong>b</strong></p>")).toBe("a b");
  });
});

describe("isBlankLessonHtml", () => {
  it("treats empty paragraphs from the editor as blank", () => {
    expect(isBlankLessonHtml("<p></p><p>&nbsp;</p>")).toBe(true);
  });

  it("is false when there is visible text", () => {
    expect(isBlankLessonHtml("<p>x</p>")).toBe(false);
  });
});

describe("countLessonWords", () => {
  it("returns 0 for empty content", () => {
    expect(countLessonWords("<p></p>")).toBe(0);
  });

  it("counts words across tags", () => {
    expect(countLessonWords("<p>one two</p><p>three</p>")).toBe(3);
  });
});
