#!/usr/bin/env node
import { cac } from "cac";
import { runCliBuild } from "./commands/build.js";
import { runCliCreate } from "./commands/create.js";
import { runCliDev } from "./commands/dev.js";

const cli = cac("hyogen-md");

cli
  .command("create [dir]", "Scaffold a minimal hyogen.md project")
  .option("--language <lang>", "Config language: js | ts", { default: "js" })
  .action(async (dir: string | undefined, flags: { language?: string }) => {
    const language = (flags.language ?? "js") as "js" | "ts";
    const result = await runCliCreate({
      targetDir: dir,
      language,
    });
    console.log(
      `Created hyogen.md project at ${result.targetDir} (${result.language})`,
    );
  });

cli
  .command("build", "Build markdown entries using hyogen.config")
  .option("--config <file>", "Path to hyogen.config file")
  .option("--outDir <dir>", "Override output directory")
  .action(async (flags: { config?: string; outDir?: string }) => {
    await runCliBuild({
      configFile: flags.config,
      outDir: flags.outDir,
    });
  });

cli
  .command("dev", "Start writing preview server with HMR")
  .option("--config <file>", "Path to hyogen.config file")
  .option("--host <host>", "Listen host", { default: "127.0.0.1" })
  .option("--port <port>", "Listen port", { default: "4173" })
  .action(
    async (flags: { config?: string; host?: string; port?: string | number }) => {
      const port =
        typeof flags.port === "string" ? Number(flags.port) : flags.port;
      const server = await runCliDev({
        configFile: flags.config,
        host: flags.host,
        port,
      });

      const shutdown = async () => {
        await server.close();
        process.exit(0);
      };
      process.on("SIGINT", () => {
        void shutdown();
      });
      process.on("SIGTERM", () => {
        void shutdown();
      });
    },
  );

cli.help();
cli.version("0.12.0");

async function main(): Promise<void> {
  try {
    cli.parse(process.argv, { run: false });
    await cli.runMatchedCommand();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
