import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useWarrantyProtection from "./useWarrantyProtection";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  closeModal: vi.fn(),
  setWarrantyDataStore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
  toast: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  firestore: { kind: "firestore" },
  state: {
    services: {
      data: [] as unknown[],
    },
  },
}));

vi.mock("@/firebaseConfig", () => ({
  FIREBASE_FIRESTORE: mocks.firestore,
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (
    selector: (state: typeof mocks.state) => unknown,
  ) => selector(mocks.state),
}));

vi.mock("@/store/slices/modalSlice", () => ({
  closeModal: (...args: unknown[]) => mocks.closeModal(...args),
}));

vi.mock("@/store/slices/servicesSlice", () => ({
  setWarrantyDataStore: (...args: unknown[]) => mocks.setWarrantyDataStore(...args),
}));

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mocks.collection(...args),
  doc: (...args: unknown[]) => mocks.doc(...args),
  setDoc: (...args: unknown[]) => mocks.setDoc(...args),
  deleteDoc: (...args: unknown[]) => mocks.deleteDoc(...args),
  getDocs: (...args: unknown[]) => mocks.getDocs(...args),
  updateDoc: (...args: unknown[]) => mocks.updateDoc(...args),
  writeBatch: (...args: unknown[]) => mocks.writeBatch(...args),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(
    (...args: unknown[]) => mocks.toast(...args),
    {
      success: (...args: unknown[]) => mocks.toastSuccess(...args),
      error: (...args: unknown[]) => mocks.toastError(...args),
    },
  ),
}));

describe("useWarrantyProtection", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.closeModal.mockReset();
    mocks.setWarrantyDataStore.mockReset();
    mocks.collection.mockReset();
    mocks.doc.mockReset();
    mocks.setDoc.mockReset();
    mocks.deleteDoc.mockReset();
    mocks.getDocs.mockReset();
    mocks.updateDoc.mockReset();
    mocks.writeBatch.mockReset();
    mocks.toast.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();

    mocks.state.services.data = [];
    mocks.closeModal.mockReturnValue({ type: "modal/close" });
    mocks.setWarrantyDataStore.mockImplementation(payload => ({
      type: "services/setWarrantyDataStore",
      payload,
    }));
    mocks.collection.mockReturnValue({ path: "services/warranty-protection/data" });
    mocks.doc.mockImplementation((...args: unknown[]) => {
      if (args.length === 1) {
        return { id: "new-warranty-id" };
      }

      return { id: String(args.at(-1)) };
    });
  });

  it("shows an error when warranty service data is missing", async () => {
    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.addWarranty({
        title: "Premium",
        price: 0.1,
        description: "Coverage",
      });
    });

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("adds a warranty item with the next order and closes the modal", async () => {
    mocks.state.services.data = [
      {
        id: "warranty-protection",
        title: "Warranty",
        type: "warranty",
        data: [
          {
            id: "warranty-1",
            title: "Base",
            price: 0.1,
            description: "Base coverage",
            order: 1,
          },
          {
            id: "warranty-2",
            title: "Plus",
            price: 0.15,
            description: "Plus coverage",
            order: 2,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.addWarranty({
        title: "Premium",
        price: 0.2,
        description: "Premium coverage",
      });
    });

    expect(mocks.setDoc).toHaveBeenCalledWith(
      { id: "new-warranty-id" },
      {
        title: "Premium",
        price: 0.2,
        description: "Premium coverage",
        order: 3,
      },
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setWarrantyDataStore",
      payload: [
        {
          id: "warranty-1",
          title: "Base",
          price: 0.1,
          description: "Base coverage",
          order: 1,
        },
        {
          id: "warranty-2",
          title: "Plus",
          price: 0.15,
          description: "Plus coverage",
          order: 2,
        },
        {
          id: "new-warranty-id",
          title: "Premium",
          price: 0.2,
          description: "Premium coverage",
          order: 3,
        },
      ],
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
    expect(mocks.toast).toHaveBeenCalledTimes(1);
  });

  it("clears all warranty items with a batch delete", async () => {
    mocks.state.services.data = [
      {
        id: "warranty-protection",
        title: "Warranty",
        type: "warranty",
        data: [
          {
            id: "warranty-1",
            title: "Base",
            price: 0.1,
            description: "Base coverage",
            order: 1,
          },
        ],
      },
    ];

    const batch = {
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };

    mocks.writeBatch.mockReturnValue(batch);
    mocks.getDocs.mockResolvedValue({
      empty: false,
      docs: [
        { ref: { id: "warranty-1" } },
        { ref: { id: "warranty-2" } },
      ],
    });

    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.clearWarrantyData();
    });

    expect(batch.delete).toHaveBeenCalledTimes(2);
    expect(batch.commit).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setWarrantyDataStore",
      payload: [],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("updates an existing warranty item and closes the modal", async () => {
    mocks.state.services.data = [
      {
        id: "warranty-protection",
        title: "Warranty",
        type: "warranty",
        data: [
          {
            id: "warranty-1",
            title: "Base",
            price: 0.1,
            description: "Base coverage",
            order: 1,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.updateWarranty("warranty-1", {
        title: "Updated",
        price: 0.2,
        description: "Updated coverage",
      });
    });

    expect(mocks.updateDoc).toHaveBeenCalledWith(
      { id: "warranty-1" },
      {
        title: "Updated",
        price: 0.2,
        description: "Updated coverage",
      },
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setWarrantyDataStore",
      payload: [
        {
          id: "warranty-1",
          title: "Updated",
          price: 0.2,
          description: "Updated coverage",
          order: 1,
        },
      ],
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
    expect(mocks.toast).toHaveBeenCalledTimes(1);
  });

  it("deletes a warranty item", async () => {
    mocks.state.services.data = [
      {
        id: "warranty-protection",
        title: "Warranty",
        type: "warranty",
        data: [
          {
            id: "warranty-1",
            title: "Base",
            price: 0.1,
            description: "Base coverage",
            order: 1,
          },
          {
            id: "warranty-2",
            title: "Plus",
            price: 0.15,
            description: "Plus coverage",
            order: 2,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.deleteWarranty("warranty-1");
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith({ id: "warranty-1" });
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setWarrantyDataStore",
      payload: [
        {
          id: "warranty-2",
          title: "Plus",
          price: 0.15,
          description: "Plus coverage",
          order: 2,
        },
      ],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("returns early when there is nothing to clear", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mocks.state.services.data = [
      {
        id: "warranty-protection",
        title: "Warranty",
        type: "warranty",
        data: [],
      },
    ];
    mocks.writeBatch.mockReturnValue({
      delete: vi.fn(),
      commit: vi.fn(),
    });
    mocks.getDocs.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const { result } = renderHook(() => useWarrantyProtection());

    await act(async () => {
      await result.current.clearWarrantyData();
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
