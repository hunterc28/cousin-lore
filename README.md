# Cousin Lore

A single-page story-collection form. Cousins submit stories; the owner sees all of them in a private "Hunter's view" tab.

Live version: https://claude.ai/artifact/JRkxPPSAXyUvpfvqosn8Rz

## How it works

- `index.html` is the whole app — vanilla HTML/CSS/JS, no build step.
- Submissions are saved through the claude.ai artifact runtime (`claude.use("db")` / `claude.use("user")`), one document per submitter at `stories/<userId>` containing `{ name, stories: [{ id, story, ts }] }`.
- Access rules (declared on the artifact, not in this file): each submitter can read/write only their own document; only the artifact owner can read all of them.
- If the runtime isn't present (e.g. opened as a local file or on GitHub Pages), the page switches to a fallback mode: the submit button becomes "Copy to send to Hunter" and nothing is stored.

## Hosting elsewhere

To host this outside claude.ai with working submissions, replace the `db`/`user` logic in `init()` and the submit handler with another backend (Google Sheets via Apps Script, Supabase, Formspree, etc.). Everything else is portable.
