
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const game = args[0]?.toLowerCase()
  
  if (!game) {
    return conn.reply(m.chat, `💎 *VIP GAMES PREMIUM SUITE*

*🎮 JUEGOS CLÁSICOS VIP:*
• trivia - Trivia VIP con recompensas
• casino - Casino premium con jackpots
• puzzle - Rompecabezas avanzado
• battle - Batalla de stats VIP
• treasure - Búsqueda del tesoro
• riddle - Acertijos de genio
• memory - Memoria premium

*🎯 JUEGOS DE ESTRATEGIA VIP:*
• chess - Ajedrez premium
• poker - Póker VIP con apuestas
• blackjack - 21 premium
• roulette - Ruleta europea VIP
• bingo - Bingo premium
• lottery - Lotería VIP diaria

*🎪 JUEGOS DE DIVERSIÓN VIP:*
• spin - Rueda de la fortuna VIP
• scratch - Raspaditas premium
• duel - Duelos entre usuarios
• race - Carreras VIP
• fishing - Pesca premium
• mining - Minería de gemas VIP

*🏆 JUEGOS DE COMPETENCIA VIP:*
• tournament - Torneos VIP
• league - Liga premium
• challenge - Desafíos diarios
• boss - Jefes épicos
• arena - Arena PvP VIP

*Uso:* ${usedPrefix + command} [juego]
*Ejemplo:* ${usedPrefix + command} chess`, m)
  }

  const userId = m.sender
  
  // Inicializar datos del usuario VIP
  if (!global.db.data.users[userId].vipGames) {
    global.db.data.users[userId].vipGames = {
      points: 0,
      level: 1,
      achievements: [],
      lastPlayed: 0,
      wins: 0,
      losses: 0,
      totalGames: 0,
      streak: 0,
      maxStreak: 0,
      gems: 0,
      trophies: 0,
      experience: 0
    }
  }

  const userGame = global.db.data.users[userId].vipGames

  try {
    await m.react('💎')

    switch (game) {
      // Juegos Clásicos
      case 'trivia':
        await playVipTrivia(conn, m, userGame)
        break
      case 'casino':
        await playVipCasino(conn, m, userGame, args[1])
        break
      case 'puzzle':
        await playVipPuzzle(conn, m, userGame)
        break
      case 'battle':
        await playVipBattle(conn, m, userGame)
        break
      case 'treasure':
        await playVipTreasure(conn, m, userGame)
        break
      case 'riddle':
        await playVipRiddle(conn, m, userGame)
        break
      case 'memory':
        await playVipMemory(conn, m, userGame)
        break
      
      // Juegos de Estrategia
      case 'chess':
        await playVipChess(conn, m, userGame)
        break
      case 'poker':
        await playVipPoker(conn, m, userGame, args[1])
        break
      case 'blackjack':
        await playVipBlackjack(conn, m, userGame, args[1])
        break
      case 'roulette':
        await playVipRoulette(conn, m, userGame, args[1], args[2])
        break
      case 'bingo':
        await playVipBingo(conn, m, userGame)
        break
      case 'lottery':
        await playVipLottery(conn, m, userGame, args[1])
        break
      
      // Juegos de Diversión
      case 'spin':
        await playVipSpin(conn, m, userGame)
        break
      case 'scratch':
        await playVipScratch(conn, m, userGame, args[1])
        break
      case 'duel':
        await playVipDuel(conn, m, userGame, args[1])
        break
      case 'race':
        await playVipRace(conn, m, userGame)
        break
      case 'fishing':
        await playVipFishing(conn, m, userGame)
        break
      case 'mining':
        await playVipMining(conn, m, userGame)
        break
      
      // Juegos de Competencia
      case 'tournament':
        await playVipTournament(conn, m, userGame)
        break
      case 'league':
        await playVipLeague(conn, m, userGame)
        break
      case 'challenge':
        await playVipChallenge(conn, m, userGame)
        break
      case 'boss':
        await playVipBoss(conn, m, userGame)
        break
      case 'arena':
        await playVipArena(conn, m, userGame, args[1])
        break
      
      // Estadísticas
      case 'stats':
        await showVipGameStats(conn, m, userGame)
        break
      case 'shop':
        await showVipGameShop(conn, m, userGame)
        break
      case 'leaderboard':
        await showVipLeaderboard(conn, m)
        break
      
      default:
        return conn.reply(m.chat, '❌ Juego VIP no reconocido. Usa el comando sin parámetros para ver la lista completa.', m)
    }

    userGame.totalGames++
    userGame.lastPlayed = Date.now()
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en el juego VIP: ' + e.message, m)
  }
}

