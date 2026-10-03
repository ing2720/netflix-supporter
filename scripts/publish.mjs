import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

// This helper deliberately only knows this repository and these review branches.
const repo = 'ing2720/netflix-supporter';
const remote = `https://github.com/${repo}.git`;
const plan = [
  { head: 'codex/instant-skip-engine', base: 'main', title: 'feat: instantly skip intro and recap controls', body: 'docs/PR-1.md' },
  { head: 'codex/next-episode-navigation', base: 'codex/instant-skip-engine', title: 'feat: safely continue to the next episode', body: 'docs/PR-2.md' },
  { head: 'codex/settings-and-delivery', base: 'codex/next-episode-navigation', title: 'feat: add local settings and a verifiable install package', body: 'docs/PR-3.md' },
];
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const git = (...args) => run('git', args);
const gh = (...args) => run('gh', args);

try {
  const branch = git('branch', '--show-current');
  if (branch !== plan.at(-1).head) throw Error(`Run from ${plan.at(-1).head}; current branch: ${branch}`);
  if (git('remote', 'get-url', 'origin') !== remote || git('remote', 'get-url', '--push', 'origin') !== remote) throw Error('Unexpected origin. No changes made.');
  if (git('status', '--porcelain')) throw Error('Commit or safely resolve working-tree changes first.');
  const bootstrap = git('rev-list', '--max-parents=0', 'main');
  if (git('rev-parse', 'main') !== bootstrap) throw Error('Local main is no longer the documentation-only bootstrap.');
  if (git('ls-tree', '-r', '--name-only', bootstrap) !== '.gitignore\nAGENTS.md\nREADME.md') throw Error('Unexpected bootstrap contents.');
  for (const item of plan) git('merge-base', '--is-ancestor', item.base, item.head);
  console.log(`Repository: ${repo}\nCurrent branch: ${branch}\n${plan.map((p) => `${p.head} → ${p.base}`).join('\n')}`);
  if (!process.argv.includes('--publish')) {
    console.log('Plan only. Use node scripts/publish.mjs --publish after authenticating.');
    process.exit(0);
  }
  if (gh('api', 'user', '--jq', '.login') !== 'ing2720') throw Error('Authenticate as repository owner ing2720.');
  const gitAuth = (...args) => git('-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', ...args);
  const existingMain = gitAuth('ls-remote', 'origin', 'refs/heads/main').split(/\s/)[0];
  if (existingMain && existingMain !== bootstrap) throw Error('Remote main already differs from bootstrap. Refusing to modify it.');
  if (!existingMain) gitAuth('push', 'origin', `${bootstrap}:refs/heads/main`);
  const published = [];
  for (const item of plan) {
    // Repeat target checks immediately before each explicit branch push.
    if (git('remote', 'get-url', '--push', 'origin') !== remote) throw Error('Origin changed.');
    console.log(`Pushing ${item.head} from checkout ${git('branch', '--show-current')}`);
    gitAuth('push', '-u', 'origin', `${item.head}:refs/heads/${item.head}`);
    const previous = JSON.parse(gh('pr', 'list', '--repo', repo, '--head', item.head, '--state', 'all', '--json', 'url,state,baseRefName'));
    if (previous.length && (previous.length !== 1 || previous[0].state !== 'OPEN' || previous[0].baseRefName !== item.base)) throw Error(`Existing PR for ${item.head} needs review; not creating a duplicate.`);
    const url = previous[0]?.url ?? gh('pr', 'create', '--repo', repo, '--draft', '--head', item.head, '--base', item.base, '--title', item.title, '--body-file', item.body);
    published.push({ ...item, url });
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/published-prs.json', `${JSON.stringify(published, null, 2)}\n`);
    console.log(url);
  }
} catch (error) {
  // Do not dump subprocess environments or authentication material.
  console.error(error instanceof Error ? error.message.split('\n')[0] : 'Publication failed');
  console.error('Stopped without force-pushing, merging, or changing repository access.');
  process.exitCode = 1;
}
