import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_FILE_NAME_MAX,
  ATTACHMENT_MAX_SIZE_BYTES,
  attachmentObjectPath,
  formatFileSize,
  isValidAttachmentPath,
  sanitizeAttachmentFileName,
  validateAttachmentFile,
} from "./lesson-attachments";

const COURSE_ID = "11111111-1111-4111-8111-111111111111";
const LESSON_ID = "22222222-2222-4222-8222-222222222222";
const OBJECT_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_LESSON_ID = "44444444-4444-4444-8444-444444444444";
const HEX_OBJECT_ID = "abcdef01-2345-4678-9abc-def012345678";

describe("isValidAttachmentPath", () => {
  it("accepts a path the server generates", () => {
    const path = attachmentObjectPath(COURSE_ID, LESSON_ID, OBJECT_ID, "application/pdf");
    expect(isValidAttachmentPath(path, COURSE_ID, LESSON_ID)).toBe(true);
  });

  it("rejects a path belonging to another lesson", () => {
    const path = attachmentObjectPath(COURSE_ID, OTHER_LESSON_ID, OBJECT_ID, "application/pdf");
    expect(isValidAttachmentPath(path, COURSE_ID, LESSON_ID)).toBe(false);
  });

  it.each([
    ["traversal", `${COURSE_ID}/${LESSON_ID}/../${OTHER_LESSON_ID}/${OBJECT_ID}.pdf`],
    ["nested folder", `${COURSE_ID}/${LESSON_ID}/sub/${OBJECT_ID}.pdf`],
    ["non-uuid name", `${COURSE_ID}/${LESSON_ID}/report.pdf`],
    ["unknown extension", `${COURSE_ID}/${LESSON_ID}/${OBJECT_ID}.exe`],
    ["double extension", `${COURSE_ID}/${LESSON_ID}/${OBJECT_ID}.pdf.exe`],
    ["missing extension", `${COURSE_ID}/${LESSON_ID}/${OBJECT_ID}`],
    ["uppercase uuid", `${COURSE_ID}/${LESSON_ID}/${HEX_OBJECT_ID.toUpperCase()}.pdf`],
  ])("rejects %s", (_label, path) => {
    expect(isValidAttachmentPath(path, COURSE_ID, LESSON_ID)).toBe(false);
  });
});

describe("sanitizeAttachmentFileName", () => {
  it("replaces path separators", () => {
    expect(sanitizeAttachmentFileName("../../etc\\passwd")).toBe(".._.._etc_passwd");
  });

  it("removes control characters", () => {
    expect(sanitizeAttachmentFileName("na\u0000me\n.pdf")).toBe("name.pdf");
  });

  it("caps the length", () => {
    const long = "a".repeat(ATTACHMENT_FILE_NAME_MAX + 50);
    expect(sanitizeAttachmentFileName(long)).toHaveLength(ATTACHMENT_FILE_NAME_MAX);
  });
});

describe("validateAttachmentFile", () => {
  const valid = { name: "notes.pdf", type: "application/pdf", size: 1024 };

  it("accepts a valid file", () => {
    expect(validateAttachmentFile(valid)).toBeNull();
  });

  it("rejects an unsupported MIME type", () => {
    expect(validateAttachmentFile({ ...valid, type: "application/x-msdownload" })).not.toBeNull();
  });

  it("rejects empty files", () => {
    expect(validateAttachmentFile({ ...valid, size: 0 })).not.toBeNull();
  });

  it("accepts exactly the size limit and rejects one byte over", () => {
    expect(validateAttachmentFile({ ...valid, size: ATTACHMENT_MAX_SIZE_BYTES })).toBeNull();
    expect(validateAttachmentFile({ ...valid, size: ATTACHMENT_MAX_SIZE_BYTES + 1 })).not.toBeNull();
  });

  it("rejects a name that is blank after sanitizing", () => {
    expect(validateAttachmentFile({ ...valid, name: " \u0000 " })).not.toBeNull();
  });
});

describe("formatFileSize", () => {
  it.each([
    [512, "512 B"],
    [1024, "1 KB"],
    [1536, "1.5 KB"],
    [10 * 1024 * 1024, "10 MB"],
  ])("formats %i bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
