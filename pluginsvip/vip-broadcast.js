
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <mensaje>`)
  
  const chats = Object.keys(global.db.data.chats).filter(id => id.endsWith('@g.us'))
  
  if (chats.length === 0) {
    return m.reply('❌ No hay grupos disponibles para el broadcast.')
  }
  
  await m.reply(`📡 Enviando mensaje a ${chats.length} grupos...`)
  
  let success = 0
  let failed = 0
  
  for (const chatId of chats) {
    try {
      await conn.sendMessage(chatId, { 
        text: `🌟 *MENSAJE VIP*\n\n${text}\n\n_Enviado por sub-bot premium_` 
      })
      success++
      await new Promise(resolve => setTimeout(resolve, 1000)) // delay para evitar spam
    } catch (e) {
      failed++
    }
  }
  
  await m.reply(`📊 *Broadcast Completado*\n✅ Exitosos: ${success}\n❌ Fallidos: ${failed}`)
}

handler.help = ['vipbc']
handler.tags = ['vip']
handler.command = /^(vipbc|vipbroadcast)$/i
handler.group = false

export default handler
