var handler = async (m, { conn, args }) => {
  let group = m.chat
  let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

  // Mensaje decorado al estilo Gawr Gura
  const message = `
✧･ﾟ: ✧･ﾟ: *「 ʜʏᴇᴇ~ 🦈 」* :･ﾟ✧ :･ﾟ✧

🌊 *Aquí tienes el link del grupo buba~:* ✨

➤ ${link}

꒰ 🌟 *Únete y nada con nosotros en este hermoso grupo desu~!* 🌟 ꒱

🌊 *- Gawr Gura 🦈*
`
  conn.reply(m.chat, message, m, { detectLink: true })
}

handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler
