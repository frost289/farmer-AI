# Git Workflow

Applies to every member. Short version of `CONTRIBUTING.md`.

## 1. Branches

```
main        stable, deployable (Member 1 merges from develop)
develop     integration branch
feature/<module>-<name>   new work     e.g. feature/api-farms
fix/<module>-<name>       bug fixes    e.g. fix/web-login-redirect
docs/<name>               doc changes
```

Never push directly to `main` or `develop`.

## 2. Daily Flow

```bash
git checkout develop && git pull
git checkout -b feature/web-farm-form
# work, then:
git add .
git commit -m "feat(web): add farm creation form"
git push -u origin feature/web-farm-form
# open a pull request into develop
```

Update your branch often:
```bash
git fetch origin && git rebase origin/develop
```

## 3. Commit Messages (Conventional Commits)

`type(scope): short description`

| Type | Use |
|---|---|
| `feat` | new feature |
| `fix` | bug fix |
| `docs` | documentation |
| `refactor` | code change, no behavior change |
| `test` | tests |
| `chore` | tooling, config, dependencies |

Scopes: `web`, `api`, `advisory`, `vision`, `docs`, `db`, `ci`.
Examples: `feat(api): add diagnosis endpoint`, `fix(vision): handle blurry images`, `docs: update shared fields`.

## 4. Pull Requests

- Target `develop`. Keep them small (under about 400 changed lines).
- Fill in the pull request template checklist.
- Link the issue (`Closes #12`).
- At least one approval from a code owner. CI must pass.
- Squash merge, then delete the branch.

## 5. Contract Changes

Changes to `API_SPECIFICATION.md`, `api-spec.yaml`, `SHARED_DATA_FIELDS.md`, `DATABASE_SCHEMA.md` or `ERROR_FORMATS.md`:
1. Open a "Contract change request" issue.
2. Change the docs in a separate `docs/` pull request first.
3. All affected members approve.
4. Then change the code.

## 6. Releases

After the weekly sync, Member 1 merges `develop` into `main` and tags it:
```bash
git tag -a v0.1.0 -m "Phase 1 foundation"
git push origin v0.1.0
```
Versioning: `v<major>.<minor>.<patch>`.

## 7. Never Commit

`.env` files, secrets, datasets, trained models, `node_modules/`, uploads. See `.gitignore`.

## 8. Resolving Conflicts

1. `git fetch origin && git rebase origin/develop`
2. Fix conflicts in the editor, `git add` the files, `git rebase --continue`.
3. Run lint and tests again before pushing (`git push --force-with-lease` only on your own feature branch).
