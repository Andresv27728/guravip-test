import fetch from 'node-fetch'

const cooldownTime = 2 * 60 * 1000 // 2 minutos en milisegundos
const cooldown = {} // Guarda el timestamp por usuario

const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  const userId = m.sender
  const now = Date.now()

  if (cooldown[userId] && now - cooldown[userId] < cooldownTime) {
    const waitTime = ((cooldownTime - (now - cooldown[userId])) / 1000).toFixed(0)
    return m.reply(`⏱️ Espera ${waitTime} segundos para volver a usar el comando.`)
  }

  try {
    const res = await fetch('https://api.waifu.im/search/?included_tags=waifu')
    const json = await res.json()
    const waifu = json.images[0]

    if (!waifu) return m.reply('⚠️ No encontré ninguna waifu ahora. Intenta más tarde.')

    cooldown[userId] = now // Actualiza el tiempo

    await conn.sendMessage(m.chat, {
      image: { url: waifu.url },
      caption: `🌸 *Nombre:* ${waifu.artist?.name || 'Desconocido'}\n🎬 *Anime:* ${waifu.source || 'Desconocido'}\n🔗 *ID:* ${waifu.image_id || 'N/A'}`,
      mentions: [userId]
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Hubo un error al obtener waifus.')
  }
}

handler.command = ['rw']
handler.tags = ['anime']
handler.help = ['rw']
handler.group = true

export default handler
