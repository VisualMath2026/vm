import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream";
import httpProxy from "http-proxy";

const PORT = Number(process.env.PORT || 8080);
const DIST_DIR = path.resolve(process.cwd(), "dist");
const API_TARGET = process.env.VM_SHARE_API_TARGET || "http://127.0.0.1:8787";
const WS_TARGET = API_TARGET.replace(/^http/i, "ws");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true
});

proxy.on("error", (_error, _req, res) => {
  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
  }

  if (res) {
    res.end(
      JSON.stringify({
        message: "Mock server недоступен. Убедись, что pnpm dev:server запущен."
      })
    );
  }
});

function safeJoin(baseDir, requestPath) {
  const normalized = decodeURIComponent(requestPath.split("?")[0]);
  const resolved = path.normalize(path.join(baseDir, normalized));
  if (!resolved.startsWith(baseDir)) {
    return baseDir;
  }
  return resolved;
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
  });

  pipeline(fs.createReadStream(filePath), res, () => {});
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname.startsWith("/api")) {
    req.url = url.pathname.replace(/^\/api/, "") + url.search || "/";
    proxy.web(req, res, { target: API_TARGET });
    return;
  }

  let filePath = safeJoin(DIST_DIR, url.pathname === "/" ? "/index.html" : url.pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(filePath, res);
    return;
  }

  const fallback = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(fallback)) {
    sendFile(fallback, res);
    return;
  }

  res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("dist не найден. Сначала выполни expo export --platform web.");
});

server.on("upgrade", (req, socket, head) => {
  if (!req.url || !req.url.startsWith("/api")) {
    socket.destroy();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  req.url = url.pathname.replace(/^\/api/, "") + url.search || "/";
  proxy.ws(req, socket, head, { target: WS_TARGET });
});

server.listen(PORT, () => {
  console.log(`VisualMath web share server: http://localhost:${PORT}`);
  console.log(`Static files: ${DIST_DIR}`);
  console.log(`API target: ${API_TARGET}`);
});
