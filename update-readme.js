/**
 * update-readme.js
 * ------------------------------------------------------------------
 * Regenerates the auto-managed sections of README.md:
 *   1. <!--REPOS:START--> ... <!--REPOS:END-->
 *      -> Live list of your GitHub repos.
 *         Public repos: name + description + link to source code.
 *         Private repos: name only (no content/description exposed).
 *   2. <!--CERTS:START--> ... <!--CERTS:END-->
 *      -> Certification table, built from certificates.json
 *   3. <!--HACK:START--> ... <!--HACK:END-->
 *      -> Hackathon/CTF results table, built from certificates.json
 *
 * Runs automatically via .github/workflows/update-readme.yml
 * (on a daily schedule + every push), so the README always reflects
 * your current repos and whatever you put in certificates.json.
 * ------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const USERNAME = process.env.GH_USERNAME || "rethiofficial1828-reka";
const TOKEN = process.env.GITHUB_TOKEN;
const README_PATH = path.join(__dirname, "..", "README.md");
const CERTS_PATH = path.join(__dirname, "..", "certificates.json");

async function githubRequest(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": USERNAME,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} for ${url}`);
  }
  return res.json();
}

async function fetchAllRepos() {
  // Authenticated /user/repos returns both public AND private repos
  // that belong to the token owner (affiliation=owner).
  let page = 1;
  const all = [];
  while (true) {
    const repos = await githubRequest(
      `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner&sort=updated`
    );
    all.push(...repos);
    if (repos.length < 100) break;
    page += 1;
  }
  return all;
}

function buildRepoSection(repos) {
  const publicRepos = repos.filter((r) => !r.private);
  const privateRepos = repos.filter((r) => r.private);

  let out = "";

  out += "### 🌐 Public Repositories\n\n";
  if (publicRepos.length === 0) {
    out += "_No public repositories yet._\n\n";
  } else {
    out += "| Repository | Description | Language | Source |\n";
    out += "|:---|:---|:---:|:---:|\n";
    for (const r of publicRepos) {
      const desc = (r.description || "—").replace(/\|/g, "\\|");
      out += `| **${r.name}** | ${desc} | ${r.language || "—"} | [View Code](${r.html_url}) |\n`;
    }
    out += "\n";
  }

  out += "### 🔒 Private Repositories\n\n";
  if (privateRepos.length === 0) {
    out += "_No private repositories._\n\n";
  } else {
    out += "| Repository | Status |\n";
    out += "|:---|:---:|\n";
    for (const r of privateRepos) {
      out += `| **${r.name}** | 🔒 Private (name only) |\n`;
    }
    out += "\n";
  }

  out += `<sub>🔄 Auto-generated from the GitHub API — last synced ${new Date().toISOString().slice(0, 10)}.</sub>\n`;
  return out;
}

function buildCertsSection(data) {
  let out = "| Year | Certification | Issued By |\n";
  out += "|:---:|:---|:---|\n";
  for (const c of data.certificates) {
    out += `| ${c.year} | ${c.icon || "📜"} ${c.name} | ${c.issuer} |\n`;
  }
  out += `\n<sub>✏️ To add a certificate, edit \`certificates.json\` and push — this table rebuilds automatically.</sub>\n`;
  return out;
}

function buildHackathonSection(data) {
  let out = "| Attempt | Event | Year | Result |\n";
  out += "|:---:|:---|:---:|:---:|\n";
  for (const h of data.hackathons) {
    out += `| ${h.attempt} | ${h.name} | ${h.year} | ${h.place} ${h.medal || ""} |\n`;
  }
  out += `\n<sub>✏️ To add another hackathon, edit \`certificates.json\` and push.</sub>\n`;
  return out;
}

function replaceBetween(content, startTag, endTag, replacement) {
  const pattern = new RegExp(`${startTag}[\\s\\S]*?${endTag}`);
  return content.replace(pattern, `${startTag}\n${replacement}\n${endTag}`);
}

async function main() {
  const certData = JSON.parse(fs.readFileSync(CERTS_PATH, "utf8"));
  let readme = fs.readFileSync(README_PATH, "utf8");

  let repoSection;
  try {
    const repos = await fetchAllRepos();
    repoSection = buildRepoSection(repos);
  } catch (err) {
    console.error("Repo fetch failed, leaving repo section untouched:", err.message);
    repoSection = null;
  }

  if (repoSection) {
    readme = replaceBetween(readme, "<!--REPOS:START-->", "<!--REPOS:END-->", repoSection);
  }

  readme = replaceBetween(
    readme,
    "<!--CERTS:START-->",
    "<!--CERTS:END-->",
    buildCertsSection(certData)
  );

  readme = replaceBetween(
    readme,
    "<!--HACK:START-->",
    "<!--HACK:END-->",
    buildHackathonSection(certData)
  );

  fs.writeFileSync(README_PATH, readme);
  console.log("README.md sections updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
