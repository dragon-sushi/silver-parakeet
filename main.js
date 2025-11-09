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
  // Draw a Leafwing dragon (green with brown scales)
  const x = player.x + player.width / 2
  const y = player.y + player.height / 2

  ctx.save()

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.beginPath()
  ctx.ellipse(x, y + 20, 18, 4, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Long tail (Leafwing feature)
  const tailGradient = ctx.createLinearGradient(x, y + 8, x + 14, y + 26)
  tailGradient.addColorStop(0, '#52c41a')
  tailGradient.addColorStop(0.6, '#3d8b17')
  tailGradient.addColorStop(1, '#6b4423')
  ctx.fillStyle = tailGradient
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.strokeStyle = tailGradient
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.quadraticCurveTo(x + 8, y + 14, x + 14, y + 26)
  ctx.stroke()

  // Tail tip
  ctx.fillStyle = '#8b5a2b'
  ctx.beginPath()
  ctx.moveTo(x + 14, y + 26)
  ctx.lineTo(x + 16, y + 28)
  ctx.lineTo(x + 12, y + 28)
  ctx.closePath()
  ctx.fill()

  // Leaf-shaped wings (Leafwing signature!)
  const wingGradient = ctx.createLinearGradient(x - 15, y - 8, x - 10, y + 8)
  wingGradient.addColorStop(0, '#7cb342')
  wingGradient.addColorStop(0.5, '#558b2f')
  wingGradient.addColorStop(1, '#33691e')

  // Left wing (leaf shape)
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 2)
  ctx.quadraticCurveTo(x - 18, y - 8, x - 16, y)
  ctx.quadraticCurveTo(x - 14, y + 6, x - 8, y + 4)
  ctx.closePath()
  ctx.fill()

  // Leaf veins on left wing
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - 8, y)
  ctx.lineTo(x - 16, y - 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - 8, y + 2)
  ctx.lineTo(x - 15, y + 3)
  ctx.stroke()

  // Right wing (leaf shape)
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.moveTo(x + 8, y - 2)
  ctx.quadraticCurveTo(x + 18, y - 8, x + 16, y)
  ctx.quadraticCurveTo(x + 14, y + 6, x + 8, y + 4)
  ctx.closePath()
  ctx.fill()

  // Leaf veins on right wing
  ctx.beginPath()
  ctx.moveTo(x + 8, y)
  ctx.lineTo(x + 16, y - 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 8, y + 2)
  ctx.lineTo(x + 15, y + 3)
  ctx.stroke()

  // Long body (stockier than RainWing)
  const bodyGradient = ctx.createRadialGradient(x, y - 2, 0, x, y + 2, 15)
  bodyGradient.addColorStop(0, '#66bb6a')
  bodyGradient.addColorStop(0.6, '#4caf50')
  bodyGradient.addColorStop(1, '#388e3c')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y + 1, 14, 14, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Brown scale patches (Leafwing feature!)
  ctx.fillStyle = 'rgba(139, 90, 43, 0.6)'
  // Scales on body
  ctx.beginPath()
  ctx.arc(x - 8, y - 2, 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 6, y + 4, 3.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x - 4, y + 6, 2.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 8, y - 4, 2.8, 0, 2 * Math.PI)
  ctx.fill()

  // Green scale details
  ctx.fillStyle = 'rgba(165, 214, 167, 0.4)'
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.beginPath()
      ctx.arc(x - 8 + i * 5, y - 4 + j * 7, 1.5, 0, Math.PI)
      ctx.fill()
    }
  }

  // Lighter underbelly
  ctx.fillStyle = 'rgba(200, 230, 201, 0.5)'
  ctx.beginPath()
  ctx.ellipse(x, y + 6, 9, 8, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Head
  const headGradient = ctx.createRadialGradient(x, y - 14, 0, x, y - 12, 11)
  headGradient.addColorStop(0, '#81c784')
  headGradient.addColorStop(0.7, '#66bb6a')
  headGradient.addColorStop(1, '#4caf50')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.ellipse(x, y - 14, 11, 10, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Brown patches on head
  ctx.fillStyle = 'rgba(139, 90, 43, 0.5)'
  ctx.beginPath()
  ctx.arc(x - 6, y - 16, 2.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 7, y - 13, 2, 0, 2 * Math.PI)
  ctx.fill()

  // Snout
  ctx.fillStyle = '#a5d6a7'
  ctx.beginPath()
  ctx.ellipse(x, y - 9, 6, 4, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Horns (leaf-like, swept back)
  ctx.fillStyle = '#8d6e63'
  // Left horn
  ctx.beginPath()
  ctx.ellipse(x - 7, y - 19, 2, 5, -Math.PI / 6, 0, 2 * Math.PI)
  ctx.fill()
  // Right horn
  ctx.beginPath()
  ctx.ellipse(x + 7, y - 19, 2, 5, Math.PI / 6, 0, 2 * Math.PI)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 4, y - 14, 3.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 14, 3.5, 0, 2 * Math.PI)
  ctx.fill()

  // Amber/green pupils (Leafwing eyes)
  ctx.fillStyle = '#f57f17'
  ctx.beginPath()
  ctx.arc(x - 4, y - 13.5, 2.2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 13.5, 2.2, 0, 2 * Math.PI)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(x - 4, y - 13.5, 1.2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 13.5, 1.2, 0, 2 * Math.PI)
  ctx.fill()

  // Eye highlights
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 3, y - 15, 1, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 5, y - 15, 1, 0, 2 * Math.PI)
  ctx.fill()

  // Nostrils
  ctx.fillStyle = '#2e7d32'
  ctx.beginPath()
  ctx.arc(x - 2, y - 9, 1, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 2, y - 9, 1, 0, 2 * Math.PI)
  ctx.fill()

  // Arms
  ctx.fillStyle = '#4caf50'
  ctx.beginPath()
  ctx.arc(x - 12, y + 4, 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 12, y + 4, 3, 0, 2 * Math.PI)
  ctx.fill()

  // Brown claws
  ctx.strokeStyle = '#6d4c41'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x - 12, y + 6)
  ctx.lineTo(x - 13, y + 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 12, y + 6)
  ctx.lineTo(x + 13, y + 8)
  ctx.stroke()

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
