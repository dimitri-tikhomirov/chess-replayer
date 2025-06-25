# Chess replayer

A minimalistic chess replayer that lets you replay a chess game stored in a `.pgn` file. It uses [chess.mjs](https://github.com/shaack/chess.mjs) (to read PGN) and [cm-chessboard](https://github.com/shaack/cm-chessboard) (to visualize a chessboard). Both libraries are lightweight and included, so you don't need to download anything separately. See the replayer live on [Github Pages](https://dmitri-tikhomirov.github.io/chess-replayer/).

## Features and limitations

- **SVG-based chessboard**: Provided by [cm-chessboard](https://github.com/shaack/cm-chessboard), a chessboard that looks good at any resolution and has move animations.
- **Button controls**: First, Previous, Play/Pause, Next, and Last buttons. Only shows the buttons, does not show the game notation. Buttons are automatically disabled when you can't go further (e.g., previous/first buttons are disabled at the starting position).
- **Keyboard support**: Full keyboard navigation.
- **Responsive design**: The replayer adapts to different screen sizes. Smaller buttons and reduced spacing on smaller screens.
- **Dark mode**: Built-in night mode theme.
- **Auto-play**: Automatic playback with pause functionality.
- **Hide controls option**: An option to hide all controls and only show the starting position of the PGN.
- **Custom starting position**: The game does not have to start from the beginning, it can start from any position, and the replayer will orient the board based on who moves first (white or black). Chess960 castling is not supported.
- **JavaScript DOM creation**: Simplified HTML, all controls are generated dynamically via JavaScript.
- **SVG icons**: Control buttons use SVG icons by [Font Awesome](https://fontawesome.com), which ensure consistent display on different devices and are loaded from a single included SVG spritesheet.

## Keyboard navigation

- **Arrow Left** - Previous move. Go back one move.
- **Arrow Right** - Next move. Advance one move.
- **Home** - First move. Jump to the starting position.
- **End** - Last move. Jump to the final position.
- **Spacebar** - Play/Pause. Auto-play through the game.

## Auto-play

- Click the play button to start automatic playback.
- 1-second intervals between moves.
- Playback stops automatically when the final position is reached.
- During playback, all navigation controls except pause are disabled.
- **Smart restart**: When you press play at the final position, the replayer automatically jumps back to the starting position and starts playback from the beginning.

## Dark mode

To enable dark mode, add the `nightMode` class to the `<body>` element:

```html
<body class="nightMode">
```

## Hide controls

To display only the starting position of the PGN without navigation controls, add the `data-start` attribute:

```html
<div data-pgn="games/01.pgn" data-start></div>
```