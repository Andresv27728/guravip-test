
let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('🦈 *¡Este comando es solo para grupos buba~!*')
  
  if (!isAdmin) {
    return m.reply('❌ *¡Hyaaa~! Solo los admins pueden abrir el grupo desu~!*')
  }
  
  if (!isBotAdmin) {
    return m.reply('💔 *¡Gura necesita ser admin para abrir el grupo buba~!*')
  }

  try {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    await conn.reply(m.chat, `
🔓 *¡Grupo abierto exitosamente desu~!*

🦈 *Todos pueden enviar mensajes ahora buba~*
💙 *¡El océano está libre para nadar!*

꒰ 🌊 *Atlantis está activa nuevamente* 🌊 ꒱
`, m)
    await m.react('🔓')
  } catch (e) {
    console.error(e)
    m.reply('❌ *¡Hyaaa~! No pude abrir el grupo, algo salió mal desu~*')
  }
}

handler.help = ['abrir']
handler.tags = ['grupo']
handler.command = ['abrir', 'open', 'abrirgrupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
