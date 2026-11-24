# Prototype plan: Copilot BYOK tool search through 9Router

## Decision gate

Phases 1 and 2 passed after user-authorized manual sign-in. Copied VS Code host plus installed 9Router 2.1.0 extension completed local synthetic conversations with both GPT and Claude wire identities. All 180 fixture tools stayed registered; search discovered and executed tools at positions 179/180. No manual pruning or full VS Code build required.

## Verified implementation and path forward

Two copied-host changes enable generic runtime tool search for BYOK and separate provider-qualified behavior identity from original wire model. Bridge cap stays unchanged. Full extension requests contained 26 tools initially, then 31/31/31; both late-list project handlers executed with correct arguments. Wire models remained `gh/gpt-6.1-sol` and `gh/claude-opus-5.5`. Assertions require actual extension HTTP requests, rejecting native-provider fallback.

Version-pinned patch generator: `scripts/prototype-byok-tool-search.cjs`. Accepts original bundle and new output file; checks original SHA-256, requires unique anchors, refuses overwrites, never edits input. Run `node scripts\prototype-byok-tool-search.cjs --self-test`. Supports only recorded VS Code 1.147.0 bundle; do not patch active installation. Session artifacts retain working copied editor, backup, manifest, fixture, recording endpoint, `extension-wire-gpt-claude-results.json`, per-model host results, and runnable `verify-wire.cjs`.

Product path: submit equivalent small source changes and regression tests upstream to VS Code; retain copied-editor workaround for evaluation. Gateway or extension alone cannot enable host-owned search. No permanent fork or full build needed for proof.

Limits: deterministic local provider, not real-model search quality. Actual workspace switching, dynamic tool refresh, cancellation and parallel execution remain unverified. Generic identity can change model-family prompt behavior; broader upstream regression coverage needed. UI model selection races session creation: early attempts silently used native Copilot; only recorded extension HTTP traffic counts as pass. Some synthetic prompts reached native Copilot during failed selection attempts; no repository code or credentials intentionally included.

Security: original editor/profile configuration stays outside patch target. Temporary synthetic-profile activation injection restored after testing; endpoint profile exists only in disposable SecretStorage. Test endpoint/editor helpers stopped after checks. Integrity check covers original host and 13 sampled profile configuration/snippet files, not mutable databases or OS credential-vault byte equality.

Historical pre-sign-in result below is retained for experiment chronology; authentication blocker is resolved.

## Historical copied-host result — before authorized sign-in

Created a complete editor copy under the current session's `files/host-integration/editor` directory. Patched only its host bundle, with exact-match guards, original-byte backup, and SHA-256 patch manifest. Candidate patch enables BYOK search eligibility and supplies provider-qualified behavior identity plus explicit original wire model.

Isolation measures:

- Separate portable `data`, explicit `--user-data-dir`, explicit `--extensions-dir`, and synthetic extension-development directory.
- Separate HOME, USERPROFILE, COPILOT_HOME, and XDG_CONFIG_HOME; credential environment variables stripped.
- No installed user extensions or profile settings copied. Updates and telemetry disabled in the disposable profile.
- Only empty synthetic workspace opened. Its trust approval belongs to the disposable profile; global workspace-trust protection was not disabled.
- No sign-in performed, real-provider calls made, or original editor files changed.

Verified: copied editor boots; synthetic extension registers 180 tools; host publishes its BYOK model; real agent-host session is created and receives client tools. Fresh-profile chat then displays “Sign in to use GitHub Copilot” before inference. Provider callback receives zero requests, so actual bridge tool deferral and sentinel execution remain unverified. Authentication was not bypassed.

All isolated editor process trees were stopped. Reproducible launch, fixture, backup, patch manifest, logs, and isolation checks remain in session artifacts. Before/after SHA-256 check confirms original host unchanged and all 13 sampled profile configuration/snippet files unchanged. Mutable `globalStorage`, `workspaceStorage`, and `History` were excluded because the user's normal editor remains active; this is not a byte-for-byte audit of every profile database.

Next decision: explicitly sign in inside the disposable editor, without Settings Sync, then rerun the local synthetic provider test; alternatively stop here and pursue a source-level integration test that does not need UI authentication. No successful end-to-end host result is claimed.

## Phase 1 results — decision ready

Tested installed SDK `1.0.33-preview.0` and runtime `1.0.111-0`, not a downloaded replacement. SDK JavaScript and dependencies were copied from the installed ASAR into session artifacts using Node standard-library code; the original installed runtime executable was launched unchanged.

