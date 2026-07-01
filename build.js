const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DIST = "dist";
const RELEASE = "release";
const ZIP_NAME = "Canvas_Progress_Bar.zip";
const ZIP_PATH = path.join(RELEASE, ZIP_NAME);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

fs.writeFileSync(
  path.join(DIST, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

fs.cpSync("css", path.join(DIST, "css"), { recursive: true });

if (fs.existsSync("assets")) {
  fs.cpSync("assets", path.join(DIST, "assets"), { recursive: true });
}

esbuild
  .build({
    entryPoints: ["src/content/content.js"],
    bundle: true,
    outfile: path.join(DIST, "content.js"),
    format: "iife",
    target: ["chrome120"],
    sourcemap: true,
    logLevel: "info"
  })
  .then(() => {
    fs.rmSync(RELEASE, { recursive: true, force: true });
    fs.mkdirSync(RELEASE);

    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path "${DIST}\\*" -DestinationPath "${ZIP_PATH}" -Force`
      ],
      { stdio: "inherit" }
    );

    console.log(`\n✅ Built extension: ${DIST}`);
    console.log(`✅ Created release ZIP: ${ZIP_PATH}`);
  })
  .catch(() => process.exit(1));