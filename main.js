import './style.css'

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score')
const levelElement = document.getElementById('level')
const highScoreElement = document.getElementById('highScore')
const finalScoreElement = document.getElementById('finalScore')
const gameOverElement = document.getElementById('gameOver')
const startBtn = document.getElementById('startBtn')
const restartBtn = document.getElementById('restartBtn')

// Level colors
const levelColors = [
  { fill: '#e74c3c', stroke: '#c0392b', name: 'Red' },      // Level 1
  { fill: '#f39c12', stroke: '#d68910', name: 'Orange' },   // Level 2
  { fill: '#f1c40f', stroke: '#d4ac0d', name: 'Yellow' },   // Level 3
  { fill: '#2ecc71', stroke: '#27ae60', name: 'Green' },    // Level 4
  { fill: '#3498db', stroke: '#2980b9', name: 'Blue' },     // Level 5
  { fill: '#9b59b6', stroke: '#8e44ad', name: 'Purple' },   // Level 6
  { fill: '#e91e63', stroke: '#c2185b', name: 'Pink' },     // Level 7
  { fill: '#00bcd4', stroke: '#0097a7', name: 'Cyan' },     // Level 8
  { fill: '#ff5722', stroke: '#e64a19', name: 'Deep Orange' }, // Level 9
  { fill: '#607d8b', stroke: '#455a64', name: 'Blue Grey' }  // Level 10+
]

// Game state
let gameRunning = false
let score = 0
let level = 1
let highScore = localStorage.getItem('highScore') || 0
highScoreElement.textContent = highScore

// Player
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 6,
  dx: 0
}

// Obstacles
let obstacles = []
let obstacleSpeed = 4
let obstacleFrequency = 50
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
  level = 1
  obstacles = []
  obstacleSpeed = 4
  obstacleFrequency = 50
  frameCount = 0
  player.x = canvas.width / 2 - 20
  scoreElement.textContent = score
  levelElement.textContent = level
  startBtn.style.display = 'none'
  gameLoop()
}

function getCurrentLevelColor() {
  const colorIndex = Math.min(level - 1, levelColors.length - 1)
  return levelColors[colorIndex]
}

function createObstacle() {
  const size = Math.random() * 35 + 25
  const color = getCurrentLevelColor()
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: obstacleSpeed,
    color: color
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

      // Level up every 150 points
      const newLevel = Math.floor(score / 150) + 1
      if (newLevel > level) {
        level = newLevel
        levelElement.textContent = level
        // Increase difficulty with each level
        obstacleSpeed += 0.8
        if (obstacleFrequency > 20) obstacleFrequency -= 3
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
  // Draw player as a dragon emoji
  ctx.font = '40px Arial'
  ctx.fillText('🐉', player.x, player.y + player.height)
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    const centerX = obstacle.x + obstacle.width / 2
    const treeHeight = obstacle.height
    const trunkWidth = obstacle.width * 0.3
    const foliageWidth = obstacle.width

    // Draw trunk
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(centerX - trunkWidth / 2, obstacle.y + treeHeight * 0.5, trunkWidth, treeHeight * 0.5)

    // Draw foliage (tree top) using the level color
    ctx.fillStyle = obstacle.color.fill
    ctx.beginPath()
    ctx.moveTo(centerX, obstacle.y)
    ctx.lineTo(centerX - foliageWidth / 2, obstacle.y + treeHeight * 0.6)
    ctx.lineTo(centerX + foliageWidth / 2, obstacle.y + treeHeight * 0.6)
    ctx.closePath()
    ctx.fill()

    // Add foliage border
    ctx.strokeStyle = obstacle.color.stroke
    ctx.lineWidth = 2
    ctx.stroke()

    // Add second layer of foliage
    ctx.fillStyle = obstacle.color.fill
    ctx.beginPath()
    ctx.moveTo(centerX, obstacle.y + treeHeight * 0.2)
    ctx.lineTo(centerX - foliageWidth / 2.5, obstacle.y + treeHeight * 0.7)
    ctx.lineTo(centerX + foliageWidth / 2.5, obstacle.y + treeHeight * 0.7)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = obstacle.color.stroke
    ctx.stroke()
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
