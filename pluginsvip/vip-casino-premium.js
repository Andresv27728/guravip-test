
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const game = args[0]?.toLowerCase()
  
  if (!game) {
    return conn.reply(m.chat, `🎰 *CASINO VIP PREMIUM SUITE* 🎰

*🎲 JUEGOS DE MESA VIP:*
• blackjack - 21 premium con seguro
• roulette - Ruleta europea VIP
• poker - Texas Hold'em VIP
• baccarat - Baccarat de alto límite
• craps - Dados premium
• sicbo - Dados chinos VIP

*🎰 SLOTS PREMIUM:*
• megaslot - Mega slots con jackpot
• lucky7 - Slots de la suerte VIP
• diamond - Slots de diamante
• royal - Slots reales premium
• progressive - Jackpot progresivo

*🃏 CARTAS VIP:*
• war - Guerra de cartas premium
• crash - Juego del avión VIP
• coinflip - Cara o cruz VIP
• dice - Dados de apuesta alta

*💎 ESPECIALES VIP:*
• daily - Bonus diario VIP
• wheel - Rueda de la fortuna
• lottery - Lotería premium
• jackpot - Mega jackpot diario

*Uso:* ${usedPrefix + command} [juego] [apuesta]
*Ejemplo:* ${usedPrefix + command} blackjack 100`, m)
  }

  const userId = m.sender
  
  if (!global.db.data.users[userId].vipCasino) {
    global.db.data.users[userId].vipCasino = {
      chips: 1000, // Chips iniciales VIP
      totalWon: 0,
      totalLost: 0,
      biggestWin: 0,
      gamesPlayed: 0,
      vipLevel: 1,
      dailyBonus: 0,
      achievements: []
    }
  }

  const userCasino = global.db.data.users[userId].vipCasino

  try {
    await m.react('🎰')

    switch (game) {
      case 'blackjack':
        await playVipBlackjackPremium(conn, m, userCasino, parseInt(args[1]) || 50)
        break
      case 'roulette':
        await playVipRoulettePremium(conn, m, userCasino, args[1], parseInt(args[2]) || 25)
        break
      case 'megaslot':
        await playVipMegaSlot(conn, m, userCasino, parseInt(args[1]) || 25)
        break
      case 'crash':
        await playVipCrash(conn, m, userCasino, parseInt(args[1]) || 50)
        break
      case 'wheel':
        await playVipWheelFortune(conn, m, userCasino)
        break
      case 'daily':
        await claimVipDailyBonus(conn, m, userCasino)
        break
      case 'stats':
        await showVipCasinoStats(conn, m, userCasino)
        break
      case 'shop':
        await showVipCasinoShop(conn, m, userCasino)
        break
      default:
        return conn.reply(m.chat, '❌ Juego de casino VIP no reconocido.', m)
    }

    userCasino.gamesPlayed++
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en casino VIP: ' + e.message, m)
  }
}

