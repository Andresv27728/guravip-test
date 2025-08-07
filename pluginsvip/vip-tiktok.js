
import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `💎 *TikTok VIP Downloader*

*Uso:* ${usedPrefix + command} <url>

*Características VIP:*
• Sin marca de agua
• Calidad original
• Audio incluido
• Metadata completa
• Descarga rápida

*Ejemplo:*
${usedPrefix + command} https://vm.tiktok.com/xxx`, m)
  }

  const url = args[0]
  if (!url.match(/tiktok/)) {
    return conn.reply(m.chat, '❌ Proporciona una URL válida de TikTok.', m)
  }

  try {
    await m.react('💎')
    
    const apis = [
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
      `https://api.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
      `https://tikdown.xyz/api/v1/download?url=${encodeURIComponent(url)}`
    ]

    let result = null
    
    for (const api of apis) {
      try {
        const response = await fetch(api)
        const data = await response.json()
        
        if (data.status && (data.video || data.data?.play)) {
          result = {
            title: data.title || data.data?.title || 'TikTok VIP',
            author: data.author?.unique_id || data.data?.author?.unique_id || 'Usuario',
            video: data.video || data.data?.play || data.data?.hdplay,
            music: data.music || data.data?.music,
            thumbnail: data.cover || data.data?.cover,
            duration: data.duration || data.data?.duration || 0
          }
          break
        }
      } catch (e) {
        console.log('API fallida:', api)
        continue
      }
    }

    if (!result || !result.video) {
      return conn.reply(m.chat, '❌ No se pudo descargar el video VIP. Intenta con otro enlace.', m)
    }

    const caption = `💎 *${result.title}*
👤 *Autor:* @${result.author}
🔥 *Descarga VIP Premium*
⏱️ *Duración:* ${result.duration}s
🎵 *Sin marca de agua*

> *Powered by VIP Bot*`

    // Enviar thumbnail primero
    if (result.thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: result.thumbnail },
        caption: '📸 *Preview VIP*'
      }, { quoted: m })
    }

    // Enviar video sin marca de agua
    await conn.sendMessage(m.chat, {
      video: { url: result.video },
      mimetype: 'video/mp4',
      fileName: `${result.author}_VIP.mp4`,
      caption: caption
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en la descarga VIP de TikTok.', m)
  }
}

handler.help = ['viptiktok', 'viptt']
handler.tags = ['vip-downloader']
handler.command = /^(viptiktok|viptt|viptik)$/i

export default handler
