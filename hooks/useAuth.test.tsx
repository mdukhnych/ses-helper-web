import { renderHook, waitFor } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useAuth from "./useAuth";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  replace: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  fetchServices: vi.fn(),
  resestServicesStore: vi.fn(),
  setUserStore: vi.fn(),
  resetUserStore: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  authInstance: { kind: "auth" },
  firestoreInstance: { kind: "firestore" },
  fetchServicesAction: { type: "services/fetchServices" },
  resetServicesAction: { type: "services/reset" },
  resetUserAction: { type: "user/reset" },
}));

vi.mock("@/firebaseConfig", () => ({
  FIREBASE_AUTH: mocks.authInstance,
  FIREBASE_FIRESTORE: mocks.firestoreInstance,
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@/store/slices/servicesSlice", () => ({
  fetchServices: (...args: unknown[]) => mocks.fetchServices(...args),
  resestServicesStore: (...args: unknown[]) => mocks.resestServicesStore(...args),
}));

vi.mock("@/store/slices/userSlice", () => ({
  setUserStore: (...args: unknown[]) => mocks.setUserStore(...args),
  resetUserStore: (...args: unknown[]) => mocks.resetUserStore(...args),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mocks.signInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mocks.signOut(...args),
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
  toast: {
    success: (...args: unknown[]) => mocks.toastSuccess(...args),
    error: (...args: unknown[]) => mocks.toastError(...args),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.replace.mockReset();
    mocks.signInWithEmailAndPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.doc.mockReset();
    mocks.getDoc.mockReset();
    mocks.fetchServices.mockReset();
    mocks.resestServicesStore.mockReset();
    mocks.setUserStore.mockReset();
    mocks.resetUserStore.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();

    mocks.fetchServices.mockReturnValue(mocks.fetchServicesAction);
    mocks.resestServicesStore.mockReturnValue(mocks.resetServicesAction);
    mocks.resetUserStore.mockReturnValue(mocks.resetUserAction);
    mocks.setUserStore.mockImplementation(user => ({
      type: "user/set",
      payload: user,
    }));
    mocks.doc.mockReturnValue({ id: "users/doc-ref" });
  });

  it("logs in successfully and populates the store", async () => {
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

    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "firebase-user-id" },
    });
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => userData,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password-123");
    });

    await waitFor(() => {
      expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
        mocks.authInstance,
        "test@example.com",
        "password-123",
      );
      expect(mocks.doc).toHaveBeenCalledWith(
        mocks.firestoreInstance,
        "users",
        "firebase-user-id",
      );
      expect(mocks.dispatch).toHaveBeenCalledWith({
        type: "user/set",
        payload: userData,
      });
      expect(mocks.dispatch).toHaveBeenCalledWith(mocks.fetchServicesAction);
      expect(mocks.replace).toHaveBeenCalledWith("/");
      expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("shows an error toast for invalid email credentials", async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-email",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("bad-email", "password-123");
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledTimes(1);
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("shows an error toast when the signed-in user has no firestore profile", async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "firebase-user-id" },
    });
    mocks.getDoc.mockResolvedValue({
      exists: () => false,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password-123");
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledTimes(1);
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it.each([
    ["auth/missing-password"],
    ["auth/invalid-credential"],
    ["auth/internal-error"],
  ])("handles login error code %s", async (code) => {
    mocks.signInWithEmailAndPassword.mockRejectedValue({ code });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password-123");
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledTimes(1);
    });
  });

  it("logs out and resets protected state", async () => {
    mocks.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.signOut).toHaveBeenCalledWith(mocks.authInstance);
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.resetUserAction);
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.resetServicesAction);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows a firebase logout error message when sign out fails with FirebaseError", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.signOut.mockRejectedValue(
      new FirebaseError("auth/internal-error", "Sign out failed"),
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });

  it("shows a generic logout error for unknown failures", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mocks.signOut.mockRejectedValue("unexpected");

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("unexpected");

    logSpy.mockRestore();
  });
});
