# Repository Guidelines

## Project Structure & Module Organization
- Place code in `src/`, tests in `tests/`, scripts in `scripts/`, docs in `docs/`, and static assets in `assets/`.
- Mirror structure between `src/` and `tests/` (e.g., `src/utils/time.py` → `tests/utils/test_time.py`).
- Keep CLIs or entry points in `src/` or `scripts/` and keep modules small and single‑purpose.

## Build, Test, and Development Commands
- Install deps: `make setup` (if a `Makefile` exists). Otherwise use the language’s package manager (e.g., `pip install -r requirements.txt`, `npm ci`).
- Run tests: `make test` or framework-specific (`pytest -q`, `npm test`).
- Lint/format: `make lint` / `make fmt` (e.g., `ruff check`, `black .`, `eslint .`, `prettier --check .`).
- Run locally: `make run` or project entry (e.g., `python -m app`, `npm start`).

## Coding Style & Naming Conventions
- Indentation: 4 spaces for Python; 2 spaces for JS/TS/JSON/YAML.
- Names: `snake_case` for Python files/functions; `camelCase` for variables/functions in JS/TS; `PascalCase` for classes; CLI/script files use `kebab-case`.
- Keep functions <50 lines; prefer pure functions; document non-obvious behavior with short docstrings/comments.
- Use formatters/linters if present (e.g., `black`, `ruff`, `eslint`, `prettier`). Do not disable rules repo‑wide without discussion.

## Testing Guidelines
- Frameworks: prefer `pytest` for Python, `vitest/jest` for JS/TS.
- Organization: tests live in `tests/` and mirror `src/` paths; name files `test_*.py` (Python) or `*.spec.ts/js` (JS/TS).
- Coverage: aim for ≥80% of changed lines; add tests for bugs before fixing.
- Fast tests default; mark slow/integration as such (e.g., `@pytest.mark.slow`).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. Example: `fix(utils): handle empty input in parser`.
- Keep commits focused and atomic; include rationale in the body when non‑trivial.
- PRs must include: clear description, linked issue (e.g., `Closes #123`), before/after notes or screenshots (if UX), and how to test locally.

## Security & Configuration Tips
- Never commit secrets; use `.env` with `.env.example` for required keys.
- Validate and sanitize all inputs; prefer parameterized queries and safe serializers.
- Pin dependencies where practical; run `make audit` if provided (e.g., `pip-audit`, `npm audit`).

## Agent-Specific Instructions
- Keep diffs minimal and scoped; do not change unrelated files.
- Follow the structure and style above; prefer small, composable modules.
- Update documentation and tests alongside code changes; avoid adding licenses/headers.
