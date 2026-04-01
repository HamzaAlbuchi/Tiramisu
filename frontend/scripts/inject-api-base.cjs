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
// Same pattern as API base: Vite bakes VITE_* at build time; Railway often only sets these at
// **runtime** on the static container. Read them here so the SPA sees the real values.
const inviteRaw = (
  process.env.TIRAMISU_REQUIRE_INVITE ||
  process.env.VITE_REQUIRE_INVITE_KEY ||
  ""
)
  .trim()
  .toLowerCase();
const invite =
  inviteRaw === "true" ? "true" : inviteRaw === "false" ? "false" : "";

const assigns = [`window.__TIRAMISU_API_BASE__=${JSON.stringify(url)}`];
if (invite) {
  assigns.push(`window.__TIRAMISU_REQUIRE_INVITE__=${JSON.stringify(invite)}`);
}
const script = `<script>${assigns.join(";")}</script>`;
fs.writeFileSync(indexPath, html.replace(marker, script));