| Case | Initial tools | Later tools | Sentinels at positions 179/180 | Effective deferral |
| --- | ---: | ---: | --- | --- |
| Search disabled, generic identity | 198 | — | Not requested in baseline | No |
| Search enabled, generic identity, Chat Completions | 19 | 24 | Both executed | Yes |
| Search enabled, native GPT behavior identity | 197 | 197 | Both executed in uncapped direct SDK | No |
| Search enabled, native Claude behavior identity | 199 | 199 | Both executed in uncapped direct SDK | No |
| Generic identity, Responses, GPT wire model | 19 | 24 | Both executed | Yes |
| Generic identity, Responses, Claude wire model | 19 | 24 | Both executed | Yes |

The direct SDK does not impose VS Code's bridge cap. Native-identity sentinel execution therefore does not mean those cases would survive the actual bridge. They are negative deferral controls, not successful workarounds.

Generic search is runtime-owned: no replacement search callback was needed. Its function schema exposes `query` and `limit`. Both harmless sentinel calls reached the permission callback with `kind: custom-tool`; only that category was approved, and all other permission categories were denied. No broad permission bypass was enabled.

Assertions verify both project handlers execute, the beta result returns to the model request, every generic request stays below 128 tools, generic requests contain no native `tool_search` type, and the configured wire model is unchanged. Synthetic fixtures exercise two projects in one session; actual workspace switching, tool refresh, parallel calls, and full VS Code permission integration remain unverified.

Artifacts in the current session's `files` directory:

- `prepare-sdk.cjs`: extracts installed SDK and its dependencies without package installation.
- `tool-search-prototype.cjs`: runnable local recording-provider check, including six identity/wire cases.
- `tool-search-results.json`: synthetic request metadata and results.

Rerun from PowerShell:

```powershell
node 'C:\Users\heads\.copilot\session-state\c2b78c72-3084-4957-a912-51c6ec719229\files\tool-search-prototype.cjs'
```

The endpoint bound only to `127.0.0.1`. No actual model/provider calls were made, no real credentials were supplied, and no project content was sent. Child environment credential variables were removed, telemetry was disabled, and session configuration was isolated. Runtime and HTTP helpers were stopped after checks. SDK copies and isolated runtime state remain session artifacts for reproducibility.

### Recommended next decision

Approve an isolated host integration experiment, not a full VS Code build yet. Candidate source change has two coupled parts:

1. Permit BYOK generic client search when the existing Search Tools toggle is enabled.
2. Give BYOK runtime behavior lookup a provider-qualified generic identity while retaining explicit original wire model routing. Do not globally rewrite native model identities or remove prompt-family behavior without testing consequences.

Installed launcher bytes confirm the model eligibility gate exists. Upstream source and installed SDK contract distinguish behavior `modelId` from inference `wireModel`; the prototype proves those can be separated. Exact host model descriptor mapping and prompt-policy effects still require integration testing.

Use a copied editor installation/disposable profile if temporary host patching is approved. Verify tools beyond the actual bridge cap, both project tool sets, permission behavior, tool refresh, cancellation, and model switching. If the copied-host test works, prepare a small upstream source patch/tests; otherwise report the new blocker before expanding scope. Real-provider validation is a separate approval because calls may consume credits and transmit synthetic prompts to the configured provider.

## Required outcome

All configured tools remain discoverable and executable across projects, including tools beyond the first 128. No manual tool pruning, warning suppression as a substitute for functionality, or permanent VS Code fork.

## Evidence established

- Installed VS Code version: 1.147.0, commit `8a14f0cc1b08d531eb83255ea3764ae22aa932b5`.
- Local agent-host logs show 128 of 173 tools forwarded for 9Router; 45 omitted.
- Installed host applies a hardcoded 128-tool BYOK bridge cap before the extension receives requests.
- Warning deduplication remembers the last omitted count. Alternating counts such as 44 and 45 produce repeated warnings.
- Public SDK reproduction reports working provider-neutral tool search with 158 external tools. This has not been reproduced on this machine or verified with its runtime.
- Numeric extension `toolCalling` capability is not a demonstrated solution: inspected host metadata conversion coerces it to a boolean, and the BYOK cap is separate.

References:

- https://github.com/microsoft/vscode/issues/347351
- https://github.com/microsoft/vscode/issues/347754#issuecomment-6847172563
- https://github.com/microsoft/vscode/issues/329337
- https://github.com/microsoft/vscode/pull/344839

## Hypothesis

The bundled Copilot runtime can defer external tools behind a function-based `tool_search_tool` when generic client search is enabled with a provider-qualified model identity. VS Code's BYOK launcher/capability selection may prevent that path or select a provider-native search protocol that the bridge cannot translate.

A launcher-only fix is a hypothesis, not a promised outcome. Prompt-family hints, wire model routing, SDK behavior, and bridge translation must be tested independently.

## Phase 1: isolated prototype, no editor patch

### 1. Inspect exact installed runtime contract

