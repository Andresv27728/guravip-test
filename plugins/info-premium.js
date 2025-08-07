
const handler = async (m, { conn }) => {
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  const isPremium = global.premiumSubBots?.includes(currentBotNumber) || false
  const userUsage = global.db.data.users[m.sender]?.subBotUsage || { commands: 0 }
  
  let vipTimeInfo = ''
  if (isPremium && global.vipTimes[currentBotNumber]) {
    const expirationTime = global.vipTimes[currentBotNumber]
    const timeLeft = expirationTime - Date.now()
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))
    const expirationDate = new Date(expirationTime).toLocaleDateString('es-ES')
    
    if (timeLeft > 0) {
      vipTimeInfo = `
⏰ *Tiempo VIP restante:* ${daysLeft} días
📅 *Expira:* ${expirationDate}
${daysLeft <= 3 ? '🚨 *¡Renueva pronto para no perder beneficios!*' : ''}`
    } else {
      vipTimeInfo = '❌ *VIP EXPIRADO* - Contacta al owner para renovar'
    }
  }
  
  const info = `
🌟 *SISTEMA PREMIUM SUB-BOTS* 🌟

${isPremium ? '💎 *TU ESTADO: PREMIUM VIP*' : '🆓 *TU ESTADO: GRATUITO*'}
${vipTimeInfo}

📋 *COMPARACIÓN DE PLANES:*

🆓 *Plan Gratuito:*
• ❌ Comandos limitados (${global.freeSubBotsLimits.maxCommands}/día)
• ❌ Sin personalización
• ❌ Plugins básicos únicamente
• ❌ Máximo ${global.freeSubBotsLimits.maxGroups} grupos
• 📊 Comandos usados hoy: ${userUsage.commands}/${global.freeSubBotsLimits.maxCommands}

💎 *Plan Premium VIP:*
• ✅ Comandos ilimitados
• ✅ Personalización de nombre (.setname)
• ✅ Personalización de banner (.setbanner)
• ✅ Plugins VIP exclusivos
• ✅ Auto-respuestas personalizadas
• ✅ Broadcast a grupos
• ✅ Estadísticas avanzadas
• ✅ Sin límite de grupos
• ✅ Auto-reconexión prioritaria
• ✅ Soporte prioritario

💰 *¿Cómo obtener Premium?*
Contacta al owner del bot para adquirir el plan premium.

📱 *Owner:* wa.me/${global.owner[0][0]}
`

  await conn.reply(m.chat, info, m)
}

handler.help = ['premiuminfo', 'vipinfo']
handler.tags = ['info']
handler.command = /^(premiuminfo|vipinfo|infopremi)$/i

export default handler
