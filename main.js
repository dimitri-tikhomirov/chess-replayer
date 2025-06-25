/* Chess replayer component
----------------------------------------------------------------------------- */
import {Chess} from './dependencies/chess.mjs/src/Chess.js';
import {Chessboard, FEN, COLOR} from
  './dependencies/cm-chessboard/src/Chessboard.js';

// Constants you can change
const ANIMATION_DURATION = 250;
const PLAYBACK_INTERVAL = 500; // Waiting time between animations
const ICONS_PATH = 'icons.svg';

let chessReplayer;
let startingPositionOnly;
let chessReplayerBoard;

let chessReplayerControls = null;
let firstButton = null;
let prevButton = null;
let playButton = null;
let nextButton = null;
let lastButton = null;

// Generate UI through JavaScript
function createUI() {
  // Get the element and check for start-only mode
  chessReplayer = document.querySelector('[data-pgn]');
  startingPositionOnly = chessReplayer.hasAttribute('data-start');

  // Add the component class
  chessReplayer.className = 'chess-replayer';

  // Create board element
  chessReplayerBoard = document.createElement('div');
  chessReplayerBoard.classList.add('chess-replayer-board');
  chessReplayer.append(chessReplayerBoard);

  // Only create controls if not in start-only mode
  if (startingPositionOnly) return;

  chessReplayerControls = document.createElement('div');
  chessReplayerControls.className = 'chess-replayer-controls';

  const className = 'chess-replayer-button';

  firstButton = createIconButton({
    iconName: 'backward-fast',
    ariaLabel: 'First',
    viewBox: '0 0 512 512',
    className: className
  });

  prevButton = createIconButton({
    iconName: 'backward-step',
    ariaLabel: 'Previous',
    viewBox: '0 0 320 512',
    className: className
  });

  playButton = createIconButton({
    iconName: 'play',
    ariaLabel: 'Play/pause',
    viewBox: '0 0 384 512',
    className: className
  });

  nextButton = createIconButton({
    iconName: 'forward-step',
    ariaLabel: 'Next',
    viewBox: '0 0 320 512',
    className: className
  });

  lastButton = createIconButton({
    iconName: 'forward-fast',
    ariaLabel: 'Last',
    viewBox: '0 0 512 512',
    className: className
  });

  chessReplayerControls.append(firstButton);
  chessReplayerControls.append(prevButton);
  chessReplayerControls.append(playButton);
  chessReplayerControls.append(nextButton);
  chessReplayerControls.append(lastButton);

  chessReplayer.append(chessReplayerControls);
}

// Create and return a button containing an SVG icon
function createIconButton({
  iconName,
  ariaLabel,
  viewBox = '0 0 512 512',
  className
}) {
  // Create button element
  const button = document.createElement('button');

  // Set attributes
  button.type = 'button';
  button.ariaLabel = ariaLabel;
  if (className) button.className = className;

  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  // Set attributes
  svg.setAttribute('viewBox', viewBox);
  svg.ariaHidden = 'true';

  // Create the `<use>` element
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

  // Set the attribute
  use.setAttribute('href', `${ICONS_PATH}#${iconName}`);

  // Assemble the elements
  svg.append(use);
  button.append(svg);

  return button;
}

// Add event listeners for navigation
function addNavigation() {
  // Only if not in start-only mode
  if (startingPositionOnly) return;

  firstButton.addEventListener('click', showFirstMove);
  prevButton.addEventListener('click', showPreviousMove);
  playButton.addEventListener('click', togglePlayPause);
  nextButton.addEventListener('click', showNextMove);
  lastButton.addEventListener('click', showLastMove);
}