async function playVipMegaSlot(conn, m, userCasino, bet) {
  if (bet > userCasino.chips) {
    return conn.reply(m.chat, `❌ No tienes suficientes chips. Tienes: ${userCasino.chips} chips`, m)
  }

  const premiumSymbols = ['💎', '👑', '🔥', '⚡', '🌟', '💰', '🎯', '🏆', '💫', '✨']
  const reels = []
  
  // Generar 5 carretes con animación
  let slotMsg = await conn.reply(m.chat, '🎰 *MEGA SLOT VIP PREMIUM* 🎰\n\n🔄 Girando carretes...', m)
  
  for (let i = 0; i < 5; i++) {
    reels.push(premiumSymbols[Math.floor(Math.random() * premiumSymbols.length)])
    
    await new Promise(resolve => setTimeout(resolve, 500))
    await conn.sendMessage(m.chat, {
      text: `🎰 *MEGA SLOT VIP PREMIUM* 🎰\n\n${reels.map((symbol, index) => index <= i ? symbol : '🔄').join(' | ')}\n\nCarrete ${i + 1}/5 completado...`,
      edit: slotMsg.key
    })
  }

  // Evaluar resultado
  let winnings = 0
  let multiplier = 0
  let specialBonus = ''

  // Jackpot progresivo
  if (reels.every(symbol => symbol === '💎')) {
    multiplier = 1000
    specialBonus = '\n🎊 **¡¡¡MEGA JACKPOT PROGRESIVO!!!** 🎊'
    userCasino.achievements.push('Mega Jackpot Winner')
  }
  // 5 de cualquier símbolo
  else if (reels.every(symbol => symbol === reels[0])) {
    multiplier = 100
    specialBonus = '\n🏆 **¡LÍNEA COMPLETA!** 🏆'
  }
  // 4 iguales
  else if (reels.filter(symbol => symbol === reels[0]).length >= 4) {
    multiplier = 25
    specialBonus = '\n✨ **¡CUÁDRUPLE!** ✨'
  }
  // 3 iguales
  else if (reels.filter(symbol => symbol === reels[0]).length >= 3) {
    multiplier = 8
    specialBonus = '\n🌟 **¡TRIPLE!** 🌟'
  }
  // Dos pares
  else {
    const symbolCounts = {}
    reels.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1
    })
    const pairs = Object.values(symbolCounts).filter(count => count >= 2).length
    if (pairs >= 2) {
      multiplier = 3
      specialBonus = '\n💫 **¡DOS PARES!** 💫'
    }
  }

  winnings = bet * multiplier
  const profit = winnings - bet

  userCasino.chips += profit
  if (profit > 0) {
    userCasino.totalWon += profit
    if (profit > userCasino.biggestWin) {
      userCasino.biggestWin = profit
    }
  } else {
    userCasino.totalLost += bet
  }

  const resultMsg = `🎰 *MEGA SLOT VIP RESULTADO* 🎰

┌─────────────────────┐
│ ${reels.join(' │ ')} │
└─────────────────────┘

💰 **Apuesta:** ${bet} chips
🎯 **Multiplicador:** x${multiplier}
${profit > 0 ? '🎉' : '💸'} **${profit > 0 ? 'Ganancia' : 'Pérdida'}:** ${Math.abs(profit)} chips

${specialBonus}

🏦 **Chips totales:** ${userCasino.chips}
🏆 **Mayor ganancia:** ${userCasino.biggestWin} chips

> *¡Sigue girando para ganar el mega jackpot!*`

  await conn.sendMessage(m.chat, {
    text: resultMsg,
    edit: slotMsg.key
  })
}

async function playVipCrash(conn, m, userCasino, bet) {
  if (bet > userCasino.chips) {
    return conn.reply(m.chat, `❌ No tienes suficientes chips. Tienes: ${userCasino.chips} chips`, m)
  }

  // Generar punto de crash (entre 1.00x y 50.00x)
  const crashPoint = Math.random() < 0.95 ? 
    Math.random() * 5 + 1 : // 95% entre 1x-6x
    Math.random() * 45 + 5  // 5% entre 5x-50x

  let currentMultiplier = 1.00
  let crashMsg = await conn.reply(m.chat, `🚀 *CRASH VIP PREMIUM* 🚀\n\n📈 Multiplicador: 1.00x\n💰 Apuesta: ${bet} chips\n\n*Escribe "cash" para retirar o espera...*`, m)

  // Animación del multiplicador subiendo
  const interval = setInterval(async () => {
    currentMultiplier += 0.05
    
    if (currentMultiplier >= crashPoint) {
      clearInterval(interval)
      
      // El juego crasheó
      userCasino.chips -= bet
      userCasino.totalLost += bet
      
      await conn.sendMessage(m.chat, {
        text: `💥 *CRASH!* 💥\n\n🚀 El multiplicador crasheó en ${crashPoint.toFixed(2)}x\n💸 Perdiste ${bet} chips\n🏦 Chips restantes: ${userCasino.chips}\n\n> *¡Debes hacer cash out antes del crash!*`,
        edit: crashMsg.key
      })
      
      // Limpiar el juego activo
      delete global.db.data.users[m.sender].activeCrash
      return
    }

    await conn.sendMessage(m.chat, {
      text: `🚀 *CRASH VIP PREMIUM* 🚀\n\n📈 Multiplicador: ${currentMultiplier.toFixed(2)}x\n💰 Ganancia potencial: ${Math.floor(bet * currentMultiplier)} chips\n\n*Escribe "cash" para retirar o espera...*`,
      edit: crashMsg.key
    })
  }, 1000)

  // Guardar el juego activo
  global.db.data.users[m.sender].activeCrash = {
    bet: bet,
    currentMultiplier: currentMultiplier,
    crashPoint: crashPoint,
    interval: interval,
    msgKey: crashMsg.key,
    timestamp: Date.now()
  }
}

