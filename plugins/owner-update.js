import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  await m.react('🕓') // ⏳ Espera...

  if (conn.user.jid == conn.user.jid) {
    try {
      let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
      await conn.reply(m.chat, `
╭━━〔 *🌊 Azu~ Azu~ Actualización Shark* 〕━━⬣
┃ *𓆩 🦈 Gawr Gura dice:* Yaa~ hice magia con el código~ ✨
┃
┃ *📥 Resultado:* 
┃ ${stdout.toString().trim().split('\n').map(l => `┃ ${l}`).join('\n')}
┃
┃ *📌 Nota:* ¡Todo está fresquito desde GitHub~! 🐟
╰━━━━━━━━━━━━━━━━━━━━⬣`, m)
      await m.react('✅')
    } catch (e) {
      await conn.reply(m.chat, `
╭❗ *Ayuuda~* 🐳
┃ Ocurrió un error al actualizar~ 💥
┃ 
┃ *🧨 Error:* 
┃ ${e.message}
╰━━━━━━━━━━━━⬣`, m)
      await m.react('❌')
    }
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed'] 
handler.rowner = true

export default handler
