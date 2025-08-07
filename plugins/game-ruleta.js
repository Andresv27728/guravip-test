
let handler = async (m, { conn }) => {
  const userId = m.sender
  const today = new Date().toDateString()
  
  // Inicializar datos del usuario si no existen
  if (!global.db.data.users[userId]) {
    global.db.data.users[userId] = {}
  }
  
  const userData = global.db.data.users[userId]
  
  // Verificar si ya usó la ruleta hoy
  if (userData.lastRuleta === today) {
    return await conn.reply(m.chat, '🎰 *¡Ya usaste la ruleta hoy!*\n\n⏰ Vuelve mañana para intentarlo de nuevo.', m, rcanal)
  }
  
  await m.react('🎰')
  
  // Animación de ruleta
  let ruletaMsg = await conn.reply(m.chat, '🎰 *¡Girando la ruleta!*\n\n🔄 Preparando...', m, rcanal)
  
  // Simular giro con animación
  const animacion = ['🔄', '🎪', '⭐', '🎯', '🎲', '💫', '✨', '🌟']
  
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 800))
    await conn.sendMessage(m.chat, {
      text: `🎰 *¡Girando la ruleta!*\n\n${animacion[i % animacion.length]} Girando...`,
      edit: ruletaMsg.key
    })
  }
  
  // Determinar resultado (2% de probabilidad de ganar)
  const numeroAleatorio = Math.floor(Math.random() * 100) + 1
  const ganador = numeroAleatorio <= 2 // 2% de probabilidad
  
  // Lista de premios posibles
  const premios = [
    '🎁 1000 XP',
    '💎 5 Diamantes',
    '🪙 500 Monedas',
    '⭐ Título Especial',
    '🎟️ Ticket Premium',
    '🏆 Trofeo de la Suerte'
  ]
  
  // Lista de mensajes sin premio
  const sinPremio = [
    '❌ Sin suerte esta vez',
    '😔 Mejor suerte la próxima',
    '🎭 Casi lo logras',
    '🌙 La fortuna no está de tu lado',
    '🎪 Inténtalo mañana',
    '⚡ No fue tu día',
    '🎨 Sigue intentando',
    '🎯 Tan cerca pero tan lejos'
  ]
  
  let resultado
  let mensajeFinal
  
  if (ganador) {
    const premioElegido = premios[Math.floor(Math.random() * premios.length)]
    resultado = `🎉 *¡FELICIDADES! ¡HAS GANADO!*\n\n🏆 Premio: ${premioElegido}\n\n✨ ¡Eres muy afortunado!`
    
    // Agregar rewards según el premio
    if (premioElegido.includes('XP')) {
      userData.exp = (userData.exp || 0) + 1000
    } else if (premioElegido.includes('Diamantes')) {
      userData.diamond = (userData.diamond || 0) + 5
    } else if (premioElegido.includes('Monedas')) {
      userData.money = (userData.money || 0) + 500
    }
    
  } else {
    const sinPremioElegido = sinPremio[Math.floor(Math.random() * sinPremio.length)]
    resultado = `💔 *¡Oh no!*\n\n${sinPremioElegido}\n\n🍀 ¡Inténtalo mañana para otra oportunidad!`
  }
  
  // Actualizar la última vez que usó la ruleta
  userData.lastRuleta = today
  
  // Mensaje final
  await new Promise(resolve => setTimeout(resolve, 1000))
  await conn.sendMessage(m.chat, {
    text: `🎰 *¡RESULTADO DE LA RULETA!*\n\n${resultado}\n\n📊 Probabilidad de ganar: 2%\n⏰ Próximo intento: Mañana`,
    edit: ruletaMsg.key
  })
  
  await m.react(ganador ? '🎉' : '😔')
}

handler.help = ['ruleta']
handler.tags = ['game']
handler.command = ['ruleta', 'roulette']
handler.register = true

export default handler
