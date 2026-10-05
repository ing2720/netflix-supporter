// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let directory: string;
let log: string;
const script = fileURLToPath(new URL('../scripts/publish.mjs', import.meta.url));

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'netflix-supporter-publish-test-'));
  log = join(directory, 'calls.jsonl');
  mkdirSync(join(directory, 'bin'));
  const fakeTool = `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.MOCK_LOG, JSON.stringify({tool,args})+'\\n');
const mode=process.env.MOCK_MODE;
const has=(v)=>args.includes(v);
let output='';
if(tool==='git') {
 if(args[0]==='branch') output='codex/settings-and-delivery';
 else if(args[0]==='remote') output=mode==='wrong-remote'?'https://github.com/elsewhere/private.git':'https://github.com/ing2720/netflix-supporter.git';
 else if(args[0]==='status') output=mode==='dirty'?' M README.md':'';
 else if(args[0]==='rev-list'||args[0]==='rev-parse') output='bootstrap';
 else if(args[0]==='ls-tree') output='.gitignore\\nAGENTS.md\\nREADME.md';
 else if(has('ls-remote')) output=mode==='resume'?'bootstrap\\trefs/heads/main':'';
} else if(args[0]==='api') output=mode==='wrong-owner'?'someone-else':'ing2720';
else if(args[1]==='list') {
 const head=args[args.indexOf('--head')+1];
 const base={'codex/instant-skip-engine':'main','codex/next-episode-navigation':'codex/instant-skip-engine','codex/settings-and-delivery':'codex/next-episode-navigation'}[head];
 output=mode==='resume'?JSON.stringify([{url:'https://github.com/ing2720/netflix-supporter/pull/1',state:'OPEN',baseRefName:base}]):'[]';
} else if(args[1]==='create') output='https://github.com/ing2720/netflix-supporter/pull/1';
process.stdout.write(output);
`;
  for (const tool of ['git', 'gh']) writeFileSync(join(directory, 'bin', tool), fakeTool, { mode: 0o700 });
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

function run(mode: string, publish = false) {
  return execFileSync(process.execPath, [script, ...(publish ? ['--publish'] : [])], {
    cwd: directory,
    encoding: 'utf8',
    stdio: 'pipe',
    env: { ...process.env, PATH: `${join(directory, 'bin')}${delimiter}${process.env.PATH}`, MOCK_LOG: log, MOCK_MODE: mode },
  });
}
function calls(): { tool: string; args: string[] }[] {
  return readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
}

describe('bounded publication (fake Git/CLI; no remote calls)', () => {
  it('plan mode performs no authentication or remote writes', () => {
    expect(run('normal')).toContain('Plan only');
    expect(calls().some((call) => call.tool === 'gh' || call.args.includes('push'))).toBe(false);
  });
  it.each(['wrong-remote', 'dirty'])('refuses %s before touching GitHub', (mode) => {
    expect(() => run(mode, true)).toThrow();
    expect(calls().some((call) => call.tool === 'gh' || call.args.includes('push'))).toBe(false);
  });
  it('refuses authentication as a different owner before any push', () => {
    expect(() => run('wrong-owner', true)).toThrow();
    expect(calls().some((call) => call.args.includes('push'))).toBe(false);
  });
  it('publishes only the bootstrap and three explicit branches, then draft PRs', () => {
    run('normal', true);
    const entries = calls();
    const pushes = entries.filter((call) => call.tool === 'git' && call.args.includes('push'));
    expect(pushes.map((call) => call.args.at(-1))).toEqual([
      'bootstrap:refs/heads/main',
      'codex/instant-skip-engine:refs/heads/codex/instant-skip-engine',
      'codex/next-episode-navigation:refs/heads/codex/next-episode-navigation',
      'codex/settings-and-delivery:refs/heads/codex/settings-and-delivery',
    ]);
    const creates = entries.filter((call) => call.tool === 'gh' && call.args[1] === 'create');
    expect(creates).toHaveLength(3);
    expect(creates.every((call) => call.args.includes('--draft') && call.args.includes('ing2720/netflix-supporter'))).toBe(true);
    expect(entries.some((call) => call.args.some((arg) => ['--force', '--force-with-lease', '--delete', 'merge'].includes(arg)))).toBe(false);
  });
  it('resumes existing open PRs without duplicate PRs or another main push', () => {
    run('resume', true);
    expect(calls().some((call) => call.args.includes('bootstrap:refs/heads/main'))).toBe(false);
    expect(calls().some((call) => call.tool === 'gh' && call.args[1] === 'create')).toBe(false);
  });
});
