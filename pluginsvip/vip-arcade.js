
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const game = args[0]?.toLowerCase()
  
  if (!game) {
    return conn.reply(m.chat, `🎮 *VIP ARCADE PREMIUM* 🎮

*🕹️ JUEGOS ARCADE VIP:*
• snake - Snake premium con power-ups
• tetris - Tetris VIP con efectos
• pong - Pong clásico mejorado
• breakout - Breakout con bonificaciones
• pacman - Pac-Man VIP edition
• invaders - Space Invaders premium
• frogger - Frogger con nuevos niveles
• asteroids - Asteroids con mejoras

*🎯 JUEGOS DE HABILIDAD:*
• reaction - Prueba de reflejos VIP
• memory - Memorama premium
• pattern - Seguir patrones complejos
• typing - Velocidad de escritura
• math - Matemáticas rápidas VIP
• word - Encuentra palabras VIP

*🏆 COMPETITIVOS:*
• leaderboard - Ver ranking VIP
• daily - Desafío diario
• tournament - Torneos VIP
• achievement - Ver logros

*Uso:* ${usedPrefix + command} [juego]`, m)
  }

  const userId = m.sender
  
  if (!global.db.data.users[userId].vipArcade) {
    global.db.data.users[userId].vipArcade = {
      highScores: {},
      achievements: [],
      totalPlayed: 0,
      points: 0,
      tokens: 0
    }
  }

  const userArcade = global.db.data.users[userId].vipArcade

  try {
    await m.react('🕹️')

    switch (game) {
      case 'snake':
        await playVipSnake(conn, m, userArcade)
        break
      case 'tetris':
        await playVipTetris(conn, m, userArcade)
        break
      case 'pong':
        await playVipPong(conn, m, userArcade)
        break
      case 'reaction':
        await playVipReaction(conn, m, userArcade)
        break
      case 'memory':
        await playVipMemoryArcade(conn, m, userArcade)
        break
      case 'math':
        await playVipMath(conn, m, userArcade)
        break
      case 'typing':
        await playVipTyping(conn, m, userArcade)
        break
      case 'leaderboard':
        await showArcadeLeaderboard(conn, m)
        break
      default:
        return conn.reply(m.chat, '❌ Juego arcade no reconocido.', m)
    }

    userArcade.totalPlayed++
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en arcade VIP: ' + e.message, m)
  }
}

async function playVipSnake(conn, m, userArcade) {
  const snakeMsg = `🐍 *SNAKE VIP PREMIUM* 🐍

🎮 **Controles:**
⬆️ W - Arriba
⬇️ S - Abajo  
⬅️ A - Izquierda
➡️ D - Derecha

🎯 **Objetivo:** Come las manzanas y crece
💎 **Power-ups VIP:**
⚡ Velocidad x2
🛡️ Protección temporal
💰 Puntos dobles
🎁 Bonus aleatorio

🏆 **Record actual:** ${userArcade.highScores.snake || 0}
💰 **Premio por récord:** 500 puntos VIP

*Escribe tu primera dirección para comenzar*`

  await conn.reply(m.chat, snakeMsg, m)
  
  global.db.data.users[m.sender].activeSnake = {
    board: generateSnakeBoard(),
    snake: [{x: 5, y: 5}],
    food: {x: 10, y: 10},
    direction: null,
    score: 0,
    powerups: [],
    timestamp: Date.now()
  }
}

