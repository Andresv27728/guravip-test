
let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '📝 *¿Eh? Necesitas escribir tu ficha buba~*\n\n*Ejemplo:* .ficha Mi nombre es Gura y soy un tiburón kawaii 🦈', m, rcanal)
  }

  // Mensaje decorado al estilo del bot
  const fichaMessage = `
✧･ﾟ: ✧･ﾟ: *「 📋 ғɪᴄʜᴀ 📋 」* :･ﾟ✧ :･ﾟ✧

🌊 ${text}

꒰ 🦈 *Enviado por:* @${m.sender.split('@')[0]} ꒱
`

  await conn.sendMessage(m.chat, {
    text: fichaMessage,
    mentions: [m.sender]
  }, { quoted: m })
  
  await m.react('📋')
}

handler.help = ['ficha']
handler.tags = ['grupo']
handler.command = ['ficha']
handler.group = true

export default handler
