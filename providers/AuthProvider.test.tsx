import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuthProvider from "./AuthProvider";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  replace: vi.fn(),
  onAuthStateChanged: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  fetchBreadcrumbs: vi.fn(),
  fetchServices: vi.fn(),
  fetchInformation: vi.fn(),
  setUserStore: vi.fn(),
  toast: vi.fn(),
  authInstance: { kind: "auth" },
  firestoreInstance: { kind: "firestore" },
  breadcrumbsAction: { type: "breadcrumbs/fetch" },
  servicesAction: { type: "services/fetch" },
  informationAction: { type: "information/fetch" },
}));

vi.mock("@/firebaseConfig", () => ({
  FIREBASE_AUTH: mocks.authInstance,
  FIREBASE_FIRESTORE: mocks.firestoreInstance,
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@/store/slices/breadcrumbsSlice", () => ({
  fetchBreadcrumbs: (...args: unknown[]) => mocks.fetchBreadcrumbs(...args),
}));

vi.mock("@/store/slices/servicesSlice", () => ({
  fetchServices: (...args: unknown[]) => mocks.fetchServices(...args),
}));

vi.mock("@/store/slices/informationSlice", () => ({
  fetchInformation: (...args: unknown[]) => mocks.fetchInformation(...args),
}));

vi.mock("@/store/slices/userSlice", () => ({
  setUserStore: (...args: unknown[]) => mocks.setUserStore(...args),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mocks.onAuthStateChanged(...args),
}));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mocks.doc(...args),
  getDoc: (...args: unknown[]) => mocks.getDoc(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("sonner", () => ({
  toast: (...args: unknown[]) => mocks.toast(...args),
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.replace.mockReset();
    mocks.onAuthStateChanged.mockReset();
    mocks.doc.mockReset();
    mocks.getDoc.mockReset();
    mocks.fetchBreadcrumbs.mockReset();
    mocks.fetchServices.mockReset();
    mocks.fetchInformation.mockReset();
    mocks.setUserStore.mockReset();
    mocks.toast.mockReset();

    mocks.fetchBreadcrumbs.mockReturnValue(mocks.breadcrumbsAction);
    mocks.fetchServices.mockReturnValue(mocks.servicesAction);
    mocks.fetchInformation.mockReturnValue(mocks.informationAction);
    mocks.setUserStore.mockImplementation(user => ({
      type: "user/set",
      payload: user,
    }));
    mocks.doc.mockReturnValue({ id: "users/doc-ref" });
  });

  it("redirects unauthenticated users to the login page", async () => {
    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <div>Protected area</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("Protected area")).not.toBeInTheDocument();
  });

  it("loads protected content for authenticated users and unsubscribes on unmount", async () => {
    const userData = {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "123",
      address: "Kyiv",
      dateOfBirth: "2000-01-01",
      shopId: "shop-1",
      role: "admin" as const,
    };
    const unsubscribe = vi.fn();

    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      void callback({ uid: "firebase-user-id" });
      return unsubscribe;
    });
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => userData,
    });

    const { unmount } = render(
      <AuthProvider>
        <div>Protected area</div>
      </AuthProvider>,
    );

    expect(await screen.findByText("Protected area")).toBeInTheDocument();

    expect(mocks.doc).toHaveBeenCalledWith(
      mocks.firestoreInstance,
      "users",
      "firebase-user-id",
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "user/set",
      payload: userData,
    });
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.breadcrumbsAction);
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.servicesAction);
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.informationAction);

    const unsubscribeCallsBeforeUnmount = unsubscribe.mock.calls.length;

    unmount();

    expect(unsubscribe.mock.calls.length).toBeGreaterThan(unsubscribeCallsBeforeUnmount);
  });

  it("shows a toast when the authenticated user document is missing", async () => {
    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      void callback({ uid: "firebase-user-id" });
      return vi.fn();
    });
    mocks.getDoc.mockResolvedValue({
      exists: () => false,
    });

    render(
      <AuthProvider>
        <div>Protected area</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledTimes(1);
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(screen.queryByText("Protected area")).not.toBeInTheDocument();
  });

  it("shows a toast when loading the authenticated user fails", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      void callback({ uid: "firebase-user-id" });
      return vi.fn();
    });
    mocks.getDoc.mockRejectedValue(new Error("Firestore offline"));

    render(
      <AuthProvider>
        <div>Protected area</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledTimes(1);
    });

    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(screen.queryByText("Protected area")).not.toBeInTheDocument();

    logSpy.mockRestore();
  });
});
