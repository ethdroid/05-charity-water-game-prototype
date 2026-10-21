// ----- Game settings -----
const GOAL = 20;          // points needed to win
const GAME_TIME = 30;     // seconds per round
const DIRTY_CHANCE = 0.3; // 30% of drops are dirty

// ----- Grab elements from the page -----
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const progressFill = document.getElementById("progress-fill");
const messageEl = document.getElementById("message");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

// ----- Game state -----
let score = 0;
let timeLeft = GAME_TIME;
let gameRunning = false;
let dropTimer = null;
let clockTimer = null;

const milestones = {
  5: "Nice start! A family is getting closer to clean water.",
  10: "Halfway there! Keep catching those drops.",
  15: "Almost full! Just a few more."
};

// ----- Start a new round -----
function startGame() {
  score = 0;
  timeLeft = GAME_TIME;
  gameRunning = true;
  updateScore();
  timeEl.textContent = timeLeft;
  messageEl.textContent = "Go! Catch the clean water.";
  overlay.classList.add("hidden");

  dropTimer = setInterval(createDrop, 700);
  clockTimer = setInterval(tick, 1000);
}

// ----- Countdown clock -----
function tick() {
  timeLeft--;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame(false);
  }
}

// ----- Make one falling drop -----
function createDrop() {
  const drop = document.createElement("div");
  const isDirty = Math.random() < DIRTY_CHANCE;
  drop.className = isDirty ? "drop dirty" : "drop clean";

  // random horizontal position inside the game area
  const maxX = gameArea.clientWidth - 60;
  drop.style.left = Math.random() * maxX + "px";

  // drops fall faster as the clock runs down
  const speed = 2.5 + Math.random() * 1.5 - (GAME_TIME - timeLeft) * 0.04;
  drop.style.animationDuration = Math.max(speed, 1.2) + "s";

  drop.addEventListener("pointerdown", () => catchDrop(drop, isDirty));
  drop.addEventListener("animationend", () => drop.remove());

  gameArea.appendChild(drop);
}

// ----- Player taps a drop -----
function catchDrop(drop, isDirty) {
  if (!gameRunning) return;

  if (isDirty) {
    score = Math.max(0, score - 2);
    showPop(drop, "-2", "bad");
    messageEl.textContent = "Oops! That water was dirty.";
  } else {
    score++;
    showPop(drop, "+1", "good");
    if (milestones[score]) {
      messageEl.textContent = milestones[score];
    }
  }

  drop.remove();
  updateScore();

  if (score >= GOAL) {
    endGame(true);
  }
}

// ----- Floating +1 / -2 text -----
function showPop(drop, text, type) {
  const pop = document.createElement("span");
  pop.className = "pop " + type;
  pop.textContent = text;
  const dropBox = drop.getBoundingClientRect();
  const areaBox = gameArea.getBoundingClientRect();
  pop.style.left = dropBox.left - areaBox.left + "px";
  pop.style.top = dropBox.top - areaBox.top + "px";
  gameArea.appendChild(pop);
  setTimeout(() => pop.remove(), 700);
}

// ----- Update score number and progress bar -----
function updateScore() {
  scoreEl.textContent = score;
  progressFill.style.width = Math.min(score / GOAL, 1) * 100 + "%";
}

// ----- End the round (win or lose) -----
function endGame(won) {
  gameRunning = false;
  clearInterval(dropTimer);
  clearInterval(clockTimer);
  removeAllDrops();

  if (won) {
    overlayTitle.textContent = "You did it! 🎉";
    overlayText.textContent = "You filled the jerry can with " + score + " drops of clean water. Now help make it real for a family in need.";
    messageEl.textContent = "Clean water delivered!";
    launchConfetti();
  } else {
    overlayTitle.textContent = "Time's up!";
    overlayText.textContent = "You collected " + score + " of " + GOAL + " drops. Try again, every drop counts!";
    messageEl.textContent = "So close. Give it another shot.";
  }

  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

// ----- Reset button: stop everything and go back to the start screen -----
function resetGame() {
  gameRunning = false;
  clearInterval(dropTimer);
  clearInterval(clockTimer);
  removeAllDrops();

  score = 0;
  timeLeft = GAME_TIME;
  updateScore();
  timeEl.textContent = timeLeft;
  messageEl.textContent = "Every drop counts.";

  overlayTitle.textContent = "Ready to bring clean water?";
  overlayText.innerHTML = 'Tap the <strong class="blue">blue drops</strong> (+1).<br>Avoid the <strong class="brown">brown drops</strong> (-2).<br>Reach 20 points before time runs out!';
  startBtn.textContent = "Start Game";
  overlay.classList.remove("hidden");
}

function removeAllDrops() {
  gameArea.querySelectorAll(".drop, .pop").forEach((el) => el.remove());
}

// ----- Confetti celebration -----
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C"];
  const pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 6 + Math.random() * 6,
      speed: 2 + Math.random() * 4,
      drift: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  let frames = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    frames++;
    if (frames < 240) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

// ----- Button listeners -----
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
