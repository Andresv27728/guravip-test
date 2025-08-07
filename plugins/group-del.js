const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.quoted) return m.reply('🔁 Responde a un mensaje que quieras eliminar.')

  // Obtener admins del grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)

  // Verificar si quien ejecuta el comando es admin
  if (!admins.includes(m.sender)) {
    return m.reply('⛔ Solo los administradores pueden usar este comando.')
  }

  // Intentar eliminar el mensaje
  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.id,
        participant: m.quoted.participant
      }
    })
  } catch (e) {
    m.reply('⚠️ No pude eliminar ese mensaje. Puede que no tenga permisos.')
  }
}

handler.command = ['del']
handler.group = true
handler.tags = ['group']
handler.help = ['del (responde a un mensaje para eliminarlo)']

export default handler
