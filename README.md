# Cousin Lore

A single-page story-collection form. Cousins open a link, type a story, and hit Submit. Every story lands as a row in a Google Sheet that only Hunter can see. No account or sign-in needed for the cousins.

- **Page:** `index.html` — vanilla HTML/CSS/JS, no build step. Hosted on GitHub Pages at https://hunterc28.github.io/cousin-lore/
- **Config:** `config.js` — holds the one URL the page needs.
- **Backend:** `apps-script/Code.gs` — a Google Apps Script that lives inside the Sheet and accepts submissions.

## One-time setup (about 10 minutes)

### 1. Make the Sheet

1. Go to https://sheets.new and create a blank spreadsheet. Name it anything, e.g. **Cousin Lore**.
2. In the menu, open **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete whatever is in `Code.gs` there and paste in the full contents of [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. Click the save icon (or ⌘S).

### 2. Deploy it as a web app

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Fill in:
   - Description: anything, e.g. `cousin lore v1`
   - **Execute as: Me**
   - **Who has access: Anyone**
4. Click **Deploy**. Google will ask you to authorize the script. Click through: **Authorize access → choose your account → Advanced → Go to (project name) → Allow**. The warning is normal for personal scripts.
5. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfycb.../exec`.

### 3. Point the page at it

1. Open `config.js` in this repo and paste the URL between the quotes:
   ```js
   window.COUSIN_LORE_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
2. Commit and push. GitHub Pages redeploys in about a minute.
3. Open https://hunterc28.github.io/cousin-lore/ and submit a test story. It should appear in the Sheet within a few seconds, on a tab called **Stories**.

Share the Pages link with the cousins. You're done.

## How it works

- The page POSTs `{ action: "add", name, story, id, ts, device }` to the Apps Script URL. The script appends a row: timestamp, name, story, story ID, device ID.
- The page remembers its own submissions in the browser's local storage, so a cousin sees "Your stories so far" and a progress bar on that device. The `device` value is a random ID the browser makes up; it lets a cousin remove a story they submitted from the same device, and nothing else.
- A GET to the same URL returns total story and cousin counts, which the page shows as "The family has 23 stories from 6 cousins so far."
- If `config.js` has no URL, or the server can't be reached, the page falls back to a **Copy to send to Hunter** button so nothing is lost.

## Changing the script later

If you edit `Code.gs` in the Apps Script editor, the live URL does **not** pick up changes until you redeploy: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The URL stays the same.

## Privacy

The Sheet is private to your Google account. The web app URL accepts new stories from anyone who has it, and returns only counts, never the stories themselves. Keep the Sheet unshared and the stories stay between you and the cousins.

## Older version

An earlier version of this page ran as a claude.ai artifact and stored submissions there: https://claude.ai/artifact/JRkxPPSAXyUvpfvqosn8Rz. It still works for anyone signed in to Claude, but the Sheets version is now the main one.
