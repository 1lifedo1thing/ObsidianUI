import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => true,
}));

import { ActiveSessions, type ActiveSession } from "@/components/block/active-sessions";

const now = Date.now();
const sessions: ActiveSession[] = [
  { id: "ipad", device: "tablet", browser: "Safari", os: "iPadOS 19", location: "Berlin, Germany", lastActiveAt: now - 86_400_000, flag: "New location" },
  { id: "mac", device: "laptop", browser: "Arc", os: "macOS", lastActiveAt: now - 3_600_000, current: true },
  { id: "phone", device: "phone", browser: "Safari", os: "iOS 19", location: "Ahmedabad, India", lastActiveAt: now - 60_000 },
];

describe("ActiveSessions", () => {
  it("lists the current device first and only offers sign-out for other devices", () => {
    render(<ActiveSessions defaultSessions={sessions} />);
    const list = screen.getByRole("list", { name: "Active sessions" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows.map(row => row.getAttribute("data-session"))).toEqual(["mac", "phone", "ipad"]);
    expect(within(rows[0]).getByText("This device")).toBeInTheDocument();
    expect(within(rows[0]).queryByRole("button")).not.toBeInTheDocument();
    expect(within(rows[2]).getByText("New location")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out Safari on iPadOS 19, Berlin, Germany" })).toBeInTheDocument();
  });

  it("removes a session after its sign-out resolves", async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    const onSessionsChange = vi.fn();
    render(<ActiveSessions defaultSessions={sessions} onRevoke={onRevoke} onSessionsChange={onSessionsChange} />);

    await user.click(screen.getByRole("button", { name: "Sign out Safari on iOS 19, Ahmedabad, India" }));
    expect(onRevoke).toHaveBeenCalledWith(sessions[2]);
    await waitFor(() => expect(onSessionsChange).toHaveBeenCalledOnce());
    expect(onSessionsChange.mock.lastCall![0].map((session: ActiveSession) => session.id).sort()).toEqual(["ipad", "mac"]);
    expect(screen.getByRole("status")).toHaveTextContent("Signed out Safari on iOS 19");
  });

  it("keeps the row and explains the problem when sign-out fails", async () => {
    const user = userEvent.setup();
    const onSessionsChange = vi.fn();
    render(<ActiveSessions defaultSessions={sessions} onRevoke={() => Promise.reject(new Error("offline"))} onSessionsChange={onSessionsChange} />);

    const button = screen.getByRole("button", { name: "Sign out Safari on iPadOS 19, Berlin, Germany" });
    await user.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t sign out this session. Try again.");
    expect(button).toHaveAccessibleDescription("Couldn’t sign out this session. Try again.");
    expect(onSessionsChange).not.toHaveBeenCalled();
  });

  it("confirms before signing out every other session and leaves only this device", async () => {
    const user = userEvent.setup();
    const onRevokeOthers = vi.fn().mockResolvedValue(undefined);
    const onSessionsChange = vi.fn();
    render(<ActiveSessions defaultSessions={sessions} onRevokeOthers={onRevokeOthers} onSessionsChange={onSessionsChange} />);

    await user.click(screen.getByRole("button", { name: "Sign out other sessions" }));
    const confirm = screen.getByRole("group", { name: "Confirm signing out other sessions" });
    expect(within(confirm).getByText("Sign out 2 other sessions?")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("group", { name: "Confirm signing out other sessions" })).not.toBeInTheDocument());
    expect(onRevokeOthers).not.toHaveBeenCalled();

    await user.click(await screen.findByRole("button", { name: "Sign out other sessions" }));
    await user.click(within(screen.getByRole("group", { name: "Confirm signing out other sessions" })).getByRole("button", { name: "Sign out" }));
    expect(onRevokeOthers.mock.lastCall![0].map((session: ActiveSession) => session.id)).toEqual(["phone", "ipad"]);
    await waitFor(() => expect(onSessionsChange).toHaveBeenCalledOnce());
    expect(onSessionsChange.mock.lastCall![0].map((session: ActiveSession) => session.id)).toEqual(["mac"]);
  });

  it("signs out one by one without onRevokeOthers and keeps only the sessions that failed", async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn((session: ActiveSession) => (session.id === "ipad" ? Promise.reject(new Error("offline")) : Promise.resolve()));
    const onSessionsChange = vi.fn();
    render(<ActiveSessions defaultSessions={sessions} onRevoke={onRevoke} onSessionsChange={onSessionsChange} />);

    await user.click(screen.getByRole("button", { name: "Sign out other sessions" }));
    await user.click(within(screen.getByRole("group", { name: "Confirm signing out other sessions" })).getByRole("button", { name: "Sign out" }));
    expect(onRevoke).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t sign out 1 session. Try again.");
    expect(onSessionsChange.mock.lastCall![0].map((session: ActiveSession) => session.id).sort()).toEqual(["ipad", "mac"]);
    expect(screen.getByText("Sign out 1 other session?")).toBeInTheDocument();
  });

  it("moves focus to the next session after a keyboard sign-out", async () => {
    const user = userEvent.setup();
    render(<ActiveSessions defaultSessions={sessions} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Active sessions" })).toBeInTheDocument();

    screen.getByRole("button", { name: "Sign out Safari on iOS 19, Ahmedabad, India" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign out Safari on iPadOS 19, Berlin, Germany" })).toHaveFocus());
  });
});
