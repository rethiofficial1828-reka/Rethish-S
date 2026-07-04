// Regenerates the CERTS / HACK / REPOS tables in README.md between their
// <!--X:START--> ... <!--X:END--> markers. Run by .github/workflows/update-readme.yml.
//
// Usage: node scripts/update-readme.js
// Env:   GITHUB_TOKEN   (optional) — set to also list private repo names
//        GITHUB_USER    (required) — the GitHub username to pull repos for

const fs = require("fs");
const path = require("path");

const README_PATH = path.join(__dirname, "..", "README.md");
const USER = process.env.GITHUB_USER || "rethiofficial1828-reka";
const TOKEN = process.env.GITHUB_TOKEN || "";

function replaceBetween(content, marker, newBlock) {
  const start = `<!--${marker}:START-->`;
  const end = `<!--${marker}:END-->`;
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return content;
  return (
    content.slice(0, startIdx + start.length) +
    "\n" + newBlock + "\n" +
    content.slice(endIdx)
  );
}

async function fetchRepos() {
  const headers = { "User-Agent": "rethish-os-bot" };
  if (TOKEN) headers.Authorization = `token ${TOKEN}`;
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
    { headers }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

function reposTable(repos) {
  const pub = repos.filter(r => !r.private && !r.fork);
  const rows = pub.map((r, i) => {
    const id = `RS-${String(i + 1).padStart(3, "0")}`;
    return `| \`${id}\` | ${r.name} | ${r.language || "—"} | [open file](${r.html_url}) |`;
  });
  return [
    "| File ID | Codename | Stack | Access |",
    "|:---:|:---|:---:|:---:|",
    ...rows
  ].join("\n");
}

function certsTable() {
  const certs = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "json", "certificates.json")));
  const rows = certs.map(c => `| ${c.year} | ${c.name} | ${c.issuer} |`);
  return ["| Year | Research Document | Issuing Lab |", "|:---:|:---|:---|", ...rows].join("\n");
}

function hackTable() {
  const hacks = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "json", "hackathons.json")));
  const rows = hacks.map((h, i) => `| #${i + 1} | ${h.event} | ${h.year} | ${h.result} |`);
  return ["| Vault Entry | Event | Year | Seal |", "|:---:|:---|:---:|:---:|", ...rows].join("\n");
}

(async () => {
  let readme = fs.readFileSync(README_PATH, "utf8");

  try {
    const repos = await fetchRepos();
    readme = replaceBetween(readme, "REPOS", reposTable(repos));
  } catch (err) {
    console.error("Repo fetch failed, leaving REPOS block untouched:", err.message);
  }

  readme = replaceBetween(readme, "CERTS", certsTable());
  readme = replaceBetween(readme, "HACK", hackTable());

  fs.writeFileSync(README_PATH, readme);
  console.log("README.md tables refreshed.");
})();
