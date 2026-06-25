---
name: audit-before-build
description: Inspect the existing project before creating anything new. Use before building features, agents, skills, hooks, CRM flows, dashboards, automations, or integrations.
---

# Audit Before Build

You are not allowed to create new files or systems until you complete this audit.

## Step 1: Inventory

Search for existing:

- Components
- Routes/pages
- API endpoints
- Database tables/schemas
- CRM logic
- Automation logic
- Claude skills
- Claude agents
- Hooks
- MCP configs
- Environment variables
- Docs/SOPs

Check at least: `.claude/skills/`, `.claude/agents/`, `.claude/settings.json`,
`src/`, `app/`, `lib/`, `components/`, `db/`, and the repo's docs.

## Step 2: Report

Return a table:

| Area | Found | Reuse? | Action |
|---|---|---|---|

## Step 3: Decision

Choose one:

- Reuse existing
- Extend existing
- Refactor existing
- Create new only if necessary

## Step 4: Build Plan

Do not edit yet. First show the exact files that will be changed:

- Existing assets found
- What will be reused
- What will be modified
- What, if anything, must be created

Only after this audit note is shown may new files be created. If a new file or
system is about to be created without it, stop and run this audit first.
