const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const DIST = "dist";

// Clean dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);

// Copy manifest
const manifest = JSON.parse(
    fs.readFileSync("manifest.json", "utf8")
);
fs.writeFileSync(
    path.join(DIST, "manifest.json"),
    JSON.stringify(manifest, null, 2)
);

// Copy css folder
fs.cpSync("css", path.join(DIST, "css"), { recursive: true });

// Copy assets if it exists
if (fs.existsSync("assets")) {
    fs.cpSync("assets", path.join(DIST, "assets"), {
        recursive: true
    });
}

// Bundle JS
esbuild.build({
    entryPoints: ["src/content/content.js"],
    bundle: true,
    outfile: "dist/content.js",
    format: "iife",
    target: ["chrome120"],
    sourcemap: true,
    logLevel: "info"
}).catch(() => process.exit(1));