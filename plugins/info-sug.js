let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `✦ ¿Qué comando o cosa quieres sugerir?`, m, rcanal)
  if (text.length < 10) return conn.reply(m.chat, `✎ La sugerencia debe tener más de 10 caracteres.`, m, rcanal)
  if (text.length > 1000) return conn.reply(m.chat, `❒ Máximo de la sugerencia es de 1000 caracteres.`, m, rcanal)

  const nombre = await conn.getName(m.sender)
  const teks = `✏ Sugerencia de un nuevo comando del usuario *${nombre}*

☊ Sugerido:
> ${text}`

  await conn.reply(`120363402552103115@newsletter`, m.quoted ? teks + m.quoted.text : teks, m, {
    mentions: conn.parseMention(teks)
  })

  m.reply('✧ La sugerencia se envió a mi propietario.')
}

handler.help = ['sugerir < cosas pa la botsita >']
handler.tags = ['info']
handler.command = ['sugerir', 'sug']

export default handler
