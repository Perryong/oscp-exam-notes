# Structured study note templates

User-approved outcome: templates for OSCP boxes and AI-300 labs with objectives, commands, evidence, findings and lessons learned. Existing notes and resource files must stay intact.

Use the existing rich-text document format and new-note repository API. Expand the two existing templates with short editable prompts and a command/prompt code block. Add a workspace-specific template action on Notes, alongside the existing blank New note action. Machine-linked notes and AI lesson notes already use these factories and will pick up the richer structure only when created. Preserve lesson references, workspace/target linking and all saved note bodies. No schema, migration, rules, sync or resource-dataset changes; no automatic execution of recorded commands.

1. Write failing tests for required sections, schema compatibility, linked-template creation and preservation of saved content. Add an emulator browser flow for Notes actions, editing, sync/reload and workspace isolation.
2. Expand OSCP/AI-300 template content and expose template creation on Notes with busy/error handling.
3. Run targeted and full tests, typecheck/build, emulator browser checks and an independent final review.

## Progress
- Existing linked-note factories identified; blank notes and imported lesson content remain separate. Work isolated on codex/structured-study-templates. Unrelated machine-guide draft preserved.
- Regression tests first failed on missing structured sections/code blocks and the absent Notes action. Expanded factories and the new action made all targeted tests pass.
- Full suite: 42 files / 115 unit tests and all 10 importer tests passed. Typecheck/production build passed. Five emulator browser tests passed (template creation, editable command blocks, sync/reload, linked machines, existing note preservation and workspace isolation). Additional mobile/desktop visual pass passed without horizontal overflow; screenshots reviewed.
- Final independent review: no Critical, Important or Minor findings. Nine targeted tests independently passed. No resource, schema, repository, persistence or Firebase files changed.
- Review scope: production deployment/live behavior remain outside this local feature change; full suite/emulator evidence verified by implementer; mobile screenshots checked by implementer; templates are study prompts rather than an official exam-requirements checklist; unrelated machine-guide draft remains untouched.
- Subsequent deployment authorization fulfilled: Vercel dpl_8h7DyySHiDWnsxk5HqEeUxJaQyba is live. Both template creation actions passed authenticated production creation/sync/reload checks, with exactly one new test note per workspace and unchanged existing note entries/resources. See docs/deployment.md.
