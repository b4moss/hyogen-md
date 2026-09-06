import { describe, expect, it } from "vitest";
import { createHmrHub } from "../../src/cli/dev/hmrHub.js";

const OPEN = 1;
const CLOSED = 3;

class FakeSocket {
  readonly OPEN = OPEN;
  readonly CLOSED = CLOSED;
  readyState: number = OPEN;
  sent: string[] = [];
  closed = false;
  private readonly listeners = new Map<string, Array<() => void>>();

  on(event: string, cb: () => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(cb);
    this.listeners.set(event, list);
  }

  emit(event: string): void {
    for (const cb of this.listeners.get(event) ?? []) cb();
  }

  send(payload: string): void {
    if (this.sendShouldThrow) {
      throw new Error("send failed");
    }
    this.sent.push(payload);
  }

  close(): void {
    if (this.closeShouldThrow) {
      throw new Error("close failed");
    }
    this.closed = true;
  }

  sendShouldThrow = false;
  closeShouldThrow = false;
}

describe("createHmrHub", () => {
  it("starts empty", () => {
    const hub = createHmrHub();
    expect(hub.size).toBe(0);
  });

  it("tracks added clients and removes them when they close", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    hub.add(client as unknown as import("ws").WebSocket);
    expect(hub.size).toBe(1);

    client.emit("close");
    expect(hub.size).toBe(0);
  });

  it("does nothing when publishing with no paths", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    hub.add(client as unknown as import("ws").WebSocket);
    hub.publish([]);
    expect(client.sent).toEqual([]);
  });

  it("does nothing when publishing with no clients", () => {
    const hub = createHmrHub();
    expect(() => hub.publish(["/a.md"])).not.toThrow();
  });

  it("sends update payloads to open clients", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    hub.add(client as unknown as import("ws").WebSocket);
    hub.publish(["/a.md", "/b.md"]);
    expect(client.sent).toHaveLength(1);
    expect(JSON.parse(client.sent[0]!)).toEqual({
      type: "update",
      paths: ["/a.md", "/b.md"],
    });
  });

  it("removes clients that are not open when publishing", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    client.readyState = CLOSED;
    hub.add(client as unknown as import("ws").WebSocket);
    hub.publish(["/a.md"]);
    expect(client.sent).toEqual([]);
    expect(hub.size).toBe(0);
  });

  it("removes clients whose send() throws", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    client.sendShouldThrow = true;
    hub.add(client as unknown as import("ws").WebSocket);
    hub.publish(["/a.md"]);
    expect(hub.size).toBe(0);
  });

  it("closes all clients and clears the set on close()", () => {
    const hub = createHmrHub();
    const a = new FakeSocket();
    const b = new FakeSocket();
    hub.add(a as unknown as import("ws").WebSocket);
    hub.add(b as unknown as import("ws").WebSocket);
    hub.close();
    expect(a.closed).toBe(true);
    expect(b.closed).toBe(true);
    expect(hub.size).toBe(0);
  });

  it("swallows errors thrown by a client's close()", () => {
    const hub = createHmrHub();
    const client = new FakeSocket();
    client.closeShouldThrow = true;
    hub.add(client as unknown as import("ws").WebSocket);
    expect(() => hub.close()).not.toThrow();
    expect(hub.size).toBe(0);
  });
});
