# AGENTS.md - Beads Village

AI agent guide for multi-agent task coordination via MCP.

**Backend**: Works with `bd` (Go/Beads) and `br` (Rust/Beads Rust). Auto-detected: **br preferred** when both installed. Override: `BEADS_BACKEND=bd|br`.

---

## Quick Start (MUST DO FIRST)

**CRITICAL**: Always call `init()` BEFORE any other Beads tool.

```
# Standard agent
init() → claim() → reserve(paths=[...]) → [work] → done(id, msg?) → RESTART SESSION

# Leader agent
init(leader=true) → add(title, tags=["fe"]) → assign(id, role)

# Worker agent
init(role="fe") → claim() → reserve(paths=[...]) → [work] → done(id, msg?)
```

> `start_tui` param is deprecated/no-op. Use `village_tui()` to launch dashboard manually.

---

## Decision Trees

### Starting a Session

```
Am I starting work?
├─ Yes → init() first, ALWAYS
│   ├─ Leader/coordinator? → init(leader=true)
│   ├─ Specialty? → init(role="fe/be/mobile/devops/qa")
│   └─ General → init()
└─ Already init'd → claim() or ls(status="ready")
```

### Getting Work

```
What task should I work on?
├─ Worker with role → claim() (auto-filters)
├─ Next priority → claim()
├─ See options → ls(status="ready", limit=5)
├─ Specific task → show(id="...")
└─ No tasks → add(title="...", desc="...")
```

### Before Editing Files

```
About to edit files?
├─ Yes → reservations() first
│   ├─ No conflicts → reserve(paths=[...], reason="bd-xxx")
│   └─ Conflicts → WAIT or msg() the holder
└─ Just reading → no reservation needed
```

### Completing Work

```
Task done?
├─ Fully complete → done(id, msg?="what I did")
├─ Blocked → add() blocker issue, release(), switch tasks
├─ Found side work (>2 min) → add(title, typ="bug/task")
└─ Need to pause → release() files, don't call done()
```

---

## Common Mistakes

**1. Not calling init() first** — Every other tool will fail. Always `init()` first.

**2. Editing without reservation** — Always `reservations()` then `reserve(paths)` before editing.

**3. Issues without description** — Always include `desc` with context: what, why, where found.

**4. Not releasing when switching** — `release()` before `claim()`-ing a different task.

**5. Forgetting to sync** — `sync()` before work; `done()` auto-syncs on completion.

---

## Tools Reference

### Lifecycle

- `init(ws?, team?, role?, leader?, start_tui?)` → `{ok, agent, ws, team, role}` — Start of EVERY session (`start_tui` param is deprecated no-op; use `village_tui()` instead)
- `claim()` → `{id, t, p, s}` or `{ok:0, msg}` — Get next task (auto-filters by role)
- `done(id, msg?)` → `{ok, done, hint}` — Complete task, auto-releases files (msg optional but strongly recommended)

### Issues

- `add(title, desc?, typ?, pri?, tags?, parent?, deps?)` → `{id, t, p, typ, tags}` — Create issue
- `assign(id, role, notify?)` → `{ok, id, role}` — Assign to role (leader only)
- `ls(status?, limit?, offset?)` → issue list — Filter: open/closed/ready/in_progress/all
- `show(id)` → full issue object — Get details

### File Locking

- `reserve(paths, reason?, ttl?)` → `{granted, conflicts}` — Lock before editing (TTL default 600s)
- `release(paths?)` → `{released}` — Unlock (empty=all)
- `reservations()` → active locks list — Check before editing

### Messaging

- `msg(subj, body?, to?, global?, cc?, thread?, ack_required?, importance?)` → `{sent}` — Send message
  - Broadcast: `msg(subj="...", body="...", global=true, to="all")`
  - Direct: `msg(subj="...", to="agent-id", global=true)`
  - Thread: `msg(subj="...", thread="bd-42")`
- `inbox(n?, unread?, global?, thread?)` → message list — Check messages (auto-cleans >7 days)

### Status & Discovery

- `status(include_agents?, include_bv?)` → workspace overview
  - Find teammates: `status(include_agents=true)`
  - Check bv: `status(include_bv=true)`

### Maintenance

- `sync()` → `{ok}` — Sync with git (bd: dolt push/pull, br: flush+import)
- `cleanup(days?)` → `{deleted}` — Remove old closed issues
- `doctor()` → health report — Fix database issues

### Dashboard & Graph (requires bv binary)

- `village_tui()` — Launch TUI dashboard for human monitoring
- `bv_insights()` — Bottlenecks, keystones, cycles, PageRank
- `bv_plan()` — Parallel execution tracks
- `bv_priority(limit?)` — Priority recommendations
- `bv_diff(since?, as_of?)` — Compare issue changes between revisions

### br-Only Tools (requires beads_rust backend)

These return error with install hint when `bd` is active:

