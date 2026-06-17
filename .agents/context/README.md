# Local Agent Context

Use this directory for local reference material that helps AI agents and
developers understand the current work without committing temporary or private
context to the repository.

Good uses include:

- Local reference notes.
- Temporary research.
- Implementation context.
- Screenshot notes.
- Handoff details.

Do not put secrets, credentials, production tokens, or private customer data in
this directory.

Agents may read files in this directory for context, but they should not assume
those files exist in another clone. User-added files under `.agents/context/`
are intentionally ignored by Git and should stay local.
