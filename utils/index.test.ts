import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock("@/firebaseConfig", () => ({
  FIREBASE_FIRESTORE: { kind: "firestore" },
}));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mocks.doc(...args),
  getDoc: (...args: unknown[]) => mocks.getDoc(...args),
  setDoc: (...args: unknown[]) => mocks.setDoc(...args),
  deleteDoc: (...args: unknown[]) => mocks.deleteDoc(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mocks.toastError(...args),
  },
}));

import {
  checkUniqueId,
  formatPrice,
  handleError,
  renameFirestoreDocument,
  textWrapping,
} from "./index";

describe("utils", () => {
  beforeEach(() => {
    mocks.toastError.mockReset();
    mocks.doc.mockReset();
    mocks.getDoc.mockReset();
    mocks.setDoc.mockReset();
    mocks.deleteDoc.mockReset();
  });

  it("rejects empty ids", () => {
    expect(checkUniqueId("", ["existing-id"])).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it("rejects duplicate ids", () => {
    expect(checkUniqueId("existing-id", ["existing-id"])).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it("accepts unique ids", () => {
    expect(checkUniqueId("new-id", ["existing-id"])).toBe(true);
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("replaces html line breaks with paragraph spacing", () => {
    expect(textWrapping("First<br>Second<br />Third")).toBe("First\n\nSecond\n\nThird");
  });

  it("formats price values as hryvnia currency", () => {
    expect(formatPrice(1234)).toContain("₴");
  });

  it("reports formatted errors through the toast layer", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    handleError(new Error("Boom"), "Custom failure");

    expect(errorSpy).toHaveBeenCalledWith("Custom failure:", expect.any(Error));
    expect(mocks.toastError).toHaveBeenCalledWith("Custom failure: Boom");

    errorSpy.mockRestore();
  });

  it("renames a firestore document by copying data and deleting the old record", async () => {
    const oldRef = { id: "old-id" };
    const newRef = { id: "new-id" };
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mocks.doc
      .mockReturnValueOnce(oldRef)
      .mockReturnValueOnce(newRef);
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ title: "Premium" }),
    });

    await renameFirestoreDocument({
      collectionName: "services",
      oldId: "old-id",
      newId: "new-id",
    });

    expect(mocks.setDoc).toHaveBeenCalledWith(newRef, { title: "Premium" });
    expect(mocks.deleteDoc).toHaveBeenCalledWith(oldRef);
    expect(logSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });

  it("logs an error when the source firestore document does not exist", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.doc
      .mockReturnValueOnce({ id: "old-id" })
      .mockReturnValueOnce({ id: "new-id" });
    mocks.getDoc.mockResolvedValue({
      exists: () => false,
    });

    await renameFirestoreDocument({
      collectionName: "services",
      oldId: "old-id",
      newId: "new-id",
    });

    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });
});
