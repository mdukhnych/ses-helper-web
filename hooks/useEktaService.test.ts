import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEktaService from "./useEktaService";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  closeModal: vi.fn(),
  setEktaServicesData: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  arrayUnion: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  deleteFolder: vi.fn(),
  handleError: vi.fn(),
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
  setEktaServicesData: (...args: unknown[]) => mocks.setEktaServicesData(...args),
}));

vi.mock("firebase/firestore", () => ({
  arrayUnion: (...args: unknown[]) => mocks.arrayUnion(...args),
  collection: (...args: unknown[]) => mocks.collection(...args),
  deleteDoc: (...args: unknown[]) => mocks.deleteDoc(...args),
  doc: (...args: unknown[]) => mocks.doc(...args),
  setDoc: (...args: unknown[]) => mocks.setDoc(...args),
  updateDoc: (...args: unknown[]) => mocks.updateDoc(...args),
}));

vi.mock("./useFirebaseStorage", () => ({
  default: () => ({
    uploadFile: mocks.uploadFile,
    deleteFile: mocks.deleteFile,
    deleteFolder: mocks.deleteFolder,
  }),
}));

vi.mock("@/utils", () => ({
  handleError: (...args: unknown[]) => mocks.handleError(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mocks.toastSuccess(...args),
    error: (...args: unknown[]) => mocks.toastError(...args),
  },
}));

