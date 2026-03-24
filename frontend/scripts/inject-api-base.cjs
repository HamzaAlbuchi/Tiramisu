/* Runs in Docker before `serve`; Railway sets VITE_API_BASE_URL on the running container. */
const fs = require("fs");
const path = require("path");

const inDocker = path.join(__dirname, "dist", "index.html");
const inRepo = path.join(__dirname, "..", "dist", "index.html");
const indexPath = fs.existsSync(inDocker) ? inDocker : inRepo;

let html = fs.readFileSync(indexPath, "utf8");
if (html.includes("window.__TIRAMISU_API_BASE__")) {
  process.exit(0);
}

const marker = "<!--tiramisu-api-base-->";
if (!html.includes(marker)) {
  console.error("inject-api-base: marker missing in dist/index.html");
  process.exit(1);
}

const url = process.env.VITE_API_BASE_URL || "";
const script = `<script>window.__TIRAMISU_API_BASE__=${JSON.stringify(url)}</script>`;
fs.writeFileSync(indexPath, html.replace(marker, script));
