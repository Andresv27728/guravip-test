import fetch from 'node-fetch'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://files.catbox.moe/8sl0sc.jpg'
const byeImage = 'https://files.catbox.moe/e2n2sq.jpg' // Imagen personalizada para despedidas

// Helper para checar si es admin o owner
async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.id === m.sender)
    return participant?.admin || m.fromMe
  } catch {
    return false
  }
}

// Handler principal
const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🦈 *¡Este comando es solo para grupos buba~!*')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe'].includes(type)) {
    return m.reply(`🦈 *¿Eh? Usa el comando buba~:*\n\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*`)
  }

  if (!(isAdmin || isOwner)) return m.reply('❌ *¡Hyaaa~! Solo los admins pueden activar o desactivar funciones desu~!*')

  if (type === 'antilink') {
    chat.antilink = enable
    return m.reply(`✨ *Antilink ${enable ? 'activado' : 'desactivado'} buba~!*`)
  }

  if (type === 'welcome') {
    chat.welcome = enable
    return m.reply(`✨ *Welcome ${enable ? 'activado' : 'desactivado'} desu~!*`)
  }

  if (type === 'antiarabe') {
    chat.antiarabe = enable
    return m.reply(`✨ *Antiárabe ${enable ? 'activado' : 'desactivado'} uwu~!*`)
  }
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome', 'on antilink', 'off antilink']

// Lógica antes de cada mensaje
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  // Bienvenida temporal
  if (chat.tempWelcome && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    // Verificar si aún está en tiempo
    if (chat.tempWelcomeTime && Date.now() > chat.tempWelcomeTime) {
      chat.tempWelcome = false
      chat.tempWelcomeMsg = ''
      chat.tempWelcomeTime = 0
    } else if (chat.tempWelcomeMsg) {
      const welcomeMsg = `
✧･ﾟ: ✧･ﾟ: *「 🌊 ʙɪᴇɴᴠᴇɴɪᴅᴀ 🌊 」* :･ﾟ✧ :･ﾟ✧

🦈 *¡Hola @${newJid.split('@')[0]} buba~!*

${chat.tempWelcomeMsg}

꒰ 💙 *¡Disfruta tu estadía en el grupo desu~!* 💙 ꒱
`
      await conn.sendMessage(m.chat, {
        text: welcomeMsg,
        mentions: [newJid]
      })
    }
  }

  // Antiárabe
  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    const number = newJid.split('@')[0].replace(/\D/g, '')
    const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab) {
      await conn.sendMessage(m.chat, { text: `🦈 *Mm buba~... ${newJid} tiene un número sospechoso. ¡Sayonara! (Antiárabe activado).*` })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  // Antilink
  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const text = m?.text || ''

    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch {}

      try {
        await conn.sendMessage(m.chat, {
          text: `🌊 *Hey buba~ ${userTag}, ¡no se permiten links aquí desu~!*`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: msgID,
            participant: delet
          }
        })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch {
        await conn.sendMessage(m.chat, {
          text: `⚠️ *¡Hyaaa~! No pude eliminar ni expulsar a ${userTag}. ¿Me falta un permiso, buba~?*`,
          mentions: [m.sender]
        }, { quoted: m })
      }
      return true
    }
  }

  // Welcome y Bye
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    let profilePic

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch {
      profilePic = defaultImage
    }

    if (m.messageStubType === 27) {
      const txtWelcome = '🦈 *¡Bienvenid@ buba~!* 🦈'
      const bienvenida = `
🌊 *Hiii~ ${userMention} buba~*
✨ *Este grupo es increíble, espero te diviertas desu~!* 🦈💕

`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const txtBye = '🌊 *¡Adiós buba~!* 🦈'
      const despedida = `
💔 *Oh no~ ${userMention} nos está dejando desu~... ¡Qué triste!* 😢
✨ *Ahora somos ${groupSize} tiburones buba~.* 🦈🌊
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: byeImage },
        caption: `${txtBye}\n\n${despedida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }
  }
}

export default handler