- `search(query, status?, label?, limit?)` — Full-text issue search
- `stale(days?, status?)` — Find stale issues (default: 30 days)
- `changelog(since?, since_tag?)` — Generate changelog from closed issues
- `graph(issue?, all?, compact?)` — Visualize dependency graph
- `defer(ids, until?)` — Schedule issues for later
- `undefer(ids)` — Make deferred issues ready again

### Hive Bridge Tools (optional, when `.hive/` exists)

Only registered when Agent Hive is detected:

- `hive_lock(paths, task, ttl?)` → `{granted, conflicts}` — Reserve files for Hive task
- `hive_unlock()` → `{released}` — Release all Hive reservations
- `hive_status_bridge(include_agents?, include_bv?)` — Combined Hive + Beads status

**Tool counts**: 21 core + 6 br-only + 3 optional hive bridge = 30 max

---

## Issue Types and Priority

**Types**: `task` (default, general work), `bug` (broken), `feature` (new), `epic` (large with sub-tasks), `chore` (maintenance)

**Priority**: 0=critical (production down), 1=high (blocking), 2=medium (default), 3=low (nice-to-have), 4=backlog

---

## Roles and Teams

### Roles

- `fe` — Frontend (*.tsx,*.vue, *.css, src/components/)
- `be` — Backend (*.py,*.go, src/api/, src/services/)
- `mobile` — Mobile (*.swift,*.kt, android/, ios/)
- `devops` — Infrastructure (Dockerfile, *.yaml, terraform/)
- `qa` — Testing (*.test.*, *.spec.*, e2e/, tests/)

### Role-Based Filtering

Leaders create tasks with `tags=["fe"]`. Workers with `role="fe"` call `claim()` — system auto-filters to matching tags. Untagged tasks are visible to everyone.

### Teams

Teams group agents working on the same project. Created automatically on first `init(team="name")`.

**Key rules**:

- Same team: agents see each other via `status(include_agents=true)`, exchange messages via `msg(global=true)`
- Different teams: completely isolated
- No team specified: joins `default` (all unassigned agents share this)
- Switch teams: call `init(team="other")` — scopes all messaging/discovery to new team

**Architecture**:

```
~/.beads-village/
├── <team-name>/
│   ├── mail/     # Team broadcasts
│   └── agents/   # Agent registry
└── default/      # All unassigned agents
```

**Scoping**: Local (`/workspace/.mail/`) = this workspace only. Team (`~/.beads-village/{team}/mail/`) = all agents in team.

---

## Workflow Patterns

### Standard Task

```python
init()
claim()  # → {"id":"bd-42", "t":"Add login", "p":1, "s":"in_progress"}
reserve(paths=["src/auth.py"], reason="bd-42", ttl=600)
[implement]
done(id="bd-42", msg="Implemented login with JWT tokens")
# RESTART SESSION
```

### Side Issue Discovery

```python
# While working on bd-42, find a bug
add(title="Password validation missing",
    desc="Found during bd-42. No min length check.",
    typ="bug", pri=2, tags=["be"], parent="bd-42")
# Continue original task
done(id="bd-42", msg="Login done. Filed bd-43 for validation.")
```

### File Conflict Resolution

```python
reservations()  # Check locks first
# If conflict: wait, msg() the holder, or claim() different task
# NEVER force-edit locked files
```

### Leader Assignment

```python
init(team="proj", leader=true)
add(title="Login API", tags=["be"])
add(title="Login form", tags=["fe"])
assign(id="bd-15", role="mobile")  # Explicit reassign
msg(subj="Sprint started", body="Claim your tasks!", global=true, to="all")
```

### Cross-Workspace Coordination

```python
# BE agent finishes work
done(id="bd-10", msg="Login API ready")
msg(subj="Auth API Ready", body="POST /auth/login returns JWT", global=true, to="all")

# FE agent picks up
inbox()  # Sees broadcast from BE
claim()  # Gets FE task
```

### Blocked Task

```python
claim()  # Get task, discover it's blocked
add(title="Need schema update", desc="bd-42 blocked", typ="task", pri=1)
release()  # Free files
claim()  # Work on something else
```

---

## Error Recovery

- `workspace not found` — Check path in init()
- `bd/br CLI not found` — Install: `cargo install --git https://github.com/Dicklesworthstone/beads_rust` (preferred) or `pip install beads`
- `no ready tasks` — `add()` to create or `ls()` to see all
- `file reserved by agent-X` — Wait, `msg()` agent, or work elsewhere
- `timeout` — `sync()` manually, check network

**When things break**: `doctor()` → `sync()` → `cleanup(days=2)` → `inbox(unread=true)`

---

## Best Practices

**Before starting**: `init()` → `inbox()` → `ls(status="ready")`

**During work**: Always `reserve()` before editing. File side-issues with `add()`. Keep TTL short (600s). Check `reservations()` before touching new files.

**On completion**: Descriptive `msg` in `done()`. Broadcast important completions with `msg(global=true, to="all")`. Restart session.

