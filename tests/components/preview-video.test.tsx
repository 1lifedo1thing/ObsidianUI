import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PreviewVideo } from "@/components/media/preview-video";
import TemplatesPage from "@/components/pages/templates-page";
import ProjectOnePage from "@/components/pages/project-one-page";

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock("motion/react", () => ({ useReducedMotion: () => preferences.reduced }));

describe("video preview controls", () => {
  let onIntersection: IntersectionObserverCallback;
  const disconnect = vi.fn();

  beforeEach(() => {
    preferences.reduced = false;
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { onIntersection = callback; }
      observe() {}
      disconnect = disconnect;
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
  });

  function intersect(visible: boolean) {
    act(() => onIntersection([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver));
  }

  it("hides controls while retaining muted, looping playback and offscreen pausing", () => {
    const { container } = render(<PreviewVideo src="/preview.mp4" label="Card demo" showControls={false} />);
    const video = container.querySelector("video")!;
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(video.controls).toBe(false);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    intersect(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    const pauseCalls = vi.mocked(video.pause).mock.calls.length;
    intersect(false);
    expect(vi.mocked(video.pause).mock.calls.length).toBeGreaterThan(pauseCalls);
    intersect(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps template cards free of playback buttons while preserving hover playback and the details link", () => {
    render(<TemplatesPage />);
    const video = screen.getByLabelText<HTMLVideoElement>("Project One template preview");
    expect(screen.getByRole("link", { name: /^Project One/ })).toHaveAttribute("href", "/project-one");
    expect(screen.queryByRole("button", { name: /(?:Play|Pause) Project One template preview/ })).not.toBeInTheDocument();
    intersect(true);
    expect(video.play).not.toHaveBeenCalled();

    fireEvent.mouseEnter(video.parentElement!);
    expect(video.play).toHaveBeenCalledOnce();
    const pauseCalls = vi.mocked(video.pause).mock.calls.length;
    fireEvent.mouseLeave(video.parentElement!);
    expect(vi.mocked(video.pause).mock.calls.length).toBeGreaterThan(pauseCalls);
    expect(screen.queryByRole("button", { name: /(?:Play|Pause) Project One template preview/ })).not.toBeInTheDocument();
  });

  it("keeps Project One playback automatic without showing video controls", () => {
    render(<ProjectOnePage />);
    const video = screen.getByLabelText<HTMLVideoElement>("Project One template preview");
    expect(screen.queryByRole("button", { name: /(?:Play|Pause) Project One template preview/ })).not.toBeInTheDocument();
    expect(video.controls).toBe(false);
    expect(screen.getByRole("link", { name: "Live Preview" })).toHaveAttribute("href", "https://project-one.obsidianui.dev/");
    expect(video.play).not.toHaveBeenCalled();

    intersect(true);
    expect(video.play).toHaveBeenCalledOnce();
    const pauseCalls = vi.mocked(video.pause).mock.calls.length;
    intersect(false);
    expect(vi.mocked(video.pause).mock.calls.length).toBeGreaterThan(pauseCalls);
    expect(screen.queryByRole("button", { name: /(?:Play|Pause) Project One template preview/ })).not.toBeInTheDocument();
  });

  it("keeps hidden-control previews still with reduced motion and reports failed media", () => {
    preferences.reduced = true;
    const { container } = render(<PreviewVideo src="/preview.mp4" label="Card demo" showControls={false} />);
    intersect(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    fireEvent.error(container.querySelector("video")!);
    expect(screen.getByRole("status")).toHaveTextContent("Preview unavailable");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not restart autoplay on hover and pauses despite delayed native media events", async () => {
    let paused = true;
    const pendingEvents: (() => void)[] = [];
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => paused);
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (this: HTMLMediaElement) {
      paused = false;
      pendingEvents.push(() => this.dispatchEvent(new Event("play")));
      return Promise.resolve();
    });
    vi.mocked(HTMLMediaElement.prototype.pause).mockImplementation(function (this: HTMLMediaElement) {
      if (paused) return;
      paused = true;
      pendingEvents.push(() => this.dispatchEvent(new Event("pause")));
    });

    const user = userEvent.setup();
    const { container } = render(<PreviewVideo src="/preview.mp4" label="Card demo" />);
    const video = container.querySelector("video")!;
    intersect(true);
    act(() => pendingEvents.splice(0).forEach((dispatch) => dispatch()));
    expect(video.paused).toBe(false);
    const pauseButton = screen.getByRole("button", { name: "Pause Card demo" });
    const playCalls = vi.mocked(video.play).mock.calls.length;
    const pauseCalls = vi.mocked(video.pause).mock.calls.length;

    await user.hover(pauseButton);
    expect(video.play).toHaveBeenCalledTimes(playCalls);
    expect(video.pause).toHaveBeenCalledTimes(pauseCalls);
    await user.click(pauseButton);
    expect(video.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Play Card demo" })).toBeInTheDocument();

    // Already queued events must not reverse a newer explicit pause request.
    act(() => {
      pendingEvents.splice(0).forEach((dispatch) => dispatch());
      video.dispatchEvent(new Event("play"));
    });
    await user.unhover(pauseButton);
    await user.hover(pauseButton);
    expect(video.paused).toBe(true);
    expect(video.play).toHaveBeenCalledTimes(playCalls);
    expect(screen.getByRole("button", { name: "Play Card demo" })).toBeInTheDocument();
  });

  it("lets the user retry after autoplay is rejected", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("Autoplay blocked"));
    const user = userEvent.setup();
    render(<PreviewVideo src="/preview.mp4" label="Card demo" />);
    intersect(true);
    const playButton = await screen.findByRole("button", { name: "Play Card demo" });
    await user.click(playButton);
    expect(screen.getByRole("button", { name: "Pause Card demo" })).toBeInTheDocument();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });

  it("starts paused with reduced motion, while allowing explicit play and pause", async () => {
    preferences.reduced = true;
    render(<PreviewVideo src="/preview.mp4" label="Card demo" />);
    intersect(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Play Card demo" }));
    expect(await screen.findByRole("button", { name: "Pause Card demo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pause Card demo" }));
    expect(await screen.findByRole("button", { name: "Play Card demo" })).toBeInTheDocument();
  });

  it("pauses offscreen and cleans up its observer on unmount", async () => {
    const { unmount } = render(<PreviewVideo src="/preview.mp4" label="Card demo" />);
    intersect(true);
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
    intersect(false);
    expect(screen.getByRole("button", { name: "Play Card demo" })).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("resets a failed player when pagination changes its source", () => {
    const { container, rerender } = render(<PreviewVideo src="/one.mp4" label="First demo" />);
    fireEvent.error(container.querySelector("video")!);
    expect(screen.getByRole("status")).toHaveTextContent("Preview unavailable");
    rerender(<PreviewVideo src="/two.mp4" label="Second demo" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Second demo" })).toBeInTheDocument();
    expect(container.querySelector("video")).toHaveAttribute("src", "/two.mp4");
  });
});
