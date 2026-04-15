import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import WarrantyModal from "./WarrantyModal";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  addWarranty: vi.fn(),
  updateWarranty: vi.fn(),
  closeModal: vi.fn(),
  state: {
    modal: {
      payload: null as unknown,
    },
  },
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: typeof mocks.state) => unknown) =>
    selector(mocks.state),
}));

vi.mock("@/hooks/useWarrantyProtection", () => ({
  default: () => ({
    addWarranty: mocks.addWarranty,
    updateWarranty: mocks.updateWarranty,
  }),
}));

vi.mock("@/store/slices/modalSlice", () => ({
  closeModal: (...args: unknown[]) => mocks.closeModal(...args),
}));

describe("WarrantyModal", () => {
  const renderInDialog = () =>
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <WarrantyModal />
        </DialogContent>
      </Dialog>,
    );

  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.addWarranty.mockReset();
    mocks.updateWarranty.mockReset();
    mocks.closeModal.mockReset();
    mocks.closeModal.mockReturnValue({ type: "modal/close" });
    mocks.state.modal.payload = null;
  });

  it("submits a new warranty with percent input converted to decimal", async () => {
    const user = userEvent.setup();

    renderInDialog();
    const titleInput = document.getElementById("warrabty-title") as HTMLInputElement;
    const priceInput = document.getElementById("warranty-price") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "warranty-description",
    ) as HTMLTextAreaElement;
    const dialog = screen.getByRole("dialog");
    const [, submitButton] = within(dialog).getAllByRole("button");

    await user.type(titleInput, "Premium plan");
    await user.clear(priceInput);
    await user.type(priceInput, "2500");
    await user.type(descriptionInput, "Covers water damage");
    await user.click(submitButton);

    expect(mocks.addWarranty).toHaveBeenCalledWith({
      title: "Premium plan",
      price: 25,
      description: "Covers water damage",
    });
  });

  it("updates an existing warranty item", async () => {
    const user = userEvent.setup();

    mocks.state.modal.payload = {
      id: "warranty-1",
      title: "Old plan",
      price: 0.15,
      description: "Old coverage",
      order: 1,
    };

    renderInDialog();
    const titleInput = document.getElementById("warrabty-title") as HTMLInputElement;
    const priceInput = document.getElementById("warranty-price") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "warranty-description",
    ) as HTMLTextAreaElement;
    const dialog = screen.getByRole("dialog");
    const [, submitButton] = within(dialog).getAllByRole("button");

    expect(titleInput).toHaveValue("Old plan");
    expect(priceInput).toHaveValue("15");
    expect(descriptionInput).toHaveValue("Old coverage");

    await user.clear(titleInput);
    await user.type(titleInput, "Updated plan");
    await user.clear(priceInput);
    await user.type(priceInput, "3000");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated coverage");
    await user.click(submitButton);

    expect(mocks.updateWarranty).toHaveBeenCalledWith("warranty-1", {
      id: "warranty-1",
      title: "Updated plan",
      price: 30,
      description: "Updated coverage",
      order: 1,
    });
  });

  it("closes the modal when cancel is clicked", async () => {
    const user = userEvent.setup();

    renderInDialog();
    const dialog = screen.getByRole("dialog");
    const [cancelButton] = within(dialog).getAllByRole("button");

    await user.click(cancelButton);

    expect(mocks.closeModal).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "modal/close" });
  });
});
