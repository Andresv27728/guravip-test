
let handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🦈 *¡Este comando es solo para grupos buba~!*')
  
  if (!(isAdmin || isOwner)) {
    return m.reply('❌ *¡Hyaaa~! Solo los admins pueden activar la bienvenida temporal desu~!*')
  }

  if (!text) {
    return conn.reply(m.chat, '💬 *¿Eh? Necesitas escribir el mensaje de bienvenida buba~*\n\n*Ejemplo:* .bienvenida ¡Hola! Bienvenido al grupo 🦈', m, rcanal)
  }

  // Inicializar datos del chat si no existen
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  const chat = global.db.data.chats[m.chat]
  
  // Activar bienvenida temporal
  chat.tempWelcome = true
  chat.tempWelcomeMsg = text
  chat.tempWelcomeTime = Date.now() + (60 * 1000) // 1 minuto

  await conn.reply(m.chat, `✨ *¡Bienvenida temporal activada por 1 minuto desu~!*\n\n📝 *Mensaje configurado:*\n${text}\n\n⏰ *Se desactivará automáticamente en 60 segundos buba~*`, m, rcanal)
  
  await m.react('⏰')

  // Desactivar después de 1 minuto
  setTimeout(() => {
    if (chat.tempWelcome && chat.tempWelcomeTime <= Date.now()) {
      chat.tempWelcome = false
      chat.tempWelcomeMsg = ''
      chat.tempWelcomeTime = 0
      conn.sendMessage(m.chat, { text: '⏰ *¡Tiempo agotado! Bienvenida temporal desactivada buba~* 🦈' })
    }
  }, 60000)
}

handler.help = ['bienvenida']
handler.tags = ['grupo']
handler.command = ['bienvenida', 'welcome-temp']
handler.group = true

export default handler
