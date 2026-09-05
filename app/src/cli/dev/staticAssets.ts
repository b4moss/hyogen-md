export const DEV_CLIENT_JS = String.raw`
const treeEl = document.getElementById("tree");
const previewEl = document.getElementById("preview");
const statusEl = document.getElementById("status");
let currentPath = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function renderTree(nodes, container) {
  container.textContent = "";
  const walk = (items, parent) => {
    for (const node of items) {
      if (node.type === "directory") {
        const label = document.createElement("div");
        label.className = "dir";
        label.textContent = node.name;
        parent.appendChild(label);
        const nested = document.createElement("div");
        nested.style.paddingLeft = "0.75rem";
        parent.appendChild(nested);
        walk(node.children || [], nested);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = node.name;
        button.dataset.path = node.path;
        button.addEventListener("click", () => selectFile(node.path));
        parent.appendChild(button);
      }
    }
  };
  walk(nodes, container);
}

async function selectFile(filePath) {
  currentPath = filePath;
  for (const button of treeEl.querySelectorAll("button")) {
    button.setAttribute(
      "aria-current",
      button.dataset.path === filePath ? "true" : "false",
    );
  }
  setStatus("Rendering…");
  const response = await fetch(
    "/api/preview?path=" + encodeURIComponent(filePath),
  );
  if (!response.ok) {
    const text = await response.text();
    previewEl.innerHTML = "<p>Preview failed.</p>";
    setStatus(text || response.statusText);
    return;
  }
  const data = await response.json();
  previewEl.innerHTML = data.html;
  setStatus(filePath);
}

async function loadTree() {
  const response = await fetch("/api/tree");
  const data = await response.json();
  renderTree(data.tree || [], treeEl);
  const firstFile = findFirstFile(data.tree || []);
  if (firstFile) {
    await selectFile(firstFile);
  } else {
    setStatus("No markdown entries found");
  }
}

function findFirstFile(nodes) {
  for (const node of nodes) {
    if (node.type === "file") return node.path;
    if (node.children) {
      const nested = findFirstFile(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

function connectHmr() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(protocol + "://" + location.host + "/hmr");
  socket.addEventListener("message", async (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type !== "update") return;
      const paths = message.paths || [];
      if (currentPath && paths.includes(currentPath)) {
        await selectFile(currentPath);
      }
    } catch {
      // ignore malformed payloads
    }
  });
  socket.addEventListener("close", () => {
    setTimeout(connectHmr, 1000);
  });
}

loadTree();
connectHmr();
`;

export function renderIndexHtml(css: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>hyogen-md dev</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <h1>hyogen-md</h1>
        <div id="tree" class="tree"></div>
      </aside>
      <main class="main">
        <div id="status" class="status">Loading…</div>
        <article id="preview" class="preview"></article>
      </main>
    </div>
    <script src="/client.js"></script>
  </body>
</html>`;
}
