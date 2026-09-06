import type { WebSocket } from "ws";

export type HmrMessage = {
  type: "update";
  paths: string[];
};

/**
 * Fan-out HMR notifications to connected WebSocket clients.
 */
export function createHmrHub() {
  const clients = new Set<WebSocket>();

  return {
    add(client: WebSocket): void {
      clients.add(client);
      client.on("close", () => {
        clients.delete(client);
      });
    },
    publish(paths: string[]): void {
      if (paths.length === 0 || clients.size === 0) {
        return;
      }
      const message: HmrMessage = { type: "update", paths };
      const payload = JSON.stringify(message);
      for (const client of [...clients]) {
        if (client.readyState === client.OPEN) {
          try {
            client.send(payload);
          } catch {
            clients.delete(client);
          }
        } else {
          clients.delete(client);
        }
      }
    },
    get size(): number {
      return clients.size;
    },
    close(): void {
      for (const client of clients) {
        try {
          client.close();
        } catch {
          // ignore
        }
      }
      clients.clear();
    },
  };
}

export type HmrHub = ReturnType<typeof createHmrHub>;