// Juegos Clásicos (ya existentes, mejorados)
async function playVipTrivia(conn, m, userGame) {
  const categories = {
    ciencia: [
      { q: "¿Cuál es el elemento más abundante en el universo?", a: ["hidrógeno", "hidrogeno"], points: 50 },
      { q: "¿Cuántos planetas hay en el sistema solar?", a: ["8", "ocho"], points: 30 },
      { q: "¿Cuál es la velocidad de la luz?", a: ["300000000", "3x10^8"], points: 70 }
    ],
    historia: [
      { q: "¿En qué año cayó el muro de Berlín?", a: ["1989"], points: 40 },
      { q: "¿Quién fue el primer emperador romano?", a: ["augusto", "octavio"], points: 60 },
      { q: "¿En qué año llegó Colón a América?", a: ["1492"], points: 30 }
    ],
    tecnologia: [
      { q: "¿En qué año se fundó Google?", a: ["1998"], points: 35 },
      { q: "¿Quién creó Linux?", a: ["linus torvalds", "linus"], points: 55 },
      { q: "¿Qué significa HTML?", a: ["hypertext markup language"], points: 45 }
    ]
  }

  const categoryNames = Object.keys(categories)
  const selectedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)]
  const questions = categories[selectedCategory]
  const question = questions[Math.floor(Math.random() * questions.length)]
  
  const triviaMsg = `💎 *VIP TRIVIA PREMIUM* 💎

📚 **Categoría:** ${selectedCategory.toUpperCase()}
🧠 **Pregunta:**
${question.q}

💰 **Recompensa:** ${question.points} puntos VIP
💎 **Bonus:** +${Math.floor(question.points * 0.2)} gemas
⏰ **Tiempo:** 30 segundos
🔥 **Racha actual:** ${userGame.streak || 0}

*Responde con la respuesta correcta*`

  await conn.reply(m.chat, triviaMsg, m)

  global.db.data.users[m.sender].activeTrivia = {
    question: question,
    category: selectedCategory,
    timestamp: Date.now()
  }
}

async function playVipCasino(conn, m, userGame, bet) {
  const betAmount = parseInt(bet) || 10
  
  if (betAmount > userGame.points && userGame.points > 0) {
    return conn.reply(m.chat, `❌ No tienes suficientes puntos VIP. Tienes: ${userGame.points}`, m)
  }

  const slots = ['🍒', '🍊', '🍋', '🍇', '⭐', '💎', '👑', '🔥', '⚡', '💫']
  const result = [
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)]
  ]

  let winnings = 0
  let message = `💎 *VIP CASINO PREMIUM* 💎\n\n🎰 **Máquina Tragamonedas VIP:**\n┌─────────────┐\n│ ${result.join(' │ ')} │\n└─────────────┘\n\n`

  // Sistema de premios mejorado
  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '💎') {
      winnings = betAmount * 20
      userGame.gems += 10
      message += `💎💎💎 **¡¡¡MEGA JACKPOT DIAMANTE!!!** 💎💎💎\n🎊 Ganaste ${winnings} puntos VIP + 10 gemas!`
    } else if (result[0] === '👑') {
      winnings = betAmount * 10
      userGame.gems += 5
      message += `👑👑👑 **¡TRIPLE CORONA REAL!** 👑👑👑\n🏆 Ganaste ${winnings} puntos VIP + 5 gemas!`
    } else if (result[0] === '🔥') {
      winnings = betAmount * 8
      userGame.gems += 3
      message += `🔥🔥🔥 **¡TRIPLE FUEGO!** 🔥🔥🔥\n⚡ Ganaste ${winnings} puntos VIP + 3 gemas!`
    } else {
      winnings = betAmount * 5
      userGame.gems += 2
      message += `🎉 **¡TRIPLE!** 🎉\n✨ Ganaste ${winnings} puntos VIP + 2 gemas!`
    }
    userGame.wins++
    userGame.streak = (userGame.streak || 0) + 1
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    winnings = Math.floor(betAmount * 2)
    userGame.gems += 1
    message += `💫 **¡DOBLE!** 💫\n🌟 Ganaste ${winnings} puntos VIP + 1 gema!`
    userGame.wins++
    userGame.streak = (userGame.streak || 0) + 1
  } else {
    winnings = -betAmount
    message += `💸 **Sin suerte esta vez...** 💸\n😔 Perdiste ${betAmount} puntos VIP`
    userGame.losses++
    userGame.streak = 0
  }

  if (userGame.streak > userGame.maxStreak) {
    userGame.maxStreak = userGame.streak
  }

  userGame.points += winnings
  if (userGame.points < 0) userGame.points = 0

  message += `\n\n📊 **Estados:**\n💰 Puntos VIP: ${userGame.points}\n💎 Gemas: ${userGame.gems}\n🔥 Racha: ${userGame.streak}\n🏆 Mejor racha: ${userGame.maxStreak}`

  await conn.reply(m.chat, message, m)
}

