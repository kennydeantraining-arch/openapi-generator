# openapi-generator

Standing context for Claude Code in this repo. Keep it short — facts and rules.

## Build Rule: Audit Before Creating

Before creating any new file, feature, table, component, route, skill, agent, hook,
or integration:

1. Search the repo for existing versions.
2. Check `.claude/skills/`, `.claude/agents/`, `.claude/settings.json`, `src/`, `app/`,
   `lib/`, `components/`, `db/`, and docs.
3. Identify what already exists.
4. Reuse, extend, or refactor existing work before creating something new.
5. Only create a new thing if no existing thing can reasonably be extended.
6. Before writing code, show:
   - Existing assets found
   - What will be reused
   - What will be modified
   - What, if anything, must be created

If a new file or system is about to be created **without** an audit note covering the
four points above, stop and run the audit first. The reusable version of this rule
lives in the `/audit-before-build` skill (`.claude/skills/audit-before-build/`) — run it
before building anything new.
