# Whiteman

Mobile-first social deduction word game. 3-10 players on a single shared device. Everyone gets the same word except one player (the "whiteman") who gets a similar but different word. Players describe their word with one word each, then vote to eliminate the suspect.

## Tech Stack

Vanilla HTML/CSS/JS. No build step, no backend, no frameworks. All state in localStorage. Serve with any static server (`npx serve .`, `python3 -m http.server`).

## Architecture

Single-page app: all 8 screens are `<section>` elements in `index.html`, toggled via `App.showScreen()`. JS modules are globals loaded via `<script>` tags (no ES modules, no bundler).

## File Map

| File | Responsibility | Size |
|------|---------------|------|
| `index.html` | All 8 screen sections + global header + script imports | 109 lines |
| `css/styles.css` | Mobile-first styles, playful theme, animations | 459 lines |
| `js/app.js` | Screen modules (Welcome, Setup, Deal, Discuss, Vote, Result, GameOver, Leaderboard) + App controller | 563 lines |
| `js/game.js` | Word loading, player assignment, voting, scoring, round progression | 142 lines |
| `js/i18n.js` | Translation strings (EN/UZ/RU), `I18n.t(key)` helper | 153 lines |
| `js/storage.js` | localStorage CRUD (lang, recent players, leaderboard, current game) | 58 lines |
| `js/sounds.js` | Web Audio API synth sounds + MP3 playback | 81 lines |
| `assets/confetti.js` | Canvas-based confetti animation | 76 lines |
| `data/words.json` | 80 trilingual word pairs (normal + whiteman variant) | JSON |
| `audio/*.mp3` | WAV files with .mp3 extension (placeholder synth audio) | 3 files |

## Key Globals

All modules are global objects. Load order matters (set by `<script>` tags in index.html):

1. `I18n` - must load first, provides `t(key)` translation
2. `Storage` - localStorage wrapper
3. `Sounds` - sound effects
4. `Game` - game state and logic
5. `Confetti` - visual effects
6. `js/app.js` - screen modules + `App` controller (loaded last, references all above)

## Game Flow

Welcome -> Setup (pick players) -> Deal (each player sees word privately) -> Discuss (talk) -> Vote (eliminate suspect) -> Result

- **Correct guess:** game over, team wins, confetti
- **Wrong guess:** eliminated player out, skip re-dealing, go straight back to Discuss -> Vote cycle
- **Whiteman wins:** when only 2 players remain (whiteman still alive)

## Screen Navigation

`App.showScreen('name')` hides all sections, shows `#screen-{name}`. Each screen module has `render()` (update DOM/i18n) and `init()` (bind event listeners once).

## i18n

3 languages: EN, UZ (Uzbek), RU (Russian). Language switcher in global header. All UI text uses `data-i18n` attributes or `I18n.t('key')` calls. Word pairs in `data/words.json` have all 3 translations.

## Persistence

- Language preference persists across sessions
- Recent player names remembered (up to 30) for quick re-entry
- Leaderboard accumulates scores across games
- Current game state saved for resume on page refresh (resumes at Discuss screen)

## Development

No build step. Edit files, refresh browser. To serve locally:

```bash
npx serve .
# or
python3 -m http.server
```

## Conventions

- All JS uses `var` and `function` expressions (no arrow functions in screen modules, no `const`/`let`)
- Screen modules follow pattern: `{ render(), init(), ...private methods }`
- CSS uses custom properties defined in `:root`
- Mobile-first: designed for phone screens, `user-scalable=no`
