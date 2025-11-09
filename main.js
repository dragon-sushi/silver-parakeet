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

// Level colors and emojis
const levelColors = [
  { fill: '#e74c3c', stroke: '#c0392b', name: 'Red', emoji: '🌲', bg: '#1a3a2e' },      // Level 1 - Pine forest
  { fill: '#f39c12', stroke: '#d68910', name: 'Orange', emoji: '🌴', bg: '#4facfe' },   // Level 2 - Tropical beach
  { fill: '#f1c40f', stroke: '#d4ac0d', name: 'Yellow', emoji: '🌳', bg: '#f9d976' },   // Level 3 - Autumn park
  { fill: '#2ecc71', stroke: '#27ae60', name: 'Green', emoji: '🎄', bg: '#1e3a5f' },    // Level 4 - Winter night
  { fill: '#3498db', stroke: '#2980b9', name: 'Blue', emoji: '🌵', bg: '#d4a574' },     // Level 5 - Desert sand
  { fill: '#9b59b6', stroke: '#8e44ad', name: 'Purple', emoji: '🎋', bg: '#2d4a3e' },   // Level 6 - Bamboo garden
  { fill: '#e91e63', stroke: '#c2185b', name: 'Pink', emoji: '🌺', bg: '#ff6b9d' },     // Level 7 - Tropical flower
  { fill: '#00bcd4', stroke: '#0097a7', name: 'Cyan', emoji: '🌻', bg: '#ffd89b' },     // Level 8 - Sunflower field
  { fill: '#ff5722', stroke: '#e64a19', name: 'Deep Orange', emoji: '🌹', bg: '#8b3a3a' }, // Level 9 - Rose garden
  { fill: '#607d8b', stroke: '#455a64', name: 'Blue Grey', emoji: '🍄', bg: '#3e2723' }  // Level 10+ - Mushroom forest
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

// Background forest trees (static scenery for Level 1)
const backgroundTrees = []
function initBackgroundTrees() {
  backgroundTrees.length = 0
  // Create background trees at different depths
  for (let i = 0; i < 15; i++) {
    backgroundTrees.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.7,
      size: Math.random() * 20 + 15,
      opacity: Math.random() * 0.3 + 0.2,
      layer: Math.random() < 0.5 ? 'back' : 'middle'
    })
  }
}
initBackgroundTrees()

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
    // Draw tree emoji based on level
    ctx.font = `${obstacle.width}px Arial`
    ctx.fillText(obstacle.color.emoji, obstacle.x, obstacle.y + obstacle.height)
  })
}

function clearCanvas() {
  const currentLevelColor = getCurrentLevelColor()
  ctx.fillStyle = currentLevelColor.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawForestScenery() {
  // Only draw forest scenery for Level 1 (pine forest)
  if (level !== 1) return

  // Draw gradient sky
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0d2818')
  gradient.addColorStop(0.7, '#1a3a2e')
  gradient.addColorStop(1, '#234a38')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw background trees (furthest layer)
  backgroundTrees.forEach(tree => {
    if (tree.layer === 'back') {
      ctx.globalAlpha = tree.opacity
      ctx.font = `${tree.size}px Arial`
      ctx.fillText('🌲', tree.x, tree.y)
    }
  })

  // Draw middle layer trees
  backgroundTrees.forEach(tree => {
    if (tree.layer === 'middle') {
      ctx.globalAlpha = tree.opacity + 0.2
      ctx.font = `${tree.size}px Arial`
      ctx.fillText('🌲', tree.x, tree.y)
    }
  })

  // Reset opacity
  ctx.globalAlpha = 1.0

  // Draw ground/forest floor
  const groundGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height)
  groundGradient.addColorStop(0, '#1a3a2e')
  groundGradient.addColorStop(1, '#0f2419')
  ctx.fillStyle = groundGradient
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80)
}

function gameLoop() {
  if (!gameRunning) return

  clearCanvas()
  drawForestScenery()
  updatePlayer()
  updateObstacles()
  checkCollisions()
  drawObstacles()
  drawPlayer()

  requestAnimationFrame(gameLoop)
}

// Initial draw
clearCanvas()
drawForestScenery()
drawPlayer()
