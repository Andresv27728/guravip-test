// Lista de emojis que puede usar
const emojis = ['👍', '😂', '🔥', '❤️', '😎', '😅', '🙃', '🎉', '💀', '🥰']

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.')
  if (!(isAdmin || isOwner)) return m.reply('❌ Solo administradores pueden usar este comando.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  if (command === 'on') {
    if (args[0]?.toLowerCase() === 'reaccion') {
      chat.autoReact = true
      return m.reply('✅ Reacción automática aleatoria activada.')
    }
  }

  if (command === 'off') {
    if (args[0]?.toLowerCase() === 'reaccion') {
      chat.autoReact = false
      return m.reply('❌ Reacción automática desactivada.')
    }
  }

  return m.reply('✳️ Usa:\n*.on reaccion* / *.off reaccion*')
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on reaccion', 'off reaccion']

// Antes de cada mensaje: reaccionar si está activado
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) return

  const chat = global.db.data.chats[m.chat]
  if (chat.autoReact && !m.fromMe) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)] // emoji aleatorio
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch (e) {
      console.error('Error al reaccionar:', e)
    }
  }
}

export default handler