// Nuevos Juegos de Estrategia
async function playVipChess(conn, m, userGame) {
  const chessMsg = `♟️ *AJEDREZ VIP PREMIUM* ♟️

🏁 **Iniciando partida de ajedrez VIP**

  a b c d e f g h
8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ 8
7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ 7
6 · · · · · · · · 6
5 · · · · · · · · 5
4 · · · · · · · · 4
3 · · · · · · · · 3
2 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙ 2
1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖ 1
  a b c d e f g h

🎯 **Tu turno (blancas)**
📝 Escribe tu jugada: ej. "e2-e4"
💰 **Premio por victoria:** 200 puntos VIP
💎 **Bonus por jaque mate:** 50 gemas
⏰ **Tiempo por jugada:** 60 segundos

> *Ajedrez con IA avanzada VIP*`

  await conn.reply(m.chat, chessMsg, m)
  
  global.db.data.users[m.sender].activeChess = {
    board: "initial",
    turn: "white",
    timestamp: Date.now()
  }
}

async function playVipPoker(conn, m, userGame, bet) {
  const betAmount = parseInt(bet) || 50
  
  if (betAmount > userGame.points) {
    return conn.reply(m.chat, `❌ No tienes suficientes puntos para apostar ${betAmount}. Tienes: ${userGame.points}`, m)
  }

  const suits = ['♠', '♥', '♦', '♣']
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  // Generar mano del jugador
  const playerHand = []
  for (let i = 0; i < 5; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)]
    const value = values[Math.floor(Math.random() * values.length)]
    playerHand.push(value + suit)
  }

  // Evaluar mano
  const handRank = evaluatePokerHand(playerHand)
  let multiplier = 0
  
  switch (handRank.rank) {
    case 'Royal Flush': multiplier = 250; break
    case 'Straight Flush': multiplier = 50; break
    case 'Four of a Kind': multiplier = 25; break
    case 'Full House': multiplier = 9; break
    case 'Flush': multiplier = 6; break
    case 'Straight': multiplier = 4; break
    case 'Three of a Kind': multiplier = 3; break
    case 'Two Pair': multiplier = 2; break
    case 'Pair': multiplier = 1; break
    default: multiplier = 0
  }

  const winnings = multiplier > 0 ? betAmount * multiplier - betAmount : -betAmount
  userGame.points += winnings

  const pokerMsg = `🃏 *PÓKER VIP PREMIUM* 🃏

🎴 **Tu mano:**
${playerHand.join(' ')}

🏆 **Resultado:** ${handRank.rank}
💰 **Apuesta:** ${betAmount} puntos
🎯 **Multiplicador:** x${multiplier}
${winnings > 0 ? '🎉' : '💸'} **${winnings > 0 ? 'Ganancia' : 'Pérdida'}:** ${Math.abs(winnings)} puntos

📊 **Total:** ${userGame.points} puntos VIP`

  await conn.reply(m.chat, pokerMsg, m)
}