describe("useEktaService", () => {
  const baseStore = () => [
    {
      id: "ekta-services",
      title: "Ekta",
      type: "ekta",
      data: [
        {
          id: "group-1",
          title: "Group 1",
          order: 1,
          list: [
            {
              id: "item-1",
              title: "Existing item",
              productCode: "PR-1",
              order: 1,
              price: 100,
              description: "old-url",
            },
          ],
        },
        {
          id: "group-2",
          title: "Group 2",
          order: 2,
          list: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.closeModal.mockReset();
    mocks.setEktaServicesData.mockReset();
    mocks.collection.mockReset();
    mocks.doc.mockReset();
    mocks.setDoc.mockReset();
    mocks.updateDoc.mockReset();
    mocks.deleteDoc.mockReset();
    mocks.arrayUnion.mockReset();
    mocks.uploadFile.mockReset();
    mocks.deleteFile.mockReset();
    mocks.deleteFolder.mockReset();
    mocks.handleError.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();

    mocks.state.services.data = [];
    mocks.closeModal.mockReturnValue({ type: "modal/close" });
    mocks.setEktaServicesData.mockImplementation(payload => ({
      type: "services/setEktaServicesData",
      payload,
    }));
    mocks.collection.mockReturnValue({ path: "/services/ekta-services/data" });
    mocks.doc.mockImplementation((...args: unknown[]) => {
      if (args.length === 1) return { id: "new-group-id" };
      return { id: String(args.at(-1)) };
    });
    mocks.arrayUnion.mockImplementation(payload => ({ arrayUnionValue: payload }));
  });

  it("shows an error when ekta data is missing from the store", async () => {
    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.addEktaGroup({
        title: "New group",
        order: null,
        list: [],
      });
    });

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });

  it("adds a new ekta group and closes the modal", async () => {
    mocks.state.services.data = baseStore();

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.addEktaGroup({
        title: "New group",
        order: null,
        list: [],
      });
    });

    expect(mocks.setDoc).toHaveBeenCalledWith(
      { id: "new-group-id" },
      {
        title: "New group",
        order: 3,
        list: [],
      },
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setEktaServicesData",
      payload: [
        ...baseStore()[0].data,
        {
          id: "new-group-id",
          title: "New group",
          order: 3,
          list: [],
        },
      ],
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("updates an existing ekta group", async () => {
    mocks.state.services.data = baseStore();

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.updateEktaGroup("group-1", {
        title: "Renamed group",
        order: 1,
        list: [],
      });
    });

    expect(mocks.updateDoc).toHaveBeenCalledWith(
      { id: "group-1" },
      { title: "Renamed group" },
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setEktaServicesData",
      payload: [
        {
          id: "group-1",
          title: "Renamed group",
          order: 1,
          list: [],
        },
        baseStore()[0].data[1],
      ],
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
  });

  it("deletes an ekta group", async () => {
    mocks.state.services.data = baseStore();
    mocks.deleteFolder.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.deleteEktaGroup("group-1");
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith({ id: "group-1" });
    expect(mocks.deleteFolder).toHaveBeenCalledWith("/services/ekta/group-1/");
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setEktaServicesData",
      payload: [baseStore()[0].data[1]],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("adds an ekta item with an uploaded file", async () => {
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("generated-item-id");

    mocks.state.services.data = baseStore();
    mocks.uploadFile.mockResolvedValue("https://cdn.test/file.pdf");

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.addEktaItem({
        docId: "group-1",
        item: {
          id: "ignored",
          title: "New item",
          productCode: "PR-2",
          order: 2,
          price: 200,
          description: "",
        },
        file: new File(["pdf"], "test.pdf", { type: "application/pdf" }),
      });
    });

    expect(mocks.uploadFile).toHaveBeenCalledTimes(1);
    expect(mocks.updateDoc).toHaveBeenCalledWith(
      { id: "group-1" },
      {
        list: {
          arrayUnionValue: {
            id: "generated-item-id",
            title: "New item",
            productCode: "PR-2",
            order: 2,
            price: 200,
            description: "https://cdn.test/file.pdf",
          },
        },
      },
    );
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "services/setEktaServicesData",
      }),
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });

    uuidSpy.mockRestore();
  });

  it("updates an ekta item and removes the old file when description is cleared", async () => {
    mocks.state.services.data = baseStore();
    mocks.deleteFile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.updateEktaItem({
        docId: "group-1",
        newData: {
          id: "item-1",
          title: "Updated item",
          productCode: "PR-1",
          order: 1,
          price: 150,
          description: "",
        },
        fileData: {
          prevURL: "old-url",
          file: null,
        },
      });
    });

    expect(mocks.updateDoc).toHaveBeenCalledWith(
      { id: "group-1" },
      {
        list: [
          {
            id: "item-1",
            title: "Updated item",
            productCode: "PR-1",
            order: 1,
            price: 150,
            description: "",
          },
        ],
      },
    );
    expect(mocks.deleteFile).toHaveBeenCalledWith("old-url");
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
  });

  it("uses the shared error handler when an ekta item update cannot find the target group", async () => {
    mocks.state.services.data = [
      {
        id: "ekta-services",
        title: "Ekta",
        type: "ekta",
        data: [],
      },
    ];

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.updateEktaItem({
        docId: "missing-group",
        newData: {
          id: "item-1",
          title: "Updated item",
          productCode: "PR-1",
          order: 1,
          price: 150,
          description: "",
        },
        fileData: {
          prevURL: "",
          file: null,
        },
      });
    });

    expect(mocks.handleError).toHaveBeenCalledTimes(1);
  });

  it("deletes an ekta item and clears all items in a group", async () => {
    mocks.state.services.data = baseStore();
    mocks.deleteFile.mockResolvedValue(undefined);
    mocks.deleteFolder.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEktaService());

    await act(async () => {
      await result.current.deleteEktaItem(baseStore()[0].data[0], baseStore()[0].data[0].list[0]);
    });

    expect(mocks.deleteFile).toHaveBeenCalledWith("old-url");
    expect(mocks.toastSuccess).toHaveBeenCalled();

    mocks.dispatch.mockClear();
    mocks.toastSuccess.mockClear();

    await act(async () => {
      await result.current.clearEktaItems("group-1");
    });

    expect(mocks.deleteFolder).toHaveBeenCalledWith("/services/ekta/group-1");
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "services/setEktaServicesData",
      payload: [
        {
          ...baseStore()[0].data[0],
          list: [],
        },
        baseStore()[0].data[1],
      ],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });
});
