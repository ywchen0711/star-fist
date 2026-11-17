# Legend of the Star Fist (星拳傳說)

An original 16-bit style card-battle martial-arts RPG for the browser, in Traditional Chinese and English.

Kai, a boy raised by an old hermit on Pinecrag Mountain, is one of the last of the Starborn, fighters whose blood burns with star-fire. When the Iron Comet Legion of Emperor Vorrak arrives to harvest the planet's life, Kai sets out with a staff fighter, a stone-skinned giant, a wind dancer and, later, a Legion elite who changes sides.

**Play it here:** https://ywchen0711.github.io/star-fist/

## Features

- Six story chapters and a post-game tournament, with dialogue in Chinese and English (switch on the title screen).
- Star-chart boards: pick a movement card and walk its star number along the paths to fights, towns, springs, chests and story scenes.
- Card battles: both sides play one of five cards. More stars attacks first; the number is both power and dodge. Attack with a rush, a ki blast or a special move; defend by guarding, dodging or countering a beam.
- Close-up exchanges for every attack, and beam clashes where you mash Z to push the beams back.
- Power levels for everyone, level-ups that raise them, and enemies that never scale with you.
- Five party members you can switch between in battle, items, fleeing, and the Golden Flame transformation late in the story.
- 41 enemies, 34 special moves, 7 boards.
- Saves in the browser (localStorage).
- Keyboard, gamepad and on-screen touch buttons.

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move / choose | Arrow keys or WASD | D-pad or left stick |
| Confirm / mash in a beam clash | Z, Enter or Space | A |
| Cancel / field menu | X or Esc | B |
| Music on/off | M | |

On phones, the on-screen pad and Z / X buttons appear when you touch the screen.

## Running it

There is no build step. Serve the folder with any static web server, for example `python -m http.server`, and open `index.html`.

## iPhone and iPad

- The touch buttons also appear on iPad. Held upright they sit under the picture; held sideways they move to the left and right of it.
- iPhone and iPad play the music as AAC (`.m4a` copies of the `.ogg` files), since Safari before iOS 18.4 cannot play Ogg. The board is saved when you leave the page, since iOS can close a tab in the background.
- Sound starts with your first tap. It keeps playing with the ring/silent switch on silent (iOS 17 and later), and comes back after a call, Siri or the lock screen.
- **Add to Home Screen** from Safari's Share menu to play full screen with its own icon.
- The game runs at the same speed on 120 Hz ProMotion screens and in Low Power Mode.

## Credits

Art, music and effects come from the Ninja Adventure Asset Pack by Pixel-boy and AAA (CC0). The font is Cubic 11 (SIL OFL 1.1). The story, rules, cards and code are original. See [CREDITS.md](CREDITS.md).
