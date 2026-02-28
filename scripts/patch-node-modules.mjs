#!/usr/bin/env node
/**
 * Overwrite problematic Node-only packages with stubs so wrangler can bundle.
 * Run after npm install, before wrangler deploy.
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const nm = join(root, "node_modules");

const patches = [
  { path: join(nm, "pg-types", "index.js"), content: "module.exports = {};\n" },
  {
    path: join(nm, "uc.micro", "index.mjs"),
    content: "export default {}; export const P = {}; export const S = {}; export const Z = {}; export const Any = {};\n",
  },
  // linkify-it: re.mjs is empty in some installs; provide a default export
  {
    path: join(nm, "linkify-it", "lib", "re.mjs"),
    content: "export default function () { return {}; }\n",
  },
];

for (const { path: filePath, content } of patches) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content);
  console.log("Patched:", filePath);
}

console.log("Done patching node_modules.");
