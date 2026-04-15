import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EktaEditDialog from "./EktaEditDialog";

const mocks = vi.hoisted(() => ({
  checkUniqueId: vi.fn(),
}));

vi.mock("@/utils", async () => {
  return {
    checkUniqueId: (...args: unknown[]) => mocks.checkUniqueId(...args),
  };
});

vi.mock("../shared/ConfirmDialog", () => ({
  default: ({
    trigger,
    onConfirm,
  }: {
    trigger: React.ReactNode;
    onConfirm: () => void | Promise<void>;
  }) => (
    <div>
      {trigger}
      <button type="button" onClick={() => void onConfirm()}>
        Confirm delete
      </button>
    </div>
  ),
}));

describe("EktaEditDialog", () => {
  beforeEach(() => {
    mocks.checkUniqueId.mockReset();
    mocks.checkUniqueId.mockReturnValue(true);
  });

  it("adds a new item when the id is unique", async () => {
    const user = userEvent.setup();
    const items = [
      {
        id: "existing-id",
        title: "Existing item",
        productCode: "EX-01",
        order: 1,
        price: 100,
        description: "",
      },
    ];
    const setItems = vi.fn();

    render(
      <EktaEditDialog
        trigger={<button type="button">Open editor</button>}
        items={items}
        currentItem={null}
        setItems={setItems}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open editor" }));

    await user.type(screen.getByLabelText("ID:"), "new-id");
    await user.type(document.getElementById("title") as HTMLInputElement, "New title");
    await user.type(document.getElementById("productCode") as HTMLInputElement, "PR-101");
    await user.clear(document.getElementById("price") as HTMLInputElement);
    await user.type(document.getElementById("price") as HTMLInputElement, "250");
    await user.clear(document.getElementById("order") as HTMLInputElement);
    await user.type(document.getElementById("order") as HTMLInputElement, "2");

    const dialog = screen.getByRole("dialog");
    const saveButton = within(dialog)
      .getAllByRole("button")
      .find(button => button.textContent?.trim() && button.textContent !== "Close");

    expect(saveButton).toBeDefined();

    await user.click(saveButton!);

    expect(mocks.checkUniqueId).toHaveBeenCalledWith("new-id", ["existing-id"]);
    expect(setItems).toHaveBeenCalledTimes(1);

    const updater = setItems.mock.calls[0][0] as (prev: {
      id: string;
      title: string;
      list: typeof items;
    }) => { id: string; title: string; list: typeof items };

    const nextState = updater({
      id: "group-1",
      title: "Group",
      list: items,
    });

    expect(nextState.list).toEqual([
      ...items,
      {
        id: "new-id",
        title: "New title",
        productCode: "PR-101",
        order: 2,
        price: 250,
        description: "",
      },
    ]);
  });

  it("does not save a new item when id validation fails", async () => {
    const user = userEvent.setup();
    const setItems = vi.fn();

    mocks.checkUniqueId.mockReturnValue(false);

    render(
      <EktaEditDialog
        trigger={<button type="button">Open editor</button>}
        items={[]}
        currentItem={null}
        setItems={setItems}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open editor" }));

    await user.type(screen.getByLabelText("ID:"), "duplicate-id");
    await user.type(document.getElementById("title") as HTMLInputElement, "Blocked title");

    const dialog = screen.getByRole("dialog");
    const saveButton = within(dialog)
      .getAllByRole("button")
      .find(button => button.textContent?.trim() && button.textContent !== "Close");

    await user.click(saveButton!);

    expect(setItems).not.toHaveBeenCalled();
  });

  it("deletes the current item when deletion is confirmed", async () => {
    const user = userEvent.setup();
    const items = [
      {
        id: "item-1",
        title: "Current item",
        productCode: "PR-01",
        order: 1,
        price: 100,
        description: "",
      },
      {
        id: "item-2",
        title: "Keep me",
        productCode: "PR-02",
        order: 2,
        price: 200,
        description: "",
      },
    ];
    const setItems = vi.fn();

    render(
      <EktaEditDialog
        trigger={<button type="button">Edit item</button>}
        items={items}
        currentItem={items[0]}
        setItems={setItems}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit item" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(setItems).toHaveBeenCalledTimes(1);

    const updater = setItems.mock.calls[0][0] as (prev: {
      id: string;
      title: string;
      list: typeof items;
    }) => { id: string; title: string; list: typeof items };

    const nextState = updater({
      id: "group-1",
      title: "Group",
      list: items,
    });

    expect(nextState.list).toEqual([items[1]]);
  });

  it("rejects non-pdf uploads", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <EktaEditDialog
        trigger={<button type="button">Open editor</button>}
        items={[]}
        currentItem={null}
        setItems={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open editor" }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileNameInput = document.getElementById("descr") as HTMLInputElement;
    const invalidFile = new File(["bad"], "bad.txt", { type: "text/plain" });

    fireEvent.change(fileInput, {
      target: {
        files: [invalidFile],
      },
    });

    expect(alertSpy).toHaveBeenCalledWith("Only PDF allowed");
    expect(fileNameInput.value).toBe("");

    alertSpy.mockRestore();
  });
});