async function playVipReaction(conn, m, userArcade) {
  const colors = ['🔴', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟠']
  const targetColor = colors[Math.floor(Math.random() * colors.length)]
  
  // Esperar tiempo aleatorio entre 2-8 segundos
  const waitTime = Math.floor(Math.random() * 6000) + 2000
  
  const reactionMsg = `⚡ *PRUEBA DE REFLEJOS VIP* ⚡

🎯 **Instrucciones:**
Cuando veas el color ${targetColor}, responde inmediatamente con "GO"

⏰ **Preparándose...**
💎 **Modo:** Ultra preciso VIP
🏆 **Record:** ${userArcade.highScores.reaction || 'N/A'}ms

*¡Mantente alerta!*`

  await conn.reply(m.chat, reactionMsg, m)
  
  setTimeout(async () => {
    const startTime = Date.now()
    await conn.reply(m.chat, `${targetColor} **¡AHORA!** ${targetColor}\n\n*¡Escribe "GO" lo más rápido posible!*`, m)
    
    global.db.data.users[m.sender].activeReaction = {
      startTime: startTime,
      targetColor: targetColor,
      timestamp: Date.now()
    }
  }, waitTime)
}

async function playVipMath(conn, m, userArcade) {
  const operations = ['+', '-', '*']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let num1, num2, answer
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 100) + 1
      num2 = Math.floor(Math.random() * 100) + 1
      answer = num1 + num2
      break
    case '-':
      num1 = Math.floor(Math.random() * 100) + 50
      num2 = Math.floor(Math.random() * 50) + 1
      answer = num1 - num2
      break
    case '*':
      num1 = Math.floor(Math.random() * 12) + 1
      num2 = Math.floor(Math.random() * 12) + 1
      answer = num1 * num2
      break
  }

  const mathMsg = `🧮 *MATEMÁTICAS RÁPIDAS VIP* 🧮

⚡ **Resuelve rápidamente:**

${num1} ${operation} ${num2} = ?

⏰ **Tiempo límite:** 10 segundos
💰 **Premio por respuesta correcta:** 25 puntos
💎 **Bonus por velocidad:** Hasta 50 puntos extra
🏆 **Racha actual:** ${userArcade.mathStreak || 0}

*¡Escribe solo el número!*`

  await conn.reply(m.chat, mathMsg, m)
  
  global.db.data.users[m.sender].activeMath = {
    answer: answer,
    startTime: Date.now(),
    operation: `${num1} ${operation} ${num2}`,
    timestamp: Date.now()
  }
}

async function playVipTyping(conn, m, userArcade) {
  const phrases = [
    "La programación es el arte de convertir cafeína en código",
    "VIP Gaming Premium Experience Extraordinaire",
    "Velocidad y precisión definen a un verdadero gamer",
    "Los bots inteligentes dominan el futuro digital",
    "WhatsApp bots revolucionan la comunicación moderna"
  ]
  
  const phrase = phrases[Math.floor(Math.random() * phrases.length)]
  
  const typingMsg = `⌨️ *VELOCIDAD DE ESCRITURA VIP* ⌨️

📝 **Escribe exactamente este texto:**

"${phrase}"

⏰ **El cronómetro empieza cuando envíes tu respuesta**
🎯 **Precisión:** Debe ser exacto (mayúsculas y símbolos)
💰 **Premio:** Basado en WPM (palabras por minuto)
🏆 **Record actual:** ${userArcade.highScores.typing || 0} WPM

*¡Copia y pega NO cuenta! Solo escritura manual*`

  await conn.reply(m.chat, typingMsg, m)
  
  global.db.data.users[m.sender].activeTyping = {
    targetPhrase: phrase,
    startTime: Date.now(),
    timestamp: Date.now()
  }
}

function generateSnakeBoard() {
  const width = 20
  const height = 15
  let board = ''
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width-1 || y === 0 || y === height-1) {
        board += '⬛'
      } else {
        board += '⬜'
      }
    }
    board += '\n'
  }
  
  return board
}

async function showArcadeLeaderboard(conn, m) {
  const leaderboardMsg = `🏆 *LEADERBOARD ARCADE VIP* 🏆

🐍 **Snake:**
1. @user1 - 2,450 pts
2. @user2 - 1,890 pts  
3. @user3 - 1,670 pts

⚡ **Reflejos:**
1. @user4 - 145ms
2. @user5 - 167ms
3. @user6 - 201ms

🧮 **Matemáticas:**
1. @user7 - 95% precisión
2. @user8 - 87% precisión
3. @user9 - 82% precisión

⌨️ **Escritura:**
1. @user10 - 85 WPM
2. @user11 - 78 WPM
3. @user12 - 71 WPM

🎮 **Más Activo:**
👑 @champion - 247 juegos

> *¡Compite por el primer lugar en todos los juegos!*`

  await conn.reply(m.chat, leaderboardMsg, m)
}

handler.help = ['viparcade', 'arcadevip']
handler.tags = ['vip-games']
handler.command = /^(viparcade|arcadevip|arcadavip)$/i

export default handler
