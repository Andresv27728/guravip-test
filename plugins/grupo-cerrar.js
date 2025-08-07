
let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('🦈 *¡Este comando es solo para grupos buba~!*')
  
  if (!isAdmin) {
    return m.reply('❌ *¡Hyaaa~! Solo los admins pueden cerrar el grupo desu~!*')
  }
  
  if (!isBotAdmin) {
    return m.reply('💔 *¡Gura necesita ser admin para cerrar el grupo buba~!*')
  }

  try {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    await conn.reply(m.chat, `
🔒 *¡Grupo cerrado exitosamente desu~!*

🦈 *Solo los admins pueden enviar mensajes ahora buba~*
💙 *Usa* \`.abrir\` *para abrir el grupo nuevamente*

꒰ 🌊 *Atlantis está en modo silencioso* 🌊 ꒱
`, m)
    await m.react('🔒')
  } catch (e) {
    console.error(e)
    m.reply('❌ *¡Hyaaa~! No pude cerrar el grupo, algo salió mal desu~*')
  }
}

handler.help = ['cerrar']
handler.tags = ['grupo']
handler.command = ['cerrar', 'close', 'cerrargrupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
