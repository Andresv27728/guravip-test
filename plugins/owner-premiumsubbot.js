const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.owner.map(([number]) => number).includes(m.sender.replace(/[^0-9]/g, ''))) {
    return m.reply('❌ Solo el owner puede usar este comando.')
  }

  const action = args[0]?.toLowerCase()
  const number = args[1]?.replace(/[^0-9]/g, '')

  if (!action || !['add', 'remove', 'list', 'time', 'check'].includes(action)) {
    return m.reply(`
🔰 *Gestión de Sub-Bots Premium*

*Comandos disponibles:*
• ${usedPrefix + command} add <número> [tiempo]
• ${usedPrefix + command} remove <número>
• ${usedPrefix + command} list
• ${usedPrefix + command} time <número> <días>
• ${usedPrefix + command} check <número>

*Ejemplos:*
• ${usedPrefix + command} add 573133374132 30 (30 días VIP)
• ${usedPrefix + command} time 573133374132 15 (extender 15 días)
• ${usedPrefix + command} check 573133374132

*Beneficios Premium:*
• ✅ Comandos ilimitados
• ✅ Personalización completa
• ✅ Acceso a plugins VIP
• ✅ Auto-reconexión prioritaria
`)
  }

  if (action === 'list') {
    if (global.premiumSubBots.length === 0) {
      return m.reply('📋 No hay sub-bots premium registrados.')
    }
    
    let list = '*📋 Sub-Bots Premium:*\n\n'
    global.premiumSubBots.forEach((num, index) => {
      list += `${index + 1}. wa.me/${num}\n`
    })
    
    return m.reply(list)
  }

  if (!number) {
    return m.reply('❌ Debes proporcionar un número válido.')
  }

  if (action === 'add') {
    if (global.premiumSubBots.includes(number)) {
      return m.reply('⚠️ Este número ya tiene acceso premium.')
    }
    
    const days = parseInt(args[2]) || 30 // 30 días por defecto
    const expirationTime = Date.now() + (days * 24 * 60 * 60 * 1000)
    
    global.premiumSubBots.push(number)
    global.vipTimes[number] = expirationTime
    
    // Guardar en base de datos
    if (!global.db.data.settings.premiumSubBots) {
      global.db.data.settings.premiumSubBots = []
    }
    if (!global.db.data.settings.vipTimes) {
      global.db.data.settings.vipTimes = {}
    }
    
    global.db.data.settings.premiumSubBots = global.premiumSubBots
    global.db.data.settings.vipTimes = global.vipTimes
    
    const expirationDate = new Date(expirationTime).toLocaleDateString('es-ES')
    
    // Enviar notificación VIP al usuario
    try {
      const userJid = number + '@s.whatsapp.net'
      const welcomeVipMessage = `🎉 *¡FELICIDADES! ERES VIP* 🎉

💎 *BIENVENIDO AL CLUB PREMIUM*

🔥 *TU ACCESO VIP INCLUYE:*
✅ Comandos ilimitados
✅ Personalización completa del sub-bot
✅ Acceso a plugins VIP exclusivos
✅ Auto-reconexión prioritaria
✅ Soporte premium 24/7
✅ Sin limitaciones de uso
✅ Prefijo personalizable
✅ Control avanzado del bot

📊 *DETALLES DE TU SUSCRIPCIÓN:*
🕒 Duración: ${days} días
📅 Expira: ${expirationDate}
🤖 Sub-bot: Activo y listo

🚀 *COMANDOS VIP DISPONIBLES:*
• .vipmenu - Ver menú VIP completo
• .vipsetname - Personalizar nombre
• .vipsetbanner - Personalizar imagen
• .vipsetprefix - Cambiar prefijo
• .vipbot on/off - Controlar bot en grupos

💡 *PRÓXIMOS PASOS:*
1. Usa .vipmenu para explorar funciones
2. Personaliza tu sub-bot como gustes
3. Disfruta de todas las características premium

🔔 *RECORDATORIOS:*
• Recibirás alertas antes del vencimiento
• Contacta al owner para renovar
• Tu sub-bot se reconecta automáticamente

> *¡Gracias por confiar en nosotros! 💎*
> *Owner: wa.me/${global.owner[0][0]}*`

      await global.conn.sendMessage(userJid, {
        text: welcomeVipMessage
      })
      console.log(`💎 Notificación VIP enviada a: ${number}`)
    } catch (e) {
      console.log('❌ Error enviando notificación VIP:', e)
    }
    
    return m.reply(`✅ Sub-bot premium agregado: wa.me/${number}
💎 Tiempo VIP: ${days} días
📅 Expira: ${expirationDate}
📨 Notificación VIP enviada al usuario`)
  }

  if (action === 'time') {
    if (!number) {
      return m.reply('❌ Debes proporcionar un número.')
    }
    
    const days = parseInt(args[2])
    if (!days || days < 1) {
      return m.reply('❌ Debes especificar días válidos (mínimo 1).')
    }
    
    const additionalTime = days * 24 * 60 * 60 * 1000
    const currentExpiration = global.vipTimes[number] || Date.now()
    const newExpiration = Math.max(currentExpiration, Date.now()) + additionalTime
    
    global.vipTimes[number] = newExpiration
    global.db.data.settings.vipTimes = global.vipTimes
    
    // Agregar a premium si no está
    if (!global.premiumSubBots.includes(number)) {
      global.premiumSubBots.push(number)
      global.db.data.settings.premiumSubBots = global.premiumSubBots
    }
    
    const expirationDate = new Date(newExpiration).toLocaleDateString('es-ES')
    return m.reply(`✅ Tiempo VIP actualizado para: wa.me/${number}
⏰ Días agregados: ${days}
📅 Nueva expiración: ${expirationDate}`)
  }

  if (action === 'check') {
    if (!number) {
      return m.reply('❌ Debes proporcionar un número.')
    }
    
    const isVip = global.premiumSubBots.includes(number)
    const expiration = global.vipTimes[number]
    
    if (!isVip || !expiration) {
      return m.reply(`📊 Estado de wa.me/${number}:
❌ No tiene acceso VIP`)
    }
    
    const now = Date.now()
    const timeLeft = expiration - now
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))
    const expirationDate = new Date(expiration).toLocaleDateString('es-ES')
    
    if (timeLeft <= 0) {
      return m.reply(`📊 Estado de wa.me/${number}:
❌ VIP EXPIRADO
📅 Expiró: ${expirationDate}`)
    }
    
    return m.reply(`📊 Estado de wa.me/${number}:
✅ VIP Activo
⏰ Días restantes: ${daysLeft}
📅 Expira: ${expirationDate}`)
  }

  if (action === 'remove') {
    const index = global.premiumSubBots.indexOf(number)
    if (index === -1) {
      return m.reply('❌ Este número no tiene acceso premium.')
    }
    
    global.premiumSubBots.splice(index, 1)
    global.db.data.settings.premiumSubBots = global.premiumSubBots
    
    return m.reply(`✅ Sub-bot premium removido: wa.me/${number}`)
  }
}

handler.help = ['premiumsub']
handler.tags = ['owner']
handler.command = /^(premiumsub|premiumsubbot|subpremium)$/i
handler.owner = true

export default handler