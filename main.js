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

// Static background elements for all levels
const backgroundElements = {
  pineForest: [],
  palmTrees: [],
  autumnTrees: [],
  autumnLeaves: [],
  christmasTrees: [],
  snowflakes: [],
  cacti: [],
  bambooStalks: [],
  hibiscusFlowers: [],
  sunflowers: [],
  roses: [],
  mushrooms: []
}

function initBackgroundElements() {
  // Level 1: Pine Forest
  backgroundElements.pineForest = []
  for (let i = 0; i < 15; i++) {
    backgroundElements.pineForest.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.7,
      size: Math.random() * 20 + 15,
      opacity: Math.random() * 0.3 + 0.2,
      layer: Math.random() < 0.5 ? 'back' : 'middle'
    })
  }

  // Level 2: Palm Trees
  backgroundElements.palmTrees = []
  for (let i = 0; i < 8; i++) {
    backgroundElements.palmTrees.push({
      x: (i * canvas.width / 7) + Math.random() * 30,
      y: canvas.height * 0.65 + Math.random() * 50
    })
  }

  // Level 3: Autumn Trees & Leaves
  backgroundElements.autumnTrees = []
  for (let i = 0; i < 10; i++) {
    backgroundElements.autumnTrees.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      size: 20 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.2
    })
  }
  backgroundElements.autumnLeaves = []
  for (let i = 0; i < 12; i++) {
    backgroundElements.autumnLeaves.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    })
  }

  // Level 4: Christmas Trees & Snowflakes
  backgroundElements.christmasTrees = []
  for (let i = 0; i < 10; i++) {
    backgroundElements.christmasTrees.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.4 + Math.random() * canvas.height * 0.3,
      size: 20 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.2
    })
  }
  backgroundElements.snowflakes = []
  for (let i = 0; i < 20; i++) {
    backgroundElements.snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    })
  }

  // Level 5: Cacti
  backgroundElements.cacti = []
  for (let i = 0; i < 6; i++) {
    backgroundElements.cacti.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.6 + Math.random() * 80,
      size: 20 + Math.random() * 15,
      opacity: 0.4 + Math.random() * 0.2
    })
  }

  // Level 6: Bamboo Stalks
  backgroundElements.bambooStalks = []
  for (let i = 0; i < 12; i++) {
    backgroundElements.bambooStalks.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
      size: 20 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.2
    })
  }

  // Level 7: Hibiscus Flowers
  backgroundElements.hibiscusFlowers = []
  for (let i = 0; i < 10; i++) {
    backgroundElements.hibiscusFlowers.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.5 + Math.random() * canvas.height * 0.3,
      size: 20 + Math.random() * 15,
      opacity: 0.4 + Math.random() * 0.2
    })
  }

  // Level 8: Sunflowers
  backgroundElements.sunflowers = []
  for (let i = 0; i < 15; i++) {
    backgroundElements.sunflowers.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.55 + Math.random() * canvas.height * 0.3,
      size: 20 + Math.random() * 15,
      opacity: 0.4 + Math.random() * 0.2
    })
  }

  // Level 9: Roses
  backgroundElements.roses = []
  for (let i = 0; i < 12; i++) {
    backgroundElements.roses.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.4 + Math.random() * canvas.height * 0.4,
      size: 20 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.2
    })
  }

  // Level 10+: Mushrooms
  backgroundElements.mushrooms = []
  for (let i = 0; i < 15; i++) {
    backgroundElements.mushrooms.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
      size: 20 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.2
    })
  }
}
initBackgroundElements()

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

function drawLevelScenery() {
  switch(level) {
    case 1: // Pine Forest
      drawPineForest()
      break
    case 2: // Tropical Beach
      drawTropicalBeach()
      break
    case 3: // Autumn Park
      drawAutumnPark()
      break
    case 4: // Winter Night
      drawWinterScene()
      break
    case 5: // Desert
      drawDesert()
      break
    case 6: // Bamboo Garden
      drawBambooGarden()
      break
    case 7: // Tropical Flower Garden
      drawTropicalGarden()
      break
    case 8: // Sunflower Field
      drawSunflowerField()
      break
    case 9: // Rose Garden
      drawRoseGarden()
      break
    default: // Level 10+ Mushroom Forest
      drawMushroomForest()
      break
  }
}

