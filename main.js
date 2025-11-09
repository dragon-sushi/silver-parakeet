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
  // Draw a cute dragon
  const x = player.x + player.width / 2
  const y = player.y + player.height / 2

  ctx.save()

  // Shadow for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.beginPath()
  ctx.ellipse(x, y + 18, 16, 4, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Tail (behind body)
  const tailGradient = ctx.createLinearGradient(x, y + 8, x + 12, y + 20)
  tailGradient.addColorStop(0, '#7c5cff')
  tailGradient.addColorStop(1, '#5a3fd9')
  ctx.fillStyle = tailGradient
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.quadraticCurveTo(x + 8, y + 10, x + 10, y + 18)
  ctx.lineTo(x + 8, y + 17)
  ctx.quadraticCurveTo(x + 6, y + 11, x - 2, y + 10)
  ctx.closePath()
  ctx.fill()

  // Tail sparkle
  ctx.fillStyle = '#ffd700'
  ctx.beginPath()
  ctx.moveTo(x + 10, y + 18)
  ctx.lineTo(x + 13, y + 19)
  ctx.lineTo(x + 11, y + 21)
  ctx.lineTo(x + 8, y + 20)
  ctx.closePath()
  ctx.fill()

  // Wings (behind body)
  const wingGradient = ctx.createRadialGradient(x - 8, y - 2, 2, x - 8, y - 2, 12)
  wingGradient.addColorStop(0, 'rgba(138, 108, 255, 0.8)')
  wingGradient.addColorStop(1, 'rgba(108, 75, 230, 0.4)')
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.ellipse(x - 10, y - 2, 8, 14, -Math.PI / 6, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.ellipse(x + 10, y - 2, 8, 14, Math.PI / 6, 0, 2 * Math.PI)
  ctx.fill()

  // Main body
  const bodyGradient = ctx.createRadialGradient(x, y - 3, 0, x, y, 14)
  bodyGradient.addColorStop(0, '#9d7fff')
  bodyGradient.addColorStop(0.7, '#7c5cff')
  bodyGradient.addColorStop(1, '#6347d9')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y, 14, 13, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Belly
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.ellipse(x, y + 3, 9, 8, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Head
  const headGradient = ctx.createRadialGradient(x, y - 12, 0, x, y - 12, 10)
  headGradient.addColorStop(0, '#9d7fff')
  headGradient.addColorStop(0.8, '#7c5cff')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.ellipse(x, y - 12, 11, 10, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Snout
  ctx.fillStyle = '#b39dff'
  ctx.beginPath()
  ctx.ellipse(x, y - 7, 6, 4, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Cute horns
  const hornGradient = ctx.createLinearGradient(x, y - 20, x, y - 16)
  hornGradient.addColorStop(0, '#ffd700')
  hornGradient.addColorStop(1, '#ffed4e')
  ctx.fillStyle = hornGradient
  // Left horn
  ctx.beginPath()
  ctx.moveTo(x - 6, y - 17)
  ctx.lineTo(x - 5, y - 23)
  ctx.lineTo(x - 3, y - 17)
  ctx.closePath()
  ctx.fill()
  // Right horn
  ctx.beginPath()
  ctx.moveTo(x + 3, y - 17)
  ctx.lineTo(x + 5, y - 23)
  ctx.lineTo(x + 6, y - 17)
  ctx.closePath()
  ctx.fill()

  // Eyes (bigger and cuter)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 4, y - 13, 3.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 13, 3.5, 0, 2 * Math.PI)
  ctx.fill()

  // Pupils with sparkle
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(x - 4, y - 12.5, 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 12.5, 2, 0, 2 * Math.PI)
  ctx.fill()

  // Eye sparkles
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 3, y - 14, 1, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 5, y - 14, 1, 0, 2 * Math.PI)
  ctx.fill()

  // Cute smile
  ctx.strokeStyle = '#5a3fd9'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y - 6, 3, 0.2, Math.PI - 0.2)
  ctx.stroke()

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255, 150, 200, 0.4)'
  ctx.beginPath()
  ctx.arc(x - 8, y - 9, 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 8, y - 9, 3, 0, 2 * Math.PI)
  ctx.fill()

  // Cute little arms
  ctx.fillStyle = '#7c5cff'
  ctx.beginPath()
  ctx.arc(x - 12, y + 3, 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 12, y + 3, 3, 0, 2 * Math.PI)
  ctx.fill()

  // Sparkles around dragon
  ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'
  const sparkles = [
    {x: x - 16, y: y - 8},
    {x: x + 16, y: y - 8},
    {x: x, y: y - 22}
  ]
  sparkles.forEach(sparkle => {
    ctx.beginPath()
    ctx.arc(sparkle.x, sparkle.y, 1.5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillRect(sparkle.x - 0.5, sparkle.y - 3, 1, 6)
    ctx.fillRect(sparkle.x - 3, sparkle.y - 0.5, 6, 1)
  })

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
