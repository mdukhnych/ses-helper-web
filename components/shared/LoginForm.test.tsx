import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginForm from "./LoginForm";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    login: mocks.login,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.login.mockReset();
  });

  it("submits the entered credentials", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "super-secret");
    await user.click(screen.getByRole("button", { name: "Вхід" }));

    expect(mocks.login).toHaveBeenCalledWith("test@example.com", "super-secret");
  });

  it("toggles the password field visibility", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
