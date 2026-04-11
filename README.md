# Whiteman

A mobile-first social deduction word game. Vibe coded to play with my nephews.

Pass the phone around the table. Everyone gets the same secret word — except one player (the **Whiteman**), who gets a similar but different word. Each player describes their word with a single word. Then everyone votes to eliminate the imposter. Can you find the Whiteman before they blend in?

## How to Play

1. Choose 3–10 players
2. Pass the phone to each player — they tap to reveal their secret word, then hide it
3. Each player says **one word** that hints at their word (without giving it away)
4. Vote to eliminate the person you think is the Whiteman
5. Wrong guess? That player is out — keep discussing until someone gets it right
6. Whiteman wins if only 2 players remain and they're still alive

## Run Locally

No install, no build step:

```bash
npx serve .
# or
python3 -m http.server
```

Then open `http://localhost:3000` (or whatever port) on your phone.

## Stack

Vanilla HTML/CSS/JS. No frameworks, no backend, no dependencies. State lives in `localStorage`. Works offline after first load.

## Languages

Supports English, Uzbek, and Russian — switch in the top header.
