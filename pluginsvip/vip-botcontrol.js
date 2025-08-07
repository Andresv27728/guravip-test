
import fs from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Solo para sub-bots premium
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  if (!global.premiumSubBots?.includes(currentBotNumber)) {
    return conn.reply(m.chat, '❌ Esta función es exclusiva para sub-bots VIP Premium.', m)
  }

  // Solo en grupos
  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
  }

  // Solo admins del grupo pueden usar este comando
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants
  const user = participants.find(u => conn.decodeJid(u.id) === m.sender)
  const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'

  if (!isAdmin) {
    return conn.reply(m.chat, '❌ Solo los administradores del grupo pueden controlar el bot.', m)
  }

  const action = args[0]?.toLowerCase()

  if (!action || !['on', 'off', 'status'].includes(action)) {
    const botStatus = global.db.data.chats[m.chat]?.botDisabled ? '🔴 Apagado' : '🟢 Encendido'
    
    return conn.reply(m.chat, `💎 *Control de Bot VIP*

*Estado actual:* ${botStatus}

*Comandos disponibles:*
• ${usedPrefix + command} on - Encender bot
• ${usedPrefix + command} off - Apagar bot  
• ${usedPrefix + command} status - Ver estado

*Nota:* Solo los admins pueden controlar el bot`, m)
  }

  try {
    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {}
    }

    switch (action) {
      case 'on':
        if (!global.db.data.chats[m.chat].botDisabled) {
          return conn.reply(m.chat, '⚠️ El bot ya está encendido en este grupo.', m)
        }
        
        global.db.data.chats[m.chat].botDisabled = false
        
        await conn.reply(m.chat, `✅ *Bot VIP Activado*

🟢 *Estado:* Encendido
💎 *Modo:* Premium VIP
🔥 *Funciones:* Todas disponibles

> *El bot ahora responderá a todos los comandos*`, m)
        break

      case 'off':
        if (global.db.data.chats[m.chat].botDisabled) {
          return conn.reply(m.chat, '⚠️ El bot ya está apagado en este grupo.', m)
        }
        
        global.db.data.chats[m.chat].botDisabled = true
        
        await conn.reply(m.chat, `🔴 *Bot VIP Desactivado*

⏸️ *Estado:* Apagado
💎 *Modo:* Standby VIP
⚠️ *Nota:* Solo comandos de control funcionarán

> *Para reactivar usa: ${usedPrefix + command} on*`, m)
        break

      case 'status':
        const isDisabled = global.db.data.chats[m.chat].botDisabled
        const statusIcon = isDisabled ? '🔴' : '🟢'
        const statusText = isDisabled ? 'Apagado' : 'Encendido'
        const modeText = isDisabled ? 'Standby VIP' : 'Premium VIP Activo'
        
        await conn.reply(m.chat, `💎 *Estado del Bot VIP*

${statusIcon} *Estado:* ${statusText}
🌟 *Modo:* ${modeText}
👥 *Grupo:* ${groupMetadata.subject}
🔧 *Control:* Solo administradores

> *Bot VIP Premium funcionando*`, m)
        break
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error al controlar el bot VIP.', m)
  }
}

handler.help = ['vipbot', 'botcontrol']
handler.tags = ['vip']
handler.command = /^(vipbot|botcontrol|controlarbot)$/i

export default handler