async function playVipBlackjack(conn, m, userGame, bet) {
  const betAmount = parseInt(bet) || 25
  
  if (betAmount > userGame.points) {
    return conn.reply(m.chat, `❌ No tienes suficientes puntos para apostar ${betAmount}. Tienes: ${userGame.points}`, m)
  }

  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const getCard = () => cards[Math.floor(Math.random() * cards.length)]
  const getCardValue = (card) => {
    if (['J', 'Q', 'K'].includes(card)) return 10
    if (card === 'A') return 11
    return parseInt(card)
  }

  // Manos iniciales
  const playerCards = [getCard(), getCard()]
  const dealerCards = [getCard(), getCard()]
  
  let playerTotal = playerCards.reduce((sum, card) => sum + getCardValue(card), 0)
  let dealerTotal = dealerCards.reduce((sum, card) => sum + getCardValue(card), 0)

  // Ajustar Ases del jugador
  let aces = playerCards.filter(card => card === 'A').length
  while (playerTotal > 21 && aces > 0) {
    playerTotal -= 10
    aces--
  }

  const blackjackMsg = `🃏 *BLACKJACK VIP PREMIUM* 🃏

👤 **Tus cartas:** ${playerCards.join(' ')} = ${playerTotal}
🤖 **Dealer:** ${dealerCards[0]} [?] = ${getCardValue(dealerCards[0])} + ?

💰 **Apuesta:** ${betAmount} puntos VIP
🎯 **Objetivo:** Llegar a 21 sin pasarte

⌨️ **Opciones:**
• Escribe "hit" para pedir carta
• Escribe "stand" para plantarte
${playerTotal === 21 ? '\n🎉 **¡BLACKJACK!** 🎉' : ''}

> *Blackjack con estrategia premium*`

  await conn.reply(m.chat, blackjackMsg, m)
  
  if (playerTotal === 21) {
    const winnings = Math.floor(betAmount * 2.5)
    userGame.points += winnings
    await conn.reply(m.chat, `🎉 **¡BLACKJACK NATURAL!**\n💰 Ganaste ${winnings} puntos VIP\n📊 Total: ${userGame.points} puntos`, m)
  } else {
    global.db.data.users[m.sender].activeBlackjack = {
      playerCards,
      dealerCards,
      playerTotal,
      dealerTotal,
      bet: betAmount,
      timestamp: Date.now()
    }
  }
}

// Juegos de Diversión
async function playVipSpin(conn, m, userGame) {
  const prizes = [
    { name: '💎 100 Gemas', value: 100, type: 'gems', chance: 5 },
    { name: '👑 500 Puntos VIP', value: 500, type: 'points', chance: 10 },
    { name: '🎁 Caja Misteriosa', value: 1, type: 'mystery', chance: 8 },
    { name: '⭐ 50 XP', value: 50, type: 'exp', chance: 15 },
    { name: '🔥 Boost x2', value: 2, type: 'boost', chance: 12 },
    { name: '💰 250 Puntos', value: 250, type: 'points', chance: 20 },
    { name: '🎯 Mejor Suerte', value: 0, type: 'nothing', chance: 30 }
  ]

  // Simular giro con animación
  let spinMsg = await conn.reply(m.chat, '🎡 *RUEDA DE LA FORTUNA VIP* 🎡\n\n🔄 Girando...', m)
  
  const animations = ['🔄', '⚡', '🌟', '💫', '✨', '⭐', '🎯', '🎪']
  
  for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setTimeout(resolve, 800))
    await conn.sendMessage(m.chat, {
      text: `🎡 *RUEDA DE LA FORTUNA VIP* 🎡\n\n${animations[i % animations.length]} Girando la rueda mágica...`,
      edit: spinMsg.key
    })
  }

  // Determinar premio
  const random = Math.random() * 100
  let accumulated = 0
  let selectedPrize = prizes[prizes.length - 1] // Por defecto el último

  for (const prize of prizes) {
    accumulated += prize.chance
    if (random <= accumulated) {
      selectedPrize = prize
      break
    }
  }

  // Aplicar premio
  let resultMsg = `🎡 *RESULTADO DEL GIRO VIP* 🎡\n\n🎉 **¡Has ganado:**\n${selectedPrize.name}\n\n`

  switch (selectedPrize.type) {
    case 'gems':
      userGame.gems = (userGame.gems || 0) + selectedPrize.value
      resultMsg += `💎 +${selectedPrize.value} gemas añadidas`
      break
    case 'points':
      userGame.points += selectedPrize.value
      resultMsg += `💰 +${selectedPrize.value} puntos VIP añadidos`
      break
    case 'exp':
      userGame.experience = (userGame.experience || 0) + selectedPrize.value
      resultMsg += `⭐ +${selectedPrize.value} experiencia añadida`
      break
    case 'mystery':
      resultMsg += `🎁 ¡Abre tu caja misteriosa con .vipgames mystery!`
      userGame.mysteryBoxes = (userGame.mysteryBoxes || 0) + 1
      break
    case 'boost':
      resultMsg += `🔥 ¡Boost activado por 1 hora!`
      userGame.boostUntil = Date.now() + (60 * 60 * 1000)
      break
    default:
      resultMsg += `😔 Mejor suerte la próxima vez`
  }

  resultMsg += `\n\n📊 **Tus stats:**\n💰 Puntos: ${userGame.points}\n💎 Gemas: ${userGame.gems || 0}\n⭐ Experiencia: ${userGame.experience || 0}`

  await conn.sendMessage(m.chat, {
    text: resultMsg,
    edit: spinMsg.key
  })
}

