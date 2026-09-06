import { watch as chokidarWatch, type FSWatcher } from "chokidar";

export type FileWatchHandlers = {
  onChange: (filePath: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Watch absolute paths for changes (create/update/unlink).
 */
export function createFileWatcher(
  watchPaths: string[],
  handlers: FileWatchHandlers,
): FSWatcher {
  const watcher = chokidarWatch(watchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  const emit = (filePath: string) => {
    handlers.onChange(filePath);
  };

  watcher.on("change", emit);
  watcher.on("add", emit);
  watcher.on("unlink", emit);
  watcher.on("error", (error) => {
    handlers.onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  return watcher;
}
