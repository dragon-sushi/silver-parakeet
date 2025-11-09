import './style.css'

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score')
const highScoreElement = document.getElementById('highScore')
const finalScoreElement = document.getElementById('finalScore')
const gameOverElement = document.getElementById('gameOver')
const startBtn = document.getElementById('startBtn')
const restartBtn = document.getElementById('restartBtn')

// Game state
let gameRunning = false
let score = 0
let highScore = localStorage.getItem('highScore') || 0
highScoreElement.textContent = highScore

// Player
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  dx: 0
}

// Obstacles
let obstacles = []
let obstacleSpeed = 2
let obstacleFrequency = 90
let frameCount = 0

// Controls
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  a: false,
  d: false
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true
  }
})

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false
  }
})

startBtn.addEventListener('click', startGame)
restartBtn.addEventListener('click', () => {
  gameOverElement.classList.add('hidden')
  startGame()
})

function startGame() {
  gameRunning = true
  score = 0
  obstacles = []
  obstacleSpeed = 2
  frameCount = 0
  player.x = canvas.width / 2 - 20
  startBtn.style.display = 'none'
  gameLoop()
}

function createObstacle() {
  const size = Math.random() * 30 + 20
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: obstacleSpeed
  })
}

function updatePlayer() {
  // Move player
  if (keys.ArrowLeft || keys.a) {
    player.dx = -player.speed
  } else if (keys.ArrowRight || keys.d) {
    player.dx = player.speed
  } else {
    player.dx = 0
  }

  player.x += player.dx

  // Boundary detection
  if (player.x < 0) player.x = 0
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width
  }
}

function updateObstacles() {
  // Create new obstacles
  frameCount++
  if (frameCount % obstacleFrequency === 0) {
    createObstacle()
  }

  // Update obstacle positions
  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacle.speed

    // Remove obstacles that are off screen
    if (obstacle.y > canvas.height) {
      obstacles.splice(index, 1)
      score += 10
      scoreElement.textContent = score

      // Increase difficulty
      if (score % 100 === 0) {
        obstacleSpeed += 0.5
        if (obstacleFrequency > 30) obstacleFrequency -= 5
      }
    }
  })
}

function checkCollisions() {
  for (let obstacle of obstacles) {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      gameOver()
      return
    }
  }
}

function gameOver() {
  gameRunning = false
  finalScoreElement.textContent = score

  if (score > highScore) {
    highScore = score
    highScoreElement.textContent = highScore
    localStorage.setItem('highScore', highScore)
  }

  gameOverElement.classList.remove('hidden')
  startBtn.style.display = 'block'
}

function drawPlayer() {
  // Draw player as a parakeet emoji
  ctx.font = '40px Arial'
  ctx.fillText('🦜', player.x, player.y + player.height)
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

    // Add a border
    ctx.strokeStyle = '#c0392b'
    ctx.lineWidth = 2
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
  })
}

function clearCanvas() {
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function gameLoop() {
  if (!gameRunning) return

  clearCanvas()
  updatePlayer()
  updateObstacles()
  checkCollisions()
  drawObstacles()
  drawPlayer()

  requestAnimationFrame(gameLoop)
}

// Initial draw
clearCanvas()
drawPlayer()
