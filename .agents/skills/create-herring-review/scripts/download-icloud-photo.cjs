#!/usr/bin/env node

"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { WebSocket } = require("undici");

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateShareUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Expected a valid public iCloud Photos URL.");
  }

  if (url.protocol !== "https:" || url.hostname !== "share.icloud.com") {
    throw new Error("Only https://share.icloud.com/photos/... URLs are supported.");
  }

  if (!/^\/photos\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) {
    throw new Error("Expected an iCloud Photos share URL with a public share token.");
  }

  return url.href;
}

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close((error) => {
        if (error) reject(error);
        else resolve(address.port);
      });
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`DevTools returned HTTP ${response.statusCode}.`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.once("error", reject);
    request.setTimeout(2000, () => request.destroy(new Error("DevTools request timed out.")));
  });
}

async function waitForPage(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
      const page = targets.find(
        (target) => target.type === "page" && target.url.startsWith("https://www.icloud.com/photos"),
      );
      if (page && page.webSocketDebuggerUrl) return page;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }

  throw new Error(`Timed out waiting for the iCloud page.${lastError ? ` ${lastError.message}` : ""}`);
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
  }

  connect() {
    return new Promise((resolve, reject) => {
      const onError = (event) => reject(event.error || new Error("DevTools connection failed."));
      this.socket.addEventListener("error", onError, { once: true });
      this.socket.addEventListener(
        "open",
        () => {
          this.socket.removeEventListener("error", onError);
          this.socket.addEventListener("message", (event) => this.handleMessage(event));
          resolve();
        },
        { once: true },
      );
    });
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }

    const listeners = this.listeners.get(message.method) || [];
    for (const listener of listeners) listener(message.params);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Browser evaluation failed.");
  }
  return response.result.value;
}

async function waitForGallery(client, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastState = "";

  while (Date.now() < deadline) {
    lastState = await evaluate(
      client,
      `(() => {
        const frame = document.querySelector("iframe");
        if (!frame || !frame.contentDocument || !frame.contentDocument.body) return "loading";
        const body = frame.contentDocument.body.innerText || "";
        if (/link.*(expired|unavailable)|not found/i.test(body)) return "expired";
        const button = [...frame.contentDocument.querySelectorAll("ui-button")]
          .find((element) => element.innerText.trim() === "Download" && element.offsetParent !== null);
        return button ? "ready" : body.slice(0, 300);
      })()`,
    );
    if (lastState === "ready") return;
    if (lastState === "expired") throw new Error("The iCloud Photos link is expired or unavailable.");
    await delay(300);
  }

  throw new Error(`Timed out waiting for a downloadable iCloud photo. Last page state: ${lastState}`);
}

function waitForDownload(client, timeoutMs) {
  return new Promise((resolve, reject) => {
    let suggestedFilename;
    const timeout = setTimeout(
      () => reject(new Error("Timed out waiting for the iCloud download.")),
      timeoutMs,
    );

    client.on("Browser.downloadWillBegin", (event) => {
      suggestedFilename = event.suggestedFilename;
    });
    client.on("Browser.downloadProgress", (event) => {
      if (event.state === "canceled") {
        clearTimeout(timeout);
        reject(new Error("iCloud canceled the download."));
      } else if (event.state === "completed") {
        clearTimeout(timeout);
        resolve({ filePath: event.filePath, suggestedFilename });
      }
    });
  });
}

function findImages(root) {
  const images = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) images.push(...findImages(entryPath));
    else if (SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) images.push(entryPath);
  }
  return images;
}