// Add keyboard navigation
function addKeyboardNavigation() {
  // Only if not in start-only mode
  if (startingPositionOnly) return;

  document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(event) {
  // Ignore if typing in an input field
  if (event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA') {
    return;
  }

  switch(event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      showPreviousMove();
      break;
    case 'ArrowRight':
      event.preventDefault();
      showNextMove();
      break;
    case 'Home':
      event.preventDefault();
      showFirstMove();
      break;
    case 'End':
      event.preventDefault();
      showLastMove();
      break;
    case ' ':
      event.preventDefault();
      togglePlayPause();
      break;
  }
}

// Get PGN file path
function getFilePath() {
  return chessReplayer.dataset.pgn;
}

// Load PGN file from the specified path
async function loadPGN(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load PGN file: ${response.status}`);
    }

    return response.text();
  } catch (error) {
    console.error('Error loading PGN:', error);
  }
}

let gameHistory = null;

// Parse PGN text, get move history and starting position
function parsePGN(pgnText) {
  const chess = new Chess();

  try {
    chess.load_pgn(pgnText);

    const pgnData = {};
    // Check for custom starting position
    const headers = chess.header();
    pgnData.startingPosition = headers.FEN;

    if (pgnData.startingPosition) {
      // Set orientation based on whose turn it is
      pgnData.boardOrientation =
        getOrientationFromFEN(pgnData.startingPosition);
    } else {
      pgnData.startingPosition = FEN.start;
      pgnData.boardOrientation = COLOR.white;
    }

    // Store game history for navigation only if controls are shown
    if (!startingPositionOnly) {
      gameHistory = [];
      // Our game history is going to consist of all positions in the game
      gameHistory.push(pgnData.startingPosition);

      const moveHistory = chess.history();
      chess.load(pgnData.startingPosition);
      // Play through all moves and store positions
      moveHistory.forEach(move => {
        chess.move(move);
        gameHistory.push(chess.fen());
      });
    }

    return pgnData;
  } catch (error) {
    console.error('Error parsing PGN:', error);
  }
}

// Determine board orientation from FEN string
function getOrientationFromFEN(fen) {
  // FEN format: position activeColor castling enPassant halfmove fullmove
  const fenParts = fen.split(' ');
  const activeColor = fenParts[1];

  // Show board from perspective of player who moves first
  return activeColor === 'w' ? COLOR.white : COLOR.black;
}

let chessboard = null;

// Initialize the chessboard
function initializeBoard(position, orientation) {
  chessboard = new Chessboard(chessReplayerBoard, {
    assetsUrl: './dependencies/cm-chessboard/assets/',
    position: position,
    orientation: orientation,
    style: {
      cssClass: 'default-contrast',
      pieces: {file: 'pieces/staunty.svg'},
      animationDuration: ANIMATION_DURATION,
    },
  });

  if (!startingPositionOnly) updateButtonStates();
}

let currentMoveIndex = 0;
let isPlaying = false;

// Update button states based on current position
function updateButtonStates() {
  const atStart = currentMoveIndex === 0;
  const atEnd = currentMoveIndex === gameHistory.length - 1;

  if (isPlaying) {
    // During playback, disable all other buttons
    firstButton.disabled = true;
    prevButton.disabled = true;
    nextButton.disabled = true;
    lastButton.disabled = true;
    updateButtonState(playButton, 'pause', '0 0 320 512');
  } else {
    firstButton.disabled = atStart;
    prevButton.disabled = atStart;
    nextButton.disabled = atEnd;
    lastButton.disabled = atEnd;
    updateButtonState(playButton, 'play', '0 0 384 512');
  }
}

// Update button icon
function updateButtonState(button, iconName, viewBox = '0 0 512 512') {
  const svg = button.querySelector('svg');
  if (svg) svg.setAttribute('viewBox', viewBox);

  const use = svg.querySelector('use');
  if (use) use.setAttribute('href', `${ICONS_PATH}#${iconName}`);
}

// Show next move
function showNextMove() {
  if (currentMoveIndex < gameHistory.length - 1) {
    currentMoveIndex++;
    // animation = true
    chessboard.setPosition(gameHistory[currentMoveIndex], true);
    updateButtonStates();
  }
}

// Show previous move
function showPreviousMove() {
  if (currentMoveIndex > 0) {
    currentMoveIndex--;
    chessboard.setPosition(gameHistory[currentMoveIndex], true);
    updateButtonStates();
  }
}

// Show last move
function showLastMove() {
  if (currentMoveIndex < gameHistory.length - 1) {
    currentMoveIndex = gameHistory.length - 1;
    chessboard.setPosition(gameHistory[currentMoveIndex], true);
    updateButtonStates();
  }
}

// Show first move (starting position)
function showFirstMove() {
  if (currentMoveIndex > 0) {
    currentMoveIndex = 0;
    chessboard.setPosition(gameHistory[currentMoveIndex], true);
    updateButtonStates();
  }
}

// Toggle play/pause
function togglePlayPause() {
  if (isPlaying) pausePlayback();
  else startPlayback();
}

const playbackInterval = PLAYBACK_INTERVAL + ANIMATION_DURATION;
let playbackTimeout = null; // Timer ID returned by setTimeout()

// Start automatic playback
function startPlayback() {
  isPlaying = true;

  // If at the end, start from beginning
  if (currentMoveIndex >= gameHistory.length - 1) {
    // Setup the starting position without waiting
    currentMoveIndex = 0;
    chessboard.setPosition(gameHistory[currentMoveIndex], true);
    updateButtonStates();

    // Wait before playing the first move
    playbackTimeout = setTimeout(playNextMove, playbackInterval);
  // If not at the end, play the first move without waiting
  } else playNextMove();
}

// Play a single move, schedule the next one or automatically pause
function playNextMove() {
  // Play next move
  currentMoveIndex++;
  chessboard.setPosition(gameHistory[currentMoveIndex], true);
  updateButtonStates();

  // If there is another move, schedule it
  if (currentMoveIndex < gameHistory.length - 1) {
    playbackTimeout = setTimeout(playNextMove, playbackInterval);
  // If we've reached the end, pause after the animation has finished
  } else setTimeout(() => {
    isPlaying = false;
    updateButtonStates();
  }, ANIMATION_DURATION);
}

// Pause playback manually
function pausePlayback() {
  isPlaying = false;

  // The playback was manually interrupted, so there is a scheduled timeout
  clearTimeout(playbackTimeout);
  playbackTimeout = null;

  updateButtonStates();
}

createUI();
addNavigation();
addKeyboardNavigation();
const pgnFilePath = getFilePath();
const pgnText = await loadPGN(pgnFilePath);
const pgnData = parsePGN(pgnText);
initializeBoard(pgnData.startingPosition, pgnData.boardOrientation);