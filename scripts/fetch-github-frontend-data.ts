/**
 * Standalone script: fetch frontend data (files, structure, recent changes)
 * from a GitHub repo via Claude's MCP connector + the hosted GitHub MCP server.
 *
 * Env vars required:
 *   ANTHROPIC_API_KEY   - Claude API key (or use `ant auth login` and omit)
 *   GITHUB_TOKEN         - GitHub token with repo read access (fine-grained PAT: Contents: Read)
 *   GITHUB_OWNER         - repo owner/org
 *   GITHUB_REPO          - repo name
 *
 * Usage:
 *   npx tsx scripts/fetch-github-frontend-data.ts "list all React components under src/app/components"
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const githubToken = process.env.GITHUB_TOKEN;

if (!owner || !repo) {
  console.error("Missing GITHUB_OWNER / GITHUB_REPO env vars.");
  process.exit(1);
}
if (!githubToken) {
  console.error("Missing GITHUB_TOKEN env var.");
  process.exit(1);
}

const query =
  process.argv.slice(2).join(" ") ||
  "List the frontend source files under src/ and summarize the project's frontend structure.";

async function main() {
  const response = await client.beta.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    betas: ["mcp-client-2025-11-20"],
    mcp_servers: [
      {
        type: "url",
        url: "https://api.githubcopilot.com/mcp/",
        name: "github",
        authorization_token: githubToken,
      },
    ],
    tools: [{ type: "mcp_toolset", mcp_server_name: "github" }],
    messages: [
      {
        role: "user",
        content: `Repo: ${owner}/${repo}. ${query}`,
      },
    ],
  });

  for (const block of response.content) {
    if (block.type === "text") {
      console.log(block.text);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
