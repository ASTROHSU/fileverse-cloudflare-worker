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
  // linkify-it: re.mjs must return object with template/regex source strings (used in .replace + RegExp)
  {
    path: join(nm, "linkify-it", "lib", "re.mjs"),
    content: `export default function () {
  const s = '';
  return {
    src_xn: s,
    tpl_email_fuzzy: '%TLDS%',
    tpl_link_fuzzy: '%TLDS%',
    tpl_link_no_ip_fuzzy: '%TLDS%',
    tpl_host_fuzzy_test: '%TLDS%',
    src_auth: s,
    src_host_port_strict: s,
    src_path: s,
    src_domain: s,
    src_domain_root: s,
    src_port: s,
    src_host_terminator: s,
    src_email_name: s,
    src_host_strict: s
  };
}
`,
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
