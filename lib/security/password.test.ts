import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("verifies the original password", async () => {
    const stored = await hashPassword("course-key-123");
    expect(await verifyPassword("course-key-123", stored)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("course-key-123");
    expect(await verifyPassword("course-key-124", stored)).toBe(false);
  });

  it("salts each hash so equal passwords differ", async () => {
    const [a, b] = await Promise.all([hashPassword("same"), hashPassword("same")]);
    expect(a).not.toBe(b);
  });

  it("never stores the plain password", async () => {
    const stored = await hashPassword("visible-secret");
    expect(stored).not.toContain("visible-secret");
  });

  it.each(["", "no-separator", ":onlykey", "salt:", "salt:abcd"])(
    "returns false for malformed stored value %j",
    async (stored) => {
      expect(await verifyPassword("anything", stored)).toBe(false);
    },
  );
});
