
const tempGroupStates = new Map()

let handler = async (m, { conn, text, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('🦈 *¡Este comando es solo para grupos buba~!*')
  
  if (!isAdmin) {
    return m.reply('❌ *¡Hyaaa~! Solo los admins pueden usar este comando desu~!*')
  }
  
  if (!isBotAdmin) {
    return m.reply('💔 *¡Gura necesita ser admin para controlar el grupo buba~!*')
  }

  if (!text) {
    return conn.reply(m.chat, `
🕐 *¿Eh? Necesitas especificar el tiempo buba~*

*Ejemplos:*
• \`.cerrartemp 5m\` - Cerrar por 5 minutos
• \`.cerrartemp 1h\` - Cerrar por 1 hora
• \`.cerrartemp 30s\` - Cerrar por 30 segundos

*Formatos válidos:* s (segundos), m (minutos), h (horas)
`, m)
  }

  const timeMatch = text.match(/^(\d+)([smh])$/)
  if (!timeMatch) {
    return m.reply('❌ *¡Formato inválido buba~! Usa: 5m, 1h, 30s*')
  }

  const [, amount, unit] = timeMatch
  const multipliers = { s: 1000, m: 60000, h: 3600000 }
  const duration = parseInt(amount) * multipliers[unit]
  
  if (duration > 24 * 60 * 60 * 1000) {
    return m.reply('⏰ *¡Máximo 24 horas buba~!*')
  }

  try {
    // Verificar estado actual del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isCurrentlyClosed = groupMetadata.announce

    if (isCurrentlyClosed) {
      // Si está cerrado, abrirlo temporalmente
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      
      const timeText = `${amount}${unit === 's' ? ' segundos' : unit === 'm' ? ' minutos' : ' horas'}`
      await conn.reply(m.chat, `
🔓 *¡Grupo abierto temporalmente desu~!*

⏰ *Duración:* ${timeText}
🦈 *Se cerrará automáticamente buba~*

꒰ 🌊 *¡Aprovecha mientras puedas nadar libremente!* 🌊 ꒱
`, m)

      // Programar cierre
      setTimeout(async () => {
        try {
          await conn.groupSettingUpdate(m.chat, 'announcement')
          await conn.sendMessage(m.chat, { 
            text: '🔒 *¡Tiempo agotado! Grupo cerrado automáticamente buba~* 🦈' 
          })
        } catch (e) {
          console.error('Error al cerrar grupo automáticamente:', e)
        }
      }, duration)

    } else {
      // Si está abierto, cerrarlo temporalmente
      await conn.groupSettingUpdate(m.chat, 'announcement')
      
      const timeText = `${amount}${unit === 's' ? ' segundos' : unit === 'm' ? ' minutos' : ' horas'}`
      await conn.reply(m.chat, `
🔒 *¡Grupo cerrado temporalmente desu~!*

⏰ *Duración:* ${timeText}
🦈 *Se abrirá automáticamente buba~*

꒰ 🌊 *Atlantis en modo silencioso temporal* 🌊 ꒱
`, m)

      // Programar apertura
      setTimeout(async () => {
        try {
          await conn.groupSettingUpdate(m.chat, 'not_announcement')
          await conn.sendMessage(m.chat, { 
            text: '🔓 *¡Tiempo agotado! Grupo abierto automáticamente buba~* 🦈' 
          })
        } catch (e) {
          console.error('Error al abrir grupo automáticamente:', e)
        }
      }, duration)
    }

    await m.react('⏰')
    
  } catch (e) {
    console.error(e)
    m.reply('❌ *¡Hyaaa~! No pude programar el cambio, algo salió mal desu~*')
  }
}

handler.help = ['cerrartemp', 'abrirtemp']
handler.tags = ['grupo']
handler.command = ['cerrartemp', 'abrirtemp', 'grouptemp', 'tempgroup']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
