# After

A tap-through illustrated storybook for phones. It's a Progressive Web App, so it opens from a link and can be added to the home screen. No app store, no accounts, no server: everything the player writes stays on their phone.

**Status:** Chapter 1 is complete, with placeholder panels. Chapters 2 to 9 come next.

## Trying it on your phone

Open the app's link (see "Publishing" below), then:

- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** tap the ⋮ menu, then **Add to Home screen** or **Install app**.

It then opens full screen from its own icon, like an app, and works offline.

To test again from the start: ☰ menu, then **Start over**.

## Editing the words

All the words are in `src/story/`. There's no need to touch the code:

| File | What's in it |
| --- | --- |
| `chapter-1.json` | Every Chapter 1 screen: id, image description, words, interaction, light |
| `story.json` | The people, the lights on the Light Map, the chapter titles, and every app text: first-launch note, "I'm not okay" page, buttons |
| `crisis-lines.json` | Crisis line numbers per country. **Please verify these before sharing.** |

A screen looks like this:

```json
{
  "id": "1.16",
  "image": "Door open. Warm yellow light from the stairwell…",
  "light": "roux_door",
  "haptic": true,
  "words": [{ "speaker": "Madame Roux", "text": "I saw her suitcase on the stairs." }]
}
```

- `speaker` is `"narrator"` (shown in italics), `"Critic"` (grey bubble), or any character's name (speech bubble).
- `light` makes it a LIGHT+ screen: a warm glow spills over the panel border, and the light is added to the Light Map. The id must be listed under `lights` in `story.json`.
- `glow` is for warm light that isn't a new LIGHT+ (`"warm"` or `"warm-small"`) and for cold blue screens (`"cold"`).
- Text that depends on an earlier choice:
  `{ "by": "chased", "sport": "…", "music": "…", "degree": "…", "business": "…" }` or
  `{ "by": "choice:1.9", "water": "…", "window": "…", "floor": "…" }`.
- `{chased}` and `{chasedObject}` inside any text become "music" / "guitar", and so on.
- Branches: a choice option with `"goto": "1.14a"`, and a branch screen with `"next": "1.15"` to rejoin.

**Text pacing:** each tap shows one line, typed out letter by letter (a tap mid-line shows it all). Sentences are grouped into lines of up to `beatChars` characters (80, set in `story.json`). To force a break in a particular spot, put `\n` in the text.

**Sound:** the 🔈 button turns on the music (rain, a low drone and sparse piano, generated in the app) and read-aloud (the phone's own voice). Both start off. The pitch and speed of each character's voice are under `voices` in `story.json`.

Interaction `type`s: `choice`, `tap-objects`, `write`, `timer`, `hold`, `drag`, `rate`, `critic-reply`, `quest`, `notebook`, `seal`. The Chapter 1 file shows examples of most of them.

After editing, run `npm run check-story`. It catches typos such as a duplicate id, a branch pointing nowhere, or a light that isn't listed. The website build also runs this check and stops if anything is wrong.

## Illustrations

Put each image in `public/images/`, named after its screen id: `1.16.png`, `1.14a.png`, and so on. A screen with an image shows the image; a screen without one shows the placeholder panel. Portrait images work best, since the panel is tall.

## Publishing (GitHub Pages)

This only needs doing once: in the repository on GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

After that, every push to `main` rebuilds the site. If a run failed before Pages was turned on, open the **Actions** tab, pick the latest "Deploy to GitHub Pages" run and press **Re-run all jobs**. The app is then at:

**https://julielebreton222.github.io/After/**

## Running it on a computer

```
npm install
npm run dev        # opens on http://localhost:5173 (and your Wi-Fi address, for a phone on the same network)
npm run build      # production build in dist/
```

## How it's built

React + Vite, with `vite-plugin-pwa` for offline use and installing to the home screen. Saved state lives in the browser's `localStorage` under `after-v1`.

- `src/components/Player.jsx`: the screen player (tap to advance, swipe back, branches, lights)
- `src/components/interactions/`: one file per interaction type
- `NotOkay.jsx`, `FirstLaunch.jsx`, `Menu.jsx`: the "I'm not okay" page, the first-launch note, and the menu (chapters, Light Map, People notebook, quests)
- `src/safety.js`: the crisis-line country detection and the check for words about not wanting to live
