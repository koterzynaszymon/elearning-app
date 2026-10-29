import sanitizeHtml from "sanitize-html";
// It's html sanitizer that will speed up the work with rich text editor.
const ALLOWED_TAGS: readonly string[] = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
];

const ALLOWED_SCHEMES: readonly string[] = ["http", "https", "mailto"];

export function sanitizeLessonHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: [...ALLOWED_SCHEMES],
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}


/** The lesson's visible text with every tag stripped. */
export function lessonPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function isBlankLessonHtml(html: string): boolean {
  return lessonPlainText(html).length === 0;
}

export function countLessonWords(html: string): number {
  const text = lessonPlainText(html);
  return text.length === 0 ? 0 : text.split(/\s+/).length;
}
