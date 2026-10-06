# After

A tap-through illustrated storybook for phones. It's a Progressive Web App, so it opens from a link and can be added to the home screen. No app store, no accounts, no server: everything the player writes stays on their phone.

**Status:** all 9 chapters are written. Paintings are done for Chapters 1 to 3; the rest show their scene description until their painting is made.

## Trying it on your phone

Open the app's link (see "Publishing" below), then:

- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** tap the ⋮ menu, then **Add to Home screen** or **Install app**.

It then opens full screen from its own icon, like an app, and works offline.

To test again from the start: ☰ menu, then **Start over**.

## The toolkit: "What to do when…" and Habits

The app has two parts, switched with the tabs at the bottom: **Story**, and the toolkit (**What to do when** and **Habits**). The toolkit is open from day one, whatever chapter he's on. All its words are in `src/toolkit/`:

| File | What's in it |
| --- | --- |
| `toolkit.json` | The "What to do when…" cards. Each card has a `title`, a list of `steps`, and optionally `story`, the id of a screen where Théo does this. Once the player has reached that screen, the card says "Théo did this in Chapter N." |
| `habits.json` | The habits. Each has a `title`, `why` (shown before he starts it), `how` (shown once it's his), and `every`: `"day"` or `"week"`. |

A card can also have a `group` (consecutive cards with the same group share a heading) and `from` (shown as "Idea from …"). The current cards and habits are a first draft by Claude, written in its own words from ideas by Joe Hudson and Dr. K (Alok Kanojia): no direct quotes. Rewrite anything. Add, remove or reorder cards and habits freely, but keep each `id` unique.

**How habits work:** they're all off at first. He taps **Start this habit** to add one to his list. Then **Keep track** is his choice: if it's on, he gets a "Done today" (or "Done this week") button and the last 7 days (or 4 weeks) as dots he can tap to fix. If it's off, the habit just sits on his list as a reminder. There are no streaks and no scores.

## Night stories

The ☾ button at the top opens **Night stories**: "Tonight I feel…", a list of feelings, and short fairy tales read by Julie. Each story plays with a sleep timer (10, 20 or 30 minutes, or to the end, fading out), a "dim the screen" night mode, and its text for reading along. Favourites and the last story played stay on the phone. A feeling with no story yet shows "coming soon". The app's music stops while a story is open.

**To add a story**, put its files in `stories/` and push. See `stories/HOW-TO-ADD-A-STORY.txt`. In short:

- `alone-the-lighthouse.m4a` (or `.mp3`): the recording. Required.
- `alone-the-lighthouse.png` (or `.jpg`): the illustration. Optional.
- `alone-the-lighthouse.md`: the text, with `# The Lighthouse` as its first line. Optional.

The feelings, their description lines and every Night stories text are in `src/night/night.json`. "Like nobody would notice if I disappeared" shows a prominent "I'm not okay" button when its story ends.

## The introduction, the hero's name, and quotes

On first launch, the introduction shows:

1. Why the app exists.
2. The hero's name.
3. A tour of the app.
4. Why this matters (suicide figures, with sources).
5. The three quotes to choose from.
6. The "before you start" note.

It can be replayed from ☰ → **About this app**, which is also where the name and quote style can be changed. Its texts are under `intro` in `src/story/story.json`.

- **Hero's name:** whatever name the player gives replaces "Théo" in every text, when the app loads. The story still uses "he".
- **Quotes:** `src/toolkit/quotes.json` has three styles: *Let it hurt*, *It gets better* and *Keep walking*. The player picks the style that speaks to them, and the app then shows quotes in that style:
  - at the top of "What to do when",
  - inside each card,
  - on the "I'm not okay" page.

  `for` lists the cards a quote fits best. Each style needs one quote marked `"pick": true`, which is the one shown when choosing.
- **Videos:** each toolkit card can list YouTube `videos`. Only the link is shown. Each video's `title` and `by` stay in the file so you can tell them apart.

## Confession and notes to Julie

In the ☰ menu:

- **Confession:** write it, then let it go (it burns and is erased), keep it on the phone, or send it to Julie.
- **Send Julie a note:** feedback for improving the app.

There's no server, so sending opens the phone's email app, addressed to `email` in `src/contact.json`. That address is empty until Julie fills it in. Until then, the send buttons say it isn't set up yet.

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

## Paintings and camera moves

Each screen names its painting with `"art"`, a file in `public/images/` (for example `"art": "roux-door"` for `public/images/roux-door.jpg`). Several screens can share one painting. `"art": "black"` means a page that is black on purpose. Screens without `art` show a placeholder with the image description.

`"shots"` moves the camera inside the painting, one shot per line of text: `{ "x": 30, "y": 66, "zoom": 1.7 }` points at a spot (in percent from the left and from the top of the painting) and zooms in. Every screen starts wide and glides to its first shot. Shots can depend on a choice, just like text (see screen 1.6, which zooms to whatever Théo chased). Tappable objects can have a `"focus"` shot too (screen 1.7).

`"caption"` puts small handwritten words in the corner ("Day two"), and `"sfx"` a big sound word ("knock").

The Chapter 1 paintings were made with Canva's AI image generator. The prompts are in `art/chapter-1-prompts.json`, and the originals are in the Canva design "After: Chapter 1 art".

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
