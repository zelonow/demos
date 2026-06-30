#!/usr/bin/env node
/**
 * gh-push.mjs — Push specific files from this workspace up to GitHub `main`
 * via the GitHub API (no local git history needed; works even though this
 * workspace and the GitHub repo have unrelated git histories).
 *
 * Pushing to `main` triggers Vercel's auto-deploy.
 *
 * Usage:
 *   node scripts/gh-push.mjs -m "fix: message" <path> [<path> ...]
 *   node scripts/gh-push.mjs -m "update askmukula" artifacts/askmukula lib/db
 *
 * A path can be a file or a directory (directories are walked recursively).
 * Requires the GITHUB_TOKEN secret (available automatically in this workspace).
 */
import { readFileSync, statSync, readdirSync } from "node:fs";
import { join, relative, posix } from "node:path";

const REPO = process.env.GH_REPO || "zizajr/askmukula";
const BRANCH = process.env.GH_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;
const API = "https://api.github.com";

const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", ".cache", ".local", ".upm",
  ".config", ".pythonlibs", ".vercel",
]);
const IGNORE_FILES = new Set([".tsbuildinfo", "tsconfig.tsbuildinfo", ".DS_Store"]);

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!TOKEN) fail("GITHUB_TOKEN is not set in this environment.");

// ---- parse args ----
const args = process.argv.slice(2);
let message = "";
let allowPackageJson = false;
let allowLockfile = false;
const paths = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "-m" || args[i] === "--message") {
    message = args[++i] || "";
  } else if (args[i] === "--allow-package-json") {
    allowPackageJson = true;
  } else if (args[i] === "--allow-lockfile") {
    allowLockfile = true;
  } else {
    paths.push(args[i]);
  }
}
if (!message) fail('A commit message is required: -m "your message"');
if (paths.length === 0) fail("Provide at least one file or directory to push.");

// ---- collect files ----
function walk(p, out) {
  const st = statSync(p);
  if (st.isDirectory()) {
    const base = p.split("/").pop();
    if (IGNORE_DIRS.has(base)) return;
    for (const entry of readdirSync(p)) walk(join(p, entry), out);
  } else {
    const base = p.split("/").pop();
    if (IGNORE_FILES.has(base)) return;
    out.push(p);
  }
}

const files = [];
for (const p of paths) {
  try {
    walk(p, files);
  } catch {
    fail(`Path not found: ${p}`);
  }
}
if (files.length === 0) fail("No files matched (everything was ignored?).");

// ---- production-safety guards ----
// These prevent the two changes most likely to break the live Vercel deploy
// when pushed from this (pnpm 10, packageManager-stripped) workspace.
for (const f of files) {
  const repoPath = posix.normalize(relative(process.cwd(), f));
  if (repoPath === "package.json" && !allowPackageJson) {
    const pkg = JSON.parse(readFileSync(f, "utf8"));
    if (!pkg.packageManager) {
      fail(
        "Refusing to push root package.json without a 'packageManager' field.\n" +
          "  The Replit workspace strips that Vercel-only pin locally, so pushing\n" +
          "  this file would remove it from GitHub and change how Vercel installs.\n" +
          "  Re-add the pin (e.g. \"packageManager\": \"pnpm@9.15.0\") or, if you really\n" +
          "  intend to drop it, pass --allow-package-json.",
      );
    }
  }
  if (repoPath === "pnpm-lock.yaml" && !allowLockfile) {
    fail(
      "Refusing to push pnpm-lock.yaml from this workspace.\n" +
        "  The workspace runs pnpm 10 and rewrites the lockfile in a way Vercel's\n" +
        "  pnpm 9 may reject under --frozen-lockfile. Regenerate it with pnpm 9 and\n" +
        "  verify 'pnpm install --frozen-lockfile' passes, then pass --allow-lockfile.",
    );
  }
}

async function gh(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "askmukula-workspace-sync",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    fail(`GitHub API ${opts.method || "GET"} ${path} -> ${res.status}\n${text}`);
  }
  return res.json();
}

console.log(`→ Pushing ${files.length} file(s) to ${REPO}@${BRANCH}`);

// 1. current branch tip + base tree
const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
const latestSha = ref.object.sha;
const baseCommit = await gh(`/repos/${REPO}/git/commits/${latestSha}`);
const baseTreeSha = baseCommit.tree.sha;

// 2. create a blob per file
const tree = [];
for (const f of files) {
  const content = readFileSync(f).toString("base64");
  const blob = await gh(`/repos/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "base64" }),
  });
  const repoPath = posix.normalize(relative(process.cwd(), f));
  tree.push({ path: repoPath, mode: "100644", type: "blob", sha: blob.sha });
  console.log(`  + ${repoPath}`);
}

// 3. new tree -> commit -> move ref
const newTree = await gh(`/repos/${REPO}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ base_tree: baseTreeSha, tree }),
});
const commit = await gh(`/repos/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({ message, tree: newTree.sha, parents: [latestSha] }),
});
await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
  method: "PATCH",
  body: JSON.stringify({ sha: commit.sha, force: false }),
});

console.log(`\n✓ Pushed. Commit ${commit.sha.slice(0, 7)} on ${BRANCH}.`);
console.log(`  https://github.com/${REPO}/commit/${commit.sha}`);
console.log(`  Vercel will auto-deploy this push.`);
