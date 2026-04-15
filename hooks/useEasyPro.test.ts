import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEasyPro from "./useEasyPro";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  setEasyproPricelist: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  writeBatch: vi.fn(),
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

vi.mock("@/store/slices/servicesSlice", () => ({
  setEasyproPricelist: (...args: unknown[]) => mocks.setEasyproPricelist(...args),
}));

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mocks.collection(...args),
  getDocs: (...args: unknown[]) => mocks.getDocs(...args),
  doc: (...args: unknown[]) => mocks.doc(...args),
  writeBatch: (...args: unknown[]) => mocks.writeBatch(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mocks.toastSuccess(...args),
    error: (...args: unknown[]) => mocks.toastError(...args),
  },
}));

describe("useEasyPro", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.setEasyproPricelist.mockReset();
    mocks.collection.mockReset();
    mocks.getDocs.mockReset();
    mocks.doc.mockReset();
    mocks.writeBatch.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();

    mocks.state.services.data = [];
    mocks.collection.mockReturnValue({ path: "services/easy-pro/pricelist" });
    mocks.doc.mockImplementation((_collectionRef, model) => ({ id: String(model) }));
    mocks.setEasyproPricelist.mockImplementation(payload => ({
      type: "services/setEasyproPricelist",
      payload,
    }));
  });

  it("shows an error and stops when easy pro data is missing from the store", async () => {
    const { result } = renderHook(() => useEasyPro());

    await act(async () => {
      await result.current.updateEasyproPricelist([
        {
          model: "Galaxy A55",
          easypro: 299,
        },
      ]);
    });

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.getDocs).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("persists pricelist updates in multiple batch chunks", async () => {
    mocks.state.services.data = [
      {
        id: "easy-pro",
        title: "Easy Pro",
        type: "easypro",
        data: {
          description: [],
          pricelist: [],
        },
      },
    ];

    const batchOne = {
      delete: vi.fn(),
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    const batchTwo = {
      delete: vi.fn(),
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };

    mocks.writeBatch
      .mockReturnValueOnce(batchOne)
      .mockReturnValueOnce(batchTwo);
    mocks.getDocs.mockResolvedValue({
      docs: [
        {
          id: "obsolete-model",
          ref: { id: "obsolete-model" },
        },
      ],
    });

    const pricelist = Array.from({ length: 451 }, (_, index) => ({
      model: `model-${index + 1}`,
      easypro: index,
    }));

    const { result } = renderHook(() => useEasyPro());

    await act(async () => {
      await result.current.updateEasyproPricelist(pricelist);
    });

    expect(mocks.writeBatch).toHaveBeenCalledTimes(2);
    expect(batchOne.delete).toHaveBeenCalledTimes(1);
    expect(batchOne.commit).toHaveBeenCalledTimes(1);
    expect(batchTwo.commit).toHaveBeenCalledTimes(1);
    expect(batchOne.set.mock.calls.length + batchTwo.set.mock.calls.length).toBe(451);
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setEasyproPricelist",
      payload: pricelist,
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });
});
