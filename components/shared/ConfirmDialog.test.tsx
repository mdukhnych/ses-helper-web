import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("opens on trigger click and confirms the action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmDialog
        trigger={<button type="button">Open dialog</button>}
        title="Delete item?"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Видалити" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("shows a loading state while confirmation is in progress", async () => {
    const user = userEvent.setup();
    let resolvePromise: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolvePromise = resolve;
        }),
    );

    render(
      <ConfirmDialog
        trigger={<button type="button">Remove row</button>}
        title="Delete item?"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove row" }));

    const confirmButton = screen.getByRole("button", { name: "Видалити" });
    await user.click(confirmButton);

    expect(confirmButton).toBeDisabled();

    resolvePromise?.();

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
