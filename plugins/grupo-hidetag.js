//🐟 Code creado por yo soyyo
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

const handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  if (!m.quoted && !text) {
    return conn.reply(m.chat, `🦈 *¡Oopsie~!* Debes escribir un mensaje o responder a uno para notificar a todos los hoomans.`, m)
  }

  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender

    const msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c } },
        { quoted: null, userJid: conn.user.id }
      ),
      text || q.text,
      conn.user.jid,
      { mentions: users }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch {
    const users = participants.map(u => conn.decodeJid(u.id))
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)
    const masss = String.fromCharCode(8206).repeat(850)
    const htextos = `${text ? text : '*𓆝 Hola hoomans~!* 🐬'}`

    if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
      const mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { image: mediax, caption: `🖼️ ${htextos}`, mentions: users }, { quoted: null })

    } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
      const mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { video: mediax, mimetype: 'video/mp4', caption: `🎥 ${htextos}`, mentions: users }, { quoted: null })

    } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
      const mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { audio: mediax, mimetype: 'audio/mp4', fileName: 'GuraTag.mp3', mentions: users }, { quoted: null })

    } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
      const mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { sticker: mediax, mentions: users }, { quoted: null })

    } else {
      await conn.relayMessage(m.chat, {
        extendedTextMessage: {
          text: `${masss}\n💌 ${htextos}\n🌊 Notificación enviada con amor por *GuraBot* 🦈`,
          contextInfo: {
            mentionedJid: users,
            externalAdReply: {
              title: '🐚 GuraBot',
              body: '¡Tu tiburoncita favorita~!',
              thumbnail: fs.readFileSync('./media/gura-menu.jpg'), // Puedes reemplazar por una imagen de Gura
              sourceUrl: 'https://youtube.com/@GawrGura',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }
      }, {})
    }
  }
}

handler.help = ['hidetag']
handler.tags = ['grupo']
handler.command = ['hidetag', 'notificar', 'notify', 'tag']
handler.group = true
handler.admin = false
handler.register = false

export default handler
