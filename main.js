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
  // Draw a custom dragon
  const x = player.x + player.width / 2
  const y = player.y + player.height / 2

  ctx.save()

  // Dragon body (gradient)
  const bodyGradient = ctx.createLinearGradient(x - 15, y - 10, x + 15, y + 10)
  bodyGradient.addColorStop(0, '#ff6b6b')
  bodyGradient.addColorStop(0.5, '#ee5a6f')
  bodyGradient.addColorStop(1, '#c44569')

  // Wings
  ctx.fillStyle = 'rgba(139, 69, 19, 0.6)'
  ctx.beginPath()
  ctx.ellipse(x - 12, y - 5, 10, 15, -Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 12, y - 5, 10, 15, Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()

  // Main body
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y, 15, 12, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Body outline
  ctx.strokeStyle = '#a83241'
  ctx.lineWidth = 2
  ctx.stroke()

  // Head
  const headGradient = ctx.createLinearGradient(x - 10, y - 15, x + 10, y - 5)
  headGradient.addColorStop(0, '#ff7675')
  headGradient.addColorStop(1, '#d63031')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.ellipse(x, y - 10, 10, 10, 0, 0, 2 * Math.PI)
  ctx.fill()
  ctx.strokeStyle = '#a83241'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Horns
  ctx.fillStyle = '#ffd700'
  ctx.beginPath()
  ctx.moveTo(x - 6, y - 15)
  ctx.lineTo(x - 4, y - 22)
  ctx.lineTo(x - 2, y - 15)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + 6, y - 15)
  ctx.lineTo(x + 4, y - 22)
  ctx.lineTo(x + 2, y - 15)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x - 4, y - 11, 2.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 11, 2.5, 0, 2 * Math.PI)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 4, y - 11, 1.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 11, 1.5, 0, 2 * Math.PI)
  ctx.fill()

  // Nostrils
  ctx.fillStyle = '#a83241'
  ctx.beginPath()
  ctx.arc(x - 3, y - 7, 1, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 3, y - 7, 1, 0, 2 * Math.PI)
  ctx.fill()

  // Tail
  ctx.strokeStyle = '#c44569'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + 10)
  ctx.quadraticCurveTo(x - 5, y + 18, x - 8, y + 25)
  ctx.stroke()

  // Tail tip
  ctx.fillStyle = '#ffd700'
  ctx.beginPath()
  ctx.moveTo(x - 8, y + 25)
  ctx.lineTo(x - 10, y + 28)
  ctx.lineTo(x - 6, y + 27)
  ctx.fill()

  // Scale details on body
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(x - 8 + i * 8, y + 2, 2, 0, Math.PI)
    ctx.fill()
  }

  ctx.restore()
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = obstacle.color.fill
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

    // Add a border
    ctx.strokeStyle = obstacle.color.stroke
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