async function playVipWheelFortune(conn, m, userCasino) {
  const wheelSegments = [
    { name: '💎 1000 Chips', value: 1000, color: '💎', chance: 2 },
    { name: '🏆 500 Chips', value: 500, color: '🏆', chance: 5 },
    { name: '👑 250 Chips', value: 250, color: '👑', chance: 8 },
    { name: '🔥 100 Chips', value: 100, color: '🔥', chance: 15 },
    { name: '⭐ 50 Chips', value: 50, color: '⭐', chance: 20 },
    { name: '💰 25 Chips', value: 25, color: '💰', chance: 25 },
    { name: '😔 Nada', value: 0, color: '⚫', chance: 25 }
  ]

  let wheelMsg = await conn.reply(m.chat, '🎡 *RUEDA DE LA FORTUNA VIP* 🎡\n\n🔄 Girando la rueda mágica...', m)

  // Animación de giro
  const spinAnimations = ['🔄', '⚡', '🌟', '💫', '✨', '⭐', '🎯', '🎪']
  
  for (let i = 0; i < 8; i++) {
    await new Promise(resolve => setTimeout(resolve, 600))
    await conn.sendMessage(m.chat, {
      text: `🎡 *RUEDA DE LA FORTUNA VIP* 🎡\n\n${spinAnimations[i]} Girando con poder VIP...`,
      edit: wheelMsg.key
    })
  }

  // Determinar resultado
  const random = Math.random() * 100
  let accumulated = 0
  let selectedSegment = wheelSegments[wheelSegments.length - 1]

  for (const segment of wheelSegments) {
    accumulated += segment.chance
    if (random <= accumulated) {
      selectedSegment = segment
      break
    }
  }

  userCasino.chips += selectedSegment.value
  if (selectedSegment.value > 0) {
    userCasino.totalWon += selectedSegment.value
  }

  const resultMsg = `🎡 *RESULTADO DE LA RUEDA VIP* 🎡

${selectedSegment.color} **${selectedSegment.name}** ${selectedSegment.color}

${selectedSegment.value > 0 ? 
  `🎉 ¡Felicidades! Has ganado ${selectedSegment.value} chips` : 
  '😔 Mejor suerte la próxima vez'}

🏦 **Chips totales:** ${userCasino.chips}
💰 **Total ganado:** ${userCasino.totalWon} chips

> *¡Gira la rueda una vez al día para premios increíbles!*`

  await conn.sendMessage(m.chat, {
    text: resultMsg,
    edit: wheelMsg.key
  })
}

async function claimVipDailyBonus(conn, m, userCasino) {
  const today = new Date().toDateString()
  
  if (userCasino.lastDailyBonus === today) {
    return conn.reply(m.chat, '⏰ Ya reclamaste tu bonus diario VIP. Vuelve mañana.', m)
  }

  const baseBonus = 200
  const levelBonus = userCasino.vipLevel * 50
  const totalBonus = baseBonus + levelBonus

  userCasino.chips += totalBonus
  userCasino.lastDailyBonus = today

  const bonusMsg = `🎁 *BONUS DIARIO VIP RECLAMADO* 🎁

💰 **Bonus base:** ${baseBonus} chips
⭐ **Bonus VIP nivel ${userCasino.vipLevel}:** ${levelBonus} chips
💎 **Total recibido:** ${totalBonus} chips

🏦 **Chips totales:** ${userCasino.chips}

🎊 **¡Bonus reclamado con éxito!**
⏰ **Próximo bonus:** Mañana

> *¡Sube de nivel VIP para obtener mejores bonuses!*`

  await conn.reply(m.chat, bonusMsg, m)
}

async function showVipCasinoStats(conn, m, userCasino) {
  const winRate = userCasino.gamesPlayed > 0 ? 
    ((userCasino.totalWon / (userCasino.totalWon + userCasino.totalLost)) * 100).toFixed(1) : 0

  const statsMsg = `📊 *ESTADÍSTICAS CASINO VIP* 📊

💎 **Estado VIP:**
🏦 Chips: ${userCasino.chips}
⭐ Nivel VIP: ${userCasino.vipLevel}
🎮 Juegos jugados: ${userCasino.gamesPlayed}

💰 **Historial Financiero:**
📈 Total ganado: ${userCasino.totalWon} chips
📉 Total perdido: ${userCasino.totalLost} chips
🏆 Mayor ganancia: ${userCasino.biggestWin} chips
📊 Tasa de victoria: ${winRate}%

🏅 **Logros VIP:**
${userCasino.achievements.length > 0 ? 
  userCasino.achievements.map(achievement => `• ${achievement}`).join('\n') : 
  '• Ningún logro aún'}

💡 **Tips VIP:**
• Gestiona tu bankroll sabiamente
• Los juegos de mesa tienen mejores odds
• Usa la estrategia en blackjack
• Aprovecha los bonuses diarios

> *¡Juega responsablemente y disfruta la experiencia VIP!*`

  await conn.reply(m.chat, statsMsg, m)
}

handler.help = ['vipcasino', 'casinovip']
handler.tags = ['vip-games']
handler.command = /^(vipcasino|casinovip|casinopremium)$/i

export default handler
