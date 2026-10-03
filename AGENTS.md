# Netflix Supporter working agreement

## Product

- Keep the extension small: no artificial click delay, video overlays, analytics, remote services, or video/subtitle collection.
- Click only recognized, visible, enabled Netflix skip controls. Never treat an arbitrary Play/Next/추천 button as a next episode.
- Keep settings in chrome.storage.local. Request only the permissions needed by the implemented behavior.
- Tests and docs must distinguish synthetic fixtures from real Netflix validation. Do not invent measurements or claim untested platforms.

## Git and authorization

- Scope all Git operations to this repository. Authentication availability is not authorization for another repository or an unrelated future task.
- During the currently authorized initial implementation, local changes, commits, codex/* branch pushes, and draft PR creation are permitted.
- main begins with a documentation-only bootstrap commit. All implementation follows in feature branches.
- Do not merge PRs, force push, delete remote branches, change repository visibility, or modify access/branch protection without an explicit user request.
- Before every push, inspect the current branch, explicit branch being published, and exact remote URL. Push one verified branch at a time; never use a broad mirror/all push.
- Split PRs by a coherent behavior/decision and its validation, not arbitrary file counts. Include tests with their behavior change.
- If a PR depends on another unmerged PR, target that branch and explain the dependency. Do not duplicate the entire accumulated change against main.
- Keep secrets, cookies, account details, private viewing history, and local authentication outside Git.
- Never manufacture commit dates, collaboration, testing, or development history for the portfolio.

## Validation

- Run the repository check command before committing implementation.
- Changes to matching, observer lifecycle, visibility, or duplicate suppression need focused regression tests.
- Use a synthetic browser fixture to inspect layout and exercise activation transitions, and record it as synthetic.
- Real Netflix selectors are an integration contract that may change. Fail closed on unknown controls and document limitations.