function readImageMetadata(imagePath) {
  const data = fs.readFileSync(imagePath);
  if (data.length >= 24 && data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) {
    return {
      format: "PNG",
      width: data.readUInt32BE(16),
      height: data.readUInt32BE(20),
    };
  }

  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return undefined;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;
  while (offset + 8 < data.length) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (data[offset] === 0xff) offset += 1;
    const marker = data[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > data.length) break;
    const segmentLength = data.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > data.length) break;
    if (startOfFrameMarkers.has(marker)) {
      return {
        format: "JPEG",
        width: data.readUInt16BE(offset + 5),
        height: data.readUInt16BE(offset + 3),
        components: data[offset + 7],
      };
    }
    offset += segmentLength;
  }
  return { format: "JPEG" };
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function stopChromium(chromium) {
  if (chromium.exitCode === null && chromium.signalCode === null) chromium.kill("SIGTERM");
  await waitForExit(chromium, 3_000);
  if (chromium.exitCode === null && chromium.signalCode === null) {
    chromium.kill("SIGKILL");
    await waitForExit(chromium, 2_000);
  }
}

async function main() {
  const shareUrl = validateShareUrl(process.argv[2]);
  const requestedOutput = process.argv[3] ? path.resolve(process.argv[3]) : undefined;
  const outputDir = requestedOutput || fs.mkdtempSync(path.join(os.tmpdir(), "silku-paradize-icloud-"));
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "silku-paradize-chromium-"));
  fs.mkdirSync(outputDir, { recursive: true });

  const port = await reservePort();
  const chromium = spawn(
    process.env.CHROMIUM_BIN || "chromium",
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      shareUrl,
    ],
    { stdio: "ignore" },
  );
  let client;

  try {
    const page = await waitForPage(port, 30_000);
    client = new CdpClient(page.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Browser.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: outputDir,
      eventsEnabled: true,
    });
    await waitForGallery(client, 45_000);

    const download = waitForDownload(client, 90_000);
    const firstClick = await evaluate(
      client,
      `(() => {
        const document = window.document.querySelector("iframe").contentDocument;
        const button = [...document.querySelectorAll("ui-button")]
          .find((element) => element.innerText.trim() === "Download" && element.offsetParent !== null);
        if (!button) return false;
        button.click();
        return true;
      })()`,
    );
    if (!firstClick) throw new Error("Could not click the iCloud Download button.");

    const modalDeadline = Date.now() + 15_000;
    let confirmationClicked = false;
    while (Date.now() < modalDeadline) {
      confirmationClicked = await evaluate(
        client,
        `(() => {
          const document = window.document.querySelector("iframe").contentDocument;
          const buttons = [...document.querySelectorAll("ui-button")]
            .filter((element) => element.innerText.trim() === "Download" && element.offsetParent !== null);
          if (buttons.length < 2) return false;
          buttons[buttons.length - 1].click();
          return true;
        })()`,
      );
      if (confirmationClicked) break;
      await delay(200);
    }
    if (!confirmationClicked) throw new Error("Could not confirm the iCloud download dialog.");

    const completed = await download;
    const archivePath = completed.filePath || path.join(outputDir, completed.suggestedFilename);
    if (!archivePath || !fs.existsSync(archivePath)) {
      throw new Error("iCloud reported a completed download, but the archive was not found.");
    }

    let imageRoot = outputDir;
    if (path.extname(archivePath).toLowerCase() === ".zip") {
      imageRoot = path.join(outputDir, "extracted");
      fs.mkdirSync(imageRoot, { recursive: true });
      const unzip = spawnSync("unzip", ["-o", archivePath, "-d", imageRoot], {
        encoding: "utf8",
      });
      if (unzip.status !== 0) {
        throw new Error(`Failed to extract the iCloud archive: ${unzip.stderr.trim()}`);
      }
    }

    const images = findImages(imageRoot).map((imagePath) => ({
      path: imagePath,
      bytes: fs.statSync(imagePath).size,
      ...readImageMetadata(imagePath),
    }));
    if (images.length === 0) throw new Error("The iCloud download contained no supported images.");

    process.stdout.write(`${JSON.stringify({ shareUrl, outputDir, archivePath, images }, null, 2)}\n`);
  } finally {
    if (client) client.close();
    await stopChromium(chromium);
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

main().catch((error) => fail(error.message));