async function playVipFishing(conn, m, userGame) {
  const fishTypes = [
    { name: '🐟 Pez Común', points: 10, gems: 0, rarity: 'Común', chance: 40 },
    { name: '🐠 Pez Tropical', points: 25, gems: 1, rarity: 'Poco Común', chance: 25 },
    { name: '🎣 Trucha Dorada', points: 50, gems: 2, rarity: 'Raro', chance: 15 },
    { name: '🦈 Tiburón Bebé', points: 100, gems: 5, rarity: 'Épico', chance: 10 },
    { name: '🐙 Pulpo Gigante', points: 200, gems: 10, rarity: 'Legendario', chance: 5 },
    { name: '🐋 Ballena Azul', points: 500, gems: 25, rarity: 'Mítico', chance: 3 },
    { name: '🏺 Tesoro Perdido', points: 1000, gems: 50, rarity: 'Divino', chance: 2 }
  ]

  // Animación de pesca
  let fishMsg = await conn.reply(m.chat, '🎣 *PESCA VIP PREMIUM* 🎣\n\n🌊 Lanzando caña al mar...', m)
  
  const fishingSteps = [
    '🎣 Lanzando caña al mar...',
    '🌊 Esperando que pique...',
    '⚡ ¡Algo está mordiendo!',
    '💪 ¡Tirando con fuerza!',
    '🎯 ¡Casi lo tengo!',
    '🎉 ¡Capturado!'
  ]

  for (let i = 0; i < fishingSteps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await conn.sendMessage(m.chat, {
      text: `🎣 *PESCA VIP PREMIUM* 🎣\n\n${fishingSteps[i]}`,
      edit: fishMsg.key
    })
  }

  // Determinar pesca
  const random = Math.random() * 100
  let accumulated = 0
  let caughtFish = fishTypes[0]

  for (const fish of fishTypes) {
    accumulated += fish.chance
    if (random <= accumulated) {
      caughtFish = fish
      break
    }
  }

  userGame.points += caughtFish.points
  userGame.gems = (userGame.gems || 0) + caughtFish.gems

  const resultMsg = `🎣 *PESCA EXITOSA VIP* 🎣

🎯 **¡Has pescado:**
${caughtFish.name}

✨ **Rareza:** ${caughtFish.rarity}
💰 **Valor:** ${caughtFish.points} puntos VIP
💎 **Gemas:** +${caughtFish.gems}

🏆 **Logro desbloqueado:** Pescador VIP
📊 **Total:** ${userGame.points} puntos | ${userGame.gems} gemas

> *¡Sigue pescando para encontrar criaturas más raras!*`

  await conn.sendMessage(m.chat, {
    text: resultMsg,
    edit: fishMsg.key
  })
}

