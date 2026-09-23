import {
  createTracwell,
  type EventProperties,
  type TracwellClient,
} from "tracwell";

let client: TracwellClient | undefined;

export function initializeTracwell() {
  if (typeof document === "undefined") return;

  client ??= createTracwell({
    projectKey: "tw_live_8e2a0a5c64264370a17708ec3dc4a9c1",
    collectionMode: "product",
    consent: "granted",
    respectDoNotTrack: true,
  });
}

export function trackTracwellEvent(
  eventName: string,
  properties?: EventProperties,
) {
  return client?.track(eventName, properties);
}