function drawPineForest() {
  // Draw gradient sky
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0d2818')
  gradient.addColorStop(0.7, '#1a3a2e')
  gradient.addColorStop(1, '#234a38')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw background trees (furthest layer)
  backgroundElements.pineForest.forEach(tree => {
    if (tree.layer === 'back') {
      ctx.globalAlpha = tree.opacity
      ctx.font = `${tree.size}px Arial`
      ctx.fillText('🌲', tree.x, tree.y)
    }
  })

  // Draw middle layer trees
  backgroundElements.pineForest.forEach(tree => {
    if (tree.layer === 'middle') {
      ctx.globalAlpha = tree.opacity + 0.2
      ctx.font = `${tree.size}px Arial`
      ctx.fillText('🌲', tree.x, tree.y)
    }
  })

  ctx.globalAlpha = 1.0

  // Draw ground/forest floor
  const groundGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height)
  groundGradient.addColorStop(0, '#1a3a2e')
  groundGradient.addColorStop(1, '#0f2419')
  ctx.fillStyle = groundGradient
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80)
}

function drawTropicalBeach() {
  // Sky gradient (bright blue)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6)
  skyGradient.addColorStop(0, '#87ceeb')
  skyGradient.addColorStop(1, '#4facfe')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6)

  // Ocean
  const oceanGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height * 0.75)
  oceanGradient.addColorStop(0, '#0099ff')
  oceanGradient.addColorStop(1, '#006699')
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.15)

  // Sand
  const sandGradient = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height)
  sandGradient.addColorStop(0, '#f4e4c1')
  sandGradient.addColorStop(1, '#e8d4a8')
  ctx.fillStyle = sandGradient
  ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25)

  // Background palm trees
  ctx.globalAlpha = 0.4
  ctx.font = '25px Arial'
  backgroundElements.palmTrees.forEach(palm => {
    ctx.fillText('🌴', palm.x, palm.y)
  })
  ctx.globalAlpha = 1.0
}

function drawAutumnPark() {
  // Sky gradient (golden hour)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  skyGradient.addColorStop(0, '#ffd89b')
  skyGradient.addColorStop(0.6, '#f9d976')
  skyGradient.addColorStop(1, '#e8c85c')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background trees
  backgroundElements.autumnTrees.forEach(tree => {
    ctx.globalAlpha = tree.opacity
    ctx.font = `${tree.size}px Arial`
    ctx.fillText('🌳', tree.x, tree.y)
  })
  ctx.globalAlpha = 1.0

  // Ground
  ctx.fillStyle = '#8b7355'
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70)

  // Falling leaves
  ctx.font = '15px Arial'
  backgroundElements.autumnLeaves.forEach(leaf => {
    ctx.fillText('🍂', leaf.x, leaf.y)
  })
}

function drawWinterScene() {
  // Night sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  skyGradient.addColorStop(0, '#0a1f3f')
  skyGradient.addColorStop(1, '#1e3a5f')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background Christmas trees
  backgroundElements.christmasTrees.forEach(tree => {
    ctx.globalAlpha = tree.opacity
    ctx.font = `${tree.size}px Arial`
    ctx.fillText('🎄', tree.x, tree.y)
  })
  ctx.globalAlpha = 1.0

  // Snow ground
  const snowGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height)
  snowGradient.addColorStop(0, '#e8f4f8')
  snowGradient.addColorStop(1, '#d0e8f0')
  ctx.fillStyle = snowGradient
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80)

  // Snowflakes
  ctx.font = '12px Arial'
  backgroundElements.snowflakes.forEach(snowflake => {
    ctx.fillText('❄️', snowflake.x, snowflake.y)
  })
}

