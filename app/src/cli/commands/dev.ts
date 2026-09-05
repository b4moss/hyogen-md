import http from "node:http";
import path from "node:path";
import type { FSWatcher } from "chokidar";
import { WebSocketServer } from "ws";
import { loadConfig } from "../../config/loadConfig.js";
import type { ResolvedHyogenConfig } from "../../config/types.js";
import {
  buildDependencyIndex,
  collectAffectedEntries,
  type DependencyIndex,
} from "../dev/dependencyIndex.js";
import { createDevSession, type DevSession } from "../dev/devSession.js";
import { createFileWatcher } from "../dev/fileWatcher.js";
import { createHmrHub, type HmrHub } from "../dev/hmrHub.js";
import { PREVIEW_CSS } from "../dev/previewHtml.js";
import { DEV_CLIENT_JS, renderIndexHtml } from "../dev/staticAssets.js";
import { buildFileTree } from "../dev/treeIndex.js";
import { isRemotePath } from "../../io/isRemotePath.js";

export type DevServerOptions = {
  config: ResolvedHyogenConfig;
  host?: string;
  port?: number;
  errorLog?: (message: string) => void;
  log?: (message: string) => void;
};

export type DevServer = {
  host: string;
  port: number;
  url: string;
  session: DevSession;
  close: () => Promise<void>;
};

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendText(
  res: http.ServerResponse,
  status: number,
  body: string,
  contentType: string,
): void {
  res.writeHead(status, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}


/**
 * Resolve a preview path to a local file under the project root.
 * Rejects remote URLs and path traversal (CodeQL js/request-forgery).
 */
function resolvePreviewPath(requestPath: string, rootDir: string): string {
  if (isRemotePath(requestPath)) {
    throw new Error("remote path not allowed");
  }
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, requestPath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("path outside project root");
  }
  return resolved;
}

/**
 * Start writing preview server (tree + HTML preview + HMR). Never writes `outDir`.
 */
export async function startDevServer(
  options: DevServerOptions,
): Promise<DevServer> {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4173;
  const log = options.log ?? ((message) => console.log(message));
  const errorLog = options.errorLog ?? ((message) => console.error(message));

  const session = createDevSession({
    config: options.config,
    errorLog,
  });

  let dependencyIndex: DependencyIndex = await buildDependencyIndex({
    input: options.config.input,
    root: options.config.root ?? options.config.configDir,
    includeUnderscoreEntries: options.config.includeUnderscoreEntries,
  });

  const hmr: HmrHub = createHmrHub();

  const rebuildIndex = async () => {
    dependencyIndex = await buildDependencyIndex({
      input: options.config.input,
      root: options.config.root ?? options.config.configDir,
      includeUnderscoreEntries: options.config.includeUnderscoreEntries,
    });
  };

  const watchPaths =
    dependencyIndex.watchPaths.length > 0
      ? dependencyIndex.watchPaths
      : [options.config.configDir];

  const watcher: FSWatcher = createFileWatcher(watchPaths, {
    onChange: (filePath) => {
      void (async () => {
        try {
          await rebuildIndex();
          const affected = collectAffectedEntries(dependencyIndex, filePath);
          hmr.publish(
            affected.length > 0 ? affected : [path.resolve(filePath)],
          );
        } catch (error) {
          errorLog(error instanceof Error ? error.message : String(error));
        }
      })();
    },
    onError: (error) => errorLog(error.message),
  });

  const server = http.createServer((req, res) => {
    void (async () => {
      try {
        const url = new URL(req.url ?? "/", `http://${host}:${port}`);

        if (req.method === "GET" && url.pathname === "/") {
          sendText(
            res,
            200,
            renderIndexHtml(PREVIEW_CSS),
            "text/html; charset=utf-8",
          );
          return;
        }
        if (req.method === "GET" && url.pathname === "/client.js") {
          sendText(res, 200, DEV_CLIENT_JS, "text/javascript; charset=utf-8");
          return;
        }
        if (req.method === "GET" && url.pathname === "/api/tree") {
          const tree = await buildFileTree({
            input: options.config.input,
            root: options.config.root ?? options.config.configDir,
            includeUnderscoreEntries: options.config.includeUnderscoreEntries,
          });
          sendJson(res, 200, { tree });
          return;
        }
        if (req.method === "GET" && url.pathname === "/api/preview") {
          const filePath = url.searchParams.get("path");
          if (!filePath) {
            sendJson(res, 400, { error: "missing path" });
            return;
          }
          let safePath: string;
          try {
            const rootDir = options.config.root ?? options.config.configDir;
            safePath = resolvePreviewPath(filePath, rootDir);
          } catch {
            sendJson(res, 400, { error: "invalid path" });
            return;
          }
          try {
            const preview = await session.renderEntry(safePath);
            sendJson(res, 200, preview);
          } catch (error) {
            errorLog(error instanceof Error ? error.message : String(error));
            sendJson(res, 500, { error: "preview failed" });
          }
          return;
        }

        sendJson(res, 404, { error: "not found" });
      } catch (error) {
        errorLog(error instanceof Error ? error.message : String(error));
        sendJson(res, 500, { error: "internal error" });
      }
    })();
  });

  const wss = new WebSocketServer({ server, path: "/hmr" });
  wss.on("connection", (socket) => {
    hmr.add(socket);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  const addressed = server.address();
  const boundPort =
    typeof addressed === "object" && addressed !== null
      ? addressed.port
      : port;
  const url = `http://${host}:${boundPort}/`;
  log(`hyogen-md dev: ${url}`);

  return {
    host,
    port: boundPort,
    url,
    session,
    async close() {
      hmr.close();
      await new Promise<void>((resolve) => {
        wss.close(() => resolve());
      });
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await watcher.close();
    },
  };
}

export type RunCliDevOptions = {
  cwd?: string;
  configFile?: string;
  host?: string;
  port?: number;
  log?: (message: string) => void;
  errorLog?: (message: string) => void;
};

export async function runCliDev(
  options: RunCliDevOptions = {},
): Promise<DevServer> {
  const config = await loadConfig({
    cwd: options.cwd,
    configFile: options.configFile,
  });
  return startDevServer({
    config,
    host: options.host,
    port: options.port,
    log: options.log,
    errorLog: options.errorLog,
  });
}