**Maintenance**: `cleanup(days=2)` every few days. `doctor()` for health. Keep <200 open issues.

---

## Response Fields

- `id` — Issue ID ("bd-42")
- `t` — Title
- `p` — Priority (0-4)
- `s` — Status (open/in_progress/closed)
- `f` — From (sender agent ID)
- `b` — Body text
- `ts` — Timestamp
- `ws` — Workspace path
- `team` — Team name
- `role` — Agent role
- `leader` — Is leader (bool)
- `tags` — Role tags on issue (["be","fe"])
- `global` — From team hub (bool)
- `imp` — Importance (low/normal/high)

<!-- context-mode:start -->
# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED

Any shell command containing `curl` or `wget` will be intercepted and blocked by the context-mode plugin. Do NOT retry.
Instead use:

- `mcp__context-mode__ctx_fetch_and_index(url, source)` to fetch and index web pages
- `mcp__context-mode__ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED

Any shell command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` will be intercepted and blocked. Do NOT retry with shell.
Instead use:

- `mcp__context-mode__ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### Direct web fetching — BLOCKED

Do NOT use any direct URL fetching tool. Use the sandbox equivalent.
Instead use:

- `mcp__context-mode__ctx_fetch_and_index(url, source)` then `mcp__context-mode__ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Shell (>20 lines output)

Shell is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:

- `mcp__context-mode__ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `mcp__context-mode__ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### File reading (for analysis)

If you are reading a file to **edit** it → reading is correct (edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `mcp__context-mode__ctx_execute_file(path, language, code)` instead. Only your printed summary enters context.

### grep / search (large results)

Search results can flood context. Use `mcp__context-mode__ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `mcp__context-mode__ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `mcp__context-mode__ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `mcp__context-mode__ctx_execute(language, code)` | `mcp__context-mode__ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `mcp__context-mode__ctx_fetch_and_index(url, source)` then `mcp__context-mode__ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `mcp__context-mode__ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `search(source: "label")` later.

## ctx commands

- `ctx stats` — Call the `stats` MCP tool and display the full output verbatim
- `ctx doctor` — Call the `doctor` MCP tool, run the returned shell command, display as checklist
- `ctx upgrade` — Call the `upgrade` MCP tool, run the returned shell command, display as checklist
<!-- context-mode:end -->

tilth — code intelligence MCP server. Replaces grep, cat, find, ls with AST-aware equivalents.

To explore code, always search first. tilth_search finds definitions, usages, and file locations in one call.
Usage: tilth_search(query: "handleRequest").
tilth_files is ONLY for listing directory contents when you have no symbol or text to search for.
DO NOT use Read if content is already shown in expanded search results.
DO NOT use Grep, Read, or Glob. Always use the better tools tilth_search (grep), tilth_read (read), tilth_files (glob).

tilth_search: Search code — finds definitions, usages, and text. Replaces grep/rg for all code search.
Comma-separated symbols for multi-symbol lookup (max 5).
kind: "symbol" (default) | "content" (strings/comments) | "callers" (call sites)
expand (default 2): inline full source for top matches.
context: path to file being edited — boosts nearby results.
Output per match:

## <path>:<start>-<end> [definition|usage|impl]

<outline context>
<expanded source block>
── calls ──
<name>  <path>:<start>-<end>  <signature>
── siblings ──
<name>  <path>:<start>-<end>  <signature>
Re-expanding a previously shown definition returns [shown earlier].

tilth_read: Read file content with smart outlining. Replaces cat/head/tail.
Small files → full content. Large files → structural outline.
section: "<start>-<end>" or "<heading text>"
paths: read multiple files in one call.
Output:
<line_number> │ <content>                  ← full/section mode
[<start>-<end>]  <symbol name>             ← outline mode

tilth_files: Find files by glob pattern. Replaces find, ls, pwd, and the host Glob tool.
Output: <path>  (~<token_count> tokens). Respects .gitignore.

tilth_deps: Blast-radius check — what imports this file and what it imports.
Use ONLY before renaming, removing, or changing an export's signature.

To search code, use tilth_search instead of Grep or Bash(grep/rg).
To read files, use tilth_read instead of Read or Bash(cat).
To find files, use tilth_files instead of Glob or Bash(find/ls).
DO NOT re-read files already shown in expanded search results.

tilth_edit: Edit files using hash-anchored lines. Replaces the host Edit tool.
tilth_read → copy anchors (<line>:<hash>) → pass to tilth_edit.
Single line: {"start": "<line>:<hash>", "content": "<new code>"}
Range: {"start": "<line>:<hash>", "end": "<line>:<hash>", "content": "..."}
Delete: {"start": "<line>:<hash>", "content": ""}
Hash mismatch → file changed, re-read and retry.
Large files: tilth_read shows outline — use section to get hashlined content.
After editing a function signature, tilth_edit shows callers that may need updating.
DO NOT use the host Edit tool. Use tilth_edit for all edits.