- Locate the SDK and runtime bundled with the installed editor; record their versions.
- Inspect session configuration, tool-search activation, model identity/family handling, and tool registration APIs.
- Reuse installed tools and dependencies. Do not download or upgrade a different runtime to make the experiment pass.
- Keep prototype files and results in the current Copilot session's `files` directory, outside tracked source.

### 2. Establish deterministic baseline

- Start a loopback-only recording endpoint using Node standard-library HTTP support.
- Register at least 180 uniquely named synthetic external tools with harmless handlers.
- Place a sentinel tool after index 128. Add tools tagged for two synthetic projects to detect missing project-specific tools.
- Capture request metadata and synthetic tool definitions only; use no real project content or credentials.
- With search disabled, establish whether the direct SDK sends all definitions. Separately confirm where the actual host bridge applies truncation; do not assume direct SDK includes that bridge.

### 3. Exercise generic client search

- Enable client tool search through the installed SDK's supported configuration.
- Use a provider-qualified model identity while preserving the actual endpoint/model routing.
- Drive deterministic search, load, call, and answer responses through the recording endpoint.
- Verify which search functions are runtime-owned and which require client callbacks; provide only callbacks required by the actual contract.
- Assert the sentinel handler executes, its schema is correct, and its result returns to the conversation.
- Assert initial requests defer external definitions and stay below 128 tools for this fixture. Record subsequent tool counts and loaded names.

### 4. Compare identity and lifecycle cases

- Compare search disabled versus enabled.
- Test provider-qualified GPT and Claude identities, with and without family hints where the SDK exposes them.
- Verify no unsupported native `tool_search` type crosses the function-only bridge path.
- Exercise tools from both synthetic projects, parallel calls if supported, and tool-list refresh between turns or replacement sessions according to the installed API.
- Preserve existing consent/permission behavior. Synthetic handler execution does not establish real VS Code permission parity.

### 5. Optional real-provider confirmation

Only after deterministic checks pass and explicit approval for provider calls:

- Route a synthetic conversation through the existing local 9Router endpoint using an already configured model.
- Use synthetic tools/content only, bounded turns, request timeout, and cancellation.
- Confirm the model discovers and calls a tool beyond the first 128.
- Never print tokens, custom authorization headers, or conversation payloads from real sessions. Provider calls may consume credits.

## Prototype checks and acceptance criteria

Leave one runnable check using existing dependencies and Node assertions; no new test framework.

The isolated prototype passes only if:

1. All 180+ fixture tools remain registered and searchable, without manual selection.
2. Initial requests contain generic search plus a bounded active tool set rather than all external definitions.
3. A tool beyond index 128 is found, loaded, executed, and its result consumed.
4. Both synthetic projects' tools work without manual reconfiguration.
5. GPT/Claude identity cases identify a compatible generic path without changing upstream model routing.
6. No permission bypass, external listener, credential disclosure, or unrelated source modification occurs.

Report bridge integration separately. Direct SDK success is not proof of success inside VS Code.

## Phase 2: decision after prototype

Return a concise evidence report: installed versions, runnable command, tool counts, sentinel execution results, identity matrix, limitations, and smallest candidate host change.

Choose one outcome before further implementation:

- **Generic SDK search works:** propose a focused VS Code launcher/identity patch and regression tests. Request approval for an isolated host integration experiment.
- **SDK works but bridge rejects required protocol:** scope bridge translation changes; revise effort estimate before proceeding.
- **Installed runtime cannot perform generic search:** stop. Document the blocking contract/version and upstream dependency. Do not replace it with warning suppression or pruning.

## Phase 3: host integration, separately authorized

- Prefer a disposable editor instance/profile and copied installation; never modify the shared running editor during a session.
- Preserve original bytes, record exact version/hash, and provide rollback before any temporary bundle patch.
- Verify actual VS Code request flow through the 9Router extension, discovery of the sentinel tool, tool permissions, cancellation, and project-specific tool availability.
- Keep the existing 128 cap as fallback when search is unavailable. Independently test warning deduplication across changing omission counts and accurate bridge-limit wording.
- If successful, translate the experiment into a source patch with focused upstream tests and an upstream PR draft. No PR publication or permanent fork without approval.
- A temporary installed-host patch is an optional experiment, not the durable deliverable; editor updates can overwrite it.

## Effort and stop conditions

Initial investigation budget: approximately 2–4 engineering hours, not an unattended wall-clock guarantee. Stop at a decision point if the bundled API differs materially, native protocol translation is required, or host build work becomes necessary.

If the prototype succeeds, earlier rough estimate remains 1–2 engineering days for a focused source patch and tests, plus roughly half to one day for custom editor build/package validation if needed. Upstream release timing is external.

## Cleanup and source preservation

Stop only processes started by the experiment, using their recorded IDs. Keep the final runnable session artifact and concise results; remove disposable recordings, profiles, and temporary editor copies when no longer needed. Preserve existing uncommitted changes in both repositories.