async function playVipMining(conn, m, userGame) {
  const minerals = [
    { name: '🪨 Piedra', points: 5, gems: 0, rarity: 'Común', chance: 35 },
    { name: '🥉 Cobre', points: 15, gems: 1, rarity: 'Común', chance: 25 },
    { name: '🥈 Plata', points: 35, gems: 2, rarity: 'Poco Común', chance: 20 },
    { name: '🥇 Oro', points: 75, gems: 5, rarity: 'Raro', chance: 12 },
    { name: '💎 Diamante', points: 150, gems: 10, rarity: 'Épico', chance: 5 },
    { name: '🔮 Cristal Mágico', points: 300, gems: 20, rarity: 'Legendario', chance: 2 },
    { name: '⭐ Estrella Caída', points: 750, gems: 50, rarity: 'Mítico', chance: 1 }
  ]

  const tools = ['⛏️', '🔨', '💎', '⚡']
  let miningMsg = await conn.reply(m.chat, `${tools[0]} *MINERÍA VIP PREMIUM* ${tools[0]}\n\n🏔️ Buscando el lugar perfecto...`, m)

  const miningSteps = [
    '🏔️ Buscando el lugar perfecto...',
    '⛏️ Empezando a excavar...',
    '💪 Cavando más profundo...',
    '✨ ¡Algo brilla en la oscuridad!',
    '🔍 Examinando el descubrimiento...',
    '🎉 ¡Mineral extraído!'
  ]

  for (let i = 0; i < miningSteps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const tool = tools[i % tools.length]
    await conn.sendMessage(m.chat, {
      text: `${tool} *MINERÍA VIP PREMIUM* ${tool}\n\n${miningSteps[i]}`,
      edit: miningMsg.key
    })
  }

  // Determinar mineral encontrado
  const random = Math.random() * 100
  let accumulated = 0
  let foundMineral = minerals[0]

  for (const mineral of minerals) {
    accumulated += mineral.chance
    if (random <= accumulated) {
      foundMineral = mineral
      break
    }
  }

  userGame.points += foundMineral.points
  userGame.gems = (userGame.gems || 0) + foundMineral.gems

  const resultMsg = `⛏️ *DESCUBRIMIENTO MINERO VIP* ⛏️

🎯 **¡Has encontrado:**
${foundMineral.name}

✨ **Rareza:** ${foundMineral.rarity}
💰 **Valor:** ${foundMineral.points} puntos VIP
💎 **Gemas:** +${foundMineral.gems}

🏆 **Logro:** Minero Experto VIP
📊 **Total:** ${userGame.points} puntos | ${userGame.gems} gemas

> *¡Cada excavación puede revelar tesoros increíbles!*`

  await conn.sendMessage(m.chat, {
    text: resultMsg,
    edit: miningMsg.key
  })
}

// Funciones auxiliares
function evaluatePokerHand(hand) {
  // Lógica simplificada para evaluar manos de póker
  const values = hand.map(card => card.slice(0, -1))
  const suits = hand.map(card => card.slice(-1))
  
  const valueCounts = {}
  values.forEach(value => {
    valueCounts[value] = (valueCounts[value] || 0) + 1
  })
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a)
  const isFlush = suits.every(suit => suit === suits[0])
  
  if (counts[0] === 4) return { rank: 'Four of a Kind' }
  if (counts[0] === 3 && counts[1] === 2) return { rank: 'Full House' }
  if (isFlush) return { rank: 'Flush' }
  if (counts[0] === 3) return { rank: 'Three of a Kind' }
  if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair' }
  if (counts[0] === 2) return { rank: 'Pair' }
  
  return { rank: 'High Card' }
}

async function showVipGameStats(conn, m, userGame) {
  const level = Math.floor((userGame.experience || 0) / 100) + 1
  const nextLevelExp = (level * 100) - (userGame.experience || 0)
  
  const statsMsg = `📊 *ESTADÍSTICAS VIP GAMING* 📊

👤 **Perfil del Jugador:**
🎮 Nivel: ${level}
⭐ Experiencia: ${userGame.experience || 0} XP
🎯 Próximo nivel: ${nextLevelExp} XP

💰 **Recursos:**
💎 Puntos VIP: ${userGame.points}
💎 Gemas: ${userGame.gems || 0}
🏆 Trofeos: ${userGame.trophies || 0}

🎮 **Estadísticas de Juego:**
✅ Victorias: ${userGame.wins || 0}
❌ Derrotas: ${userGame.losses || 0}
🎲 Total jugado: ${userGame.totalGames || 0}
🔥 Racha actual: ${userGame.streak || 0}
🏆 Mejor racha: ${userGame.maxStreak || 0}

🏅 **Logros:**
${(userGame.achievements || []).length > 0 ? userGame.achievements.map(a => `• ${a}`).join('\n') : '• Ningún logro aún'}

⏰ **Última sesión:** ${userGame.lastPlayed ? new Date(userGame.lastPlayed).toLocaleString('es-ES') : 'Nunca'}

> *¡Sigue jugando para mejorar tus estadísticas VIP!*`

  await conn.reply(m.chat, statsMsg, m)
}

handler.help = ['vipgames', 'gamesvip']
handler.tags = ['vip-games']
handler.command = /^(vipgames|gamesvip|vipjuegos)$/i

export default handler