function drawDesert() {
  // Desert sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7)
  skyGradient.addColorStop(0, '#ffd89b')
  skyGradient.addColorStop(1, '#f4c07f')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7)

  // Sand dunes
  ctx.fillStyle = '#d4a574'
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3)

  // Dune shadows
  ctx.fillStyle = '#c49563'
  ctx.beginPath()
  ctx.ellipse(canvas.width * 0.3, canvas.height * 0.75, 80, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Background cacti
  backgroundElements.cacti.forEach(cactus => {
    ctx.globalAlpha = cactus.opacity
    ctx.font = `${cactus.size}px Arial`
    ctx.fillText('🌵', cactus.x, cactus.y)
  })
  ctx.globalAlpha = 1.0
}

function drawBambooGarden() {
  // Garden gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#3d5a4a')
  gradient.addColorStop(1, '#2d4a3e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background bamboo stalks
  backgroundElements.bambooStalks.forEach(bamboo => {
    ctx.globalAlpha = bamboo.opacity
    ctx.font = `${bamboo.size}px Arial`
    ctx.fillText('🎋', bamboo.x, bamboo.y)
  })
  ctx.globalAlpha = 1.0

  // Ground
  ctx.fillStyle = '#1a2e25'
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70)
}

function drawTropicalGarden() {
  // Vibrant pink/purple gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#ff9dc6')
  gradient.addColorStop(1, '#ff6b9d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background flowers and plants
  backgroundElements.hibiscusFlowers.forEach(flower => {
    ctx.globalAlpha = flower.opacity
    ctx.font = `${flower.size}px Arial`
    ctx.fillText('🌺', flower.x, flower.y)
  })
  ctx.globalAlpha = 1.0

  // Ground
  ctx.fillStyle = '#c44569'
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70)
}

function drawSunflowerField() {
  // Bright sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6)
  skyGradient.addColorStop(0, '#87ceeb')
  skyGradient.addColorStop(1, '#b8d8f0')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6)

  // Field
  const fieldGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height)
  fieldGradient.addColorStop(0, '#ffd89b')
  fieldGradient.addColorStop(1, '#f4c97f')
  ctx.fillStyle = fieldGradient
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

  // Background sunflowers
  backgroundElements.sunflowers.forEach(sunflower => {
    ctx.globalAlpha = sunflower.opacity
    ctx.font = `${sunflower.size}px Arial`
    ctx.fillText('🌻', sunflower.x, sunflower.y)
  })
  ctx.globalAlpha = 1.0
}

function drawRoseGarden() {
  // Dark romantic gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#6b2c2c')
  gradient.addColorStop(1, '#8b3a3a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background roses
  backgroundElements.roses.forEach(rose => {
    ctx.globalAlpha = rose.opacity
    ctx.font = `${rose.size}px Arial`
    ctx.fillText('🌹', rose.x, rose.y)
  })
  ctx.globalAlpha = 1.0

  // Ground
  ctx.fillStyle = '#4a1f1f'
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70)
}

function drawMushroomForest() {
  // Dark mystical forest
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#2a1810')
  gradient.addColorStop(1, '#3e2723')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Background mushrooms
  backgroundElements.mushrooms.forEach(mushroom => {
    ctx.globalAlpha = mushroom.opacity
    ctx.font = `${mushroom.size}px Arial`
    ctx.fillText('🍄', mushroom.x, mushroom.y)
  })
  ctx.globalAlpha = 1.0

  // Dark ground
  ctx.fillStyle = '#1a0f0a'
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70)
}

function gameLoop() {
  if (!gameRunning) return

  drawLevelScenery()
  updatePlayer()
  updateObstacles()
  checkCollisions()
  drawObstacles()
  drawPlayer()

  requestAnimationFrame(gameLoop)
}

// Initial draw
drawLevelScenery()
drawPlayer()
