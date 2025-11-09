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
  // Draw a RainWing dragon
  const x = player.x + player.width / 2
  const y = player.y + player.height / 2

  ctx.save()

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.beginPath()
  ctx.ellipse(x, y + 18, 16, 4, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Prehensile tail (RainWing feature)
  const tailGradient = ctx.createLinearGradient(x, y + 8, x + 10, y + 22)
  tailGradient.addColorStop(0, '#52c41a')
  tailGradient.addColorStop(0.5, '#389e0d')
  tailGradient.addColorStop(1, '#237804')
  ctx.fillStyle = tailGradient
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.quadraticCurveTo(x + 10, y + 12, x + 8, y + 20)
  ctx.lineTo(x + 6, y + 19)
  ctx.quadraticCurveTo(x + 8, y + 13, x - 2, y + 10)
  ctx.closePath()
  ctx.fill()

  // Tail stripes (tropical pattern)
  ctx.strokeStyle = '#95de64'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x + 3, y + 14)
  ctx.lineTo(x + 5, y + 13)
  ctx.stroke()

  // Large colorful wings (RainWings have beautiful wings)
  const wingGradient = ctx.createRadialGradient(x - 8, y - 2, 0, x - 8, y - 2, 14)
  wingGradient.addColorStop(0, 'rgba(165, 220, 134, 0.9)')
  wingGradient.addColorStop(0.3, 'rgba(82, 196, 26, 0.85)')
  wingGradient.addColorStop(0.7, 'rgba(56, 158, 13, 0.7)')
  wingGradient.addColorStop(1, 'rgba(35, 120, 4, 0.5)')

  // Left wing
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.ellipse(x - 11, y - 2, 9, 15, -Math.PI / 5, 0, 2 * Math.PI)
  ctx.fill()
  // Wing membrane detail
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(x - 11, y - 8 + i * 5)
    ctx.lineTo(x - 15, y - 5 + i * 5)
    ctx.stroke()
  }

  // Right wing
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.ellipse(x + 11, y - 2, 9, 15, Math.PI / 5, 0, 2 * Math.PI)
  ctx.fill()
  // Wing membrane detail
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(x + 11, y - 8 + i * 5)
    ctx.lineTo(x + 15, y - 5 + i * 5)
    ctx.stroke()
  }

  // Sleek body (RainWings are more slender)
  const bodyGradient = ctx.createRadialGradient(x, y - 2, 0, x, y, 13)
  bodyGradient.addColorStop(0, '#73d13d')
  bodyGradient.addColorStop(0.6, '#52c41a')
  bodyGradient.addColorStop(1, '#389e0d')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y, 13, 12, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Scale pattern on body
  ctx.fillStyle = 'rgba(165, 220, 134, 0.3)'
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.beginPath()
      ctx.arc(x - 6 + i * 6, y - 3 + j * 6, 2, 0, Math.PI)
      ctx.fill()
    }
  }

  // Lighter underbelly
  ctx.fillStyle = 'rgba(245, 255, 230, 0.4)'
  ctx.beginPath()
  ctx.ellipse(x, y + 4, 8, 7, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Head
  const headGradient = ctx.createRadialGradient(x, y - 12, 0, x, y - 12, 9)
  headGradient.addColorStop(0, '#95de64')
  headGradient.addColorStop(0.7, '#52c41a')
  headGradient.addColorStop(1, '#389e0d')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.ellipse(x, y - 12, 10, 9, 0, 0, 2 * Math.PI)
  ctx.fill()

  // RainWing neck frill (signature feature!)
  ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'
  // Left frill
  ctx.beginPath()
  ctx.ellipse(x - 9, y - 11, 4, 7, -Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()
  // Right frill
  ctx.beginPath()
  ctx.ellipse(x + 9, y - 11, 4, 7, Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()
  // Frill highlights
  ctx.fillStyle = 'rgba(255, 140, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(x - 9, y - 11, 2, 4, -Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 9, y - 11, 2, 4, Math.PI / 4, 0, 2 * Math.PI)
  ctx.fill()

  // Snout
  ctx.fillStyle = '#95de64'
  ctx.beginPath()
  ctx.ellipse(x, y - 7, 6, 3, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Curved horns (small and elegant)
  ctx.strokeStyle = '#fadb14'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 5, y - 17)
  ctx.quadraticCurveTo(x - 6, y - 20, x - 4, y - 22)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 5, y - 17)
  ctx.quadraticCurveTo(x + 6, y - 20, x + 4, y - 22)
  ctx.stroke()

  // Large expressive eyes
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 4, y - 12, 3.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 12, 3.5, 0, 2 * Math.PI)
  ctx.fill()

  // Green pupils (RainWing style)
  ctx.fillStyle = '#135200'
  ctx.beginPath()
  ctx.arc(x - 4, y - 11.5, 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y - 11.5, 2, 0, 2 * Math.PI)
  ctx.fill()

  // Eye highlights
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - 3, y - 13, 1.2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 5, y - 13, 1.2, 0, 2 * Math.PI)
  ctx.fill()

  // Friendly smile
  ctx.strokeStyle = '#237804'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y - 6, 2.5, 0.3, Math.PI - 0.3)
  ctx.stroke()

  // Nostrils
  ctx.fillStyle = '#237804'
  ctx.beginPath()
  ctx.arc(x - 2, y - 7, 0.8, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 2, y - 7, 0.8, 0, 2 * Math.PI)
  ctx.fill()

  // Small arms
  ctx.fillStyle = '#52c41a'
  ctx.beginPath()
  ctx.arc(x - 11, y + 2, 2.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 11, y + 2, 2.5, 0, 2 * Math.PI)
  ctx.fill()

  // Claws
  ctx.strokeStyle = '#fadb14'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - 11, y + 3)
  ctx.lineTo(x - 12, y + 5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 11, y + 3)
  ctx.lineTo(x + 12, y + 5)
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
